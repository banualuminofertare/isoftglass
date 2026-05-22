import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const escHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify JWT - only authenticated users can call this
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const callerUserId = claimsData.claims.sub as string

    // Only allow notification for the caller's own freshly-created profile (within last 10 minutes).
    // This prevents any authenticated user from spamming the admin inbox with arbitrary payloads.
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: profile } = await adminClient
      .from('profiles')
      .select('user_id, full_name, phone, company_name, created_at')
      .eq('user_id', callerUserId)
      .maybeSingle()
    if (!profile) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const createdAt = profile.created_at ? new Date(profile.created_at).getTime() : 0
    if (Date.now() - createdAt > 10 * 60 * 1000) {
      return new Response(JSON.stringify({ error: 'Notification window expired' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Resolve caller email from auth (do not trust client-supplied email)
    const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(callerUserId)

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // HTML-escape all server-derived values (ignore client payload entirely)
    const safeName = escHtml(String(profile.full_name || 'N/A'))
    const safeEmail = escHtml(String(authUser?.email || 'N/A'))
    const safePhone = escHtml(String(profile.phone || 'N/A'))
    const safeCompany = escHtml(String(profile.company_name || 'N/A'))

    const emailHtml = `
      <h2>Abonat nou pe IsoftGlass ERP</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nume</td><td style="padding: 8px; border: 1px solid #ddd;">${safeName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${safeEmail}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Telefon</td><td style="padding: 8px; border: 1px solid #ddd;">${safePhone}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Companie</td><td style="padding: 8px; border: 1px solid #ddd;">${safeCompany}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666;">Acest email a fost trimis automat de IsoftGlass ERP.</p>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'IsoftGlass ERP <onboarding@resend.dev>',
        to: ['banualumin.ofertare@gmail.com'],
        subject: `Abonat nou - ${safeName}`,
        html: emailHtml,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data)
      return new Response(JSON.stringify({ error: 'Email sending failed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
