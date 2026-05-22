import { useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { useAdminAnalytics, useAdminUserAnalytics, useAdminAllSubscribers, useAdminChurnRisk, type PerUserRow, type SubscriberRow, type ChurnRiskRow } from '@/hooks/useAdminAnalytics';
import { Loader2, Download, Users, Clock, Activity, TrendingUp, ChevronsUpDown, X, AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';
import { SubscriberInactivityCard, INACTIVITY_WARN_DAYS } from '@/components/admin/SubscriberInactivityCard';
import { ActivityTrendCard } from '@/components/admin/ActivityTrendCard';
import { ChurnRiskCard } from '@/components/admin/ChurnRiskCard';
import { CohortRetentionCard } from '@/components/admin/CohortRetentionCard';
import { TopModulesCard } from '@/components/admin/TopModulesCard';
import { OperationalModulesCard } from '@/components/admin/OperationalModulesCard';
import { SeedTestDataButton } from '@/components/admin/SeedTestDataButton';
import { PowerUsersCard } from '@/components/admin/PowerUsersCard';
import { FeatureFunnelCard } from '@/components/admin/FeatureFunnelCard';
import { ActivityHeatmapCard } from '@/components/admin/ActivityHeatmapCard';
import { AlertSettingsCard } from '@/components/admin/AlertSettingsCard';
import { UserDrilldownPanel } from '@/components/admin/UserDrilldownPanel';
import { KpiDelta } from '@/components/admin/KpiDelta';
import { LiveSubscribersCounter } from '@/components/admin/LiveSubscribersCounter';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

function presetRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

const MODULE_LABELS: Record<string, string> = {
  calculators: 'Calculatoare 3D',
  orders: 'Comenzi',
  production: 'Producție',
  inventory: 'Inventar',
  crm: 'Clienți / CRM',
  installation: 'Instalare',
  invoicing: 'Facturare',
  cutting: 'Optimizare sticlă',
  processing: 'Procesare',
  service: 'Service',
  reports: 'Rapoarte',
  settings: 'Setări',
  admin: 'Administrare',
  dashboard: 'Dashboard',
  other: 'Altele',
};

function fmtHours(h: number) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  return `${h.toFixed(1)} h`;
}

export default function AdminAnalytics() {
  const [range, setRange] = useState(() => presetRange(7));
  const [activePreset, setActivePreset] = useState<'today' | '7' | '30' | '90' | null>('7');
  const [selectedUser, setSelectedUser] = useState<PerUserRow | null>(null);
  const { data, isLoading, isFetching, dataUpdatedAt } = useAdminAnalytics(range.from, range.to);
  const queryClient = useQueryClient();
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const updatedAgo = dataUpdatedAt ? Math.max(0, Math.floor((nowTick - dataUpdatedAt) / 60000)) : null;
  const handleRefresh = () => {
    ['admin-analytics', 'admin-user-analytics', 'admin-activity-trend', 'admin-top-modules', 'admin-churn-risk', 'admin-live-users', 'admin-all-subscribers', 'admin-cohort-retention'].forEach(k =>
      queryClient.invalidateQueries({ queryKey: [k] })
    );
  };
  // previous period for KPI deltas
  const prevRange = useMemo(() => {
    const ms = range.to.getTime() - range.from.getTime();
    return { from: new Date(range.from.getTime() - ms), to: new Date(range.from.getTime()) };
  }, [range]);
  const { data: prevData } = useAdminAnalytics(prevRange.from, prevRange.to);
  
  const { data: allSubs } = useAdminAllSubscribers();
  const { data: churnRows } = useAdminChurnRisk();
  const highRiskCount = (churnRows ?? []).filter(r => r.score >= 60).length;

  const openChurnUser = (r: ChurnRiskRow) => {
    const match = (data?.per_user ?? []).find(p => p.user_id === r.user_id);
    if (match) setSelectedUser(match);
    else setSelectedUser({
      user_id: r.user_id,
      full_name: r.full_name,
      company_name: r.company_name,
      country_code: 'RO',
      role: 'sales',
      hours: 0, active_days: 0, distinct_modules: 0,
      top_module: null,
      last_active: r.last_active ?? new Date(0).toISOString(),
      engagement_score: 0,
    });
  };

  const topUsersChart = useMemo(
    () => (data?.top_users ?? []).slice(0, 15).map(u => ({
      name: u.full_name.length > 18 ? u.full_name.slice(0, 18) + '…' : u.full_name,
      hours: u.hours,
    })),
    [data]
  );

  const moduleChart = useMemo(
    () => (data?.module_usage ?? []).map(m => ({
      name: MODULE_LABELS[m.module] ?? m.module,
      hours: m.hours,
    })),
    [data]
  );

  const countryChart = data?.country_usage ?? [];

  const avgPerRole = useMemo(() => {
    const map = new Map<string, { total: number; users: number }>();
    (data?.per_user ?? []).forEach(u => {
      const cur = map.get(u.role) ?? { total: 0, users: 0 };
      cur.total += u.hours;
      cur.users += 1;
      map.set(u.role, cur);
    });
    return Array.from(map.entries()).map(([role, v]) => ({
      role,
      avg_hours: v.users ? +(v.total / v.users).toFixed(2) : 0,
    }));
  }, [data]);

  const engagementChart = useMemo(
    () => (data?.per_user ?? []).slice(0, 20).map(u => ({
      name: u.full_name.length > 16 ? u.full_name.slice(0, 16) + '…' : u.full_name,
      score: u.engagement_score,
    })),
    [data]
  );

  const exportCsv = () => {
    if (!data) return;
    const rows = data.per_user;
    const header = ['Nume', 'Companie', 'Țară', 'Rol', 'Ore', 'Zile active', 'Module folosite', 'Modul preferat', 'Engagement', 'Ultima activitate'];
    const lines = rows.map(r => [
      r.full_name, r.company_name, r.country_code, r.role,
      r.hours, r.active_days, r.distinct_modules,
      MODULE_LABELS[r.top_module ?? ''] ?? r.top_module ?? '',
      r.engagement_score,
      new Date(r.last_active).toLocaleString('ro-RO'),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + header.join(',') + '\n' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-abonati-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setPreset = (d: number) => setRange(presetRange(d));

  return (
    <AppLayout title="Analytics intern">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className={activePreset === 'today' ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600' : ''} onClick={() => {
            const from = new Date(); from.setHours(0, 0, 0, 0);
            setRange({ from, to: new Date() });
            setActivePreset('today');
          }}>Azi</Button>
          <Button size="sm" variant="outline" className={activePreset === '7' ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600' : ''} onClick={() => { setPreset(7); setActivePreset('7'); }}>7 zile</Button>
          <Button size="sm" variant="outline" className={activePreset === '30' ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600' : ''} onClick={() => { setPreset(30); setActivePreset('30'); }}>30 zile</Button>
          <Button size="sm" variant="outline" className={activePreset === '90' ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600' : ''} onClick={() => { setPreset(90); setActivePreset('90'); }}>90 zile</Button>
          <div className="ml-auto"><SeedTestDataButton /></div>
          <div className="flex items-center gap-2 ml-2">
            <Input
              type="date"
              value={range.from.toISOString().slice(0, 10)}
              onChange={e => { setRange(r => ({ ...r, from: new Date(e.target.value) })); setActivePreset(null); }}
              className="h-8 w-auto"
            />
            <span className="text-muted-foreground text-sm">→</span>
            <Input
              type="date"
              value={range.to.toISOString().slice(0, 10)}
              onChange={e => { setRange(r => ({ ...r, to: new Date(e.target.value) })); setActivePreset(null); }}
              className="h-8 w-auto"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="ml-2 min-w-[220px] justify-between">
                <span className="truncate">
                  {selectedUser ? selectedUser.full_name : `Alege abonat… (${allSubs?.length ?? 0})`}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Caută după nume sau companie…" />
                <CommandList className="max-h-[400px]">
                  <CommandEmpty>Nimic găsit</CommandEmpty>
                  <CommandGroup heading={`${allSubs?.length ?? 0} abonați`}>
                    {(allSubs ?? []).map(s => {
                      const inRange = (data?.per_user ?? []).find(p => p.user_id === s.user_id);
                      return (
                        <CommandItem
                          key={s.user_id}
                          value={`${s.full_name} ${s.company_name}`}
                          onSelect={() => {
                            if (inRange) setSelectedUser(inRange);
                            else setSelectedUser({
                              user_id: s.user_id,
                              full_name: s.full_name,
                              company_name: s.company_name,
                              country_code: s.country_code,
                              role: s.role,
                              hours: 0, active_days: 0, distinct_modules: 0,
                              top_module: null,
                              last_active: s.last_active ?? new Date(0).toISOString(),
                              engagement_score: 0,
                            });
                          }}
                        >
                          <div className="flex flex-col w-full">
                            <span className="font-medium">{s.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {s.company_name}
                              {s.last_active
                                ? ` · ${timeAgo(s.last_active)} · ${fmtHours(s.total_hours)} total`
                                : ' · fără activitate'}
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedUser && (
            <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)} className="h-8 px-2">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <div className="flex-1" />
          {updatedAgo !== null && (
            <span className="text-xs text-muted-foreground">
              {updatedAgo === 0 ? 'Actualizat acum' : `Actualizat acum ${updatedAgo} min`}
            </span>
          )}
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Reîmprospătează
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!data}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {data && (
          <>
            <LiveSubscribersCounter
              onPick={(lu) => {
                const match = (data.per_user ?? []).find(p => p.user_id === lu.user_id);
                if (match) setSelectedUser(match);
                else setSelectedUser({
                  user_id: lu.user_id,
                  full_name: lu.full_name,
                  company_name: lu.company_name,
                  country_code: lu.country_code,
                  role: lu.role,
                  hours: 0, active_days: 0, distinct_modules: 0,
                  top_module: lu.current_module, last_active: lu.last_active,
                  engagement_score: 0,
                });
              }}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard
                icon={<Users className="h-4 w-4 text-blue-500" />}
                title="Utilizatori activi"
                value={data.kpis.total_active_users}
                delta={<KpiDelta current={data.kpis.total_active_users} previous={prevData?.kpis.total_active_users ?? 0} />}
                onClick={() => scrollToId('kpi-top-users')}
              />
              <KpiCard
                icon={<Clock className="h-4 w-4 text-emerald-500" />}
                title="Ore active totale"
                value={fmtHours(data.kpis.total_hours)}
                delta={<KpiDelta current={data.kpis.total_hours} previous={prevData?.kpis.total_hours ?? 0} />}
                onClick={() => scrollToId('kpi-top-users')}
              />
              <KpiCard
                icon={<Activity className="h-4 w-4 text-violet-500" />}
                title="Medie/user/zi"
                value={fmtHours(data.kpis.avg_hours_per_user_per_day)}
                delta={<KpiDelta current={data.kpis.avg_hours_per_user_per_day} previous={prevData?.kpis.avg_hours_per_user_per_day ?? 0} />}
                onClick={() => scrollToId('kpi-engagement')}
              />
              <KpiCard
                icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
                title="Evenimente"
                value={data.kpis.total_events}
                delta={<KpiDelta current={data.kpis.total_events} previous={prevData?.kpis.total_events ?? 0} />}
                onClick={() => scrollToId('kpi-modules')}
              />
              <KpiCard
                icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                title="Inactivitate abonați"
                value={countInactive(allSubs ?? [])}
                onClick={() => scrollToId('kpi-inactivity')}
              />
              <KpiCard
                icon={<ShieldAlert className="h-4 w-4 text-rose-500" />}
                title="Risc churn ridicat"
                value={highRiskCount}
                onClick={() => scrollToId('kpi-churn-risk')}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PowerUsersCard
                from={range.from}
                to={range.to}
                onOpenUser={(pu) => {
                  const match = (data.per_user ?? []).find(p => p.user_id === pu.user_id);
                  setSelectedUser(match ?? {
                    user_id: pu.user_id, full_name: pu.full_name, company_name: pu.company_name,
                    country_code: 'RO', role: 'sales',
                    hours: pu.hours, active_days: pu.active_days, distinct_modules: pu.distinct_modules,
                    top_module: null, last_active: pu.last_active, engagement_score: pu.score,
                  });
                }}
              />
              <FeatureFunnelCard from={range.from} to={range.to} />
            </div>

            <ActivityHeatmapCard from={range.from} to={range.to} />

            <div id="kpi-inactivity">
              <SubscriberInactivityCard
                subscribers={allSubs ?? []}
                onOpenUser={(s) => {
                  const match = (data.per_user ?? []).find(p => p.user_id === s.user_id);
                  if (match) setSelectedUser(match);
                  else setSelectedUser({
                    user_id: s.user_id,
                    full_name: s.full_name,
                    company_name: s.company_name,
                    country_code: s.country_code,
                    role: s.role,
                    hours: 0, active_days: 0, distinct_modules: 0,
                    top_module: null,
                    last_active: s.last_active ?? new Date(0).toISOString(),
                    engagement_score: 0,
                  });
                }}
              />
            </div>

            <ActivityTrendCard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChurnRiskCard onOpenUser={openChurnUser} />
              <TopModulesCard from={range.from} to={range.to} />
            </div>

            <OperationalModulesCard from={range.from} to={range.to} />

            <AlertSettingsCard />

            <CohortRetentionCard />


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card id="kpi-top-users">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Top abonați activi (ore)</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ hours: { label: 'Ore', color: COLORS[0] } }} className="h-[320px] w-full">
                    <BarChart data={topUsersChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={11} />
                      <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hours" fill={COLORS[0]} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Timp mediu pe rol (ore/user)</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ avg_hours: { label: 'Ore', color: COLORS[1] } }} className="h-[320px] w-full">
                    <BarChart data={avgPerRole} margin={{ left: 4, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="role" fontSize={11} />
                      <YAxis fontSize={11} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avg_hours" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card id="kpi-modules">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Utilizare pe module</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ hours: { label: 'Ore', color: COLORS[2] } }} className="h-[320px] w-full">
                    <BarChart data={moduleChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={11} />
                      <YAxis type="category" dataKey="name" width={130} fontSize={11} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hours" radius={[0, 6, 6, 0]}>
                        {moduleChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Utilizare pe țări</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[320px] w-full">
                    <PieChart>
                      <Pie data={countryChart} dataKey="hours" nameKey="country_code" cx="50%" cy="50%" innerRadius={50} outerRadius={110} label={({ country_code, hours }) => `${country_code}: ${hours}h`}>
                        {countryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card id="kpi-engagement" className="lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Engagement score (top 20)</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ score: { label: 'Scor', color: COLORS[4] } }} className="h-[320px] w-full">
                    <BarChart data={engagementChart} margin={{ left: 4, right: 16, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" height={70} interval={0} />
                      <YAxis domain={[0, 100]} fontSize={11} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {engagementChart.map((d, i) => (
                          <Cell key={i} fill={d.score >= 70 ? '#10b981' : d.score >= 40 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Detaliu per abonat ({data.per_user.length})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nume</TableHead>
                      <TableHead>Companie</TableHead>
                      <TableHead>Țară</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right">Ore</TableHead>
                      <TableHead className="text-right">Zile</TableHead>
                      <TableHead>Modul preferat</TableHead>
                      <TableHead className="text-right">Engagement</TableHead>
                      <TableHead>Ultima activitate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.per_user.map(u => (
                      <TableRow key={u.user_id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(u)}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>{u.company_name}</TableCell>
                        <TableCell>{u.country_code}</TableCell>
                        <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                        <TableCell className="text-right">{fmtHours(u.hours)}</TableCell>
                        <TableCell className="text-right">{u.active_days}</TableCell>
                        <TableCell>{MODULE_LABELS[u.top_module ?? ''] ?? u.top_module ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={u.engagement_score >= 70 ? 'default' : u.engagement_score >= 40 ? 'secondary' : 'destructive'}>
                            {u.engagement_score}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(u.last_active).toLocaleString('ro-RO')}</TableCell>
                      </TableRow>
                    ))}
                    {data.per_user.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nu există date pentru perioada selectată</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} range={range} />
      </div>
    </AppLayout>
  );
}

function KpiCard({ icon, title, value, delta, onClick }: { icon: React.ReactNode; title: string; value: React.ReactNode; delta?: React.ReactNode; onClick?: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={onClick ? 'cursor-pointer transition-colors hover:bg-muted/40 hover:border-primary/40' : ''}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta && <div className="mt-1">{delta}</div>}
      </CardContent>
    </Card>
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function countInactive(subs: SubscriberRow[]): number {
  const now = Date.now();
  return subs.filter(s => {
    if (!s.last_active) return true;
    const days = Math.floor((now - new Date(s.last_active).getTime()) / 86400000);
    return days >= INACTIVITY_WARN_DAYS;
  }).length;
}


function UserDetailDrawer({ user, onClose, range }: { user: PerUserRow | null; onClose: () => void; range: { from: Date; to: Date } }) {
  const { data } = useAdminUserAnalytics(user?.user_id ?? null, range.from, range.to);
  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user?.full_name} <span className="text-sm text-muted-foreground font-normal">— {user?.company_name}</span></SheetTitle>
        </SheetHeader>
        {user && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><div className="text-muted-foreground">Total</div><div className="font-bold">{fmtHours(user.hours)}</div></div>
              <div><div className="text-muted-foreground">Zile active</div><div className="font-bold">{user.active_days}</div></div>
              <div><div className="text-muted-foreground">Engagement</div><div className="font-bold">{user.engagement_score}/100</div></div>
            </div>

            {data && (
              <>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Module folosite</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={{ hours: { label: 'Ore', color: COLORS[0] } }} className="h-[220px] w-full">
                      <BarChart data={data.modules.map(m => ({ name: MODULE_LABELS[m.module] ?? m.module, hours: m.hours }))} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" fontSize={10} />
                        <YAxis type="category" dataKey="name" width={120} fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="hours" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Activitate zilnică</CardTitle></CardHeader>
                  <CardContent>
                    <ChartContainer config={{ hours: { label: 'Ore', color: COLORS[1] } }} className="h-[220px] w-full">
                      <LineChart data={data.timeline} margin={{ left: 4, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="hours" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function timeAgo(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `acum ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `acum ${m}m`;
  const h = Math.floor(m / 60);
  return `acum ${h}h`;
}

