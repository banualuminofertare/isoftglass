import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FinishVariant {
  variant_code: string;
  variant_name: string;
  color_hex: string | null;
}

const GENERIC_FINISHES: FinishVariant[] = [
  { variant_code: 'polished_stainless', variant_name: 'Inox Lustruit', color_hex: '#C0C0C0' },
  { variant_code: 'brushed_stainless', variant_name: 'Inox Periat', color_hex: '#A8A8A8' },
  { variant_code: 'matte_black', variant_name: 'Negru Mat', color_hex: '#1A1A1A' },
  { variant_code: 'chrome', variant_name: 'Crom', color_hex: '#E8E8E8' },
  { variant_code: 'gold', variant_name: 'Auriu', color_hex: '#D4A843' },
  { variant_code: 'ral_painted', variant_name: 'Vopsit RAL', color_hex: '#555555' },
];

export function useFinishVariants(materialCode?: string) {
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['finish-variants', materialCode],
    queryFn: async () => {
      if (!materialCode) return [];

      // First find the material by code
      const { data: material } = await supabase
        .from('materials')
        .select('id')
        .eq('code', materialCode)
        .maybeSingle();

      if (!material) return [];

      // Then get its variants
      const { data, error } = await supabase
        .from('material_variants')
        .select('variant_code, variant_name, color_hex')
        .eq('material_id', material.id)
        .eq('is_active', true)
        .order('variant_name');

      if (error) throw error;
      return (data || []) as FinishVariant[];
    },
    enabled: !!materialCode,
  });

  const effectiveVariants = !materialCode || variants.length === 0 ? GENERIC_FINISHES : variants;

  return { variants: effectiveVariants, isLoading, isFromCatalog: variants.length > 0 };
}
