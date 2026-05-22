import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ManualSheet } from './ManualSheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

export function ManualButton() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const label = t('manual.title', { defaultValue: 'Manual de utilizare' });

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              aria-label={label}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-teal-500/70 text-teal-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-600 dark:text-teal-400 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ManualSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
