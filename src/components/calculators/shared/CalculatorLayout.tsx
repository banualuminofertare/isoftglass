import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CalculatorLayoutProps {
  title: string;
  subtitle?: string;
  formSection: ReactNode;
  viewerSection: ReactNode;
  summarySection?: ReactNode;
  isOfferStep?: boolean;
  className?: string;
}

export function CalculatorLayout({
  title,
  subtitle,
  formSection,
  viewerSection,
  summarySection,
  isOfferStep = false,
  className,
}: CalculatorLayoutProps) {
  return (
    <div className={cn("h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent touch-scroll", className)}>
      {/* Header */}
      <div className="shrink-0 mb-2">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0 overflow-hidden">
        {/* Form Section - Left (hidden on offer step) */}
        {!isOfferStep && (
          <div className="w-full md:w-[400px] flex-shrink-0 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent touch-scroll">
            <div className="bg-card rounded-lg border border-border p-3 sm:p-4">
              {formSection}
            </div>
          </div>
        )}

        {/* Offer step: Summary Left + Viewer Right */}
        {isOfferStep && summarySection && (
          <div className="w-full md:w-[420px] flex-shrink-0 order-1 md:order-none overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent touch-scroll">
            {summarySection}
          </div>
        )}

        {/* 3D Viewer Section - Right */}
        <div className="flex-1 min-h-[250px] sm:min-h-[300px] md:min-h-0 flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent touch-scroll order-2 md:order-none">
          <div className={cn(
            "flex-shrink-0 bg-card rounded-lg border border-border overflow-hidden",
            isOfferStep 
              ? "min-h-[300px] sm:min-h-[450px] md:h-[70vh]" 
              : "min-h-[280px] sm:min-h-[400px] md:h-[60vh]"
          )}>
            {viewerSection}
          </div>
          
          {/* Price Summary - Bottom of viewer (only when NOT offer step) */}
          {!isOfferStep && summarySection && (
            <div className="shrink-0 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent touch-scroll">
              {summarySection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
