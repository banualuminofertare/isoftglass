import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PowerUser {
  user_id: string;
  full_name: string;
  company_name: string;
  hours: number;
  active_days: number;
  distinct_modules: number;
  last_active: string;
  score: number;
}
export function useAdminPowerUsers(from: Date, to: Date) {
  return useQuery({
    queryKey: ['admin-power-users', from.toISOString(), to.toISOString()],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PowerUser[]> => {
      const { data, error } = await supabase.rpc('get_admin_power_users' as any, {
        _from: from.toISOString(), _to: to.toISOString(),
      });
      if (error) throw error;
      return ((data as unknown) as PowerUser[]) ?? [];
    },
  });
}

export interface FunnelStep { step: string; label: string; users: number; }
export function useAdminFeatureFunnel(from: Date, to: Date) {
  return useQuery({
    queryKey: ['admin-feature-funnel', from.toISOString(), to.toISOString()],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<FunnelStep[]> => {
      const { data, error } = await supabase.rpc('get_admin_feature_funnel' as any, {
        _from: from.toISOString(), _to: to.toISOString(),
      });
      if (error) throw error;
      return ((data as unknown) as FunnelStep[]) ?? [];
    },
  });
}

export interface HeatmapCell { dow: number; hour: number; hours: number; users: number; }
export function useAdminActivityHeatmap(from: Date, to: Date) {
  return useQuery({
    queryKey: ['admin-activity-heatmap', from.toISOString(), to.toISOString()],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<HeatmapCell[]> => {
      const { data, error } = await supabase.rpc('get_admin_activity_heatmap' as any, {
        _from: from.toISOString(), _to: to.toISOString(),
      });
      if (error) throw error;
      return ((data as unknown) as HeatmapCell[]) ?? [];
    },
  });
}

export interface UserDrilldown {
  profile: {
    full_name?: string;
    phone?: string;
    company_name?: string;
    company_email?: string;
    role?: string;
    approved_at?: string | null;
    is_approved?: boolean;
    days_since_approval?: number | null;
    auth_email?: string;
    last_country?: string | null;
  };
  sessions: { day: string; hours: number; events: number }[];
  modules: { module: string; hours: number; minutes: number }[];
  orders: { count: number; total: number; recent: Array<{ id: string; order_number: string; status: string; total: number; created_at: string }> };
  quotes: { count: number; recent: Array<{ id: string; ref_number: string; product_label: string; total_price: number; status: string; created_at: string }> };
  last_invoice: { id: string; invoice_number: string; total: number; paid_amount: number; status: string; issue_date: string; due_date: string } | null;
  recent_countries: Array<{ country_code: string; last_seen: string }>;
}
export function useAdminUserDrilldown(
  userId: string | null,
  range?: { from: Date; to: Date }
) {
  const fromIso = range?.from.toISOString() ?? null;
  const toIso = range?.to.toISOString() ?? null;
  return useQuery({
    queryKey: ['admin-user-drilldown', userId, fromIso, toIso],
    enabled: !!userId,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<UserDrilldown> => {
      const params: any = { _user_id: userId! };
      if (fromIso) params._from = fromIso;
      if (toIso) params._to = toIso;
      const { data, error } = await supabase.rpc('get_admin_user_drilldown' as any, params);
      if (error) throw error;
      return (data as unknown) as UserDrilldown;
    },
  });
}

export interface AlertSettings {
  admin_user_id: string;
  churn_threshold: number;
  inactivity_days: number;
  email_enabled: boolean;
  last_sent_at: string | null;
}
export function useAdminAlertSettings() {
  return useQuery({
    queryKey: ['admin-alert-settings'],
    queryFn: async (): Promise<AlertSettings | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from('admin_alert_settings')
        .select('*')
        .eq('admin_user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as AlertSettings | null;
    },
  });
}
