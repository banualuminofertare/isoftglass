import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, TrendingUp, Users, Package, Euro, Download,
   ArrowUpRight, ArrowDownRight, Minus, Calendar, AlertTriangle, CheckCircle, Clock, Wrench, UserCheck
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useOrders } from '@/hooks/useOrders';
import { useClients } from '@/hooks/useClients';
import { useMaterials } from '@/hooks/useMaterials';
import { useProductionJobs, useProductionPerformance, useOperatorPerformance, STAGE_LABELS, STAGE_ORDER, type ProductionStage } from '@/hooks/useProduction';
import { useServiceTickets } from '@/hooks/useServiceTickets';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, endOfMonth, endOfWeek } from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

type TimePeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

const PERIOD_DAYS: Record<TimePeriod, { days: number; groupBy: 'day' | 'week' | 'month' }> = {
  monthly: { days: 30, groupBy: 'day' },
  quarterly: { days: 90, groupBy: 'week' },
  semiannual: { days: 180, groupBy: 'month' },
  annual: { days: 365, groupBy: 'month' },
};

export default function Reports() {
  const { t, i18n } = useTranslation();
  const dateFnsLocales: Record<string, typeof ro> = { ro, en: enUS, de, it, pl };
  const currentLocale = dateFnsLocales[i18n.language] || ro;
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [activeTab, setActiveTab] = useState('revenue');
  const [detailDialog, setDetailDialog] = useState<{ type: string; title: string } | null>(null);
  const { orders } = useOrders();
  const { clients } = useClients();
  const { materials, lowStockMaterials } = useMaterials();
  const { jobs, jobsByStage } = useProductionJobs();
  const periodConfig = PERIOD_DAYS[period];
  const { avgTimePerStage, bottleneckStage, completedJobsCount, activeJobsCount, avgTotalDays, completionTrend } = useProductionPerformance(periodConfig.days);
  const { tickets } = useServiceTickets();
  const { operatorStats } = useOperatorPerformance(periodConfig.days);
  const { convert, currencyLabel, formatPrice } = useCurrency();

  const getPeriodLabel = () => {
    switch (period) {
      case 'monthly': return t('reports.last30days');
      case 'quarterly': return t('reports.last90days');
      case 'semiannual': return t('reports.last6months');
      case 'annual': return t('reports.lastYear');
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const periodStart = subDays(now, periodConfig.days);
    const previousPeriodStart = subDays(periodStart, periodConfig.days);

    const recentOrders = orders.filter(o => new Date(o.created_at) >= periodStart);
    const previousOrders = orders.filter(o => {
      const date = new Date(o.created_at);
      return date >= previousPeriodStart && date < periodStart;
    });

    const recentRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueChange = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const confirmedOrders = recentOrders.filter(o => o.status !== 'quote' && o.status !== 'cancelled');
    const conversionRate = recentOrders.length > 0 
      ? (confirmedOrders.length / recentOrders.length) * 100 
      : 0;

    return {
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      recentRevenue,
      revenueChange,
      totalOrders: orders.length,
      recentOrders: recentOrders.length,
      conversionRate,
      activeClients: clients.filter(c => c.is_active).length,
      activeJobs: jobs.length,
    };
  }, [orders, clients, jobs, periodConfig.days]);

  const ordersByStatus = useMemo(() => {
    const now = new Date();
    const periodStart = subDays(now, periodConfig.days);
    const filteredOrders = orders.filter(o => new Date(o.created_at) >= periodStart);
    
    const statusKeys: Record<string, string> = {
      quote: 'reports.statusQuote',
      confirmed: 'reports.statusConfirmed',
      in_production: 'reports.statusInProduction',
      completed: 'reports.statusCompleted',
      delivered: 'reports.statusDelivered',
      cancelled: 'reports.statusCancelled',
    };
    
    const statusCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const label = t(statusKeys[o.status] || o.status);
      statusCounts[label] = (statusCounts[label] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [orders, periodConfig.days, t]);

  const revenueByPeriod = useMemo(() => {
    const now = new Date();
    const periodStart = subDays(now, periodConfig.days);

    if (periodConfig.groupBy === 'day') {
      const days = eachDayOfInterval({ start: periodStart, end: now });
      return days.map(day => {
        const dayOrders = orders.filter(o => format(new Date(o.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
        return { date: format(day, 'dd MMM', { locale: currentLocale }), revenue: dayOrders.reduce((sum, o) => sum + o.total, 0), orders: dayOrders.length };
      });
    } else if (periodConfig.groupBy === 'week') {
      const weeks = eachWeekOfInterval({ start: periodStart, end: now }, { weekStartsOn: 1 });
      return weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekOrders = orders.filter(o => { const d = new Date(o.created_at); return d >= weekStart && d <= weekEnd; });
        return { date: format(weekStart, 'dd MMM', { locale: currentLocale }), revenue: weekOrders.reduce((sum, o) => sum + o.total, 0), orders: weekOrders.length };
      });
    } else {
      const months = eachMonthOfInterval({ start: periodStart, end: now });
      return months.map(monthStart => {
        const monthEnd = endOfMonth(monthStart);
        const monthOrders = orders.filter(o => { const d = new Date(o.created_at); return d >= monthStart && d <= monthEnd; });
        return { date: format(monthStart, 'MMM yyyy', { locale: currentLocale }), revenue: monthOrders.reduce((sum, o) => sum + o.total, 0), orders: monthOrders.length };
      });
    }
  }, [orders, periodConfig]);

  const translatedStageLabels: Record<ProductionStage, string> = useMemo(() => ({
    cutting: t('opDashboard.stages.cutting'),
    processing: t('opDashboard.stages.processing'),
    tempering: t('opDashboard.stages.tempering'),
    coating: t('opDashboard.stages.coating'),
    assembly: t('opDashboard.stages.assembly'),
    quality_control: t('opDashboard.stages.quality_control'),
    shipping: t('opDashboard.stages.shipping'),
  }), [t]);

  const productionByStage = useMemo(() => {
    return Object.entries(jobsByStage).map(([stage, stageJobs]) => ({
      name: translatedStageLabels[stage as ProductionStage] || STAGE_LABELS[stage as ProductionStage],
      value: stageJobs.length,
    }));
  }, [jobsByStage, translatedStageLabels]);

  const clientsByType = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    clients.forEach(c => {
      const label = c.client_type === 'person' ? t('reports.clientPerson')
        : c.client_type === 'company' ? t('reports.clientCompany')
        : t('reports.clientDistributor');
      typeCounts[label] = (typeCounts[label] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [clients, t]);

  const lowStockData = useMemo(() => {
    return lowStockMaterials.slice(0, 5).map(m => ({
      name: m.name,
      current: m.stock_quantity || 0,
      minimum: m.min_stock_level || 0,
    }));
  }, [lowStockMaterials]);

  const qualityStats = useMemo(() => {
    const now = new Date();
    const periodStart = subDays(now, periodConfig.days);
    const filtered = tickets.filter(t => new Date(t.created_at) >= periodStart);
    
    const total = filtered.length;
    const resolved = filtered.filter(t => t.status === 'rezolvat' || t.status === 'inchis').length;
    const resolveRate = total > 0 ? (resolved / total) * 100 : 0;
    const critical = filtered.filter(t => t.priority === 'critica').length;

    const typeKeys: Record<string, string> = {
      defect_productie: 'reports.defectProduction',
      defect_montaj: 'reports.defectAssembly',
      deteriorare_transport: 'reports.transportDamage',
      reclamatie_client: 'reports.clientComplaint',
    };
    const byType = Object.entries(
      filtered.reduce((acc, tk) => {
        const label = typeKeys[tk.ticket_type] ? t(typeKeys[tk.ticket_type]) : tk.ticket_type;
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const priorityKeys: Record<string, string> = {
      scazuta: 'reports.priorityLow',
      medie: 'reports.priorityMedium',
      urgenta: 'reports.priorityUrgent',
      critica: 'reports.priorityCritical',
    };
    const byPriority = Object.entries(
      filtered.reduce((acc, tk) => {
        const label = priorityKeys[tk.priority] ? t(priorityKeys[tk.priority]) : tk.priority;
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const trend = (() => {
      if (periodConfig.groupBy === 'day') {
        const days = eachDayOfInterval({ start: periodStart, end: now });
        return days.map(day => {
          const count = filtered.filter(tk => format(new Date(tk.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length;
          return { date: format(day, 'dd MMM', { locale: currentLocale }), reclamatii: count };
        });
      } else if (periodConfig.groupBy === 'week') {
        const weeks = eachWeekOfInterval({ start: periodStart, end: now }, { weekStartsOn: 1 });
        return weeks.map(weekStart => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          const count = filtered.filter(tk => { const d = new Date(tk.created_at); return d >= weekStart && d <= weekEnd; }).length;
          return { date: format(weekStart, 'dd MMM', { locale: currentLocale }), reclamatii: count };
        });
      } else {
        const months = eachMonthOfInterval({ start: periodStart, end: now });
        return months.map(monthStart => {
          const monthEnd = endOfMonth(monthStart);
          const count = filtered.filter(tk => { const d = new Date(tk.created_at); return d >= monthStart && d <= monthEnd; }).length;
          return { date: format(monthStart, 'MMM yyyy', { locale: currentLocale }), reclamatii: count };
        });
      }
    })();

    return { total, resolved, resolveRate, critical, byType, byPriority, trend };
  }, [tickets, periodConfig, t]);

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px'
  };

  const downloadCsvFile = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  const toCsv = (headers: string[], rows: string[][]) => {
    const h = headers.join(',');
    const r = rows.map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    return h + '\n' + r;
  };

  const exportCurrentTab = () => {
    const now = new Date();
    const periodStart = subDays(now, periodConfig.days);
    const dateSuffix = format(now, 'yyyy-MM-dd');
    let csv = '';
    let filename = '';

    switch (activeTab) {
      case 'revenue': {
        csv = toCsv(
          [t('common.date'), t('reports.revenue'), t('reports.orderCount')],
          revenueByPeriod.map(r => [r.date, String(r.revenue), String(r.orders)])
        );
        filename = `raport_venituri_${dateSuffix}.csv`;
        break;
      }
      case 'orders': {
        const filtered = orders.filter(o => new Date(o.created_at) >= periodStart);
        csv = toCsv(
          [t('orders.orderNumber'), t('common.status'), t('common.total'), t('common.date')],
          filtered.map(o => [o.order_number, o.status, String(o.total), format(new Date(o.created_at), 'dd.MM.yyyy')])
        );
        filename = `raport_comenzi_${dateSuffix}.csv`;
        break;
      }
      case 'production': {
        csv = toCsv(
          [t('reports.stage', 'Etapă'), t('reports.jobs')],
          productionByStage.map(s => [s.name, String(s.value)])
        );
        filename = `raport_productie_${dateSuffix}.csv`;
        break;
      }
      case 'inventory': {
        csv = toCsv(
          [t('common.name'), t('reports.currentStockLabel'), t('reports.minStockLabel')],
          (lowStockMaterials || []).map(m => [m.name, String(m.stock_quantity || 0), String(m.min_stock_level || 0)])
        );
        filename = `raport_stocuri_${dateSuffix}.csv`;
        break;
      }
      case 'quality': {
        const filtered = tickets.filter(tk => new Date(tk.created_at) >= periodStart);
        csv = toCsv(
          [t('service.ticketNumber'), t('common.type'), t('service.priority'), t('common.status'), t('common.date')],
          filtered.map(tk => [tk.ticket_number, tk.ticket_type, tk.priority, tk.status, format(new Date(tk.created_at), 'dd.MM.yyyy')])
        );
        filename = `raport_calitate_${dateSuffix}.csv`;
        break;
      }
      case 'performance': {
        csv = toCsv(
          [t('reports.stage', 'Etapă'), t('reports.avgTime'), t('reports.stages')],
          avgTimePerStage.filter(s => s.count > 0).map(s => [s.name, String(s.avgHours), String(s.count)])
        );
        filename = `raport_performanta_${dateSuffix}.csv`;
        break;
      }
      case 'operators': {
        const stageKeys = STAGE_ORDER;
        const headers = [t('reports.operatorName'), t('reports.stagesCompleted'), t('reports.avgTimePerStageOp'), ...stageKeys.map(s => translatedStageLabels[s])];
        csv = toCsv(
          headers,
          operatorStats.map(op => [
            op.name, String(op.stagesCount), `${(op.avgMinutes / 60).toFixed(1)}h`,
            ...stageKeys.map(s => String(op.byStage[s] || 0))
          ])
        );
        filename = `raport_operatori_${dateSuffix}.csv`;
        break;
      }
    }

    if (csv) {
      downloadCsvFile(csv, filename);
    }
  };

  return (
    <AppLayout title={t('reports.title')}>
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{t('reports.reportingPeriod')}:</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCurrentTab}>
              <Download className="h-4 w-4 mr-1" />
              {t('reports.exportReport')}
            </Button>
            <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{t('reports.monthly')}</SelectItem>
                <SelectItem value="quarterly">{t('reports.quarterly')}</SelectItem>
                <SelectItem value="semiannual">{t('reports.semiannual')}</SelectItem>
                <SelectItem value="annual">{t('reports.annual')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 border-green-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'totalRevenue', title: t('reports.totalRevenue') })}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('reports.totalRevenue')}</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{currencyLabel}</p>
                </div>
                <Euro className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-emerald-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'periodRevenue', title: `${t('reports.revenue')} - ${getPeriodLabel()}` })}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{stats.recentRevenue.toLocaleString()}</p>
                    <TrendIndicator value={stats.revenueChange} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}% {t('reports.vsPreviousPeriod')}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'conversionRate', title: t('reports.conversionRate') })}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('reports.conversionRate')}</p>
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{t('reports.quotesToOrders')} ({getPeriodLabel()})</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'periodOrders', title: t('reports.periodOrders') })}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t('reports.periodOrders')}</p>
                  <p className="text-2xl font-bold">{stats.recentOrders}</p>
                  <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">{t('reports.revenueTab')}</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm">{t('reports.ordersTab')}</TabsTrigger>
            <TabsTrigger value="production" className="text-xs sm:text-sm">{t('reports.productionTab')}</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs sm:text-sm">{t('reports.inventoryTab')}</TabsTrigger>
            <TabsTrigger value="quality" className="text-xs sm:text-sm">{t('reports.qualityTab')}</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">{t('reports.performanceTab')}</TabsTrigger>
            <TabsTrigger value="operators" className="text-xs sm:text-sm">{t('reports.operatorsTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.revenueEvolution')} ({getPeriodLabel()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByPeriod}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${convert(value).toLocaleString()} ${currencyLabel}`, t('reports.revenue')]} />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={periodConfig.groupBy !== 'day'} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.orderCount')} ({getPeriodLabel()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByPeriod}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} ${t('reports.orders')}`, t('reports.ordersTab')]} />
                      <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.ordersByStatus')} ({getPeriodLabel()})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {ordersByStatus.map((entry, index) => (<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.clientsByType')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={clientsByType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {clientsByType.map((entry, index) => (<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.productionByStage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionByStage} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.lowStockMaterials')}</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">{t('reports.allStockSufficient')}</div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lowStockData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis type="category" dataKey="name" className="text-xs" width={150} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Bar dataKey="current" fill="#EF4444" name={t('reports.currentStockLabel')} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="minimum" fill="#F59E0B" name={t('reports.minStockLabel')} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 border-blue-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'totalComplaints', title: t('reports.totalComplaints') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.totalComplaints')}</p>
                      <p className="text-2xl font-bold">{qualityStats.total}</p>
                      <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'resolvedComplaints', title: t('reports.resolved') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.resolved')}</p>
                      <p className="text-2xl font-bold">{qualityStats.resolved}</p>
                      <p className="text-xs text-muted-foreground">{t('reports.ofLabel')} {qualityStats.total}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'resolveRate', title: t('reports.resolveRate') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.resolveRate')}</p>
                      <p className="text-2xl font-bold">{qualityStats.resolveRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-red-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'criticalComplaints', title: t('reports.critical') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.critical')}</p>
                      <p className="text-2xl font-bold">{qualityStats.critical}</p>
                      <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.complaintsEvolution')} ({getPeriodLabel()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityStats.trend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} ${t('reports.complaints')}`, t('reports.complaints')]} />
                      <Bar dataKey="reclamatii" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.issueTypeDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {qualityStats.byType.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">{t('reports.noComplaintsInPeriod')}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={qualityStats.byType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {qualityStats.byType.map((entry, index) => (<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.priorityDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {qualityStats.byPriority.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">{t('reports.noComplaintsInPeriod')}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={qualityStats.byPriority} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {qualityStats.byPriority.map((entry, index) => (<Cell key={entry.name} fill={['#94A3B8', '#3B82F6', '#F97316', '#EF4444'][index] || COLORS[index]} />))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 border-green-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'completedJobs', title: t('reports.completedJobs') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.completedJobs')}</p>
                      <p className="text-2xl font-bold">{completedJobsCount}</p>
                      <p className="text-xs text-muted-foreground">{getPeriodLabel()}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'avgTime', title: t('reports.avgTotalTime') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.avgTotalTime')}</p>
                      <p className="text-2xl font-bold">{avgTotalDays}</p>
                      <p className="text-xs text-muted-foreground">{t('reports.daysPerJob')}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-red-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'bottleneck', title: t('reports.bottleneck') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.bottleneck')}</p>
                      <p className="text-lg font-bold">{completedJobsCount === 0 ? t('reports.insufficientData') : (bottleneckStage?.name || '-')}</p>
                      <p className="text-xs text-muted-foreground">
                        {bottleneckStage?.avgHours ? `${bottleneckStage.avgHours}h ${t('reports.avgLabel')}` : ''}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailDialog({ type: 'activeJobs', title: t('reports.activeJobs') })}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('reports.activeJobs')}</p>
                      <p className="text-2xl font-bold">{activeJobsCount}</p>
                      <p className="text-xs text-muted-foreground">{t('reports.inProgress')}</p>
                    </div>
                    <Package className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.avgTimePerStage')}</CardTitle>
              </CardHeader>
              <CardContent>
                {avgTimePerStage.every(s => s.count === 0) ? (
                  <div className="text-center py-8 text-muted-foreground">{t('reports.noCompletedJobs')}</div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={avgTimePerStage.map(s => ({ ...s, name: translatedStageLabels[s.stage as ProductionStage] || s.name }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" unit="h" />
                        <YAxis type="category" dataKey="name" className="text-xs" width={120} />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value: number, name: string, props: any) => [
                            `${value}h (${props.payload.count} ${t('reports.stages')})`,
                            t('reports.avgTime')
                          ]}
                        />
                        <Bar dataKey="avgHours" radius={[0, 4, 4, 0]} fill="#3B82F6">
                          {avgTimePerStage.map((entry) => (
                            <Cell
                              key={entry.stage}
                              fill={bottleneckStage && entry.stage === bottleneckStage.stage && entry.avgMinutes > 0 ? '#EF4444' : '#3B82F6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.completionTrend')} ({getPeriodLabel()})</CardTitle>
              </CardHeader>
              <CardContent>
                {completionTrend.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">{t('reports.noCompletedJobs')}</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={completionTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => format(new Date(v), 'dd MMM', { locale: currentLocale })} />
                        <YAxis className="text-xs" allowDecimals={false} />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          labelFormatter={(v) => format(new Date(v), 'dd MMMM yyyy', { locale: currentLocale })}
                          formatter={(value: number) => [`${value} ${t('reports.jobs')}`, t('reports.completed')]}
                        />
                        <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operators" className="space-y-4">
            {operatorStats.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {t('reports.noOperatorData')}
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('reports.operatorsTab')} ({getPeriodLabel()})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('reports.operatorName')}</TableHead>
                          <TableHead className="text-right">{t('reports.stagesCompleted')}</TableHead>
                          <TableHead className="text-right">{t('reports.avgTimePerStageOp')}</TableHead>
                          {STAGE_ORDER.map(stage => (
                            <TableHead key={stage} className="text-right text-xs">
                              {translatedStageLabels[stage]}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {operatorStats.map(op => (
                          <TableRow
                            key={op.name}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setDetailDialog({ type: `operatorDetail:${op.name}`, title: `${t('reports.operatorDetail')}: ${op.name === '_unassigned_' ? t('reports.unassigned') : op.name}` })}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                {op.name === '_unassigned_' ? t('reports.unassigned') : op.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold">{op.stagesCount}</TableCell>
                            <TableCell className="text-right">{(op.avgMinutes / 60).toFixed(1)}h</TableCell>
                            {STAGE_ORDER.map(stage => (
                              <TableCell key={stage} className="text-right text-muted-foreground">
                                {op.byStage[stage] || 0}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top {t('reports.operatorsTab')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={operatorStats.slice(0, 10).map(op => ({ name: op.name === '_unassigned_' ? t('reports.unassigned') : op.name, count: op.stagesCount }))} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" className="text-xs" />
                          <YAxis type="category" dataKey="name" className="text-xs" width={120} />
                          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} ${t('reports.stagesCompleted')}`, '']} />
                          <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={(open) => !open && setDetailDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{detailDialog?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {detailDialog && renderDetailTable(detailDialog.type)}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );

  function renderDetailTable(type: string) {
    const now = new Date();
    const periodStart = subDays(now, periodConfig.days);
    const recentOrders = orders.filter(o => new Date(o.created_at) >= periodStart);

    const statusLabels: Record<string, string> = {
      quote: t('reports.statusQuote'),
      confirmed: t('reports.statusConfirmed'),
      in_production: t('reports.statusInProduction'),
      completed: t('reports.statusCompleted'),
      delivered: t('reports.statusDelivered'),
      cancelled: t('reports.statusCancelled'),
    };

    const priorityLabels: Record<string, string> = {
      scazuta: t('reports.priorityLow'),
      medie: t('reports.priorityMedium'),
      urgenta: t('reports.priorityUrgent'),
      critica: t('reports.priorityCritical'),
    };

    const ticketStatusLabels: Record<string, string> = {
      nou: t('reports.statusNew', 'Nou'),
      in_lucru: t('reports.statusWorking', 'În lucru'),
      rezolvat: t('reports.statusResolved', 'Rezolvat'),
      inchis: t('reports.statusClosed', 'Închis'),
    };

    // Orders table renderer
    const renderOrdersTable = (orderList: typeof orders) => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('reports.orderNumber', 'Nr. Comandă')}</TableHead>
            <TableHead>{t('reports.client', 'Client')}</TableHead>
            <TableHead className="text-right">{t('reports.total', 'Total')}</TableHead>
            <TableHead>{t('reports.status', 'Status')}</TableHead>
            <TableHead>{t('reports.date', 'Data')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderList.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t('reports.noData', 'Nu sunt date')}</TableCell></TableRow>
          ) : orderList.map(o => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{o.order_number}</TableCell>
              <TableCell>{(o as any).clients?.name || '-'}</TableCell>
              <TableCell className="text-right">{formatPrice(o.total)}</TableCell>
              <TableCell><Badge variant="outline">{statusLabels[o.status] || o.status}</Badge></TableCell>
              <TableCell>{format(new Date(o.created_at), 'dd.MM.yyyy')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    // Tickets table renderer
    const renderTicketsTable = (ticketList: typeof tickets) => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('reports.ticketNumber', 'Nr. Tichet')}</TableHead>
            <TableHead>{t('reports.type', 'Tip')}</TableHead>
            <TableHead>{t('reports.priority', 'Prioritate')}</TableHead>
            <TableHead>{t('reports.status', 'Status')}</TableHead>
            <TableHead>{t('reports.date', 'Data')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ticketList.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t('reports.noData', 'Nu sunt date')}</TableCell></TableRow>
          ) : ticketList.map(tk => (
            <TableRow key={tk.id}>
              <TableCell className="font-medium">{tk.ticket_number}</TableCell>
              <TableCell>{tk.ticket_type}</TableCell>
              <TableCell><Badge variant={tk.priority === 'critica' ? 'destructive' : 'outline'}>{priorityLabels[tk.priority] || tk.priority}</Badge></TableCell>
              <TableCell><Badge variant="outline">{ticketStatusLabels[tk.status] || tk.status}</Badge></TableCell>
              <TableCell>{format(new Date(tk.created_at), 'dd.MM.yyyy')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    // Jobs table renderer
    const renderJobsTable = (jobList: typeof jobs) => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('reports.jobNumber', 'Nr. Job')}</TableHead>
            <TableHead>{t('reports.client', 'Client')}</TableHead>
            <TableHead>{t('reports.stage', 'Etapă')}</TableHead>
            <TableHead>{t('reports.date', 'Data')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobList.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{t('reports.noData', 'Nu sunt date')}</TableCell></TableRow>
          ) : jobList.map(j => (
            <TableRow key={j.id}>
              <TableCell className="font-medium">{j.job_number}</TableCell>
              <TableCell>{j.client_name || '-'}</TableCell>
              <TableCell><Badge variant="outline">{t(`production.stages.${j.current_stage}`, STAGE_LABELS[j.current_stage])}</Badge></TableCell>
              <TableCell>{j.completed_at ? format(new Date(j.completed_at), 'dd.MM.yyyy') : j.due_date ? format(new Date(j.due_date), 'dd.MM.yyyy') : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    const filteredTickets = tickets.filter(t => new Date(t.created_at) >= periodStart);

    switch (type) {
      case 'totalRevenue':
        return renderOrdersTable(orders);
      case 'periodRevenue':
        return renderOrdersTable(recentOrders);
      case 'conversionRate':
        return renderOrdersTable(recentOrders);
      case 'periodOrders':
        return renderOrdersTable(recentOrders);
      case 'totalComplaints':
        return renderTicketsTable(filteredTickets);
      case 'resolvedComplaints':
        return renderTicketsTable(filteredTickets.filter(t => t.status === 'rezolvat' || t.status === 'inchis'));
      case 'resolveRate':
        return renderTicketsTable(filteredTickets);
      case 'criticalComplaints':
        return renderTicketsTable(filteredTickets.filter(t => t.priority === 'critica'));
      case 'completedJobs':
        return renderJobsTable(jobs.filter(j => j.completed_at));
      case 'avgTime':
        return renderJobsTable(jobs.filter(j => j.completed_at));
      case 'bottleneck': {
        const stageData = avgTimePerStage.filter(s => s.count > 0);
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.stage', 'Etapă')}</TableHead>
                <TableHead className="text-right">{t('reports.avgTime', 'Timp mediu')}</TableHead>
                <TableHead className="text-right">{t('reports.count', 'Nr. etape')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stageData.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t('reports.noData', 'Nu sunt date')}</TableCell></TableRow>
              ) : stageData.map(s => (
                <TableRow key={s.stage} className={bottleneckStage && s.stage === bottleneckStage.stage ? 'bg-destructive/10' : ''}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right">{s.avgHours}h</TableCell>
                  <TableCell className="text-right">{s.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
      case 'activeJobs':
        return renderJobsTable(jobs.filter(j => !j.completed_at));
      default: {
        // Handle operatorDetail:operatorName
        if (type.startsWith('operatorDetail:')) {
          const opName = type.replace('operatorDetail:', '');
          const op = operatorStats.find(o => o.name === opName);
          if (!op) return null;
          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reports.jobNumber')}</TableHead>
                  <TableHead>{t('reports.stage', 'Etapă')}</TableHead>
                  <TableHead>{t('reports.client', 'Client')}</TableHead>
                  <TableHead className="text-right">{t('reports.duration')}</TableHead>
                  <TableHead>{t('reports.completedAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {op.details.map(d => (
                  <TableRow key={d.stageId}>
                    <TableCell className="font-medium">{d.jobNumber}</TableCell>
                    <TableCell><Badge variant="outline">{translatedStageLabels[d.stage] || d.stage}</Badge></TableCell>
                    <TableCell>{d.clientName}</TableCell>
                    <TableCell className="text-right">{(d.durationMinutes / 60).toFixed(1)}h</TableCell>
                    <TableCell>{format(new Date(d.completedAt), 'dd.MM.yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          );
        }
        return null;
      }
    }
  }
}
