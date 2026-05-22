INSERT INTO public.pricing_config (code, name, price, category, unit, user_id, company_id, catalog_source, is_active, image_url)
SELECT 
  (aci.source_data->>'code')::text,
  (aci.source_data->>'name')::text,
  COALESCE((aci.source_data->>'price')::numeric, 0),
  'accessories'::price_category,
  COALESCE(aci.source_data->>'unit', 'buc'),
  'a1dddbfd-c398-4803-96fc-a815c813519b'::uuid,
  'fd0bfa16-9608-40a9-b20a-1b71c7de4528'::uuid,
  'MD Trade',
  true,
  aci.source_data->>'image_url'
FROM public.admin_catalog_items aci
WHERE aci.catalog_id = '65f095f4-71ed-4ffb-905b-266e57101ca6'
  AND aci.item_type = 'pricing'
  AND NOT EXISTS (
    SELECT 1 FROM public.pricing_config pc
    WHERE pc.code = (aci.source_data->>'code')::text
      AND pc.user_id = 'a1dddbfd-c398-4803-96fc-a815c813519b'::uuid
  );