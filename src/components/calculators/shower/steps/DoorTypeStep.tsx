import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ShowerDoorType } from '@/types/calculators';
import { DoorOpen, RotateCw, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DoorTypeStepProps {
  value: ShowerDoorType;
  onChange: (type: ShowerDoorType) => void;
}

export function DoorTypeStep({ value, onChange }: DoorTypeStepProps) {
  const { t } = useTranslation();

  const doorTypes: Array<{
    id: ShowerDoorType;
    label: string;
    description: string;
    icon: typeof DoorOpen;
    features: string[];
  }> = [
    {
      id: 'hinged', label: t('calc.hinged'), description: t('calc.hingedDesc'), icon: DoorOpen,
      features: [t('calc.hingedFeature1'), t('calc.hingedFeature2'), t('calc.hingedFeature3')],
    },
    {
      id: 'pivot', label: t('calc.pivot'), description: t('calc.pivotDesc'), icon: RotateCw,
      features: [t('calc.pivotFeature1'), t('calc.pivotFeature2'), t('calc.pivotFeature3')],
    },
    {
      id: 'sliding', label: t('calc.sliding'), description: t('calc.slidingDesc'), icon: ArrowLeftRight,
      features: [t('calc.slidingFeature1'), t('calc.slidingFeature2'), t('calc.slidingFeature3')],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {doorTypes.map((type) => {
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
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <ul className="space-y-1">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        {feature}
                      </li>
                    ))}
                  </ul>
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
