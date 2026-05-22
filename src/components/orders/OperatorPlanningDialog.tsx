import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

const STAGE_ORDER = [
  'cutting', 'processing', 'tempering', 'coating', 'assembly', 'quality_control', 'shipping',
] as const;

type StageName = (typeof STAGE_ORDER)[number];

interface OperatorPlanningDialogProps {
  open: boolean;
  onConfirm: (operatorNames: Record<string, string>) => void;
  onSkip: () => void;
}

export function OperatorPlanningDialog({ open, onConfirm, onSkip }: OperatorPlanningDialogProps) {
  const { t } = useTranslation();
  const [names, setNames] = useState<Record<StageName, string>>(
    () => Object.fromEntries(STAGE_ORDER.map(s => [s, ''])) as Record<StageName, string>,
  );
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const filled = Object.fromEntries(
        Object.entries(names).filter(([, v]) => v.trim() !== ''),
      );
      await onConfirm(filled);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSkip();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !submitting) onSkip(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('production.planOperators')}
          </DialogTitle>
          <DialogDescription>{t('production.planOperatorsDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {STAGE_ORDER.map((stage, idx) => (
            <div key={stage} className="flex items-center gap-6">
              <Label className="w-56 text-sm shrink-0">{t(`production.stages.${stage}`)}</Label>
              <Input
                data-stage-index={idx}
                className="max-w-[220px]"
                placeholder={t('production.operatorName')}
                value={names[stage]}
                disabled={submitting}
                onChange={(e) => setNames(prev => ({ ...prev, [stage]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (idx < STAGE_ORDER.length - 1) {
                      const next = document.querySelector<HTMLInputElement>(
                        `input[data-stage-index="${idx + 1}"]`,
                      );
                      next?.focus();
                    } else {
                      handleConfirm();
                    }
                  }
                }}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleSkip} disabled={submitting}>
            {t('production.completeLater')}
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? '...' : t('production.saveAndStart')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
