import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalculatorLayout } from '@/components/calculators/shared/CalculatorLayout';
import { StepIndicator } from '@/components/calculators/shared/StepIndicator';
import { NavigationButtons } from '@/components/calculators/shared/NavigationButtons';
import { PriceSummary } from '@/components/calculators/shared/PriceSummary';
import { ClientInfoFields } from '@/components/calculators/shared/ClientInfoFields';
import { DimensionInput } from '@/components/calculators/shared/DimensionInput';
import { FinishSelector } from '@/components/calculators/shared/FinishSelector';
import { SceneSetup } from '@/components/3d/helpers/SceneSetup';
import { SimpleDimensionLines } from '@/components/3d/annotations/SimpleDimensionLines';
import { DimensionLabel } from '@/components/3d/annotations/DimensionLabel';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBalustradeCalculator } from '@/hooks/calculators/useBalustradeCalculator';
import { useQuotePDF } from '@/hooks/calculators/useQuotePDF';
import { useQuoteSave } from '@/hooks/useQuoteSave';
import { useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { useToast } from '@/hooks/use-toast';
import { useClientTypePricing } from '@/hooks/useClientTypePricing';
import type { ClientType } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { Home, Sun, CircleDot, SquareStack, Grip, TrendingUp } from 'lucide-react';
import { ExtraAccessoriesSection } from '@/components/calculators/shared/ExtraAccessoriesSection';
import { EdgePolishingOption, type GlassPiece } from '@/components/calculators/shared/EdgePolishingOption';
import { EdgeTypeSelector } from '@/components/calculators/shared/EdgeTypeSelector';

import { CatalogProductSelector } from '@/components/calculators/shared/CatalogProductSelector';
import { AccessoryPresetManager } from '@/components/calculators/shared/AccessoryPresetManager';
import { GlassModelSelector } from '@/components/calculators/shared/GlassModelSelector';
import { GlassMaterial, GlassColorContext } from '@/components/3d/materials/GlassMaterial';
import { MetalMaterial } from '@/components/3d/materials/MetalMaterial';
import { ParallelogramPanel } from '@/components/3d/geometry/ParallelogramPanel';
import { MOUNT_POINT_CODES, getHandrailMaterialCode } from '@/lib/calculators/materialMapping';
import type { BalustradePlacement, BalustradeMountType, FinishType } from '@/types/calculators';
import { useEditQuote } from '@/hooks/useEditQuote';

export function BalustradeConfigurator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addItem } = useOrderItemsContext();
  const [isAddingToOrder, setIsAddingToOrder] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientType, setClientType] = useState<ClientType>('person');
  const [customAmount, setCustomAmount] = useState(0);
  const [customAmountNote, setCustomAmountNote] = useState('');
  const { getMarkup } = useClientTypePricing();
  const markupPercent = getMarkup(clientType);
  const {
    config, currentStep, steps, price, canGoNext,
    goToStep, nextStep, prevStep,
    setPlacement, setMountType, setDimensions, setGlass, setAccessories, toggleMountOption, setEdgePolish,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    selectedKit, setSelectedKit, removeSelectedKit,
    reset,
    loadConfig,
    pricingItems,
  } = useBalustradeCalculator();

  const navigate = useNavigate();
  const { editingOrderProductId, savedConfig, editClientInfo } = useEditQuote();

  useEffect(() => {
    if (savedConfig) {
      loadConfig(savedConfig);
      if (savedConfig.customAmount != null) setCustomAmount(savedConfig.customAmount);
      if (savedConfig.customAmountNote) setCustomAmountNote(savedConfig.customAmountNote);
    }
  }, [savedConfig, loadConfig]);

  useEffect(() => {
    if (editClientInfo) {
      setClientName(editClientInfo.clientName);
      setClientPhone(editClientInfo.clientPhone);
      setClientEmail(editClientInfo.clientEmail);
    }
  }, [editClientInfo]);

  const { saveQuote, isSaving: isSavingQuote } = useQuoteSave();

  const getConfigDetails = () => [
    { label: t('calc.placement'), value: placementLabels[config.placement] || config.placement },
    { label: t('calc.mountType'), value: Object.entries(config.mountOptions).filter(([, v]) => v).map(([k]) => mountLabels[k] || k).join(', ') },
    { label: t('calc.dimensions'), value: `${config.dimensions.length} × ${config.dimensions.height} mm` },
    { label: t('calc.panelCount'), value: `${config.dimensions.panelCount} ${t('common.pieces')}` },
    { label: t('calc.glass'), value: `${config.glass.thickness}mm, ${config.glass.type === 'clear' ? t('calc.glassClear') : t('calc.glassFrosted')}${config.glass.laminated ? `, ${t('calc.glassLaminated')}` : ''}` },
    ...(config.accessories.mountPoints ? [{ label: t('calc.mountPoints'), value: `${config.accessories.mountPoints.quantity} ${t('common.pieces')}, ${finishLabels[config.accessories.mountPoints.finish] || config.accessories.mountPoints.finish}` }] : []),
    ...(config.accessories.handrail ? [{ label: t('calc.handrail'), value: `Ø${config.accessories.handrail.diameter}mm, ${finishLabels[config.accessories.handrail.finish] || config.accessories.handrail.finish}` }] : []),
  ];

  const handleSaveQuote = async () => {
    const success = await saveQuote({
      productType: 'balustrade',
      productLabel: t('calc.balustradeLabel'),
      getConfigDetails,
      price,
      clientName,
      clientPhone,
      clientEmail,
      markupPercent,
      fullConfig: { ...config, customAmount, customAmountNote, selectedKit },
      editingOrderProductId,
    });
    if (success && editingOrderProductId) navigate('/comenzi');
  };

  const placementLabels: Record<string, string> = { interior: t('calc.interior'), exterior: t('calc.exterior'), stairs: t('calc.stairs') };
  const mountLabels: Record<string, string> = { point_mount: t('calc.mountPoints'), u_profile: t('calc.uProfile'), handrail: t('calc.handrail') };
  const finishLabels: Record<string, string> = { polished_stainless: t('calc.finishPolishedStainless'), brushed_stainless: t('calc.finishBrushedStainless'), matte_black: t('calc.finishMatteBlack'), chrome: t('calc.finishChrome') };

  const { handleDownloadPDF } = useQuotePDF({
    productType: 'Balustrada',
    productLabel: t('calc.balustradeLabel'),
    price,
    clientName,
    clientPhone,
    clientEmail,
    customAmount,
    markupPercent,
    getConfigDetails,
  });

  const handleAddToOrder = async () => {
    setIsAddingToOrder(true);
    const success = await addItem({
      productType: 'balustrade',
      configuration: {
        ...(config as unknown as Record<string, unknown>),
        clientInfo: { name: clientName, phone: clientPhone, email: clientEmail },
        customAmount, customAmountNote,
        selectedKit,
      },
      price,
      markupPercent,
      customAmount,
    });
    setIsAddingToOrder(false);
    if (success) {
      reset();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'interior' as BalustradePlacement, label: t('calc.interior'), description: t('calc.interiorDesc'), icon: Home },
                { id: 'exterior' as BalustradePlacement, label: t('calc.exterior'), description: t('calc.exteriorDesc'), icon: Sun },
                { id: 'stairs' as BalustradePlacement, label: t('calc.stairs'), description: t('calc.stairsDesc'), icon: TrendingUp },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = config.placement === option.id;
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary/50",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                    onClick={() => setPlacement(option.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">{t('calc.selectMountOptions')}</p>
            {[
              { id: 'pointMount' as const, label: t('calc.pointMount'), description: t('calc.pointMountDesc'), icon: CircleDot },
              { id: 'uProfile' as const, label: t('calc.uProfile'), description: t('calc.uProfileDesc'), icon: SquareStack },
              { id: 'handrail' as const, label: t('calc.handrail'), description: t('calc.handrailDesc'), icon: Grip },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = config.mountOptions[option.id];
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}
                  onClick={() => toggleMountOption(option.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Switch checked={isSelected} onCheckedChange={() => toggleMountOption(option.id)} />
                  </div>
                </Card>
              );
            })}
          </div>
        );
      case 3:
        const stairsConfig = config.dimensions.stairsConfig;
        
        // Calculate derived values for stairs
        const projectedLength = stairsConfig 
          ? stairsConfig.stepCount * stairsConfig.stepDepth 
          : config.dimensions.length;
        const totalRise = stairsConfig 
          ? stairsConfig.stepCount * stairsConfig.stepHeight 
          : 0;
        const inclinedLength = stairsConfig 
          ? Math.round(Math.sqrt(projectedLength ** 2 + totalRise ** 2))
          : config.dimensions.length;
        
        return (
          <div className="space-y-4">
            {config.placement !== 'stairs' && (
              <>
                <DimensionInput
                  label={t('calc.totalLength')}
                  value={config.dimensions.length}
                  onChange={(length) => setDimensions({ length })}
                  min={500}
                  max={20000}
                  helperText="500 - 20000 mm"
                />
                <DimensionInput
                  label={t('calc.glassHeight')}
                  value={config.dimensions.height}
                  onChange={(height) => setDimensions({ height })}
                  min={800}
                  max={1500}
                  helperText="800 - 1500 mm (standard 900-1100mm)"
                />
                
                <DimensionInput
                  label={t('calc.numberOfPanelsLabel')}
                  value={config.dimensions.panelCount}
                  onChange={(panelCount) => setDimensions({ panelCount })}
                  min={1}
                  max={20}
                  step={1}
                  unit={t("calc.pcs")}
                  helperText={t('calc.panelCountRecommend')}
                />
                
                {(() => {
                  const pw = Math.round(config.dimensions.length / config.dimensions.panelCount);
                  return (
                    <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                      <p className="flex justify-between">
                         <span className="text-muted-foreground">{t('calc.panelWidthLabel')}:</span>
                        <span className={cn("font-medium", pw > 2000 && "text-orange-500")}>
                          {pw} mm
                        </span>
                      </p>
                      {pw > 2000 && (
                         <p className="text-orange-500 text-xs">
                           ⚠️ {t('calc.widthExceedsWarning')}
                         </p>
                      )}
                    </div>
                  );
                })()}

                {/* Corner 90° extensions */}
                <div className="space-y-3 pt-3 border-t">
                  <h5 className="text-sm font-medium text-muted-foreground">{t('calc.corner90Title')}</h5>
                  
                  {/* Left corner */}
                  <div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-center justify-between">
                      <div>
                         <Label className="text-sm font-medium text-blue-700 dark:text-blue-400">{t('calc.cornerLeft')}</Label>
                         <p className="text-xs text-blue-600/70 dark:text-blue-400/60">{t('calc.cornerLeftDesc')}</p>
                      </div>
                      <Switch
                        checked={config.dimensions.corners?.left?.enabled ?? false}
                        onCheckedChange={(enabled) => setDimensions({
                          corners: {
                            ...config.dimensions.corners,
                            left: { enabled, length: config.dimensions.corners?.left?.length ?? 500 },
                          }
                        })}
                      />
                    </div>
                    {config.dimensions.corners?.left?.enabled && (
                      <div className="space-y-2">
                        <DimensionInput
                          label={t('calc.cornerLengthLeft')}
                          value={config.dimensions.corners.left.length}
                          onChange={(length) => setDimensions({
                            corners: {
                              ...config.dimensions.corners,
                              left: { ...config.dimensions.corners!.left!, length },
                            }
                          })}
                          min={200}
                          max={3000}
                          helperText="200 - 3000 mm"
                        />
                        <DimensionInput
                           label={t('calc.numberOfPanelsCorner')}
                          value={config.dimensions.corners.left.panelCount ?? 1}
                          onChange={(panelCount) => setDimensions({
                            corners: {
                              ...config.dimensions.corners,
                              left: { ...config.dimensions.corners!.left!, panelCount: Math.max(1, panelCount) },
                            }
                          })}
                          min={1}
                          max={5}
                          step={1}
                          unit={t("calc.pcs")}
                   helperText={t('calc.panelsRangeLabel')}
                        />
                        {(() => {
                          const pw = Math.round(config.dimensions.corners!.left!.length / (config.dimensions.corners!.left!.panelCount ?? 1));
                          return (
                            <p className="text-xs text-blue-600/70 dark:text-blue-400/60">
                            {t("calc.widthPerPanelLabel")} <span className={cn("font-medium", pw > 2000 && "text-orange-500")}>{pw} mm</span>
                            </p>
                          );
                        })()}

                        {/* Sub-corners for left corner */}
                        <div className="space-y-2 pt-2 border-t border-blue-200/30 dark:border-blue-800/20">
                          <p className="text-xs font-medium text-blue-600/70 dark:text-blue-400/60">{t('calc.subCornerContinuation', { side: t('calc.left').toLowerCase() })}</p>
                          
                          {/* Sub-corner left-left */}
                          <div className="flex items-center justify-between">
                             <Label className="text-xs">{t('calc.toLeftLabel')}</Label>
                            <Switch
                              checked={config.dimensions.corners?.left?.subCorners?.left?.enabled ?? false}
                              onCheckedChange={(enabled) => setDimensions({
                                corners: {
                                  ...config.dimensions.corners,
                                  left: { ...config.dimensions.corners!.left!, subCorners: { ...config.dimensions.corners!.left!.subCorners, left: { enabled, length: config.dimensions.corners?.left?.subCorners?.left?.length ?? 500, panelCount: config.dimensions.corners?.left?.subCorners?.left?.panelCount ?? 1 } } },
                                }
                              })}
                            />
                          </div>
                          {config.dimensions.corners?.left?.subCorners?.left?.enabled && (
                            <div className="space-y-2 pl-2 border-l-2 border-blue-300/50">
                              <DimensionInput label={t("calc.lengthDimLabel")} value={config.dimensions.corners.left.subCorners.left.length} onChange={(length) => setDimensions({ corners: { ...config.dimensions.corners, left: { ...config.dimensions.corners!.left!, subCorners: { ...config.dimensions.corners!.left!.subCorners, left: { ...config.dimensions.corners!.left!.subCorners!.left!, length } } } } })} min={200} max={3000} helperText="200 - 3000 mm" />
                              <DimensionInput label={t("calc.panelCountDimLabel")} value={config.dimensions.corners.left.subCorners.left.panelCount ?? 1} onChange={(panelCount) => setDimensions({ corners: { ...config.dimensions.corners, left: { ...config.dimensions.corners!.left!, subCorners: { ...config.dimensions.corners!.left!.subCorners, left: { ...config.dimensions.corners!.left!.subCorners!.left!, panelCount: Math.max(1, panelCount) } } } } })} min={1} max={5} step={1} unit={t("calc.pcs")} />
                              {(() => { const pw = Math.round(config.dimensions.corners!.left!.subCorners!.left!.length / (config.dimensions.corners!.left!.subCorners!.left!.panelCount ?? 1)); return <p className="text-xs text-blue-600/50">{t("calc.widthPerPanelLabel")} <span className={cn("font-medium", pw > 2000 && "text-orange-500")}>{pw} mm</span></p>; })()}
                            </div>
                          )}

                          {/* Sub-corner left-right */}
                          <div className="flex items-center justify-between">
                             <Label className="text-xs">{t('calc.toRightLabel')}</Label>
                            <Switch
                              checked={config.dimensions.corners?.left?.subCorners?.right?.enabled ?? false}
                              onCheckedChange={(enabled) => setDimensions({
                                corners: {
                                  ...config.dimensions.corners,
                                  left: { ...config.dimensions.corners!.left!, subCorners: { ...config.dimensions.corners!.left!.subCorners, right: { enabled, length: config.dimensions.corners?.left?.subCorners?.right?.length ?? 500, panelCount: config.dimensions.corners?.left?.subCorners?.right?.panelCount ?? 1 } } },
                                }
                              })}
                            />
                          </div>
                          {config.dimensions.corners?.left?.subCorners?.right?.enabled && (
                            <div className="space-y-2 pl-2 border-l-2 border-blue-300/50">
                              <DimensionInput label={t("calc.lengthDimLabel")} value={config.dimensions.corners.left.subCorners.right.length} onChange={(length) => setDimensions({ corners: { ...config.dimensions.corners, left: { ...config.dimensions.corners!.left!, subCorners: { ...config.dimensions.corners!.left!.subCorners, right: { ...config.dimensions.corners!.left!.subCorners!.right!, length } } } } })} min={200} max={3000} helperText="200 - 3000 mm" />
                              <DimensionInput label={t("calc.panelCountDimLabel")} value={config.dimensions.corners.left.subCorners.right.panelCount ?? 1} onChange={(panelCount) => setDimensions({ corners: { ...config.dimensions.corners, left: { ...config.dimensions.corners!.left!, subCorners: { ...config.dimensions.corners!.left!.subCorners, right: { ...config.dimensions.corners!.left!.subCorners!.right!, panelCount: Math.max(1, panelCount) } } } } })} min={1} max={5} step={1} unit={t("calc.pcs")} />
                              {(() => { const pw = Math.round(config.dimensions.corners!.left!.subCorners!.right!.length / (config.dimensions.corners!.left!.subCorners!.right!.panelCount ?? 1)); return <p className="text-xs text-blue-600/50">{t("calc.widthPerPanelLabel")} <span className={cn("font-medium", pw > 2000 && "text-orange-500")}>{pw} mm</span></p>; })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right corner */}
                  <div className="space-y-2 p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
                    <div className="flex items-center justify-between">
                      <div>
                         <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">{t('calc.cornerRight')}</Label>
                         <p className="text-xs text-orange-600/70 dark:text-orange-400/60">{t('calc.cornerRightDesc')}</p>
                      </div>
                      <Switch
                        checked={config.dimensions.corners?.right?.enabled ?? false}
                        onCheckedChange={(enabled) => setDimensions({
                          corners: {
                            ...config.dimensions.corners,
                            right: { enabled, length: config.dimensions.corners?.right?.length ?? 500 },
                          }
                        })}
                      />
                    </div>
                    {config.dimensions.corners?.right?.enabled && (
                      <div className="space-y-2">
                        <DimensionInput
                          label={t('calc.cornerLengthRight')}
                          value={config.dimensions.corners.right.length}
                          onChange={(length) => setDimensions({
                            corners: {
                              ...config.dimensions.corners,
                              right: { ...config.dimensions.corners!.right!, length },
                            }
                          })}
                          min={200}
                          max={3000}
                          helperText="200 - 3000 mm"
                        />
                        <DimensionInput
                           label={t('calc.numberOfPanelsCorner')}
                          value={config.dimensions.corners.right.panelCount ?? 1}
                          onChange={(panelCount) => setDimensions({
                            corners: {
                              ...config.dimensions.corners,
                              right: { ...config.dimensions.corners!.right!, panelCount: Math.max(1, panelCount) },
                            }
                          })}
                          min={1}
                          max={5}
                          step={1}
                          unit={t("calc.pcs")}
                          helperText={t("calc.panelsRangeLabel")}
                        />
                        {(() => {
                          const pw = Math.round(config.dimensions.corners!.right!.length / (config.dimensions.corners!.right!.panelCount ?? 1));
                          return (
                            <p className="text-xs text-orange-600/70 dark:text-orange-400/60">
                              {t("calc.widthPerPanelLabel")} <span className={cn("font-medium", pw > 2000 && "text-orange-500")}>{pw} mm</span>
                            </p>
                          );
                        })()}

                        {/* Sub-corners for right corner */}
                        <div className="space-y-2 pt-2 border-t border-orange-200/30 dark:border-orange-800/20">
                          <p className="text-xs font-medium text-orange-600/70 dark:text-orange-400/60">{t('calc.subCornerContinuation', { side: t('calc.right').toLowerCase() })}</p>
                          
                          {/* Sub-corner right-left */}
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">{t('calc.toLeftLabel')}</Label>
                            <Switch
                              checked={config.dimensions.corners?.right?.subCorners?.left?.enabled ?? false}
                              onCheckedChange={(enabled) => setDimensions({
                                corners: {
                                  ...config.dimensions.corners,
                                  right: { ...config.dimensions.corners!.right!, subCorners: { ...config.dimensions.corners!.right!.subCorners, left: { enabled, length: config.dimensions.corners?.right?.subCorners?.left?.length ?? 500, panelCount: config.dimensions.corners?.right?.subCorners?.left?.panelCount ?? 1 } } },
                                }
                              })}
                            />
                          </div>
                          {config.dimensions.corners?.right?.subCorners?.left?.enabled && (
                            <div className="space-y-2 pl-2 border-l-2 border-orange-300/50">
                              <DimensionInput label={t("calc.lengthDimLabel")} value={config.dimensions.corners.right.subCorners.left.length} onChange={(length) => setDimensions({ corners: { ...config.dimensions.corners, right: { ...config.dimensions.corners!.right!, subCorners: { ...config.dimensions.corners!.right!.subCorners, left: { ...config.dimensions.corners!.right!.subCorners!.left!, length } } } } })} min={200} max={3000} helperText="200 - 3000 mm" />
                              <DimensionInput label={t("calc.panelCountDimLabel")} value={config.dimensions.corners.right.subCorners.left.panelCount ?? 1} onChange={(panelCount) => setDimensions({ corners: { ...config.dimensions.corners, right: { ...config.dimensions.corners!.right!, subCorners: { ...config.dimensions.corners!.right!.subCorners, left: { ...config.dimensions.corners!.right!.subCorners!.left!, panelCount: Math.max(1, panelCount) } } } } })} min={1} max={5} step={1} unit={t("calc.pcs")} />
                              {(() => { const pw = Math.round(config.dimensions.corners!.right!.subCorners!.left!.length / (config.dimensions.corners!.right!.subCorners!.left!.panelCount ?? 1)); return <p className="text-xs text-orange-600/50">{t("calc.widthPerPanelLabel")} <span className={cn("font-medium", pw > 2000 && "text-orange-500")}>{pw} mm</span></p>; })()}
                            </div>
                          )}

                          {/* Sub-corner right-right */}
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">{t('calc.toRightLabel')}</Label>
                            <Switch
                              checked={config.dimensions.corners?.right?.subCorners?.right?.enabled ?? false}
                              onCheckedChange={(enabled) => setDimensions({
                                corners: {
                                  ...config.dimensions.corners,
                                  right: { ...config.dimensions.corners!.right!, subCorners: { ...config.dimensions.corners!.right!.subCorners, right: { enabled, length: config.dimensions.corners?.right?.subCorners?.right?.length ?? 500, panelCount: config.dimensions.corners?.right?.subCorners?.right?.panelCount ?? 1 } } },
                                }
                              })}
                            />
                          </div>
                          {config.dimensions.corners?.right?.subCorners?.right?.enabled && (
                            <div className="space-y-2 pl-2 border-l-2 border-orange-300/50">
                              <DimensionInput label={t("calc.lengthDimLabel")} value={config.dimensions.corners.right.subCorners.right.length} onChange={(length) => setDimensions({ corners: { ...config.dimensions.corners, right: { ...config.dimensions.corners!.right!, subCorners: { ...config.dimensions.corners!.right!.subCorners, right: { ...config.dimensions.corners!.right!.subCorners!.right!, length } } } } })} min={200} max={3000} helperText="200 - 3000 mm" />
                              <DimensionInput label={t("calc.panelCountDimLabel")} value={config.dimensions.corners.right.subCorners.right.panelCount ?? 1} onChange={(panelCount) => setDimensions({ corners: { ...config.dimensions.corners, right: { ...config.dimensions.corners!.right!, subCorners: { ...config.dimensions.corners!.right!.subCorners, right: { ...config.dimensions.corners!.right!.subCorners!.right!, panelCount: Math.max(1, panelCount) } } } } })} min={1} max={5} step={1} unit={t("calc.pcs")} />
                              {(() => { const pw = Math.round(config.dimensions.corners!.right!.subCorners!.right!.length / (config.dimensions.corners!.right!.subCorners!.right!.panelCount ?? 1)); return <p className="text-xs text-orange-600/50">{t("calc.widthPerPanelLabel")} <span className={cn("font-medium", pw > 2000 && "text-orange-500")}>{pw} mm</span></p>; })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Corner connector selector */}
                {(config.dimensions.corners?.left?.enabled || config.dimensions.corners?.right?.enabled) && (
                  <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                    <Label className="text-sm font-medium">{t('calc.cornerConnectorLabel')}</Label>
                    <AccessoryPresetManager
                      productType="balustrade"
                      category="corner_connector"
                      selectedCode={config.dimensions.cornerConnector?.materialCode}
                      onSelect={(code) => setDimensions({
                        cornerConnector: {
                          materialCode: code || undefined,
                          quantity: config.dimensions.cornerConnector?.quantity ?? 1,
                        }
                      })}
                    />
                    <CatalogProductSelector
                      category="corner_connector"
                      label={t('calc.selectConnector')}
                      productType="balustrade"
                      multiple
                      values={config.dimensions.cornerConnector?.materialCodes || (config.dimensions.cornerConnector?.materialCode ? [config.dimensions.cornerConnector.materialCode] : [])}
                      onAddValue={(code) => {
                        const current = config.dimensions.cornerConnector?.materialCodes || (config.dimensions.cornerConnector?.materialCode ? [config.dimensions.cornerConnector.materialCode] : []);
                        setDimensions({
                          cornerConnector: {
                            materialCode: current[0] || code,
                            materialCodes: [...current, code],
                            quantity: config.dimensions.cornerConnector?.quantity ?? 1,
                          }
                        });
                      }}
                      onRemoveValue={(code) => {
                        const current = config.dimensions.cornerConnector?.materialCodes || [];
                        const updated = current.filter(c => c !== code);
                        setDimensions({
                          cornerConnector: {
                            materialCode: updated[0] || undefined,
                            materialCodes: updated,
                            quantity: config.dimensions.cornerConnector?.quantity ?? 1,
                          }
                        });
                      }}
                      className="mt-2"
                    />
                    <DimensionInput
                      label={t("calc.quantityDimLabel")}
                      value={config.dimensions.cornerConnector?.quantity ?? 1}
                      onChange={(quantity) => setDimensions({
                        cornerConnector: {
                          ...config.dimensions.cornerConnector,
                          materialCode: config.dimensions.cornerConnector?.materialCode,
                          quantity: Math.max(1, quantity),
                        }
                      })}
                      min={1}
                      max={20}
                      step={1}
                      unit={t("calc.pcs")}
                    />
                  </div>
                )}
              </>
            )}
            
            {config.placement === 'stairs' && stairsConfig && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('calc.stairsConfigTitle')}
                </h4>
                
                <DimensionInput
                  label={t('calc.stepCount')}
                  value={stairsConfig.stepCount}
                  onChange={(stepCount) => setDimensions({ 
                    stairsConfig: { ...stairsConfig, stepCount } 
                  })}
                  min={3}
                  max={30}
                  step={1}
                  unit={t("calc.pcs")}
                  helperText={t("calc.stepsRangeLabel")}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <DimensionInput
                    label={t('calc.stepHeight')}
                    value={stairsConfig.stepHeight}
                    onChange={(stepHeight) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, stepHeight } 
                    })}
                    min={100}
                    max={250}
                    helperText={t("calc.standardStepHeight")}
                  />
                  
                  <DimensionInput
                    label={t('calc.stepDepth')}
                    value={stairsConfig.stepDepth}
                    onChange={(stepDepth) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, stepDepth } 
                    })}
                    min={200}
                    max={400}
                    helperText={t("calc.standardStepDepth")}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <DimensionInput
                    label={t('calc.balustradeHeightMin')}
                    value={stairsConfig.heightMin}
                    onChange={(heightMin) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, heightMin } 
                    })}
                    min={700}
                    max={1200}
                    helperText={t('calc.atBottom')}
                  />
                  
                  <DimensionInput
                    label={t('calc.balustradeHeightMax')}
                    value={stairsConfig.heightMax}
                    onChange={(heightMax) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, heightMax } 
                    })}
                    min={800}
                    max={1500}
                    helperText={t('calc.atTop')}
                  />
                </div>
                
                <div className="space-y-2">
                   <Label>{t('calc.mountPosition')}</Label>
                   <div className="grid grid-cols-2 gap-2">
                     {[
                       { id: 'tread' as const, label: t('calc.onTread'), description: t('calc.onTreadDesc') },
                       { id: 'side' as const, label: t('calc.onSide'), description: t('calc.onSideDesc') },
                    ].map((option) => (
                      <Card
                        key={option.id}
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:border-primary/50",
                          stairsConfig.mountPosition === option.id && "border-primary bg-primary/5 ring-1 ring-primary"
                        )}
                        onClick={() => setDimensions({ 
                          stairsConfig: { ...stairsConfig, mountPosition: option.id } 
                        })}
                      >
                        <h5 className="font-medium text-sm">{option.label}</h5>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Intermediate Landing Configuration */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                       <Label className="text-sm font-medium">{t('calc.intermediateLanding')}</Label>
                       <p className="text-xs text-muted-foreground">{t('calc.intermediateLandingDesc')}</p>
                    </div>
                    <Switch
                      checked={stairsConfig.hasIntermediateLanding}
                      onCheckedChange={(hasIntermediateLanding) => setDimensions({ 
                        stairsConfig: { ...stairsConfig, hasIntermediateLanding } 
                      })}
                    />
                  </div>
                  
                  {stairsConfig.hasIntermediateLanding && (
                    <div className="space-y-3 p-3 bg-background rounded-lg border">
                      <div className="grid grid-cols-2 gap-3">
                        <DimensionInput
                          label={t('calc.landingLength')}
                          value={stairsConfig.landingLength}
                          onChange={(landingLength) => setDimensions({ 
                            stairsConfig: { ...stairsConfig, landingLength } 
                          })}
                          min={500}
                          max={2000}
                          helperText="500 - 2000 mm"
                        />
                        
                        <DimensionInput
                          label={t('calc.afterStep')}
                          value={stairsConfig.landingPosition}
                          onChange={(landingPosition) => setDimensions({ 
                            stairsConfig: { 
                              ...stairsConfig, 
                              landingPosition: Math.min(Math.max(2, landingPosition), stairsConfig.stepCount - 2) 
                            } 
                          })}
                          min={2}
                          max={stairsConfig.stepCount - 2}
                          step={1}
                          unit={t("calc.pcs")}
                          helperText={`2 - ${stairsConfig.stepCount - 2} ${t("calc.stepsUnitLabel")}`}
                        />
                      </div>
                      <DimensionInput
                        label={t('calc.landingPanelHeight')}
                        value={stairsConfig.intermediateLandingPanelHeight ?? 1000}
                        onChange={(intermediateLandingPanelHeight) => setDimensions({ 
                          stairsConfig: { ...stairsConfig, intermediateLandingPanelHeight } 
                        })}
                        min={700}
                        max={1500}
                        helperText="700 - 1500 mm"
                      />
                      <DimensionInput
                        label={t('calc.landingMountPoints')}
                        value={stairsConfig.intermediateLandingMountCount ?? 3}
                        onChange={(intermediateLandingMountCount) => setDimensions({ 
                          stairsConfig: { ...stairsConfig, intermediateLandingMountCount } 
                        })}
                        min={2}
                        max={8}
                        step={1}
                        unit={t("calc.pcs")}
                        helperText={t("calc.mountPointsRangeLabel")}
                      />
                    </div>
                  )}
                </div>
                
                {/* Panel Configuration per Ramp */}
                <div className="space-y-3 pt-3 border-t">
                  <h5 className="text-sm font-medium text-muted-foreground">{t('calc.panelsPerRamp')}</h5>
                  {stairsConfig.hasIntermediateLanding ? (
                    <div className="grid grid-cols-2 gap-3">
                      <DimensionInput
                        label={t('calc.panelsRamp1')}
                        value={stairsConfig.ramp1PanelCount ?? 2}
                        onChange={(ramp1PanelCount) => setDimensions({ 
                          stairsConfig: { ...stairsConfig, ramp1PanelCount: Math.max(1, ramp1PanelCount) } 
                        })}
                        min={1}
                        max={10}
                        step={1}
                        unit={t("calc.pcs")}
                        helperText={t('calc.beforeLanding')}
                      />
                      <DimensionInput
                        label={t('calc.panelsRamp2')}
                        value={stairsConfig.ramp2PanelCount ?? 2}
                        onChange={(ramp2PanelCount) => setDimensions({ 
                          stairsConfig: { ...stairsConfig, ramp2PanelCount: Math.max(1, ramp2PanelCount) } 
                        })}
                        min={1}
                        max={10}
                        step={1}
                        unit={t("calc.pcs")}
                        helperText={t('calc.afterLanding')}
                      />
                    </div>
                  ) : (
                    <DimensionInput
                     label={t('calc.numberOfPanelsCorner')}
                      value={config.dimensions.panelCount}
                      onChange={(panelCount) => setDimensions({ panelCount: Math.max(1, panelCount) })}
                      min={1}
                      max={15}
                      step={1}
                      unit={t("calc.pcs")}
                      helperText={t('calc.allAlongLength')}
                    />
                  )}
                </div>
                
                {/* Stair Panel Height Configuration */}
                <div className="space-y-3 pt-3 border-t">
                  <h5 className="text-sm font-medium text-muted-foreground">{t('calc.panelHeightsLabel')}</h5>
                  <DimensionInput
                    label={t('calc.stairPanelHeightLabel')}
                    value={stairsConfig.stairPanelHeight ?? 1000}
                    onChange={(stairPanelHeight) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, stairPanelHeight } 
                    })}
                    min={700}
                    max={1500}
                    helperText={t('calc.stairPanelHeightHelper')}
                  />
                </div>
                
                {/* Final Landing Configuration */}
                <div className="space-y-3 pt-3 border-t">
                  <DimensionInput
                    label={t('calc.finalLandingLengthLabel')}
                    value={stairsConfig.finalLandingLength}
                    onChange={(finalLandingLength) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, finalLandingLength } 
                    })}
                    min={500}
                    max={3000}
                    helperText="500 - 3000 mm"
                  />
                  <DimensionInput
                    label={t('calc.finalLandingHeightLabel')}
                    value={stairsConfig.finalLandingPanelHeight ?? 1000}
                    onChange={(finalLandingPanelHeight) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, finalLandingPanelHeight } 
                    })}
                    min={700}
                    max={1500}
                    helperText="700 - 1500 mm"
                  />
                  <DimensionInput
                    label={t('calc.finalLandingMountsLabel')}
                    value={stairsConfig.finalLandingMountCount ?? 3}
                    onChange={(finalLandingMountCount) => setDimensions({ 
                      stairsConfig: { ...stairsConfig, finalLandingMountCount } 
                    })}
                    min={2}
                    max={8}
                    step={1}
                    unit={t("calc.pcs")}
                    helperText={t("calc.mountPointsRangeLabel")}
                  />
                </div>
                
                <div className="p-3 bg-background rounded-lg border text-sm space-y-1">
                  <p className="font-medium text-muted-foreground mb-2">{t('calc.autoCalcs')}</p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">{t('calc.projectedLength')}:</span>
                    <span className="font-medium">
                      {stairsConfig.hasIntermediateLanding 
                        ? `${projectedLength + stairsConfig.landingLength} mm (${projectedLength} + ${stairsConfig.landingLength})` 
                        : `${projectedLength} mm (${stairsConfig.stepCount} × ${stairsConfig.stepDepth})`
                      }
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">{t('calc.totalRiseLabel')}:</span>
                    <span className="font-medium">{totalRise} mm ({stairsConfig.stepCount} × {stairsConfig.stepHeight})</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">{t('calc.inclinationAngle')}:</span>
                    <span className="font-medium">{stairsConfig.angle}°</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">{t('calc.inclinedLengthLabel')}:</span>
                    <span className="font-medium">{inclinedLength} mm</span>
                  </p>
                </div>
              </div>
            )}
            {config.placement === 'stairs' && (
              <>
                <DimensionInput
                  label={t("calc.numberOfPanelsStairs")}
                  value={config.dimensions.panelCount}
                  onChange={(panelCount) => setDimensions({ panelCount })}
                  min={1}
                  max={20}
                  step={1}
                  unit={t("calc.pcs")}
                  helperText={t("calc.recommendedMaxWidth")}
                />
                {(() => {
                  const panelWidth = Math.round(config.dimensions.length / config.dimensions.panelCount);
                  return (
                    <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">{t("calc.widthPerPanelLabel")}</span>
                        <span className={cn("font-medium", panelWidth > 2000 && "text-orange-500")}>
                          {panelWidth} mm
                        </span>
                      </p>
                      {panelWidth > 2000 && (
                        <p className="text-orange-500 text-xs">
                          ⚠️ {t("calc.widthExceedsStairs")}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <GlassModelSelector
              items={pricingItems}
              currentThickness={config.glass.thickness}
              currentType={config.glass.type}
              allowedThicknesses={[8, 10, 12]}
              productType="balustrade"
              onChange={(model) => setGlass({ thickness: model.thickness as 8 | 10 | 12, type: model.type as any, colorHex: model.colorHex })}
            />
            {config.placement === 'interior' && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>{t('calc.laminatedGlass')}</Label>
                  <p className="text-xs text-muted-foreground">{t('calc.mandatoryExterior')}</p>
                </div>
                <Switch
                  checked={config.glass.laminated}
                  onCheckedChange={(laminated) => setGlass({ laminated })}
                />
              </div>
            )}
            <EdgeTypeSelector
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            {config.mountOptions.pointMount && config.accessories.mountPoints && (
              <Card className="p-4">
                <Label className="text-sm font-medium">{t('calc.mountPoints')}</Label>
                <AccessoryPresetManager
                  productType="balustrade"
                  category="mount_point"
                  selectedCode={config.accessories.mountPoints?.materialCode}
                  onSelect={(code) => setAccessories({ mountPoints: { ...config.accessories.mountPoints!, materialCode: code || undefined } })}
                />
                <CatalogProductSelector
                  category="mount_point"
                   label={t('calc.chooseProduct')}
                  multiple
                  values={config.accessories.mountPoints?.materialCodes || (config.accessories.mountPoints?.materialCode ? [config.accessories.mountPoints.materialCode] : [])}
                  onAddValue={(code) => {
                    const current = config.accessories.mountPoints?.materialCodes || (config.accessories.mountPoints?.materialCode ? [config.accessories.mountPoints.materialCode] : []);
                    setAccessories({ mountPoints: { ...config.accessories.mountPoints!, materialCode: current[0] || code, materialCodes: [...current, code] } });
                  }}
                  onRemoveValue={(code) => {
                    const current = config.accessories.mountPoints?.materialCodes || [];
                    const updated = current.filter(c => c !== code);
                    setAccessories({ mountPoints: { ...config.accessories.mountPoints!, materialCode: updated[0] || undefined, materialCodes: updated } });
                  }}
                  productType="balustrade"
                  className="mt-2"
                />
                <div className="mt-3 space-y-3">
                  {/* Spacing control - only for non-stairs */}
                  {config.placement !== 'stairs' && (
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.mountSpacing')}</Label>
                      <Select
                        value={(config.accessories.mountPoints.spacing ?? 300).toString()}
                        onValueChange={(spacing) => {
                          const spacingNum = parseInt(spacing);
                          const newQuantity = Math.ceil(config.dimensions.length / spacingNum);
                          setAccessories({ 
                            mountPoints: { 
                              ...config.accessories.mountPoints!, 
                              spacing: spacingNum,
                              quantity: newQuantity 
                            } 
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="200">200 mm</SelectItem>
                          <SelectItem value="250">250 mm</SelectItem>
                          <SelectItem value="300">300 mm (standard)</SelectItem>
                          <SelectItem value="350">350 mm</SelectItem>
                          <SelectItem value="400">400 mm</SelectItem>
                          <SelectItem value="500">500 mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('calc.calcQuantity')}:</span>
                    <span className="font-medium">{config.accessories.mountPoints.quantity} {t('common.pieces')}</span>
                  </div>
                  <FinishSelector
                    label={t('calc.finishLabel')}
                    materialCode={MOUNT_POINT_CODES.sb45_90}
                    value={config.accessories.mountPoints.finish}
                    onValueChange={(finish) => 
                      setAccessories({ mountPoints: { ...config.accessories.mountPoints!, finish: finish as FinishType } })
                    }
                  />
                </div>
              </Card>
            )}
            {config.mountOptions.handrail && config.accessories.handrail && (
              <Card className="p-4">
                <Label className="text-sm font-medium">{t('calc.handrail')}</Label>
                <AccessoryPresetManager
                  productType="balustrade"
                  category="handrail"
                  selectedCode={config.accessories.handrail?.materialCode}
                  onSelect={(code) => setAccessories({ handrail: { ...config.accessories.handrail!, materialCode: code || undefined } })}
                />
                <CatalogProductSelector
                  category="handrail"
                  label={t('calc.chooseProduct')}
                  multiple
                  values={config.accessories.handrail?.materialCodes || (config.accessories.handrail?.materialCode ? [config.accessories.handrail.materialCode] : [])}
                  onAddValue={(code) => {
                    const current = config.accessories.handrail?.materialCodes || (config.accessories.handrail?.materialCode ? [config.accessories.handrail.materialCode] : []);
                    setAccessories({ handrail: { ...config.accessories.handrail!, materialCode: current[0] || code, materialCodes: [...current, code] } });
                  }}
                  onRemoveValue={(code) => {
                    const current = config.accessories.handrail?.materialCodes || [];
                    const updated = current.filter(c => c !== code);
                    setAccessories({ handrail: { ...config.accessories.handrail!, materialCode: updated[0] || undefined, materialCodes: updated } });
                  }}
                  productType="balustrade"
                  className="mt-2"
                />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('calc.diameter')}</Label>
                    <Select
                      value={config.accessories.handrail.diameter.toString()}
                      onValueChange={(d) => 
                        setAccessories({ handrail: { ...config.accessories.handrail!, diameter: parseInt(d) as 42 | 50 } })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="42">Ø42 mm</SelectItem>
                        <SelectItem value="50">Ø50 mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FinishSelector
                    label={t('calc.finishLabel')}
                    materialCode={getHandrailMaterialCode(config.accessories.handrail.diameter)}
                    value={config.accessories.handrail.finish}
                    onValueChange={(finish) => 
                      setAccessories({ handrail: { ...config.accessories.handrail!, finish: finish as FinishType } })
                    }
                  />
                </div>
              </Card>
            )}

            <EdgePolishingOption
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
              glassPieces={(() => {
                const pieces: GlassPiece[] = [];
                const panelW = config.dimensions.length / config.dimensions.panelCount;
                pieces.push({ name: t('calc.frontPanelsLabel'), width: panelW, height: config.dimensions.height, quantity: config.dimensions.panelCount });
                const corners = config.dimensions.corners;
                if (corners?.left?.enabled && corners.left.length > 0) {
                  pieces.push({ name: t('calc.cornerLeft'), width: corners.left.length, height: config.dimensions.height, quantity: 1 });
                  const subL = corners.left.subCorners;
                  if (subL?.left?.enabled && subL.left.length > 0) pieces.push({ name: `${t('calc.subCornerContinuation', { side: t('calc.left') })} - ${t('calc.left')}`, width: subL.left.length, height: config.dimensions.height, quantity: 1 });
                  if (subL?.right?.enabled && subL.right.length > 0) pieces.push({ name: `${t('calc.subCornerContinuation', { side: t('calc.left') })} - ${t('calc.right')}`, width: subL.right.length, height: config.dimensions.height, quantity: 1 });
                }
                if (corners?.right?.enabled && corners.right.length > 0) {
                  pieces.push({ name: t('calc.cornerRight'), width: corners.right.length, height: config.dimensions.height, quantity: 1 });
                  const subR = corners.right.subCorners;
                  if (subR?.left?.enabled && subR.left.length > 0) pieces.push({ name: `${t('calc.subCornerContinuation', { side: t('calc.right') })} - ${t('calc.left')}`, width: subR.left.length, height: config.dimensions.height, quantity: 1 });
                  if (subR?.right?.enabled && subR.right.length > 0) pieces.push({ name: `${t('calc.subCornerContinuation', { side: t('calc.right') })} - ${t('calc.right')}`, width: subR.right.length, height: config.dimensions.height, quantity: 1 });
                }
                return pieces;
              })()}
            />

            <ExtraAccessoriesSection
              extraAccessories={config.extraAccessories}
              onAdd={addExtraAccessory}
              onRemove={removeExtraAccessory}
              onUpdate={updateExtraAccessory}
              productType="balustrade"
              selectedKit={selectedKit}
              onSelectKit={setSelectedKit}
              onRemoveKit={removeSelectedKit}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const isOfferStep = currentStep === steps.length;

  const formSection = (
    <div className="h-full flex flex-col">
      <StepIndicator steps={steps} currentStep={currentStep} onStepClick={goToStep} />
      <div className="flex-1 overflow-auto">{renderStep()}</div>
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={prevStep}
        onNext={nextStep}
        canGoNext={canGoNext}
      />
    </div>
  );

  const viewerSection = (
    <SceneSetup cameraPosition={[4, 2, 4]} cameraFov={45}>
      <GlassColorContext.Provider value={config.glass.colorHex}>
        <BalustradeViewer3D config={config} />
      </GlassColorContext.Provider>
    </SceneSetup>
  );

  const showPriceSummary = isOfferStep;

  const summarySection = showPriceSummary ? (
    <div className="space-y-3">
      <ClientInfoFields
        clientName={clientName}
        clientPhone={clientPhone}
        clientEmail={clientEmail}
        onNameChange={setClientName}
        onPhoneChange={setClientPhone}
        onEmailChange={setClientEmail}
        clientType={clientType}
        onClientTypeChange={setClientType}
      />
      <PriceSummary 
        price={price} 
        markupPercent={markupPercent}
        customAmount={customAmount}
        customAmountNote={customAmountNote}
        onCustomAmountChange={setCustomAmount}
        onCustomAmountNoteChange={setCustomAmountNote}
      />
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={prevStep}
        onNext={nextStep}
        onSaveQuote={handleSaveQuote}
        onAddToOrder={handleAddToOrder}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  ) : null;

  return (
    <AppLayout title={t('calc.balustradeTitle')}>
      <CalculatorLayout
        title={t('calc.balustradeConfigurator')}
        subtitle={t('calc.balustradeSubtitle')}
        formSection={formSection}
        viewerSection={viewerSection}
        summarySection={summarySection}
        isOfferStep={isOfferStep}
      />
    </AppLayout>
  );
}

// Stairs Steps Component with optional intermediate landing
function StairsSteps({ 
  angle, 
  stepCount,
  stepDepth,
  stepHeight,
  hasIntermediateLanding,
  landingLength,
  landingPosition,
  finalLandingLength
}: { 
  angle: number; 
  stepCount: number;
  stepDepth: number;
  stepHeight: number;
  hasIntermediateLanding: boolean;
  landingLength: number;
  landingPosition: number;
  finalLandingLength: number;
}) {
  const stepWidth = 1.2; // 1200mm wide steps
  
  // Split steps into before and after landing
  const stepsBeforeLanding = hasIntermediateLanding ? landingPosition : stepCount;
  const stepsAfterLanding = hasIntermediateLanding ? stepCount - landingPosition : 0;
  
  // Landing dimensions (already in meters)
  const landingLengthM = landingLength;
  const finalLandingLengthM = finalLandingLength;
  const landingY = stepsBeforeLanding * stepHeight; // Height at landing
  const landingX = stepsBeforeLanding * stepDepth; // X position of landing start
  
  // Calculate total length for positioning
  const totalLength = hasIntermediateLanding
    ? stepsBeforeLanding * stepDepth + landingLengthM + stepsAfterLanding * stepDepth + finalLandingLengthM
    : stepCount * stepDepth + finalLandingLengthM;
  
  return (
    <group position={[-totalLength / 2 + finalLandingLengthM / 2, 0, 0]}>
      {/* Steps before landing */}
      {Array.from({ length: stepsBeforeLanding }).map((_, i) => {
        const xPos = i * stepDepth + stepDepth / 2;
        const yPos = i * stepHeight + stepHeight / 2;
        
        return (
          <group key={`before-${i}`}>
            {/* Step tread (horizontal surface) */}
            <mesh position={[xPos, yPos, 0]} castShadow receiveShadow>
              <boxGeometry args={[stepDepth, 0.04, stepWidth]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {/* Step riser (vertical surface) */}
            <mesh position={[xPos - stepDepth / 2 + 0.02, yPos - stepHeight / 2, 0]} castShadow>
              <boxGeometry args={[0.04, stepHeight, stepWidth]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          </group>
        );
      })}
      
      {/* Intermediate landing - positioned at the top of the last step before landing */}
      {hasIntermediateLanding && (
        <mesh position={[landingX + landingLengthM / 2, landingY - stepHeight + 0.02, 0]} receiveShadow castShadow>
          <boxGeometry args={[landingLengthM, 0.04, stepWidth]} />
          <meshStandardMaterial color="#b8c5d4" />
        </mesh>
      )}
      
      {/* Steps after landing */}
      {hasIntermediateLanding && Array.from({ length: stepsAfterLanding }).map((_, i) => {
        const xOffset = landingX + landingLengthM; // Start after landing
        const xPos = xOffset + i * stepDepth + stepDepth / 2;
        const yPos = landingY + (i + 1) * stepHeight + stepHeight / 2;
        
        return (
          <group key={`after-${i}`}>
            {/* Step tread (horizontal surface) */}
            <mesh position={[xPos, yPos, 0]} castShadow receiveShadow>
              <boxGeometry args={[stepDepth, 0.04, stepWidth]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {/* Step riser (vertical surface) */}
            <mesh position={[xPos - stepDepth / 2 + 0.02, yPos - stepHeight / 2, 0]} castShadow>
              <boxGeometry args={[0.04, stepHeight, stepWidth]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          </group>
        );
      })}
      
      {/* Bottom landing */}
      <mesh position={[-0.4, -0.02, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.04, stepWidth + 0.2]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      
      {/* Top/Final landing with configurable length */}
      {(() => {
        const totalXLength = hasIntermediateLanding 
          ? landingX + landingLengthM + stepsAfterLanding * stepDepth 
          : stepCount * stepDepth;
        // Final landing is at the same level as the top of the last step (stepCount - 1 steps up)
        const totalY = (stepCount - 1) * stepHeight + stepHeight;
        return (
          <mesh position={[totalXLength + finalLandingLengthM / 2, totalY - stepHeight + 0.02, 0]} receiveShadow>
            <boxGeometry args={[finalLandingLengthM, 0.04, stepWidth + 0.2]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        );
      })()}
    </group>
  );
}

// 3D Viewer Component
function BalustradeViewer3D({ config }: { config: ReturnType<typeof useBalustradeCalculator>['config'] }) {
  const SCALE = 0.001;
  const isStairs = config.placement === 'stairs' && config.dimensions.stairsConfig;
  const uProfileFinish = config.accessories.uProfile?.finish || 'anodized_silver';
  const stairsConfig = config.dimensions.stairsConfig;
  
  // Landing configuration
  const hasIntermediateLanding = stairsConfig?.hasIntermediateLanding ?? false;
  const landingLength = stairsConfig?.landingLength ?? 1000;
  const landingPosition = stairsConfig?.landingPosition ?? 5;
  const finalLandingLength = stairsConfig?.finalLandingLength ?? 800;
  const landingLengthM = landingLength * SCALE;
  
  // Calculate dimensions based on placement type
  const angle = isStairs && stairsConfig ? stairsConfig.angle : 0;
  const angleRad = angle * Math.PI / 180;
  
  // Total horizontal length including landing
  const stepsLength = config.dimensions.length * SCALE;
  const baseLength = hasIntermediateLanding ? stepsLength + landingLengthM : stepsLength;
  
  // For stairs: panels are placed along the horizontal projection
  // Each panel covers a portion of the horizontal length
  const panelWidth = baseLength / config.dimensions.panelCount;
  const glassThickness = config.glass.thickness * SCALE;
  
  // Heights for stairs (variable) or standard (uniform)
  const heightMin = isStairs && stairsConfig ? stairsConfig.heightMin * SCALE : config.dimensions.height * SCALE;
  const heightMax = isStairs && stairsConfig ? stairsConfig.heightMax * SCALE : config.dimensions.height * SCALE;
  const avgHeight = (heightMin + heightMax) / 2;

  // Calculate number of steps based on length and standard step depth
  const stepCount = isStairs ? Math.round(baseLength / 0.28) : 0;

  // Panel heights for different sections
  const getStairPanelHeight = () => {
    return (stairsConfig?.stairPanelHeight ?? config.dimensions.height) * SCALE;
  };
  
  const getIntermediateLandingPanelHeight = () => {
    return (stairsConfig?.intermediateLandingPanelHeight ?? config.dimensions.height) * SCALE;
  };
  
  const getFinalLandingPanelHeight = () => {
    return (stairsConfig?.finalLandingPanelHeight ?? config.dimensions.height) * SCALE;
  };
  
  // Legacy function for non-stairs panels
  const getPanelHeight = () => {
    return config.dimensions.height * SCALE;
  };

  // Calculate the vertical rise of the staircase
  const stairsRise = isStairs ? baseLength * Math.tan(angleRad) : 0;

  // For non-stairs, use the old inclined length calculation for accessories
  const inclinedLength = isStairs ? baseLength / Math.cos(angleRad) : baseLength;

  return (
    <group position={isStairs ? [-baseLength / 4, -stairsRise / 4, 0] : [0, 0, 0]}>
      {!isStairs && (
        <SimpleDimensionLines 
          widthMm={config.dimensions.length} 
          heightMm={config.dimensions.height} 
          yOffset={config.dimensions.height * 0.001 / 2}
        />
      )}
      {/* Stairs structure (only for stairs placement) */}
      {isStairs && stairsConfig && (
        <StairsSteps 
          angle={angleRad} 
          stepCount={stairsConfig.stepCount}
          stepDepth={stairsConfig.stepDepth * SCALE}
          stepHeight={stairsConfig.stepHeight * SCALE}
          hasIntermediateLanding={hasIntermediateLanding}
          landingLength={landingLengthM}
          landingPosition={landingPosition}
          finalLandingLength={finalLandingLength * SCALE}
        />
      )}

      {/* Floor for non-stairs */}
      {!isStairs && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[baseLength + 0.5, 1]} />
          <meshStandardMaterial color="#e2e8f0" opacity={0.5} transparent />
        </mesh>
      )}

      {/* Glass panels */}
      {isStairs && stairsConfig ? (
        // PARALLELOGRAM PANELS FOR STAIRS - Split into sections when intermediate landing exists
        // Positioned so glass is vertical (XY plane) with thickness on Z
        <group position={[-baseLength / 2, 0, 0]}>
          {(() => {
            const panelHeight = getStairPanelHeight();
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            
            if (hasIntermediateLanding) {
              // SPLIT INTO 3 SECTIONS when intermediate landing is active
              const stepsBeforeLanding = landingPosition;
              const stepsAfterLanding = stairsConfig.stepCount - landingPosition;
              
              // Calculate lengths for each section
              const lengthBeforeLanding = stepsBeforeLanding * stepDepth;
              const lengthAfterLanding = stepsAfterLanding * stepDepth;
              const totalStairLength = lengthBeforeLanding + lengthAfterLanding;
              
              // Use explicit panel counts from stairsConfig instead of proportional distribution
              const panelsBefore = stairsConfig.ramp1PanelCount ?? Math.max(1, Math.round(config.dimensions.panelCount * lengthBeforeLanding / totalStairLength));
              const panelsAfter = stairsConfig.ramp2PanelCount ?? Math.max(1, config.dimensions.panelCount - panelsBefore);
              
              // Panel widths for each section
              const panelWidthBefore = lengthBeforeLanding / panelsBefore;
              const panelWidthAfter = lengthAfterLanding / panelsAfter;
              
              // Landing positions
              const landingStartX = stepsBeforeLanding * stepDepth;
              const landingY = stepsBeforeLanding * stepHeight;
              const landingEndX = landingStartX + landingLengthM;
              
              return (
                <>
                  {/* SECTION 1: Slanted panels BEFORE intermediate landing */}
                  {Array.from({ length: panelsBefore }).map((_, i) => {
                    const xPos = i * panelWidthBefore + panelWidthBefore / 2;
                    const panelRise = (panelWidthBefore - 0.02) * Math.tan(angleRad);
                    const baseY = stepHeight + 0.02 + 0.15;
                    const yPos = baseY + i * panelRise;
                    
                    return (
                      <ParallelogramPanel
                        key={`before-${i}`}
                        width={panelWidthBefore - 0.02}
                        height={panelHeight}
                        thickness={glassThickness}
                        angle={angle}
                        position={[xPos, yPos, glassZPosition]}
                        glassType={config.glass.type}
                      />
                    );
                  })}
                  
                  {/* SECTION 2: Straight panel ON intermediate landing */}
                  {(() => {
                    const intermediatePanelHeight = getIntermediateLandingPanelHeight();
                    const landingCenterX = landingStartX + landingLengthM / 2;
                    
                    // Align with the top of the last panel before landing
                    const panelRiseBefore = (panelWidthBefore - 0.02) * Math.tan(angleRad);
                    const lastPanelBeforeBaseY = stepHeight + 0.02 + 0.15 + (panelsBefore - 1) * panelRiseBefore;
                    const lastPanelBeforeTopY = lastPanelBeforeBaseY + panelHeight + panelRiseBefore / 2;
                    
                    // Landing panel: left edge aligns with top-right of last stair panel
                    const panelY = lastPanelBeforeTopY - intermediatePanelHeight / 2;
                    
                    return (
                      <mesh
                        position={[landingCenterX, panelY, glassZPosition]}
                        castShadow
                      >
                        <boxGeometry args={[landingLengthM - 0.02, intermediatePanelHeight, glassThickness]} />
                        <GlassMaterial type={config.glass.type} />
                      </mesh>
                    );
                  })()}
                  
                  {/* SECTION 3: Slanted panels AFTER intermediate landing */}
                  {Array.from({ length: panelsAfter }).map((_, i) => {
                    // X position starts after the landing
                    const xPos = landingEndX + i * panelWidthAfter + panelWidthAfter / 2;
                    
                    // Calculate the rise for panels after landing
                    const panelRiseAfter = (panelWidthAfter - 0.02) * Math.tan(angleRad);
                    
                    // Get the TOP of the intermediate landing panel (calculated same as in SECTION 2)
                    const intermediatePanelHeight = getIntermediateLandingPanelHeight();
                    const panelRiseBefore = (panelWidthBefore - 0.02) * Math.tan(angleRad);
                    const lastPanelBeforeBaseY = stepHeight + 0.02 + 0.15 + (panelsBefore - 1) * panelRiseBefore;
                    const lastPanelBeforeTopY = lastPanelBeforeBaseY + panelHeight + panelRiseBefore / 2;
                    const intermediatePanelTopY = lastPanelBeforeTopY;
                    
                    // For parallelogram panel geometry: top-left Y = centerY + height - rise/2
                    // We want top-left of first ramp2 panel to align with top of landing panel
                    // So: centerY + height - rise/2 = intermediatePanelTopY
                    // centerY = intermediatePanelTopY - height + rise/2
                    const firstPanelCenterY = intermediatePanelTopY - panelHeight + panelRiseAfter / 2;
                    
                    // For panel i, the center Y position rises progressively
                    const yPos = firstPanelCenterY + i * panelRiseAfter;
                    
                    return (
                      <ParallelogramPanel
                        key={`after-${i}`}
                        width={panelWidthAfter - 0.02}
                        height={panelHeight}
                        thickness={glassThickness}
                        angle={angle}
                        position={[xPos, yPos, glassZPosition]}
                        glassType={config.glass.type}
                      />
                    );
                  })}
                </>
              );
            } else {
              // NO INTERMEDIATE LANDING - continuous panels
              return Array.from({ length: config.dimensions.panelCount }).map((_, i) => {
                const xPos = i * panelWidth + panelWidth / 2;
                const panelRise = (panelWidth - 0.02) * Math.tan(angleRad);
                const baseY = stepHeight + 0.02 + 0.15;
                const yPos = baseY + i * panelRise;
                
                return (
                  <ParallelogramPanel
                    key={i}
                    width={panelWidth - 0.02}
                    height={panelHeight}
                    thickness={glassThickness}
                    angle={angle}
                    position={[xPos, yPos, glassZPosition]}
                    glassType={config.glass.type}
                  />
                );
              });
            }
          })()}

          {/* STRAIGHT GLASS PANEL ON FINAL LANDING */}
          {(() => {
            const panelHeight = getFinalLandingPanelHeight();
            const stairPanelHeight = getStairPanelHeight();
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const finalLandingLengthM = finalLandingLength * SCALE;
            
            // Calculate where the stairs end (total X length of all steps + intermediate landing if any)
            const stepsBeforeLanding = hasIntermediateLanding ? landingPosition : stairsConfig.stepCount;
            const stepsAfterLanding = hasIntermediateLanding ? stairsConfig.stepCount - landingPosition : 0;
            
            const totalStepsX = hasIntermediateLanding
              ? stepsBeforeLanding * stepDepth + landingLengthM + stepsAfterLanding * stepDepth
              : stairsConfig.stepCount * stepDepth;
            
            // Calculate the position based on whether we have intermediate landing
            let lastPanelTopY: number;
            
            if (hasIntermediateLanding) {
              // Calculate based on the last panel of section 3 (after landing)
              // Use explicit panel counts from stairsConfig (same as in rendering)
              const lengthBeforeLanding = stepsBeforeLanding * stepDepth;
              const lengthAfterLanding = stepsAfterLanding * stepDepth;
              const totalStairLength = lengthBeforeLanding + lengthAfterLanding;
              const panelsBefore = stairsConfig.ramp1PanelCount ?? Math.max(1, Math.round(config.dimensions.panelCount * lengthBeforeLanding / totalStairLength));
              const panelsAfter = stairsConfig.ramp2PanelCount ?? Math.max(1, config.dimensions.panelCount - panelsBefore);
              const panelWidthAfter = lengthAfterLanding / panelsAfter;
              const panelWidthBefore = lengthBeforeLanding / panelsBefore;
              
              const landingY = landingPosition * stepHeight;
              const panelRiseBefore = (panelWidthBefore - 0.02) * Math.tan(angleRad);
              const panelRiseAfter = (panelWidthAfter - 0.02) * Math.tan(angleRad);
              
              // Replicate the exact calculation from the Ramp 2 panel rendering
              const baseYBefore = stepHeight + 0.02 + 0.15;
              const lastPanelBeforeIndex = panelsBefore - 1;
              const lastPanelBeforeBaseY = baseYBefore + lastPanelBeforeIndex * panelRiseBefore;
              const lastPanelBeforeTopY = lastPanelBeforeBaseY + stairPanelHeight + panelRiseBefore / 2;
              const intermediatePanelTopY = lastPanelBeforeTopY;
              
              // First Ramp 2 panel centerY (same formula as in rendering)
              const firstPanelCenterY = intermediatePanelTopY - stairPanelHeight + panelRiseAfter / 2;
              
              // Last Ramp 2 panel position
              const lastPanelIndex = panelsAfter - 1;
              const lastPanelCenterY = firstPanelCenterY + lastPanelIndex * panelRiseAfter;
              
              // Top-right of last parallelogram panel: centerY + height + rise/2
              lastPanelTopY = lastPanelCenterY + stairPanelHeight + panelRiseAfter / 2;
            } else {
              // Calculation for single ramp (no intermediate landing)
              // Use same baseY formula as in panel rendering for consistency
              const lastPanelIndex = config.dimensions.panelCount - 1;
              const panelRise = (panelWidth - 0.02) * Math.tan(angleRad);
              const baseY = stepHeight + 0.02 + 0.15;  // Same as panel rendering
              const lastPanelCenterY = baseY + lastPanelIndex * panelRise;
              lastPanelTopY = lastPanelCenterY + stairPanelHeight + panelRise / 2;
            }
            
            // Final landing panel: top-left corner should align with top-right of last stair panel
            // For box geometry, top = centerY + height/2
            // We want: centerY + height/2 = lastPanelTopY
            // Therefore: centerY = lastPanelTopY - height/2
            const panelY = lastPanelTopY - panelHeight / 2;
            
            // Final landing starts at the end of the last step
            const finalLandingCenterX = totalStepsX + finalLandingLengthM / 2;
            
            return (
              <mesh
                position={[finalLandingCenterX, panelY, glassZPosition]}
                castShadow
              >
                <boxGeometry args={[finalLandingLengthM - 0.02, panelHeight, glassThickness]} />
                <GlassMaterial type={config.glass.type} />
              </mesh>
            );
          })()}

          {/* Mount points for RAMP 1 (before intermediate landing) */}
          {config.mountOptions.pointMount && hasIntermediateLanding && stairsConfig && (() => {
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const zOffset = glassZPosition + glassThickness / 2 + 0.025;
            
            // One mount per step for steps 0 to landingPosition-1
            return Array.from({ length: landingPosition }).map((_, i) => {
              const xPos = i * stepDepth + stepDepth / 2;
              const yOnTread = (i + 1) * stepHeight + 0.02;
              
              return (
                <mesh key={`ramp1-mount-${i}`} position={[xPos, yOnTread + 0.025, zOffset]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                  <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                </mesh>
              );
            });
          })()}

          {/* Mount points for RAMP 2 (after intermediate landing) */}
          {config.mountOptions.pointMount && hasIntermediateLanding && stairsConfig && (() => {
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stepsAfterLanding = stairsConfig.stepCount - landingPosition;
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const zOffset = glassZPosition + glassThickness / 2 + 0.025;
            
            const landingEndX = landingPosition * stepDepth + landingLengthM;
            
            return Array.from({ length: stepsAfterLanding }).map((_, i) => {
              const xPos = landingEndX + i * stepDepth + stepDepth / 2;
              const stepIndex = landingPosition + i + 1;
              const yOnTread = stepIndex * stepHeight + 0.02;
              
              return (
                <mesh key={`ramp2-mount-${i}`} position={[xPos, yOnTread + 0.025, zOffset]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                  <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                </mesh>
              );
            });
          })()}

          {/* Mount points for stairs without intermediate landing - one per step */}
          {config.mountOptions.pointMount && !hasIntermediateLanding && stairsConfig && (() => {
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const zOffset = glassZPosition + glassThickness / 2 + 0.025;
            
            return Array.from({ length: stairsConfig.stepCount }).map((_, i) => {
              const xPos = i * stepDepth + stepDepth / 2;
              const yOnTread = (i + 1) * stepHeight + 0.02;
              
              return (
                <mesh key={`stair-mount-${i}`} position={[xPos, yOnTread + 0.025, zOffset]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                  <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                </mesh>
              );
            });
          })()}

          {/* Horizontal mount points for INTERMEDIATE LANDING */}
          {config.mountOptions.pointMount && hasIntermediateLanding && stairsConfig && (() => {
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const zOffset = glassZPosition + glassThickness / 2 + 0.025;
            
            const landingStartX = landingPosition * stepDepth;
            const landingY = landingPosition * stepHeight + stepHeight + 0.02;
            
            // Use configured mount count
            const mountCount = stairsConfig.intermediateLandingMountCount ?? 3;
            
            return Array.from({ length: mountCount }).map((_, i) => {
              const xPos = landingStartX + (i / (mountCount - 1)) * landingLengthM;
              
              return (
                <mesh 
                  key={`landing-mount-${i}`} 
                  position={[xPos, landingY + 0.025, zOffset]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                  <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                </mesh>
              );
            });
          })()}

          {/* Horizontal mount points for FINAL LANDING */}
          {config.mountOptions.pointMount && stairsConfig && (() => {
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const zOffset = glassZPosition + glassThickness / 2 + 0.025;
            const finalLandingLengthM = finalLandingLength * SCALE;
            
            // Calculate where the stairs end
            const stepsBeforeLanding = hasIntermediateLanding ? landingPosition : stairsConfig.stepCount;
            const stepsAfterLanding = hasIntermediateLanding ? stairsConfig.stepCount - landingPosition : 0;
            
            const totalStepsX = hasIntermediateLanding
              ? stepsBeforeLanding * stepDepth + landingLengthM + stepsAfterLanding * stepDepth
              : stairsConfig.stepCount * stepDepth;
            
            const finalLandingY = stairsConfig.stepCount * stepHeight + stepHeight + 0.02;
            
            // Use configured mount count
            const mountCount = stairsConfig.finalLandingMountCount ?? 3;
            
            return Array.from({ length: mountCount }).map((_, i) => {
              const xPos = totalStepsX + (i / (mountCount - 1)) * finalLandingLengthM;
              
              return (
                <mesh 
                  key={`final-mount-${i}`} 
                  position={[xPos, finalLandingY + 0.025, zOffset]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                  <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                </mesh>
              );
            });
          })()}

          {/* U Profile for stairs - at bottom of glass panels */}
          {config.mountOptions.uProfile && stairsConfig && (() => {
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const stairPanelHeight = getStairPanelHeight();
            const profileOffset = 0.025; // Offset below glass bottom
            
            // Base Y for first panel center (same as glass panel rendering)
            const baseY = stepHeight + 0.02 + 0.15;
            
            if (hasIntermediateLanding) {
              const panelsBefore = stairsConfig.ramp1PanelCount ?? Math.ceil(config.dimensions.panelCount / 2);
              const panelsAfter = stairsConfig.ramp2PanelCount ?? Math.floor(config.dimensions.panelCount / 2);
              const stepsAfterLanding = stairsConfig.stepCount - landingPosition;
              
              // Ramp 1 geometry
              const ramp1Length = landingPosition * stepDepth;
              const ramp1InclinedLength = ramp1Length / Math.cos(angleRad);
              const panelWidthBefore = ramp1Length / panelsBefore;
              const panelRiseBefore = (panelWidthBefore - 0.02) * Math.tan(angleRad);
              
              // First panel center Y on ramp 1
              const firstPanelCenterY = baseY;
              // Last panel center Y on ramp 1
              const lastPanelBeforeCenterY = baseY + (panelsBefore - 1) * panelRiseBefore;
              
              // Ramp center Y (average of first and last panel bottom-mid Y)
              const ramp1CenterY = (firstPanelCenterY + lastPanelBeforeCenterY) / 2;
              // Profile aligned to bottom of glass (slightly below)
              const ramp1ProfileCenterY = ramp1CenterY - profileOffset;
              
              // Ramp 2 geometry
              const ramp2Length = stepsAfterLanding * stepDepth;
              const ramp2InclinedLength = ramp2Length / Math.cos(angleRad);
              const panelWidthAfter = ramp2Length / panelsAfter;
              const panelRiseAfter = (panelWidthAfter - 0.02) * Math.tan(angleRad);
              
              const landingEndX = landingPosition * stepDepth + landingLengthM;
              const lastPanelBeforeTopY = lastPanelBeforeCenterY + stairPanelHeight + panelRiseBefore / 2;
              const intermediatePanelTopY = lastPanelBeforeTopY;
              
              // First Ramp 2 panel center
              const firstRamp2PanelCenterY = intermediatePanelTopY - stairPanelHeight + panelRiseAfter / 2;
              // Last Ramp 2 panel center
              const lastRamp2PanelCenterY = firstRamp2PanelCenterY + (panelsAfter - 1) * panelRiseAfter;
              
              // Ramp 2 center Y (average of first and last panel bottom-mid Y)
              const ramp2CenterY = (firstRamp2PanelCenterY + lastRamp2PanelCenterY) / 2;
              const ramp2ProfileCenterY = ramp2CenterY - profileOffset;
              
              // Intermediate landing profile
              const intermediatePanelHeight = getIntermediateLandingPanelHeight();
              const intermediateLandingProfileY = intermediatePanelTopY - intermediatePanelHeight - profileOffset;
              
              // Final landing profile
              const finalLandingLengthM = (stairsConfig.finalLandingLength ?? 800) * SCALE;
              const finalPanelHeight = getFinalLandingPanelHeight();
              const lastRamp2TopY = lastRamp2PanelCenterY + stairPanelHeight + panelRiseAfter / 2;
              const totalStepsX = landingPosition * stepDepth + landingLengthM + stepsAfterLanding * stepDepth;
              const finalLandingProfileY = lastRamp2TopY - finalPanelHeight - profileOffset;
              
              // Calculate connector positions for U-Profile
              // End of Ramp 1 (inclined)
              const ramp1EndX = ramp1Length;
              const ramp1EndY = ramp1ProfileCenterY + (ramp1Length / 2) * Math.tan(angleRad);
              
              // Start of Ramp 2 (inclined)
              const ramp2StartX = landingEndX;
              const ramp2StartY = ramp2ProfileCenterY - (ramp2Length / 2) * Math.tan(angleRad);
              
              // End of Ramp 2 (inclined)
              const ramp2EndX = landingEndX + ramp2Length;
              const ramp2EndY = ramp2ProfileCenterY + (ramp2Length / 2) * Math.tan(angleRad);
              
              return (
                <>
                  {/* Ramp 1 U-Profile */}
                  <mesh 
                    position={[ramp1Length / 2, ramp1ProfileCenterY, glassZPosition]}
                    rotation={[0, 0, angleRad]}
                  >
                    <boxGeometry args={[ramp1InclinedLength, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Connector: Ramp 1 → Intermediate Landing */}
                  <mesh position={[ramp1EndX, ramp1EndY, glassZPosition]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Intermediate Landing U-Profile */}
                  <mesh position={[landingPosition * stepDepth + landingLengthM / 2, intermediateLandingProfileY, glassZPosition]}>
                    <boxGeometry args={[landingLengthM, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Connector: Intermediate Landing → Ramp 2 */}
                  <mesh position={[ramp2StartX, ramp2StartY, glassZPosition]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Ramp 2 U-Profile */}
                  <mesh 
                    position={[landingEndX + ramp2Length / 2, ramp2ProfileCenterY, glassZPosition]}
                    rotation={[0, 0, angleRad]}
                  >
                    <boxGeometry args={[ramp2InclinedLength, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Connector: Ramp 2 → Final Landing */}
                  <mesh position={[ramp2EndX, ramp2EndY, glassZPosition]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Final Landing U-Profile */}
                  <mesh position={[totalStepsX + finalLandingLengthM / 2, finalLandingProfileY, glassZPosition]}>
                    <boxGeometry args={[finalLandingLengthM, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                </>
              );
            } else {
              // Single ramp - no intermediate landing
              const panelRise = (panelWidth - 0.02) * Math.tan(angleRad);
              const firstPanelCenterY = baseY;
              const lastPanelCenterY = baseY + (config.dimensions.panelCount - 1) * panelRise;
              
              // Ramp center Y (average of first and last panel bottom-mid Y)
              const rampCenterY = (firstPanelCenterY + lastPanelCenterY) / 2;
              // Profile at bottom of glass
              const profileCenterY = rampCenterY - profileOffset;
              
              // Final landing
              const finalLandingLengthM = (stairsConfig.finalLandingLength ?? 800) * SCALE;
              const finalPanelHeight = getFinalLandingPanelHeight();
              const lastPanelTopY = lastPanelCenterY + stairPanelHeight + panelRise / 2;
              const totalStepsX = stairsConfig.stepCount * stepDepth;
              const finalLandingProfileY = lastPanelTopY - finalPanelHeight - profileOffset;
              
              // Connector position: end of ramp
              const rampEndX = baseLength;
              const rampEndY = profileCenterY + (baseLength / 2) * Math.tan(angleRad);
              
              return (
                <>
                  <mesh 
                    position={[baseLength / 2, profileCenterY, glassZPosition]}
                    rotation={[0, 0, angleRad]}
                  >
                    <boxGeometry args={[inclinedLength, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Connector: Ramp → Final Landing */}
                  <mesh position={[rampEndX, rampEndY, glassZPosition]}>
                    <sphereGeometry args={[0.03, 16, 16]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                  
                  {/* Final Landing U-Profile */}
                  <mesh position={[totalStepsX + finalLandingLengthM / 2, finalLandingProfileY, glassZPosition]}>
                    <boxGeometry args={[finalLandingLengthM, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                </>
              );
            }
          })()}

          {/* Handrail for stairs - at top of glass panels */}
          {config.mountOptions.handrail && config.accessories.handrail && stairsConfig && (() => {
            const stepWidth = 1.2;
            const glassZPosition = stepWidth / 2 - 0.05;
            const stepDepth = stairsConfig.stepDepth * SCALE;
            const stepHeight = stairsConfig.stepHeight * SCALE;
            const handrailRadius = config.accessories.handrail.diameter * SCALE / 2;
            const stairPanelHeight = getStairPanelHeight();
            const handrailOffset = handrailRadius; // Offset above glass top
            
            // Base Y for first panel center (same as glass panel rendering)
            const baseY = stepHeight + 0.02 + 0.15;
            
            if (hasIntermediateLanding) {
              const panelsBefore = stairsConfig.ramp1PanelCount ?? Math.ceil(config.dimensions.panelCount / 2);
              const panelsAfter = stairsConfig.ramp2PanelCount ?? Math.floor(config.dimensions.panelCount / 2);
              const stepsAfterLanding = stairsConfig.stepCount - landingPosition;
              
              // Ramp 1 geometry
              const ramp1Length = landingPosition * stepDepth;
              const ramp1InclinedLength = ramp1Length / Math.cos(angleRad);
              const panelWidthBefore = ramp1Length / panelsBefore;
              const panelRiseBefore = (panelWidthBefore - 0.02) * Math.tan(angleRad);
              
              // First panel center Y on ramp 1
              const firstPanelCenterY = baseY;
              // Last panel center Y on ramp 1
              const lastPanelBeforeCenterY = baseY + (panelsBefore - 1) * panelRiseBefore;
              
              // Ramp center Y (average of first and last panel bottom-mid Y)
              const ramp1CenterY = (firstPanelCenterY + lastPanelBeforeCenterY) / 2;
              // NOTE: ParallelogramPanel position.y is the BOTTOM edge midpoint.
              // Handrail at top of glass = bottom-mid + full panel height + offset
              const ramp1HandrailCenterY = ramp1CenterY + stairPanelHeight + handrailOffset;
              
              // Ramp 2 geometry
              const ramp2Length = stepsAfterLanding * stepDepth;
              const ramp2InclinedLength = ramp2Length / Math.cos(angleRad);
              const panelWidthAfter = ramp2Length / panelsAfter;
              const panelRiseAfter = (panelWidthAfter - 0.02) * Math.tan(angleRad);
              
              const landingEndX = landingPosition * stepDepth + landingLengthM;
              const lastPanelBeforeTopY = lastPanelBeforeCenterY + stairPanelHeight + panelRiseBefore / 2;
              const intermediatePanelTopY = lastPanelBeforeTopY;
              
              // First Ramp 2 panel center
              const firstRamp2PanelCenterY = intermediatePanelTopY - stairPanelHeight + panelRiseAfter / 2;
              // Last Ramp 2 panel center
              const lastRamp2PanelCenterY = firstRamp2PanelCenterY + (panelsAfter - 1) * panelRiseAfter;
              
              // Ramp 2 center Y (average of first and last panel bottom-mid Y)
              const ramp2CenterY = (firstRamp2PanelCenterY + lastRamp2PanelCenterY) / 2;
              const ramp2HandrailCenterY = ramp2CenterY + stairPanelHeight + handrailOffset;
              
              // Intermediate landing handrail
              const intermediateLandingHandrailY = intermediatePanelTopY + handrailOffset;
              
              // Final landing handrail
              const finalLandingLengthM = (stairsConfig.finalLandingLength ?? 800) * SCALE;
              const lastRamp2TopY = lastRamp2PanelCenterY + stairPanelHeight + panelRiseAfter / 2;
              const totalStepsX = landingPosition * stepDepth + landingLengthM + stepsAfterLanding * stepDepth;
              const finalLandingHandrailY = lastRamp2TopY + handrailOffset;
              
              // Calculate connector positions for Handrail
              // End of Ramp 1 (inclined)
              const ramp1EndX = ramp1Length;
              const ramp1EndY = ramp1HandrailCenterY + (ramp1Length / 2) * Math.tan(angleRad);
              
              // Start of Ramp 2 (inclined)
              const ramp2StartX = landingEndX;
              const ramp2StartY = ramp2HandrailCenterY - (ramp2Length / 2) * Math.tan(angleRad);
              
              // End of Ramp 2 (inclined)
              const ramp2EndX = landingEndX + ramp2Length;
              const ramp2EndY = ramp2HandrailCenterY + (ramp2Length / 2) * Math.tan(angleRad);
              
              // Calculate start cap position for Ramp 1
              const ramp1StartX = 0;
              const ramp1StartY = ramp1HandrailCenterY - (ramp1Length / 2) * Math.tan(angleRad);
              
              // Calculate end cap position for Final Landing
              const finalLandingEndX = totalStepsX + finalLandingLengthM;
              
              return (
                <>
                  {/* START CAP - Beginning of Ramp 1 */}
                  <mesh position={[ramp1StartX, ramp1StartY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* Ramp 1 Handrail */}
                  <mesh 
                    position={[ramp1Length / 2, ramp1HandrailCenterY, glassZPosition]}
                    rotation={[0, 0, angleRad]}
                  >
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[handrailRadius, handrailRadius, ramp1InclinedLength, 16]} />
                      <MetalMaterial finish={config.accessories.handrail.finish} />
                    </mesh>
                  </mesh>
                  
                  {/* Connector: Ramp 1 → Intermediate Landing */}
                  <mesh position={[ramp1EndX, ramp1EndY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* Intermediate Landing Handrail */}
                  <mesh 
                    position={[landingPosition * stepDepth + landingLengthM / 2, intermediateLandingHandrailY, glassZPosition]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[handrailRadius, handrailRadius, landingLengthM, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* Connector: Intermediate Landing → Ramp 2 */}
                  <mesh position={[ramp2StartX, ramp2StartY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* Ramp 2 Handrail */}
                  <mesh 
                    position={[landingEndX + ramp2Length / 2, ramp2HandrailCenterY, glassZPosition]}
                    rotation={[0, 0, angleRad]}
                  >
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[handrailRadius, handrailRadius, ramp2InclinedLength, 16]} />
                      <MetalMaterial finish={config.accessories.handrail.finish} />
                    </mesh>
                  </mesh>
                  
                  {/* Connector: Ramp 2 → Final Landing */}
                  <mesh position={[ramp2EndX, ramp2EndY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* Final Landing Handrail */}
                  <mesh 
                    position={[totalStepsX + finalLandingLengthM / 2, finalLandingHandrailY, glassZPosition]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[handrailRadius, handrailRadius, finalLandingLengthM, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* END CAP - End of Final Landing */}
                  <mesh position={[finalLandingEndX, finalLandingHandrailY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                </>
              );
            } else {
              // Single ramp - no intermediate landing
              const panelRise = (panelWidth - 0.02) * Math.tan(angleRad);
              const firstPanelCenterY = baseY;
              const lastPanelCenterY = baseY + (config.dimensions.panelCount - 1) * panelRise;
              
              // Ramp center Y (average of first and last panel bottom-mid Y)
              const rampCenterY = (firstPanelCenterY + lastPanelCenterY) / 2;
              // Handrail at top of glass
              const handrailCenterY = rampCenterY + stairPanelHeight + handrailOffset;
              
              // Final landing
              const finalLandingLengthM = (stairsConfig.finalLandingLength ?? 800) * SCALE;
              const lastPanelTopY = lastPanelCenterY + stairPanelHeight + panelRise / 2;
              const totalStepsX = stairsConfig.stepCount * stepDepth;
              const finalLandingHandrailY = lastPanelTopY + handrailOffset;
              
              // Connector position: end of ramp
              const rampEndX = baseLength;
              const rampEndY = handrailCenterY + (baseLength / 2) * Math.tan(angleRad);
              
              // Calculate start cap position
              const rampStartX = 0;
              const rampStartY = handrailCenterY - (baseLength / 2) * Math.tan(angleRad);
              
              // Calculate end cap position for Final Landing
              const finalLandingEndX = totalStepsX + finalLandingLengthM;
              
              return (
                <>
                  {/* START CAP - Beginning of Ramp */}
                  <mesh position={[rampStartX, rampStartY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* Main Ramp Handrail */}
                  <mesh 
                    position={[baseLength / 2, handrailCenterY, glassZPosition]}
                    rotation={[0, 0, angleRad]}
                  >
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[handrailRadius, handrailRadius, inclinedLength, 16]} />
                      <MetalMaterial finish={config.accessories.handrail.finish} />
                    </mesh>
                  </mesh>
                  
                  {/* Connector: Ramp → Final Landing */}
                  <mesh position={[rampEndX, rampEndY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* Final Landing Handrail */}
                  <mesh 
                    position={[totalStepsX + finalLandingLengthM / 2, finalLandingHandrailY, glassZPosition]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[handrailRadius, handrailRadius, finalLandingLengthM, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                  
                  {/* END CAP - End of Final Landing */}
                  <mesh position={[finalLandingEndX, finalLandingHandrailY, glassZPosition]}>
                    <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                    <MetalMaterial finish={config.accessories.handrail.finish} />
                  </mesh>
                </>
              );
            }
          })()}
        </group>
      ) : (
        // RECTANGULAR PANELS FOR INTERIOR/EXTERIOR
        <group position={[0, avgHeight / 2, 0]}>
          {Array.from({ length: config.dimensions.panelCount }).map((_, i) => {
            const panelHeight = getPanelHeight();
            const xPos = i * panelWidth + panelWidth / 2 - baseLength / 2;
            
            return (
              <mesh
                key={i}
                position={[xPos, 0, 0]}
                castShadow
              >
                <boxGeometry args={[panelWidth - 0.02, panelHeight, glassThickness]} />
                <GlassMaterial type={config.glass.type} />
              </mesh>
            );
          })}

          {/* LEFT CORNER 90° EXTENSION */}
          {config.dimensions.corners?.left?.enabled && (() => {
            const cornerLength = config.dimensions.corners.left.length * SCALE;
            const cornerPanelCount = config.dimensions.corners.left.panelCount ?? 1;
            const cornerPanelWidth = cornerLength / cornerPanelCount;
            const panelHeight = getPanelHeight();
            return (
              <>
                {Array.from({ length: cornerPanelCount }).map((_, pi) => {
                  const zPos = -(pi * cornerPanelWidth + cornerPanelWidth / 2);
                  return (
                    <mesh
                      key={`lc-panel-${pi}`}
                      position={[-baseLength / 2, 0, zPos]}
                      rotation={[0, Math.PI / 2, 0]}
                      castShadow
                    >
                      <boxGeometry args={[cornerPanelWidth - 0.02, panelHeight, glassThickness]} />
                      <GlassMaterial type={config.glass.type} />
                    </mesh>
                  );
                })}
                {/* Left corner mount points */}
                {config.mountOptions.pointMount && (() => {
                  const spacing = (config.accessories.mountPoints?.spacing ?? 300) * SCALE;
                  const count = Math.max(1, Math.ceil(cornerLength / spacing));
                  return Array.from({ length: count }).map((_, j) => {
                    const zPos = -(spacing / 2 + j * spacing);
                    return (
                      <mesh key={`lc-mount-${j}`} position={[-baseLength / 2, -avgHeight / 2 + 0.1, zPos]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                        <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                      </mesh>
                    );
                  });
                })()}
                {/* Left corner U profile */}
                {config.mountOptions.uProfile && (
                  <mesh position={[-baseLength / 2, -avgHeight / 2 - 0.025, -cornerLength / 2]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[cornerLength, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                )}
                {/* Left corner handrail */}
                {config.mountOptions.handrail && config.accessories.handrail && (() => {
                  const handrailRadius = config.accessories.handrail.diameter * SCALE / 2;
                  const handrailY = avgHeight / 2 + 0.025;
                  return (
                    <>
                      <mesh position={[-baseLength / 2, handrailY, -cornerLength / 2]} rotation={[0, Math.PI / 2, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                          <cylinderGeometry args={[handrailRadius, handrailRadius, cornerLength, 16]} />
                          <MetalMaterial finish={config.accessories.handrail.finish} />
                        </mesh>
                      </mesh>
                      <mesh position={[-baseLength / 2, handrailY, -cornerLength]}>
                        <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                        <MetalMaterial finish={config.accessories.handrail.finish} />
                      </mesh>
                    </>
                  );
                })()}
              </>
            );
          })()}

          {/* LEFT CORNER SUB-CORNERS */}
          {config.dimensions.corners?.left?.enabled && (() => {
            const cornerLength = config.dimensions.corners.left.length * SCALE;
            const panelHeight = getPanelHeight();
            const subCorners = config.dimensions.corners.left.subCorners;
            const baseX = -baseLength / 2;
            const baseZ = -cornerLength;

            return (
              <>
                {/* Sub-corner left-left: extends in -X direction from end of left corner */}
                {subCorners?.left?.enabled && (() => {
                  const scLength = subCorners.left.length * SCALE;
                  const scPanelCount = subCorners.left.panelCount ?? 1;
                  const scPanelWidth = scLength / scPanelCount;
                  return (
                    <>
                      {Array.from({ length: scPanelCount }).map((_, pi) => {
                        const xPos = baseX - (pi * scPanelWidth + scPanelWidth / 2);
                        return (
                          <mesh key={`lc-sl-${pi}`} position={[xPos, 0, baseZ]} castShadow>
                            <boxGeometry args={[scPanelWidth - 0.02, panelHeight, glassThickness]} />
                            <GlassMaterial type={config.glass.type} />
                          </mesh>
                        );
                      })}
                      {config.mountOptions.pointMount && (() => {
                        const spacing = (config.accessories.mountPoints?.spacing ?? 300) * SCALE;
                        const count = Math.max(1, Math.ceil(scLength / spacing));
                        return Array.from({ length: count }).map((_, j) => (
                          <mesh key={`lc-sl-m-${j}`} position={[baseX - (spacing / 2 + j * spacing), -avgHeight / 2 + 0.1, baseZ]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                            <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                          </mesh>
                        ));
                      })()}
                      {config.mountOptions.uProfile && (
                        <mesh position={[baseX - scLength / 2, -avgHeight / 2 - 0.025, baseZ]}>
                          <boxGeometry args={[scLength, 0.05, 0.03]} />
                          <MetalMaterial finish={uProfileFinish} />
                        </mesh>
                      )}
                      {config.mountOptions.handrail && config.accessories.handrail && (() => {
                        const r = config.accessories.handrail.diameter * SCALE / 2;
                        const y = avgHeight / 2 + 0.025;
                        return (
                          <>
                            <mesh position={[baseX - scLength / 2, y, baseZ]} rotation={[0, 0, Math.PI / 2]}>
                              <cylinderGeometry args={[r, r, scLength, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                            <mesh position={[baseX - scLength, y, baseZ]}>
                              <sphereGeometry args={[r * 1.2, 16, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                          </>
                        );
                      })()}
                    </>
                  );
                })()}

                {/* Sub-corner left-right: extends in +X direction from end of left corner */}
                {subCorners?.right?.enabled && (() => {
                  const scLength = subCorners.right.length * SCALE;
                  const scPanelCount = subCorners.right.panelCount ?? 1;
                  const scPanelWidth = scLength / scPanelCount;
                  return (
                    <>
                      {Array.from({ length: scPanelCount }).map((_, pi) => {
                        const xPos = baseX + (pi * scPanelWidth + scPanelWidth / 2);
                        return (
                          <mesh key={`lc-sr-${pi}`} position={[xPos, 0, baseZ]} castShadow>
                            <boxGeometry args={[scPanelWidth - 0.02, panelHeight, glassThickness]} />
                            <GlassMaterial type={config.glass.type} />
                          </mesh>
                        );
                      })}
                      {config.mountOptions.pointMount && (() => {
                        const spacing = (config.accessories.mountPoints?.spacing ?? 300) * SCALE;
                        const count = Math.max(1, Math.ceil(scLength / spacing));
                        return Array.from({ length: count }).map((_, j) => (
                          <mesh key={`lc-sr-m-${j}`} position={[baseX + (spacing / 2 + j * spacing), -avgHeight / 2 + 0.1, baseZ]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                            <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                          </mesh>
                        ));
                      })()}
                      {config.mountOptions.uProfile && (
                        <mesh position={[baseX + scLength / 2, -avgHeight / 2 - 0.025, baseZ]}>
                          <boxGeometry args={[scLength, 0.05, 0.03]} />
                          <MetalMaterial finish={uProfileFinish} />
                        </mesh>
                      )}
                      {config.mountOptions.handrail && config.accessories.handrail && (() => {
                        const r = config.accessories.handrail.diameter * SCALE / 2;
                        const y = avgHeight / 2 + 0.025;
                        return (
                          <>
                            <mesh position={[baseX + scLength / 2, y, baseZ]} rotation={[0, 0, Math.PI / 2]}>
                              <cylinderGeometry args={[r, r, scLength, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                            <mesh position={[baseX + scLength, y, baseZ]}>
                              <sphereGeometry args={[r * 1.2, 16, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                          </>
                        );
                      })()}
                    </>
                  );
                })()}
              </>
            );
          })()}
          {/* RIGHT CORNER 90° EXTENSION */}
          {config.dimensions.corners?.right?.enabled && (() => {
            const cornerLength = config.dimensions.corners.right.length * SCALE;
            const cornerPanelCount = config.dimensions.corners.right.panelCount ?? 1;
            const cornerPanelWidth = cornerLength / cornerPanelCount;
            const panelHeight = getPanelHeight();
            return (
              <>
                {Array.from({ length: cornerPanelCount }).map((_, pi) => {
                  const zPos = -(pi * cornerPanelWidth + cornerPanelWidth / 2);
                  return (
                    <mesh
                      key={`rc-panel-${pi}`}
                      position={[baseLength / 2, 0, zPos]}
                      rotation={[0, Math.PI / 2, 0]}
                      castShadow
                    >
                      <boxGeometry args={[cornerPanelWidth - 0.02, panelHeight, glassThickness]} />
                      <GlassMaterial type={config.glass.type} />
                    </mesh>
                  );
                })}
                {/* Right corner mount points */}
                {config.mountOptions.pointMount && (() => {
                  const spacing = (config.accessories.mountPoints?.spacing ?? 300) * SCALE;
                  const count = Math.max(1, Math.ceil(cornerLength / spacing));
                  return Array.from({ length: count }).map((_, j) => {
                    const zPos = -(spacing / 2 + j * spacing);
                    return (
                      <mesh key={`rc-mount-${j}`} position={[baseLength / 2, -avgHeight / 2 + 0.1, zPos]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                        <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                      </mesh>
                    );
                  });
                })()}
                {/* Right corner U profile */}
                {config.mountOptions.uProfile && (
                  <mesh position={[baseLength / 2, -avgHeight / 2 - 0.025, -cornerLength / 2]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[cornerLength, 0.05, 0.03]} />
                    <MetalMaterial finish={uProfileFinish} />
                  </mesh>
                )}
                {/* Right corner handrail */}
                {config.mountOptions.handrail && config.accessories.handrail && (() => {
                  const handrailRadius = config.accessories.handrail.diameter * SCALE / 2;
                  const handrailY = avgHeight / 2 + 0.025;
                  return (
                    <>
                      <mesh position={[baseLength / 2, handrailY, -cornerLength / 2]} rotation={[0, Math.PI / 2, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                          <cylinderGeometry args={[handrailRadius, handrailRadius, cornerLength, 16]} />
                          <MetalMaterial finish={config.accessories.handrail.finish} />
                        </mesh>
                      </mesh>
                      <mesh position={[baseLength / 2, handrailY, -cornerLength]}>
                        <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                        <MetalMaterial finish={config.accessories.handrail.finish} />
                      </mesh>
                    </>
                  );
                })()}
              </>
            );
          })()}

          {/* RIGHT CORNER SUB-CORNERS */}
          {config.dimensions.corners?.right?.enabled && (() => {
            const cornerLength = config.dimensions.corners.right.length * SCALE;
            const panelHeight = getPanelHeight();
            const subCorners = config.dimensions.corners.right.subCorners;
            const baseX = baseLength / 2;
            const baseZ = -cornerLength;

            return (
              <>
                {/* Sub-corner right-left: extends in -X direction */}
                {subCorners?.left?.enabled && (() => {
                  const scLength = subCorners.left.length * SCALE;
                  const scPanelCount = subCorners.left.panelCount ?? 1;
                  const scPanelWidth = scLength / scPanelCount;
                  return (
                    <>
                      {Array.from({ length: scPanelCount }).map((_, pi) => {
                        const xPos = baseX - (pi * scPanelWidth + scPanelWidth / 2);
                        return (
                          <mesh key={`rc-sl-${pi}`} position={[xPos, 0, baseZ]} castShadow>
                            <boxGeometry args={[scPanelWidth - 0.02, panelHeight, glassThickness]} />
                            <GlassMaterial type={config.glass.type} />
                          </mesh>
                        );
                      })}
                      {config.mountOptions.pointMount && (() => {
                        const spacing = (config.accessories.mountPoints?.spacing ?? 300) * SCALE;
                        const count = Math.max(1, Math.ceil(scLength / spacing));
                        return Array.from({ length: count }).map((_, j) => (
                          <mesh key={`rc-sl-m-${j}`} position={[baseX - (spacing / 2 + j * spacing), -avgHeight / 2 + 0.1, baseZ]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                            <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                          </mesh>
                        ));
                      })()}
                      {config.mountOptions.uProfile && (
                        <mesh position={[baseX - scLength / 2, -avgHeight / 2 - 0.025, baseZ]}>
                          <boxGeometry args={[scLength, 0.05, 0.03]} />
                          <MetalMaterial finish={uProfileFinish} />
                        </mesh>
                      )}
                      {config.mountOptions.handrail && config.accessories.handrail && (() => {
                        const r = config.accessories.handrail.diameter * SCALE / 2;
                        const y = avgHeight / 2 + 0.025;
                        return (
                          <>
                            <mesh position={[baseX - scLength / 2, y, baseZ]} rotation={[0, 0, Math.PI / 2]}>
                              <cylinderGeometry args={[r, r, scLength, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                            <mesh position={[baseX - scLength, y, baseZ]}>
                              <sphereGeometry args={[r * 1.2, 16, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                          </>
                        );
                      })()}
                    </>
                  );
                })()}

                {/* Sub-corner right-right: extends in +X direction */}
                {subCorners?.right?.enabled && (() => {
                  const scLength = subCorners.right.length * SCALE;
                  const scPanelCount = subCorners.right.panelCount ?? 1;
                  const scPanelWidth = scLength / scPanelCount;
                  return (
                    <>
                      {Array.from({ length: scPanelCount }).map((_, pi) => {
                        const xPos = baseX + (pi * scPanelWidth + scPanelWidth / 2);
                        return (
                          <mesh key={`rc-sr-${pi}`} position={[xPos, 0, baseZ]} castShadow>
                            <boxGeometry args={[scPanelWidth - 0.02, panelHeight, glassThickness]} />
                            <GlassMaterial type={config.glass.type} />
                          </mesh>
                        );
                      })}
                      {config.mountOptions.pointMount && (() => {
                        const spacing = (config.accessories.mountPoints?.spacing ?? 300) * SCALE;
                        const count = Math.max(1, Math.ceil(scLength / spacing));
                        return Array.from({ length: count }).map((_, j) => (
                          <mesh key={`rc-sr-m-${j}`} position={[baseX + (spacing / 2 + j * spacing), -avgHeight / 2 + 0.1, baseZ]}>
                            <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                            <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                          </mesh>
                        ));
                      })()}
                      {config.mountOptions.uProfile && (
                        <mesh position={[baseX + scLength / 2, -avgHeight / 2 - 0.025, baseZ]}>
                          <boxGeometry args={[scLength, 0.05, 0.03]} />
                          <MetalMaterial finish={uProfileFinish} />
                        </mesh>
                      )}
                      {config.mountOptions.handrail && config.accessories.handrail && (() => {
                        const r = config.accessories.handrail.diameter * SCALE / 2;
                        const y = avgHeight / 2 + 0.025;
                        return (
                          <>
                            <mesh position={[baseX + scLength / 2, y, baseZ]} rotation={[0, 0, Math.PI / 2]}>
                              <cylinderGeometry args={[r, r, scLength, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                            <mesh position={[baseX + scLength, y, baseZ]}>
                              <sphereGeometry args={[r * 1.2, 16, 16]} />
                              <MetalMaterial finish={config.accessories.handrail.finish} />
                            </mesh>
                          </>
                        );
                      })()}
                    </>
                  );
                })()}
              </>
            );
          })()}

          {/* DIMENSION LABELS FOR CORNERS */}
          {config.dimensions.corners?.left?.enabled && (() => {
            const cornerLength = config.dimensions.corners.left.length * SCALE;
            const GAP = 0.12;
            const h = avgHeight;
            // Left corner dimension along Z at left edge
            return (
              <DimensionLabel
                start={[-baseLength / 2 - GAP * 1.2, -h / 2 - GAP, 0]}
                end={[-baseLength / 2 - GAP * 1.2, -h / 2 - GAP, -cornerLength]}
                value={config.dimensions.corners.left.length}
                offset={[0, -1, 0]}
              />
            );
          })()}
          {config.dimensions.corners?.left?.subCorners?.left?.enabled && (() => {
            const cornerLength = config.dimensions.corners!.left!.length * SCALE;
            const scLength = config.dimensions.corners!.left!.subCorners!.left!.length * SCALE;
            const GAP = 0.12;
            const h = avgHeight;
            const baseX = -baseLength / 2;
            const baseZ = -cornerLength;
            return (
              <DimensionLabel
                start={[baseX, -h / 2 - GAP, baseZ]}
                end={[baseX - scLength, -h / 2 - GAP, baseZ]}
                value={config.dimensions.corners!.left!.subCorners!.left!.length}
                offset={[0, -1, 0]}
              />
            );
          })()}
          {config.dimensions.corners?.left?.subCorners?.right?.enabled && (() => {
            const cornerLength = config.dimensions.corners!.left!.length * SCALE;
            const scLength = config.dimensions.corners!.left!.subCorners!.right!.length * SCALE;
            const GAP = 0.12;
            const h = avgHeight;
            const baseX = -baseLength / 2;
            const baseZ = -cornerLength;
            return (
              <DimensionLabel
                start={[baseX, -h / 2 - GAP, baseZ]}
                end={[baseX + scLength, -h / 2 - GAP, baseZ]}
                value={config.dimensions.corners!.left!.subCorners!.right!.length}
                offset={[0, -1, 0]}
              />
            );
          })()}
          {config.dimensions.corners?.right?.enabled && (() => {
            const cornerLength = config.dimensions.corners.right.length * SCALE;
            const GAP = 0.12;
            const h = avgHeight;
            return (
              <DimensionLabel
                start={[baseLength / 2 + GAP * 1.2, -h / 2 - GAP, 0]}
                end={[baseLength / 2 + GAP * 1.2, -h / 2 - GAP, -cornerLength]}
                value={config.dimensions.corners.right.length}
                offset={[0, -1, 0]}
              />
            );
          })()}
          {config.dimensions.corners?.right?.subCorners?.left?.enabled && (() => {
            const cornerLength = config.dimensions.corners!.right!.length * SCALE;
            const scLength = config.dimensions.corners!.right!.subCorners!.left!.length * SCALE;
            const GAP = 0.12;
            const h = avgHeight;
            const baseX = baseLength / 2;
            const baseZ = -cornerLength;
            return (
              <DimensionLabel
                start={[baseX, -h / 2 - GAP, baseZ]}
                end={[baseX - scLength, -h / 2 - GAP, baseZ]}
                value={config.dimensions.corners!.right!.subCorners!.left!.length}
                offset={[0, -1, 0]}
              />
            );
          })()}
          {config.dimensions.corners?.right?.subCorners?.right?.enabled && (() => {
            const cornerLength = config.dimensions.corners!.right!.length * SCALE;
            const scLength = config.dimensions.corners!.right!.subCorners!.right!.length * SCALE;
            const GAP = 0.12;
            const h = avgHeight;
            const baseX = baseLength / 2;
            const baseZ = -cornerLength;
            return (
              <DimensionLabel
                start={[baseX, -h / 2 - GAP, baseZ]}
                end={[baseX + scLength, -h / 2 - GAP, baseZ]}
                value={config.dimensions.corners!.right!.subCorners!.right!.length}
                offset={[0, -1, 0]}
              />
            );
          })()}

          {config.mountOptions.pointMount && (() => {
            const spacing = (config.accessories.mountPoints?.spacing ?? 300) * SCALE;
            const mountCount = Math.ceil(baseLength / spacing);
            
            return Array.from({ length: mountCount }).map((_, i) => {
              const xPos = (spacing / 2) + i * spacing - baseLength / 2;
              
              return (
                <mesh key={i} position={[xPos, -avgHeight / 2 + 0.1, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
                  <MetalMaterial finish={config.accessories.mountPoints?.finish || 'polished_stainless'} />
                </mesh>
              );
            });
          })()}

          {/* U Profile for non-stairs */}
          {config.mountOptions.uProfile && (
            <mesh position={[0, -avgHeight / 2 - 0.025, 0]}>
              <boxGeometry args={[baseLength, 0.05, 0.03]} />
              <MetalMaterial finish={uProfileFinish} />
            </mesh>
          )}

          {/* Handrail for non-stairs */}
          {config.mountOptions.handrail && config.accessories.handrail && (() => {
            const handrailRadius = config.accessories.handrail.diameter * SCALE / 2;
            const handrailY = avgHeight / 2 + 0.025;
            return (
              <>
                {/* START CAP - Left end */}
                <mesh position={[-baseLength / 2, handrailY, config.dimensions.corners?.left?.enabled ? -(config.dimensions.corners.left.length * SCALE) : 0]}>
                  <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                  <MetalMaterial finish={config.accessories.handrail.finish} />
                </mesh>
                
                {/* Main Handrail */}
                <mesh position={[0, handrailY, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[handrailRadius, handrailRadius, baseLength, 16]} />
                  <MetalMaterial finish={config.accessories.handrail.finish} />
                </mesh>
                
                {/* END CAP - Right end */}
                <mesh position={[baseLength / 2, handrailY, config.dimensions.corners?.right?.enabled ? -(config.dimensions.corners.right.length * SCALE) : 0]}>
                  <sphereGeometry args={[handrailRadius * 1.2, 16, 16]} />
                  <MetalMaterial finish={config.accessories.handrail.finish} />
                </mesh>
              </>
            );
          })()}
        </group>
      )}
    </group>
  );
}
