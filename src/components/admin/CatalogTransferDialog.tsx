import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Send, Package, Replace, Search, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CatalogTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogId: string;
  catalogName: string;
}

type TransferMode = 'pricing' | 'kit' | 'replace';

const PRODUCT_TYPE_KEYS = ['cabin', 'partition', 'sliding', 'balustrade', 'canopy', 'mirror'] as const;

const REPLACE_CATEGORY_KEYS = ['glass', 'accessories', 'processing', 'labor', 'finishing', 'kits'] as const;
type ReplaceCategory = typeof REPLACE_CATEGORY_KEYS[number];

export function CatalogTransferDialog({
  open,
  onOpenChange,
  catalogId,
  catalogName,
}: CatalogTransferDialogProps) {
  const { t } = useTranslation();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [targetUserId, setTargetUserId] = useState('');
  const [overwrite, setOverwrite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode>('pricing');
  const [kitName, setKitName] = useState('');
  const [kitCode, setKitCode] = useState('');
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState('');

  // Replace mode state
  const [replaceCategories, setReplaceCategories] = useState<Set<ReplaceCategory>>(new Set(REPLACE_CATEGORY_KEYS));
  const [hideGlobal, setHideGlobal] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTransferMode('pricing');
    setKitName(catalogName);
    setKitCode(catalogName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''));
    setSelectedProductTypes([]);
    setTargetUserId('');
    setItemSearch('');
    setReplaceCategories(new Set(REPLACE_CATEGORY_KEYS));
    setHideGlobal(true);

    const fetchData = async () => {
      setFetching(true);

      const [subsRes, itemsRes] = await Promise.all([
        (async () => {
          const { data } = await supabase
            .from('profiles')
            .select('user_id, full_name, company_name')
            .eq('is_approved', true)
            .order('full_name');
          const { data: adminRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');
          const adminIds = new Set(adminRoles?.map(r => r.user_id) || []);
          return (data || []).filter(p => !adminIds.has(p.user_id));
        })(),
        supabase
          .from('admin_catalog_items')
          .select('id, item_type, source_data')
          .eq('catalog_id', catalogId),
      ]);

      setSubscribers(subsRes);
      const items = itemsRes.data || [];
      setCatalogItems(items);
      setSelectedItemIds(new Set(items.map(i => i.id)));
      setFetching(false);
    };
    fetchData();
  }, [open, catalogName, catalogId]);

  const filteredItems = useMemo(() => {
    if (!itemSearch) return catalogItems;
    const q = itemSearch.toLowerCase();
    return catalogItems.filter(item => {
      const src = item.source_data as Record<string, unknown>;
      const name = ((src.name as string) || (src.material_name as string) || '').toLowerCase();
      const code = ((src.code as string) || (src.material_code as string) || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [catalogItems, itemSearch]);

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const visibleIds = filteredItems.map(i => i.id);
    const allSelected = visibleIds.every(id => selectedItemIds.has(id));
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      visibleIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const toggleProductType = (value: string) => {
    setSelectedProductTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleReplaceCategory = (cat: ReplaceCategory) => {
    setReplaceCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const handleTransfer = async () => {
    if (!targetUserId) {
      toast({ title: t('admin.catalogTransfer.selectSubscriberError'), variant: 'destructive' });
      return;
    }

    if (transferMode === 'replace') {
      if (replaceCategories.size === 0) {
        toast({ title: t('admin.catalogTransfer.selectCategoryError'), variant: 'destructive' });
        return;
      }
      setConfirmOpen(true);
      return;
    }

    if (selectedItemIds.size === 0) {
      toast({ title: t('admin.catalogTransfer.selectProductError'), variant: 'destructive' });
      return;
    }
    if (transferMode === 'kit' && (!kitName.trim() || !kitCode.trim())) {
      toast({ title: t('admin.catalogTransfer.fillKitFields'), variant: 'destructive' });
      return;
    }

    await executeTransfer();
  };

  const executeTransfer = async () => {
    setLoading(true);
    setConfirmOpen(false);
    try {
      const body: Record<string, unknown> = {
        catalog_id: catalogId,
        target_user_id: targetUserId,
        overwrite,
        transfer_mode: transferMode,
      };

      if (transferMode === 'replace') {
        body.replace_categories = Array.from(replaceCategories);
        body.hide_global = hideGlobal;
        body.item_ids = Array.from(selectedItemIds);
      } else {
        body.item_ids = Array.from(selectedItemIds);
        if (transferMode === 'kit') {
          body.kit_name = kitName.trim();
          body.kit_code = kitCode.trim();
          body.product_types = selectedProductTypes;
        }
      }

      const response = await supabase.functions.invoke('transfer-catalog', { body });

      if (response.error) throw new Error(response.error.message);

      const result = response.data;
      if (transferMode === 'replace') {
        toast({
          title: t('admin.catalogTransfer.replaceSuccess'),
          description: t('admin.catalogTransfer.replaceSuccessDesc', {
            deleted: result.deleted_pricing + result.deleted_kits,
            inserted: result.inserted_count,
          }),
        });
      } else if (transferMode === 'kit') {
        toast({
          title: t('admin.catalogTransfer.kitCreated'),
          description: t('admin.catalogTransfer.kitCreatedDesc', {
            name: kitName,
            count: result.items_count,
          }),
        });
      } else {
        toast({
          title: t('admin.catalogTransfer.catalogTransferred'),
          description: t('admin.catalogTransfer.catalogTransferredDesc', {
            pricing: result.pricing_copied,
            presets: result.presets_copied,
          }),
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: t('admin.catalogTransfer.transferError'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSubscriber = subscribers.find(s => s.user_id === targetUserId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('admin.catalogTransfer.title', { name: catalogName })}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1">
            {/* Subscriber selector */}
            <div className="space-y-2">
              <Label>{t('admin.catalogTransfer.selectSubscriber')}</Label>
              {fetching ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('admin.catalogTransfer.loading')}
                </div>
              ) : (
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.catalogTransfer.chooseSubscriber')} />
                  </SelectTrigger>
                  <SelectContent>
                    {subscribers.map((sub) => (
                      <SelectItem key={sub.user_id} value={sub.user_id}>
                        {sub.full_name || t('admin.catalogTransfer.noName')} {sub.company_name ? `(${sub.company_name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Transfer mode selector */}
            <div className="space-y-2">
              <Label>{t('admin.catalogTransfer.transferType')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={transferMode === 'pricing' ? 'default' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => setTransferMode('pricing')}
                  size="sm"
                >
                  <Package className="h-4 w-4" />
                  {t('admin.catalogTransfer.accessories')}
                </Button>
                <Button
                  type="button"
                  variant={transferMode === 'kit' ? 'default' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => setTransferMode('kit')}
                  size="sm"
                >
                  <Package className="h-4 w-4" />
                  {t('admin.catalogTransfer.accessoryKit')}
                </Button>
                <Button
                  type="button"
                  variant={transferMode === 'replace' ? 'destructive' : 'outline'}
                  className="justify-start gap-2"
                  onClick={() => setTransferMode('replace')}
                  size="sm"
                >
                  <Replace className="h-4 w-4" />
                  {t('admin.catalogTransfer.replaceAll')}
                </Button>
              </div>
            </div>

            {/* Replace mode options */}
            {transferMode === 'replace' && (
              <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('admin.catalogTransfer.replaceCategories')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {REPLACE_CATEGORY_KEYS.map(cat => (
                      <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={replaceCategories.has(cat)}
                          onCheckedChange={() => toggleReplaceCategory(cat)}
                        />
                        {t(`admin.catalogTransfer.categoryLabels.${cat}`)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor="hide-global" className="text-sm">
                    {t('admin.catalogTransfer.hideGlobalCatalog')}
                  </Label>
                  <Switch id="hide-global" checked={hideGlobal} onCheckedChange={setHideGlobal} />
                </div>

                <div className="flex items-start gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {t('admin.catalogTransfer.replaceWarning')}
                </div>
              </div>
            )}

            {/* Item selection (visible for all modes) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('admin.catalogTransfer.catalogProducts')}</Label>
                <Badge variant="secondary" className="text-xs">
                  {selectedItemIds.size}/{catalogItems.length} {t('admin.catalogTransfer.selected')}
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t('admin.catalogTransfer.search')}
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 cursor-pointer text-sm font-medium">
                  <Checkbox
                    checked={filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.has(i.id))}
                    onCheckedChange={toggleAll}
                  />
                  {t('admin.catalogTransfer.selectAll')}
                </label>
                {filteredItems.map((item) => {
                  const src = item.source_data as Record<string, unknown>;
                  const name = (src.name as string) || (src.material_name as string) || 'N/A';
                  const code = (src.code as string) || (src.material_code as string) || '';
                  const price = src.price != null ? `${src.price}` : '';
                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 cursor-pointer text-sm border-b last:border-0"
                    >
                      <Checkbox
                        checked={selectedItemIds.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <span className="font-mono text-xs text-muted-foreground w-20 truncate">{code}</span>
                      <span className="flex-1 truncate">{name}</span>
                      {price && <span className="text-xs text-muted-foreground">{price}</span>}
                    </label>
                  );
                })}
                {filteredItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-3">{t('admin.catalogTransfer.noProducts')}</p>
                )}
              </div>
            </div>

            {/* Kit-specific fields */}
            {transferMode === 'kit' && (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="kit-name">{t('admin.catalogTransfer.kitName')}</Label>
                  <Input
                    id="kit-name"
                    value={kitName}
                    onChange={(e) => setKitName(e.target.value)}
                    placeholder={t('admin.catalogTransfer.kitNamePlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kit-code">{t('admin.catalogTransfer.kitCode')}</Label>
                  <Input
                    id="kit-code"
                    value={kitCode}
                    onChange={(e) => setKitCode(e.target.value)}
                    placeholder={t('admin.catalogTransfer.kitCodePlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('admin.catalogTransfer.productTypes')}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRODUCT_TYPE_KEYS.map(key => (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant={selectedProductTypes.includes(key) ? 'default' : 'outline'}
                        className="h-7 text-xs"
                        onClick={() => toggleProductType(key)}
                      >
                        {t(`admin.catalogTransfer.productTypeLabels.${key}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Overwrite toggle (only for pricing mode) */}
            {transferMode === 'pricing' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="overwrite">{t('admin.catalogTransfer.overwritePrices')}</Label>
                <Switch id="overwrite" checked={overwrite} onCheckedChange={setOverwrite} />
              </div>
            )}

            {/* Summary */}
            {selectedSubscriber && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                {transferMode === 'replace' ? (
                  <>
                    <p>
                      {t('admin.catalogTransfer.replaceSummary', {
                        categories: replaceCategories.size,
                        name: selectedSubscriber.full_name || t('admin.catalogTransfer.noName'),
                      })}
                    </p>
                    {hideGlobal && (
                      <p className="text-destructive mt-1 text-xs">
                        ⚠️ {t('admin.catalogTransfer.hideGlobalNote')}
                      </p>
                    )}
                  </>
                ) : transferMode === 'pricing' ? (
                  <>
                    <p>
                      {t('admin.catalogTransfer.copyProducts')} <strong>{selectedItemIds.size}</strong> {t('admin.catalogTransfer.productsTo')}{' '}
                      <strong>{selectedSubscriber.full_name || t('admin.catalogTransfer.noName')}</strong>
                      {selectedSubscriber.company_name && <> ({selectedSubscriber.company_name})</>}.
                    </p>
                    {overwrite && (
                      <p className="text-destructive mt-1 text-xs">
                        {t('admin.catalogTransfer.overwriteWarning')}
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    {t('admin.catalogTransfer.createKit')} <strong>{kitName || '...'}</strong> (cod: <strong>{kitCode || '...'}</strong>) {t('admin.catalogTransfer.onAccount')}{' '}
                    <strong>{selectedSubscriber.full_name || t('admin.catalogTransfer.noName')}</strong>
                    {selectedSubscriber.company_name && <> ({selectedSubscriber.company_name})</>}
                    {' '}{t('admin.catalogTransfer.withComponents')} <strong>{selectedItemIds.size}</strong> {t('admin.catalogTransfer.components')}.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={loading || !targetUserId || (transferMode !== 'replace' && selectedItemIds.size === 0)}
              variant={transferMode === 'replace' ? 'destructive' : 'default'}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : transferMode === 'replace' ? (
                <Replace className="h-4 w-4 mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {transferMode === 'replace'
                ? t('admin.catalogTransfer.replaceBtn')
                : `${t('admin.catalogTransfer.transferBtn')} (${selectedItemIds.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for replace mode */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.catalogTransfer.confirmReplaceTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.catalogTransfer.confirmReplaceDesc', {
                categories: replaceCategories.size,
                name: selectedSubscriber?.full_name || '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeTransfer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('admin.catalogTransfer.confirmReplaceBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
