import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CrmLead } from '@/hooks/useCrmLeads';

interface LeadFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Partial<CrmLead>) => Promise<void>;
  editLead?: CrmLead | null;
  existingLeads?: CrmLead[];
}

export function LeadFormDialog({ open, onClose, onSave, editLead, existingLeads = [] }: LeadFormDialogProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '', company_name: '', email: '', phone: '',
    city: '', county: '', stage: 'nou', source: 'other',
    estimated_value: 0, notes: '', next_follow_up: '', lost_reason: '', contacted_at: '',
  });

  const STAGES = [
    { value: 'nou', label: t('crm.stageNew') },
    { value: 'contactat', label: t('crm.stageContacted') },
    { value: 'interesat', label: t('crm.stageInterested') },
    { value: 'demo', label: t('crm.stageDemo') },
    { value: 'negociere', label: t('crm.stageNegotiation') },
    { value: 'castigat', label: t('crm.stageWon') },
    { value: 'pierdut', label: t('crm.stageLost') },
    { value: 'pauza', label: t('crm.stagePaused') },
  ];

  const SOURCES = [
    { value: 'website', label: t('crm.sourceWebsite') },
    { value: 'referral', label: t('crm.sourceReferral') },
    { value: 'social_media', label: t('crm.sourceSocialMedia') },
    { value: 'cold_call', label: t('crm.sourceColdCall') },
    { value: 'email', label: t('crm.sourceEmail') },
    { value: 'event', label: t('crm.sourceEvent') },
    { value: 'other', label: t('crm.sourceOther') },
  ];

  useEffect(() => {
    if (editLead) {
      setForm({
        full_name: editLead.full_name || '',
        company_name: editLead.company_name || '',
        email: editLead.email || '',
        phone: editLead.phone || '',
        city: editLead.city || '',
        county: editLead.county || '',
        stage: editLead.stage,
        source: editLead.source,
        estimated_value: editLead.estimated_value || 0,
        notes: editLead.notes || '',
        next_follow_up: editLead.next_follow_up || '',
        lost_reason: editLead.lost_reason || '',
        contacted_at: editLead.contacted_at ? editLead.contacted_at.slice(0, 10) : '',
      });
    } else {
      setForm({
        full_name: '', company_name: '', email: '', phone: '',
        city: '', county: '', stage: 'nou', source: 'other',
        estimated_value: 0, notes: '', next_follow_up: '', lost_reason: '', contacted_at: '',
      });
    }
  }, [editLead, open]);

  const duplicates = useMemo(() => {
    const others = existingLeads.filter(l => !editLead || l.id !== editLead.id);
    const found: string[] = [];
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();
    const name = form.full_name.trim().toLowerCase();
    const company = form.company_name.trim().toLowerCase();

    for (const l of others) {
      if (phone && l.phone && l.phone.trim() === phone) {
        found.push(t('crm.phoneExists', { value: phone, name: l.full_name }));
      }
      if (email && l.email && l.email.trim().toLowerCase() === email) {
        found.push(t('crm.emailExists', { value: email, name: l.full_name }));
      }
      if (name && l.full_name.trim().toLowerCase() === name) {
        found.push(t('crm.nameExists', { value: form.full_name.trim() }));
      }
      if (company && l.company_name && l.company_name.trim().toLowerCase() === company) {
        found.push(t('crm.companyExists', { value: form.company_name.trim(), name: l.full_name }));
      }
    }
    return [...new Set(found)];
  }, [form.phone, form.email, form.full_name, form.company_name, existingLeads, editLead, t]);

  const handleSave = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    const payload: any = {
      ...form,
      estimated_value: Number(form.estimated_value) || 0,
      next_follow_up: form.next_follow_up || null,
      lost_reason: form.lost_reason || null,
      contacted_at: form.contacted_at ? new Date(form.contacted_at).toISOString() : null,
      company_name: form.company_name || null,
      email: form.email || null,
      phone: form.phone || null,
      city: form.city || null,
      county: form.county || null,
      notes: form.notes || null,
    };
    if (form.stage === 'demo' && (!editLead || editLead.stage !== 'demo')) {
      payload.demo_started_at = new Date().toISOString();
    } else if (form.stage !== 'demo' && editLead?.stage === 'demo') {
      payload.demo_started_at = null;
    }
    await onSave(payload);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editLead ? t('crm.editLead') : t('crm.newLead')}</DialogTitle>
          <DialogDescription className="sr-only">{editLead ? 'Editare lead existent' : 'Adăugare lead nou'}</DialogDescription>
        </DialogHeader>
        {duplicates.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium mb-1">{t('crm.duplicateWarning')}</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {duplicates.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label>{t('crm.fullName')}</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('crm.company')}</Label>
            <Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('common.email')}</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('common.phone')}</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('crm.city')}</Label>
            <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('crm.county')}</Label>
            <Input value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('crm.stage')}</Label>
            <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('crm.source')}</Label>
            <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('crm.estimatedValueRON')}</Label>
            <Input type="number" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: +e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('crm.contactDate')}</Label>
            <Input type="date" value={form.contacted_at} onChange={e => setForm(f => ({ ...f, contacted_at: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('crm.nextFollowUp')}</Label>
            <Input type="date" value={form.next_follow_up} onChange={e => setForm(f => ({ ...f, next_follow_up: e.target.value }))} />
          </div>
          {form.stage === 'pierdut' && (
            <div className="col-span-2 space-y-2">
              <Label>{t('crm.lostReason')}</Label>
              <Input value={form.lost_reason} onChange={e => setForm(f => ({ ...f, lost_reason: e.target.value }))} />
            </div>
          )}
          <div className="col-span-2 space-y-2">
            <Label>{t('common.notes')}</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || !form.full_name.trim()}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editLead ? t('common.save') : t('crm.addLead')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
