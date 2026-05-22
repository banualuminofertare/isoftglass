import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceTickets } from '@/hooks/useServiceTickets';
import { useOrders } from '@/hooks/useOrders';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTicketDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { createTicket } = useServiceTickets();
  const { orders } = useOrders();
  const [form, setForm] = useState({
    order_id: '',
    ticket_type: 'reclamatie_client',
    priority: 'medie',
    description: '',
    intervention_address: '',
    resolution_deadline: '',
  });

  const selectedOrder = orders.find(o => o.id === form.order_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate(
      {
        order_id: form.order_id || undefined,
        client_id: selectedOrder?.client_id || undefined,
        ticket_type: form.ticket_type,
        priority: form.priority,
        description: form.description,
        intervention_address: form.intervention_address || undefined,
        resolution_deadline: form.resolution_deadline || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({
            order_id: '', ticket_type: 'reclamatie_client', priority: 'medie',
            description: '', intervention_address: '', resolution_deadline: '',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('service.newComplaintTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('service.newComplaintDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('service.associatedOrder')}</Label>
            <Select value={form.order_id} onValueChange={(v) => setForm(f => ({ ...f, order_id: v }))}>
              <SelectTrigger><SelectValue placeholder={t('service.selectOrder')} /></SelectTrigger>
              <SelectContent>
                {orders.map(o => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.order_number} - {o.clients?.name || o.clients?.company_name || t('service.noClient')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOrder?.clients && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {t('common.client')}: <strong>{selectedOrder.clients.name}</strong>
              {selectedOrder.clients.phone && ` | ${t('common.phone')}: ${selectedOrder.clients.phone}`}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('service.problemType')}</Label>
              <Select value={form.ticket_type} onValueChange={(v) => setForm(f => ({ ...f, ticket_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="defect_productie">{t('service.type_productionDefect')}</SelectItem>
                  <SelectItem value="defect_montaj">{t('service.type_installationDefect')}</SelectItem>
                  <SelectItem value="deteriorare_transport">{t('service.type_transportDamage')}</SelectItem>
                  <SelectItem value="reclamatie_client">{t('service.type_clientComplaint')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('service.priority')}</Label>
              <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scazuta">{t('service.priority_low')}</SelectItem>
                  <SelectItem value="medie">{t('service.priority_medium')}</SelectItem>
                  <SelectItem value="urgenta">{t('service.priority_urgent')}</SelectItem>
                  <SelectItem value="critica">{t('service.priority_critical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t('service.problemDescription')} *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={t('service.descriptionPlaceholder')}
              required
            />
          </div>

          <div>
            <Label>{t('service.interventionAddress')}</Label>
            <Input
              value={form.intervention_address}
              onChange={(e) => setForm(f => ({ ...f, intervention_address: e.target.value }))}
              placeholder={t('service.interventionAddressPlaceholder')}
            />
          </div>

          <div>
            <Label>{t('service.resolutionDeadline')}</Label>
            <Input
              type="date"
              value={form.resolution_deadline}
              onChange={(e) => setForm(f => ({ ...f, resolution_deadline: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={createTicket.isPending}>
              {createTicket.isPending ? t('service.creating') : t('service.createComplaint')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}