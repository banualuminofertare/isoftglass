import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const GENERIC_COLORS: Record<string, { hex: string; roughness: number }> = {
  polished_stainless: { hex: '#c0c0c0', roughness: 0.1 },
  brushed_stainless: { hex: '#a8a8a8', roughness: 0.3 },
  matte_black: { hex: '#1a1a1a', roughness: 0.6 },
  chrome: { hex: '#e8e8e8', roughness: 0.05 },
  anodized_silver: { hex: '#b0b0b0', roughness: 0.25 },
  gold: { hex: '#d4a843', roughness: 0.15 },
  ral_painted: { hex: '#708090', roughness: 0.4 },
};

/**
 * Resolves a finish string (generic or catalog variant_code) to a hex color.
 * For catalog codes (containing dots), fetches color_hex from material_variants.
 * For generic codes, returns hardcoded values.
 */
export function useFinishColor(finish?: string) {
  const isCatalogCode = !!finish && finish.includes('.');

  const { data: catalogColor } = useQuery({
    queryKey: ['finish-color', finish],
    queryFn: async () => {
      const { data } = await supabase
        .from('material_variants')
        .select('color_hex')
        .eq('variant_code', finish!)
        .eq('is_active', true)
        .maybeSingle();
      return data?.color_hex || null;
    },
    enabled: isCatalogCode,
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  if (isCatalogCode && catalogColor) {
    return { colorHex: catalogColor, roughness: 0.2 };
  }

  const generic = finish ? GENERIC_COLORS[finish] : undefined;
  return {
    colorHex: generic?.hex || '#c0c0c0',
    roughness: generic?.roughness || 0.1,
  };
}
