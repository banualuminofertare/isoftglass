import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

interface QuoteSettings {
  tvaPercent: number;
  euroRate: number;
  preferredCurrency?: string;
}

async function fetchUserQuoteSettings(overrideUserId?: string | null): Promise<QuoteSettings> {
  let userId: string | undefined;
  if (overrideUserId) {
    userId = overrideUserId;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { tvaPercent: 21, euroRate: 4.97, preferredCurrency: 'RON' };
    userId = user.id;
  }
  
  // Use REST API directly for untyped table
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_quote_settings?user_id=eq.${userId}&select=*`;

  const res = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) return { tvaPercent: 21, euroRate: 4.97, preferredCurrency: 'RON' };

  const rows = await res.json();
  if (rows.length > 0) {
    return {
      tvaPercent: Number(rows[0].tva_percent) || 21,
      euroRate: Number(rows[0].euro_rate) || 4.97,
      preferredCurrency: rows[0].preferred_currency || 'RON',
    };
  }

  return { tvaPercent: 21, euroRate: 4.97, preferredCurrency: 'RON' };
}

async function upsertUserQuoteSettings(params: { settings: QuoteSettings; overrideUserId?: string | null }): Promise<void> {
  const { settings, overrideUserId } = params;
  let userId: string;
  if (overrideUserId) {
    userId = overrideUserId;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    userId = user.id;
  }

  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_quote_settings?on_conflict=user_id`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      tva_percent: settings.tvaPercent,
      euro_rate: settings.euroRate,
      ...(settings.preferredCurrency ? { preferred_currency: settings.preferredCurrency } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

export function useQuoteSettings(): QuoteSettings & { saveSettings: (settings: QuoteSettings) => Promise<void>; isSaving: boolean } {
  const queryClient = useQueryClient();
  const { targetUserId } = useAdminImpersonation();

  const { data } = useQuery({
    queryKey: ['user-quote-settings', targetUserId ?? 'self'],
    queryFn: () => fetchUserQuoteSettings(targetUserId),
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (settings: QuoteSettings) => upsertUserQuoteSettings({ settings, overrideUserId: targetUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-quote-settings'] });
    },
  });

  return {
    tvaPercent: data?.tvaPercent ?? 21,
    euroRate: data?.euroRate ?? 4.97,
    preferredCurrency: data?.preferredCurrency ?? 'RON',
    saveSettings: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}

/** @deprecated Use useQuoteSettings instead */
export function useTVA(): number {
  const { tvaPercent } = useQuoteSettings();
  return tvaPercent;
}
