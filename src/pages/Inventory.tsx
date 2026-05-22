import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Search, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Layers, Wrench, Droplets, ChevronDown, X } from 'lucide-react';
import { MonthlyConsumptionReport } from '@/components/inventory/MonthlyConsumptionReport';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useMaterials, useStockMovements, type Material, type MaterialType, type UnitType } from '@/hooks/useMaterials';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ro, enUS, de, it, pl, fr, es, nl, hr } from 'date-fns/locale';

const MATERIAL_TYPE_ICONS: Record<MaterialType, typeof Layers> = {
  glass: Layers,
  hardware: Wrench,
  consumable: Droplets,
};

export default function Inventory() {
  const { t, i18n } = useTranslation();
  const { materials, lowStockMaterials, isLoading, createMaterial, updateMaterial, adjustStock } = useMaterials();
  const { movements } = useStockMovements();
  const { formatPrice, currencyLabel } = useCurrency();

  const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
    glass: t('stockCategories.glass'),
    hardware: t('stockCategories.hardware'),
    consumable: t('stockCategories.consumable'),
  };
  const UNIT_LABELS: Record<UnitType, string> = {
    sqm: 'm²', lm: 'ml', pcs: t('common.pieces'), kg: 'kg', l: 'l',
  };
  const dateFnsLocales: Record<string, typeof ro> = { ro, en: enUS, de, it, pl, fr, es, nl, hr };
  const currentLocale = dateFnsLocales[i18n.language] || ro;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaterialType | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState("materials");
  const tabsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    material_type: 'glass' as MaterialType,
    unit: 'sqm' as UnitType,
    unit_price: 0,
    stock_quantity: 0,
    min_stock_level: 0,
    location: '',
    supplier: '',
  });

  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    notes: '',
  });

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || material.material_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMaterial.mutateAsync(formData);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      material_type: 'glass',
      unit: 'sqm',
      unit_price: 0,
      stock_quantity: 0,
      min_stock_level: 0,
      location: '',
      supplier: '',
    });
  };

  const handleStockAdjust = async () => {
    if (!selectedMaterial) return;
    await adjustStock.mutateAsync({
      materialId: selectedMaterial.id,
      quantity: stockAdjustment.quantity,
      type: stockAdjustment.type,
      notes: stockAdjustment.notes,
    });
    setIsStockDialogOpen(false);
    setStockAdjustment({ type: 'in', quantity: 0, notes: '' });
  };

  const openStockDialog = (material: Material) => {
    setSelectedMaterial(material);
    setStockAdjustment({ type: 'in', quantity: 0, notes: '' });
    setIsStockDialogOpen(true);
  };

  return (
    <AppLayout title={t('inventory.title')}>
      <div className="space-y-6">
        {/* Low Stock Alert */}
        {lowStockMaterials.length > 0 && !isAlertDismissed && (() => {
          const groupedLowStock = lowStockMaterials.reduce((acc, mat) => {
            const type = mat.material_type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(mat);
            return acc;
          }, {} as Record<string, typeof lowStockMaterials>);
          const useGroups = lowStockMaterials.length > 3;

          const renderMaterialRow = (material: Material) => (
            <div key={material.id} className="flex items-center justify-between gap-4 py-2 px-3 rounded-md bg-background/60">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs text-muted-foreground shrink-0">{material.code}</span>
                <span className="text-sm font-medium truncate">{material.name}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm tabular-nums">
                  <span className="text-orange-500 font-medium">{material.stock_quantity?.toFixed(2)}</span>
                  <span className="text-muted-foreground"> / {material.min_stock_level} {UNIT_LABELS[material.unit]}</span>
                </span>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openStockDialog(material)}>
                  {t('inventory.adjust')}
                </Button>
              </div>
            </div>
          );

          return (
            <Card className="border-orange-500/50 bg-orange-500/5">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                  <CardTitle className="text-base font-semibold text-orange-500">{t('inventory.minStockReached')}</CardTitle>
                  <Badge variant="destructive" className="ml-auto">{lowStockMaterials.length}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setIsAlertDismissed(true)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4 space-y-2">
                {useGroups ? (
                  Object.entries(groupedLowStock).map(([type, mats]) => {
                    const label = MATERIAL_TYPE_LABELS[type as MaterialType];
                    const Icon = MATERIAL_TYPE_ICONS[type as MaterialType];
                    return (
                      <Collapsible key={type} defaultOpen>
                        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors group">
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{label}</span>
                          <Badge variant="outline" className="ml-auto text-xs">{mats.length}</Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 space-y-1 mt-1">
                          {mats.map(renderMaterialRow)}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                ) : (
                  <div className="space-y-1">
                    {lowStockMaterials.map(renderMaterialRow)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('inventory.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MaterialType | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('inventory.materialType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="glass">{t('stockCategories.glass')}</SelectItem>
                <SelectItem value="hardware">{t('stockCategories.hardware')}</SelectItem>
                <SelectItem value="consumable">{t('stockCategories.consumable')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <MonthlyConsumptionReport />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('inventory.newMaterial')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{t('inventory.newMaterial')}</DialogTitle>
                <DialogDescription className="sr-only">{t('inventory.newMaterial')}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('inventory.code')} *</Label>
                    <Input
                      required
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="ex: STK-6MM-CLR"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.name')} *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ex: Sticlă 6mm Clear"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.materialType')}</Label>
                    <Select
                      value={formData.material_type}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, material_type: v as MaterialType }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glass">{t('stockCategories.glass')}</SelectItem>
                        <SelectItem value="hardware">{t('stockCategories.hardware')}</SelectItem>
                        <SelectItem value="consumable">{t('stockCategories.consumable')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.unit')}</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v as UnitType }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqm">{t('inventory.sqm')}</SelectItem>
                        <SelectItem value="lm">{t('inventory.lm')}</SelectItem>
                        <SelectItem value="pcs">{t('inventory.pcs')}</SelectItem>
                        <SelectItem value="kg">{t('inventory.kg')}</SelectItem>
                        <SelectItem value="l">{t('inventory.l')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.unitPrice', { currency: currencyLabel })}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.initialStock')}</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('inventory.minStock')}</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_stock_level: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.location')}</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="ex: Depozit A - Raft 3"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>{t('common.supplier')}</Label>
                    <Input
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMaterial.isPending}>
                    {t('inventory.createMaterial')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card
            className={cn("cursor-pointer transition-colors border-2 hover:border-amber-500/50", typeFilter === 'all' && "border-amber-500")}
            onClick={() => { setTypeFilter('all'); setActiveTab("materials"); setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{materials.length}</p>
                  <p className="text-xs text-muted-foreground">{t('inventory.totalMaterials')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn("cursor-pointer transition-colors border-2 hover:border-blue-500/50", typeFilter === 'glass' && "border-blue-500")}
            onClick={() => { setTypeFilter('glass'); setActiveTab("materials"); setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{materials.filter(m => m.material_type === 'glass').length}</p>
                  <p className="text-xs text-muted-foreground">{t('inventory.glassTypes')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn("cursor-pointer transition-colors border-2 hover:border-green-500/50", typeFilter === 'hardware' && "border-green-500")}
            onClick={() => { setTypeFilter('hardware'); setActiveTab("materials"); setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{materials.filter(m => m.material_type === 'hardware').length}</p>
                  <p className="text-xs text-muted-foreground">{t('stockCategories.hardware')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn("cursor-pointer transition-colors border-2 hover:border-violet-500/50", typeFilter === 'consumable' && "border-violet-500")}
            onClick={() => { setTypeFilter('consumable'); setActiveTab("materials"); setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-2xl font-bold">{materials.filter(m => m.material_type === 'consumable').length}</p>
                  <p className="text-xs text-muted-foreground">{t('stockCategories.consumable')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn("cursor-pointer transition-colors border-2 border-red-500 hover:border-red-500/50")}
            onClick={() => { if (lowStockMaterials.length > 0 && isAlertDismissed) setIsAlertDismissed(false); setTypeFilter('all'); setActiveTab("materials"); setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("h-5 w-5 text-red-500", lowStockMaterials.length > 0 && "animate-pulse")} />
                <div>
                  <p className="text-2xl font-bold">{lowStockMaterials.length}</p>
                  <p className="text-xs text-muted-foreground">{t('inventory.minStock')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} ref={tabsRef}>
          <TabsList>
            <TabsTrigger value="materials">{t('inventory.materials')}</TabsTrigger>
            <TabsTrigger value="movements">{t('inventory.stockMovements')}</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <Card>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
                ) : filteredMaterials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {materials.length === 0 ? t('inventory.noMaterialsYet') : t('common.noResults')}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('inventory.code')}</TableHead>
                        <TableHead>{t('inventory.material')}</TableHead>
                        <TableHead>{t('common.type')}</TableHead>
                        <TableHead className="text-right">{t('inventory.stock')}</TableHead>
                        <TableHead className="text-right">{t('common.price')}</TableHead>
                        <TableHead>{t('common.location')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMaterials.map((material) => {
                        const isLowStock = material.stock_quantity !== undefined && 
                                          material.min_stock_level !== undefined && 
                                          material.stock_quantity <= material.min_stock_level;
                        const label = MATERIAL_TYPE_LABELS[material.material_type];
                        const Icon = MATERIAL_TYPE_ICONS[material.material_type];
                        
                        return (
                          <TableRow key={material.id}>
                            <TableCell className="font-mono text-sm">{material.code}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{material.name}</p>
                                {material.supplier && (
                                  <p className="text-xs text-muted-foreground">{material.supplier}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1">
                                <Icon className="h-3 w-3" />
                                {label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className={cn("font-medium", isLowStock && "text-orange-500")}>
                                {material.stock_quantity?.toFixed(2)} {UNIT_LABELS[material.unit]}
                                {isLowStock && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                              </div>
                              <p className="text-xs text-muted-foreground">min: {material.min_stock_level}</p>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPrice(material.unit_price || 0)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {material.location || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => openStockDialog(material)}>
                                {t('inventory.adjustStock')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('inventory.material')}</TableHead>
                      <TableHead>{t('common.type')}</TableHead>
                      <TableHead className="text-right">{t('common.quantity')}</TableHead>
                      <TableHead>{t('common.notes')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">
                          {format(new Date(movement.created_at), 'dd MMM yyyy HH:mm', { locale: currentLocale })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.materials?.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{movement.materials?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={movement.movement_type === 'in' ? 'default' : movement.movement_type === 'out' ? 'destructive' : 'secondary'}>
                            {movement.movement_type === 'in' && <ArrowDownToLine className="h-3 w-3 mr-1" />}
                            {movement.movement_type === 'out' && <ArrowUpFromLine className="h-3 w-3 mr-1" />}
                            {movement.movement_type === 'in' ? t('inventory.entry') : movement.movement_type === 'out' ? t('inventory.exit') : t('inventory.adjustment')}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          movement.movement_type === 'in' ? "text-green-600" : movement.movement_type === 'out' ? "text-red-600" : ""
                        )}>
                          {movement.movement_type === 'in' ? '+' : movement.movement_type === 'out' ? '-' : ''}
                          {Math.abs(movement.quantity).toFixed(3)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {movement.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stock Adjustment Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('inventory.adjustStock')}: {selectedMaterial?.name}</DialogTitle>
              <DialogDescription className="sr-only">{t('inventory.adjustStock')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t('inventory.currentStock')}</p>
                <p className="text-2xl font-bold">
                  {selectedMaterial?.stock_quantity?.toFixed(2)} {selectedMaterial && UNIT_LABELS[selectedMaterial.unit]}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={stockAdjustment.type === 'in' ? 'default' : 'outline'}
                  onClick={() => setStockAdjustment(prev => ({ ...prev, type: 'in' }))}
                  className="gap-1"
                >
                  <ArrowDownToLine className="h-4 w-4" />
                  {t('inventory.entry')}
                </Button>
                <Button
                  type="button"
                  variant={stockAdjustment.type === 'out' ? 'default' : 'outline'}
                  onClick={() => setStockAdjustment(prev => ({ ...prev, type: 'out' }))}
                  className="gap-1"
                >
                  <ArrowUpFromLine className="h-4 w-4" />
                  {t('inventory.exit')}
                </Button>
                <Button
                  type="button"
                  variant={stockAdjustment.type === 'adjustment' ? 'default' : 'outline'}
                  onClick={() => setStockAdjustment(prev => ({ ...prev, type: 'adjustment' }))}
                >
                  {t('inventory.adjustment')}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>
                  {stockAdjustment.type === 'adjustment' ? t('inventory.newStock') : t('common.quantity')}
                </Label>
                <Input
                  type="number"
                  step="0.001"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('common.notes')}</Label>
                <Textarea
                  value={stockAdjustment.notes}
                  onChange={(e) => setStockAdjustment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('inventory.stockNotePlaceholder')}
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleStockAdjust} disabled={adjustStock.isPending}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
