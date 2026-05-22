
-- Add user_id to pricing_config for per-user overrides
ALTER TABLE public.pricing_config ADD COLUMN user_id uuid DEFAULT NULL;

-- Drop old unique constraint on code
ALTER TABLE public.pricing_config DROP CONSTRAINT IF EXISTS pricing_config_code_unique;
ALTER TABLE public.pricing_config DROP CONSTRAINT IF EXISTS pricing_config_code_key;

-- Create partial unique indexes: one for base (shared) rows, one for per-user rows
CREATE UNIQUE INDEX pricing_config_code_base_unique ON public.pricing_config (code) WHERE user_id IS NULL;
CREATE UNIQUE INDEX pricing_config_code_user_unique ON public.pricing_config (code, user_id) WHERE user_id IS NOT NULL;

-- Update RLS: users see base rows + their own overrides
DROP POLICY IF EXISTS "Authenticated users can view pricing" ON public.pricing_config;
CREATE POLICY "Users see base and own pricing"
ON public.pricing_config FOR SELECT TO authenticated
USING (user_id IS NULL OR user_id = auth.uid());

-- Users can only insert their own overrides (user_id must be set to their uid)
DROP POLICY IF EXISTS "Authenticated users can manage pricing" ON public.pricing_config;
CREATE POLICY "Users can insert own pricing overrides"
ON public.pricing_config FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only update their own overrides
DROP POLICY IF EXISTS "Authenticated users can update pricing" ON public.pricing_config;
CREATE POLICY "Users can update own pricing"
ON public.pricing_config FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Users can only delete their own overrides
DROP POLICY IF EXISTS "Authenticated users can delete pricing" ON public.pricing_config;
CREATE POLICY "Users can delete own pricing"
ON public.pricing_config FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Create user_quote_settings table for per-user TVA and EUR
CREATE TABLE public.user_quote_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  tva_percent numeric NOT NULL DEFAULT 19,
  euro_rate numeric NOT NULL DEFAULT 4.97,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_quote_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quote settings"
ON public.user_quote_settings FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quote settings"
ON public.user_quote_settings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quote settings"
ON public.user_quote_settings FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_quote_settings_updated_at
BEFORE UPDATE ON public.user_quote_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
