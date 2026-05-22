import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import type { CatalogCategory } from '@/hooks/useCatalogAccessories';

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

export interface PricingAccessory {
  id: string;
  code: string;
  name: string;
  price: number;
  unit: string;
  description: string | null;
  catalog_source: string | null;
  image_url: string | null;
  product_types: string[];
}

type PricingConfigAccessoryRow = PricingAccessory & {
  company_id: string | null;
  updated_at: string | null;
  created_at: string | null;
  product_types: string[];
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

/**
 * Prefix patterns per category – mirrors CATEGORY_PREFIXES from useCatalogAccessories.
 */
const CATEGORY_PREFIXES: Record<CatalogCategory, string[]> = {
  hinge:          ['30.'],
  handle:         ['50.', '51.'],
  stabilizer:     ['35.', '72.'],
  mount_point:    ['31.'],
  profile_u:      ['11.'],
  profile_seal:   ['19.', '18.'],
  handrail:       ['37.'],
  sliding_system: ['37.SS3H'],
  lock:           ['19.K', '19.F', '19.P', '19.DB', '19.LK', '19.81'],
  corner_connector: ['31.', '32.'],
};

/**
 * Fetches accessories from pricing_config (category = 'accessories').
 * When category is provided, filters by code prefixes.
 * When category is omitted, returns ALL accessories (used for search).
 * Uses full pagination to avoid missing products.
 */
export function usePricingAccessories(category?: CatalogCategory, productType?: string) {
  const { user, companyId } = useAuth();
  const { targetUserId, isImpersonating } = useAdminImpersonation();
  const prefixes = category ? CATEGORY_PREFIXES[category] : null;

  const effectiveCompanyId = isImpersonating ? null : companyId;
  const needsCompanyLookup = isImpersonating && !!targetUserId;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['pricing-accessories', category, productType, effectiveCompanyId, targetUserId, isImpersonating],
    enabled: !!user,
    queryFn: async () => {
      // Resolve effective company_id for impersonation
      let resolvedCompanyId = effectiveCompanyId;
      if (needsCompanyLookup && targetUserId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', targetUserId)
          .maybeSingle();
        resolvedCompanyId = profileData?.company_id ?? null;
      }

      const buildQuery = resolvedCompanyId
        ? () => supabase
            .from('pricing_config')
            .select('id, code, name, price, unit, description, company_id, catalog_source, image_url, product_types, updated_at, created_at')
            .eq('category', 'accessories')
            .eq('is_active', true)
            .or(`company_id.is.null,company_id.eq.${resolvedCompanyId}`)
            .order('code')
            .order('id')
        : () => supabase
            .from('pricing_config')
            .select('id, code, name, price, unit, description, company_id, catalog_source, image_url, product_types, updated_at, created_at')
            .eq('category', 'accessories')
            .eq('is_active', true)
            .is('company_id', null)
            .order('code')
            .order('id');

      const data = await fetchAllPages(buildQuery);

      if (!data) return [];

      // Merge base (no company) + company overrides
      const rows = (data ?? []) as PricingConfigAccessoryRow[];
      const baseRows = dedupeLatestByCode(rows.filter((r) => !r.company_id));
      const companyRows = resolvedCompanyId
        ? dedupeLatestByCode(rows.filter((r) => r.company_id === resolvedCompanyId))
        : [];
      const companyCodeSet = new Set(companyRows.map(r => r.code));

      const merged = [
        ...companyRows,
        ...baseRows.filter(r => !companyCodeSet.has(r.code)),
      ];

      // Filter by category prefixes (skip if no category)
      let result = prefixes
        ? merged.filter(item => prefixes.some(p => item.code.startsWith(p)))
        : merged;

      // Filter by product type if provided
      if (productType) {
        result = result.filter(item => {
          const types = item.product_types as string[] | null;
          if (!types || types.length === 0) return true; // no restriction = visible everywhere
          return types.includes(productType);
        });
      }

      return result as PricingAccessory[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { products, isLoading };
}
