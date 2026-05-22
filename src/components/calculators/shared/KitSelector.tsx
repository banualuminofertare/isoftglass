import { ImageLightbox } from '@/components/ui/image-lightbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getColorLabel } from '@/lib/colorPresets';
import { useAccessoryKits } from '@/hooks/useAccessoryKits';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface SelectedKit {
  kitId: string;
  name: string;
  code: string;
  price: number;
  imageUrl?: string | null;
  model?: string | null;
  color?: string | null;
  processing_types?: Record<string, number>;
  glass_deductions?: { side_a?: number; side_b?: number; top?: number; bottom?: number };
  door_height_deduction?: number;
  fixed_panel_height_deduction?: number;
  width_overlap?: number;
}

interface KitSelectorProps {
  productType: string;
  selectedKit: SelectedKit | null;
  onSelectKit: (kit: SelectedKit) => void;
  onRemoveKit: () => void;
}

export function KitSelector({ productType, selectedKit, onSelectKit, onRemoveKit }: KitSelectorProps) {
  const { t } = useTranslation();
  const { getKitsForProduct, kits, isLoading } = useAccessoryKits();
  const { formatPrice } = useCurrency();
  const availableKits = getKitsForProduct(productType);
  if (isLoading) return null;
  if (availableKits.length === 0 && !selectedKit) return null;

  return (
    <div>
      <Label className="text-sm font-medium flex items-center gap-2">
        <Package className="h-4 w-4" />
        Kit
      </Label>
      <p className="text-xs text-muted-foreground mt-1 mb-3">
        {t('calc.selectProduct')}
      </p>

      {selectedKit ? (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
          {selectedKit.imageUrl && (
            <ImageLightbox src={selectedKit.imageUrl} alt={selectedKit.name} className="w-14 h-14 rounded-md object-cover border border-border shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium block">{selectedKit.name}</span>
            {selectedKit.model && <span className="text-xs text-muted-foreground block">Model: {selectedKit.model}</span>}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground font-mono">{selectedKit.code}</span>
              {selectedKit.color && (
                <>
                  <span className="w-3 h-3 rounded-full border border-border shrink-0" style={{ backgroundColor: selectedKit.color }} />
                  <span className="text-xs text-muted-foreground">{getColorLabel(selectedKit.color)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-sm">{formatPrice(selectedKit.price)}</Badge>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onRemoveKit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Select
          value=""
          onValueChange={(kitId) => {
            const kit = availableKits.find(k => k.id === kitId);
            if (kit) {
              onSelectKit({ kitId: kit.id, name: kit.name, code: kit.code, price: kit.price, imageUrl: kit.image_url, model: kit.model, color: kit.color, processing_types: kit.processing_types as Record<string, number>, glass_deductions: kit.glass_deductions as { side_a?: number; side_b?: number; top?: number; bottom?: number }, door_height_deduction: kit.door_height_deduction, fixed_panel_height_deduction: kit.fixed_panel_height_deduction, width_overlap: kit.width_overlap });
            }
          }}
        >
          <SelectTrigger><SelectValue placeholder={t('calc.selectProduct')} /></SelectTrigger>
          <SelectContent>
            {availableKits.map(kit => (
              <SelectItem key={kit.id} value={kit.id}>
                <div className="flex items-center gap-2">
                  {kit.image_url && <img src={kit.image_url} alt={kit.name} className="w-8 h-8 rounded object-cover shrink-0" />}
                  <div className="flex flex-col">
                    <span className="text-sm">{kit.name}</span>
                    {kit.model && <span className="text-[10px] text-muted-foreground">{kit.model}</span>}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-mono">{kit.code}</span>
                      {kit.color && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full border border-border shrink-0" style={{ backgroundColor: kit.color }} />
                          <span className="text-[10px] text-muted-foreground">{getColorLabel(kit.color)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">({kit.price.toFixed(2)} €)</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}