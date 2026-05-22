import { ChevronLeft, ChevronRight, Save, ShoppingCart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveQuote?: () => void;
  onAddToOrder?: () => void;
  onDownloadPDF?: () => void;
  canGoNext?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveQuote,
  onAddToOrder,
  onDownloadPDF,
  canGoNext = true,
  isLoading = false,
  className,
}: NavigationButtonsProps) {
  const { t } = useTranslation();
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  if (isLastStep) {
    return (
      <div className={cn("flex flex-col gap-2 pt-4 border-t border-border", className)}>
        {onDownloadPDF && (
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadPDF}
            disabled={isLoading}
            className="gap-2 w-full justify-center whitespace-normal text-xs sm:text-sm h-auto py-2 font-semibold"
          >
            <FileText className="h-4 w-4 shrink-0 text-rose-600" strokeWidth={2.75} />
            {t('calc.downloadPDF')}
          </Button>
        )}
        {onSaveQuote && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveQuote}
            disabled={isLoading}
            className="gap-2 w-full justify-center whitespace-normal text-xs sm:text-sm h-auto py-2 font-semibold"
          >
            <Save className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.75} />
            {t('calc.saveQuote')}
          </Button>
        )}
        {onAddToOrder && (
          <Button
            type="button"
            onClick={onAddToOrder}
            disabled={isLoading}
            className="gap-2 w-full justify-center whitespace-normal text-xs sm:text-sm h-auto py-2 font-semibold"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" strokeWidth={2.75} />
            {t('calc.addOrder')}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
          className="gap-2 w-full justify-center whitespace-normal text-xs sm:text-sm h-auto py-2 font-semibold"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2.75} />
          {t('calc.prevStep')}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between flex-wrap gap-2 pt-4 border-t border-border", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isLoading}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        {t('calc.prevStep')}
      </Button>

      <div className="flex flex-wrap items-center gap-2 justify-end">
        <Button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="gap-2"
        >
          {t('calc.nextStep')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}