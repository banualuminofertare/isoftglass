import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, Users, Truck, UserPlus, Phone, Filter } from 'lucide-react';
import { useInstallationTeams, InstallationTeam, TeamMember } from '@/hooks/useInstallationTeams';
import { Switch } from '@/components/ui/switch';

export function TeamManager() {
  const { t } = useTranslation();
  const { teams, isLoading, createTeam, updateTeam, deleteTeam } = useInstallationTeams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InstallationTeam | null>(null);
  const [form, setForm] = useState({ name: '', vehicle: '', members: [] as TeamMember[], is_active: true });
  const [newMember, setNewMember] = useState({ name: '', phone: '', role: '' });
  const [deleteTarget, setDeleteTarget] = useState<InstallationTeam | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredTeams = showAll ? teams : teams.filter(t => t.is_active);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', vehicle: '', members: [], is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (team: InstallationTeam) => {
    setEditing(team);
    setForm({ name: team.name, vehicle: team.vehicle || '', members: team.members || [], is_active: team.is_active });
    setDialogOpen(true);
  };

  const addMember = () => {
    if (!newMember.name.trim()) return;
    setForm(f => ({ ...f, members: [...f.members, { ...newMember }] }));
    setNewMember({ name: '', phone: '', role: '' });
  };

  const removeMember = (idx: number) => {
    setForm(f => ({ ...f, members: f.members.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateTeam.mutateAsync({ id: editing.id, name: form.name, vehicle: form.vehicle || null, members: form.members as any, is_active: form.is_active });
    } else {
      await createTeam.mutateAsync({ name: form.name, vehicle: form.vehicle || null, members: form.members as any });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('installation.teams')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant={showAll ? 'secondary' : 'outline'} size="sm" onClick={() => setShowAll(!showAll)} className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            {showAll ? t('installation.allTeams', 'Toate') : t('installation.activeOnly', 'Active')}
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('installation.newTeam')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map(team => (
          <Card key={team.id} className={!team.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {team.name}
                  <Badge variant="outline" className="text-[10px] py-0">{(team.members || []).length} {t('installation.membersCount', 'membri')}</Badge>
                  {!team.is_active && <Badge variant="secondary" className="text-xs">{t('installation.inactive')}</Badge>}
                </span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(team)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(team)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {team.vehicle && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" />
                  {team.vehicle}
                </div>
              )}
              <div className="space-y-1">
                {(team.members || []).map((m, i) => (
                  <div key={i} className="text-sm flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5">
                        {m.name}
                        {m.role && <Badge variant="outline" className="text-[10px] py-0">{m.role}</Badge>}
                      </span>
                      {m.phone && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />{m.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(!team.members || team.members.length === 0) && (
                  <p className="text-xs text-muted-foreground">{t('installation.noMembers')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredTeams.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t('installation.noTeams')}</p>
            <p className="text-sm">{t('installation.noTeamsHint')}</p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('installation.deleteTeamTitle', 'Șterge echipa')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('installation.deleteTeamConfirm', 'Ești sigur că vrei să ștergi echipa "{{name}}"? Această acțiune nu poate fi anulată.').replace('{{name}}', deleteTarget?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteTarget) deleteTeam.mutate(deleteTarget.id); setDeleteTarget(null); }}>
              {t('common.delete', 'Șterge')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('installation.editTeam') : t('installation.newTeam')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('common.name')}</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t("ui.placeholderExampleTeam")} required />
            </div>
            <div>
              <Label>{t('installation.vehicle')}</Label>
              <Input value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} placeholder="ex: Dacia Dokker B-123-ABC" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><UserPlus className="h-3.5 w-3.5" /> {t('installation.teamMembers')}</Label>
              {form.members.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1">
                  <div className="flex-1">
                    <span>{m.name} {m.role && `(${m.role})`}</span>
                    {m.phone && <span className="text-muted-foreground ml-2 text-xs">📞 {m.phone}</span>}
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeMember(i)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="space-y-2">
                <Input placeholder={t('installation.memberName')} value={newMember.name} onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))} />
                <div className="flex gap-2">
                  <Input placeholder={t('installation.memberPhone')} value={newMember.phone} onChange={e => setNewMember(m => ({ ...m, phone: e.target.value }))} className="flex-1" />
                  <Input placeholder={t('installation.memberRole')} value={newMember.role} onChange={e => setNewMember(m => ({ ...m, role: e.target.value }))} className="flex-1" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addMember} className="w-full">{t('installation.addMember')}</Button>
              </div>
            </div>

            {editing && (
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>{t('common.active')}</Label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
