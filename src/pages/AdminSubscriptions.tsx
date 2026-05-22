import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SubscriptionManager } from '@/components/settings/SubscriptionManager';
import { CrmDashboard } from '@/components/crm/CrmDashboard';
import { LeadsTable } from '@/components/crm/LeadsTable';
import { PipelineView } from '@/components/crm/PipelineView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, Target, Kanban } from 'lucide-react';
import { useCrmLeads } from '@/hooks/useCrmLeads';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { ResizableContent } from '@/components/layout/ResizableContent';
import { useTranslation } from 'react-i18next';

interface UserSub {
  user_id: string;
  full_name: string | null;
  status: string | null;
  plan_name: string | null;
  expires_at: string | null;
}

export default function AdminSubscriptions() {
  const { t } = useTranslation();
  const { leads, loading: leadsLoading, createLead, updateLead, deleteLead, addActivity, fetchActivities } = useCrmLeads();
  const [subscribers, setSubscribers] = useState<UserSub[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialStageFilter, setInitialStageFilter] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: string, stageFilter?: string) => {
    setActiveTab(tab);
    setInitialStageFilter(stageFilter);
  };

  useEffect(() => {
    const fetchSubs = async () => {
      setSubLoading(true);
      try {
        const [profilesRes, rolesRes, subsRes, plansRes] = await Promise.all([
          supabase.from('profiles').select('user_id, full_name'),
          supabase.from('user_roles').select('user_id, role'),
          supabase.from('user_subscriptions').select('user_id, status, expires_at, plan_id').eq('status', 'active'),
          supabase.from('subscription_plans').select('id, name'),
        ]);

        const nonAdminIds = (rolesRes.data || []).filter(r => r.role !== 'admin').map(r => r.user_id);
        const list: UserSub[] = nonAdminIds.map(uid => {
          const profile = profilesRes.data?.find(p => p.user_id === uid);
          const sub = subsRes.data?.find(s => s.user_id === uid);
          const plan = sub ? plansRes.data?.find(p => p.id === sub.plan_id) : null;
          return {
            user_id: uid,
            full_name: profile?.full_name || null,
            status: sub?.status || null,
            plan_name: plan?.name || null,
            expires_at: sub?.expires_at || null,
          };
        });
        list.sort((a, b) => {
          const aActive = a.status === 'active' ? 0 : 1;
          const bActive = b.status === 'active' ? 0 : 1;
          if (aActive !== bActive) return aActive - bActive;
          if (a.expires_at && b.expires_at) return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
          if (a.expires_at) return -1;
          if (b.expires_at) return 1;
          return 0;
        });
        setSubscribers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setSubLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const loading = leadsLoading || subLoading;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ResizableContent>
        <div className="space-y-6 pr-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('ui.crmSubscribers')}</h1>
            <p className="text-muted-foreground">{t('ui.crmSubscribersDesc')}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="gap-2">
                <Users className="h-4 w-4" />
                Abonați
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-2">
                <Target className="h-4 w-4" />
                Lead-uri
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="gap-2">
                <Kanban className="h-4 w-4" />
                Pipeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <CrmDashboard leads={leads} subscribers={subscribers} onNavigate={handleNavigate} />
            </TabsContent>

            <TabsContent value="subscribers" className="mt-6">
              <SubscriptionManager />
            </TabsContent>

            <TabsContent value="leads" className="mt-6">
              <LeadsTable
                leads={leads}
                onCreateLead={createLead}
                onUpdateLead={updateLead}
                onDeleteLead={deleteLead}
                onAddActivity={addActivity}
                onFetchActivities={fetchActivities}
                initialStageFilter={initialStageFilter}
              />
            </TabsContent>

            <TabsContent value="pipeline" className="mt-6">
              <PipelineView leads={leads} onUpdateLead={updateLead} />
            </TabsContent>
          </Tabs>
        </div>
      </ResizableContent>
    </AppLayout>
  );
}
