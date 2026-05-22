import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useInvoiceSeries, useUpsertSeries, useDeleteSeries, type InvoiceSeries } from '@/hooks/useInvoiceSeries';
import { useTranslation } from 'react-i18next';

export function InvoiceSeriesManager() {
  const { t } = useTranslation();
  const { data: series = [] } = useInvoiceSeries();
  const upsert = useUpsertSeries();
  const del = useDeleteSeries();
  const [editing, setEditing] = useState<Partial<InvoiceSeries> | null>(null);

  const blank: Partial<InvoiceSeries> = {
    invoice_type: 'fiscal', prefix: '', series_name: 'FACT',
    start_number: 1, current_number: 0, year_in_format: true, padding_length: 5, is_default: false, is_active: true,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('invoicing.series.title')}</CardTitle>
        <Button size="sm" onClick={() => setEditing(blank)}><Plus className="h-3 w-3 mr-1" />{t('invoicing.series.addSeries')}</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('invoicing.series.name')}</TableHead>
              <TableHead>{t('invoicing.series.type')}</TableHead>
              <TableHead>{t('invoicing.series.exampleFormat')}</TableHead>
              <TableHead>{t('invoicing.series.currentNumber')}</TableHead>
              <TableHead>{t('invoicing.series.defaultCol')}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series.map(s => {
              const example = `${s.prefix ? s.prefix + '-' : ''}${s.series_name}${s.year_in_format ? '-' + new Date().getFullYear() : ''}-${String(s.current_number + 1).padStart(s.padding_length, '0')}`;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.series_name}</TableCell>
                  <TableCell>{s.invoice_type === 'fiscal' ? t('invoicing.type.fiscal') : t('invoicing.type.proforma')}</TableCell>
                  <TableCell className="font-mono text-xs">{example}</TableCell>
                  <TableCell>{s.current_number}</TableCell>
                  <TableCell>{s.is_default && <Badge>{t('invoicing.series.defaultBadge')}</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(s)}>{t('invoicing.series.edit')}</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(s.id)}><Trash2 className="h-3 w-3" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {series.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">{t('invoicing.series.empty')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {editing && (
          <div className="mt-4 border rounded p-4 space-y-3 bg-muted/30">
            <h4 className="font-medium">{editing.id ? t('invoicing.series.editTitle') : t('invoicing.series.newTitle')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label>{t('invoicing.series.type')}</Label>
                <Select value={editing.invoice_type} onValueChange={(v) => setEditing({ ...editing, invoice_type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiscal">{t('invoicing.type.fiscal')}</SelectItem>
                    <SelectItem value="proforma">{t('invoicing.type.proforma')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('invoicing.series.prefixOptional')}</Label>
                <Input value={editing.prefix || ''} onChange={e => setEditing({ ...editing, prefix: e.target.value })} placeholder={t('invoicing.series.prefixPlaceholder')} />
              </div>
              <div>
                <Label>{t('invoicing.series.seriesName')}</Label>
                <Input value={editing.series_name || ''} onChange={e => setEditing({ ...editing, series_name: e.target.value })} placeholder="FACT" />
              </div>
              <div>
                <Label>{t('invoicing.series.startNumber')}</Label>
                <Input type="number" value={editing.start_number || 1} onChange={e => setEditing({ ...editing, start_number: Number(e.target.value) })} />
              </div>
              <div>
                <Label>{t('invoicing.series.currentNumberLabel')}</Label>
                <Input type="number" value={editing.current_number ?? 0} onChange={e => setEditing({ ...editing, current_number: Number(e.target.value) })} />
              </div>
              <div>
                <Label>{t('invoicing.series.paddingLength')}</Label>
                <Input type="number" value={editing.padding_length || 5} onChange={e => setEditing({ ...editing, padding_length: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.year_in_format ?? true} onCheckedChange={v => setEditing({ ...editing, year_in_format: v })} />
                <Label>{t('invoicing.series.includeYear')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.is_default ?? false} onCheckedChange={v => setEditing({ ...editing, is_default: v })} />
                <Label>{t('invoicing.series.isDefault')}</Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditing(null)}>{t('invoicing.series.cancel')}</Button>
              <Button onClick={async () => { await upsert.mutateAsync(editing); setEditing(null); }} disabled={upsert.isPending}>{t('invoicing.series.save')}</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
