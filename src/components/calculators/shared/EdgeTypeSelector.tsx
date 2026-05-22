import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { EdgePolishType } from '@/types/calculators';
import { usePricingData } from '@/hooks/useDynamicPricing';

interface EdgeTypeSelectorProps {
  enabled: boolean;
  polishType: EdgePolishType;
  onEnabledChange: (enabled: boolean) => void;
  onPolishTypeChange: (type: EdgePolishType) => void;
}

export function EdgeTypeSelector({
  enabled,
  polishType,
  onEnabledChange,
  onPolishTypeChange,
}: EdgeTypeSelectorProps) {
  const { t } = useTranslation();
  const { pricing } = usePricingData();

  const mattePrice = pricing?.processing.edge_polish_matte ?? 0;
  const polishedPrice = pricing?.processing.edge_polish_polished ?? 0;
  const cncPrice = pricing?.processing.edge_polish_cnc ?? 0;

  const options: { value: EdgePolishType; label: string; price: number }[] = [
    { value: 'matte', label: t('calc.polishMatte'), price: mattePrice },
    { value: 'polished', label: t('calc.polishBrillant'), price: polishedPrice },
    { value: 'cnc', label: t('calc.polishCNC'), price: cncPrice },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">{t('calc.edgePolishing')}</Label>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {options.map((opt) => (
            <Card
              key={opt.value}
              className={cn(
                'p-3 cursor-pointer transition-all hover:border-primary/50 text-center',
                polishType === opt.value && 'border-primary bg-primary/5 ring-1 ring-primary'
              )}
              onClick={() => onPolishTypeChange(opt.value)}
            >
              <div className="font-medium text-sm text-foreground">{opt.label}</div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
