import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  currency: string;
}

interface UserSubscription {
  id: string;
  status: string;
  starts_at: string;
  expires_at: string;
  plan: SubscriptionPlan;
}

export function useSubscription() {
  const { user, role } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Admins bypass subscription check
    if (isAdmin) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const [subRes, plansRes] = await Promise.all([
          supabase
            .from('user_subscriptions')
            .select('id, status, starts_at, expires_at, plan_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gte('expires_at', new Date().toISOString())
            .order('expires_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('duration_months', { ascending: true }),
        ]);

        if (plansRes.data) {
          setPlans(plansRes.data);
        }

        if (subRes.data) {
          const plan = plansRes.data?.find((p: SubscriptionPlan) => p.id === subRes.data.plan_id);
          setSubscription({
            id: subRes.data.id,
            status: subRes.data.status,
            starts_at: subRes.data.starts_at,
            expires_at: subRes.data.expires_at,
            plan: plan!,
          });
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, isAdmin]);

  const hasActiveSubscription = isAdmin || !!subscription;

  return { subscription, plans, loading, hasActiveSubscription, isAdmin };
}
