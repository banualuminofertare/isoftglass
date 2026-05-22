import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddPayment, type Invoice } from '@/hooks/useInvoices';
import { useTranslation } from 'react-i18next';

export function InvoicePaymentDialog({ invoice, open, onOpenChange }: { invoice: Invoice | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useTranslation();
  const remaining = invoice ? Math.max(0, invoice.total - invoice.paid_amount) : 0;
  const [amount, setAmount] = useState(remaining.toFixed(2));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const addPayment = useAddPayment();

  const submit = async () => {
    if (!invoice) return;
    await addPayment.mutateAsync({
      invoice_id: invoice.id,
      amount: parseFloat(amount),
      payment_date: date,
      payment_method: method,
      reference: reference || undefined,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('invoicing.payment.title')}</DialogTitle>
        </DialogHeader>
        {invoice && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {t('invoicing.payment.invoiceLabel')} <span className="font-mono font-bold">{invoice.invoice_number}</span> · {t('invoicing.payment.remaining')}: <b>{remaining.toFixed(2)} {invoice.currency}</b>
            </div>
            <div>
              <Label>{t('invoicing.payment.amount')}</Label>
              <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('invoicing.payment.date')}</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <Label>{t('invoicing.payment.method')}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">{t('invoicing.payment.methodTransfer')}</SelectItem>
                    <SelectItem value="cash">{t('invoicing.payment.methodCash')}</SelectItem>
                    <SelectItem value="card">{t('invoicing.payment.methodCard')}</SelectItem>
                    <SelectItem value="op">{t('invoicing.payment.methodOp')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t('invoicing.payment.reference')}</Label>
              <Input value={reference} onChange={e => setReference(e.target.value)} />
            </div>
            <div>
              <Label>{t('invoicing.payment.notes')}</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('invoicing.payment.cancel')}</Button>
          <Button onClick={submit} disabled={addPayment.isPending || !amount || parseFloat(amount) <= 0}>
            {addPayment.isPending ? t('invoicing.payment.saving') : t('invoicing.payment.register')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
