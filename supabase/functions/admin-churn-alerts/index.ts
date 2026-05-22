import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Require cron secret OR admin JWT
  const cronSecret = req.headers.get('x-cron-secret')
  const expectedSecret = Deno.env.get('CRON_SECRET')
  let authorized = !!(expectedSecret && cronSecret && cronSecret === expectedSecret)

  if (!authorized) {
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const anonClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } },
      )
      const { data: { user } } = await anonClient.auth.getUser()
      if (user) {
        const { data: roleRow } = await anonClient
          .from('user_roles').select('role')
          .eq('user_id', user.id).eq('role', 'admin').maybeSingle()
        if (roleRow) authorized = true
      }
    }
  }

  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get all admin alert settings (one per admin)
    const { data: settingsList, error: sErr } = await supabase
      .from('admin_alert_settings')
      .select('*')
    if (sErr) throw sErr

    let totalChurn = 0
    let totalInactive = 0
    const results: any[] = []

    for (const settings of settingsList ?? []) {
      const { data: targets, error: tErr } = await supabase.rpc('get_admin_churn_alert_targets', {
        _churn_threshold: settings.churn_threshold,
        _inactivity_days: settings.inactivity_days,
      })
      if (tErr) { results.push({ admin: settings.admin_user_id, error: tErr.message }); continue }

      const churn = (targets as any)?.churn ?? []
      const inactive = (targets as any)?.inactive ?? []
      totalChurn += churn.length
      totalInactive += inactive.length

      if (churn.length === 0 && inactive.length === 0) continue

      const title = `⚠️ Alertă abonați: ${churn.length} risc churn, ${inactive.length} inactivi`
      const lines: string[] = []
      if (churn.length) {
        lines.push(`**Risc churn ≥${settings.churn_threshold}:**`)
        churn.slice(0, 10).forEach((c: any) => lines.push(`- ${c.full_name} (${c.company_name}) — scor ${c.score}, ${c.top_reason}`))
        if (churn.length > 10) lines.push(`...și încă ${churn.length - 10}`)
      }
      if (inactive.length) {
        lines.push('')
        lines.push(`**Inactivi ≥${settings.inactivity_days} zile:**`)
        inactive.slice(0, 10).forEach((i: any) => lines.push(`- ${i.full_name} (${i.company_name}) — ${i.days_inactive} zile`))
        if (inactive.length > 10) lines.push(`...și încă ${inactive.length - 10}`)
      }
      const content = lines.join('\n')

      // Insert in-app announcement
      await supabase.from('admin_announcements').insert({
        created_by: settings.admin_user_id,
        title,
        content,
        category: 'general',
        is_pinned: false,
        is_published: true,
      })

      // Optional email
      if (settings.email_enabled) {
        const RESEND = Deno.env.get('RESEND_API_KEY')
        const { data: { user: adminUser } } = await supabase.auth.admin.getUserById(settings.admin_user_id)
        if (RESEND && adminUser?.email) {
          const html = `<h2>${title}</h2><pre style="font-family:inherit;white-space:pre-wrap">${content.replace(/</g, '&lt;')}</pre>`
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'IsoftGlass Analytics <onboarding@resend.dev>',
              to: [adminUser.email],
              subject: title,
              html,
            }),
          })
        }
      }

      await supabase.from('admin_alert_settings')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('admin_user_id', settings.admin_user_id)

      results.push({ admin: settings.admin_user_id, churn: churn.length, inactive: inactive.length })
    }

    return new Response(JSON.stringify({
      ok: true,
      admins_processed: settingsList?.length ?? 0,
      churn_count: totalChurn,
      inactive_count: totalInactive,
      details: results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
