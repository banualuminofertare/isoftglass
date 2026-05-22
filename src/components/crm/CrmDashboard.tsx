import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, TrendingUp, AlertTriangle, Target, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { CrmLead } from '@/hooks/useCrmLeads';

interface UserSub {
  user_id: string;
  full_name: string | null;
  status: string | null;
  plan_name: string | null;
  expires_at: string | null;
}

interface CrmDashboardProps {
  leads: CrmLead[];
  subscribers: UserSub[];
  onNavigate?: (tab: string, stageFilter?: string) => void;
}

const STAGE_COLORS: Record<string, string> = {
  nou: '#9ca3af',
  contactat: '#3b82f6',
  interesat: '#8b5cf6',
    demo: '#f59e0b',
    negociere: '#f97316',
    pauza: '#eab308',
  };

const SOURCE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f97316', '#06b6d4', '#ec4899'];

export function CrmDashboard({ leads, subscribers, onNavigate }: CrmDashboardProps) {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();

  const STAGE_LABELS: Record<string, string> = {
    nou: t('crm.stageNew'), contactat: t('crm.stageContacted'), interesat: t('crm.stageInterested'),
    demo: t('crm.stageDemo'), negociere: t('crm.stageNegotiation'), pauza: t('crm.stagePaused'), castigat: t('crm.stageWon'), pierdut: t('crm.stageLost'),
  };

  const activeSubscribers = subscribers.filter(s => s.status === 'active');
  const expiringSubscribers = subscribers.filter(s => {
    if (!s.expires_at || s.status !== 'active') return false;
    const daysLeft = Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000);
    return daysLeft <= 14 && daysLeft > 0;
  });

  const activeLeads = leads.filter(l => !['castigat', 'pierdut', 'pauza'].includes(l.stage));
  const wonLeads = leads.filter(l => l.stage === 'castigat');
  const negotiationLeads = leads.filter(l => l.stage === 'negociere');
  const negotiationValue = negotiationLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const totalValue = activeLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const totalRevenue = leads.reduce((sum, l) => sum + (l.actual_revenue || 0), 0);

  const pipelineData = Object.entries(STAGE_LABELS)
    .filter(([key]) => !['castigat', 'pierdut'].includes(key))
    .map(([key, label]) => ({
      name: label,
      count: leads.filter(l => l.stage === key).length,
    }));

  const getSourceLabel = (source: string) => {
    const map: Record<string, string> = {
      website: t('crm.sourceWebsite'), referral: t('crm.sourceReferral'), social_media: t('crm.sourceSocialMedia'),
      cold_call: t('crm.sourceColdCall'), email: t('crm.sourceEmail'), event: t('crm.sourceEvent'), other: t('crm.sourceOther'),
    };
    return map[source] || source;
  };

  const sourceData = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: getSourceLabel(name), value }));

  const monthlyData = getMonthlyData(leads, t, i18n.language);
  const revenueChartData = getRevenueChartData(leads, t, i18n.language);

  const stats = [
    { title: t('crm.activeSubscribers'), value: activeSubscribers.length, icon: Users, iconBg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-500', tab: 'subscribers' },
    { title: t('crm.inNegotiation', 'În negociere'), value: formatPrice(negotiationValue), icon: Target, iconBg: 'bg-orange-100 text-orange-600', border: 'border-orange-500', tab: 'leads', stageFilter: 'negociere' },
    { title: t('crm.activeLeads'), value: activeLeads.length, icon: Target, iconBg: 'bg-blue-100 text-blue-600', border: 'border-blue-500', tab: 'leads' },
    { title: t('crm.conversions'), value: wonLeads.length, icon: TrendingUp, iconBg: 'bg-violet-100 text-violet-600', border: 'border-violet-500', tab: 'leads' },
    { title: t('crm.totalRevenue'), value: formatPrice(totalRevenue), icon: DollarSign, iconBg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-500', tab: 'leads' },
    { title: t('crm.expiringSoon'), value: expiringSubscribers.length, icon: AlertTriangle, iconBg: 'bg-orange-100 text-orange-600', border: 'border-orange-500', tab: 'subscribers' },
    { title: t('crm.estimatedValue'), value: formatPrice(totalValue), icon: DollarSign, iconBg: 'bg-amber-100 text-amber-600', border: 'border-amber-500', tab: 'pipeline' },
    { title: t('crm.totalLeads'), value: leads.length, icon: UserPlus, iconBg: 'bg-cyan-100 text-cyan-600', border: 'border-cyan-500', tab: 'leads' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${stat.border}`}
            onClick={() => onNavigate?.(stat.tab, (stat as any).stageFilter)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-xs text-muted-foreground">{stat.title}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('crm.salesPipeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs fill-muted-foreground" />
                <YAxis dataKey="name" type="category" width={90} className="text-xs fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Lead">
                  {pipelineData.map((entry, idx) => {
                    const stageKey = Object.keys(STAGE_LABELS).filter(k => !['castigat', 'pierdut'].includes(k))[idx];
                    return <Cell key={idx} fill={STAGE_COLORS[stageKey] || '#9ca3af'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('crm.leadSources')}</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {sourceData.map((_, idx) => (
                      <Cell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-16">{t('crm.noLeadsYet')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('crm.estimatedVsRevenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
              <Legend />
              <Bar dataKey="estimat" fill="#f97316" name={t('crm.estimated')} radius={[4, 4, 0, 0]} />
              <Bar dataKey="venit" fill="#10b981" name={t('crm.revenue')} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('crm.monthlyTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" name={t('crm.newLeads')} strokeWidth={2} />
              <Line type="monotone" dataKey="conversii" stroke="#10b981" name={t('crm.conversions')} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {expiringSubscribers.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {t('crm.expiringIn14Days')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSubscribers.map(s => (
                <div key={s.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{s.full_name || t('admin.noName')}</p>
                    <p className="text-xs text-muted-foreground">{s.plan_name}</p>
                  </div>
                  <Badge variant="outline" className="border-destructive text-destructive">
                    {t('crm.expires')} {s.expires_at ? new Date(s.expires_at).toLocaleDateString(i18n.language === 'it' ? 'it-IT' : i18n.language === 'en' ? 'en-GB' : 'ro-RO') : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getMonthlyData(leads: CrmLead[], t: any, lang: string) {
  const months: Record<string, { leads: number; conversii: number }> = {};
  const now = new Date();
  const locale = lang === 'it' ? 'it-IT' : lang === 'en' ? 'en-GB' : 'ro-RO';
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { leads: 0, conversii: 0 };
  }
  leads.forEach(l => {
    const key = l.created_at.slice(0, 7);
    if (months[key]) {
      months[key].leads++;
      if (l.stage === 'castigat') months[key].conversii++;
    }
  });
  return Object.entries(months).map(([key, val]) => {
    const [y, m] = key.split('-');
    const d = new Date(+y, +m - 1);
    return { month: d.toLocaleDateString(locale, { month: 'short' }), ...val };
  });
}

function getRevenueChartData(leads: CrmLead[], t: any, lang: string) {
  const months: Record<string, { estimat: number; venit: number }> = {};
  const now = new Date();
  const locale = lang === 'it' ? 'it-IT' : lang === 'en' ? 'en-GB' : 'ro-RO';
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { estimat: 0, venit: 0 };
  }
  leads.forEach(l => {
    const key = l.created_at.slice(0, 7);
    if (months[key]) {
      months[key].estimat += l.estimated_value || 0;
      months[key].venit += l.actual_revenue || 0;
    }
  });
  return Object.entries(months).map(([key, val]) => {
    const [y, m] = key.split('-');
    const d = new Date(+y, +m - 1);
    return { month: d.toLocaleDateString(locale, { month: 'short' }), ...val };
  });
}
