import { useState, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Shield, Server, Clock, Database, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { DataImportSection } from './import/DataImportSection';
import { HEADER_MAPS, TABLE_CONFIGS } from './dataExportConstants';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

async function fetchAll(table: string, cols: string, orderBy = 'created_at'): Promise<Record<string, unknown>[]> {
  let allData: Record<string, unknown>[] = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error } = await (supabase.from(table as any).select(cols) as any)
      .order(orderBy, { ascending: false })
      .range(from, from + batchSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allData.push(...(data as Record<string, unknown>[]));
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return allData;
}

function arrayToCSV(data: Record<string, unknown>[], headerMap?: Record<string, string>): string {
  if (!data.length) return '';
  const keys = headerMap ? Object.keys(headerMap) : Object.keys(data[0]);
  const headers = keys.map(k => headerMap?.[k] ?? k);
  const rows = data.map(row =>
    keys.map(h => {
      const val = row[h] ?? '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export const DataExportSection = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState<string | null>(null);

  const exportTable = async (table: string) => {
    setExporting(table);
    try {
      const config = TABLE_CONFIGS[table];
      const data = await fetchAll(table, config.cols, config.orderBy);
      if (!data.length) {
        toast.info(t('settings.data.exportNoData'));
        return;
      }
      const csv = arrayToCSV(data, HEADER_MAPS[table]);
      downloadFile('\uFEFF' + csv, `${config.filename}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
      toast.success(t('settings.data.exportSuccess', { count: data.length }));
    } catch (err: any) {
      toast.error(t('settings.data.exportError', { message: err.message || 'unknown' }));
    } finally {
      setExporting(null);
    }
  };

  const exportAll = async () => {
    setExporting('all');
    try {
      const [clients, quotes, orders, materials] = await Promise.all([
        fetchAll('clients', TABLE_CONFIGS.clients.cols, TABLE_CONFIGS.clients.orderBy),
        fetchAll('quotes', TABLE_CONFIGS.quotes.cols, TABLE_CONFIGS.quotes.orderBy),
        fetchAll('orders', TABLE_CONFIGS.orders.cols, TABLE_CONFIGS.orders.orderBy),
        fetchAll('materials', TABLE_CONFIGS.materials.cols, TABLE_CONFIGS.materials.orderBy),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        clients,
        quotes,
        orders,
        materials,
      };
      downloadFile(JSON.stringify(payload, null, 2), `export_complet_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
      toast.success(t('settings.data.exportAllSuccess'));
    } catch (err: any) {
      toast.error(t('settings.data.exportError', { message: err.message || 'unknown' }));
    } finally {
      setExporting(null);
    }
  };

  const isLoading = (key: string) => exporting === key;

  return (
    <div ref={ref} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('settings.data.exportTitle')}
          </CardTitle>
          <CardDescription>
            {t('settings.data.exportDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => exportTable('clients')} disabled={!!exporting}>
              {isLoading('clients') ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t('settings.data.exportClients')}
            </Button>
            <Button variant="outline" onClick={() => exportTable('quotes')} disabled={!!exporting}>
              {isLoading('quotes') ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t('settings.data.exportQuotes')}
            </Button>
            <Button variant="outline" onClick={() => exportTable('orders')} disabled={!!exporting}>
              {isLoading('orders') ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              {t('settings.data.exportOrders')}
            </Button>
            <Button variant="outline" onClick={() => exportTable('materials')} disabled={!!exporting}>
              {isLoading('materials') ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2" />}
              {t('settings.data.exportMaterials')}
            </Button>
            <Button onClick={exportAll} disabled={!!exporting} className="sm:col-span-2 lg:col-span-2">
              {isLoading('all') ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              {t('settings.data.exportAll')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t('settings.data.exportNote')}
          </p>
        </CardContent>
      </Card>

      <DataImportSection />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('settings.data.protectionTitle')}
          </CardTitle>
          <CardDescription>
            {t('settings.data.protectionDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('settings.data.backupTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.data.backupDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Server className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('settings.data.recoveryTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.data.recoveryDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t('settings.data.securityTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.data.securityDesc')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

DataExportSection.displayName = 'DataExportSection';
