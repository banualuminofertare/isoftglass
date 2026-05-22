import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';

interface ExtractedItem {
  code: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image_url?: string;
}

interface PdfImportDialogProps {
  onImported: () => void;
}

export function PdfImportDialog({ onImported }: PdfImportDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const pdfFileRef = useRef<HTMLInputElement>(null);

  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [catalogName, setCatalogName] = useState('');
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [saving, setSaving] = useState(false);

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pdfFileRef.current) pdfFileRef.current.value = '';

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'Fișierul este prea mare (max 20MB)', variant: 'destructive' });
      return;
    }

    setParsing(true);
    setProgress(10);
    setProgressText('Se încarcă PDF-ul...');

    try {
      const filePath = `${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('catalog-pdfs')
        .upload(filePath, file, { contentType: 'application/pdf' });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setProgress(40);
      setProgressText('Se analizează catalogul cu AI...');

      const { data, error } = await supabase.functions.invoke('parse-catalog-pdf', {
        body: { filePath },
      });

      if (error) throw new Error(error.message || 'Eroare la parsare');
      if (data?.error) throw new Error(data.error);

      setProgress(90);
      setProgressText('Pregătire previzualizare...');

      setCatalogName(data.catalog_name || file.name.replace('.pdf', ''));
      setItems(data.items || []);
      setShowPreview(true);
      setProgress(100);
    } catch (err: any) {
      toast({ title: 'Eroare la procesarea PDF', description: err.message, variant: 'destructive' });
    } finally {
      setParsing(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ExtractedItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const confirmImport = async () => {
    if (!user || items.length === 0) return;
    setSaving(true);
    try {
      const { data: newCatalog, error: catErr } = await supabase
        .from('admin_catalogs')
        .insert({ name: catalogName, description: `Importat din PDF`, created_by: user.id })
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
            image_url: item.image_url || null,
            color_hex: item.image_url ? null : null,
          },
        }));
        await supabase.from('admin_catalog_items').insert(batch);
      }

      toast({ title: `Catalog "${catalogName}" importat cu ${items.length} produse!` });
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

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <>
      <Button variant="outline" onClick={() => pdfFileRef.current?.click()} disabled={parsing}>
        {parsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
        Importă PDF
      </Button>

      <input ref={pdfFileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfSelect} />

      {/* Parsing progress */}
      {parsing && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-6 w-96 space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium text-foreground">{progressText}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Acest proces poate dura până la 60 de secunde...
            </p>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={(v) => { if (!v) { setShowPreview(false); setItems([]); } }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previzualizare import PDF</DialogTitle>
            <DialogDescription>
              {items.length} produse extrase din {categories.length} categori{categories.length === 1 ? 'e' : 'i'}. Poți edita sau șterge rânduri înainte de import.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nume catalog</label>
              <Input value={catalogName} onChange={(e) => setCatalogName(e.target.value)} />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Cod</TableHead>
                      <TableHead>Denumire</TableHead>
                      <TableHead className="w-[90px]">{t('ui.price')}</TableHead>
                      <TableHead className="w-[70px]">UM</TableHead>
                      <TableHead className="w-[120px]">Categorie</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Input
                            value={item.code}
                            onChange={(e) => updateItem(idx, 'code', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(idx, 'name', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unit}
                            onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.category}
                            onChange={(e) => updateItem(idx, 'category', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </TableCell>
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
            <Button variant="outline" onClick={() => { setShowPreview(false); setItems([]); }}>
              Anulează
            </Button>
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
