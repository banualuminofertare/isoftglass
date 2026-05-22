import { X, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useUserImportedAccessories } from '@/hooks/useUserImportedAccessories';
import { usePricingAccessories } from '@/hooks/usePricingAccessories';
import { useCatalogAccessories, type CatalogCategory } from '@/hooks/useCatalogAccessories';
import { useUserDeactivatedMaterials } from '@/hooks/useUserDeactivatedMaterials';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AccessoryPresetManagerProps {
  productType: string;
  category: CatalogCategory;
  presetCategory?: string;
  label?: string;
  selectedCode?: string;
  onSelect: (code: string) => void;
  onProductAdd?: (product: { code: string; name: string; unitPrice?: number }) => void;
  filterTags?: string[];
}

export function AccessoryPresetManager({
  productType, category, presetCategory, label, selectedCode, onSelect, onProductAdd, filterTags,
}: AccessoryPresetManagerProps) {
  const { t } = useTranslation();
  const effectivePresetCategory = (presetCategory || category) as CatalogCategory;
  const { imported, importProduct, removeImported, isImported, isLoading } = useUserImportedAccessories(productType, effectivePresetCategory);
  const { products: pricingProducts } = usePricingAccessories(category, productType);
  const { products: allPricingProducts } = usePricingAccessories(undefined, productType);
  const { products: catalogProducts } = useCatalogAccessories(category);
  const { isDeactivated } = useUserDeactivatedMaterials();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // When searching, use ALL products (no prefix filter). When not searching, use category-filtered list.
  const sourceProducts = search ? allPricingProducts : pricingProducts;

  const filtered = useMemo(() => {
    const items = sourceProducts.filter(p => {
      if (isDeactivated(p.id)) return false;
      // Tag filtering: if filterTags provided, match against catalog tags
      if (filterTags && filterTags.length > 0) {
        const catalogItem = catalogProducts.find(cp => cp.code === p.code);
        const itemTags = catalogItem?.tags;
        if (itemTags && itemTags.length > 0) {
          const hasMatch = filterTags.some(ft => itemTags.includes(ft));
          if (!hasMatch) return false;
        }
      }
      if (!search) return true;
      const q = normalize(search);
      return normalize(p.name).includes(q) || normalize(p.code).includes(q);
    });

    // When searching, prioritize code matches over name matches
    if (search) {
      const q = normalize(search);
      items.sort((a, b) => {
        const aCode = normalize(a.code).includes(q) ? 0 : 1;
        const bCode = normalize(b.code).includes(q) ? 0 : 1;
        if (aCode !== bCode) return aCode - bCode;
        return a.code.localeCompare(b.code);
      });
    }

    return items;
  }, [sourceProducts, search, filterTags, catalogProducts]);

  if (isLoading) return null;

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}

      <Popover open={catalogOpen} onOpenChange={(o) => { setCatalogOpen(o); if (!o) setSearch(''); }}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            {t('calc.importFromCatalog')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t('calc.searchByNameOrCode')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-7 text-xs"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map(product => {
              const catalogItem = catalogProducts.find(p => p.code === product.code);
              return (
                <button key={product.id} type="button"
                  onClick={() => {
                    importProduct(
                      { category: effectivePresetCategory, materialCode: product.code, materialName: product.name, unitPrice: product.price },
                      {
                        onSuccess: () => {
                          setCatalogOpen(false);
                          setSearch('');
                          toast.success(t('calc.addedAndSelected', { name: product.name }));
                        },
                        onError: (err: any) => {
                          toast.error(`Error: ${err?.message || 'Unknown'}`);
                        },
                      }
                    );
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  {(product.image_url || catalogItem?.image_url) ? (
                    <img src={product.image_url || catalogItem!.image_url!} alt={product.name} className="h-7 w-7 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-7 w-7 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="flex flex-col text-left leading-tight min-w-0">
                    <span className="truncate text-xs">{product.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{product.code}</span>
                      {product.catalog_source && (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 font-normal">{product.catalog_source}</Badge>
                      )}
                    </div>
                  </div>
                  {product.price > 0 && (
                    <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">{product.price.toFixed(2)} €</span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && !search && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">{t('calc.searchByNameOrCode')}</div>
            )}
            {filtered.length === 0 && search && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">{t('calc.noProductFound')}</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
