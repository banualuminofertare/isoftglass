import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Scissors, FileDown, Loader2, Package, BarChart3, Search, CheckSquare, Square, X, Settings as SettingsIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GlassSheetSettings } from '@/components/settings/GlassSheetSettings';
import { guillotineCut, CutPanel, CuttingResult } from '@/lib/cutting/guillotineCut';
import { SheetVisualization } from '@/components/cutting/SheetVisualization';
import { exportCuttingPdf } from '@/components/cutting/CuttingPdfExport';
import { exportCuttingDxf } from '@/components/cutting/CuttingDxfExport';
import { DxfVersion } from '@/lib/dxf/dxfCore';

interface GlassSheet {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface OrderOption {
  id: string;
  order_number: string;
  client_name: string | null;
  status: string;
  created_at: string;
  panels: CutPanel[];
}

export default function CuttingOptimization() {
  const { t } = useTranslation();
  const { user, companyId } = useAuth();
  const [sheets, setSheets] = useState<GlassSheet[]>([]);
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [bladeThickness, setBladeThickness] = useState(3);
  const [result, setResult] = useState<CuttingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [dxfVersion, setDxfVersion] = useState<DxfVersion>('R2010');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const DEFAULT_SHEETS = [
    { name: 'Standard 2550×3210', width: 2550, height: 3210 },
    { name: 'Standard 2250×3210', width: 2250, height: 3210 },
    { name: 'Jumbo 6000×3210', width: 6000, height: 3210 },
  ];

  useEffect(() => {
    Promise.all([loadSheets(), loadOrders()]).then(() => setLoading(false));
  }, []);

  const loadSheets = async () => {
    const { data } = await supabase
      .from('glass_sheets')
      .select('id, name, width, height')
      .eq('is_active', true)
      .order('width');
    
    if (data && data.length > 0) {
      setSheets(data as GlassSheet[]);
    } else if (user) {
      // Seed defaults if no sheets exist
      const inserts = DEFAULT_SHEETS.map(s => ({
        ...s,
        user_id: user.id,
        company_id: companyId || null,
      }));
      const { data: seeded } = await supabase
        .from('glass_sheets')
        .insert(inserts as any)
        .select('id, name, width, height');
      if (seeded) setSheets(seeded as GlassSheet[]);
    }
  };

  const loadOrders = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, order_number, client_id, status, created_at')
      .in('status', ['confirmed', 'in_production', 'quote', 'completed', 'delivered'])
      .order('created_at', { ascending: false });

    if (!ordersData) return;

    const clientIds = ordersData.map(o => o.client_id).filter(Boolean) as string[];
    const { data: clientsData } = clientIds.length > 0
      ? await supabase.from('clients').select('id, name').in('id', clientIds)
      : { data: [] };
    const clientMap = new Map((clientsData || []).map(c => [c.id, c.name]));

    const orderIds = ordersData.map(o => o.id);
    
    // Fetch in batches if needed (supabase limit is 1000)
    let allProducts: any[] = [];
    for (let i = 0; i < orderIds.length; i += 500) {
      const batch = orderIds.slice(i, i + 500);
      const { data: productsData } = await supabase
        .from('order_products')
        .select('id, order_id, product_type, configuration, full_config, quantity')
        .in('order_id', batch);
      if (productsData) allProducts.push(...productsData);
    }

    const orderOptions: OrderOption[] = ordersData.map(order => {
      const products = allProducts.filter(p => p.order_id === order.id);
      const panels: CutPanel[] = [];

      products.forEach(product => {
        const config = (product.full_config || product.configuration) as any;
        if (!config) return;
        const qty = product.quantity || 1;
        extractPanels(config, product.product_type, order.order_number, order.id, qty, panels);
      });

      return {
        id: order.id,
        order_number: order.order_number,
        client_name: order.client_id ? clientMap.get(order.client_id) || null : null,
        status: order.status,
        created_at: order.created_at,
        panels,
      };
    });

    setOrders(orderOptions.filter(o => o.panels.length > 0));
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_number.toLowerCase().includes(term) ||
        (o.client_name && o.client_name.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [orders, searchTerm, statusFilter]);

  const toggleOrder = (id: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setResult(null);
  };

  const selectAll = () => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      filteredOrders.forEach(o => next.add(o.id));
      return next;
    });
    setResult(null);
  };

  const deselectAll = () => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      filteredOrders.forEach(o => next.delete(o.id));
      return next;
    });
    setResult(null);
  };

  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedOrders.has(o.id));

  const handleOptimize = () => {
    const sheet = sheets.find(s => s.id === selectedSheet);
    if (!sheet) { toast.error(t('cutting.selectSheetFirst')); return; }
    if (selectedOrders.size === 0) { toast.error(t('cutting.selectAtLeastOneOrder')); return; }

    setOptimizing(true);

    const allPanels: CutPanel[] = [];
    orders.filter(o => selectedOrders.has(o.id)).forEach(o => {
      allPanels.push(...o.panels);
    });

    if (allPanels.length === 0) {
      toast.error(t('cutting.noPanelsFound'));
      setOptimizing(false);
      return;
    }

    const r = guillotineCut(allPanels, sheet.width, sheet.height, bladeThickness);
    setResult(r);
    setOptimizing(false);
    if (r.totalWastePercent <= 5) {
      toast.success(t('cutting.optimizationComplete', { sheets: r.totalSheets, waste: r.totalWastePercent }));
    } else {
      toast.warning(
        t('cutting.optimizationComplete', { sheets: r.totalSheets, waste: r.totalWastePercent }) +
          ' — ' +
          t('cutting.wasteHint', 'Adaugă mai multe comenzi pentru a coborî sub 5%.'),
      );
    }
  };

  const handleExportPdf = () => {
    if (!result) return;
    const sheet = sheets.find(s => s.id === selectedSheet);
    exportCuttingPdf(result, sheet?.name || t('cutting.sheetFallback'));
  };

  const handleExportDxf = () => {
    if (!result) return;
    const sheet = sheets.find(s => s.id === selectedSheet);
    exportCuttingDxf(result, sheet?.name || t('cutting.sheetFallback'), dxfVersion);
  };

  const totalPanels = orders
    .filter(o => selectedOrders.has(o.id))
    .reduce((sum, o) => sum + o.panels.length, 0);

  if (loading) {
    return (
      <AppLayout title={t('cutting.title')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t('cutting.title')}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-8rem)]">
        {/* Left: Controls - sticky with own scroll */}
        <div className="lg:overflow-y-auto lg:max-h-full space-y-4 lg:pr-2">
          {/* Sheet selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                {t('cutting.configuration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>{t('cutting.sheetType')}</Label>
                  <Dialog onOpenChange={(open) => { if (!open) loadSheets(); }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                        <SettingsIcon className="h-3 w-3" />
                        {t('cutting.manageSheets')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t('cutting.manageSheetsTitle')}</DialogTitle>
                      </DialogHeader>
                      <GlassSheetSettings />
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={selectedSheet} onValueChange={v => { setSelectedSheet(v); setResult(null); }}>
                  <SelectTrigger><SelectValue placeholder={t('cutting.selectSheet')} /></SelectTrigger>
                  <SelectContent>
                    {sheets.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {s.width} × {s.height} mm ({((s.width * s.height) / 1000000).toFixed(2)} m²)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('cutting.bladeThickness')}</Label>
                <Input type="number" min={0} max={10} step={0.5}
                  value={bladeThickness}
                  onChange={e => { setBladeThickness(Number(e.target.value)); setResult(null); }}
                  className="w-24" />
              </div>
            </CardContent>
          </Card>

          {/* Selected orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                {t('cutting.selectedOrders')}
                {selectedOrders.size > 0 && (
                  <Badge className="ml-auto text-[10px]">
                    {selectedOrders.size} {t('common.orders')} · {totalPanels} {t('cutting.panels')}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {selectedOrders.size > 0 ? (
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-1">
                    {orders.filter(o => selectedOrders.has(o.id)).map(order => (
                      <div key={order.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">{order.order_number}</span>
                            {order.client_name && (
                              <span className="text-xs text-muted-foreground">· {order.client_name}</span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{order.panels.length} {t('cutting.panels')}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => toggleOrder(order.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {t('cutting.selectOrdersBelow')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order search & selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('cutting.availableOrders')}
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {orders.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('cutting.searchOrderOrClient')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Status filter */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('cutting.allStatuses')}</SelectItem>
                    <SelectItem value="quote">{t('orderStatus.quote')}</SelectItem>
                    <SelectItem value="confirmed">{t('orderStatus.confirmed')}</SelectItem>
                    <SelectItem value="in_production">{t('orderStatus.in_production')}</SelectItem>
                    <SelectItem value="completed">{t('orderStatus.completed')}</SelectItem>
                    <SelectItem value="delivered">{t('orderStatus.delivered')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select all / deselect all */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={selectAll} disabled={allFilteredSelected}>
                  <CheckSquare className="h-3 w-3 mr-1" />
                  {t('cutting.selectAll')} ({filteredOrders.length})
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={deselectAll} disabled={selectedOrders.size === 0}>
                  <Square className="h-3 w-3 mr-1" />
                  {t('cutting.deselectAll')}
                </Button>
              </div>

              <Separator />

              {/* Order list */}
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-1">
                  {filteredOrders.map(order => {
                    const isSelected = selectedOrders.has(order.id);
                    return (
                      <label key={order.id}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'}`}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOrder(order.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">{order.order_number}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {order.panels.length} pan.
                            </Badge>
                          </div>
                          {order.client_name && (
                            <span className="text-xs text-muted-foreground">{order.client_name}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {orders.length === 0
                        ? t('cutting.noConfirmedOrders')
                        : t('common.noResults')}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results - with own scroll */}
        <div className="lg:col-span-2 flex flex-col lg:max-h-full">
          {/* Action buttons - always visible at top */}
          <div className="flex gap-3 items-center flex-wrap pb-4">
            <Button onClick={handleOptimize} disabled={optimizing || selectedOrders.size === 0 || !selectedSheet}
              size="lg">
              {optimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Scissors className="h-4 w-4 mr-2" />}
              {t('cutting.optimize')} ({totalPanels} {t('cutting.panels')})
            </Button>
            {result && (
              <>
                <Button variant="outline" size="lg" onClick={handleExportPdf}>
                  <FileDown className="h-4 w-4 mr-2" /> PDF
                </Button>
                <Select value={dxfVersion} onValueChange={(v) => setDxfVersion(v as DxfVersion)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R12">DXF R12</SelectItem>
                    <SelectItem value="R2000">DXF R2000</SelectItem>
                    <SelectItem value="R2010">DXF R2010</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="lg" onClick={handleExportDxf}>
                  <FileDown className="h-4 w-4 mr-2" /> DXF
                </Button>
              </>
            )}
            {!selectedSheet && selectedOrders.size > 0 && (
              <p className="text-xs text-destructive">
                ⚠ {t('cutting.selectSheetFirst')}
              </p>
            )}
          </div>

          {/* Statistici - always visible */}
          {result && (
            <Card className="mb-4 shrink-0">
              <CardContent className="pt-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{result.totalSheets}</p>
                      <p className="text-xs text-muted-foreground">{t('cutting.sheetsNeeded')}</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div>
                    <p className={`text-2xl font-bold ${result.totalWastePercent > 30 ? 'text-destructive' : result.totalWastePercent > 15 ? 'text-orange-600' : result.totalWastePercent > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {result.totalWastePercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t('cutting.totalWaste')}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t('cutting.wasteTarget', 'Țintă: ≤ 5%')}</p>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div>
                    <p className="text-2xl font-bold">
                      {result.sheets.reduce((s, sh) => s + sh.panels.length, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('cutting.panelsPlaced')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scrollable sheets area */}
          <div className="lg:overflow-y-auto lg:flex-1 min-h-0 space-y-4 lg:pr-2">
            {result ? (
              result.sheets.map((sheet, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <SheetVisualization
                      sheet={sheet}
                      sheetWidth={result.sheetWidth}
                      sheetHeight={result.sheetHeight}
                      sheetIndex={i}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Scissors className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-semibold text-muted-foreground">{t('cutting.selectAndOptimize')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('cutting.algorithmDescription')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function extractPanels(
  config: any,
  productType: string,
  orderNum: string,
  orderId: string,
  qty: number,
  panels: CutPanel[]
) {
  const addPanel = (w: number, h: number, suffix: string) => {
    if (w > 0 && h > 0) {
      for (let i = 0; i < qty; i++) {
        panels.push({ width: Math.round(w), height: Math.round(h), label: `${orderNum} ${suffix}`, orderId });
      }
    }
  };

  // --- New nested structure: config.dimensions + config.accessories ---
  const dims = config.dimensions;
  if (dims && dims.width && dims.height) {
    const seals = config.accessories?.seals || {};
    const wDed = seals.totalWidthDeduction || 0;
    const hDed = seals.totalHeightDeduction || 0;

    // Door glass
    const doorW = dims.doorWidth || dims.width;
    addPanel(doorW - wDed, dims.height - hDed, i18next.t('cutting.panelDoor'));

    // Fixed panel left
    const fpLeft = config.accessories?.fixedPanel?.left;
    if (fpLeft?.enabled && fpLeft?.width) {
      addPanel(fpLeft.width - wDed, dims.height - hDed, i18next.t('cutting.panelFixedLeft'));
    }

    // Fixed panel right
    const fpRight = config.accessories?.fixedPanel?.right;
    if (fpRight?.enabled && fpRight?.width) {
      addPanel(fpRight.width - wDed, dims.height - hDed, i18next.t('cutting.panelFixedRight'));
    }

    // Lateral panel (corner cabins)
    if (dims.depth) {
      const latDoorW = dims.lateralDoorWidth;
      if (latDoorW && latDoorW > 0) {
        addPanel(latDoorW - wDed, dims.height - hDed, i18next.t('cutting.panelDoorLateral'));
      }
      // Lateral fixed panel
      const latFixW = dims.depth - (latDoorW || 0);
      if (latFixW > 50) {
        addPanel(latFixW - wDed, dims.height - hDed, i18next.t('cutting.panelFixedLateral'));
      }
    }

    return; // handled via new structure
  }

  // --- Legacy flat structure fallback ---
  if (config.finalGlassWidth && config.finalGlassHeight) {
    addPanel(config.finalGlassWidth, config.finalGlassHeight, i18next.t('cutting.panelDoor'));
  }
  if (config.doorWidth && config.doorGlassHeight) {
    addPanel(config.doorWidth, config.doorGlassHeight, i18next.t('cutting.panelDoor'));
  } else if (config.doorWidth && config.doorHeight) {
    addPanel(config.doorWidth, config.doorHeight - 10, i18next.t('cutting.panelDoor'));
  }
  if (config.fixedPanelLeftWidth && config.fixedPanelHeight) {
    addPanel(config.fixedPanelLeftWidth, config.fixedPanelHeight, i18next.t('cutting.panelFixedLeft'));
  }
  if (config.fixedPanelRightWidth && config.fixedPanelHeight) {
    addPanel(config.fixedPanelRightWidth, config.fixedPanelHeight, i18next.t('cutting.panelFixedRight'));
  }
  if (config.fixedPanelWidth && config.fixedPanelHeight && !config.fixedPanelLeftWidth) {
    addPanel(config.fixedPanelWidth, config.fixedPanelHeight, i18next.t('cutting.panelFixed'));
  }
  if (config.panels && Array.isArray(config.panels)) {
    config.panels.forEach((p: any, i: number) => {
      if (p.width && p.height) {
        addPanel(p.width, p.height, `P${i + 1}`);
      }
    });
  }
  if (!config.doorWidth && !config.finalGlassWidth && !config.panels && config.width && config.height) {
    addPanel(config.width, config.height, productType);
  }
  if (config.pieces && Array.isArray(config.pieces)) {
    config.pieces.forEach((p: any, i: number) => {
      if (p.width && p.height) {
        const pQty = p.quantity || 1;
        for (let q = 0; q < pQty; q++) {
          panels.push({ width: Math.round(p.width), height: Math.round(p.height), label: `${orderNum} #${i + 1}`, orderId });
        }
      }
    });
  }
}
