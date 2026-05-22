import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalculatorLayout } from '@/components/calculators/shared/CalculatorLayout';
import { StepIndicator } from '@/components/calculators/shared/StepIndicator';
import { NavigationButtons } from '@/components/calculators/shared/NavigationButtons';
import { PriceSummary } from '@/components/calculators/shared/PriceSummary';
import { ClientInfoFields } from '@/components/calculators/shared/ClientInfoFields';
import { DimensionInput } from '@/components/calculators/shared/DimensionInput';
import { EdgePolishingOption } from '@/components/calculators/shared/EdgePolishingOption';
import { EdgeTypeSelector } from '@/components/calculators/shared/EdgeTypeSelector';
import { SceneSetup } from '@/components/3d/helpers/SceneSetup';
import { SimpleDimensionLines } from '@/components/3d/annotations/SimpleDimensionLines';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useMirrorCalculator } from '@/hooks/calculators/useMirrorCalculator';
import { useQuotePDF } from '@/hooks/calculators/useQuotePDF';
import { useQuoteSave } from '@/hooks/useQuoteSave';
import { useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { useToast } from '@/hooks/use-toast';
import { useClientTypePricing } from '@/hooks/useClientTypePricing';
import type { ClientType } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { Square, Circle, Hexagon, Scissors } from 'lucide-react';
import { ExtraAccessoriesSection } from '@/components/calculators/shared/ExtraAccessoriesSection';

import { AccessoryPresetManager } from '@/components/calculators/shared/AccessoryPresetManager';
import { CatalogProductSelector } from '@/components/calculators/shared/CatalogProductSelector';
import { GlassModelSelector } from '@/components/calculators/shared/GlassModelSelector';
import { MirrorMaterial } from '@/components/3d/materials/MirrorMaterial';
import type { MirrorShape, MirrorType, LEDType } from '@/types/calculators';
import { useEditQuote } from '@/hooks/useEditQuote';
import { useNavigate } from 'react-router-dom';

export function MirrorConfigurator() {
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
    setShape, setDimensions, setMirrorType, setProcessing, setBevel, setLed, setEdgePolish,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    selectedKit, setSelectedKit, removeSelectedKit,
    reset,
    loadConfig,
    pricingItems,
  } = useMirrorCalculator();

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

  const handleSaveQuote = async () => {
    const success = await saveQuote({
      productType: 'mirror',
      productLabel: t('calc.mirror'),
      getConfigDetails: () => [
        { label: t('calc.shape'), value: shapeLabels[config.shape] || config.shape },
        { label: t('calc.dimensions'), value: config.shape === 'circle' ? `Ø${config.dimensions.diameter || config.dimensions.width} mm` : `${config.dimensions.width} × ${config.dimensions.height} mm` },
        { label: t('common.quantity'), value: `${config.dimensions.quantity} ${t('common.pieces')}` },
        { label: t('calc.mirrorType'), value: mirrorTypeLabels[config.mirrorType] || config.mirrorType },
        { label: t('calc.bevel'), value: config.processing.bevel.enabled ? `${config.processing.bevel.width}mm` : t('calc.noLed') },
        { label: t('calc.led'), value: ledLabels[config.led.type] || config.led.type },
        ...(config.processing.cutoutCount > 0 ? [{ label: t('calc.cutouts'), value: `${config.processing.cutoutCount} ${t('common.pieces')}` }] : []),
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

  const shapeLabels: Record<string, string> = { rectangle: t('calc.rectangle'), square: t('calc.squareShape'), circle: t('calc.circle'), oval: t('calc.oval'), custom: t('calc.customShape') };
  const mirrorTypeLabels: Record<string, string> = { silver: t('calc.silverMirror'), bronze: t('calc.bronzeMirror'), grey: t('calc.greyMirror') };
  const ledLabels: Record<string, string> = { none: t('calc.noLed'), perimeter: t('calc.perimeterLed'), integrated: t('calc.integratedLed'), with_defogging: t('calc.defoggingLed') };

  const { handleDownloadPDF } = useQuotePDF({
    productType: 'Oglinda',
    productLabel: t('calc.mirror'),
    price,
    clientName,
    clientPhone,
    clientEmail,
    customAmount,
    markupPercent,
    getConfigDetails: () => [
      { label: t('calc.shape'), value: shapeLabels[config.shape] || config.shape },
      { label: t('calc.dimensions'), value: config.shape === 'circle' ? `Ø${config.dimensions.diameter || config.dimensions.width} mm` : `${config.dimensions.width} × ${config.dimensions.height} mm` },
      { label: t('common.quantity'), value: `${config.dimensions.quantity} ${t('common.pieces')}` },
      { label: t('calc.mirrorType'), value: mirrorTypeLabels[config.mirrorType] || config.mirrorType },
      { label: t('calc.bevel'), value: config.processing.bevel.enabled ? `${config.processing.bevel.width}mm` : t('calc.noLed') },
      { label: t('calc.led'), value: ledLabels[config.led.type] || config.led.type },
      ...(config.processing.cutoutCount > 0 ? [{ label: t('calc.cutouts'), value: `${config.processing.cutoutCount} ${t('common.pieces')}` }] : []),
    ],
  });

  const handleAddToOrder = async () => {
    setIsAddingToOrder(true);
    const success = await addItem({
      productType: 'mirror',
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
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'rectangle' as const, label: t('calc.rectangle'), icon: Square },
                { id: 'square' as const, label: t('calc.squareShape'), icon: Square },
                { id: 'circle' as const, label: t('calc.circle'), icon: Circle },
                { id: 'oval' as const, label: t('calc.oval'), icon: Hexagon },
                { id: 'custom' as const, label: t('calc.customShape'), icon: Hexagon },
              ]).map((option) => {
                const Icon = option.icon;
                const isSelected = config.shape === option.id;
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:border-primary/50 text-center",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                    onClick={() => setShape(option.id)}
                  >
                    <Icon className={cn("h-8 w-8 mx-auto mb-2", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {config.shape === 'custom' && (
              <div className="bg-accent/50 border border-accent rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground">
                  {t('calc.customShapeNote')}
                </p>
              </div>
            )}
            {config.shape === 'circle' ? (
              <DimensionInput
                label={t('calc.diameter')}
                value={config.dimensions.diameter || config.dimensions.width}
                onChange={(diameter) => setDimensions({ diameter, width: diameter, height: diameter })}
                min={200}
                max={2000}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <DimensionInput
                  label={t('calc.width')}
                  value={config.dimensions.width}
                  onChange={(width) => setDimensions({ width })}
                  min={200}
                  max={2500}
                />
                <DimensionInput
                  label={t('calc.height')}
                  value={config.dimensions.height}
                  onChange={(height) => setDimensions({ height })}
                  min={200}
                  max={2500}
                />
              </div>
            )}
            <DimensionInput
              label={t('common.quantity')}
              value={config.dimensions.quantity}
              onChange={(quantity) => setDimensions({ quantity })}
              min={1}
              max={50}
              unit={t('common.pieces')}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <GlassModelSelector
              items={pricingItems}
              currentType={config.mirrorType}
              productType="mirror"
              onChange={(model) => setMirrorType(model.type as any)}
              label={t('calc.mirrorModelLabel')}
            />
            <EdgeTypeSelector
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
            />

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Hexagon className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">{t('calc.bevel')}</Label>
                </div>
                <Switch
                  checked={config.processing.bevel.enabled}
                  onCheckedChange={(enabled) => setBevel({ enabled })}
                />
              </div>
              {config.processing.bevel.enabled && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('calc.bevelWidth')}: {config.processing.bevel.width}mm</Label>
                    <Slider
                      value={[config.processing.bevel.width]}
                      onValueChange={([width]) => setBevel({ width })}
                      min={10}
                      max={40}
                      step={5}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{t('calc.sandblasting')}</Label>
                  <p className="text-xs text-muted-foreground">{t('calc.sandblastingDesc')}</p>
                </div>
                <Switch
                  checked={config.processing.sandblasting.enabled}
                  onCheckedChange={(enabled) => setProcessing({ sandblasting: { ...config.processing.sandblasting, enabled } })}
                />
              </div>
            </Card>

            <EdgePolishingOption
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
              glassPieces={[
                {
                  name: t('calc.mirror'),
                  width: config.dimensions.width,
                  height: config.dimensions.height,
                  quantity: config.dimensions.quantity,
                },
              ]}
            />

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary" />
                  <div>
                    <Label className="text-sm font-medium">{t('calc.cutouts')}</Label>
                    <p className="text-xs text-muted-foreground">{t('calc.cutoutsDesc')}</p>
                  </div>
                </div>
              </div>
              <DimensionInput
                label={t('calc.cutoutCount')}
                value={config.processing.cutoutCount}
                onChange={(cutoutCount) => setProcessing({ ...config.processing, cutoutCount })}
                min={0}
                max={20}
                step={1}
                unit={t('common.pieces')}
              />
              {config.processing.cutoutCount > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t('calc.cutoutCalc', { count: config.processing.cutoutCount, qty: config.dimensions.quantity })}
                </p>
              )}
            </Card>

            <AccessoryPresetManager
              productType="mirror"
              category="mount_point"
              label={t('calc.mountSystems')}
              selectedCode={config.extraAccessories[0]?.materialCode}
              onSelect={(code) => {
                const existing = config.extraAccessories.findIndex(a => a.materialCode === code);
                if (existing < 0) {
                  addExtraAccessory({ materialCode: code, name: code });
                }
              }}
            />
            <CatalogProductSelector
              category="mount_point"
              label={t('calc.chooseProduct')}
              value={config.extraAccessories.find(a => a.materialCode)?.materialCode}
              onValueChange={(code) => {
                if (code) {
                  const existing = config.extraAccessories.findIndex(a => a.materialCode === code);
                  if (existing < 0) {
                    addExtraAccessory({ materialCode: code, name: code });
                  }
                }
              }}
              productType="mirror"
              className="mt-2"
            />

            <ExtraAccessoriesSection
              extraAccessories={config.extraAccessories}
              onAdd={addExtraAccessory}
              onRemove={removeExtraAccessory}
              onUpdate={updateExtraAccessory}
              productType="mirror"
              selectedKit={selectedKit}
              onSelectKit={setSelectedKit}
              onRemoveKit={removeSelectedKit}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            {([
              { id: 'none', label: t('calc.noLed'), description: t('calc.noLedDesc') },
              { id: 'perimeter', label: t('calc.perimeterLed'), description: t('calc.perimeterLedDesc') },
              { id: 'integrated', label: t('calc.integratedLed'), description: t('calc.integratedLedDesc') },
              { id: 'with_defogging', label: t('calc.defoggingLed'), description: t('calc.defoggingLedDesc') },
            ] as const).map((option) => {
              const isSelected = config.led.type === option.id;
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}
                  onClick={() => setLed({ type: option.id })}
                >
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </Card>
              );
            })}

            {config.led.type !== 'none' && (
              <Card className="p-4">
                <Label className="text-sm font-medium">{t('calc.colorTemp')}</Label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(['warm', 'neutral', 'cool'] as const).map((temp) => (
                    <Card
                      key={temp}
                      className={cn(
                        "p-2 text-center cursor-pointer text-sm",
                        config.led.colorTemp === temp && "border-primary bg-primary/5"
                      )}
                      onClick={() => setLed({ colorTemp: temp })}
                    >
                      {temp === 'warm' ? t('calc.warm') : temp === 'neutral' ? t('calc.neutral') : t('calc.cool')}
                    </Card>
                  ))}
                </div>
              </Card>
            )}
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
    <SceneSetup cameraPosition={[0, 0, 2]} cameraFov={50}>
      <MirrorViewer3D config={config} />
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
    <AppLayout title={t('calc.mirrorTitle')}>
      <CalculatorLayout
        title={t('calc.mirrorConfigurator')}
        subtitle={t('calc.mirrorSubtitle')}
        formSection={formSection}
        viewerSection={viewerSection}
        summarySection={summarySection}
        isOfferStep={isOfferStep}
      />
    </AppLayout>
  );
}

function MirrorViewer3D({ config }: { config: ReturnType<typeof useMirrorCalculator>['config'] }) {
  const SCALE = 0.001;
  const width = config.dimensions.width * SCALE;
  const height = config.dimensions.height * SCALE;
  const thickness = 0.006; // 6mm mirror

  return (
    <group position={[0, 0, 0]}>
      <SimpleDimensionLines widthMm={config.dimensions.width} heightMm={config.dimensions.height} />
      {/* Mirror panel */}
      {config.shape === 'circle' ? (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[width / 2, width / 2, thickness, 64]} />
          <MirrorMaterial type={config.mirrorType} />
        </mesh>
      ) : config.shape === 'oval' ? (
        <mesh castShadow scale={[1, height / width, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[width / 2, width / 2, thickness, 64]} />
          <MirrorMaterial type={config.mirrorType} />
        </mesh>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[width, height, thickness]} />
          <MirrorMaterial type={config.mirrorType} />
        </mesh>
      )}

      {/* LED glow effect */}
      {config.led.type !== 'none' && (
        <pointLight 
          position={[0, 0, -0.1]} 
          intensity={0.5} 
          color={config.led.colorTemp === 'warm' ? '#ffcc88' : config.led.colorTemp === 'cool' ? '#88ccff' : '#ffffff'}
        />
      )}

      {/* Bevel indicator */}
      {config.processing.bevel.enabled && config.shape !== 'circle' && (
        <mesh position={[0, 0, thickness / 2 + 0.001]}>
          <ringGeometry args={[
            Math.min(width, height) / 2 - config.processing.bevel.width * SCALE,
            Math.min(width, height) / 2,
            64
          ]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
    </group>
  );
}
