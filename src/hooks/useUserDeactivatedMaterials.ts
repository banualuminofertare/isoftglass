import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';

export function useUserDeactivatedMaterials() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: deactivatedIds = [], isLoading } = useQuery({
    queryKey: ['user-deactivated-materials', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_deactivated_materials')
        .select('material_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []).map(r => r.material_id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const deactivateMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('user_deactivated_materials')
        .insert({ user_id: user!.id, material_id: materialId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-deactivated-materials'] }),
  });

  const reactivateMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const { error } = await supabase
        .from('user_deactivated_materials')
        .delete()
        .eq('user_id', user!.id)
        .eq('material_id', materialId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-deactivated-materials'] }),
  });

  const isDeactivated = useCallback(
    (materialId: string) => deactivatedIds.includes(materialId),
    [deactivatedIds]
  );

  return {
    deactivatedIds,
    isLoading,
    deactivate: deactivateMutation.mutateAsync,
    reactivate: reactivateMutation.mutateAsync,
    isDeactivated,
  };
}
