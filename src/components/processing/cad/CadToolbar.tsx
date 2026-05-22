import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  MousePointer2, Square, Circle, Undo2, Redo2, Trash2, Move, Ruler,
  Copy, CopyPlus, FlipHorizontal2, FlipVertical2, RotateCw, Grid3X3,
  ZoomIn, ZoomOut, Maximize, RectangleHorizontal,
  AlignHorizontalJustifyCenter, AlignStartVertical, AlignEndVertical,
  AlignStartHorizontal, AlignEndHorizontal, X, PanelRightClose, PanelRightOpen,
  Crosshair, Eraser, Scissors, Slice, StretchHorizontal, BoxSelect,
  Merge, Combine
} from 'lucide-react';
import type { ToolType, PanelLayout } from './cadTypes';
import { GRID_OPTIONS } from './cadTypes';

interface Props {
  tool: ToolType;
  onToolChange: (t: ToolType) => void;
  gridSize: number;
  onGridChange: (g: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canRedo: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onMirrorX: () => void;
  onMirrorY: () => void;
  onRotate90: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onArray: () => void;
  hasSelection: boolean;
  hasShapes: boolean;
  snapEnabled: boolean;
  onSnapToggle: () => void;
  onCenterShape: () => void;
  onAlignLeft: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignBottom: () => void;
  onClearAll: () => void;
  glassWidth: number;
  glassHeight: number;
  onGlassWidthChange: (w: number) => void;
  onGlassHeightChange: (h: number) => void;
  showPanel: boolean;
  onTogglePanel: () => void;
  onDuplicateAll: () => void;
  onMirrorAllX: () => void;
  onMirrorAllY: () => void;
  panelLayout: PanelLayout;
  onPanelLayoutChange: (l: PanelLayout) => void;
  fixedLeftWidth: number;
  fixedRightWidth: number;
  onFixedLeftWidthChange: (w: number) => void;
  onFixedRightWidthChange: (w: number) => void;
}

interface ToolDef {
  value: ToolType;
  icon: React.ReactNode;
  labelKey: string;
  group: 'pointer' | 'draw';
}

const toolDefs: ToolDef[] = [
  { value: 'select', icon: <MousePointer2 className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.select', group: 'pointer' },
  { value: 'move', icon: <Move className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.move', group: 'pointer' },
  { value: 'stretch', icon: <StretchHorizontal className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.stretch', group: 'pointer' },
  { value: 'eraser', icon: <Eraser className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.eraser', group: 'pointer' },
  { value: 'subtract', icon: <Scissors className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.subtract', group: 'pointer' },
  { value: 'trim', icon: <Slice className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.trim', group: 'pointer' },
  { value: 'copyarea', icon: <BoxSelect className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.copyArea', group: 'pointer' },
  { value: 'join', icon: <Merge className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.join', group: 'pointer' },
  { value: 'weld', icon: <Combine className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.weld', group: 'pointer' },
  { value: 'measure', icon: <Ruler className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.measure', group: 'pointer' },
  { value: 'rect', icon: <Square className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.rect', group: 'draw' },
  { value: 'stadium', icon: <RectangleHorizontal className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.stadium', group: 'draw' },
  { value: 'circle', icon: <Circle className="h-3.5 w-3.5" />, labelKey: 'processing.cadTools.circle', group: 'draw' },
  { value: 'lshape', icon: <span className="h-3.5 w-3.5 flex items-end justify-start font-bold text-[10px] leading-none">L</span>, labelKey: 'processing.cadTools.lshape', group: 'draw' },
  { value: 'slot', icon: <span className="h-3.5 w-3.5 border-2 border-current rounded-full" />, labelKey: 'processing.cadTools.slot', group: 'draw' },
  { value: 'line', icon: <span className="h-3.5 w-3.5 flex items-center justify-center"><span className="block w-3.5 h-0 border-t-2 border-current rotate-45" /></span>, labelKey: 'processing.cadTools.line', group: 'draw' },
];

function ToolBtn({ active, onClick, title, disabled, children, className }: {
  active?: boolean; onClick: () => void; title: string; disabled?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant={active ? 'default' : 'ghost'} size="sm" onClick={onClick} disabled={disabled} className={`h-7 w-7 p-0 ${className ?? ''}`}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{title}</TooltipContent>
    </Tooltip>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-border mx-0.5" />;
}

export function CadToolbar({
  tool, onToolChange, gridSize, onGridChange, onUndo, onRedo, canRedo, onDelete,
  onDuplicate, onMirrorX, onMirrorY, onRotate90, onFitView,
  onZoomIn, onZoomOut, onArray, hasSelection, hasShapes, snapEnabled, onSnapToggle,
  onCenterShape, onAlignLeft, onAlignRight, onAlignTop, onAlignBottom,
  onClearAll, glassWidth, glassHeight, onGlassWidthChange, onGlassHeightChange,
  showPanel, onTogglePanel, onDuplicateAll, onMirrorAllX, onMirrorAllY,
  panelLayout, onPanelLayoutChange, fixedLeftWidth, fixedRightWidth, onFixedLeftWidthChange, onFixedRightWidthChange,
}: Props) {
  const { t } = useTranslation();
  const pointerTools = toolDefs.filter(td => td.group === 'pointer');
  const drawTools = toolDefs.filter(td => td.group === 'draw');

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b bg-muted/30 overflow-x-auto min-h-[36px]">
        {/* Pointer tools */}
        {pointerTools.map(td => (
          <ToolBtn key={td.value} active={tool === td.value} onClick={() => onToolChange(td.value)} title={t(td.labelKey)}>
            {td.icon}
          </ToolBtn>
        ))}

        <Sep />

        {/* Drawing tools */}
        {drawTools.map(td => (
          <ToolBtn key={td.value} active={tool === td.value} onClick={() => onToolChange(td.value)} title={t(td.labelKey)}>
            {td.icon}
          </ToolBtn>
        ))}

        <Sep />

        {/* Edit actions */}
        <ToolBtn onClick={onUndo} title={t("ui.tooltipUndo")}><Undo2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onRedo} disabled={!canRedo} title={t("ui.tooltipRedo")}><Redo2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onDelete} disabled={!hasSelection} title={t('processing.cadActions.delete')}><Trash2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onDuplicate} disabled={!hasSelection} title={t('processing.cadActions.duplicate')}><Copy className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onRotate90} disabled={!hasSelection} title={t('processing.cadActions.rotate90')}><RotateCw className="h-3.5 w-3.5" /></ToolBtn>

        <Sep />

        {/* Transform & Align */}
        <ToolBtn onClick={onMirrorX} disabled={!hasSelection} title={t('processing.cadActions.mirrorH')}><FlipHorizontal2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onMirrorY} disabled={!hasSelection} title={t('processing.cadActions.mirrorV')}><FlipVertical2 className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onCenterShape} disabled={!hasSelection} title={t('processing.cadActions.center')}><Crosshair className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onAlignLeft} disabled={!hasSelection} title={t('processing.cadActions.alignLeft')}><AlignStartVertical className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onAlignRight} disabled={!hasSelection} title={t('processing.cadActions.alignRight')}><AlignEndVertical className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onAlignTop} disabled={!hasSelection} title={t('processing.cadActions.alignTop')}><AlignStartHorizontal className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onAlignBottom} disabled={!hasSelection} title={t('processing.cadActions.alignBottom')}><AlignEndHorizontal className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onArray} disabled={!hasSelection} title={t('processing.cadActions.array')}><Grid3X3 className="h-3.5 w-3.5" /></ToolBtn>

        <Sep />

        {/* Panel-level operations */}
        <ToolBtn onClick={onDuplicateAll} disabled={!hasShapes} title={t('processing.cadActions.duplicateAll')}><CopyPlus className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onMirrorAllX} disabled={!hasShapes} title={t('processing.cadActions.mirrorAllH')}>
          <div className="relative"><FlipHorizontal2 className="h-3.5 w-3.5" /><span className="absolute -top-0.5 -right-0.5 text-[6px] font-bold leading-none">A</span></div>
        </ToolBtn>
        <ToolBtn onClick={onMirrorAllY} disabled={!hasShapes} title={t('processing.cadActions.mirrorAllV')}>
          <div className="relative"><FlipVertical2 className="h-3.5 w-3.5" /><span className="absolute -top-0.5 -right-0.5 text-[6px] font-bold leading-none">A</span></div>
        </ToolBtn>

        <Sep />
        <ToolBtn onClick={onZoomIn} title={t("ui.tooltipZoomIn")}><ZoomIn className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onZoomOut} title={t("ui.tooltipZoomOut")}><ZoomOut className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={onFitView} title={t('processing.cadActions.fitView')}><Maximize className="h-3.5 w-3.5" /></ToolBtn>

        <Sep />

        {/* Grid & snap */}
        <ToolBtn active={snapEnabled} onClick={onSnapToggle} title={`${t('processing.cadActions.snapGrid')}: ${snapEnabled ? 'ON' : 'OFF'}`}>
          <div className="h-3.5 w-3.5 grid grid-cols-2 gap-0.5">
            <div className="rounded-sm bg-current opacity-60" />
            <div className="rounded-sm bg-current opacity-30" />
            <div className="rounded-sm bg-current opacity-30" />
            <div className="rounded-sm bg-current opacity-60" />
          </div>
        </ToolBtn>
        <Select value={String(gridSize)} onValueChange={v => onGridChange(Number(v))}>
          <SelectTrigger className="h-6 w-[60px] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRID_OPTIONS.map(g => (
              <SelectItem key={g} value={String(g)}>{g}mm</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Sep />

        {/* Panel layout */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-muted-foreground font-medium">{t('processing.cadLayout.layout')}</span>
          <Select value={panelLayout} onValueChange={v => onPanelLayoutChange(v as PanelLayout)}>
            <SelectTrigger className="h-6 w-[110px] text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="door_only">{t('processing.cadLayout.doorOnly')}</SelectItem>
              <SelectItem value="door_left">{t('processing.cadLayout.doorLeft')}</SelectItem>
              <SelectItem value="door_right">{t('processing.cadLayout.doorRight')}</SelectItem>
              <SelectItem value="door_both">{t('processing.cadLayout.doorBoth')}</SelectItem>
            </SelectContent>
          </Select>
          {(panelLayout === 'door_left' || panelLayout === 'door_both') && (
            <Input type="number" value={fixedLeftWidth} onChange={e => onFixedLeftWidthChange(Number(e.target.value))} onBlur={e => { if (Number(e.target.value) < 50) onFixedLeftWidthChange(50); }} onFocus={e => e.target.select()} className="h-6 w-16 text-[11px] px-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" title={t('processing.cadLayout.leftPanelWidth')} />
          )}
          {(panelLayout === 'door_right' || panelLayout === 'door_both') && (
            <Input type="number" value={fixedRightWidth} onChange={e => onFixedRightWidthChange(Number(e.target.value))} onBlur={e => { if (Number(e.target.value) < 50) onFixedRightWidthChange(50); }} onFocus={e => e.target.select()} className="h-6 w-16 text-[11px] px-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" title={t('processing.cadLayout.rightPanelWidth')} />
          )}
        </div>

        <Sep />

        {/* Glass dimensions inline */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-muted-foreground font-medium">{t('processing.cadLayout.door')}</span>
          <Input type="number" value={glassWidth} onChange={e => onGlassWidthChange(Number(e.target.value))} onBlur={e => { if (Number(e.target.value) < 50) onGlassWidthChange(50); }} onFocus={e => e.target.select()} className="h-6 w-20 text-[11px] px-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <span className="text-muted-foreground">×</span>
          <Input type="number" value={glassHeight} onChange={e => onGlassHeightChange(Number(e.target.value))} onBlur={e => { if (Number(e.target.value) < 50) onGlassHeightChange(50); }} onFocus={e => e.target.select()} className="h-6 w-20 text-[11px] px-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <span className="text-muted-foreground">mm</span>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <ToolBtn onClick={onClearAll} title={t('processing.cadActions.clearAll')}><X className="h-3.5 w-3.5" /></ToolBtn>
          <ToolBtn onClick={onTogglePanel} title={t('processing.cadActions.propertiesPanel')}>
            {showPanel ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
          </ToolBtn>
        </div>
      </div>
    </TooltipProvider>
  );
}
