import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SelectedKit } from '@/components/calculators/shared/KitSelector';
import type { 
  BalustradeConfig, 
  BalustradePlacement, 
  BalustradeMountType,
  FinishType,
  PriceBreakdown,
  CalculatorStep 
} from '@/types/calculators';
import { calculateBalustradePrice, collectMaterialCodesFromConfig, aggregateGlassDeductions } from '@/lib/calculators/pricing';
import { usePricingData, calculateProcessingTypeCost } from '@/hooks/useDynamicPricing';
const DEFAULT_CONFIG: BalustradeConfig = {
  placement: 'interior',
  mountType: 'point_mount',
  mountOptions: {
    pointMount: true,
    uProfile: false,
    handrail: false,
  },
  dimensions: {
    length: 3000,
    height: 1000,
    panelCount: 3,
    corners: {
      left: { enabled: false, length: 500, panelCount: 1 },
      right: { enabled: false, length: 500, panelCount: 1 },
    },
  },
  glass: {
    thickness: 10,
    type: 'clear',
    laminated: false,
  },
  accessories: {
    mountPoints: {
      model: 'adjustable',
      quantity: 12,
      finish: 'polished_stainless',
      spacing: 300, // Default 300mm between mounts
    },
    handrail: null,
    uProfile: null,
  },
  edgePolish: {
    enabled: false,
    type: 'polished',
  },
  extraAccessories: [],
};

import i18next from 'i18next';

function getBalustradeSteps(): CalculatorStep[] {
  return [
    { id: 1, title: i18next.t('calc.steps.balustrade.placement'), description: i18next.t('calc.steps.balustrade.placementDesc'), isCompleted: false, isActive: true },
    { id: 2, title: i18next.t('calc.steps.balustrade.mountType'), description: i18next.t('calc.steps.balustrade.mountTypeDesc'), isCompleted: false, isActive: false },
    { id: 3, title: i18next.t('calc.steps.balustrade.dimensions'), description: i18next.t('calc.steps.balustrade.dimensionsDesc'), isCompleted: false, isActive: false },
    { id: 4, title: i18next.t('calc.steps.balustrade.glassType'), description: i18next.t('calc.steps.balustrade.glassTypeDesc'), isCompleted: false, isActive: false },
    { id: 5, title: i18next.t('calc.steps.balustrade.accessories'), description: i18next.t('calc.steps.balustrade.accessoriesDesc'), isCompleted: false, isActive: false },
    { id: 6, title: i18next.t('calc.steps.balustrade.quote'), description: i18next.t('calc.steps.balustrade.quoteDesc'), isCompleted: false, isActive: false },
  ];
}

export function useBalustradeCalculator() {
  const [config, setConfig] = useState<BalustradeConfig>(DEFAULT_CONFIG);
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
    const base = calculateBalustradePrice(config, pricing ?? undefined);
    if (selectedKit) {
      const kitProcCost = pricing ? calculateProcessingTypeCost(selectedKit.processing_types, pricing) : 0;
      return { ...base, accessories: base.accessories + selectedKit.price, processing: base.processing + kitProcCost, total: base.total + selectedKit.price + kitProcCost };
    }
    return base;
  }, [config, pricing, selectedKit]);

  const steps = useMemo(() => {
    return getBalustradeSteps().map(step => ({
      ...step,
      isCompleted: completedSteps.has(step.id),
      isActive: step.id === currentStep,
    }));
  }, [currentStep, completedSteps]);

  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= getBalustradeSteps().length) {
      if (stepId > currentStep) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      } else if (stepId < currentStep) {
        setCompletedSteps(prev => {
          const next = new Set(prev);
          for (let i = stepId; i <= getBalustradeSteps().length; i++) next.delete(i);
          return next;
        });
      }
      setCurrentStep(stepId);
    }
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < getBalustradeSteps().length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCompletedSteps(prev => {
        const next = new Set(prev);
        for (let i = currentStep - 1; i <= getBalustradeSteps().length; i++) next.delete(i);
        return next;
      });
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const setPlacement = useCallback((placement: BalustradePlacement) => {
    setConfig(prev => {
      // Auto-set laminated for exterior
      const laminated = placement === 'exterior' ? true : prev.glass.laminated;
      
      // Configure stairs-specific settings with step dimensions
      const stairsConfig = placement === 'stairs' 
        ? { 
            stepCount: 10,
            stepHeight: 170,
            stepDepth: 300,
            angle: Math.round(Math.atan(170 / 300) * (180 / Math.PI) * 10) / 10, // ~29.5°
            heightMin: 900, 
            heightMax: 1100, 
            mountPosition: 'tread' as const,
            hasIntermediateLanding: false,
            landingLength: 1000,
            landingPosition: 5,
            finalLandingLength: 800,
            stairPanelHeight: 1000,
            intermediateLandingPanelHeight: 1000,
            finalLandingPanelHeight: 1000,
            intermediateLandingMountCount: 3,
            finalLandingMountCount: 3,
            ramp1PanelCount: 2,
            ramp2PanelCount: 2,
          }
        : undefined;
      
      // Calculate initial length for stairs
      const length = placement === 'stairs' ? 10 * 300 : prev.dimensions.length;
      
      return { 
        ...prev, 
        placement, 
        glass: { ...prev.glass, laminated },
        dimensions: { ...prev.dimensions, stairsConfig, length }
      };
    });
  }, []);

  const setMountType = useCallback((mountType: BalustradeMountType) => {
    setConfig(prev => {
      let accessories = { ...prev.accessories };
      
      if (mountType === 'u_profile') {
        accessories.uProfile = { size: '50x20', finish: 'anodized_silver' };
        accessories.mountPoints = { model: '', quantity: 0, finish: 'polished_stainless' };
      } else if (mountType === 'handrail') {
        accessories.handrail = { diameter: 50, type: 'round', length: prev.dimensions.length, finish: 'polished_stainless' };
      } else {
        accessories.uProfile = null;
        accessories.handrail = null;
        accessories.mountPoints = { 
          model: 'adjustable', 
          quantity: Math.ceil(prev.dimensions.length / 300) * 2,
          finish: 'polished_stainless',
          spacing: 300,
        };
      }
      
      return { ...prev, mountType, accessories };
    });
  }, []);

  const setDimensions = useCallback((dimensions: Partial<BalustradeConfig['dimensions']>) => {
    setConfig(prev => {
      const newDimensions = { ...prev.dimensions, ...dimensions };
      
      // Handle stairs configuration with auto-calculations
      if (dimensions.stairsConfig && newDimensions.stairsConfig) {
        const stairsConfig = { ...newDimensions.stairsConfig, ...dimensions.stairsConfig };
        
        // Recalculate angle when step dimensions change
        if (stairsConfig.stepHeight && stairsConfig.stepDepth) {
          stairsConfig.angle = Math.round(
            Math.atan(stairsConfig.stepHeight / stairsConfig.stepDepth) * (180 / Math.PI) * 10
          ) / 10;
        }
        
        // Recalculate length when step count or depth changes
        if (stairsConfig.stepCount && stairsConfig.stepDepth) {
          newDimensions.length = stairsConfig.stepCount * stairsConfig.stepDepth;
        }
        
        newDimensions.stairsConfig = stairsConfig;
      }
      
      // Only auto-calculate panel count if not manually setting panelCount
      // and if length changed
      if (dimensions.panelCount === undefined && (dimensions.length !== undefined || dimensions.stairsConfig !== undefined)) {
        newDimensions.panelCount = Math.ceil(newDimensions.length / 1200);
      }
      
      // Compute effective length including corners and sub-corners
      let effectiveLength = newDimensions.length;
      const corners = newDimensions.corners;
      if (corners?.left?.enabled && corners.left.length > 0) {
        effectiveLength += corners.left.length;
        const subL = corners.left.subCorners;
        if (subL?.left?.enabled && subL.left.length > 0) effectiveLength += subL.left.length;
        if (subL?.right?.enabled && subL.right.length > 0) effectiveLength += subL.right.length;
      }
      if (corners?.right?.enabled && corners.right.length > 0) {
        effectiveLength += corners.right.length;
        const subR = corners.right.subCorners;
        if (subR?.left?.enabled && subR.left.length > 0) effectiveLength += subR.left.length;
        if (subR?.right?.enabled && subR.right.length > 0) effectiveLength += subR.right.length;
      }
      
      // Update mount points based on effective length
      let accessories = { ...prev.accessories };
      const spacing = accessories.mountPoints?.spacing ?? 300;
      if (prev.mountType === 'point_mount') {
        accessories.mountPoints = {
          ...accessories.mountPoints,
          quantity: Math.ceil(effectiveLength / spacing),
        };
      }
      if (accessories.handrail) {
        accessories.handrail = { ...accessories.handrail, length: effectiveLength };
      }
      return { ...prev, dimensions: newDimensions, accessories };
    });
  }, []);

  const setGlass = useCallback((glass: Partial<BalustradeConfig['glass']>) => {
    setConfig(prev => ({ ...prev, glass: { ...prev.glass, ...glass } }));
  }, []);

  const setAccessories = useCallback((accessories: Partial<BalustradeConfig['accessories']>) => {
    setConfig(prev => ({ ...prev, accessories: { ...prev.accessories, ...accessories } }));
  }, []);

  const toggleMountOption = useCallback((option: 'pointMount' | 'uProfile' | 'handrail') => {
    setConfig(prev => {
      const newValue = !prev.mountOptions[option];
      const newMountOptions = { ...prev.mountOptions, [option]: newValue };
      
      let accessories = { ...prev.accessories };
      
      // Configure accessories based on toggle state
      if (option === 'pointMount') {
        if (newValue) {
          accessories.mountPoints = { 
            model: 'adjustable', 
            quantity: Math.ceil(prev.dimensions.length / 300),
            finish: 'polished_stainless',
            spacing: 300,
          };
        } else {
          accessories.mountPoints = { model: '', quantity: 0, finish: 'polished_stainless', spacing: 300 };
        }
      } else if (option === 'uProfile') {
        if (newValue) {
          accessories.uProfile = { size: '50x20', finish: 'anodized_silver' };
        } else {
          accessories.uProfile = null;
        }
      } else if (option === 'handrail') {
        if (newValue) {
          accessories.handrail = { diameter: 50, type: 'round', length: prev.dimensions.length, finish: 'polished_stainless' };
        } else {
          accessories.handrail = null;
        }
      }
      
      return { ...prev, mountOptions: newMountOptions, accessories };
    });
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

  const updateExtraAccessory = useCallback((index: number, updates: Partial<BalustradeConfig['extraAccessories'][0]>) => {
    setConfig(prev => ({
      ...prev,
      extraAccessories: prev.extraAccessories.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const canGoNext = useMemo(() => true, []);

  const removeSelectedKit = useCallback(() => setSelectedKit(null), []);

  return {
    config, currentStep, steps, price, canGoNext, isPricingLoading, pricingItems,
    selectedKit, setSelectedKit, removeSelectedKit,
    goToStep, nextStep, prevStep,
    setPlacement, setMountType, setDimensions, setGlass, setAccessories, toggleMountOption,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    reset,
    setEdgePolish: useCallback((edgePolish: Partial<BalustradeConfig['edgePolish']>) => {
      setConfig(prev => ({ ...prev, edgePolish: { ...prev.edgePolish, ...edgePolish } }));
    }, []),
    loadConfig: useCallback((saved: any) => {
      if (saved) {
        setConfig(saved as BalustradeConfig);
        if (saved.selectedKit) setSelectedKit(saved.selectedKit);
        setCurrentStep(getBalustradeSteps().length);
        setCompletedSteps(new Set(getBalustradeSteps().map(s => s.id)));
      }
    }, []),
  };
}
