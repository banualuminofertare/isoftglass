
UPDATE pricing_config pc
SET catalog_source = m.supplier
FROM materials m
WHERE pc.category = 'accessories'
  AND pc.catalog_source IS NULL
  AND m.code = pc.code
  AND m.supplier IS NOT NULL;
