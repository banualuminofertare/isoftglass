import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, EyeOff, Loader2, Star, X } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { useCatalogAccessories, type CatalogCategory, type CatalogProduct } from '@/hooks/useCatalogAccessories';
import { usePricingAccessories } from '@/hooks/usePricingAccessories';
import { useAccessoryPresets } from '@/hooks/useAccessoryPresets';
import { useUserImportedAccessories } from '@/hooks/useUserImportedAccessories';
import { useUserDeactivatedMaterials } from '@/hooks/useUserDeactivatedMaterials';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CatalogProductSelectorBaseProps {
  category: CatalogCategory;
  onProductAdd?: (product: { code: string; name: string; unitPrice?: number | null }) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  productType?: string;
  presetCategory?: string;
  /** When set, only products with at least one matching tag (or no tags at all) are shown */
  filterTags?: string[];
}

interface SingleSelectProps extends CatalogProductSelectorBaseProps {
  multiple?: false;
  value: string | undefined;
  onValueChange: (code: string) => void;
  values?: never;
  onAddValue?: never;
  onRemoveValue?: never;
}

interface MultiSelectProps extends CatalogProductSelectorBaseProps {
  multiple: true;
  values: string[];
  onAddValue: (code: string) => void;
  onRemoveValue: (code: string) => void;
  value?: never;
  onValueChange?: never;
}

type CatalogProductSelectorProps = SingleSelectProps | MultiSelectProps;

export function CatalogProductSelector(props: CatalogProductSelectorProps) {
  const {
    category, onProductAdd, label, placeholder, className, productType, presetCategory, multiple, filterTags,
  } = props;

  const { t } = useTranslation();
  const effectivePlaceholder = placeholder || t('calc.selectProduct');
  const effectivePresetCategory = (presetCategory || category) as CatalogCategory;
  const { products, isLoading } = useCatalogAccessories(category);
  const { products: pricingProducts } = usePricingAccessories(category, productType);
  const { products: allPricingProducts } = usePricingAccessories(undefined, productType);
  const [open, setOpen] = useState(false);
  const [deactivateProduct, setDeactivateProduct] = useState<{ id: string; name: string } | null>(null);
  const [deleteSelection, setDeleteSelection] = useState<Set<string>>(new Set());
  const [deactivateMode, setDeactivateMode] = useState(false);
  const [deactivateSet, setDeactivateSet] = useState<Set<string>>(new Set());
  const { deactivate, isDeactivated } = useUserDeactivatedMaterials();

  const presetsHook = useAccessoryPresets(productType ?? '', effectivePresetCategory);
  const importedHook = useUserImportedAccessories(productType ?? '', effectivePresetCategory);
  const canFavorite = !!productType;

  // Build image resolver: exact code -> parent code fallback
  const resolveImage = useMemo(() => {
    const imageMap = new Map<string, string>();
    for (const p of products) {
      if (p.image_url) imageMap.set(p.code, p.image_url);
    }
    for (const p of pricingProducts) {
      if (p.image_url && !imageMap.has(p.code)) imageMap.set(p.code, p.image_url);
    }
    for (const p of allPricingProducts) {
      if (p.image_url && !imageMap.has(p.code)) imageMap.set(p.code, p.image_url);
    }
    return (code: string): string | null => {
      if (imageMap.has(code)) return imageMap.get(code)!;
      // Walk up parent codes: strip last .segment
      let parent = code;
      while (parent.includes('.')) {
        parent = parent.substring(0, parent.lastIndexOf('.'));
        if (imageMap.has(parent)) return imageMap.get(parent)!;
      }
      return null;
    };
  }, [products, pricingProducts, allPricingProducts]);

  const combinedProducts = useMemo(() => {
    // Filter deactivated materials first
    const activeProducts = products.filter(p => !isDeactivated(p.id));
    const activeMaterialCodes = new Set(activeProducts.map(p => p.code));
    // Include imports only if the code isn't already in the ACTIVE list
    const importedOnly = importedHook.imported
      .filter(imp => !activeMaterialCodes.has(imp.material_code))
      .filter(imp => !isDeactivated(imp.id))
      .map(imp => ({ id: imp.id, code: imp.material_code, name: imp.material_name, image_url: resolveImage(imp.material_code), unit_price: null, processing_price: null, _isImported: true }));
    let all = [...activeProducts.map(p => ({ ...p, _isImported: false, image_url: p.image_url || resolveImage(p.code) })), ...importedOnly];
    // Filter by tags if specified
    if (filterTags && filterTags.length > 0) {
      all = all.filter(p => {
        const pTags = (p as any).tags as string[] | null;
        if (!pTags || pTags.length === 0) return true;
        return pTags.some(t => filterTags.includes(t));
      });
    }
    // Sort: favorites/imported first
    all.sort((a, b) => {
      const aFav = presetsHook.isInPresets(a.code) || importedHook.isImported(a.code) ? 0 : 1;
      const bFav = presetsHook.isInPresets(b.code) || importedHook.isImported(b.code) ? 0 : 1;
      return aFav - bFav;
    });
    return all;
  }, [products, importedHook.imported, isDeactivated, filterTags, presetsHook.isInPresets, importedHook.isImported]);

  // Single-select helpers
  const singleValue = !multiple ? props.value : undefined;
  const singleOnChange = !multiple ? props.onValueChange : undefined;
  const selected = !multiple ? combinedProducts.find(p => p.code === singleValue) : undefined;

  // Multi-select helpers
  const multiValues = multiple ? props.values : [];
  const selectedProducts = multiple
    ? multiValues.map(code => combinedProducts.find(p => p.code === code)).filter(Boolean) as typeof combinedProducts
    : [];

  const isSelected = (code: string) => multiple ? multiValues.includes(code) : singleValue === code;
  const hasAnySelection = multiple ? multiValues.length > 0 : !!selected;

  const handleDeactivate = async () => {
    if (!deactivateProduct) return;
    try {
      await deactivate(deactivateProduct.id);
      toast.success(t('calc.deactivated', { name: deactivateProduct.name }));
      const deactivatedCode = combinedProducts.find(p => p.id === deactivateProduct.id)?.code;
      if (deactivatedCode) {
        if (multiple && multiValues.includes(deactivatedCode)) {
          props.onRemoveValue(deactivatedCode);
        } else if (!multiple && singleValue === deactivatedCode) {
          singleOnChange?.('');
        }
      }
    } catch {
      toast.error(t('calc.deactivateError'));
    }
    setDeactivateProduct(null);
  };

  const bulkDeactivateProducts = combinedProducts.filter(p => deactivateSet.has(p.id));

  const handleBulkDeactivate = async () => {
    let successCount = 0;
    for (const prod of bulkDeactivateProducts) {
      try {
        await deactivate(prod.id);
        // Remove from selections if selected
        if (multiple && multiValues.includes(prod.code)) {
          props.onRemoveValue(prod.code);
        } else if (!multiple && singleValue === prod.code) {
          singleOnChange?.('');
        }
        successCount++;
      } catch { /* continue */ }
    }
    toast.success(t('calc.deactivatedCount', { count: successCount }) || `${successCount} produse dezactivate`);
    setDeactivateSet(new Set());
    setDeactivateMode(false);
    setDeactivateProduct(null);
  };

  const handleToggleFavorite = (e: React.MouseEvent, product: { code: string; name: string }) => {
    e.stopPropagation();
    if (!canFavorite) return;
    if (presetsHook.isInPresets(product.code)) {
      presetsHook.removePreset({ category: effectivePresetCategory, materialCode: product.code });
    } else {
      presetsHook.addPreset({ category: effectivePresetCategory, materialCode: product.code, materialName: product.name });
      toast.success(t('calc.addedToFavorites', { name: product.name }));
    }
  };

  const handleProductClick = (product: typeof combinedProducts[0]) => {
    if (onProductAdd) {
      onProductAdd({ code: product.code, name: product.name, unitPrice: product.unit_price });
      setOpen(false);
      return;
    }
    if (multiple) {
      if (multiValues.includes(product.code)) {
        props.onRemoveValue(product.code);
      } else {
        props.onAddValue(product.code);
      }
      setOpen(false);
    } else {
      singleOnChange?.(product.code);
      setOpen(false);
    }
  };

  const toggleDeleteSelect = (code: string) => {
    setDeleteSelection(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (!multiple) return;
    deleteSelection.forEach(code => props.onRemoveValue(code));
    setDeleteSelection(new Set());
  };

  const allSelectedCodes = multiple ? multiValues : [];
  const allChecked = multiple && allSelectedCodes.length > 0 && allSelectedCodes.every(c => deleteSelection.has(c));

  const renderSelectedCard = (prod: typeof combinedProducts[0], onRemove: () => void, showCheckbox: boolean) => (
    <div key={prod.code} className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-2">
      {showCheckbox && (
        <Checkbox
          checked={deleteSelection.has(prod.code)}
          onCheckedChange={() => toggleDeleteSelect(prod.code)}
          className="flex-shrink-0"
        />
      )}
      {prod.image_url && (
        <ImageLightbox src={prod.image_url} alt={prod.name} className="h-10 w-10 rounded object-cover flex-shrink-0" />
      )}
      <div className="flex flex-col leading-tight min-w-0 flex-1">
        <span className="text-sm font-medium truncate">{prod.name}</span>
        <span className="text-[11px] text-muted-foreground truncate">{prod.code}</span>
        {prod.unit_price != null && prod.unit_price > 0 && (
          <span className="text-[11px] text-muted-foreground">{prod.unit_price.toFixed(2)} €</span>
        )}
      </div>
      <button type="button" onClick={onRemove}
        className="flex-shrink-0 p-1 rounded-sm hover:bg-muted transition-colors" title={t('calc.clearSelection')}>
        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );

  return (
    <div className={className}>
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}

      {/* Selected product cards displayed above the selector */}
      {!multiple && selected && (
        <div className="mt-1 mb-1.5">
          {renderSelectedCard(selected, () => singleOnChange?.(''), false)}
        </div>
      )}
      {multiple && selectedProducts.length > 0 && (
        <div className="mt-1 mb-1.5 space-y-1.5">
          {selectedProducts.length >= 2 && (
            <div className="flex items-center justify-between gap-2 px-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={() => {
                    if (allChecked) {
                      setDeleteSelection(new Set());
                    } else {
                      setDeleteSelection(new Set(allSelectedCodes));
                    }
                  }}
                />
                {t('common.selectAll', 'Selectează toate')}
              </label>
              {deleteSelection.size > 0 && (
                <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={handleBulkDelete}>
                  <X className="h-3 w-3 mr-1" />
                  {t('calc.deleteSelected', 'Șterge selectate')} ({deleteSelection.size})
                </Button>
              )}
            </div>
          )}
          {selectedProducts.map(prod => renderSelectedCard(prod, () => props.onRemoveValue(prod.code), selectedProducts.length >= 2))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open}
            className={cn('w-full justify-between mt-1 h-auto min-h-10 font-normal overflow-hidden', !hasAnySelection && 'text-muted-foreground')}>
            {isLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('common.loading')}</span>
            ) : hasAnySelection ? (
              <span className="text-sm text-muted-foreground">
                {multiple
                  ? t('calc.addAnotherProduct', 'Adaugă alt produs')
                  : t('calc.changeProduct', 'Schimbă produsul')}
              </span>
            ) : (
              <span>{effectivePlaceholder}</span>
            )}
            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-72 overflow-y-auto" align="start">
          {/* Deactivate mode header */}
          <div className="flex items-center justify-between px-3 py-2 border-b sticky top-0 bg-popover z-10">
            <button type="button"
              onClick={() => { setDeactivateMode(m => !m); setDeactivateSet(new Set()); }}
              className={cn('flex items-center gap-1.5 text-xs rounded px-2 py-1 transition-colors',
                deactivateMode ? 'bg-destructive/10 text-destructive' : 'hover:bg-muted text-muted-foreground')}>
              <EyeOff className="h-3.5 w-3.5" />
              {deactivateMode ? t('calc.exitDeactivateMode', 'Ieși din mod dezactivare') : t('calc.deactivateMode', 'Mod dezactivare')}
            </button>
            {deactivateMode && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <Checkbox
                    checked={deactivateSet.size === combinedProducts.length && combinedProducts.length > 0}
                    onCheckedChange={() => {
                      if (deactivateSet.size === combinedProducts.length) {
                        setDeactivateSet(new Set());
                      } else {
                        setDeactivateSet(new Set(combinedProducts.map(p => p.id)));
                      }
                    }}
                    className="h-3.5 w-3.5"
                  />
                  {t('common.selectAll', 'Selectează toate')}
                </label>
                {deactivateSet.size > 0 && (
                  <Button variant="destructive" size="sm" className="h-6 text-xs px-2"
                    onClick={() => setDeactivateProduct({ id: '__bulk__', name: '' })}>
                    <EyeOff className="h-3 w-3 mr-1" />
                    {t('calc.deactivate')} ({deactivateSet.size})
                  </Button>
                )}
              </div>
            )}
          </div>

          {!multiple && !deactivateMode && (
            <button type="button" onClick={() => { singleOnChange?.(''); setOpen(false); }}
              className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors border-b', !singleValue && 'bg-accent')}>
              <span className="text-muted-foreground italic">{t('calc.genericNoCode')}</span>
            </button>
          )}

          {combinedProducts.map((product, idx) => {
            const isFav = canFavorite && presetsHook.isInPresets(product.code);
            const isFavOrImported = presetsHook.isInPresets(product.code) || importedHook.isImported(product.code);
            const isAlreadySelected = isSelected(product.code);
            const isInDeactivateSet = deactivateSet.has(product.id);
            const prevProduct = idx > 0 ? combinedProducts[idx - 1] : null;
            const prevIsFav = prevProduct ? (presetsHook.isInPresets(prevProduct.code) || importedHook.isImported(prevProduct.code)) : true;
            const showSeparator = !isFavOrImported && prevIsFav && idx > 0;
            return (
              <div key={product.id}>
              {showSeparator && (
                <div className="border-t px-3 py-1 text-[10px] text-muted-foreground bg-muted/30">
                  {t('calc.otherProducts', 'Alte produse')}
                </div>
              )}
              <button type="button"
                onClick={() => {
                  if (deactivateMode) {
                    setDeactivateSet(prev => {
                      const next = new Set(prev);
                      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
                      return next;
                    });
                    return;
                  }
                  handleProductClick(product);
                }}
                className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                  isAlreadySelected && !deactivateMode && 'bg-accent',
                  isFavOrImported && !deactivateMode && !isAlreadySelected && 'bg-primary/5',
                  deactivateMode && isInDeactivateSet && 'bg-destructive/10')}>
                {deactivateMode && (
                  <Checkbox checked={isInDeactivateSet} className="h-3.5 w-3.5 flex-shrink-0 pointer-events-none" />
                )}
                {product.image_url ? (
                  <ImageLightbox src={product.image_url} alt={product.name} className="h-8 w-8 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted flex-shrink-0" />
                )}
                <div className="flex flex-col text-left leading-tight min-w-0">
                  <span className="truncate">{product.name}</span>
                  <span className="text-[10px] text-muted-foreground">{product.code}</span>
                </div>
                {product.unit_price != null && product.unit_price > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0 mr-1">{product.unit_price.toFixed(2)} €</span>
                )}
                {!deactivateMode && canFavorite && (
                  <button type="button" onClick={(e) => handleToggleFavorite(e, product)}
                    className="flex-shrink-0 p-0.5 hover:scale-110 transition-transform"
                    title={isFav ? t('calc.removeFromFavorites') : t('calc.addToFavorites')}>
                    <Star className={cn('h-3.5 w-3.5', isFav ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                  </button>
                )}
                {!deactivateMode && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setDeactivateProduct({ id: product.id, name: product.name }); }}
                    className="flex-shrink-0 p-0.5 hover:scale-110 transition-transform" title={t('calc.deactivateProduct')}>
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </button>
              </div>
            );
          })}

          {!isLoading && combinedProducts.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">{t('calc.noCatalogItems')}</div>
          )}
        </PopoverContent>
      </Popover>

      <AlertDialog open={!!deactivateProduct} onOpenChange={(open) => { if (!open) { setDeactivateProduct(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('calc.deactivateProduct')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateProduct?.id === '__bulk__'
                ? (t('calc.deactivateBulkDesc', { count: deactivateSet.size }) || `Ești sigur că vrei să dezactivezi ${deactivateSet.size} produse?`)
                : t('calc.deactivateDesc', { name: deactivateProduct?.name })}
            </AlertDialogDescription>
            {deactivateProduct?.id === '__bulk__' && bulkDeactivateProducts.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto text-sm space-y-0.5">
                {bulkDeactivateProducts.map(p => (
                  <div key={p.id} className="text-muted-foreground text-xs">• {p.name} ({p.code})</div>
                ))}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={deactivateProduct?.id === '__bulk__' ? handleBulkDeactivate : handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('calc.deactivate')} {deactivateProduct?.id === '__bulk__' ? `(${deactivateSet.size})` : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
