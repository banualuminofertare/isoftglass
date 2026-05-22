import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { useCatalogAccessories, type CatalogCategory } from '@/hooks/useCatalogAccessories';
import { usePricingAccessories } from '@/hooks/usePricingAccessories';

import { DimensionInput } from './DimensionInput';

interface SelectedProductCardProps {
  materialCode: string;
  category: CatalogCategory;
  name?: string;
  onRemove: () => void;
  length?: number;
  onLengthChange?: (length: number) => void;
}

export function SelectedProductCard({ materialCode, category, name, onRemove, length, onLengthChange }: SelectedProductCardProps) {
  const { t } = useTranslation();
  const { products } = useCatalogAccessories(category);
  const { products: pricingProducts } = usePricingAccessories(category);
  const { products: allPricingProducts } = usePricingAccessories(undefined);
  const product = products.find(p => p.code === materialCode);
  const pricingProduct = pricingProducts.find(p => p.code === materialCode);

  // Resolve image with parent-code fallback
  const resolveImage = (code: string): string | null => {
    const allProducts = [...products, ...pricingProducts, ...allPricingProducts];
    const byCode = allProducts.find(p => p.code === code);
    if (byCode?.image_url) return byCode.image_url;
    let parent = code;
    while (parent.includes('.')) {
      parent = parent.substring(0, parent.lastIndexOf('.'));
      const match = allProducts.find(p => p.code === parent);
      if (match?.image_url) return match.image_url;
    }
    return null;
  };

  const imageUrl = product?.image_url || pricingProduct?.image_url || resolveImage(materialCode);
  const displayName = name || product?.name || pricingProduct?.name || materialCode;

  return (
    <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-lg text-sm">
      <div className="flex items-center gap-2">
        {imageUrl && (
          <ImageLightbox src={imageUrl} alt={displayName} className="h-7 w-7 rounded object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <span className="font-medium truncate block">{displayName}</span>
          <span className="text-[10px] text-muted-foreground">{materialCode}</span>
        </div>
        {length != null && !onLengthChange && (
          <span className="text-xs font-semibold text-primary">{length} mm</span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded-sm hover:bg-destructive/10 transition-colors"
          title={t('settings.variants.removeSelection')}
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
      {length != null && onLengthChange && (
        <DimensionInput
          label="Lungime (mm)"
          value={length}
          onChange={onLengthChange}
          min={100}
          max={3000}
          step={1}
          className="mt-1"
        />
      )}
    </div>
  );
}
