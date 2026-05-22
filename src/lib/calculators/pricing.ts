import type { 
  GlassThickness, 
  GlassType, 
  ShowerConfig,
  BalustradeConfig,
  DoorConfig,
  PanelConfig,
  MirrorConfig,
  KitchenFrontConfig,
  PriceBreakdown 
} from '@/types/calculators';
import type { PricingData } from '@/hooks/useDynamicPricing';

// Default fallback prices (used when pricing data is not yet loaded)
const DEFAULT_PRICING: PricingData = {
  glassPrice: (thickness: GlassThickness, type: GlassType | string): number => {
    const prices: Record<GlassThickness, Record<string, number>> = {
      6: { clear: 85, frosted: 120, patterned: 140, bronze: 110, grey: 110, green: 115, low_e: 180 },
      8: { clear: 110, frosted: 150, patterned: 170, bronze: 140, grey: 140, green: 145, low_e: 220 },
      10: { clear: 145, frosted: 190, patterned: 210, bronze: 175, grey: 175, green: 180, low_e: 280 },
      12: { clear: 190, frosted: 240, patterned: 260, bronze: 220, grey: 220, green: 225, low_e: 350 },
    };
    return prices[thickness]?.[type] ?? 0;
  },
  tempering: 45,
  laminating: 85,
  processing: {
    hole: 15,
    cutout_small: 50,
    cutout_large: 100,
    edge_polish_matte: 8,
    edge_polish_polished: 15,
    edge_polish_cnc: 25,
    bevel: 25,
    sandblasting_full: 35,
    sandblasting_partial: 55,
    anti_calc: 40,
  },
  accessories: {
    hinge_wall_glass: 85,
    hinge_glass_glass: 95,
    handle_bar_200: 65,
    handle_bar_400: 85,
    handle_bar_600: 105,
    handle_round: 55,
    handle_square: 75,
    stabilizer_short: 45,
    stabilizer_medium: 65,
    stabilizer_long: 85,
    seal_magnetic: 35,
    seal_rubber: 15,
    seal_threshold: 45,
    profile_u: 55,
    profile_compensation: 65,
    pivot_basic: 180,
    pivot_with_damper: 280,
    sliding_rail: 120,
    sliding_rollers: 95,
    sliding_damper: 85,
    lock_key: 120,
    lock_cylinder: 180,
    mount_point_basic: 35,
    mount_point_adjustable: 55,
    handrail_42: 85,
    handrail_50: 105,
    led_perimeter: 150,
    led_integrated: 250,
    led_defogging: 120,
  },
  labor: {
    base: 150,
    per_sqm: 25,
    assembly_simple: 50,
    assembly_complex: 150,
  },
  finishMultiplier: (finish: string): number => {
    const multipliers: Record<string, number> = {
      polished_stainless: 1.0,
      brushed_stainless: 1.1,
      matte_black: 1.25,
      chrome: 1.15,
      anodized_silver: 1.05,
    };
    return multipliers[finish] ?? 1.0;
  },
  getAccessoryByCode: (): number => 0,
  getProcessingPriceByCode: (): number => 0,
  getGlassDeductionByCode: (): number => 0,
  getGlassDeductionsByCode: (): Record<string, number> => ({}),
  mirrorPrice: (type: string): number => {
    const prices: Record<string, number> = { silver: 120, bronze: 145, grey: 145 };
    return prices[type] ?? 120;
  },
  kitchenFrontTypeCost: (frontType: string): number => {
    const costs: Record<string, number> = { lacquered: 85, printed: 150, frosted: 45 };
    return costs[frontType] ?? 85;
  },
  // Default balustrade pricing
  balustrade: {
    glassPrice: (thickness: GlassThickness): number => {
      const prices: Record<GlassThickness, number> = { 6: 150, 8: 180, 10: 220, 12: 280 };
      return prices[thickness] ?? 180;
    },
    laminatedSupplement: 85,
    mountPoint: 45,
    mountPointFixed: 35,
    uProfile: (size: string): number => {
      if (size === '30x20') return 65;
      if (size === '40x20') return 80;
      return 95;
    },
    handrail: (diameter: number, type: string): number => {
      if (type === 'flat') return 160;
      if (diameter <= 42) return 120;
      return 145;
    },
    elbowConnector: 55,
    endCap: 25,
    wallBracket: 38,
    edgePolish: 18,
    holeDrilling: 12,
    tempering: 45,
    laborSimple: 85,
    laborStairs: 150,
    laborExterior: 180,
    finishMultiplier: (finish: string): number => {
      const multipliers: Record<string, number> = {
        polished: 1.0,
        brushed: 1.1,
        black: 1.25,
        gold: 1.4,
        anodized: 1.0,
      };
      return multipliers[finish] ?? 1.0;
    },
  },
};

// Helper function to calculate glass area in sqm
function calculateGlassArea(width: number, height: number): number {
  return (width * height) / 1000000;
}

// Helper function to calculate perimeter in meters
function calculatePerimeter(width: number, height: number): number {
  return (2 * (width + height)) / 1000;
}

// Generic: recursively collect all materialCode values from any config object
export function collectMaterialCodesFromConfig(obj: unknown): string[] {
  const codes = new Set<string>();
  function walk(val: unknown) {
    if (!val || typeof val !== 'object') return;
    if (Array.isArray(val)) { val.forEach(walk); return; }
    const o = val as Record<string, unknown>;
    if (typeof o.materialCode === 'string' && o.materialCode) codes.add(o.materialCode);
    if (typeof o.magneticMaterialCode === 'string' && o.magneticMaterialCode) codes.add(o.magneticMaterialCode);
    if (typeof o.rubberMaterialCode === 'string' && o.rubberMaterialCode) codes.add(o.rubberMaterialCode);
    if (typeof o.thresholdMaterialCode === 'string' && o.thresholdMaterialCode) codes.add(o.thresholdMaterialCode);
    if (Array.isArray(o.materialCodes)) (o.materialCodes as string[]).forEach(c => { if (c) codes.add(c); });
    for (const key of Object.keys(o)) {
      if (['materialCode', 'magneticMaterialCode', 'rubberMaterialCode', 'thresholdMaterialCode', 'materialCodes'].includes(key)) continue;
      if (typeof o[key] === 'object' && o[key] !== null) walk(o[key]);
    }
  }
  walk(obj);
  return [...codes];
}

// Aggregate glass deductions from all selected accessories
// Returns { widthDeduction, heightDeduction } in mm
export function aggregateGlassDeductions(codes: string[], pricing: PricingData): { widthDeduction: number; heightDeduction: number } {
  let totalSideA = 0, totalSideB = 0, totalTop = 0, totalBottom = 0;
  for (const code of codes) {
    const d = pricing.getGlassDeductionsByCode(code);
    if (d.side_a) totalSideA = Math.max(totalSideA, d.side_a);
    if (d.side_b) totalSideB = Math.max(totalSideB, d.side_b);
    if (d.top) totalTop = Math.max(totalTop, d.top);
    if (d.bottom) totalBottom = Math.max(totalBottom, d.bottom);
  }
  return {
    widthDeduction: totalSideA + totalSideB,
    heightDeduction: totalTop + totalBottom,
  };
}

// Calculate shower price
export function calculateShowerPrice(config: ShowerConfig, pricing: PricingData = DEFAULT_PRICING): PriceBreakdown {
  const { dimensions, glass, accessories, cabinType, doorType, lateralConfig } = config;
  
  // Aggregate glass deductions from ALL selected accessories
  const allCodes = collectMaterialCodesFromConfig({ accessories, lateralConfig });
  const { widthDeduction, heightDeduction } = aggregateGlassDeductions(allCodes, pricing);
  
  let totalGlassArea = 0;
  let uProfileLength = 0;
  
  switch (cabinType) {
    case 'corner_90': {
      // Use aggregated width deduction (replaces old magneticSealDeduction-only logic)
      const sealDeduction = widthDeduction;
      
      // Frontal: door + fixed panels (trapezoid if frontalHeightA/B set)
      const doorH = dimensions.height - heightDeduction;
      const fHA = dimensions.frontalHeightA ? dimensions.frontalHeightA - heightDeduction : undefined;
      const fHB = dimensions.frontalHeightB ? dimensions.frontalHeightB - heightDeduction : undefined;
      if (fHA !== undefined && fHB !== undefined && fHA !== fHB) {
        totalGlassArea = ((fHA + fHB) / 2 * (dimensions.doorWidth - sealDeduction)) / 1000000;
      } else {
        totalGlassArea = calculateGlassArea(dimensions.doorWidth - sealDeduction, doorH);
      }
      const fpLeft = accessories.fixedPanel?.left;
      const fpRight = accessories.fixedPanel?.right;
      if (fpLeft?.enabled) totalGlassArea += calculateGlassArea(fpLeft.width, (fpLeft.height ?? dimensions.height) - heightDeduction);
      if (fpRight?.enabled) totalGlassArea += calculateGlassArea(fpRight.width, (fpRight.height ?? dimensions.height) - heightDeduction);
      
      // Lateral
      if (lateralConfig?.enabled) {
        totalGlassArea += calculateGlassArea(dimensions.lateralDoorWidth - sealDeduction, doorH);
        if (lateralConfig.fixedPanel.left.enabled) totalGlassArea += calculateGlassArea(lateralConfig.fixedPanel.left.width, (lateralConfig.fixedPanel.left.height ?? dimensions.height) - heightDeduction);
        if (lateralConfig.fixedPanel.right.enabled) totalGlassArea += calculateGlassArea(lateralConfig.fixedPanel.right.width, (lateralConfig.fixedPanel.right.height ?? dimensions.height) - heightDeduction);
      } else {
        // When lateral not enabled: the non-door side is a full glass panel
        const openingSide = accessories.openingSide || 'front';
        const fullPanelWall = openingSide === 'front' ? dimensions.depth : dimensions.width;
        // Trapezoid: use average height if lateralHeightA/B defined
        const latHA = dimensions.lateralHeightA ? dimensions.lateralHeightA - heightDeduction : undefined;
        const latHB = dimensions.lateralHeightB ? dimensions.lateralHeightB - heightDeduction : undefined;
        if (latHA !== undefined && latHB !== undefined && latHA !== latHB) {
          totalGlassArea += ((latHA + latHB) / 2 * (fullPanelWall - sealDeduction)) / 1000000;
        } else {
          totalGlassArea += calculateGlassArea(fullPanelWall - sealDeduction, doorH);
        }
      }

      // --- U-profile: vertical on wall edges + base/top under fixed panels only ---
      // Corner 90 has 2 walls: back-left and back-right
      {
        const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
        if (pSides.left) uProfileLength += dimensions.height;
        if (pSides.right) uProfileLength += dimensions.height;

        // Top: same segments as bottom (fixed panel widths + lateral)
        const addHorizontalSegments = () => {
          if (fpLeft?.enabled) uProfileLength += fpLeft.width;
          if (fpRight?.enabled) uProfileLength += fpRight.width;
          if (lateralConfig?.enabled) {
            if (lateralConfig.fixedPanel.left.enabled) uProfileLength += lateralConfig.fixedPanel.left.width;
            if (lateralConfig.fixedPanel.right.enabled) uProfileLength += lateralConfig.fixedPanel.right.width;
          } else {
            const openingSide = accessories.openingSide || 'front';
            uProfileLength += openingSide === 'front' ? dimensions.depth : dimensions.width;
          }
        };
        if (pSides.bottom) addHorizontalSegments();
        if (pSides.top) addHorizontalSegments();
      }
      break;
    }
    case 'walk_in': {
      totalGlassArea = calculateGlassArea(dimensions.width - widthDeduction, dimensions.height - heightDeduction);
      {
        const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
        const wiFpLeft = accessories.fixedPanel?.left;
        const wiFpRight = accessories.fixedPanel?.right;
        if (pSides.left) uProfileLength += dimensions.height;
        if (pSides.right) uProfileLength += dimensions.height;
        const addWiHoriz = () => {
          if (wiFpLeft?.enabled) uProfileLength += wiFpLeft.width;
          if (wiFpRight?.enabled) uProfileLength += wiFpRight.width;
          if (!wiFpLeft?.enabled && !wiFpRight?.enabled) uProfileLength += dimensions.width;
        };
        if (pSides.bottom) addWiHoriz();
        if (pSides.top) addWiHoriz();
      }
      break;
    }
    case 'pentagon':
      totalGlassArea = calculateGlassArea(dimensions.width - widthDeduction, dimensions.height - heightDeduction) * 1.5;
      {
        const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
        if (pSides.left) uProfileLength += dimensions.height;
        const pentBase = (dimensions.width * 2 + dimensions.depth * 2) - dimensions.doorWidth;
        if (pSides.bottom) uProfileLength += pentBase;
        if (pSides.top) uProfileLength += pentBase;
      }
      break;
    case 'bathtub': {
      totalGlassArea = calculateGlassArea(dimensions.width - widthDeduction, dimensions.height - heightDeduction);
      {
        const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
        const btFpLeft = accessories.fixedPanel?.left;
        const btFpRight = accessories.fixedPanel?.right;
        if (pSides.left) uProfileLength += dimensions.height;
        const addBtHoriz = () => {
          if (btFpLeft?.enabled) uProfileLength += btFpLeft.width;
          if (btFpRight?.enabled) uProfileLength += btFpRight.width;
          if (!btFpLeft?.enabled && !btFpRight?.enabled) uProfileLength += dimensions.width;
        };
        if (pSides.bottom) addBtHoriz();
        if (pSides.top) addBtHoriz();
      }
      break;
    }
    case 'fixed_panel': {
      // Fixed panel: single glass pane, no door
      totalGlassArea = calculateGlassArea(dimensions.width - widthDeduction, dimensions.height - heightDeduction);
      {
        const pSides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
        if (pSides.left) uProfileLength += dimensions.height;
        if (pSides.right) uProfileLength += dimensions.height;
        if (pSides.bottom) uProfileLength += dimensions.width;
        if (pSides.top) uProfileLength += dimensions.width;
      }
      break;
    }
  }
  
  // Glass cost
  const glassBasePrice = pricing.glassPrice(glass.thickness, glass.type);
  let glassTotal = totalGlassArea * glassBasePrice;
  
  // Tempering (always for shower)
  glassTotal += totalGlassArea * pricing.tempering * glass.thickness;
  
  // Processing
  let processingTotal = 0;
  
  if (glass.antiCalc) {
    processingTotal += totalGlassArea * pricing.processing.anti_calc;
  }
  
  // Edge polishing based on config — calculate per actual glass piece
  if (config.edgePolish.enabled) {
    let totalPerimeter = 0;
    const edgeDoorH = dimensions.height - heightDeduction;
    
    // Door piece
    const doorW = cabinType === 'corner_90' || cabinType === 'walk_in' || cabinType === 'bathtub'
      ? dimensions.doorWidth : dimensions.width;
    totalPerimeter += calculatePerimeter(doorW - widthDeduction, edgeDoorH);
    
    // Frontal fixed panels
    const fpLeft = accessories.fixedPanel?.left;
    const fpRight = accessories.fixedPanel?.right;
    if (fpLeft?.enabled) totalPerimeter += calculatePerimeter(fpLeft.width, (fpLeft.height ?? dimensions.height) - heightDeduction);
    if (fpRight?.enabled) totalPerimeter += calculatePerimeter(fpRight.width, (fpRight.height ?? dimensions.height) - heightDeduction);
    
    // Lateral pieces (corner_90)
    if (cabinType === 'corner_90') {
      if (lateralConfig?.enabled) {
        totalPerimeter += calculatePerimeter(dimensions.lateralDoorWidth - widthDeduction, edgeDoorH);
        if (lateralConfig.fixedPanel.left.enabled) totalPerimeter += calculatePerimeter(lateralConfig.fixedPanel.left.width, (lateralConfig.fixedPanel.left.height ?? dimensions.height) - heightDeduction);
        if (lateralConfig.fixedPanel.right.enabled) totalPerimeter += calculatePerimeter(lateralConfig.fixedPanel.right.width, (lateralConfig.fixedPanel.right.height ?? dimensions.height) - heightDeduction);
      } else {
        const openingSide = accessories.openingSide || 'front';
        const fullPanelWall = openingSide === 'front' ? dimensions.depth : dimensions.width;
        totalPerimeter += calculatePerimeter(fullPanelWall - widthDeduction, edgeDoorH);
      }
    }
    
    const polishPrice = config.edgePolish.type === 'matte'
      ? pricing.processing.edge_polish_matte
      : config.edgePolish.type === 'beveled'
        ? pricing.processing.bevel
        : config.edgePolish.type === 'cnc'
          ? pricing.processing.edge_polish_cnc
          : pricing.processing.edge_polish_polished;
    processingTotal += totalPerimeter * polishPrice;
  }
  
  // Accessories
  let accessoriesTotal = 0;
  
  // Profiles cost - use selections array if present
  if (accessories.profiles.enabled !== false) {
    const profileSelections = accessories.profiles.selections || [];
    const profileFinishMultiplier = pricing.finishMultiplier(accessories.profiles.finish);
    if (profileSelections.length > 0) {
      profileSelections.forEach(sel => {
        let price = pricing.getAccessoryByCode(sel.materialCode);
        if (price <= 0) {
          price = accessories.profiles.type === 'compensation'
            ? pricing.accessories.profile_compensation
            : (pricing.getAccessoryByCode('shower_u_profile_19x12') || pricing.accessories.profile_u);
        }
        accessoriesTotal += (uProfileLength / 1000) * price * profileFinishMultiplier;
        processingTotal += pricing.getProcessingPriceByCode(sel.materialCode);
      });
    } else if (accessories.profiles.materialCode) {
      let profilePrice = pricing.getAccessoryByCode(accessories.profiles.materialCode);
      if (profilePrice <= 0) {
        profilePrice = accessories.profiles.type === 'compensation'
          ? pricing.accessories.profile_compensation
          : (pricing.getAccessoryByCode('shower_u_profile_19x12') || pricing.accessories.profile_u);
      }
      accessoriesTotal += (uProfileLength / 1000) * profilePrice * profileFinishMultiplier;
      processingTotal += pricing.getProcessingPriceByCode(accessories.profiles.materialCode);
    }
  }
  
  // Hinges - skip entirely for fixed_panel
  if (cabinType !== 'fixed_panel') {
  // Use selections array if present, else fallback to materialCode + quantity
  // The authoritative count is always accessories.hinges.quantity
  const hingeSelections = accessories.hinges.selections || [];
  const hingeQty = accessories.hinges.quantity || hingeSelections.length || 1;
  if (hingeSelections.length > 0) {
    // Use the first selection's material but multiply by the authoritative quantity
    const sel = hingeSelections[0];
    let price = pricing.getAccessoryByCode(sel.materialCode);
    if (price <= 0) {
      price = accessories.hinges.type === 'wall_glass'
        ? pricing.accessories.hinge_wall_glass
        : pricing.accessories.hinge_glass_glass;
    }
    accessoriesTotal += price * hingeQty * pricing.finishMultiplier(accessories.hinges.finish);
    processingTotal += pricing.getProcessingPriceByCode(sel.materialCode) * hingeQty;
  } else if (accessories.hinges.materialCode) {
    let hingePrice = pricing.getAccessoryByCode(accessories.hinges.materialCode);
    if (hingePrice <= 0) {
      hingePrice = accessories.hinges.type === 'wall_glass' 
        ? pricing.accessories.hinge_wall_glass 
        : pricing.accessories.hinge_glass_glass;
    }
    accessoriesTotal += hingePrice * accessories.hinges.quantity * 
      pricing.finishMultiplier(accessories.hinges.finish);
    processingTotal += pricing.getProcessingPriceByCode(accessories.hinges.materialCode) * accessories.hinges.quantity;
  }
  }
  
  // Handle - skip entirely for fixed_panel
  if (cabinType !== 'fixed_panel') {
  // Handle - use selections array if present, else fallback
  const handleSelections = accessories.handle.selections || [];
  if (handleSelections.length > 0) {
    handleSelections.forEach(sel => {
      let price = pricing.getAccessoryByCode(sel.materialCode);
      if (price <= 0) {
        if (accessories.handle.model === 'round') {
          price = pricing.accessories.handle_round;
        } else if (accessories.handle.model === 'square') {
          price = pricing.accessories.handle_square;
        } else {
          price = pricing.accessories.handle_bar_200;
          if (accessories.handle.length >= 400) price = pricing.accessories.handle_bar_400;
          if (accessories.handle.length >= 600) price = pricing.accessories.handle_bar_600;
        }
      }
      accessoriesTotal += price * pricing.finishMultiplier(accessories.handle.finish);
      processingTotal += pricing.getProcessingPriceByCode(sel.materialCode);
    });
  } else if (accessories.handle.materialCode) {
    let handlePrice = pricing.getAccessoryByCode(accessories.handle.materialCode);
    if (handlePrice <= 0) {
      if (accessories.handle.model === 'round') {
        handlePrice = pricing.accessories.handle_round;
      } else if (accessories.handle.model === 'square') {
        handlePrice = pricing.accessories.handle_square;
      } else {
        handlePrice = pricing.accessories.handle_bar_200;
        if (accessories.handle.length >= 400) handlePrice = pricing.accessories.handle_bar_400;
        if (accessories.handle.length >= 600) handlePrice = pricing.accessories.handle_bar_600;
      }
    }
    accessoriesTotal += handlePrice * pricing.finishMultiplier(accessories.handle.finish);
    processingTotal += pricing.getProcessingPriceByCode(accessories.handle.materialCode);
  }
  }
  
  // Seals - use selections arrays if present, else fallback
  if (accessories.seals.magnetic) {
    const magneticSels = accessories.seals.magneticSelections || [];
    if (magneticSels.length > 0) {
      magneticSels.forEach(sel => {
        let price = pricing.getAccessoryByCode(sel.materialCode);
        if (price <= 0) price = pricing.accessories.seal_magnetic;
        accessoriesTotal += dimensions.height / 1000 * price;
        processingTotal += pricing.getProcessingPriceByCode(sel.materialCode);
      });
    } else if (accessories.seals.magneticMaterialCode) {
      let magneticPrice = pricing.getAccessoryByCode(accessories.seals.magneticMaterialCode);
      if (magneticPrice <= 0) magneticPrice = pricing.accessories.seal_magnetic;
      accessoriesTotal += dimensions.height / 1000 * magneticPrice;
      processingTotal += pricing.getProcessingPriceByCode(accessories.seals.magneticMaterialCode);
    }
  }
  if (accessories.seals.rubber) {
    const rubberSels = accessories.seals.rubberSelections || [];
    if (rubberSels.length > 0) {
      rubberSels.forEach(sel => {
        let price = pricing.getAccessoryByCode(sel.materialCode);
        if (price <= 0) price = pricing.accessories.seal_rubber;
        accessoriesTotal += (dimensions.width + dimensions.height) / 1000 * price;
        processingTotal += pricing.getProcessingPriceByCode(sel.materialCode);
      });
    } else if (accessories.seals.rubberMaterialCode) {
      let rubberPrice = pricing.getAccessoryByCode(accessories.seals.rubberMaterialCode);
      if (rubberPrice <= 0) rubberPrice = pricing.accessories.seal_rubber;
      accessoriesTotal += (dimensions.width + dimensions.height) / 1000 * rubberPrice;
      processingTotal += pricing.getProcessingPriceByCode(accessories.seals.rubberMaterialCode);
    }
  }
  if (accessories.seals.threshold) {
    const thresholdSels = accessories.seals.thresholdSelections || [];
    if (thresholdSels.length > 0) {
      thresholdSels.forEach(sel => {
        let price = pricing.getAccessoryByCode(sel.materialCode);
        if (price <= 0) price = pricing.accessories.seal_threshold;
        accessoriesTotal += dimensions.width / 1000 * price;
        processingTotal += pricing.getProcessingPriceByCode(sel.materialCode);
      });
    } else if (accessories.seals.thresholdMaterialCode) {
      let thresholdPrice = pricing.getAccessoryByCode(accessories.seals.thresholdMaterialCode);
      if (thresholdPrice <= 0) thresholdPrice = pricing.accessories.seal_threshold;
      accessoriesTotal += dimensions.width / 1000 * thresholdPrice;
      processingTotal += pricing.getProcessingPriceByCode(accessories.seals.thresholdMaterialCode);
    }
  }
  
  // Stabilizers - selections array (new pattern) + legacy array fallback
  const stabSelections = accessories.stabilizerSelections || [];
  if (stabSelections.length > 0) {
    stabSelections.forEach(sel => {
      let unitPricePerMeter = pricing.getAccessoryByCode(sel.materialCode);
      if (unitPricePerMeter <= 0) unitPricePerMeter = pricing.accessories.stabilizer_medium;
      const lengthMm = sel.length ?? 0;
      const isPipe = sel.materialCode?.startsWith('35.') || sel.materialCode?.startsWith('72.');
      accessoriesTotal += isPipe
        ? unitPricePerMeter * (lengthMm / 1000)
        : unitPricePerMeter;
      processingTotal += pricing.getProcessingPriceByCode(sel.materialCode);
    });
  } else {
    accessories.stabilizers.forEach(stab => {
      if (!stab.materialCode) return;
      let unitPricePerMeter = pricing.getAccessoryByCode(stab.materialCode);
      if (unitPricePerMeter <= 0) unitPricePerMeter = pricing.accessories.stabilizer_medium;
      accessoriesTotal += unitPricePerMeter * (stab.length / 1000);
      processingTotal += pricing.getProcessingPriceByCode(stab.materialCode);
    });
  }
  
  // Extra accessories (from catalog)
  if (accessories.extraAccessories && accessories.extraAccessories.length > 0) {
    accessories.extraAccessories.forEach(extra => {
      let extraPrice = extra.unitPrice ?? 0;
      if (extraPrice <= 0 && extra.materialCode) {
        extraPrice = pricing.getAccessoryByCode(extra.materialCode);
      }
      accessoriesTotal += extraPrice * (extra.quantity || 1);
      if (extra.materialCode) {
        processingTotal += pricing.getProcessingPriceByCode(extra.materialCode) * (extra.quantity || 1);
      }
    });
  }
  
  // Door-type specific accessories (skip for fixed_panel - no door)
  if (cabinType !== 'fixed_panel') {
  if (doorType === 'pivot') {
    accessoriesTotal += pricing.accessories.pivot_with_damper;
  } else if (doorType === 'sliding') {
    // If a specific mechanism code is set, use its price from pricing_config
    const mechCode = config.slidingMechanismCode;
    if (mechCode) {
      const mechPrice = pricing.getAccessoryByCode(mechCode);
      if (mechPrice > 0) {
        accessoriesTotal += mechPrice;
        processingTotal += pricing.getProcessingPriceByCode(mechCode);
      } else {
        accessoriesTotal += (dimensions.width / 1000) * pricing.accessories.sliding_rail;
        accessoriesTotal += pricing.accessories.sliding_rollers;
        accessoriesTotal += pricing.accessories.sliding_damper;
      }
    } else {
      accessoriesTotal += (dimensions.width / 1000) * pricing.accessories.sliding_rail;
      accessoriesTotal += pricing.accessories.sliding_rollers;
      accessoriesTotal += pricing.accessories.sliding_damper;
    }
  }
  }
  
  // ── Lateral Config Hardware (when enabled) ──
  if (lateralConfig?.enabled && cabinType === 'corner_90') {
    // Lateral hinges
    const latHingeSelections = lateralConfig.hinges.selections || [];
    const latHingeQty = lateralConfig.hinges.quantity || latHingeSelections.length || 1;
    if (latHingeSelections.length > 0) {
      const sel = latHingeSelections[0];
      let price = pricing.getAccessoryByCode(sel.materialCode);
      if (price <= 0) price = lateralConfig.hinges.type === 'wall_glass' ? pricing.accessories.hinge_wall_glass : pricing.accessories.hinge_glass_glass;
      accessoriesTotal += price * latHingeQty * pricing.finishMultiplier(lateralConfig.hinges.finish);
      processingTotal += pricing.getProcessingPriceByCode(sel.materialCode) * latHingeQty;
    } else {
      let hingePrice = lateralConfig.hinges.materialCode ? pricing.getAccessoryByCode(lateralConfig.hinges.materialCode) : 0;
      if (hingePrice <= 0) hingePrice = lateralConfig.hinges.type === 'wall_glass' ? pricing.accessories.hinge_wall_glass : pricing.accessories.hinge_glass_glass;
      accessoriesTotal += hingePrice * lateralConfig.hinges.quantity * pricing.finishMultiplier(lateralConfig.hinges.finish);
    }

    // Lateral handle
    const latHandleSelections = lateralConfig.handle.selections || [];
    if (latHandleSelections.length > 0) {
      latHandleSelections.forEach(sel => {
        let price = pricing.getAccessoryByCode(sel.materialCode);
        if (price <= 0) price = pricing.accessories.handle_bar_200;
        accessoriesTotal += price * pricing.finishMultiplier(lateralConfig.handle.finish);
        processingTotal += pricing.getProcessingPriceByCode(sel.materialCode);
      });
    } else {
      let handlePrice = lateralConfig.handle.materialCode ? pricing.getAccessoryByCode(lateralConfig.handle.materialCode) : 0;
      if (handlePrice <= 0) handlePrice = pricing.accessories.handle_bar_200;
      accessoriesTotal += handlePrice * pricing.finishMultiplier(lateralConfig.handle.finish);
    }

    // Lateral seals
    if (lateralConfig.seals.magnetic) {
      const sels = lateralConfig.seals.magneticSelections || [];
      if (sels.length > 0) {
        sels.forEach(sel => {
          let price = pricing.getAccessoryByCode(sel.materialCode);
          if (price <= 0) price = pricing.accessories.seal_magnetic;
          accessoriesTotal += dimensions.height / 1000 * price;
        });
      } else {
        accessoriesTotal += dimensions.height / 1000 * pricing.accessories.seal_magnetic;
      }
    }
    if (lateralConfig.seals.rubber) {
      const sels = lateralConfig.seals.rubberSelections || [];
      if (sels.length > 0) {
        sels.forEach(sel => {
          let price = pricing.getAccessoryByCode(sel.materialCode);
          if (price <= 0) price = pricing.accessories.seal_rubber;
          accessoriesTotal += (dimensions.depth + dimensions.height) / 1000 * price;
        });
      } else {
        accessoriesTotal += (dimensions.depth + dimensions.height) / 1000 * pricing.accessories.seal_rubber;
      }
    }
    if (lateralConfig.seals.threshold) {
      const sels = lateralConfig.seals.thresholdSelections || [];
      if (sels.length > 0) {
        sels.forEach(sel => {
          let price = pricing.getAccessoryByCode(sel.materialCode);
          if (price <= 0) price = pricing.accessories.seal_threshold;
          accessoriesTotal += dimensions.depth / 1000 * price;
        });
      } else {
        accessoriesTotal += dimensions.depth / 1000 * pricing.accessories.seal_threshold;
      }
    }

    // Lateral door-type specific
    if (lateralConfig.doorType === 'sliding') {
      const mechCode = config.slidingMechanismCode;
      if (mechCode) {
        const mechPrice = pricing.getAccessoryByCode(mechCode);
        if (mechPrice > 0) {
          accessoriesTotal += mechPrice;
        } else {
          accessoriesTotal += (dimensions.depth / 1000) * pricing.accessories.sliding_rail;
          accessoriesTotal += pricing.accessories.sliding_rollers;
          accessoriesTotal += pricing.accessories.sliding_damper;
        }
      } else {
        accessoriesTotal += (dimensions.depth / 1000) * pricing.accessories.sliding_rail;
        accessoriesTotal += pricing.accessories.sliding_rollers;
        accessoriesTotal += pricing.accessories.sliding_damper;
      }
    }
  }

  // Labor
  const laborTotal = pricing.labor.base + 
                     (totalGlassArea * pricing.labor.per_sqm) + 
                     pricing.labor.assembly_complex;
  
  return {
    glass: Math.round(glassTotal),
    processing: Math.round(processingTotal),
    accessories: Math.round(accessoriesTotal),
    labor: Math.round(laborTotal),
    total: Math.round(glassTotal + processingTotal + accessoriesTotal + laborTotal),
  };
}

// Calculate balustrade price
export function calculateBalustradePrice(config: BalustradeConfig, pricing: PricingData = DEFAULT_PRICING): PriceBreakdown {
  const { dimensions, glass, accessories, placement } = config;
  
  // Aggregate glass deductions from all selected accessories
  const allCodes = collectMaterialCodesFromConfig(config);
  const { widthDeduction: bWDed, heightDeduction: bHDed } = aggregateGlassDeductions(allCodes, pricing);
  
  let totalGlassArea: number;
  let panelWidth: number;
  let totalLength = dimensions.length;
  
  // For stairs, calculate each panel using bounding box method (production standard)
  // Area = panel height × inclined panel width (longest sides form the rectangle)
  if (placement === 'stairs' && dimensions.stairsConfig) {
    const sc = dimensions.stairsConfig;
    const panelHeight = sc.stairPanelHeight ?? 1000;
    
    let totalArea = 0;
    
    if (sc.hasIntermediateLanding) {
      // Ramp 1 (before intermediate landing)
      const steps1 = sc.landingPosition ?? 5;
      const projLen1 = steps1 * sc.stepDepth;
      const rise1 = steps1 * sc.stepHeight;
      const inclinedLen1 = Math.sqrt(projLen1 ** 2 + rise1 ** 2);
      const ramp1Panels = sc.ramp1PanelCount ?? 2;
      const panelWidth1 = inclinedLen1 / ramp1Panels;
      totalArea += (panelWidth1 * panelHeight * ramp1Panels) / 1_000_000;
      
      // Intermediate landing panel
      const landingPanelHeight = sc.intermediateLandingPanelHeight ?? 1000;
      totalArea += (sc.landingLength * landingPanelHeight) / 1_000_000;
      totalLength += sc.landingLength;
      
      // Ramp 2 (after intermediate landing)
      const steps2 = sc.stepCount - steps1;
      const projLen2 = steps2 * sc.stepDepth;
      const rise2 = steps2 * sc.stepHeight;
      const inclinedLen2 = Math.sqrt(projLen2 ** 2 + rise2 ** 2);
      const ramp2Panels = sc.ramp2PanelCount ?? 2;
      const panelWidth2 = inclinedLen2 / ramp2Panels;
      totalArea += (panelWidth2 * panelHeight * ramp2Panels) / 1_000_000;
      
      panelWidth = (panelWidth1 + panelWidth2) / 2; // Average for perimeter calculation
    } else {
      // Single ramp (no intermediate landing)
      const projLen = sc.stepCount * sc.stepDepth;
      const totalRise = sc.stepCount * sc.stepHeight;
      const inclinedLen = Math.sqrt(projLen ** 2 + totalRise ** 2);
      panelWidth = inclinedLen / dimensions.panelCount;
      totalArea += (panelWidth * panelHeight * dimensions.panelCount) / 1_000_000;
    }
    
    // Final landing panel
    if (sc.finalLandingLength && sc.finalLandingLength > 0) {
      const finalPanelHeight = sc.finalLandingPanelHeight ?? 1000;
      totalArea += (sc.finalLandingLength * finalPanelHeight) / 1_000_000;
      totalLength += sc.finalLandingLength;
    }
    
    totalGlassArea = totalArea;
  } else {
    panelWidth = dimensions.length / dimensions.panelCount - bWDed;
    const bH = dimensions.height - bHDed;
    totalGlassArea = (panelWidth * bH * dimensions.panelCount) / 1000000;
    
    
    // Add corner extensions (90° continuations)
    const corners = dimensions.corners;
    if (corners?.left?.enabled && corners.left.length > 0) {
      totalGlassArea += (corners.left.length * bH) / 1000000;
      totalLength += corners.left.length;
      // Sub-corners from left corner
      const subL = corners.left.subCorners;
      if (subL?.left?.enabled && subL.left.length > 0) {
        totalGlassArea += (subL.left.length * bH) / 1000000;
        totalLength += subL.left.length;
      }
      if (subL?.right?.enabled && subL.right.length > 0) {
        totalGlassArea += (subL.right.length * bH) / 1000000;
        totalLength += subL.right.length;
      }
    }
    if (corners?.right?.enabled && corners.right.length > 0) {
      totalGlassArea += (corners.right.length * bH) / 1000000;
      totalLength += corners.right.length;
      // Sub-corners from right corner
      const subR = corners.right.subCorners;
      if (subR?.left?.enabled && subR.left.length > 0) {
        totalGlassArea += (subR.left.length * bH) / 1000000;
        totalLength += subR.left.length;
      }
      if (subR?.right?.enabled && subR.right.length > 0) {
        totalGlassArea += (subR.right.length * bH) / 1000000;
        totalLength += subR.right.length;
      }
    }
  }
  
  // Use balustrade-specific glass pricing for stairs placement
  const useBalustradePricing = placement === 'stairs';
  const glassBasePrice = useBalustradePricing 
    ? pricing.balustrade.glassPrice(glass.thickness)
    : pricing.glassPrice(glass.thickness, glass.type as GlassType);
  let glassTotal = totalGlassArea * glassBasePrice;
  
  // Tempering
  const temperingCost = useBalustradePricing ? pricing.balustrade.tempering : pricing.tempering;
  glassTotal += totalGlassArea * temperingCost * glass.thickness;
  
  // Laminated glass
  if (glass.laminated || placement === 'exterior') {
    const laminatedCost = useBalustradePricing ? pricing.balustrade.laminatedSupplement : pricing.laminating;
    glassTotal += totalGlassArea * laminatedCost;
  }
  
  // Processing
  let processingTotal = 0;
  
  // Calculate total perimeter including corners and sub-corners
  let totalPerimeter = dimensions.panelCount * calculatePerimeter(panelWidth, dimensions.height);
  const corners = dimensions.corners;
  if (corners?.left?.enabled && corners.left.length > 0) {
    totalPerimeter += calculatePerimeter(corners.left.length, dimensions.height);
    const subL = corners.left.subCorners;
    if (subL?.left?.enabled && subL.left.length > 0) totalPerimeter += calculatePerimeter(subL.left.length, dimensions.height);
    if (subL?.right?.enabled && subL.right.length > 0) totalPerimeter += calculatePerimeter(subL.right.length, dimensions.height);
  }
  if (corners?.right?.enabled && corners.right.length > 0) {
    totalPerimeter += calculatePerimeter(corners.right.length, dimensions.height);
    const subR = corners.right.subCorners;
    if (subR?.left?.enabled && subR.left.length > 0) totalPerimeter += calculatePerimeter(subR.left.length, dimensions.height);
    if (subR?.right?.enabled && subR.right.length > 0) totalPerimeter += calculatePerimeter(subR.right.length, dimensions.height);
  }
  
  // Edge polishing based on config
  if (config.edgePolish.enabled) {
    const polishPrice = config.edgePolish.type === 'matte'
      ? pricing.processing.edge_polish_matte
      : config.edgePolish.type === 'beveled'
        ? pricing.processing.bevel
        : config.edgePolish.type === 'cnc'
          ? pricing.processing.edge_polish_cnc
          : pricing.processing.edge_polish_polished;
    processingTotal += totalPerimeter * polishPrice;
  }
  
  // Drilling holes for mount points
  if (accessories.mountPoints && accessories.mountPoints.quantity > 0) {
    const holeCost = useBalustradePricing ? pricing.balustrade.holeDrilling : pricing.processing.hole;
    processingTotal += accessories.mountPoints.quantity * holeCost;
  }
  
  // Accessories
  let accessoriesTotal = 0;
  
  // Mount points
  if (accessories.mountPoints && accessories.mountPoints.quantity > 0) {
    let mountCost: number;
    const mountMaterialCode = (accessories.mountPoints as any).materialCode as string | undefined;
    if (mountMaterialCode) {
      const catalogPrice = pricing.getAccessoryByCode(mountMaterialCode);
      const processingCost = pricing.getProcessingPriceByCode?.(mountMaterialCode) ?? 0;
      mountCost = catalogPrice + processingCost;
    } else {
      const mountModel = accessories.mountPoints.model;
      mountCost = useBalustradePricing 
        ? (mountModel === 'fixed' ? pricing.balustrade.mountPointFixed : pricing.balustrade.mountPoint)
        : (mountModel === 'fixed' ? pricing.accessories.mount_point_basic : pricing.accessories.mount_point_adjustable);
    }
    const finishMultiplier = mountMaterialCode ? 1 : (useBalustradePricing 
      ? pricing.balustrade.finishMultiplier(accessories.mountPoints.finish)
      : pricing.finishMultiplier(accessories.mountPoints.finish));
    accessoriesTotal += accessories.mountPoints.quantity * mountCost * finishMultiplier;
  }
  
  // Handrail
  if (accessories.handrail) {
    let handrailCost: number;
    const handrailMaterialCode = accessories.handrail.materialCode;
    if (handrailMaterialCode) {
      const catalogPrice = pricing.getAccessoryByCode(handrailMaterialCode);
      const processingCost = pricing.getProcessingPriceByCode?.(handrailMaterialCode) ?? 0;
      handrailCost = catalogPrice + processingCost;
    } else {
      handrailCost = useBalustradePricing
        ? pricing.balustrade.handrail(accessories.handrail.diameter, accessories.handrail.type)
        : (accessories.handrail.diameter === 42 ? pricing.accessories.handrail_42 : pricing.accessories.handrail_50);
    }
    const finishMultiplier = handrailMaterialCode ? 1 : (useBalustradePricing
      ? pricing.balustrade.finishMultiplier(accessories.handrail.finish)
      : pricing.finishMultiplier(accessories.handrail.finish));
    accessoriesTotal += (accessories.handrail.length / 1000) * handrailCost * finishMultiplier;
    
    // Add elbow connectors for stairs (transitions between ramps and landings)
    if (useBalustradePricing && dimensions.stairsConfig) {
      let elbowCount = 0;
      if (dimensions.stairsConfig.hasIntermediateLanding) elbowCount += 2; // Entry and exit from landing
      if (dimensions.stairsConfig.finalLandingLength && dimensions.stairsConfig.finalLandingLength > 0) elbowCount += 1;
      accessoriesTotal += elbowCount * pricing.balustrade.elbowConnector;
      
      // End caps
      accessoriesTotal += 2 * pricing.balustrade.endCap;
    }
  }
  
  // U-Profile
  if (accessories.uProfile) {
    const uProfileCost = useBalustradePricing
      ? pricing.balustrade.uProfile(accessories.uProfile.size)
      : pricing.accessories.profile_u;
    accessoriesTotal += (totalLength / 1000) * uProfileCost;
  }
  
  // Labor - different rates for different placement types
  let laborTotal: number;
  if (placement === 'stairs') {
    laborTotal = (totalLength / 1000) * pricing.balustrade.laborStairs;
  } else if (placement === 'exterior') {
    laborTotal = (totalLength / 1000) * pricing.balustrade.laborExterior;
  } else if (placement === 'interior') {
    laborTotal = (totalLength / 1000) * pricing.balustrade.laborSimple;
  } else {
    laborTotal = pricing.labor.base + (totalGlassArea * pricing.labor.per_sqm) + pricing.labor.assembly_complex;
  }
  
  // Extra accessories (from catalog)
  if (config.extraAccessories && config.extraAccessories.length > 0) {
    config.extraAccessories.forEach(extra => {
      let extraPrice = extra.unitPrice ?? 0;
      if (extraPrice <= 0 && extra.materialCode) {
        extraPrice = pricing.getAccessoryByCode(extra.materialCode);
      }
      accessoriesTotal += extraPrice * (extra.quantity || 1);
    });
  }
  
  // Corner connector
  const cornerConnector = dimensions.cornerConnector;
  if (cornerConnector && cornerConnector.quantity > 0) {
    let connectorCost = 0;
    if (cornerConnector.materialCode) {
      connectorCost = pricing.getAccessoryByCode(cornerConnector.materialCode);
      const processingCost = pricing.getProcessingPriceByCode?.(cornerConnector.materialCode) ?? 0;
      connectorCost += processingCost;
    }
    accessoriesTotal += connectorCost * cornerConnector.quantity;
  }
  
  return {
    glass: Math.round(glassTotal),
    processing: Math.round(processingTotal),
    accessories: Math.round(accessoriesTotal),
    labor: Math.round(laborTotal),
    total: Math.round(glassTotal + processingTotal + accessoriesTotal + laborTotal),
  };
}

// Calculate door price
export function calculateDoorPrice(config: DoorConfig, pricing: PricingData = DEFAULT_PRICING): PriceBreakdown {
  const { dimensions, glass, accessories, doorType } = config;
  
  // Aggregate glass deductions from all selected accessories
  const allCodes = collectMaterialCodesFromConfig(config);
  const { widthDeduction, heightDeduction } = aggregateGlassDeductions(allCodes, pricing);
  
  const glassArea = calculateGlassArea(dimensions.width - widthDeduction, dimensions.height - heightDeduction);
  
  const glassType = glass.type === 'frosted_cutout' ? 'frosted' : glass.type;
  const glassBasePrice = pricing.glassPrice(glass.thickness, glassType as GlassType);
  let glassTotal = glassArea * glassBasePrice;
  
  glassTotal += glassArea * pricing.tempering * glass.thickness;
  
  let processingTotal = 0;
  const perimeter = calculatePerimeter(dimensions.width, dimensions.height);
  
  // Edge polishing based on config
  if (config.edgePolish.enabled) {
    const polishPrice = config.edgePolish.type === 'matte'
      ? pricing.processing.edge_polish_matte
      : config.edgePolish.type === 'beveled'
        ? pricing.processing.bevel
        : config.edgePolish.type === 'cnc'
          ? pricing.processing.edge_polish_cnc
          : pricing.processing.edge_polish_polished;
    processingTotal += perimeter * polishPrice;
  }
  
  if (glass.type === 'frosted_cutout') {
    processingTotal += glassArea * 0.7 * pricing.processing.sandblasting_partial;
  }
  
  let accessoriesTotal = 0;
  
  if (doorType === 'hinged' && accessories.hinges) {
    accessoriesTotal += accessories.hinges.quantity * pricing.accessories.hinge_wall_glass *
      pricing.finishMultiplier(accessories.hinges.finish);
  }
  
  if (doorType === 'pivot' && accessories.pivot) {
    accessoriesTotal += accessories.pivot.withDamper 
      ? pricing.accessories.pivot_with_damper 
      : pricing.accessories.pivot_basic;
  }
  
  if (doorType === 'sliding' && accessories.slidingSystem) {
    const width = dimensions.openingWidth || dimensions.width * 2;
    accessoriesTotal += (width / 1000) * pricing.accessories.sliding_rail;
    accessoriesTotal += pricing.accessories.sliding_rollers;
    if (accessories.slidingSystem.damper) {
      accessoriesTotal += pricing.accessories.sliding_damper;
    }
  }
  
  let handlePrice = pricing.accessories.handle_bar_200;
  if (accessories.handle.length >= 400) handlePrice = pricing.accessories.handle_bar_400;
  if (accessories.handle.length >= 600) handlePrice = pricing.accessories.handle_bar_600;
  accessoriesTotal += handlePrice * pricing.finishMultiplier(accessories.handle.finish);
  
  if (accessories.lock.enabled) {
    // Use lock_key price as base for all lock types
    accessoriesTotal += pricing.accessories.lock_key;
  }
  
  if (accessories.seals.lateral) {
    accessoriesTotal += (dimensions.height * 2 / 1000) * pricing.accessories.seal_rubber;
  }
  if (accessories.seals.threshold) {
    accessoriesTotal += (dimensions.width / 1000) * pricing.accessories.seal_threshold;
  }
  
  // Extra accessories (from catalog)
  if (config.extraAccessories && config.extraAccessories.length > 0) {
    config.extraAccessories.forEach(extra => {
      let extraPrice = extra.unitPrice ?? 0;
      if (extraPrice <= 0 && extra.materialCode) {
        extraPrice = pricing.getAccessoryByCode(extra.materialCode);
      }
      accessoriesTotal += extraPrice * (extra.quantity || 1);
      if (extra.materialCode) {
        processingTotal += pricing.getProcessingPriceByCode(extra.materialCode) * (extra.quantity || 1);
      }
    });
  }
  
  // Edge cutouts pricing
  if (config.cutouts && config.cutouts.length > 0) {
    config.cutouts.forEach(cutout => {
      processingTotal += (cutout.depth > 50 || cutout.length > 50)
        ? pricing.processing.cutout_large
        : pricing.processing.cutout_small;
    });
  }

  const laborTotal = pricing.labor.base + 
                     (glassArea * pricing.labor.per_sqm) + 
                     pricing.labor.assembly_simple;
  
  return {
    glass: Math.round(glassTotal),
    processing: Math.round(processingTotal),
    accessories: Math.round(accessoriesTotal),
    labor: Math.round(laborTotal),
    total: Math.round(glassTotal + processingTotal + accessoriesTotal + laborTotal),
  };
}

// Calculate panel price
export function calculatePanelPrice(config: PanelConfig, pricing: PricingData = DEFAULT_PRICING): PriceBreakdown {
  const { dimensions, glass, processing, edgePolish } = config;
  
  // Aggregate glass deductions from all selected accessories
  const allCodes = collectMaterialCodesFromConfig(config);
  const { widthDeduction, heightDeduction } = aggregateGlassDeductions(allCodes, pricing);
  
  let glassArea = calculateGlassArea(dimensions.width - widthDeduction, dimensions.height - heightDeduction) * dimensions.quantity;
  const perimeter = calculatePerimeter(dimensions.width - widthDeduction, dimensions.height - heightDeduction);
  
  // Add side panels area — iterate cells for grid-based side panels
  (['left', 'right'] as const).forEach(side => {
    const sp = config.partitionWall?.sidePanels?.[side];
    if (!sp?.enabled) return;
    const spCells = sp.cells;
    if (spCells && spCells.length > 0) {
      const spPW = sp.profileWidth ?? config.partitionWall!.profileWidth ?? 12;
      const spProfileInset = spPW === 25 ? 5 : spPW;
      spCells.forEach(cell => {
        if (cell.type !== 'panel') return;
        const cw = cell.width - (spProfileInset * 2);
        const ch = cell.height - (spProfileInset * 2);
        if (cw > 0 && ch > 0) glassArea += calculateGlassArea(cw, ch) * dimensions.quantity;
      });
    } else {
      // Fallback: single slab
      const spH = (sp.height ?? config.partitionWall!.totalHeight) - heightDeduction;
      glassArea += calculateGlassArea(sp.width, spH) * dimensions.quantity;
    }
  });
  
  const glassBasePrice = pricing.glassPrice(glass.thickness, glass.type);
  let glassTotal = glassArea * glassBasePrice;
  
  if (glass.tempered) {
    glassTotal += glassArea * pricing.tempering * glass.thickness;
  }
  if (glass.laminated) {
    glassTotal += glassArea * pricing.laminating;
  }
  
  let processingTotal = 0;
  
  processingTotal += processing.holes.length * pricing.processing.hole * dimensions.quantity;
  
  processing.cutouts.forEach(cutout => {
    const cutoutArea = (cutout.width * cutout.height) / 1000000;
    processingTotal += (cutoutArea > 0.1 ? pricing.processing.cutout_large : pricing.processing.cutout_small) * dimensions.quantity;
  });
  
  if (edgePolish.enabled) {
    const polishPrice = edgePolish.type === 'matte' 
      ? pricing.processing.edge_polish_matte 
      : edgePolish.type === 'beveled' 
        ? pricing.processing.bevel 
        : edgePolish.type === 'cnc'
          ? pricing.processing.edge_polish_cnc
          : pricing.processing.edge_polish_polished;
    
    // Calculate perimeter from individual pieces if partition wall exists
    if (config.partitionWall) {
      const pw = config.partitionWall;
      const profileWidth = pw.profileWidth ?? 12;
      const profileInset = profileWidth === 25 ? 5 : profileWidth;
      let totalPolishMeters = 0;

      // Panel cells
      pw.cells.forEach(cell => {
        if (cell.type === 'door' || cell.type === 'door_opening') return;
        const w = cell.width - (profileInset * 2);
        const h = cell.height - (profileInset * 2);
        if (w > 0 && h > 0) {
          totalPolishMeters += calculatePerimeter(w, h);
        }
      });

      // Door glass pieces
      pw.doors.forEach(door => {
        const doorCell = pw.cells.find(c => c.id === door.cellId);
        if (!doorCell) return;
        const glassW = doorCell.width - 11;
        const glassH = doorCell.height - 18;
        if (glassW > 0 && glassH > 0) {
          totalPolishMeters += calculatePerimeter(glassW, glassH);
        }
      });

      // Side panel cells edge polish
      (['left', 'right'] as const).forEach(side => {
        const sp = pw.sidePanels?.[side];
        if (!sp?.enabled) return;
        const spCells = sp.cells;
        const spPW = sp.profileWidth ?? pw.profileWidth ?? 12;
        const spInset = spPW === 25 ? 5 : spPW;
        if (spCells && spCells.length > 0) {
          spCells.forEach(cell => {
            if (cell.type !== 'panel') return;
            const cw = cell.width - (spInset * 2);
            const ch = cell.height - (spInset * 2);
            if (cw > 0 && ch > 0) {
              totalPolishMeters += calculatePerimeter(cw, ch);
            }
          });
        } else {
          const spW = sp.width;
          const spH = (sp.height ?? pw.totalHeight) - heightDeduction;
          if (spW > 0 && spH > 0) {
            totalPolishMeters += calculatePerimeter(spW, spH);
          }
        }
      });

      processingTotal += totalPolishMeters * polishPrice * dimensions.quantity;
    } else {
      processingTotal += perimeter * polishPrice * dimensions.quantity;
    }
  }
  
  if (processing.bevel.enabled) {
    processingTotal += perimeter * pricing.processing.bevel * dimensions.quantity;
  }
  
  if (processing.sandblasting === 'full') {
    processingTotal += glassArea * pricing.processing.sandblasting_full;
  } else if (processing.sandblasting === 'partial') {
    processingTotal += glassArea * pricing.processing.sandblasting_partial;
  }
  
  // PT and US accessories from partition wall doors
  let accessoriesTotal = 0;
  if (config.partitionWall?.doors) {
    config.partitionWall.doors.forEach(door => {
      // Hinge pricing by type
      if (door.accessories.hinges && door.accessories.hinges.quantity > 0) {
        const hingeCode = `hinge_${door.accessories.hinges.type ?? 'normal'}`;
        const hingePrice = pricing.getAccessoryByCode(hingeCode);
        accessoriesTotal += hingePrice * door.accessories.hinges.quantity;
      }
      if (door.accessories.pt && door.accessories.pt.quantity > 0) {
        const ptPrice = pricing.getAccessoryByCode(`pt_${door.accessories.pt.size}`);
        accessoriesTotal += ptPrice * door.accessories.pt.quantity;
      }
      if (door.accessories.ptBottom && door.accessories.ptBottom.quantity > 0) {
        const ptBottomPrice = pricing.getAccessoryByCode(`pt_${door.accessories.ptBottom.size}`);
        accessoriesTotal += ptBottomPrice * door.accessories.ptBottom.quantity;
      }
      if (door.accessories.ptTop && door.accessories.ptTop.quantity > 0) {
        const ptTopPrice = pricing.getAccessoryByCode(`pt_${door.accessories.ptTop.size}`);
        accessoriesTotal += ptTopPrice * door.accessories.ptTop.quantity;
      }
      if (door.accessories.bts && door.accessories.bts.quantity > 0) {
        const btsPrice = pricing.getAccessoryByCode(`bts_${door.accessories.bts.size}`);
        accessoriesTotal += btsPrice * door.accessories.bts.quantity;
      }
      if (door.accessories.pt40 && door.accessories.pt40.quantity > 0) {
        const pt40Price = pricing.getAccessoryByCode(`pt_${door.accessories.pt40.size}`);
        accessoriesTotal += pt40Price * door.accessories.pt40.quantity;
      }
      if (door.accessories.us && door.accessories.us.quantity > 0) {
        const usPrice = pricing.getAccessoryByCode(`us_${door.accessories.us.size}`);
        accessoriesTotal += usPrice * door.accessories.us.quantity;
      }
      if (door.accessories.blockers && door.accessories.blockers.quantity > 0) {
        const blockerPrice = pricing.getAccessoryByCode('blocker');
        accessoriesTotal += blockerPrice * door.accessories.blockers.quantity;
      }
      // Aluminum frame for hinged doors
      if (door.hasFrame && door.doorType === 'hinged' && (door.frameQuantity ?? 0) > 0) {
        const framePrice = pricing.getAccessoryByCode('partition_door_frame_aluminum');
        accessoriesTotal += framePrice * (door.frameQuantity ?? 1);
      }
      // Sliding rail pricing (per kit, based on length)
      if (door.doorType === 'sliding' && (door.slidingRailLength ?? 0) > 0) {
        const railPrice = pricing.getAccessoryByCode('partition_sliding_rail');
        accessoriesTotal += railPrice;
      }
    });
  }
  
  // Profile selections from catalog (perimeter profiles)
  if (config.partitionWall?.profileSelections && config.partitionWall.profileSelections.length > 0) {
    // Calculate total perimeter length based on active sides
    const pw = config.partitionWall;
    const sides = pw.profileSides ?? { top: true, bottom: true, left: true, right: true };
    let profileLength = 0;
    if (sides.top) profileLength += pw.totalWidth;
    if (sides.bottom) profileLength += pw.totalWidth;
    if (sides.left) profileLength += pw.totalHeight;
    if (sides.right) profileLength += pw.totalHeight;
    const profileMeters = profileLength / 1000;

    config.partitionWall.profileSelections.forEach(sel => {
      let unitPrice = sel.unitPrice ?? 0;
      if (unitPrice <= 0 && sel.materialCode) {
        unitPrice = pricing.getAccessoryByCode(sel.materialCode);
      }
      accessoriesTotal += unitPrice * profileMeters;
      if (sel.materialCode) {
        accessoriesTotal += pricing.getProcessingPriceByCode(sel.materialCode) * profileMeters;
      }
    });
  }

  // Extra accessories (from catalog)
  if (config.extraAccessories && config.extraAccessories.length > 0) {
    config.extraAccessories.forEach(extra => {
      let extraPrice = extra.unitPrice ?? 0;
      if (extraPrice <= 0 && extra.materialCode) {
        extraPrice = pricing.getAccessoryByCode(extra.materialCode);
      }
      accessoriesTotal += extraPrice * (extra.quantity || 1);
    });
  }
  
  const laborTotal = pricing.labor.base + (glassArea * pricing.labor.per_sqm);
  
  return {
    glass: Math.round(glassTotal),
    processing: Math.round(processingTotal),
    accessories: Math.round(accessoriesTotal),
    labor: Math.round(laborTotal),
    total: Math.round(glassTotal + processingTotal + accessoriesTotal + laborTotal),
  };
}

// Calculate mirror price
export function calculateMirrorPrice(config: MirrorConfig, pricing: PricingData = DEFAULT_PRICING): PriceBreakdown {
  const { dimensions, processing, led, shape } = config;
  
  // Aggregate glass deductions from all selected accessories
  const allCodes = collectMaterialCodesFromConfig(config);
  const { widthDeduction: wDed, heightDeduction: hDed } = aggregateGlassDeductions(allCodes, pricing);
  
  let glassArea: number;
  if (shape === 'circle') {
    const radius = ((dimensions.diameter || dimensions.width) - wDed) / 2;
    glassArea = (Math.PI * radius * radius) / 1000000 * dimensions.quantity;
  } else if (shape === 'oval') {
    glassArea = (Math.PI * (dimensions.width - wDed) * (dimensions.height - hDed) / 4) / 1000000 * dimensions.quantity;
  } else {
    glassArea = calculateGlassArea(dimensions.width - wDed, dimensions.height - hDed) * dimensions.quantity;
  }
  
  let glassTotal = glassArea * pricing.mirrorPrice(config.mirrorType);
  
  let processingTotal = 0;
  
  if (processing.bevel.enabled) {
    let perimeter: number;
    if (shape === 'circle') {
      perimeter = Math.PI * (dimensions.diameter || dimensions.width) / 1000;
    } else if (shape === 'oval') {
      perimeter = Math.PI * (3 * (dimensions.width + dimensions.height) / 2 - 
        Math.sqrt(dimensions.width * dimensions.height)) / 1000;
    } else {
      perimeter = calculatePerimeter(dimensions.width, dimensions.height);
    }
    processingTotal += perimeter * pricing.processing.bevel * dimensions.quantity;
  }
  
  if (config.edgePolish.enabled) {
    let perimeter: number;
    if (shape === 'circle') {
      perimeter = Math.PI * (dimensions.diameter || dimensions.width) / 1000;
    } else {
      perimeter = calculatePerimeter(dimensions.width, dimensions.height);
    }
    const polishPrice = config.edgePolish.type === 'matte' 
      ? pricing.processing.edge_polish_matte 
      : config.edgePolish.type === 'beveled'
        ? pricing.processing.bevel
        : config.edgePolish.type === 'cnc'
          ? pricing.processing.edge_polish_cnc
          : pricing.processing.edge_polish_polished;
    processingTotal += perimeter * polishPrice * dimensions.quantity;
  }
  
  if (processing.sandblasting.enabled) {
    processingTotal += glassArea * pricing.processing.sandblasting_partial;
  }
  
  processingTotal += processing.holes.length * pricing.processing.hole * dimensions.quantity;
  
  // Cutouts
  if (processing.cutoutCount > 0) {
    const cutoutPrice = pricing.getAccessoryByCode('mirror_cutout') || 35;
    processingTotal += processing.cutoutCount * cutoutPrice * dimensions.quantity;
  }
  
  let accessoriesTotal = 0;
  
  if (led.type === 'perimeter') {
    let perimeter: number;
    if (shape === 'circle') {
      perimeter = Math.PI * (dimensions.diameter || dimensions.width) / 1000;
    } else {
      perimeter = calculatePerimeter(dimensions.width, dimensions.height);
    }
    accessoriesTotal += perimeter * pricing.accessories.led_perimeter * dimensions.quantity;
  } else if (led.type === 'integrated') {
    accessoriesTotal += glassArea * pricing.accessories.led_integrated;
  }
  
  if (led.type === 'with_defogging') {
    accessoriesTotal += pricing.accessories.led_defogging * dimensions.quantity;
    let perimeter: number;
    if (shape === 'circle') {
      perimeter = Math.PI * (dimensions.diameter || dimensions.width) / 1000;
    } else {
      perimeter = calculatePerimeter(dimensions.width, dimensions.height);
    }
    accessoriesTotal += perimeter * pricing.accessories.led_perimeter * dimensions.quantity;
  }
  
  // Extra accessories (from catalog)
  if (config.extraAccessories && config.extraAccessories.length > 0) {
    config.extraAccessories.forEach(extra => {
      let extraPrice = extra.unitPrice ?? 0;
      if (extraPrice <= 0 && extra.materialCode) {
        extraPrice = pricing.getAccessoryByCode(extra.materialCode);
      }
      accessoriesTotal += extraPrice * (extra.quantity || 1);
    });
  }
  
  const laborTotal = pricing.labor.base + (glassArea * pricing.labor.per_sqm);
  
  // Apply custom shape surcharge (percentage)
  const subtotal = glassTotal + processingTotal + accessoriesTotal + laborTotal;
  let customSurcharge = 0;
  if (shape === 'custom') {
    const surchargePercent = pricing.getAccessoryByCode('mirror_custom_surcharge') || 15;
    customSurcharge = subtotal * (surchargePercent / 100);
  }
  
  return {
    glass: Math.round(glassTotal),
    processing: Math.round(processingTotal + customSurcharge),
    accessories: Math.round(accessoriesTotal),
    labor: Math.round(laborTotal),
    total: Math.round(subtotal + customSurcharge),
  };
}

// Calculate kitchen front price
export function calculateKitchenFrontPrice(config: KitchenFrontConfig, pricing: PricingData = DEFAULT_PRICING): PriceBreakdown {
  const { dimensions, frontType, processing } = config;
  
  // Aggregate glass deductions from all selected accessories
  const allCodes = collectMaterialCodesFromConfig(config);
  const { widthDeduction: wDed, heightDeduction: hDed } = aggregateGlassDeductions(allCodes, pricing);
  
  const glassArea = calculateGlassArea(dimensions.width - wDed, dimensions.height - hDed) * dimensions.quantity;
  
  const glassBasePrice = pricing.glassPrice(6, 'clear');
  let glassTotal = glassArea * glassBasePrice;
  
  glassTotal += glassArea * pricing.tempering * 6; // Kitchen fronts always use 6mm glass
  
  let processingTotal = 0;
  
  processingTotal += glassArea * pricing.kitchenFrontTypeCost(frontType);
  
  processingTotal += processing.holes.length * pricing.processing.hole * dimensions.quantity;
  
  processing.cutouts.forEach(cutout => {
    const cutoutArea = (cutout.width * cutout.height) / 1000000;
    processingTotal += (cutoutArea > 0.05 ? pricing.processing.cutout_large : pricing.processing.cutout_small) * dimensions.quantity;
  });
  
  if (config.edgePolish.enabled) {
    const perimeter = calculatePerimeter(dimensions.width, dimensions.height);
    const polishPrice = config.edgePolish.type === 'matte' 
      ? pricing.processing.edge_polish_matte 
      : config.edgePolish.type === 'beveled'
        ? pricing.processing.bevel
        : config.edgePolish.type === 'cnc'
          ? pricing.processing.edge_polish_cnc
          : pricing.processing.edge_polish_polished;
    processingTotal += perimeter * polishPrice * dimensions.quantity;
  }
  
  const laborTotal = pricing.labor.base + (glassArea * pricing.labor.per_sqm);
  
  // Extra accessories (from catalog)
  let accessoriesTotal = 0;
  if (config.extraAccessories && config.extraAccessories.length > 0) {
    config.extraAccessories.forEach(extra => {
      let extraPrice = extra.unitPrice ?? 0;
      if (extraPrice <= 0 && extra.materialCode) {
        extraPrice = pricing.getAccessoryByCode(extra.materialCode);
      }
      accessoriesTotal += extraPrice * (extra.quantity || 1);
    });
  }
  
  return {
    glass: Math.round(glassTotal),
    processing: Math.round(processingTotal),
    accessories: Math.round(accessoriesTotal),
    labor: Math.round(laborTotal),
    total: Math.round(glassTotal + processingTotal + accessoriesTotal + laborTotal),
  };
}
