// Validează un CUI/CIF prin API-ul public ANAF (gratuit, fără certificat)
// Endpoint: https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface AnafRequest {
  cui: number;
  data: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Require authenticated user (prevent open proxy abuse)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { cui } = await req.json();
    if (!cui) {
      return new Response(JSON.stringify({ error: 'CUI lipsă' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Curăță prefixul RO și non-cifre
    const cleanCui = String(cui).replace(/^RO/i, '').replace(/\D/g, '');
    if (!cleanCui || cleanCui.length < 2 || cleanCui.length > 10) {
      return new Response(JSON.stringify({ error: 'Format CUI invalid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const payload: AnafRequest[] = [{ cui: Number(cleanCui), data: today }];

    const resp = await fetch('https://webservicesp.anaf.ro/PlatitorTvaRest/api/v9/ws/tva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: `ANAF răspuns ${resp.status}: ${text}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const found = data?.found?.[0];
    if (!found) {
      return new Response(JSON.stringify({ error: 'CUI negăsit la ANAF', notFound: data?.notFound }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const general = found.date_generale || {};
    const vat = found.inregistrare_scop_Tva || {};
    const addr = found.adresa_sediu_social || {};

    return new Response(JSON.stringify({
      cui: 'RO' + cleanCui,
      name: general.denumire || '',
      reg_com: general.nrRegCom || '',
      address: addr.sdenumire_Strada
        ? `${addr.sdenumire_Strada} ${addr.snumar_Strada || ''}${addr.sdetalii_Adresa ? ', ' + addr.sdetalii_Adresa : ''}`.trim()
        : general.adresa || '',
      city: addr.sdenumire_Localitate || general.adresa || '',
      county: addr.sdenumire_Judet || general.adresa || '',
      postal_code: addr.scod_Postal || '',
      country: 'RO',
      phone: general.telefon || '',
      vat_payer: !!vat.scpTVA,
      vat_id: vat.scpTVA ? 'RO' + cleanCui : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
