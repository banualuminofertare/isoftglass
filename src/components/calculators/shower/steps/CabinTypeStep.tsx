import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ShowerCabinType } from '@/types/calculators';
import { Square, ArrowRightToLine, Pentagon, Bath, PanelTop } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CabinTypeStepProps {
  value: ShowerCabinType;
  onChange: (type: ShowerCabinType) => void;
}

export function CabinTypeStep({ value, onChange }: CabinTypeStepProps) {
  const { t } = useTranslation();

  const cabinTypes: Array<{
    id: ShowerCabinType;
    label: string;
    description: string;
    icon: typeof Square;
  }> = [
    { id: 'corner_90', label: t('calc.corner90'), description: t('calc.corner90Desc'), icon: Square },
    { id: 'walk_in', label: t('calc.walkIn'), description: t('calc.walkInDesc'), icon: ArrowRightToLine },
    { id: 'pentagon', label: t('calc.pentagon'), description: t('calc.pentagonDesc'), icon: Pentagon },
    { id: 'bathtub', label: t('calc.bathtub'), description: t('calc.bathtubDesc'), icon: Bath },
    { id: 'fixed_panel', label: t('calc.fixedPanel'), description: t('calc.fixedPanelDesc'), icon: PanelTop },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {cabinTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.id;
          
          return (
            <Card
              key={type.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:border-primary/50",
                isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
              )}
              onClick={() => onChange(type.id)}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{type.label}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/30"
                )}>
                  {isSelected && (
                    <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
