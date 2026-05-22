ALTER TABLE public.pricing_config DROP COLUMN processing_types;
ALTER TABLE public.pricing_config ADD COLUMN processing_types jsonb NOT NULL DEFAULT '{}'::jsonb;