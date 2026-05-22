import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SelectedKit } from '@/components/calculators/shared/KitSelector';
import type { 
  DoorConfig, 
  DoorType, 
  FrameType,
  FinishType,
  EdgePolishConfig,
  EdgeCutout,
  PriceBreakdown,
  CalculatorStep 
} from '@/types/calculators';
import { calculateDoorPrice, collectMaterialCodesFromConfig, aggregateGlassDeductions } from '@/lib/calculators/pricing';
import { usePricingData, calculateProcessingTypeCost } from '@/hooks/useDynamicPricing';
import { calculateDefaultHingePositions, calculateDefaultHandlePosition } from '@/lib/calculators/accessoryPositions';

const DEFAULT_CONFIG: DoorConfig = {
  doorType: 'hinged',
  frameType: 'none',
  dimensions: {
    width: 900,
    height: 2100,
  },
  glass: {
    thickness: 10,
    type: 'clear',
  },
  accessories: {
    hinges: { type: 'wall_glass', quantity: 3, finish: 'polished_stainless', positions: calculateDefaultHingePositions(2100, 3) },
    handle: { model: 'bar', length: 400, finish: 'polished_stainless', positionY: calculateDefaultHandlePosition(2100) },
    lock: { enabled: false, type: 'central_strike' },
    seals: { lateral: true, threshold: true },
  },
  edgePolish: {
    enabled: false,
    type: 'polished',
  },
  extraAccessories: [],
};

import i18next from 'i18next';

function getDoorSteps(): CalculatorStep[] {
  return [
    { id: 1, title: i18next.t('calc.steps.door.doorType'), description: i18next.t('calc.steps.door.doorTypeDesc'), isCompleted: false, isActive: true },
    { id: 2, title: i18next.t('calc.steps.door.dimensions'), description: i18next.t('calc.steps.door.dimensionsDesc'), isCompleted: false, isActive: false },
    { id: 3, title: i18next.t('calc.steps.door.glassType'), description: i18next.t('calc.steps.door.glassTypeDesc'), isCompleted: false, isActive: false },
    { id: 4, title: i18next.t('calc.steps.door.accessories'), description: i18next.t('calc.steps.door.accessoriesDesc'), isCompleted: false, isActive: false },
    { id: 5, title: i18next.t('calc.steps.door.finalize'), description: i18next.t('calc.steps.door.finalizeDesc'), isCompleted: false, isActive: false },
    { id: 6, title: i18next.t('calc.steps.door.quote'), description: i18next.t('calc.steps.door.quoteDesc'), isCompleted: false, isActive: false },
  ];
}

export function useDoorCalculator() {
  const [config, setConfig] = useState<DoorConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [selectedKit, setSelectedKit] = useState<SelectedKit | null>(null);

  // Get dynamic pricing from database
  const { pricing, isLoading: isPricingLoading, pricingItems } = usePricingData();

  // Recompute aggregated glass deductions from all selected accessories + kit
  useEffect(() => {
    if (!pricing) return;
    const codes = collectMaterialCodesFromConfig(config);
    const kd = selectedKit?.glass_deductions;
    let sA = 0, sB = 0, top = 0, bot = 0;
    for (const code of codes) {
      const d = pricing.getGlassDeductionsByCode(code);
      if (d.side_a) sA = Math.max(sA, d.side_a);
      if (d.side_b) sB = Math.max(sB, d.side_b);
      if (d.top) top = Math.max(top, d.top);
      if (d.bottom) bot = Math.max(bot, d.bottom);
    }
    const newW = Math.max(sA, kd?.side_a || 0) + Math.max(sB, kd?.side_b || 0);
    const newH = Math.max(top, kd?.top || 0) + Math.max(bot, kd?.bottom || 0);
    setConfig(prev => {
      const curW = prev.glassDeductions?.totalWidthDeduction || 0;
      const curH = prev.glassDeductions?.totalHeightDeduction || 0;
      if (curW === newW && curH === newH) return prev;
      return { ...prev, glassDeductions: { totalWidthDeduction: newW, totalHeightDeduction: newH } };
    });
  }, [config.accessories, config.extraAccessories, pricing, selectedKit]);

  const price = useMemo<PriceBreakdown>(() => {
    const base = calculateDoorPrice(config, pricing ?? undefined);
    if (selectedKit) {
      const kitProcCost = pricing ? calculateProcessingTypeCost(selectedKit.processing_types, pricing) : 0;
      return { ...base, accessories: base.accessories + selectedKit.price, processing: base.processing + kitProcCost, total: base.total + selectedKit.price + kitProcCost };
    }
    return base;
  }, [config, pricing, selectedKit]);

  const steps = useMemo(() => {
    return getDoorSteps().map(step => ({
      ...step,
      isCompleted: completedSteps.has(step.id),
      isActive: step.id === currentStep,
    }));
  }, [currentStep, completedSteps]);

  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= getDoorSteps().length) {
      if (stepId > currentStep) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      } else if (stepId < currentStep) {
        setCompletedSteps(prev => {
          const next = new Set(prev);
          for (let i = stepId; i <= getDoorSteps().length; i++) next.delete(i);
          return next;
        });
      }
      setCurrentStep(stepId);
    }
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < getDoorSteps().length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCompletedSteps(prev => {
        const next = new Set(prev);
        for (let i = currentStep - 1; i <= getDoorSteps().length; i++) next.delete(i);
        return next;
      });
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const setDoorType = useCallback((doorType: DoorType) => {
    setConfig(prev => {
      let accessories = { ...prev.accessories };
      if (doorType === 'pivot') {
        accessories.pivot = { type: 'standard', withDamper: true };
        accessories.hinges = undefined;
      } else if (doorType === 'sliding') {
        accessories.slidingSystem = { rail: 'exposed', rollers: 'standard', damper: true, slidingDirection: 'right' };
        accessories.hinges = undefined;
        accessories.pivot = undefined;
      } else {
        accessories.hinges = { type: 'wall_glass', quantity: 3, finish: 'polished_stainless' };
        accessories.pivot = undefined;
        accessories.slidingSystem = undefined;
      }
      return { ...prev, doorType, accessories };
    });
  }, []);

  const setFrameType = useCallback((frameType: FrameType) => {
    setConfig(prev => ({ ...prev, frameType }));
  }, []);

  const setDimensions = useCallback((dimensions: Partial<DoorConfig['dimensions']>) => {
    setConfig(prev => {
      const newDimensions = { ...prev.dimensions, ...dimensions };
      const newHeight = newDimensions.height;
      const hingeQty = prev.accessories.hinges?.quantity ?? 3;
      return {
        ...prev,
        dimensions: newDimensions,
        accessories: {
          ...prev.accessories,
          hinges: prev.accessories.hinges ? {
            ...prev.accessories.hinges,
            positions: calculateDefaultHingePositions(newHeight, hingeQty),
          } : prev.accessories.hinges,
          handle: {
            ...prev.accessories.handle,
            positionY: calculateDefaultHandlePosition(newHeight),
          },
        },
      };
    });
  }, []);

  const setGlass = useCallback((glass: Partial<DoorConfig['glass']>) => {
    setConfig(prev => ({ ...prev, glass: { ...prev.glass, ...glass } }));
  }, []);

  const setAccessories = useCallback((accessories: Partial<DoorConfig['accessories']>) => {
    setConfig(prev => {
      const merged = { ...prev.accessories, ...accessories };
      // Recalculate positions when hinge quantity changes
      if (accessories.hinges && accessories.hinges.quantity !== undefined && 
          accessories.hinges.quantity !== prev.accessories.hinges?.quantity) {
        merged.hinges = {
          ...merged.hinges!,
          positions: calculateDefaultHingePositions(prev.dimensions.height, accessories.hinges.quantity),
        };
      }
      return { ...prev, accessories: merged };
    });
  }, []);

  const setEdgePolish = useCallback((edgePolish: Partial<EdgePolishConfig>) => {
    setConfig(prev => ({ ...prev, edgePolish: { ...prev.edgePolish, ...edgePolish } }));
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setCurrentStep(1);
    setCompletedSteps(new Set());
  }, []);

  const addExtraAccessory = useCallback((item: { materialCode: string; name: string; unitPrice?: number; unit?: string }) => {
    setConfig(prev => ({
      ...prev,
      extraAccessories: [...prev.extraAccessories, { ...item, quantity: 1 }],
    }));
  }, []);

  const removeExtraAccessory = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      extraAccessories: prev.extraAccessories.filter((_, i) => i !== index),
    }));
  }, []);

  const updateExtraAccessory = useCallback((index: number, updates: Partial<DoorConfig['extraAccessories'][0]>) => {
    setConfig(prev => ({
      ...prev,
      extraAccessories: prev.extraAccessories.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const canGoNext = useMemo(() => true, []);

  const removeSelectedKit = useCallback(() => setSelectedKit(null), []);

  const addLateralSeal = useCallback((selection: { materialCode: string; name: string; unitPrice?: number }) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        seals: {
          ...prev.accessories.seals,
          lateralSelections: [...(prev.accessories.seals.lateralSelections || []), selection],
        },
      },
    }));
  }, []);

  const removeLateralSeal = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        seals: {
          ...prev.accessories.seals,
          lateralSelections: (prev.accessories.seals.lateralSelections || []).filter((_, i) => i !== index),
        },
      },
    }));
  }, []);

  const updateLateralSeal = useCallback((index: number, selection: { materialCode: string; name: string; unitPrice?: number }) => {
    setConfig(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        seals: {
          ...prev.accessories.seals,
          lateralSelections: (prev.accessories.seals.lateralSelections || []).map((item, i) =>
            i === index ? selection : item
          ),
        },
      },
    }));
  }, []);

  const addCutout = useCallback((side: EdgeCutout['side']) => {
    setConfig(prev => ({
      ...prev,
      cutouts: [...(prev.cutouts || []), { id: crypto.randomUUID(), side, depth: 50, length: 100, ...(side !== 'center' ? { verticalPosition: 'bottom' } : {}) }],
    }));
  }, []);

  const updateCutout = useCallback((id: string, updates: Partial<Omit<EdgeCutout, 'id'>>) => {
    setConfig(prev => ({
      ...prev,
      cutouts: (prev.cutouts || []).map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const removeCutout = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      cutouts: (prev.cutouts || []).filter(c => c.id !== id),
    }));
  }, []);

  return {
    config, currentStep, steps, price, canGoNext, isPricingLoading, pricingItems,
    selectedKit, setSelectedKit, removeSelectedKit,
    goToStep, nextStep, prevStep,
    setDoorType, setFrameType, setDimensions, setGlass, setAccessories, setEdgePolish,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    addLateralSeal, removeLateralSeal, updateLateralSeal,
    addCutout, updateCutout, removeCutout,
    reset,
    loadConfig: useCallback((saved: any) => {
      if (saved) {
        setConfig(saved as DoorConfig);
        if (saved.selectedKit) setSelectedKit(saved.selectedKit);
        setCurrentStep(getDoorSteps().length);
        setCompletedSteps(new Set(getDoorSteps().map(s => s.id)));
      }
    }, []),
  };
}
