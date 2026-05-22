import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const TYPE_KEYS = ['glass', 'hardware', 'consumable'];
const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];

export function StockChart() {
  const { t } = useTranslation();

  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard-stock-chart'],
    queryFn: async () => {
      const { data: stockItems, error } = await supabase
        .from('user_stock')
        .select('stock_quantity, material_id, materials(material_type)');
      if (error) throw error;

      const grouped: Record<string, number> = {};
      TYPE_KEYS.forEach((key) => { grouped[key] = 0; });
      stockItems?.forEach((item) => {
        const type = (item.materials as any)?.material_type as string;
        if (type && type in grouped) grouped[type] += Number(item.stock_quantity);
      });

      return TYPE_KEYS.map((key) => ({
        name: t(`stockCategories.${key}`),
        value: Math.round(grouped[key] || 0),
      }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.stockByCategory')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('common.loading')}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, (max: number) => max > 0 ? max : 10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: number) => [`${value} ${t('common.pieces')}`, t('dashboard.qty')]}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
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
