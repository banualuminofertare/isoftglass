import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import i18next from 'i18next';

export type ProductionStage = 'cutting' | 'processing' | 'tempering' | 'coating' | 'assembly' | 'quality_control' | 'shipping';
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export const STAGE_LABELS: Record<ProductionStage, string> = {
  cutting: 'Debitare',
  processing: 'Prelucrări',
  tempering: 'Călire',
  coating: 'Lăcuire/Print',
  assembly: 'Asamblare',
  quality_control: 'Control Calitate',
  shipping: 'Expediere',
};

export const STAGE_ORDER: ProductionStage[] = [
  'cutting', 'processing', 'tempering', 'coating', 'assembly', 'quality_control', 'shipping'
];

export interface ProductionJob {
  id: string;
  job_number: string;
  order_id: string;
  order_product_id?: string;
  current_stage: ProductionStage;
  priority: number;
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  assigned_to?: string;
  notes?: string;
  client_name?: string;
  created_at: string;
  updated_at: string;
  orders?: {
    order_number: string;
    clients?: {
      name: string;
    };
  };
}

export interface ProductionStageRecord {
  id: string;
  job_id: string;
  stage: ProductionStage;
  status: StageStatus;
  operator_id?: string;
  operator_name?: string;
  started_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

export function useProductionJobs(stageFilter?: ProductionStage) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['production-jobs', stageFilter],
    queryFn: async () => {
      let query = supabase
        .from('production_jobs')
        .select(`
          *,
          orders (
            order_number,
            clients (name)
          )
        `)
        .is('completed_at', null)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });
      
      if (stageFilter) {
        query = query.eq('current_stage', stageFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ProductionJob[];
    },
  });

  const createJob = useMutation({
    mutationFn: async (job: Partial<ProductionJob>) => {
      // Generate job number
      const { data: jobNumber } = await supabase.rpc('generate_job_number');
      
      const insertData = {
        order_id: job.order_id!,
        order_product_id: job.order_product_id,
        current_stage: job.current_stage || 'cutting' as ProductionStage,
        priority: job.priority || 0,
        due_date: job.due_date,
        assigned_to: job.assigned_to,
        notes: job.notes,
        job_number: jobNumber as string,
      };
      
      const { data, error } = await supabase
        .from('production_jobs')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;

      // Initialize all stages
      const stages = STAGE_ORDER.map(stage => ({
        job_id: data.id,
        stage,
        status: 'pending' as StageStatus,
      }));

      await supabase.from('production_stages').insert(stages);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-jobs'] });
      toast({ title: i18next.t('production.jobCreated') });
    },
    onError: (error) => {
      toast({ title: i18next.t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const advanceStage = useMutation({
    mutationFn: async ({ jobId, notes }: { jobId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get current job
      const { data: job } = await supabase
        .from('production_jobs')
        .select('current_stage')
        .eq('id', jobId)
        .single();

      if (!job) throw new Error('Job not found');

      const currentIndex = STAGE_ORDER.indexOf(job.current_stage);
      const nextStage = STAGE_ORDER[currentIndex + 1];

      // Complete current stage
      await supabase
        .from('production_stages')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          operator_id: user?.id,
        })
        .eq('job_id', jobId)
        .eq('stage', job.current_stage);

      if (nextStage) {
        // Move to next stage
        await supabase
          .from('production_jobs')
          .update({ current_stage: nextStage })
          .eq('id', jobId);

        // Start next stage
        await supabase
          .from('production_stages')
          .update({ 
            status: 'in_progress',
            started_at: new Date().toISOString(),
          })
          .eq('job_id', jobId)
          .eq('stage', nextStage);
      } else {
        // Mark job as completed
        await supabase
          .from('production_jobs')
          .update({ 
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);
      }

      return { jobId, nextStage };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['production-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['production-stages'] });
      const stageName = data.nextStage ? i18next.t(`opDashboard.stages.${data.nextStage}`) : '';
      toast({ 
        title: data.nextStage 
          ? i18next.t('production.movedToStage', { stage: stageName })
          : i18next.t('production.productionCompleted')
      });
    },
    onError: (error) => {
      toast({ title: i18next.t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const startJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('production_jobs')
        .update({ 
          started_at: new Date().toISOString(),
          assigned_to: user?.id,
        })
        .eq('id', jobId);

      await supabase
        .from('production_stages')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString(),
          operator_id: user?.id,
        })
        .eq('job_id', jobId)
        .eq('stage', 'cutting');

      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-jobs'] });
      toast({ title: i18next.t('production.productionStarted') });
    },
    onError: (error) => {
      toast({ title: i18next.t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  // Group jobs by stage for Kanban
  const jobsByStage = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = jobs.filter(j => j.current_stage === stage);
    return acc;
  }, {} as Record<ProductionStage, ProductionJob[]>);

  return {
    jobs,
    jobsByStage,
    isLoading,
    error,
    createJob,
    advanceStage,
    startJob,
  };
}

export interface TeamMember {
  user_id: string;
  full_name: string | null;
}

export function useJobStages(jobId?: string) {
  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['production-stages', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('production_stages')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at');
      
      if (error) throw error;
      return data as ProductionStageRecord[];
    },
    enabled: !!jobId,
  });

  return { stages, isLoading };
}

export function useTeamMembers() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('company_id', profile.company_id);

      if (error) throw error;
      return (data || []) as TeamMember[];
    },
  });

  return { members, isLoading };
}

export function useAssignOperator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageId, operatorId }: { stageId: string; operatorId: string | null }) => {
      const { error } = await supabase
        .from('production_stages')
        .update({ operator_id: operatorId })
        .eq('id', stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-stages'] });
      queryClient.invalidateQueries({ queryKey: ['production-jobs'] });
    },
    onError: (error) => {
      toast({ title: i18next.t('common.error'), description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateOperatorName() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageId, operatorName }: { stageId: string; operatorName: string }) => {
      const { error } = await supabase
        .from('production_stages')
        .update({ operator_name: operatorName || null } as any)
        .eq('id', stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-stages'] });
      queryClient.invalidateQueries({ queryKey: ['production-jobs'] });
    },
    onError: (error) => {
      toast({ title: i18next.t('common.error'), description: error.message, variant: 'destructive' });
    },
  });
}

export function useProductionPerformance(periodDays: number = 30) {
  const { data: completedStages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ['production-performance-stages', periodDays],
    queryFn: async () => {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - periodDays);

      const { data, error } = await supabase
        .from('production_stages')
        .select('*')
        .eq('status', 'completed')
        .not('started_at', 'is', null)
        .not('completed_at', 'is', null)
        .gte('completed_at', periodStart.toISOString())
        .order('completed_at', { ascending: true });

      if (error) throw error;
      return data as ProductionStageRecord[];
    },
  });

  const { data: completedJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['production-performance-jobs', periodDays],
    queryFn: async () => {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - periodDays);

      const { data, error } = await supabase
        .from('production_jobs')
        .select('*')
        .not('completed_at', 'is', null)
        .gte('completed_at', periodStart.toISOString())
        .order('completed_at', { ascending: true });

      if (error) throw error;
      return data as ProductionJob[];
    },
  });

  const { data: activeJobsCount = 0 } = useQuery({
    queryKey: ['production-active-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('production_jobs')
        .select('*', { count: 'exact', head: true })
        .is('completed_at', null);

      if (error) throw error;
      return count || 0;
    },
  });

  const performance = useMemo(() => {
    // Calculate avg time per stage in hours
    const stageTimings: Record<string, number[]> = {};
    completedStages.forEach(s => {
      if (s.started_at && s.completed_at) {
        const duration = s.duration_minutes
          || (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000;
        if (!stageTimings[s.stage]) stageTimings[s.stage] = [];
        stageTimings[s.stage].push(duration);
      }
    });

    const avgTimePerStage = STAGE_ORDER.map(stage => {
      const times = stageTimings[stage] || [];
      const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      return {
        stage,
        name: STAGE_LABELS[stage],
        avgMinutes: avg,
        avgHours: parseFloat((avg / 60).toFixed(1)),
        count: times.length,
      };
    });

    // Bottleneck = stage with highest avg time
    const bottleneckStage = avgTimePerStage.reduce((prev, curr) =>
      curr.avgMinutes > prev.avgMinutes ? curr : prev
    , avgTimePerStage[0]);

    // Avg total time per job (sum of all stage averages, in days)
    const totalAvgMinutes = avgTimePerStage.reduce((sum, s) => sum + s.avgMinutes, 0);
    const avgTotalDays = parseFloat((totalAvgMinutes / 1440).toFixed(1)); // 1440 min = 1 day

    // Completion trend: group completed jobs by date
    const trendMap: Record<string, number> = {};
    completedJobs.forEach(j => {
      if (j.completed_at) {
        const dateKey = j.completed_at.substring(0, 10); // YYYY-MM-DD
        trendMap[dateKey] = (trendMap[dateKey] || 0) + 1;
      }
    });

    const completionTrend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      avgTimePerStage,
      bottleneckStage,
      completedJobsCount: completedJobs.length,
      activeJobsCount,
      avgTotalDays,
      completionTrend,
    };
  }, [completedStages, completedJobs, activeJobsCount]);

  return {
    ...performance,
    isLoading: stagesLoading || jobsLoading,
  };
}

export interface OperatorStageDetail {
  stageId: string;
  stage: ProductionStage;
  jobNumber: string;
  clientName: string;
  durationMinutes: number;
  completedAt: string;
}

export interface OperatorStat {
  name: string;
  stagesCount: number;
  avgMinutes: number;
  byStage: Record<ProductionStage, number>;
  details: OperatorStageDetail[];
}

export function useOperatorPerformance(periodDays: number = 30) {
  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ['operator-performance', periodDays],
    queryFn: async () => {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - periodDays);

      const { data, error } = await supabase
        .from('production_stages')
        .select(`
          id, stage, status, operator_name, started_at, completed_at, duration_minutes,
          production_jobs (job_number, client_name)
        `)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .gte('completed_at', periodStart.toISOString())
        .order('completed_at', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });

  const operatorStats = useMemo(() => {
    const map: Record<string, OperatorStat> = {};

    rawData.forEach(s => {
      const name = s.operator_name || '_unassigned_';
      if (!map[name]) {
        map[name] = {
          name,
          stagesCount: 0,
          avgMinutes: 0,
          byStage: {} as Record<ProductionStage, number>,
          details: [],
        };
      }
      const stat = map[name];
      stat.stagesCount++;
      const stage = s.stage as ProductionStage;
      stat.byStage[stage] = (stat.byStage[stage] || 0) + 1;

      const dur = s.duration_minutes
        || (s.started_at && s.completed_at
          ? (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000
          : 0);

      stat.details.push({
        stageId: s.id,
        stage,
        jobNumber: s.production_jobs?.job_number || '-',
        clientName: s.production_jobs?.client_name || '-',
        durationMinutes: dur,
        completedAt: s.completed_at,
      });
    });

    // Compute averages
    Object.values(map).forEach(stat => {
      const totalMin = stat.details.reduce((sum, d) => sum + d.durationMinutes, 0);
      stat.avgMinutes = stat.stagesCount > 0 ? totalMin / stat.stagesCount : 0;
    });

    return Object.values(map).sort((a, b) => b.stagesCount - a.stagesCount);
  }, [rawData]);

  return { operatorStats, isLoading };
}
