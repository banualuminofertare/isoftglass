import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Send, Trash2, Edit, Loader2, BookOpen, Package, Upload } from 'lucide-react';
import { CatalogBuilder } from '@/components/admin/CatalogBuilder';
import { CatalogTransferDialog } from '@/components/admin/CatalogTransferDialog';
import { PdfImportDialog } from '@/components/admin/PdfImportDialog';
import { PdfImportWithImagesDialog } from '@/components/admin/PdfImportWithImagesDialog';
import { ExcelImportDialog } from '@/components/admin/ExcelImportDialog';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

interface Catalog {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

function AdminCatalogsContent() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [transferCatalog, setTransferCatalog] = useState<Catalog | null>(null);

  // Create/Edit form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPricingIds, setSelectedPricingIds] = useState<string[]>([]);
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [existingItems, setExistingItems] = useState<any[]>([]);

  // Import state
  const importFileRef = useRef<HTMLInputElement>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState<{ name: string; description?: string; items: any[] }[] | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchCatalogs = async () => {
    setLoading(true);
    const { data: catalogsData } = await supabase
      .from('admin_catalogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (catalogsData) {
      // Get item counts
      const catalogIds = catalogsData.map(c => c.id);
      const { data: items } = await supabase
        .from('admin_catalog_items')
        .select('catalog_id')
        .in('catalog_id', catalogIds);

      const counts: Record<string, number> = {};
      items?.forEach(i => {
        counts[i.catalog_id] = (counts[i.catalog_id] || 0) + 1;
      });

      setCatalogs(
        catalogsData.map(c => ({ ...c, item_count: counts[c.id] || 0 }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedPricingIds([]);
    setSelectedPresetIds([]);
    setEditingCatalog(null);
    setShowCreate(false);
    setExistingItems([]);
  };

  const openEdit = async (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setName(catalog.name);
    setDescription(catalog.description || '');
    setShowCreate(true);

    // Load existing items
    const { data: items } = await supabase
      .from('admin_catalog_items')
      .select('*')
      .eq('catalog_id', catalog.id);

    if (items) {
      setExistingItems(items);
      setSelectedPricingIds(
        items.filter(i => i.item_type === 'pricing').map(i => (i.source_data as any).id).filter(Boolean)
      );
      setSelectedPresetIds(
        items.filter(i => i.item_type === 'preset').map(i => (i.source_data as any).id).filter(Boolean)
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('admin_catalog_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({ title: t('admin.catalogs.deleteError'), description: error.message, variant: 'destructive' });
      return;
    }
    setExistingItems(prev => prev.filter(i => i.id !== itemId));
    toast({ title: t('admin.catalogs.itemRemoved') });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: t('admin.catalogs.catalogNameRequired'), variant: 'destructive' });
      return;
    }

    const hasExisting = editingCatalog && existingItems.length > 0;
    const hasNew = selectedPricingIds.length > 0 || selectedPresetIds.length > 0;

    if (!hasExisting && !hasNew) {
      toast({ title: t('admin.catalogs.selectAtLeastOne'), variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      let catalogId: string;

      if (editingCatalog) {
        await supabase
          .from('admin_catalogs')
          .update({ name, description, updated_at: new Date().toISOString() })
          .eq('id', editingCatalog.id);
        catalogId = editingCatalog.id;
        // Don't delete existing items - they are managed individually via handleDeleteItem
      } else {
        const { data: newCatalog, error } = await supabase
          .from('admin_catalogs')
          .insert({ name, description, created_by: user!.id })
          .select()
          .single();

        if (error || !newCatalog) throw error || new Error('Failed to create catalog');
        catalogId = newCatalog.id;
      }

      // Only insert NEW items from CatalogBuilder (avoid duplicates with existing)
      const existingSourceIds = new Set(
        existingItems.map(i => (i.source_data as any)?.id).filter(Boolean)
      );

      if (selectedPricingIds.length > 0) {
        const newPricingIds = selectedPricingIds.filter(id => !existingSourceIds.has(id));
        if (newPricingIds.length > 0) {
          const { data: pricingData } = await supabase
            .from('pricing_config')
            .select('*')
            .in('id', newPricingIds);

          if (pricingData?.length) {
            await supabase.from('admin_catalog_items').insert(
              pricingData.map(p => ({
                catalog_id: catalogId,
                item_type: 'pricing',
                source_data: p,
              }))
            );
          }
        }
      }

      if (selectedPresetIds.length > 0) {
        const newPresetIds = selectedPresetIds.filter(id => !existingSourceIds.has(id));
        if (newPresetIds.length > 0) {
          const { data: presetData } = await supabase
            .from('user_accessory_presets')
            .select('*')
            .in('id', newPresetIds);

          if (presetData?.length) {
            await supabase.from('admin_catalog_items').insert(
              presetData.map(p => ({
                catalog_id: catalogId,
                item_type: 'preset',
                source_data: p,
              }))
            );
          }
        }
      }

      toast({ title: editingCatalog ? t('admin.catalogs.catalogUpdated') : t('admin.catalogs.catalogCreated') });
      resetForm();
      fetchCatalogs();
    } catch (err: any) {
      toast({ title: t('common.error'), description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.catalogs.deleteConfirm'))) return;
    await supabase.from('admin_catalogs').delete().eq('id', id);
    toast({ title: t('admin.catalogs.catalogDeleted') });
    fetchCatalogs();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const catalogs = Array.isArray(json) ? json : [json];
      
      for (const cat of catalogs) {
        if (!cat.name || !Array.isArray(cat.items) || cat.items.length === 0) {
          toast({ title: t('admin.catalogs.invalidFormat'), description: t('admin.catalogs.invalidFormatDesc'), variant: 'destructive' });
          return;
        }
      }
      setImportData(catalogs);
      setShowImportPreview(true);
    } catch (err: any) {
      toast({ title: t('admin.catalogs.fileReadError'), description: err.message, variant: 'destructive' });
    } finally {
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importData || !user) return;
    setImporting(true);
    try {
      for (const cat of importData) {
        const { data: newCatalog, error } = await supabase
          .from('admin_catalogs')
          .insert({ name: cat.name, description: cat.description || null, created_by: user.id })
          .select()
          .single();
        if (error || !newCatalog) throw error || new Error('Failed to create catalog');

        const BATCH = 100;
        for (let i = 0; i < cat.items.length; i += BATCH) {
          const batch = cat.items.slice(i, i + BATCH).map((item: any) => ({
            catalog_id: newCatalog.id,
            item_type: item.item_type || 'pricing',
            source_data: item.source_data || item,
          }));
          const { error: batchErr } = await supabase.from('admin_catalog_items').insert(batch);
          if (batchErr) console.error('Import batch error:', batchErr.message);
        }
      }
      toast({ title: t('admin.catalogs.importSuccess', { count: importData.length }) });
      setShowImportPreview(false);
      setImportData(null);
      fetchCatalogs();
    } catch (err: any) {
      toast({ title: t('admin.catalogs.importError'), description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    {t('admin.catalogs.title')}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('admin.catalogs.subtitle')}
                </p>
              </div>
              <div className="flex gap-2">
                <ExcelImportDialog onImported={fetchCatalogs} />
                <PdfImportDialog onImported={fetchCatalogs} />
                <PdfImportWithImagesDialog onImported={fetchCatalogs} />
                <Button variant="outline" onClick={() => importFileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('admin.catalogs.importJson')}
                </Button>
                <Button onClick={() => { resetForm(); setShowCreate(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.catalogs.newCatalog')}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : catalogs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium text-foreground">{t('admin.catalogs.noCatalogs')}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('admin.catalogs.noCatalogsDesc')}
                    </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {catalogs.map((catalog) => (
                  <Card key={catalog.id} className="group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{catalog.name}</CardTitle>
                          {catalog.description && (
                            <CardDescription className="mt-1 text-xs">
                              {catalog.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {catalog.item_count} {t('admin.catalogs.products')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground mb-3">
                        {t('admin.catalogs.created')}: {new Date(catalog.created_at).toLocaleDateString('ro-RO')}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => setTransferCatalog(catalog)}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          {t('admin.catalogs.transfer')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(catalog)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(catalog.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create/Edit Dialog */}
          <Dialog open={showCreate} onOpenChange={(v) => { if (!v) resetForm(); }}>
            <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCatalog ? t('admin.catalogs.editCatalog') : t('admin.catalogs.newCatalog')}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('admin.catalogs.catalogName')}</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('admin.catalogs.catalogNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.description')}</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('admin.catalogs.descriptionPlaceholder')}
                      rows={1}
                    />
                  </div>
                </div>

                {/* Existing items section - only when editing */}
                {editingCatalog && existingItems.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="text-base font-medium">{t('admin.catalogs.existingProducts')} ({existingItems.length})</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('admin.catalogs.existingProductsHint')}
                    </p>
                    <div className="max-h-[300px] overflow-y-auto border rounded-md divide-y">
                      {existingItems.map((item) => {
                        const sd = item.source_data as any;
                        return (
                          <div key={item.id} className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 group">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">{sd?.name || sd?.material_name || t('admin.catalogs.noName')}</span>
                              <span className="text-xs text-muted-foreground">{sd?.code || sd?.material_code || ''} · {item.item_type}</span>
                            </div>
                            {sd?.price != null && (
                              <span className="text-xs text-muted-foreground mr-3">{sd.price} {sd?.unit || 'RON'}</span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Label className="text-base font-medium">{t('admin.catalogs.addNewProducts')}</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('admin.catalogs.addNewProductsHint')}
                  </p>
                  <CatalogBuilder
                    selectedPricingIds={selectedPricingIds}
                    selectedPresetIds={selectedPresetIds}
                    onPricingChange={setSelectedPricingIds}
                    onPresetChange={setSelectedPresetIds}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingCatalog ? t('common.save') : t('admin.catalogs.saveCatalog')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Hidden file input for import */}
          <input ref={importFileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />

          {/* Import Preview Dialog */}
          <Dialog open={showImportPreview} onOpenChange={(v) => { if (!v) { setShowImportPreview(false); setImportData(null); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.catalogs.importPreview')}</DialogTitle>
                <DialogDescription>{t('admin.catalogs.importPreviewDesc')}</DialogDescription>
              </DialogHeader>
              {importData && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {importData.map((cat, idx) => {
                    const typeCounts: Record<string, number> = {};
                    cat.items.forEach((i: any) => {
                      const t = i.item_type || 'pricing';
                      typeCounts[t] = (typeCounts[t] || 0) + 1;
                    });
                    return (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">{cat.name}</p>
                        {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {cat.items.length} produse · {Object.entries(typeCounts).map(([t, c]) => `${c} ${t}`).join(', ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowImportPreview(false); setImportData(null); }}>{t('common.cancel')}</Button>
                <Button onClick={confirmImport} disabled={importing}>
                  {importing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t('admin.catalogs.importCatalogs', { count: importData?.length })}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Transfer Dialog */}
          {transferCatalog && (
            <CatalogTransferDialog
              open={!!transferCatalog}
              onOpenChange={(v) => { if (!v) setTransferCatalog(null); }}
              catalogId={transferCatalog.id}
              catalogName={transferCatalog.name}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function AdminCatalogs() {
  return (
    <ProtectedRoute adminOnly>
      <AdminCatalogsContent />
    </ProtectedRoute>
  );
}
