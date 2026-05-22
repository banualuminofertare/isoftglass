import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalculatorLayout } from '@/components/calculators/shared/CalculatorLayout';
import { StepIndicator } from '@/components/calculators/shared/StepIndicator';
import { NavigationButtons } from '@/components/calculators/shared/NavigationButtons';
import { PriceSummary } from '@/components/calculators/shared/PriceSummary';
import { ClientInfoFields } from '@/components/calculators/shared/ClientInfoFields';
import { DimensionInput } from '@/components/calculators/shared/DimensionInput';
import { SceneSetup } from '@/components/3d/helpers/SceneSetup';
import { SimpleDimensionLines } from '@/components/3d/annotations/SimpleDimensionLines';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoorCalculator } from '@/hooks/calculators/useDoorCalculator';
import { useQuotePDF } from '@/hooks/calculators/useQuotePDF';
import { useQuoteSave } from '@/hooks/useQuoteSave';
import { useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { useToast } from '@/hooks/use-toast';
import { useClientTypePricing } from '@/hooks/useClientTypePricing';
import type { ClientType } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { DoorOpen, RotateCw, ArrowLeftRight, Frame, Square, ArrowLeft, ArrowRight, Plus, X, Scissors } from 'lucide-react';
import { ExtraAccessoriesSection } from '@/components/calculators/shared/ExtraAccessoriesSection';
import { EdgePolishingOption, type GlassPiece } from '@/components/calculators/shared/EdgePolishingOption';
import { EdgeTypeSelector } from '@/components/calculators/shared/EdgeTypeSelector';

import { CatalogProductSelector } from '@/components/calculators/shared/CatalogProductSelector';
import { AccessoryPresetManager } from '@/components/calculators/shared/AccessoryPresetManager';
import { GlassModelSelector } from '@/components/calculators/shared/GlassModelSelector';
import { GlassMaterial, GlassColorContext } from '@/components/3d/materials/GlassMaterial';
import { MetalMaterial } from '@/components/3d/materials/MetalMaterial';
import { HingeCutout } from '@/components/3d/geometry/HingeCutout';
import { HandleMesh } from '@/components/3d/geometry/HandleMesh';
import { useProcessingLookup } from '@/hooks/useProcessingTemplates';
import type { DoorType, FrameType, FinishType, EdgeCutout } from '@/types/calculators';
import { Button } from '@/components/ui/button';
import { useEditQuote } from '@/hooks/useEditQuote';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function DoorConfigurator() {
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
    setDoorType, setFrameType, setDimensions, setGlass, setAccessories, setEdgePolish,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    addLateralSeal, removeLateralSeal, updateLateralSeal,
    addCutout, updateCutout, removeCutout,
    selectedKit, setSelectedKit, removeSelectedKit,
    reset,
    loadConfig,
    pricingItems,
  } = useDoorCalculator();

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

  const doorTypeLabels: Record<string, string> = { hinged: t('calc.doorTypeHingedLabel'), pivot: t('calc.doorTypePivotLabel'), sliding: t('calc.doorTypeSlidingLabel') };
  const frameTypeLabels: Record<string, string> = { none: t('calc.frameNoneLabel'), aluminum: t('calc.frameAluminumLabel'), wood: t('calc.frameWoodLabel') };
  const glassLabels: Record<string, string> = { clear: t('calc.glassClearLabel'), frosted: t('calc.glassFrostedLabel'), frosted_cutout: t('calc.glassFrostedCutoutLabel'), patterned: t('calc.glassPatternedLabel') };

  const handleSaveQuote = async () => {
    const success = await saveQuote({
      productType: 'door',
      productLabel: t('calc.doorGlassLabel'),
      getConfigDetails: () => [
        { label: t('calc.doorTypeLabel'), value: doorTypeLabels[config.doorType] || config.doorType },
        { label: t('calc.frameLabel'), value: frameTypeLabels[config.frameType] || config.frameType },
        { label: t('calc.dimensionsLabel'), value: `${config.dimensions.width} × ${config.dimensions.height} mm` },
        { label: t('calc.glassLabel'), value: `${config.glass.thickness}mm, ${glassLabels[config.glass.type] || config.glass.type}` },
        { label: t('calc.handleLabelShort'), value: `${config.accessories.handle.model}, ${config.accessories.handle.length}mm` },
        { label: t('calc.lockLabelShort'), value: config.accessories.lock.enabled ? config.accessories.lock.type : t('calc.withoutLabel') },
      ],
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

  const { handleDownloadPDF } = useQuotePDF({
    productType: 'Usa-Sticla',
    productLabel: t('calc.doorGlassLabel'),
    price,
    clientName,
    clientPhone,
    clientEmail,
    customAmount,
    markupPercent,
    getConfigDetails: () => [
      { label: t('calc.doorTypeLabel'), value: doorTypeLabels[config.doorType] || config.doorType },
      { label: t('calc.frameLabel'), value: frameTypeLabels[config.frameType] || config.frameType },
      { label: t('calc.dimensionsLabel'), value: `${config.dimensions.width} × ${config.dimensions.height} mm` },
      { label: t('calc.glassLabel'), value: `${config.glass.thickness}mm, ${glassLabels[config.glass.type] || config.glass.type}` },
      { label: t('calc.handleLabelShort'), value: `${config.accessories.handle.model}, ${config.accessories.handle.length}mm` },
      { label: t('calc.lockLabelShort'), value: config.accessories.lock.enabled ? config.accessories.lock.type : t('calc.withoutLabel') },
    ],
  });

  const handleAddToOrder = async () => {
    setIsAddingToOrder(true);
    const success = await addItem({
      productType: 'door',
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
            {[
              { id: 'hinged' as DoorType, label: t('calc.withHinges'), description: t('calc.classicOpening'), icon: DoorOpen },
              { id: 'pivot' as DoorType, label: t('calc.withPivot'), description: t('calc.pivotSystem'), icon: RotateCw },
              { id: 'sliding' as DoorType, label: t('calc.slidingDoor'), description: t('calc.onRail'), icon: ArrowLeftRight },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = config.doorType === option.id;
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}
                  onClick={() => setDoorType(option.id)}
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
        );
      case 2:
        return (
          <div className="space-y-4">
             <DimensionInput
              label={t('calc.width')}
              value={config.dimensions.width}
              onChange={(width) => setDimensions({ width })}
              min={600}
              max={1200}
              helperText="600 - 1200 mm"
            />
            <DimensionInput
              label={t('calc.height')}
              value={config.dimensions.height}
              onChange={(height) => setDimensions({ height })}
              min={1800}
              max={2500}
              helperText="1800 - 2500 mm"
            />
            {config.doorType === 'sliding' && (
              <DimensionInput
                label={t('calc.openingWidth')}
                value={config.dimensions.openingWidth || config.dimensions.width * 2}
                onChange={(openingWidth) => setDimensions({ openingWidth })}
                min={config.dimensions.width}
                max={3000}
              />
            )}
            
            {/* Frame Type Selection */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-medium">{t('calc.doorFrame')}</Label>
              {[
                { id: 'none' as FrameType, label: t('calc.noFrame'), description: t('calc.directMount'), icon: Square },
                { id: 'aluminum' as FrameType, label: t('calc.aluminumFrame'), description: t('calc.aluminumProfile'), icon: Frame },
                { id: 'wood' as FrameType, label: t('calc.woodFrame'), description: t('calc.woodSolid'), icon: Frame },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = config.frameType === option.id;
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:border-primary/50",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                    onClick={() => setFrameType(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{option.label}</h4>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <GlassModelSelector
              items={pricingItems}
              currentThickness={config.glass.thickness}
              currentType={config.glass.type}
              allowedThicknesses={[8, 10]}
              productType="door"
              onChange={(model) => setGlass({ thickness: model.thickness as 8 | 10, type: model.type as any, colorHex: model.colorHex })}
            />
            <EdgeTypeSelector
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <Label className="text-sm font-medium">{t('calc.handle')}</Label>
              <AccessoryPresetManager
                productType="door"
                category="handle"
                selectedCode={config.accessories.handle.materialCode}
                onSelect={(code) => setAccessories({ handle: { ...config.accessories.handle, materialCode: code || undefined } })}
              />
              <CatalogProductSelector
                category="handle"
                value={config.accessories.handle.materialCode}
                onValueChange={(code) => setAccessories({ handle: { ...config.accessories.handle, materialCode: code || undefined } })}
                 label={t('calc.selectHandleCatalog')}
                placeholder={t('calc.genericNoCode')}
                productType="door"
                className="mt-2"
              />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('calc.handleModel')}</Label>
                    <Select
                      value={config.accessories.handle.model}
                      onValueChange={(model) => setAccessories({ handle: { ...config.accessories.handle, model } })}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">{t('calc.handleFormBar')}</SelectItem>
                        <SelectItem value="round">{t('calc.handleFormRound')}</SelectItem>
                        <SelectItem value="square">{t('calc.handleFormSquare')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('calc.handleLength')}</Label>
                    <Select
                      value={config.accessories.handle.length.toString()}
                      onValueChange={(len) => setAccessories({ handle: { ...config.accessories.handle, length: parseInt(len) } })}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[200, 300, 400, 500, 600].map((l) => (
                          <SelectItem key={l} value={l.toString()}>{l} mm</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Handle position */}
                <div className="mt-3">
                  <DimensionInput
                    label={t('calc.handlePositionLabel')}
                    value={config.accessories.handle.positionY ?? Math.round(config.dimensions.height / 2)}
                    onChange={(val) => setAccessories({ handle: { ...config.accessories.handle, positionY: val } })}
                    min={100}
                    max={config.dimensions.height - 100}
                    step={10}
                  />
                </div>
              </Card>

            {config.doorType === 'hinged' && (
              <Card className="p-4">
                <Label className="text-sm font-medium">{t('calc.hinges')}</Label>
                <AccessoryPresetManager
                  productType="door"
                  category="hinge"
                  selectedCode={config.accessories.hinges?.materialCode}
                  onSelect={(code) => setAccessories({ hinges: { ...config.accessories.hinges!, materialCode: code || undefined } })}
                />
                <CatalogProductSelector
                  category="hinge"
                  value={config.accessories.hinges?.materialCode}
                  onValueChange={(code) => setAccessories({ hinges: { ...config.accessories.hinges!, materialCode: code || undefined } })}
                   label={t('calc.selectHingeCatalog')}
                   placeholder={t('calc.genericNoCode')}
                  productType="door"
                  className="mt-2"
                />
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">{t('calc.hingeQuantity')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[2, 3].map((qty) => (
                      <Card
                        key={qty}
                        className={`p-3 cursor-pointer text-center transition-colors ${
                          config.accessories.hinges?.quantity === qty
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setAccessories({ hinges: { ...config.accessories.hinges!, quantity: qty } })}
                      >
                        <span className="text-sm font-medium">{t('calc.hingeCountLabel', { count: qty })}</span>
                      </Card>
                    ))}
                  </div>
                </div>
                {/* Hinge positions */}
                {config.accessories.hinges && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('calc.hingePositionsLabel')}</Label>
                    {(config.accessories.hinges.positions || []).map((pos, idx) => (
                      <DimensionInput
                        key={idx}
                        label={`${t('calc.hingeN', { n: idx + 1 })} ${idx === 0 ? t('calc.hingeTop') : idx === (config.accessories.hinges!.positions?.length ?? 0) - 1 ? t('calc.hingeBottom') : t('calc.hingeMiddle')}`}
                        value={pos}
                        onChange={(val) => {
                          const newPositions = [...(config.accessories.hinges!.positions || [])];
                          newPositions[idx] = val;
                          setAccessories({ hinges: { ...config.accessories.hinges!, positions: newPositions } });
                        }}
                        min={100}
                        max={config.dimensions.height - 100}
                        step={10}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                 <Label className="text-sm font-medium">{t('calc.lock')}</Label>
                   <p className="text-xs text-muted-foreground">{t('calc.lockWithKey')}</p>
                </div>
                <Switch
                  checked={config.accessories.lock.enabled}
                  onCheckedChange={(enabled) => setAccessories({ lock: { ...config.accessories.lock, enabled } })}
                />
              </div>
              {config.accessories.lock.enabled && (
                <div className="mt-3">
                  <AccessoryPresetManager
                    productType="door"
                    category="lock"
                    selectedCode={config.accessories.lock.materialCode}
                    onSelect={(code) => setAccessories({ lock: { ...config.accessories.lock, materialCode: code || undefined } })}
                  />
                  <CatalogProductSelector
                    category="lock"
                    value={config.accessories.lock.materialCode}
                    onValueChange={(code) => setAccessories({ lock: { ...config.accessories.lock, materialCode: code || undefined } })}
                     label={t('calc.selectLockCatalog')}
                    placeholder={t('calc.genericNoCode')}
                    productType="door"
                  />
                  {!config.accessories.lock.materialCode && (
                    <Select
                      value={config.accessories.lock.type}
                      onValueChange={(type: 'central_strike' | 'corner_lock' | 'lock_counterlock') => setAccessories({ lock: { ...config.accessories.lock, type } })}
                    >
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="central_strike">{t('calc.centralStrike')}</SelectItem>
                        <SelectItem value="corner_lock">{t('calc.cornerLock')}</SelectItem>
                        <SelectItem value="lock_counterlock">{t('calc.lockCounterlock')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <Label className="text-sm font-medium">{t('calc.sealProfiles2')}</Label>

              {/* Lateral seals section */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('calc.lateralSeals')}</span>
                  <Switch
                    checked={config.accessories.seals.lateral}
                    onCheckedChange={(lateral) => setAccessories({ seals: { ...config.accessories.seals, lateral } })}
                  />
                </div>
                {config.accessories.seals.lateral && (
                  <div className="ml-2 space-y-2">
                    <CatalogProductSelector
                      category="profile_seal"
                      value={config.accessories.seals.lateralMaterialCode}
                      onValueChange={(code) => setAccessories({ seals: { ...config.accessories.seals, lateralMaterialCode: code || undefined } })}
                       label={t('calc.lateralSealCatalog')}
                      placeholder={t('calc.genericNoCode')}
                      productType="door"
                    />
                    {/* Additional lateral seals */}
                    {(config.accessories.seals.lateralSelections || []).map((sel, idx) => (
                      <div key={idx} className="relative">
                        <CatalogProductSelector
                          category="profile_seal"
                          value={sel.materialCode}
                          onValueChange={(code) => {
                            if (!code) { removeLateralSeal(idx); return; }
                            const item = pricingItems?.find(p => p.code === code);
                            if (item) updateLateralSeal(idx, { materialCode: code, name: item.name, unitPrice: item.price });
                          }}
                           label={t('calc.extraSealN', { n: idx + 1 })}
                          placeholder={t('calc.genericNoCode')}
                          productType="door"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 text-destructive hover:text-destructive/80 z-10"
                          onClick={() => removeLateralSeal(idx)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <CatalogProductSelector
                      category="profile_seal"
                      value=""
                      onValueChange={(code) => {
                        if (!code) return;
                        const item = pricingItems?.find(p => p.code === code);
                        if (item) addLateralSeal({ materialCode: code, name: item.name, unitPrice: item.price });
                      }}
                      label=""
                      placeholder={t('calc.addExtraSealPlaceholder')}
                      productType="door"
                    />
                  </div>
                )}
              </div>

              {/* Threshold seal section */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('calc.thresholdSealLabel')}</span>
                  <Switch
                    checked={config.accessories.seals.threshold}
                    onCheckedChange={(threshold) => setAccessories({ seals: { ...config.accessories.seals, threshold } })}
                  />
                </div>
                {config.accessories.seals.threshold && (
                  <div className="ml-2">
                    <CatalogProductSelector
                      category="profile_seal"
                      value={config.accessories.seals.thresholdMaterialCode}
                      onValueChange={(code) => setAccessories({ seals: { ...config.accessories.seals, thresholdMaterialCode: code || undefined } })}
                       label={t('calc.thresholdSealCatalog')}
                      placeholder={t('calc.genericNoCode')}
                      productType="door"
                    />
                  </div>
                )}
              </div>
            </Card>

            {config.doorType === 'sliding' && (
              <Card className="p-4">
                <Label className="text-sm font-medium">{t('calc.slidingSystemLabel')}</Label>
                <AccessoryPresetManager
                  productType="door"
                  category="sliding_system"
                  selectedCode={config.accessories.slidingSystem?.materialCode}
                  onSelect={(code) => setAccessories({ slidingSystem: { ...config.accessories.slidingSystem!, materialCode: code || undefined } })}
                />
                <CatalogProductSelector
                  category="sliding_system"
                  value={config.accessories.slidingSystem?.materialCode}
                  onValueChange={(code) => setAccessories({ slidingSystem: { ...config.accessories.slidingSystem!, materialCode: code || undefined } })}
                   label={t('calc.selectSystemCatalog')}
                  placeholder={t('calc.genericNoCode')}
                  productType="door"
                  className="mt-2"
                />
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">{t('calc.openingDirectionLabel')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                       { id: 'left' as const, label: t('calc.left'), icon: ArrowLeft },
                      { id: 'right' as const, label: t('calc.right'), icon: ArrowRight },
                    ]).map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = (config.accessories.slidingSystem?.slidingDirection ?? 'right') === opt.id;
                      return (
                        <Card
                          key={opt.id}
                          className={cn(
                            "p-3 cursor-pointer text-center transition-colors flex items-center justify-center gap-2",
                            isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50"
                          )}
                          onClick={() => setAccessories({ slidingSystem: { ...config.accessories.slidingSystem!, slidingDirection: opt.id } })}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            <EdgePolishingOption
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
              glassPieces={[{
                name: t('calc.doorGlassLabel'),
                width: config.dimensions.width - 11,
                height: config.dimensions.height - 18,
                quantity: 1,
              }]}
            />

            <ExtraAccessoriesSection
              extraAccessories={config.extraAccessories}
              onAdd={addExtraAccessory}
              onRemove={removeExtraAccessory}
              onUpdate={updateExtraAccessory}
              productType="door"
              selectedKit={selectedKit}
              onSelectKit={setSelectedKit}
              onRemoveKit={removeSelectedKit}
            />
        </div>
      );
    case 5:
      const sideLabels: Record<EdgeCutout['side'], string> = {
        left: t('calc.sideLeftLabel'), right: t('calc.sideRightLabel'), center: t('calc.sideCenterLabel')
      };
      const posLabels: Record<string, string> = { top: ` ${t('calc.posTopLabel')}`, bottom: ` ${t('calc.posBottomLabel')}` };
      return (
        <div className="space-y-6">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base font-semibold">{t('calc.edgeCutouts')}</Label>
              </div>
              <Select onValueChange={(v) => addCutout(v as EdgeCutout['side'])}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('calc.addCutoutBtn')} />
                </SelectTrigger>
                <SelectContent>
                  {(['left', 'right', 'center'] as const).map(s => (
                    <SelectItem key={s} value={s}>{sideLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(!config.cutouts || config.cutouts.length === 0) && (
               <p className="text-sm text-muted-foreground text-center py-4">
                {t('calc.noCutoutsNote')}
              </p>
            )}

            {(config.cutouts || []).map((cutout, idx) => (
              <div key={cutout.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                     {t('calc.cutoutNLabel', { n: idx + 1, side: sideLabels[cutout.side], pos: cutout.side !== 'center' && cutout.verticalPosition ? ` ${posLabels[cutout.verticalPosition]}` : '' })}
                  </span>
                  <button
                    onClick={() => removeCutout(cutout.id)}
                    className="p-1 rounded-md hover:bg-destructive/10 text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('calc.cutoutSide')}</Label>
                    <Select value={cutout.side} onValueChange={(v) => {
                      const newSide = v as EdgeCutout['side'];
                      updateCutout(cutout.id, { side: newSide, ...(newSide !== 'center' ? { verticalPosition: cutout.verticalPosition || 'bottom' } : { verticalPosition: undefined }) });
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['left', 'right', 'center'] as const).map(s => (
                          <SelectItem key={s} value={s}>{sideLabels[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {cutout.side !== 'center' && (
                    <div className="space-y-1">
                      <Label className="text-xs">{t('calc.cutoutPosition')}</Label>
                      <Select value={cutout.verticalPosition || 'bottom'} onValueChange={(v) => updateCutout(cutout.id, { verticalPosition: v as 'top' | 'bottom' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="top">{t('calc.cutoutTop')}</SelectItem>
                          <SelectItem value="bottom">{t('calc.cutoutBottom')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className={`grid ${cutout.side === 'center' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'} gap-3`}>
                  <DimensionInput
                    label={t('calc.depthX')}
                    value={cutout.depth}
                    onChange={(v) => updateCutout(cutout.id, { depth: v })}
                    min={1}
                    max={config.dimensions.width}
                    step={1}
                  />
                  <DimensionInput
                    label={t('calc.dimensionY')}
                    value={cutout.length}
                    onChange={(v) => updateCutout(cutout.id, { length: v })}
                    min={1}
                    max={config.dimensions.height}
                    step={1}
                  />
                  {cutout.side === 'center' ? (
                    <>
                      <DimensionInput
                        label={t('calc.positionXLabel')}
                        value={cutout.positionX ?? 0}
                        onChange={(v) => updateCutout(cutout.id, { positionX: v || undefined })}
                        min={0}
                        max={config.dimensions.width}
                        step={1}
                        helperText={t('calc.distFromLeft')}
                      />
                      <DimensionInput
                        label={t('calc.positionYLabel')}
                        value={cutout.position ?? 0}
                        onChange={(v) => updateCutout(cutout.id, { position: v || undefined })}
                        min={0}
                        max={config.dimensions.height}
                        step={1}
                        helperText={t('calc.distFromBase')}
                      />
                    </>
                  ) : (
                    <DimensionInput
                      label={t('calc.positionOptional')}
                      value={cutout.position ?? 0}
                      onChange={(v) => updateCutout(cutout.id, { position: v || undefined })}
                      min={0}
                      max={config.dimensions.height}
                      step={1}
                      helperText={t('calc.distFromBase')}
                    />
                  )}
                </div>
              </div>
            ))}
          </Card>
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
    <SceneSetup cameraPosition={[2, 1.5, 3]} cameraFov={45}>
      <GlassColorContext.Provider value={config.glass.colorHex}>
        <DoorViewer3D config={config} />
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
    <AppLayout title={t('calc.doorTitle')}>
      <CalculatorLayout
        title={t('calc.doorConfigurator')}
        subtitle={t('calc.doorSubtitle')}
        formSection={formSection}
        viewerSection={viewerSection}
        summarySection={summarySection}
        isOfferStep={isOfferStep}
      />
    </AppLayout>
  );
}

function DoorViewer3D({ config }: { config: ReturnType<typeof useDoorCalculator>['config'] }) {
  const SCALE = 0.001;
  const width = config.dimensions.width * SCALE;
  const height = config.dimensions.height * SCALE;
  const glassThickness = config.glass.thickness * SCALE;

  // Lookup processing template for hinge cutout
  const hingeMaterialCode = config.accessories.hinges?.materialCode;
  const { data: hingeTemplate } = useProcessingLookup(hingeMaterialCode);
  const cutoutDims = hingeTemplate?.dimensions as { height?: number; width?: number; edge_offset?: number } | undefined;

  const glassType = config.glass.type === 'frosted_cutout' ? 'frosted' : config.glass.type;

  const frameThickness = 0.06; // 60mm frame depth
  const frameWidth = 0.05; // 50mm frame width
  const hasFrame = config.frameType !== 'none';
  
  // Frame color based on type
  const frameColor = config.frameType === 'aluminum' ? '#a0a0a0' : '#8B5A2B';
  const frameMetalness = config.frameType === 'aluminum' ? 0.8 : 0.1;
  const frameRoughness = config.frameType === 'aluminum' ? 0.3 : 0.7;

  return (
    <group position={[0, height / 2, 0]}>
      <SimpleDimensionLines widthMm={config.dimensions.width} heightMm={config.dimensions.height} />
      {/* Floor */}
      <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width + 0.5, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" opacity={0.5} transparent />
      </mesh>

      {/* Frame (Toc) */}
      {hasFrame && (
        <group>
          {/* Left frame post */}
          <mesh position={[-(width / 2 + frameWidth / 2), 0, 0]} castShadow>
            <boxGeometry args={[frameWidth, height, frameThickness]} />
            <meshStandardMaterial color={frameColor} metalness={frameMetalness} roughness={frameRoughness} />
          </mesh>
          {/* Right frame post */}
          <mesh position={[(width / 2 + frameWidth / 2), 0, 0]} castShadow>
            <boxGeometry args={[frameWidth, height, frameThickness]} />
            <meshStandardMaterial color={frameColor} metalness={frameMetalness} roughness={frameRoughness} />
          </mesh>
          {/* Top frame header */}
          <mesh position={[0, height / 2 + frameWidth / 2, 0]} castShadow>
            <boxGeometry args={[width + frameWidth * 2, frameWidth, frameThickness]} />
            <meshStandardMaterial color={frameColor} metalness={frameMetalness} roughness={frameRoughness} />
          </mesh>
        </group>
      )}

      {/* Door panel */}
      <mesh castShadow>
        <boxGeometry args={[width, height, glassThickness]} />
        <GlassMaterial type={glassType as 'clear' | 'frosted' | 'patterned'} />
      </mesh>

      {/* Handle */}
      {(() => {
      const handleY = config.accessories.handle.positionY 
          ? -height / 2 + (config.accessories.handle.positionY * SCALE)
          : 0;
        return (
          <HandleMesh model={config.accessories.handle.model} length={config.accessories.handle.length * SCALE} finish={config.accessories.handle.finish} position={[width / 2 - 0.05, handleY, glassThickness / 2 + 0.01]} />
        );
      })()}

      {/* Hinges + Cutouts */}
      {config.doorType === 'hinged' && config.accessories.hinges && (
        <>
          {(config.accessories.hinges.positions || []).map((positionMm, idx) => {
            const posY = height / 2 - (positionMm * SCALE);
            return (
              <group key={idx}>
                <mesh position={[-width / 2, posY, 0]}>
                  <boxGeometry args={[0.04, 0.08, 0.025]} />
                  <MetalMaterial finish={config.accessories.hinges!.finish} />
                </mesh>
                {/* Hinge cutout on door edge */}
                {cutoutDims?.width && cutoutDims?.height && (
                  <group position={[-width / 2, posY, 0]}>
                    <HingeCutout
                      width={cutoutDims.width * SCALE}
                      height={cutoutDims.height * SCALE}
                      edgeOffset={(cutoutDims.edge_offset ?? 8) * SCALE}
                      glassThickness={glassThickness}
                    />
                  </group>
                )}
              </group>
            );
          })}
        </>
      )}

      {/* Sliding rail + direction arrow */}
      {config.doorType === 'sliding' && (() => {
        const railWidth = (config.dimensions.openingWidth || config.dimensions.width * 2) * SCALE;
        const dir = config.accessories.slidingSystem?.slidingDirection === 'left' ? -1 : 1;
        const arrowY = height / 2 + 0.08;
        const shaftLen = width * 0.6;
        return (
          <>
            <mesh position={[0, height / 2 + 0.03, 0]}>
              <boxGeometry args={[railWidth, 0.03, 0.05]} />
              <meshStandardMaterial color="#606060" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Arrow shaft */}
            <mesh position={[dir * shaftLen * 0.2, arrowY, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, shaftLen, 8]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            {/* Arrow head (cone) */}
            <mesh position={[dir * (shaftLen * 0.2 + shaftLen / 2 + 0.025), arrowY, 0]} rotation={[0, 0, dir > 0 ? -Math.PI / 2 : Math.PI / 2]}>
              <coneGeometry args={[0.025, 0.06, 12]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </>
        );
      })()}
    </group>
  );
}
