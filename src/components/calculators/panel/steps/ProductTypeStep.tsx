import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Square, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductTypeStepProps {
  value: 'simple' | 'processed' | 'partition_wall';
  onChange: (type: 'simple' | 'processed' | 'partition_wall') => void;
}

export function ProductTypeStep({ value, onChange }: ProductTypeStepProps) {
  const { t } = useTranslation();

  const productTypes = [
    { id: 'simple' as const, label: t('calc.simplePanel'), description: t('calc.simplePanelDesc'), icon: Square },
    { id: 'partition_wall' as const, label: t('calc.partitionWall'), description: t('calc.partitionWallDesc'), icon: LayoutGrid },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('calc.selectProductType')}</p>
      {productTypes.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.id;
        return (
          <Card key={option.id} className={cn("p-4 cursor-pointer transition-all hover:border-primary/50", isSelected && "border-primary bg-primary/5 ring-1 ring-primary")} onClick={() => onChange(option.id)}>
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-lg", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{option.label}</h4>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
