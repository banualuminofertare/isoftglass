
-- Add mechanism columns to pricing_config
ALTER TABLE public.pricing_config
  ADD COLUMN IF NOT EXISTS door_height_deduction numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fixed_panel_height_deduction numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS width_overlap numeric NOT NULL DEFAULT 0;

-- Migrate existing data from sliding_mechanisms into pricing_config (match by code)
UPDATE public.pricing_config pc
SET 
  door_height_deduction = sm.door_height_deduction,
  fixed_panel_height_deduction = sm.fixed_panel_height_deduction,
  width_overlap = sm.width_overlap
FROM public.sliding_mechanisms sm
WHERE pc.code = sm.code AND sm.code != '';
