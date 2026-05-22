import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Factory, Headset, Clock, ArrowRight, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInHours, differenceInDays, addDays, isBefore } from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';


const today = () => new Date().toISOString().split('T')[0];

export default function OperationalDashboard() {
  const { t, i18n } = useTranslation();
  const { companyId } = useAuth();
  const ordersRef = useRef<HTMLDivElement>(null);
  const stockRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);
  const ticketsRef = useRef<HTMLDivElement>(null);
  const invoicesRef = useRef<HTMLDivElement>(null);
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Late orders + approaching deadline
  const { data: orders = [] } = useQuery({
    queryKey: ['op-dashboard-orders', companyId],
    enabled: !!companyId,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, delivery_date, total, created_at')
        .eq('company_id', companyId!)
        .not('status', 'in', '("completed","delivered","cancelled")')
        .not('delivery_date', 'is', null)
        .order('delivery_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Production jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ['op-dashboard-jobs', companyId],
    enabled: !!companyId,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_jobs')
        .select('id, job_number, current_stage, started_at, updated_at, client_name, due_date, order_id, orders!inner(company_id)')
        .eq('orders.company_id', companyId!)
        .not('current_stage', 'eq', 'completed')
        .order('updated_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Service tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ['op-dashboard-tickets', companyId],
    enabled: !!companyId,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_tickets')
        .select('id, ticket_number, description, status, priority, created_at, resolution_deadline')
        .eq('company_id', companyId!)
        .in('status', ['deschis', 'in_lucru'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Materials with low stock
  const { data: lowStockMaterials = [] } = useQuery({
    queryKey: ['op-dashboard-stock', companyId],
    enabled: !!companyId,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, code, stock_quantity, min_stock_level, unit')
        .not('min_stock_level', 'is', null)
        .not('stock_quantity', 'is', null);
      if (error) throw error;
      return (data || []).filter(m => 
        m.stock_quantity !== null && m.min_stock_level !== null && m.stock_quantity <= m.min_stock_level
      );
    },
  });

  // Unpaid invoices (issued / partially_paid)
  const { data: unpaidInvoices = [] } = useQuery({
    queryKey: ['op-dashboard-unpaid-invoices', companyId],
    enabled: !!companyId,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices' as any)
        .select('id, invoice_number, total, paid_amount, due_date, issue_date, status, clients(name, company_name)')
        .eq('company_id', companyId!)
        .in('status', ['issued', 'partially_paid'])
        .order('due_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const now = new Date();
  const todayStr = today();
  const threeDaysLater = addDays(now, 3).toISOString().split('T')[0];

  const lateOrders = orders.filter(o => o.delivery_date && o.delivery_date < todayStr);
  const upcomingOrders = orders.filter(o => o.delivery_date && o.delivery_date >= todayStr && o.delivery_date <= threeDaysLater);
  const blockedJobs = jobs.filter(j => j.started_at && differenceInHours(now, new Date(j.updated_at)) > 24);
  const overdueInvoices = unpaidInvoices.filter(i => i.due_date && i.due_date < todayStr);
  const unpaidTotal = unpaidInvoices.reduce((s, i) => s + (Number(i.total) - Number(i.paid_amount)), 0);

  const dateFnsLocales: Record<string, typeof ro> = { ro, en: enUS, de, it, pl };
  const currentLocale = dateFnsLocales[i18n.language] || ro;

  const stageLabels: Record<string, string> = {
    pending: t('opDashboard.stages.pending'),
    cutting: t('opDashboard.stages.cutting'),
    processing: t('opDashboard.stages.processing'),
    tempering: t('opDashboard.stages.tempering'),
    coating: t('opDashboard.stages.coating'),
    assembly: t('opDashboard.stages.assembly'),
    quality_control: t('opDashboard.stages.quality_control'),
    shipping: t('opDashboard.stages.shipping'),
    completed: t('opDashboard.stages.completed'),
    // Legacy keys fallback
    edging: t('opDashboard.stages.processing'),
    lamination: t('opDashboard.stages.coating'),
    quality_check: t('opDashboard.stages.quality_control'),
  };

  const priorityColors: Record<string, string> = {
    scazuta: 'bg-muted text-muted-foreground',
    medie: 'bg-yellow-100 text-yellow-800',
    ridicata: 'bg-orange-100 text-orange-800',
    urgenta: 'bg-destructive/10 text-destructive',
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold">{t('opDashboard.title')}</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title={t('opDashboard.lateOrders')}
            value={lateOrders.length}
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            className="border-destructive/30"
            onClick={() => scrollTo(ordersRef)}
          />
          <StatCard
            title={t('opDashboard.criticalStock')}
            value={lowStockMaterials.length}
            icon={<Package className="h-4 w-4 text-orange-500" />}
            className="border-orange-300"
            onClick={() => scrollTo(stockRef)}
          />
          <StatCard
            title={t('opDashboard.blockedJobs')}
            value={blockedJobs.length}
            icon={<Factory className="h-4 w-4 text-yellow-600" />}
            className="border-yellow-300"
            onClick={() => scrollTo(jobsRef)}
          />
          <StatCard
            title={t('opDashboard.openTickets')}
            value={tickets.length}
            icon={<Headset className="h-4 w-4 text-primary" />}
            className="border-primary/30"
            onClick={() => scrollTo(ticketsRef)}
          />
          <StatCard
            title="Facturi neîncasate"
            value={`${unpaidInvoices.length} (${unpaidTotal.toFixed(0)} RON)`}
            icon={<Receipt className="h-4 w-4 text-pink-500" />}
            className="border-pink-300"
            onClick={() => scrollTo(invoicesRef)}
          />
        </div>

        {/* Detail tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Late & upcoming orders */}
          <Card ref={ordersRef}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-destructive" />
                {t('opDashboard.lateOrdersDeadline')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lateOrders.length === 0 && upcomingOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">{t('opDashboard.noDeadlineCritical')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('opDashboard.orderNumber')}</TableHead>
                      <TableHead>{t('opDashboard.deadline')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...lateOrders, ...upcomingOrders].slice(0, 10).map(order => {
                      const isLate = order.delivery_date! < todayStr;
                      const daysLeft = differenceInDays(new Date(order.delivery_date!), now);
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>
                            <span className={isLate ? 'text-destructive font-semibold' : 'text-yellow-600'}>
                              {format(new Date(order.delivery_date!), 'dd MMM yyyy', { locale: currentLocale })}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {isLate ? `(${t('opDashboard.daysLate', { count: Math.abs(daysLeft) })})` : `(${t('opDashboard.daysLeft', { count: daysLeft })})`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{t(`orderStatus.${order.status}`)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link to="/comenzi" className="text-primary hover:underline">
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Critical stock */}
          <Card ref={stockRef}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                {t('opDashboard.stockBelowMin')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockMaterials.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">{t('opDashboard.allStocksOptimal')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('opDashboard.material')}</TableHead>
                      <TableHead className="text-right">{t('opDashboard.stock')}</TableHead>
                      <TableHead className="text-right">{t('opDashboard.minimum')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockMaterials.slice(0, 10).map(m => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.code}</div>
                        </TableCell>
                        <TableCell className="text-right text-destructive font-semibold">
                          {m.stock_quantity} {m.unit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {m.min_stock_level} {m.unit}
                        </TableCell>
                        <TableCell>
                          <Link to="/inventar" className="text-primary hover:underline">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Blocked jobs */}
          <Card ref={jobsRef}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Factory className="h-4 w-4 text-yellow-600" />
                {t('opDashboard.blockedJobsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {blockedJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">{t('opDashboard.noBlockedJobs')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('opDashboard.jobNumber')}</TableHead>
                      <TableHead>{t('opDashboard.stage')}</TableHead>
                      <TableHead>{t('opDashboard.blockedFor')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedJobs.slice(0, 10).map(job => {
                      const hoursBlocked = differenceInHours(now, new Date(job.updated_at));
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.job_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {stageLabels[job.current_stage] || job.current_stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-destructive font-semibold">
                            {hoursBlocked > 48 ? `${Math.floor(hoursBlocked / 24)}z` : `${hoursBlocked}h`}
                          </TableCell>
                          <TableCell>
                            <Link to="/productie" className="text-primary hover:underline">
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Open tickets */}
          <Card ref={ticketsRef}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Headset className="h-4 w-4 text-primary" />
                {t('opDashboard.openTicketsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">{t('opDashboard.noOpenTickets')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('opDashboard.ticketNumber')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                      <TableHead>{t('opDashboard.priority')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.slice(0, 10).map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {ticket.description}
                        </TableCell>
                        <TableCell>
                         <Badge className={`text-xs ${priorityColors[ticket.priority] || ''}`}>
                            {t(`opDashboard.priorityLabels.${ticket.priority}`, ticket.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link to="/reclamatii" className="text-primary hover:underline">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Unpaid invoices */}
          <Card ref={invoicesRef} className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-pink-500" />
                Facturi neîncasate
                {overdueInvoices.length > 0 && (
                  <Badge variant="destructive" className="text-xs">{overdueInvoices.length} restante</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {unpaidInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">Nicio factură neîncasată</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nr. factură</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Scadență</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Sold</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidInvoices.slice(0, 10).map(inv => {
                      const isOverdue = inv.due_date && inv.due_date < todayStr;
                      const remaining = Number(inv.total) - Number(inv.paid_amount);
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                          <TableCell className="text-sm">{inv.clients?.company_name || inv.clients?.name || '—'}</TableCell>
                          <TableCell>
                            {inv.due_date ? (
                              <span className={isOverdue ? 'text-destructive font-semibold text-sm' : 'text-sm'}>
                                {format(new Date(inv.due_date), 'dd MMM yyyy', { locale: currentLocale })}
                              </span>
                            ) : <span className="text-muted-foreground text-sm">—</span>}
                          </TableCell>
                          <TableCell className="text-right text-sm">{Number(inv.total).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold text-amber-600">{remaining.toFixed(2)}</TableCell>
                          <TableCell>
                            <Link to="/facturare" className="text-primary hover:underline">
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
