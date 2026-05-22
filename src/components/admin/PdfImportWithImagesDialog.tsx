import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { FileImage, Loader2, Trash2, Upload } from 'lucide-react';
// @ts-ignore - pdfjs types
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - worker as URL
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface ExtractedItem {
  code: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image_url: string | null;
  sort_order: number;
  page: number;
}

interface BBox { x: number; y: number; w: number; h: number }
interface PageItem {
  code: string; name: string; price: number; unit: string; category: string;
  image_bbox: BBox | null;
}

interface Props { onImported: () => void }

const RENDER_SCALE = 2; // ~144 DPI

export function PdfImportWithImagesDialog({ onImported }: Props) {
  const { user } = useAuth();
  const pdfFileRef = useRef<HTMLInputElement>(null);

  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [catalogName, setCatalogName] = useState('');
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [saving, setSaving] = useState(false);

  const cropAndUpload = async (
    canvas: HTMLCanvasElement,
    bbox: BBox,
    catalogSlug: string,
    code: string,
    idx: number,
  ): Promise<string | null> => {
    try {
      const sx = Math.max(0, Math.floor(bbox.x * canvas.width));
      const sy = Math.max(0, Math.floor(bbox.y * canvas.height));
      const sw = Math.min(canvas.width - sx, Math.floor(bbox.w * canvas.width));
      const sh = Math.min(canvas.height - sy, Math.floor(bbox.h * canvas.height));
      if (sw < 8 || sh < 8) return null;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = sw;
      cropCanvas.height = sh;
      const ctx = cropCanvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob: Blob | null = await new Promise((r) => cropCanvas.toBlob(r, 'image/jpeg', 0.85));
      if (!blob) return null;

      const safeCode = code.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 40) || 'item';
      const path = `imports/${catalogSlug}/${idx}_${safeCode}.jpg`;
      const { error } = await supabase.storage
        .from('material-images')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (error) {
        console.error('upload err', error);
        return null;
      }
      const { data } = supabase.storage.from('material-images').getPublicUrl(path);
      return `${data.publicUrl}?t=${Date.now()}`;
    } catch (e) {
      console.error('crop err', e);
      return null;
    }
  };

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pdfFileRef.current) pdfFileRef.current.value = '';

    if (file.size > 30 * 1024 * 1024) {
      toast({ title: 'Fișier prea mare (max 30MB)', variant: 'destructive' });
      return;
    }

    setParsing(true);
    setProgress(2);
    setProgressText('Se citește PDF-ul...');

    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const pageCount = pdf.numPages;
      if (pageCount > 40) {
        toast({ title: `PDF prea mare (${pageCount} pagini, max 40)`, variant: 'destructive' });
        setParsing(false);
        return;
      }

      const baseName = file.name.replace(/\.pdf$/i, '');
      setCatalogName(baseName);
      const catalogSlug = `${baseName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_${Date.now()}`;

      const allItems: ExtractedItem[] = [];
      let globalIdx = 0;

      for (let p = 1; p <= pageCount; p++) {
        setProgressText(`Pagina ${p}/${pageCount} — randare...`);
        setProgress(5 + Math.floor(((p - 1) / pageCount) * 90));

        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

        // downscale for AI (max width 1400) to save bandwidth & tokens
        const aiCanvas = document.createElement('canvas');
        const maxW = 1400;
        const scale = Math.min(1, maxW / canvas.width);
        aiCanvas.width = Math.round(canvas.width * scale);
        aiCanvas.height = Math.round(canvas.height * scale);
        aiCanvas.getContext('2d')!.drawImage(canvas, 0, 0, aiCanvas.width, aiCanvas.height);
        const imageDataUrl = aiCanvas.toDataURL('image/jpeg', 0.82);

        setProgressText(`Pagina ${p}/${pageCount} — AI analizează...`);
        const { data, error } = await supabase.functions.invoke('parse-catalog-page', {
          body: { imageDataUrl, pageNumber: p },
        });
        if (error) throw new Error(error.message || `Eroare pagina ${p}`);
        if (data?.error) throw new Error(data.error);

        const pageItems: PageItem[] = data.items || [];
        setProgressText(`Pagina ${p}/${pageCount} — salvare ${pageItems.length} imagini...`);

        for (const it of pageItems) {
          let image_url: string | null = null;
          if (it.image_bbox) {
            image_url = await cropAndUpload(canvas, it.image_bbox, catalogSlug, it.code, globalIdx);
          }
          allItems.push({
            code: it.code,
            name: it.name,
            price: it.price || 0,
            unit: it.unit || 'pz',
            category: it.category || data.section_title || 'General',
            image_url,
            sort_order: globalIdx,
            page: p,
          });
          globalIdx++;
        }
      }

      setItems(allItems);
      setShowPreview(true);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Eroare la procesarea PDF', description: err.message, variant: 'destructive' });
    } finally {
      setParsing(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof ExtractedItem, value: any) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const handleReplaceImage = async (idx: number, file: File) => {
    const safeName = `manual_${idx}_${Date.now()}.jpg`;
    const path = `imports/manual/${safeName}`;
    const { error } = await supabase.storage
      .from('material-images')
      .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: true });
    if (error) {
      toast({ title: 'Upload eșuat', description: error.message, variant: 'destructive' });
      return;
    }
    const { data } = supabase.storage.from('material-images').getPublicUrl(path);
    updateItem(idx, 'image_url', `${data.publicUrl}?t=${Date.now()}`);
  };

  const confirmImport = async () => {
    if (!user || items.length === 0) return;
    setSaving(true);
    try {
      const { data: newCatalog, error: catErr } = await supabase
        .from('admin_catalogs')
        .insert({ name: catalogName, description: 'Importat din PDF cu imagini', created_by: user.id })
        .select()
        .single();
      if (catErr || !newCatalog) throw catErr || new Error('Failed to create catalog');

      const BATCH = 100;
      for (let i = 0; i < items.length; i += BATCH) {
        const batch = items.slice(i, i + BATCH).map(item => ({
          catalog_id: newCatalog.id,
          item_type: 'pricing',
          source_data: {
            code: item.code,
            name: item.name,
            price: item.price,
            unit: item.unit,
            category: item.category,
            image_url: item.image_url,
            sort_order: item.sort_order,
            page: item.page,
          },
        }));
        const { error } = await supabase.from('admin_catalog_items').insert(batch);
        if (error) throw error;
      }

      toast({ title: `Catalog "${catalogName}" creat cu ${items.length} produse!` });
      setShowPreview(false);
      setItems([]);
      setCatalogName('');
      onImported();
    } catch (err: any) {
      toast({ title: 'Eroare la salvare', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => pdfFileRef.current?.click()} disabled={parsing}>
        {parsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileImage className="h-4 w-4 mr-2" />}
        Import PDF (cu imagini)
      </Button>
      <input ref={pdfFileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfSelect} />

      {parsing && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-6 w-[420px] space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium text-foreground">{progressText}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Renderez fiecare pagină, AI extrage produsele în ordine și salvează imaginile asociate.
            </p>
          </div>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={(v) => { if (!v) { setShowPreview(false); setItems([]); } }}>
        <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previzualizare import (cu imagini)</DialogTitle>
            <DialogDescription>
              {items.length} produse în ordinea exactă din PDF. Verifică imaginile asociate fiecărui cod; le poți înlocui manual.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nume catalog</label>
              <Input value={catalogName} onChange={(e) => setCatalogName(e.target.value)} />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[520px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="w-[70px]">Imagine</TableHead>
                      <TableHead className="w-[110px]">Cod</TableHead>
                      <TableHead>Denumire</TableHead>
                      <TableHead className="w-[90px]">Preț</TableHead>
                      <TableHead className="w-[60px]">UM</TableHead>
                      <TableHead className="w-[120px]">Categorie</TableHead>
                      <TableHead className="w-[50px]">Pag</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs text-muted-foreground">{item.sort_order + 1}</TableCell>
                        <TableCell>
                          <label className="cursor-pointer block">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.code}
                                className="w-12 h-12 object-cover rounded border hover:opacity-70" />
                            ) : (
                              <div className="w-12 h-12 rounded border border-dashed flex items-center justify-center bg-muted hover:bg-muted/70">
                                <Upload className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <input
                              type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceImage(idx, f); }}
                            />
                          </label>
                        </TableCell>
                        <TableCell>
                          <Input value={item.code} onChange={(e) => updateItem(idx, 'code', e.target.value)} className="h-7 text-xs" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} className="h-7 text-xs" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.price}
                            onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} className="h-7 text-xs" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} className="h-7 text-xs" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)} className="h-7 text-xs" />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.page}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(idx)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPreview(false); setItems([]); }}>Anulează</Button>
            <Button onClick={confirmImport} disabled={saving || items.length === 0}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Importă {items.length} produse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
