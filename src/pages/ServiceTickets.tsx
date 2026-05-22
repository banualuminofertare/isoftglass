import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, AlertTriangle, CheckCircle, Clock, XCircle, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';
import { useServiceTickets, type ServiceTicket } from '@/hooks/useServiceTickets';
import { TicketStatusBadge, TicketPriorityBadge, TicketTypeLabel } from '@/components/service/TicketStatusBadge';
import { CreateTicketDialog } from '@/components/service/CreateTicketDialog';
import { TicketDetailsDialog } from '@/components/service/TicketDetailsDialog';
import { AddInterventionDialog } from '@/components/service/AddInterventionDialog';
import { ServiceAnalyticsCharts } from '@/components/service/ServiceAnalyticsCharts';

const DATE_LOCALES = { ro, en: enUS, de, it, pl } as const;

export default function ServiceTickets() {
  const { t, i18n } = useTranslation();
  const dateLoc = DATE_LOCALES[i18n.language] || ro;
  const { tickets, isLoading } = useServiceTickets();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [interventionTicketId, setInterventionTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (typeFilter !== 'all' && t.ticket_type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          t.ticket_number.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          t.clients?.name?.toLowerCase().includes(s) ||
          t.orders?.order_number?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, typeFilter, search]);

  const stats = useMemo(() => {
    const open = tickets.filter(t => !['rezolvat', 'inchis'].includes(t.status)).length;
    const resolved = tickets.filter(t => t.status === 'rezolvat' || t.status === 'inchis').length;
    const critical = tickets.filter(t => t.priority === 'critica' && !['rezolvat', 'inchis'].includes(t.status)).length;
    return { total: tickets.length, open, resolved, critical };
  }, [tickets]);

  const openDetails = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };

  return (
    <AppLayout title={t('service.title')}>
      <div className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-2 border-blue-500"><CardContent className="pt-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-blue-50"><AlertTriangle className="h-8 w-8 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">{t('service.totalComplaints')}</p></div>
          </CardContent></Card>
          <Card className="border-2 border-orange-500"><CardContent className="pt-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-orange-50"><Clock className="h-8 w-8 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{stats.open}</p><p className="text-xs text-muted-foreground">{t('service.open')}</p></div>
          </CardContent></Card>
          <Card className="border-2 border-green-500"><CardContent className="pt-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-green-50"><CheckCircle className="h-8 w-8 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{stats.resolved}</p><p className="text-xs text-muted-foreground">{t('service.resolved')}</p></div>
          </CardContent></Card>
          <Card className="border-2 border-red-500"><CardContent className="pt-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-red-50"><XCircle className="h-8 w-8 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{stats.critical}</p><p className="text-xs text-muted-foreground">{t('service.activeCritical')}</p></div>
          </CardContent></Card>
        </div>

        <ServiceAnalyticsCharts tickets={tickets} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('service.searchPlaceholder')}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('common.status')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="deschis">{t('service.status_open')}</SelectItem>
              <SelectItem value="in_evaluare">{t('service.status_inEvaluation')}</SelectItem>
              <SelectItem value="programat">{t('service.status_scheduled')}</SelectItem>
              <SelectItem value="in_lucru">{t('service.status_inProgress')}</SelectItem>
              <SelectItem value="rezolvat">{t('service.status_resolved')}</SelectItem>
              <SelectItem value="inchis">{t('service.status_closed')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('service.priority')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="scazuta">{t('service.priority_low')}</SelectItem>
              <SelectItem value="medie">{t('service.priority_medium')}</SelectItem>
              <SelectItem value="urgenta">{t('service.priority_urgent')}</SelectItem>
              <SelectItem value="critica">{t('service.priority_critical')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder={t('common.type')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="defect_productie">{t('service.type_productionDefect')}</SelectItem>
              <SelectItem value="defect_montaj">{t('service.type_installationDefect')}</SelectItem>
              <SelectItem value="deteriorare_transport">{t('service.type_transportDamage')}</SelectItem>
              <SelectItem value="reclamatie_client">{t('service.type_clientComplaint')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t('service.newComplaint')}
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('service.ticketNo')}</TableHead>
                  <TableHead>{t('common.type')}</TableHead>
                  <TableHead>{t('common.client')}</TableHead>
                  <TableHead>{t('common.orders')}</TableHead>
                  <TableHead>{t('service.priority')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead className="w-[120px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t('service.noComplaintsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map(ticket => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() => openDetails(ticket)}
                    >
                      <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                      <TableCell><TicketTypeLabel type={ticket.ticket_type} /></TableCell>
                      <TableCell>{ticket.clients?.name || '—'}</TableCell>
                      <TableCell>{ticket.orders?.order_number || '—'}</TableCell>
                      <TableCell><TicketPriorityBadge priority={ticket.priority} /></TableCell>
                      <TableCell><TicketStatusBadge status={ticket.status} /></TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: dateLoc })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInterventionTicketId(ticket.id);
                          }}
                        >
                          <Wrench className="h-3 w-3 mr-1" /> {t('service.intervention')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TicketDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} ticket={selectedTicket} />
      {interventionTicketId && (
        <AddInterventionDialog
          open={!!interventionTicketId}
          onOpenChange={(open) => { if (!open) setInterventionTicketId(null); }}
          ticketId={interventionTicketId}
        />
      )}
    </AppLayout>
  );
}