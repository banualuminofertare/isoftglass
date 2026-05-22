import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTranslation } from 'react-i18next';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProcessingTemplates, type ProcessingTemplate } from '@/hooks/useProcessingTemplates';
import { ProcessingTemplateCard } from '@/components/processing/ProcessingTemplateCard';
import { ProcessingTemplateForm } from '@/components/processing/ProcessingTemplateForm';
import { OrderProcessingSheet } from '@/components/processing/OrderProcessingSheet';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Processing() {
  const { t } = useTranslation();

  const TYPE_OPTIONS = [
    { value: 'all', label: t('processing.allTypes') },
    { value: 'hinge_cutout', label: t('processing.types.hingeCutout') },
    { value: 'handle_hole', label: t('processing.types.handleHole') },
    { value: 'lock_cutout', label: t('processing.types.lockCutout') },
    { value: 'socket_cutout', label: t('processing.types.socketCutout') },
    { value: 'ventilation_hole', label: t('processing.types.ventilationHole') },
    { value: 'shelf_support_hole', label: t('processing.types.shelfSupportHole') },
    { value: 'custom', label: t('processing.types.custom') },
    { value: 'other', label: t('processing.types.other') },
  ];
  const { isAdmin } = usePermissions();
  const { companyId: userCompanyId, user } = useAuth();
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useProcessingTemplates();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessingTemplate | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState<string>('all'); // 'all' | 'global' | company_id

  const sourceOptions = (() => {
    if (!isAdmin) return [];
    const companies = new Map<string, string>();
    templates.forEach(t => {
      if (t.company_id) companies.set(t.company_id, t.company_name || t.company_id.slice(0, 8));
    });
    return Array.from(companies.entries()).map(([id, name]) => ({ value: id, label: name }));
  })();

  const filtered = templates.filter(t => {
    if (filterType !== 'all' && t.template_type !== filterType) return false;
    if (isAdmin && filterSource !== 'all') {
      if (filterSource === 'global') return !t.company_id;
      return t.company_id === filterSource;
    }
    return true;
  });

  const handleSubmit = (data: Omit<ProcessingTemplate, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'company_id'>) => {
    if (editing) {
      updateTemplate.mutate({ id: editing.id, ...data });
    } else {
      createTemplate.mutate(data);
    }
    setEditing(null);
  };

  const handleEdit = (t: ProcessingTemplate) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('ui.confirmDeleteTemplate'))) {
      deleteTemplate.mutate(id);
    }
  };

  

  const canEditTemplate = (tmpl: ProcessingTemplate) => {
    if (isAdmin) return true;
    // Users can edit their own templates (by user_id) or their company's templates
    if (tmpl.user_id === user?.id) return true;
    return tmpl.company_id != null && tmpl.company_id === userCompanyId;
  };

  return (
    <AppLayout title={t('nav.processing')}>
      <Tabs defaultValue="sheet" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sheet">{t('processing.processingSheet')}</TabsTrigger>
          <TabsTrigger value="templates">{t('processing.templates')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sheet">
          <OrderProcessingSheet />
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAdmin && (
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toate sursele</SelectItem>
                      <SelectItem value="global">Doar globale</SelectItem>
                      {sourceOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> {t('processing.newTemplate')}
              </Button>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('processing.noTemplates')}{filterType !== 'all' ? ` ${t('processing.forThisType')}` : ''}.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(t => (
                  <ProcessingTemplateCard
                    key={t.id}
                    template={t}
                    canEdit={canEditTemplate(t)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ProcessingTemplateForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </AppLayout>
  );
}
