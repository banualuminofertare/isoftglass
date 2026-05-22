import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'production_manager' | 'sales' | 'operator';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  companyId: string | null;
  isCompanyOwner: boolean;
  hasProcessingAccess: boolean;
  hasCalculatorAccess: boolean;
  hasOperationalAccess: boolean;
  hasTeamAccess: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string, companyName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);
  const [hasProcessingAccess, setHasProcessingAccess] = useState(false);
  const [hasCalculatorAccess, setHasCalculatorAccess] = useState(true);
  const [hasOperationalAccess, setHasOperationalAccess] = useState(true);
  const [hasTeamAccess, setHasTeamAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Restore session from storage FIRST
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      if (session) {
        // Validate token is actually valid server-side
        const { data: { user: validUser }, error: userError } = await supabase.auth.getUser();
        if (!isMounted) return;
        
        if (userError || !validUser) {
          console.warn('[Auth] Stale session detected, signing out:', userError?.message);
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(validUser);
        fetchUserRole(validUser.id);
      } else {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    // THEN listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer to avoid deadlock
          setTimeout(() => {
            if (isMounted) fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setCompanyId(null);
          setIsCompanyOwner(false);
          setHasProcessingAccess(false);
          setHasCalculatorAccess(true);
          setHasOperationalAccess(true);
          setHasTeamAccess(false);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Verify session is still valid before querying
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        // Session expired or was invalidated – reset state
        setUser(null);
        setSession(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const [roleRes, profileRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
        supabase.from('profiles').select('has_processing_access, has_calculator_access, has_operational_access, has_team_access, company_id').eq('user_id', userId).maybeSingle(),
      ]);

      if (roleRes.error) {
        console.error('Error fetching user role:', roleRes.error);
        setRole('sales');
      } else {
        setRole((roleRes.data?.role as AppRole) ?? 'sales');
      }

      setHasProcessingAccess(profileRes.data?.has_processing_access ?? false);
      setHasCalculatorAccess((profileRes.data as any)?.has_calculator_access ?? true);
      setHasOperationalAccess((profileRes.data as any)?.has_operational_access ?? true);
      setHasTeamAccess((profileRes.data as any)?.has_team_access ?? false);
      
      const cId = (profileRes.data as any)?.company_id ?? null;
      setCompanyId(cId);
      
      // Check if user is company owner
      if (cId) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('owner_id')
          .eq('id', cId)
          .maybeSingle();
        setIsCompanyOwner(companyData?.owner_id === userId);
      } else {
        setIsCompanyOwner(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setRole('sales');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string, companyName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone || '',
          company_name: companyName || '',
        },
      },
    });

    // Send notification email after successful signup
    if (!error) {
      try {
        await supabase.functions.invoke('notify-new-subscriber', {
          body: {
            name: fullName,
            email,
            phone: phone || '',
            company_name: companyName || '',
          },
        });
      } catch (notifyErr) {
        console.error('Failed to send notification:', notifyErr);
      }
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setHasProcessingAccess(false);
    setHasCalculatorAccess(true);
    setHasOperationalAccess(true);
    setHasTeamAccess(false);
    setCompanyId(null);
    setIsCompanyOwner(false);
  };

  const refetchProfile = () => {
    if (user) fetchUserRole(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, companyId, isCompanyOwner, hasProcessingAccess, hasCalculatorAccess, hasOperationalAccess, hasTeamAccess, loading, signIn, signUp, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
