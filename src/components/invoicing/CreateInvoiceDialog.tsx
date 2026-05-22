import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useInvoiceSeries } from '@/hooks/useInvoiceSeries';
import { useCreateInvoice, useIssueInvoice, type InvoiceItem, type InvoiceType } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useClientOrders } from '@/hooks/useOrders';
import { buildInvoiceLineDescription } from '@/lib/pdf/invoiceLineFormatter';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  orderId?: string | null;
  defaultType?: InvoiceType;
}

export function CreateInvoiceDialog({ open, onOpenChange, orderId, defaultType = 'fiscal' }: Props) {
  const { t } = useTranslation();
  const { companyId } = useAuth();
  const { data: seriesList = [] } = useInvoiceSeries();
  const { clients } = useClients();
  const createInvoice = useCreateInvoice();
  const issueInvoice = useIssueInvoice();
  const { currency: globalCurrency, euroRate } = useCurrency();

  // Invoice currency state (defaults to global)
  const [currency, setCurrency] = useState<'RON' | 'EUR'>(globalCurrency);
  // Conversion: source values are stored in RON; if invoice currency = EUR divide by euroRate.
  const conversionFactor = currency === 'EUR' && euroRate > 0 ? 1 / euroRate : 1;
  const exchangeRate = currency === 'EUR' && euroRate > 0 ? euroRate : 1;

  const [type, setType] = useState<InvoiceType>(defaultType);
  const [seriesId, setSeriesId] = useState<string>('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [taxPercent, setTaxPercent] = useState(19);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientSnapshot, setClientSnapshot] = useState<any>({});
  const [companySnapshot, setCompanySnapshot] = useState<any>({});
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const [advancePercent, setAdvancePercent] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(defaultType);
    setItems([]);
    setNotes('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setCurrency(globalCurrency);
  }, [open, defaultType, globalCurrency]);

  // Force RON for Romanian companies (e-Factura ANAF legal requirement)
  const companyCountry = String(companySnapshot?.country_code || 'RO').toUpperCase();
  const isRoCompany = companyCountry === 'RO';
  useEffect(() => {
    if (isRoCompany && currency !== 'RON') setCurrency('RON');
  }, [isRoCompany, currency]);

  useEffect(() => {
    const def = seriesList.find(s => s.invoice_type === type && s.is_default) || seriesList.find(s => s.invoice_type === type);
    setSeriesId(def?.id || '');
  }, [seriesList, type]);

  useEffect(() => {
    if (!open || !companyId) return;
    (async () => {
      const { data: company } = await supabase.from('companies').select('*').eq('id', companyId).maybeSingle();
      setCompanySnapshot(company || {});

      if (orderId) {
        const { data: order } = await supabase
          .from('orders')
          .select('*, clients(*), order_products(*)')
          .eq('id', orderId)
          .maybeSingle();
        if (order) {
          setClientId(order.client_id);
          setClientSnapshot(order.clients || {});
          setTaxPercent(Number(order.tax_percent) || 19);
          const days = (order.clients as any)?.payment_term_days || 0;
          const due = new Date();
          due.setDate(due.getDate() + days);
          setDueDate(due.toISOString().split('T')[0]);
          const prods = (order.order_products || []) as any[];
          const built: InvoiceItem[] = prods.map((p, idx) => {
            const unitPrice = Number(p.unit_price) * conversionFactor;
            const subtotal = unitPrice * Number(p.quantity);
            const total = subtotal * (1 + taxPercent / 100);
            return {
              description: buildInvoiceLineDescription(p, t),
              quantity: Number(p.quantity),
              unit_price: unitPrice,
              tax_percent: taxPercent,
              subtotal,
              total,
              product_type: p.product_type,
              source_product_id: p.id,
              unit: 'buc',
              sort_order: idx,
            };
          });
          if (defaultType === 'proforma' && built.length > 0) {
            const totalSubtotal = built.reduce((s, i) => s + i.subtotal, 0);
            const advanceVal = totalSubtotal * (advancePercent / 100);
            setItems([{
              description: t('invoicing.create.advanceLine', { percent: advancePercent, order: order.order_number }),
              quantity: 1,
              unit_price: advanceVal,
              tax_percent: taxPercent,
              subtotal: advanceVal,
              total: advanceVal * (1 + taxPercent / 100),
              unit: 'buc',
              sort_order: 0,
            }]);
          } else {
            setItems(built);
          }
        }
      }
    })();
  }, [open, orderId, companyId, currency]); // eslint-disable-line

  const updateItem = (idx: number, patch: Partial<InvoiceItem>) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const next = { ...it, ...patch };
      next.subtotal = Number(next.quantity) * Number(next.unit_price);
      next.total = next.subtotal * (1 + Number(next.tax_percent) / 100);
      return next;
    }));
  };

  const addLine = () => setItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, tax_percent: taxPercent, subtotal: 0, total: 0, unit: 'buc' }]);
  const removeLine = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  // Multi-order import (when no orderId prop and a client is selected)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const { data: clientOrders = [] } = useClientOrders(!orderId ? clientId : null);

  useEffect(() => { setSelectedOrderIds([]); }, [clientId]);

  const importFromSelectedOrders = () => {
    if (selectedOrderIds.length === 0) return;
    const chosen = clientOrders.filter((o: any) => selectedOrderIds.includes(o.id));
    let sortIdx = 0;
    const built: InvoiceItem[] = [];
    for (const order of chosen) {
      const orderTax = Number(order.tax_percent) || taxPercent;
      for (const p of (order.order_products || [])) {
        const unitPrice = Number(p.unit_price) * conversionFactor;
        const subtotal = unitPrice * Number(p.quantity);
        built.push({
          description: `[${order.order_number}] ${buildInvoiceLineDescription(p, t)}`,
          quantity: Number(p.quantity),
          unit_price: unitPrice,
          tax_percent: orderTax,
          subtotal,
          total: subtotal * (1 + orderTax / 100),
          product_type: p.product_type,
          source_product_id: p.id,
          unit: 'buc',
          sort_order: sortIdx++,
        });
      }
    }
    setItems(built);
    toast.success(t('invoicing.create.importBtn'));
  };

  const subtotal = items.reduce((s, i) => s + Number(i.subtotal), 0);
  const taxAmount = items.reduce((s, i) => s + (Number(i.subtotal) * Number(i.tax_percent) / 100), 0);
  const total = subtotal + taxAmount;

  const handleSubmit = async (alsoIssue: boolean) => {
    if (submitting) return;
    if (!seriesId) { toast.error(t('invoicing.create.selectSeries')); return; }
    if (items.length === 0) { toast.error(t('invoicing.create.addAtLeastOneLine')); return; }
    setSubmitting(true);
    try {
      const inv = await createInvoice.mutateAsync({
        invoice: {
          invoice_type: type,
          series_id: seriesId,
          order_id: orderId || null,
          client_id: clientId,
          issue_date: issueDate,
          due_date: dueDate || null,
          tax_percent: taxPercent,
          subtotal,
          tax_amount: taxAmount,
          total,
          currency,
          exchange_rate: exchangeRate,
          base_currency: 'RON',
          notes: notes || null,
          client_snapshot: clientSnapshot,
          company_snapshot: companySnapshot,
        } as any,
        items,
      });
      if (alsoIssue) {
        await issueInvoice.mutateAsync(inv.id);
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSeries = seriesList.filter(s => s.invoice_type === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('invoicing.create.title')}</DialogTitle>
          <DialogDescription>{t('invoicing.create.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>{t('invoicing.create.type')}</Label>
              <Select value={type} onValueChange={(v) => setType(v as InvoiceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiscal">{t('invoicing.type.fiscal')}</SelectItem>
                  <SelectItem value="proforma">{t('invoicing.type.proforma')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('invoicing.create.series')}</Label>
              <Select value={seriesId || '__none__'} onValueChange={(v) => setSeriesId(v === '__none__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder={t('invoicing.create.chooseSeries')} /></SelectTrigger>
                <SelectContent>
                  {filteredSeries.length === 0 ? (
                    <SelectItem value="__none__" disabled>{t('invoicing.create.noSeriesConfigured')}</SelectItem>
                  ) : filteredSeries.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.prefix ? `${s.prefix}-` : ''}{s.series_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('invoicing.create.issueDate')}</Label>
              <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div>
              <Label>{t('invoicing.create.dueDate')}</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>{t('invoicing.create.currency')}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as 'RON' | 'EUR')} disabled={isRoCompany}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RON">RON</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
              {isRoCompany && <div className="text-[10px] text-muted-foreground mt-0.5">{t('invoicing.create.efacturaRequiresRon')}</div>}
              {currency === 'EUR' && !isRoCompany && (
                <div className="text-[10px] text-muted-foreground mt-0.5">{t('invoicing.create.exchangeRate')}: 1 EUR = {euroRate.toFixed(4)} RON</div>
              )}
            </div>
          </div>

          <div className="rounded border p-3 bg-muted/30 space-y-2">
            <div className="text-xs uppercase text-muted-foreground">{t('invoicing.create.client')}</div>
            {!orderId && (
              <Select
                value={clientId || '__none__'}
                onValueChange={(v) => {
                  if (v === '__none__') {
                    setClientId(null);
                    setClientSnapshot({});
                    setDueDate('');
                    return;
                  }
                  const c = clients.find((x: any) => x.id === v);
                  if (!c) return;
                  setClientId(c.id);
                  setClientSnapshot(c);
                  const days = (c as any).payment_term_days || 0;
                  if (days > 0) {
                    const due = new Date();
                    due.setDate(due.getDate() + days);
                    setDueDate(due.toISOString().split('T')[0]);
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder={t('invoicing.create.chooseClient')} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="__none__">{t('invoicing.create.noClient')}</SelectItem>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name || c.name}{c.cui ? ` (CUI: ${c.cui})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div>
              <div className="font-medium">{clientSnapshot?.company_name || clientSnapshot?.name || '—'}</div>
              {clientSnapshot?.cui && <div className="text-xs text-muted-foreground">CUI: {clientSnapshot.cui}</div>}
              {clientSnapshot?.address && <div className="text-xs text-muted-foreground">{clientSnapshot.address}</div>}
              {(clientSnapshot?.email || clientSnapshot?.phone) && (
                <div className="text-xs text-muted-foreground">
                  {[clientSnapshot.email, clientSnapshot.phone].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>

          {!orderId && clientId && (
            <div className="rounded border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase text-muted-foreground">{t('invoicing.create.importFromOrder')}</div>
                <Button size="sm" onClick={importFromSelectedOrders} disabled={selectedOrderIds.length === 0}>
                  {t('invoicing.create.importBtn')}
                </Button>
              </div>
              {clientOrders.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">{t('invoicing.create.noOrdersForClient')}</div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {clientOrders.map((o: any) => (
                    <label key={o.id} className="flex items-center gap-2 text-sm hover:bg-muted/40 px-2 py-1 rounded cursor-pointer">
                      <Checkbox
                        checked={selectedOrderIds.includes(o.id)}
                        onCheckedChange={(c) => setSelectedOrderIds(prev => c ? [...prev, o.id] : prev.filter(x => x !== o.id))}
                      />
                      <span className="font-mono">{o.order_number}</span>
                      <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                      <span className="ml-auto">{(Number(o.total) * conversionFactor).toFixed(2)} {currency}</span>
                      <span className="text-xs text-muted-foreground">({(o.order_products || []).length})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {type === 'proforma' && orderId && (
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">{t('invoicing.create.advancePercent')}</Label>
              <Input type="number" min="1" max="100" value={advancePercent} onChange={e => setAdvancePercent(Number(e.target.value))} className="w-24" />
              <span className="text-xs text-muted-foreground">{t('invoicing.create.advanceHint')}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t('invoicing.create.lines')}</Label>
              <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3 mr-1" />{t('invoicing.create.addLine')}</Button>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start border rounded p-2">
                  <Input className="col-span-5" placeholder={t('invoicing.create.descPlaceholder')} value={it.description} onChange={e => updateItem(idx, { description: e.target.value })} />
                  <Input className="col-span-1" type="number" step="0.01" placeholder={t('invoicing.create.qtyPlaceholder')} value={it.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} />
                  <Input className="col-span-1" placeholder={t('invoicing.create.umPlaceholder')} value={it.unit || 'buc'} onChange={e => updateItem(idx, { unit: e.target.value })} />
                  <Input className="col-span-2" type="number" step="0.01" placeholder={t('invoicing.create.pricePlaceholder')} value={it.unit_price} onChange={e => updateItem(idx, { unit_price: Number(e.target.value) })} />
                  <Input className="col-span-1" type="number" step="0.01" placeholder={t('invoicing.create.vatPlaceholder')} value={it.tax_percent} onChange={e => updateItem(idx, { tax_percent: Number(e.target.value) })} />
                  <div className="col-span-1 text-right text-sm pt-2">{it.total.toFixed(2)}</div>
                  <Button variant="ghost" size="icon" className="col-span-1 text-destructive" onClick={() => removeLine(idx)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">{t('invoicing.create.noLines')}</div>}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between"><span>{t('invoicing.create.subtotal')}:</span><span>{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{t('invoicing.create.vat')}:</span><span>{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold border-t pt-1"><span>{t('invoicing.create.total')}:</span><span>{total.toFixed(2)} {currency}</span></div>
            </div>
          </div>

          <div>
            <Label>{t('invoicing.create.notes')}</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>{t('invoicing.create.cancel')}</Button>
          <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={submitting}>{t('invoicing.create.saveDraft')}</Button>
          <Button onClick={() => handleSubmit(true)} disabled={submitting || !seriesId}>
            {submitting ? t('invoicing.create.issuing') : t('invoicing.create.issueNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
