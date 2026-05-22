import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUp, Loader2, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { MaterialType } from '@/hooks/useMaterials';

interface ExtractedItem {
  code: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  selected: boolean;
  material_type: MaterialType;
}

const UNIT_MAP: Record<string, string> = {
  'buc': 'pcs', 'pcs': 'pcs', 'bucata': 'pcs', 'bucati': 'pcs',
  'ml': 'lm', 'lm': 'lm', 'm': 'lm',
  'm²': 'sqm', 'mp': 'sqm', 'sqm': 'sqm', 'm2': 'sqm',
  'kg': 'kg',
  'l': 'l', 'litru': 'l', 'litri': 'l',
  'set': 'pcs',
};

function mapUnit(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return UNIT_MAP[lower] || 'pcs';
}

interface Props {
  onImported: () => void;
}

export function PdfMaterialImport({ onImported }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'preview'>('upload');
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [catalogName, setCatalogName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t('toasts.pdfImport.fileTooLarge'));
      return;
    }

    if (!file.type.includes('pdf')) {
      toast.error(t('toasts.pdfImport.onlyPdf'));
      return;
    }

    setStep('processing');
    setIsProcessing(true);

    try {
      // Upload to catalog-pdfs bucket
      const filePath = `user-imports/${user?.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('catalog-pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Call edge function
      const { data, error } = await supabase.functions.invoke('parse-user-catalog-pdf', {
        body: { filePath },
      });

      if (error) throw error;

      if (!data?.items?.length) {
        toast.error(t('toasts.pdfImport.noProducts'));
        setStep('upload');
        return;
      }

      setCatalogName(data.catalog_name || 'Catalog importat');
      setItems(data.items.map((item: any) => ({
        ...item,
        selected: true,
        material_type: 'hardware' as MaterialType,
      })));
      setStep('preview');
    } catch (err: any) {
      console.error('PDF import error:', err);
      toast.error(`Eroare: ${err.message || 'Nu s-a putut procesa PDF-ul'}`);
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItem = (index: number) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const toggleAll = (checked: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const updateItem = (index: number, field: keyof ExtractedItem, value: any) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmImport = async () => {
    const selected = items.filter(i => i.selected);
    if (!selected.length) {
      toast.error(t('toasts.pdfImport.selectAtLeast'));
      return;
    }

    setIsSaving(true);
    try {
      // Scope import to current subscriber's company (admin can publish globally
      // via the dedicated Admin > Catalog Global module).
      const { data: { user } } = await supabase.auth.getUser();
      let companyId: string | null = null;
      if (user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
        companyId = (prof as any)?.company_id ?? null;
      }

      const materialsToInsert = selected.map(item => ({
        code: item.code,
        name: item.name,
        unit_price: item.price,
        unit: mapUnit(item.unit) as "pcs" | "lm" | "sqm" | "kg" | "l",
        material_type: item.material_type as "hardware" | "glass" | "consumable",
        description: item.category,
        supplier: catalogName,
        is_active: true,
        company_id: companyId,
      }));

      // Insert in batches of 50
      let inserted = 0;
      for (let i = 0; i < materialsToInsert.length; i += 50) {
        const batch = materialsToInsert.slice(i, i + 50);
        const { error } = await supabase.from('materials').insert(batch as any);
        if (error) throw error;
        inserted += batch.length;
      }

      toast.success(t('toasts.pdfImport.success', { count: inserted }));
      onImported();
      handleClose();
    } catch (err: any) {
      toast.error(`Eroare la salvare: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep('upload');
    setItems([]);
    setCatalogName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const selectedCount = items.filter(i => i.selected).length;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <FileUp className="h-4 w-4 mr-1" /> Importă PDF
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className={step === 'preview' ? 'max-w-5xl max-h-[85vh] overflow-hidden flex flex-col' : 'max-w-md'}>
          <DialogHeader>
            <DialogTitle>
              {step === 'upload' && 'Importă materiale din PDF'}
              {step === 'processing' && 'Se procesează catalogul...'}
              {step === 'preview' && `Previzualizare: ${catalogName}`}
            </DialogTitle>
            <DialogDescription>
              {step === 'upload' && 'Încarcă un PDF de catalog pentru a extrage automat produsele.'}
              {step === 'processing' && 'AI-ul analizează documentul. Poate dura 30-60 secunde.'}
              {step === 'preview' && `${selectedCount} din ${items.length} produse selectate pentru import.`}
            </DialogDescription>
          </DialogHeader>

          {step === 'upload' && (
            <div className="space-y-4 py-4">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click pentru a selecta un PDF</span>
                </div>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Maxim 20MB. Formatul recomandat: catalog cu tabele de produse.
              </p>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground">Extragere produse cu AI...</p>
            </div>
          )}

          {step === 'preview' && (
            <>
              <div className="flex-1 overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedCount === items.length}
                          onCheckedChange={(v) => toggleAll(!!v)}
                        />
                      </TableHead>
                      <TableHead>Cod</TableHead>
                      <TableHead>Denumire</TableHead>
                      <TableHead>Preț</TableHead>
                      <TableHead>UM</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx} className={!item.selected ? 'opacity-40' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={() => toggleItem(idx)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.code}
                            onChange={e => updateItem(idx, 'code', e.target.value)}
                            className="h-7 text-xs w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.name}
                            onChange={e => updateItem(idx, 'name', e.target.value)}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="h-7 text-xs w-20"
                          />
                        </TableCell>
                        <TableCell className="text-xs">{item.unit}</TableCell>
                        <TableCell>
                          <Select
                            value={item.material_type}
                            onValueChange={v => updateItem(idx, 'material_type', v)}
                          >
                            <SelectTrigger className="h-7 text-xs w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hardware">Feronerie</SelectItem>
                              <SelectItem value="glass">Sticlă</SelectItem>
                              <SelectItem value="consumable">Consumabile</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeItem(idx)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>Anulează</Button>
                <Button onClick={handleConfirmImport} disabled={isSaving || !selectedCount}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                  Importă {selectedCount} materiale
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
