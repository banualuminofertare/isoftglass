import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { CatalogCategory } from '@/hooks/useCatalogAccessories';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

export interface ImportedAccessory {
  id: string;
  product_type: string;
  category: string;
  material_code: string;
  material_name: string;
  sort_order: number;
  unit_price?: number;
}

/**
 * Hook that manages user-imported accessories from pricing_config.
 * Saved in user_accessory_presets, surfaced in CatalogProductSelector dropdown.
 */
export function useUserImportedAccessories(productType: string, category?: CatalogCategory) {
  const { user } = useAuth();
  const { targetUserId } = useAdminImpersonation();
  const effectiveUserId = targetUserId || user?.id;
  const queryClient = useQueryClient();
  const queryKey = ['user-imported-accessories', productType, category ?? 'all', effectiveUserId ?? 'none'];

  const { data: imported = [], isLoading } = useQuery({
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
      return (data ?? []) as unknown as ImportedAccessory[];
    },
    enabled: !!effectiveUserId,
    staleTime: 2 * 60 * 1000,
  });

  const importProduct = useMutation({
    mutationFn: async (params: {
      category: CatalogCategory;
      materialCode: string;
      materialName: string;
      unitPrice?: number;
    }) => {
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
        console.error('[useUserImportedAccessories] upsert error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-imported-accessories', productType] });
      queryClient.invalidateQueries({ queryKey: ['accessory-presets', productType] });
    },
  });

  const removeImported = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['user-imported-accessories', productType] });
      queryClient.invalidateQueries({ queryKey: ['accessory-presets', productType] });
    },
  });

  const isImported = (materialCode: string) =>
    imported.some(p => p.material_code === materialCode);

  return {
    imported,
    isLoading,
    importProduct: importProduct.mutate,
    removeImported: removeImported.mutate,
    isImported,
    isImporting: importProduct.isPending,
  };
}
