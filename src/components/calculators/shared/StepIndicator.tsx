import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { CalculatorStep } from '@/types/calculators';

interface StepIndicatorProps {
  steps: CalculatorStep[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("mb-6", className)}>
      <div className="text-sm text-muted-foreground mb-3">
        {t('calc.stepOf', { current: currentStep, total: steps.length })}
      </div>
      
      <div className="flex items-center gap-1 justify-between w-full overflow-hidden">
        {steps.map((step, index) => {
          const isCompleted = step.isCompleted;
          const isActive = step.id === currentStep;
          const canClick = isCompleted || step.id <= currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => canClick && onStepClick?.(step.id)}
                disabled={!canClick}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all shrink-0",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && !isCompleted && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground",
                  canClick && "cursor-pointer hover:opacity-80",
                  !canClick && "cursor-not-allowed opacity-50"
                )}
                title={step.title}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.id
                )}
              </button>
              
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-4 h-0.5 mx-0.5",
                    index < currentStep - 1 ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
