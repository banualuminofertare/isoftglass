import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function RevenueChart() {
  const { t } = useTranslation();
  const { convert, currencyLabel } = useCurrency();

  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard-revenue-chart'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total, status')
        .not('status', 'in', '("cancelled","quote")');
      if (error) throw error;

      const grouped: Record<string, number> = {};
      orders?.forEach((order) => {
        const date = new Date(order.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
        grouped[key] = (grouped[key] || 0) + (Number(order.total) || 0);
      });

      const now = new Date();
      const months: { name: string; venit: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        months.push({ name: t(`months.${MONTH_KEYS[d.getMonth()]}`), venit: Math.round(grouped[key] || 0) });
      }
      return months;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.monthlyIncome')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.loading')}</div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.noData')}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVenit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: number) => [`${convert(value).toLocaleString('ro-RO')} ${currencyLabel}`, t('dashboard.income')]}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                />
                <Bar dataKey="venit" fill="url(#colorVenit)" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
