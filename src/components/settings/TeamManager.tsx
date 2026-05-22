import { useState } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Users, UserPlus, Mail, Trash2, Crown, Calculator, Factory, Ruler, Loader2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function TeamManager() {
  const { t } = useTranslation();
  const { user, companyId, refetchProfile, hasTeamAccess, role } = useAuth();
  const { members, invitations, company, isLoading, isCompanyOwner, inviteMember, cancelInvitation, updateMemberPermissions, removeMember, createCompany, refetch } = useTeam();
  const [isCreating, setIsCreating] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('operator');
  const [inviteCalc, setInviteCalc] = useState(true);
  const [inviteOps, setInviteOps] = useState(false);
  const [inviteProc, setInviteProc] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateCompany = async () => {
    setIsCreating(true);
    const success = await createCompany();
    if (success) {
      refetchProfile();
      setTimeout(() => refetch(), 500);
    }
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isAdmin = role === 'admin';

  if (!isAdmin && !hasTeamAccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{t('settings.team.unavailable')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.team.unavailableDesc')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!companyId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{t('settings.team.noTeam')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.team.noTeamDesc')}</p>
          </div>
          <Button onClick={handleCreateCompany} disabled={isCreating} className="gap-2">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {t('settings.team.createTeam')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    const success = await inviteMember({
      email: inviteEmail.trim(),
      role: inviteRole,
      has_calculator_access: inviteCalc,
      has_operational_access: inviteOps,
      has_processing_access: inviteProc,
    });
    if (success) {
      setInviteEmail('');
      setInviteOpen(false);
    }
    setIsInviting(false);
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  const getRoleLabel = (r: string) => {
    if (r === 'sales') return t('settings.team.roleSales');
    if (r === 'production_manager') return t('settings.team.roleProductionManager');
    if (r === 'operator') return t('settings.team.roleOperator');
    return r;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('settings.team.teamName', { name: company?.name || '' })}
              </CardTitle>
              <CardDescription>
                {t('settings.team.membersCount', { count: members.length, max: company?.max_members || 5 })}
              </CardDescription>
            </div>
            {isCompanyOwner && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    {t('settings.team.inviteMember')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('settings.team.inviteTitle')}</DialogTitle>
                    <DialogDescription className="sr-only">{t('settings.team.inviteDesc')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>{t('settings.team.email')}</Label>
                      <Input
                        type="email"
                        placeholder={t('settings.team.emailPlaceholder')}
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('settings.team.role')}</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operator">{t('settings.team.roleOperator')}</SelectItem>
                          <SelectItem value="sales">{t('settings.team.roleSales')}</SelectItem>
                          <SelectItem value="production_manager">{t('settings.team.roleProductionManager')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">{t('settings.team.modulePermissions')}</Label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{t('settings.team.calculators')}</span>
                        </div>
                        <Switch checked={inviteCalc} onCheckedChange={setInviteCalc} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Factory className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">{t('settings.team.operational')}</span>
                        </div>
                        <Switch checked={inviteOps} onCheckedChange={setInviteOps} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{t('settings.team.processing')}</span>
                        </div>
                        <Switch checked={inviteProc} onCheckedChange={setInviteProc} />
                      </div>
                    </div>
                    <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()} className="w-full">
                      {isInviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                      {t('settings.team.sendInvitation')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map(member => (
            <div key={member.user_id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {(member.full_name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{member.full_name || t('settings.team.noName')}</span>
                    {member.is_owner && (
                      <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/50 text-amber-600">
                        <Crown className="h-2.5 w-2.5" /> Owner
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  {member.email && (
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {member.has_calculator_access && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-blue-600 border-blue-200">Calc</Badge>}
                    {member.has_operational_access && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-emerald-600 border-emerald-200">Opr</Badge>}
                    {member.has_processing_access && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-orange-600 border-orange-200">Prel</Badge>}
                  </div>
                </div>
              </div>
              {isCompanyOwner && !member.is_owner && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-3 mr-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <Calculator className="h-3 w-3 text-blue-500" />
                      <Switch
                        checked={member.has_calculator_access}
                        onCheckedChange={v => updateMemberPermissions(member.user_id, { has_calculator_access: v })}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Factory className="h-3 w-3 text-emerald-500" />
                      <Switch
                        checked={member.has_operational_access}
                        onCheckedChange={v => updateMemberPermissions(member.user_id, { has_operational_access: v })}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Ruler className="h-3 w-3 text-orange-500" />
                      <Switch
                        checked={member.has_processing_access}
                        onCheckedChange={v => updateMemberPermissions(member.user_id, { has_processing_access: v })}
                        className="scale-75"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeMember(member.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {member.is_owner && user?.id !== member.user_id && isCompanyOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeMember(member.user_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {isCompanyOwner && pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('settings.team.pendingInvitations')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <span className="text-sm font-medium">{inv.email}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant="secondary" className="text-[9px]">{getRoleLabel(inv.role)}</Badge>
                    {inv.has_calculator_access && <Badge variant="outline" className="text-[9px] px-1 py-0 text-blue-600">Calc</Badge>}
                    {inv.has_operational_access && <Badge variant="outline" className="text-[9px] px-1 py-0 text-emerald-600">Opr</Badge>}
                    {inv.has_processing_access && <Badge variant="outline" className="text-[9px] px-1 py-0 text-orange-600">Prel</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => cancelInvitation(inv.id)} className="text-destructive">
                  {t('settings.team.cancel')}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}