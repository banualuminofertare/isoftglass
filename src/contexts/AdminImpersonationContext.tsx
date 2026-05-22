import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminImpersonationState {
  targetUserId: string | null;
  targetUserName: string | null;
  isImpersonating: boolean;
  setTargetUser: (userId: string, name: string) => Promise<void> | void;
  clearTarget: () => Promise<void> | void;
}

const AdminImpersonationContext = createContext<AdminImpersonationState>({
  targetUserId: null,
  targetUserName: null,
  isImpersonating: false,
  setTargetUser: () => {},
  clearTarget: () => {},
});

export function AdminImpersonationProvider({ children }: { children: ReactNode }) {
  const { role, user } = useAuth();
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState<string | null>(null);

  const isAdmin = role === 'admin';

  // On admin sign-in, clear any stale active impersonation server-side
  // so previously "accepted" requests don't leak data into the normal view.
  useEffect(() => {
    if (!isAdmin || !user) return;
    let cancelled = false;
    (async () => {
      const { error } = await supabase.rpc('clear_impersonation_target');
      if (cancelled) return;
      if (error) {
        // Not critical — just log
        console.warn('[impersonation] clear on mount failed:', error.message);
      }
    })();
    return () => { cancelled = true; };
  }, [isAdmin, user?.id]);

  const setTargetUser = useCallback(async (userId: string, name: string) => {
    if (!isAdmin) return;
    const { error } = await supabase.rpc('set_impersonation_target', {
      _target_user_id: userId,
    });
    if (error) {
      toast.error(`Nu pot porni impersonarea: ${error.message}`);
      return;
    }
    setTargetUserId(userId);
    setTargetUserName(name);
  }, [isAdmin]);

  const clearTarget = useCallback(async () => {
    const { error } = await supabase.rpc('clear_impersonation_target');
    if (error) {
      console.warn('[impersonation] clear failed:', error.message);
    }
    setTargetUserId(null);
    setTargetUserName(null);
  }, []);

  return (
    <AdminImpersonationContext.Provider
      value={{
        targetUserId: isAdmin ? targetUserId : null,
        targetUserName: isAdmin ? targetUserName : null,
        isImpersonating: isAdmin && !!targetUserId,
        setTargetUser,
        clearTarget,
      }}
    >
      {children}
    </AdminImpersonationContext.Provider>
  );
}

export function useAdminImpersonation() {
  return useContext(AdminImpersonationContext);
}
