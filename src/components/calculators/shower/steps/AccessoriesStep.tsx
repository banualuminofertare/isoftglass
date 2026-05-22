import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinishSelector } from '@/components/calculators/shared/FinishSelector';
import { CatalogProductSelector } from '@/components/calculators/shared/CatalogProductSelector';
import { ExtraAccessoriesSection } from '@/components/calculators/shared/ExtraAccessoriesSection';
import { KitSelector, type SelectedKit } from '@/components/calculators/shared/KitSelector';
import { AccessoryPresetManager } from '@/components/calculators/shared/AccessoryPresetManager';
import { SelectedProductCard } from '@/components/calculators/shared/SelectedProductCard';
import { SelectionListManager } from '@/components/calculators/shared/SelectionListManager';
import { getHingeMaterialCode } from '@/lib/calculators/materialMapping';
import { HANDLE_CODES, PROFILE_CODES } from '@/lib/calculators/materialMapping';
import type { ShowerConfig, ShowerDoorType, FinishType, DoorPosition, DoorOpenDirection, OpeningSide, HingeSide, AccessorySelection, LateralConfig, EdgePolishType } from '@/types/calculators';
import { EdgePolishingOption, type GlassPiece } from '@/components/calculators/shared/EdgePolishingOption';

import { DimensionInput } from '@/components/calculators/shared/DimensionInput';

interface AccessoriesStepProps {
  doorType: ShowerDoorType;
  accessories: ShowerConfig['accessories'];
  cabinHeight: number;
  cabinType: ShowerConfig['cabinType'];
  lateralConfig: LateralConfig;
  onOpeningSideChange: (openingSide: OpeningSide) => void;
  onHingesChange: (hinges: Partial<ShowerConfig['accessories']['hinges']>) => void;
  onDoorConfigChange: (doorConfig: Partial<ShowerConfig['accessories']['door']>) => void;
  onHandleChange: (handle: Partial<ShowerConfig['accessories']['handle']>) => void;
  onSealsChange: (seals: Partial<ShowerConfig['accessories']['seals']>) => void;
  onStabilizerShapeChange: (shape: 'round' | 'rectangular') => void;
  onAddStabilizerSelection: (selection: AccessorySelection & { length?: number }) => void;
  onRemoveStabilizerSelection: (index: number) => void;
  onUpdateStabilizerSelectionLength: (index: number, length: number) => void;
  onProfilesChange: (profiles: Partial<ShowerConfig['accessories']['profiles']>) => void;
  onAddExtraAccessory: (item: { materialCode: string; name: string; unitPrice?: number }) => void;
  onRemoveExtraAccessory: (index: number) => void;
  onUpdateExtraAccessory: (index: number, updates: Partial<ShowerConfig['accessories']['extraAccessories'][0]>) => void;
  onAddSelection: (section: 'hinges' | 'handle' | 'profiles', selection: AccessorySelection) => void;
  onRemoveSelection: (section: 'hinges' | 'handle' | 'profiles', index: number) => void;
  onAddSealSelection: (sealType: 'magnetic' | 'rubber' | 'threshold', selection: AccessorySelection) => void;
  onRemoveSealSelection: (sealType: 'magnetic' | 'rubber' | 'threshold', index: number) => void;
  selectedKit: SelectedKit | null;
  onSelectKit: (kit: SelectedKit) => void;
  onRemoveKit: () => void;
  // Lateral config callbacks
  onLateralDoorConfigChange: (doorConfig: Partial<LateralConfig['door']>) => void;
  onLateralHingesChange: (hinges: Partial<LateralConfig['hinges']>) => void;
  onLateralHandleChange: (handle: Partial<LateralConfig['handle']>) => void;
  onLateralSealsChange: (seals: Partial<LateralConfig['seals']>) => void;
  onAddLateralHingeSelection: (selection: AccessorySelection) => void;
  onRemoveLateralHingeSelection: (index: number) => void;
  onAddLateralHandleSelection: (selection: AccessorySelection) => void;
  onRemoveLateralHandleSelection: (index: number) => void;
  onAddLateralSealSelection: (sealType: 'magnetic' | 'rubber' | 'threshold', selection: AccessorySelection) => void;
  onRemoveLateralSealSelection: (sealType: 'magnetic' | 'rubber' | 'threshold', index: number) => void;
  edgePolish: ShowerConfig['edgePolish'];
  onEdgePolishChange: (updates: Partial<ShowerConfig['edgePolish']>) => void;
  dimensions: ShowerConfig['dimensions'];
  fixedPanel: ShowerConfig['accessories']['fixedPanel'];
}

const handleLengths = [200, 300, 400, 500, 600];

export function AccessoriesStep({
  doorType,
  accessories,
  cabinHeight,
  cabinType,
  lateralConfig,
  onOpeningSideChange,
  onHingesChange,
  onDoorConfigChange,
  onHandleChange,
  onSealsChange,
  onStabilizerShapeChange,
  onAddStabilizerSelection,
  onRemoveStabilizerSelection,
  onUpdateStabilizerSelectionLength,
  onProfilesChange,
  onAddExtraAccessory,
  onRemoveExtraAccessory,
  onUpdateExtraAccessory,
  onAddSelection,
  onRemoveSelection,
  onAddSealSelection,
  onRemoveSealSelection,
  selectedKit,
  onSelectKit,
  onRemoveKit,
  onLateralDoorConfigChange,
  onLateralHingesChange,
  onLateralHandleChange,
  onLateralSealsChange,
  onAddLateralHingeSelection,
  onRemoveLateralHingeSelection,
  onAddLateralHandleSelection,
  onRemoveLateralHandleSelection,
  onAddLateralSealSelection,
  onRemoveLateralSealSelection,
  edgePolish,
  onEdgePolishChange,
  dimensions,
  fixedPanel,
}: AccessoriesStepProps) {
  const { t } = useTranslation();
  const isFixedPanel = cabinType === 'fixed_panel';
  const showHinges = doorType === 'hinged' && !isFixedPanel;
  const openingSide = accessories.openingSide || 'front';
  const getDefaultStabilizerLength = () => {
    if (cabinType === 'corner_90') return dimensions.width + dimensions.depth;
    return dimensions.width || 1500;
  };
  const [stabilizerLength, setStabilizerLength] = useState(getDefaultStabilizerLength);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (cabinType === 'corner_90') {
      setStabilizerLength(dimensions.width + dimensions.depth);
    }
  }, [cabinType, dimensions.width, dimensions.depth]);
  const showLateral = cabinType === 'corner_90' && lateralConfig.enabled;
  const showLateralHinges = lateralConfig.doorType === 'hinged';
  
  const SectionHeader = ({ id, label }: { id: string; label: string }) => (
    <div
      className="flex items-center justify-between cursor-pointer"
      onClick={() => toggleSection(id)}
    >
      <Label className="text-sm font-medium cursor-pointer">{label}</Label>
      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", !openSections.has(id) && "-rotate-90")} />
    </div>
  );

  const frontalContent = (
    <>

      {/* Hinges (only for hinged doors) */}
      {showHinges && (
        <Card className="p-4">
          <SectionHeader id="hinges" label={t('calc.hingesLabel')} />
          {openSections.has('hinges') && (
            <div className="mt-3 space-y-3">
            <AccessoryPresetManager
              productType="shower"
              category="hinge"
              label=""
              selectedCode={accessories.hinges.materialCode}
              onSelect={(code) => onHingesChange({ materialCode: code || undefined })}
              onProductAdd={(product) => onAddSelection('hinges', {
                materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
              })}
            />
            <CatalogProductSelector
              category="hinge"
               label={t('calc.selectProductLabel')}
              value=""
              onValueChange={() => {}}
              onProductAdd={(product) => onAddSelection('hinges', {
                materialCode: product.code,
                name: product.name,
                unitPrice: product.unitPrice ?? undefined,
              })}
              productType="shower"
            />
            <SelectionListManager
              items={accessories.hinges.selections || []}
              category="hinge"
              onRemove={(idx) => onRemoveSelection('hinges', idx)}
               label={t('calc.selectedProducts')}
            />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('calc.hingeCount')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {[2, 3].map((qty) => (
                  <Card
                    key={qty}
                    className={`p-2.5 cursor-pointer text-center transition-colors ${
                      accessories.hinges.quantity === qty
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => onHingesChange({ quantity: qty })}
                  >
                    <span className="text-sm font-medium">{t('calc.nHinges', { n: qty })}</span>
                  </Card>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FinishSelector
                label={t('calc.finishLabelShort')}
                materialCode={accessories.hinges.materialCode || getHingeMaterialCode(accessories.hinges.type)}
                value={accessories.hinges.finish}
                onValueChange={(finish) => onHingesChange({ finish: finish as FinishType })}
              />
            </div>
            {accessories.hinges.positions && accessories.hinges.positions.length > 0 && (
              <div className="space-y-2 mt-2">
                <Label className="text-xs text-muted-foreground">{t('calc.hingePositions')}</Label>
                {accessories.hinges.positions.map((pos, idx) => (
                  <DimensionInput
                    key={idx}
                    label={`${t('calc.hingeNLabel', { n: idx + 1 })}${idx === 0 ? ` ${t('calc.hingeTopPos')}` : idx === (accessories.hinges.positions?.length ?? 0) - 1 ? ` ${t('calc.hingeBottomPos')}` : ` ${t('calc.hingeMidPos')}`}`}
                    value={pos}
                    onChange={(val) => {
                      const newPositions = [...(accessories.hinges.positions || [])];
                      newPositions[idx] = val;
                      onHingesChange({ positions: newPositions });
                    }}
                    min={100}
                    max={cabinHeight - 100}
                    step={10}
                  />
                ))}
              </div>
            )}
            </div>
          )}
        </Card>
      )}

      {/* Handle (hidden for fixed_panel) */}
      {!isFixedPanel && (
      <Card className="p-4">
        <SectionHeader id="handle" label={t('calc.handleLabel')} />
        {openSections.has('handle') && (
        <div className="mt-3 space-y-3">
          <AccessoryPresetManager
            productType="shower"
            category="handle"
            label=""
            selectedCode={accessories.handle.materialCode}
            onSelect={(code) => onHandleChange({ materialCode: code || undefined })}
            onProductAdd={(product) => onAddSelection('handle', {
              materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
            })}
          />
          <CatalogProductSelector
            category="handle"
             label={t('calc.selectProductLabel')}
            value=""
            onValueChange={() => {}}
            onProductAdd={(product) => onAddSelection('handle', {
              materialCode: product.code,
              name: product.name,
              unitPrice: product.unitPrice ?? undefined,
            })}
            productType="shower"
          />
          <SelectionListManager
            items={accessories.handle.selections || []}
            category="handle"
            onRemove={(idx) => onRemoveSelection('handle', idx)}
             label={t('calc.selectedProducts')}
          />
          <div>
            <Label className="text-xs text-muted-foreground">{t('calc.handleShape')}</Label>
            <Select
              value={accessories.handle.model || 'bar'}
              onValueChange={(model: 'bar' | 'round' | 'square') => onHandleChange({ model, ...(model === 'round' ? { length: 0 } : {}) })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">{t('calc.handleBar')}</SelectItem>
                <SelectItem value="round">{t('calc.handleRound')}</SelectItem>
                <SelectItem value="square">{t('calc.handleSquare')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {accessories.handle.model !== 'round' && (
              <div>
                <Label className="text-xs text-muted-foreground">{t('calc.handleLengthLabel')}</Label>
                <Select
                  value={accessories.handle.length.toString()}
                  onValueChange={(len) => onHandleChange({ length: parseInt(len) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {handleLengths.map((len) => (
                      <SelectItem key={len} value={len.toString()}>{len} mm</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <FinishSelector
              label={t('calc.finishLabelShort')}
              materialCode={accessories.handle.materialCode || HANDLE_CODES.shell}
              value={accessories.handle.finish}
              onValueChange={(finish) => onHandleChange({ finish: finish as FinishType })}
            />
          </div>
          <DimensionInput
            label={t('calc.handlePositionY')}
            value={accessories.handle.positionY ?? Math.round(cabinHeight / 2)}
            onChange={(val) => onHandleChange({ positionY: val })}
            min={100}
            max={cabinHeight - 100}
            step={10}
          />
        </div>
        )}
      </Card>
      )}

      {/* Seals */}
      <Card className="p-4">
        <SectionHeader id="seals" label={t('calc.sealsLabel')} />
        {openSections.has('seals') && (
        <div className="mt-3 space-y-4">
          {/* Magnetic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2 -mx-1">
              <div>
                <span className="text-sm font-medium">{t('calc.magneticSeal')}</span>
                <p className="text-xs text-muted-foreground">{t('calc.magneticSealDesc')}</p>
              </div>
              <Switch
                checked={accessories.seals.magnetic}
                onCheckedChange={(magnetic) => onSealsChange({ magnetic })}
              />
            </div>
            {accessories.seals.magnetic && (
              <div className="space-y-2">
                <AccessoryPresetManager
                  productType="shower"
                  category="profile_seal"
                  presetCategory="profile_seal_magnetic"
                  selectedCode={accessories.seals.magneticMaterialCode}
                  onSelect={(code) => onSealsChange({ magneticMaterialCode: code || undefined })}
                  onProductAdd={(product) => onAddSealSelection('magnetic', {
                    materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
                  })}
                />
                <CatalogProductSelector
                  category="profile_seal"
                  presetCategory="profile_seal_magnetic"
                  productType="shower"
                  label={t('calc.selectMagneticSeal')}
                  value=""
                  onValueChange={() => {}}
                  onProductAdd={(product) => onAddSealSelection('magnetic', {
                    materialCode: product.code,
                    name: product.name,
                    unitPrice: product.unitPrice ?? undefined,
                  })}
                />
                <SelectionListManager
                  items={accessories.seals.magneticSelections || []}
                  category="profile_seal"
                  onRemove={(idx) => onRemoveSealSelection('magnetic', idx)}
                   label={t('calc.selectedProducts')}
                />
              </div>
            )}
          </div>
          <Separator className="my-3 border-t-2 bg-foreground/30" />
          {/* Rubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2 -mx-1">
              <div>
                <span className="text-sm font-medium">{t('calc.rubberSeal')}</span>
                <p className="text-xs text-muted-foreground">{t('calc.rubberSealDesc')}</p>
              </div>
              <Switch
                checked={accessories.seals.rubber}
                onCheckedChange={(rubber) => onSealsChange({ rubber })}
              />
            </div>
            {accessories.seals.rubber && (
              <div className="space-y-2">
                <AccessoryPresetManager
                  productType="shower"
                  category="profile_seal"
                  presetCategory="profile_seal_rubber"
                  selectedCode={accessories.seals.rubberMaterialCode}
                  onSelect={(code) => onSealsChange({ rubberMaterialCode: code || undefined })}
                  onProductAdd={(product) => onAddSealSelection('rubber', {
                    materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
                  })}
                />
                <CatalogProductSelector
                  category="profile_seal"
                  presetCategory="profile_seal_rubber"
                  productType="shower"
                  label={t('calc.selectRubberSeal')}
                  value=""
                  onValueChange={() => {}}
                  onProductAdd={(product) => onAddSealSelection('rubber', {
                    materialCode: product.code,
                    name: product.name,
                    unitPrice: product.unitPrice ?? undefined,
                  })}
                />
                <SelectionListManager
                  items={accessories.seals.rubberSelections || []}
                  category="profile_seal"
                  onRemove={(idx) => onRemoveSealSelection('rubber', idx)}
                   label={t('calc.selectedProducts')}
                />
              </div>
            )}
          </div>
          <Separator className="my-3 border-t-2 bg-foreground/30" />
          {/* Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2 -mx-1">
              <div>
                <span className="text-sm font-medium">{t('calc.thresholdSealShower')}</span>
                <p className="text-xs text-muted-foreground">{t('calc.thresholdSealShowerDesc')}</p>
              </div>
              <Switch
                checked={accessories.seals.threshold}
                onCheckedChange={(threshold) => onSealsChange({ threshold })}
              />
            </div>
            {accessories.seals.threshold && (
              <div className="space-y-2">
                <AccessoryPresetManager
                  productType="shower"
                  category="profile_seal"
                  presetCategory="profile_seal_threshold"
                  selectedCode={accessories.seals.thresholdMaterialCode}
                  onSelect={(code) => onSealsChange({ thresholdMaterialCode: code || undefined })}
                  onProductAdd={(product) => onAddSealSelection('threshold', {
                    materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
                  })}
                />
                <CatalogProductSelector
                  category="profile_seal"
                  presetCategory="profile_seal_threshold"
                  productType="shower"
                  label={t('calc.selectThresholdSeal')}
                  value=""
                  onValueChange={() => {}}
                  onProductAdd={(product) => onAddSealSelection('threshold', {
                    materialCode: product.code,
                    name: product.name,
                    unitPrice: product.unitPrice ?? undefined,
                  })}
                />
                <SelectionListManager
                  items={accessories.seals.thresholdSelections || []}
                  category="profile_seal"
                  onRemove={(idx) => onRemoveSealSelection('threshold', idx)}
                   label={t('calc.selectedProducts')}
                />
              </div>
            )}
          </div>
        </div>
        )}
      </Card>

      {/* Perimeter Profiles / Profile U */}
      <Card className="p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('profiles')}>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium cursor-pointer">{t('calc.perimeterProfiles')}</Label>
            <Switch checked={accessories.profiles.enabled !== false} onCheckedChange={(checked) => { onProfilesChange({ enabled: checked }); }} onClick={(e) => e.stopPropagation()} />
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", !openSections.has('profiles') && "-rotate-90")} />
        </div>
        {openSections.has('profiles') && accessories.profiles.enabled !== false && (
          <>
            <p className="text-xs text-muted-foreground mt-2 mb-3">
              {t('calc.perimeterProfilesHint')}
            </p>
            <div className="space-y-3">
              <AccessoryPresetManager
                productType="shower"
                category="profile_u"
                label=""
                selectedCode={accessories.profiles.materialCode}
                onSelect={(code) => onProfilesChange({ materialCode: code || undefined })}
                onProductAdd={(product) => onAddSelection('profiles', {
                  materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
                })}
              />
              <CatalogProductSelector
                category="profile_u"
               label={t('calc.selectProductLabel')}
                value=""
                onValueChange={() => {}}
                onProductAdd={(product) => onAddSelection('profiles', {
                  materialCode: product.code,
                  name: product.name,
                  unitPrice: product.unitPrice ?? undefined,
                })}
                productType="shower"
              />
              <SelectionListManager
                items={accessories.profiles.selections || []}
                category="profile_u"
                onRemove={(idx) => onRemoveSelection('profiles', idx)}
                 label={t('calc.selectedProducts')}
              />
              <FinishSelector
                label={t('calc.profileFinish')}
                materialCode={accessories.profiles.materialCode || PROFILE_CODES.u_1914}
                value={accessories.profiles.finish}
                onValueChange={(finish) => onProfilesChange({ finish: finish as FinishType })}
              />
              {/* Profile sides selector */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('calc.profileSides')}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { key: 'left' as const, label: t('calc.sideLeft'), icon: ArrowLeft },
                    { key: 'right' as const, label: t('calc.sideRight'), icon: ArrowRight },
                    { key: 'top' as const, label: t('calc.sideTop'), icon: ArrowUp },
                    { key: 'bottom' as const, label: t('calc.sideBottom'), icon: ArrowDown },
                  ]).map(({ key, label, icon: Icon }) => {
                    const sides = accessories.profiles.sides ?? { left: true, right: true, top: false, bottom: true };
                    const isActive = sides[key];
                    return (
                      <Card
                        key={key}
                        className={cn(
                          'p-2.5 cursor-pointer text-center transition-colors flex flex-col items-center gap-1',
                          isActive
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'hover:border-primary/50 opacity-60'
                        )}
                        onClick={() => onProfilesChange({
                          sides: { ...sides, [key]: !isActive },
                        })}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{label}</span>
                      </Card>
                    );
                  })}
                </div>

                {/* Switch: deduct full profile height from fixed panels */}
                <div className="flex items-center gap-2 mt-3">
                  <Switch
                    checked={!!accessories.profiles.deductFullProfileHeight}
                    onCheckedChange={(checked) => onProfilesChange({ deductFullProfileHeight: checked })}
                  />
                  <Label className="text-xs">{t('calc.deductFullProfileHeight')}</Label>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Stabilizers */}
      <Card className="p-4">
        <SectionHeader id="stabilizers" label={t('calc.stabilizerBars')} />
        {openSections.has('stabilizers') && (
        <div className="mt-3 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">{t('calc.stabilizerBarShape')}</Label>
            <Select
              value={accessories.stabilizerShape || 'round'}
              onValueChange={(val: 'round' | 'rectangular') => onStabilizerShapeChange(val)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round">{t('calc.stabilizerRound')}</SelectItem>
                <SelectItem value="rectangular">{t('calc.stabilizerRectangular')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DimensionInput
            label={t('calc.stabilizerPipeLength')}
            value={stabilizerLength}
            onChange={setStabilizerLength}
            min={100}
            max={3000}
            step={1}
            helperText={cabinType === 'corner_90' ? `Frontal (${dimensions.width}) + Lateral (${dimensions.depth}) = ${dimensions.width + dimensions.depth} mm` : t('calc.stabilizerPipeLengthHint')}
          />
          <AccessoryPresetManager
            productType="shower"
            category="stabilizer"
            label=""
            selectedCode=""
            onSelect={() => {}}
            filterTags={[accessories.stabilizerShape || 'round']}
            onProductAdd={(product) => {
              const isTeava = product.code.startsWith('35.') || product.code.startsWith('72.');
              onAddStabilizerSelection({
                materialCode: product.code,
                name: product.name,
                unitPrice: product.unitPrice,
                length: isTeava ? stabilizerLength : undefined,
              });
            }}
          />
          <CatalogProductSelector
            category="stabilizer"
             label={t('calc.selectProductLabel')}
            value=""
            onValueChange={() => {}}
            filterTags={[accessories.stabilizerShape || 'round']}
            onProductAdd={(product) => {
              const isTeava = product.code.startsWith('35.') || product.code.startsWith('72.');
              onAddStabilizerSelection({
                materialCode: product.code,
                name: product.name,
                unitPrice: product.unitPrice ?? undefined,
                length: isTeava ? stabilizerLength : undefined,
              });
            }}
            productType="shower"
          />
          <SelectionListManager
            items={accessories.stabilizerSelections || []}
            category="stabilizer"
            onRemove={(idx) => onRemoveStabilizerSelection(idx)}
            onLengthChange={(idx, len) => onUpdateStabilizerSelectionLength(idx, len)}
            showLength={(item) => item.materialCode.startsWith('35.') || item.materialCode.startsWith('72.')}
             label={t('calc.selectedProducts')}
          />
        </div>
        )}
      </Card>

    </>
  );

  return (
    <div className="space-y-6">
      {showLateral ? (
        <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-700">{t('calc.frontalAccessories')}</h3>
          {frontalContent}
        </div>
      ) : (
        frontalContent
      )}

      {/* ═══ LATERAL ACCESSORIES ═══ */}
      {showLateral && (
        <div className="space-y-4 bg-orange-50/50 p-4 rounded-lg border border-orange-200">
          <h3 className="text-sm font-semibold text-orange-700">{t('calc.lateralAccessories')}</h3>

          {/* Lateral Door Configuration moved to DimensionsStep (step 3) */}

          {/* Lateral Hinges */}
          {showLateralHinges && (
            <Card className="p-4">
              <SectionHeader id="lateralHinges" label={t('calc.lateralHinges')} />
              {openSections.has('lateralHinges') && (
              <div className="mt-3 space-y-3">
                <AccessoryPresetManager
                  productType="shower"
                  category="hinge"
                  label=""
                  selectedCode={lateralConfig.hinges.materialCode}
                  onSelect={(code) => onLateralHingesChange({ materialCode: code || undefined })}
                  onProductAdd={(product) => onAddLateralHingeSelection({
                    materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
                  })}
                />
                <CatalogProductSelector category="hinge" label={t('calc.selectProductLabel')} value="" onValueChange={() => {}}
                  onProductAdd={(product) => onAddLateralHingeSelection({
                    materialCode: product.code, name: product.name, unitPrice: product.unitPrice ?? undefined,
                  })} productType="shower" />
                <SelectionListManager
                  items={lateralConfig.hinges.selections || []}
                  category="hinge"
                  onRemove={(idx) => onRemoveLateralHingeSelection(idx)}
                   label={t('calc.selectedProducts')}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t('calc.hingeCount')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[2, 3].map((qty) => (
                      <Card
                        key={qty}
                        className={`p-2.5 cursor-pointer text-center transition-colors ${
                          lateralConfig.hinges.quantity === qty
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => onLateralHingesChange({ quantity: qty })}
                      >
                        <span className="text-sm font-medium">{t('calc.nHinges', { n: qty })}</span>
                      </Card>
                    ))}
                  </div>
                </div>
                <FinishSelector label={t('calc.finishLabelShort')} materialCode={lateralConfig.hinges.materialCode || getHingeMaterialCode(lateralConfig.hinges.type)}
                  value={lateralConfig.hinges.finish}
                  onValueChange={(finish) => onLateralHingesChange({ finish: finish as FinishType })} />
              </div>
              )}
            </Card>
          )}

          {/* Lateral Handle */}
          <Card className="p-4">
            <SectionHeader id="lateralHandle" label={t('calc.lateralHandle')} />
            {openSections.has('lateralHandle') && (
            <div className="mt-3 space-y-3">
              <AccessoryPresetManager
                productType="shower"
                category="handle"
                label=""
                selectedCode={lateralConfig.handle.materialCode}
                onSelect={(code) => onLateralHandleChange({ materialCode: code || undefined })}
                onProductAdd={(product) => onAddLateralHandleSelection({
                  materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
                })}
              />
              <CatalogProductSelector category="handle" label={t('calc.selectProductLabel')} value="" onValueChange={() => {}}
                onProductAdd={(product) => onAddLateralHandleSelection({
                  materialCode: product.code, name: product.name, unitPrice: product.unitPrice ?? undefined,
                })} productType="shower" />
              <SelectionListManager
                items={lateralConfig.handle.selections || []}
                category="handle"
                onRemove={(idx) => onRemoveLateralHandleSelection(idx)}
                label={t('calc.selectedProducts')}
              />
              <div>
                <Label className="text-xs text-muted-foreground">{t('calc.handleShape')}</Label>
                <Select
                  value={lateralConfig.handle.model || 'bar'}
                  onValueChange={(model: 'bar' | 'round' | 'square') => onLateralHandleChange({ model, ...(model === 'round' ? { length: 0 } : {}) })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">{t('calc.handleBar')}</SelectItem>
                    <SelectItem value="round">{t('calc.handleRound')}</SelectItem>
                    <SelectItem value="square">{t('calc.handleSquare')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(lateralConfig.handle.model || 'bar') !== 'round' && (
                <div>
                  <Label className="text-xs text-muted-foreground">{t('calc.handleLengthLabel')}</Label>
                  <Select value={lateralConfig.handle.length.toString()}
                    onValueChange={(len) => onLateralHandleChange({ length: parseInt(len) })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {handleLengths.map((len) => (
                        <SelectItem key={len} value={len.toString()}>{len} mm</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                )}
                <FinishSelector label={t('calc.finishLabelShort')} materialCode={lateralConfig.handle.materialCode || HANDLE_CODES.shell}
                  value={lateralConfig.handle.finish}
                  onValueChange={(finish) => onLateralHandleChange({ finish: finish as FinishType })} />
              </div>
              <DimensionInput
                label={t('calc.handlePositionY')}
                value={lateralConfig.handle.positionY ?? Math.round(cabinHeight / 2)}
                onChange={(val) => onLateralHandleChange({ positionY: val })}
                min={100}
                max={cabinHeight - 100}
                step={10}
              />
            </div>
            )}
          </Card>

          {/* Lateral Seals */}
          <Card className="p-4">
            <SectionHeader id="lateralSeals" label={t('calc.lateralSealsLabel')} />
            {openSections.has('lateralSeals') && (
            <div className="mt-3 space-y-4">
              {(['magnetic', 'rubber', 'threshold'] as const).map((sealType) => {
                const labels: Record<string, string> = { magnetic: t('calc.magneticSeal'), rubber: t('calc.rubberSeal'), threshold: t('calc.thresholdSealShower') };
                const selectionsKey = `${sealType}Selections` as const;
                const materialCodeKey = `${sealType}MaterialCode` as const;
                return (
                  <div key={sealType} className="space-y-2">
                    <div className="flex items-center justify-between bg-muted rounded-md px-3 py-2 -mx-1">
                      <span className="text-sm font-medium">{labels[sealType]}</span>
                      <Switch checked={lateralConfig.seals[sealType]}
                        onCheckedChange={(val) => onLateralSealsChange({ [sealType]: val })} />
                    </div>
                    {lateralConfig.seals[sealType] && (
                      <div className="space-y-2">
                        <AccessoryPresetManager
                          productType="shower"
                          category="profile_seal"
                          presetCategory={`profile_seal_${sealType}`}
                          selectedCode={lateralConfig.seals[materialCodeKey] as string | undefined}
                          onSelect={(code) => onLateralSealsChange({ [materialCodeKey]: code || undefined })}
                          onProductAdd={(product) => onAddLateralSealSelection(sealType, {
                            materialCode: product.code, name: product.name, unitPrice: product.unitPrice,
                          })}
                        />
                        <CatalogProductSelector category="profile_seal" presetCategory={`profile_seal_${sealType}`}
                          productType="shower" label={t('calc.selectSealLabel', { type: labels[sealType].toLowerCase() })}
                          value="" onValueChange={() => {}}
                          onProductAdd={(product) => onAddLateralSealSelection(sealType, {
                            materialCode: product.code, name: product.name, unitPrice: product.unitPrice ?? undefined,
                          })} />
                        <SelectionListManager
                          items={(lateralConfig.seals[selectionsKey] || []) as Array<{materialCode: string; name?: string}>}
                          category="profile_seal"
                          onRemove={(idx) => onRemoveLateralSealSelection(sealType, idx)}
                        />
                      </div>
                    )}
                    {sealType !== 'threshold' && <Separator className="my-3 border-t-2 bg-foreground/30" />}
                  </div>
                );
              })}
            </div>
            )}
          </Card>
        </div>
      )}

      {/* Edge Polishing */}
      <EdgePolishingOption
        enabled={edgePolish.enabled}
        polishType={edgePolish.type}
        onEnabledChange={(enabled) => onEdgePolishChange({ enabled })}
        onPolishTypeChange={(type) => onEdgePolishChange({ type })}
        glassPieces={(() => {
          const pieces: GlassPiece[] = [];
          pieces.push({ name: t('calc.door'), width: dimensions.doorWidth, height: dimensions.height, quantity: 1 });
          if (fixedPanel?.left?.enabled) pieces.push({ name: t('calc.fixedPanelLeft'), width: fixedPanel.left.width, height: fixedPanel.left.height ?? dimensions.height, quantity: 1 });
          if (fixedPanel?.right?.enabled) pieces.push({ name: t('calc.fixedPanelRight'), width: fixedPanel.right.width, height: fixedPanel.right.height ?? dimensions.height, quantity: 1 });
          if (cabinType === 'corner_90' && lateralConfig?.enabled) {
            pieces.push({ name: t('calc.lateralDoor'), width: dimensions.lateralDoorWidth, height: dimensions.height, quantity: 1 });
            if (lateralConfig.fixedPanel.left.enabled) pieces.push({ name: t('calc.lateralFixedLeft'), width: lateralConfig.fixedPanel.left.width, height: lateralConfig.fixedPanel.left.height ?? dimensions.height, quantity: 1 });
            if (lateralConfig.fixedPanel.right.enabled) pieces.push({ name: t('calc.lateralFixedRight'), width: lateralConfig.fixedPanel.right.width, height: lateralConfig.fixedPanel.right.height ?? dimensions.height, quantity: 1 });
          } else if (cabinType === 'corner_90') {
            const openingSide = accessories.openingSide || 'front';
            const fullPanelWall = openingSide === 'front' ? dimensions.depth : dimensions.width;
            pieces.push({ name: t('calc.lateralPanel'), width: fullPanelWall, height: dimensions.height, quantity: 1 });
          }
          return pieces;
        })()}
      />

      {/* Extra Accessories + Kit - unified */}
      <ExtraAccessoriesSection
        extraAccessories={accessories.extraAccessories || []}
        onAdd={onAddExtraAccessory}
        onRemove={onRemoveExtraAccessory}
        onUpdate={onUpdateExtraAccessory}
        productType="shower"
        selectedKit={selectedKit}
        onSelectKit={onSelectKit}
        onRemoveKit={onRemoveKit}
      />
    </div>
  );
}
