import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import i18next from 'i18next';

export interface ChecklistItem {
  label: string;
  category: 'tool' | 'material' | 'accessory';
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  company_id: string | null;
  name: string;
  product_type: string | null;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

export function useInstallationChecklists() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['checklist-templates', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installation_checklist_templates')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        items: (t.items as any[] || []) as ChecklistItem[],
      })) as ChecklistTemplate[];
    },
    enabled: !!companyId,
  });

  const createTemplate = useMutation({
    mutationFn: async (data: { name: string; product_type?: string | null; items: ChecklistItem[] }) => {
      const { error } = await supabase
        .from('installation_checklist_templates')
        .insert({ ...data, company_id: companyId! } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({ title: i18next.t('toasts.templateCreated') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; product_type?: string | null; items?: ChecklistItem[] }) => {
      const { error } = await supabase
        .from('installation_checklist_templates')
        .update(data as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({ title: i18next.t('toasts.templateUpdated') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('installation_checklist_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({ title: i18next.t('toasts.templateDeleted') });
    },
    onError: (e: any) => toast({ title: i18next.t('toasts.error'), description: e.message, variant: 'destructive' }),
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
