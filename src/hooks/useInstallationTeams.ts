import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import i18next from 'i18next';

export interface TeamMember {
  name: string;
  phone?: string;
  role?: string;
}

export interface InstallationTeam {
  id: string;
  company_id: string | null;
  name: string;
  members: TeamMember[];
  vehicle: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useInstallationTeams() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ['installation-teams', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installation_teams')
        .select('*')
        .eq('company_id', companyId!)
        .order('name');
      if (error) throw error;
      return (data || []) as unknown as InstallationTeam[];
    },
    enabled: !!companyId,
  });

  const createTeam = useMutation({
    mutationFn: async (team: Partial<InstallationTeam>) => {
      const { data, error } = await supabase
        .from('installation_teams')
        .insert({ ...team, company_id: companyId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-teams'] });
      toast({ title: i18next.t('toasts.teamCreated') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InstallationTeam> & { id: string }) => {
      const { error } = await supabase
        .from('installation_teams')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-teams'] });
      toast({ title: i18next.t('toasts.teamUpdated') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('installation_teams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-teams'] });
      toast({ title: i18next.t('toasts.teamDeleted') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  return {
    teams: teamsQuery.data || [],
    isLoading: teamsQuery.isLoading,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
