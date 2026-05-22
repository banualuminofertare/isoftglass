import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import i18next from 'i18next';

export interface InstallationJob {
  id: string;
  company_id: string | null;
  order_id: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  estimated_duration: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  team_id: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  client_name: string | null;
  client_code: string | null;
  client_phone: string | null;
  notes: string | null;
  checklist: any[];
  completion_notes: string | null;
  client_signature_url: string | null;
  completion_photos: string[];
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  team?: { id: string; name: string } | null;
  order?: { id: string; order_number: string } | null;
}

export function useInstallation() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ['installation-jobs', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installation_jobs')
        .select('*, team:installation_teams(id, name), order:orders(id, order_number, delivery_address, delivery_date, client_id, clients(name, phone, email))')
        .eq('company_id', companyId!)
        .order('scheduled_date', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as InstallationJob[];
    },
    enabled: !!companyId,
  });

  const createJob = useMutation({
    mutationFn: async (job: Partial<InstallationJob>) => {
      const { data, error } = await supabase
        .from('installation_jobs')
        .insert({ ...job, company_id: companyId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-jobs'] });
      toast({ title: i18next.t('toasts.installationScheduled') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const updateJob = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InstallationJob> & { id: string }) => {
      const { error } = await supabase
        .from('installation_jobs')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-jobs'] });
      toast({ title: i18next.t('toasts.installationUpdated') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('installation_jobs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-jobs'] });
      toast({ title: i18next.t('toasts.installationDeleted') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  return {
    jobs: jobsQuery.data || [],
    isLoading: jobsQuery.isLoading,
    createJob,
    updateJob,
    deleteJob,
  };
}
