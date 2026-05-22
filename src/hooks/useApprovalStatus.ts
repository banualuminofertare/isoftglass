import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useApprovalStatus() {
  const { user, role } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (isAdmin) {
      setIsApproved(true);
      setLoading(false);
      return;
    }

    const fetchApproval = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching approval status:', error);
          setIsApproved(false);
        } else {
          setIsApproved(data?.is_approved ?? false);
        }
      } catch (err) {
        console.error('Error:', err);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    };

    fetchApproval();
  }, [user, isAdmin]);

  return { isApproved, loading, isAdmin };
}
