import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const PRODUCT_KEYS = ['shower', 'balustrade', 'door', 'panel', 'mirror', 'kitchen_front'];
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];

export function ProductsChart() {
  const { t } = useTranslation();

  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard-products-chart'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('order_products')
        .select('product_type');
      if (error) throw error;

      const grouped: Record<string, number> = {};
      PRODUCT_KEYS.forEach((key) => { grouped[key] = 0; });
      products?.forEach((p) => {
        if (p.product_type in grouped) grouped[p.product_type]++;
      });

      return PRODUCT_KEYS.map((key) => ({
        name: t(`productTypes.${key}`),
        value: grouped[key] || 0,
      }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.ordersByProduct')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.loading')}</div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.noData')}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal vertical={false} />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value} ${t('common.orders')}`, '']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
