import { DimensionInput } from '@/components/calculators/shared/DimensionInput';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ShowerConfig, ShowerCabinType, ShowerDoorType, LateralConfig, DoorPosition, DoorOpenDirection, OpeningSide } from '@/types/calculators';
import { useTranslation } from 'react-i18next';

interface DimensionsStepProps {
  cabinType: ShowerCabinType;
  doorType: ShowerDoorType;
  dimensions: ShowerConfig['dimensions'];
  onChange: (dimensions: Partial<ShowerConfig['dimensions']>) => void;
  fixedPanel: ShowerConfig['accessories']['fixedPanel'];
  onFixedPanelChange: (side: 'left' | 'right', updates: Partial<{ enabled: boolean; width: number; height: number }>) => void;
  lateralConfig: LateralConfig;
  onLateralEnabledChange: (enabled: boolean) => void;
  onLateralDoorTypeChange: (doorType: ShowerDoorType) => void;
  onLateralFixedPanelChange: (side: 'left' | 'right', updates: Partial<{ enabled: boolean; width: number; height: number }>) => void;
  // Door config props (moved from step 5)
  accessories: ShowerConfig['accessories'];
  onOpeningSideChange: (openingSide: OpeningSide) => void;
  onDoorConfigChange: (doorConfig: Partial<ShowerConfig['accessories']['door']>) => void;
  onLateralDoorConfigChange: (doorConfig: Partial<LateralConfig['door']>) => void;
  kitDeductions?: { door_height_deduction?: number; fixed_panel_height_deduction?: number; width_overlap?: number };
  pentagonSides?: { left: boolean; right: boolean; back: boolean };
  onPentagonSidesChange?: (sides: { left: boolean; right: boolean; back: boolean }) => void;
}

export function DimensionsStep({ 
  cabinType, doorType, dimensions, onChange, fixedPanel, onFixedPanelChange,
  lateralConfig, onLateralEnabledChange, onLateralDoorTypeChange, onLateralFixedPanelChange,
  accessories, onOpeningSideChange, onDoorConfigChange, onLateralDoorConfigChange,
  kitDeductions, pentagonSides, onPentagonSidesChange,
}: DimensionsStepProps) {
  const { t } = useTranslation();
  const needsDepth = cabinType === 'corner_90' || cabinType === 'pentagon';
  const isCorner90 = cabinType === 'corner_90';
  const openingSide = accessories.openingSide || 'front';

  // Height deductions from kit (or defaults)
  const doorHDeduction = kitDeductions?.door_height_deduction ?? 40;
  const fixedHDeduction = kitDeductions?.fixed_panel_height_deduction ?? 46;
  
  const leftW = fixedPanel.left.enabled ? fixedPanel.left.width : 0;
  const rightW = fixedPanel.right.enabled ? fixedPanel.right.width : 0;
  // Active wall for door: width when front, depth when lateral
  const activeWall = openingSide === 'front' ? dimensions.width : dimensions.depth;
  const maxPanelTotal = activeWall - 400 - 20;
  const panelError = (leftW + rightW) > maxPanelTotal ? t('calc.panelExceedError') : undefined;

  const latLeftW = lateralConfig.fixedPanel.left.enabled ? lateralConfig.fixedPanel.left.width : 0;
  const latRightW = lateralConfig.fixedPanel.right.enabled ? lateralConfig.fixedPanel.right.width : 0;
  const maxLatPanelTotal = dimensions.depth - 400 - 20;
  const latPanelError = lateralConfig.enabled && (latLeftW + latRightW) > maxLatPanelTotal ? t('calc.panelExceedError') : undefined;
  
  return (
    <div className="space-y-4">
      {/* Pentagon sides selection */}
      {cabinType === 'pentagon' && pentagonSides && onPentagonSidesChange && (
        <Card className="p-3">
          <Label className="text-xs font-medium">{t('calc.pentagonSides', 'Laturi sticlă Pentagon')}</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">
            {t('calc.pentagonSidesDesc', 'Selectează ce laturi au panou de sticlă')}
          </p>
          <div className="space-y-2">
            {([
              { key: 'left' as const, label: t('calc.sideLeft', 'Stânga') },
              { key: 'right' as const, label: t('calc.sideRight', 'Dreapta') },
              { key: 'back' as const, label: t('calc.sideBack', 'Spate') },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-xs">{label}</Label>
                <Switch
                  checked={pentagonSides[key]}
                  onCheckedChange={(checked) =>
                    onPentagonSidesChange({ ...pentagonSides, [key]: checked })
                  }
                />
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Opening Side Selection - at the top, only show when lateral is NOT enabled */}
      {cabinType !== 'fixed_panel' && !(isCorner90 && lateralConfig.enabled) && (
        <Card className="p-3">
          <Label className="text-xs font-medium">{t('calc.openingSideLabel')}</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">
            {t('calc.openingSideHint')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpeningSideChange('front')}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg border-2 transition-all",
                openingSide === 'front'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-xs font-medium">{t('calc.frontalLabel')}</span>
              <span className="text-[10px] text-muted-foreground">{t('calc.frontalHint')}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpeningSideChange('lateral')}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg border-2 transition-all",
                openingSide === 'lateral'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-xs font-medium">{t('calc.lateralLabel')}</span>
              <span className="text-[10px] text-muted-foreground">{t('calc.lateralHint')}</span>
            </button>
          </div>
        </Card>
      )}

      {/* Door Configuration (frontal) - right after opening side */}
      {cabinType !== 'fixed_panel' && (
      <Card className="p-2">
        <Label className="text-xs font-medium">{t('calc.doorConfigLabel')}</Label>
        
        {doorType === 'sliding' && (
          <div className="mt-1">
            <Label className="text-[10px] text-muted-foreground">{t('calc.slidingDirectionLabel')}</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <button type="button" onClick={() => onDoorConfigChange({ slidingDirection: 'left' })}
                className={cn("flex flex-col items-center p-1.5 rounded border-2 transition-all",
                  (accessories.door?.slidingDirection || 'left') === 'left' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                <svg width="32" height="24" viewBox="0 0 50 40">
                  <rect x="5" y="5" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                  <line x1="35" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,14 15,20 22,26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
                <span className="text-[10px] font-medium">{t('calc.left')}</span>
              </button>
              <button type="button" onClick={() => onDoorConfigChange({ slidingDirection: 'right' })}
                className={cn("flex flex-col items-center p-1.5 rounded border-2 transition-all",
                  accessories.door?.slidingDirection === 'right' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                <svg width="32" height="24" viewBox="0 0 50 40">
                  <rect x="5" y="5" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                  <line x1="15" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="28,14 35,20 28,26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
                <span className="text-[10px] font-medium">{t('calc.right')}</span>
              </button>
            </div>
          </div>
        )}

        {doorType !== 'sliding' && (
          <div className="mt-1 grid grid-cols-2 gap-1.5">
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('calc.doorPositionLabel')}</Label>
              <Select value={accessories.door?.position || 'left'} onValueChange={(position: DoorPosition) => onDoorConfigChange({ position })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                   <SelectItem value="left">{t('calc.left')}</SelectItem>
                  <SelectItem value="right">{t('calc.right')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{t('calc.openDirectionLabel')}</Label>
              <Select value={accessories.door?.openDirection || 'inward'} onValueChange={(openDirection: DoorOpenDirection) => onDoorConfigChange({ openDirection })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inward">{t('calc.inwardLabel')}</SelectItem>
                  <SelectItem value="outward">{t('calc.outwardLabel')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {doorType !== 'sliding' && (
          <div className="mt-1.5">
            <Label className="text-[10px] text-muted-foreground">{t('calc.hingeSideLabel')}</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <button type="button" onClick={() => onDoorConfigChange({ hingeSide: 'left' })}
                className={cn("flex flex-col items-center p-1.5 rounded border-2 transition-all",
                  (accessories.door?.hingeSide || 'left') === 'left' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                <svg width="32" height="24" viewBox="0 0 50 40">
                  <rect x="5" y="2" width="40" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                  <rect x="5" y="6" width="4" height="6" fill="currentColor" opacity="0.8"/>
                  <rect x="5" y="17" width="4" height="6" fill="currentColor" opacity="0.8"/>
                  <rect x="5" y="28" width="4" height="6" fill="currentColor" opacity="0.8"/>
                  <circle cx="38" cy="20" r="4" fill="currentColor" opacity="0.5"/>
                </svg>
                <span className="text-[10px] font-medium">{t('calc.left')}</span>
              </button>
              <button type="button" onClick={() => onDoorConfigChange({ hingeSide: 'right' })}
                className={cn("flex flex-col items-center p-1.5 rounded border-2 transition-all",
                  accessories.door?.hingeSide === 'right' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                <svg width="32" height="24" viewBox="0 0 50 40">
                  <rect x="5" y="2" width="40" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                  <circle cx="12" cy="20" r="4" fill="currentColor" opacity="0.5"/>
                  <rect x="41" y="6" width="4" height="6" fill="currentColor" opacity="0.8"/>
                  <rect x="41" y="17" width="4" height="6" fill="currentColor" opacity="0.8"/>
                  <rect x="41" y="28" width="4" height="6" fill="currentColor" opacity="0.8"/>
                </svg>
                <span className="text-[10px] font-medium">{t('calc.right')}</span>
              </button>
            </div>
          </div>
        )}
      </Card>
      )}

      <div>
        <h3 className="text-sm font-semibold text-primary">{t('calc.dimensions', 'Dimensiuni')}</h3>
        <p className="text-xs text-muted-foreground">{t('calc.dimensionsDesc', 'Introdu dimensiunile cabinei')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DimensionInput label={t('calc.totalWidthLabel')} value={dimensions.width} onChange={(width) => onChange({ width })} min={500} max={3000} helperText="500 - 3000 mm" />
        <DimensionInput label={t('calc.height')} value={dimensions.height} onChange={(height) => onChange({ height })} min={1500} max={2500} helperText="1500 - 2500 mm" />
      </div>
      
      {needsDepth && (
        <DimensionInput label={t('calc.cabinDepth')} value={dimensions.depth} onChange={(depth) => onChange({ depth })} min={500} max={2000} helperText="500 - 2000 mm" />
      )}

      {/* === FRONTAL SIDE === */}
      <div className={isCorner90 && lateralConfig.enabled ? "space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-200" : "space-y-4"}>

      
        {/* Door width indicator (auto-calculated) */}
        {cabinType !== 'fixed_panel' && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md text-sm">
          <span className="text-muted-foreground">{t('calc.doorWidthLabel')}:</span>
          <span className="font-medium">{dimensions.doorWidth} mm{doorType === 'sliding' && (kitDeductions?.width_overlap ?? 0) > 0 ? <span className="text-xs text-muted-foreground ml-1">+ {kitDeductions?.width_overlap ?? 0}</span> : null}</span>
        </div>
        )}
        {doorType === 'sliding' && (
          <>
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md text-sm">
              <span className="text-muted-foreground">{t('calc.glassHeightDoor', 'Înălțime sticlă ușă')}:</span>
              <span className="font-medium">{dimensions.height - doorHDeduction} mm <span className="text-xs text-muted-foreground ml-1">- {doorHDeduction}</span></span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md text-sm">
              <span className="text-muted-foreground">{t('calc.glassHeightFixed', 'Înălțime sticlă fix')}:</span>
              <span className="font-medium">{dimensions.height - fixedHDeduction} mm <span className="text-xs text-muted-foreground ml-1">- {fixedHDeduction}</span></span>
            </div>
          </>
        )}
        {panelError && <p className="text-xs text-destructive">{panelError}</p>}
      
        {cabinType !== 'fixed_panel' && (<>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-sm font-medium">{t('calc.fixedPanelLeft')}</Label>
              <p className="text-xs text-muted-foreground">{t('calc.fixedPanelLeftDesc')}</p>
            </div>
            <Switch checked={fixedPanel.left.enabled} onCheckedChange={(enabled) => onFixedPanelChange('left', { enabled })} />
          </div>
        {fixedPanel.left.enabled && (
            <div className="pt-3 border-t space-y-3">
              <DimensionInput label={t('calc.fixedPanelWidthLeft')} value={fixedPanel.left.width} onChange={(width) => onFixedPanelChange('left', { width })} min={100} max={maxPanelTotal - rightW} helperText={`100 - ${Math.max(100, maxPanelTotal - rightW)} mm`} />
              <DimensionInput label={t('calc.fixedPanelHeight', 'Înălțime panou (de la sus)')} value={fixedPanel.left.height ?? (dimensions.frontalHeightA !== undefined ? dimensions.frontalHeightA : dimensions.height)} onChange={(height) => onFixedPanelChange('left', { height })} min={300} max={dimensions.frontalHeightA ?? dimensions.height} helperText={`300 - ${dimensions.frontalHeightA ?? dimensions.height} mm`} />
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-sm font-medium">{t('calc.fixedPanelRight')}</Label>
              <p className="text-xs text-muted-foreground">{t('calc.fixedPanelRightDesc')}</p>
            </div>
            <Switch checked={fixedPanel.right.enabled} onCheckedChange={(enabled) => onFixedPanelChange('right', { enabled })} />
          </div>
        {fixedPanel.right.enabled && (
            <div className="pt-3 border-t space-y-3">
              <DimensionInput label={t('calc.fixedPanelWidthRight')} value={fixedPanel.right.width} onChange={(width) => onFixedPanelChange('right', { width })} min={100} max={maxPanelTotal - leftW} helperText={`100 - ${Math.max(100, maxPanelTotal - leftW)} mm`} />
              <DimensionInput label={t('calc.fixedPanelHeight', 'Înălțime panou (de la sus)')} value={fixedPanel.right.height ?? (dimensions.frontalHeightB !== undefined ? dimensions.frontalHeightB : dimensions.height)} onChange={(height) => onFixedPanelChange('right', { height })} min={300} max={dimensions.frontalHeightB ?? dimensions.height} helperText={`300 - ${dimensions.frontalHeightB ?? dimensions.height} mm`} />
            </div>
          )}
        </Card>
        </>)}
      </div>

      {/* ═══ FRONTAL — trapezoid toggle ═══ */}
      <Card className="p-4 border-dashed">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="text-sm font-medium">{cabinType === 'fixed_panel' ? t('calc.trapezoidSingle') : t('calc.trapezoidFrontal')}</Label>
            <p className="text-xs text-muted-foreground">{cabinType === 'fixed_panel' ? t('calc.trapezoidSingleDesc') : t('calc.trapezoidFrontalDesc')}</p>
          </div>
          <Switch
            checked={dimensions.frontalHeightA !== undefined && dimensions.frontalHeightA !== dimensions.frontalHeightB}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange({ frontalHeightA: dimensions.height, frontalHeightB: Math.round(dimensions.height * 0.8) });
              } else {
                onChange({ frontalHeightA: undefined, frontalHeightB: undefined });
              }
            }}
          />
        </div>
        {dimensions.frontalHeightA !== undefined && (
          <div className="pt-3 border-t grid grid-cols-2 gap-3">
            <DimensionInput
              label={t('calc.heightALeft')}
              value={dimensions.frontalHeightA}
              onChange={(v) => onChange({ frontalHeightA: v })}
              min={500}
              max={2500}
              helperText="500 - 2500 mm"
            />
            <DimensionInput
              label={t('calc.heightBRight')}
              value={dimensions.frontalHeightB ?? dimensions.height}
              onChange={(v) => onChange({ frontalHeightB: v })}
              min={500}
              max={2500}
              helperText="500 - 2500 mm"
            />
          </div>
        )}
      </Card>

      {/* ═══ FULL FIXED PANEL (opposite side) — trapezoid toggle ═══ */}
      {isCorner90 && !lateralConfig.enabled && (
        <Card className="p-4 border-dashed">
          <div className="flex items-center justify-between mb-3">
            <div>
            <Label className="text-sm font-medium">{t('calc.trapezoidLateral')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('calc.trapezoidLateralDesc')}
              </p>
            </div>
            <Switch
              checked={dimensions.lateralHeightA !== undefined && dimensions.lateralHeightA !== dimensions.lateralHeightB}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange({ lateralHeightA: dimensions.height, lateralHeightB: Math.round(dimensions.height * 0.8) });
                } else {
                  onChange({ lateralHeightA: undefined, lateralHeightB: undefined });
                }
              }}
            />
          </div>
          {dimensions.lateralHeightA !== undefined && (
            <div className="pt-3 border-t grid grid-cols-2 gap-3">
              <DimensionInput
                label={t('calc.sideA')}
                value={dimensions.lateralHeightA}
                onChange={(v) => onChange({ lateralHeightA: v })}
                min={500}
                max={2500}
                helperText="500 - 2500 mm"
              />
              <DimensionInput
                label={t('calc.sideB')}
                value={dimensions.lateralHeightB ?? dimensions.height}
                onChange={(v) => onChange({ lateralHeightB: v })}
                min={500}
                max={2500}
                helperText="500 - 2500 mm"
              />
            </div>
          )}
        </Card>
      )}

      {/* === LATERAL SIDE (corner_90 only) === */}
      {isCorner90 && (
        <>
          <Card className="p-4 border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label className="text-sm font-medium">{t('calc.lateral')}</Label>
                <p className="text-xs text-muted-foreground">{t('calc.lateralDesc')}</p>
              </div>
              <Switch checked={lateralConfig.enabled} onCheckedChange={onLateralEnabledChange} />
            </div>
          </Card>

          {lateralConfig.enabled && (
            <div className="space-y-4 bg-orange-50/50 p-4 rounded-lg border border-orange-200">
              <h3 className="text-sm font-semibold text-orange-700">{t('calc.lateral')}</h3>
              {openingSide === 'lateral' && (
                <div className="text-xs text-orange-800 bg-orange-100/70 border border-orange-200 rounded-md px-3 py-2">
                  Latura frontală este panou fix (fără ușă). Configurează aici latura de deschidere:
                  activează „Panou fix stânga (lateral)" pentru perete și/sau „Panou fix dreapta (lateral)" pentru colțul de 90°.
                  Ușa ocupă automat spațiul rămas.
                </div>
              )}

              {doorType !== 'sliding' && (
                <Card className="p-4">
                  <Label className="text-sm font-medium mb-2 block">{t('calc.doorType')}</Label>
                  <Select value={lateralConfig.doorType} onValueChange={(v) => onLateralDoorTypeChange(v as ShowerDoorType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hinged">{t('calc.hinged')}</SelectItem>
                      <SelectItem value="sliding">{t('calc.sliding')}</SelectItem>
                    </SelectContent>
                  </Select>
                </Card>
              )}

              {/* Lateral Door Configuration */}
              <Card className="p-4">
                <Label className="text-sm font-medium">{t('calc.lateralDoorConfig')}</Label>
                
                {lateralConfig.doorType === 'sliding' && (
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground">{t('calc.slidingDirectionLabel')}</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      {t('calc.lateralSlidingHint')}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button type="button" onClick={() => onLateralDoorConfigChange({ slidingDirection: 'left' })}
                        className={cn("flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                          (lateralConfig.door?.slidingDirection || 'left') === 'left' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )}>
                        <svg width="50" height="40" viewBox="0 0 50 40" className="mb-1">
                          <rect x="5" y="5" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                          <line x1="35" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="22,14 15,20 22,26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                        </svg>
                        <span className="text-xs font-medium">{t('calc.left')}</span>
                      </button>
                      <button type="button" onClick={() => onLateralDoorConfigChange({ slidingDirection: 'right' })}
                        className={cn("flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                          lateralConfig.door?.slidingDirection === 'right' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )}>
                        <svg width="50" height="40" viewBox="0 0 50 40" className="mb-1">
                          <rect x="5" y="5" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                          <line x1="15" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="2"/>
                          <polyline points="28,14 35,20 28,26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                        </svg>
                        <span className="text-xs font-medium">{t('calc.right')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {lateralConfig.doorType !== 'sliding' && (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('calc.doorPositionLabel')}</Label>
                        <Select value={lateralConfig.door?.position || 'left'}
                          onValueChange={(position: DoorPosition) => onLateralDoorConfigChange({ position })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">{t('calc.left')}</SelectItem>
                            <SelectItem value="right">{t('calc.right')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t('calc.openDirectionLabel')}</Label>
                        <Select value={lateralConfig.door?.openDirection || 'inward'}
                          onValueChange={(dir: DoorOpenDirection) => onLateralDoorConfigChange({ openDirection: dir })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inward">{t('calc.inwardLabel')}</SelectItem>
                            <SelectItem value="outward">{t('calc.outwardLabel')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground">{t('calc.hingeSideLabel')}</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button type="button" onClick={() => onLateralDoorConfigChange({ hingeSide: 'left' })}
                          className={cn("flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                            (lateralConfig.door?.hingeSide || 'left') === 'left' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}>
                          <span className="text-xs font-medium">{t('calc.left')}</span>
                        </button>
                        <button type="button" onClick={() => onLateralDoorConfigChange({ hingeSide: 'right' })}
                          className={cn("flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                            lateralConfig.door?.hingeSide === 'right' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}>
                          <span className="text-xs font-medium">{t('calc.right')}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
              
              {/* Lateral door width indicator (auto-calculated) */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md text-sm">
                <span className="text-muted-foreground">{t('calc.doorWidthLabel')}:</span>
                <span className="font-medium">{dimensions.lateralDoorWidth} mm{lateralConfig.doorType === 'sliding' && (kitDeductions?.width_overlap ?? 0) > 0 ? <span className="text-xs text-muted-foreground ml-1">+ {kitDeductions?.width_overlap ?? 0}</span> : null}</span>
              </div>
              {lateralConfig.doorType === 'sliding' && (
                <>
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md text-sm">
                    <span className="text-muted-foreground">{t('calc.glassHeightDoor', 'Înălțime sticlă ușă')}:</span>
                    <span className="font-medium">{dimensions.height - doorHDeduction} mm <span className="text-xs text-muted-foreground ml-1">- {doorHDeduction}</span></span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md text-sm">
                    <span className="text-muted-foreground">{t('calc.glassHeightFixed', 'Înălțime sticlă fix')}:</span>
                    <span className="font-medium">{dimensions.height - fixedHDeduction} mm <span className="text-xs text-muted-foreground ml-1">- {fixedHDeduction}</span></span>
                  </div>
                </>
              )}
              {latPanelError && <p className="text-xs text-destructive">{latPanelError}</p>}

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm font-medium">Panou fix dreapta (lateral)</Label>
                    <p className="text-xs text-muted-foreground">{t('calc.fixedPanelLeftDesc')}</p>
                  </div>
                  <Switch checked={lateralConfig.fixedPanel.left.enabled} onCheckedChange={(enabled) => onLateralFixedPanelChange('left', { enabled })} />
                </div>
              {lateralConfig.fixedPanel.left.enabled && (
                  <div className="pt-3 border-t space-y-3">
                    <DimensionInput label={t('calc.fixedPanelWidthLeft')} value={lateralConfig.fixedPanel.left.width} onChange={(width) => onLateralFixedPanelChange('left', { width })} min={100} max={maxLatPanelTotal - latRightW} helperText={`100 - ${Math.max(100, maxLatPanelTotal - latRightW)} mm`} />
                    <DimensionInput label={t('calc.fixedPanelHeight', 'Înălțime panou (de la sus)')} value={lateralConfig.fixedPanel.left.height ?? (dimensions.lateralHeightA !== undefined ? dimensions.lateralHeightA : dimensions.height)} onChange={(height) => onLateralFixedPanelChange('left', { height })} min={300} max={dimensions.lateralHeightA ?? dimensions.height} helperText={`300 - ${dimensions.lateralHeightA ?? dimensions.height} mm`} />
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm font-medium">Panou fix stânga (lateral)</Label>
                    <p className="text-xs text-muted-foreground">{t('calc.fixedPanelRightDesc')}</p>
                  </div>
                  <Switch checked={lateralConfig.fixedPanel.right.enabled} onCheckedChange={(enabled) => onLateralFixedPanelChange('right', { enabled })} />
                </div>
              {lateralConfig.fixedPanel.right.enabled && (
                  <div className="pt-3 border-t space-y-3">
                    <DimensionInput label={t('calc.fixedPanelWidthRight')} value={lateralConfig.fixedPanel.right.width} onChange={(width) => onLateralFixedPanelChange('right', { width })} min={100} max={maxLatPanelTotal - latLeftW} helperText={`100 - ${Math.max(100, maxLatPanelTotal - latLeftW)} mm`} />
                    <DimensionInput label={t('calc.fixedPanelHeight', 'Înălțime panou (de la sus)')} value={lateralConfig.fixedPanel.right.height ?? (dimensions.lateralHeightB !== undefined ? dimensions.lateralHeightB : dimensions.height)} onChange={(height) => onLateralFixedPanelChange('right', { height })} min={300} max={dimensions.lateralHeightB ?? dimensions.height} helperText={`300 - ${dimensions.lateralHeightB ?? dimensions.height} mm`} />
                  </div>
                )}
              </Card>

              {/* ═══ LATERAL CONFIG — trapezoid toggle ═══ */}
              <Card className="p-4 border-dashed">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-sm font-medium">{t('calc.trapezoidLateral')}</Label>
                    <p className="text-xs text-muted-foreground">{t('calc.trapezoidLateralShort')}</p>
                  </div>
                  <Switch
                    checked={dimensions.lateralHeightA !== undefined && dimensions.lateralHeightA !== dimensions.lateralHeightB}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange({ lateralHeightA: dimensions.height, lateralHeightB: Math.round(dimensions.height * 0.8) });
                      } else {
                        onChange({ lateralHeightA: undefined, lateralHeightB: undefined });
                      }
                    }}
                  />
                </div>
                {dimensions.lateralHeightA !== undefined && (
                  <div className="pt-3 border-t grid grid-cols-2 gap-3">
                    <DimensionInput
                      label={t('calc.heightAWall')}
                      value={dimensions.lateralHeightA}
                      onChange={(v) => onChange({ lateralHeightA: v })}
                      min={500}
                      max={2500}
                      helperText="500 - 2500 mm"
                    />
                    <DimensionInput
                      label={t('calc.heightBCorner')}
                      value={dimensions.lateralHeightB ?? dimensions.height}
                      onChange={(v) => onChange({ lateralHeightB: v })}
                      min={500}
                      max={2500}
                      helperText="500 - 2500 mm"
                    />
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}

      {/* Dimension preview */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-3">{t('calc.estimatedGlassArea')}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {(() => {
            const fHA = dimensions.frontalHeightA;
            const fHB = dimensions.frontalHeightB;
            const area = (fHA !== undefined && fHB !== undefined && fHA !== fHB)
              ? ((fHA + fHB) / 2 * dimensions.doorWidth) / 1000000
              : (dimensions.doorWidth * dimensions.height) / 1000000;
            return (
              <div>
                <span className="text-muted-foreground">{t('calc.door')} ({openingSide === 'front' ? t('calc.frontal').toLowerCase() : t('calc.lateral').toLowerCase()}){fHA !== undefined && fHA !== fHB ? ' (trapez)' : ''}:</span>
                <span className="ml-2 font-medium">{area.toFixed(2)} m²</span>
              </div>
            );
          })()}
          {fixedPanel.left.enabled && (
            <div>
              <span className="text-muted-foreground">{t('calc.fixedPanelLeftShort')} (front):</span>
              <span className="ml-2 font-medium">{((fixedPanel.left.width * (fixedPanel.left.height ?? dimensions.height)) / 1000000).toFixed(2)} m²</span>
            </div>
          )}
          {fixedPanel.right.enabled && (
            <div>
              <span className="text-muted-foreground">{t('calc.fixedPanelRightShort')} (front):</span>
              <span className="ml-2 font-medium">{((fixedPanel.right.width * (fixedPanel.right.height ?? dimensions.height)) / 1000000).toFixed(2)} m²</span>
            </div>
          )}
          {isCorner90 && !lateralConfig.enabled && (() => {
            const wallW = openingSide === 'front' ? dimensions.depth : dimensions.width;
            const latA = dimensions.lateralHeightA;
            const latB = dimensions.lateralHeightB;
            const area = (latA !== undefined && latB !== undefined && latA !== latB)
              ? ((latA + latB) / 2 * wallW) / 1000000
              : (wallW * dimensions.height) / 1000000;
            return (
              <div>
                <span className="text-muted-foreground">{t('calc.sidePanel')}{latA !== undefined && latA !== latB ? ' (trapez)' : ''}:</span>
                <span className="ml-2 font-medium">{area.toFixed(2)} m²</span>
              </div>
            );
          })()}
          {isCorner90 && lateralConfig.enabled && (
            <>
              <div>
                <span className="text-muted-foreground">{t('calc.door')} ({t('calc.lateral').toLowerCase()}):</span>
                <span className="ml-2 font-medium">{((dimensions.lateralDoorWidth * dimensions.height) / 1000000).toFixed(2)} m²</span>
              </div>
              {lateralConfig.fixedPanel.left.enabled && (
                <div>
                  <span className="text-muted-foreground">{t('calc.fixedPanelLeftShort')} (lat.):</span>
                  <span className="ml-2 font-medium">{((lateralConfig.fixedPanel.left.width * (lateralConfig.fixedPanel.left.height ?? dimensions.height)) / 1000000).toFixed(2)} m²</span>
                </div>
              )}
              {lateralConfig.fixedPanel.right.enabled && (
                <div>
                  <span className="text-muted-foreground">{t('calc.fixedPanelRightShort')} (lat.):</span>
                  <span className="ml-2 font-medium">{((lateralConfig.fixedPanel.right.width * (lateralConfig.fixedPanel.right.height ?? dimensions.height)) / 1000000).toFixed(2)} m²</span>
                </div>
              )}
            </>
          )}
          {needsDepth && !isCorner90 && (
            <div>
              <span className="text-muted-foreground">{t('calc.sidePanel')}:</span>
              <span className="ml-2 font-medium">{((dimensions.depth * dimensions.height) / 1000000).toFixed(2)} m²</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}