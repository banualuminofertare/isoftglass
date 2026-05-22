import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import i18next from 'i18next';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

export interface ProcessingTemplate {
  id: string;
  material_code_prefix: string;
  name: string;
  template_type: string;
  dimensions: Record<string, number>;
  drawing_url: string | null;
  notes: string | null;
  user_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
  company_name?: string | null;
  author_name?: string | null;
}

type TemplateInsert = Omit<ProcessingTemplate, 'id' | 'created_at' | 'updated_at' | 'company_name' | 'author_name'>;

export function useProcessingTemplates() {
  const queryClient = useQueryClient();
  const { user, companyId } = useAuth();
  const { isAdmin } = usePermissions();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['processing-templates', isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processing_templates' as any)
        .select('*')
        .order('material_code_prefix');
      if (error) throw error;
      const rows = (data as unknown as ProcessingTemplate[]) ?? [];

      if (!isAdmin) return rows;

      const companyIds = Array.from(new Set(rows.map(r => r.company_id).filter(Boolean) as string[]));
      const userIds = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean) as string[]));

      const [companiesRes, profilesRes] = await Promise.all([
        companyIds.length
          ? supabase.from('companies').select('id, name').in('id', companyIds)
          : Promise.resolve({ data: [] as any[] }),
        userIds.length
          ? supabase.from('profiles').select('user_id, full_name, company_name').in('user_id', userIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const cMap = new Map((companiesRes.data ?? []).map((c: any) => [c.id, c.name as string]));
      const pMap = new Map((profilesRes.data ?? []).map((p: any) => [p.user_id, (p.full_name || p.company_name) as string]));

      return rows.map(r => ({
        ...r,
        company_name: r.company_id ? (cMap.get(r.company_id) ?? null) : null,
        author_name: r.user_id ? (pMap.get(r.user_id) ?? null) : null,
      }));
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<TemplateInsert, 'user_id' | 'company_id'>) => {
      if (!user?.id) throw new Error('Trebuie să fii autentificat pentru a salva template-uri.');
      const effectiveCompanyId = companyId ?? null;
      const payload = {
        ...template,
        user_id: user.id,
        company_id: effectiveCompanyId,
      };
      const { error } = await supabase
        .from('processing_templates' as any)
        .insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-templates'] });
      toast.success(i18next.t('toasts.templates.created'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProcessingTemplate> & { id: string }) => {
      const { error } = await supabase
        .from('processing_templates' as any)
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-templates'] });
      toast.success(i18next.t('toasts.templates.updated'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('processing_templates' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-templates'] });
      toast.success(i18next.t('toasts.templates.deleted'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { templates, isLoading, createTemplate, updateTemplate, deleteTemplate };
}

/** Find the processing template matching a full material code (e.g. 30.SH56.T90.31) */
export function useProcessingLookup(materialCode: string | undefined) {
  const { companyId } = useAuth();
  return useQuery({
    queryKey: ['processing-template-lookup', materialCode, companyId],
    enabled: !!materialCode,
    queryFn: async () => {
      if (!materialCode) return null;
      // Try progressively shorter prefixes: 30.SH56.T90 → 30.SH56
      const parts = materialCode.split('.');
      for (let len = parts.length; len >= 2; len--) {
        const prefix = parts.slice(0, len).join('.');
        
        // First try company-specific template
        if (companyId) {
          const { data: companyTemplate } = await supabase
            .from('processing_templates' as any)
            .select('*')
            .eq('material_code_prefix', prefix)
            .eq('company_id', companyId)
            .maybeSingle();
          if (companyTemplate) return companyTemplate as unknown as ProcessingTemplate;
        }
        
      // Fall back to global template
        const { data } = await supabase
          .from('processing_templates' as any)
          .select('*')
          .eq('material_code_prefix', prefix)
          .is('company_id', null)
          .maybeSingle();
        if (data) return data as unknown as ProcessingTemplate;

        // Fall back to Petrica Toader's templates (reference user)
        const REFERENCE_USER_ID = '190d5ee3-24b5-493a-858d-2ded8151956d';
        const { data: refTemplate } = await supabase
          .from('processing_templates' as any)
          .select('*')
          .eq('material_code_prefix', prefix)
          .eq('user_id', REFERENCE_USER_ID)
          .maybeSingle();
        if (refTemplate) return refTemplate as unknown as ProcessingTemplate;
      }

      // Reverse lookup: find templates whose prefix starts with materialCode
      // e.g. materialCode "33.K222.035" matches template "33.K222.035.31"
      if (companyId) {
        const { data: companyMatch } = await supabase
          .from('processing_templates' as any)
          .select('*')
          .like('material_code_prefix', `${materialCode}.%`)
          .eq('company_id', companyId)
          .limit(1)
          .maybeSingle();
        if (companyMatch) return companyMatch as unknown as ProcessingTemplate;
      }

      const { data: globalMatch } = await supabase
        .from('processing_templates' as any)
        .select('*')
        .like('material_code_prefix', `${materialCode}.%`)
        .is('company_id', null)
        .limit(1)
        .maybeSingle();
      if (globalMatch) return globalMatch as unknown as ProcessingTemplate;

      const FALLBACK_USER_ID = '190d5ee3-24b5-493a-858d-2ded8151956d';
      const { data: refMatch } = await supabase
        .from('processing_templates' as any)
        .select('*')
        .like('material_code_prefix', `${materialCode}.%`)
        .eq('user_id', FALLBACK_USER_ID)
        .limit(1)
        .maybeSingle();
      if (refMatch) return refMatch as unknown as ProcessingTemplate;

      return null;
    },
  });
}
