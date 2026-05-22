import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import i18next from 'i18next';

export interface SlidingMechanism {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  door_height_deduction: number;
  fixed_panel_height_deduction: number;
  width_overlap: number;
  is_active: boolean;
  sort_order: number;
}

export function useSlidingMechanisms() {
  const { companyId } = useAuth();
  const [mechanisms, setMechanisms] = useState<SlidingMechanism[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMechanisms = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('sliding_mechanisms')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching sliding mechanisms:', error);
    } else {
      setMechanisms((data as any[]) || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchMechanisms(); }, [fetchMechanisms]);

  const addMechanism = useCallback(async (mech: Omit<SlidingMechanism, 'id' | 'sort_order'>) => {
    const { error } = await supabase
      .from('sliding_mechanisms')
      .insert({ ...mech, company_id: companyId } as any);
    if (error) { toast.error(i18next.t('toasts.mechanisms.addError')); return false; }
    toast.success(i18next.t('toasts.mechanisms.added'));
    fetchMechanisms();
    return true;
  }, [companyId, fetchMechanisms]);

  const updateMechanism = useCallback(async (id: string, updates: Partial<SlidingMechanism>) => {
    const { error } = await supabase
      .from('sliding_mechanisms')
      .update(updates as any)
      .eq('id', id);
    if (error) { toast.error(i18next.t('toasts.mechanisms.updateError')); return false; }
    toast.success(i18next.t('toasts.mechanisms.updated'));
    fetchMechanisms();
    return true;
  }, [fetchMechanisms]);

  const deleteMechanism = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('sliding_mechanisms')
      .delete()
      .eq('id', id);
    if (error) { toast.error(i18next.t('toasts.mechanisms.deleteError')); return false; }
    toast.success(i18next.t('toasts.mechanisms.deleted'));
    fetchMechanisms();
    return true;
  }, [fetchMechanisms]);

  const activeMechanisms = mechanisms.filter(m => m.is_active);

  const getMechanismById = useCallback((id: string | undefined) => {
    return mechanisms.find(m => m.id === id) || null;
  }, [mechanisms]);

  return {
    mechanisms,
    activeMechanisms,
    isLoading,
    addMechanism,
    updateMechanism,
    deleteMechanism,
    getMechanismById,
    refetch: fetchMechanisms,
  };
}
