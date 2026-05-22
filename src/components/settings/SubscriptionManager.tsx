import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, XCircle, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { addMonths, format, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  currency: string;
}

interface UserSub {
  user_id: string;
  full_name: string | null;
  email: string;
  company_name: string | null;
  subscription_id: string | null;
  status: string | null;
  plan_name: string | null;
  expires_at: string | null;
  starts_at: string | null;
  deactivated_at: string | null;
  duration_months: number | null;
}

const getPlanColor = (planName: string | null): string => {
  if (!planName) return '';
  const lower = planName.toLowerCase();
  if (lower.includes('prelucrări') || lower.includes('prelucrari')) return 'bg-emerald-600 hover:bg-emerald-700 text-white';
  if (lower.includes('operațional') || lower.includes('operational')) return 'bg-orange-500 hover:bg-orange-600 text-white';
  return 'bg-blue-600 hover:bg-blue-700 text-white';
};

const getPlanShortLabel = (planName: string | null): string => {
  if (!planName) return '';
  const lower = planName.toLowerCase();
  if (lower.includes('prelucrări') || lower.includes('prelucrari')) return 'Calc + Opr + Prel';
  if (lower.includes('operațional') || lower.includes('operational')) return 'Calc + Opr';
  return 'Calc';
};

export function SubscriptionManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserSub[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingUser, setActivatingUser] = useState<UserSub | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customExpiresAt, setCustomExpiresAt] = useState<Date | undefined>();
  const [billingPeriod, setBillingPeriod] = useState<'lunar' | 'anual'>('anual');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, profilesRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').eq('is_active', true).order('duration_months'),
        supabase.from('profiles').select('user_id, full_name, company_name'),
      ]);

      if (plansRes.data) setPlans(plansRes.data);

      const { data: rolesData } = await supabase.from('user_roles').select('user_id, role');

      const { data: subsData } = await supabase
        .from('user_subscriptions')
        .select('id, user_id, status, expires_at, starts_at, plan_id, deactivated_at')
        .order('expires_at', { ascending: false });

      const nonAdminRoles = rolesData?.filter(r => r.role !== 'admin') || [];
      const userList: UserSub[] = nonAdminRoles.map(r => {
        const profile = profilesRes.data?.find(p => p.user_id === r.user_id);
        const activeSub = subsData?.find(s => s.user_id === r.user_id && s.status === 'active');
        const lastCancelled = subsData?.find(s => s.user_id === r.user_id && s.status === 'cancelled');
        const sub = activeSub || null;
        const plan = sub ? plansRes.data?.find(p => p.id === sub.plan_id) : null;

        return {
          user_id: r.user_id,
          full_name: profile?.full_name || null,
          company_name: profile?.company_name || null,
          email: r.user_id,
          subscription_id: sub?.id || null,
          status: sub?.status || null,
          plan_name: plan?.name || null,
          expires_at: sub?.expires_at || null,
          starts_at: sub?.starts_at || null,
          deactivated_at: lastCancelled?.deactivated_at || null,
          duration_months: plan?.duration_months || null,
        };
      });

      userList.sort((a, b) => {
        const aActive = a.status === 'active' ? 0 : 1;
        const bActive = b.status === 'active' ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        if (a.expires_at && b.expires_at) return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
        if (a.expires_at) return -1;
        if (b.expires_at) return 1;
        return 0;
      });
      setUsers(userList);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      toast.error(t('subscriptions.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!activatingUser || !selectedPlan || !user) return;
    setSaving(true);

    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const startsAt = new Date();
      const months = billingPeriod === 'anual' ? 12 : 1;
      const expiresAt = customExpiresAt || addMonths(startsAt, months);

      await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' as any })
        .eq('user_id', activatingUser.user_id)
        .eq('status', 'active' as any);

      const { error } = await supabase.from('user_subscriptions').insert({
        user_id: activatingUser.user_id,
        plan_id: selectedPlan,
        status: 'active' as any,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        activated_by: user.id,
        notes: notes || null,
      });

      if (error) throw error;

      const planName = plan.name.toLowerCase();
      const hasCalculator = true;
      const hasOperational = planName.includes('operațional') || planName.includes('operational');
      const hasProcessing = planName.includes('prelucrări') || planName.includes('prelucrari');

      await supabase.from('profiles').update({
        has_calculator_access: hasCalculator,
        has_operational_access: hasOperational,
        has_processing_access: hasProcessing,
      }).eq('user_id', activatingUser.user_id);

      toast.success(t('subscriptions.activatedSuccess', { plan: plan.name }));
      setDialogOpen(false);
      setActivatingUser(null);
      setSelectedPlan('');
      setNotes('');
      setCustomExpiresAt(undefined);
      setBillingPeriod('anual');
      fetchData();
    } catch (err) {
      console.error('Error activating subscription:', err);
      toast.error(t('subscriptions.errorActivating'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (userSub: UserSub) => {
    if (!userSub.subscription_id) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' as any, deactivated_at: new Date().toISOString() })
        .eq('id', userSub.subscription_id);

      if (error) throw error;
      toast.success(t('subscriptions.deactivatedSuccess'));
      fetchData();
    } catch (err) {
      console.error('Error deactivating subscription:', err);
      toast.error(t('subscriptions.errorDeactivating'));
    }
  };

  const getStatusBadge = (userSub: UserSub) => {
    if (!userSub.status || userSub.status !== 'active') {
      return <Badge variant="destructive">{t('subscriptions.inactive')}</Badge>;
    }
    const daysLeft = differenceInDays(new Date(userSub.expires_at!), new Date());
    if (daysLeft <= 5) {
      return (
        <Badge className="gap-1 bg-orange-500 hover:bg-orange-600 text-white">
          <AlertTriangle className="h-3 w-3" />
          {t('subscriptions.expiresInDays', { days: daysLeft })}
        </Badge>
      );
    }
    return (
      <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
        {t('subscriptions.active')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('subscriptions.manageTitle')}
          </CardTitle>
          <CardDescription>
            {t('subscriptions.manageDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('subscriptions.noUsers')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('subscriptions.userCol')}</TableHead>
                  <TableHead>{t('subscriptions.planCol')}</TableHead>
                  <TableHead>{t('subscriptions.statusCol')}</TableHead>
                  <TableHead>{t('subscriptions.activatedAt')}</TableHead>
                  <TableHead>{t('subscriptions.expiresAt')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">
                      {u.full_name || t('admin.noName')}
                      {u.company_name && (
                        <div className="text-xs text-muted-foreground">{u.company_name}</div>
                      )}
                      <div className="text-xs text-muted-foreground/60 truncate max-w-[200px]">{u.user_id}</div>
                    </TableCell>
                    <TableCell>
                      {u.plan_name ? (
                        <Badge className={`${getPlanColor(u.plan_name)} rounded-md px-3 py-1 whitespace-nowrap`}>{getPlanShortLabel(u.plan_name)}</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{getStatusBadge(u)}</TableCell>
                    <TableCell>
                      {u.starts_at ? format(new Date(u.starts_at), 'dd.MM.yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      {u.expires_at ? (
                        <>
                          {format(new Date(u.expires_at), 'dd.MM.yyyy')}
                          {u.starts_at && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({differenceInDays(new Date(u.expires_at), new Date(u.starts_at)) > 60 ? t('subscriptions.annual') : t('subscriptions.monthly')})
                            </span>
                          )}
                        </>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={dialogOpen && activatingUser?.user_id === u.user_id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) { setActivatingUser(null); setSelectedPlan(''); setNotes(''); setCustomExpiresAt(undefined); setBillingPeriod('anual'); }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => { setActivatingUser(u); setDialogOpen(true); }}
                          >
                            <UserPlus className="h-3 w-3" />
                            {t('subscriptions.activate')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('subscriptions.activateTitle')}</DialogTitle>
                            <DialogDescription className="sr-only">Activare abonament utilizator</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                            <p className="text-sm text-muted-foreground">
                              {t('subscriptions.userLabel')}: <strong>{activatingUser?.full_name || t('admin.noName')}</strong>
                            </p>
                            <div className="space-y-2">
                              <Label>{t('subscriptions.planLabel')}</Label>
                              <Select value={selectedPlan} onValueChange={(val) => {
                                setSelectedPlan(val);
                                const months = billingPeriod === 'anual' ? 12 : 1;
                                setCustomExpiresAt(addMonths(new Date(), months));
                              }}>
                                <SelectTrigger><SelectValue placeholder={t('subscriptions.selectPlan')} /></SelectTrigger>
                                <SelectContent>
                                  {plans.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name} — {p.price} {p.currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t('subscriptions.period')}</Label>
                              <Select value={billingPeriod} onValueChange={(val: 'lunar' | 'anual') => {
                                setBillingPeriod(val);
                                const months = val === 'anual' ? 12 : 1;
                                setCustomExpiresAt(addMonths(new Date(), months));
                              }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lunar">{t('subscriptions.monthly')}</SelectItem>
                                  <SelectItem value="anual">{t('subscriptions.annual')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedPlan && (
                              <div className="space-y-2">
                                <Label>{t('subscriptions.expirationDate')}</Label>
                                <Input
                                  type="date"
                                  value={customExpiresAt ? format(customExpiresAt, 'yyyy-MM-dd') : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomExpiresAt(val ? new Date(val + 'T00:00:00') : undefined);
                                  }}
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>{t('subscriptions.notesOptional')}</Label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('subscriptions.notesPlaceholder')}
                                rows={2}
                              />
                            </div>
                            <Button onClick={handleActivate} disabled={!selectedPlan || saving} className="w-full">
                              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                              {t('subscriptions.activateBtn')}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {u.status === 'active' && (
                        <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => handleDeactivate(u)}>
                          <XCircle className="h-3 w-3" />
                          {t('subscriptions.deactivate')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
