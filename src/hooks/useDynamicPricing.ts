import { useMemo, useState, useEffect } from 'react';
import { usePricingConfig, type PricingItem } from './usePricingConfig';
import { supabase } from '@/integrations/supabase/client';
import type { GlassThickness, GlassType } from '@/types/calculators';

export interface DynamicPricing {
  // Glass prices by thickness and type
  getGlassPrice: (thickness: GlassThickness, type: GlassType | string) => number;
  
  // Processing costs
  getProcessingCost: (code: string) => number;
  
  // Accessory prices
  getAccessoryPrice: (code: string) => number;
  
  // Labor costs
  getLaborCost: (code: string) => number;
  
  // Finish multipliers
  getFinishMultiplier: (finish: string) => number;
  
  // Mirror prices
  getMirrorPrice: (type: string) => number;
  
  // Kitchen front type costs
  getKitchenFrontTypeCost: (frontType: string) => number;
  
  // Check if pricing is loaded
  isLoading: boolean;
}

export function useDynamicPricing(): DynamicPricing {
  const { items, isLoading, getPrice } = usePricingConfig();

  const pricingMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(item => {
      if (item.is_active) {
        map.set(item.code, item.price);
      }
    });
    return map;
  }, [items]);

  const deductionMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(item => {
      if (item.is_active && item.glass_deduction) {
        map.set(item.code, item.glass_deduction);
      }
    });
    return map;
  }, [items]);

  const getGlassPrice = (thickness: GlassThickness, type: GlassType | string): number => {
    const code = `glass_${thickness}_${type}`;
    return pricingMap.get(code) ?? 0;
  };

  const getProcessingCost = (code: string): number => {
    return pricingMap.get(code) ?? 0;
  };

  const getAccessoryPrice = (code: string): number => {
    return pricingMap.get(code) ?? 0;
  };

  const getLaborCost = (code: string): number => {
    return pricingMap.get(code) ?? 0;
  };

  const getFinishMultiplier = (finish: string): number => {
    const code = `finish_${finish}`;
    const multiplier = pricingMap.get(code);
    // If no multiplier found, return 1.0 (no effect)
    return multiplier ?? 1.0;
  };

  const getMirrorPrice = (type: string): number => {
    // Try to find 4mm mirror (most common) for the type
    const code = `mirror_4_${type}`;
    return pricingMap.get(code) ?? 120;
  };

  const getKitchenFrontTypeCost = (frontType: string): number => {
    const code = `kitchen_${frontType}`;
    return pricingMap.get(code) ?? 0;
  };

  return {
    getGlassPrice,
    getProcessingCost,
    getAccessoryPrice,
    getLaborCost,
    getFinishMultiplier,
    getMirrorPrice,
    getKitchenFrontTypeCost,
    isLoading,
  };
}

// Create a static pricing object for use in calculation functions
export interface PricingData {
  glassPrice: (thickness: GlassThickness, type: GlassType | string) => number;
  tempering: number;
  laminating: number;
  processing: {
    hole: number;
    cutout_small: number;
    cutout_large: number;
    edge_polish_matte: number;
    edge_polish_polished: number;
    edge_polish_cnc: number;
    bevel: number;
    sandblasting_full: number;
    sandblasting_partial: number;
    anti_calc: number;
  };
  accessories: {
    hinge_wall_glass: number;
    hinge_glass_glass: number;
    handle_bar_200: number;
    handle_bar_400: number;
    handle_bar_600: number;
    handle_round: number;
    handle_square: number;
    stabilizer_short: number;
    stabilizer_medium: number;
    stabilizer_long: number;
    seal_magnetic: number;
    seal_rubber: number;
    seal_threshold: number;
    profile_u: number;
    profile_compensation: number;
    pivot_basic: number;
    pivot_with_damper: number;
    sliding_rail: number;
    sliding_rollers: number;
    sliding_damper: number;
    lock_key: number;
    lock_cylinder: number;
    mount_point_basic: number;
    mount_point_adjustable: number;
    handrail_42: number;
    handrail_50: number;
    led_perimeter: number;
    led_integrated: number;
    led_defogging: number;
  };
  labor: {
    base: number;
    per_sqm: number;
    assembly_simple: number;
    assembly_complex: number;
  };
  finishMultiplier: (finish: string) => number;
  getAccessoryByCode: (code: string) => number;
  getProcessingPriceByCode: (code: string) => number;
  getGlassDeductionByCode: (code: string) => number;
  getGlassDeductionsByCode: (code: string) => Record<string, number>;
  mirrorPrice: (type: string) => number;
  kitchenFrontTypeCost: (frontType: string) => number;
  // Balustrade-specific pricing
  balustrade: {
    glassPrice: (thickness: GlassThickness) => number;
    laminatedSupplement: number;
    mountPoint: number;
    mountPointFixed: number;
    uProfile: (size: string) => number;
    handrail: (diameter: number, type: string) => number;
    elbowConnector: number;
    endCap: number;
    wallBracket: number;
    edgePolish: number;
    holeDrilling: number;
    tempering: number;
    laborSimple: number;
    laborStairs: number;
    laborExterior: number;
    finishMultiplier: (finish: string) => number;
  };
}

// Mapping from processing_types values to processing price codes
export const PROCESSING_TYPE_TO_CODE: Record<string, string> = {
  gaurire: 'hole',
  decupaj_mare: 'cutout_large',
  decupaj_mic: 'cutout_small',
  securizat: 'tempering',
  laminat: 'laminating',
};

// Calculate total processing cost from a processing_types map (used for kits & accessories)
export function calculateProcessingTypeCost(
  processingTypes: Record<string, number> | undefined,
  pricing: PricingData
): number {
  if (!processingTypes) return 0;
  let total = 0;
  for (const [pt, qty] of Object.entries(processingTypes)) {
    if (!qty || qty <= 0) continue;
    const procCode = PROCESSING_TYPE_TO_CODE[pt];
    if (!procCode) continue;
    // securizat and laminat are top-level on PricingData, not inside processing
    if (procCode === 'tempering') {
      total += pricing.tempering * qty;
    } else if (procCode === 'laminating') {
      total += pricing.laminating * qty;
    } else {
      const unitPrice = pricing.processing[procCode as keyof typeof pricing.processing] ?? 0;
      total += unitPrice * qty;
    }
  }
  return total;
}

// Build pricing data from the items fetched from the database
export function buildPricingData(pricingMap: Map<string, number>, processingPriceMap?: Map<string, number>, deductionMap?: Map<string, number>, deductionsMap?: Map<string, Record<string, number>>, processingTypesMap?: Map<string, Record<string, number>>): PricingData {
  const getPrice = (code: string, defaultValue: number = 0): number => 
    pricingMap.get(code) ?? defaultValue;

  return {
    glassPrice: (thickness: GlassThickness, type: GlassType | string): number => {
      const code = `glass_${thickness}_${type}`;
      return pricingMap.get(code) ?? 0;
    },
    tempering: getPrice('tempering', 45),
    laminating: getPrice('laminating', 85),
    processing: {
      hole: getPrice('hole', 15),
      cutout_small: getPrice('cutout_small', 50),
      cutout_large: getPrice('cutout_large', 100),
      edge_polish_matte: getPrice('edge_polish_matte', 8),
      edge_polish_polished: getPrice('edge_polish_polished', 15),
      edge_polish_cnc: getPrice('edge_polish_cnc', 25),
      bevel: getPrice('bevel', 25),
      sandblasting_full: getPrice('sandblasting_full', 35),
      sandblasting_partial: getPrice('sandblasting_partial', 55),
      anti_calc: getPrice('anti_calc', 40),
    },
    accessories: {
      hinge_wall_glass: getPrice('hinge_wall_glass', 85),
      hinge_glass_glass: getPrice('hinge_glass_glass', 95),
      handle_bar_200: getPrice('handle_bar_200', 65),
      handle_bar_400: getPrice('handle_bar_400', 85),
      handle_bar_600: getPrice('handle_bar_600', 105),
      handle_round: getPrice('handle_round', 55),
      handle_square: getPrice('handle_square', 75),
      stabilizer_short: getPrice('stabilizer_short', 45),
      stabilizer_medium: getPrice('stabilizer_medium', 65),
      stabilizer_long: getPrice('stabilizer_long', 85),
      seal_magnetic: getPrice('seal_magnetic', 35),
      seal_rubber: getPrice('seal_rubber', 15),
      seal_threshold: getPrice('seal_threshold', 45),
      profile_u: getPrice('profile_u', 55),
      profile_compensation: getPrice('profile_compensation', 65),
      pivot_basic: getPrice('pivot_basic', 180),
      pivot_with_damper: getPrice('pivot_with_damper', 280),
      sliding_rail: getPrice('sliding_rail', 120),
      sliding_rollers: getPrice('sliding_rollers', 95),
      sliding_damper: getPrice('sliding_damper', 85),
      lock_key: getPrice('lock_key', 120),
      lock_cylinder: getPrice('lock_cylinder', 180),
      mount_point_basic: getPrice('mount_point_basic', 35),
      mount_point_adjustable: getPrice('mount_point_adjustable', 55),
      handrail_42: getPrice('handrail_42', 85),
      handrail_50: getPrice('handrail_50', 105),
      led_perimeter: getPrice('led_perimeter', 150),
      led_integrated: getPrice('led_integrated', 250),
      led_defogging: getPrice('led_defogging', 120),
    },
    labor: {
      base: getPrice('labor_base', 150),
      per_sqm: getPrice('labor_per_sqm', 25),
      assembly_simple: getPrice('assembly_simple', 50),
      assembly_complex: getPrice('assembly_complex', 150),
    },
    finishMultiplier: (finish: string): number => {
      const direct = pricingMap.get(finish);
      if (direct !== undefined) return direct;
      const prefixed = pricingMap.get(`finish_${finish}`);
      return prefixed ?? 1.0;
    },
    getAccessoryByCode: (code: string): number => {
      return pricingMap.get(code) ?? 0;
    },
    getProcessingPriceByCode: (code: string): number => {
      // First check if this code has processing_types defined — derive cost from processing category
      const procTypes = processingTypesMap?.get(code);
      if (procTypes && Object.keys(procTypes).length > 0) {
        let total = 0;
        for (const [pt, qty] of Object.entries(procTypes)) {
          const procCode = PROCESSING_TYPE_TO_CODE[pt];
          if (procCode && qty > 0) {
            total += (pricingMap.get(procCode) ?? 0) * qty;
          }
        }
        if (total > 0) return total;
      }
      // Fallback to materials.processing_price
      return processingPriceMap?.get(code) ?? 0;
    },
    getGlassDeductionByCode: (code: string): number => {
      return deductionMap?.get(code) ?? 0;
    },
    getGlassDeductionsByCode: (code: string): Record<string, number> => {
      return deductionsMap?.get(code) ?? {};
    },
    mirrorPrice: (type: string): number => {
      const code = `mirror_4_${type}`;
      return pricingMap.get(code) ?? 120;
    },
    kitchenFrontTypeCost: (frontType: string): number => {
      const code = `kitchen_${frontType}`;
      return pricingMap.get(code) ?? 85;
    },
    // Balustrade-specific pricing from database
    balustrade: {
      glassPrice: (thickness: GlassThickness): number => {
        const code = `balustrade_glass_${thickness}`;
        return pricingMap.get(code) ?? getPrice(`glass_${thickness}_clear`, 180);
      },
      laminatedSupplement: getPrice('balustrade_glass_laminated', 85),
      mountPoint: getPrice('balustrade_mount_point', 45),
      mountPointFixed: getPrice('balustrade_mount_fixed', 35),
      uProfile: (size: string): number => {
        if (size === '30x20') return getPrice('balustrade_u_profile_small', 65);
        if (size === '40x20') return getPrice('balustrade_u_profile_medium', 80);
        return getPrice('balustrade_u_profile_large', 95);
      },
      handrail: (diameter: number, type: string): number => {
        if (type === 'flat') return getPrice('balustrade_handrail_flat', 160);
        if (diameter <= 42) return getPrice('balustrade_handrail_round_42', 120);
        return getPrice('balustrade_handrail_round_50', 145);
      },
      elbowConnector: getPrice('balustrade_elbow_connector', 55),
      endCap: getPrice('balustrade_end_cap', 25),
      wallBracket: getPrice('balustrade_wall_bracket', 38),
      edgePolish: getPrice('balustrade_edge_polish', 18),
      holeDrilling: getPrice('balustrade_hole_drilling', 12),
      tempering: getPrice('balustrade_tempering', 45),
      laborSimple: getPrice('balustrade_labor_simple', 85),
      laborStairs: getPrice('balustrade_labor_stairs', 150),
      laborExterior: getPrice('balustrade_labor_exterior', 180),
      finishMultiplier: (finish: string): number => {
        const code = `balustrade_finish_${finish}`;
        return pricingMap.get(code) ?? 1.0;
      },
    },
  };
}

// Hook that provides PricingData
export function usePricingData(): { pricing: PricingData | null; isLoading: boolean; pricingItems: PricingItem[] } {
  const { items, isLoading } = usePricingConfig();

  const [processingPriceMap, setProcessingPriceMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const fetchProcessingPrices = async () => {
      const { data } = await supabase
        .from('materials')
        .select('code, processing_price')
        .gt('processing_price', 0);
      if (data) {
        setProcessingPriceMap(new Map(data.map(m => [m.code, Number(m.processing_price) || 0])));
      }
    };
    fetchProcessingPrices();
  }, []);

  const pricing = useMemo(() => {
    if (isLoading || items.length === 0) return null;
    
    const pricingMap = new Map<string, number>();
    const deductionMap = new Map<string, number>();
    const deductionsMap = new Map<string, Record<string, number>>();
    const processingTypesMap = new Map<string, Record<string, number>>();
    items.forEach(item => {
      if (item.is_active) {
        pricingMap.set(item.code, item.price);
        if (item.glass_deduction) {
          deductionMap.set(item.code, item.glass_deduction);
        }
        if (item.glass_deductions && Object.keys(item.glass_deductions).length > 0) {
          deductionsMap.set(item.code, item.glass_deductions);
        }
        if (item.processing_types && Object.keys(item.processing_types).length > 0) {
          processingTypesMap.set(item.code, item.processing_types);
        }
      }
    });
    
    return buildPricingData(pricingMap, processingPriceMap, deductionMap, deductionsMap, processingTypesMap);
  }, [items, isLoading, processingPriceMap]);

  return { pricing, isLoading, pricingItems: items };
}
