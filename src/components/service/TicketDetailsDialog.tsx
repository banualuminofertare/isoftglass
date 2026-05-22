import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Clock, Wrench, MapPin, CalendarDays, Pencil, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ro, enUS, de, it, pl } from 'date-fns/locale';
import { type ServiceTicket, useServiceTickets, useTicketInterventions, type ServiceIntervention } from '@/hooks/useServiceTickets';
import { TicketStatusBadge, TicketPriorityBadge, TicketTypeLabel, InterventionResultBadge } from './TicketStatusBadge';
import { AddInterventionDialog } from './AddInterventionDialog';
import { useCurrency } from '@/contexts/CurrencyContext';

const DATE_LOCALES = { ro, en: enUS, de, it, pl } as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: ServiceTicket | null;
}

function InterventionCard({ inv, idx }: { inv: ServiceIntervention; idx: number }) {
  const { t, i18n } = useTranslation();
  const dateLoc = DATE_LOCALES[i18n.language] || ro;
  const { updateIntervention } = useTicketInterventions(inv.ticket_id);
  const { formatPrice } = useCurrency();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    completed_date: inv.completed_date || '',
    duration_minutes: inv.duration_minutes?.toString() || '',
    actual_cost: inv.actual_cost?.toString() || '',
    materials_used: inv.materials_used || '',
    result: inv.result || '',
  });

  const handleSave = () => {
    updateIntervention.mutate({
      id: inv.id,
      completed_date: form.completed_date || undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
      actual_cost: form.actual_cost ? Number(form.actual_cost) : undefined,
      materials_used: form.materials_used || undefined,
      result: form.result || undefined,
    } as any);
    setEditing(false);
  };

  if (editing) {
    return (
      <Card>
        <CardContent className="p-3 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">#{idx + 1} — {inv.assigned_to || t('service.unassigned')}</span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">{t('service.completionDate')}</Label>
              <Input type="date" value={form.completed_date} onChange={e => setForm(f => ({ ...f, completed_date: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">{t('service.durationMinutes')}</Label>
              <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} className="h-8 text-xs" placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">{t('service.actualCostRON')}</Label>
              <Input type="number" value={form.actual_cost} onChange={e => setForm(f => ({ ...f, actual_cost: e.target.value }))} className="h-8 text-xs" placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">{t('service.resultLabel')}</Label>
              <Select value={form.result} onValueChange={v => setForm(f => ({ ...f, result: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('service.selectResult')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rezolvat">{t('service.result_resolved')}</SelectItem>
                  <SelectItem value="partial">{t('service.result_partial')}</SelectItem>
                  <SelectItem value="necesita_revenire">{t('service.result_needsReturn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('service.materialsUsed')}</Label>
            <Input value={form.materials_used} onChange={e => setForm(f => ({ ...f, materials_used: e.target.value }))} className="h-8 text-xs" placeholder={t('service.materialsPlaceholder')} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-3 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">#{idx + 1} — {inv.assigned_to || t('service.unassigned')}</span>
          <div className="flex items-center gap-1">
            {inv.result && <InterventionResultBadge result={inv.result} />}
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          {inv.scheduled_date && (
            <span>{t('service.scheduledDate')} {format(new Date(inv.scheduled_date), 'dd MMM yyyy', { locale: dateLoc })}</span>
          )}
          {inv.completed_date && (
            <span>{t('service.completedDate')} {format(new Date(inv.completed_date), 'dd MMM yyyy', { locale: dateLoc })}</span>
          )}
          {inv.duration_minutes && <span>{t('service.duration')} {inv.duration_minutes} min</span>}
        </div>
        {(inv.estimated_cost || inv.actual_cost) && (
          <div className="flex gap-4 text-muted-foreground">
            {inv.estimated_cost ? <span>{t('service.estimatedCost')} {formatPrice(inv.estimated_cost)}</span> : null}
            {inv.actual_cost ? <span className="font-medium text-foreground">{t('service.actualCost')} {formatPrice(inv.actual_cost)}</span> : null}
          </div>
        )}
        {inv.materials_used && (
          <div className="text-muted-foreground">{t('service.materials')} {inv.materials_used}</div>
        )}
        {inv.notes && <p className="text-muted-foreground">{inv.notes}</p>}
      </CardContent>
    </Card>
  );
}

export function TicketDetailsDialog({ open, onOpenChange, ticket }: Props) {
  const { t, i18n } = useTranslation();
  const dateLoc = DATE_LOCALES[i18n.language] || ro;
  const { updateTicketStatus } = useServiceTickets();
  const { interventions } = useTicketInterventions(ticket?.id);
  const { formatPrice } = useCurrency();
  const [addInterventionOpen, setAddInterventionOpen] = useState(false);

  const totalEstimated = interventions.reduce((s, i) => s + (i.estimated_cost || 0), 0);
  const totalActual = interventions.reduce((s, i) => s + (i.actual_cost || 0), 0);

  if (!ticket) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{ticket.ticket_number}</span>
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </DialogTitle>
            <DialogDescription className="sr-only">{t('service.ticketDetailsDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t('service.typeLabel')}</span>{' '}
                <TicketTypeLabel type={ticket.ticket_type} />
              </div>
              <div>
                <span className="text-muted-foreground">{t('service.orderLabel')}</span>{' '}
                {ticket.orders?.order_number || '—'}
              </div>
              <div>
                <span className="text-muted-foreground">{t('service.clientLabel')}</span>{' '}
                {ticket.clients?.name || '—'}
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{t('service.createdLabel')}</span>{' '}
                {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: dateLoc })}
              </div>
              {ticket.intervention_address && (
                <div className="col-span-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {ticket.intervention_address}
                </div>
              )}
              {ticket.resolution_deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('service.deadline')}</span>{' '}
                  {format(new Date(ticket.resolution_deadline), 'dd MMM yyyy', { locale: dateLoc })}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-1">{t('common.description')}</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{ticket.description}</p>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('service.updateStatus')}</span>
                <Select
                  value={ticket.status}
                  onValueChange={(v) => updateTicketStatus.mutate({ id: ticket.id, status: v })}
                >
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deschis">{t('service.status_open')}</SelectItem>
                    <SelectItem value="in_evaluare">{t('service.status_inEvaluation')}</SelectItem>
                    <SelectItem value="programat">{t('service.status_scheduled')}</SelectItem>
                    <SelectItem value="in_lucru">{t('service.status_inProgress')}</SelectItem>
                    <SelectItem value="rezolvat">{t('service.status_resolved')}</SelectItem>
                    <SelectItem value="inchis">{t('service.status_closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setAddInterventionOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> {t('service.addIntervention')}
              </Button>
            </div>

            <Separator />

            {interventions.length > 0 && (
              <div className="flex gap-6 text-sm bg-muted p-3 rounded">
                <div>
                  <span className="text-muted-foreground">{t('service.totalEstimatedCost')}</span>{' '}
                   <span className="font-medium">{formatPrice(totalEstimated)}</span>
                 </div>
                 <div>
                   <span className="text-muted-foreground">{t('service.totalActualCost')}</span>{' '}
                   <span className="font-bold">{formatPrice(totalActual)}</span>
                </div>
              </div>
            )}

            <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-1">
                  <Wrench className="h-4 w-4" /> {t('service.interventions')} ({interventions.length})
                </h3>

                {interventions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('service.noInterventions')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {interventions.map((inv, idx) => (
                      <InterventionCard key={inv.id} inv={inv} idx={idx} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <AddInterventionDialog
        open={addInterventionOpen}
        onOpenChange={setAddInterventionOpen}
        ticketId={ticket.id}
      />
    </>
  );
}