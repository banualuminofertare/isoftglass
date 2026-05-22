import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type InvoiceType = 'proforma' | 'fiscal' | 'storno';
export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'cancelled' | 'storno';

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
  subtotal: number;
  total: number;
  product_type?: string | null;
  source_product_id?: string | null;
  unit?: string;
  sort_order?: number;
}

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number: string | null;
  series_id: string | null;
  invoice_type: InvoiceType;
  order_id: string | null;
  client_id: string | null;
  parent_invoice_id: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  client_snapshot: any;
  company_snapshot: any;
  subtotal: number;
  tax_amount: number;
  tax_percent: number;
  discount_amount: number;
  total: number;
  paid_amount: number;
  currency: string;
  notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  issued_at: string | null;
  clients?: { name: string; company_name: string | null } | null;
  orders?: { order_number: string } | null;
}

export function useInvoices(filter?: { status?: InvoiceStatus | 'all'; type?: InvoiceType | 'all' }) {
  const { companyId } = useAuth();
  return useQuery({
    queryKey: ['invoices', companyId, filter],
    enabled: !!companyId,
    queryFn: async () => {
      let q = supabase
        .from('invoices' as any)
        .select('*, clients(name, company_name), orders(order_number)')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });
      if (filter?.status && filter.status !== 'all') q = q.eq('status', filter.status);
      if (filter?.type && filter.type !== 'all') q = q.eq('invoice_type', filter.type);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as Invoice[];
    },
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ['invoice', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices' as any)
        .select('*, clients(*), orders(order_number, total), invoice_items(*), invoice_payments(*)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const { companyId, user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      invoice: Partial<Invoice>;
      items: InvoiceItem[];
    }) => {
      if (!companyId) throw new Error('No company');
      const { data: inv, error } = await supabase
        .from('invoices' as any)
        .insert({
          ...input.invoice,
          company_id: companyId,
          created_by: user?.id,
          status: 'draft',
        } as any)
        .select()
        .single();
      if (error) throw error;
      const invId = (inv as any).id;
      if (input.items.length > 0) {
        const { error: itemsErr } = await supabase
          .from('invoice_items' as any)
          .insert(input.items.map((it, idx) => ({ ...it, invoice_id: invId, sort_order: idx })) as any);
        if (itemsErr) throw itemsErr;
      }
      return inv as any;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factură salvată ca draft');
    },
    onError: (e: any) => toast.error(e.message || 'Eroare la salvare'),
  });
}

export function useIssueInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data, error } = await supabase.rpc('issue_invoice' as any, { _invoice_id: invoiceId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (number) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
      toast.success(`Factură emisă: ${number}`);
    },
    onError: (e: any) => toast.error(e.message || 'Eroare la emitere'),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factură ștearsă');
    },
    onError: (e: any) => toast.error(e.message || 'Eroare la ștergere'),
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      invoice_id: string;
      amount: number;
      payment_date: string;
      payment_method: string;
      reference?: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('invoice_payments' as any)
        .insert({ ...input, created_by: user?.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
      toast.success('Plată înregistrată');
    },
    onError: (e: any) => toast.error(e.message || 'Eroare la înregistrare'),
  });
}

export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices' as any).update({ status: 'cancelled' } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factură anulată');
    },
    onError: (e: any) => toast.error(e.message || 'Eroare la anulare'),
  });
}
