import { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScanBarcode, CheckCircle2, ChevronRight, Loader2, Play } from 'lucide-react';
import { useProductionScanner } from '@/hooks/useProductionScanner';
import { STAGE_ORDER, type ProductionStage } from '@/hooks/useProduction';
import { BarcodeLabel } from '@/components/production/BarcodeLabel';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function ProductionScanner() {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const { scannedJob, isSearching, findJobByNumber, confirmStage, clearJob, isPending } = useProductionScanner();

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-focus after confirm
  useEffect(() => {
    if (!scannedJob && !isSearching) {
      inputRef.current?.focus();
    }
  }, [scannedJob, isSearching]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      findJobByNumber(inputValue);
      setInputValue('');
    }
  };

  const handleConfirm = async () => {
    await confirmStage();
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const currentStageIndex = scannedJob ? STAGE_ORDER.indexOf(scannedJob.current_stage) : -1;
  const nextStage = scannedJob ? STAGE_ORDER[currentStageIndex + 1] : null;

  return (
    <AppLayout title={t('scanner.title')}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Scanner Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanBarcode className="h-5 w-5" />
              {t('scanner.scanBarcode')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('scanner.inputPlaceholder')}
                className="text-lg h-14 font-mono"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('scanner.inputHint')}
            </p>
          </CardContent>
        </Card>

        {/* Scanned Job Info */}
        {scannedJob && (
          <Card className="border-primary">
            <CardContent className="pt-6 space-y-4">
              {/* Job Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('scanner.productionSheet')}</p>
                  <p className="text-lg font-mono font-bold text-primary">{scannedJob.job_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('scanner.order')}</p>
                  <p className="font-medium">{scannedJob.orders?.order_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('scanner.client')}</p>
                  <p className="font-medium">{scannedJob.orders?.clients?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('scanner.currentStage')}</p>
                  <Badge variant="secondary" className="text-sm">
                    {t(`opDashboard.stages.${scannedJob.current_stage}`)}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{t('scanner.progress')}</p>
                <div className="flex items-center gap-1">
                  {STAGE_ORDER.map((stage, index) => (
                    <div key={stage} className="flex items-center flex-1">
                      <div className={cn(
                        "h-3 flex-1 rounded-full transition-colors",
                        index < currentStageIndex ? "bg-green-500" : index === currentStageIndex ? "bg-primary" : "bg-muted"
                      )} />
                      {index < STAGE_ORDER.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-2">
                {!scannedJob.started_at ? (
                  <Button
                    size="lg"
                    className="flex-1 h-16 text-lg"
                    onClick={handleConfirm}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-5 w-5 mr-2" />
                    )}
                    {t('scanner.startProduction')}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="flex-1 h-16 text-lg"
                    onClick={handleConfirm}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                    )}
                    {nextStage
                      ? t('scanner.confirmStage', { from: t(`opDashboard.stages.${scannedJob.current_stage}`), to: t(`opDashboard.stages.${nextStage}`) })
                      : t('scanner.finishProduction')
                    }
                  </Button>
                )}
                <Button variant="outline" size="lg" className="h-16" onClick={() => { clearJob(); inputRef.current?.focus(); }}>
                  {t('common.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
