import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, MessageSquare, Phone, Mail, Calendar, Bell, CheckCircle } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { LeadFormDialog } from './LeadFormDialog';
import type { CrmLead, CrmLeadActivity } from '@/hooks/useCrmLeads';

interface LeadsTableProps {
  leads: CrmLead[];
  onCreateLead: (lead: Partial<CrmLead>) => Promise<void>;
  onUpdateLead: (id: string, updates: Partial<CrmLead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onAddActivity: (leadId: string, description: string, type?: string) => Promise<void>;
  onFetchActivities: (leadId: string) => Promise<CrmLeadActivity[]>;
  initialStageFilter?: string;
}

export function LeadsTable({ leads, onCreateLead, onUpdateLead, onDeleteLead, onAddActivity, onFetchActivities, initialStageFilter }: LeadsTableProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState(initialStageFilter || 'all');

  useEffect(() => {
    if (initialStageFilter) {
      setStageFilter(initialStageFilter);
    }
  }, [initialStageFilter]);
  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState<CrmLead | null>(null);
  const [detailLead, setDetailLead] = useState<CrmLead | null>(null);
  const [activities, setActivities] = useState<CrmLeadActivity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CrmLead | null>(null);

  const STAGE_CONFIG: Record<string, { label: string; className: string }> = {
    nou: { label: t('crm.stageNew'), className: 'bg-gray-100 text-gray-700 border-gray-300' },
    contactat: { label: t('crm.stageContacted'), className: 'bg-blue-100 text-blue-700 border-blue-300' },
    interesat: { label: t('crm.stageInterested'), className: 'bg-violet-100 text-violet-700 border-violet-300' },
    demo: { label: t('crm.stageDemo'), className: 'bg-amber-100 text-amber-700 border-amber-300' },
    negociere: { label: t('crm.stageNegotiation'), className: 'bg-orange-100 text-orange-700 border-orange-300' },
    castigat: { label: t('crm.stageWon'), className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    pierdut: { label: t('crm.stageLost'), className: 'bg-red-100 text-red-700 border-red-300' },
    pauza: { label: t('crm.stagePaused'), className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  };

  const SOURCE_LABELS: Record<string, string> = {
    website: t('crm.sourceWebsite'), referral: t('crm.sourceReferral'), social_media: t('crm.sourceSocialMedia'),
    cold_call: t('crm.sourceColdCall'), email: t('crm.sourceEmail'), event: t('crm.sourceEvent'), other: t('crm.sourceOther'),
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search || 
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').includes(search);
    const matchStage = stageFilter === 'all' || l.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const openDetail = async (lead: CrmLead) => {
    setDetailLead(lead);
    const acts = await onFetchActivities(lead.id);
    setActivities(acts);
  };

  const handleAddNote = async () => {
    if (!detailLead || !newNote.trim()) return;
    await onAddActivity(detailLead.id, newNote.trim());
    setNewNote('');
    const acts = await onFetchActivities(detailLead.id);
    setActivities(acts);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t('crm.leadsAndProspects')}</CardTitle>
              <CardDescription>{t('crm.leadsCount', { filtered: filtered.length, total: leads.length })}</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => { setEditLead(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> {t('crm.newLead')}
            </Button>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('crm.searchLeads')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('crm.allStages')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('crm.allStages')}</SelectItem>
                {Object.entries(STAGE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t('crm.noLeadsFound')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('crm.contact')}</TableHead>
                  <TableHead>{t('crm.stage')}</TableHead>
                  <TableHead>{t('crm.contacted')}</TableHead>
                  <TableHead>{t('crm.demoDate')}</TableHead>
                  <TableHead>{t('crm.source')}</TableHead>
                  <TableHead>{t('crm.estValue')}</TableHead>
                  <TableHead>{t('crm.revenueCol')}</TableHead>
                  <TableHead>{t('crm.followUp')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => {
                  const stageConf = STAGE_CONFIG[lead.stage] || { label: lead.stage, className: '' };
                  return (
                    <TableRow key={lead.id} className="cursor-pointer" onClick={() => openDetail(lead)}>
                      <TableCell>
                        <p className="font-medium">{lead.full_name}</p>
                        {lead.company_name && <p className="text-xs text-muted-foreground">{lead.company_name}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {lead.phone && <span className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                          {lead.email && <span className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={stageConf.className}>{stageConf.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.contacted_at ? format(new Date(lead.contacted_at), 'dd.MM.yyyy') : '—'}
                      </TableCell>
                      <TableCell>
                        {lead.demo_started_at ? (() => {
                          const days = differenceInCalendarDays(new Date(), new Date(lead.demo_started_at));
                          const isOverdue = days > 6;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {format(new Date(lead.demo_started_at), 'dd.MM.yyyy')}
                              <span className="font-bold">({days} {days === 1 ? t('crm.day') : t('crm.days')})</span>
                            </span>
                          );
                        })() : '—'}
                      </TableCell>
                      <TableCell className="text-sm">{SOURCE_LABELS[lead.source] || lead.source}</TableCell>
                      <TableCell className="text-sm font-medium text-orange-600">
                        {lead.estimated_value ? `${lead.estimated_value.toLocaleString()} RON` : '—'}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-emerald-600">
                        {lead.actual_revenue ? `${lead.actual_revenue.toLocaleString()} RON` : '—'}
                      </TableCell>
                      <TableCell>
                        {lead.next_follow_up ? (() => {
                          const followDate = new Date(lead.next_follow_up);
                          const today = new Date();
                          const isToday = followDate.toDateString() === today.toDateString();
                          const isPast = followDate < today && !isToday;
                          return (
                            <span className={`text-xs flex items-center gap-1 ${isPast ? 'text-destructive font-medium' : isToday ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
                              {isToday && <Bell className="h-4 w-4 text-orange-500 animate-pulse" />}
                              <Calendar className="h-3 w-3" />
                              {format(followDate, 'dd.MM.yyyy')}
                              {isToday && <span className="ml-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">{t('crm.today')}</span>}
                            </span>
                          );
                        })() : '—'}
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditLead(lead); setFormOpen(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(lead)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LeadFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditLead(null); }}
        onSave={async (data) => {
          if (editLead) { await onUpdateLead(editLead.id, data); }
          else { await onCreateLead(data); }
        }}
        editLead={editLead}
        existingLeads={leads}
      />

      {/* Lead detail dialog */}
      <Dialog open={!!detailLead} onOpenChange={o => !o && setDetailLead(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailLead?.full_name}
              {detailLead && <Badge variant="outline" className={STAGE_CONFIG[detailLead.stage]?.className}>{STAGE_CONFIG[detailLead.stage]?.label}</Badge>}
            </DialogTitle>
            <DialogDescription className="sr-only">Detalii lead</DialogDescription>
          </DialogHeader>
          {detailLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {detailLead.company_name && <div><span className="text-muted-foreground">{t('crm.company')}:</span> {detailLead.company_name}</div>}
                {detailLead.email && <div><span className="text-muted-foreground">{t('common.email')}:</span> {detailLead.email}</div>}
                {detailLead.phone && <div><span className="text-muted-foreground">{t('common.phone')}:</span> {detailLead.phone}</div>}
                {detailLead.city && <div><span className="text-muted-foreground">{t('crm.city')}:</span> {detailLead.city}</div>}
                <div><span className="text-muted-foreground">{t('crm.source')}:</span> {SOURCE_LABELS[detailLead.source]}</div>
                <div><span className="text-muted-foreground">{t('crm.estValue')}:</span> <span className="text-orange-600 font-medium">{detailLead.estimated_value?.toLocaleString() || 0} RON</span></div>
                <div><span className="text-muted-foreground">{t('crm.revenueCol')}:</span> <span className="text-emerald-600 font-medium">{detailLead.actual_revenue?.toLocaleString() || 0} RON</span></div>
                {detailLead.next_follow_up && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">{t('crm.followUp')}:</span> {format(new Date(detailLead.next_follow_up), 'dd.MM.yyyy')}
                  </div>
                )}
              </div>

              {detailLead.next_follow_up && new Date(detailLead.next_follow_up) <= new Date(new Date().toDateString()) && (
                <Button
                  variant="outline"
                  className="w-full gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={async () => {
                    await onUpdateLead(detailLead.id, { next_follow_up: null } as Partial<CrmLead>);
                    await onAddActivity(detailLead.id, `${t('crm.confirmCall')} (follow-up ${format(new Date(detailLead.next_follow_up!), 'dd.MM.yyyy')})`, 'call');
                    setDetailLead({ ...detailLead, next_follow_up: null });
                    const acts = await onFetchActivities(detailLead.id);
                    setActivities(acts);
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  {t('crm.confirmCall')}
                </Button>
              )}

              {detailLead.estimated_value > 0 && (!detailLead.actual_revenue || detailLead.actual_revenue === 0) && (
                <Button
                  variant="outline"
                  className="w-full gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  onClick={async () => {
                    await onUpdateLead(detailLead.id, { actual_revenue: detailLead.estimated_value, estimated_value: 0 } as Partial<CrmLead>);
                    await onAddActivity(detailLead.id, `${t('crm.confirmRevenue', { value: detailLead.estimated_value.toLocaleString() })}`, 'payment');
                    setDetailLead({ ...detailLead, actual_revenue: detailLead.estimated_value, estimated_value: 0 });
                    const acts = await onFetchActivities(detailLead.id);
                    setActivities(acts);
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  {t('crm.confirmRevenue', { value: detailLead.estimated_value.toLocaleString() })}
                </Button>
              )}

              {detailLead.notes && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">{detailLead.notes}</div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> {t('crm.activities')}
                </h4>
                <div className="flex gap-2 mb-3">
                  <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder={t('crm.addNote')} rows={2} className="flex-1" />
                  <Button onClick={handleAddNote} disabled={!newNote.trim()} size="sm">{t('crm.addBtn')}</Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.map(a => (
                    <div key={a.id} className="p-2 rounded bg-muted/30 text-sm">
                      <p>{a.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(a.created_at), 'dd.MM.yyyy HH:mm')}</p>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-muted-foreground text-sm">{t('crm.noActivities')}</p>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('crm.deleteLead')}</DialogTitle>
            <DialogDescription className="sr-only">{t('ui.deleteLeadConfirmTitle')}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('crm.deleteLeadConfirm', { name: deleteTarget?.full_name || '' })}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={async () => {
              if (deleteTarget) { await onDeleteLead(deleteTarget.id); setDeleteTarget(null); }
            }}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
