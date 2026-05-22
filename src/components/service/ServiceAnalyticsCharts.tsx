import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { ServiceTicket } from '@/hooks/useServiceTickets';

const TYPE_KEYS: Record<string, string> = {
  defect_productie: 'service.type_productionDefect',
  defect_montaj: 'service.type_installationDefect',
  deteriorare_transport: 'service.type_transportDamage',
  reclamatie_client: 'service.type_clientComplaint',
};

const PRIORITY_ORDER = ['scazuta', 'medie', 'urgenta', 'critica'];
const PRIORITY_KEYS: Record<string, string> = {
  scazuta: 'service.priority_low',
  medie: 'service.priority_medium',
  urgenta: 'service.priority_urgent',
  critica: 'service.priority_critical',
};

const STATUS_ORDER = ['deschis', 'in_evaluare', 'programat', 'in_lucru', 'rezolvat', 'inchis'];
const STATUS_KEYS: Record<string, string> = {
  deschis: 'service.status_open',
  in_evaluare: 'service.status_inEvaluation',
  programat: 'service.status_scheduled',
  in_lucru: 'service.status_inProgress',
  rezolvat: 'service.status_resolved',
  inchis: 'service.status_closed',
};

const TYPE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
const PRIORITY_COLORS = ['#94a3b8', '#3b82f6', '#f97316', '#ef4444'];
const STATUS_COLORS = ['#3b82f6', '#eab308', '#6366f1', '#f97316', '#22c55e', '#6b7280'];

interface Props {
  tickets: ServiceTicket[];
}

export function ServiceAnalyticsCharts({ tickets }: Props) {
  const { t } = useTranslation();

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(tk => {
      counts[tk.ticket_type] = (counts[tk.ticket_type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({ name: TYPE_KEYS[key] ? t(TYPE_KEYS[key]) : key, value, key }))
      .sort((a, b) => b.value - a.value);
  }, [tickets, t]);

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(tk => {
      counts[tk.priority] = (counts[tk.priority] || 0) + 1;
    });
    return PRIORITY_ORDER
      .filter(k => counts[k])
      .map(key => ({ name: PRIORITY_KEYS[key] ? t(PRIORITY_KEYS[key]) : key, value: counts[key], key }));
  }, [tickets, t]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(tk => {
      counts[tk.status] = (counts[tk.status] || 0) + 1;
    });
    return STATUS_ORDER
      .filter(k => counts[k])
      .map(key => ({ name: STATUS_KEYS[key] ? t(STATUS_KEYS[key]) : key, value: counts[key], key }));
  }, [tickets, t]);

  const typeChartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    typeData.forEach((d, i) => {
      config[d.name] = { label: d.name, color: TYPE_COLORS[i % TYPE_COLORS.length] };
    });
    return config;
  }, [typeData]);

  const priorityChartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    priorityData.forEach((d, i) => {
      config[d.name] = { label: d.name, color: PRIORITY_COLORS[i % PRIORITY_COLORS.length] };
    });
    return config;
  }, [priorityData]);

  const statusChartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    statusData.forEach((d, i) => {
      config[d.name] = { label: d.name, color: STATUS_COLORS[i % STATUS_COLORS.length] };
    });
    return config;
  }, [statusData]);

  if (tickets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('service.defectTypeFrequency')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={typeChartConfig} className="h-[200px] w-full">
            <BarChart data={typeData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={11} />
              <YAxis type="category" dataKey="name" width={110} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('service.priorityDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={priorityChartConfig} className="h-[200px] w-full">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
                fontSize={10}
              >
                {priorityData.map((_, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('service.complaintsByStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={statusChartConfig} className="h-[200px] w-full">
            <BarChart data={statusData} margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} angle={-30} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}