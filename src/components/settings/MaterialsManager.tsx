import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ColorPickerPopover } from './ColorPickerPopover';
import { useMaterials, type Material, type MaterialType } from '@/hooks/useMaterials';
import { useMaterialVariants, type MaterialVariant } from '@/hooks/useMaterialVariants';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, Plus, Pencil, Search, Upload, Loader2, Trash2, Image, Download } from 'lucide-react';
import { PdfMaterialImport } from './PdfMaterialImport';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';

const TYPE_LABELS_KEYS: Record<MaterialType, string> = {
  glass: 'materials.typeLabels.glass',
  hardware: 'materials.typeLabels.hardware',
  consumable: 'materials.typeLabels.consumable',
};

const UNIT_LABELS: Record<string, string> = {
  sqm: 'm²', lm: 'ml', pcs: 'buc', kg: 'kg', l: 'l',
};

const AVAILABLE_TAGS_KEYS = [
  { value: 'round', labelKey: 'materials.tags.round' },
  { value: 'rectangular', labelKey: 'materials.tags.rectangular' },
  { value: 'shower', labelKey: 'materials.tags.shower' },
  { value: 'door', labelKey: 'materials.tags.door' },
  { value: 'balustrade', labelKey: 'materials.tags.balustrade' },
  { value: 'panel', labelKey: 'materials.tags.panel' },
  { value: 'mirror', labelKey: 'materials.tags.mirror' },
  { value: 'kitchen_front', labelKey: 'materials.tags.kitchenFront' },
];

const emptyForm = {
  code: '', name: '', description: '', material_type: 'hardware' as MaterialType,
  unit: 'pcs' as const, unit_price: 0, processing_price: 0, supplier: '', location: '',
  stock_quantity: 0, min_stock_level: 0, tags: [] as string[], color_hex: '',
};

export function MaterialsManager() {
  const { t } = useTranslation();
  const { currencyLabel } = useCurrency();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<MaterialType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Import catalog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Variants state
  const [newVariantCode, setNewVariantCode] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantColor, setNewVariantColor] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const { materials, isLoading, createMaterial, updateMaterial, deleteMaterial } = useMaterials(
    typeFilter === 'all' ? undefined : typeFilter
  );
  const { variants, addVariant, deleteVariant } = useMaterialVariants(editingId ?? undefined);

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (m: Material) => {
    setEditingId(m.id);
    setForm({
      code: m.code, name: m.name, description: m.description || '',
      material_type: m.material_type, unit: m.unit as any,
      unit_price: m.unit_price || 0, processing_price: (m as any).processing_price || 0,
      supplier: m.supplier || '',
      location: m.location || '', stock_quantity: m.stock_quantity || 0,
      min_stock_level: m.min_stock_level || 0,
      tags: (m as any).tags || [],
      color_hex: (m as any).color_hex || '',
    });
    setImageFile(null);
    setImagePreview(m.image_url || null);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('toasts.materials.imageTooLarge'));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (materialId: string): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${materialId}.${ext}`;
    // Remove old
    await supabase.storage.from('material-images').remove([path]);
    const { error } = await supabase.storage.from('material-images').upload(path, imageFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('material-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.code || !form.name) {
      toast.error(t('toasts.materials.codeNameRequired'));
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        let image_url: string | undefined;
        if (imageFile) {
          image_url = (await uploadImage(editingId)) ?? undefined;
        }
        await updateMaterial.mutateAsync({
          id: editingId, ...form,
          ...(image_url ? { image_url } : {}),
        } as any);
      } else {
        const result = await createMaterial.mutateAsync(form as any);
        if (imageFile && result?.id) {
          const url = await uploadImage(result.id);
          if (url) {
            await updateMaterial.mutateAsync({ id: result.id, image_url: url } as any);
          }
        }
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (m: Material) => {
    await updateMaterial.mutateAsync({ id: m.id, is_active: !m.is_active } as any);
  };

  const handleAddVariant = async () => {
    if (!editingId || !newVariantCode || !newVariantName) return;
    await addVariant.mutateAsync({
      material_id: editingId,
      variant_code: newVariantCode,
      variant_name: newVariantName,
      color_hex: newVariantColor || null,
    });
    setNewVariantCode('');
    setNewVariantName('');
    setNewVariantColor('');
  };

  const handleImportCatalog = async () => {
    setIsImporting(true);
    try {
      const response = await supabase.functions.invoke('seed-materials', {
        method: 'POST',
      });
      if (response.error) throw response.error;
      const data = response.data;
      toast.success(
        t('toasts.materials.importDone', { materials: data.materials_inserted, variants: data.variants_inserted })
      );
      if (data.errors?.length) {
        console.warn('Import errors:', data.errors);
        toast.warning(t('toasts.materials.importWarnings', { count: data.errors.length }));
      }
      setImportDialogOpen(false);
    } catch (err: any) {
      toast.error(`${t('toasts.materials.importError')}: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Catalog Materiale
            </CardTitle>
            <div className="flex items-center gap-2">
              <PdfMaterialImport onImported={() => queryClient.invalidateQueries({ queryKey: ['materials'] })} />
              <Button size="sm" variant="outline" onClick={() => setImportDialogOpen(true)}>
                <Download className="h-4 w-4 mr-1" /> Import Catalog
              </Button>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" /> Adaugă Material
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                <TabsTrigger value="glass">{t('stockCategories.glass')}</TabsTrigger>
                <TabsTrigger value="hardware">{t('stockCategories.hardware')}</TabsTrigger>
                <TabsTrigger value="consumable">{t('stockCategories.consumable')}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('settings.materials.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Cod</TableHead>
                  <TableHead>Nume</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>U.M.</TableHead>
                  <TableHead className="text-right">Preț</TableHead>
                  <TableHead>Furnizor</TableHead>
                  <TableHead className="text-center">Activ</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {t('settings.materials.noMaterialFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>
                        {(m as any).image_url ? (
                          <img
                            src={(m as any).image_url}
                            alt={m.name}
                            className="w-10 h-10 rounded object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setLightboxUrl((m as any).image_url)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded border border-dashed border-border bg-muted/20 flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{m.code}</TableCell>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(TYPE_LABELS_KEYS[m.material_type])}</Badge>
                      </TableCell>
                      <TableCell>{UNIT_LABELS[m.unit] || m.unit}</TableCell>
                      <TableCell className="text-right">{m.unit_price?.toFixed(2) ?? '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.supplier || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={m.is_active !== false} onCheckedChange={() => toggleActive(m)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(m)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('settings.materials.editMaterial') : t('settings.materials.newMaterial')}</DialogTitle>
            <DialogDescription>
              {editingId ? t('settings.materials.editMaterialDesc') : t('settings.materials.newMaterialDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>{t('settings.materials.productPhoto')}</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg border border-border object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> {imagePreview ? t('settings.materials.change') : t('common.upload')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="space-y-2 flex-1">
                <Label>Cod *</Label>
                <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="MOD SS3H" />
              </div>
              <div className="space-y-2 shrink-0">
                <Label>Culoare</Label>
                <ColorPickerPopover value={form.color_hex} onChange={(hex) => setForm(p => ({ ...p, color_hex: hex }))} />
              </div>
              <div className="space-y-2 flex-1">
                <Label>{t('ui.nameRequired')}</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t('ui.placeholderKitName')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descriere</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder={t("ui.placeholderTechSpecs")} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={form.material_type} onValueChange={v => setForm(p => ({ ...p, material_type: v as MaterialType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glass">{t('stockCategories.glass')}</SelectItem>
                    <SelectItem value="hardware">{t('stockCategories.hardware')}</SelectItem>
                    <SelectItem value="consumable">{t('stockCategories.consumable')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unitate</Label>
                <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">{t('settings.materials.unitPcs')}</SelectItem>
                    <SelectItem value="sqm">m²</SelectItem>
                    <SelectItem value="lm">ml</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="l">{t('settings.materials.unitLiters')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preț unitar ({currencyLabel})</Label>
                <Input type="number" min={0} step={0.01} value={form.unit_price} onChange={e => setForm(p => ({ ...p, unit_price: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preț prelucrare ({currencyLabel})</Label>
              <Input type="number" min={0} step={0.01} value={form.processing_price} onChange={e => setForm(p => ({ ...p, processing_price: Number(e.target.value) }))} placeholder="0" />
              <p className="text-xs text-muted-foreground">{t('settings.materials.processingPriceHint')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Furnizor</Label>
                <Input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Locație</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('settings.materials.initialStock')}</Label>
                <Input type="number" min={0} value={form.stock_quantity} onChange={e => setForm(p => ({ ...p, stock_quantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.materials.minStock')}</Label>
                <Input type="number" min={0} value={form.min_stock_level} onChange={e => setForm(p => ({ ...p, min_stock_level: Number(e.target.value) }))} />
              </div>
            </div>

            {/* Tags section */}
            <div className="space-y-2">
              <Label>{t('settings.materials.tagsLabel')}</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS_KEYS.map(tag => {
                  const isActive = form.tags.includes(tag.value);
                  return (
                    <Badge
                      key={tag.value}
                      variant={isActive ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => {
                        setForm(p => ({
                          ...p,
                          tags: isActive
                            ? p.tags.filter(t => t !== tag.value)
                            : [...p.tags, tag.value],
                        }));
                      }}
                    >
                      {t(tag.labelKey)}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.materials.tagsHint')}
              </p>
            </div>

            {/* Variants section - only when editing */}
            {editingId && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-base font-semibold">{t('settings.variants.colorVariants')}</Label>
                {variants.length > 0 && (
                  <div className="space-y-1">
                    {variants.map((v: MaterialVariant) => (
                      <div key={v.id} className="flex items-center gap-2 text-sm bg-muted/30 rounded px-3 py-1.5">
                        <span
                          className="inline-block w-4 h-4 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: v.color_hex || '#888' }}
                        />
                        <span className="font-mono text-xs">{v.variant_code}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="flex-1">{v.variant_name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteVariant.mutate(v.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t('settings.variants.variantCode')}</Label>
                    <Input value={newVariantCode} onChange={e => setNewVariantCode(e.target.value)} placeholder="37.SS3H.810.11" className="h-8 text-sm" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{t('settings.variants.colorName')}</Label>
                    <Input value={newVariantName} onChange={e => setNewVariantName(e.target.value)} placeholder={t('settings.variants.colorNamePlaceholder')} className="h-8 text-sm" />
                  </div>
                  <ColorPickerPopover value={newVariantColor} onChange={setNewVariantColor} />
                  <Button size="sm" variant="outline" onClick={handleAddVariant} disabled={!newVariantCode || !newVariantName}>
                    <Plus className="h-3 w-3 mr-1" /> {t('common.add')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingId ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog */}
      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-black/90 border-none">
          <DialogTitle className="sr-only">Vizualizare imagine</DialogTitle>
          <DialogDescription className="sr-only">Previzualizare imagine produs</DialogDescription>
          {lightboxUrl && (
            <img
              src={lightboxUrl}
              alt="Imagine produs"
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.materials.deleteMaterial')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.materials.deleteConfirm', { name: deleteTarget?.name, code: deleteTarget?.code })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMaterial.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Catalog Dialog */}
      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Catalog</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune va importa întregul catalog (~95 materiale și ~280 variante de culoare) în baza de date. Materialele existente cu același cod vor fi actualizate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportCatalog} disabled={isImporting}>
              {isImporting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {isImporting ? 'Se importă...' : 'Importă Catalogul'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
