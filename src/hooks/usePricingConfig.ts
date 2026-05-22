import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import i18next from 'i18next';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { useAuth } from '@/hooks/useAuth';

export type PriceCategory = 'glass' | 'processing' | 'accessories' | 'labor' | 'finishing' | 'balustrade';

export interface PricingItem {
  id: string;
  category: PriceCategory;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  is_multiplier: boolean;
  is_active: boolean;
  sort_order: number;
  user_id?: string | null;
  is_override?: boolean; // true if this is a user override of a base item
  base_price?: number; // original base price if overridden
  image_url?: string | null; // from materials table, matched by code
  variant_colors?: { hex: string; name: string }[]; // from material_variants
  own_color?: { hex: string; name: string } | null; // color for this specific variant code
  glass_deduction?: number; // mm deduction from glass dimension when this accessory is selected
  glass_deductions?: Record<string, number>; // per-side deductions: { side_a, side_b, top, bottom }
  color_hex?: string | null; // direct color on pricing_config (e.g. for glass items)
  product_types?: string[]; // which calculators this item is visible in
  processing_types?: Record<string, number>; // processing operations with quantities
  // Mechanism fields
  door_height_deduction?: number;
  fixed_panel_height_deduction?: number;
  width_overlap?: number;
  catalog_source?: string | null;
}

// Migrate old junction-specific keys to simplified 4-field model (side_a, side_b, top, bottom)
function migrateDeductionKeys(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const d = raw as Record<string, number>;

  // If already has new keys, return as-is
  if (d.side_a !== undefined || d.side_b !== undefined || d.top !== undefined || d.bottom !== undefined) {
    return { side_a: d.side_a || 0, side_b: d.side_b || 0, top: d.top || 0, bottom: d.bottom || 0, ...(d.profile_height ? { profile_height: d.profile_height } : {}) };
  }

  // Migrate from old keys: pick first non-zero value for each side
  const sideAKeys = ['door_a', 'door', 'panel_180_a', 'panel_90_a', 'panel_135_a', 'lateral_a', 'partition_col_a', 'partition_door_a'];
  const sideBKeys = ['door_b', 'fixed_panel', 'panel_180_b', 'panel_90_b', 'panel_135_b', 'lateral_b', 'partition_col_b', 'partition_door_b'];
  const topKeys = ['partition_top_a'];
  const bottomKeys = ['partition_bottom_a'];

  const firstNonZero = (keys: string[]) => {
    for (const k of keys) { if (d[k]) return d[k]; }
    return 0;
  };

  return {
    side_a: firstNonZero(sideAKeys),
    side_b: firstNonZero(sideBKeys),
    top: firstNonZero(topKeys),
    bottom: firstNonZero(bottomKeys),
    ...(d.profile_height ? { profile_height: d.profile_height } : {}),
  };
}

export function usePricingConfig() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { targetUserId } = useAdminImpersonation();
  const { role, companyId: authCompanyId } = useAuth();
  const isAdmin = role === 'admin';
  const isAdminBrowsing = isAdmin && !targetUserId;
  const fetchIdRef = useRef(0);

  const getEffectiveUserId = async () => {
    if (targetUserId) return targetUserId;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  };

  const getEffectiveCompanyId = async (userId: string): Promise<string | null> => {
    const { data } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle();
    return data?.company_id ?? null;
  };

  const fetchPricing = async () => {
    // Skip fetch if auth context not ready yet (non-admin without companyId)
    // This prevents a stale fetch with company_id=null from overwriting correct data later
    if (!isAdmin && !authCompanyId && !targetUserId && role !== null) {
      // role is set but no companyId yet for non-admin — wait for companyId
      return;
    }
    if (role === null) {
      // Auth still loading — skip
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    try {
      const userId = await getEffectiveUserId();

      // Resolve companyId: use authCompanyId directly, only query profiles for impersonation
      let companyId: string | null = authCompanyId;
      if (targetUserId) {
        companyId = await getEffectiveCompanyId(targetUserId);
      }

      // Build pricing query — paginate to avoid Supabase default 1000-row cap
      const effectiveCompanyId = companyId;
      const PAGE_SIZE = 1000;

      const fetchAllPages = async (buildQuery: () => any) => {
        const allData: any[] = [];
        let from = 0;
        while (true) {
          const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          allData.push(...data);
          if (data.length < PAGE_SIZE) break;
          from += PAGE_SIZE;
        }
        return allData;
      };

      // Check if company hides global pricing
      let hideGlobalPricing = false;
      if (effectiveCompanyId && !isAdminBrowsing) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('hide_global_pricing')
          .eq('id', effectiveCompanyId)
          .maybeSingle();
        hideGlobalPricing = companyData?.hide_global_pricing === true;
      }

      const buildPricingQuery = () => {
        let q = supabase
          .from('pricing_config')
          .select('*')
          .order('category')
          .order('sort_order')
          .order('id');
        if (effectiveCompanyId) {
          if (hideGlobalPricing) {
            q = q.eq('company_id', effectiveCompanyId);
          } else {
            q = q.or(`company_id.is.null,company_id.eq.${effectiveCompanyId}`);
          }
        } else {
          q = q.is('company_id', null);
        }
        return q;
      };

      const buildMaterialsQuery = () =>
        supabase
          .from('materials')
          .select('id, code, image_url, color_hex, supplier')
          .or('image_url.not.is.null,color_hex.not.is.null,supplier.not.is.null');

      const buildVariantsQuery = () =>
        supabase
          .from('material_variants')
          .select('material_id, color_hex, variant_name, variant_code')
          .eq('is_active', true)
          .not('color_hex', 'is', null);

      // Fetch all data in parallel with pagination
      const [pricingData, materialsData, variantsData] = await Promise.all([
        fetchAllPages(buildPricingQuery as any),
        fetchAllPages(buildMaterialsQuery as any),
        fetchAllPages(buildVariantsQuery as any),
      ]);

      if (!pricingData) throw new Error('Failed to fetch pricing data');

      // Build code -> image_url map, code -> color_hex map, and id -> code map
      const imageMap = new Map<string, string>();
      const matColorHexMap = new Map<string, string>();
      const matIdToCode = new Map<string, string>();
      const supplierMap = new Map<string, string>();
      if (materialsData) {
        for (const m of materialsData) {
          if (m.image_url) imageMap.set(m.code, m.image_url);
          if (m.color_hex) matColorHexMap.set(m.code, m.color_hex);
          if (m.supplier) supplierMap.set(m.code, m.supplier);
          matIdToCode.set(m.id, m.code);
        }
      }

      // Helper: find image by code or parent code hierarchy
      const getImage = (code: string): string | null => {
        if (imageMap.has(code)) return imageMap.get(code)!;
        let parent = code;
        while (parent.includes('.')) {
          parent = parent.replace(/\.[^.]+$/, '');
          if (imageMap.has(parent)) return imageMap.get(parent)!;
        }
        return null;
      };

      // Pricing color map – populated after allRows is built, but referenced in getColor
      const pricingColorMap = new Map<string, string>();

      // Helper: find color by code or parent code hierarchy (mirrors getImage logic)
      const getColor = (code: string): string | null => {
        if (matColorHexMap.has(code)) return matColorHexMap.get(code)!;
        // Check variant colors first
        const varColor = variantCodeColorMap.get(code);
        if (varColor) return varColor.hex;
        let parent = code;
        while (parent.includes('.')) {
          parent = parent.replace(/\.[^.]+$/, '');
          if (matColorHexMap.has(parent)) return matColorHexMap.get(parent)!;
        }
        // Fallback: check pricing_config colors with parent-code hierarchy
        let pParent = code;
        if (pricingColorMap.has(pParent)) return pricingColorMap.get(pParent)!;
        while (pParent.includes('.')) {
          pParent = pParent.replace(/\.[^.]+$/, '');
          if (pricingColorMap.has(pParent)) return pricingColorMap.get(pParent)!;
        }
        return null;
      };

      // Build colorMap: code -> { hex, name }[] and variantCodeColorMap: variant_code -> { hex, name }
      const colorMap = new Map<string, { hex: string; name: string }[]>();
      const variantCodeColorMap = new Map<string, { hex: string; name: string }>();
      if (variantsData) {
        for (const v of variantsData) {
          const code = matIdToCode.get(v.material_id);
          if (code && v.color_hex) {
            const arr = colorMap.get(code) || [];
            arr.push({ hex: v.color_hex, name: v.variant_name });
            colorMap.set(code, arr);
          }
          if (v.variant_code && v.color_hex) {
            variantCodeColorMap.set(v.variant_code, { hex: v.color_hex, name: v.variant_name });
          }
        }
      }

      const allRows = (pricingData || []).map(item => ({
        ...item,
        category: item.category as PriceCategory,
        price: Number(item.price),
        user_id: item.user_id as string | null,
        glass_deduction: Number((item as any).glass_deduction) || 0,
        glass_deductions: migrateDeductionKeys((item as any).glass_deductions),
        product_types: Array.isArray((item as any).product_types) ? (item as any).product_types : [],
        processing_types: (typeof (item as any).processing_types === 'object' && !Array.isArray((item as any).processing_types)) ? (item as any).processing_types as Record<string, number> : {},
        door_height_deduction: Number((item as any).door_height_deduction) || 0,
        fixed_panel_height_deduction: Number((item as any).fixed_panel_height_deduction) || 0,
        width_overlap: Number((item as any).width_overlap) || 0,
      }));

      // Populate pricingColorMap from pricing_config rows
      for (const row of allRows) {
        if (row.color_hex) pricingColorMap.set(row.code, row.color_hex);
      }

      // Admin browsing: show only admin's own rows + global rows, skip foreign company rows
      if (isAdminBrowsing) {
        const ownRows = allRows.filter(r => r.company_id === null || r.company_id === authCompanyId);

        // Deduplicate: if admin has own override of a global row, show the override
        // When both are same company_id (including both null), keep the most recently updated
        const codeMap = new Map<string, (typeof allRows)[number]>();
        for (const row of ownRows) {
          const existing = codeMap.get(row.code);
          if (!existing) {
            codeMap.set(row.code, row);
          } else if (row.company_id === authCompanyId && existing.company_id === null) {
            // Admin's own company row overrides global
            codeMap.set(row.code, { ...row, is_override: true } as any);
          } else if (row.company_id === existing.company_id) {
            // Same company_id (including both null): keep the more recently updated row
            if (row.updated_at > existing.updated_at) {
              codeMap.set(row.code, row);
            }
          }
        }

        const merged: PricingItem[] = [];
        for (const row of codeMap.values()) {
          merged.push({
            ...row,
            is_override: (row as any).is_override || false,
            image_url: row.image_url || getImage(row.code),
            color_hex: row.color_hex || getColor(row.code) || null,
            variant_colors: colorMap.get(row.code) || [],
            own_color: variantCodeColorMap.get(row.code) || null,
            catalog_source: row.catalog_source || supplierMap.get(row.code) || null,
          });
        }
        // Race guard: only apply if this is still the latest fetch
        if (currentFetchId !== fetchIdRef.current) return;
        setItems(merged);
      } else {
        // Normal flow: separate base rows and company overrides
        // Deduplicate base rows: keep most recently updated per code
        const baseRowsRaw = allRows.filter(r => r.company_id === null);
        const baseCodeMap = new Map<string, (typeof allRows)[number]>();
        for (const row of baseRowsRaw) {
          const ex = baseCodeMap.get(row.code);
          if (!ex || row.updated_at > ex.updated_at) {
            baseCodeMap.set(row.code, row);
          }
        }
        const baseRows = Array.from(baseCodeMap.values());
        const companyRows = allRows.filter(r => r.company_id === effectiveCompanyId);
        const companyCodeMap = new Map<string, (typeof allRows)[number]>(companyRows.map(r => [r.code, r]));

        const merged: PricingItem[] = [];

        for (const base of baseRows) {
          const override = companyCodeMap.get(base.code);
          if (override) {
            // For catalog-sourced items, inherit visual metadata from the global base row
            const isCatalogItem = !!(override.catalog_source || base.catalog_source);
            merged.push({
              ...override,
              is_override: true,
              base_price: base.price,
              image_url: isCatalogItem
                ? (base.image_url || override.image_url || getImage(override.code))
                : (override.image_url || getImage(override.code)),
              name: isCatalogItem ? (base.name || override.name) : override.name,
              color_hex: isCatalogItem
                ? (base.color_hex || override.color_hex || getColor(override.code) || null)
                : (override.color_hex || getColor(override.code) || null),
              variant_colors: colorMap.get(override.code) || [],
              own_color: variantCodeColorMap.get(override.code) || null,
              catalog_source: override.catalog_source || base.catalog_source || supplierMap.get(override.code) || null,
            });
            companyCodeMap.delete(base.code);
          } else {
            merged.push({ ...base, is_override: false, image_url: base.image_url || getImage(base.code), color_hex: base.color_hex || getColor(base.code) || null, variant_colors: colorMap.get(base.code) || [], own_color: variantCodeColorMap.get(base.code) || null, catalog_source: base.catalog_source || supplierMap.get(base.code) || null });
          }
        }

        // Add company-only items (new products added by team members)
        for (const companyItem of companyCodeMap.values()) {
          merged.push({ ...companyItem, is_override: false, image_url: companyItem.image_url || getImage(companyItem.code), color_hex: companyItem.color_hex || getColor(companyItem.code) || null, variant_colors: colorMap.get(companyItem.code) || [], own_color: variantCodeColorMap.get(companyItem.code) || null, catalog_source: companyItem.catalog_source || supplierMap.get(companyItem.code) || null });
        }

        // Race guard: only apply if this is still the latest fetch
        if (currentFetchId !== fetchIdRef.current) return;
        setItems(merged);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast.error(i18next.t('toasts.pricing.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [targetUserId, authCompanyId, role]);

  const updatePrice = async (id: string, price: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return false;

    // If it's a base item (no user_id): admin edits directly, subscriber creates override
    if (!item.user_id && !isAdminBrowsing) {
      return await createUserOverride(item, { price });
    }

    try {
      const { error } = await supabase
        .from('pricing_config')
        .update({ price })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(i => 
        i.id === id ? { ...i, price } : i
      ));
      return true;
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error(i18next.t('toasts.pricing.updateError'));
      return false;
    }
  };

  const createUserOverride = async (baseItem: PricingItem, overrides: Partial<PricingItem>) => {
    try {
      const effectiveUserId = await getEffectiveUserId();
      if (!effectiveUserId) throw new Error('Nu ești autentificat');

      const targetCode = overrides.code ?? baseItem.code;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      const companyId = profileData?.company_id ?? null;

      // Check if user already has an override for this code
      const { data: existing } = await supabase
        .from('pricing_config')
        .select('id')
        .eq('code', targetCode)
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (existing) {
        // Update existing override instead of creating a new one
        const updateFields: Record<string, unknown> = {};
        if (overrides.price !== undefined) updateFields.price = overrides.price;
        if (overrides.name !== undefined) updateFields.name = overrides.name;
        if (overrides.code !== undefined) updateFields.code = overrides.code;
        if (overrides.description !== undefined) updateFields.description = overrides.description;
        if ('is_active' in overrides) updateFields.is_active = overrides.is_active;
        if (overrides.unit !== undefined) updateFields.unit = overrides.unit;
        if (overrides.is_multiplier !== undefined) updateFields.is_multiplier = overrides.is_multiplier;
        if ((overrides as any).image_url !== undefined) updateFields.image_url = (overrides as any).image_url;
        if ((overrides as any).color_hex !== undefined) updateFields.color_hex = (overrides as any).color_hex;

        const { data, error } = await supabase
          .from('pricing_config')
          .update(updateFields)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setItems(prev => prev.map(i =>
            i.id === baseItem.id || i.id === existing.id
              ? {
                  ...data,
                  category: data.category as PriceCategory,
                  price: Number(data.price),
                  user_id: data.user_id as string | null,
                  glass_deduction: Number(data.glass_deduction) || 0,
                  glass_deductions: (data.glass_deductions && typeof data.glass_deductions === 'object' && !Array.isArray(data.glass_deductions)) ? data.glass_deductions as Record<string, number> : {},
                  processing_types: (data.processing_types && typeof data.processing_types === 'object' && !Array.isArray(data.processing_types)) ? data.processing_types as Record<string, number> : {},
                  is_override: true,
                  base_price: baseItem.price,
                }
              : i
          ));
        }
        return true;
      }

      const { data, error } = await supabase
        .from('pricing_config')
        .insert({
          category: baseItem.category,
          code: targetCode,
          name: overrides.name ?? baseItem.name,
          description: overrides.description !== undefined ? overrides.description : baseItem.description,
          unit: overrides.unit ?? baseItem.unit,
          price: overrides.price ?? baseItem.price,
          is_multiplier: overrides.is_multiplier !== undefined ? overrides.is_multiplier : baseItem.is_multiplier,
          is_active: 'is_active' in overrides ? (overrides as any).is_active : baseItem.is_active,
          sort_order: baseItem.sort_order,
          user_id: effectiveUserId,
          company_id: companyId,
          catalog_source: overrides.catalog_source !== undefined ? overrides.catalog_source : (baseItem.catalog_source || null),
          image_url: (overrides as any).image_url !== undefined ? (overrides as any).image_url : (baseItem.image_url || null),
          color_hex: (overrides as any).color_hex !== undefined ? (overrides as any).color_hex : (baseItem.color_hex || null),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev => prev.map(i =>
          i.id === baseItem.id
            ? {
                ...data,
                category: data.category as PriceCategory,
                price: Number(data.price),
                user_id: data.user_id as string | null,
                glass_deduction: Number(data.glass_deduction) || 0,
                glass_deductions: (data.glass_deductions && typeof data.glass_deductions === 'object' && !Array.isArray(data.glass_deductions)) ? data.glass_deductions as Record<string, number> : {},
                processing_types: (data.processing_types && typeof data.processing_types === 'object' && !Array.isArray(data.processing_types)) ? data.processing_types as Record<string, number> : {},
                is_override: true,
                base_price: baseItem.price,
              }
            : i
        ));
      }
      return true;
    } catch (error) {
      console.error('Error creating override:', error);
      toast.error(i18next.t('toasts.pricing.overrideError'));
      return false;
    }
  };

  const updateItem = async (id: string, fields: { name?: string; code?: string; description?: string; unit?: string; is_multiplier?: boolean; image_url?: string; color_hex?: string }) => {
    const item = items.find(i => i.id === id);
    if (!item) return false;

    // If it's a base item: admin edits directly, subscriber creates override
    if (!item.user_id && !isAdminBrowsing) {
      return await createUserOverride(item, fields);
    }

    try {
      if (fields.code) {
        const duplicate = items.find(i => i.code === fields.code && i.id !== id);
        if (duplicate) {
          toast.error(i18next.t('toasts.pricing.codeDuplicate'));
          return false;
        }
      }

      const { error } = await supabase
        .from('pricing_config')
        .update(fields)
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(i => 
        i.id === id ? { ...i, ...fields } : i
      ));
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(i18next.t('toasts.pricing.updateItemError'));
      return false;
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    const item = items.find(i => i.id === id);
    if (!item) return false;

    // Admin edits directly, subscriber creates override
    if (!item.user_id && !isAdminBrowsing) {
      return await createUserOverride(item, { is_active } as Partial<PricingItem>);
    }

    try {
      const { error } = await supabase
        .from('pricing_config')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(i => 
        i.id === id ? { ...i, is_active } : i
      ));
      return true;
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error(i18next.t('toasts.pricing.toggleError'));
      return false;
    }
  };

  const getByCategory = (category: PriceCategory) => 
    items.filter(item => item.category === category);

  const getPrice = (code: string): number => {
    const item = items.find(i => i.code === code && i.is_active);
    return item?.price || 0;
  };

  const addItem = async (newItem: Omit<PricingItem, 'id'>) => {
    try {
      const effectiveUserId = await getEffectiveUserId();
      if (!effectiveUserId) throw new Error('Nu ești autentificat');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      const companyId = profileData?.company_id ?? null;

      // Check if an item with same code+category already exists for this company (upsert logic)
      let existQuery = supabase
        .from('pricing_config')
        .select('id')
        .eq('code', newItem.code)
        .eq('category', newItem.category);
      if (companyId) {
        existQuery = existQuery.eq('company_id', companyId);
      } else {
        existQuery = existQuery.is('company_id', null);
      }
      const { data: existingRows } = await existQuery;
      const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      let data;
      if (existing) {
        // Update existing item instead of creating duplicate
        const { data: updated, error } = await supabase
          .from('pricing_config')
          .update({
            name: newItem.name,
            description: newItem.description,
            unit: newItem.unit,
            price: newItem.price,
            is_multiplier: newItem.is_multiplier,
            is_active: newItem.is_active,
            sort_order: newItem.sort_order,
            image_url: newItem.image_url || null,
            category: newItem.category,
            catalog_source: newItem.catalog_source || null,
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        data = updated;

        // After upsert, do a full refetch to ensure visibility
        await fetchPricing();
      } else {
        // For admin browsing own account, insert as global
        const insertUserId = isAdminBrowsing ? null : effectiveUserId;
        const insertCompanyId = isAdminBrowsing ? null : companyId;

        const { data: inserted, error } = await supabase
          .from('pricing_config')
          .insert({
            category: newItem.category,
            code: newItem.code,
            name: newItem.name,
            description: newItem.description,
            unit: newItem.unit,
            price: newItem.price,
            is_multiplier: newItem.is_multiplier,
            is_active: newItem.is_active,
            sort_order: newItem.sort_order,
            user_id: insertUserId,
            company_id: insertCompanyId,
            image_url: newItem.image_url || null,
            catalog_source: newItem.catalog_source || null,
          })
          .select()
          .single();
        if (error) throw error;
        data = inserted;

        // After insert, do a full refetch to ensure visibility
        await fetchPricing();
      }
      return true;
    } catch (error: any) {
      console.error('Error adding pricing item:', error);
      const msg = error?.message?.includes('row-level security')
        ? i18next.t('toasts.pricing.rlsError')
        : `${i18next.t('toasts.pricing.addError')}: ${error?.message || i18next.t('toasts.pricing.unknownError')}`;
      toast.error(msg);
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return false;

      // Admin browsing: can delete global items directly
      if (!item.user_id && isAdminBrowsing) {
        const { error } = await supabase
          .from('pricing_config')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setItems(prev => prev.filter(i => i.id !== id));
        return true;
      }

      // Subscriber trying to delete a base item (user_id = null):
      // Create an override with is_active=false (soft-delete)
      if (!item.user_id && !isAdmin) {
        const result = await createUserOverride(item, { is_active: false } as Partial<PricingItem>);
        if (result) {
          // Remove from local list so it "disappears"
          setItems(prev => prev.filter(i => i.id !== id));
        }
        return result;
      }

      // User's own item or admin impersonating: delete directly
      const { error } = await supabase
        .from('pricing_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If it was an override, restore the base item view
      if (item.is_override && item.base_price !== undefined) {
        await fetchPricing(); // Refetch to get base item back
      } else {
        setItems(prev => prev.filter(i => i.id !== id));
      }
      return true;
    } catch (error) {
      console.error('Error deleting pricing item:', error);
      toast.error(i18next.t('toasts.pricing.deleteError'));
      return false;
    }
  };

  const resetToBase = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || !item.user_id) return false;

    try {
      const { error } = await supabase
        .from('pricing_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPricing();
      return true;
    } catch (error) {
      console.error('Error resetting to base:', error);
      toast.error(i18next.t('toasts.pricing.resetError'));
      return false;
    }
  };

  const importFromCatalog = async (): Promise<number> => {
    try {
      const effectiveUserId = await getEffectiveUserId();
      if (!effectiveUserId) throw new Error('Nu ești autentificat');

      // Fetch all hardware + consumable materials
      const { data: materials, error: matError } = await supabase
        .from('materials')
        .select('code, name, description, unit, unit_price, material_type, supplier')
        .in('material_type', ['hardware', 'consumable'])
        .eq('is_active', true)
        .order('code');

      if (matError) throw matError;
      if (!materials || materials.length === 0) return 0;

      // Get existing codes in pricing_config for this user (base + user overrides)
      const existingCodes = new Set(items.map(i => i.code));

      // Filter out materials that already exist
      const newMaterials = materials.filter(m => !existingCodes.has(m.code));
      if (newMaterials.length === 0) return 0;

      // Map unit types
      const unitMap: Record<string, string> = {
        pcs: 'RON/buc',
        lm: 'RON/ml',
        sqm: 'RON/mp',
        kg: 'RON/kg',
        l: 'RON/l',
      };

      const maxSort = Math.max(0, ...items.filter(i => i.category === 'accessories').map(i => i.sort_order));

      // Batch insert
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      const companyId = profileData?.company_id ?? null;

      const toInsert = newMaterials.map((m, idx) => ({
        category: 'accessories' as const,
        code: m.code,
        name: m.name,
        description: m.description,
        unit: unitMap[m.unit] || 'RON/buc',
        price: m.unit_price || 0,
        is_multiplier: false,
        is_active: true,
        sort_order: maxSort + idx + 1,
        user_id: effectiveUserId,
        company_id: companyId,
        catalog_source: m.supplier || null,
      }));

      // Insert in batches of 50
      for (let i = 0; i < toInsert.length; i += 50) {
        const batch = toInsert.slice(i, i + 50);
        const { error } = await supabase
          .from('pricing_config')
          .insert(batch);
        if (error) throw error;
      }

      await fetchPricing();
      return newMaterials.length;
    } catch (error) {
      console.error('Error importing from catalog:', error);
      toast.error(i18next.t('toasts.pricing.importError'));
      return 0;
    }
  };

  // Preview how many items would be imported
  const previewCatalogImport = async (): Promise<number> => {
    try {
      const { data: materials, error } = await supabase
        .from('materials')
        .select('code')
        .in('material_type', ['hardware', 'consumable'])
        .eq('is_active', true);

      if (error) throw error;
      if (!materials) return 0;

      const existingCodes = new Set(items.map(i => i.code));
      return materials.filter(m => !existingCodes.has(m.code)).length;
    } catch {
      return 0;
    }
  };

  // Get items that are sliding mechanisms (have width_overlap > 0)
  const slidingMechanismItems = items.filter(i => i.is_active && (i.width_overlap ?? 0) > 0);

  const getMechanismByCode = (code: string) => {
    const item = items.find(i => i.code === code);
    if (!item) return null;
    return {
      door_height_deduction: item.door_height_deduction ?? 0,
      fixed_panel_height_deduction: item.fixed_panel_height_deduction ?? 0,
      width_overlap: item.width_overlap ?? 0,
    };
  };

  const importSingleFromCatalog = async (code: string): Promise<boolean> => {
    try {
      const { data: material, error: matErr } = await supabase
        .from('materials')
        .select('code, name, description, unit, unit_price, supplier, image_url')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (matErr) throw matErr;
      if (!material) {
        toast.error(i18next.t('toasts.pricing.codeNotFound'));
        return false;
      }

      const unitMap: Record<string, string> = { pcs: 'RON/buc', lm: 'RON/ml', sqm: 'RON/mp', kg: 'RON/kg', l: 'RON/l' };

      const effectiveUserId = await getEffectiveUserId();
      if (!effectiveUserId) throw new Error('Nu ești autentificat');

      let companyId: string | null = authCompanyId;
      if (targetUserId) {
        companyId = await getEffectiveCompanyId(targetUserId);
      }

      // For admin browsing own account, insert as global
      const insertUserId = isAdminBrowsing ? null : effectiveUserId;
      const insertCompanyId = isAdminBrowsing ? null : companyId;

      const { error } = await supabase
        .from('pricing_config')
        .insert({
          category: 'accessories' as const,
          code: material.code,
          name: material.name,
          description: material.description,
          unit: unitMap[material.unit] || 'RON/buc',
          price: material.unit_price || 0,
          is_multiplier: false,
          is_active: true,
          sort_order: 0,
          user_id: insertUserId,
          company_id: insertCompanyId,
          catalog_source: material.supplier || null,
          image_url: material.image_url || null,
        });

      if (error) throw error;
      await fetchPricing();
      toast.success(i18next.t('toasts.pricing.codeImported', { code }));
      return true;
    } catch (error) {
      console.error('Error importing single code:', error);
      toast.error(i18next.t('toasts.pricing.importCodeError'));
      return false;
    }
  };

  const checkCodeAnywhere = async (code: string): Promise<'pricing' | 'materials' | 'none'> => {
    const trimmed = code.trim();
    
    // Check if code already exists in loaded items (may have been missed by search filter)
    const existsInLocalItems = items.some(i => i.code === trimmed);
    if (existsInLocalItems) return 'pricing';
    
    // Check pricing_config in DB (visible to current user via RLS)
    const { data: pricingData } = await supabase
      .from('pricing_config')
      .select('code, category')
      .eq('code', trimmed)
      .limit(1);
    if (pricingData && pricingData.length > 0) {
      // Code exists in DB but wasn't in local items — trigger a refetch to fix stale cache
      fetchPricing();
      return 'pricing';
    }

    // Then check materials catalog
    const { data: matData } = await supabase
      .from('materials')
      .select('code')
      .eq('code', trimmed)
      .eq('is_active', true)
      .maybeSingle();
    if (matData) return 'materials';

    return 'none';
  };

  // Keep backward-compatible alias
  const checkCodeInMaterials = async (code: string): Promise<boolean> => {
    const result = await checkCodeAnywhere(code);
    return result === 'materials';
  };


  return {
    items,
    isLoading,
    updatePrice,
    updateItem,
    toggleActive,
    getByCategory,
    getPrice,
    addItem,
    deleteItem,
    resetToBase,
    importFromCatalog,
    previewCatalogImport,
    importSingleFromCatalog,
    checkCodeInMaterials,
    checkCodeAnywhere,
    refetch: fetchPricing,
    slidingMechanismItems,
    getMechanismByCode,
  };
}
