import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinishVariants } from '@/hooks/useFinishVariants';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

interface FinishSelectorProps {
  label?: string;
  placeholder?: string;
  materialCode?: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function FinishSelector({
  label, placeholder, materialCode, value, onValueChange, className,
}: FinishSelectorProps) {
  const { t } = useTranslation();
  const displayLabel = label ?? t('calc.finishLabel');
  const { variants, isLoading } = useFinishVariants(materialCode);

  if (isLoading) {
    return (
      <div className={className}>
        {displayLabel && <Label className="text-xs text-muted-foreground">{displayLabel}</Label>}
        <Skeleton className="h-10 w-full mt-1" />
      </div>
    );
  }

  return (
    <div className={className}>
      {displayLabel && <Label className="text-xs text-muted-foreground">{displayLabel}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder={placeholder || t('calc.chooseFinish')} />
        </SelectTrigger>
        <SelectContent>
          {variants.map((v) => (
            <SelectItem key={v.variant_code} value={v.variant_code}>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full border border-border shrink-0" style={{ backgroundColor: v.color_hex || '#888' }} />
                <div className="flex flex-col">
                  <span className="text-sm">{v.variant_name}</span>
                  {v.variant_code.includes('.') && (
                    <span className="text-[10px] text-muted-foreground leading-tight">{v.variant_code}</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}