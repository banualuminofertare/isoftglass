import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const headers = { ...corsHeaders, 'Content-Type': 'application/json' }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token)
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    // Get caller's company
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('user_id', caller.id)
      .single()

    if (!callerProfile?.company_id) {
      return new Response(JSON.stringify({ error: 'No company' }), { status: 400, headers })
    }

    // Verify caller is company owner
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('owner_id')
      .eq('id', callerProfile.company_id)
      .single()

    if (company?.owner_id !== caller.id) {
      return new Response(JSON.stringify({ error: 'Only company owner can fetch team emails' }), { status: 403, headers })
    }

    // Get all team member user_ids
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('company_id', callerProfile.company_id)

    if (!profiles?.length) {
      return new Response(JSON.stringify({ emails: {} }), { headers })
    }

    // Fetch emails from auth.users
    const emailMap: Record<string, string> = {}
    for (const p of profiles) {
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(p.user_id)
      if (user?.email) {
        emailMap[p.user_id] = user.email
      }
    }

    return new Response(JSON.stringify({ emails: emailMap }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers })
  }
})
