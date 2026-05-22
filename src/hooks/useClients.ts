import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import i18next from 'i18next';

export type ClientType = 'person' | 'company' | 'distributor';

export interface Client {
  id: string;
  client_type: ClientType;
  name: string;
  company_name?: string;
  cui?: string;
  reg_com?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  country?: string;
  discount_percent?: number;
  credit_limit?: number;
  payment_term_days?: number;
  notes?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
  created_at: string;
}

export function useClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyId } = useAuth();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('clients')
        .insert({ ...client, created_by: user?.id, company_id: companyId } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: i18next.t('toasts.clientCreated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.clientCreateError'), description: error.message, variant: 'destructive' });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: i18next.t('toasts.clientUpdated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.clientUpdateError'), description: error.message, variant: 'destructive' });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('delete_client_everywhere', { p_client_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['production-jobs'] });
      toast({ title: i18next.t('toasts.clientDeleted'), description: i18next.t('toasts.clientDeletedDesc') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.clientDeleteError'), description: error.message, variant: 'destructive' });
    },
  });

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useClientContacts(clientId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['client-contacts', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('client_contacts')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data as ClientContact[];
    },
    enabled: !!clientId,
  });

  const createContact = useMutation({
    mutationFn: async (contact: Omit<ClientContact, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('client_contacts')
        .insert(contact)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-contacts', clientId] });
      toast({ title: i18next.t('toasts.contactAdded') });
    },
    onError: (error) => {
      toast({ title: i18next.t('toasts.error'), description: error.message, variant: 'destructive' });
    },
  });

  return { contacts, isLoading, createContact };
}
