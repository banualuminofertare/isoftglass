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

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return jsonResponse({ error: "Invalid token" }, 401);

    const { data: roleData } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) return jsonResponse({ error: "Admin only" }, 403);

    const { category, target_user_id, overwrite = false, supplier_filter = null } = await req.json();

    if (!category || !target_user_id) {
      return jsonResponse({ error: "category and target_user_id required" }, 400);
    }

    const { data: adminProfile } = await supabase
      .from("profiles").select("company_id")
      .eq("user_id", user.id).maybeSingle();
    const adminCompanyId = adminProfile?.company_id;

    const { data: targetProfile } = await supabase
      .from("profiles").select("company_id")
      .eq("user_id", target_user_id).maybeSingle();
    const targetCompanyId = targetProfile?.company_id;

    if (!targetCompanyId) {
      return jsonResponse({ error: "Target user has no company" }, 400);
    }

    let copiedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let sourceTotal = 0;

    // Helper: paginated fetch to bypass 1000-row limit (deterministic ordering by id)
    async function fetchAllPages(
      table: string,
      buildQuery: (q: any) => any,
      pageSize = 1000
    ) {
      const allData: any[] = [];
      let from = 0;
      while (true) {
        let q = supabase.from(table).select("*");
        q = buildQuery(q);
        const { data, error } = await q.order("id").range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return allData;
    }

    // Helper: paginated fetch with custom select (deterministic ordering by id)
    async function fetchAllPagesSelect(
      table: string,
      selectFields: string,
      buildQuery: (q: any) => any,
      pageSize = 1000
    ) {
      const allData: any[] = [];
      let from = 0;
      while (true) {
        let q = supabase.from(table).select(selectFields);
        q = buildQuery(q);
        const { data, error } = await q.order("id").range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return allData;
    }

    if (category === "kits") {
      // 1. Fetch admin kits
      const adminKits = await fetchAllPages("accessory_kits", (q) => {
        if (adminCompanyId) {
          q = q.or(`and(company_id.is.null,user_id.eq.${user.id}),company_id.eq.${adminCompanyId}`);
        } else {
          q = q.is("company_id", null).eq("user_id", user.id);
        }
        if (supplier_filter) {
          q = q.eq("catalog_source", supplier_filter);
        }
        return q;
      });

      sourceTotal = adminKits.length;
      if (adminKits.length === 0) {
        return jsonResponse({ copied: 0, skipped: 0, updated: 0, errors: 0, source_total: 0, message: "No kits to transfer" });
      }

      // 2. Fetch ALL existing kits at destination in one query
      const existingKits = await fetchAllPagesSelect("accessory_kits", "id, code", (q) =>
        q.eq("company_id", targetCompanyId)
      );
      const existingKitMap = new Map(existingKits.map((e: any) => [e.code, e.id]));

      // 3. Separate into insert vs update vs skip
      const toInsertKits: any[] = [];
      const toUpdateKits: { existingId: string; kit: any }[] = [];
      const kitItemsToFetch: { sourceKitId: string; targetKitId: string | null; isNew: boolean }[] = [];

      for (const kit of adminKits) {
        const existingId = existingKitMap.get(kit.code);

        if (existingId && !overwrite) {
          skippedCount++;
          continue;
        }

        if (existingId && overwrite) {
          toUpdateKits.push({ existingId, kit });
          kitItemsToFetch.push({ sourceKitId: kit.id, targetKitId: existingId, isNew: false });
        } else {
          const { id: _oldId, created_at: _ca, updated_at: _ua, ...kitData } = kit;
          toInsertKits.push({ ...kitData, user_id: target_user_id, company_id: targetCompanyId, price: 0 });
          kitItemsToFetch.push({ sourceKitId: kit.id, targetKitId: null, isNew: true });
        }
      }

      // 4. Batch update existing kits
      const UPDATE_BATCH = 50;
      for (let i = 0; i < toUpdateKits.length; i += UPDATE_BATCH) {
        const batch = toUpdateKits.slice(i, i + UPDATE_BATCH);
        await Promise.all(batch.map(({ existingId, kit }) =>
          supabase.from("accessory_kits").update({
            name: kit.name,
            image_url: kit.image_url,
            color: kit.color,
            model: kit.model,
            description: kit.description,
            catalog_source: kit.catalog_source,
            product_types: kit.product_types,
            glass_deductions: kit.glass_deductions,
            processing_types: kit.processing_types,
            door_height_deduction: kit.door_height_deduction,
            fixed_panel_height_deduction: kit.fixed_panel_height_deduction,
            width_overlap: kit.width_overlap,
          }).eq("id", existingId)
        ));
        updatedCount += batch.length;
      }

      // 5. Delete old kit items for updated kits
      const updatedKitIds = toUpdateKits.map(u => u.existingId);
      if (updatedKitIds.length > 0) {
        for (let i = 0; i < updatedKitIds.length; i += 50) {
          const batch = updatedKitIds.slice(i, i + 50);
          await Promise.all(batch.map(id =>
            supabase.from("accessory_kit_items").delete().eq("kit_id", id)
          ));
        }
      }

      // 6. Batch insert new kits (one by one to get IDs back)
      const INSERT_BATCH = 50;
      const newKitIdMap: Map<string, string> = new Map(); // sourceKitId -> newKitId
      for (let i = 0; i < toInsertKits.length; i += INSERT_BATCH) {
        const batch = toInsertKits.slice(i, i + INSERT_BATCH);
        const { data: inserted, error: insertError } = await supabase
          .from("accessory_kits")
          .insert(batch)
          .select("id, code");

        if (insertError) {
          console.error("Kit batch insert error:", insertError);
          errorCount += batch.length;
          continue;
        }

        if (inserted) {
          // Map source kit id by code
          for (const ins of inserted) {
            const sourceKit = adminKits.find(k => k.code === ins.code);
            if (sourceKit) newKitIdMap.set(sourceKit.id, ins.id);
          }
          copiedCount += inserted.length;
        }
      }

      // 7. Fetch ALL source kit items in one paginated query
      const allSourceKitIds = kitItemsToFetch.map(k => k.sourceKitId);
      if (allSourceKitIds.length > 0) {
        const allKitItems = await fetchAllPages("accessory_kit_items", (q) =>
          q.in("kit_id", allSourceKitIds)
        );

        // Group by source kit_id
        const itemsByKit = new Map<string, any[]>();
        for (const item of allKitItems) {
          if (!itemsByKit.has(item.kit_id)) itemsByKit.set(item.kit_id, []);
          itemsByKit.get(item.kit_id)!.push(item);
        }

        // Build items to insert
        const allNewItems: any[] = [];
        for (const entry of kitItemsToFetch) {
          const items = itemsByKit.get(entry.sourceKitId) || [];
          let targetKitId: string | undefined;

          if (entry.isNew) {
            targetKitId = newKitIdMap.get(entry.sourceKitId);
          } else {
            targetKitId = entry.targetKitId!;
          }

          if (!targetKitId) continue;

          for (const item of items) {
            const { id: _iid, created_at: _ica, kit_id: _kid, ...itemData } = item;
            allNewItems.push({ ...itemData, kit_id: targetKitId });
          }
        }

        // Batch insert kit items
        for (let i = 0; i < allNewItems.length; i += 500) {
          const batch = allNewItems.slice(i, i + 500);
          const { error } = await supabase.from("accessory_kit_items").insert(batch);
          if (error) console.error("Kit items batch insert error:", error);
        }
      }
    } else {
      // PRICING CONFIG TRANSFER

      // 1. Fetch admin items
      const adminItems = await fetchAllPages("pricing_config", (q) => {
        q = q.eq("category", category);
        if (adminCompanyId) {
          q = q.or(`and(company_id.is.null,user_id.eq.${user.id}),and(company_id.is.null,user_id.is.null),company_id.eq.${adminCompanyId}`);
        } else {
          q = q.is("company_id", null).or(`user_id.eq.${user.id},user_id.is.null`);
        }
        if (supplier_filter) {
          q = q.eq("catalog_source", supplier_filter);
        }
        return q;
      });

      if (adminItems.length === 0) {
        return jsonResponse({ copied: 0, skipped: 0, updated: 0, errors: 0, source_total: 0, message: "No items to transfer" });
      }

      // Dedupe: prefer company-specific over base
      const codeMap = new Map<string, typeof adminItems[0]>();
      for (const item of adminItems) {
        const existing = codeMap.get(item.code);
        if (!existing || (item.company_id === adminCompanyId && existing.company_id === null)) {
          codeMap.set(item.code, item);
        }
      }
      sourceTotal = codeMap.size;

      // 2. Fetch ALL existing items at destination in one query
      const existingItems = await fetchAllPagesSelect("pricing_config", "id, code", (q) =>
        q.eq("category", category).eq("company_id", targetCompanyId)
      );
      const existingMap = new Map(existingItems.map((e: any) => [e.code, e.id]));

      // 3. Separate into insert vs update vs skip
      const toInsert: any[] = [];
      const toUpdate: { existingId: string; item: any }[] = [];

      for (const [_code, item] of codeMap) {
        const existingId = existingMap.get(item.code);

        if (existingId && !overwrite) {
          skippedCount++;
          continue;
        }

        if (existingId && overwrite) {
          toUpdate.push({ existingId, item });
        } else {
          const { id: _oldId, created_at: _ca, updated_at: _ua, ...itemData } = item;
          toInsert.push({ ...itemData, user_id: target_user_id, company_id: targetCompanyId, price: 0 });
        }
      }

      // 4. Batch updates in parallel (50 at a time)
      const UPDATE_BATCH = 50;
      for (let i = 0; i < toUpdate.length; i += UPDATE_BATCH) {
        const batch = toUpdate.slice(i, i + UPDATE_BATCH);
        await Promise.all(batch.map(({ existingId, item }) =>
          supabase.from("pricing_config").update({
            name: item.name,
            image_url: item.image_url,
            color_hex: item.color_hex,
            catalog_source: item.catalog_source,
            description: item.description,
            product_types: item.product_types,
            unit: item.unit,
            glass_deductions: item.glass_deductions,
            processing_types: item.processing_types,
            door_height_deduction: item.door_height_deduction,
            fixed_panel_height_deduction: item.fixed_panel_height_deduction,
            width_overlap: item.width_overlap,
          }).eq("id", existingId)
        ));
        updatedCount += batch.length;
      }

      // 5. Batch inserts (500 at a time)
      for (let i = 0; i < toInsert.length; i += 500) {
        const batch = toInsert.slice(i, i + 500);
        const { error: insertError } = await supabase.from("pricing_config").insert(batch);
        if (insertError) {
          console.error("Pricing batch insert error:", insertError);
          errorCount += batch.length;
        } else {
          copiedCount += batch.length;
        }
      }
    }

    return jsonResponse({
      copied: copiedCount,
      skipped: skippedCount,
      updated: updatedCount,
      errors: errorCount,
      source_total: sourceTotal,
      message: `${copiedCount} elemente noi, ${updatedCount} actualizate, ${skippedCount} sărite${errorCount > 0 ? `, ${errorCount} erori` : ''}`,
    });
  } catch (err) {
    console.error("Transfer error:", err);
    return jsonResponse({ error: String(err) }, 500);
  }
});
