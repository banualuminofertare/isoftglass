import { TrendingUp, Package, Wrench, Users, CirclePlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQuoteSettings } from '@/hooks/useTVA';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { PriceBreakdown, ProductType } from '@/types/calculators';

interface PriceSummaryProps {
  price: PriceBreakdown;
  showDetails?: boolean;
  className?: string;
  markupPercent?: number;
  customAmount?: number;
  customAmountNote?: string;
  onCustomAmountChange?: (value: number) => void;
  onCustomAmountNoteChange?: (value: string) => void;
}

export function PriceSummary({
  price,
  showDetails = true,
  className,
  markupPercent = 0,
  customAmount = 0,
  customAmountNote = '',
  onCustomAmountChange,
  onCustomAmountNoteChange,
}: PriceSummaryProps) {
  const { t } = useTranslation();
  const { tvaPercent: TVA_PERCENT } = useQuoteSettings();
  const { formatPrice, convert, currency, euroRate, currencyLabel } = useCurrency();
  
  const totalWithCustom = price.total + customAmount;
  const markupAmount = markupPercent !== 0 ? totalWithCustom * (markupPercent / 100) : 0;
  const finalTotal = totalWithCustom + markupAmount;
  const tvaAmount = finalTotal * (TVA_PERCENT / 100);
  const totalWithTVA = finalTotal + tvaAmount;

  return (
    <Card className={cn("bg-card", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col items-stretch gap-3">
          {onCustomAmountChange && (
            <div className="flex items-end gap-2 flex-wrap w-full">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <CirclePlus className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium">{currencyLabel}</span>
                </div>
                <Input
                  type="number"
                  value={currency === 'EUR' && euroRate > 0
                    ? (customAmount > 0 ? parseFloat(convert(customAmount).toFixed(2)) : '')
                    : (customAmount || '')}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const ronVal = currency === 'EUR' && euroRate > 0 ? val * euroRate : val;
                    onCustomAmountChange(ronVal);
                  }}
                  placeholder={t('calc.extraAmountPlaceholder')}
                  className="w-32 h-8 text-sm font-semibold"
                  min={0}
                />
              </div>
              {onCustomAmountNoteChange && (
                <Input
                  type="text"
                  value={customAmountNote}
                  onChange={(e) => onCustomAmountNoteChange(e.target.value)}
                  placeholder={t('calc.notePlaceholder')}
                  className="flex-1 min-w-[180px] h-8 text-sm font-semibold"
                />
              )}
            </div>
          )}

          {markupPercent !== 0 && (
            <div className="text-left">
              <div className="text-xs text-muted-foreground">{t('calc.basePrice')}</div>
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(totalWithCustom)}
              </div>
              <div className="text-xs text-primary font-medium">
                {markupPercent > 0 ? '+' : ''}{markupPercent}% {t('calc.markup')}
              </div>
            </div>
          )}
          <div className="text-left">
            <div className="text-xs text-muted-foreground">{t('calc.subtotalNoVAT')}</div>
            <div className="text-sm text-muted-foreground">
              {formatPrice(finalTotal)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              TVA {TVA_PERCENT}%: {formatPrice(tvaAmount)}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(totalWithTVA)}
              </span>
              <span className="text-xs text-muted-foreground">{t('calc.withVAT')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}