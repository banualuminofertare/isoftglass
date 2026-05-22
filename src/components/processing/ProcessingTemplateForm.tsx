import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Maximize2, Minimize2, Search, X, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import type { ProcessingTemplate } from '@/hooks/useProcessingTemplates';
import { CadEditor } from './cad/CadEditor';
import { useAllCatalogAccessories } from '@/hooks/useCatalogAccessories';
import { parseDxf, getEntitiesBounds, type DxfEntity } from '@/lib/dxf/dxfParser';
import { dxfToCadShapes } from '@/lib/dxf/dxfToCadShapes';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<ProcessingTemplate, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'company_id'>) => void;
  initial?: ProcessingTemplate | null;
}

const TEMPLATE_TYPE_KEYS: Array<{ value: string; labelKey: string }> = [
  { value: 'hinge_cutout', labelKey: 'processing.templateTypes.hingeCutout' },
  { value: 'handle_hole', labelKey: 'processing.templateTypes.handleHole' },
  { value: 'lock_cutout', labelKey: 'processing.templateTypes.lockCutout' },
  { value: 'socket_cutout', labelKey: 'processing.templateTypes.socketCutout' },
  { value: 'ventilation_hole', labelKey: 'processing.templateTypes.ventilationHole' },
  { value: 'shelf_support_hole', labelKey: 'processing.templateTypes.shelfSupport' },
  { value: 'custom', labelKey: 'processing.templateTypes.custom' },
  { value: 'other', labelKey: 'processing.templateTypes.other' },
];

const STANDARD_DIMS = ['height', 'width', 'edge_offset', 'inner_height', 'diameter', 'depth'];

/** Auto-detect template_type from material code prefix */
function detectTemplateType(code: string): string | null {
  if (code.startsWith('30.')) return 'hinge_cutout';
  if (code.startsWith('51.') || code.startsWith('50.')) return 'handle_hole';
  if (code.startsWith('19.K') || code.startsWith('19.F') || code.startsWith('19.P') || code.startsWith('19.LK') || code.startsWith('19.DB')) return 'lock_cutout';
  if (code.startsWith('31.')) return 'handle_hole'; // mount point
  return null;
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function ProcessingTemplateForm({ open, onOpenChange, onSubmit, initial }: Props) {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [prefix, setPrefix] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('hinge_cutout');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [edgeOffset, setEdgeOffset] = useState('');
  const [innerHeight, setInnerHeight] = useState('');
  const [diameter, setDiameter] = useState('');
  const [depth, setDepth] = useState('');
  const [drawingUrl, setDrawingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [customDims, setCustomDims] = useState<Array<{ key: string; value: string }>>([]);
  const [cadDimensions, setCadDimensions] = useState<Record<string, number>>({});
  const [cadShapes, setCadShapes] = useState<any[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  // DXF import dialog state
  const [dxfDialogOpen, setDxfDialogOpen] = useState(false);
  const [dxfEntities, setDxfEntities] = useState<DxfEntity[]>([]);
  const [dxfBounds, setDxfBounds] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [dxfOffsetX, setDxfOffsetX] = useState('10');
  const [dxfOffsetY, setDxfOffsetY] = useState('10');
  const [dxfCenter, setDxfCenter] = useState(false);
  const [dxfAnchorBottom, setDxfAnchorBottom] = useState(true);

  const { products: catalogProducts } = useAllCatalogAccessories();

  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return catalogProducts.slice(0, 30);
    const q = normalize(catalogSearch);
    return catalogProducts.filter(p =>
      normalize(p.code).includes(q) || normalize(p.name).includes(q)
    ).slice(0, 30);
  }, [catalogProducts, catalogSearch]);

  const isCustomType = type === 'custom';
  const isHoleType = type === 'ventilation_hole' || type === 'shelf_support_hole';

  useEffect(() => {
    if (initial) {
      setPrefix(initial.material_code_prefix);
      setName(initial.name);
      setType(initial.template_type);
      setHeight(String(initial.dimensions?.height ?? ''));
      setWidth(String(initial.dimensions?.width ?? ''));
      setEdgeOffset(String(initial.dimensions?.edge_offset ?? ''));
      setInnerHeight(String(initial.dimensions?.inner_height ?? ''));
      setDiameter(String(initial.dimensions?.diameter ?? ''));
      setDepth(String(initial.dimensions?.depth ?? ''));
      setDrawingUrl(initial.drawing_url ?? '');
      setNotes(initial.notes ?? '');
      const custom = Object.entries(initial.dimensions ?? {})
        .filter(([k]) => !STANDARD_DIMS.includes(k) && !k.startsWith('_'))
        .map(([key, value]) => ({ key, value: String(value) }));
      setCustomDims(custom);
    } else {
      setPrefix(''); setName(''); setType('hinge_cutout');
      setHeight(''); setWidth(''); setEdgeOffset(''); setInnerHeight('');
      setDiameter(''); setDepth('');
      setDrawingUrl(''); setNotes('');
      setCustomDims([]);
    }
    const savedShapes = initial?.dimensions?._cad_shapes;
    const hasShapes = Array.isArray(savedShapes) && savedShapes.length > 0;
    setCadShapes(hasShapes ? savedShapes : []);
    setActiveTab(hasShapes ? 'cad' : 'form');
    setCadDimensions({});
  }, [initial, open]);

  const handleCadChange = useCallback((dims: Record<string, number>, svgDataUrl: string, shapes: any[]) => {
    setCadDimensions(dims);
    setCadShapes(shapes);
    setDrawingUrl(svgDataUrl);
  }, []);

  const handleDxfImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        const entities = parseDxf(content);
        if (entities.length === 0) {
          toast.error(t('processing.templateForm.dxfNoEntities'));
          return;
        }
        const bounds = getEntitiesBounds(entities);
        setDxfEntities(entities);
        setDxfBounds({ width: Math.round(bounds.width * 10) / 10, height: Math.round(bounds.height * 10) / 10 });
        setDxfOffsetX('10');
        setDxfOffsetY('10');
        setDxfCenter(false);
        setDxfAnchorBottom(true);
        setDxfDialogOpen(true);
      } catch (err) {
        toast.error(t('processing.templateForm.dxfParseError'));
        console.error('DXF parse error:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleDxfConfirm = useCallback(() => {
    if (dxfEntities.length === 0) return;
    // Glass panel size from CadEditor default (100x100 or from cadDimensions)
    const panelW = cadDimensions._panel_width || 100;
    const panelH = cadDimensions._panel_height || 100;

    let ox = Number(dxfOffsetX) || 0;
    let oy = Number(dxfOffsetY) || 0;

    if (dxfCenter) {
      ox = (panelW - dxfBounds.width) / 2;
      oy = dxfAnchorBottom
        ? (panelH - dxfBounds.height) / 2
        : (panelH - dxfBounds.height) / 2;
    }

    const shapes = dxfToCadShapes(dxfEntities, {
      offsetX: ox,
      offsetY: oy,
      filterOutline: true,
      anchorBottom: dxfAnchorBottom,
      panelHeight: dxfAnchorBottom ? panelH : undefined,
    });

    setCadShapes(shapes as any[]);
    setActiveTab('cad');
    setDxfDialogOpen(false);
    toast.success(t('processing.templateForm.dxfImportSuccess', { count: shapes.length }));
  }, [dxfEntities, dxfOffsetX, dxfOffsetY, dxfCenter, dxfAnchorBottom, dxfBounds, cadDimensions]);

  const handleCatalogSelect = useCallback((product: { code: string; name: string }) => {
    setPrefix(product.code);
    if (!name) setName(product.name);
    const detectedType = detectTemplateType(product.code);
    if (detectedType) setType(detectedType);
    setCatalogOpen(false);
    setCatalogSearch('');
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dimensions: Record<string, number> = {};

    if (activeTab === 'cad' && Object.keys(cadDimensions).length > 0) {
      // Use CAD dimensions + persist shapes for later restoration
      Object.assign(dimensions, cadDimensions);
      if (cadShapes.length > 0) {
        (dimensions as any)._cad_shapes = cadShapes;
      }
    } else {
      // Use form dimensions
      if (height) dimensions.height = Number(height);
      if (width) dimensions.width = Number(width);
      if (edgeOffset) dimensions.edge_offset = Number(edgeOffset);
      if (innerHeight) dimensions.inner_height = Number(innerHeight);
      if (diameter) dimensions.diameter = Number(diameter);
      if (depth) dimensions.depth = Number(depth);
      customDims.forEach(d => {
        if (d.key && d.value) dimensions[d.key] = Number(d.value);
      });
    }

    onSubmit({
      material_code_prefix: prefix,
      name,
      template_type: type,
      dimensions,
      drawing_url: drawingUrl || null,
      notes: notes || null,
    });
    onOpenChange(false);
  };

  const isCadActive = activeTab === 'cad';

  const dialogClass = isFullscreen
    ? 'max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] m-0 rounded-none flex flex-col'
    : isCadActive
      ? 'max-w-5xl h-[85vh] flex flex-col'
      : 'max-w-md max-h-[90vh] overflow-y-auto';

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className="flex-row items-center justify-between gap-2">
          <DialogTitle>{initial ? t('processing.templateForm.editTemplate') : t('processing.templateForm.newTemplate')}</DialogTitle>
          {isCadActive && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? t('processing.templateForm.minimize') : t('processing.templateForm.fullscreen')}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          <DialogDescription className="sr-only">{t('processing.templateForm.configureDetails')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={isCadActive ? 'flex flex-col flex-1 min-h-0 space-y-2' : 'space-y-3'}>
          {/* Common fields always visible */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('processing.templateForm.materialCode')}</Label>
              <Popover open={catalogOpen} onOpenChange={setCatalogOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between font-normal h-10 text-left">
                    <span className={prefix ? 'text-foreground truncate' : 'text-muted-foreground truncate'}>
                      {prefix || t('processing.templateForm.searchCatalog')}
                    </span>
                    {prefix ? (
                      <X className="h-3.5 w-3.5 shrink-0 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setPrefix(''); }} />
                    ) : (
                      <Search className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2" align="start">
                  <Input
                    placeholder={t('processing.templateForm.searchCodeOrName')}
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="mb-2 h-8 text-sm"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {filteredCatalog.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">{t('processing.templateForm.noProductFound')}</p>
                    ) : (
                      filteredCatalog.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2"
                          onClick={() => handleCatalogSelect(p)}
                        >
                          <span className="font-mono text-xs text-muted-foreground shrink-0">{p.code}</span>
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <Input
                      placeholder={t('processing.templateForm.orEnterManually')}
                      value={prefix}
                      onChange={e => setPrefix(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>{t('processing.templateForm.templateType')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPE_KEYS.map(tk => (
                    <SelectItem key={tk.value} value={tk.value}>{t(tk.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t('processing.templateForm.templateName')}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className={isCadActive ? 'flex flex-col flex-1 min-h-0' : ''}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">{t('processing.templateForm.formTab')}</TabsTrigger>
              <TabsTrigger value="cad">{t('processing.templateForm.cadTab')}</TabsTrigger>
            </TabsList>
            {activeTab === 'cad' && (
              <div className="flex items-center gap-2 mt-1">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    {t('processing.templateForm.importDxf')}
                    <input type="file" accept=".dxf" className="sr-only" onChange={handleDxfImport} />
                  </label>
                </Button>
                <span className="text-xs text-muted-foreground">{t('processing.templateForm.dxfSupported')}</span>
              </div>
            )}

            <TabsContent value="form" className="space-y-3">
              {/* Standard dimension fields */}
              <div className="grid grid-cols-2 gap-3">
                {!isHoleType && (
                  <>
                    <div><Label>{t('processing.templateForm.heightMm')}</Label><Input type="number" step="0.5" value={height} onChange={e => setHeight(e.target.value)} onFocus={e => e.target.select()} /></div>
                    <div><Label>{t('processing.templateForm.widthMm')}</Label><Input type="number" step="0.5" value={width} onChange={e => setWidth(e.target.value)} onFocus={e => e.target.select()} /></div>
                  </>
                )}
                <div><Label>{t('processing.templateForm.edgeOffset')}</Label><Input type="number" step="0.5" value={edgeOffset} onChange={e => setEdgeOffset(e.target.value)} onFocus={e => e.target.select()} /></div>
                {!isHoleType && (
                  <div><Label>{t('processing.templateForm.innerDim')}</Label><Input type="number" step="0.5" value={innerHeight} onChange={e => setInnerHeight(e.target.value)} onFocus={e => e.target.select()} /></div>
                )}
                {isHoleType && (
                  <div><Label>{t('processing.templateForm.diameterMm')}</Label><Input type="number" step="0.5" value={diameter} onChange={e => setDiameter(e.target.value)} onFocus={e => e.target.select()} /></div>
                )}
                {(type === 'socket_cutout' || isHoleType) && (
                  <div><Label>{t('processing.templateForm.depthMm')}</Label><Input type="number" step="0.5" value={depth} onChange={e => setDepth(e.target.value)} onFocus={e => e.target.select()} /></div>
                )}
              </div>

              {/* Custom dimensions for 'custom' type */}
              {isCustomType && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t('processing.templateForm.customDimensions')}</Label>
                  {customDims.map((dim, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder={t('processing.templateForm.dimNamePlaceholder')}
                        value={dim.key}
                        onChange={e => {
                          const updated = [...customDims];
                          updated[i].key = e.target.value;
                          setCustomDims(updated);
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.5"
                        placeholder={t('processing.templateForm.dimValuePlaceholder')}
                        value={dim.value}
                        onChange={e => {
                          const updated = [...customDims];
                          updated[i].value = e.target.value;
                          setCustomDims(updated);
                        }}
                        onFocus={e => e.target.select()}
                        className="w-24"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCustomDims(customDims.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setCustomDims([...customDims, { key: '', value: '' }])}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> {t('processing.templateForm.addDimension')}
                  </Button>
                </div>
              )}

              <div>
                <Label>{t('processing.templateForm.drawingUrl')}</Label>
                <Input value={drawingUrl} onChange={e => setDrawingUrl(e.target.value)} placeholder="/materials/prelucrare_sh56.png" />
              </div>
              <div>
                <Label>{t('processing.templateForm.observations')}</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>
            </TabsContent>

            <TabsContent value="cad" className="flex-1 min-h-0">
              <div className="h-full border rounded-lg overflow-hidden">
                <CadEditor initialShapes={cadShapes.length > 0 ? cadShapes : undefined} onChange={handleCadChange} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('processing.templateForm.cancel')}</Button>
            <Button type="submit">{initial ? t('processing.templateForm.save') : t('processing.templateForm.add')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* DXF Import Positioning Dialog */}
    <Dialog open={dxfDialogOpen} onOpenChange={setDxfDialogOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('processing.templateForm.dxfImportTitle')}</DialogTitle>
          <DialogDescription>
            {t('processing.templateForm.dxfGeometryDetected')} <strong>{dxfBounds.width} × {dxfBounds.height} mm</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dxf-center" className="text-sm">{t('processing.templateForm.centerOnGlass')}</Label>
            <Switch id="dxf-center" checked={dxfCenter} onCheckedChange={setDxfCenter} />
          </div>

          {!dxfCenter && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="dxf-anchor" className="text-sm">{t('processing.templateForm.yFromBase')}</Label>
                <Switch id="dxf-anchor" checked={dxfAnchorBottom} onCheckedChange={setDxfAnchorBottom} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('processing.templateForm.xOffset')}</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={dxfOffsetX}
                    onChange={e => setDxfOffsetX(e.target.value)}
                    onFocus={e => e.target.select()}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t('processing.templateForm.yOffset')} — {dxfAnchorBottom ? t('processing.templateForm.yFromBottom') : t('processing.templateForm.yFromTop')}
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={dxfOffsetY}
                    onChange={e => setDxfOffsetY(e.target.value)}
                    onFocus={e => e.target.select()}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDxfDialogOpen(false)}>{t('processing.templateForm.cancel')}</Button>
            <Button type="button" onClick={handleDxfConfirm}>{t('processing.templateForm.importBtn')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
