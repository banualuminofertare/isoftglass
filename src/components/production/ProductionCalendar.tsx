import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths,
} from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { ProductionJob, ProductionStage } from '@/hooks/useProduction';
import { STAGE_ORDER } from '@/hooks/useProduction';

import type { Locale } from 'date-fns';

const LOCALE_MAP: Record<string, Locale> = { ro, en: enUS, de, it, pl };

const STAGE_DOT_COLORS: Record<ProductionStage, string> = {
  cutting: 'bg-blue-500',
  processing: 'bg-purple-500',
  tempering: 'bg-orange-500',
  coating: 'bg-pink-500',
  assembly: 'bg-green-500',
  quality_control: 'bg-yellow-500',
  shipping: 'bg-emerald-500',
};

interface Props {
  jobs: ProductionJob[];
  onSelectJob: (job: ProductionJob) => void;
}

export function ProductionCalendar({ jobs, onSelectJob }: Props) {
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || ro;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const jobsByDate = useMemo(() => {
    const map: Record<string, ProductionJob[]> = {};
    jobs.forEach((job) => {
      if (job.due_date) {
        const key = format(new Date(job.due_date), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(job);
      }
    });
    return map;
  }, [jobs]);

  const selectedDayJobs = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return jobsByDate[key] || [];
  }, [selectedDate, jobsByDate]);

  const weekDays = useMemo(() => {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(2024, 0, 1 + i); // Mon=1 Jan 2024
      days.push(format(d, 'EEEEEE', { locale }));
    }
    return days;
  }, [locale]);

  const getCapacityColor = (count: number) => {
    if (count === 0) return '';
    if (count <= 2) return 'bg-green-500/20';
    if (count <= 5) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getDominantStage = (dayJobs: ProductionJob[]): ProductionStage | null => {
    if (dayJobs.length === 0) return null;
    const counts: Partial<Record<ProductionStage, number>> = {};
    dayJobs.forEach((j) => {
      counts[j.current_stage] = (counts[j.current_stage] || 0) + 1;
    });
    let max = 0;
    let dominant: ProductionStage = 'cutting';
    for (const [stage, count] of Object.entries(counts)) {
      if (count! > max) { max = count!; dominant = stage as ProductionStage; }
    }
    return dominant;
  };

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'LLLL yyyy', { locale })}
        </h3>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium py-2 text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayJobs = jobsByDate[key] || [];
            const count = dayJobs.length;
            const inMonth = isSameMonth(day, currentMonth);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            const dominant = getDominantStage(dayJobs);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'relative min-h-[70px] md:min-h-[80px] p-1.5 border-b border-r text-left transition-colors hover:bg-accent/50',
                  !inMonth && 'opacity-30',
                  selected && 'ring-2 ring-primary ring-inset bg-primary/5',
                  today && !selected && 'bg-accent/30',
                  getCapacityColor(count),
                )}
              >
                <span className={cn(
                  'text-xs font-medium',
                  today && 'bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center',
                )}>
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <div className="mt-1 space-y-0.5">
                    <span className="text-[10px] font-bold block">
                      {count} {count === 1 ? 'job' : 'jobs'}
                    </span>
                    {dominant && (
                      <div className="flex items-center gap-1">
                        <span className={cn('w-1.5 h-1.5 rounded-full', STAGE_DOT_COLORS[dominant])} />
                        <span className="text-[9px] text-muted-foreground truncate">
                          {t(`opDashboard.stages.${dominant}`)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h4 className="font-medium">
                {format(selectedDate, 'EEEE, d MMMM yyyy', { locale })}
              </h4>
              <Badge variant="secondary" className="ml-auto">{selectedDayJobs.length} jobs</Badge>
            </div>

            {selectedDayJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('production.noJobsOnDay')}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('production.jobNumber')}</TableHead>
                    <TableHead>{t('production.currentStage')}</TableHead>
                    <TableHead>{t('common.client')}</TableHead>
                    <TableHead>{t('production.priority')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDayJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => onSelectJob(job)}
                    >
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {job.job_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className={cn('w-2 h-2 rounded-full', STAGE_DOT_COLORS[job.current_stage])} />
                          {t(`opDashboard.stages.${job.current_stage}`)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.client_name || job.orders?.clients?.name || t('production.unknownClient')}
                      </TableCell>
                      <TableCell>
                        {job.priority > 0 ? (
                          <Badge variant="destructive" className="text-xs">{t('production.priority')}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
