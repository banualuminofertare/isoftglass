import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import i18next from 'i18next';

export interface ServiceTicket {
  id: string;
  ticket_number: string;
  order_id?: string;
  client_id?: string;
  ticket_type: string;
  priority: string;
  status: string;
  description: string;
  intervention_address?: string;
  resolution_deadline?: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  orders?: { order_number: string };
  clients?: { name: string; company_name?: string; phone?: string };
}

export interface ServiceIntervention {
  id: string;
  ticket_id: string;
  assigned_to?: string;
  scheduled_date?: string;
  completed_date?: string;
  duration_minutes?: number;
  materials_used?: string;
  estimated_cost?: number;
  actual_cost?: number;
  result?: string;
  notes?: string;
  created_at: string;
}

export function useServiceTickets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyId } = useAuth();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['service-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_tickets')
        .select(`*, orders(order_number), clients(name, company_name, phone)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ServiceTicket[];
    },
  });

  const createTicket = useMutation({
    mutationFn: async (ticket: {
      order_id?: string;
      client_id?: string;
      ticket_type: string;
      priority: string;
      description: string;
      intervention_address?: string;
      resolution_deadline?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('service_tickets')
        .insert({ ...ticket, created_by: user?.id, company_id: companyId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      toast({ title: i18next.t('service.complaintCreated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('service.error'), description: error.message, variant: 'destructive' });
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('service_tickets')
        .update({ status } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      toast({ title: i18next.t('service.statusUpdated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('service.error'), description: error.message, variant: 'destructive' });
    },
  });

  return { tickets, isLoading, createTicket, updateTicketStatus };
}

export function useTicketInterventions(ticketId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interventions = [], isLoading } = useQuery({
    queryKey: ['service-interventions', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];
      const { data, error } = await supabase
        .from('service_interventions')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as unknown as ServiceIntervention[];
    },
    enabled: !!ticketId,
  });

  const addIntervention = useMutation({
    mutationFn: async (intervention: {
      ticket_id: string;
      assigned_to?: string;
      scheduled_date?: string;
      estimated_cost?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('service_interventions')
        .insert(intervention as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-interventions', ticketId] });
      toast({ title: i18next.t('service.interventionAdded') });
    },
    onError: (error) => {
      toast({ title: i18next.t('service.error'), description: error.message, variant: 'destructive' });
    },
  });

  const updateIntervention = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceIntervention> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_interventions')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-interventions', ticketId] });
      toast({ title: i18next.t('service.interventionUpdated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('service.error'), description: error.message, variant: 'destructive' });
    },
  });

  return { interventions, isLoading, addIntervention, updateIntervention };
}