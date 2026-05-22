import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { PricingCategoryTransferDialog } from './PricingCategoryTransferDialog';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPickerPopover } from './ColorPickerPopover';
import { GLASS_COLOR_PRESETS } from '@/lib/colorPresets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, Layers, Wrench, Package, Users, Palette, Search, RefreshCw, Plus, Trash2, RotateCcw, Download, Pencil, Image, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { KitManager } from './KitManager';
import { useAccessoryKits } from '@/hooks/useAccessoryKits';
import { usePricingConfig, PriceCategory, PricingItem } from '@/hooks/usePricingConfig';
import { ColorPickerPopover as VariantColorPicker } from './ColorPickerPopover';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getProcessingDisplayName, getCategoryDisplayName } from '@/lib/processingNames';

const getCategoryConfig = (t: (key: string) => string): Partial<Record<PriceCategory, { label: string; icon: React.ReactNode; description: string }>> => ({
  glass: {
    label: t('pricing.catGlass'),
    icon: <Layers className="h-4 w-4" />,
    description: t('pricing.catGlassDesc'),
  },
  processing: {
    label: t('pricing.catProcessing'),
    icon: <Wrench className="h-4 w-4" />,
    description: t('pricing.catProcessingDesc'),
  },
  accessories: {
    label: t('pricing.catAccessories'),
    icon: <Package className="h-4 w-4" />,
    description: t('pricing.catAccessoriesDesc'),
  },
  labor: {
    label: t('pricing.catLabor'),
    icon: <Users className="h-4 w-4" />,
    description: t('pricing.catLaborDesc'),
  },
  finishing: {
    label: t('pricing.catFinishing'),
    icon: <Palette className="h-4 w-4" />,
    description: t('pricing.catFinishingDesc'),
  },
});

interface PendingItemChanges {
  name?: string;
  code?: string;
}

interface PricingRowProps {
  item: PricingItem;
  onPriceChange: (id: string, price: number) => void;
  onFieldChange: (id: string, fields: PendingItemChanges) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onResetToBase?: (id: string) => void;
  onEdit?: (item: PricingItem) => void;
  pendingChanges: Record<string, number>;
  pendingFieldChanges: Record<string, PendingItemChanges>;
  isAdminBrowsing?: boolean;
}

function PricingRow({ item, onPriceChange, onFieldChange, onToggleActive, onDelete, onResetToBase, onEdit, pendingChanges, pendingFieldChanges, isAdminBrowsing }: PricingRowProps) {
  const { t } = useTranslation();
  const { displayUnit, currency, convert, euroRate } = useCurrency();
  const hasChange = pendingChanges[item.id] !== undefined || pendingFieldChanges[item.id] !== undefined;
  const displayPrice = pendingChanges[item.id] !== undefined ? pendingChanges[item.id] : item.price;
  const displayCode = pendingFieldChanges[item.id]?.code ?? item.code;
  const rawName = pendingFieldChanges[item.id]?.name ?? item.name;
  const displayName = getCategoryDisplayName(item.category, item.code, rawName, t);
  
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
      !item.is_active ? 'bg-muted/50 opacity-60' : 'bg-card hover:bg-muted/30'
    } ${hasChange ? 'border-primary/50 bg-primary/5' : 'border-border'} ${item.is_override ? 'border-l-2 border-l-amber-500' : ''}`}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-9 h-9 rounded object-cover border border-border shrink-0" />
      ) : item.color_hex ? (
        <div
          className="w-9 h-9 rounded border border-border shrink-0"
          style={{ backgroundColor: item.color_hex }}
          title={item.color_hex}
        />
      ) : (
        <div className="w-9 h-9 rounded bg-muted border border-border shrink-0 flex items-center justify-center">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      {item.variant_colors && item.variant_colors.length > 0 && (
        <div className="flex items-center gap-0.5 shrink-0">
          {item.variant_colors.slice(0, 5).map((color, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-border shrink-0"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {item.variant_colors.length > 5 && (
            <span className="text-[9px] text-muted-foreground ml-0.5">+{item.variant_colors.length - 5}</span>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Input
          value={displayCode}
          onChange={(e) => onFieldChange(item.id, { ...pendingFieldChanges[item.id], code: e.target.value })}
          className="min-w-[120px] max-w-[150px] h-8 text-[11px] font-mono bg-muted/80"
          placeholder={t('ui.placeholderCode')}
          readOnly={!isAdminBrowsing && !!item.catalog_source}
        />
        {(item.own_color || item.color_hex) && (
          <span
            className="w-3 h-3 rounded-full border border-border shrink-0"
            style={{ backgroundColor: item.own_color?.hex || item.color_hex || '' }}
            title={item.own_color?.name || item.color_hex || ''}
          />
        )}
        <div className="w-px h-6 bg-border shrink-0" />
        <Input
          value={displayName}
          onChange={(e) => onFieldChange(item.id, { ...pendingFieldChanges[item.id], name: e.target.value })}
          className="flex-1 min-w-[120px] h-8 text-sm font-medium"
          placeholder={t('ui.placeholderName')}
          readOnly={!isAdminBrowsing && !!item.catalog_source}
        />
        {item.is_override && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-400 shrink-0">
            {t('pricing.customized')}
          </Badge>
        )}
        {hasChange && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-primary border-primary/50 shrink-0">
            {t('pricing.modified')}
          </Badge>
        )}
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            step={item.is_multiplier ? "0.01" : "1"}
            min="0"
            value={currency === 'EUR' && !item.is_multiplier && item.category !== 'labor' ? parseFloat(convert(displayPrice).toFixed(2)) : displayPrice}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              const ronValue = currency === 'EUR' && !item.is_multiplier && item.category !== 'labor' ? val * euroRate : val;
              onPriceChange(item.id, ronValue);
            }}
            className="w-24 h-8 text-right text-sm"
          />
          <span className="text-xs text-muted-foreground w-14">{item.category === 'labor' ? '%' : displayUnit(item.unit)}</span>
        </div>
        
        <Switch
          checked={item.is_active}
          onCheckedChange={(checked) => onToggleActive(item.id, checked)}
        />

        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={t('pricing.editAllFields')}
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}

        {item.is_override && onResetToBase && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600 hover:text-amber-700"
            title={t('pricing.resetToBase')}
            onClick={() => onResetToBase(item.id)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
           <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('pricing.deleteProduct')}</AlertDialogTitle>
              <AlertDialogDescription>
                {item.is_override
                  ? t('pricing.deleteConfirmOverride', { name: item.name })
                  : !item.user_id
                    ? t('pricing.deleteConfirmBase', { name: item.name, code: item.code })
                    : t('pricing.deleteConfirmOwn', { name: item.name, code: item.code })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('pricing.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {item.is_override ? t('pricing.resetBtn') : t('pricing.deleteBtn')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

const getProductTypes = (t: (key: string) => string) => [
  { value: 'shower', label: t('pricing.ptShower') },
  { value: 'door', label: t('pricing.ptDoor') },
  { value: 'balustrade', label: t('pricing.ptBalustrade') },
  { value: 'panel', label: t('pricing.ptPanel') },
  { value: 'mirror', label: t('pricing.ptMirror') },
  { value: 'kitchen_front', label: t('pricing.ptKitchenFront') },
];

interface AddItemFormData {
  code: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  is_multiplier: boolean;
  category: PriceCategory;
  imageFile: File | null;
  imagePreview: string | null;
  color_hex: string;
  supplier: string;
  location: string;
  stock_quantity: number;
  min_stock_level: number;
  processing_price: number;
  glass_deduction: number;
  glass_deductions: Record<string, number>;
  door_height_deduction: number;
  fixed_panel_height_deduction: number;
  width_overlap: number;
  product_types: string[];
  processing_types: Record<string, number>;
}

const defaultFormData: AddItemFormData = {
  code: '',
  name: '',
  description: '',
  unit: 'RON/buc',
  price: 0,
  is_multiplier: false,
  category: 'accessories',
  imageFile: null,
  imagePreview: null,
  color_hex: '',
  supplier: '',
  location: '',
  stock_quantity: 0,
  min_stock_level: 0,
  processing_price: 0,
  glass_deduction: 0,
  glass_deductions: {},
  door_height_deduction: 0,
  fixed_panel_height_deduction: 0,
  width_overlap: 0,
  product_types: [],
  processing_types: {},
};

export function PricingManager() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { isImpersonating } = useAdminImpersonation();
  const { currency, currencyLabel, convert, euroRate, displayUnit } = useCurrency();
  const categoryConfig = useMemo(() => getCategoryConfig(t), [t]);
  const PRODUCT_TYPES = useMemo(() => getProductTypes(t), [t]);
  const { items, isLoading, updatePrice, updateItem, toggleActive, getByCategory, addItem, deleteItem, resetToBase, importFromCatalog, previewCatalogImport, importSingleFromCatalog, checkCodeInMaterials, checkCodeAnywhere, refetch } = usePricingConfig();
  const { kits: allKits } = useAccessoryKits();
  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({});
  const [pendingFieldChanges, setPendingFieldChanges] = useState<Record<string, PendingItemChanges>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [kitSuppliers, setKitSuppliersList] = useState<string[]>([]);
  const [kitCountFromTab, setKitCountFromTab] = useState(0);
  const kitCount = allKits.length || kitCountFromTab;
  const [activeTab, setActiveTab] = useState<PriceCategory | 'kits'>('glass');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dialogScale, setDialogScale] = useState(0);
  const [formData, setFormData] = useState<AddItemFormData>({ ...defaultFormData, category: activeTab === 'kits' ? 'accessories' : activeTab });
  const [isAdding, setIsAdding] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreviewCount, setImportPreviewCount] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PricingItem | null>(null);
  const [editItem, setEditItem] = useState<PricingItem | null>(null);
  const [editFormData, setEditFormData] = useState<AddItemFormData>({ ...defaultFormData });
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [catalogCheckResult, setCatalogCheckResult] = useState<'none' | 'checking' | 'found' | 'found_in_pricing' | 'not_found'>('none');
  const [importingCode, setImportingCode] = useState(false);
  
  const isAdminBrowsing = role === 'admin' && !isImpersonating;

  // Resolve the company_id under which a materials row should be written.
  // Admins writing to the GLOBAL catalog use NULL; everyone else writes per-company.
  const resolveWriteCompanyId = async (writeToGlobal: boolean): Promise<string | null> => {
    if (isAdminBrowsing && writeToGlobal) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .maybeSingle();
    return (data as any)?.company_id ?? null;
  };

  // Variant management state (inline in edit dialog)
  const [editVariants, setEditVariants] = useState<{ id: string; variant_code: string; variant_name: string; color_hex: string | null; price: number | null }[]>([]);
  const [editVariantPendingPrices, setEditVariantPendingPrices] = useState<Record<string, number>>({});
  const [editMaterialId, setEditMaterialId] = useState<string | null>(null);
  const [newVarCode, setNewVarCode] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newVarColor, setNewVarColor] = useState('');

  // Fetch variants when edit dialog opens for accessories
  useEffect(() => {
    if (!editItem || editItem.category !== 'accessories') {
      setEditVariants([]);
      setEditMaterialId(null);
      setEditVariantPendingPrices({});
      return;
    }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      const { data: material } = await supabase
        .from('materials')
        .select('id')
        .eq('code', editItem.code)
        .maybeSingle();
      if (!material) { setEditMaterialId(null); setEditVariants([]); return; }
      setEditMaterialId(material.id);
      const { data: matVariants } = await supabase
        .from('material_variants')
        .select('*')
        .eq('material_id', material.id)
        .order('variant_code');
      if (!matVariants || matVariants.length === 0) { setEditVariants([]); return; }
      const variantCodes = matVariants.map(v => v.variant_code);
      const { data: pricingRows } = await supabase
        .from('pricing_config')
        .select('id, code, price, user_id')
        .in('code', variantCodes)
        .or(`user_id.is.null,user_id.eq.${userId}`);
      const pricingMap = new Map<string, number>();
      if (pricingRows) {
        for (const row of pricingRows.filter(r => r.user_id === null)) pricingMap.set(row.code, Number(row.price));
        for (const row of pricingRows.filter(r => r.user_id === userId)) pricingMap.set(row.code, Number(row.price));
      }
      setEditVariants(matVariants.map(v => ({
        id: v.id, variant_code: v.variant_code, variant_name: v.variant_name,
        color_hex: v.color_hex, price: pricingMap.get(v.variant_code) ?? null,
      })));
    })();
  }, [editItem?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success(t('pricing.pricesReloaded'));
  };

  const handlePriceChange = (id: string, price: number) => {
    setPendingChanges(prev => ({ ...prev, [id]: price }));
  };

  const handleFieldChange = (id: string, fields: PendingItemChanges) => {
    setPendingFieldChanges(prev => ({ ...prev, [id]: fields }));
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await toggleActive(id, active);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) {
      toast.success(t('pricing.itemDeleted'));
    }
  };

  const handleResetToBase = async (id: string) => {
    const success = await resetToBase(id);
    if (success) {
      toast.success(t('pricing.resetToBaseSuccess'));
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    let success = true;
    
    for (const [id, price] of Object.entries(pendingChanges)) {
      const result = await updatePrice(id, price);
      if (!result) success = false;
    }

    for (const [id, fields] of Object.entries(pendingFieldChanges)) {
      const result = await updateItem(id, fields);
      if (!result) success = false;
    }
    
    if (success) {
      setPendingChanges({});
      setPendingFieldChanges({});
      toast.success(t('pricing.changesSaved'));
    }
    
    setIsSaving(false);
  };

  const handleDiscardChanges = () => {
    setPendingChanges({});
    setPendingFieldChanges({});
  };

  const handleOpenEdit = (item: PricingItem) => {
    setEditFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      unit: item.unit,
      price: currency === 'EUR' && !item.is_multiplier && item.category !== 'labor' ? parseFloat(convert(item.price).toFixed(2)) : item.price,
      is_multiplier: item.is_multiplier,
      category: item.category,
      imageFile: null,
      imagePreview: item.image_url || null,
      color_hex: item.color_hex || item.own_color?.hex || '',
      supplier: (item as any).catalog_source || '',
      location: '',
      stock_quantity: 0,
      min_stock_level: 0,
      processing_price: 0,
      glass_deduction: item.glass_deduction || 0,
      glass_deductions: item.glass_deductions || {},
      door_height_deduction: item.door_height_deduction || 0,
      fixed_panel_height_deduction: item.fixed_panel_height_deduction || 0,
      width_overlap: item.width_overlap || 0,
      product_types: item.product_types || [],
      processing_types: item.processing_types || {},
    });
    setEditItem(item);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setIsEditSaving(true);

    // Upload new image if provided
    let newImageUrl: string | null = null;
    if (editFormData.imageFile) {
      const ext = editFormData.imageFile.name.split('.').pop() || 'jpg';
      const filePath = `pricing/${editFormData.code.replace(/[^a-zA-Z0-9._-]/g, '_')}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('material-images')
        .upload(filePath, editFormData.imageFile, { upsert: false });
      if (uploadError) {
        toast.error(t('pricing.photoUploadError') + uploadError.message);
        setIsEditSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('material-images')
        .getPublicUrl(filePath);
      newImageUrl = urlData.publicUrl;
    }

    // Update fields
    const fields: { name?: string; code?: string; description?: string; unit?: string; is_multiplier?: boolean } = {};
    if (editFormData.name !== editItem.name) fields.name = editFormData.name;
    if (editFormData.code !== editItem.code) fields.code = editFormData.code;
    if (editFormData.description !== (editItem.description || '')) fields.description = editFormData.description;
    if (editFormData.unit !== editItem.unit) fields.unit = editFormData.unit;
    if (editFormData.is_multiplier !== editItem.is_multiplier) fields.is_multiplier = editFormData.is_multiplier;

    // Update glass_deduction, glass_deductions, and mechanism fields directly on the pricing_config row
    const deductionChanged = editFormData.glass_deduction !== (editItem.glass_deduction || 0);
    const deductionsChanged = JSON.stringify(editFormData.glass_deductions) !== JSON.stringify(editItem.glass_deductions || {});
    const mechChanged = editFormData.door_height_deduction !== (editItem.door_height_deduction || 0)
      || editFormData.fixed_panel_height_deduction !== (editItem.fixed_panel_height_deduction || 0)
      || editFormData.width_overlap !== (editItem.width_overlap || 0);
    
    const productTypesChanged = JSON.stringify(editFormData.product_types) !== JSON.stringify(editItem.product_types || []);
    const processingTypesChanged = JSON.stringify(editFormData.processing_types) !== JSON.stringify(editItem.processing_types || {});

    if (deductionChanged || deductionsChanged || mechChanged || productTypesChanged || processingTypesChanged) {
      // Admin browsing global items: update directly by item ID
      if (isAdminBrowsing && !editItem.user_id) {
        const updatePayload: Record<string, any> = {};
        if (deductionChanged) updatePayload.glass_deduction = editFormData.glass_deduction;
        if (deductionsChanged) updatePayload.glass_deductions = editFormData.glass_deductions;
        if (mechChanged) {
          updatePayload.door_height_deduction = editFormData.door_height_deduction;
          updatePayload.fixed_panel_height_deduction = editFormData.fixed_panel_height_deduction;
          updatePayload.width_overlap = editFormData.width_overlap;
        }
        if (productTypesChanged) updatePayload.product_types = editFormData.product_types;
        if (processingTypesChanged) updatePayload.processing_types = editFormData.processing_types;
        await supabase.from('pricing_config').update(updatePayload).eq('id', editItem.id);
      } else {
        // For base items, we need to first ensure a user override exists
        if (!editItem.user_id) {
          const overrideResult = await updateItem(editItem.id, { name: editFormData.name || editItem.name });
          if (overrideResult) {
            await refetch();
          }
        }
        
        // Now find the correct row to update — scope to current user
        const effectiveUserId = editItem.user_id || (await supabase.auth.getUser()).data.user?.id;
        const { data: targetRow } = await supabase
          .from('pricing_config')
          .select('id')
          .eq('code', editFormData.code || editItem.code)
          .eq('user_id', effectiveUserId!)
          .maybeSingle();
        
        if (targetRow) {
          const updatePayload: Record<string, any> = {};
          if (deductionChanged) updatePayload.glass_deduction = editFormData.glass_deduction;
          if (deductionsChanged) updatePayload.glass_deductions = editFormData.glass_deductions;
          if (mechChanged) {
            updatePayload.door_height_deduction = editFormData.door_height_deduction;
            updatePayload.fixed_panel_height_deduction = editFormData.fixed_panel_height_deduction;
            updatePayload.width_overlap = editFormData.width_overlap;
          }
          if (productTypesChanged) updatePayload.product_types = editFormData.product_types;
          if (processingTypesChanged) updatePayload.processing_types = editFormData.processing_types;
          await supabase.from('pricing_config').update(updatePayload).eq('id', targetRow.id);
        }
      }
    }

    let success = true;
    const shouldConvert = currency === 'EUR' && !editItem.is_multiplier && editItem.category !== 'labor' && euroRate > 0;
    const ronPrice = shouldConvert ? editFormData.price * euroRate : editFormData.price;
    const priceChanged = ronPrice !== editItem.price;
    
    // Combine fields and price into a single update to avoid race conditions with base item overrides
    const colorChanged = editFormData.color_hex !== (editItem.color_hex || '');
    if (Object.keys(fields).length > 0 || priceChanged || (!editItem.user_id && (colorChanged || newImageUrl))) {
      const combinedFields = { ...fields };
      if (priceChanged) {
        (combinedFields as any).price = ronPrice;
      }
      // Include image_url and color_hex in override creation to prevent losing them
      if (!editItem.user_id) {
        if (colorChanged) (combinedFields as any).color_hex = editFormData.color_hex || null;
        if (newImageUrl) (combinedFields as any).image_url = newImageUrl;
        // Also carry over existing values if not explicitly changed
        if (!colorChanged && editItem.color_hex) (combinedFields as any).color_hex = editItem.color_hex;
        if (!newImageUrl && editItem.image_url) (combinedFields as any).image_url = editItem.image_url;
      }
      
      // If it's a base item, use updateItem which calls createUserOverride with all fields at once
      if (!editItem.user_id) {
        const result = await updateItem(editItem.id, combinedFields);
        if (!result) success = false;
      } else {
        // For user overrides, update fields and price separately (both are direct updates)
        if (Object.keys(fields).length > 0) {
          const result = await updateItem(editItem.id, fields);
          if (!result) success = false;
        }
        if (priceChanged) {
          const result = await updatePrice(editItem.id, ronPrice);
          if (!result) success = false;
        }
      }
    }

    // Save color_hex and/or image on pricing_config for ALL categories (only for existing overrides or admin)
    if ((colorChanged || newImageUrl) && (editItem.user_id || isAdminBrowsing)) {
      const codeToUse = editFormData.code || editItem.code;
      const pricingUpdate: Record<string, any> = {};
      if (colorChanged) pricingUpdate.color_hex = editFormData.color_hex || null;
      if (newImageUrl) pricingUpdate.image_url = newImageUrl;

      if (Object.keys(pricingUpdate).length > 0) {
        if (isAdminBrowsing && !editItem.user_id) {
          // Admin editing global item: update directly
          await supabase.from('pricing_config').update(pricingUpdate).eq('id', editItem.id);
        } else {
          // Subscriber with existing override: update directly
          const currentUserId = editItem.user_id || (await supabase.auth.getUser()).data.user?.id;
          if (currentUserId) {
            const { data: targetRow } = await supabase
              .from('pricing_config')
              .select('id')
              .eq('code', codeToUse)
              .eq('user_id', currentUserId)
              .maybeSingle();
            if (targetRow) {
              await supabase.from('pricing_config').update(pricingUpdate).eq('id', targetRow.id);
            }
          }
        }
      }
      // Also save image & color in materials table as backup (per-company for subscribers, global for admin)
      if (newImageUrl || colorChanged) {
        const writeToGlobal = isAdminBrowsing && !editItem.user_id;
        const writeCompanyId = await resolveWriteCompanyId(writeToGlobal);
        // Subscribers must have a company_id; otherwise skip materials write (RLS would block)
        if (writeToGlobal || writeCompanyId) {
          await supabase
            .from('materials')
            .upsert({
              code: codeToUse,
              name: editFormData.name || editItem.name,
              material_type: 'hardware' as any,
              unit: 'pcs' as any,
              company_id: writeCompanyId,
              ...(newImageUrl ? { image_url: newImageUrl } : {}),
              ...(editFormData.color_hex ? { color_hex: editFormData.color_hex } : {}),
            }, { onConflict: 'code,company_id' });
        }
      }
    }

    // Save catalog_source (supplier) on pricing_config
    const supplierChanged = editFormData.supplier !== ((editItem as any).catalog_source || '');
    if (supplierChanged) {
      // For admin on global items, update directly by item id
      if (isAdminBrowsing && !editItem.user_id) {
        await supabase.from('pricing_config').update({ catalog_source: editFormData.supplier || null }).eq('id', editItem.id);
      } else {
        const effectiveUserIdSupplier = editItem.user_id || (await supabase.auth.getUser()).data.user?.id;
        const codeForSupplier = editFormData.code || editItem.code;
        const { data: supplierRow } = await supabase
          .from('pricing_config')
          .select('id')
          .eq('code', codeForSupplier)
          .eq('user_id', effectiveUserIdSupplier!)
          .maybeSingle();
        if (supplierRow) {
          await supabase.from('pricing_config').update({ catalog_source: editFormData.supplier || null }).eq('id', supplierRow.id);
        }
      }
    }

    // Save variant prices
    if (Object.keys(editVariantPendingPrices).length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        for (const [variantCode, price] of Object.entries(editVariantPendingPrices)) {
          const { data: existing } = await supabase
            .from('pricing_config')
            .select('id')
            .eq('code', variantCode)
            .eq('user_id', user.id)
            .maybeSingle();
          if (existing) {
            await supabase.from('pricing_config').update({ price }).eq('id', existing.id);
          } else {
            const variant = editVariants.find(v => v.variant_code === variantCode);
            await supabase.from('pricing_config').insert({
              category: editItem.category,
              code: variantCode,
              name: `${editFormData.name} – ${variant?.variant_name || variantCode}`,
              unit: editItem.unit,
              price,
              is_multiplier: false,
              is_active: true,
              sort_order: editItem.sort_order,
              user_id: user.id,
            });
          }
        }
      }
    }

    if (success) {
      toast.success(t('pricing.itemUpdated'));
      await refetch();
      setEditItem({
        ...editItem,
        ...fields,
        price: editFormData.price,
        glass_deduction: editFormData.glass_deduction,
        glass_deductions: editFormData.glass_deductions,
        door_height_deduction: editFormData.door_height_deduction,
        fixed_panel_height_deduction: editFormData.fixed_panel_height_deduction,
        width_overlap: editFormData.width_overlap,
      });
      setEditVariantPendingPrices({});
    }
    setIsEditSaving(false);
  };

  const handleAddItem = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error(t('pricing.codeAndNameRequired'));
      return;
    }

    // Trim the code to avoid whitespace issues
    formData.code = formData.code.trim();
    formData.name = formData.name.trim();

    setIsAdding(true);

    // Upload image if provided
    let imageUrl: string | null = null;
    if (formData.imageFile) {
      const ext = formData.imageFile.name.split('.').pop() || 'jpg';
      const filePath = `pricing/${formData.code.replace(/[^a-zA-Z0-9._-]/g, '_')}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('material-images')
        .upload(filePath, formData.imageFile, { upsert: false });
      if (uploadError) {
        toast.error(t('pricing.photoUploadError') + uploadError.message);
        setIsAdding(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from('material-images')
        .getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const targetCategory = formData.category;
    const maxSort = Math.max(0, ...getByCategory(targetCategory).map(i => i.sort_order));
    
    const success = await addItem({
      category: targetCategory,
      code: formData.code,
      name: formData.name,
      description: formData.description || null,
      unit: formData.unit,
      price: currency === 'EUR' && !formData.is_multiplier && formData.category !== 'labor' && euroRate > 0 ? formData.price * euroRate : formData.price,
      is_multiplier: formData.is_multiplier,
      is_active: true,
      sort_order: maxSort + 1,
      image_url: imageUrl,
      catalog_source: formData.supplier || null,
    });

    if (success) {
      // Always create/update the material record with all fields
      const hasMaterialData = imageUrl || formData.color_hex || formData.supplier || formData.location || formData.stock_quantity || formData.min_stock_level || formData.processing_price;
      if (hasMaterialData) {
        // New items added by subscribers are per-company; admin (non-impersonating) adds to global catalog.
        const writeCompanyId = await resolveWriteCompanyId(isAdminBrowsing);
        if (isAdminBrowsing || writeCompanyId) {
          await supabase
            .from('materials')
            .upsert({
              code: formData.code,
              name: formData.name,
              material_type: 'hardware' as any,
              unit: 'pcs' as any,
              company_id: writeCompanyId,
              ...(imageUrl ? { image_url: imageUrl } : {}),
              ...(formData.color_hex ? { color_hex: formData.color_hex } : {}),
              ...(formData.supplier ? { supplier: formData.supplier } : {}),
              ...(formData.location ? { location: formData.location } : {}),
              stock_quantity: formData.stock_quantity,
              min_stock_level: formData.min_stock_level,
              processing_price: formData.processing_price,
              unit_price: formData.price,
            }, { onConflict: 'code,company_id' });
        }
      }
      toast.success(t('pricing.itemAdded'));
      setFormData({ ...defaultFormData, category: activeTab === 'kits' ? 'accessories' : activeTab });
      setAddDialogOpen(false);
      // Switch to the target tab
      setActiveTab(targetCategory);
    }
    setIsAdding(false);
  };

  // Extract unique suppliers for accessories
  const accessorySuppliers = Array.from(
    new Set(getByCategory('accessories').map(i => (i as any).catalog_source).filter(Boolean))
  ).sort() as string[];

  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const filteredItems = (category: PriceCategory) => {
    let categoryItems = getByCategory(category);
    
    const term = searchTerm ? normalize(searchTerm) : '';
    
    // Apply supplier filter for accessories, but skip it if searching (so search always finds)
    if (category === 'accessories' && supplierFilter !== 'all' && !term) {
      if (supplierFilter === '__none__') {
        categoryItems = categoryItems.filter(item => !(item as any).catalog_source);
      } else {
        categoryItems = categoryItems.filter(item => !(item as any).catalog_source || (item as any).catalog_source === supplierFilter);
      }
    }
    
    if (!term) return categoryItems;
    
    return categoryItems.filter(item => 
      normalize(item.name).includes(term) ||
      normalize(item.description || '').includes(term) ||
      normalize(item.code).includes(term)
    );
  };

  // Cross-tab search: find which other categories contain matches
  const crossTabMatches = (() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    const otherCats = (Object.keys(categoryConfig) as PriceCategory[]).filter(c => c !== activeTab);
    return otherCats
      .map(cat => {
        const matches = getByCategory(cat).filter(item =>
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term)
        );
        return matches.length > 0 ? { category: cat, count: matches.length } : null;
      })
      .filter(Boolean) as { category: PriceCategory; count: number }[];
  })();

  const CrossTabHint = () => {
    if (crossTabMatches.length === 0 || !searchTerm) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent/50 border border-accent text-sm">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">{t('pricing.foundAlsoIn')}</span>
        {crossTabMatches.map(m => (
          <Button
            key={m.category}
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setActiveTab(m.category)}
          >
            {categoryConfig[m.category]?.icon}
            {categoryConfig[m.category]?.label} ({m.count})
          </Button>
        ))}
      </div>
    );
  };

  // Check catalog when search finds nothing in current tab
  useEffect(() => {
    if (!searchTerm || activeTab === 'kits') {
      setCatalogCheckResult('none');
      return;
    }
    const term = normalize(searchTerm);
    const currentItems = getByCategory(activeTab as PriceCategory);
    const hasResults = currentItems.some(item =>
      normalize(item.name).includes(term) ||
      normalize(item.code).includes(term)
    );
    if (hasResults) {
      setCatalogCheckResult('none');
      return;
    }
    // No results — check everywhere
    setCatalogCheckResult('checking');
    checkCodeAnywhere(searchTerm).then(result => {
      if (result === 'pricing') {
        setCatalogCheckResult('found_in_pricing');
      } else if (result === 'materials') {
        setCatalogCheckResult('found');
      } else {
        setCatalogCheckResult('not_found');
      }
    });
  }, [searchTerm, activeTab, items]);

  const handleImportSingleCode = async () => {
    if (!searchTerm) return;
    setImportingCode(true);
    const success = await importSingleFromCatalog(searchTerm.trim());
    setImportingCode(false);
    if (success) {
      setCatalogCheckResult('none');
    }
  };

  const EmptyStateMessage = () => {
    if (!searchTerm) return <p>{t('pricing.noItems')}</p>;
    if (crossTabMatches.length > 0) return <p>{t('pricing.notInCategory')}</p>;
    if (catalogCheckResult === 'checking') return <p className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('pricing.checkingCatalog')}</p>;
    if (catalogCheckResult === 'found_in_pricing') return (
      <div className="space-y-2">
        <p>{t('pricing.codeExistsReloading')}</p>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {t('pricing.reloadList')}
        </Button>
      </div>
    );
    if (catalogCheckResult === 'found') return (
      <div className="space-y-2">
        <p>{t('pricing.codeInMaterials')}</p>
        <Button size="sm" onClick={handleImportSingleCode} disabled={importingCode}>
          {importingCode ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {t('pricing.importCode', { code: searchTerm.trim() })}
        </Button>
      </div>
    );
    return <p>{t('pricing.codeNotFound')}</p>;
  };

  const hasChanges = Object.keys(pendingChanges).length > 0 || Object.keys(pendingFieldChanges).length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t('pricing.title')}
            </CardTitle>
            <CardDescription>
              {t('pricing.description')}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing || isSaving}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('pricing.reload')}
            </Button>

            {isAdminBrowsing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferDialogOpen(true)}
              >
                <Send className="h-4 w-4 mr-2" />
                {t('pricing.transfer')}
              </Button>
            )}
            {hasChanges && (
              <>
                <Badge variant="secondary" className="px-2 py-1">
                  {Object.keys(pendingChanges).length + Object.keys(pendingFieldChanges).length} {t('pricing.unsavedChanges')}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleDiscardChanges}>
                   {t('pricing.cancel')}
                </Button>
                <Button size="sm" onClick={handleSaveAll} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('pricing.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('pricing.saveAll')}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pricing.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {(activeTab === 'accessories' || activeTab === 'kits') && (
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('pricing.supplier')} />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">{t('pricing.allSuppliers')}</SelectItem>
                 <SelectItem value="__none__">{t('pricing.noSupplier')}</SelectItem>
                {(activeTab === 'accessories' ? accessorySuppliers : kitSuppliers).map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) setDialogScale(0); if (open) setFormData(prev => ({ ...prev, category: activeTab === 'kits' ? 'accessories' : activeTab })); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                 {t('pricing.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className={cn("max-h-[85vh] overflow-y-auto", dialogScale === 0 ? "sm:max-w-2xl" : dialogScale === 1 ? "sm:max-w-5xl" : "sm:max-w-7xl")}>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{t('pricing.addNewItem')}</DialogTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={dialogScale === 0} onClick={() => setDialogScale(s => s - 1)}><ZoomOut className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={dialogScale === 2} onClick={() => setDialogScale(s => s + 1)}><ZoomIn className="h-4 w-4" /></Button>
                  </div>
                </div>
                <DialogDescription className="sr-only">Completează detaliile pentru noul element</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Image upload - at top */}
                <div className="space-y-2">
                   <Label>{t('pricing.photo')}</Label>
                  <div className="flex items-center gap-3">
                    {formData.imagePreview ? (
                      <ImageLightbox
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-16 h-16 rounded object-cover border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded border border-dashed border-border bg-muted/20 flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const preview = URL.createObjectURL(file);
                              setFormData(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
                            }
                          };
                          input.click();
                        }}
                      >
                        <Image className="h-3.5 w-3.5" />
                        {formData.imagePreview ? t('pricing.changePhoto') : t('pricing.addPhoto')}
                      </Button>
                      {formData.imagePreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive text-xs h-7"
                          onClick={() => {
                            if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);
                            setFormData(prev => ({ ...prev, imageFile: null, imagePreview: null }));
                          }}
                        >
                          {t('pricing.deletePhoto')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category selector */}
                <div className="space-y-2">
                  <Label>{t('pricing.category')} <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.category}
                    onValueChange={(cat) => setFormData(prev => ({ ...prev, category: cat as PriceCategory }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(categoryConfig) as PriceCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center gap-2">
                            {categoryConfig[cat]?.icon}
                            {categoryConfig[cat]?.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-3">
                  <div className="space-y-2 flex-1">
                     <Label>{t('pricing.uniqueCode')} <span className="text-destructive">*</span></Label>
                    <Input
                      required
                      placeholder="ex: 30.NEW.001"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className={!formData.code && formData.name ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-2 shrink-0">
                     <Label>{t('pricing.color')}</Label>
                    <ColorPickerPopover
                      value={formData.color_hex}
                      onChange={(hex) => setFormData(prev => ({ ...prev, color_hex: hex }))}
                      presets={formData.category === 'glass' ? GLASS_COLOR_PRESETS : undefined}
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                     <Label>{t('pricing.name')} *</Label>
                    <Input
                      placeholder="ex: Balamă nouă 90°"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                   <Label>{t('pricing.descriptionField')}</Label>
                  <Input
                     placeholder={t('pricing.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Supplier & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>{t('pricing.supplier')}</Label>
                    <Input
                       placeholder={t('pricing.supplierPlaceholder')}
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label>{t('pricing.location')}</Label>
                    <Input
                       placeholder={t('pricing.locationPlaceholder')}
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Stock & Processing price */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                     <Label>{t('pricing.initialStock')}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label>{t('pricing.minStock')}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_stock_level: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label>{t('pricing.processingPrice')}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.processing_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, processing_price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                     <Label>{t('pricing.price')} ({currencyLabel})</Label>
                    <Input
                      type="number"
                      min="0"
                      step={formData.is_multiplier ? "0.01" : "1"}
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label>{t('pricing.unit')}</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(unit) => setFormData(prev => ({ ...prev, unit }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RON/mp">{displayUnit('RON/mp')}</SelectItem>
                        <SelectItem value="RON/ml">{displayUnit('RON/ml')}</SelectItem>
                        <SelectItem value="RON/buc">{displayUnit('RON/buc')}</SelectItem>
                        <SelectItem value="RON">{displayUnit('RON')}</SelectItem>
                         <SelectItem value="x">{t('pricing.multiplierUnit')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>{t('pricing.multiplier')}</Label>
                    <div className="flex items-center h-10">
                      <Switch
                        checked={formData.is_multiplier}
                        onCheckedChange={(is_multiplier) => setFormData(prev => ({ ...prev, is_multiplier }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>{t('pricing.cancel')}</Button>
                <Button onClick={handleAddItem} disabled={isAdding}>
                  {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  {t('pricing.addToCategory', { category: categoryConfig[formData.category]?.label })}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as PriceCategory | 'kits'); setSupplierFilter('all'); }}>
          <TabsList className="grid grid-cols-6 w-full">
            {(['glass', 'processing', 'accessories'] as PriceCategory[]).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-1.5 text-xs">
                {categoryConfig[cat]?.icon}
                <span className="hidden sm:inline">{categoryConfig[cat]?.label}</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[1.5rem] justify-center">
                  {getByCategory(cat).length}
                </Badge>
              </TabsTrigger>
            ))}
            <TabsTrigger value="kits" className="flex items-center gap-1.5 text-xs">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t('pricing.kits')}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[1.5rem] justify-center">
                {kitCount}
              </Badge>
            </TabsTrigger>
            {(['labor', 'finishing'] as PriceCategory[]).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-1.5 text-xs">
                {categoryConfig[cat]?.icon}
                <span className="hidden sm:inline">{categoryConfig[cat]?.label}</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4 min-w-[1.5rem] justify-center">
                  {getByCategory(cat).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {(Object.keys(categoryConfig) as PriceCategory[]).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {categoryConfig[cat]?.description}
                </p>
                {cat === 'accessories' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={async () => {
                      setImportPreviewCount(null);
                      setImportDialogOpen(true);
                      const count = await previewCatalogImport();
                      setImportPreviewCount(count);
                    }}
                  >
                     <Download className="h-4 w-4" />
                     {t('pricing.importFromCatalog')}
                  </Button>
                )}
              </div>
              
              {cat === 'accessories' ? (
                /* Table layout for accessories - identical to MaterialsManager */
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                         <TableHead className="w-16">{t('pricing.thPhoto')}</TableHead>
                         <TableHead>{t('pricing.thCode')}</TableHead>
                         <TableHead>{t('pricing.thName')}</TableHead>
                         <TableHead className="text-right">{`${t('pricing.thPrice')} (${currencyLabel})`}</TableHead>
                         <TableHead>{t('pricing.thUnit')}</TableHead>
                         <TableHead className="text-center">{t('pricing.thActive')}</TableHead>
                         <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems(cat).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            <div className="space-y-3">
                              <EmptyStateMessage />
                              {searchTerm && <CrossTabHint />}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems(cat).map((item) => (
                          <TableRow key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-10 h-10 rounded object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setLightboxUrl(item.image_url!)}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded border border-dashed border-border bg-muted/20 flex items-center justify-center">
                                  <Image className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                              )}
                              {item.variant_colors && item.variant_colors.length > 0 && (
                                <div className="flex flex-col gap-0.5">
                                  {item.variant_colors.slice(0, 4).map((color, idx) => (
                                    <span
                                      key={idx}
                                      className="w-3 h-3 rounded-full border border-border"
                                      style={{ backgroundColor: color.hex }}
                                      title={color.name}
                                    />
                                  ))}
                                  {item.variant_colors.length > 4 && (
                                    <span className="text-[9px] text-muted-foreground">+{item.variant_colors.length - 4}</span>
                                  )}
                                </div>
                              )}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {item.code}
                              {item.own_color && (
                                <span
                                  className="w-3 h-3 rounded-full border border-border inline-block ml-1 align-middle"
                                  style={{ backgroundColor: item.own_color.hex }}
                                  title={item.own_color.name}
                                />
                              )}
                              {item.is_override && (
                                 <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 text-amber-600 border-amber-400">
                                   {t('pricing.customized')}
                                 </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{getCategoryDisplayName(item.category, item.code, item.name, t)}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                step={item.is_multiplier ? "0.01" : "1"}
                                min="0"
                                value={currency === 'EUR' && !item.is_multiplier
                                  ? parseFloat(convert(pendingChanges[item.id] !== undefined ? pendingChanges[item.id] : item.price).toFixed(2))
                                  : (pendingChanges[item.id] !== undefined ? pendingChanges[item.id] : item.price)}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const ronValue = currency === 'EUR' && !item.is_multiplier ? val * euroRate : val;
                                  handlePriceChange(item.id, ronValue);
                                }}
                                className="w-24 h-8 text-right text-sm inline-block"
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{item.category === 'labor' ? '%' : displayUnit(item.unit)}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={item.is_active}
                                onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                              />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title={t('pricing.editElement')}
                                  onClick={() => handleOpenEdit(item)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                {item.is_override && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700"
                                    title={t('pricing.resetToBase')}
                                    onClick={() => handleResetToBase(item.id)}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                /* Card layout for other categories */
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {filteredItems(cat).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-3">
                      <EmptyStateMessage />
                      {searchTerm && <CrossTabHint />}
                    </div>
                  ) : (
                    filteredItems(cat).map((item) => (
                      <PricingRow
                        key={item.id}
                        item={item}
                        onPriceChange={handlePriceChange}
                        onFieldChange={handleFieldChange}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDelete}
                        onResetToBase={handleResetToBase}
                        onEdit={handleOpenEdit}
                        pendingChanges={pendingChanges}
                        pendingFieldChanges={pendingFieldChanges}
                        isAdminBrowsing={isAdminBrowsing}
                      />
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          ))}

          <TabsContent value="kits" className="mt-4">
            <KitManager supplierFilter={supplierFilter} onSuppliersChange={setKitSuppliersList} onKitCountChange={setKitCountFromTab} />
          </TabsContent>
        </Tabs>

        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
               <DialogTitle>{t('pricing.importDialogTitle')}</DialogTitle>
               <DialogDescription className="sr-only">{t('pricing.importDialogTitle')}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {importPreviewCount === null ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('pricing.importPreviewLoading')}
                </div>
              ) : importPreviewCount === 0 ? (
                 <p className="text-muted-foreground">
                   {t('pricing.importAllDone')}
                 </p>
              ) : (
                 <p dangerouslySetInnerHTML={{ __html: t('pricing.importPreviewText', { count: importPreviewCount }) }} />
                 
              )}
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                 {t('pricing.cancel')}
              </Button>
              <Button
                onClick={async () => {
                  setIsImporting(true);
                  const count = await importFromCatalog();
                  setIsImporting(false);
                  setImportDialogOpen(false);
                   if (count > 0) {
                     toast.success(t('pricing.importSuccess', { count }));
                   } else {
                     toast.info(t('pricing.importNoneFound'));
                  }
                }}
                disabled={isImporting || importPreviewCount === 0}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('pricing.importing')}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {t('pricing.importBtn')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>{t('pricing.deleteProduct')}</AlertDialogTitle>
               <AlertDialogDescription>
                 {deleteTarget?.is_override
                   ? t('pricing.deleteConfirmOverride', { name: deleteTarget?.name })
                   : t('pricing.deleteConfirmOwn', { name: deleteTarget?.name, code: deleteTarget?.code })}
               </AlertDialogDescription>
             </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('pricing.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (deleteTarget) {
                    await handleDelete(deleteTarget.id);
                    setDeleteTarget(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteTarget?.is_override ? t('pricing.resetBtn') : t('pricing.deleteBtn')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>



        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) { setEditItem(null); setDialogScale(0); } }}>
           <DialogContent className={cn("max-h-[85vh] overflow-y-auto", dialogScale === 0 ? "sm:max-w-2xl" : dialogScale === 1 ? "sm:max-w-5xl" : "sm:max-w-7xl")}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{activeTab === 'labor' ? t('pricing.editLabor') : t('pricing.editItem')}</DialogTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={dialogScale === 0} onClick={() => setDialogScale(s => s - 1)}><ZoomOut className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={dialogScale === 2} onClick={() => setDialogScale(s => s + 1)}><ZoomIn className="h-4 w-4" /></Button>
                </div>
              </div>
              <DialogDescription className="sr-only">Modifică detaliile elementului selectat</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!isAdminBrowsing && !!editItem?.catalog_source && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent/50 border border-accent text-sm text-muted-foreground">
                  <Package className="h-4 w-4 shrink-0" />
                  {t('pricing.catalogManaged')}
                </div>
              )}
              {/* Image upload - first (hidden for labor) */}
              {activeTab !== 'labor' && (
              <div className="space-y-2">
                <Label>{t('pricing.photo')}</Label>
                <div className="flex items-center gap-3">
                  {editFormData.imagePreview ? (
                    <ImageLightbox
                      src={editFormData.imagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded object-cover border border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded border border-dashed border-border bg-muted/20 flex items-center justify-center">
                      <Image className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={!isAdminBrowsing && !!editItem?.catalog_source}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const preview = URL.createObjectURL(file);
                            setEditFormData(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
                          }
                        };
                        input.click();
                      }}
                    >
                      <Image className="h-3.5 w-3.5" />
                      {editFormData.imagePreview ? t('pricing.changePhoto') : t('pricing.addPhoto')}
                    </Button>
                    {editFormData.imageFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive text-xs h-7"
                        onClick={() => {
                          setEditFormData(prev => ({ ...prev, imageFile: null, imagePreview: editItem?.image_url || null }));
                        }}
                      >
                        {t('pricing.cancelNewPhoto')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              )}

              <div className="flex items-end gap-3">
                <div className="space-y-2 flex-1">
                  <Label>{t('pricing.uniqueCode')} <span className="text-destructive">*</span></Label>
                  <Input
                    value={editFormData.code}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, code: e.target.value }))}
                    disabled={!isAdminBrowsing && !!editItem?.catalog_source}
                  />
                </div>
                {activeTab !== 'labor' && (
                <div className="space-y-2 shrink-0">
                  <Label>{t('pricing.color')}</Label>
                  {!isAdminBrowsing && !!editItem?.catalog_source ? (
                    <div
                      className="w-9 h-9 rounded border border-border"
                      style={{ backgroundColor: editFormData.color_hex || 'transparent' }}
                      title={t('pricing.colorManagedByCatalog')}
                    />
                  ) : (
                    <ColorPickerPopover
                      value={editFormData.color_hex}
                      onChange={(hex) => setEditFormData(prev => ({ ...prev, color_hex: hex }))}
                      presets={editFormData.category === 'glass' ? GLASS_COLOR_PRESETS : undefined}
                    />
                  )}
                </div>
                )}
                <div className="space-y-2 flex-1">
                  <Label>{t('pricing.name')} *</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isAdminBrowsing && !!editItem?.catalog_source}
                  />
                </div>
              </div>

              {/* Glass thickness selector - visible for glass */}
              {editFormData.category === 'glass' && (
                <div className="space-y-2">
                  <Label>{t('pricing.glassThickness')}</Label>
                  <Select
                    value={editFormData.glass_deduction?.toString() || '0'}
                    onValueChange={(val) => setEditFormData(prev => ({ ...prev, glass_deduction: parseInt(val) }))}
                  >
                    <SelectTrigger><SelectValue placeholder={t('pricing.selectThickness')} /></SelectTrigger>
                    <SelectContent>
                      {[4, 5, 6, 8, 10, 12, 15, 19].map(mm => (
                        <SelectItem key={mm} value={mm.toString()}>{mm} mm</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!!editFormData.processing_types['laminat'] && editFormData.glass_deduction > 0 && (
                    <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                      {t('pricing.composition')} <span className="font-medium text-foreground">
                        {editFormData.glass_deduction} + {editFormData.processing_types['folie_grosime'] || 0.38} + {editFormData.glass_deduction} mm
                      </span>
                      <span className="ml-2 text-xs">
                         (total {editFormData.glass_deduction * 2 + (editFormData.processing_types['folie_grosime'] || 0.38)} mm)
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('pricing.descriptionField')}</Label>
                <Input
                  placeholder={t('pricing.descriptionPlaceholder')}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isAdminBrowsing && !!editItem?.catalog_source}
                />
              </div>

              {/* Supplier, Location, Stock - hidden for labor */}
              {activeTab !== 'labor' && (
              <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pricing.supplier')}</Label>
                  <Input
                    placeholder={t('pricing.supplierPlaceholder')}
                    value={editFormData.supplier}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    disabled={!isAdminBrowsing && !!editItem?.catalog_source}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pricing.location')}</Label>
                  <Input
                    placeholder={t('pricing.locationPlaceholder')}
                    value={editFormData.location}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('pricing.initialStock')}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={editFormData.stock_quantity}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, stock_quantity: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pricing.minStock')}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={editFormData.min_stock_level}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, min_stock_level: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pricing.processingPrice')}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.processing_price}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, processing_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              </>
              )}

              {activeTab === 'labor' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>{t('pricing.laborPercent')}</Label>
                     <p className="text-xs text-muted-foreground">{t('pricing.laborPercentDesc')}</p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="text-right"
                      />
                      <span className="text-sm font-medium text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                     <Label>{t('pricing.unit')}</Label>
                    <Select
                      value={editFormData.unit}
                      onValueChange={(unit) => setEditFormData(prev => ({ ...prev, unit }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">{t('pricing.percentOfMaterials')}</SelectItem>
                        <SelectItem value="RON/mp">{displayUnit('RON/mp')}</SelectItem>
                        <SelectItem value="RON/ml">{displayUnit('RON/ml')}</SelectItem>
                        <SelectItem value="RON/buc">{displayUnit('RON/buc')}</SelectItem>
                        <SelectItem value="RON">{displayUnit('RON')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('pricing.price')} ({currencyLabel})</Label>
                  <Input
                    type="number"
                    min="0"
                    step={editFormData.is_multiplier ? "0.01" : "1"}
                    value={editFormData.price}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pricing.unit')}</Label>
                  <Select
                    value={editFormData.unit}
                    onValueChange={(unit) => setEditFormData(prev => ({ ...prev, unit }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RON/mp">{displayUnit('RON/mp')}</SelectItem>
                      <SelectItem value="RON/ml">{displayUnit('RON/ml')}</SelectItem>
                      <SelectItem value="RON/buc">{displayUnit('RON/buc')}</SelectItem>
                      <SelectItem value="RON">{displayUnit('RON')}</SelectItem>
                      <SelectItem value="x">{t('pricing.multiplierUnit')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('pricing.multiplier')}</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      checked={editFormData.is_multiplier}
                      onCheckedChange={(is_multiplier) => setEditFormData(prev => ({ ...prev, is_multiplier }))}
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Securizat / Laminat - visible for glass */}
              {editFormData.category === 'glass' && (
                <div className="space-y-2 border-t pt-3">
                   <Label className="text-sm font-medium">{t('pricing.glassProcessingType')}</Label>
                   <p className="text-xs text-muted-foreground">{t('pricing.glassProcessingDesc')}</p>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant={editFormData.processing_types['securizat'] ? 'default' : 'outline'}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setEditFormData(prev => ({
                        ...prev,
                        processing_types: {
                          ...prev.processing_types,
                          securizat: prev.processing_types['securizat'] ? 0 : 1,
                        },
                      }))}
                    >
                      🛡️ {t('pricing.toughened')}
                    </Button>
                    <Button
                      type="button"
                      variant={editFormData.processing_types['laminat'] ? 'default' : 'outline'}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setEditFormData(prev => ({
                        ...prev,
                        processing_types: {
                          ...prev.processing_types,
                          laminat: prev.processing_types['laminat'] ? 0 : 1,
                          folie_grosime: prev.processing_types['laminat'] ? 0 : (prev.processing_types['folie_grosime'] || 0.38),
                        },
                      }))}
                    >
                      🔲 {t('pricing.laminated')}
                    </Button>
                    {!!editFormData.processing_types['laminat'] && (
                      <Select
                        value={String(editFormData.processing_types['folie_grosime'] || 0.38)}
                        onValueChange={(val) => setEditFormData(prev => ({
                          ...prev,
                          processing_types: {
                            ...prev.processing_types,
                            folie_grosime: Number(val),
                          },
                        }))}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder={t('ui.placeholderFilmThickness')} />
                        </SelectTrigger>
                        <SelectContent>
                          {[0.38, 0.76, 1.14, 1.52, 2.28].map(g => (
                            <SelectItem key={g} value={String(g)}>{g} mm folie</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              )}

              {/* Glass deduction fields - visible for accessories */}
              {editFormData.category === 'accessories' && (
                <div className="space-y-3">
                  <div className="space-y-3">
                     <Label className="text-sm font-medium">{t('pricing.glassDeductionPerSide')}</Label>
                     <p className="text-xs text-muted-foreground">{t('pricing.glassDeductionDesc')}</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { key: 'side_a', label: t('pricing.sideA') },
                         { key: 'side_b', label: t('pricing.sideB') },
                         { key: 'top', label: t('pricing.top') },
                         { key: 'bottom', label: t('pricing.bottom') },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1.5">
                          <Label className="text-xs min-w-[65px] text-muted-foreground">{label}</Label>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            step="1"
                            value={editFormData.glass_deductions[key] || 0}
                            onChange={(e) => setEditFormData(prev => ({
                              ...prev,
                              glass_deductions: {
                                ...prev.glass_deductions,
                                [key]: parseFloat(e.target.value) || 0,
                              },
                            }))}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">mm</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile height field */}
                  <div className="space-y-1 pt-2 border-t">
                    <Label className="text-xs font-medium">{t('pricing.profileHeight')}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={editFormData.glass_deductions.profile_height || 0}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          glass_deductions: {
                            ...prev.glass_deductions,
                            profile_height: parseFloat(e.target.value) || 0,
                          },
                        }))}
                        className="w-24 h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">mm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mechanism fields - always visible for accessories */}
              {editFormData.category === 'accessories' && (
                <div className="space-y-3 border-t pt-3">
                   <Label className="text-sm font-medium">{t('pricing.slidingMechanism')}</Label>
                   <p className="text-xs text-muted-foreground">{t('pricing.slidingMechanismDesc')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('pricing.doorHeightDeduction')}</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="200"
                          step="1"
                          value={editFormData.door_height_deduction}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, door_height_deduction: parseFloat(e.target.value) || 0 }))}
                          className="h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">mm</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('pricing.fixedPanelDeduction')}</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="200"
                          step="1"
                          value={editFormData.fixed_panel_height_deduction}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, fixed_panel_height_deduction: parseFloat(e.target.value) || 0 }))}
                          className="h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">mm</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t('pricing.widthOverlap')}</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="200"
                          step="1"
                          value={editFormData.width_overlap}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, width_overlap: parseFloat(e.target.value) || 0 }))}
                          className="h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tipuri de produs - visible for accessories and glass */}
              {(editFormData.category === 'accessories' || editFormData.category === 'glass') && (
                <div className="space-y-2 border-t pt-3">
                   <Label className="text-sm font-medium">{t('pricing.productTypes')}</Label>
                   <p className="text-xs text-muted-foreground">{t('pricing.productTypesDesc')}</p>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                    {PRODUCT_TYPES.map(pt => (
                      <label key={pt.value} className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <Checkbox
                          checked={editFormData.product_types.includes(pt.value)}
                          onCheckedChange={() => {
                            setEditFormData(prev => ({
                              ...prev,
                              product_types: prev.product_types.includes(pt.value)
                                ? prev.product_types.filter(v => v !== pt.value)
                                : [...prev.product_types, pt.value],
                            }));
                          }}
                          className="h-3.5 w-3.5"
                        />
                        {pt.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Prelucrare - visible for accessories */}
              {editFormData.category === 'accessories' && (
                <div className="space-y-2 border-t pt-3">
                   <Label className="text-sm font-medium">{t('pricing.processing')}</Label>
                   <p className="text-xs text-muted-foreground">{t('pricing.processingDesc')}</p>
                  <div className="grid grid-cols-3 gap-2">
                     {[
                       { value: 'gaurire', label: t('pricing.drilling') },
                       { value: 'decupaj_mare', label: t('pricing.largeCutout') },
                       { value: 'decupaj_mic', label: t('pricing.smallCutout') },
                    ].map(proc => {
                      const qty = editFormData.processing_types[proc.value] || 0;
                      const isSelected = qty > 0;
                      return (
                        <div key={proc.value} className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            className={`w-full px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setEditFormData(prev => {
                                const next = { ...prev.processing_types };
                                if (isSelected) {
                                  delete next[proc.value];
                                } else {
                                  next[proc.value] = 1;
                                }
                                return { ...prev, processing_types: next };
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
                                onClick={() => setEditFormData(prev => {
                                  const next = { ...prev.processing_types };
                                  if (qty <= 1) { delete next[proc.value]; } else { next[proc.value] = qty - 1; }
                                  return { ...prev, processing_types: next };
                                })}
                              >−</button>
                              <span className="text-sm font-medium w-6 text-center">{qty}</span>
                              <button
                                type="button"
                                className="w-6 h-6 rounded border border-border text-xs font-bold hover:bg-muted"
                                onClick={() => setEditFormData(prev => ({
                                  ...prev,
                                  processing_types: { ...prev.processing_types, [proc.value]: qty + 1 },
                                }))}
                              >+</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Inline Variants Section */}
              {editItem?.category === 'accessories' && (
                <div className="space-y-3 border-t pt-3">
                  <Label className="text-sm font-medium">{t('pricing.colorVariants')}</Label>
                  {editVariants.length > 0 && (
                    <div className="space-y-1.5">
                      {editVariants.map((v) => {
                        const displayPrice = editVariantPendingPrices[v.variant_code] !== undefined
                          ? editVariantPendingPrices[v.variant_code]
                          : (v.price ?? editFormData.price);
                        return (
                          <div key={v.id} className="flex items-center gap-2 text-sm bg-muted/30 rounded px-3 py-1.5">
                            <span className="w-4 h-4 rounded-full border border-border shrink-0" style={{ backgroundColor: v.color_hex || '#888' }} />
                            <span className="font-mono text-xs">{v.variant_code}</span>
                            <span className="text-muted-foreground">—</span>
                            <span className="flex-1">{v.variant_name}</span>
                            <Input
                              type="number" step="1" min="0"
                              value={displayPrice}
                              onChange={(e) => setEditVariantPendingPrices(prev => ({ ...prev, [v.variant_code]: parseFloat(e.target.value) || 0 }))}
                              className="w-24 h-7 text-right text-sm shrink-0"
                            />
                            <span className="text-xs text-muted-foreground w-8 shrink-0">{currencyLabel}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={async () => {
                              await supabase.from('material_variants').delete().eq('id', v.id);
                              setEditVariants(prev => prev.filter(x => x.id !== v.id));
                              toast.success(t('pricing.variantDeleted'));
                            }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {editMaterialId && editVariants.length === 0 && (
                     <p className="text-sm text-muted-foreground">{t('pricing.noVariants')}</p>
                   )}
                   {!editMaterialId && (
                     <p className="text-sm text-muted-foreground">{t('pricing.saveFirstForVariants')}</p>
                   )}
                  {editMaterialId && (
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                         <Label className="text-xs">{t('pricing.variantCode')}</Label>
                         <Input value={newVarCode} onChange={e => setNewVarCode(e.target.value)} placeholder="37.SS3H.810.11" className="h-8 text-sm" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">{t('pricing.variantColorName')}</Label>
                        <Input value={newVarName} onChange={e => setNewVarName(e.target.value)} placeholder={t('ui.placeholderColorName')} className="h-8 text-sm" />
                      </div>
                      <VariantColorPicker value={newVarColor} onChange={setNewVarColor} />
                      <Button size="sm" variant="outline" disabled={!newVarCode || !newVarName} onClick={async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) { toast.error('Not authenticated'); return; }
                        const { data: profile } = await supabase
                          .from('profiles').select('company_id').eq('user_id', user.id).maybeSingle();
                        const companyId = profile?.company_id ?? null;
                        const { data, error } = await supabase.from('material_variants')
                          .insert({ material_id: editMaterialId!, variant_code: newVarCode, variant_name: newVarName, color_hex: newVarColor || null, user_id: user.id, company_id: companyId } as any)
                          .select().single();
                        if (error) { toast.error(error.message); return; }
                        setEditVariants(prev => [...prev, { id: data.id, variant_code: data.variant_code, variant_name: data.variant_name, color_hex: data.color_hex, price: null }]);
                        setNewVarCode(''); setNewVarName(''); setNewVarColor('');
                         toast.success(t('pricing.variantAdded'));
                       }}>
                         <Plus className="h-3 w-3 mr-1" /> {t('pricing.add')}
                       </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter className="flex gap-2">
              <div className="flex-1" />
               <Button variant="outline" onClick={() => setEditItem(null)}>{t('pricing.close')}</Button>
               <Button onClick={handleSaveEdit} disabled={isEditSaving}>
                 {isEditSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                 {t('pricing.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lightbox */}
        <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
          <DialogContent className="max-w-lg p-2">
            <DialogHeader className="sr-only">
               <DialogTitle>{t('pricing.imagePreview')}</DialogTitle>
               <DialogDescription>{t('pricing.productImage')}</DialogDescription>
             </DialogHeader>
             {lightboxUrl && <img src={lightboxUrl} alt={t('pricing.productImage')} className="w-full rounded" />}
          </DialogContent>
        </Dialog>

        {/* Transfer category dialog */}
        <PricingCategoryTransferDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          category={activeTab === 'kits' ? 'kits' : activeTab}
          categoryLabel={activeTab === 'kits' ? t('pricing.kits') : (categoryConfig[activeTab as PriceCategory]?.label || activeTab)}
          itemCount={activeTab === 'kits' ? kitCount : getByCategory(activeTab as PriceCategory).length}
          suppliers={(() => {
            const categoryItems = activeTab === 'kits' ? [] : getByCategory(activeTab as PriceCategory);
            const sources = categoryItems
              .map(i => i.catalog_source)
              .filter((s): s is string => !!s);
            return [...new Set(sources)].sort();
          })()}
        />
      </CardContent>
    </Card>
  );
}
