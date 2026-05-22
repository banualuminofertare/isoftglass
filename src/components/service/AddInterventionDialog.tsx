import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTicketInterventions } from '@/hooks/useServiceTickets';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
}

export function AddInterventionDialog({ open, onOpenChange, ticketId }: Props) {
  const { t } = useTranslation();
  const { addIntervention } = useTicketInterventions(ticketId);
  const [form, setForm] = useState({
    assigned_to: '',
    scheduled_date: '',
    estimated_cost: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIntervention.mutate(
      {
        ticket_id: ticketId,
        assigned_to: form.assigned_to || undefined,
        scheduled_date: form.scheduled_date || undefined,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ assigned_to: '', scheduled_date: '', estimated_cost: '', notes: '' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('service.scheduleIntervention')}</DialogTitle>
          <DialogDescription className="sr-only">{t('service.scheduleInterventionDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('service.assignedTeam')}</Label>
            <Input
              value={form.assigned_to}
              onChange={(e) => setForm(f => ({ ...f, assigned_to: e.target.value }))}
              placeholder={t('service.assignedTeamPlaceholder')}
            />
          </div>
          <div>
            <Label>{t('service.scheduledDateLabel')}</Label>
            <Input
              type="date"
              value={form.scheduled_date}
              onChange={(e) => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
            />
          </div>
          <div>
            <Label>{t('service.estimatedCostRON')}</Label>
            <Input
              type="number"
              value={form.estimated_cost}
              onChange={(e) => setForm(f => ({ ...f, estimated_cost: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div>
            <Label>{t('service.notesLabel')}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={t('service.notesPlaceholder')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={addIntervention.isPending}>
              {addIntervention.isPending ? t('service.saving') : t('service.addInterventionBtn')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}