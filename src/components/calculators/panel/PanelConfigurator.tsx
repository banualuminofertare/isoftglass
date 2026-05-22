import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HandleMesh } from '@/components/3d/geometry/HandleMesh';
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
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePanelCalculator } from '@/hooks/calculators/usePanelCalculator';
import { useQuotePDF } from '@/hooks/calculators/useQuotePDF';
import { useQuoteSave } from '@/hooks/useQuoteSave';
import { useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { useToast } from '@/hooks/use-toast';
import { useClientTypePricing } from '@/hooks/useClientTypePricing';
import type { ClientType } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { Plus, Minus, Trash2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, CornerDownRight, Columns, Rows } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GlassMaterial, GlassColorContext } from '@/components/3d/materials/GlassMaterial';
import { MetalMaterial } from '@/components/3d/materials/MetalMaterial';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { ProductTypeStep } from './steps/ProductTypeStep';
import { GridConfigStep } from './steps/GridConfigStep';
import { DoorConfigStep } from './steps/DoorConfigStep';
import { ExtraAccessoriesSection } from '@/components/calculators/shared/ExtraAccessoriesSection';
import { SelectedProductCard } from '@/components/calculators/shared/SelectedProductCard';
import { SelectionListManager } from '@/components/calculators/shared/SelectionListManager';

import { AccessoryPresetManager } from '@/components/calculators/shared/AccessoryPresetManager';
import { CatalogProductSelector } from '@/components/calculators/shared/CatalogProductSelector';
import { GlassModelSelector } from '@/components/calculators/shared/GlassModelSelector';
import type { GlassThickness, GlassType } from '@/types/calculators';
import { useEditQuote } from '@/hooks/useEditQuote';
import { useNavigate } from 'react-router-dom';

export function PanelConfigurator() {
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
    setProductType, setDimensions, setGlass, setProcessing, setEdgePolish,
    addHole, removeHole, addCutout, removeCutout, reset,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    selectedKit, setSelectedKit, removeSelectedKit,
    pricingItems,
    // Partition wall specific
    setPartitionWallDimensions, setPartitionGrid, updateColumnWidth, updateRowHeight, setColumnRows,
    setCellType, updateDoorConfig, splitCellHorizontally, deleteSplitRow, setPartitionProfileWidth,
    setPartitionProfileSides, setProfile90Degree, updateDoorLabelOffset, loadConfig, setSidePanels,
    setPartitionProfileMaterialCode, addPartitionProfileSelection, removePartitionProfileSelection,
    setSidePanelGrid, setSidePanelColumnRows, setSidePanelColumnWidth, setSidePanelRowHeight, setSidePanelCellType,
  } = usePanelCalculator();

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
      productType: 'panel',
      productLabel: `${t('calc.panelPiece')} - ${productLabels[config.productType] || config.productType}`,
      getConfigDetails: () => [
        { label: t('calc.productTypeLabel'), value: productLabels[config.productType] || config.productType },
        { label: t('calc.dimensionsLabel'), value: config.productType === 'partition_wall' || config.productType === 'simple' ? `${config.partitionWall?.totalWidth ?? 0} × ${config.partitionWall?.totalHeight ?? 0} mm` : `${config.dimensions.width} × ${config.dimensions.height} mm` },
        { label: t('calc.quantityDimLabel'), value: t('calc.quantityPcsLabel', { qty: config.dimensions.quantity }) },
        { label: t('calc.glassLabel'), value: `${config.glass.thickness}mm, ${glassTypeLabels[config.glass.type] || config.glass.type}${config.glass.tempered ? `, ${t('calc.temperedShort')}` : ''}${config.glass.laminated ? `, ${t('calc.laminatedShort')}` : ''}` },
        ...(config.processing.holes.length > 0 ? [{ label: t('calc.holesLabel'), value: `${config.processing.holes.length} buc` }] : []),
        ...(config.processing.cutouts.length > 0 ? [{ label: t('calc.cutoutsCountLabel'), value: `${config.processing.cutouts.length} buc` }] : []),
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

  const productLabels: Record<string, string> = { simple: t('calc.simplePanelLabel'), processed: t('calc.processedPanelLabel'), partition_wall: t('calc.partitionWallLabel') };
  const glassTypeLabels: Record<string, string> = { clear: t('calc.glassTransparentLabel'), frosted: t('calc.glassFrostedShort'), patterned: t('calc.glassDecoratedLabel'), bronze: t('calc.glassBronzeLabel'), grey: t('calc.glassGreyLabel'), green: t('calc.glassGreenLabel'), low_e: t('calc.glassLowELabel') };

  const { handleDownloadPDF } = useQuotePDF({
    productType: 'Panou-Sticla',
    productLabel: `${t('calc.panelPiece')} - ${productLabels[config.productType] || config.productType}`,
    price,
    clientName,
    clientPhone,
    clientEmail,
    customAmount,
    markupPercent,
    getConfigDetails: () => [
      { label: t('calc.productTypeLabel'), value: productLabels[config.productType] || config.productType },
      { label: t('calc.dimensionsLabel'), value: config.productType === 'partition_wall' || config.productType === 'simple' ? `${config.partitionWall?.totalWidth ?? 0} × ${config.partitionWall?.totalHeight ?? 0} mm` : `${config.dimensions.width} × ${config.dimensions.height} mm` },
      { label: t('calc.quantityDimLabel'), value: t('calc.quantityPcsLabel', { qty: config.dimensions.quantity }) },
      { label: t('calc.glassLabel'), value: `${config.glass.thickness}mm, ${glassTypeLabels[config.glass.type] || config.glass.type}${config.glass.tempered ? `, ${t('calc.temperedShort')}` : ''}${config.glass.laminated ? `, ${t('calc.laminatedShort')}` : ''}` },
      ...(config.processing.holes.length > 0 ? [{ label: t('calc.holesLabel'), value: `${config.processing.holes.length} buc` }] : []),
      ...(config.processing.cutouts.length > 0 ? [{ label: t('calc.cutoutsCountLabel'), value: `${config.processing.cutouts.length} buc` }] : []),
    ],
  });

  const handleAddToOrder = async () => {
    setIsAddingToOrder(true);
    const success = await addItem({
      productType: 'panel',
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
    // Partition Wall flow
    if (config.productType === 'partition_wall') {
      return renderPartitionWallStep();
    }

    // Simple panel flow (with grid, no doors)
    if (config.productType === 'simple') {
      return renderSimplePanelStep();
    }
    
    // Processed panel flow
    return renderProcessedPanelStep();
  };

  const renderPartitionWallStep = () => {
    switch (currentStep) {
      case 1:
        return <ProductTypeStep value={config.productType} onChange={setProductType} />;
      
      case 2:
        // Dimensions for partition wall
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DimensionInput
                label={t('calc.totalWidth')}
                value={config.partitionWall?.totalWidth ?? 3000}
                onChange={(width) => setPartitionWallDimensions(width, config.partitionWall?.totalHeight ?? 2500)}
                min={500}
                max={10000}
              />
              <DimensionInput
                label={t('calc.totalHeight')}
                value={config.partitionWall?.totalHeight ?? 2500}
                onChange={(height) => setPartitionWallDimensions(config.partitionWall?.totalWidth ?? 3000, height)}
                min={1000}
                max={4000}
              />
            </div>
            <DimensionInput
              label={t('common.quantity')}
              value={config.dimensions.quantity}
              onChange={(quantity) => setDimensions({ quantity })}
              min={1}
              max={100}
              unit={t('calc.pcs')}
            />
            {/* Profile type selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calc.perimeterProfile')}</Label>
              <p className="text-xs text-muted-foreground mb-2">{t('calc.perimeterProfilesHint')}</p>
              <div className="space-y-3">
                <SelectionListManager
                  items={config.partitionWall?.profileSelections || []}
                  category="profile_u"
                  onRemove={(idx) => removePartitionProfileSelection(idx)}
                  label={t('calc.selectedProducts')}
                />
                <AccessoryPresetManager
                  productType="panel"
                  category="profile_u"
                  label=""
                  selectedCode={config.partitionWall?.profileMaterialCode}
                  onSelect={(code) => setPartitionProfileMaterialCode(code)}
                />
                <CatalogProductSelector
                  category="profile_u"
                  label={t('calc.selectProduct')}
                  value=""
                  onValueChange={() => {}}
                  onProductAdd={(product) => addPartitionProfileSelection({
                    materialCode: product.code,
                    name: product.name,
                    unitPrice: product.unitPrice ?? undefined,
                  })}
                  productType="panel"
                />
              </div>
            </div>
            {/* Profile sides toggles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calc.profileSides')}</Label>
               <div className="grid grid-cols-4 gap-2">
                {([
                  { key: 'top' as const, label: t('calc.top'), icon: ArrowUp },
                  { key: 'bottom' as const, label: t('calc.bottom'), icon: ArrowDown },
                  { key: 'left' as const, label: t('calc.leftSide'), icon: ArrowLeft },
                  { key: 'right' as const, label: t('calc.rightSide'), icon: ArrowRight },
                ]).map(({ key, label, icon: Icon }) => {
                  const active = config.partitionWall?.profileSides?.[key] ?? true;
                  return (
                    <Card
                      key={key}
                      className={cn(
                        "p-2 flex items-center gap-2 cursor-pointer text-sm transition-colors",
                        active ? "border-primary bg-primary/5" : "opacity-50"
                      )}
                      onClick={() => setPartitionProfileSides({ [key]: !active })}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Card>
                  );
                })}
              </div>
            </div>
            {/* 90-degree PVC profile */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calc.profile90PVC')}</Label>
              <div className="flex items-center gap-3">
                <Card
                  className={cn(
                    "p-2 flex items-center gap-2 cursor-pointer text-sm transition-colors flex-1",
                    config.partitionWall?.profile90Degree?.enabled ? "border-primary bg-primary/5" : "opacity-50"
                  )}
                  onClick={() => {
                    const current = config.partitionWall?.profile90Degree;
                    const enabled = !(current?.enabled ?? false);
                    setProfile90Degree({ enabled, quantity: enabled ? (current?.quantity || 1) : 0 });
                  }}
                >
                  <CornerDownRight className="h-4 w-4" />
                  <span>{config.partitionWall?.profile90Degree?.enabled ? t('calc.enabled') : t('calc.disabled')}</span>
                </Card>
                {config.partitionWall?.profile90Degree?.enabled && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setProfile90Degree({
                        enabled: true,
                        quantity: Math.max(1, (config.partitionWall?.profile90Degree?.quantity || 1) - 1)
                      })}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {config.partitionWall?.profile90Degree?.quantity || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setProfile90Degree({
                        enabled: true,
                        quantity: (config.partitionWall?.profile90Degree?.quantity || 1) + 1
                      })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {config.partitionWall?.profile90Degree?.enabled && (
                <p className="text-xs text-muted-foreground">
                  {config.partitionWall?.profile90Degree?.quantity || 1} × {((config.partitionWall?.totalHeight ?? 2500) / 1000).toFixed(2)}m = {(((config.partitionWall?.profile90Degree?.quantity || 1) * (config.partitionWall?.totalHeight ?? 2500)) / 1000).toFixed(2)} ml
                </p>
              )}
            </div>
            {/* Side Panels 90° */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('calc.sidePanels90')}</Label>
              {(['left', 'right'] as const).map((side) => {
                const sp = config.partitionWall?.sidePanels?.[side];
                const enabled = sp?.enabled ?? false;
                const spProfileWidth = sp?.profileWidth ?? 12;
                const spProfileSides = sp?.profileSides ?? { front: true, back: true, top: true, bottom: true };
                return (
                  <Card key={side} className={cn("p-3 space-y-3", enabled && "border-primary")}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{side === 'left' ? t('calc.leftPanel') : t('calc.rightPanel')}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => setSidePanels(side, { enabled: checked, width: sp?.width ?? 500 })}
                      />
                    </div>
                    {enabled && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <DimensionInput
                            label={t('calc.depthWidth')}
                            value={sp?.width ?? 500}
                            onChange={(w) => setSidePanels(side, { width: w })}
                            min={200}
                            max={3000}
                          />
                          <DimensionInput
                            label={t('calc.height')}
                            value={sp?.height ?? (config.partitionWall?.totalHeight ?? 2500)}
                            onChange={(h) => setSidePanels(side, { height: h })}
                            min={500}
                            max={4000}
                          />
                        </div>
                        {/* Profile type */}
                        <div className="space-y-1">
                          <Label className="text-xs">{t('calc.profileType')}</Label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { value: 12, label: '12 mm' },
                              { value: 22, label: '22 mm' },
                              { value: 25, label: t('calc.profileULabel') },
                            ].map((option) => (
                              <Card
                                key={option.value}
                                className={cn(
                                  "p-2 text-center cursor-pointer text-xs",
                                  spProfileWidth === option.value && "border-primary bg-primary/5"
                                )}
                                onClick={() => setSidePanels(side, { profileWidth: option.value })}
                              >
                                {option.label}
                              </Card>
                            ))}
                          </div>
                        </div>
                        {/* Profile sides */}
                        <div className="space-y-1">
                          <Label className="text-xs">{t('calc.profileSidesLabel')}</Label>
                          <div className="grid grid-cols-4 gap-1">
                            {([
                              { key: 'front' as const, label: t('calc.frontSide') },
                              { key: 'back' as const, label: t('calc.backSide') },
                              { key: 'top' as const, label: t('calc.top') },
                              { key: 'bottom' as const, label: t('calc.bottom') },
                            ]).map(({ key, label }) => (
                              <Card
                                key={key}
                                className={cn(
                                  "p-1.5 text-center cursor-pointer text-xs transition-colors",
                                  spProfileSides[key] ? "border-primary bg-primary/5" : "opacity-50"
                                )}
                                onClick={() => setSidePanels(side, { profileSides: { ...spProfileSides, [key]: !spProfileSides[key] } })}
                              >
                                {label}
                              </Card>
                            ))}
                          </div>
                        </div>
                        {/* Grid sections */}
                        {sp?.grid && (
                          <SidePanelGridConfig
                            side={side}
                            sp={sp}
                            onGridChange={setSidePanelGrid}
                            onColumnRowsChange={setSidePanelColumnRows}
                            onColumnWidthChange={setSidePanelColumnWidth}
                            onRowHeightChange={setSidePanelRowHeight}
                            onCellTypeChange={setSidePanelCellType}
                          />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('calc.surfaceLabel')}: {(((sp?.width ?? 500) * (sp?.height ?? (config.partitionWall?.totalHeight ?? 2500))) / 1000000).toFixed(2)} m²
                        </p>
                      </>
                    )}
                  </Card>
                );
              })}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">{t('calc.totalSurfaceLabel')}:</span>
                <span className="ml-2 font-medium">
                  {(() => {
                    const mainArea = (config.partitionWall?.totalWidth ?? 3000) * (config.partitionWall?.totalHeight ?? 2500);
                    const leftSp = config.partitionWall?.sidePanels?.left;
                    const rightSp = config.partitionWall?.sidePanels?.right;
                    const leftArea = leftSp?.enabled ? (leftSp.width * (leftSp.height ?? (config.partitionWall?.totalHeight ?? 2500))) : 0;
                    const rightArea = rightSp?.enabled ? (rightSp.width * (rightSp.height ?? (config.partitionWall?.totalHeight ?? 2500))) : 0;
                    return (((mainArea + leftArea + rightArea) * config.dimensions.quantity) / 1000000).toFixed(2);
                  })()} m²
                </span>
              </p>
            </div>
          </div>
        );
      
      case 3:
        // Grid configuration
        if (!config.partitionWall) return null;
        return (
          <GridConfigStep
            config={config.partitionWall}
            onGridChange={setPartitionGrid}
            onColumnRowsChange={setColumnRows}
            onColumnWidthChange={updateColumnWidth}
            onRowHeightChange={updateRowHeight}
            onCellTypeChange={setCellType}
            onSplitCell={splitCellHorizontally}
            onDeleteSplit={deleteSplitRow}
            onUpdateDoor={updateDoorConfig}
          />
        );
      
      case 4:
        // Door configuration
        if (!config.partitionWall) return null;
        return (
          <DoorConfigStep
            cells={config.partitionWall.cells}
            doors={config.partitionWall.doors}
            onAddDoor={() => {}}
            onUpdateDoor={updateDoorConfig}
            onRemoveDoor={() => {}}
            selectedKit={selectedKit}
            onSelectKit={setSelectedKit}
            onRemoveKit={removeSelectedKit}
          />
        );
      
      case 5:
        // Glass type for partition wall
        return renderGlassTypeStep();
      
      default:
        return null;
    }
  };

  const renderSimplePanelStep = () => {
    switch (currentStep) {
      case 1:
        return <ProductTypeStep value={config.productType} onChange={setProductType} />;
      
      case 2:
        // Dimensions for simple panel (same as partition wall but simpler)
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DimensionInput
                label={t('calc.totalWidth')}
                value={config.partitionWall?.totalWidth ?? 3000}
                onChange={(width) => setPartitionWallDimensions(width, config.partitionWall?.totalHeight ?? 2500)}
                min={500}
                max={10000}
              />
              <DimensionInput
                label={t('calc.totalHeight')}
                value={config.partitionWall?.totalHeight ?? 2500}
                onChange={(height) => setPartitionWallDimensions(config.partitionWall?.totalWidth ?? 3000, height)}
                min={500}
                max={4000}
              />
            </div>
            <DimensionInput
              label={t('common.quantity')}
              value={config.dimensions.quantity}
              onChange={(quantity) => setDimensions({ quantity })}
              min={1}
              max={100}
              unit={t('calc.pcs')}
            />
            {/* Profile type selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calc.perimeterProfile')}</Label>
              <p className="text-xs text-muted-foreground mb-2">{t('calc.perimeterProfilesHint')}</p>
              <div className="space-y-3">
                <SelectionListManager
                  items={config.partitionWall?.profileSelections || []}
                  category="profile_u"
                  onRemove={(idx) => removePartitionProfileSelection(idx)}
                  label={t('calc.selectedProducts')}
                />
                <AccessoryPresetManager
                  productType="panel"
                  category="profile_u"
                  label=""
                  selectedCode={config.partitionWall?.profileMaterialCode}
                  onSelect={(code) => setPartitionProfileMaterialCode(code)}
                />
                <CatalogProductSelector
                  category="profile_u"
                  label={t('calc.selectProduct')}
                  value=""
                  onValueChange={() => {}}
                  onProductAdd={(product) => addPartitionProfileSelection({
                    materialCode: product.code,
                    name: product.name,
                    unitPrice: product.unitPrice ?? undefined,
                  })}
                  productType="panel"
                />
              </div>
            </div>
            {/* Profile sides toggles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calc.profileSides')}</Label>
               <div className="grid grid-cols-4 gap-2">
                {([
                  { key: 'top' as const, label: t('calc.top'), icon: ArrowUp },
                  { key: 'bottom' as const, label: t('calc.bottom'), icon: ArrowDown },
                  { key: 'left' as const, label: t('calc.leftSide'), icon: ArrowLeft },
                  { key: 'right' as const, label: t('calc.rightSide'), icon: ArrowRight },
                ]).map(({ key, label, icon: Icon }) => {
                  const active = config.partitionWall?.profileSides?.[key] ?? true;
                  return (
                    <Card
                      key={key}
                      className={cn(
                        "p-2 flex items-center gap-2 cursor-pointer text-sm transition-colors",
                        active ? "border-primary bg-primary/5" : "opacity-50"
                      )}
                      onClick={() => setPartitionProfileSides({ [key]: !active })}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Card>
                  );
                })}
              </div>
            </div>
            {/* 90-degree PVC profile */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('calc.profile90PVC')}</Label>
              <div className="flex items-center gap-3">
                <Card
                  className={cn(
                    "p-2 flex items-center gap-2 cursor-pointer text-sm transition-colors flex-1",
                    config.partitionWall?.profile90Degree?.enabled ? "border-primary bg-primary/5" : "opacity-50"
                  )}
                  onClick={() => {
                    const current = config.partitionWall?.profile90Degree;
                    const enabled = !(current?.enabled ?? false);
                    setProfile90Degree({ enabled, quantity: enabled ? (current?.quantity || 1) : 0 });
                  }}
                >
                  <CornerDownRight className="h-4 w-4" />
                  <span>{config.partitionWall?.profile90Degree?.enabled ? t('calc.enabled') : t('calc.disabled')}</span>
                </Card>
                {config.partitionWall?.profile90Degree?.enabled && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setProfile90Degree({
                        enabled: true,
                        quantity: Math.max(1, (config.partitionWall?.profile90Degree?.quantity || 1) - 1)
                      })}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {config.partitionWall?.profile90Degree?.quantity || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setProfile90Degree({
                        enabled: true,
                        quantity: (config.partitionWall?.profile90Degree?.quantity || 1) + 1
                      })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {config.partitionWall?.profile90Degree?.enabled && (
                <p className="text-xs text-muted-foreground">
                  {config.partitionWall?.profile90Degree?.quantity || 1} × {((config.partitionWall?.totalHeight ?? 2500) / 1000).toFixed(2)}m = {(((config.partitionWall?.profile90Degree?.quantity || 1) * (config.partitionWall?.totalHeight ?? 2500)) / 1000).toFixed(2)} ml
                </p>
              )}
            </div>
            {/* Side Panels 90° */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('calc.sidePanels90')}</Label>
              {(['left', 'right'] as const).map((side) => {
                const sp = config.partitionWall?.sidePanels?.[side];
                const enabled = sp?.enabled ?? false;
                const spProfileWidth = sp?.profileWidth ?? 12;
                const spProfileSides = sp?.profileSides ?? { front: true, back: true, top: true, bottom: true };
                return (
                  <Card key={side} className={cn("p-3 space-y-3", enabled && "border-primary")}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{side === 'left' ? t('calc.leftPanel') : t('calc.rightPanel')}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => setSidePanels(side, { enabled: checked, width: sp?.width ?? 500 })}
                      />
                    </div>
                    {enabled && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <DimensionInput
                            label={t('calc.depthWidth')}
                            value={sp?.width ?? 500}
                            onChange={(w) => setSidePanels(side, { width: w })}
                            min={200}
                            max={3000}
                          />
                          <DimensionInput
                            label={t('calc.height')}
                            value={sp?.height ?? (config.partitionWall?.totalHeight ?? 2500)}
                            onChange={(h) => setSidePanels(side, { height: h })}
                            min={500}
                            max={4000}
                          />
                        </div>
                        {/* Profile type */}
                        <div className="space-y-1">
                          <Label className="text-xs">{t('calc.profileType')}</Label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { value: 12, label: '12 mm' },
                              { value: 22, label: '22 mm' },
                              { value: 25, label: t('calc.profileULabel') },
                            ].map((option) => (
                              <Card
                                key={option.value}
                                className={cn(
                                  "p-2 text-center cursor-pointer text-xs",
                                  spProfileWidth === option.value && "border-primary bg-primary/5"
                                )}
                                onClick={() => setSidePanels(side, { profileWidth: option.value })}
                              >
                                {option.label}
                              </Card>
                            ))}
                          </div>
                        </div>
                        {/* Profile sides */}
                        <div className="space-y-1">
                          <Label className="text-xs">{t('calc.profileSidesLabel')}</Label>
                          <div className="grid grid-cols-4 gap-1">
                            {([
                              { key: 'front' as const, label: t('calc.frontSide') },
                              { key: 'back' as const, label: t('calc.backSide') },
                              { key: 'top' as const, label: t('calc.top') },
                              { key: 'bottom' as const, label: t('calc.bottom') },
                            ]).map(({ key, label }) => (
                              <Card
                                key={key}
                                className={cn(
                                  "p-1.5 text-center cursor-pointer text-xs transition-colors",
                                  spProfileSides[key] ? "border-primary bg-primary/5" : "opacity-50"
                                )}
                                onClick={() => setSidePanels(side, { profileSides: { ...spProfileSides, [key]: !spProfileSides[key] } })}
                              >
                                {label}
                              </Card>
                            ))}
                          </div>
                        </div>
                        {/* Grid sections */}
                        {sp?.grid && (
                          <SidePanelGridConfig
                            side={side}
                            sp={sp}
                            onGridChange={setSidePanelGrid}
                            onColumnRowsChange={setSidePanelColumnRows}
                            onColumnWidthChange={setSidePanelColumnWidth}
                            onRowHeightChange={setSidePanelRowHeight}
                            onCellTypeChange={setSidePanelCellType}
                          />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('calc.surfaceLabel')}: {(((sp?.width ?? 500) * (sp?.height ?? (config.partitionWall?.totalHeight ?? 2500))) / 1000000).toFixed(2)} m²
                        </p>
                      </>
                    )}
                  </Card>
                );
              })}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">{t('calc.totalSurfaceLabel')}:</span>
                <span className="ml-2 font-medium">
                  {(() => {
                    const mainArea = (config.partitionWall?.totalWidth ?? 3000) * (config.partitionWall?.totalHeight ?? 2500);
                    const leftSp = config.partitionWall?.sidePanels?.left;
                    const rightSp = config.partitionWall?.sidePanels?.right;
                    const leftArea = leftSp?.enabled ? (leftSp.width * (leftSp.height ?? (config.partitionWall?.totalHeight ?? 2500))) : 0;
                    const rightArea = rightSp?.enabled ? (rightSp.width * (rightSp.height ?? (config.partitionWall?.totalHeight ?? 2500))) : 0;
                    return (((mainArea + leftArea + rightArea) * config.dimensions.quantity) / 1000000).toFixed(2);
                  })()} m²
                </span>
              </p>
            </div>
          </div>
        );
      
      case 3:
        // Grid configuration (no doors)
        if (!config.partitionWall) return null;
        return (
          <GridConfigStep
            config={config.partitionWall}
            onGridChange={setPartitionGrid}
            onColumnRowsChange={setColumnRows}
            onColumnWidthChange={updateColumnWidth}
            onRowHeightChange={updateRowHeight}
            onCellTypeChange={setCellType}
            onSplitCell={splitCellHorizontally}
            onDeleteSplit={deleteSplitRow}
            onUpdateDoor={updateDoorConfig}
            allowDoors={false}
          />
        );
      
      case 4:
        return renderGlassTypeStep();
      
      case 5:
        // Accessories for simple panel
        return (
          <div className="space-y-4">
            <AccessoryPresetManager
              productType="panel"
              category="mount_point"
              label={t('calc.mountPoints')}
              selectedCode={config.extraAccessories[0]?.materialCode}
              onSelect={(code) => {
                const existing = config.extraAccessories.findIndex(a => a.materialCode === code);
                if (existing < 0) {
                  addExtraAccessory({ materialCode: code, name: code, quantity: 1 });
                }
              }}
            />
            <CatalogProductSelector
              category="mount_point"
              label={t('calc.selectProductLabel')}
              value={config.extraAccessories.find(a => a.materialCode)?.materialCode}
              onValueChange={(code) => {
                if (code) {
                  const existing = config.extraAccessories.findIndex(a => a.materialCode === code);
                  if (existing < 0) {
                    addExtraAccessory({ materialCode: code, name: code, quantity: 1 });
                  }
                }
              }}
              productType="panel"
              className="mt-2"
            />
            <ExtraAccessoriesSection
              extraAccessories={config.extraAccessories}
              onAdd={addExtraAccessory}
              onRemove={removeExtraAccessory}
              onUpdate={updateExtraAccessory}
              productType="panel"
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

  const renderProcessedPanelStep = () => {
    switch (currentStep) {
      case 1:
        return <ProductTypeStep value={config.productType} onChange={setProductType} />;
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DimensionInput
                label={t('calc.width')}
                value={config.dimensions.width}
                onChange={(width) => setDimensions({ width })}
                min={100}
                max={4000}
              />
              <DimensionInput
                label={t('calc.height')}
                value={config.dimensions.height}
                onChange={(height) => setDimensions({ height })}
                min={100}
                max={3000}
              />
            </div>
            <DimensionInput
              label={t("calc.quantityDimLabel")}
              value={config.dimensions.quantity}
              onChange={(quantity) => setDimensions({ quantity })}
              min={1}
              max={100}
              unit={t('calc.pcs')}
            />
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">{t('calc.totalSurfaceLabel')}:</span>
                <span className="ml-2 font-medium">
                  {((config.dimensions.width * config.dimensions.height * config.dimensions.quantity) / 1000000).toFixed(2)} m²
                </span>
              </p>
            </div>
          </div>
        );
      
      case 3:
        return renderGlassTypeStep();
      
      case 4:
        return (
          <div className="space-y-4">
            {/* Holes */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">{t('calc.holes')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addHole({ diameter: 20, x: config.dimensions.width / 2, y: config.dimensions.height / 2 })}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {t('calc.addBtn')}
                </Button>
              </div>
              {config.processing.holes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">{t('calc.noHolesPanel')}</p>
              ) : (
                <div className="space-y-2">
                  {config.processing.holes.map((hole, i) => (
                    <div key={hole.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <span className="text-sm flex-1">{t('calc.holeDesc', { n: i + 1, d: hole.diameter, x: hole.x, y: hole.y })}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeHole(hole.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Edge polish */}
            <EdgePolishingOption
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
              glassPieces={[
                {
                  name: t('calc.panelPiece'),
                  width: config.dimensions.width,
                  height: config.dimensions.height,
                  quantity: config.dimensions.quantity,
                },
              ]}
            />

            {/* Sandblasting */}
            <Card className="p-4">
              <Label className="text-sm font-medium">{t('calc.sandblasting')}</Label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['none', 'full', 'partial'] as const).map((type) => (
                  <Card
                    key={type}
                    className={cn(
                      "p-2 text-center cursor-pointer text-sm",
                      config.processing.sandblasting === type && "border-primary bg-primary/5"
                    )}
                    onClick={() => setProcessing({ sandblasting: type })}
                  >
                    {type === 'none' ? t('calc.sandblastingNone') : type === 'full' ? t('calc.sandblastingFull') : t('calc.sandblastingPartial')}
                  </Card>
                ))}
              </div>
            </Card>

            {/* Accessories */}
            <AccessoryPresetManager
              productType="panel"
              category="mount_point"
              label={t('calc.mountPoints')}
              selectedCode={config.extraAccessories[0]?.materialCode}
              onSelect={(code) => {
                const existing = config.extraAccessories.findIndex(a => a.materialCode === code);
                if (existing < 0) {
                  addExtraAccessory({ materialCode: code, name: code, quantity: 1 });
                }
              }}
            />
            <CatalogProductSelector
              category="mount_point"
              label={t('calc.selectProductLabel')}
              value={config.extraAccessories.find(a => a.materialCode)?.materialCode}
              onValueChange={(code) => {
                if (code) {
                  const existing = config.extraAccessories.findIndex(a => a.materialCode === code);
                  if (existing < 0) {
                    addExtraAccessory({ materialCode: code, name: code, quantity: 1 });
                  }
                }
              }}
              productType="panel"
              className="mt-2"
            />

            <ExtraAccessoriesSection
              extraAccessories={config.extraAccessories}
              onAdd={addExtraAccessory}
              onRemove={removeExtraAccessory}
              onUpdate={updateExtraAccessory}
              productType="panel"
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

  // Build glass pieces list for edge polishing
  const getGlassPieces = (): import('@/components/calculators/shared/EdgePolishingOption').GlassPiece[] => {
    const pw = config.partitionWall;
    if (!pw) return [];

    const profileWidth = pw.profileWidth ?? 12;
    const profileInset = profileWidth === 25 ? 5 : profileWidth; // U profile = 5mm, others = profileWidth

    const pieces: import('@/components/calculators/shared/EdgePolishingOption').GlassPiece[] = [];

    // Group identical cells
    const cellMap = new Map<string, { width: number; height: number; count: number }>();
    pw.cells.forEach(cell => {
      if (cell.type === 'door' || cell.type === 'door_opening') return;
      const w = cell.width - (profileInset * 2);
      const h = cell.height - (profileInset * 2);
      if (w <= 0 || h <= 0) return;
      const key = `${w}x${h}`;
      const existing = cellMap.get(key);
      if (existing) existing.count++;
      else cellMap.set(key, { width: w, height: h, count: 1 });
    });

    let panelIdx = 1;
    cellMap.forEach(({ width, height, count }) => {
      pieces.push({
        name: `${t('calc.panelPiece')} ${panelIdx}`,
        width, height,
        quantity: count * config.dimensions.quantity,
      });
      panelIdx++;
    });

    // Door glass pieces
    pw.doors.forEach((door, i) => {
      const doorCell = pw.cells.find(c => c.id === door.cellId);
      if (!doorCell) return;
      const glassW = doorCell.width - 11;
      const glassH = doorCell.height - 18;
      if (glassW <= 0 || glassH <= 0) return;
      pieces.push({
        name: t('calc.doorPiece', { n: i + 1 }),
        width: glassW, height: glassH,
        quantity: config.dimensions.quantity,
      });
    });

    return pieces;
  };

  const renderGlassTypeStep = () => (
    <div className="space-y-4">
      <GlassModelSelector
        items={pricingItems}
        currentThickness={config.glass.thickness}
        currentType={config.glass.type}
        allowedThicknesses={[6, 8, 10, 12]}
        productType="panel"
        onChange={(model) => setGlass({ thickness: model.thickness as GlassThickness, type: model.type as GlassType, colorHex: model.colorHex })}
      />
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <span className="text-sm">{t('calc.temperedCalire')}</span>
        <Switch
          checked={config.glass.tempered}
          onCheckedChange={(tempered) => setGlass({ tempered })}
        />
      </div>
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <span className="text-sm">{t('calc.laminatedLabel')}</span>
        <Switch
          checked={config.glass.laminated}
          onCheckedChange={(laminated) => setGlass({ laminated })}
        />
      </div>
      <div className="space-y-3">
        <Label>{t('calc.sandblastWithModel')}</Label>
        <Select
          value={config.processing.sandblasting}
          onValueChange={(val: 'none' | 'full' | 'partial') => setProcessing({ sandblasting: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('calc.noSandblasting')}</SelectItem>
            <SelectItem value="full">{t('calc.fullSandblasting')}</SelectItem>
            <SelectItem value="partial">{t('calc.partialSandblasting')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <EdgeTypeSelector
        enabled={config.edgePolish.enabled}
        polishType={config.edgePolish.type}
        onEnabledChange={(enabled) => setEdgePolish({ enabled })}
        onPolishTypeChange={(type) => setEdgePolish({ type })}
      />
    </div>
  );

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
    <SceneSetup cameraPosition={[2, 1.5, 2]} cameraFov={50}>
      <GlassColorContext.Provider value={config.glass.colorHex}>
        {(config.productType === 'partition_wall' || config.productType === 'simple') && config.partitionWall ? (
          <PartitionWallViewer3D config={config} onUpdateLabelOffset={updateDoorLabelOffset} />
        ) : (
          <PanelViewer3D config={config} />
        )}
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
    <AppLayout title={t('calc.panelTitle')}>
      <CalculatorLayout
        title={t('calc.panelConfigurator')}
        subtitle={t('calc.panelSubtitle')}
        formSection={formSection}
        viewerSection={viewerSection}
        summarySection={summarySection}
        isOfferStep={isOfferStep}
      />
    </AppLayout>
  );
}

// Re-export from shared module for backward compatibility
import { EditableDimInput } from '@/components/calculators/shared/EditableDimInput';

// Side panel grid configuration inline component
function SidePanelGridConfig({
  side,
  sp,
  onGridChange,
  onColumnRowsChange,
  onColumnWidthChange,
  onRowHeightChange,
  onCellTypeChange,
}: {
  side: 'left' | 'right';
  sp: { grid?: import('@/types/calculators').PartitionWallGrid; cells?: import('@/types/calculators').GridCell[]; width: number; height?: number };
  onGridChange: (side: 'left' | 'right', columns: number) => void;
  onColumnRowsChange: (side: 'left' | 'right', colIndex: number, rows: number) => void;
  onColumnWidthChange: (side: 'left' | 'right', colIndex: number, width: number) => void;
  onRowHeightChange: (side: 'left' | 'right', colIndex: number, rowIndex: number, height: number) => void;
  onCellTypeChange: (side: 'left' | 'right', cellId: string, type: import('@/types/calculators').PartitionCellType) => void;
}) {
  const { t } = useTranslation();
  const grid = sp.grid!;
  const cells = sp.cells || [];

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{t('calc.sectionsGridLabel')}</Label>
      {/* Column count */}
      <div className="flex items-center gap-2">
        <Columns className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs flex-1">{t('calc.columnsGridLabel')}</span>
        <EditableDimInput
          value={grid.columns}
          onCommit={(v) => onGridChange(side, Math.max(1, Math.min(10, v)))}
          min={1}
          max={10}
          className="w-14 h-7 text-center text-xs p-1"
        />
      </div>
      {/* Per-column config */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(grid.columns, 4)}, 1fr)` }}>
        {Array.from({ length: grid.columns }).map((_, colIdx) => {
          const rowCount = grid.columnRows[colIdx] || 1;
          const rowHeights = grid.columnRowHeights[colIdx] || [];
          const colCells = cells.filter(c => c.col === colIdx).sort((a, b) => a.row - b.row);

          return (
            <div key={`sp-col-${colIdx}`} className="p-1.5 bg-muted/30 rounded space-y-1">
              <span className="text-[10px] font-medium text-muted-foreground block text-center">C{colIdx + 1}</span>
              {/* Column width */}
              <div className="flex items-center gap-0.5">
                <EditableDimInput
                  value={grid.columnWidths[colIdx] || 0}
                  onCommit={(v) => onColumnWidthChange(side, colIdx, v)}
                  min={200}
                  max={5000}
                  className="w-full h-6 text-center text-[10px] p-0.5"
                />
                <span className="text-[9px] text-muted-foreground">mm</span>
              </div>
              {/* Row count */}
              <div className="flex items-center gap-0.5">
                <Rows className="h-2.5 w-2.5 text-primary" />
                <EditableDimInput
                  value={rowCount}
                  onCommit={(v) => onColumnRowsChange(side, colIdx, Math.max(1, Math.min(10, v)))}
                  min={1}
                  max={10}
                  className="w-full h-6 text-center text-[10px] p-0.5"
                />
              </div>
              {/* Cells in this column */}
              {colCells.map((cell, idx) => {
                const rowIdx = rowCount - 1 - idx;
                const actualCell = colCells[rowIdx];
                if (!actualCell) return null;
                const isPanel = actualCell.type === 'panel';
                return (
                  <div key={actualCell.id} className="space-y-0.5">
                    <button
                      className={cn(
                        "w-full text-[9px] p-1 rounded border text-center",
                        isPanel ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800" : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                      )}
                      onClick={() => onCellTypeChange(side, actualCell.id, isPanel ? 'door_opening' : 'panel')}
                    >
                      {isPanel ? '■' : '□'}
                    </button>
                    <div className="flex items-center gap-0.5">
                      <EditableDimInput
                        value={rowHeights[actualCell.row] || 0}
                        onCommit={(v) => onRowHeightChange(side, colIdx, actualCell.row, v)}
                        min={100}
                        max={5000}
                        className="w-full h-5 text-center text-[9px] p-0.5"
                      />
                      <span className="text-[8px] text-muted-foreground">mm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PanelViewer3D({ config }: { config: ReturnType<typeof usePanelCalculator>['config'] }) {
  const SCALE = 0.001;
  const width = config.dimensions.width * SCALE;
  const height = config.dimensions.height * SCALE;
  const glassThickness = config.glass.thickness * SCALE;

  const glassType = config.processing.sandblasting === 'full' ? 'frosted' : 
                    config.processing.sandblasting === 'partial' ? 'frosted' : config.glass.type;

  return (
    <group position={[0, 0, 0]}>
      <SimpleDimensionLines widthMm={config.dimensions.width} heightMm={config.dimensions.height} />
      {/* Panel */}
      <mesh castShadow>
        <boxGeometry args={[width, height, glassThickness]} />
        <GlassMaterial type={glassType as 'clear' | 'frosted' | 'patterned'} />
      </mesh>

      {/* Holes visualization */}
      {config.processing.holes.map((hole) => (
        <mesh
          key={hole.id}
          position={[
            (hole.x - config.dimensions.width / 2) * SCALE,
            (hole.y - config.dimensions.height / 2) * SCALE,
            0
          ]}
        >
          <cylinderGeometry args={[hole.diameter * SCALE / 2, hole.diameter * SCALE / 2, glassThickness + 0.01, 16]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  );
}

function DraggableLabel({ 
  position, 
  label, 
  onDragEnd 
}: { 
  position: [number, number, number]; 
  label: string; 
  onDragEnd: (offset: { x: number; y: number }) => void;
}) {
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const offsetRef = useRef(offset);
  const { controls } = useThree();

  // Keep ref in sync for window event handlers
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y };
    
    // Disable OrbitControls during drag
    if (controls && 'enabled' in controls) {
      (controls as any).enabled = false;
    }

    const onMove = (ev: PointerEvent) => {
      if (!dragStartRef.current) return;
      const scale = 0.002;
      const dx = (ev.clientX - dragStartRef.current.x) * scale;
      const dy = -(ev.clientY - dragStartRef.current.y) * scale;
      const newOffset = { x: dragStartRef.current.ox + dx, y: dragStartRef.current.oy + dy };
      offsetRef.current = newOffset;
      setOffset(newOffset);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setIsDragging(false);
      dragStartRef.current = null;
      onDragEnd(offsetRef.current);
      // Re-enable OrbitControls
      if (controls && 'enabled' in controls) {
        (controls as any).enabled = true;
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [controls, onDragEnd]);

  const pos: [number, number, number] = [
    position[0] + offset.x,
    position[1] + offset.y,
    position[2],
  ];

  return (
    <Html position={pos} center style={{ pointerEvents: 'auto' }}>
      <span
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          color: '#1a1a1a',
          fontSize: '8px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          padding: '2px 5px',
          borderRadius: '2px',
          background: isDragging 
            ? 'rgba(59, 130, 246, 0.25)' 
            : isHovered 
              ? 'rgba(59, 130, 246, 0.12)' 
              : 'rgba(255, 255, 255, 0.7)',
          border: isDragging 
            ? '1.5px solid rgba(59, 130, 246, 0.5)' 
            : isHovered 
              ? '1px solid rgba(59, 130, 246, 0.3)' 
              : '1px solid rgba(0,0,0,0.1)',
          transition: isDragging ? 'none' : 'background 0.15s, border 0.15s',
          boxShadow: isDragging ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {label}
      </span>
    </Html>
  );
}

function PartitionWallViewer3D({ config, onUpdateLabelOffset }: { config: ReturnType<typeof usePanelCalculator>['config']; onUpdateLabelOffset: (cellId: string, labelKey: string, offset: { x: number; y: number }) => void }) {
  const SCALE = 0.001;
  const partitionWall = config.partitionWall;
  
  if (!partitionWall) return null;
  
  // Resolve profile finish from catalog selection or fallback
  const profileFinish = partitionWall.profileMaterialCode || 'anodized_silver';
  
  const { cells, grid, profileWidth, totalWidth, totalHeight } = partitionWall;
  const glassThickness = config.glass.thickness * SCALE;
  // Glass inset per side based on profile type: 12mm→12mm, 22mm→22mm, U profile (25mm)→5mm
  const glassInsetPerSide = profileWidth === 25 ? 5 : profileWidth; // mm
  const glassInset = glassInsetPerSide * 2 * SCALE; // total inset (both sides)
  const profileWidthScaled = profileWidth * SCALE;
  const innerProfileScale = 0.5; // inner profiles are 50% thinner than outer frame
  const innerProfileWidth = profileWidthScaled * innerProfileScale;
  
  // Calculate offset to center the wall
  const offsetX = -totalWidth * SCALE / 2;
  const offsetY = -totalHeight * SCALE / 2;
  
  // Calculate cumulative positions
  const getColumnStart = (colIdx: number): number => {
    let start = 0;
    for (let i = 0; i < colIdx; i++) {
      start += grid.columnWidths[i] + profileWidth;
    }
    return start;
  };
  
  // Calculate row start position within a column using actual heights
  const getRowStartInColumn = (colIdx: number, rowIdx: number): number => {
    const rowHeights = grid.columnRowHeights[colIdx] || [];
    let start = 0;
    for (let i = 0; i < rowIdx; i++) {
      start += (rowHeights[i] || 0) + profileWidth;
    }
    return start;
  };

  return (
    <group position={[0, 0, 0]}>
      <SimpleDimensionLines widthMm={totalWidth} heightMm={totalHeight} />
      {/* Render cells */}
      {cells.map((cell) => {
        const x = getColumnStart(cell.col) * SCALE + cell.width * SCALE / 2 + offsetX;
        const y = getRowStartInColumn(cell.col, cell.row) * SCALE + cell.height * SCALE / 2 + offsetY;
        const w = cell.width * SCALE - glassInset;
        const h = cell.height * SCALE - glassInset;
        
        const glassType = config.glass.type === 'frosted' ? 'frosted' : 'clear';
        
        if (cell.type === 'panel') {
          // Check if there's a door below this panel that has GK30 enabled
          const doorBelowConfig = (() => {
            const doorBelow = partitionWall.doors.find(d => {
              const doorCell = cells.find(c => c.id === d.cellId);
              return doorCell && doorCell.col === cell.col && doorCell.row === cell.row - 1;
            });
            return doorBelow;
          })();
          const gk30Qty = doorBelowConfig?.accessories.gk30?.quantity ?? 0;
          const doorW = doorBelowConfig ? doorBelowConfig.doorWidth * SCALE : 0;
          const hingeSide = doorBelowConfig?.hingeSide || 'left';
          const handleXForGk = hingeSide === 'left' ? doorW / 2 - 0.05 : -doorW / 2 + 0.05;

          return (
            <group key={cell.id}>
              <mesh position={[x, y, 0]} castShadow>
                <boxGeometry args={[w, h, glassThickness]} />
                <GlassMaterial type={glassType as 'clear' | 'frosted' | 'patterned'} />
              </mesh>
              {gk30Qty > 0 && doorBelowConfig &&
                Array.from({ length: gk30Qty }).map((_, i) => {
                  const key = i === 0 ? 'gk30' : `gk30_${i}`;
                  return (
                    <DraggableLabel
                      key={`gk30-${cell.id}-${i}`}
                      position={[
                        x + handleXForGk + (doorBelowConfig.accessories.labelOffsets?.[key]?.x || 0),
                        y - h / 2 + 0.06 + i * 0.06 + (doorBelowConfig.accessories.labelOffsets?.[key]?.y || 0),
                        0.01
                      ]}
                      label="GK30"
                      onDragEnd={(o) => onUpdateLabelOffset(doorBelowConfig.cellId, key, o)}
                    />
                  );
                })
              }
            </group>
          );
        }
        
        if (cell.type === 'door') {
          const doorConfig = partitionWall.doors.find(d => d.cellId === cell.id);
          if (!doorConfig) return null;
          
          const doorW = doorConfig.doorWidth * SCALE;
          const doorH = doorConfig.doorHeight * SCALE;
          const hingeSide = doorConfig.hingeSide || 'left';
          const isSliding = doorConfig.doorType === 'sliding';
          const hingeX = hingeSide === 'left' ? -doorW / 2 + 0.025 : doorW / 2 - 0.025;
          // For sliding: handle on opposite side of arrow; for hinged/pivot: opposite of hinge
          const handleX = isSliding
            ? (hingeSide === 'left' ? -doorW / 2 + 0.05 : doorW / 2 - 0.05)
            : (hingeSide === 'left' ? doorW / 2 - 0.05 : -doorW / 2 + 0.05);
          
          // Hinge positions: pivot = corners (top/bottom), hinged = use quantity-based positions
          const isPivot = doorConfig.doorType === 'pivot';
          const hingeQty = doorConfig.accessories.hinges.quantity || 2;
          const hingePositions = isPivot
            ? [
                -doorH / 2 + 0.015,  // bottom corner
                doorH / 2 - 0.015,   // top corner
              ]
            : doorConfig.accessories.hinges.positions && doorConfig.accessories.hinges.positions.length > 0
              ? doorConfig.accessories.hinges.positions.map(posMm => {
                  // positions are in mm from top → convert to local Y (center origin)
                  const fromTop = posMm * SCALE;
                  return doorH / 2 - fromTop;
                })
              : hingeQty === 3
                ? [
                    doorH * 0.15 - doorH / 2,
                    0,  // middle
                    doorH * 0.85 - doorH / 2,
                  ]
                : [
                    doorH * 0.15 - doorH / 2,
                    doorH * 0.85 - doorH / 2,
                  ];
          
          // Sliding arrow direction based on hingeSide
          const arrowDir = hingeSide === 'left' ? 1 : -1;
          const arrowX = arrowDir * doorW * 0.15;
          const arrowLen = doorW * 0.35;
          
          return (
            <group key={cell.id} position={[x, y, 0]}>
              {/* Door frame / opening */}
              <mesh position={[0, 0, -0.005]}>
                <boxGeometry args={[w, h, 0.01]} />
                <meshStandardMaterial color="#1a1a1a" opacity={0.1} transparent />
              </mesh>
              
              {/* Door panel */}
              <mesh position={[0, (h - doorH) / 2 - h / 2 + doorH / 2, 0]} castShadow>
                <boxGeometry args={[doorW, doorH, glassThickness]} />
                <GlassMaterial type={glassType as 'clear' | 'frosted' | 'patterned'} />
              </mesh>
              
              {isSliding ? (
                <>
                  {/* Sliding rail on top */}
                  <mesh position={[0, (h - doorH) / 2 - h / 2 + doorH + 0.015, 0]}>
                    <boxGeometry args={[w * 0.9, 0.02, 0.025]} />
                    <MetalMaterial finish={doorConfig.accessories.hinges?.finish || profileFinish} />
                  </mesh>
                  {/* Arrow shaft */}
                  <mesh position={[arrowX, 0, glassThickness / 2 + 0.012]}>
                    <boxGeometry args={[arrowLen, 0.015, 0.005]} />
                    <MetalMaterial finish={doorConfig.accessories.hinges?.finish || profileFinish} />
                  </mesh>
                  {/* Arrow head (two angled bars) */}
                  <mesh position={[arrowX + arrowDir * arrowLen / 2, 0.025, glassThickness / 2 + 0.012]} rotation={[0, 0, arrowDir * -0.6]}>
                    <boxGeometry args={[0.06, 0.015, 0.005]} />
                    <MetalMaterial finish={doorConfig.accessories.hinges?.finish || profileFinish} />
                  </mesh>
                  <mesh position={[arrowX + arrowDir * arrowLen / 2, -0.025, glassThickness / 2 + 0.012]} rotation={[0, 0, arrowDir * 0.6]}>
                    <boxGeometry args={[0.06, 0.015, 0.005]} />
                    <MetalMaterial finish={doorConfig.accessories.hinges?.finish || profileFinish} />
                  </mesh>
                </>
              ) : (
                <>
                  {/* Hinges */}
                  {hingePositions.map((hy, i) => (
                    <mesh
                      key={`hinge-${i}`}
                      position={[hingeX, (h - doorH) / 2 - h / 2 + doorH / 2 + hy, glassThickness / 2 + 0.007]}
                    >
                      <boxGeometry args={isPivot ? [0.08, 0.04, 0.018] : [0.04, 0.08, 0.018]} />
                      <MetalMaterial finish={doorConfig.accessories.hinges?.finish || profileFinish} />
                    </mesh>
                  ))}
                </>
              )}
              
              {/* Handle */}
              <HandleMesh
                model={doorConfig.accessories.handle.model}
                length={doorConfig.accessories.handle.length * SCALE}
                finish={doorConfig.accessories.handle.finish}
                position={[handleX, doorConfig.accessories.handle.positionY
                  ? (doorConfig.accessories.handle.positionY * SCALE - doorH / 2)
                  : 0, glassThickness / 2 + 0.01]}
              />

              {/* Accessory labels - slot-based stacking to prevent overlaps */}
              {(() => {
                const slots = { bottomCenter: 0, topCenter: 0, bottomHinge: 0, topHinge: 0, bottomHandle: 0 };
                const labels: React.ReactNode[] = [];

                // ptBottom → bottom-center region
                if (doorConfig.accessories.ptBottom && doorConfig.accessories.ptBottom.quantity > 0) {
                  for (let i = 0; i < doorConfig.accessories.ptBottom.quantity; i++) {
                    const key = i === 0 ? 'ptBottom' : `ptBottom_${i}`;
                    const slotIdx = slots.bottomCenter++;
                    labels.push(
                      <DraggableLabel
                        key={`ptBottom-${i}`}
                        position={[
                          (doorConfig.accessories.labelOffsets?.[key]?.x || 0),
                          -doorH / 2 + 0.06 + slotIdx * 0.06 + (doorConfig.accessories.labelOffsets?.[key]?.y || 0),
                          0.01
                        ]}
                        label={`PT${doorConfig.accessories.ptBottom!.size || 10}`}
                        onDragEnd={(o) => onUpdateLabelOffset(doorConfig.cellId, key, o)}
                      />
                    );
                  }
                }

                // ptTop → top-center region
                if (doorConfig.accessories.ptTop && doorConfig.accessories.ptTop.quantity > 0) {
                  for (let i = 0; i < doorConfig.accessories.ptTop.quantity; i++) {
                    const key = i === 0 ? 'ptTop' : `ptTop_${i}`;
                    const slotIdx = slots.topCenter++;
                    labels.push(
                      <DraggableLabel
                        key={`ptTop-${i}`}
                        position={[
                          (doorConfig.accessories.labelOffsets?.[key]?.x || 0),
                          doorH / 2 - 0.06 - slotIdx * 0.06 + (doorConfig.accessories.labelOffsets?.[key]?.y || 0),
                          0.01
                        ]}
                        label={`PT${doorConfig.accessories.ptTop!.size || 20}`}
                        onDragEnd={(o) => onUpdateLabelOffset(doorConfig.cellId, key, o)}
                      />
                    );
                  }
                }

                // bts → bottom-hinge region
                if (doorConfig.accessories.bts && doorConfig.accessories.bts.quantity > 0) {
                  for (let i = 0; i < doorConfig.accessories.bts.quantity; i++) {
                    const key = i === 0 ? 'bts' : `bts_${i}`;
                    const slotIdx = slots.bottomHinge++;
                    labels.push(
                      <DraggableLabel
                        key={`bts-${i}`}
                        position={[
                          hingeX + (doorConfig.accessories.labelOffsets?.[key]?.x || 0),
                          -doorH / 2 - 0.06 + slotIdx * 0.06 + (doorConfig.accessories.labelOffsets?.[key]?.y || 0),
                          0.01
                        ]}
                        label="BTS"
                        onDragEnd={(o) => onUpdateLabelOffset(doorConfig.cellId, key, o)}
                      />
                    );
                  }
                }

                // pt40 → top-hinge region
                if (doorConfig.accessories.pt40 && doorConfig.accessories.pt40.quantity > 0) {
                  for (let i = 0; i < doorConfig.accessories.pt40.quantity; i++) {
                    const key = i === 0 ? 'pt40' : `pt40_${i}`;
                    const slotIdx = slots.topHinge++;
                    labels.push(
                      <DraggableLabel
                        key={`pt40-${i}`}
                        position={[
                          hingeX + (doorConfig.accessories.labelOffsets?.[key]?.x || 0),
                          doorH / 2 + 0.04 - slotIdx * 0.06 + (doorConfig.accessories.labelOffsets?.[key]?.y || 0),
                          0.01
                        ]}
                        label="PT40"
                        onDragEnd={(o) => onUpdateLabelOffset(doorConfig.cellId, key, o)}
                      />
                    );
                  }
                }

                // us → bottom-handle region
                if ((doorConfig.accessories.us?.quantity ?? 0) > 0) {
                  for (let i = 0; i < doorConfig.accessories.us!.quantity; i++) {
                    const key = i === 0 ? 'us' : `us_${i}`;
                    const slotIdx = slots.bottomHandle++;
                    labels.push(
                      <DraggableLabel
                        key={`us-${i}`}
                        position={[
                          handleX + (doorConfig.accessories.labelOffsets?.[key]?.x || 0),
                          -doorH / 2 + 0.06 + slotIdx * 0.06 + (doorConfig.accessories.labelOffsets?.[key]?.y || 0),
                          0.01
                        ]}
                        label="US10"
                        onDragEnd={(o) => onUpdateLabelOffset(doorConfig.cellId, key, o)}
                      />
                    );
                  }
                }

                // blockers → bottom-handle region (continues from us slots)
                if ((doorConfig.accessories.blockers?.quantity ?? 0) > 0) {
                  for (let i = 0; i < doorConfig.accessories.blockers!.quantity; i++) {
                    const key = i === 0 ? 'blocker' : `blocker_${i}`;
                    const slotIdx = slots.bottomHandle++;
                    labels.push(
                      <DraggableLabel
                        key={`blocker-${i}`}
                        position={[
                          handleX + (doorConfig.accessories.labelOffsets?.[key]?.x || 0),
                          -doorH / 2 + 0.06 + slotIdx * 0.06 + (doorConfig.accessories.labelOffsets?.[key]?.y || 0),
                          0.01
                        ]}
                        label="BLOCKER"
                        onDragEnd={(o) => onUpdateLabelOffset(doorConfig.cellId, key, o)}
                      />
                    );
                  }
                }

                return labels;
              })()}
              {/* GK30 is rendered on the fixed panel above the door, not here */}
            </group>
          );
        }
        
        if (cell.type === 'door_opening') {
          // Empty opening - just show outline
          return (
            <mesh key={cell.id} position={[x, y, -0.005]}>
              <boxGeometry args={[w, h, 0.01]} />
              <meshStandardMaterial color="#f0f0f0" opacity={0.2} transparent />
            </mesh>
          );
        }
        
        return null;
      })}
      
      {/* Render vertical profiles */}
      {Array.from({ length: grid.columns - 1 }).map((_, colIdx) => {
        const x = (getColumnStart(colIdx + 1) - profileWidth / 2) * SCALE + offsetX;
        const h = totalHeight * SCALE;
        
        return (
          <mesh key={`v-profile-${colIdx}`} position={[x, 0, 0]}>
            <boxGeometry args={[innerProfileWidth, h, innerProfileWidth]} />
            <MetalMaterial finish={profileFinish} />
          </mesh>
        );
      })}
      
      {/* Render horizontal profiles for each column */}
      {Array.from({ length: grid.columns }).flatMap((_, colIdx) => {
        const rowCount = grid.columnRows[colIdx] || 1;
        if (rowCount <= 1) return [];
        
        const colX = getColumnStart(colIdx) * SCALE + (grid.columnWidths[colIdx] / 2) * SCALE + offsetX;
        const colWidth = grid.columnWidths[colIdx] * SCALE;
        
        return Array.from({ length: rowCount - 1 }).map((__, rowIdx) => {
          const y = getRowStartInColumn(colIdx, rowIdx + 1) * SCALE - (profileWidth / 2) * SCALE + offsetY;
          
          return (
            <mesh key={`h-profile-${colIdx}-${rowIdx}`} position={[colX, y, 0]}>
              <boxGeometry args={[colWidth, innerProfileWidth, innerProfileWidth]} />
              <MetalMaterial finish={profileFinish} />
            </mesh>
          );
        });
      })}
      
      {/* Outer frame - conditionally render each side */}
      {/* Top & Bottom profiles - segmented around doors */}
      {(() => {
        // Identify door cells and their X/Y ranges
        const doorRanges = cells
          .filter(c => c.type === 'door')
          .map(c => {
            const colRows = grid.columnRows[c.col] || 1;
            const isBottomRow = c.row === colRows - 1 || colRows === 1;
            const hasFixedAbove = colRows > 1 && c.row === colRows - 1;
            const xStart = getColumnStart(c.col);
            const xEnd = xStart + c.width;
            const yStart = getRowStartInColumn(c.col, c.row);
            const yEnd = yStart + c.height;
            const isLeftCol = c.col === 0;
            const isRightCol = c.col === grid.columns - 1;
            return { col: c.col, xStart, xEnd, yStart, yEnd, isBottomRow, hasFixedAbove, isLeftCol, isRightCol };
          });

        // Build segments by excluding skip ranges from [0, totalWidth]
        const buildSegments = (skipRanges: { xStart: number; xEnd: number }[]) => {
          const sorted = [...skipRanges].sort((a, b) => a.xStart - b.xStart);
          const segments: { xStart: number; xEnd: number }[] = [];
          let cursor = 0;
          for (const r of sorted) {
            if (r.xStart > cursor) segments.push({ xStart: cursor, xEnd: r.xStart });
            cursor = Math.max(cursor, r.xEnd);
          }
          if (cursor < totalWidth) segments.push({ xStart: cursor, xEnd: totalWidth });
          return segments;
        };

        // Bottom: always skip door columns at bottom row
        const bottomSkips = doorRanges.filter(d => d.isBottomRow);
        // Top: skip only if door is in single-row column (no fixed panel above)
        const topSkips = doorRanges.filter(d => !d.hasFixedAbove);

        const bottomSegments = buildSegments(bottomSkips);
        const topSegments = buildSegments(topSkips);

        const profileExtension = profileWidthScaled; // extension on each side for left/right profile overlap

        // Build vertical segments for left/right profiles (skip door Y ranges)
        const buildVerticalSegments = (skipRanges: { yStart: number; yEnd: number }[]) => {
          const sorted = [...skipRanges].sort((a, b) => a.yStart - b.yStart);
          const segments: { yStart: number; yEnd: number }[] = [];
          let cursor = 0;
          for (const r of sorted) {
            if (r.yStart > cursor) segments.push({ yStart: cursor, yEnd: r.yStart });
            cursor = Math.max(cursor, r.yEnd);
          }
          if (cursor < totalHeight) segments.push({ yStart: cursor, yEnd: totalHeight });
          return segments;
        };

        const leftSkips = doorRanges.filter(d => d.isLeftCol);
        const rightSkips = doorRanges.filter(d => d.isRightCol);
        const leftSegments = buildVerticalSegments(leftSkips);
        const rightSegments = buildVerticalSegments(rightSkips);

        return (
          <>
            {/* Top segments */}
            {partitionWall.profileSides.top && topSegments.map((seg, i) => {
              const segW = (seg.xEnd - seg.xStart) * SCALE;
              const segCenterX = (seg.xStart + (seg.xEnd - seg.xStart) / 2) * SCALE + offsetX;
              const extLeft = seg.xStart === 0 ? profileExtension : 0;
              const extRight = seg.xEnd === totalWidth ? profileExtension : 0;
              return (
                <mesh key={`top-seg-${i}`} position={[segCenterX + (extRight - extLeft) / 2, totalHeight * SCALE / 2 + profileWidthScaled / 2, 0]}>
                  <boxGeometry args={[segW + extLeft + extRight, profileWidthScaled, profileWidthScaled]} />
                  <MetalMaterial finish={profileFinish} />
                </mesh>
              );
            })}
            {/* Bottom segments */}
            {partitionWall.profileSides.bottom && bottomSegments.map((seg, i) => {
              const segW = (seg.xEnd - seg.xStart) * SCALE;
              const segCenterX = (seg.xStart + (seg.xEnd - seg.xStart) / 2) * SCALE + offsetX;
              const extLeft = seg.xStart === 0 ? profileExtension : 0;
              const extRight = seg.xEnd === totalWidth ? profileExtension : 0;
              return (
                <mesh key={`bot-seg-${i}`} position={[segCenterX + (extRight - extLeft) / 2, -totalHeight * SCALE / 2 - profileWidthScaled / 2, 0]}>
                  <boxGeometry args={[segW + extLeft + extRight, profileWidthScaled, profileWidthScaled]} />
                  <MetalMaterial finish={profileFinish} />
                </mesh>
              );
            })}
            {/* Left profile - segmented around doors */}
            {partitionWall.profileSides.left && leftSegments.map((seg, i) => {
              const segH = (seg.yEnd - seg.yStart) * SCALE;
              const segCenterY = (seg.yStart + (seg.yEnd - seg.yStart) / 2) * SCALE + offsetY;
              const extBot = seg.yStart === 0 ? profileExtension : 0;
              const extTop = seg.yEnd === totalHeight ? profileExtension : 0;
              return (
                <mesh key={`left-seg-${i}`} position={[
                  -totalWidth * SCALE / 2 - profileWidthScaled / 2,
                  segCenterY + (extTop - extBot) / 2,
                  0
                ]}>
                  <boxGeometry args={[profileWidthScaled, segH + extBot + extTop, profileWidthScaled]} />
                  <MetalMaterial finish={profileFinish} />
                </mesh>
              );
            })}
            {/* Right profile - segmented around doors */}
            {partitionWall.profileSides.right && rightSegments.map((seg, i) => {
              const segH = (seg.yEnd - seg.yStart) * SCALE;
              const segCenterY = (seg.yStart + (seg.yEnd - seg.yStart) / 2) * SCALE + offsetY;
              const extBot = seg.yStart === 0 ? profileExtension : 0;
              const extTop = seg.yEnd === totalHeight ? profileExtension : 0;
              return (
                <mesh key={`right-seg-${i}`} position={[
                  totalWidth * SCALE / 2 + profileWidthScaled / 2,
                  segCenterY + (extTop - extBot) / 2,
                  0
                ]}>
                  <boxGeometry args={[profileWidthScaled, segH + extBot + extTop, profileWidthScaled]} />
                  <MetalMaterial finish={profileFinish} />
                </mesh>
              );
            })}
          </>
        );
      })()}
      
      {/* Side panels at 90° */}
      {(['left', 'right'] as const).map((side) => {
        const sp = partitionWall.sidePanels?.[side];
        if (!sp?.enabled) return null;
        const spPWmm = sp.profileWidth ?? 12;
        const spGrid = sp.grid;
        const spCells = sp.cells;

        // Calculate actual total height from grid data (rows + inner profiles)
        const computedSideH = (() => {
          if (!spGrid) return (sp.height ?? totalHeight);
          let maxColH = 0;
          for (let c = 0; c < spGrid.columns; c++) {
            const rh = spGrid.columnRowHeights[c] || [];
            const rowCount = spGrid.columnRows[c] || 1;
            const colH = rh.reduce((s: number, h: number) => s + h, 0) + Math.max(0, rowCount - 1) * spPWmm;
            if (colH > maxColH) maxColH = colH;
          }
          return maxColH > 0 ? maxColH : (sp.height ?? totalHeight);
        })();
        // Similarly for width
        const computedSideW = (() => {
          if (!spGrid) return sp.width;
          const colsW = spGrid.columnWidths.reduce((s: number, w: number) => s + w, 0);
          return colsW + Math.max(0, spGrid.columns - 1) * spPWmm;
        })();

        const sideW = computedSideW * SCALE;
        const sideH = computedSideH * SCALE;
        const spPW = spPWmm * SCALE;
        const spSides = sp.profileSides ?? { front: true, back: true, top: true, bottom: true };
        const yOff = sideH < totalHeight * SCALE ? -(totalHeight * SCALE - sideH) / 2 : 0;
        const xPos = side === 'left' ? -totalWidth * SCALE / 2 : totalWidth * SCALE / 2;
        const spGlassType = config.glass.type === 'frosted' ? 'frosted' : 'clear';
        const spGlassInset = (spPWmm === 25 ? 5 : spPWmm) * 2 * SCALE;
        const spInnerPW = spPW * innerProfileScale;

        const getSpColStart = (colIdx: number) => {
          let start = 0;
          if (!spGrid) return start;
          for (let i = 0; i < colIdx; i++) start += spGrid.columnWidths[i] + spPWmm;
          return start;
        };
        const getSpRowStart = (colIdx: number, rowIdx: number) => {
          if (!spGrid) return 0;
          const rh = spGrid.columnRowHeights[colIdx] || [];
          let start = 0;
          for (let i = 0; i < rowIdx; i++) start += (rh[i] || 0) + spPWmm;
          return start;
        };

        return (
          <group key={`sp-${side}`}>
            {spCells && spGrid ? spCells.map((cell) => {
              const cz = getSpColStart(cell.col) * SCALE + cell.width * SCALE / 2;
              const cy = getSpRowStart(cell.col, cell.row) * SCALE + cell.height * SCALE / 2 - sideH / 2 + yOff;
              const cw = cell.width * SCALE - spGlassInset;
              const ch = cell.height * SCALE - spGlassInset;
              if (cw <= 0 || ch <= 0) return null;
              if (cell.type === 'door_opening') {
                return (
                  <mesh key={cell.id} position={[xPos, cy, -cz]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[cw, ch, 0.01]} />
                    <meshStandardMaterial color="#f0f0f0" opacity={0.2} transparent />
                  </mesh>
                );
              }
              return (
                <mesh key={cell.id} position={[xPos, cy, -cz]} rotation={[0, Math.PI / 2, 0]} castShadow>
                  <boxGeometry args={[cw, ch, glassThickness]} />
                  <GlassMaterial type={spGlassType as any} />
                </mesh>
              );
            }) : (
              <mesh position={[xPos, yOff, -sideW / 2]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <boxGeometry args={[sideW, sideH, glassThickness]} />
                <GlassMaterial type={spGlassType as any} />
              </mesh>
            )}
            {spGrid && Array.from({ length: spGrid.columns - 1 }).map((_, colIdx) => {
              const pz = (getSpColStart(colIdx + 1) - spPWmm / 2) * SCALE;
              return (
                <mesh key={`sp-vp-${side}-${colIdx}`} position={[xPos, yOff, -pz]} rotation={[0, Math.PI / 2, 0]}>
                  <boxGeometry args={[spInnerPW, sideH, spInnerPW]} />
                  <MetalMaterial finish={profileFinish} />
                </mesh>
              );
            })}
            {spGrid && Array.from({ length: spGrid.columns }).flatMap((_, colIdx) => {
              const rowCount = spGrid.columnRows[colIdx] || 1;
              if (rowCount <= 1) return [];
              const colZ = getSpColStart(colIdx) * SCALE + (spGrid.columnWidths[colIdx] / 2) * SCALE;
              const colW = spGrid.columnWidths[colIdx] * SCALE;
              return Array.from({ length: rowCount - 1 }).map((__, rowIdx) => {
                const py = getSpRowStart(colIdx, rowIdx + 1) * SCALE - (spPWmm / 2) * SCALE - sideH / 2 + yOff;
                return (
                  <mesh key={`sp-hp-${side}-${colIdx}-${rowIdx}`} position={[xPos, py, -colZ]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[colW, spInnerPW, spInnerPW]} />
                    <MetalMaterial finish={profileFinish} />
                  </mesh>
                );
              });
            })}
            {spSides.top && <mesh position={[xPos, yOff + sideH / 2 + spPW / 2, -sideW / 2]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[sideW + spPW * 2, spPW, spPW]} /><MetalMaterial finish={profileFinish} /></mesh>}
            {spSides.bottom && <mesh position={[xPos, yOff - sideH / 2 - spPW / 2, -sideW / 2]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[sideW + spPW * 2, spPW, spPW]} /><MetalMaterial finish={profileFinish} /></mesh>}
            {spSides.front && <mesh position={[xPos, yOff, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[spPW, sideH, spPW]} /><MetalMaterial finish={profileFinish} /></mesh>}
            {spSides.back && <mesh position={[xPos, yOff, -sideW]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[spPW, sideH, spPW]} /><MetalMaterial finish={profileFinish} /></mesh>}
          </group>
        );
      })}
    </group>
  );
}
