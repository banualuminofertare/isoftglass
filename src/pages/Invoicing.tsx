import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, FileDown, FileCode2, Wallet, Send, Trash2, Ban } from 'lucide-react';
import { useInvoices, useIssueInvoice, useDeleteInvoice, useCancelInvoice, type Invoice, type InvoiceStatus } from '@/hooks/useInvoices';
import { CreateInvoiceDialog } from '@/components/invoicing/CreateInvoiceDialog';
import { InvoicePaymentDialog } from '@/components/invoicing/InvoicePaymentDialog';
import { InvoiceStatusBadge } from '@/components/invoicing/InvoiceStatusBadge';
import { InvoiceSeriesManager } from '@/components/invoicing/InvoiceSeriesManager';
import { InvoiceCharts } from '@/components/invoicing/InvoiceCharts';
import { supabase } from '@/integrations/supabase/client';
// invoicePdf imported lazily inside handlers to keep jsPDF out of the Invoicing page bundle
import { validateInvoiceForEFactura, validateInvoiceForPeppol } from '@/lib/einvoice/validate';
import { validateInvoiceForFatturaPa } from '@/lib/einvoice/cius/it-fatturapa';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function Invoicing() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<InvoiceStatus | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [showSeries, setShowSeries] = useState(false);

  const { data: invoices = [], isLoading } = useInvoices({ status: tab });
  const { data: allInvoices = [] } = useInvoices({ status: 'all' });
  const issueInvoice = useIssueInvoice();
  const delInvoice = useDeleteInvoice();
  const cancelInvoice = useCancelInvoice();

  const buildSnapshot = async (inv: Invoice) => {
    if (!inv.company_id) return inv;
    const { data: company } = await supabase.from('companies').select('*').eq('id', inv.company_id).maybeSingle();
    if (!company) return inv;
    const live = {
      name: company.name,
      cui: company.cui,
      address: company.address,
      phone: company.phone,
      email: company.email,
      bank_account: company.bank_account,
      logo_url: company.logo_url,
    };
    const snap = (inv.company_snapshot as any) || {};
    // For draft: always use live. For issued: keep snapshot, fill blanks from live.
    const merged = inv.status === 'draft'
      ? { ...snap, ...live }
      : { ...live, ...Object.fromEntries(Object.entries(snap).filter(([, v]) => v !== null && v !== undefined && v !== '')) };
    return { ...inv, company_snapshot: merged };
  };

  const downloadPdf = async (inv: Invoice) => {
    const enriched = await buildSnapshot(inv);
    const { data: items } = await supabase.from('invoice_items' as any).select('*').eq('invoice_id', inv.id).order('sort_order');
    const { data: payments } = await supabase.from('invoice_payments' as any).select('*').eq('invoice_id', inv.id);
    const { generateInvoicePDF } = await import('@/lib/pdf/invoicePdf');
    await generateInvoicePDF(enriched, (items as any) || [], (payments as any) || []);
  };

  const downloadXml = async (inv: Invoice) => {
    const enriched = await buildSnapshot(inv);
    const { data: items } = await supabase.from('invoice_items' as any).select('*').eq('invoice_id', inv.id).order('sort_order');
    const itemList = (items as any) || [];
    const country = String((enriched.company_snapshot as any)?.country_code || 'RO').toUpperCase();
    const isItaly = country === 'IT';
    const isRomania = country === 'RO';
    const isPeppol = !isItaly && !isRomania;

    const allErrors = isItaly
      ? validateInvoiceForFatturaPa(enriched, itemList)
      : isPeppol
        ? validateInvoiceForPeppol(enriched, itemList)
        : validateInvoiceForEFactura(enriched, itemList);

    // Separă erorile blocante de avertizări (info.*)
    const blocking = allErrors.filter(e => !e.field.startsWith('info.'));
    const warnings = allErrors.filter(e => e.field.startsWith('info.'));

    const blockedKey = isItaly ? 'invoicing.toasts.fatturaPaBlocked' : isPeppol ? 'invoicing.toasts.peppolBlocked' : 'invoicing.toasts.eFacturaBlocked';
    const successKey = isItaly ? 'invoicing.toasts.fatturaPaSuccess' : isPeppol ? 'invoicing.toasts.peppolSuccess' : 'invoicing.toasts.eFacturaSuccess';

    if (blocking.length > 0) {
      toast.error(t(blockedKey), {
        description: blocking.slice(0, 6).map(e => `• ${e.message}`).join('\n') + (blocking.length > 6 ? `\n${t('invoicing.toasts.andMore', { count: blocking.length - 6 })}` : ''),
        duration: 9000,
      });
      return;
    }

    warnings.forEach(w => toast.warning(w.message, { duration: 6000 }));
    const { downloadUblXml } = await import('@/lib/pdf/invoicePdf');
    downloadUblXml(enriched, itemList);
    toast.success(t(successKey));
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('invoicing.title')}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSeries(s => !s)}>{t('invoicing.seriesButton')}</Button>
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" />{t('invoicing.newInvoice')}</Button>
          </div>
        </div>

        {showSeries && <InvoiceSeriesManager />}

        <InvoiceCharts invoices={allInvoices} />

        <Card>
          <CardHeader>
            <CardTitle>{t('invoicing.listTitle')}</CardTitle>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">{t('invoicing.status.all')}</TabsTrigger>
                <TabsTrigger value="draft">{t('invoicing.status.draft')}</TabsTrigger>
                <TabsTrigger value="issued">{t('invoicing.status.issued')}</TabsTrigger>
                <TabsTrigger value="partially_paid">{t('invoicing.status.partially_paid')}</TabsTrigger>
                <TabsTrigger value="paid">{t('invoicing.status.paid')}</TabsTrigger>
                <TabsTrigger value="cancelled">{t('invoicing.status.cancelled')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t('invoicing.loading')}</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('invoicing.empty')}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('invoicing.table.number')}</TableHead>
                    <TableHead>{t('invoicing.table.type')}</TableHead>
                    <TableHead>{t('invoicing.table.client')}</TableHead>
                    <TableHead>{t('invoicing.table.order')}</TableHead>
                    <TableHead>{t('invoicing.table.date')}</TableHead>
                    <TableHead>{t('invoicing.table.dueDate')}</TableHead>
                    <TableHead className="text-right">{t('invoicing.table.total')}</TableHead>
                    <TableHead className="text-right">{t('invoicing.table.balance')}</TableHead>
                    <TableHead>{t('invoicing.table.status')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(inv => {
                    const remaining = Number(inv.total) - Number(inv.paid_amount);
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono">{inv.invoice_number || <span className="text-muted-foreground italic">{t('invoicing.status.draft').toLowerCase()}</span>}</TableCell>
                        <TableCell className="text-xs uppercase">{t(`invoicing.type.${inv.invoice_type}`)}</TableCell>
                        <TableCell>{inv.clients?.company_name || inv.clients?.name || (inv.client_snapshot as any)?.name || '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{inv.orders?.order_number || '—'}</TableCell>
                        <TableCell className="text-sm">{format(new Date(inv.issue_date), 'dd.MM.yyyy')}</TableCell>
                        <TableCell className="text-sm">{inv.due_date ? format(new Date(inv.due_date), 'dd.MM.yyyy') : '—'}</TableCell>
                        <TableCell className="text-right font-medium">{Number(inv.total).toFixed(2)} {(inv as any).currency || 'RON'}</TableCell>
                        <TableCell className={`text-right ${remaining > 0 && inv.status !== 'draft' ? 'text-amber-600 font-medium' : ''}`}>{remaining.toFixed(2)}</TableCell>
                        <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {inv.status === 'draft' && (
                                <DropdownMenuItem onClick={() => issueInvoice.mutate(inv.id)}>
                                  <Send className="h-4 w-4 mr-2" />{t('invoicing.actions.issue')}
                                </DropdownMenuItem>
                              )}
                              {inv.status !== 'draft' && (
                                <DropdownMenuItem onClick={() => downloadPdf(inv)}>
                                  <FileDown className="h-4 w-4 mr-2" />{t('invoicing.actions.pdf')}
                                </DropdownMenuItem>
                              )}
                              {inv.invoice_type === 'fiscal' && inv.status !== 'draft' && (() => {
                                const ctry = String((inv.company_snapshot as any)?.country_code || 'RO').toUpperCase();
                                const label = ctry === 'IT'
                                  ? t('invoicing.actions.exportFatturaPa')
                                  : ctry === 'RO'
                                    ? t('invoicing.actions.exportEFactura')
                                    : t('invoicing.actions.exportPeppol');
                                return (
                                  <DropdownMenuItem onClick={() => downloadXml(inv)}>
                                    <FileCode2 className="h-4 w-4 mr-2" />{label}
                                  </DropdownMenuItem>
                                );
                              })()}
                              {(inv.status === 'issued' || inv.status === 'partially_paid') && (
                                <DropdownMenuItem onClick={() => setPaymentInvoice(inv)}>
                                  <Wallet className="h-4 w-4 mr-2" />{t('invoicing.actions.registerPayment')}
                                </DropdownMenuItem>
                              )}
                              {(inv.status === 'issued' || inv.status === 'partially_paid') && (
                                <DropdownMenuItem onClick={() => cancelInvoice.mutate(inv.id)}>
                                  <Ban className="h-4 w-4 mr-2" />{t('invoicing.actions.cancel')}
                                </DropdownMenuItem>
                              )}
                              {inv.status === 'draft' && (
                                <DropdownMenuItem className="text-destructive" onClick={() => delInvoice.mutate(inv.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />{t('invoicing.actions.deleteDraft')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
        <InvoicePaymentDialog invoice={paymentInvoice} open={!!paymentInvoice} onOpenChange={(o) => !o && setPaymentInvoice(null)} />
      </div>
    </AppLayout>
  );
}
