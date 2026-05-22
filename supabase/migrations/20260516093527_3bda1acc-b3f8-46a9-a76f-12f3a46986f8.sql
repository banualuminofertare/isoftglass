ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS exchange_rate numeric(12,6) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS base_currency text NOT NULL DEFAULT 'RON';