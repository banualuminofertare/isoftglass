import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalculatorLayout } from '@/components/calculators/shared/CalculatorLayout';
import { StepIndicator } from '@/components/calculators/shared/StepIndicator';
import { NavigationButtons } from '@/components/calculators/shared/NavigationButtons';
import { PriceSummary } from '@/components/calculators/shared/PriceSummary';
import { ClientInfoFields } from '@/components/calculators/shared/ClientInfoFields';
import { SceneSetup } from '@/components/3d/helpers/SceneSetup';
import { ShowerViewer3D } from '@/components/calculators/shower/viewer/ShowerViewer3D';
import { CabinTypeStep } from '@/components/calculators/shower/steps/CabinTypeStep';
import { DoorTypeStep } from '@/components/calculators/shower/steps/DoorTypeStep';
import { DimensionsStep } from '@/components/calculators/shower/steps/DimensionsStep';
import { GlassTypeStep } from '@/components/calculators/shower/steps/GlassTypeStep';
import { AccessoriesStep } from '@/components/calculators/shower/steps/AccessoriesStep';
import { useShowerCalculator } from '@/hooks/calculators/useShowerCalculator';
import { useQuotePDF } from '@/hooks/calculators/useQuotePDF';
import { useQuoteSave } from '@/hooks/useQuoteSave';
import { useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { useToast } from '@/hooks/use-toast';
import { useClientTypePricing } from '@/hooks/useClientTypePricing';
import type { ClientType } from '@/hooks/useClients';
import { useTranslation } from 'react-i18next';
import { useEditQuote } from '@/hooks/useEditQuote';
import { useNavigate } from 'react-router-dom';


export function ShowerConfigurator() {
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
    config,
    currentStep,
    steps,
    price,
    canGoNext,
    goToStep,
    nextStep,
    prevStep,
    setCabinType,
    setDoorType,
    setDimensions,
    setGlass,
    setHinges,
    setDoorConfig,
    setFixedPanelConfig,
    setHandle,
    setSeals,
    addStabilizerSelection,
    removeStabilizerSelection,
    updateStabilizerSelectionLength,
    setStabilizerShape,
    setProfiles,
    setOpeningSide,
    addExtraAccessory,
    removeExtraAccessory,
    updateExtraAccessory,
    addAccessorySelection,
    removeAccessorySelection,
    addSealSelection,
    removeSealSelection,
    selectedKit, setSelectedKit, removeSelectedKit,
    pricingItems,
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
     setEdgePolish,
     setPentagonSides,
     reset,
    loadConfig,
  } = useShowerCalculator();

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

  const cabinTypeLabels: Record<string, string> = { corner_90: t('calc.corner90'), walk_in: t('calc.walkIn'), pentagon: t('calc.pentagon'), bathtub: t('calc.bathtub'), fixed_panel: t('calc.fixedPanel') };
  const doorTypeLabels: Record<string, string> = { hinged: t('calc.hinged'), pivot: t('calc.pivot'), sliding: t('calc.sliding') };
  const glassTypeLabels: Record<string, string> = { clear: t('calc.glassClear'), frosted: t('calc.glassFrosted'), patterned: t('calc.glassPatterned'), bronze: t('calc.glassBronze'), grey: t('calc.glassGrey'), timeless: t('calc.glassTimeless') };
  const finishLabels: Record<string, string> = { polished_stainless: 'Inox', brushed_stainless: 'Inox', matte_black: 'Black', chrome: 'Chrome' };

  const handleSaveQuote = async () => {
    const success = await saveQuote({
      productType: 'shower',
      productLabel: t('calc.showerTitle'),
      getConfigDetails: () => [
        { label: t('calc.cabinType'), value: cabinTypeLabels[config.cabinType] || config.cabinType },
        ...(config.cabinType !== 'fixed_panel' ? [{ label: t('calc.doorType'), value: doorTypeLabels[config.doorType] || config.doorType }] : []),
        { label: t('calc.dimensions'), value: `${config.dimensions.width} × ${config.dimensions.height}${config.cabinType !== 'fixed_panel' ? ` × ${config.dimensions.depth}` : ''} mm` },
        ...(config.cabinType !== 'fixed_panel' ? [{ label: t('calc.door'), value: `${config.dimensions.doorWidth} mm` }] : []),
        { label: t('calc.glass'), value: `${config.glass.thickness}mm, ${glassTypeLabels[config.glass.type] || config.glass.type}${config.glass.antiCalc ? ', ' + t('calc.antiCalc') : ''}` },
        ...(config.cabinType !== 'fixed_panel' ? [
          { label: t('calc.hinges'), value: `${config.accessories.hinges.type === 'wall_glass' ? t('calc.stabWallGlass') : t('calc.stabGlassGlass')}, ${config.accessories.hinges.quantity} ${t('common.pieces')}` },
          { label: t('calc.handle'), value: config.accessories.handle.model === 'round' ? 'Rotund, Ø cerc' : `${config.accessories.handle.model}, ${config.accessories.handle.length}mm` },
        ] : []),
        { label: t('calc.seals'), value: [config.accessories.seals.magnetic && t('calc.magneticProfile'), config.accessories.seals.rubber && t('calc.rubberGasket'), config.accessories.seals.threshold && t('calc.thresholdSeal')].filter(Boolean).join(', ') || '-' },
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
    productType: 'Cabina-Dus',
    productLabel: t('calc.showerTitle'),
    price,
    clientName,
    clientPhone,
    clientEmail,
    customAmount,
    markupPercent,
    getConfigDetails: () => [
      { label: t('calc.cabinType'), value: cabinTypeLabels[config.cabinType] || config.cabinType },
      ...(config.cabinType !== 'fixed_panel' ? [{ label: t('calc.doorType'), value: doorTypeLabels[config.doorType] || config.doorType }] : []),
      { label: t('calc.dimensions'), value: `${config.dimensions.width} × ${config.dimensions.height}${config.cabinType !== 'fixed_panel' ? ` × ${config.dimensions.depth}` : ''} mm` },
      ...(config.cabinType !== 'fixed_panel' ? [{ label: t('calc.door'), value: `${config.dimensions.doorWidth} mm` }] : []),
      { label: t('calc.glass'), value: `${config.glass.thickness}mm, ${glassTypeLabels[config.glass.type] || config.glass.type}${config.glass.antiCalc ? ', ' + t('calc.antiCalc') : ''}` },
      ...(config.cabinType !== 'fixed_panel' ? [
        { label: t('calc.hinges'), value: `${config.accessories.hinges.type === 'wall_glass' ? t('calc.stabWallGlass') : t('calc.stabGlassGlass')}, ${config.accessories.hinges.quantity} ${t('common.pieces')}` },
        { label: t('calc.handle'), value: config.accessories.handle.model === 'round' ? 'Rotund, Ø cerc' : `${config.accessories.handle.model}, ${config.accessories.handle.length}mm` },
      ] : []),
      { label: t('calc.seals'), value: [config.accessories.seals.magnetic && t('calc.magneticProfile'), config.accessories.seals.rubber && t('calc.rubberGasket'), config.accessories.seals.threshold && t('calc.thresholdSeal')].filter(Boolean).join(', ') || '-' },
    ],
  });

  const handleAddToOrder = async () => {
    setIsAddingToOrder(true);
    const success = await addItem({
      productType: 'shower',
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
          <CabinTypeStep
            value={config.cabinType}
            onChange={setCabinType}
          />
        );
      case 2:
        return (
          <DoorTypeStep
            value={config.doorType}
            onChange={setDoorType}
          />
        );
      case 3:
        return (
          <GlassTypeStep
            glass={config.glass}
            onChange={setGlass}
            pricingItems={pricingItems}
            edgePolish={config.edgePolish}
            onEdgePolishChange={setEdgePolish}
            productType="shower"
          />
        );
      case 4:
        return (
          <DimensionsStep
            cabinType={config.cabinType}
            doorType={config.doorType}
            dimensions={config.dimensions}
            onChange={setDimensions}
            fixedPanel={config.accessories.fixedPanel}
            onFixedPanelChange={setFixedPanelConfig}
            lateralConfig={config.lateralConfig}
            onLateralEnabledChange={setLateralEnabled}
            onLateralDoorTypeChange={setLateralDoorType}
            onLateralFixedPanelChange={setLateralFixedPanel}
            accessories={config.accessories}
            onOpeningSideChange={setOpeningSide}
            onDoorConfigChange={setDoorConfig}
            onLateralDoorConfigChange={setLateralDoorConfig}
            kitDeductions={selectedKit ? { door_height_deduction: selectedKit.door_height_deduction, fixed_panel_height_deduction: selectedKit.fixed_panel_height_deduction, width_overlap: selectedKit.width_overlap } : undefined}
            pentagonSides={config.pentagonSides ?? { left: true, right: true, back: true }}
            onPentagonSidesChange={setPentagonSides}
          />
        );
      case 5:
        return (
          <AccessoriesStep
            doorType={config.doorType}
            accessories={config.accessories}
            cabinHeight={config.dimensions.height}
            cabinType={config.cabinType}
            lateralConfig={config.lateralConfig}
            onOpeningSideChange={setOpeningSide}
            onHingesChange={setHinges}
            onDoorConfigChange={setDoorConfig}
            onHandleChange={setHandle}
            onSealsChange={setSeals}
            onStabilizerShapeChange={setStabilizerShape}
            onAddStabilizerSelection={addStabilizerSelection}
            onRemoveStabilizerSelection={removeStabilizerSelection}
            onUpdateStabilizerSelectionLength={updateStabilizerSelectionLength}
            onProfilesChange={setProfiles}
            onAddExtraAccessory={addExtraAccessory}
            onRemoveExtraAccessory={removeExtraAccessory}
            onUpdateExtraAccessory={updateExtraAccessory}
            onAddSelection={addAccessorySelection}
            onRemoveSelection={removeAccessorySelection}
            onAddSealSelection={addSealSelection}
            onRemoveSealSelection={removeSealSelection}
            selectedKit={selectedKit}
            onSelectKit={setSelectedKit}
            onRemoveKit={removeSelectedKit}
            onLateralDoorConfigChange={setLateralDoorConfig}
            onLateralHingesChange={setLateralHinges}
            onLateralHandleChange={setLateralHandle}
            onLateralSealsChange={setLateralSeals}
            onAddLateralHingeSelection={addLateralHingeSelection}
            onRemoveLateralHingeSelection={removeLateralHingeSelection}
            onAddLateralHandleSelection={addLateralHandleSelection}
            onRemoveLateralHandleSelection={removeLateralHandleSelection}
            onAddLateralSealSelection={addLateralSealSelection}
            onRemoveLateralSealSelection={removeLateralSealSelection}
            edgePolish={config.edgePolish}
            onEdgePolishChange={setEdgePolish}
            dimensions={config.dimensions}
            fixedPanel={config.accessories.fixedPanel}
          />
        );
      default:
        return null;
    }
  };

  const isOfferStep = currentStep === steps.length;

  const formSection = (
    <div className="h-full flex flex-col">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
      />
      
      <div className="flex-1 overflow-auto">
        {renderStep()}
      </div>
      
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
    <SceneSetup cameraPosition={[3, 2, 3]} cameraFov={45}>
      <ShowerViewer3D config={config} slidingOverlapMm={selectedKit?.width_overlap ?? 40} />
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
        showDetails={true} 
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
    <AppLayout title={t('calc.showerTitle')}>
      <CalculatorLayout
        title={t('calc.showerConfigurator')}
        subtitle={t('calc.showerSubtitle')}
        formSection={formSection}
        viewerSection={viewerSection}
        summarySection={summarySection}
        isOfferStep={isOfferStep}
      />
    </AppLayout>
  );
}
