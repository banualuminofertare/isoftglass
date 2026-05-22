import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SelectedKit } from '@/components/calculators/shared/KitSelector';
import type { 
  KitchenFrontConfig, 
  KitchenFrontType,
  HoleSpec,
  CutoutSpec,
  EdgePolishConfig,
  PriceBreakdown,
  CalculatorStep 
} from '@/types/calculators';
import { calculateKitchenFrontPrice, collectMaterialCodesFromConfig, aggregateGlassDeductions } from '@/lib/calculators/pricing';
import { usePricingData, calculateProcessingTypeCost } from '@/hooks/useDynamicPricing';

const DEFAULT_CONFIG: KitchenFrontConfig = {
  frontType: 'lacquered',
  dimensions: {
    width: 600,
    height: 720,
    quantity: 1,
  },
  glass: {
    thickness: 6,
  },
  finish: {
    ralColor: '#ffffff',
  },
  processing: {
    holes: [],
    cutouts: [],
  },
  mounting: {
    type: 'glued',
  },
  edgePolish: {
    enabled: true,
    type: 'polished',
  },
  extraAccessories: [],
};

import i18next from 'i18next';

function getKitchenSteps(): CalculatorStep[] {
  return [
    { id: 1, title: i18next.t('calc.steps.kitchen.frontType'), description: i18next.t('calc.steps.kitchen.frontTypeDesc'), isCompleted: false, isActive: true },
    { id: 2, title: i18next.t('calc.steps.kitchen.dimensions'), description: i18next.t('calc.steps.kitchen.dimensionsDesc'), isCompleted: false, isActive: false },
    { id: 3, title: i18next.t('calc.steps.kitchen.finish'), description: i18next.t('calc.steps.kitchen.finishDesc'), isCompleted: false, isActive: false },
    { id: 4, title: i18next.t('calc.steps.kitchen.processing'), description: i18next.t('calc.steps.kitchen.processingDesc'), isCompleted: false, isActive: false },
    { id: 5, title: i18next.t('calc.steps.kitchen.finalize'), description: i18next.t('calc.steps.kitchen.finalizeDesc'), isCompleted: false, isActive: false },
    { id: 6, title: i18next.t('calc.steps.kitchen.quote'), description: i18next.t('calc.steps.kitchen.quoteDesc'), isCompleted: false, isActive: false },
  ];
}

export function useKitchenFrontCalculator() {
  const [config, setConfig] = useState<KitchenFrontConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [selectedKit, setSelectedKit] = useState<SelectedKit | null>(null);

  // Get dynamic pricing from database
  const { pricing, isLoading: isPricingLoading } = usePricingData();

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
  }, [config.extraAccessories, pricing, selectedKit]);

  const price = useMemo<PriceBreakdown>(() => {
    const base = calculateKitchenFrontPrice(config, pricing ?? undefined);
    if (selectedKit) {
      const kitProcCost = pricing ? calculateProcessingTypeCost(selectedKit.processing_types, pricing) : 0;
      return { ...base, accessories: base.accessories + selectedKit.price, processing: base.processing + kitProcCost, total: base.total + selectedKit.price + kitProcCost };
    }
    return base;
  }, [config, pricing, selectedKit]);

  const steps = useMemo(() => {
    return getKitchenSteps().map(step => ({
      ...step,
      isCompleted: completedSteps.has(step.id),
      isActive: step.id === currentStep,
    }));
  }, [currentStep, completedSteps]);

  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= getKitchenSteps().length) {
      if (stepId > currentStep) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      } else if (stepId < currentStep) {
        setCompletedSteps(prev => {
          const next = new Set(prev);
          for (let i = stepId; i <= getKitchenSteps().length; i++) next.delete(i);
          return next;
        });
      }
      setCurrentStep(stepId);
    }
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < getKitchenSteps().length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCompletedSteps(prev => {
        const next = new Set(prev);
        for (let i = currentStep - 1; i <= getKitchenSteps().length; i++) next.delete(i);
        return next;
      });
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const setFrontType = useCallback((frontType: KitchenFrontType) => {
    setConfig(prev => ({ ...prev, frontType }));
  }, []);

  const setDimensions = useCallback((dimensions: Partial<KitchenFrontConfig['dimensions']>) => {
    setConfig(prev => ({ ...prev, dimensions: { ...prev.dimensions, ...dimensions } }));
  }, []);

  const setFinish = useCallback((finish: Partial<KitchenFrontConfig['finish']>) => {
    setConfig(prev => ({ ...prev, finish: { ...prev.finish, ...finish } }));
  }, []);

  const setProcessing = useCallback((processing: Partial<KitchenFrontConfig['processing']>) => {
    setConfig(prev => ({ ...prev, processing: { ...prev.processing, ...processing } }));
  }, []);

  const setMounting = useCallback((mounting: Partial<KitchenFrontConfig['mounting']>) => {
    setConfig(prev => ({ ...prev, mounting: { ...prev.mounting, ...mounting } }));
  }, []);

  const setEdgePolish = useCallback((edgePolish: Partial<EdgePolishConfig>) => {
    setConfig(prev => ({ ...prev, edgePolish: { ...prev.edgePolish, ...edgePolish } }));
  }, []);

  const addHole = useCallback((hole: Omit<HoleSpec, 'id'>) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        holes: [...prev.processing.holes, { ...hole, id: crypto.randomUUID() }],
      },
    }));
  }, []);

  const removeHole = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        holes: prev.processing.holes.filter(h => h.id !== id),
      },
    }));
  }, []);

  const updateHole = useCallback((id: string, updates: Partial<Omit<HoleSpec, 'id'>>) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        holes: prev.processing.holes.map(h => 
          h.id === id ? { ...h, ...updates } : h
        ),
      },
    }));
  }, []);

  const addCutout = useCallback((cutout: Omit<CutoutSpec, 'id'>) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        cutouts: [...prev.processing.cutouts, { ...cutout, id: crypto.randomUUID() }],
      },
    }));
  }, []);

  const removeCutout = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        cutouts: prev.processing.cutouts.filter(c => c.id !== id),
      },
    }));
  }, []);

  const updateCutout = useCallback((id: string, updates: Partial<Omit<CutoutSpec, 'id'>>) => {
    setConfig(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        cutouts: prev.processing.cutouts.map(c => 
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    }));
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

  const updateExtraAccessory = useCallback((index: number, updates: Partial<KitchenFrontConfig['extraAccessories'][0]>) => {
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
    config, currentStep, steps, price, canGoNext, isPricingLoading,
    selectedKit, setSelectedKit, removeSelectedKit,
    goToStep, nextStep, prevStep,
    setFrontType, setDimensions, setFinish, setProcessing, setMounting, setEdgePolish,
    addHole, removeHole, updateHole,
    addCutout, removeCutout, updateCutout,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    reset,
    loadConfig: useCallback((saved: any) => {
      if (saved) {
        setConfig(saved as KitchenFrontConfig);
        if (saved.selectedKit) setSelectedKit(saved.selectedKit);
        setCurrentStep(getKitchenSteps().length);
        setCompletedSteps(new Set(getKitchenSteps().map(s => s.id)));
      }
    }, []),
  };
}
