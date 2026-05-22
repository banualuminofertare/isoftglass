import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsKpis {
  total_active_users: number;
  total_hours: number;
  total_events: number;
  avg_hours_per_user_per_day: number;
}
export interface TopUser {
  user_id: string;
  full_name: string;
  company_name: string;
  country_code: string;
  role: string;
  hours: number;
  last_active: string;
}
export interface ModuleUsage { module: string; hours: number; }
export interface CountryUsage { country_code: string; hours: number; users: number; }
export interface PerUserRow {
  user_id: string;
  full_name: string;
  company_name: string;
  country_code: string;
  role: string;
  hours: number;
  active_days: number;
  distinct_modules: number;
  top_module: string | null;
  last_active: string;
  engagement_score: number;
}

export interface AdminAnalyticsData {
  kpis: AnalyticsKpis;
  top_users: TopUser[];
  module_usage: ModuleUsage[];
  country_usage: CountryUsage[];
  per_user: PerUserRow[];
}

export function useAdminAnalytics(from: Date, to: Date) {
  return useQuery({
    queryKey: ['admin-analytics', from.toISOString(), to.toISOString()],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async (): Promise<AdminAnalyticsData> => {
      const { data, error } = await supabase.rpc('get_admin_analytics', {
        _from: from.toISOString(),
        _to: to.toISOString(),
      });
      if (error) throw error;
      return (data as unknown) as AdminAnalyticsData;
    },
  });
}

export interface UserDetail {
  modules: ModuleUsage[];
  timeline: { day: string; hours: number }[];
}

export function useAdminUserAnalytics(userId: string | null, from: Date, to: Date) {
  return useQuery({
    queryKey: ['admin-user-analytics', userId, from.toISOString(), to.toISOString()],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async (): Promise<UserDetail> => {
      const { data, error } = await supabase.rpc('get_admin_user_analytics', {
        _user_id: userId!,
        _from: from.toISOString(),
        _to: to.toISOString(),
      });
      if (error) throw error;
      return (data as unknown) as UserDetail;
    },
  });
}

export interface LiveUser {
  user_id: string;
  full_name: string;
  company_name: string;
  country_code: string;
  role: string;
  current_module: string | null;
  last_active: string;
  active_seconds_5min: number;
}

export function useAdminLiveUsers() {
  return useQuery({
    queryKey: ['admin-live-users'],
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<LiveUser[]> => {
      const { data, error } = await supabase.rpc('get_admin_live_users' as any);
      if (error) throw error;
      return ((data as unknown) as LiveUser[]) ?? [];
    },
  });
}

export interface SubscriberRow {
  user_id: string;
  full_name: string;
  company_name: string;
  country_code: string;
  role: string;
  last_active: string | null;
  total_hours: number;
}

export function useAdminAllSubscribers() {
  return useQuery({
    queryKey: ['admin-all-subscribers'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<SubscriberRow[]> => {
      const { data, error } = await supabase.rpc('get_admin_all_subscribers' as any);
      if (error) throw error;
      return ((data as unknown) as SubscriberRow[]) ?? [];
    },
  });
}

export interface ActivityTrendPoint {
  day: string;
  dau: number;
  wau: number;
  mau: number;
  hours: number;
}
export function useAdminActivityTrend(from: Date, to: Date) {
  return useQuery({
    queryKey: ['admin-activity-trend', from.toISOString(), to.toISOString()],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ActivityTrendPoint[]> => {
      const { data, error } = await supabase.rpc('get_admin_activity_trend' as any, {
        _from: from.toISOString(),
        _to: to.toISOString(),
      });
      if (error) throw error;
      return ((data as unknown) as ActivityTrendPoint[]) ?? [];
    },
  });
}

export interface ChurnRiskRow {
  user_id: string;
  full_name: string;
  company_name: string;
  last_active: string | null;
  inactivity_pts: number;
  trend_pts: number;
  modules_pts: number;
  onboarding_pts: number;
  score: number;
  top_reason: string;
}
export function useAdminChurnRisk() {
  return useQuery({
    queryKey: ['admin-churn-risk'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ChurnRiskRow[]> => {
      const { data, error } = await supabase.rpc('get_admin_churn_risk' as any);
      if (error) throw error;
      return ((data as unknown) as ChurnRiskRow[]) ?? [];
    },
  });
}

export interface CohortRow {
  cohort_month: string;
  cohort_size: number;
  m0: number; m1: number; m2: number; m3: number; m4: number; m5: number;
}
export function useAdminCohortRetention(months = 6) {
  return useQuery({
    queryKey: ['admin-cohort-retention', months],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<CohortRow[]> => {
      const { data, error } = await supabase.rpc('get_admin_cohort_retention' as any, { _months: months });
      if (error) throw error;
      return ((data as unknown) as CohortRow[]) ?? [];
    },
  });
}

export interface TopModuleRow {
  module: string;
  total_hours: number;
  unique_users: number;
}
export function useAdminTopModules(from: Date, to: Date) {
  return useQuery({
    queryKey: ['admin-top-modules', from.toISOString(), to.toISOString()],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<TopModuleRow[]> => {
      const { data, error } = await supabase.rpc('get_admin_top_modules' as any, {
        _from: from.toISOString(),
        _to: to.toISOString(),
      });
      if (error) throw error;
      return ((data as unknown) as TopModuleRow[]) ?? [];
    },
  });
}
