const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TARGET_LANGS = [
  { code: "en", name: "English" },
  { code: "it", name: "Italian" },
  { code: "de", name: "German" },
  { code: "pl", name: "Polish" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "nl", name: "Dutch" },
  { code: "hr", name: "Croatian" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await sb
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, content } = await req.json();
    if (!title || !content || typeof title !== "string" || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "title and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (title.length > 500 || content.length > 10000) {
      return new Response(JSON.stringify({ error: "title or content too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const langList = TARGET_LANGS.map((l) => `${l.code} (${l.name})`).join(", ");

    const systemPrompt = `You are a professional translator for a SaaS app for glass/window manufacturing.
Translate Romanian source text into the requested target languages.
Preserve markdown formatting, emojis, line breaks and bold (**) markers.
Keep brand terms, code snippets, version numbers, and dates as-is.
Tone: professional, concise, friendly. Audience: business users.`;

    const userPrompt = `Translate the following Romanian announcement into these languages: ${langList}.

TITLE (ro): ${title}

CONTENT (ro):
${content}

Return JSON only via the provided tool. Each translation must be complete.`;

    const tool = {
      type: "function",
      function: {
        name: "return_translations",
        description: "Return translations for title and content in all target languages.",
        parameters: {
          type: "object",
          properties: {
            title_translations: {
              type: "object",
              properties: Object.fromEntries(TARGET_LANGS.map((l) => [l.code, { type: "string" }])),
              required: TARGET_LANGS.map((l) => l.code),
              additionalProperties: false,
            },
            content_translations: {
              type: "object",
              properties: Object.fromEntries(TARGET_LANGS.map((l) => [l.code, { type: "string" }])),
              required: TARGET_LANGS.map((l) => l.code),
              additionalProperties: false,
            },
          },
          required: ["title_translations", "content_translations"],
          additionalProperties: false,
        },
      },
    };

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "return_translations" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Încearcă din nou peste un minut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Credite Lovable AI epuizate." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response", JSON.stringify(data));
      throw new Error("Model did not return translations");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        title_translations: parsed.title_translations,
        content_translations: parsed.content_translations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("translate-announcement error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
