import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Package, Database, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { csvToArray } from './csvParser';
import { importTableData } from './importService';
import { TABLE_LABELS } from './constants';

interface ImportPreview {
  table: string;
  data: Record<string, unknown>[];
  columns: string[];
}

export function DataImportSection() {
  const { t } = useTranslation();
  const [importing, setImporting] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview[] | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingTable = useRef<string | null>(null);

  const openFilePicker = (table: string, accept: string) => {
    pendingTable.current = table;
    if (fileRef.current) {
      fileRef.current.accept = accept;
      fileRef.current.value = '';
      fileRef.current.click();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const table = pendingTable.current;
    if (!table) return;

    try {
      const text = await file.text();

      if (table === 'all') {
        const json = JSON.parse(text);
        const previews: ImportPreview[] = [];
        for (const tbl of ['clients', 'quotes', 'orders', 'materials']) {
          const arr = json[tbl];
          if (Array.isArray(arr) && arr.length > 0) {
            previews.push({ table: tbl, data: arr, columns: Object.keys(arr[0]) });
          }
        }
        if (previews.length === 0) {
          toast.error(t('settings.data.importInvalidJson'));
          return;
        }
        setPreview(previews);
      } else {
        const data = csvToArray(text, table);
        if (data.length === 0) {
          toast.error(t('settings.data.importInvalidCsv'));
          return;
        }
        setPreview([{ table, data, columns: Object.keys(data[0]) }]);
      }
      setShowDialog(true);
    } catch (err: any) {
      toast.error(t('settings.data.importFileError', { message: err.message || 'unknown' }));
    }
  };

  const confirmImport = async () => {
    if (!preview) return;
    setShowDialog(false);
    setImporting('running');

    try {
      let totalSuccess = 0;
      let totalErrors = 0;

      for (const p of preview) {
        const { success, errors } = await importTableData(p.table, p.data);
        totalSuccess += success;
        totalErrors += errors;
      }

      if (totalErrors > 0) {
        toast.warning(t('settings.data.importPartial', { success: totalSuccess, errors: totalErrors }));
      } else {
        toast.success(t('settings.data.importSuccess', { success: totalSuccess }));
      }
    } catch (err: any) {
      toast.error(t('settings.data.importError', { message: err.message || 'unknown' }));
    } finally {
      setImporting(null);
      setPreview(null);
    }
  };

  const isLoading = !!importing;
  const totalRecords = preview?.reduce((s, p) => s + p.data.length, 0) ?? 0;

  return (
    <>
      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('settings.data.importTitle')}
          </CardTitle>
          <CardDescription>
            {t('settings.data.importDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {t('settings.data.importWarning')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => openFilePicker('clients', '.csv')} disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              {t('settings.data.importClients')}
            </Button>
            <Button variant="outline" onClick={() => openFilePicker('quotes', '.csv')} disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              {t('settings.data.importQuotes')}
            </Button>
            <Button variant="outline" onClick={() => openFilePicker('orders', '.csv')} disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              {t('settings.data.importOrders')}
            </Button>
            <Button variant="outline" onClick={() => openFilePicker('materials', '.csv')} disabled={isLoading}>
              <Package className="h-4 w-4 mr-2" />
              {t('settings.data.importMaterials')}
            </Button>
            <Button onClick={() => openFilePicker('all', '.json')} disabled={isLoading} className="sm:col-span-2 lg:col-span-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              {t('settings.data.importAll')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.data.importPreviewTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.data.importPreviewDesc')}
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {preview.map(p => (
                <div key={p.table} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">{TABLE_LABELS[p.table] || p.table}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('settings.data.importRecords', { count: p.data.length })} · {t('settings.data.importColumns', { count: p.columns.length })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('settings.data.importColumnsLabel')}: {p.columns.slice(0, 5).join(', ')}{p.columns.length > 5 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t('settings.data.importCancel')}</Button>
            <Button onClick={confirmImport}>
              {t('settings.data.importConfirm', { count: totalRecords })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
