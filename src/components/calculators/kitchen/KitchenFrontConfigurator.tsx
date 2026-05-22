import { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useKitchenFrontCalculator } from '@/hooks/calculators/useKitchenFrontCalculator';
import { useQuotePDF } from '@/hooks/calculators/useQuotePDF';
import { useQuoteSave } from '@/hooks/useQuoteSave';
import { useOrderItemsContext } from '@/contexts/OrderItemsContext';
import { useToast } from '@/hooks/use-toast';
import { useClientTypePricing } from '@/hooks/useClientTypePricing';
import type { ClientType } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { Paintbrush, Image, Square, Plus, Trash2, Move, Circle } from 'lucide-react';
import { ExtraAccessoriesSection } from '@/components/calculators/shared/ExtraAccessoriesSection';
import { EdgePolishingOption } from '@/components/calculators/shared/EdgePolishingOption';
import { EdgeTypeSelector } from '@/components/calculators/shared/EdgeTypeSelector';

import { AccessoryPresetManager } from '@/components/calculators/shared/AccessoryPresetManager';
import { CatalogProductSelector } from '@/components/calculators/shared/CatalogProductSelector';
import { ThreeEvent, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { KitchenFrontType, HoleSpec, CutoutSpec } from '@/types/calculators';
import { useEditQuote } from '@/hooks/useEditQuote';
import { useNavigate } from 'react-router-dom';

// Popular RAL colors for kitchen fronts
const RAL_COLORS = [
  { code: 'RAL 9003', name: 'Alb semnal', hex: '#F4F4F4' },
  { code: 'RAL 9005', name: 'Negru intens', hex: '#0A0A0D' },
  { code: 'RAL 7016', name: 'Gri antracit', hex: '#293133' },
  { code: 'RAL 7035', name: 'Gri deschis', hex: '#D7D7D7' },
  { code: 'RAL 1015', name: 'Ivoriu deschis', hex: '#E6D2B5' },
  { code: 'RAL 5015', name: 'Albastru cer', hex: '#2271B3' },
  { code: 'RAL 6005', name: 'Verde mușchi', hex: '#114232' },
  { code: 'RAL 3003', name: 'Roșu rubin', hex: '#8D1D2C' },
];

export function KitchenFrontConfigurator() {
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
  
  const printImageInputRef = useRef<HTMLInputElement>(null);
  
  // Custom shape type selector
  const [customShapeType, setCustomShapeType] = useState<'circle' | 'square'>('circle');
  
  // Circle (hole) inputs
  const [customDiameter, setCustomDiameter] = useState(68);
  const [customX, setCustomX] = useState(300);
  const [customY, setCustomY] = useState(360);
  const [previewHole, setPreviewHole] = useState<{ diameter: number; x: number; y: number } | null>(null);
  
  // Square (cutout) inputs
  const [customCutoutWidth, setCustomCutoutWidth] = useState(100);
  const [customCutoutHeight, setCustomCutoutHeight] = useState(80);
  const [customCutoutX, setCustomCutoutX] = useState(300);
  const [customCutoutY, setCustomCutoutY] = useState(360);
  const [previewCutout, setPreviewCutout] = useState<{ width: number; height: number; x: number; y: number } | null>(null);
  
  const {
    config, currentStep, steps, price, canGoNext,
    goToStep, nextStep, prevStep,
    setFrontType, setDimensions, setFinish, setProcessing, setEdgePolish,
    addHole, removeHole, updateHole,
    addCutout, removeCutout, updateCutout,
    addExtraAccessory, removeExtraAccessory, updateExtraAccessory,
    selectedKit, setSelectedKit, removeSelectedKit,
    reset,
    loadConfig,
  } = useKitchenFrontCalculator();

  // Update preview when shape type changes
  const handleShapeTypeChange = (type: 'circle' | 'square') => {
    setCustomShapeType(type);
    if (type === 'circle') {
      setPreviewCutout(null);
      setPreviewHole({ diameter: customDiameter, x: customX, y: customY });
    } else {
      setPreviewHole(null);
      setPreviewCutout({ width: customCutoutWidth, height: customCutoutHeight, x: customCutoutX, y: customCutoutY });
    }
  };

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
      productType: 'kitchen_front',
      productLabel: t('calc.kitchenFrontPiece'),
      getConfigDetails: () => [
        { label: t('calc.frontType'), value: frontTypeLabels[config.frontType] || config.frontType },
        { label: t('calc.dimensions'), value: `${config.dimensions.width} × ${config.dimensions.height} mm` },
        { label: t('common.quantity'), value: `${config.dimensions.quantity} ${t('common.pieces')}` },
        { label: t('calc.glass'), value: `${config.glass.thickness}mm` },
        ...(config.frontType === 'lacquered' && config.finish.ralColor ? [{ label: t('calc.selectRAL'), value: config.finish.ralColor }] : []),
        ...(config.processing.holes.length > 0 ? [{ label: t('calc.holes'), value: `${config.processing.holes.length} ${t('common.pieces')}` }] : []),
        ...(config.processing.cutouts.length > 0 ? [{ label: t('calc.cutouts'), value: `${config.processing.cutouts.length} ${t('common.pieces')}` }] : []),
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

  const frontTypeLabels: Record<string, string> = { lacquered: t('calc.lacquered'), printed: t('calc.printed'), frosted: t('calc.frosted') };

  const { handleDownloadPDF } = useQuotePDF({
    productType: 'Front-Bucatarie',
    productLabel: t('calc.kitchenFrontPiece'),
    price,
    clientName,
    clientPhone,
    clientEmail,
    customAmount,
    markupPercent,
    getConfigDetails: () => [
      { label: t('calc.frontType'), value: frontTypeLabels[config.frontType] || config.frontType },
      { label: t('calc.dimensions'), value: `${config.dimensions.width} × ${config.dimensions.height} mm` },
      { label: t('common.quantity'), value: `${config.dimensions.quantity} ${t('common.pieces')}` },
      { label: t('calc.glass'), value: `${config.glass.thickness}mm` },
      ...(config.frontType === 'lacquered' && config.finish.ralColor ? [{ label: t('calc.selectRAL'), value: config.finish.ralColor }] : []),
      ...(config.processing.holes.length > 0 ? [{ label: t('calc.holes'), value: `${config.processing.holes.length} ${t('common.pieces')}` }] : []),
      ...(config.processing.cutouts.length > 0 ? [{ label: t('calc.cutouts'), value: `${config.processing.cutouts.length} ${t('common.pieces')}` }] : []),
    ],
  });

  const handleAddToOrder = async () => {
    setIsAddingToOrder(true);
    const success = await addItem({
      productType: 'kitchen_front',
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
            {([
              { id: 'lacquered', label: t('calc.lacquered'), description: t('calc.lacqueredDesc'), icon: Paintbrush },
              { id: 'printed', label: t('calc.printed'), description: t('calc.printedDesc'), icon: Image },
              { id: 'frosted', label: t('calc.frosted'), description: t('calc.frostedDesc'), icon: Square },
            ] as const).map((option) => {
              const Icon = option.icon;
              const isSelected = config.frontType === option.id;
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                  )}
                  onClick={() => setFrontType(option.id)}
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
            <div className="grid grid-cols-2 gap-4">
              <DimensionInput
                label={t('calc.width')}
                value={config.dimensions.width}
                onChange={(width) => setDimensions({ width })}
                min={200}
                max={2000}
              />
              <DimensionInput
                label={t('calc.height')}
                value={config.dimensions.height}
                onChange={(height) => setDimensions({ height })}
                min={200}
                max={1200}
              />
            </div>
            <DimensionInput
              label={t('common.quantity')}
              value={config.dimensions.quantity}
              onChange={(quantity) => setDimensions({ quantity })}
              min={1}
              max={50}
              unit={t('common.pieces')}
            />
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">{t('calc.totalSurface')}:</span>
                <span className="ml-2 font-medium">
                  {((config.dimensions.width * config.dimensions.height * config.dimensions.quantity) / 1000000).toFixed(2)} m²
                </span>
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            {config.frontType === 'lacquered' && (
              <>
                <Label className="text-sm font-medium">{t('calc.selectRAL')}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {RAL_COLORS.map((color) => (
                    <button
                      key={color.code}
                      className={cn(
                        "aspect-square rounded-lg border-2 transition-all",
                        config.finish.ralColor === color.hex 
                          ? "border-primary ring-2 ring-primary ring-offset-2" 
                          : "border-transparent hover:border-muted-foreground/50"
                      )}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setFinish({ ralColor: color.hex })}
                      title={`${color.code} - ${color.name}`}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground">{t('calc.orEnterColor')}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={config.finish.ralColor || '#ffffff'}
                      onChange={(e) => setFinish({ ralColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.finish.ralColor || ''}
                      onChange={(e) => setFinish({ ralColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            )}
            {config.frontType === 'printed' && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">{t('calc.uploadImage')}</Label>
                <input
                  ref={printImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFinish({ printImage: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {config.finish.printImage ? (
                  <div className="relative border rounded-lg overflow-hidden">
                    <img src={config.finish.printImage} alt="Print preview" className="w-full h-48 object-contain bg-muted" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFinish({ printImage: undefined });
                        if (printImageInputRef.current) printImageInputRef.current.value = '';
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> {t('calc.deleteImage')}
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => printImageInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onloadend = () => setFinish({ printImage: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                  >
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t('calc.dragImage')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('calc.imageFormat')}
                    </p>
                  </div>
                )}
              </div>
            )}
            {config.frontType === 'frosted' && (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Square className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm">
                  {t('calc.frostedUniform')}
                </p>
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
      case 4:
        return (
          <div className="space-y-4">
            {/* Standard hole buttons */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">{t('calc.addStandardProcessing')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addHole({ diameter: 68, x: 100, y: config.dimensions.height / 2 })}
                  className="justify-start gap-2"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-current" />
                  {t('calc.socket68')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addHole({ diameter: 55, x: 200, y: config.dimensions.height / 2 })}
                  className="justify-start gap-2"
                >
                  <div className="w-3 h-3 rounded-full border-2 border-current" />
                  {t('calc.switch55')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const baseX = config.processing.holes.length * 150 + 100;
                    addHole({ diameter: 68, x: baseX, y: config.dimensions.height / 2 });
                    setTimeout(() => addHole({ diameter: 68, x: baseX + 71, y: config.dimensions.height / 2 }), 10);
                  }}
                  className="justify-start gap-2"
                >
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-full border-2 border-current" />
                    <div className="w-3 h-3 rounded-full border-2 border-current" />
                  </div>
                  {t('calc.doubleSocket')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const baseX = config.processing.holes.length * 150 + 100;
                    addHole({ diameter: 68, x: baseX, y: config.dimensions.height / 2 });
                    setTimeout(() => addHole({ diameter: 68, x: baseX + 71, y: config.dimensions.height / 2 }), 10);
                    setTimeout(() => addHole({ diameter: 68, x: baseX + 142, y: config.dimensions.height / 2 }), 20);
                  }}
                  className="justify-start gap-2"
                >
                  <div className="flex gap-0.5">
                    <div className="w-2 h-2 rounded-full border-2 border-current" />
                    <div className="w-2 h-2 rounded-full border-2 border-current" />
                    <div className="w-2 h-2 rounded-full border-2 border-current" />
                  </div>
                  {t('calc.tripleSocket')}
                </Button>
              </div>
            </Card>

            {/* Existing holes list */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">{t('calc.holesAdded', { count: config.processing.holes.length })}</Label>
              </div>
              {config.processing.holes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('calc.noHolesAdded')}
                </p>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {config.processing.holes.map((hole, i) => (
                    <div key={hole.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-[10px] font-bold"
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="font-medium">Ø{hole.diameter}mm</span>
                        <span className="text-muted-foreground ml-2">
                          X: {hole.x}mm, Y: {hole.y}mm
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive" 
                        onClick={() => removeHole(hole.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Existing cutouts list */}
            {config.processing.cutouts.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">{t('calc.cutoutsAdded', { count: config.processing.cutouts.length })}</Label>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {config.processing.cutouts.map((cutout, i) => (
                    <div key={cutout.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <div 
                        className="w-6 h-6 border-2 border-primary flex items-center justify-center text-[10px] font-bold rounded-sm"
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{cutout.width}×{cutout.height}mm</span>
                        <span className="text-muted-foreground ml-2">
                          X: {cutout.x}mm, Y: {cutout.y}mm
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive" 
                        onClick={() => removeCutout(cutout.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Custom processing input */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">{t('calc.customProcessing')}</Label>
              
              {/* Shape type selector */}
              <RadioGroup 
                value={customShapeType} 
                onValueChange={(v) => handleShapeTypeChange(v as 'circle' | 'square')}
                className="flex gap-4 mb-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="circle" id="shape-circle" />
                  <Label htmlFor="shape-circle" className="text-sm cursor-pointer flex items-center gap-1.5">
                    <Circle className="h-3.5 w-3.5" />
                    {t('calc.roundHole')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="square" id="shape-square" />
                  <Label htmlFor="shape-square" className="text-sm cursor-pointer flex items-center gap-1.5">
                    <Square className="h-3.5 w-3.5" />
                    {t('calc.squareCutoutLabel')}
                  </Label>
                </div>
              </RadioGroup>

              {customShapeType === 'circle' ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.diameter')} (mm)</Label>
                      <Input 
                        type="number" 
                        value={customDiameter}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 68;
                          setCustomDiameter(v);
                          setPreviewHole({ diameter: v, x: customX, y: customY });
                        }}
                        min={10} 
                        max={150} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.positionXLabel')}</Label>
                      <Input 
                        type="number" 
                        value={customX}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(config.dimensions.width, parseInt(e.target.value) || 0));
                          setCustomX(v);
                          setPreviewHole({ diameter: customDiameter, x: v, y: customY });
                        }}
                        min={0} 
                        max={config.dimensions.width} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.positionYLabel')}</Label>
                      <Input 
                        type="number" 
                        value={customY}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(config.dimensions.height, parseInt(e.target.value) || 0));
                          setCustomY(v);
                          setPreviewHole({ diameter: customDiameter, x: customX, y: v });
                        }}
                        min={0} 
                        max={config.dimensions.height} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {previewHole && (
                    <p className="text-xs text-primary mt-2">
                      {t('calc.preview')}: Ø{previewHole.diameter}mm @ X:{previewHole.x}, Y:{previewHole.y}
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-3 gap-2"
                    onClick={() => {
                      addHole({ diameter: customDiameter, x: customX, y: customY });
                      setPreviewHole(null);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t('calc.addCustomHole')}
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.width')} (mm)</Label>
                      <Input 
                        type="number" 
                        value={customCutoutWidth}
                        onChange={(e) => {
                          const v = Math.max(10, parseInt(e.target.value) || 100);
                          setCustomCutoutWidth(v);
                          setPreviewCutout({ width: v, height: customCutoutHeight, x: customCutoutX, y: customCutoutY });
                        }}
                        min={10} 
                        max={config.dimensions.width} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.height')} (mm)</Label>
                      <Input 
                        type="number" 
                        value={customCutoutHeight}
                        onChange={(e) => {
                          const v = Math.max(10, parseInt(e.target.value) || 80);
                          setCustomCutoutHeight(v);
                          setPreviewCutout({ width: customCutoutWidth, height: v, x: customCutoutX, y: customCutoutY });
                        }}
                        min={10} 
                        max={config.dimensions.height} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.positionXLabel')}</Label>
                      <Input 
                        type="number" 
                        value={customCutoutX}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(config.dimensions.width, parseInt(e.target.value) || 0));
                          setCustomCutoutX(v);
                          setPreviewCutout({ width: customCutoutWidth, height: customCutoutHeight, x: v, y: customCutoutY });
                        }}
                        min={0} 
                        max={config.dimensions.width} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('calc.positionYLabel')}</Label>
                      <Input 
                        type="number" 
                        value={customCutoutY}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(config.dimensions.height, parseInt(e.target.value) || 0));
                          setCustomCutoutY(v);
                          setPreviewCutout({ width: customCutoutWidth, height: customCutoutHeight, x: customCutoutX, y: v });
                        }}
                        min={0} 
                        max={config.dimensions.height} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  {previewCutout && (
                    <p className="text-xs text-primary mt-2">
                      {t('calc.preview')}: {previewCutout.width}×{previewCutout.height}mm @ X:{previewCutout.x}, Y:{previewCutout.y}
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-3 gap-2"
                    onClick={() => {
                      addCutout({ type: 'rectangle', width: customCutoutWidth, height: customCutoutHeight, x: customCutoutX, y: customCutoutY });
                      setPreviewCutout(null);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {t('calc.addSquareCutout')}
                  </Button>
                </>
              )}
            </Card>

            <AccessoryPresetManager
              productType="kitchen_front"
              category="handle"
              label={t('calc.handleFronts')}
              selectedCode={config.extraAccessories[0]?.materialCode}
              onSelect={(code) => {
                const existing = config.extraAccessories.findIndex(a => a.materialCode === code);
                if (existing < 0) {
                  addExtraAccessory({ materialCode: code, name: code });
                }
              }}
            />
            <CatalogProductSelector
              category="handle"
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
              productType="kitchen_front"
              className="mt-2"
            />

            <EdgePolishingOption
              enabled={config.edgePolish.enabled}
              polishType={config.edgePolish.type}
              onEnabledChange={(enabled) => setEdgePolish({ enabled })}
              onPolishTypeChange={(type) => setEdgePolish({ type })}
              glassPieces={[{
                name: t('calc.kitchenFrontPiece'),
                width: config.dimensions.width,
                height: config.dimensions.height,
                quantity: config.dimensions.quantity,
              }]}
            />

            <ExtraAccessoriesSection
              extraAccessories={config.extraAccessories}
              onAdd={addExtraAccessory}
              onRemove={removeExtraAccessory}
              onUpdate={updateExtraAccessory}
              productType="kitchen_front"
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
    <SceneSetup cameraPosition={[0, 0, 1.5]} cameraFov={50}>
      <KitchenFrontViewer3D 
        config={config} 
        onUpdateHole={updateHole} 
        onUpdateCutout={updateCutout}
        previewHole={previewHole} 
        previewCutout={previewCutout}
      />
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
    <AppLayout title={t('calc.kitchenTitle')}>
      <CalculatorLayout
        title={t('calc.kitchenConfigurator')}
        subtitle={t('calc.kitchenSubtitle')}
        formSection={formSection}
        viewerSection={viewerSection}
        summarySection={summarySection}
        isOfferStep={isOfferStep}
      />
    </AppLayout>
  );
}

interface KitchenFrontViewer3DProps {
  config: ReturnType<typeof useKitchenFrontCalculator>['config'];
  onUpdateHole: (id: string, updates: Partial<Omit<HoleSpec, 'id'>>) => void;
  onUpdateCutout: (id: string, updates: Partial<Omit<CutoutSpec, 'id'>>) => void;
  previewHole?: { diameter: number; x: number; y: number } | null;
  previewCutout?: { width: number; height: number; x: number; y: number } | null;
}

function KitchenFrontViewer3D({ config, onUpdateHole, onUpdateCutout, previewHole, previewCutout }: KitchenFrontViewer3DProps) {
  const SCALE = 0.001;
  const width = config.dimensions.width * SCALE;
  const height = config.dimensions.height * SCALE;
  const thickness = 0.006;

  const getColor = () => {
    if (config.frontType === 'lacquered') return config.finish.ralColor || '#ffffff';
    if (config.frontType === 'frosted') return '#e0e0e0';
    return '#ffffff';
  };

  // Load print image as texture with state to trigger re-render
  const [printTexture, setPrintTexture] = useState<THREE.Texture | null>(null);
  
  useMemo(() => {
    if (config.frontType === 'printed' && config.finish.printImage) {
      const loader = new THREE.TextureLoader();
      loader.load(config.finish.printImage, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setPrintTexture(tex);
      });
    } else {
      setPrintTexture(null);
    }
  }, [config.frontType, config.finish.printImage]);

  return (
    <group position={[0, 0, 0]}>
      <SimpleDimensionLines widthMm={config.dimensions.width} heightMm={config.dimensions.height} />
      {/* Front panel */}
      <mesh castShadow>
        <boxGeometry args={[width, height, thickness]} />
        <meshPhysicalMaterial
          color={getColor()}
          transmission={config.frontType === 'frosted' ? 0.3 : 0}
          roughness={config.frontType === 'frosted' ? 0.5 : 0.1}
          metalness={0}
          clearcoat={config.frontType === 'lacquered' ? 1 : 0}
        />
      </mesh>

      {/* Print image overlay on front face */}
      {printTexture && (
        <mesh position={[0, 0, thickness / 2 + 0.001]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={printTexture} transparent />
        </mesh>
      )}

      {/* Draggable Holes */}
      {config.processing.holes.map((hole, index) => (
        <DraggableHole
          key={hole.id}
          hole={hole}
          index={index}
          panelWidth={config.dimensions.width}
          panelHeight={config.dimensions.height}
          scale={SCALE}
          thickness={thickness}
          onUpdate={onUpdateHole}
        />
      ))}

      {/* Draggable Cutouts */}
      {config.processing.cutouts.map((cutout, index) => (
        <DraggableCutout
          key={cutout.id}
          cutout={cutout}
          index={index}
          panelWidth={config.dimensions.width}
          panelHeight={config.dimensions.height}
          scale={SCALE}
          thickness={thickness}
          onUpdate={onUpdateCutout}
        />
      ))}

      {/* Preview hole (ghost) */}
      {previewHole && (() => {
        const px = (previewHole.x - config.dimensions.width / 2) * SCALE;
        const py = (previewHole.y - config.dimensions.height / 2) * SCALE;
        return (
          <group position={[px, py, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[previewHole.diameter * SCALE / 2, previewHole.diameter * SCALE / 2, thickness + 0.002, 32]} />
              <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0, 0, thickness / 2 + 0.003]}>
              <ringGeometry args={[previewHole.diameter * SCALE / 2 + 0.002, previewHole.diameter * SCALE / 2 + 0.008, 32]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })()}

      {/* Preview cutout (ghost) */}
      {previewCutout && (() => {
        const px = (previewCutout.x - config.dimensions.width / 2) * SCALE;
        const py = (previewCutout.y - config.dimensions.height / 2) * SCALE;
        const cw = previewCutout.width * SCALE;
        const ch = previewCutout.height * SCALE;
        return (
          <group position={[px, py, 0]}>
            <mesh>
              <boxGeometry args={[cw, ch, thickness + 0.002]} />
              <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
            </mesh>
            {/* Outline */}
            <mesh position={[0, 0, thickness / 2 + 0.003]}>
              <planeGeometry args={[cw + 0.01, ch + 0.01]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
            </mesh>
          </group>
        );
      })()}

      {/* Back panel (wall indicator) */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.02]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
    </group>
  );
}

interface DraggableHoleProps {
  hole: HoleSpec;
  index: number;
  panelWidth: number;
  panelHeight: number;
  scale: number;
  thickness: number;
  onUpdate: (id: string, updates: Partial<Omit<HoleSpec, 'id'>>) => void;
}

function DraggableHole({ hole, index, panelWidth, panelHeight, scale, thickness, onUpdate }: DraggableHoleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    const point = e.point;
    const newX = Math.round((point.x / scale) + (panelWidth / 2));
    const newY = Math.round((point.y / scale) + (panelHeight / 2));
    const margin = hole.diameter / 2;
    const clampedX = Math.max(margin, Math.min(panelWidth - margin, newX));
    const clampedY = Math.max(margin, Math.min(panelHeight - margin, newY));
    onUpdate(hole.id, { x: clampedX, y: clampedY });
  };

  const posX = (hole.x - panelWidth / 2) * scale;
  const posY = (hole.y - panelHeight / 2) * scale;

  return (
    <group position={[posX, posY, 0]}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => { setIsHovered(false); setIsDragging(false); }}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[hole.diameter * scale / 2, hole.diameter * scale / 2, thickness + 0.002, 32]} />
        <meshStandardMaterial 
          color={isDragging ? '#3b82f6' : isHovered ? '#60a5fa' : '#1a1a1a'} 
          transparent={isDragging || isHovered}
          opacity={isDragging ? 0.8 : 1}
        />
      </mesh>
      <mesh position={[0, 0, thickness / 2 + 0.003]}>
        <ringGeometry args={[hole.diameter * scale / 2 + 0.002, hole.diameter * scale / 2 + 0.006, 32]} />
        <meshBasicMaterial 
          color={isDragging ? '#3b82f6' : isHovered ? '#60a5fa' : '#666666'} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      {(isHovered || isDragging) && (
        <mesh position={[0, 0, thickness / 2 + 0.01]}>
          <circleGeometry args={[0.015, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      )}
      {(isDragging || isHovered) && (
        <Html
          position={[0, hole.diameter * scale / 2 + 0.04, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className={cn(
              "px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg",
              isDragging 
                ? "bg-primary text-primary-foreground" 
                : "bg-background/95 text-foreground border border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <span>X: {hole.x}mm</span>
              <span className="text-muted-foreground">|</span>
              <span>Y: {hole.y}mm</span>
            </div>
            {isDragging && (
              <div className="text-[10px] text-center mt-0.5 opacity-75">
                Trage pentru a repoziționa
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

interface DraggableCutoutProps {
  cutout: CutoutSpec;
  index: number;
  panelWidth: number;
  panelHeight: number;
  scale: number;
  thickness: number;
  onUpdate: (id: string, updates: Partial<Omit<CutoutSpec, 'id'>>) => void;
}

function DraggableCutout({ cutout, index, panelWidth, panelHeight, scale, thickness, onUpdate }: DraggableCutoutProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    const point = e.point;
    const newX = Math.round((point.x / scale) + (panelWidth / 2));
    const newY = Math.round((point.y / scale) + (panelHeight / 2));
    const marginX = cutout.width / 2;
    const marginY = cutout.height / 2;
    const clampedX = Math.max(marginX, Math.min(panelWidth - marginX, newX));
    const clampedY = Math.max(marginY, Math.min(panelHeight - marginY, newY));
    onUpdate(cutout.id, { x: clampedX, y: clampedY });
  };

  const posX = (cutout.x - panelWidth / 2) * scale;
  const posY = (cutout.y - panelHeight / 2) * scale;
  const cw = cutout.width * scale;
  const ch = cutout.height * scale;

  return (
    <group position={[posX, posY, 0]}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => { setIsHovered(false); setIsDragging(false); }}
      >
        <boxGeometry args={[cw, ch, thickness + 0.002]} />
        <meshStandardMaterial 
          color={isDragging ? '#3b82f6' : isHovered ? '#60a5fa' : '#1a1a1a'} 
          transparent={isDragging || isHovered}
          opacity={isDragging ? 0.8 : 1}
        />
      </mesh>
      {/* Outline border */}
      <mesh position={[0, 0, thickness / 2 + 0.003]}>
        <planeGeometry args={[cw + 0.008, ch + 0.008]} />
        <meshBasicMaterial 
          color={isDragging ? '#3b82f6' : isHovered ? '#60a5fa' : '#666666'} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      {(isHovered || isDragging) && (
        <mesh position={[0, 0, thickness / 2 + 0.01]}>
          <circleGeometry args={[0.012, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      )}
      {(isDragging || isHovered) && (
        <Html
          position={[0, ch / 2 + 0.04, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className={cn(
              "px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg",
              isDragging 
                ? "bg-primary text-primary-foreground" 
                : "bg-background/95 text-foreground border border-border"
            )}
          >
            <div className="flex items-center gap-2">
              <span>{cutout.width}×{cutout.height}mm</span>
              <span className="text-muted-foreground">|</span>
              <span>X: {cutout.x}, Y: {cutout.y}</span>
            </div>
            {isDragging && (
              <div className="text-[10px] text-center mt-0.5 opacity-75">
                Trage pentru a repoziționa
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// THREE already imported at top
