import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SelectedKit } from '@/components/calculators/shared/KitSelector';
import type { 
  MirrorConfig, 
  MirrorShape,
  MirrorType,
  LEDType,
  EdgePolishType,
  EdgePolishConfig,
  HoleSpec,
  PriceBreakdown,
  CalculatorStep 
} from '@/types/calculators';
import { calculateMirrorPrice, collectMaterialCodesFromConfig, aggregateGlassDeductions } from '@/lib/calculators/pricing';
import { usePricingData, calculateProcessingTypeCost } from '@/hooks/useDynamicPricing';

const DEFAULT_CONFIG: MirrorConfig = {
  shape: 'rectangle',
  dimensions: {
    width: 800,
    height: 1000,
    quantity: 1,
  },
  mirrorType: 'silver',
  processing: {
    bevel: { enabled: true, width: 20 },
    sandblasting: { enabled: false, pattern: '' },
    holes: [],
    cutoutCount: 0,
  },
  led: {
    type: 'none',
  },
  edgePolish: {
    enabled: false,
    type: 'polished',
  },
  extraAccessories: [],
};

import i18next from 'i18next';

function getMirrorSteps(): CalculatorStep[] {
  return [
    { id: 1, title: i18next.t('calc.steps.mirror.shape'), description: i18next.t('calc.steps.mirror.shapeDesc'), isCompleted: false, isActive: true },
    { id: 2, title: i18next.t('calc.steps.mirror.dimensions'), description: i18next.t('calc.steps.mirror.dimensionsDesc'), isCompleted: false, isActive: false },
    { id: 3, title: i18next.t('calc.steps.mirror.mirrorType'), description: i18next.t('calc.steps.mirror.mirrorTypeDesc'), isCompleted: false, isActive: false },
    { id: 4, title: i18next.t('calc.steps.mirror.processing'), description: i18next.t('calc.steps.mirror.processingDesc'), isCompleted: false, isActive: false },
    { id: 5, title: i18next.t('calc.steps.mirror.lighting'), description: i18next.t('calc.steps.mirror.lightingDesc'), isCompleted: false, isActive: false },
    { id: 6, title: i18next.t('calc.steps.mirror.quote'), description: i18next.t('calc.steps.mirror.quoteDesc'), isCompleted: false, isActive: false },
  ];
}

export function useMirrorCalculator() {
  const [config, setConfig] = useState<MirrorConfig>(DEFAULT_CONFIG);
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
  }, [config.extraAccessories, pricing, selectedKit]);

  const price = useMemo<PriceBreakdown>(() => {
    const base = calculateMirrorPrice(config, pricing ?? undefined);
    if (selectedKit) {
      const kitProcCost = pricing ? calculateProcessingTypeCost(selectedKit.processing_types, pricing) : 0;
      return { ...base, accessories: base.accessories + selectedKit.price, processing: base.processing + kitProcCost, total: base.total + selectedKit.price + kitProcCost };
    }
    return base;
  }, [config, pricing, selectedKit]);

  const steps = useMemo(() => {
    return getMirrorSteps().map(step => ({
      ...step,
      isCompleted: completedSteps.has(step.id),
      isActive: step.id === currentStep,
    }));
  }, [currentStep, completedSteps]);

  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= getMirrorSteps().length) {
      if (stepId > currentStep) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      } else if (stepId < currentStep) {
        setCompletedSteps(prev => {
          const next = new Set(prev);
          for (let i = stepId; i <= getMirrorSteps().length; i++) next.delete(i);
          return next;
        });
      }
      setCurrentStep(stepId);
    }
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < getMirrorSteps().length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCompletedSteps(prev => {
        const next = new Set(prev);
        for (let i = currentStep - 1; i <= getMirrorSteps().length; i++) next.delete(i);
        return next;
      });
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const setShape = useCallback((shape: MirrorShape) => {
    setConfig(prev => ({ ...prev, shape }));
  }, []);

  const setDimensions = useCallback((dimensions: Partial<MirrorConfig['dimensions']>) => {
    setConfig(prev => ({ ...prev, dimensions: { ...prev.dimensions, ...dimensions } }));
  }, []);

  const setMirrorType = useCallback((mirrorType: MirrorType) => {
    setConfig(prev => ({ ...prev, mirrorType }));
  }, []);

  const setProcessing = useCallback((processing: Partial<MirrorConfig['processing']>) => {
    setConfig(prev => ({ ...prev, processing: { ...prev.processing, ...processing } }));
  }, []);

  const setBevel = useCallback((bevel: Partial<MirrorConfig['processing']['bevel']>) => {
    setConfig(prev => ({
      ...prev,
      processing: { ...prev.processing, bevel: { ...prev.processing.bevel, ...bevel } },
    }));
  }, []);

  const setLed = useCallback((led: Partial<MirrorConfig['led']>) => {
    setConfig(prev => ({ ...prev, led: { ...prev.led, ...led } }));
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

  const updateExtraAccessory = useCallback((index: number, updates: Partial<MirrorConfig['extraAccessories'][0]>) => {
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
    setShape, setDimensions, setMirrorType, setProcessing, setBevel, setLed, setEdgePolish,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    reset,
    loadConfig: useCallback((saved: any) => {
      if (saved) {
        setConfig(saved as MirrorConfig);
        if (saved.selectedKit) setSelectedKit(saved.selectedKit);
        setCurrentStep(getMirrorSteps().length);
        setCompletedSteps(new Set(getMirrorSteps().map(s => s.id)));
      }
    }, []),
  };
}
