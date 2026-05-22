import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type PeriodPreset = '7d' | '30d' | '90d' | '6m' | '12m' | 'custom';

export interface PeriodValue {
  preset: PeriodPreset;
  from: Date;
  to: Date;
  label: string;
}

const PRESETS: { id: PeriodPreset; label: string; shortLabel: string }[] = [
  { id: '7d', label: '7 zile', shortLabel: '7 zile' },
  { id: '30d', label: '30 zile', shortLabel: '30 zile' },
  { id: '90d', label: '90 zile', shortLabel: '90 zile' },
  { id: '6m', label: '6 luni', shortLabel: '6 luni' },
  { id: '12m', label: '12 luni', shortLabel: '12 luni' },
];

export function buildPeriod(preset: PeriodPreset, customFrom?: Date, customTo?: Date): PeriodValue {
  const to = new Date();
  let from = new Date();
  let label = '30 zile';
  switch (preset) {
    case '7d': from = new Date(Date.now() - 7 * 86400000); label = '7 zile'; break;
    case '30d': from = new Date(Date.now() - 30 * 86400000); label = '30 zile'; break;
    case '90d': from = new Date(Date.now() - 90 * 86400000); label = '90 zile'; break;
    case '6m': from = new Date(); from.setMonth(from.getMonth() - 6); label = '6 luni'; break;
    case '12m': from = new Date(); from.setMonth(from.getMonth() - 12); label = '12 luni'; break;
    case 'custom':
      if (customFrom && customTo) {
        return {
          preset, from: customFrom, to: customTo,
          label: `${format(customFrom, 'dd.MM.yyyy')} – ${format(customTo, 'dd.MM.yyyy')}`,
        };
      }
      from = new Date(Date.now() - 30 * 86400000); label = '30 zile';
      break;
  }
  return { preset, from, to, label };
}

export function PeriodSelector({ value, onChange }: { value: PeriodValue; onChange: (v: PeriodValue) => void }) {
  const [customFrom, setCustomFrom] = useState<Date | undefined>(value.preset === 'custom' ? value.from : undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(value.preset === 'custom' ? value.to : undefined);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PRESETS.map(p => (
        <Button
          key={p.id}
          size="sm"
          variant={value.preset === p.id ? 'default' : 'outline'}
          className="h-7 px-2.5 text-xs"
          onClick={() => onChange(buildPeriod(p.id))}
        >
          {p.shortLabel}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant={value.preset === 'custom' ? 'default' : 'outline'}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <CalendarIcon className="h-3 w-3" />
            {value.preset === 'custom' ? value.label : 'Personalizat'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 space-y-2" align="end">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">De la</div>
              <Calendar
                mode="single"
                selected={customFrom}
                onSelect={setCustomFrom}
                className={cn('p-2 pointer-events-auto')}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Până la</div>
              <Calendar
                mode="single"
                selected={customTo}
                onSelect={setCustomTo}
                className={cn('p-2 pointer-events-auto')}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!customFrom || !customTo || (customFrom && customTo && customFrom > customTo)}
              onClick={() => {
                if (customFrom && customTo) {
                  onChange(buildPeriod('custom', customFrom, customTo));
                  setOpen(false);
                }
              }}
            >
              Aplică
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
