import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import i18next from 'i18next';

export interface MaterialVariant {
  id: string;
  material_id: string;
  variant_code: string;
  variant_name: string;
  color_hex?: string | null;
  is_active?: boolean;
  created_at: string;
}

export function useMaterialVariants(materialId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['material-variants', materialId],
    queryFn: async () => {
      if (!materialId) return [];
      const { data, error } = await supabase
        .from('material_variants')
        .select('*')
        .eq('material_id', materialId)
        .order('variant_code');
      if (error) throw error;
      return data as MaterialVariant[];
    },
    enabled: !!materialId,
  });

  const addVariant = useMutation({
    mutationFn: async (variant: { material_id: string; variant_code: string; variant_name: string; color_hex?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: profile } = await supabase
        .from('profiles').select('company_id').eq('user_id', user.id).maybeSingle();
      const companyId = profile?.company_id ?? null;
      const { data, error } = await supabase
        .from('material_variants')
        .insert({ ...variant, user_id: user.id, company_id: companyId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-variants'] });
      toast({ title: i18next.t('toasts.variantAdded') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteVariant = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase
        .from('material_variants')
        .delete()
        .eq('id', variantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-variants'] });
      toast({ title: i18next.t('toasts.variantDeleted') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
    },
  });

  return { variants, isLoading, addVariant, deleteVariant };
}
