import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { useInstallation } from '@/hooks/useInstallation';
import { useInstallationTeams } from '@/hooks/useInstallationTeams';
import { CheckCircle, Clock, AlertTriangle, CalendarDays, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, eachMonthOfInterval, startOfYear } from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  completed: 'hsl(142, 71%, 45%)',
  in_progress: 'hsl(217, 91%, 60%)',
  scheduled: 'hsl(47, 96%, 53%)',
  postponed: 'hsl(25, 95%, 53%)',
  cancelled: 'hsl(0, 84%, 60%)',
};

const PERIOD_DAYS: Record<string, number> = {
  '30': 30,
  '90': 90,
  '180': 180,
  '365': 365,
};

export function InstallationReports() {
  const { t, i18n } = useTranslation();
  const dateFnsLocales: Record<string, typeof ro> = { ro, en: enUS, de, it, pl };
  const currentLocale = dateFnsLocales[i18n.language] || ro;
  const { jobs } = useInstallation();
  const { teams } = useInstallationTeams();
  const [period, setPeriod] = useState('30');
  const [heatmapMonth, setHeatmapMonth] = useState(new Date());

  const allJobs = jobs || [];
  const cutoff = subDays(new Date(), PERIOD_DAYS[period] || 30);

  const filteredJobs = useMemo(
    () => allJobs.filter(j => new Date(j.scheduled_date) >= cutoff),
    [allJobs, cutoff]
  );

  // KPIs
  const totalJobs = filteredJobs.length;
  const completedJobs = filteredJobs.filter(j => j.status === 'completed').length;
  const inProgressJobs = filteredJobs.filter(j => j.status === 'in_progress').length;
  const postponedJobs = filteredJobs.filter(j => j.status === 'postponed').length;
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  // Average completion time (days between scheduled and completed)
  const avgCompletionDays = useMemo(() => {
    const completed = filteredJobs.filter(j => j.status === 'completed' && j.completed_at);
    if (completed.length === 0) return 0;
    const totalDays = completed.reduce((sum, j) => {
      const scheduled = new Date(j.scheduled_date);
      const done = new Date(j.completed_at!);
      return sum + Math.max(0, (done.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    return Math.round((totalDays / completed.length) * 10) / 10;
  }, [filteredJobs]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredJobs.forEach(j => {
      counts[j.status] = (counts[j.status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: t(`installation.status_${key}`, key),
      value,
      key,
    }));
  }, [filteredJobs, t]);

  // Jobs per team (reused for multiple charts)
  const teamData = useMemo(() => {
    const counts: Record<string, { name: string; total: number; completed: number; totalDays: number; completedCount: number }> = {};
    filteredJobs.forEach(j => {
      const teamName = j.team?.name || t('installation.reportUnassigned');
      const key = j.team_id || 'unassigned';
      if (!counts[key]) counts[key] = { name: teamName, total: 0, completed: 0, totalDays: 0, completedCount: 0 };
      counts[key].total++;
      if (j.status === 'completed') {
        counts[key].completed++;
        if (j.completed_at) {
          const days = Math.max(0, (new Date(j.completed_at).getTime() - new Date(j.scheduled_date).getTime()) / (1000 * 60 * 60 * 24));
          counts[key].totalDays += days;
          counts[key].completedCount++;
        }
      }
    });
    return Object.values(counts).sort((a, b) => b.total - a.total);
  }, [filteredJobs, t]);

  // Completion rate per team
  const completionRateData = useMemo(() => {
    return teamData.map(d => ({
      name: d.name,
      rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
    }));
  }, [teamData]);

  // Average duration per team
  const avgDurationData = useMemo(() => {
    return teamData.map(d => ({
      name: d.name,
      avgDays: d.completedCount > 0 ? Math.round((d.totalDays / d.completedCount) * 10) / 10 : 0,
    }));
  }, [teamData]);

  // Monthly trend (stacked: completed vs other)
  const monthlyTrend = useMemo(() => {
    const yearAgo = startOfYear(subMonths(new Date(), 11));
    const months = eachMonthOfInterval({ start: yearAgo, end: new Date() });
    return months.map(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthJobs = allJobs.filter(j => {
        const d = parseISO(j.scheduled_date);
        return d >= monthStart && d <= monthEnd;
      });
      return {
        month: format(monthStart, 'MMM yy', { locale: currentLocale }),
        completed: monthJobs.filter(j => j.status === 'completed').length,
        other: monthJobs.filter(j => j.status !== 'completed').length,
      };
    });
  }, [allJobs]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    const monthStart = startOfMonth(heatmapMonth);
    const monthEnd = endOfMonth(heatmapMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const counts: Record<string, number> = {};
    allJobs.forEach(j => {
      const key = j.scheduled_date;
      counts[key] = (counts[key] || 0) + 1;
    });

    // Pad start to Monday
    const firstDayOfWeek = getDay(monthStart); // 0=Sun
    const padStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const cells: { date: string; count: number; isCurrentMonth: boolean; dayNum: number }[] = [];
    for (let i = 0; i < padStart; i++) {
      cells.push({ date: '', count: 0, isCurrentMonth: false, dayNum: 0 });
    }
    days.forEach(d => {
      const key = format(d, 'yyyy-MM-dd');
      cells.push({ date: key, count: counts[key] || 0, isCurrentMonth: true, dayNum: d.getDate() });
    });

    const maxCount = Math.max(1, ...cells.map(c => c.count));
    return { cells, maxCount };
  }, [allJobs, heatmapMonth]);

  // Chart configs
  const statusChartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    statusData.forEach(d => {
      config[d.name] = { label: d.name, color: STATUS_COLORS[d.key] || 'hsl(var(--muted-foreground))' };
    });
    return config;
  }, [statusData]);

  const teamChartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    teamData.forEach((d, i) => {
      const colors = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(47, 96%, 53%)', 'hsl(25, 95%, 53%)', 'hsl(271, 91%, 65%)'];
      config[d.name] = { label: d.name, color: colors[i % colors.length] };
    });
    return config;
  }, [teamData]);

  const monthlyTrendConfig = {
    completed: { label: t('installation.reportCompleted'), color: 'hsl(142, 71%, 45%)' },
    other: { label: t('installation.reportOther'), color: 'hsl(217, 91%, 60%)' },
  };

  const completionRateConfig = {
    rate: { label: t('installation.reportCompletionRateTeam'), color: 'hsl(142, 71%, 45%)' },
  };

  const avgDurationConfig = {
    avgDays: { label: t('installation.reportAvgDurationTeam'), color: 'hsl(25, 95%, 53%)' },
  };

  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredJobs.forEach(j => {
      const city = j.city || t('installation.routeUnknownZone');
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredJobs, t]);

  const cityChartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    cityData.forEach((d, i) => {
      const colors = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(47, 96%, 53%)', 'hsl(25, 95%, 53%)', 'hsl(271, 91%, 65%)', 'hsl(0, 84%, 60%)', 'hsl(190, 90%, 50%)', 'hsl(330, 80%, 60%)'];
      config[d.name] = { label: d.name, color: colors[i % colors.length] };
    });
    return config;
  }, [cityData]);

  const getHeatmapColor = (count: number, max: number) => {
    if (count === 0) return 'hsl(var(--muted))';
    const intensity = count / max;
    if (intensity <= 0.25) return 'hsl(142, 71%, 85%)';
    if (intensity <= 0.5) return 'hsl(142, 71%, 65%)';
    if (intensity <= 0.75) return 'hsl(142, 71%, 45%)';
    return 'hsl(142, 71%, 30%)';
  };

  if (allJobs.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">{t('installation.reportNoData')}</p>
        <p className="text-sm">{t('installation.reportNoDataHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">{t('installation.reportLast30')}</SelectItem>
            <SelectItem value="90">{t('installation.reportLast90')}</SelectItem>
            <SelectItem value="180">{t('installation.reportLast180')}</SelectItem>
            <SelectItem value="365">{t('installation.reportLastYear')}</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{totalJobs} {t('installation.routeJobs')}</Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <CheckCircle className="h-4 w-4" />
              {t('installation.reportCompletionRate')}
            </div>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">{completedJobs} / {totalJobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4" />
              {t('installation.reportAvgDays')}
            </div>
            <p className="text-2xl font-bold">{avgCompletionDays}</p>
            <p className="text-xs text-muted-foreground">{t('installation.reportDaysUnit')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              {t('installation.reportInProgress')}
            </div>
            <p className="text-2xl font-bold">{inProgressJobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <AlertTriangle className="h-4 w-4" />
              {t('installation.reportPostponed')}
            </div>
            <p className="text-2xl font-bold">{postponedJobs}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1: Status pie + Monthly trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('installation.reportStatusDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[220px] w-full">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  fontSize={10}
                >
                  {statusData.map((d) => (
                    <Cell key={d.key} fill={STATUS_COLORS[d.key] || 'hsl(var(--muted-foreground))'} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly trend (replaced weekly) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('installation.reportMonthlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyTrendConfig} className="h-[220px] w-full">
              <BarChart data={monthlyTrend} margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis allowDecimals={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" stackId="a" fill="hsl(142, 71%, 45%)" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="other" stackId="a" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Jobs per team + per city */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('installation.reportByTeam')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={teamChartConfig} className="h-[220px] w-full">
              <BarChart data={teamData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="name" width={100} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={20} fill="hsl(217, 91%, 60%)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('installation.reportByCity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={cityChartConfig} className="h-[220px] w-full">
              <BarChart data={cityData} margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} angle={-25} textAnchor="end" height={45} />
                <YAxis allowDecimals={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                  {cityData.map((d, i) => {
                    const colors = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(47, 96%, 53%)', 'hsl(25, 95%, 53%)', 'hsl(271, 91%, 65%)', 'hsl(0, 84%, 60%)', 'hsl(190, 90%, 50%)', 'hsl(330, 80%, 60%)'];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 3: Completion rate per team + Average duration per team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('installation.reportCompletionRateTeam')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={completionRateConfig} className="h-[220px] w-full">
              <BarChart data={completionRateData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} fontSize={11} unit="%" />
                <YAxis type="category" dataKey="name" width={100} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={20}>
                  {completionRateData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.rate >= 75 ? 'hsl(142, 71%, 45%)' : d.rate >= 50 ? 'hsl(47, 96%, 53%)' : 'hsl(0, 84%, 60%)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('installation.reportAvgDurationTeam')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={avgDurationConfig} className="h-[220px] w-full">
              <BarChart data={avgDurationData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="name" width={100} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgDays" radius={[0, 6, 6, 0]} barSize={20} fill="hsl(25, 95%, 53%)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 4: Heatmap lunar (full width) */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('installation.reportHeatmap')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHeatmapMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center capitalize">
                {format(heatmapMonth, 'MMMM yyyy', { locale: currentLocale })}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHeatmapMonth(m => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {(() => {
                const v = t('reports.weekDaysShort', { returnObjects: true });
                const weekDays = Array.isArray(v) ? (v as string[]) : ['Lun','Mar','Mie','Joi','Vin','Sâm','Dum'];
                return weekDays.map((day, idx) => (
                  <div key={`${day}-${idx}`} className="text-center text-xs text-muted-foreground font-medium py-1">
                    {day}
                  </div>
                ));
              })()}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {heatmapData.cells.map((cell, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm flex items-center justify-center text-xs relative group"
                  style={{
                    backgroundColor: cell.isCurrentMonth ? getHeatmapColor(cell.count, heatmapData.maxCount) : 'transparent',
                  }}
                  title={cell.date ? `${cell.date}: ${cell.count} ${t('installation.routeJobs')}` : ''}
                >
                  {cell.isCurrentMonth && (
                    <>
                      <span className="text-[10px] font-medium" style={{ color: cell.count > 0 ? 'white' : 'hsl(var(--muted-foreground))' }}>
                        {cell.dayNum}
                      </span>
                      {cell.count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-foreground text-background text-[8px] rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5 font-bold">
                          {cell.count}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-muted-foreground">
              <span>{t('installation.reportHeatmapLess')}</span>
              {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getHeatmapColor(v * 4, 4) }}
                />
              ))}
              <span>{t('installation.reportHeatmapMore')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
