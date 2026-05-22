import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExtraAccessoryAdder } from './ExtraAccessoryAdder';
import { KitSelector, type SelectedKit } from './KitSelector';

interface ExtraAccessory {
  materialCode: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  unit?: string;
}

const UNIT_LABELS: Record<string, string> = {
  pcs: 'buc', lm: 'ml', sqm: 'm²', kg: 'kg', l: 'l',
};

function getUnitLabel(unit?: string): string {
  return UNIT_LABELS[unit ?? 'pcs'] ?? 'buc';
}

function isPieceUnit(unit?: string): boolean {
  return !unit || unit === 'pcs';
}

interface ExtraAccessoriesSectionProps {
  extraAccessories: ExtraAccessory[];
  onAdd: (item: { materialCode: string; name: string; unitPrice?: number; unit?: string }) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<ExtraAccessory>) => void;
  productType?: string;
  selectedKit?: SelectedKit | null;
  onSelectKit?: (kit: SelectedKit) => void;
  onRemoveKit?: () => void;
}

export function ExtraAccessoriesSection({
  extraAccessories, onAdd, onRemove, onUpdate,
  productType, selectedKit, onSelectKit, onRemoveKit,
}: ExtraAccessoriesSectionProps) {
  const { t } = useTranslation();
  const showKit = productType && onSelectKit && onRemoveKit;

  return (
    <Card className="p-4">
      <Label className="text-sm font-medium mb-3 block">{t('calc.extraAccessories')} & Kit</Label>
      <p className="text-xs text-muted-foreground mb-3">{t('calc.extraAccessoriesDesc')}</p>

      {extraAccessories.length > 0 && (
        <div className="space-y-2 mb-3">
          {extraAccessories.map((acc, index) => {
            const piece = isPieceUnit(acc.unit);
            return (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate block">{acc.name}</span>
                  <span className="text-[10px] text-muted-foreground">{acc.materialCode}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Input
                    type="number"
                    value={acc.quantity}
                    onChange={(e) => {
                      const val = piece
                        ? Math.max(1, parseInt(e.target.value) || 1)
                        : Math.max(0.01, parseFloat(e.target.value) || 0.01);
                      onUpdate(index, { quantity: val });
                    }}
                    className="w-16 h-7 text-center text-xs"
                    min={piece ? 1 : 0.01}
                    step={piece ? 1 : 0.01}
                  />
                  <span className="text-xs text-muted-foreground">{getUnitLabel(acc.unit)}</span>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive flex-shrink-0"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {showKit && (
        <div className="mb-3">
          <KitSelector
            productType={productType!}
            selectedKit={selectedKit ?? null}
            onSelectKit={onSelectKit!}
            onRemoveKit={onRemoveKit!}
          />
        </div>
      )}

      <ExtraAccessoryAdder onAdd={onAdd} />
    </Card>
  );
}