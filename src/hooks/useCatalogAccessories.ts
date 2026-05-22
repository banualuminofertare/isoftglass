import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

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

const rowTimestamp = (row: { updated_at?: string | null; created_at?: string | null }) =>
  row.updated_at ?? row.created_at ?? '';

const dedupeLatestByCode = <T extends { code: string; updated_at?: string | null; created_at?: string | null }>(rows: T[]) => {
  const map = new Map<string, T>();
  for (const row of rows) {
    const existing = map.get(row.code);
    if (!existing || rowTimestamp(row) > rowTimestamp(existing)) {
      map.set(row.code, row);
    }
  }
  return Array.from(map.values());
};

export type CatalogCategory =
  | 'hinge'
  | 'handle'
  | 'stabilizer'
  | 'mount_point'
  | 'profile_u'
  | 'profile_seal'
  | 'handrail'
  | 'sliding_system'
  | 'lock'
  | 'corner_connector';

export interface CatalogProduct {
  id: string;
  code: string;
  name: string;
  image_url: string | null;
  unit_price: number | null;
  processing_price: number | null;
  unit: string;
  tags: string[] | null;
}

type PricingCatalogRow = {
  id: string;
  code: string;
  name: string;
  image_url: string | null;
  price: number | null;
  unit: string | null;
  catalog_source: string | null;
  company_id: string | null;
  updated_at: string | null;
  created_at: string | null;
};

/**
 * Prefix patterns per category – used to filter `materials.code`.
 * A material matches if its code starts with ANY of the listed prefixes.
 */
const CATEGORY_PREFIXES: Record<CatalogCategory, string[]> = {
  hinge:          ['30.'],
  handle:         ['50.', '51.'],
  stabilizer:     ['35.', '72.'],
  mount_point:    ['31.'],
  profile_u:      ['11.'],
  profile_seal:   ['19.', '18.'],
  handrail:       ['37.'],
  sliding_system: ['37.SS3H'],          // kit glisare
  lock:           ['19.K', '19.F', '19.P', '19.DB', '19.LK', '19.81'],
  corner_connector: ['31.', '32.'],
};

/**
 * Hook that fetches active materials matching a given category.
 * Returns `{ products, isLoading }`.
 */
export function useCatalogAccessories(category: CatalogCategory) {
  const prefixes = CATEGORY_PREFIXES[category];

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['catalog-accessories', category],
    queryFn: async () => {
      const orFilter = prefixes.map(p => `code.like.${p}%`).join(',');

      const data = await fetchAllPages(() =>
        supabase
          .from('materials')
          .select('id, code, name, image_url, unit_price, processing_price, unit, tags')
          .eq('is_active', true)
          .or(orFilter)
          .order('code')
      );

      return (data ?? []) as CatalogProduct[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { products, isLoading };
}

/**
 * Hook that fetches ALL active materials + user pricing_config accessories,
 * merged with deduplication by code (pricing_config overrides materials).
 */
export function useAllCatalogAccessories() {
  const { user, companyId } = useAuth();
  const { targetUserId, isImpersonating } = useAdminImpersonation();

  // When admin is impersonating, we need the target user's company_id
  const effectiveCompanyId = isImpersonating ? null : companyId;
  const needsCompanyLookup = isImpersonating && !!targetUserId;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['catalog-accessories-all', effectiveCompanyId, targetUserId, isImpersonating],
    queryFn: async () => {
      // Resolve effective company_id (for impersonation, look up target user's company)
      let resolvedCompanyId = effectiveCompanyId;
      if (needsCompanyLookup && targetUserId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', targetUserId)
          .maybeSingle();
        resolvedCompanyId = profileData?.company_id ?? null;
      }

      // Check if company hides global pricing
      let hideGlobalPricing = false;
      if (resolvedCompanyId) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('hide_global_pricing')
          .eq('id', resolvedCompanyId)
          .maybeSingle();
        hideGlobalPricing = companyData?.hide_global_pricing === true;
      }

      // 1. Fetch global materials (skip if hiding global)
      const materialsData = hideGlobalPricing ? [] : await fetchAllPages(() =>
        supabase
          .from('materials')
          .select('id, code, name, image_url, unit_price, processing_price, unit, tags')
          .eq('is_active', true)
          .order('code')
      );

      // 2. Fetch pricing_config accessories (global + company overrides, or company-only)
      const pricingRaw = resolvedCompanyId
        ? await fetchAllPages(() => {
            let q = supabase
              .from('pricing_config')
              .select('id, code, name, image_url, price, unit, catalog_source, company_id, updated_at, created_at')
              .eq('category', 'accessories')
              .eq('is_active', true)
              .order('code');
            if (hideGlobalPricing) {
              q = q.eq('company_id', resolvedCompanyId);
            } else {
              q = q.or(`company_id.is.null,company_id.eq.${resolvedCompanyId}`);
            }
            return q;
          })
        : await fetchAllPages(() =>
            supabase
              .from('pricing_config')
              .select('id, code, name, image_url, price, unit, catalog_source, company_id, updated_at, created_at')
              .eq('category', 'accessories')
              .eq('is_active', true)
              .is('company_id', null)
              .order('code')
          );

      const pricingRows = (pricingRaw ?? []) as PricingCatalogRow[];
      const baseRows = dedupeLatestByCode(pricingRows.filter((r) => !r.company_id));
      const companyRows = resolvedCompanyId
        ? dedupeLatestByCode(pricingRows.filter((r) => r.company_id === resolvedCompanyId))
        : [];
      const companyCodeSet = new Set(companyRows.map((r) => r.code));
      const pricingData = [...companyRows, ...baseRows.filter((r) => !companyCodeSet.has(r.code))];

      // 3. Convert pricing_config rows to CatalogProduct shape
      const pricingProducts: CatalogProduct[] = pricingData.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        image_url: p.image_url ?? null,
        unit_price: p.price ?? null,
        processing_price: null,
        unit: p.unit ?? 'pcs',
        tags: null,
      }));

      // 4. Merge: pricing_config overrides materials by code
      const pricingCodeSet = new Set(pricingProducts.map(p => p.code));
      const materials = (materialsData ?? []) as CatalogProduct[];
      const merged = [
        ...pricingProducts,
        ...materials.filter(m => !pricingCodeSet.has(m.code)),
      ];

      // Sort by code
      merged.sort((a, b) => a.code.localeCompare(b.code));
      return merged;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { products, isLoading };
}
