import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import i18n from '@/i18n';

const tr = (k: string) => i18n.t(`crmToasts.${k}`);

export interface CrmLead {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  county: string | null;
  stage: string;
  source: string;
  estimated_value: number;
  actual_revenue: number;
  notes: string | null;
  next_follow_up: string | null;
  assigned_to: string | null;
  converted_user_id: string | null;
  lost_reason: string | null;
  created_at: string;
  contacted_at: string | null;
  demo_started_at: string | null;
  paused_at: string | null;
  updated_at: string;
}

export interface CrmLeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  created_by: string | null;
  created_at: string;
}

export function useCrmLeads() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads((data as any[]) || []);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      toast.error(tr('loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const createLead = async (lead: Partial<CrmLead>) => {
    try {
      const { error } = await supabase.from('crm_leads').insert(lead as any);
      if (error) throw error;
      toast.success(tr('added'));
      fetchLeads();
    } catch (err: any) {
      toast.error(`${tr('errorPrefix')}: ${err.message}`);
    }
  };

  const updateLead = async (id: string, updates: Partial<CrmLead>) => {
    try {
      // Auto-set demo_started_at when stage changes
      if (updates.stage === 'demo' && !updates.demo_started_at) {
        const current = leads.find(l => l.id === id);
        if (current && current.stage !== 'demo') {
          updates.demo_started_at = new Date().toISOString();
        }
      } else if (updates.stage && updates.stage !== 'demo') {
        const current = leads.find(l => l.id === id);
        if (current && current.stage === 'demo') {
          updates.demo_started_at = null;
        }
      }
      // Auto-set paused_at
      if (updates.stage === 'pauza') {
        const current = leads.find(l => l.id === id);
        if (current && current.stage !== 'pauza') {
          updates.paused_at = new Date().toISOString();
        }
      } else if (updates.stage && updates.stage !== 'pauza') {
        const current = leads.find(l => l.id === id);
        if (current && current.stage === 'pauza') {
          updates.paused_at = null;
        }
      }
      const { error } = await supabase.from('crm_leads').update(updates as any).eq('id', id);
      if (error) throw error;
      toast.success(tr('updated'));
      fetchLeads();
    } catch (err: any) {
      toast.error(`${tr('errorPrefix')}: ${err.message}`);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase.from('crm_leads').delete().eq('id', id);
      if (error) throw error;
      toast.success(tr('deleted'));
      fetchLeads();
    } catch (err: any) {
      toast.error(`${tr('errorPrefix')}: ${err.message}`);
    }
  };

  const addActivity = async (leadId: string, description: string, activityType = 'note') => {
    try {
      const { error } = await supabase.from('crm_lead_activities').insert({
        lead_id: leadId,
        description,
        activity_type: activityType,
      } as any);
      if (error) throw error;
      toast.success(tr('activityAdded'));
    } catch (err: any) {
      toast.error(`${tr('errorPrefix')}: ${err.message}`);
    }
  };

  const fetchActivities = async (leadId: string): Promise<CrmLeadActivity[]> => {
    const { data, error } = await supabase
      .from('crm_lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (error) { toast.error(tr('activitiesError')); return []; }
    return (data as any[]) || [];
  };

  return { leads, loading, fetchLeads, createLead, updateLead, deleteLead, addActivity, fetchActivities };
}
