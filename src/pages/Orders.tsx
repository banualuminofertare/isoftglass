import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardList, Plus, Search, FileText, CheckCircle2, Factory, 
  Truck, XCircle, Clock, ArrowRight, Calendar, Euro, User, Download, Trash2, Pencil, AlertTriangle, Receipt
} from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOrders, useOrderDetails, type Order, type OrderStatus } from '@/hooks/useOrders';
import { PDFDownloadButtons } from '@/components/orders/PDFDownloadButtons';
import { OrderPreviewTab } from '@/components/orders/OrderPreviewTab';
import { OperatorPlanningDialog } from '@/components/orders/OperatorPlanningDialog';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/dateLocale';
import { useTranslation } from 'react-i18next';
import { CreateInstallationDialog } from '@/components/installation/CreateInstallationDialog';
import { CreateInvoiceDialog } from '@/components/invoicing/CreateInvoiceDialog';
import type { InvoiceType } from '@/hooks/useInvoices';
import { Link } from 'react-router-dom';

const PRODUCT_TYPE_ROUTES: Record<string, string> = {
  shower: '/calculator/cabine-dus',
  door: '/calculator/usi',
  balustrade: '/calculator/balustrade',
  panel: '/calculator/panouri',
  mirror: '/calculator/oglinzi',
  kitchen_front: '/calculator/fronturi',
};

const STATUS_ICONS: Record<OrderStatus, typeof FileText> = {
  quote: FileText, confirmed: CheckCircle2, in_production: Factory,
  completed: CheckCircle2, delivered: Truck, cancelled: XCircle,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  quote: 'bg-gray-500', confirmed: 'bg-blue-500', in_production: 'bg-orange-500',
  completed: 'bg-green-500', delivered: 'bg-emerald-500', cancelled: 'bg-red-500',
};

const STATUS_FLOW: OrderStatus[] = ['quote', 'confirmed', 'in_production', 'completed', 'delivered'];

const FINISHED_STATUSES: OrderStatus[] = ['completed', 'delivered', 'cancelled'];

function getDeadlineInfo(deliveryDate: string | null, status: OrderStatus) {
  if (!deliveryDate || FINISHED_STATUSES.includes(status)) return null;
  const today = startOfDay(new Date());
  const deadline = startOfDay(new Date(deliveryDate));
  const diff = differenceInDays(deadline, today);
  if (diff < 0) return { type: 'overdue' as const, days: Math.abs(diff), color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800', borderColor: 'border-l-4 border-l-red-500' };
  if (diff <= 3) return { type: 'soon' as const, days: diff, color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800', borderColor: '' };
  return { type: 'ok' as const, days: diff, color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800', borderColor: '' };
}

export default function Orders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const { orders, isLoading, createOrder, updateOrderStatus, deleteOrder } = useOrders();
  const { formatPrice, currencyLabel } = useCurrency();
  const { clients } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [planningOrderId, setPlanningOrderId] = useState<string | null>(null);
  const { order: selectedOrder, products, history } = useOrderDetails(selectedOrderId || undefined);
  const [isPreviewUnlocked, setIsPreviewUnlocked] = useState(false);
  const [previewAccessCode, setPreviewAccessCode] = useState('');
  const [installationOrder, setInstallationOrder] = useState<any>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<{ id: string; type: InvoiceType } | null>(null);

  // Auto-unlock for admins
  useEffect(() => {
    if (isAdmin) setIsPreviewUnlocked(true);
  }, [isAdmin]);

  const handlePreviewUnlock = () => {
    if (previewAccessCode === 'Admin1234') {
      setIsPreviewUnlocked(true);
      toast.success(t('orders.accessUnlocked'));
    } else {
      toast.error(t('orders.wrongAccessCode'));
    }
  };

  const [formData, setFormData] = useState({
    client_id: '', delivery_address: '', delivery_date: '', notes: '',
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrder.mutateAsync({
      client_id: formData.client_id || undefined,
      delivery_address: formData.delivery_address || undefined,
      delivery_date: formData.delivery_date || undefined,
      notes: formData.notes || undefined,
    });
    setIsDialogOpen(false);
    setFormData({ client_id: '', delivery_address: '', delivery_date: '', notes: '' });
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, operatorNames?: Record<string, string>) => {
    // Intercept confirmed → in_production to show planning dialog
    const order = orders.find(o => o.id === orderId);
    if (order?.status === 'confirmed' && newStatus === 'in_production' && !operatorNames) {
      setPlanningOrderId(orderId);
      return;
    }
    await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus, operatorNames });
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  };

  const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
    confirmed: t('orders.advanceConfirm'),
    in_production: t('orders.advanceProduction'),
    completed: t('orders.advanceComplete'),
    delivered: t('orders.advanceDeliver'),
  };

  const stats = {
    total: orders.length,
    quotes: orders.filter(o => o.status === 'quote').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    inProduction: orders.filter(o => o.status === 'in_production').length,
    completed: orders.filter(o => o.status === 'completed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalValue: orders.reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <AppLayout title={t('orders.title')}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('orders.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />{t('orders.newOrder')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('orders.newOrder')}</DialogTitle>
                  <DialogDescription className="sr-only">{t('orders.createOrderDesc')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('common.client')}</Label>
                    <Select value={formData.client_id} onValueChange={(v) => setFormData(prev => ({ ...prev, client_id: v }))}>
                      <SelectTrigger><SelectValue placeholder={t('orders.selectClient')} /></SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.company_name ? `(${client.company_name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('orders.deliveryAddress')}</Label>
                    <Textarea value={formData.delivery_address} onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('orders.deliveryDate')}</Label>
                    <Input type="date" value={formData.delivery_date} onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.notes')}</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button type="submit" disabled={createOrder.isPending}>{t('orders.createOrder')}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 flex-nowrap">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')} className="shrink-0 border-2 border-blue-500">
              {t('common.all')}
            </Button>
            {(Object.keys(STATUS_COLORS) as OrderStatus[]).map((status) => {
              const Icon = STATUS_ICONS[status];
              const color = STATUS_COLORS[status];
              const borderColor = color.replace('bg-', 'border-');
              return (
                <Button key={status} variant="outline" size="sm" onClick={() => setStatusFilter(status)}
                  className={cn("shrink-0 gap-1.5 border-2", borderColor, statusFilter === status && `${color} text-white border-transparent hover:text-white hover:opacity-90`)}>
                  <Icon className="h-3.5 w-3.5" />{t(`orderStatus.${status}`)}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
          <Card className="border-2 border-blue-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">{t('orders.totalOrders')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-gray-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500" /><div><p className="text-2xl font-bold">{stats.quotes}</p><p className="text-xs text-muted-foreground">{t('orders.quotes')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-blue-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-bold">{stats.confirmed}</p><p className="text-xs text-muted-foreground">{t('orders.confirmed')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-orange-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><Factory className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-bold">{stats.inProduction}</p><p className="text-xs text-muted-foreground">{t('orders.inProduction')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-green-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-bold">{stats.completed}</p><p className="text-xs text-muted-foreground">{t('orders.completed')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-emerald-500"><CardContent className="pt-4"><div className="flex items-center gap-2"><Truck className="h-5 w-5 text-emerald-500" /><div><p className="text-2xl font-bold">{stats.delivered}</p><p className="text-xs text-muted-foreground">{t('orders.delivered')}</p></div></div></CardContent></Card>
          <Card className="border-2 border-violet-500"><CardContent className="pt-4 px-2"><div className="flex items-center gap-1.5"><Euro className="h-5 w-5 text-violet-500 shrink-0" /><div className="min-w-0"><p className="text-lg sm:text-xl font-bold truncate">{formatPrice(stats.totalValue)}</p><p className="text-xs text-muted-foreground truncate">{t('orders.value')}</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>{t('orders.orderList')}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {orders.length === 0 ? t('orders.noOrdersYet') : t('common.noResults')}
              </div>
            ) : (
              <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('orders.orderNumber')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('common.client')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('common.date')}</TableHead>
                    <TableHead className="text-right">{t('common.total')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const Icon = STATUS_ICONS[order.status];
                    const color = STATUS_COLORS[order.status];
                    const nextStatus = getNextStatus(order.status);
                    const deadlineInfo = getDeadlineInfo(order.delivery_date, order.status);
                    return (
                      <TableRow key={order.id} className={deadlineInfo?.borderColor}>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto font-mono" onClick={() => setSelectedOrderId(order.id)}>{order.order_number}</Button>
                          <p className="text-xs text-muted-foreground mt-0.5">{order.clients?.name || t('dashboard.noClient')}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <p className="font-medium">{order.clients?.name || t('dashboard.noClient')}</p>
                            {order.clients?.company_name && <p className="text-xs text-muted-foreground">{order.clients.company_name}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", color, "text-white")}><Icon className="h-3 w-3" />{t(`orderStatus.${order.status}`)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">{format(new Date(order.created_at), 'dd MMM yyyy', { locale: getDateLocale() })}</div>
                          {order.delivery_date && (
                            deadlineInfo ? (
                              <div className={cn("text-xs inline-flex items-center gap-1 px-1.5 py-0.5 rounded border mt-1", deadlineInfo.color)}>
                                {deadlineInfo.type === 'overdue' && <AlertTriangle className="h-3 w-3 animate-pulse" />}
                                <Calendar className="h-3 w-3" />
                                {deadlineInfo.type === 'overdue'
                                  ? t('orders.daysOverdue', { count: deadlineInfo.days })
                                  : deadlineInfo.type === 'soon'
                                    ? `${deadlineInfo.days === 0 ? t('orders.today') : t('orders.daysLeft', { count: deadlineInfo.days })}`
                                    : t('orders.daysLeft', { count: deadlineInfo.days })}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />{format(new Date(order.delivery_date), 'dd MMM', { locale: getDateLocale() })}
                              </div>
                            )
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {nextStatus && order.status !== 'cancelled' && (() => {
                              const NextIcon = STATUS_ICONS[nextStatus];
                              return (
                                <Button size="sm" className={cn(STATUS_COLORS[nextStatus], "text-white hover:opacity-90")} onClick={() => handleStatusChange(order.id, nextStatus)} disabled={updateOrderStatus.isPending}>
                                  <NextIcon className="h-3 w-3" />{ADVANCE_LABELS[nextStatus] || t(`orderStatus.${nextStatus}`)}
                                </Button>
                              );
                            })()}
                            {(['confirmed', 'in_production', 'completed', 'delivered'] as OrderStatus[]).includes(order.status) && (
                              <Button variant="ghost" size="icon" title="Emite factură" onClick={() => setInvoiceOrder({ id: order.id, type: 'fiscal' })}>
                                <Receipt className="h-4 w-4 text-pink-500" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteOrderId(order.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-primary">{selectedOrder?.order_number}</span>
                  {selectedOrder && <Badge className={cn(STATUS_COLORS[selectedOrder.status], "text-white")}>{t(`orderStatus.${selectedOrder.status}`)}</Badge>}
                </DialogTitle>
                {selectedOrder && products.length > 0 && (
                  <div className="mr-8">
                    <PDFDownloadButtons order={selectedOrder as Order} products={products} hideQuote />
                  </div>
                )}
              </div>
              <DialogDescription className="sr-only">{t('orders.orderDetails')}</DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">{t('common.details')}</TabsTrigger>
                  <TabsTrigger value="products" className="flex-1">{t('orders.products')} ({products.length})</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">{t('orders.history')}</TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1">{t('orders.preview')}</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">{t('common.client')}</p><p className="font-medium">{selectedOrder.clients?.name || t('dashboard.noClient')}</p></div>
                    <div><p className="text-xs text-muted-foreground">{t('orders.creationDate')}</p><p className="font-medium">{format(new Date(selectedOrder.created_at), 'dd MMM yyyy HH:mm', { locale: getDateLocale() })}</p></div>
                    {selectedOrder.delivery_date && (() => {
                      const dlInfo = getDeadlineInfo(selectedOrder.delivery_date, selectedOrder.status);
                      return (
                        <div>
                          <p className="text-xs text-muted-foreground">{t('orders.deliveryDate')}</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(selectedOrder.delivery_date), 'dd MMM yyyy', { locale: getDateLocale() })}
                          </p>
                          {dlInfo && (
                            <span className={cn("text-xs inline-flex items-center gap-1 px-1.5 py-0.5 rounded border mt-1", dlInfo.color)}>
                              {dlInfo.type === 'overdue' && <AlertTriangle className="h-3 w-3" />}
                              {dlInfo.type === 'overdue' ? t('orders.daysOverdue', { count: dlInfo.days }) : dlInfo.days === 0 ? t('orders.today') : t('orders.daysLeft', { count: dlInfo.days })}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {selectedOrder.delivery_address && <div className="col-span-2"><p className="text-xs text-muted-foreground">{t('orders.deliveryAddress')}</p><p className="font-medium">{selectedOrder.delivery_address}</p></div>}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2"><span>{t('common.subtotal')}</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                    {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-2"><span>{t('common.discount')} ({selectedOrder.discount_percent}%)</span><span>-{formatPrice(selectedOrder.discount_amount)}</span></div>
                    )}
                    <div className="flex justify-between text-sm mb-2"><span>TVA ({selectedOrder.tax_percent}%)</span><span>{formatPrice(selectedOrder.tax_amount || 0)}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2"><span>{t('common.total')}</span><span>{formatPrice(selectedOrder.total)}</span></div>
                  </div>
                  {selectedOrder.notes && <div><p className="text-xs text-muted-foreground">{t('common.notes')}</p><p className="text-sm">{selectedOrder.notes}</p></div>}
                  
                  {selectedOrder.status !== 'quote' && selectedOrder.status !== 'cancelled' && (
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className="gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                        onClick={() => {
                          setInstallationOrder({
                            id: selectedOrder.id,
                            order_number: selectedOrder.order_number,
                            delivery_address: selectedOrder.delivery_address,
                            delivery_date: selectedOrder.delivery_date,
                            clients: selectedOrder.clients,
                          });
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                        {t('installation.scheduleFromOrder', 'Programează Montaj')}
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 border-pink-500 text-pink-700 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950"
                        onClick={() => { setInvoiceOrder({ id: selectedOrder.id, type: 'fiscal' }); setSelectedOrderId(null); }}
                      >
                        <Receipt className="h-4 w-4" />
                        Emite factură
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
                        onClick={() => { setInvoiceOrder({ id: selectedOrder.id, type: 'proforma' }); setSelectedOrderId(null); }}
                      >
                        <Receipt className="h-4 w-4" />
                        Proformă (avans)
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="products">
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">{t('orders.noProducts')}</div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product) => {
                        const fc = product.full_config as Record<string, any> | null;
                        const pb = fc?.priceBreakdown as Record<string, number> | undefined;
                        const markup = fc?.markupPercent as number | undefined;
                        const customAmount = fc?.customAmount ? Number(fc.customAmount) : 0;
                        const customNote = fc?.customAmountNote as string | undefined;
                        const hasBreakdown = pb && (pb.glass || pb.processing || pb.accessories || pb.labor);

                        return (
                          <Card key={product.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <Badge variant="outline">{product.product_type}</Badge>
                                {PRODUCT_TYPE_ROUTES[product.product_type] && (
                                  <Button size="sm" variant="outline" className="gap-1" onClick={() => { setSelectedOrderId(null); navigate(`${PRODUCT_TYPE_ROUTES[product.product_type]}?edit=${product.id}`); }}>
                                    <Pencil className="h-3 w-3" />{t('common.edit')}
                                  </Button>
                                )}
                              </div>

                              {hasBreakdown ? (
                                <div className="space-y-1 text-sm">
                                  {pb.glass > 0 && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.glass')}</span><span>{formatPrice(pb.glass)}</span></div>
                                  )}
                                  {pb.processing > 0 && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.processing')}</span><span>{formatPrice(pb.processing)}</span></div>
                                  )}
                                  {pb.accessories > 0 && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.accessories')}</span><span>{formatPrice(pb.accessories)}</span></div>
                                  )}
                                  {pb.labor > 0 && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.labor')}</span><span>{formatPrice(pb.labor)}</span></div>
                                  )}

                                  {customAmount > 0 && (
                                    <>
                                      <Separator className="my-1.5" />
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('orders.additionalAmount')}</span>
                                        <span>{formatPrice(customAmount)}</span>
                                      </div>
                                      {customNote && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 pl-1">📝 {customNote}</p>
                                      )}
                                    </>
                                  )}

                                  {markup && markup > 0 && (
                                    <>
                                      <Separator className="my-1.5" />
                                      <div className="flex justify-between text-muted-foreground">
                                        <span>{t('orders.markup')} +{markup}%</span>
                                        <span>{formatPrice(Math.round((pb.total || product.unit_price) * markup / 100))}</span>
                                      </div>
                                    </>
                                  )}

                                  <Separator className="my-1.5" />
                                  <div className="flex justify-between font-semibold">
                                    <span>{t('orders.productTotal')}</span>
                                    <span>{formatPrice(product.total_price)}{product.quantity > 1 ? ` × ${product.quantity}` : ''}</span>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('common.quantity')}: {product.quantity}</span>
                                    <span className="font-medium">{formatPrice(product.total_price)}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground text-right">{formatPrice(product.unit_price)}{t('orders.perUnit')}</p>
                                  {customAmount > 0 && (
                                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded text-xs">
                                      <p className="font-medium text-amber-700 dark:text-amber-400">{t('orders.additionalAmount')}: {formatPrice(customAmount)}</p>
                                      {customNote && <p className="text-amber-600 dark:text-amber-500 mt-0.5">📝 {customNote}</p>}
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="history">
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div key={entry.id} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {entry.from_status && (<><Badge variant="outline" className="text-xs">{t(`orderStatus.${entry.from_status}`)}</Badge><ArrowRight className="h-3 w-3" /></>)}
                            <Badge className={cn(STATUS_COLORS[entry.to_status], "text-white text-xs")}>{t(`orderStatus.${entry.to_status}`)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(entry.created_at), 'dd MMM yyyy HH:mm', { locale: getDateLocale() })}{entry.profiles?.full_name && ` • ${entry.profiles.full_name}`}</p>
                          {entry.notes && <p className="text-sm mt-1">{entry.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  {isPreviewUnlocked ? (
                    <OrderPreviewTab order={selectedOrder as Order} products={products} />
                  ) : (
                    <Card>
                      <CardContent className="p-6 flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground">{t('orders.previewLocked', 'Introduceți codul de acces pentru a vizualiza previzualizarea')}</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type="password"
                            placeholder={t('orders.accessCode', 'Cod de acces')}
                            value={previewAccessCode}
                            onChange={(e) => setPreviewAccessCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePreviewUnlock()}
                            className="w-48"
                          />
                          <Button onClick={handlePreviewUnlock} size="sm">
                            {t('orders.unlock', 'Deblochează')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <OperatorPlanningDialog
        open={!!planningOrderId}
        onConfirm={async (operatorNames) => {
          if (planningOrderId) {
            await handleStatusChange(planningOrderId, 'in_production', operatorNames);
            setPlanningOrderId(null);
          }
        }}
        onSkip={async () => {
          if (planningOrderId) {
            await handleStatusChange(planningOrderId, 'in_production', {});
            setPlanningOrderId(null);
          }
        }}
      />

      <CreateInstallationDialog
        open={!!installationOrder}
        onOpenChange={(open) => { if (!open) setInstallationOrder(null); }}
        order={installationOrder || undefined}
      />

      <CreateInvoiceDialog
        open={!!invoiceOrder}
        onOpenChange={(open) => { if (!open) setInvoiceOrder(null); }}
        orderId={invoiceOrder?.id || null}
        defaultType={invoiceOrder?.type || 'fiscal'}
      />

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboard.deleteOrder')}</AlertDialogTitle>
            <AlertDialogDescription>{t('dashboard.deleteOrderConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { if (deleteOrderId) { await deleteOrder.mutateAsync(deleteOrderId); setDeleteOrderId(null); } }}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
