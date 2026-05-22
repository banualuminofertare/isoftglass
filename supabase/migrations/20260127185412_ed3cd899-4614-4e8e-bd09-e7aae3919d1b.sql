-- Add unique constraint on code column
ALTER TABLE public.pricing_config ADD CONSTRAINT pricing_config_code_unique UNIQUE (code);