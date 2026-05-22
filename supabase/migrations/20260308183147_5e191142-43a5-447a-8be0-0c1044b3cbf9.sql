ALTER TABLE public.accessory_kits
  ADD COLUMN glass_deductions jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN door_height_deduction numeric NOT NULL DEFAULT 0,
  ADD COLUMN fixed_panel_height_deduction numeric NOT NULL DEFAULT 0,
  ADD COLUMN width_overlap numeric NOT NULL DEFAULT 0;