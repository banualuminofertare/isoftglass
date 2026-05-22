import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Package, Plus, Trash2, ChevronDown, ChevronRight, Loader2, Image, X, Pencil, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessoryKits, type KitFormData, type GlassDeductions } from '@/hooks/useAccessoryKits';
import { ExtraAccessoryAdder } from '@/components/calculators/shared/ExtraAccessoryAdder';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { COLOR_PRESETS, getColorLabel } from '@/lib/colorPresets';
import { useCurrency } from '@/contexts/CurrencyContext';

const getProductTypes = (t: any) => [
  { value: 'shower', label: t('kits.shower') },
  { value: 'door', label: t('kits.door') },
  { value: 'balustrade', label: t('kits.balustrade') },
  { value: 'panel', label: t('kits.panel') },
  { value: 'mirror', label: t('kits.mirror') },
  { value: 'kitchen_front', label: t('kits.kitchenFront') },
];

interface KitItemTemp {
  material_code: string;
  material_name: string;
  quantity: number;
}

interface KitManagerProps {
  supplierFilter?: string;
  onSuppliersChange?: (suppliers: string[]) => void;
  onKitCountChange?: (count: number) => void;
}

export function KitManager({ supplierFilter, onSuppliersChange, onKitCountChange }: KitManagerProps) {
  const { t } = useTranslation();
  const { kits, isLoading, addKit, updateKit, deleteKit, addKitItem, removeKitItem } = useAccessoryKits();
  const { formatPrice, currencyLabel } = useCurrency();
  const PRODUCT_TYPES = useMemo(() => getProductTypes(t), [t]);

  // Extract unique suppliers and report to parent
  const kitSuppliersList = useMemo(() => 
    Array.from(new Set(kits.map(k => (k as any).catalog_source).filter(Boolean))).sort() as string[],
    [kits]
  );
  useEffect(() => { onSuppliersChange?.(kitSuppliersList); }, [kitSuppliersList, onSuppliersChange]);
  useEffect(() => { onKitCountChange?.(kits.length); }, [kits.length, onKitCountChange]);

  // Filter kits by supplier
  const displayedKits = useMemo(() => 
    supplierFilter && supplierFilter !== 'all'
      ? kits.filter(k => (k as any).catalog_source === supplierFilter)
      : kits,
    [kits, supplierFilter]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  const [expandedKit, setExpandedKit] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [kitDialogScale, setKitDialogScale] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [tempItems, setTempItems] = useState<KitItemTemp[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [glassDeductions, setGlassDeductions] = useState<GlassDeductions>({});
  const [doorHeightDeduction, setDoorHeightDeduction] = useState(0);
  const [fixedPanelHeightDeduction, setFixedPanelHeightDeduction] = useState(0);
  const [widthOverlap, setWidthOverlap] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [processingTypes, setProcessingTypes] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setPrice(0);
    setProductTypes([]);
    setTempItems([]);
    setEditingKitId(null);
    setImageFile(null);
    setImagePreview(null);
    setModel('');
    setColor('');
    setGlassDeductions({});
    setDoorHeightDeduction(0);
    setFixedPanelHeightDeduction(0);
    setWidthOverlap(0);
    setSupplier('');
    setProcessingTypes({});
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (kitId: string) => {
    const kit = kits.find(k => k.id === kitId);
    if (!kit) return;
    setName(kit.name);
    setCode(kit.code);
    setDescription(kit.description || '');
    setPrice(kit.price);
    setProductTypes(kit.product_types);
    setTempItems(kit.items.map(i => ({ material_code: i.material_code, material_name: i.material_name, quantity: i.quantity })));
    setEditingKitId(kit.id);
    setImageFile(null);
    setImagePreview(kit.image_url || null);
    setModel(kit.model || '');
    setColor(kit.color || '');
    setGlassDeductions((kit as any).glass_deductions || {});
    setDoorHeightDeduction((kit as any).door_height_deduction || 0);
    setFixedPanelHeightDeduction((kit as any).fixed_panel_height_deduction || 0);
    setWidthOverlap((kit as any).width_overlap || 0);
    setSupplier((kit as any).catalog_source || '');
    setProcessingTypes((kit as any).processing_types && typeof (kit as any).processing_types === 'object' && !Array.isArray((kit as any).processing_types) ? (kit as any).processing_types : {});
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (kitCode: string): Promise<string | null> => {
    if (!imageFile) return imagePreview; // keep existing
    const ext = imageFile.name.split('.').pop() || 'jpg';
    const filePath = `kits/${kitCode.replace(/[^a-zA-Z0-9._-]/g, '_')}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('material-images')
      .upload(filePath, imageFile, { upsert: false });
    if (error) {
      toast.error(t('kits.uploadError') + ': ' + error.message);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from('material-images')
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!name || !code) {
      toast.error(t('kits.nameCodeRequired'));
      return;
    }
    if (productTypes.length === 0) {
      toast.error(t('kits.selectProductType'));
      return;
    }

    setIsSaving(true);

    const imageUrl = await uploadImage(code);

    const formData: KitFormData = { name, code, description, price, product_types: productTypes, image_url: imageUrl, model: model || null, color: color || null, glass_deductions: glassDeductions, door_height_deduction: doorHeightDeduction, fixed_panel_height_deduction: fixedPanelHeightDeduction, width_overlap: widthOverlap, processing_types: processingTypes, catalog_source: supplier || null };

    if (editingKitId) {
      const success = await updateKit(editingKitId, formData);
      if (success) {
        const kit = kits.find(k => k.id === editingKitId);
        if (kit) {
          for (const item of kit.items) {
            await removeKitItem(item.id);
          }
        }
        for (const item of tempItems) {
          await addKitItem(editingKitId, item);
        }
        toast.success(t('kits.kitUpdated'));
      }
    } else {
      const kitId = await addKit(formData);
      if (kitId) {
        for (const item of tempItems) {
          await addKitItem(kitId, item);
        }
        toast.success(t('kits.kitCreated'));
      }
    }

    setIsSaving(false);
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const success = await deleteKit(id);
    if (success) toast.success(t('kits.kitDeleted'));
  };

  const toggleProductType = (type: string) => {
    setProductTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5" />
                {t('kits.title')}
              </CardTitle>
              <CardDescription>
                {t('kits.description')}
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              {t('kits.addKit')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {displayedKits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('kits.emptyState')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                   <TableHead className="w-14">{t('kits.photo')}</TableHead>
                  <TableHead>{t('kits.model')}</TableHead>
                  <TableHead>{t('kits.code')}</TableHead>
                  <TableHead>{t('kits.name')}</TableHead>
                   <TableHead>{t('kits.products')}</TableHead>
                   <TableHead>{t('kits.supplier')}</TableHead>
                   <TableHead className="text-right">{t('kits.price')}</TableHead>
                   <TableHead>{t('kits.parts')}</TableHead>
                   <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedKits.map(kit => (
                  <>
                    <TableRow key={kit.id} className="cursor-pointer" onClick={() => setExpandedKit(expandedKit === kit.id ? null : kit.id)}>
                      <TableCell>
                        {expandedKit === kit.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                      <TableCell>
                        {kit.image_url ? (
                          <ImageLightbox src={kit.image_url} alt={kit.name} className="w-10 h-10 rounded object-cover border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{kit.model || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          {kit.code}
                          {kit.color && (
                            <>
                              <span className="inline-block w-3 h-3 rounded-full border border-border shrink-0" style={{ backgroundColor: kit.color }} />
                              <span className="text-muted-foreground font-sans text-[10px]">{getColorLabel(kit.color)}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{kit.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {kit.product_types.map(pt => (
                            <Badge key={pt} variant="outline" className="text-[10px] px-1.5 py-0 rounded-sm">
                              {PRODUCT_TYPES.find(p => p.value === pt)?.label || pt}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(kit as any).catalog_source || '—'}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(kit.price)}</TableCell>
                      <TableCell>{t('kits.partsCount', { count: kit.items.length })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t('kits.editKit')} onClick={() => openEditDialog(kit.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('kits.deleteKit')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('kits.deleteConfirm', { name: kit.name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('kits.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(kit.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  {t('kits.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedKit === kit.id && kit.items.length > 0 && (
                      <TableRow key={`${kit.id}-items`}>
                        <TableCell colSpan={9} className="bg-muted/30 p-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t('kits.componentParts')}</Label>
                            {kit.items.map(item => (
                              <div key={item.id} className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-xs text-muted-foreground">{item.material_code}</span>
                                <span>{item.material_name}</span>
                                <Badge variant="outline" className="text-[10px]">{t('kits.pcs', { count: item.quantity })}</Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { resetForm(); setKitDialogScale(0); } setDialogOpen(open); }}>
        <DialogContent className={cn("max-h-[85vh] overflow-y-auto", kitDialogScale === 0 ? "sm:max-w-2xl" : kitDialogScale === 1 ? "sm:max-w-5xl" : "sm:max-w-7xl")}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{editingKitId ? t('kits.editKit') : t('kits.addKitNew')}</DialogTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={kitDialogScale === 0} onClick={() => setKitDialogScale(s => s - 1)}><ZoomOut className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={kitDialogScale === 2} onClick={() => setKitDialogScale(s => s + 1)}><ZoomIn className="h-4 w-4" /></Button>
              </div>
            </div>
            <DialogDescription className="sr-only">{t('kits.dialogDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Încărcare foto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            {/* Fotografie + label */}
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                {imagePreview ? (
                  <div className="relative w-20 h-20">
                    <ImageLightbox src={imagePreview} alt="Kit" className="w-20 h-20 rounded-lg object-cover border border-border" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="h-5 w-5" />
                    <span className="text-[10px]">{t('kits.photography')}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline mt-1 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {t('kits.uploadPhoto')}
              </button>
            </div>

            {/* Câmpuri: Model, Cod+Culoare, Nume, Preț */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t('kits.model')} <span className="text-destructive">*</span></Label>
                <Input value={model} onChange={e => setModel(e.target.value)} placeholder={t('kits.modelPlaceholder')} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('kits.code')} <span className="text-destructive">*</span></Label>
                <div className="flex gap-2 items-center">
                  <Input value={code} onChange={e => setCode(e.target.value)} placeholder="KIT.DUS.001" className="h-8 text-sm flex-1" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="h-8 w-8 rounded-md border border-input shrink-0 flex items-center justify-center hover:border-primary transition-colors"
                        title={color ? (COLOR_PRESETS.find(c => c.value === color)?.label || color) : t('kits.selectColor')}
                      >
                        {color ? (
                          <span className="w-5 h-5 rounded" style={{ backgroundColor: color }} />
                        ) : (
                          <span className="w-5 h-5 rounded bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 opacity-50" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="end">
                      <div className="space-y-0.5 max-h-60 overflow-y-auto">
                        {COLOR_PRESETS.map(cp => (
                          <button
                            key={cp.value}
                            type="button"
                            onClick={() => setColor(cp.value)}
                            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors ${color === cp.value ? 'bg-primary/10 font-medium' : 'hover:bg-muted'}`}
                          >
                            <span className="w-4 h-4 rounded border border-border shrink-0" style={{ backgroundColor: cp.value }} />
                            <span className="truncate">{cp.label}</span>
                          </button>
                        ))}
                      </div>
                      {color && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                          <span className="w-4 h-4 rounded border border-border shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[10px] text-muted-foreground truncate">{COLOR_PRESETS.find(c => c.value === color)?.label || color}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-5 w-5 ml-auto shrink-0" onClick={() => setColor('')}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('kits.name')} <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('ui.placeholderKitNameStandard')} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('kits.kitPrice')} ({currencyLabel})</Label>
                <Input type="number" min={0} step={0.01} value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
              </div>
            </div>

            {/* Descriere */}
            <div className="space-y-1">
              <Label className="text-xs">{t('kits.descriptionLabel')}</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('kits.descriptionPlaceholder')} rows={2} className="text-sm" />
            </div>

            {/* Furnizor */}
            <div className="space-y-1">
              <Label className="text-xs">{t('kits.supplierLabel')}</Label>
              <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder={t('kits.supplierPlaceholder')} className="h-8 text-sm" />
            </div>

            {/* Deduceri sticlă per latură */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t('kits.glassDeductions')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">{t('kits.sideA')}</Label>
                  <Input type="number" min={0} step={1} value={glassDeductions.sideA ?? 0} onChange={e => setGlassDeductions(prev => ({ ...prev, sideA: parseFloat(e.target.value) || 0 }))} className="h-8 text-sm" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">{t('kits.sideB')}</Label>
                  <Input type="number" min={0} step={1} value={glassDeductions.sideB ?? 0} onChange={e => setGlassDeductions(prev => ({ ...prev, sideB: parseFloat(e.target.value) || 0 }))} className="h-8 text-sm" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">{t('kits.top')}</Label>
                  <Input type="number" min={0} step={1} value={glassDeductions.top ?? 0} onChange={e => setGlassDeductions(prev => ({ ...prev, top: parseFloat(e.target.value) || 0 }))} className="h-8 text-sm" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">{t('kits.bottom')}</Label>
                  <Input type="number" min={0} step={1} value={glassDeductions.bottom ?? 0} onChange={e => setGlassDeductions(prev => ({ ...prev, bottom: parseFloat(e.target.value) || 0 }))} className="h-8 text-sm" />
                </div>
              </div>
            </div>

            {/* Mecanism glisant */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t('kits.slidingMechanism')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">{t('kits.doorHeightDeduction')}</Label>
                  <Input type="number" min={0} step={1} value={doorHeightDeduction} onChange={e => setDoorHeightDeduction(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">{t('kits.fixedPanelDeduction')}</Label>
                  <Input type="number" min={0} step={1} value={fixedPanelHeightDeduction} onChange={e => setFixedPanelHeightDeduction(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">{t('kits.widthOverlap')}</Label>
                  <Input type="number" min={0} step={1} value={widthOverlap} onChange={e => setWidthOverlap(parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                </div>
              </div>
            </div>

            {/* Tipuri produs */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t('kits.productTypes')}</Label>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                {PRODUCT_TYPES.map(pt => (
                  <label key={pt.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox
                      checked={productTypes.includes(pt.value)}
                      onCheckedChange={() => toggleProductType(pt.value)}
                      className="h-3.5 w-3.5"
                    />
                    {pt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Prelucrare */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t('kits.processing')}</Label>
              <p className="text-[11px] text-muted-foreground">{t('kits.processingDesc')}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'gaurire', label: t('kits.drilling') },
                  { value: 'decupaj_mare', label: t('kits.largeCutout') },
                  { value: 'decupaj_mic', label: t('kits.smallCutout') },
                ].map(proc => {
                  const qty = processingTypes[proc.value] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div key={proc.value} className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        className={`w-full px-3 py-2 rounded-md border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setProcessingTypes(prev => {
                            const next = { ...prev };
                            if (isSelected) { delete next[proc.value]; } else { next[proc.value] = 1; }
                            return next;
                          });
                        }}
                      >
                        {proc.label}
                      </button>
                      {isSelected && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="w-6 h-6 rounded border border-border text-xs font-bold hover:bg-muted"
                            onClick={() => setProcessingTypes(prev => {
                              const next = { ...prev };
                              if (qty <= 1) { delete next[proc.value]; } else { next[proc.value] = qty - 1; }
                              return next;
                            })}
                          >−</button>
                          <span className="text-sm font-medium w-6 text-center">{qty}</span>
                          <button
                            type="button"
                            className="w-6 h-6 rounded border border-border text-xs font-bold hover:bg-muted"
                            onClick={() => setProcessingTypes(prev => ({
                              ...prev, [proc.value]: qty + 1,
                            }))}
                          >+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('kits.componentPartsLabel')} ({tempItems.length})</Label>
              {tempItems.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {tempItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded border bg-card text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{item.material_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{item.material_code}</span>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => {
                          const q = parseInt(e.target.value) || 1;
                          setTempItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: q } : it));
                        }}
                        className="w-16 h-7 text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setTempItems(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <ExtraAccessoryAdder
                onAdd={(item) => setTempItems(prev => [...prev, { material_code: item.materialCode, material_name: item.name, quantity: 1 }])}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>
              {t('kits.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingKitId ? t('kits.save') : t('kits.createKit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
