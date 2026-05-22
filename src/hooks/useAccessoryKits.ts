import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { toast } from 'sonner';
import i18next from 'i18next';

export interface KitItem {
  id: string;
  kit_id: string;
  material_code: string;
  material_name: string;
  quantity: number;
}

export interface GlassDeductions {
  sideA?: number;
  sideB?: number;
  top?: number;
  bottom?: number;
}

export interface AccessoryKit {
  id: string;
  user_id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  product_types: string[];
  is_active: boolean;
  image_url: string | null;
  model: string | null;
  color: string | null;
  catalog_source: string | null;
  glass_deductions: GlassDeductions;
  processing_types: Record<string, number>;
  door_height_deduction: number;
  fixed_panel_height_deduction: number;
  width_overlap: number;
  created_at: string;
  updated_at: string;
  items: KitItem[];
  company_id?: string | null;
}

export interface KitFormData {
  name: string;
  code: string;
  description?: string;
  price: number;
  product_types: string[];
  image_url?: string | null;
  model?: string | null;
  color?: string | null;
  catalog_source?: string | null;
  glass_deductions?: GlassDeductions;
  processing_types?: Record<string, number>;
  door_height_deduction?: number;
  fixed_panel_height_deduction?: number;
  width_overlap?: number;
}

export function useAccessoryKits() {
  const { user, companyId: authCompanyId } = useAuth();
  const { isImpersonating, targetUserId } = useAdminImpersonation();
  const [kits, setKits] = useState<AccessoryKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [effectiveCompanyId, setEffectiveCompanyId] = useState<string | null>(null);

  // Resolve effective company_id (own or impersonated user's)
  useEffect(() => {
    if (isImpersonating && targetUserId) {
      supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', targetUserId)
        .maybeSingle()
        .then(({ data }) => {
          setEffectiveCompanyId(data?.company_id ?? null);
        });
    } else {
      setEffectiveCompanyId(authCompanyId);
    }
  }, [isImpersonating, targetUserId, authCompanyId]);

  const fetchKits = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    let query = supabase
      .from('accessory_kits')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by company_id to avoid seeing kits from other companies
    if (effectiveCompanyId) {
      query = query.or(`company_id.is.null,company_id.eq.${effectiveCompanyId}`);
    } else {
      query = query.is('company_id', null);
    }

    const { data: kitsData, error: kitsError } = await query;

    if (kitsError) {
      console.error('Error fetching kits:', kitsError);
      setIsLoading(false);
      return;
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from('accessory_kit_items')
      .select('*');

    if (itemsError) {
      console.error('Error fetching kit items:', itemsError);
    }

    const items = (itemsData || []) as KitItem[];
    const enriched: AccessoryKit[] = (kitsData || []).map((kit: any) => ({
      ...kit,
      items: items.filter(i => i.kit_id === kit.id),
    }));

    // Deduplicate by code: company-specific kits take priority over global (null company_id)
    const deduped = deduplicateByCode(enriched, effectiveCompanyId);

    setKits(deduped);
    setIsLoading(false);
  }, [user, effectiveCompanyId]);

  useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  const addKit = useCallback(async (data: KitFormData): Promise<string | null> => {
    if (!user) return null;

    // Get company_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: result, error } = await supabase
      .from('accessory_kits')
      .insert({
        user_id: user.id,
        name: data.name,
        code: data.code,
        description: data.description || null,
        price: data.price,
        product_types: data.product_types,
        image_url: data.image_url || null,
        model: data.model || null,
        color: data.color || null,
        glass_deductions: (data.glass_deductions || {}) as any,
        processing_types: (data.processing_types || {}) as any,
        door_height_deduction: data.door_height_deduction ?? 0,
        fixed_panel_height_deduction: data.fixed_panel_height_deduction ?? 0,
        width_overlap: data.width_overlap ?? 0,
        catalog_source: data.catalog_source || null,
        company_id: (profile as any)?.company_id || null,
      } as any)
      .select('id')
      .single();

    if (error) {
      toast.error(i18next.t('toasts.kits.createError') + ': ' + error.message);
      return null;
    }
    
    await fetchKits();
    return result.id;
  }, [user, fetchKits]);

  const updateKit = useCallback(async (id: string, data: Partial<KitFormData>): Promise<boolean> => {
    const { glass_deductions, processing_types, catalog_source, ...rest } = data;
    const { error } = await supabase
      .from('accessory_kits')
      .update({
        ...rest,
        ...(catalog_source !== undefined ? { catalog_source: catalog_source || null } : {}),
        ...(glass_deductions !== undefined ? { glass_deductions: glass_deductions as any } : {}),
        ...(processing_types !== undefined ? { processing_types: processing_types as any } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error(i18next.t('toasts.kits.updateError') + ': ' + error.message);
      return false;
    }

    await fetchKits();
    return true;
  }, [fetchKits]);

  const deleteKit = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('accessory_kits')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(i18next.t('toasts.kits.deleteError') + ': ' + error.message);
      return false;
    }

    await fetchKits();
    return true;
  }, [fetchKits]);

  const addKitItem = useCallback(async (kitId: string, item: { material_code: string; material_name: string; quantity?: number }): Promise<boolean> => {
    const { error } = await supabase
      .from('accessory_kit_items')
      .insert({
        kit_id: kitId,
        material_code: item.material_code,
        material_name: item.material_name,
        quantity: item.quantity ?? 1,
      });

    if (error) {
      toast.error(i18next.t('toasts.kits.addItemError') + ': ' + error.message);
      return false;
    }

    await fetchKits();
    return true;
  }, [fetchKits]);

  const removeKitItem = useCallback(async (itemId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('accessory_kit_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error(i18next.t('toasts.kits.removeItemError') + ': ' + error.message);
      return false;
    }

    await fetchKits();
    return true;
  }, [fetchKits]);

  const getKitsForProduct = useCallback((productType: string): AccessoryKit[] => {
    return kits.filter(k => k.is_active && k.product_types.includes(productType));
  }, [kits]);

  return {
    kits,
    isLoading,
    addKit,
    updateKit,
    deleteKit,
    addKitItem,
    removeKitItem,
    getKitsForProduct,
    refetch: fetchKits,
  };
}

/** Deduplicate kits by code: company-specific overrides global (null company_id) */
function deduplicateByCode(kits: AccessoryKit[], companyId: string | null): AccessoryKit[] {
  if (!companyId) return kits;

  const map = new Map<string, AccessoryKit>();
  for (const kit of kits) {
    const existing = map.get(kit.code);
    if (!existing) {
      map.set(kit.code, kit);
    } else {
      // Company-specific takes priority over global
      const existingIsCompany = existing.company_id === companyId;
      const currentIsCompany = kit.company_id === companyId;
      if (currentIsCompany && !existingIsCompany) {
        map.set(kit.code, kit);
      }
    }
  }
  return Array.from(map.values());
}
