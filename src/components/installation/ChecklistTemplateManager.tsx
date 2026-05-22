import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, Wrench, Package, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useInstallationChecklists, type ChecklistItem } from '@/hooks/useInstallationChecklists';

const getCategoryConfig = (t: any) => ({
  tool: { label: t('installation.categoryTool'), icon: Wrench, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  material: { label: t('installation.categoryMaterial'), icon: Package, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  accessory: { label: t('installation.categoryAccessory'), icon: Settings2, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
});

export function ChecklistTemplateManager() {
  const { t } = useTranslation();
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useInstallationChecklists();
  const categoryConfig = getCategoryConfig(t);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [productType, setProductType] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState({ label: '', category: 'tool' as ChecklistItem['category'], required: true });

  const resetForm = () => {
    setName(''); setProductType(''); setItems([]); setEditingId(null);
    setNewItem({ label: '', category: 'tool', required: true });
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (tpl: typeof templates[0]) => {
    setEditingId(tpl.id);
    setName(tpl.name);
    setProductType(tpl.product_type || '');
    setItems(tpl.items);
    setDialogOpen(true);
  };

  const addItem = () => {
    if (!newItem.label.trim()) return;
    setItems(prev => [...prev, { ...newItem, label: newItem.label.trim() }]);
    setNewItem({ label: '', category: newItem.category, required: true });
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim() || items.length === 0) return;
    const payload = { name: name.trim(), product_type: productType || null, items };
    if (editingId) {
      await updateTemplate.mutateAsync({ id: editingId, ...payload });
    } else {
      await createTemplate.mutateAsync(payload);
    }
    setDialogOpen(false);
    resetForm();
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('installation.checklistTemplates')}</h3>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> {t('installation.newTemplate')}</Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t('installation.noTemplates')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(tpl => (
            <Card key={tpl.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{tpl.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(tpl)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('installation.deleteTemplate')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('installation.deleteTemplateConfirm', { name: tpl.name })}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTemplate.mutate(tpl.id)}>{t('common.delete')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {tpl.product_type && <Badge variant="outline" className="text-xs w-fit">{tpl.product_type}</Badge>}
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {tpl.items.slice(0, 5).map((item, i) => {
                    const cfg = categoryConfig[item.category];
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>{cfg.label}</Badge>
                        <span className="truncate">{item.label}</span>
                        {item.required && <span className="text-destructive text-xs">*</span>}
                      </div>
                    );
                  })}
                  {tpl.items.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{tpl.items.length - 5} itemi</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{tpl.items.length} itemi total</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('installation.editTemplate') : t('installation.newTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('installation.templateName')}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('installation.templateNamePlaceholder')} />
            </div>
            <div>
              <Label>{t('installation.productTypeOptional')}</Label>
              <Input value={productType} onChange={e => setProductType(e.target.value)} placeholder={t('installation.productTypePlaceholder')} />
            </div>

            <div className="border rounded-md p-3 space-y-3">
              <Label>{t('installation.addItem')}</Label>
              <div className="space-y-2">
                <Input value={newItem.label} onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))} placeholder={t('installation.itemNamePlaceholder')} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())} />
                <div className="flex gap-2 items-center">
                  <Select value={newItem.category} onValueChange={v => setNewItem(p => ({ ...p, category: v as ChecklistItem['category'] }))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tool">🔧 {t('installation.categoryTool')}</SelectItem>
                      <SelectItem value="material">📦 {t('installation.categoryMaterial')}</SelectItem>
                      <SelectItem value="accessory">⚙️ {t('installation.categoryAccessory')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5">
                    <Checkbox checked={newItem.required} onCheckedChange={c => setNewItem(p => ({ ...p, required: !!c }))} id="req" />
                    <Label htmlFor="req" className="text-xs">{t('installation.required')}</Label>
                  </div>
                  <Button type="button" size="sm" onClick={addItem}>+</Button>
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {items.map((item, i) => {
                  const cfg = categoryConfig[item.category];
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1.5">
                      <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color}`}>{cfg.label}</Badge>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.required && <span className="text-destructive text-xs font-medium">*</span>}
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSave} disabled={!name.trim() || items.length === 0 || createTemplate.isPending || updateTemplate.isPending}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
