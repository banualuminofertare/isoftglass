import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Bucket {
  route: string;
  module: string;
  active_seconds: number;
}

function extractCountry(req: Request): string | null {
  const headers = req.headers;
  const candidates = [
    headers.get('cf-ipcountry'),
    headers.get('x-vercel-ip-country'),
    headers.get('x-country-code'),
    headers.get('x-geo-country'),
  ];
  for (const c of candidates) {
    if (c && c.length === 2 && c !== 'XX' && c !== 'T1') return c.toUpperCase();
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const buckets: Bucket[] = Array.isArray(body?.buckets) ? body.buckets : [];
    const userAgent = req.headers.get('user-agent')?.slice(0, 500) ?? null;
    const country = extractCountry(req);

    console.log('track-activity headers', JSON.stringify({
      userId,
      cf_ipcountry: req.headers.get('cf-ipcountry'),
      x_vercel_country: req.headers.get('x-vercel-ip-country'),
      x_country_code: req.headers.get('x-country-code'),
      x_geo_country: req.headers.get('x-geo-country'),
      x_forwarded_for: req.headers.get('x-forwarded-for'),
      x_real_ip: req.headers.get('x-real-ip'),
      cf_connecting_ip: req.headers.get('cf-connecting-ip'),
      user_agent: userAgent,
      origin: req.headers.get('origin'),
      resolved_country: country,
      buckets_count: buckets.length,
    }));

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Lookup user's company once
    const { data: profile } = await admin
      .from('profiles')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle();
    const companyId = profile?.company_id ?? null;

    let inserted = 0;
    if (buckets.length > 0) {
      const rows = buckets
        .filter((b) => b && typeof b.active_seconds === 'number' && b.active_seconds > 0)
        .slice(0, 100)
        .map((b) => ({
          user_id: userId,
          company_id: companyId,
          route: String(b.route ?? '').slice(0, 500),
          module: String(b.module ?? 'other').slice(0, 50),
          active_seconds: Math.min(900, Math.round(b.active_seconds)),
          country_code: country,
        }));
      if (rows.length > 0) {
        const { error: evErr } = await admin.from('user_activity_events').insert(rows);
        if (evErr) console.error('events insert error', evErr);
        else inserted = rows.length;
      }
    }

    // Upsert active session
    const totalSeconds = buckets.reduce((s, b) => s + (b?.active_seconds || 0), 0);
    const { error: sessErr } = await admin
      .from('user_activity_sessions')
      .upsert(
        {
          user_id: userId,
          company_id: companyId,
          country_code: country,
          user_agent: userAgent,
          last_seen_at: new Date().toISOString(),
          active_seconds: Math.round(totalSeconds),
          started_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      );
    if (sessErr) {
      // upsert may need separate update path if active_seconds should accumulate
      console.error('session upsert error', sessErr);
    }

    return new Response(
      JSON.stringify({ ok: true, inserted, country }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('track-activity error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
