import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { SelectedKit } from '@/components/calculators/shared/KitSelector';
import type { 
  ShowerConfig, 
  ShowerCabinType, 
  ShowerDoorType,
  FinishType,
  PriceBreakdown,
  CalculatorStep,
  DoorPosition,
  DoorOpenDirection,
  OpeningSide,
  HingeSide,
  AccessorySelection,
  LateralConfig
} from '@/types/calculators';
import { calculateShowerPrice, collectMaterialCodesFromConfig, aggregateGlassDeductions } from '@/lib/calculators/pricing';
import { usePricingData, calculateProcessingTypeCost } from '@/hooks/useDynamicPricing';
import { calculateDefaultHingePositions, calculateDefaultHandlePosition } from '@/lib/calculators/accessoryPositions';

const DEFAULT_LATERAL_CONFIG: LateralConfig = {
  enabled: false,
  doorType: 'hinged',
  fixedPanel: {
    left: { enabled: false, width: 300 },
    right: { enabled: false, width: 300 },
  },
  door: {
    position: 'left',
    openDirection: 'inward',
    hingeSide: 'left',
    slidingDirection: 'left',
  },
  hinges: {
    type: 'wall_glass',
    quantity: 2,
    finish: 'polished_stainless',
    positions: calculateDefaultHingePositions(2000, 2),
  },
  handle: {
    model: 'bar',
    length: 200,
    finish: 'polished_stainless',
    positionY: calculateDefaultHandlePosition(2000),
  },
  seals: {
    magnetic: true,
    rubber: true,
    threshold: false,
  },
};

const DEFAULT_CONFIG: ShowerConfig = {
  cabinType: 'corner_90',
  doorType: 'hinged',
  dimensions: {
    width: 900,
    height: 2000,
    depth: 900,
    doorWidth: 880,
    lateralDoorWidth: 880,
  },
  glass: {
    thickness: 8,
    type: 'clear',
    isLaminated: false,
    antiCalc: false,
  },
  accessories: {
    openingSide: 'front',
    door: {
      position: 'left',
      openDirection: 'inward',
      hingeSide: 'left',
      slidingDirection: 'left',
    },
    fixedPanel: {
      left: { enabled: false, width: 400 },
      right: { enabled: false, width: 400 },
    },
    hinges: {
      type: 'wall_glass',
      quantity: 2,
      finish: 'polished_stainless',
      positions: calculateDefaultHingePositions(2000, 2),
    },
    handle: {
      model: 'bar',
      length: 200,
      finish: 'polished_stainless',
      positionY: calculateDefaultHandlePosition(2000),
    },
    seals: {
      magnetic: true,
      rubber: true,
      threshold: false,
    },
    stabilizers: [
      {
        type: 'wall_glass',
        length: 500,
        position: 'top',
      },
    ],
    profiles: {
      enabled: true,
      type: 'u_profile',
      finish: 'polished_stainless',
      sides: { left: true, right: true, top: false, bottom: true },
    },
    extraAccessories: [],
  },
  lateralConfig: DEFAULT_LATERAL_CONFIG,
  edgePolish: {
    enabled: false,
    type: 'polished',
  },
  pentagonSides: { left: true, right: true, back: true },
};

import i18next from 'i18next';

function getShowerSteps(): CalculatorStep[] {
  return [
    { id: 1, title: i18next.t('calc.steps.shower.cabinType'), description: i18next.t('calc.steps.shower.cabinTypeDesc'), isCompleted: false, isActive: true },
    { id: 2, title: i18next.t('calc.steps.shower.doorType'), description: i18next.t('calc.steps.shower.doorTypeDesc'), isCompleted: false, isActive: false },
    { id: 3, title: i18next.t('calc.steps.shower.glassType'), description: i18next.t('calc.steps.shower.glassTypeDesc'), isCompleted: false, isActive: false },
    { id: 4, title: i18next.t('calc.steps.shower.dimensions'), description: i18next.t('calc.steps.shower.dimensionsDesc'), isCompleted: false, isActive: false },
    { id: 5, title: i18next.t('calc.steps.shower.accessories'), description: i18next.t('calc.steps.shower.accessoriesDesc'), isCompleted: false, isActive: false },
    { id: 6, title: i18next.t('calc.steps.shower.quote'), description: i18next.t('calc.steps.shower.quoteDesc'), isCompleted: false, isActive: false },
  ];
}

export function useShowerCalculator() {
  const [config, setConfig] = useState<ShowerConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [selectedKit, setSelectedKit] = useState<SelectedKit | null>(null);
  const [slidingOverlap, setSlidingOverlap] = useState(0);
  const slidingOverlapRef = useRef(slidingOverlap);
  useEffect(() => { slidingOverlapRef.current = slidingOverlap; }, [slidingOverlap]);
  
  // Get dynamic pricing from database
  const { pricing, isLoading: isPricingLoading, pricingItems } = usePricingData();

  // Recompute aggregated glass deductions SEPARATELY for frontal and lateral
  useEffect(() => {
    if (!pricing) return;

    // Collect codes separately per side — exclude profiles from frontal (profiles only apply to fixed panels)
    const { profiles: frontalProfiles, ...accessoriesWithoutProfiles } = config.accessories;
    const frontalCodes = collectMaterialCodesFromConfig({ accessories: accessoriesWithoutProfiles });
    const lateralCodes = collectMaterialCodesFromConfig({ lateralConfig: config.lateralConfig });

    // Calculate profile deductions separately (only for fixed panels)
    // Respect which sides the user has toggled on for the perimeter profile
    const pSides = (frontalProfiles as any)?.sides ?? { left: true, right: true, top: false, bottom: true };
    let profileWidthDed = 0;
    let profileHeightDed = 0;
    const profileCodes: string[] = [];
    if (frontalProfiles?.materialCode) profileCodes.push(frontalProfiles.materialCode);
    if (frontalProfiles?.selections) {
      for (const sel of frontalProfiles.selections) {
        if (sel?.materialCode) profileCodes.push(sel.materialCode);
      }
    }
    const deductFull = !!(frontalProfiles as any)?.deductFullProfileHeight;
    for (const code of profileCodes) {
      const d = pricing.getGlassDeductionsByCode(code);
      if (d.side_a && pSides.left)   profileWidthDed  += d.side_a;
      if (d.side_b && pSides.right)  profileWidthDed  += d.side_b;
      if (deductFull) {
        const ph = (d as any).profile_height;
        profileHeightDed += ph ? ph : ((d.top || 0) + (d.bottom || 0));
      } else {
        if (d.top)    profileHeightDed += pSides.top    ? d.top    : 0;
        if (d.bottom) profileHeightDed += pSides.bottom ? d.bottom : 0;
      }
    }
    // Lateral profile deductions: the frontal perimeter profile U wraps the entire cabin,
    // so the same profile deductions apply to the lateral (depth) panel as well.
    // Only if no separate lateral profile exists do we reuse the frontal profile deduction.
    let lateralProfileWidthDed = profileWidthDed;
    let lateralProfileHeightDed = profileHeightDed;

    // Merge kit glass deductions (max per side) — kit applies to frontal only
    const kd = selectedKit?.glass_deductions;
    const kitSideA = kd?.side_a || 0;
    const kitSideB = kd?.side_b || 0;
    const kitTop = kd?.top || 0;
    const kitBottom = kd?.bottom || 0;

    // Frontal per-side deductions
    // Frontal per-side deductions (cumulative — each accessory adds its own deduction)
    let fSA = 0, fSB = 0, fTop = 0, fBot = 0;
    for (const code of frontalCodes) {
      const d = pricing.getGlassDeductionsByCode(code);
      if (d.side_a) fSA += d.side_a;
      if (d.side_b) fSB += d.side_b;
      if (d.top) fTop += d.top;
      if (d.bottom) fBot += d.bottom;
    }
    const frontalW = (fSA + kitSideA) + (fSB + kitSideB);
    const frontalH = (fTop + kitTop) + (fBot + kitBottom);

    // Lateral per-side deductions (cumulative)
    let lSA = 0, lSB = 0, lTop = 0, lBot = 0;
    for (const code of lateralCodes) {
      const d = pricing.getGlassDeductionsByCode(code);
      if (d.side_a) lSA += d.side_a;
      if (d.side_b) lSB += d.side_b;
      if (d.top) lTop += d.top;
      if (d.bottom) lBot += d.bottom;
    }
    const lateralW = lSA + lSB;
    const lateralH = lTop + lBot;

    setConfig(prev => {
      const curFW = prev.accessories.seals.totalWidthDeduction || 0;
      const curFH = prev.accessories.seals.totalHeightDeduction || 0;
      const curLW = prev.lateralConfig.seals.totalWidthDeduction || 0;
      const curLH = prev.lateralConfig.seals.totalHeightDeduction || 0;
      const curProfW = (prev.accessories.seals as any).profileWidthDeduction || 0;
      const curProfH = (prev.accessories.seals as any).profileHeightDeduction || 0;
      const curLatProfW = (prev.lateralConfig.seals as any).profileWidthDeduction || 0;
      const curLatProfH = (prev.lateralConfig.seals as any).profileHeightDeduction || 0;
      if (curFW === frontalW && curFH === frontalH && curLW === lateralW && curLH === lateralH && curProfW === profileWidthDed && curProfH === profileHeightDed && curLatProfW === lateralProfileWidthDed && curLatProfH === lateralProfileHeightDed) return prev;
      return {
        ...prev,
        accessories: {
          ...prev.accessories,
          seals: { ...prev.accessories.seals, totalWidthDeduction: frontalW, totalHeightDeduction: frontalH, profileWidthDeduction: profileWidthDed, profileHeightDeduction: profileHeightDed },
        },
        lateralConfig: {
          ...prev.lateralConfig,
          seals: { ...prev.lateralConfig.seals, totalWidthDeduction: lateralW, totalHeightDeduction: lateralH, profileWidthDeduction: lateralProfileWidthDed, profileHeightDeduction: lateralProfileHeightDed },
        },
      };
    });
  }, [config.accessories, config.lateralConfig, pricing, selectedKit]);

  // Calculate price whenever config or pricing changes
  const price = useMemo<PriceBreakdown>(() => {
    const base = calculateShowerPrice(config, pricing ?? undefined);
    if (selectedKit) {
      const kitProcCost = pricing ? calculateProcessingTypeCost(selectedKit.processing_types, pricing) : 0;
      return { ...base, accessories: base.accessories + selectedKit.price, processing: base.processing + kitProcCost, total: base.total + selectedKit.price + kitProcCost };
    }
    return base;
  }, [config, pricing, selectedKit]);

  // Get steps with current state
  const steps = useMemo(() => {
    return getShowerSteps().map(step => ({
      ...step,
      isCompleted: completedSteps.has(step.id),
      isActive: step.id === currentStep,
    }));
  }, [currentStep, completedSteps]);

  // Navigation
  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= getShowerSteps().length) {
      if (stepId > currentStep) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      } else if (stepId < currentStep) {
        setCompletedSteps(prev => {
          const next = new Set(prev);
          for (let i = stepId; i <= getShowerSteps().length; i++) next.delete(i);
          return next;
        });
      }
      setCurrentStep(stepId);
    }
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < getShowerSteps().length) {
      setCompletedSteps(prev => {
        const next = new Set([...prev, currentStep]);
        // When skipping step 2 for fixed_panel, mark it completed too
        if (currentStep === 1 && config.cabinType === 'fixed_panel') {
          next.add(2);
        }
        return next;
      });
      const next = currentStep + 1;
      setCurrentStep(currentStep === 1 && config.cabinType === 'fixed_panel' ? 3 : next);
    }
  }, [currentStep, config.cabinType]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const prev = currentStep === 3 && config.cabinType === 'fixed_panel' ? 1 : currentStep - 1;
      setCompletedSteps(p => {
        const next = new Set(p);
        for (let i = prev; i <= getShowerSteps().length; i++) next.delete(i);
        return next;
      });
      setCurrentStep(prev);
    }
  }, [currentStep, config.cabinType]);

  // Config updates
  const setCabinType = useCallback((cabinType: ShowerCabinType) => {
    setConfig(prev => {
      const updated = { ...prev, cabinType };
      if (cabinType === 'corner_90') {
        updated.accessories = {
          ...updated.accessories,
          door: { ...updated.accessories.door, hingeSide: 'right' },
        };
        updated.lateralConfig = {
          ...updated.lateralConfig,
          door: { ...updated.lateralConfig.door, hingeSide: 'left' },
        };
      }
      if (cabinType === 'fixed_panel') {
        updated.accessories = {
          ...updated.accessories,
          hinges: { ...updated.accessories.hinges, quantity: 0 },
        };
      }
      return updated;
    });
  }, []);

  const setDoorType = useCallback((doorType: ShowerDoorType) => {
    setConfig(prev => {
      let newAccessories = { ...prev.accessories };
      let newLateral = { ...prev.lateralConfig };
      
      if (doorType === 'pivot') {
        newAccessories.hinges = { ...newAccessories.hinges, quantity: 0 };
      } else if (doorType === 'hinged') {
        newAccessories.hinges = { ...newAccessories.hinges, quantity: 2 };
      } else if (doorType === 'sliding') {
        newAccessories.hinges = { ...newAccessories.hinges, quantity: 0 };
      }

      // When main door is sliding, force lateral to sliding too
      if (doorType === 'sliding') {
        newLateral.doorType = 'sliding';
        newLateral.hinges = { ...newLateral.hinges, quantity: 0 };
      }

      // Recalculate doorWidth because overlap rule changes between sliding/hinged
      const activeWall = prev.accessories.openingSide === 'front' ? prev.dimensions.width : prev.dimensions.depth;
      const leftW = prev.accessories.fixedPanel.left.enabled ? prev.accessories.fixedPanel.left.width : 0;
      const rightW = prev.accessories.fixedPanel.right.enabled ? prev.accessories.fixedPanel.right.width : 0;
      const newDoorWidth = calcDoorWidth(activeWall, leftW, rightW, doorType);
      const lateralDoorWidth = recalcLateralDoorWidth(prev.dimensions.depth, newLateral, newLateral.doorType || doorType);
      
      return { ...prev, doorType, accessories: newAccessories, lateralConfig: newLateral, dimensions: { ...prev.dimensions, doorWidth: newDoorWidth, lateralDoorWidth } };
    });
  }, []);

  // Sliding doors overlap over fixed panels; hinged doors have 20mm gap
  const getEffectiveOverlap = () => {
    const kitOverlap = selectedKit?.width_overlap ?? 0;
    return Math.max(slidingOverlapRef.current, kitOverlap);
  };

  const calcDoorWidth = (wall: number, leftW: number, rightW: number, doorType: string): number => {
    const hasFixedPanel = leftW > 0 || rightW > 0;
    if (doorType === 'sliding' && hasFixedPanel) {
      return Math.max(400, wall - leftW - rightW + getEffectiveOverlap());
    }
    return Math.max(400, wall - leftW - rightW);
  };

  const recalcLateralDoorWidth = (depth: number, lateral: LateralConfig, doorType: string): number => {
    const lL = lateral.fixedPanel.left.enabled ? lateral.fixedPanel.left.width : 0;
    const lR = lateral.fixedPanel.right.enabled ? lateral.fixedPanel.right.width : 0;
    return calcDoorWidth(depth, lL, lR, doorType);
  };

  // Recalculate door widths when slidingOverlap or kit overlap changes
  useEffect(() => {
    setConfig(prev => {
      if (prev.doorType !== 'sliding') return prev;
      const effectiveOverlap = Math.max(slidingOverlap, selectedKit?.width_overlap ?? 0);
      const activeWall = prev.accessories.openingSide === 'front' ? prev.dimensions.width : prev.dimensions.depth;
      const leftW = prev.accessories.fixedPanel.left.enabled ? prev.accessories.fixedPanel.left.width : 0;
      const rightW = prev.accessories.fixedPanel.right.enabled ? prev.accessories.fixedPanel.right.width : 0;
      const hasFixed = leftW > 0 || rightW > 0;
      const newDoorWidth = (hasFixed)
        ? Math.max(400, activeWall - leftW - rightW + effectiveOverlap)
        : Math.max(400, activeWall - leftW - rightW);
      // Lateral
      const lL = prev.lateralConfig.fixedPanel.left.enabled ? prev.lateralConfig.fixedPanel.left.width : 0;
      const lR = prev.lateralConfig.fixedPanel.right.enabled ? prev.lateralConfig.fixedPanel.right.width : 0;
      const latDoorType = prev.lateralConfig.doorType || prev.doorType;
      const latHasFixed = lL > 0 || lR > 0;
      const lateralDoorWidth = (latDoorType === 'sliding' && latHasFixed)
        ? Math.max(400, prev.dimensions.depth - lL - lR + effectiveOverlap)
        : Math.max(400, prev.dimensions.depth - lL - lR);
      if (newDoorWidth === prev.dimensions.doorWidth && lateralDoorWidth === prev.dimensions.lateralDoorWidth) return prev;
      return { ...prev, dimensions: { ...prev.dimensions, doorWidth: newDoorWidth, lateralDoorWidth } };
    });
  }, [slidingOverlap, selectedKit]);

  const setDimensions = useCallback((dimensions: Partial<ShowerConfig['dimensions']>) => {
    setConfig(prev => {
      const newDimensions = { ...prev.dimensions, ...dimensions };
      const newHeight = newDimensions.height;
      // Recalculate frontal door width based on active wall
      const activeWall = prev.accessories.openingSide === 'front' ? newDimensions.width : newDimensions.depth;
      const leftW = prev.accessories.fixedPanel.left.enabled ? prev.accessories.fixedPanel.left.width : 0;
      const rightW = prev.accessories.fixedPanel.right.enabled ? prev.accessories.fixedPanel.right.width : 0;
      newDimensions.doorWidth = calcDoorWidth(activeWall, leftW, rightW, prev.doorType);
      // Recalculează lățimea ușii laterale (only used when lateral is enabled)
      newDimensions.lateralDoorWidth = recalcLateralDoorWidth(newDimensions.depth, prev.lateralConfig, prev.lateralConfig.doorType || prev.doorType);
      
      // Recalculate positions when height changes
      const hingeQty = prev.accessories.hinges.quantity;
      return {
        ...prev,
        dimensions: newDimensions,
        accessories: {
          ...prev.accessories,
          hinges: {
            ...prev.accessories.hinges,
            positions: calculateDefaultHingePositions(newHeight, hingeQty),
          },
          handle: {
            ...prev.accessories.handle,
            positionY: calculateDefaultHandlePosition(newHeight),
          },
        },
        lateralConfig: {
          ...prev.lateralConfig,
          hinges: {
            ...prev.lateralConfig.hinges,
            positions: calculateDefaultHingePositions(newHeight, prev.lateralConfig.hinges.quantity),
          },
          handle: {
            ...prev.lateralConfig.handle,
            positionY: calculateDefaultHandlePosition(newHeight),
          },
        },
      };
    });
  }, []);

  const setGlass = useCallback((glass: Partial<ShowerConfig['glass']>) => {
    setConfig(prev => ({
      ...prev,
      glass: { ...prev.glass, ...glass },
    }));
  }, []);

  const setAccessories = useCallback((accessories: Partial<ShowerConfig['accessories']>) => {
    setConfig(prev => ({
      ...prev,
      accessories: { ...prev.accessories, ...accessories },
    }));
  }, []);

  const setOpeningSide = useCallback((openingSide: OpeningSide) => {
    setConfig(prev => {
      // Recalculate doorWidth based on the active wall
      const activeWall = openingSide === 'front' ? prev.dimensions.width : prev.dimensions.depth;
      const leftW = prev.accessories.fixedPanel.left.enabled ? prev.accessories.fixedPanel.left.width : 0;
      const rightW = prev.accessories.fixedPanel.right.enabled ? prev.accessories.fixedPanel.right.width : 0;
      const newDoorWidth = calcDoorWidth(activeWall, leftW, rightW, prev.doorType);

      // Auto-activate full lateral configuration on Corner 90° when user picks "Lateral".
      // This unifies the legacy lateral-door mode with the rich lateral panel setup so the
      // user can independently toggle "Panou fix stânga / dreapta" on the lateral side.
      const isCorner90 = prev.cabinType === 'corner_90';
      let lateralConfig = prev.lateralConfig;
      let lateralDoorWidth = prev.dimensions.lateralDoorWidth;
      if (isCorner90 && openingSide === 'lateral' && !prev.lateralConfig.enabled) {
        lateralConfig = { ...prev.lateralConfig, enabled: true };
        lateralDoorWidth = recalcLateralDoorWidth(prev.dimensions.depth, lateralConfig, lateralConfig.doorType || prev.doorType);
      }

      return {
        ...prev,
        dimensions: { ...prev.dimensions, doorWidth: newDoorWidth, lateralDoorWidth },
        accessories: { ...prev.accessories, openingSide },
        lateralConfig,
      };
    });
  }, []);

  const setHinges = useCallback((hinges: Partial<ShowerConfig['accessories']['hinges']>) => {
    setConfig(prev => {
      const merged = { ...prev.accessories.hinges, ...hinges };
      // Recalculate positions when quantity changes
      if (hinges.quantity !== undefined && hinges.quantity !== prev.accessories.hinges.quantity) {
        merged.positions = calculateDefaultHingePositions(prev.dimensions.height, hinges.quantity);
      }
      return {
        ...prev,
        accessories: {
          ...prev.accessories,
          hinges: merged,
        },
      };
    });
  }, []);

  const setDoorConfig = useCallback((doorConfig: Partial<ShowerConfig['accessories']['door']>) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        door: { ...prev.accessories.door, ...doorConfig },
      },
    }));
  }, []);

  const setFixedPanelConfig = useCallback((side: 'left' | 'right', updates: Partial<{ enabled: boolean; width: number; height: number }>) => {
    setConfig(prev => {
      const newFixedPanel = {
        ...prev.accessories.fixedPanel,
        [side]: { ...prev.accessories.fixedPanel[side], ...updates },
      };
      // Use active wall based on openingSide
      const activeWall = prev.accessories.openingSide === 'front' ? prev.dimensions.width : prev.dimensions.depth;
      const leftW = newFixedPanel.left.enabled ? newFixedPanel.left.width : 0;
      const rightW = newFixedPanel.right.enabled ? newFixedPanel.right.width : 0;
      const newDoorWidth = calcDoorWidth(activeWall, leftW, rightW, prev.doorType);
      return {
        ...prev,
        dimensions: { ...prev.dimensions, doorWidth: newDoorWidth },
        accessories: {
          ...prev.accessories,
          fixedPanel: newFixedPanel,
        },
      };
    });
  }, []);

  const setHandle = useCallback((handle: Partial<ShowerConfig['accessories']['handle']>) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        handle: { ...prev.accessories.handle, ...handle },
      },
    }));
  }, []);

  const setSeals = useCallback((seals: Partial<ShowerConfig['accessories']['seals']>) => {
    setConfig(prev => {
      const merged = { ...prev.accessories.seals, ...seals };
      // Auto-lookup glass deduction when magnetic seal code changes
      if (seals.magneticMaterialCode !== undefined || seals.magneticSelections !== undefined) {
        const codes: string[] = [];
        if (merged.magneticSelections?.length) {
          merged.magneticSelections.forEach(s => codes.push(s.materialCode));
        } else if (merged.magneticMaterialCode) {
          codes.push(merged.magneticMaterialCode);
        }
        // Use per-side deductions (max value) from all selected magnetic seal products
        let totalDeduction = 0;
        for (const code of codes) {
          const deductions = pricing?.getGlassDeductionsByCode(code) ?? {};
          const vals = Object.values(deductions).filter(v => v > 0);
          const maxDed = vals.length > 0 ? Math.max(...vals) : 0;
          if (maxDed > 0) totalDeduction = Math.max(totalDeduction, maxDed);
        }
        merged.magneticSealDeduction = totalDeduction > 0 ? totalDeduction : undefined;
      }
      return {
        ...prev,
        accessories: {
          ...prev.accessories,
          seals: merged,
        },
      };
    });
  }, [pricing]);

  const addStabilizer = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        stabilizers: [
          ...prev.accessories.stabilizers,
          { type: 'wall_glass', length: 500, position: 'top' },
        ],
      },
    }));
  }, []);

  const removeStabilizer = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        stabilizers: prev.accessories.stabilizers.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateStabilizer = useCallback((
    index: number, 
    updates: Partial<ShowerConfig['accessories']['stabilizers'][0]>
  ) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        stabilizers: prev.accessories.stabilizers.map((stab, i) => 
          i === index ? { ...stab, ...updates } : stab
        ),
      },
    }));
  }, []);

  const setStabilizerShape = useCallback((shape: 'round' | 'rectangular') => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        stabilizerShape: shape,
      },
    }));
  }, []);

  const setProfiles = useCallback((profiles: Partial<ShowerConfig['accessories']['profiles']>) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        profiles: { ...prev.accessories.profiles, ...profiles },
      },
    }));
  }, []);

  const addExtraAccessory = useCallback((item: { materialCode: string; name: string; unitPrice?: number; unit?: string }) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        extraAccessories: [
          ...prev.accessories.extraAccessories,
          { ...item, quantity: 1 },
        ],
      },
    }));
  }, []);

  const removeExtraAccessory = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        extraAccessories: prev.accessories.extraAccessories.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateExtraAccessory = useCallback((index: number, updates: Partial<ShowerConfig['accessories']['extraAccessories'][0]>) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        extraAccessories: prev.accessories.extraAccessories.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        ),
      },
    }));
  }, []);

  const addAccessorySelection = useCallback((
    section: 'hinges' | 'handle' | 'profiles',
    selection: AccessorySelection
  ) => {
    setConfig(prev => {
      const current = prev.accessories[section];
      return {
        ...prev,
        accessories: {
          ...prev.accessories,
          [section]: {
            ...current,
            selections: [...(current.selections || []), selection],
          },
        },
      };
    });
  }, []);

  const removeAccessorySelection = useCallback((
    section: 'hinges' | 'handle' | 'profiles',
    index: number
  ) => {
    setConfig(prev => {
      const current = prev.accessories[section];
      return {
        ...prev,
        accessories: {
          ...prev.accessories,
          [section]: {
            ...current,
            selections: (current.selections || []).filter((_, i) => i !== index),
          },
        },
      };
    });
  }, []);

  const addSealSelection = useCallback((
    sealType: 'magnetic' | 'rubber' | 'threshold',
    selection: AccessorySelection
  ) => {
    const key = `${sealType}Selections` as const;
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        seals: {
          ...prev.accessories.seals,
          [key]: [...(prev.accessories.seals[key] || []), selection],
        },
      },
    }));
  }, []);

  const removeSealSelection = useCallback((
    sealType: 'magnetic' | 'rubber' | 'threshold',
    index: number
  ) => {
    const key = `${sealType}Selections` as const;
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        seals: {
          ...prev.accessories.seals,
          [key]: (prev.accessories.seals[key] || []).filter((_, i) => i !== index),
        },
      },
    }));
  }, []);

  const addStabilizerSelection = useCallback((selection: AccessorySelection & { length?: number }) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        stabilizerSelections: [
          ...(prev.accessories.stabilizerSelections || []),
          { ...selection, length: selection.length },
        ],
      },
    }));
  }, []);

  const removeStabilizerSelection = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        stabilizerSelections: (prev.accessories.stabilizerSelections || []).filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateStabilizerSelectionLength = useCallback((index: number, length: number) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        stabilizerSelections: (prev.accessories.stabilizerSelections || []).map((sel, i) =>
          i === index ? { ...sel, length } : sel
        ),
      },
    }));
  }, []);

  // ── Lateral Config Methods ──
  const setLateralEnabled = useCallback((enabled: boolean) => {
    setConfig(prev => {
      const lateral = { ...prev.lateralConfig, enabled };
      const lateralDoorWidth = recalcLateralDoorWidth(prev.dimensions.depth, lateral, lateral.doorType || prev.doorType);
      return { ...prev, lateralConfig: lateral, dimensions: { ...prev.dimensions, lateralDoorWidth } };
    });
  }, []);

  const setLateralDoorType = useCallback((doorType: ShowerDoorType) => {
    setConfig(prev => {
      let lateral = { ...prev.lateralConfig, doorType };
      if (doorType === 'hinged') {
        lateral.hinges = { ...lateral.hinges, quantity: 2 };
      } else if (doorType === 'pivot') {
        lateral.hinges = { ...lateral.hinges, quantity: 0 };
      }
      return { ...prev, lateralConfig: lateral };
    });
  }, []);

  const setLateralFixedPanel = useCallback((side: 'left' | 'right', updates: Partial<{ enabled: boolean; width: number; height: number }>) => {
    setConfig(prev => {
      const newFP = { ...prev.lateralConfig.fixedPanel, [side]: { ...prev.lateralConfig.fixedPanel[side], ...updates } };
      const lateral = { ...prev.lateralConfig, fixedPanel: newFP };
      const lateralDoorWidth = recalcLateralDoorWidth(prev.dimensions.depth, lateral, lateral.doorType || prev.doorType);
      return { ...prev, lateralConfig: lateral, dimensions: { ...prev.dimensions, lateralDoorWidth } };
    });
  }, []);

  const setLateralDoorConfig = useCallback((doorConfig: Partial<LateralConfig['door']>) => {
    setConfig(prev => ({
      ...prev,
      lateralConfig: { ...prev.lateralConfig, door: { ...prev.lateralConfig.door, ...doorConfig } },
    }));
  }, []);

  const setLateralHinges = useCallback((hinges: Partial<LateralConfig['hinges']>) => {
    setConfig(prev => {
      const merged = { ...prev.lateralConfig.hinges, ...hinges };
      if (hinges.quantity !== undefined && hinges.quantity !== prev.lateralConfig.hinges.quantity) {
        merged.positions = calculateDefaultHingePositions(prev.dimensions.height, hinges.quantity);
      }
      return { ...prev, lateralConfig: { ...prev.lateralConfig, hinges: merged } };
    });
  }, []);

  const setLateralHandle = useCallback((handle: Partial<LateralConfig['handle']>) => {
    setConfig(prev => ({
      ...prev,
      lateralConfig: { ...prev.lateralConfig, handle: { ...prev.lateralConfig.handle, ...handle } },
    }));
  }, []);

  const setLateralSeals = useCallback((seals: Partial<LateralConfig['seals']>) => {
    setConfig(prev => ({
      ...prev,
      lateralConfig: { ...prev.lateralConfig, seals: { ...prev.lateralConfig.seals, ...seals } },
    }));
  }, []);

  const addLateralHingeSelection = useCallback((selection: AccessorySelection) => {
    setConfig(prev => ({
      ...prev,
      lateralConfig: {
        ...prev.lateralConfig,
        hinges: { ...prev.lateralConfig.hinges, selections: [...(prev.lateralConfig.hinges.selections || []), selection] },
      },
    }));
  }, []);

  const removeLateralHingeSelection = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      lateralConfig: {
        ...prev.lateralConfig,
        hinges: { ...prev.lateralConfig.hinges, selections: (prev.lateralConfig.hinges.selections || []).filter((_, i) => i !== index) },
      },
    }));
  }, []);

  const addLateralHandleSelection = useCallback((selection: AccessorySelection) => {
    setConfig(prev => ({
      ...prev,
      lateralConfig: {
        ...prev.lateralConfig,
        handle: { ...prev.lateralConfig.handle, selections: [...(prev.lateralConfig.handle.selections || []), selection] },
      },
    }));
  }, []);

  const removeLateralHandleSelection = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      lateralConfig: {
        ...prev.lateralConfig,
        handle: { ...prev.lateralConfig.handle, selections: (prev.lateralConfig.handle.selections || []).filter((_, i) => i !== index) },
      },
    }));
  }, []);

  const addLateralSealSelection = useCallback((sealType: 'magnetic' | 'rubber' | 'threshold', selection: AccessorySelection) => {
    const key = `${sealType}Selections` as const;
    setConfig(prev => ({
      ...prev,
      lateralConfig: {
        ...prev.lateralConfig,
        seals: { ...prev.lateralConfig.seals, [key]: [...(prev.lateralConfig.seals[key] || []), selection] },
      },
    }));
  }, []);

  const removeLateralSealSelection = useCallback((sealType: 'magnetic' | 'rubber' | 'threshold', index: number) => {
    const key = `${sealType}Selections` as const;
    setConfig(prev => ({
      ...prev,
      lateralConfig: {
        ...prev.lateralConfig,
        seals: { ...prev.lateralConfig.seals, [key]: (prev.lateralConfig.seals[key] || []).filter((_, i) => i !== index) },
      },
    }));
  }, []);

  const setSlidingMechanismCode = useCallback((code: string | undefined) => {
    setConfig(prev => ({ ...prev, slidingMechanismCode: code }));
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setCurrentStep(1);
    setCompletedSteps(new Set());
  }, []);

  const isStepValid = useCallback((stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return !!config.cabinType;
      case 2:
        return !!config.doorType;
      case 3:
        return !!config.glass.thickness && !!config.glass.type;
      case 4: {
        const { width, height, depth, doorWidth, lateralDoorWidth } = config.dimensions;
        // Fixed panel: no door, validate only width & height
        if (config.cabinType === 'fixed_panel') {
          return width >= 500 && height >= 1500;
        }
        if (width < 500 || height < 1500 || depth < 500) return false;
        // Door is on the active wall depending on opening side
        const activeWall = config.accessories.openingSide === 'lateral' ? depth : width;
        const overlap = selectedKit?.width_overlap ?? 0;
        if (doorWidth < 400 || doorWidth > activeWall + overlap) return false;
        // If lateral side enabled (corner_90 with both doors), validate it too
        if (config.lateralConfig?.enabled) {
          if (lateralDoorWidth == null || lateralDoorWidth < 400 || lateralDoorWidth > depth + overlap) {
            return false;
          }
        }
        return true;
      }
      case 5:
        return true;
      default:
        return false;
    }
  }, [config, selectedKit]);

  const canGoNext = useMemo(() => isStepValid(currentStep), [isStepValid, currentStep]);

  const removeSelectedKit = useCallback(() => setSelectedKit(null), []);

  return {
    config,
    currentStep,
    steps,
    price,
    canGoNext,
    isPricingLoading,
    pricingItems,
    selectedKit,
    setSelectedKit,
    removeSelectedKit,
    slidingOverlap,
    setSlidingOverlap,

    goToStep,
    nextStep,
    prevStep,

    setCabinType,
    setDoorType,
    setDimensions,
    setGlass,
    setAccessories,
    setOpeningSide,
    setHinges,
    setDoorConfig,
    setFixedPanelConfig,
    setHandle,
    setSeals,
    addStabilizer,
    removeStabilizer,
    updateStabilizer,
    setStabilizerShape,
    setProfiles,
    addExtraAccessory,
    removeExtraAccessory,
    updateExtraAccessory,
    addAccessorySelection,
    removeAccessorySelection,
    addSealSelection,
    removeSealSelection,
    addStabilizerSelection,
    removeStabilizerSelection,
    updateStabilizerSelectionLength,

    // Lateral config
    setLateralEnabled,
    setLateralDoorType,
    setLateralFixedPanel,
    setLateralDoorConfig,
    setLateralHinges,
    setLateralHandle,
    setLateralSeals,
    addLateralHingeSelection,
    removeLateralHingeSelection,
    addLateralHandleSelection,
    removeLateralHandleSelection,
    addLateralSealSelection,
    removeLateralSealSelection,
    setSlidingMechanismCode,
    setEdgePolish: useCallback((updates: Partial<ShowerConfig['edgePolish']>) => {
      setConfig(prev => ({
        ...prev,
        edgePolish: { ...prev.edgePolish, ...updates },
      }));
    }, []),

    setPentagonSides: useCallback((sides: { left: boolean; right: boolean; back: boolean }) => {
      setConfig(prev => ({ ...prev, pentagonSides: sides }));
    }, []),

    reset,
    isStepValid,
    loadConfig: useCallback((saved: any) => {
      if (saved) {
        setConfig(saved as ShowerConfig);
        if (saved.selectedKit) setSelectedKit(saved.selectedKit);
        setCurrentStep(getShowerSteps().length);
        setCompletedSteps(new Set(getShowerSteps().map(s => s.id)));
      }
    }, []),
  };
}
