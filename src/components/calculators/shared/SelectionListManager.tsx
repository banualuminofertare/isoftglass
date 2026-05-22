import { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { SelectedProductCard } from './SelectedProductCard';
import type { CatalogCategory } from '@/hooks/useCatalogAccessories';
import { useTranslation } from 'react-i18next';

interface SelectionItem {
  materialCode: string;
  name?: string;
  length?: number;
}

interface SelectionListManagerProps {
  items: SelectionItem[];
  category: CatalogCategory;
  onRemove: (index: number) => void;
  onLengthChange?: (index: number, length: number) => void;
  /** Return true for items that should show length input */
  showLength?: (item: SelectionItem) => boolean;
  label?: string;
}

export function SelectionListManager({
  items, category, onRemove, onLengthChange, showLength, label,
}: SelectionListManagerProps) {
  const { t } = useTranslation();
  const [deleteSet, setDeleteSet] = useState<Set<number>>(new Set());

  const toggleIndex = useCallback((idx: number) => {
    setDeleteSet(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setDeleteSet(prev =>
      prev.size === items.length
        ? new Set()
        : new Set(items.map((_, i) => i))
    );
  }, [items.length]);

  const handleBulkDelete = useCallback(() => {
    // Remove from highest index first to avoid shifting
    const sorted = [...deleteSet].sort((a, b) => b - a);
    sorted.forEach(idx => onRemove(idx));
    setDeleteSet(new Set());
  }, [deleteSet, onRemove]);

  if (items.length === 0) return null;

  const showBulk = items.length >= 2;
  const allSelected = deleteSet.size === items.length;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-xs text-muted-foreground">
          {label} ({items.length} buc)
        </Label>
      )}
      {showBulk && (
        <div className="flex items-center justify-between py-1.5 px-2 bg-muted/30 rounded">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="h-3.5 w-3.5"
            />
            <span className="text-xs text-muted-foreground">{t('calc.selectAll')}</span>
          </div>
          {deleteSet.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-6 text-xs px-2 gap-1"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-3 w-3" />
              {t('calc.deleteSelected', { count: deleteSet.size })}
            </Button>
          )}
        </div>
      )}
      {items.map((sel, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          {showBulk && (
            <Checkbox
              checked={deleteSet.has(idx)}
              onCheckedChange={() => toggleIndex(idx)}
              className="h-3.5 w-3.5 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <SelectedProductCard
              materialCode={sel.materialCode}
              category={category}
              name={sel.name}
              onRemove={() => {
                onRemove(idx);
                setDeleteSet(prev => {
                  const next = new Set<number>();
                  prev.forEach(i => {
                    if (i < idx) next.add(i);
                    else if (i > idx) next.add(i - 1);
                  });
                  return next;
                });
              }}
              length={showLength?.(sel) ? sel.length : undefined}
              onLengthChange={showLength?.(sel) && onLengthChange ? (len) => onLengthChange(idx, len) : undefined}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
