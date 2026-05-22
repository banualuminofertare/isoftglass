import { supabase } from '@/integrations/supabase/client';

const MAX_ERRORS_PER_MINUTE = 10;
let errorCount = 0;
let resetTimer: ReturnType<typeof setTimeout> | null = null;

function startRateLimitReset() {
  if (!resetTimer) {
    resetTimer = setTimeout(() => {
      errorCount = 0;
      resetTimer = null;
    }, 60_000);
  }
}

export async function reportError(
  error: Error | string,
  extra?: { componentStack?: string; metadata?: Record<string, unknown> }
) {
  errorCount++;
  startRateLimitReset();

  if (errorCount > MAX_ERRORS_PER_MINUTE) {
    console.warn('[errorReporter] Rate limit exceeded, skipping report');
    return;
  }

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? null : error.stack ?? null;

  const { data: { session } } = await supabase.auth.getSession();

  try {
    await supabase.from('client_error_logs' as any).insert({
      user_id: session?.user?.id ?? null,
      error_message: errorMessage.slice(0, 2000),
      error_stack: errorStack?.slice(0, 5000) ?? null,
      component_stack: extra?.componentStack?.slice(0, 5000) ?? null,
      url: window.location.href,
      user_agent: navigator.userAgent,
      metadata: {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        ...extra?.metadata,
      },
    });
  } catch (e) {
    console.error('[errorReporter] Failed to report error:', e);
  }
}

export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, {
      metadata: { type: 'window.onerror', filename: event.filename, lineno: event.lineno },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason instanceof Error ? event.reason : String(event.reason);
    reportError(msg instanceof Error ? msg : new Error(String(msg)), {
      metadata: { type: 'unhandledrejection' },
    });
  });
}
