import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOrders, type OrderStatus } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

export function RecentOrders() {
  const { orders, deleteOrder } = useOrders();
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const statusVariants: Record<OrderStatus, 'secondary' | 'default' | 'outline' | 'destructive'> = {
    quote: 'secondary',
    confirmed: 'default',
    in_production: 'outline',
    completed: 'default',
    delivered: 'secondary',
    cancelled: 'destructive',
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.recentOrders')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.noOrders')}</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm font-mono">{order.order_number}</span>
                    <Badge variant={statusVariants[order.status]} className="text-xs">
                      {t(`orderStatus.${order.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.clients?.name || t('dashboard.noClient')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'dd MMM yyyy', { locale: getDateLocale() })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    {order.delivery_date && (
                      <p className="text-xs text-muted-foreground">
                        {t('dashboard.deadline')}: {format(new Date(order.delivery_date), 'dd MMM', { locale: getDateLocale() })}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => setDeleteOrderId(order.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboard.deleteOrder')}</AlertDialogTitle>
            <AlertDialogDescription>{t('dashboard.deleteOrderConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteOrderId) {
                  await deleteOrder.mutateAsync(deleteOrderId);
                  setDeleteOrderId(null);
                }
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
