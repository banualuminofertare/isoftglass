import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstallationChecklists, type ChecklistItem } from '@/hooks/useInstallationChecklists';

interface JobChecklistItem extends ChecklistItem {
  checked?: boolean;
}

interface InstallationChecklistProps {
  checklist: JobChecklistItem[];
  onUpdate: (checklist: JobChecklistItem[]) => void;
  onLoadTemplate?: (items: ChecklistItem[]) => void;
}

const getCategoryConfig = (t: (key: string) => string) => ({
  tool: { label: t('installation.categoryTool'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  material: { label: t('installation.categoryMaterial'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  accessory: { label: t('installation.categoryAccessory'), color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
});

export function InstallationChecklist({ checklist, onUpdate, onLoadTemplate }: InstallationChecklistProps) {
  const { t } = useTranslation();
  const { templates } = useInstallationChecklists();
  const [filter, setFilter] = useState<string>('all');

  const toggleItem = (idx: number) => {
    const updated = checklist.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item);
    onUpdate(updated);
  };

  const checkedCount = checklist.filter(i => i.checked).length;
  const progress = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  const filtered = filter === 'all' ? checklist : checklist.filter(i => i.category === filter);

  const handleTemplateSelect = (templateId: string) => {
    const tpl = templates.find(t => t.id === templateId);
    if (tpl && onLoadTemplate) {
      onLoadTemplate(tpl.items.map(item => ({ ...item, checked: false })));
    }
  };

  const categoryConfig = getCategoryConfig(t);

  return (
    <div className="space-y-3">
      {checklist.length === 0 && onLoadTemplate && templates.length > 0 && (
        <div className="border rounded-md p-3 space-y-2">
          <p className="text-sm text-muted-foreground">{t('installation.loadTemplate')}:</p>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder={t('installation.selectTemplate')} />
            </SelectTrigger>
            <SelectContent>
              {templates.map(tpl => (
                <SelectItem key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.items.length} {t('installation.itemsCount')})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {checklist.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{checkedCount}/{checklist.length}</span>
          </div>

          <div className="flex gap-1">
            {(['all', 'tool', 'material', 'accessory'] as const).map(cat => (
              <Button key={cat} variant={filter === cat ? 'default' : 'outline'} size="sm" className="text-xs h-7"
                onClick={() => setFilter(cat)}>
                {cat === 'all' ? t('installation.checklistAll') : categoryConfig[cat].label}
              </Button>
            ))}
          </div>

          <div className="space-y-1">
            {filtered.map((item, idx) => {
              const realIdx = checklist.indexOf(item);
              const cfg = categoryConfig[item.category] || categoryConfig.tool;
              return (
                <div key={realIdx} className={`flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors ${item.checked ? 'opacity-60' : ''}`}
                  onClick={() => toggleItem(realIdx)}>
                  {item.checked ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                  <span className={`text-sm flex-1 ${item.checked ? 'line-through' : ''}`}>{item.label}</span>
                  {item.required && !item.checked && <span className="text-destructive text-xs">*</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
