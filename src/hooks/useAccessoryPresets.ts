import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { CatalogCategory } from '@/hooks/useCatalogAccessories';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

export interface AccessoryPreset {
  id: string;
  product_type: string;
  category: string;
  material_code: string;
  material_name: string;
  sort_order: number;
}

export function useAccessoryPresets(productType: string, category?: CatalogCategory) {
  const { user } = useAuth();
  const { targetUserId } = useAdminImpersonation();
  const effectiveUserId = targetUserId || user?.id;
  const queryClient = useQueryClient();
  const queryKey = ['accessory-presets', productType, category ?? 'all', effectiveUserId ?? 'none'];

  const { data: presets = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!effectiveUserId) return [];
      let query = supabase
        .from('user_accessory_presets')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('product_type', productType)
        .order('sort_order');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as AccessoryPreset[];
    },
    enabled: !!effectiveUserId,
    staleTime: 2 * 60 * 1000,
  });

  const addPreset = useMutation({
    mutationFn: async (params: { category: CatalogCategory; materialCode: string; materialName: string }) => {
      if (!effectiveUserId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_accessory_presets')
        .upsert({
          user_id: effectiveUserId,
          product_type: productType,
          category: params.category,
          material_code: params.materialCode,
          material_name: params.materialName,
        }, { onConflict: 'user_id,product_type,category,material_code' });
      if (error) {
        console.error('[useAccessoryPresets] upsert error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-presets', productType] });
    },
  });

  const removePreset = useMutation({
    mutationFn: async (params: { category: CatalogCategory; materialCode: string }) => {
      if (!effectiveUserId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_accessory_presets')
        .delete()
        .eq('user_id', effectiveUserId)
        .eq('product_type', productType)
        .eq('category', params.category)
        .eq('material_code', params.materialCode);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-presets', productType] });
    },
  });

  const isInPresets = (materialCode: string) =>
    presets.some(p => p.material_code === materialCode);

  return {
    presets,
    isLoading,
    addPreset: addPreset.mutate,
    removePreset: removePreset.mutate,
    isInPresets,
    isAdding: addPreset.isPending,
    isRemoving: removePreset.isPending,
  };
}
