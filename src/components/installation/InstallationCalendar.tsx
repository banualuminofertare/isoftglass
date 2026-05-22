import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useInstallation, InstallationJob } from '@/hooks/useInstallation';
import { CreateInstallationDialog } from './CreateInstallationDialog';
import { InstallationJobDetails } from './InstallationJobDetails';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-emerald-500',
  postponed: 'bg-orange-500',
  cancelled: 'bg-red-500',
};

const getStatusLabel = (status: string, t: (key: string) => string) => {
  return t(`installation.status.${status}`);
};

export function InstallationCalendar() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const canSchedule = role === 'admin' || role === 'sales' || role === 'production_manager';
  const { jobs, isLoading, updateJob } = useInstallation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState<InstallationJob | null>(null);
  const [rescheduleJob, setRescheduleJob] = useState<InstallationJob | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const jobsByDate = useMemo(() => {
    const map: Record<string, InstallationJob[]> = {};
    jobs.forEach(job => {
      const key = job.scheduled_date;
      if (!map[key]) map[key] = [];
      map[key].push(job);
    });
    return map;
  }, [jobs]);

  const weekDays = t('orderPreview.weekDaysShort', { returnObjects: true }) as string[];

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    if (canSchedule) setCreateOpen(true);
  };

  const selectedDayJobs = selectedDate ? (jobsByDate[format(selectedDate, 'yyyy-MM-dd')] || []) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[180px] text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: getDateLocale() })}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {canSchedule && (
          <Button onClick={() => { setSelectedDate(new Date()); setCreateOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('installation.newJob')}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-px">
            {weekDays.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayJobs = jobsByDate[dateKey] || [];
              const inMonth = day.getMonth() === currentMonth.getMonth();
              return (
                <div
                  key={dateKey}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[80px] p-1 border border-border/30 rounded cursor-pointer transition-colors hover:bg-accent/50 ${
                    !inMonth ? 'opacity-40' : ''
                  } ${isToday(day) ? 'bg-primary/5 border-primary/30' : ''}`}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayJobs.slice(0, 3).map(job => (
                      <div key={job.id} onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }} className={`text-[10px] px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 ${statusColors[job.status]}`}>
                        {job.scheduled_time ? format(new Date(`2000-01-01T${job.scheduled_time}`), 'HH:mm') + ' ' : ''}
                        {job.order?.order_number ? `${job.order.order_number} • ` : ''}
                        {job.client_name || t('installation.installationLabel')}
                      </div>
                    ))}
                    {dayJobs.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">+{dayJobs.length - 3} {t('installation.otherJobs')}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day detail */}
      {selectedDate && selectedDayJobs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: getDateLocale() })} — {t('orderPreview.installationsCount', { count: selectedDayJobs.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDayJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50" onClick={() => setSelectedJob(job)}>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {job.order?.order_number && <span className="font-mono text-primary mr-2">{job.order.order_number}</span>}
                      {job.client_name || 'Client nespecificat'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {job.scheduled_time && format(new Date(`2000-01-01T${job.scheduled_time}`), 'HH:mm')}
                      {job.address && ` • ${job.address}`}
                      {job.city && `, ${job.city}`}
                    </div>
                    {job.team && <div className="text-xs text-muted-foreground">{t('installation.team')}: {job.team.name}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <div className={`w-2 h-2 rounded-full mr-1 ${statusColors[job.status]}`} />
                      {getStatusLabel(job.status, t)}
                    </Badge>
                    {job.status === 'scheduled' && (
                      <Button size="sm" variant="outline" onClick={() => updateJob.mutate({ id: job.id, status: 'in_progress' })}>
                        {t('installation.startJob')}
                      </Button>
                    )}
                    {job.status === 'in_progress' && (
                      <Button size="sm" onClick={() => updateJob.mutate({ id: job.id, status: 'completed', completed_at: new Date().toISOString() })}>
                        {t('installation.finishJob')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateInstallationDialog 
        open={createOpen} 
        onOpenChange={(open) => { setCreateOpen(open); if (!open) setRescheduleJob(null); }}
        defaultDate={selectedDate || undefined}
        rescheduleJob={rescheduleJob}
      />

      <InstallationJobDetails
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => { if (!open) setSelectedJob(null); }}
        onPostpone={(job) => {
          setRescheduleJob(job);
          setCreateOpen(true);
        }}
      />
    </div>
  );
}
