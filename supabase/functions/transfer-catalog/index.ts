import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Verify caller is admin
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return jsonResponse({ error: "Invalid token" }, 401);

    const { data: roleData } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) return jsonResponse({ error: "Admin only" }, 403);

    const {
      catalog_id, target_user_id, overwrite,
      transfer_mode = "pricing",
      kit_name, kit_code, product_types,
      item_ids,
      replace_categories,
      hide_global,
    } = await req.json();

    if (!catalog_id || !target_user_id) {
      return jsonResponse({ error: "catalog_id and target_user_id required" }, 400);
    }

    // Get target user's company_id
    const { data: targetProfile } = await supabase
      .from("profiles").select("company_id").eq("user_id", target_user_id).single();
    if (!targetProfile) return jsonResponse({ error: "Target user profile not found" }, 404);

    // Check if target user is admin — if so, insert as global rows
    const { data: targetRoleData } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", target_user_id).eq("role", "admin").maybeSingle();
    const isTargetAdmin = !!targetRoleData;

    // Get catalog items - chunk .in() to avoid URL length limits when many ids
    let catalogItems: any[] = [];
    if (Array.isArray(item_ids) && item_ids.length > 0) {
      const CHUNK = 200;
      for (let i = 0; i < item_ids.length; i += CHUNK) {
        const slice = item_ids.slice(i, i + CHUNK);
        const { data, error } = await supabase
          .from("admin_catalog_items").select("*")
          .eq("catalog_id", catalog_id).in("id", slice);
        if (error) {
          return jsonResponse({ error: `Items fetch failed: ${error.message}` }, 500);
        }
        if (data?.length) catalogItems.push(...data);
      }
    } else {
      const { data, error } = await supabase
        .from("admin_catalog_items").select("*").eq("catalog_id", catalog_id);
      if (error) {
        return jsonResponse({ error: `Items fetch failed: ${error.message}` }, 500);
      }
      catalogItems = data || [];
    }
    if (!catalogItems.length) {
      return jsonResponse({ error: "No catalog items found" }, 404);
    }

    // Fetch catalog name for catalog_source
    const { data: catalogMeta } = await supabase
      .from("admin_catalogs").select("name").eq("id", catalog_id).single();
    const catalogSource = catalogMeta?.name || null;

    // Record assignment
    await supabase.from("catalog_assignments").insert({
      catalog_id, target_user_id, assigned_by: user.id,
    });

    const targetCompanyId = isTargetAdmin ? null : targetProfile.company_id;

    // ── Replace mode ──
    if (transfer_mode === "replace") {
      const categories = Array.isArray(replace_categories) ? replace_categories : [];
      if (categories.length === 0) {
        return jsonResponse({ error: "replace_categories required for replace mode" }, 400);
      }

      if (!targetCompanyId) {
        return jsonResponse({ error: "Cannot replace catalog for admin/global account" }, 400);
      }

      let deletedPricing = 0;
      let deletedKits = 0;

      // 1. Delete existing pricing_config rows for target company in selected categories
      const pricingCategories = categories.filter((c: string) => c !== "kits");
      if (pricingCategories.length > 0) {
        const { count } = await supabase
          .from("pricing_config")
          .delete({ count: "exact" })
          .eq("company_id", targetCompanyId)
          .in("category", pricingCategories);
        deletedPricing = count || 0;
      }

      // 2. Delete kits if selected
      if (categories.includes("kits")) {
        // First get kit IDs to delete their items
        const { data: kits } = await supabase
          .from("accessory_kits")
          .select("id")
          .eq("company_id", targetCompanyId);
        
        if (kits && kits.length > 0) {
          const kitIds = kits.map((k: any) => k.id);
          await supabase.from("accessory_kit_items").delete().in("kit_id", kitIds);
          const { count } = await supabase
            .from("accessory_kits")
            .delete({ count: "exact" })
            .eq("company_id", targetCompanyId);
          deletedKits = count || 0;
        }
      }

      // 3. Insert new items from catalog (whitelist columns to match pricing_config schema)
      const pricingItems = catalogItems.filter((i) => i.item_type === "pricing");
      let insertedCount = 0;
      let failedCount = 0;
      const sampleErrors: string[] = [];
      const defaultCategory = (pricingCategories[0] as string) || "accessories";

      const sanitizeUnit = (u: unknown): string => {
        const s = typeof u === "string" ? u.trim() : "";
        if (!s || s.length > 20) return "pcs";
        return s;
      };

      for (const item of pricingItems) {
        const src = item.source_data as Record<string, any>;
        const row = {
          user_id: target_user_id,
          company_id: targetCompanyId,
          category: defaultCategory,
          code: src.code ?? null,
          name: src.name ?? null,
          description: src.description ?? null,
          unit: sanitizeUnit(src.unit),
          price: Number(src.price) || 0,
          sort_order: Number.isFinite(Number(src.sort_order)) ? Number(src.sort_order) : 0,
          is_active: true,
          is_multiplier: !!src.is_multiplier,
          image_url: src.image_url ?? null,
          color_hex: src.color_hex ?? null,
          product_types: Array.isArray(src.product_types) ? src.product_types : [],
          processing_types: src.processing_types ?? {},
          glass_deductions: src.glass_deductions ?? {},
          glass_deduction: Number(src.glass_deduction) || 0,
          door_height_deduction: Number(src.door_height_deduction) || 0,
          fixed_panel_height_deduction: Number(src.fixed_panel_height_deduction) || 0,
          width_overlap: Number(src.width_overlap) || 0,
          catalog_source: catalogSource,
        };
        const { error: insertErr } = await supabase.from("pricing_config").insert(row);
        if (insertErr) {
          failedCount++;
          if (sampleErrors.length < 3) sampleErrors.push(`${src.code}: ${insertErr.message}`);
        } else {
          insertedCount++;
        }
      }

      // 4. Optionally set hide_global_pricing flag
      if (hide_global === true && targetCompanyId) {
        await supabase
          .from("companies")
          .update({ hide_global_pricing: true })
          .eq("id", targetCompanyId);
      }

      return jsonResponse({
        success: true,
        transfer_mode: "replace",
        deleted_pricing: deletedPricing,
        deleted_kits: deletedKits,
        inserted_count: insertedCount,
        failed_count: failedCount,
        sample_errors: sampleErrors,
        hide_global_set: hide_global === true,
      });
    }

    // ── Kit mode ──
    if (transfer_mode === "kit") {
      if (!kit_name || !kit_code) {
        return jsonResponse({ error: "kit_name and kit_code required for kit mode" }, 400);
      }

      const totalPrice = catalogItems
        .filter(i => i.item_type === "pricing")
        .reduce((sum, i) => {
          const src = i.source_data as Record<string, unknown>;
          return sum + (Number(src.price) || 0);
        }, 0);

      const { data: kit, error: kitErr } = await supabase
        .from("accessory_kits")
        .insert({
          user_id: target_user_id,
          company_id: targetCompanyId,
          name: kit_name,
          code: kit_code,
          price: totalPrice,
          product_types: product_types?.length ? product_types : [],
          is_active: true,
        })
        .select("id")
        .single();

      if (kitErr) return jsonResponse({ error: "Failed to create kit: " + kitErr.message }, 500);

      const kitItems = catalogItems.map(item => {
        const src = item.source_data as Record<string, unknown>;
        return {
          kit_id: kit.id,
          material_code: (src.code as string) || "unknown",
          material_name: (src.name as string) || "Unknown",
          quantity: 1,
        };
      });

      const BATCH = 100;
      let itemsInserted = 0;
      for (let i = 0; i < kitItems.length; i += BATCH) {
        const batch = kitItems.slice(i, i + BATCH);
        const { error: batchErr } = await supabase.from("accessory_kit_items").insert(batch);
        if (!batchErr) itemsInserted += batch.length;
      }

      return jsonResponse({
        success: true,
        kit_created: true,
        kit_id: kit.id,
        items_count: itemsInserted,
      });
    }

    // ── Pricing mode ──
    const pricingItems = catalogItems.filter((i) => i.item_type === "pricing");
    const presetItems = catalogItems.filter((i) => i.item_type === "preset");
    let pricingCopied = 0;
    let pricingUpdated = 0;
    let presetsCopied = 0;

    for (const item of pricingItems) {
      const src = item.source_data as Record<string, unknown>;
      const code = src.code as string;

      const { data: existing } = await supabase.from("pricing_config")
        .select("id").eq("code", code).eq("user_id", target_user_id).maybeSingle();

      if (existing && overwrite) {
        // Update metadata only, preserve price
        await supabase.from("pricing_config").update({
          name: (src.name as string) || undefined,
          image_url: (src.image_url as string) || null,
          color_hex: (src.color_hex as string) || null,
          catalog_source: catalogSource,
          description: (src.description as string) || null,
          product_types: (src.product_types as string[]) || [],
          unit: (src.unit as string) || 'RON',
        }).eq("id", existing.id);
        pricingUpdated++;
      } else if (!existing) {
        const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = src;
        const { error: insertErr } = await supabase.from("pricing_config").insert({
          ...rest,
          user_id: isTargetAdmin ? null : target_user_id,
          company_id: targetCompanyId,
          category: 'accessories',
          is_active: true,
          catalog_source: catalogSource,
          image_url: (src.image_url as string) || null,
          color_hex: (src.color_hex as string) || null,
        });
        if (!insertErr) pricingCopied++;
      }
      // else: existing && !overwrite → skip
    }

    for (const item of presetItems) {
      const src = item.source_data as Record<string, unknown>;

      if (overwrite) {
        await supabase.from("user_accessory_presets").delete()
          .eq("material_code", src.material_code as string)
          .eq("product_type", src.product_type as string)
          .eq("category", src.category as string)
          .eq("user_id", target_user_id);
      }

      const { data: existing } = await supabase.from("user_accessory_presets")
        .select("id")
        .eq("material_code", src.material_code as string)
        .eq("product_type", src.product_type as string)
        .eq("category", src.category as string)
        .eq("user_id", target_user_id)
        .maybeSingle();

      if (!existing) {
        const { id: _id, created_at: _ca, ...rest } = src;
        const { error: insertErr } = await supabase.from("user_accessory_presets").insert({
          ...rest,
          user_id: isTargetAdmin ? null : target_user_id,
          company_id: targetCompanyId,
        });
        if (!insertErr) presetsCopied++;
      }
    }

    return jsonResponse({
      success: true,
      pricing_copied: pricingCopied,
      pricing_updated: pricingUpdated,
      presets_copied: presetsCopied,
    });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
