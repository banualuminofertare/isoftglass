import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { ShowerConfig } from '@/types/calculators';
import { useTranslation } from 'react-i18next';
import { GlassModelSelector } from '@/components/calculators/shared/GlassModelSelector';
import { EdgeTypeSelector } from '@/components/calculators/shared/EdgeTypeSelector';
import type { PricingItem } from '@/hooks/usePricingConfig';

interface GlassTypeStepProps {
  glass: ShowerConfig['glass'];
  onChange: (glass: Partial<ShowerConfig['glass']>) => void;
  pricingItems: PricingItem[];
  edgePolish: ShowerConfig['edgePolish'];
  onEdgePolishChange: (updates: Partial<ShowerConfig['edgePolish']>) => void;
  productType?: string;
}

export function GlassTypeStep({ glass, onChange, pricingItems, edgePolish, onEdgePolishChange, productType }: GlassTypeStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <GlassModelSelector
        items={pricingItems}
        currentThickness={glass.thickness}
        currentType={glass.type}
        allowedThicknesses={[8, 10]}
        productType={productType}
        onChange={(model) => onChange({ thickness: model.thickness as 8 | 10, type: model.type as any, isLaminated: false, colorHex: model.colorHex })}
      />

      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <Label className="text-sm font-medium">{t('calc.antiCalc')}</Label>
          <p className="text-xs text-muted-foreground mt-1">{t('calc.antiCalcDesc')}</p>
        </div>
        <Switch checked={glass.antiCalc} onCheckedChange={(antiCalc) => onChange({ antiCalc })} />
      </div>

      <EdgeTypeSelector
        enabled={edgePolish.enabled}
        polishType={edgePolish.type}
        onEnabledChange={(enabled) => onEdgePolishChange({ enabled })}
        onPolishTypeChange={(type) => onEdgePolishChange({ type })}
      />
    </div>
  );
}
