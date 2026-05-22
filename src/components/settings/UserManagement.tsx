import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, UserCheck, UserX, Trash2, Users, ShieldCheck, ShieldOff, Settings, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { useAccessRequest } from '@/hooks/useAccessRequest';
import { useTranslation } from 'react-i18next';

interface ManagedUser {
  user_id: string;
  full_name: string | null;
  is_approved: boolean;
  has_processing_access: boolean;
  has_calculator_access: boolean;
  has_operational_access: boolean;
  has_team_access: boolean;
  role: string | null;
  created_at: string;
  approved_at: string | null;
  subscription_status: 'active' | 'expiring' | 'expired' | 'none';
  subscription_expires_at: string | null;
  subscription_plan_name: string | null;
}

export function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [waitingAccessFor, setWaitingAccessFor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const navigate = useNavigate();
  const { setTargetUser } = useAdminImpersonation();
  const { requestAccess, watchRequest } = useAccessRequest();

  const handleManageData = async (u: ManagedUser) => {
    try {
      setWaitingAccessFor(u.user_id);
      const req = await requestAccess(u.user_id);
      if (!req) return;

      toast.info(t('admin.accessRequestSent', { name: u.full_name || t('admin.subscriber') }));

      const unsubscribe = watchRequest(req.id, (status) => {
        unsubscribe();
        setWaitingAccessFor(null);
        if (status === 'accepted') {
          toast.success(t('admin.accessGranted'));
          setTargetUser(u.user_id, u.full_name || t('admin.noName'));
          navigate('/setari');
        } else {
          toast.error(t('admin.accessDenied'));
        }
      });
    } catch (err: any) {
      setWaitingAccessFor(null);
      toast.error(`${t('common.actions')}: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes, subsRes, plansRes] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, is_approved, created_at, approved_at, has_processing_access, has_calculator_access, has_operational_access, has_team_access'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('user_subscriptions').select('user_id, status, expires_at, plan_id').eq('status', 'active'),
        supabase.from('subscription_plans').select('id, name'),
      ]);

      const roles = rolesRes.data || [];
      const profiles = profilesRes.data || [];
      const subs = subsRes.data || [];
      const plans = plansRes.data || [];

      const adminIds = roles.filter(r => r.role === 'admin').map(r => r.user_id);
      
      const now = new Date();
      const userList: ManagedUser[] = profiles
        .filter(p => !adminIds.includes(p.user_id))
        .map(p => {
          const sub = subs.find(s => s.user_id === p.user_id);
          const plan = sub ? plans.find(pl => pl.id === sub.plan_id) : null;
          
          let subscription_status: ManagedUser['subscription_status'] = 'none';
          if (sub) {
            const expiresAt = new Date(sub.expires_at);
            if (expiresAt < now) {
              subscription_status = 'expired';
            } else if (differenceInDays(expiresAt, now) <= 7) {
              subscription_status = 'expiring';
            } else {
              subscription_status = 'active';
            }
          }

          return {
            user_id: p.user_id,
            full_name: p.full_name,
            is_approved: p.is_approved ?? false,
            has_processing_access: (p as any).has_processing_access ?? false,
            has_calculator_access: (p as any).has_calculator_access ?? true,
            has_operational_access: (p as any).has_operational_access ?? true,
            has_team_access: (p as any).has_team_access ?? false,
            role: roles.find(r => r.user_id === p.user_id)?.role || null,
            created_at: p.created_at,
            approved_at: (p as any).approved_at ?? null,
            subscription_status,
            subscription_expires_at: sub?.expires_at || null,
            subscription_plan_name: plan?.name || null,
          };
        });

      userList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUsers(userList);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error(t('admin.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const callManageUser = async (action: string, userId: string) => {
    setActionLoading(userId);
    try {
      const res = await supabase.functions.invoke('manage-user', {
        body: { action, userId },
      });

      if (res.error) throw res.error;

      const labels: Record<string, string> = {
        approve: t('admin.accountApproved'),
        revoke: t('admin.accessRevoked'),
        delete: t('admin.accountDeleted'),
      };
      toast.success(labels[action] || t('admin.actionDone'));
      
      if (action === 'delete') setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      console.error(`Error ${action}:`, err);
      toast.error(`Error: ${err.message || t('admin.actionDone')}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'production_manager': return t('admin.productionManager');
      case 'sales': return t('admin.subscriber');
      case 'operator': return t('admin.operatorRole');
      default: return t('admin.notSet');
    }
  };

  const toggleModuleAccess = async (u: ManagedUser, field: 'has_processing_access' | 'has_calculator_access' | 'has_operational_access' | 'has_team_access') => {
    const newValue = !u[field];
    const labels: Record<string, string> = {
      has_processing_access: t('admin.processing'),
      has_calculator_access: t('admin.calculator'),
      has_operational_access: t('admin.operational'),
      has_team_access: t('admin.team'),
    };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: newValue } as any)
        .eq('user_id', u.user_id);
      if (error) throw error;
      toast.success(newValue ? t('admin.accessActivated', { module: labels[field] }) : t('admin.accessDeactivated', { module: labels[field] }));
      setUsers(prev => prev.map(x => x.user_id === u.user_id ? { ...x, [field]: newValue } : x));
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingUsers = users.filter(u => !u.is_approved);
  const approvedUsers = users.filter(u => u.is_approved);

  const filteredApprovedUsers = approvedUsers.filter(u => {
    if (searchQuery && !(u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (subscriptionFilter !== 'all' && u.subscription_status !== subscriptionFilter) return false;
    if (roleFilter !== 'all') {
      const userRole = u.role || 'none';
      if (roleFilter === 'none' && u.role !== null) return false;
      if (roleFilter !== 'none' && userRole !== roleFilter) return false;
    }
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Pending Approval */}
      {pendingUsers.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldOff className="h-5 w-5" />
              {t('admin.pendingAccounts')} ({pendingUsers.length})
            </CardTitle>
            <CardDescription>
              {t('admin.pendingAccountsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t('admin.user')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.role')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.registered')}</TableHead>
                  <TableHead className="text-right whitespace-nowrap">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">
                      {u.full_name || t('admin.noName')}
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">ID: ...{u.user_id.slice(-8)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleLabel(u.role)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(u.created_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={actionLoading === u.user_id}
                        onClick={() => callManageUser('approve', u.user_id)}
                      >
                        {actionLoading === u.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}
                        {t('admin.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={actionLoading === u.user_id}
                        onClick={() => setDeleteTarget(u)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('admin.deleteName')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {t('admin.activeUsers')} ({filteredApprovedUsers.length}/{approvedUsers.length})
          </CardTitle>
          <CardDescription>
            {t('admin.activeUsersDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.searchByName')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('admin.subscription')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allSubscriptions')}</SelectItem>
                <SelectItem value="active">{t('admin.activeSub')}</SelectItem>
                <SelectItem value="expiring">{t('admin.expiringSoon')}</SelectItem>
                <SelectItem value="expired">{t('admin.expiredSub')}</SelectItem>
                <SelectItem value="none">{t('admin.noSubscription')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('admin.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
                <SelectItem value="sales">{t('admin.subscriber')}</SelectItem>
                <SelectItem value="production_manager">{t('admin.productionManager')}</SelectItem>
                <SelectItem value="operator">{t('admin.operatorRole')}</SelectItem>
                <SelectItem value="none">{t('admin.notSet')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredApprovedUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('admin.noUsersMatch')}</p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t('admin.user')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.role')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.approvedAt')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.calculator')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.operational')}</TableHead>
                   <TableHead className="whitespace-nowrap">{t('admin.processing')}</TableHead>
                   <TableHead className="whitespace-nowrap">{t('admin.team')}</TableHead>
                   <TableHead className="whitespace-nowrap">{t('admin.approved')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('admin.subscription')}</TableHead>
                  <TableHead className="text-right whitespace-nowrap">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovedUsers.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">
                      {u.full_name || t('admin.noName')}
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">ID: ...{u.user_id.slice(-8)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getRoleLabel(u.role)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.approved_at ? format(new Date(u.approved_at), 'dd.MM.yyyy HH:mm') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.has_calculator_access}
                        onCheckedChange={() => toggleModuleAccess(u, 'has_calculator_access')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.has_operational_access}
                        onCheckedChange={() => toggleModuleAccess(u, 'has_operational_access')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.has_processing_access}
                        onCheckedChange={() => toggleModuleAccess(u, 'has_processing_access')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.has_team_access}
                        onCheckedChange={() => toggleModuleAccess(u, 'has_team_access')}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.is_approved}
                        onCheckedChange={() => callManageUser(u.is_approved ? 'revoke' : 'approve', u.user_id)}
                        disabled={actionLoading === u.user_id}
                      />
                    </TableCell>
                    <TableCell>
                      {u.subscription_status === 'active' && (
                        <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                          {t('admin.activeSubBadge', { plan: u.subscription_plan_name })}
                        </Badge>
                      )}
                      {u.subscription_status === 'expiring' && (
                        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                          {t('admin.expiringSoon')}
                        </Badge>
                      )}
                      {u.subscription_status === 'expired' && (
                        <Badge variant="destructive" className="gap-1">
                          {t('admin.expiredSub')}
                        </Badge>
                      )}
                      {u.subscription_status === 'none' && (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          {t('admin.noSubscription')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={waitingAccessFor === u.user_id}
                        onClick={() => handleManageData(u)}
                      >
                        {waitingAccessFor === u.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Settings className="h-3 w-3" />}
                        {waitingAccessFor === u.user_id ? t('admin.waitingAccept') : t('admin.manageData')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={actionLoading === u.user_id}
                        onClick={() => setDeleteTarget(u)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('admin.deleteName')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('admin.deleteConfirmMsg', { name: deleteTarget?.full_name || t('admin.noName') })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
              disabled={actionLoading === deleteTarget?.user_id}
              onClick={() => deleteTarget && callManageUser('delete', deleteTarget.user_id)}
            >
              {actionLoading === deleteTarget?.user_id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {t('admin.deleteForever')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
