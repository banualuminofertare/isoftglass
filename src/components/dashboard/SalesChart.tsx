import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function SalesChart() {
  const { t } = useTranslation();
  const { currencyLabel, convert } = useCurrency();

  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard-sales-chart'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total, status')
        .neq('status', 'cancelled');
      if (error) throw error;

      const grouped: Record<string, { vanzari: number; comenzi: number }> = {};
      orders?.forEach((order) => {
        const date = new Date(order.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = { vanzari: 0, comenzi: 0 };
        grouped[key].vanzari += Number(order.total) || 0;
        grouped[key].comenzi += 1;
      });

      const now = new Date();
      const months: { name: string; vanzari: number; comenzi: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        const val = grouped[key] || { vanzari: 0, comenzi: 0 };
        months.push({ name: t(`months.${MONTH_KEYS[d.getMonth()]}`), ...val });
      }
      return months;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.salesEvolution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.loading')}</div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.noData')}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVanzari" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: number, name: string) => [
                    `${name === 'comenzi' ? value.toLocaleString('ro-RO') : convert(value).toLocaleString('ro-RO', { maximumFractionDigits: 0 })} ${name === 'comenzi' ? '' : currencyLabel}`,
                    name === 'comenzi' ? t('common.orders') : t('dashboard.sales'),
                  ]}
                />
                <Area type="monotone" dataKey="vanzari" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorVanzari)" dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
