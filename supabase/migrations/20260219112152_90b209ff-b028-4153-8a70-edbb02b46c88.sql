
-- Add unique constraint on materials.code for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS materials_code_unique ON public.materials (code);

-- Add unique constraint on material_variants.variant_code for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS material_variants_variant_code_unique ON public.material_variants (variant_code);
