import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const HEARTBEAT_MS = 15000;
const FLUSH_MS = 60000;
const IDLE_MS = 180000;

const PUBLIC_ROUTE_PREFIXES = [
  '/auth',
  '/reset-password',
  '/confidentialitate',
  '/cookies',
  '/termeni',
  '/despre-noi',
  '/embed',
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/' || pathname === '/landing') return true;
  return PUBLIC_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function routeToModule(pathname: string): string {
  if (pathname.startsWith('/calculator')) return 'calculators';
  if (pathname.startsWith('/comenzi')) return 'orders';
  if (pathname.startsWith('/productie')) return 'production';
  if (pathname.startsWith('/inventar')) return 'inventory';
  if (pathname.startsWith('/clienti')) return 'crm';
  if (pathname.startsWith('/instalare') || pathname.startsWith('/montaj') || pathname.startsWith('/rapoarte-montaj')) return 'installation';
  if (pathname.startsWith('/facturare')) return 'invoicing';
  if (pathname.startsWith('/sticla') || pathname.startsWith('/optimizare')) return 'cutting';
  if (pathname.startsWith('/procesare') || pathname.startsWith('/prelucrari')) return 'processing';
  if (pathname.startsWith('/service') || pathname.startsWith('/reclamatii')) return 'service';
  if (pathname.startsWith('/rapoarte')) return 'reports';
  if (pathname.startsWith('/setari')) return 'settings';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/operational')) return 'operational';
  if (pathname.startsWith('/dashboard') || pathname === '/') return 'dashboard';
  return 'other';
}

interface Bucket {
  route: string;
  module: string;
  seconds: number;
}

export function useActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const routeRef = useRef(location.pathname);
  const bucketsRef = useRef<Map<string, Bucket>>(new Map());
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => { routeRef.current = location.pathname; }, [location.pathname]);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setIsAdmin(null); setIsApproved(null); return; }
    (async () => {
      const [roleRes, profileRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
        supabase.from('profiles').select('is_approved').eq('user_id', user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setIsAdmin(!!roleRes.data);
      setIsApproved(profileRes.data?.is_approved ?? false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (isAdmin !== false) return; // skip tracking until we know user is NOT admin
    if (isApproved !== true) return; // skip tracking for unapproved users (avoids ghost activity)

    const markActive = () => { lastActivityRef.current = Date.now(); };
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, markActive, { passive: true }));

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!document.hasFocus()) return;
      if (Date.now() - lastActivityRef.current > IDLE_MS) return;
      const route = routeRef.current;
      if (isPublicRoute(route)) return;
      const module = routeToModule(route);
      const key = `${route}::${module}`;
      const cur = bucketsRef.current.get(key) ?? { route, module, seconds: 0 };
      cur.seconds += HEARTBEAT_MS / 1000;
      bucketsRef.current.set(key, cur);
    }, HEARTBEAT_MS);

    const flush = async (sync = false) => {
      if (!user) return;
      const buckets = Array.from(bucketsRef.current.values()).filter(b => b.seconds > 0);
      if (buckets.length === 0) return;
      bucketsRef.current.clear();
      const rows = buckets.map(b => ({
        user_id: user.id,
        route: b.route,
        module: b.module,
        active_seconds: Math.round(b.seconds),
      }));
      try {
        const payloadBuckets = rows.map(r => ({
          route: r.route, module: r.module, active_seconds: r.active_seconds,
        }));
        const { error } = await supabase.functions.invoke('track-activity', {
          body: { buckets: payloadBuckets },
        });
        if (error) throw error;
      } catch (e) {
        // re-buffer on failure
        buckets.forEach(b => {
          const key = `${b.route}::${b.module}`;
          const cur = bucketsRef.current.get(key) ?? { route: b.route, module: b.module, seconds: 0 };
          cur.seconds += b.seconds;
          bucketsRef.current.set(key, cur);
        });
      }
    };

    const flushInterval = window.setInterval(() => { void flush(); }, FLUSH_MS);

    const onHide = () => {
      if (document.visibilityState === 'hidden') void flush(true);
    };
    const onUnload = () => { void flush(true); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onUnload);

    return () => {
      events.forEach(e => window.removeEventListener(e, markActive));
      window.clearInterval(heartbeat);
      window.clearInterval(flushInterval);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onUnload);
      void flush(true);
    };
  }, [user, isAdmin, isApproved]);
}
