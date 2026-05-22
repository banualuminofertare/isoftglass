-- Drop the old overly strict UNIQUE constraint on client_type alone
ALTER TABLE public.client_type_pricing 
  DROP CONSTRAINT IF EXISTS client_type_pricing_client_type_key;

-- Add composite UNIQUE on (client_type, user_id) — one override per user per client type
ALTER TABLE public.client_type_pricing 
  ADD CONSTRAINT client_type_pricing_client_type_user_key UNIQUE (client_type, user_id);

-- Add partial UNIQUE index for global rows (user_id IS NULL) — only one global per client type
CREATE UNIQUE INDEX IF NOT EXISTS client_type_pricing_client_type_null_user_idx 
  ON public.client_type_pricing (client_type) 
  WHERE user_id IS NULL;