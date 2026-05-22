import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { FileSpreadsheet, ImagePlus, Loader2, Trash2, Check } from 'lucide-react';

interface ExtractedItem {
  code: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  imageFile?: File;
  image_url?: string;
  imageFileName?: string;
  finish?: string;
  dimension?: string;
  page?: string;
  sort_order?: number;
}

function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  // Detect separator: prefer ; if more frequent in first line
  const firstLine = clean.split(/\r?\n/)[0] || '';
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows: string[][] = [];
  let cur = '';
  let row: string[] = [];
  let inQ = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQ) {
      if (c === '"') {
        if (clean[i + 1] === '"') { cur += '"'; i++; } else { inQ = false; }
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === sep) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && clean[i + 1] === '\n') i++;
        row.push(cur); cur = '';
        if (row.some(v => v.trim() !== '')) rows.push(row);
        row = [];
      } else cur += c;
    }
  }
  row.push(cur);
  if (row.some(v => v.trim() !== '')) rows.push(row);
  return rows;
}

interface ExcelImportDialogProps {
  onImported: () => void;
}

function findColumn(headers: string[], ...keywords: string[]): number {
  return headers.findIndex(h => {
    const lower = (h || '').toLowerCase().trim();
    return keywords.some(k => lower.includes(k));
  });
}

export function ExcelImportDialog({ onImported }: ExcelImportDialogProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const excelFileRef = useRef<HTMLInputElement>(null);
  const zipFileRef = useRef<HTMLInputElement>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [catalogName, setCatalogName] = useState('');
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);


  const handleExcelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (excelFileRef.current) excelFileRef.current.value = '';

    try {
      const isCsv = /\.csv$/i.test(file.name);
      let rows: any[][];
      if (isCsv) {
        rows = parseCsv(await file.text());
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      }

      if (rows.length < 2) {
        toast({ title: t('admin.excelImport.emptyFile'), variant: 'destructive' });
        return;
      }

      const headers = rows[0].map((h: any) => String(h || ''));
      const colCode = findColumn(headers, 'cod', 'code', 'sku', 'articol');
      const colName = findColumn(headers, 'denumire', 'name', 'nume', 'produs', 'descriere', 'descrizione');
      const colPrice = findColumn(headers, 'pret', 'preț', 'price', 'prezzo', '-15%');
      const colUnit = findColumn(headers, 'um', 'unit', 'unitate', 'u.m.');
      const colCategory = findColumn(headers, 'categorie', 'category', 'grup', 'grupa');
      const colImage = findColumn(headers, 'fisier imagine', 'imagine', 'image', 'photo', 'foto');
      const colFinish = findColumn(headers, 'finitura', 'finisaj', 'finish');
      const colDim = findColumn(headers, 'dimensiune', 'dimensione', 'dimension', 'size');
      const colPage = findColumn(headers, 'pagina', 'page');

      if (colCode === -1 && colName === -1) {
        toast({ title: t('admin.excelImport.missingColumns'), variant: 'destructive' });
        return;
      }

      const extracted: ExtractedItem[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const code = colCode >= 0 ? String(row[colCode] || '').trim() : '';
        const name = colName >= 0 ? String(row[colName] || '').trim() : '';
        if (!code && !name) continue;

        const rawPrice = colPrice >= 0 ? row[colPrice] : 0;
        const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(',', '.')) || 0;
        const dimension = colDim >= 0 ? String(row[colDim] || '').trim() : '';
        const defaultUnit = /\d\s*(mm|cm|m)\b/i.test(dimension) ? 'ml' : 'buc';

        extracted.push({
          code,
          name,
          price,
          unit: colUnit >= 0 ? String(row[colUnit] || defaultUnit).trim() : defaultUnit,
          category: colCategory >= 0 ? String(row[colCategory] || 'General').trim() : 'General',
          imageFileName: colImage >= 0 ? String(row[colImage] || '').trim() : undefined,
          finish: colFinish >= 0 ? String(row[colFinish] || '').trim() : undefined,
          dimension: dimension || undefined,
          page: colPage >= 0 ? String(row[colPage] || '').trim() : undefined,
          sort_order: extracted.length,
        });
      }

      if (extracted.length === 0) {
        toast({ title: t('admin.excelImport.noProducts'), variant: 'destructive' });
        return;
      }

      setCatalogName(file.name.replace(/\.(csv|xlsx|xls)$/i, ''));
      setItems(extracted);
      setMatchedCount(0);
      setShowPreview(true);
    } catch (err: any) {
      toast({ title: t('admin.excelImport.readError'), description: err.message, variant: 'destructive' });
    }
  };

  const handleZipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (zipFileRef.current) zipFileRef.current.value = '';

    setZipLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      // Index by full filename AND by name-without-ext (lowercase)
      const byFullName: Record<string, JSZip.JSZipObject> = {};
      const byBaseName: Record<string, JSZip.JSZipObject> = {};

      zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;
        const ext = relativePath.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return;

        const fileName = (relativePath.split('/').pop() || '').toLowerCase();
        byFullName[fileName] = zipEntry;
        const base = fileName.substring(0, fileName.lastIndexOf('.'));
        if (base) byBaseName[base] = zipEntry;
      });

      let matched = 0;
      const totalImages = Object.keys(byFullName).length;
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          // 1) Try explicit filename from CSV
          let entry: JSZip.JSZipObject | undefined;
          if (item.imageFileName) {
            const wanted = item.imageFileName.toLowerCase();
            entry = byFullName[wanted] || byBaseName[wanted.replace(/\.[^.]+$/, '')];
          }
          // 2) Fallback: match by code
          if (!entry) entry = byBaseName[item.code.trim().toLowerCase()];

          if (entry) {
            const blob = await entry.async('blob');
            const ext = entry.name.split('.').pop() || 'jpg';
            const imageFile = new File([blob], `${item.code}.${ext}`, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
            matched++;
            return { ...item, imageFile };
          }
          return item;
        })
      );

      setItems(updatedItems);
      setMatchedCount(matched);
      toast({ title: t('admin.excelImport.imagesMatchedToast', { matched, total: totalImages }) });
    } catch (err: any) {
      toast({ title: t('admin.excelImport.zipReadError'), description: err.message, variant: 'destructive' });
    } finally {
      setZipLoading(false);
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
      // 1. Upload images
      const itemsWithUrls = await Promise.all(
        items.map(async (item) => {
          if (!item.imageFile) return item;
          const ext = item.imageFile.name.split('.').pop() || 'jpg';
          const filePath = `${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from('material-images')
            .upload(filePath, item.imageFile, { contentType: item.imageFile.type });

          if (error) {
            console.error('Image upload error:', error.message);
            return item;
          }

          const { data: publicUrl } = supabase.storage
            .from('material-images')
            .getPublicUrl(filePath);

          return { ...item, image_url: publicUrl.publicUrl };
        })
      );

      // 2. Create catalog
      const { data: newCatalog, error: catErr } = await supabase
        .from('admin_catalogs')
        .insert({ name: catalogName, description: 'Importat din Excel', created_by: user.id })
        .select()
        .single();

      if (catErr || !newCatalog) throw catErr || new Error('Failed to create catalog');

      // 3. Insert items in batches
      const BATCH = 100;
      for (let i = 0; i < itemsWithUrls.length; i += BATCH) {
        const batch = itemsWithUrls.slice(i, i + BATCH).map(item => ({
          catalog_id: newCatalog.id,
          item_type: 'pricing',
          source_data: {
            code: item.code,
            name: item.name,
            price: item.price,
            unit: item.unit,
            category: item.category,
            image_url: item.image_url || null,
            color_hex: (item as any).color_hex || null,
            finish: item.finish || null,
            dimension: item.dimension || null,
            page: item.page || null,
            sort_order: item.sort_order ?? null,
          },
        }));
        await supabase.from('admin_catalog_items').insert(batch);
      }

      toast({ title: t('admin.excelImport.importedSuccess', { name: catalogName, count: itemsWithUrls.length }) });
      setShowPreview(false);
      setItems([]);
      setCatalogName('');
      setMatchedCount(0);
      onImported();
    } catch (err: any) {
      toast({ title: t('admin.excelImport.saveError'), description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <>
      <Button variant="outline" onClick={() => excelFileRef.current?.click()}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {t('admin.excelImport.importExcel')}
      </Button>

      <input ref={excelFileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleExcelSelect} />
      <input ref={zipFileRef} type="file" accept=".zip" className="hidden" onChange={handleZipSelect} />

      <Dialog open={showPreview} onOpenChange={(v) => { if (!v) { setShowPreview(false); setItems([]); setMatchedCount(0); } }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.excelImport.previewTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.excelImport.previewDesc', { count: items.length, categories: categories.length, categorySuffix: categories.length === 1 ? 'e' : 'i' })}
              {matchedCount > 0 && ` ${t('admin.excelImport.imagesMatched', { count: matchedCount })}`}
              {' '}{t('admin.excelImport.editHint')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium text-foreground">{t('admin.excelImport.catalogNameLabel')}</label>
                <Input value={catalogName} onChange={(e) => setCatalogName(e.target.value)} />
              </div>
              <Button
                variant="outline"
                onClick={() => zipFileRef.current?.click()}
                disabled={zipLoading}
              >
                {zipLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" />}
                {t('admin.excelImport.uploadZip')}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">{t('admin.excelImport.code')}</TableHead>
                      <TableHead>{t('admin.excelImport.name')}</TableHead>
                      <TableHead className="w-[90px]">{t('admin.excelImport.price')}</TableHead>
                      <TableHead className="w-[70px]">{t('admin.excelImport.unit')}</TableHead>
                      <TableHead className="w-[120px]">{t('admin.excelImport.category')}</TableHead>
                      <TableHead className="w-[40px]">{t('admin.excelImport.img')}</TableHead>
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
                        <TableCell className="text-center">
                          {item.imageFile && <Check className="h-4 w-4 text-green-500 mx-auto" />}
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
            <Button variant="outline" onClick={() => { setShowPreview(false); setItems([]); setMatchedCount(0); }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={confirmImport} disabled={saving || items.length === 0}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t('admin.excelImport.importProducts', { count: items.length })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
