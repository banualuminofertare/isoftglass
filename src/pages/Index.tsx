import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProductsChart } from '@/components/dashboard/ProductsChart';
import { StockChart } from '@/components/dashboard/StockChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ClipboardList, TrendingUp, Package, AlertTriangle } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

const Index = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const { data: activeOrders = 0 } = useQuery({
    queryKey: ['dashboard-stat-active-orders'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'in_production']);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: monthlyRevenue = 0 } = useQuery({
    queryKey: ['dashboard-stat-monthly-revenue'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data, error } = await supabase
        .from('orders')
        .select('total')
        .neq('status', 'cancelled')
        .gte('created_at', startOfMonth);
      if (error) throw error;
      return data?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
    },
  });

  const { data: stockCount = 0 } = useQuery({
    queryKey: ['dashboard-stat-stock-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_stock')
        .select('*', { count: 'exact', head: true })
        .gt('stock_quantity', 0);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: stockAlerts = 0 } = useQuery({
    queryKey: ['dashboard-stat-stock-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_stock')
        .select('stock_quantity, min_stock_level')
        .gt('stock_quantity', 0);
      if (error) throw error;
      return data?.filter((s) => Number(s.stock_quantity) <= Number(s.min_stock_level)).length || 0;
    },
  });

  const currentMonth = new Date().toLocaleString('ro-RO', { month: 'long', year: 'numeric' });

  return (
    <AppLayout title={t('dashboard.title')}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t('dashboard.welcomeTitle')}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t('dashboard.welcomeSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('dashboard.activeOrders')}
            value={activeOrders}
            description={t('dashboard.inProgress')}
            icon={<ClipboardList className="h-4 w-4 text-blue-500" />}
            className="border-2 border-blue-500"
          />
          <StatCard
            title={t('dashboard.monthlyRevenue')}
            value={formatPrice(monthlyRevenue)}
            description={currentMonth}
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            className="border-2 border-emerald-500"
          />
          <StatCard
            title={t('dashboard.productsInStock')}
            value={stockCount}
            description={t('dashboard.availableItems')}
            icon={<Package className="h-4 w-4 text-violet-500" />}
            className="border-2 border-violet-500"
          />
          <StatCard
            title={t('dashboard.stockAlerts')}
            value={stockAlerts}
            description={t('dashboard.belowMinimum')}
            icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
            className="border-2 border-orange-500"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SalesChart />
          <ProductsChart />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueChart />
          <StockChart />
        </div>

        <RecentOrders />
      </div>
    </AppLayout>
  );
};

export default Index;
