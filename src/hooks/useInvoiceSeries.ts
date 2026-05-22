import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface InvoiceSeries {
  id: string;
  company_id: string;
  invoice_type: 'fiscal' | 'proforma';
  prefix: string;
  series_name: string;
  start_number: number;
  current_number: number;
  year_in_format: boolean;
  padding_length: number;
  is_default: boolean;
  is_active: boolean;
}

export function useInvoiceSeries() {
  const { companyId } = useAuth();
  return useQuery({
    queryKey: ['invoice_series', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_series' as any)
        .select('*')
        .eq('company_id', companyId!)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('series_name');
      if (error) throw error;
      return (data || []) as unknown as InvoiceSeries[];
    },
  });
}

export function useUpsertSeries() {
  const qc = useQueryClient();
  const { companyId } = useAuth();
  return useMutation({
    mutationFn: async (s: Partial<InvoiceSeries>) => {
      if (!companyId) throw new Error('No company');
      if (s.id) {
        const { error } = await supabase.from('invoice_series' as any).update(s as any).eq('id', s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('invoice_series' as any).insert({ ...s, company_id: companyId } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice_series'] });
      toast.success('Serie salvată');
    },
    onError: (e: any) => toast.error(e.message || 'Eroare'),
  });
}

export function useDeleteSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoice_series' as any).update({ is_active: false } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice_series'] });
      toast.success('Serie dezactivată');
    },
  });
}
