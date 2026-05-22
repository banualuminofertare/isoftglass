CREATE INDEX IF NOT EXISTS idx_pricing_config_company_code 
  ON public.pricing_config (company_id, code) 
  WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pricing_config_user_code 
  ON public.pricing_config (user_id, code) 
  WHERE user_id IS NOT NULL;