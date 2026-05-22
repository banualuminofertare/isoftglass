import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DimensionInput } from '@/components/calculators/shared/DimensionInput';
import { FinishSelector } from '@/components/calculators/shared/FinishSelector';
import { AccessoryPresetManager } from '@/components/calculators/shared/AccessoryPresetManager';
import { CatalogProductSelector } from '@/components/calculators/shared/CatalogProductSelector';
import { ExtraAccessoriesSection } from '@/components/calculators/shared/ExtraAccessoriesSection';
import type { SelectedKit } from '@/components/calculators/shared/KitSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { DoorOpen, DoorClosed, SlidersHorizontal, ChevronDown, Info, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HANDLE_CODES, HINGE_CODES } from '@/lib/calculators/materialMapping';
import { calculateDefaultHingePositions } from '@/lib/calculators/accessoryPositions';
import { useState } from 'react';

/* ── Color presets for accessory code badges ── */
const ACC_COLORS: Record<string, string> = {
  PT10: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PT20: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  PT40: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  BTS:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  US10: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  GK30: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  BLOC: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  TOC:  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  PT62: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  PT70: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  PT41: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  PT24: 'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  PT25: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  PT21: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  RST85: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  PT30: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  '01.106': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

/* ── Descriptions for each accessory code ── */
const ACC_DESCRIPTIONS: Record<string, string> = {
  PT10: 'Pivot jos pentru montaj pe pardoseală. Susține greutatea ușii și permite rotația.',
  PT20: 'Pivot sus — fixare în tavan sau traversă superioară.',
  PT40: 'Pivot sus automat cu frânare — închidere controlată a ușii.',
  BTS:  'Amortizor de pardoseală integrat — înlocuiește pivotul inferior cu mecanism hidraulic.',
  US10: 'Opritor de pardoseală — limitează unghiul de deschidere al ușii.',
  GK30: 'Clemă de fixare pe panoul fix de deasupra ușii — prindere sticlă fără găurire.',
  BLOC: 'Blocatoare — fixează ușa în poziție deschisă sau închisă.',
  TOC:  'Toc din aluminiu — cadru perimetral pentru etanșare și finisaj.',
  PT62: 'Pivot jos cu ridicare — compensează greutatea ușii la deschidere.',
  PT70: 'Pivot jos cu blocare — menține ușa deschisă la unghi fix.',
  PT41: 'Pivot sus cu amortizare — frânare controlată la închidere.',
  PT24: 'Placă de acoperire pivot jos — capac estetic pentru mecanismul PT.',
  PT25: 'Placă de acoperire pivot sus — capac estetic pentru mecanismul PT.',
  PT21: 'Pivot sus standard — fixare superioară fără amortizare.',
  RST85: 'Șină de ghidare pardoseală 85mm — ghidaj inferior pentru ușă.',
  PT30: 'Pivot intermediar — prindere laterală pe toc sau perete.',
  '01.106': 'Profil etanșare 106 — garnitură perimetrală pentru izolare.',
};

/* ── Background colors for expanded descriptions ── */
const ACC_DESC_BG: Record<string, string> = {
  PT10: 'bg-blue-50 dark:bg-blue-950/30',
  PT20: 'bg-indigo-50 dark:bg-indigo-950/30',
  PT40: 'bg-violet-50 dark:bg-violet-950/30',
  BTS:  'bg-amber-50 dark:bg-amber-950/30',
  US10: 'bg-orange-50 dark:bg-orange-950/30',
  GK30: 'bg-emerald-50 dark:bg-emerald-950/30',
  BLOC: 'bg-rose-50 dark:bg-rose-950/30',
  TOC:  'bg-cyan-50 dark:bg-cyan-950/30',
  PT62: 'bg-teal-50 dark:bg-teal-950/30',
  PT70: 'bg-sky-50 dark:bg-sky-950/30',
  PT41: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
  PT24: 'bg-lime-50 dark:bg-lime-950/30',
  PT25: 'bg-yellow-50 dark:bg-yellow-950/30',
  PT21: 'bg-pink-50 dark:bg-pink-950/30',
  RST85: 'bg-slate-50 dark:bg-slate-950/30',
  PT30: 'bg-red-50 dark:bg-red-950/30',
  '01.106': 'bg-purple-50 dark:bg-purple-950/30',
};

/* ── Compact row for a single accessory toggle ── */
function AccessoryRow({
  label,
  code,
  quantity,
  onQuantityChange,
  onToggle,
  showToggle = true,
  conditional = false,
  description,
}: {
  label: string;
  code?: string;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onToggle?: (on: boolean) => void;
  showToggle?: boolean;
  conditional?: boolean;
  description?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = quantity > 0;
  const badgeColor = code ? ACC_COLORS[code] ?? 'bg-muted text-muted-foreground' : '';
  const descText = description ?? (code ? ACC_DESCRIPTIONS[code] : undefined);
  const descBg = code ? ACC_DESC_BG[code] ?? 'bg-muted/40' : 'bg-muted/40';

  return (
    <div className={cn("rounded-md overflow-hidden", descBg)}>
      <div className={cn(
        "flex items-center justify-between h-10 px-3 transition-colors",
      )}>
        <button
          type="button"
          className="flex items-center gap-2 text-sm cursor-pointer select-none"
          onClick={() => descText && setExpanded(prev => !prev)}
        >
          {conditional && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
          {code && (
            <span className="text-[11px] font-bold tracking-wide leading-none">
              {code}
            </span>
          )}
          <span className="text-xs opacity-75">{label}</span>
          {descText && (
            <Info className={cn("h-3.5 w-3.5 opacity-40 transition-colors", expanded && "text-primary opacity-100")} />
          )}
        </button>
        <div className="flex items-center gap-2">
          {isActive && (
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => onQuantityChange(Math.max(0, quantity - 1))}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium tabular-nums">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => onQuantityChange(quantity + 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
          {showToggle && onToggle && (
            <Switch checked={isActive} onCheckedChange={onToggle} className="scale-90" />
          )}
        </div>
      </div>
      {expanded && descText && (
        <div className={cn("px-4 py-2 text-xs text-muted-foreground leading-relaxed", descBg)}>
          {descText}
        </div>
      )}
    </div>
  );
}

/* ── Collapsible section wrapper ── */
function AccSection({ title, defaultOpen = true, colorClass, children }: { title: string; defaultOpen?: boolean; colorClass?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn("border rounded-lg", colorClass)}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold hover:bg-muted/40 transition-colors">
        {title}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-1 pb-2 space-y-0.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

import type { 
  GridCell, 
  PartitionDoorConfig, 
  PartitionDoorType,
  
  HingeSide,
  DoorOpenDirection,
  FinishType,
} from '@/types/calculators';

interface DoorConfigStepProps {
  cells: GridCell[];
  doors: PartitionDoorConfig[];
  onAddDoor: (cellId: string) => void;
  onUpdateDoor: (cellId: string, updates: Partial<PartitionDoorConfig>) => void;
  onRemoveDoor: (cellId: string) => void;
  selectedKit: SelectedKit | null;
  onSelectKit: (kit: SelectedKit) => void;
  onRemoveKit: () => void;
}

const doorTypeOptions: { type: PartitionDoorType; label: string; icon: typeof DoorOpen }[] = [
  { type: 'hinged', label: 'hingedDoor', icon: DoorOpen },
  { type: 'pivot', label: 'pivotDoor', icon: DoorClosed },
  { type: 'sliding', label: 'slidingDoorType', icon: SlidersHorizontal },
];

export function DoorConfigStep({
  cells,
  doors,
  onAddDoor,
  onUpdateDoor,
  onRemoveDoor,
  selectedKit,
  onSelectKit,
  onRemoveKit,
}: DoorConfigStepProps) {
  const { t } = useTranslation();
  // Get cells that can have doors (door or door_opening type)
  const doorCells = cells.filter(c => c.type === 'door' || c.type === 'door_opening');
  
  // Get cells that already have door configs
  const getDoorConfig = (cellId: string) => doors.find(d => d.cellId === cellId);

  if (doorCells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <DoorClosed className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">{t('calc.noDoorCells')}</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {t('calc.noDoorCellsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('calc.configDoors')}
      </p>

      {doorCells.map((cell) => {
        const doorConfig = getDoorConfig(cell.id);
        const hasDoor = cell.type === 'door' && doorConfig;

        return (
          <Card key={cell.id} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">
                  {t('calc.cell')} [{cell.row + 1}, {cell.col + 1}]
                </h4>
                <p className="text-sm text-muted-foreground">
                  {cell.width} × {cell.height} mm
                </p>
              </div>
              <div className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                cell.type === 'door' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {cell.type === 'door' ? t('calc.withDoor') : t('calc.doorOpeningLabel')}
              </div>
            </div>

            {cell.type === 'door' && doorConfig && (
              <div className="space-y-4 pt-2 border-t">
                {/* Door Type */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('calc.doorTypeLabel')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {doorTypeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = doorConfig.doorType === opt.type;
                      return (
                        <button
                          key={opt.type}
                          className={cn(
                            "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                            isSelected 
                              ? "border-primary bg-primary/5" 
                              : "border-muted hover:border-primary/30"
                          )}
                          onClick={() => onUpdateDoor(cell.id, { doorType: opt.type })}
                        >
                          <Icon className={cn("h-5 w-5", isSelected && "text-primary")} />
                          <span className="text-xs font-medium">{t(`calc.${opt.label}`)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>



                {/* Door dimensions */}
                <div className="grid grid-cols-2 gap-3">
                  <DimensionInput
                    label={t("calc.doorWidth")}
                    value={doorConfig.doorWidth}
                    onChange={(doorWidth) => onUpdateDoor(cell.id, { doorWidth })}
                    min={600}
                    max={cell.width - 100}
                  />
                  <DimensionInput
                    label={t("calc.doorHeight")}
                    value={doorConfig.doorHeight}
                    onChange={(doorHeight) => onUpdateDoor(cell.id, { doorHeight })}
                    min={1800}
                    max={cell.height}
                  />
                </div>

                {/* ═══ BALAMALE (Hinges) ═══ */}
                {(doorConfig.doorType === 'hinged' || doorConfig.doorType === 'pivot') && (
                  <AccSection title={t("calc.hingesLabel")} colorClass="bg-blue-50/60 border-blue-200">
                    <div className="px-3 space-y-3 pt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm">{t("calc.quantityLabel")}</Label>
                            <div className="flex gap-1">
                              {[2, 3].map(q => (
                                <Button
                                  key={q}
                                  type="button"
                                  variant={doorConfig.accessories.hinges.quantity === q ? 'default' : 'outline'}
                                  size="sm"
                                  className="flex-1 h-9"
                                  onClick={() => {
                                    const newPositions = calculateDefaultHingePositions(doorConfig.doorHeight, q);
                                    onUpdateDoor(cell.id, {
                                      accessories: {
                                        ...doorConfig.accessories,
                                        hinges: { ...doorConfig.accessories.hinges, quantity: q, positions: newPositions }
                                      }
                                    });
                                  }}
                                >
                                  {q} {t('calc.pcs')}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">{t("calc.hingeSide")}</Label>
                            <Select
                              value={doorConfig.hingeSide}
                              onValueChange={(val: HingeSide) => onUpdateDoor(cell.id, { hingeSide: val })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">{t("calc.left")}</SelectItem>
                                <SelectItem value="right">{t("calc.right")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">{t("calc.opening")}</Label>
                          <Select
                            value={doorConfig.openDirection}
                            onValueChange={(val: DoorOpenDirection) => onUpdateDoor(cell.id, { openDirection: val })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inward">{t("calc.inward")}</SelectItem>
                              <SelectItem value="outward">{t("calc.outward")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Hinge positions */}
                      {doorConfig.accessories.hinges.positions && doorConfig.accessories.hinges.positions.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{t("calc.hingePositionsLabel")}</Label>
                          {doorConfig.accessories.hinges.positions.map((pos, idx) => (
                            <DimensionInput
                              key={idx}
                              label={`Balama ${idx + 1}${idx === 0 ? ' (sus)' : idx === (doorConfig.accessories.hinges.positions?.length ?? 0) - 1 ? ' (jos)' : ' (mijloc)'}`}
                              value={pos}
                              onChange={(val) => {
                                const newPositions = [...(doorConfig.accessories.hinges.positions || [])];
                                newPositions[idx] = val;
                                onUpdateDoor(cell.id, {
                                  accessories: {
                                    ...doorConfig.accessories,
                                    hinges: { ...doorConfig.accessories.hinges, positions: newPositions }
                                  }
                                });
                              }}
                              min={100}
                              max={doorConfig.doorHeight - 100}
                              step={10}
                            />
                          ))}
                        </div>
                      )}
                      {/* Catalog selection */}
                      <AccessoryPresetManager
                        productType="panel"
                        category="hinge"
                        selectedCode={doorConfig.accessories.hinges?.materialCode}
                        onSelect={(code) => {
                          onUpdateDoor(cell.id, {
                            accessories: {
                              ...doorConfig.accessories,
                              hinges: { ...doorConfig.accessories.hinges, materialCode: code }
                            }
                          });
                        }}
                      />
                      <CatalogProductSelector
                        category="hinge"
                        productType="panel"
                        value={doorConfig.accessories.hinges?.materialCode}
                        onValueChange={(code) => {
                          onUpdateDoor(cell.id, {
                            accessories: {
                              ...doorConfig.accessories,
                              hinges: { ...doorConfig.accessories.hinges, materialCode: code || undefined }
                            }
                          });
                        }}
                        label={t("calc.selectProductLabel")}
                        placeholder={t("calc.selectAccessory")}
                      />
                      <FinishSelector
                        label={t("calc.colorLabel")}
                        materialCode={HINGE_CODES.wall_glass_90}
                        value={doorConfig.accessories.hinges.finish}
                        onValueChange={(finish) =>
                          onUpdateDoor(cell.id, {
                            accessories: {
                              ...doorConfig.accessories,
                              hinges: { ...doorConfig.accessories.hinges, finish: finish as FinishType }
                            }
                          })
                        }
                      />
                    </div>
                  </AccSection>
                )}

                {/* ═══ FERONERIE ȚĂ COMPACTĂ ═══ */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('calc.doorHardware')}</Label>

                  {/* ── Grup 1: Pivoți & Amortizoare ── */}
                  {(() => {
                    const hasAbove = cells.some(c => c.col === cell.col && c.row === cell.row + 1 && c.type === 'panel');

                    // All accessories in this group with their get/set logic
                    const allAccessories = [
                      {
                        code: 'PT10', label: '(jos)', available: true,
                        qty: doorConfig.accessories.ptBottom?.quantity ?? 0,
                        setQty: (q: number) => onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, ptBottom: { size: 10, quantity: q } } }),
                      },
                      {
                        code: 'PT20', label: '(sus)', available: true,
                        qty: doorConfig.accessories.ptTop?.quantity ?? 0,
                        setQty: (q: number) => onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, ptTop: { size: 20, quantity: q } } }),
                      },
                      {
                        code: 'PT40', label: '(sus automat)', available: hasAbove, conditional: true,
                        qty: doorConfig.accessories.pt40?.quantity ?? 0,
                        setQty: (q: number) => onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, pt40: { size: 40, quantity: q } } }),
                      },
                      {
                        code: 'BTS', label: '(amortizor pardoseală)', available: true,
                        qty: doorConfig.accessories.bts?.quantity ?? 0,
                        setQty: (q: number) => onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, bts: { size: 40, quantity: q } } }),
                      },
                      {
                        code: 'US10', label: '(opritor pardoseală)', available: true,
                        qty: doorConfig.accessories.us?.quantity ?? 0,
                        setQty: (q: number) => onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, us: { size: 10, quantity: q } } }),
                      },
                      {
                        code: 'GK30', label: '(clemă fixare)', available: true,
                        qty: doorConfig.accessories.gk30?.quantity ?? 0,
                        setQty: (q: number) => onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, gk30: { size: 30, quantity: q } } }),
                      },
                      ...((doorConfig.doorType === 'hinged' || doorConfig.doorType === 'pivot') ? [{
                        code: 'BLOC', label: 'Blocatori', available: true,
                        qty: doorConfig.accessories.blockers?.quantity ?? 0,
                        setQty: (q: number) => onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, blockers: { quantity: q } } }),
                      }] : []),
                      // 9 new codes stored in extraAccessories
                      ...([
                        { code: 'PT62', label: 'Pivot jos cu ridicare' },
                        { code: 'PT70', label: 'Pivot jos cu blocare' },
                        { code: 'PT41', label: 'Pivot sus cu amortizare' },
                        { code: 'PT24', label: 'Placă acoperire jos' },
                        { code: 'PT25', label: 'Placă acoperire sus' },
                        { code: 'PT21', label: 'Pivot sus standard' },
                        { code: 'RST85', label: 'Șină ghidare pardoseală' },
                        { code: 'PT30', label: 'Pivot intermediar' },
                        { code: '01.106', label: 'Profil etanșare 106' },
                      ].map(({ code, label: accLabel }) => {
                        const extras = doorConfig.accessories.extraAccessories ?? [];
                        return {
                          code, label: accLabel, available: true,
                          qty: extras.find(e => e.materialCode === code)?.quantity ?? 0,
                          setQty: (q: number) => {
                            const filtered = extras.filter(e => e.materialCode !== code);
                            const next = q > 0 ? [...filtered, { materialCode: code, name: accLabel, quantity: q }] : filtered;
                            onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, extraAccessories: next } });
                          },
                        };
                      })),
                    ];

                    const active = allAccessories.filter(a => a.qty > 0);
                    const inactive = allAccessories.filter(a => a.qty === 0 && a.available);

                    return (
                      <AccSection title={t('calc.pivotsAmortizers')} colorClass="bg-amber-50/60 border-amber-200">
                        {active.map(acc => (
                          <AccessoryRow
                            key={acc.code}
                            code={acc.code}
                            label={acc.label}
                            conditional={acc.conditional}
                            quantity={acc.qty}
                            onQuantityChange={acc.setQty}
                            onToggle={(on) => acc.setQty(on ? 1 : 0)}
                          />
                        ))}
                        {inactive.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1">
                                <Plus className="h-3.5 w-3.5" />
                                {t('calc.addAccessoryBtn', { count: inactive.length })}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-1 max-h-64 overflow-y-auto" align="start">
                              {inactive.map(acc => {
                                const badgeColor = ACC_COLORS[acc.code] ?? 'bg-muted text-muted-foreground';
                                return (
                                  <button
                                    key={acc.code}
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors rounded-md"
                                    onClick={() => acc.setQty(1)}
                                  >
                                    <span className={cn("text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded", badgeColor)}>
                                      {acc.code}
                                    </span>
                                    <span className="text-xs">{acc.label}</span>
                                    {acc.conditional && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto" />}
                                  </button>
                                );
                              })}
                            </PopoverContent>
                          </Popover>
                        )}
                        {active.length === 0 && inactive.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">{t('calc.noAccessoryAvail')}</p>
                        )}
                      </AccSection>
                    );
                  })()}

                  {/* ── Grup 2: Mâner ── */}
                  <AccSection title={t('calc.handleLabel')} colorClass="bg-green-50/60 border-green-200">
                    <div className="px-3 space-y-2 pt-1">
                      <AccessoryPresetManager
                        productType="panel"
                        category="handle"
                        selectedCode={doorConfig.accessories.handle?.materialCode}
                        onSelect={(code) => {
                          onUpdateDoor(cell.id, {
                            accessories: {
                              ...doorConfig.accessories,
                              handle: { ...doorConfig.accessories.handle, materialCode: code }
                            }
                          });
                        }}
                      />
                      <CatalogProductSelector
                        category="handle"
                        productType="panel"
                        value={doorConfig.accessories.handle?.materialCode}
                        onValueChange={(code) => {
                          onUpdateDoor(cell.id, {
                            accessories: {
                              ...doorConfig.accessories,
                              handle: { ...doorConfig.accessories.handle, materialCode: code || undefined }
                            }
                          });
                        }}
                        label={t("calc.selectProductLabel")}
                        placeholder={t("calc.selectHandleLabel")}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">{t('calc.handleShape')}</Label>
                          <Select
                            value={doorConfig.accessories.handle.model}
                            onValueChange={(model: 'bar' | 'round' | 'square') =>
                              onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, handle: { ...doorConfig.accessories.handle, model } } })
                            }
                          >
                            <SelectTrigger className="mt-1 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bar">{t('calc.handleBar')}</SelectItem>
                              <SelectItem value="round">{t('calc.handleRound')}</SelectItem>
                              <SelectItem value="square">{t('calc.handleSquare')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FinishSelector
                          label={t("calc.colorLabel")}
                          placeholder={t("calc.colorLabel")}
                          materialCode={HANDLE_CODES.shell}
                          value={doorConfig.accessories.handle.finish}
                          onValueChange={(finish) =>
                            onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, handle: { ...doorConfig.accessories.handle, finish: finish as FinishType } } })
                          }
                        />
                      </div>
                      <DimensionInput
                        label={t("calc.handlePositionY")}
                        value={doorConfig.accessories.handle.positionY ?? Math.round(doorConfig.doorHeight / 2)}
                        onChange={(val) =>
                          onUpdateDoor(cell.id, { accessories: { ...doorConfig.accessories, handle: { ...doorConfig.accessories.handle, positionY: val } } })
                        }
                        min={100}
                        max={doorConfig.doorHeight - 100}
                        step={10}
                      />
                    </div>
                  </AccSection>

                  {/* ── Grup 3: Broască ── */}
                  <AccSection title={t('calc.lock')} colorClass="bg-purple-50/60 border-purple-200">
                    <div className="px-3 space-y-2 pt-1">
                      <AccessoryPresetManager
                        productType="panel"
                        category="lock"
                        selectedCode={doorConfig.accessories.lock?.materialCode}
                        onSelect={(code) => {
                          onUpdateDoor(cell.id, {
                            accessories: {
                              ...doorConfig.accessories,
                              lock: { ...doorConfig.accessories.lock, enabled: true, materialCode: code }
                            }
                          });
                        }}
                      />
                      <CatalogProductSelector
                        category="lock"
                        productType="panel"
                        value={doorConfig.accessories.lock?.materialCode}
                        onValueChange={(code) => {
                          onUpdateDoor(cell.id, {
                            accessories: {
                              ...doorConfig.accessories,
                              lock: {
                                ...doorConfig.accessories.lock,
                                enabled: !!code,
                                materialCode: code || undefined,
                              }
                            }
                          });
                        }}
                        label={t("calc.selectProductLabel")}
                        placeholder={t("calc.selectLockLabel")}
                      />
                    </div>
                  </AccSection>

                  {/* ── Grup 3: Toc & Șină ── */}
                  {(doorConfig.doorType === 'hinged' || doorConfig.doorType === 'sliding') && (
                    <AccSection title={t('calc.frameToc')} colorClass="bg-orange-50/60 border-orange-200">
                      {doorConfig.doorType === 'hinged' && (
                        <AccessoryRow
                          code="TOC" label={t("calc.aluminumFrameLabel")}
                          quantity={doorConfig.hasFrame ? (doorConfig.frameQuantity ?? 1) : 0}
                          onQuantityChange={(q) => onUpdateDoor(cell.id, { hasFrame: q > 0, frameQuantity: Math.max(1, q) })}
                          onToggle={(on) => onUpdateDoor(cell.id, { hasFrame: on, frameQuantity: on ? (doorConfig.frameQuantity ?? 1) : 0 })}
                        />
                      )}
                      {doorConfig.doorType === 'sliding' && (
                        <div className="px-3 space-y-2 pt-1">
                          <DimensionInput
                            label={t("calc.slidingRailLength")}
                            value={doorConfig.slidingRailLength ?? cell.width}
                            onChange={(val) => onUpdateDoor(cell.id, { slidingRailLength: val })}
                            min={500}
                            max={6000}
                            step={10}
                          />
                        </div>
                      )}
                    </AccSection>
                  )}
                </div>

                {/* ═══ ACCESORII SUPLIMENTARE & KIT ═══ */}
                <ExtraAccessoriesSection
                  extraAccessories={doorConfig.accessories.extraAccessories ?? []}
                  productType="panel"
                  selectedKit={selectedKit}
                  onSelectKit={onSelectKit}
                  onRemoveKit={onRemoveKit}
                  onAdd={(item) => {
                    const extras = doorConfig.accessories.extraAccessories ?? [];
                    onUpdateDoor(cell.id, {
                      accessories: {
                        ...doorConfig.accessories,
                        extraAccessories: [...extras, { ...item, quantity: 1 }]
                      }
                    });
                  }}
                  onRemove={(index) => {
                    const extras = [...(doorConfig.accessories.extraAccessories ?? [])];
                    extras.splice(index, 1);
                    onUpdateDoor(cell.id, {
                      accessories: {
                        ...doorConfig.accessories,
                        extraAccessories: extras
                      }
                    });
                  }}
                  onUpdate={(index, updates) => {
                    const extras = [...(doorConfig.accessories.extraAccessories ?? [])];
                    extras[index] = { ...extras[index], ...updates };
                    onUpdateDoor(cell.id, {
                      accessories: {
                        ...doorConfig.accessories,
                        extraAccessories: extras
                      }
                    });
                  }}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
