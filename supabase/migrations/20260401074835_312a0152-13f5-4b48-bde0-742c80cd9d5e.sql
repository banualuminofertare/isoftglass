ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS cui text,
  ADD COLUMN IF NOT EXISTS bank_account text,
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#0F172A',
  ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS presentation_text text,
  ADD COLUMN IF NOT EXISTS quote_footer_text text;