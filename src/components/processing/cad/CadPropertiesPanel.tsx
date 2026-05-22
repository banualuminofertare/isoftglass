import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import type { CadShape } from './cadTypes';

interface Props {
  shape: CadShape | null;
  onUpdate: (id: string, updates: Partial<CadShape>) => void;
  glassWidth: number;
  glassHeight: number;
}

export function CadPropertiesPanel({ shape, onUpdate, glassWidth, glassHeight }: Props) {
  const { t } = useTranslation();

  if (!shape) {
    return (
      <div className="p-2 space-y-1.5">
        <p className="text-[11px] text-muted-foreground text-center py-2">{t('processing.cadPanels.selectShape')}</p>
        <div className="text-[10px] text-muted-foreground/50 space-y-0.5 border-t pt-2">
          <p className="font-medium text-muted-foreground/70 mb-1">{t('processing.cadPanels.shortcuts')}</p>
          <p>V=Select M=Move D=Measure</p>
          <p>R=Rect C=Circle S=Stadium</p>
          <p>L=L-shape O=Slot I=Line</p>
          <p>E=Eraser B=Subtract T=Trim</p>
          <p>H=Stretch A=Copy area</p>
          <p>F=Fit Tab=Panel Esc=Desel.</p>
          <p>Del=Delete Ctrl+D=Duplicate</p>
          <p>Ctrl+Z=Undo Ctrl+R=Rot.</p>
          <p>Scroll=Zoom</p>
        </div>
      </div>
    );
  }

  const handleNum = (field: keyof CadShape, val: string) => {
    const n = Number(val);
    if (!isNaN(n)) onUpdate(shape.id, { [field]: n });
  };

  const typeLabels: Record<string, string> = {
    circle: t('processing.cadShapes.hole'),
    stadium: t('processing.cadShapes.stadiumCutout'),
    rect: t('processing.cadShapes.rectCutout'),
    lshape: t('processing.cadShapes.lShape'),
    slot: t('processing.cadShapes.slotShape'),
    line: t('processing.cadShapes.lineShape'),
  };

  const getBounds = () => {
    if (shape.type === 'circle') return { l: shape.x - shape.radius, t: shape.y - shape.radius, r: shape.x + shape.radius, b: shape.y + shape.radius };
    if (shape.type === 'slot') { const sl = (shape.slotLength ?? 20) / 2; return { l: shape.x - sl, t: shape.y - shape.radius, r: shape.x + sl, b: shape.y + shape.radius }; }
    if (shape.type === 'line') return { l: Math.min(shape.x, shape.x2 ?? shape.x), t: Math.min(shape.y, shape.y2 ?? shape.y), r: Math.max(shape.x, shape.x2 ?? shape.x), b: Math.max(shape.y, shape.y2 ?? shape.y) };
    return { l: shape.x - shape.width / 2, t: shape.y - shape.height / 2, r: shape.x + shape.width / 2, b: shape.y + shape.height / 2 };
  };
  const bounds = getBounds();

  return (
    <div className="p-2 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
        {typeLabels[shape.type] || shape.type}
      </p>

      {/* Position */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.position')}</p>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <Label className="text-[10px]">X</Label>
            <Input type="number" value={shape.x} onChange={e => handleNum('x', e.target.value)} className="h-6 text-[11px] px-1.5" />
          </div>
          <div>
            <Label className="text-[10px]">Y</Label>
            <Input type="number" value={shape.y} onChange={e => handleNum('y', e.target.value)} className="h-6 text-[11px] px-1.5" />
          </div>
        </div>
      </div>

      {/* Line endpoint */}
      {shape.type === 'line' && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.endPoint')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <Label className="text-[10px]">X2</Label>
              <Input type="number" value={shape.x2 ?? 0} onChange={e => handleNum('x2' as keyof CadShape, e.target.value)} className="h-6 text-[11px] px-1.5" />
            </div>
            <div>
              <Label className="text-[10px]">Y2</Label>
              <Input type="number" value={shape.y2 ?? 0} onChange={e => handleNum('y2' as keyof CadShape, e.target.value)} className="h-6 text-[11px] px-1.5" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">{t('processing.cadPanels.lengthLabel')} <span className="font-medium text-foreground">{Math.round(Math.sqrt(Math.pow((shape.x2 ?? shape.x) - shape.x, 2) + Math.pow((shape.y2 ?? shape.y) - shape.y, 2)))} mm</span></p>
        </div>
      )}

      {/* Size */}
      {shape.type !== 'line' && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.dimensions')}</p>
          {shape.type === 'circle' ? (
            <div>
              <Label className="text-[10px]">{t('processing.cadPanels.diameter')}</Label>
              <Input type="number" value={shape.radius * 2} onChange={e => handleNum('radius', String(Number(e.target.value) / 2))} className="h-6 text-[11px] px-1.5" />
            </div>
          ) : shape.type === 'slot' ? (
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label className="text-[10px]">{t('processing.cadPanels.lengthLabel').replace(':', '')}</Label>
                <Input type="number" value={shape.slotLength ?? 20} onChange={e => onUpdate(shape.id, { slotLength: Math.max(1, Number(e.target.value)) })} className="h-6 text-[11px] px-1.5" />
              </div>
              <div>
                <Label className="text-[10px]">{t('processing.cadPanels.diameter')}</Label>
                <Input type="number" value={shape.radius * 2} onChange={e => handleNum('radius', String(Number(e.target.value) / 2))} className="h-6 text-[11px] px-1.5" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label className="text-[10px]">L</Label>
                <Input type="number" value={shape.width} onChange={e => handleNum('width', e.target.value)} className="h-6 text-[11px] px-1.5" />
              </div>
              <div>
                <Label className="text-[10px]">H</Label>
                <Input type="number" value={shape.height} onChange={e => handleNum('height', e.target.value)} className="h-6 text-[11px] px-1.5" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* L-shape specifics */}
      {shape.type === 'lshape' && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.lCutout')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <Label className="text-[10px]">Dec. L</Label>
              <Input type="number" value={shape.lCutWidth ?? 0} onChange={e => onUpdate(shape.id, { lCutWidth: Number(e.target.value) })} className="h-6 text-[11px] px-1.5" />
            </div>
            <div>
              <Label className="text-[10px]">Dec. H</Label>
              <Input type="number" value={shape.lCutHeight ?? 0} onChange={e => onUpdate(shape.id, { lCutHeight: Number(e.target.value) })} className="h-6 text-[11px] px-1.5" />
            </div>
          </div>
          <div>
            <Label className="text-[10px]">{t('processing.cadPanels.cutCorner')}</Label>
            <Select value={shape.lCorner ?? 'tr'} onValueChange={v => onUpdate(shape.id, { lCorner: v as 'tl' | 'tr' | 'bl' | 'br' })}>
              <SelectTrigger className="h-6 text-[11px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tl">{t('processing.cadPanels.cornerTL')}</SelectItem>
                <SelectItem value="tr">{t('processing.cadPanels.cornerTR')}</SelectItem>
                <SelectItem value="bl">{t('processing.cadPanels.cornerBL')}</SelectItem>
                <SelectItem value="br">{t('processing.cadPanels.cornerBR')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Open Edges for rect */}
      {shape.type === 'rect' && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.openEdges')}</p>
          <div className="grid grid-cols-2 gap-1">
            {([['top', t('processing.cadPanels.top')], ['right', t('processing.cadPanels.right')], ['bottom', t('processing.cadPanels.bottom')], ['left', t('processing.cadPanels.left')]] as const).map(([edge, label]) => (
              <label key={edge} className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={shape.openEdges?.[edge] ?? false}
                  onChange={e => {
                    const prev = shape.openEdges ?? {};
                    onUpdate(shape.id, { openEdges: { ...prev, [edge]: e.target.checked } });
                  }}
                  className="h-3 w-3 rounded border-primary accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Fillet & Chamfer for rect */}
      {(shape.type === 'rect') && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.filletChamfer')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <Label className="text-[10px]">{t('processing.cadPanels.fillet')}</Label>
              <Input type="number" value={shape.cornerRadius ?? 0} onChange={e => {
                const v = Math.max(0, Math.min(Number(e.target.value), Math.min(shape.width, shape.height) / 2));
                onUpdate(shape.id, { cornerRadius: v, chamferSize: 0 });
              }} className="h-6 text-[11px] px-1.5" min={0} step={1} />
            </div>
            <div>
              <Label className="text-[10px]">{t('processing.cadPanels.chamfer')}</Label>
              <Input type="number" value={shape.chamferSize ?? 0} onChange={e => {
                const v = Math.max(0, Math.min(Number(e.target.value), Math.min(shape.width, shape.height) / 2));
                onUpdate(shape.id, { chamferSize: v, cornerRadius: 0 });
              }} className="h-6 text-[11px] px-1.5" min={0} step={1} />
            </div>
          </div>
        </div>
      )}

      {/* Rotation */}
      {shape.type !== 'line' && shape.type !== 'circle' && (
        <div>
          <Label className="text-[10px]">{t('processing.cadPanels.rotation')}</Label>
          <Input type="number" value={shape.rotation} onChange={e => handleNum('rotation', e.target.value)} className="h-6 text-[11px] px-1.5" step={15} />
        </div>
      )}

      {/* Edge distances */}
      {shape.type !== 'line' && (
        <div className="space-y-0.5 border-t pt-1.5">
          <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.edgeDistances')}</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0 text-[10px]">
            <span className="text-muted-foreground">← {t('processing.cadPanels.left')}:</span>
            <span className="font-medium">{Math.round(bounds.l)} mm</span>
            <span className="text-muted-foreground">→ {t('processing.cadPanels.right')}:</span>
            <span className="font-medium">{Math.round(glassWidth - bounds.r)} mm</span>
            <span className="text-muted-foreground">↑ {t('processing.cadPanels.top')}:</span>
            <span className="font-medium">{Math.round(bounds.t)} mm</span>
            <span className="text-muted-foreground">↓ {t('processing.cadPanels.bottom')}:</span>
            <span className="font-medium">{Math.round(glassHeight - bounds.b)} mm</span>
          </div>
        </div>
      )}

      {/* Target Panel selector */}
      <div className="space-y-1">
        <Label className="text-[10px]">{t('processing.cadPanels.targetPanel')}</Label>
        <Select value={shape.targetPanel ?? 'door'} onValueChange={v => onUpdate(shape.id, { targetPanel: v as 'door' | 'fixed_left' | 'fixed_right' })}>
          <SelectTrigger className="h-6 text-[11px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="door">{t('processing.cadPanels.doorDefault')}</SelectItem>
            <SelectItem value="fixed_left">{t('processing.cadPanels.fixedLeft')}</SelectItem>
            <SelectItem value="fixed_right">{t('processing.cadPanels.fixedRight')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[10px]">{t('processing.cadPanels.labelField')}</Label>
        <Input value={shape.label ?? ''} onChange={e => onUpdate(shape.id, { label: e.target.value })} className="h-6 text-[11px] px-1.5" placeholder={t('processing.cadPanels.optional')} />
      </div>

      {/* Cuts list */}
      {shape.cuts && shape.cuts.length > 0 && (
        <div className="space-y-1 border-t pt-1.5">
          <p className="text-[10px] text-muted-foreground font-medium">{t('processing.cadPanels.cutoutsN')} ({shape.cuts.length})</p>
          <ul className="space-y-0.5">
            {shape.cuts.map((cut, i) => (
              <li key={cut.id} className="flex items-center justify-between text-[10px] px-1 py-0.5 rounded bg-muted/30">
                <span className="text-muted-foreground">
                  {i + 1}. {cut.cutType === 'circle' ? `⌀${Math.round(cut.radius * 2)}` : `${Math.round(cut.width)}×${Math.round(cut.height)}`} la ({Math.round(cut.x)},{Math.round(cut.y)})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => {
                    const newCuts = shape.cuts!.filter(c => c.id !== cut.id);
                    onUpdate(shape.id, { cuts: newCuts });
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
