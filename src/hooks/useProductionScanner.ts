import { useState } from 'react';
import i18next from 'i18next';
import { supabase } from '@/integrations/supabase/client';
import { useProductionJobs, type ProductionJob } from '@/hooks/useProduction';
import { useToast } from '@/hooks/use-toast';

export function useProductionScanner() {
  const [scannedJob, setScannedJob] = useState<ProductionJob | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { advanceStage, startJob } = useProductionJobs();
  const { toast } = useToast();

  const findJobByNumber = async (jobNumber: string) => {
    setIsSearching(true);
    try {
      const trimmed = jobNumber.trim();
      if (!trimmed) return;

      const { data, error } = await supabase
        .from('production_jobs')
        .select(`
          *,
          orders (
            order_number,
            clients (name)
          )
        `)
        .eq('job_number', trimmed)
        .is('completed_at', null)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: i18next.t('scanner.notFound'),
          description: i18next.t('scanner.notFoundDesc', { number: trimmed }),
          variant: 'destructive',
        });
        setScannedJob(null);
        return;
      }

      setScannedJob(data as ProductionJob);
    } catch (err: any) {
      toast({ title: i18next.t('common.error'), description: err.message, variant: 'destructive' });
      setScannedJob(null);
    } finally {
      setIsSearching(false);
    }
  };

  const confirmStage = async () => {
    if (!scannedJob) return;

    try {
      if (!scannedJob.started_at) {
        await startJob.mutateAsync(scannedJob.id);
      } else {
        await advanceStage.mutateAsync({ jobId: scannedJob.id });
      }
      setScannedJob(null);
    } catch (err: any) {
      toast({ title: i18next.t('common.error'), description: err.message, variant: 'destructive' });
    }
  };

  const clearJob = () => setScannedJob(null);

  return {
    scannedJob,
    isSearching,
    findJobByNumber,
    confirmStage,
    clearJob,
    isPending: advanceStage.isPending || startJob.isPending,
  };
}
