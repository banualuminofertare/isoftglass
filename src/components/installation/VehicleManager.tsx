import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Truck, Plus, Pencil, Trash2, AlertTriangle, CheckCircle, Wrench, Users } from 'lucide-react';
import { useInstallationVehicles, InstallationVehicle } from '@/hooks/useInstallationVehicles';
import { useInstallationTeams } from '@/hooks/useInstallationTeams';
import { format, differenceInDays, parseISO } from 'date-fns';

const getStatusConfig = (t: any) => ({
  available: { label: t('installation.vehicleStatusAvailable'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  in_service: { label: t('installation.vehicleStatusService'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Wrench },
  occupied: { label: t('installation.vehicleStatusOccupied'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Users },
});

function ExpiryBadge({ date, label, expiredLabel }: { date: string | null; label: string; expiredLabel: string }) {
  if (!date) return <span className="text-xs text-muted-foreground">{label}: —</span>;
  const daysLeft = differenceInDays(parseISO(date), new Date());
  const isExpired = daysLeft < 0;
  const isWarning = daysLeft >= 0 && daysLeft <= 30;
  return (
    <span className={`text-xs flex items-center gap-1 ${isExpired ? 'text-destructive font-semibold' : isWarning ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-muted-foreground'}`}>
      {(isExpired || isWarning) && <AlertTriangle className="h-3 w-3" />}
      {label}: {format(parseISO(date), 'dd.MM.yyyy')}
      {isExpired && ` (${expiredLabel})`}
      {isWarning && !isExpired && ` (${daysLeft}z)`}
    </span>
  );
}

interface VehicleFormData {
  plate_number: string;
  brand: string;
  model: string;
  year: string;
  team_id: string;
  itp_expiry: string;
  rca_expiry: string;
  revision_date: string;
  status: 'available' | 'in_service' | 'occupied';
  notes: string;
}

const emptyForm: VehicleFormData = {
  plate_number: '', brand: '', model: '', year: '', team_id: '', itp_expiry: '', rca_expiry: '', revision_date: '', status: 'available', notes: '',
};

export function VehicleManager() {
  const { t } = useTranslation();
  const { vehicles, isLoading, createVehicle, updateVehicle, deleteVehicle } = useInstallationVehicles();
  const { teams } = useInstallationTeams();
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleFormData>(emptyForm);

  const filteredVehicles = useMemo(
    () => showOnlyActive ? vehicles.filter(v => v.is_active) : vehicles,
    [vehicles, showOnlyActive]
  );

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (v: InstallationVehicle) => {
    setForm({
      plate_number: v.plate_number,
      brand: v.brand || '',
      model: v.model || '',
      year: v.year?.toString() || '',
      team_id: v.team_id || '',
      itp_expiry: v.itp_expiry || '',
      rca_expiry: v.rca_expiry || '',
      revision_date: v.revision_date || '',
      status: v.status,
      notes: v.notes || '',
    });
    setEditingId(v.id);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.plate_number.trim()) return;
    const payload: any = {
      plate_number: form.plate_number.trim(),
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      year: form.year ? parseInt(form.year) : null,
      team_id: form.team_id && form.team_id !== '__none__' ? form.team_id : null,
      itp_expiry: form.itp_expiry || null,
      rca_expiry: form.rca_expiry || null,
      revision_date: form.revision_date || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };
    if (editingId) {
      updateVehicle.mutate({ id: editingId, ...payload });
    } else {
      createVehicle.mutate(payload);
    }
    setDialogOpen(false);
  };

  // Count warnings
  const warningCount = useMemo(() => {
    return vehicles.filter(v => {
      if (!v.is_active) return false;
      const check = (d: string | null) => d && differenceInDays(parseISO(d), new Date()) <= 30;
      return check(v.itp_expiry) || check(v.rca_expiry) || check(v.revision_date);
    }).length;
  }, [vehicles]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} size="sm">
                <Plus className="h-4 w-4 mr-1" /> {t('installation.vehicleAdd')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? t('installation.vehicleEdit') : t('installation.vehicleAdd')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t('installation.vehiclePlate')} *</Label>
                    <Input value={form.plate_number} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))} placeholder="B 123 ABC" />
                  </div>
                  <div>
                    <Label>{t('installation.vehicleStatus')}</Label>
                    <Select value={form.status} onValueChange={(v: any) => setForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t('installation.vehicleStatusAvailable')}</SelectItem>
                        <SelectItem value="in_service">{t('installation.vehicleStatusService')}</SelectItem>
                        <SelectItem value="occupied">{t('installation.vehicleStatusOccupied')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>{t('installation.vehicleBrand')}</Label>
                    <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder={t("ui.placeholderExampleBrand")} />
                  </div>
                  <div>
                    <Label>{t('installation.vehicleModel')}</Label>
                    <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder={t("ui.placeholderExampleModel")} />
                  </div>
                  <div>
                    <Label>{t('installation.vehicleYear')}</Label>
                    <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2022" />
                  </div>
                </div>
                <div>
                  <Label>{t('installation.vehicleTeam')}</Label>
                  <Select value={form.team_id} onValueChange={v => setForm(f => ({ ...f, team_id: v }))}>
                    <SelectTrigger><SelectValue placeholder={t('installation.vehicleNoTeam')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t('installation.vehicleNoTeam')}</SelectItem>
                      {teams.filter(t => t.is_active).map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>ITP</Label>
                    <Input type="date" value={form.itp_expiry} onChange={e => setForm(f => ({ ...f, itp_expiry: e.target.value }))} />
                  </div>
                  <div>
                    <Label>RCA</Label>
                    <Input type="date" value={form.rca_expiry} onChange={e => setForm(f => ({ ...f, rca_expiry: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t('installation.vehicleRevision')}</Label>
                    <Input type="date" value={form.revision_date} onChange={e => setForm(f => ({ ...f, revision_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>{t('installation.vehicleNotes')}</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={!form.plate_number.trim()}>
                  {editingId ? t('installation.vehicleSave') : t('installation.vehicleAdd')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {warningCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> {warningCount} {t('installation.vehicleWarnings')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t('installation.vehicleShowActive')}</span>
          <Switch checked={showOnlyActive} onCheckedChange={setShowOnlyActive} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">{t('installation.loading')}</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t('installation.vehicleEmpty')}</p>
          <p className="text-sm">{t('installation.vehicleEmptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map(v => {
            const statusCfg = getStatusConfig(t)[v.status];
            const StatusIcon = statusCfg.icon;
            return (
              <Card key={v.id} className={`relative ${!v.is_active ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold tracking-wider">{v.plate_number}</CardTitle>
                    <Badge className={`${statusCfg.color} gap-1 text-[10px]`}>
                      <StatusIcon className="h-3 w-3" /> {statusCfg.label}
                    </Badge>
                  </div>
                  {(v.brand || v.model) && (
                    <p className="text-sm text-muted-foreground">
                      {[v.brand, v.model, v.year].filter(Boolean).join(' ')}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {v.team && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{v.team.name}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <ExpiryBadge date={v.itp_expiry} label="ITP" expiredLabel={t('installation.expired')} />
                    <ExpiryBadge date={v.rca_expiry} label="RCA" expiredLabel={t('installation.expired')} />
                    <ExpiryBadge date={v.revision_date} label={t('installation.vehicleRevision')} expiredLabel={t('installation.expired')} />
                  </div>
                  {v.notes && <p className="text-xs text-muted-foreground italic">{v.notes}</p>}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={v.is_active}
                        onCheckedChange={checked => updateVehicle.mutate({ id: v.id, is_active: checked })}
                      />
                      <span className="text-xs text-muted-foreground">{v.is_active ? t('installation.active') : t('installation.inactive')}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(v)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('installation.vehicleDeleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('installation.vehicleDeleteDesc', { plate: v.plate_number })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('installation.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteVehicle.mutate(v.id)} className="bg-destructive text-destructive-foreground">
                              {t('installation.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
