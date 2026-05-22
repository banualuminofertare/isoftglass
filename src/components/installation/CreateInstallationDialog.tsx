import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstallation, type InstallationJob } from '@/hooks/useInstallation';
import { useInstallationTeams } from '@/hooks/useInstallationTeams';
import { useInstallationChecklists } from '@/hooks/useInstallationChecklists';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { FileText } from 'lucide-react';

interface OrderForInstallation {
  id: string;
  order_number: string;
  delivery_address?: string | null;
  delivery_date?: string | null;
  clients?: { name: string; phone?: string | null; email?: string | null } | null;
}

interface CreateInstallationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  order?: OrderForInstallation;
  rescheduleJob?: InstallationJob | null;
}

export function CreateInstallationDialog({ open, onOpenChange, defaultDate, order, rescheduleJob }: CreateInstallationDialogProps) {
  const { t } = useTranslation();
  const { createJob, updateJob } = useInstallation();
  const { teams } = useInstallationTeams();
  const { templates } = useInstallationChecklists();
  const { user } = useAuth();
  const { orders: allOrders } = useOrders();
  
  const getInitialForm = () => {
    if (rescheduleJob) {
      return {
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        scheduled_time: rescheduleJob.scheduled_time || '09:00',
        client_name: rescheduleJob.client_name || '',
        client_code: rescheduleJob.client_code || '',
        client_phone: rescheduleJob.client_phone || '',
        address: rescheduleJob.address || '',
        city: rescheduleJob.city || '',
        postal_code: rescheduleJob.postal_code || '',
        team_id: rescheduleJob.team_id || '',
        notes: rescheduleJob.notes || '',
        checklist_template_id: '',
        order_id: rescheduleJob.order_id || '',
      };
    }
    return {
      scheduled_date: order?.delivery_date || (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
      scheduled_time: '09:00',
      client_name: order?.clients?.name || '',
      client_code: '',
      client_phone: order?.clients?.phone || '',
      address: order?.delivery_address || '',
      city: '',
      postal_code: '',
      team_id: '',
      notes: order ? t('installation.orderNote', { orderNumber: order.order_number }) : '',
      checklist_template_id: '',
      order_id: order?.id || '',
    };
  };

  const [form, setForm] = useState(getInitialForm());

  useEffect(() => {
    if (open) setForm(getInitialForm());
  }, [open, order?.id, rescheduleJob?.id]);

  const handleOrderSelect = (orderId: string) => {
    const selected = allOrders.find(o => o.id === orderId);
    if (!selected) return;
    setForm(f => ({
      ...f,
      order_id: selected.id,
      client_name: selected.clients?.name || f.client_name,
      client_code: selected.clients?.cui || f.client_code,
      client_phone: selected.clients?.phone || f.client_phone,
      address: selected.delivery_address || selected.clients?.address || f.address,
      city: selected.clients?.city || f.city,
      postal_code: selected.clients?.postal_code || f.postal_code,
      scheduled_date: selected.delivery_date || f.scheduled_date,
      notes: f.notes ? `${f.notes}\n${t('installation.orderNote', { orderNumber: selected.order_number })}` : t('installation.orderNote', { orderNumber: selected.order_number }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTemplate = templates.find(t => t.id === form.checklist_template_id);
    const checklistItems = selectedTemplate ? selectedTemplate.items.map(item => ({ ...item, checked: false })) : [];
    
    // If rescheduling, mark old job as postponed first
    if (rescheduleJob) {
      await updateJob.mutateAsync({ id: rescheduleJob.id, status: 'postponed' });
    }
    
    await createJob.mutateAsync({
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time || null,
      client_name: form.client_name || null,
      client_code: form.client_code || null,
      client_phone: form.client_phone || null,
      address: form.address || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      team_id: form.team_id || null,
      notes: form.notes || null,
      checklist: checklistItems,
      created_by: user?.id || null,
      order_id: form.order_id || null,
    } as any);
    onOpenChange(false);
    setForm(getInitialForm());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rescheduleJob ? t('installation.rescheduleJob', 'Reprogramează Montaj') : t('installation.newJob')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order selector */}
          {!order && allOrders.length > 0 && (
            <div className="mt-6">
              <Label className="flex items-center gap-1.5 mb-3">
                <FileText className="h-4 w-4" />
                {t('installation.selectOrder')}
              </Label>
              <Select value={form.order_id} onValueChange={handleOrderSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t('installation.selectOrderPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {allOrders.map(o => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.order_number} — {o.clients?.name || t('installation.noClient')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('installation.scheduledDate')}</Label>
              <Input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} required />
            </div>
            <div>
              <Label>{t('installation.scheduledTime')}</Label>
              <Input type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('installation.clientName')}</Label>
              <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder={t('installation.clientNamePlaceholder')} />
            </div>
            <div>
              <Label>{t('installation.clientCode')}</Label>
              <Input value={form.client_code} onChange={e => setForm(f => ({ ...f, client_code: e.target.value }))} placeholder={t('installation.clientCodePlaceholder')} />
            </div>
          </div>

          <div>
            <Label>{t('common.phone')}</Label>
            <Input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))} placeholder={t('installation.phonePlaceholder')} />
          </div>

          <div>
            <Label>{t('common.address')}</Label>
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder={t('installation.addressPlaceholder')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('installation.city')}</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder={t('installation.cityPlaceholder')} />
            </div>
            <div>
              <Label>{t('installation.postalCode')}</Label>
              <Input value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder={t('installation.postalCodePlaceholder')} />
            </div>
          </div>

          <div>
            <Label>{t('installation.team')}</Label>
            <Select value={form.team_id} onValueChange={v => setForm(f => ({ ...f, team_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('installation.selectTeam')} />
              </SelectTrigger>
              <SelectContent>
                {teams.filter(t => t.is_active).map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('installation.checklistTemplate')}</Label>
            <Select value={form.checklist_template_id} onValueChange={v => setForm(f => ({ ...f, checklist_template_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('installation.selectChecklist')} />
              </SelectTrigger>
              <SelectContent>
                {templates.map(tpl => (
                  <SelectItem key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.items.length} {t('installation.itemsCount')})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('common.notes')}</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder={t('installation.notesPlaceholder')} rows={2} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={createJob.isPending}>{t('common.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
