import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import i18next from 'i18next';

export interface InstallationVehicle {
  id: string;
  company_id: string | null;
  plate_number: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  team_id: string | null;
  itp_expiry: string | null;
  rca_expiry: string | null;
  revision_date: string | null;
  status: 'available' | 'in_service' | 'occupied';
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  team?: { id: string; name: string } | null;
}

export function useInstallationVehicles() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: ['installation-vehicles', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installation_vehicles' as any)
        .select('*, team:installation_teams(id, name)')
        .eq('company_id', companyId!)
        .order('plate_number');
      if (error) throw error;
      return (data || []) as unknown as InstallationVehicle[];
    },
    enabled: !!companyId,
  });

  const createVehicle = useMutation({
    mutationFn: async (vehicle: Partial<InstallationVehicle>) => {
      const { data, error } = await supabase
        .from('installation_vehicles' as any)
        .insert({ ...vehicle, company_id: companyId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-vehicles'] });
      toast({ title: i18next.t('toasts.vehicleAdded') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const updateVehicle = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InstallationVehicle> & { id: string }) => {
      const { error } = await supabase
        .from('installation_vehicles' as any)
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-vehicles'] });
      toast({ title: i18next.t('toasts.vehicleUpdated') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('installation_vehicles' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installation-vehicles'] });
      toast({ title: i18next.t('toasts.vehicleDeleted') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  return {
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}
