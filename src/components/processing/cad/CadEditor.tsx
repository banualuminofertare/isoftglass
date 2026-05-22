import { useState, useCallback, useEffect } from 'react';
import type { CadShape, ToolType, Measurement, PanelLayout } from './cadTypes';
import { exportToSvgDataUrl, shapesToDimensions, duplicateShape, mirrorShapeX, mirrorShapeY, rotateShape90, createLinearArray, duplicateAllShapes, mirrorAllShapesX, mirrorAllShapesY } from './cadTypes';
import { CadToolbar } from './CadToolbar';
import { CadCanvas } from './CadCanvas';
import { CadPropertiesPanel } from './CadPropertiesPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  initialShapes?: CadShape[];
  onChange: (dimensions: Record<string, number>, svgDataUrl: string, shapes: CadShape[]) => void;
}

export function CadEditor({ initialShapes, onChange }: Props) {
  const { t } = useTranslation();
  const [shapes, setShapes] = useState<CadShape[]>(initialShapes ?? []);

  // Sync internal shapes when initialShapes prop changes (e.g. DXF import after mount)
  useEffect(() => {
    if (initialShapes && initialShapes.length > 0) {
      setShapes(initialShapes);
    }
  }, [initialShapes]);

  // If restoring shapes, also check for saved glass dimensions in the initial onChange cycle
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolType>('select');
  const [gridSize, setGridSize] = useState(5);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [history, setHistory] = useState<CadShape[][]>([]);
  const [redoStack, setRedoStack] = useState<CadShape[][]>([]);
  const [glassWidth, setGlassWidth] = useState(500);
  const [glassHeight, setGlassHeight] = useState(2000);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [arrayDialog, setArrayDialog] = useState(false);
  const [arrayCount, setArrayCount] = useState(3);
  const [arrayDx, setArrayDx] = useState(50);
  const [arrayDy, setArrayDy] = useState(0);
  const [showPanel, setShowPanel] = useState(true);
  const [panelLayout, setPanelLayout] = useState<PanelLayout>('door_only');
  const [fixedLeftWidth, setFixedLeftWidth] = useState(500);
  const [fixedRightWidth, setFixedRightWidth] = useState(500);
  const [copyAllDialog, setCopyAllDialog] = useState(false);
  const [copyAllDx, setCopyAllDx] = useState(glassWidth + 20);
  const [copyAllDy, setCopyAllDy] = useState(0);

  const selectedShape = shapes.find(s => s.id === selectedId) ?? null;

  useEffect(() => {
    const dims = shapesToDimensions(shapes, panelLayout, fixedLeftWidth, fixedRightWidth);
    dims.glass_width = glassWidth;
    dims.glass_height = glassHeight;
    const svg = exportToSvgDataUrl(shapes, glassWidth, glassHeight);
    onChange(dims, svg, shapes);
  }, [shapes, glassWidth, glassHeight, panelLayout, fixedLeftWidth, fixedRightWidth, onChange]);

  const pushHistory = useCallback(() => {
    setHistory(h => [...h.slice(-30), shapes]);
    setRedoStack([]);
  }, [shapes]);

  const addShape = useCallback((shape: CadShape) => {
    pushHistory();
    setShapes(prev => [...prev, shape]);
  }, [pushHistory]);

  const updateShape = useCallback((id: string, updates: Partial<CadShape>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    pushHistory();
    setShapes(prev => prev.filter(s => s.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, pushHistory]);

  const deleteShapeById = useCallback((id: string) => {
    pushHistory();
    setShapes(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [pushHistory, selectedId]);

  const deleteMeasurementById = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(r => [...r, shapes]);
    setHistory(h => h.slice(0, -1));
    setShapes(prev);
    setSelectedId(null);
  }, [history, shapes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(h => [...h, shapes]);
    setRedoStack(r => r.slice(0, -1));
    setShapes(next);
    setSelectedId(null);
  }, [redoStack, shapes]);

  const handleDuplicate = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const dup = duplicateShape(selectedShape);
    setShapes(prev => [...prev, dup]);
    setSelectedId(dup.id);
  }, [selectedShape, pushHistory]);

  const handleMirrorX = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const mirrored = mirrorShapeX(selectedShape, glassWidth);
    setShapes(prev => [...prev, mirrored]);
    setSelectedId(mirrored.id);
  }, [selectedShape, glassWidth, pushHistory]);

  const handleMirrorY = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const mirrored = mirrorShapeY(selectedShape, glassHeight);
    setShapes(prev => [...prev, mirrored]);
    setSelectedId(mirrored.id);
  }, [selectedShape, glassHeight, pushHistory]);

  const handleRotate90 = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const rotated = rotateShape90(selectedShape);
    setShapes(prev => prev.map(s => s.id === selectedShape.id ? { ...s, ...rotated, id: s.id } : s));
  }, [selectedShape, pushHistory]);

  const handleCenterShape = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    updateShape(selectedShape.id, {
      x: glassWidth / 2,
      y: glassHeight / 2,
    });
  }, [selectedShape, glassWidth, glassHeight, pushHistory, updateShape]);

  const handleAlignLeft = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const offset = selectedShape.type === 'circle' ? selectedShape.radius : selectedShape.width / 2;
    updateShape(selectedShape.id, { x: offset });
  }, [selectedShape, pushHistory, updateShape]);

  const handleAlignRight = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const offset = selectedShape.type === 'circle' ? selectedShape.radius : selectedShape.width / 2;
    updateShape(selectedShape.id, { x: glassWidth - offset });
  }, [selectedShape, glassWidth, pushHistory, updateShape]);

  const handleAlignTop = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const offset = selectedShape.type === 'circle' ? selectedShape.radius : selectedShape.height / 2;
    updateShape(selectedShape.id, { y: offset });
  }, [selectedShape, pushHistory, updateShape]);

  const handleAlignBottom = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const offset = selectedShape.type === 'circle' ? selectedShape.radius : selectedShape.height / 2;
    updateShape(selectedShape.id, { y: glassHeight - offset });
  }, [selectedShape, glassHeight, pushHistory, updateShape]);

  const handleClearAll = useCallback(() => {
    if (shapes.length === 0) return;
    pushHistory();
    setShapes([]);
    setSelectedId(null);
    setMeasurements([]);
  }, [shapes, pushHistory]);

  const handleDuplicateAll = useCallback(() => {
    if (shapes.length === 0) return;
    pushHistory();
    const copies = duplicateAllShapes(shapes, copyAllDx, copyAllDy);
    setShapes(prev => [...prev, ...copies]);
    setCopyAllDialog(false);
  }, [shapes, copyAllDx, copyAllDy, pushHistory]);

  const handleMirrorAllX = useCallback(() => {
    if (shapes.length === 0) return;
    pushHistory();
    const mirrored = mirrorAllShapesX(shapes, glassWidth);
    setShapes(prev => [...prev, ...mirrored]);
  }, [shapes, glassWidth, pushHistory]);

  const handleMirrorAllY = useCallback(() => {
    if (shapes.length === 0) return;
    pushHistory();
    const mirrored = mirrorAllShapesY(shapes, glassHeight);
    setShapes(prev => [...prev, ...mirrored]);
  }, [shapes, glassHeight, pushHistory]);

  const handleArray = useCallback(() => {
    if (!selectedShape) return;
    pushHistory();
    const newShapes = createLinearArray(selectedShape, arrayCount, arrayDx, arrayDy);
    setShapes(prev => [...prev, ...newShapes]);
    setArrayDialog(false);
  }, [selectedShape, arrayCount, arrayDx, arrayDy, pushHistory]);

  const handleFitView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(30, z * 1.3)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(0.1, z / 1.3)), []);

  const addMeasurement = useCallback((m: Measurement) => {
    setMeasurements(prev => [...prev, m]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); redo(); }
      else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
      if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); redo(); }
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); setCopyAllDx(glassWidth + 20); setCopyAllDy(0); setCopyAllDialog(true); return; }
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleDuplicate(); }
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleRotate90(); }
      if (e.key === 'v' && !e.ctrlKey) setTool('select');
      if (e.key === 'm' && !e.ctrlKey) setTool('move');
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey) setTool('measure');
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) setTool('rect');
      if (e.key === 'c' && !e.ctrlKey) setTool('circle');
      if (e.key === 's' && !e.ctrlKey) setTool('stadium');
      if (e.key === 'l' && !e.ctrlKey) setTool('lshape');
      if (e.key === 'o' && !e.ctrlKey) setTool('slot');
      if (e.key === 'i' && !e.ctrlKey) setTool('line');
      if (e.key === 'e' && !e.ctrlKey) setTool('eraser');
      if (e.key === 'b' && !e.ctrlKey) setTool('subtract');
      if (e.key === 't' && !e.ctrlKey) setTool('trim');
      if (e.key === 'h' && !e.ctrlKey) setTool('stretch');
      if (e.key === 'a' && !e.ctrlKey) setTool('copyarea');
      if (e.key === 'j' && !e.ctrlKey) setTool('join');
      if (e.key === 'w' && !e.ctrlKey) setTool('weld');
      if (e.key === 'f' && !e.ctrlKey) handleFitView();
      if (e.key === 'Tab') { e.preventDefault(); setShowPanel(p => !p); }
      if (e.key === 'Escape') {
        setTool('select');
        setSelectedId(null);
        setMeasurements([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected, undo, redo, handleDuplicate, handleRotate90, handleFitView, glassWidth]);

  return (
    <div className="flex flex-col h-full">
      <CadToolbar
        tool={tool}
        onToolChange={setTool}
        gridSize={gridSize}
        onGridChange={setGridSize}
        onUndo={undo}
        onRedo={redo}
        canRedo={redoStack.length > 0}
        onDelete={deleteSelected}
        onDuplicate={handleDuplicate}
        onMirrorX={handleMirrorX}
        onMirrorY={handleMirrorY}
        onRotate90={handleRotate90}
        onFitView={handleFitView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onArray={() => setArrayDialog(true)}
        hasSelection={!!selectedId}
        hasShapes={shapes.length > 0}
        onDuplicateAll={() => { setCopyAllDx(glassWidth + 20); setCopyAllDy(0); setCopyAllDialog(true); }}
        onMirrorAllX={handleMirrorAllX}
        onMirrorAllY={handleMirrorAllY}
        snapEnabled={snapEnabled}
        onSnapToggle={() => setSnapEnabled(s => !s)}
        onCenterShape={handleCenterShape}
        onAlignLeft={handleAlignLeft}
        onAlignRight={handleAlignRight}
        onAlignTop={handleAlignTop}
        onAlignBottom={handleAlignBottom}
        onClearAll={handleClearAll}
        glassWidth={glassWidth}
        glassHeight={glassHeight}
        onGlassWidthChange={setGlassWidth}
        onGlassHeightChange={setGlassHeight}
        showPanel={showPanel}
        onTogglePanel={() => setShowPanel(p => !p)}
        panelLayout={panelLayout}
        onPanelLayoutChange={setPanelLayout}
        fixedLeftWidth={fixedLeftWidth}
        fixedRightWidth={fixedRightWidth}
        onFixedLeftWidthChange={setFixedLeftWidth}
        onFixedRightWidthChange={setFixedRightWidth}
      />

      <div className="flex flex-1 min-h-0">
        <CadCanvas
          shapes={shapes}
          selectedId={selectedId}
          tool={tool}
          gridSize={gridSize}
          snapEnabled={snapEnabled}
          glassWidth={glassWidth}
          glassHeight={glassHeight}
          zoom={zoom}
          pan={pan}
          onZoomChange={setZoom}
          onPanChange={setPan}
          onSelect={setSelectedId}
          onAddShape={addShape}
          onUpdateShape={updateShape}
          onDeleteShape={deleteShapeById}
          onToolChange={setTool}
          measurements={measurements}
          onAddMeasurement={addMeasurement}
          onDeleteMeasurement={deleteMeasurementById}
          cursorPos={cursorPos}
          onCursorChange={setCursorPos}
          onPushHistory={pushHistory}
          panelLayout={panelLayout}
          fixedLeftWidth={fixedLeftWidth}
          fixedRightWidth={fixedRightWidth}
        />

        {showPanel && (
          <div className="w-48 border-l shrink-0 overflow-y-auto bg-background">
            <CadPropertiesPanel
              shape={selectedShape}
              onUpdate={(id, updates) => { pushHistory(); updateShape(id, updates); }}
              glassWidth={glassWidth}
              glassHeight={glassHeight}
            />
            {shapes.length > 0 && (
              <div className="p-2 border-t">
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">{shapes.length} formă(e)</p>
                <ul className="text-[11px] space-y-0.5 max-h-32 overflow-y-auto">
                  {shapes.map((s, i) => (
                    <li key={s.id}
                      className={`cursor-pointer px-1.5 py-0.5 rounded flex items-center gap-1 ${s.id === selectedId ? 'bg-primary/10 font-medium' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedId(s.id)}>
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="truncate">{s.label || s.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {measurements.length > 0 && (
              <div className="p-2 border-t">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-muted-foreground font-medium">{t('ui.measurements')}</p>
                  <Button type="button" variant="ghost" size="sm" className="h-4 text-[10px] px-1" onClick={() => setMeasurements([])}>{t('ui.deleteShort')}</Button>
                </div>
                <ul className="text-[11px] space-y-0.5">
                  {measurements.map(m => (
                    <li key={m.id} className="text-muted-foreground">{Math.round(m.distance)} mm</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Array dialog */}
      <Dialog open={arrayDialog} onOpenChange={setArrayDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>{t('ui.linearArray')}</DialogTitle>
            <DialogDescription className="sr-only">{t('ui.linearArrayDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t('ui.copyCount')}</Label>
              <Input type="number" value={arrayCount} onChange={e => setArrayCount(Math.max(1, Number(e.target.value)))} className="h-8" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t('ui.distanceX')}</Label>
                <Input type="number" value={arrayDx} onChange={e => setArrayDx(Number(e.target.value))} className="h-8" />
              </div>
              <div>
                <Label className="text-xs">{t('ui.distanceY')}</Label>
                <Input type="number" value={arrayDy} onChange={e => setArrayDy(Number(e.target.value))} className="h-8" />
              </div>
            </div>
            <Button type="button" onClick={handleArray} className="w-full">{t('ui.create')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy All dialog */}
      <Dialog open={copyAllDialog} onOpenChange={setCopyAllDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>{t('ui.copyAll')}</DialogTitle>
            <DialogDescription className="sr-only">{t('ui.copyAllDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Offset X (mm)</Label>
                <Input type="number" value={copyAllDx} onChange={e => setCopyAllDx(Number(e.target.value))} className="h-8" />
              </div>
              <div>
                <Label className="text-xs">Offset Y (mm)</Label>
                <Input type="number" value={copyAllDy} onChange={e => setCopyAllDy(Number(e.target.value))} className="h-8" />
              </div>
            </div>
            <Button type="button" onClick={handleDuplicateAll} className="w-full">{t('ui.copy')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
