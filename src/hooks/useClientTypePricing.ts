import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import i18next from 'i18next';
import type { ClientType } from '@/hooks/useClients';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

export interface ClientTypePricing {
  id: string;
  client_type: ClientType;
  markup_percent: number;
  user_id?: string | null;
  is_override?: boolean;
  base_markup?: number;
  created_at: string;
  updated_at: string;
}

export function useClientTypePricing() {
  const [pricingRules, setPricingRules] = useState<ClientTypePricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { targetUserId } = useAdminImpersonation();

  const fetchPricing = async () => {
    try {
      let userId: string | undefined;
      if (targetUserId) {
        userId = targetUserId;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }

      const { data, error } = await supabase
        .from('client_type_pricing')
        .select('*')
        .order('client_type');

      if (error) throw error;

      const allRows = (data || []).map(row => ({
        ...row,
        client_type: row.client_type as ClientType,
        markup_percent: Number(row.markup_percent),
        user_id: (row as any).user_id as string | null,
      }));

      // Separate base rows (user_id IS NULL) and user overrides
      const baseRows = allRows.filter(r => r.user_id === null);
      const userRows = allRows.filter(r => r.user_id === userId);
      const userMap = new Map(userRows.map(r => [r.client_type, r]));

      const merged: ClientTypePricing[] = [];
      for (const base of baseRows) {
        const override = userMap.get(base.client_type);
        if (override) {
          merged.push({
            ...override,
            is_override: true,
            base_markup: base.markup_percent,
          });
        } else {
          merged.push({ ...base, is_override: false });
        }
      }

      setPricingRules(merged);
    } catch (error) {
      console.error('Error fetching client type pricing:', error);
      toast.error(i18next.t('toasts.clientPricing.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, [targetUserId]);

  const updateMarkup = async (client_type: ClientType, markup_percent: number) => {
    const rule = pricingRules.find(r => r.client_type === client_type);
    if (!rule) return;

    // If it's a base item, create a user override
    if (!rule.user_id) {
      try {
        let effectiveUserId: string;
        if (targetUserId) {
          effectiveUserId = targetUserId;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Nu ești autentificat');
          effectiveUserId = user.id;
        }

        const { data, error } = await supabase
          .from('client_type_pricing')
          .insert({
            client_type,
            markup_percent,
            user_id: effectiveUserId,
          } as any)
          .select()
          .single();

        if (error) throw error;

        setPricingRules(prev => prev.map(r =>
          r.client_type === client_type
            ? {
                ...data,
                client_type: data.client_type as ClientType,
                markup_percent: Number(data.markup_percent),
                user_id: (data as any).user_id as string | null,
                is_override: true,
                base_markup: rule.markup_percent,
              }
            : r
        ));
      } catch (error: any) {
        toast.error(i18next.t('toasts.clientPricing.saveError') + ': ' + error.message);
      }
      return;
    }

    // Update existing user override
    try {
      const { error } = await supabase
        .from('client_type_pricing')
        .update({ markup_percent })
        .eq('id', rule.id);

      if (error) throw error;

      setPricingRules(prev => prev.map(r =>
        r.id === rule.id ? { ...r, markup_percent } : r
      ));
    } catch (error: any) {
      toast.error(i18next.t('toasts.clientPricing.saveError') + ': ' + error.message);
    }
  };

  const resetToBase = async (client_type: ClientType) => {
    const rule = pricingRules.find(r => r.client_type === client_type);
    if (!rule || !rule.user_id) return;

    try {
      const { error } = await supabase
        .from('client_type_pricing')
        .delete()
        .eq('id', rule.id);

      if (error) throw error;
      await fetchPricing();
    } catch (error: any) {
      toast.error(i18next.t('toasts.clientPricing.resetError') + ': ' + error.message);
    }
  };

  const getMarkup = (clientType: ClientType): number => {
    const rule = pricingRules.find(r => r.client_type === clientType);
    return rule?.markup_percent ?? 0;
  };

  return { pricingRules, isLoading, updateMarkup, resetToBase, getMarkup, refetch: fetchPricing };
}
