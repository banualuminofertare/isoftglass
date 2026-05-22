ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS pdf_logo_size text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS pdf_logo_position text NOT NULL DEFAULT 'left';

ALTER TABLE public.company_settings 
  ADD COLUMN IF NOT EXISTS pdf_logo_size text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS pdf_logo_position text NOT NULL DEFAULT 'left';

ALTER TABLE public.companies
  ADD CONSTRAINT companies_pdf_logo_size_check CHECK (pdf_logo_size IN ('small','medium','large','xlarge')),
  ADD CONSTRAINT companies_pdf_logo_position_check CHECK (pdf_logo_position IN ('left','center','right'));

ALTER TABLE public.company_settings
  ADD CONSTRAINT company_settings_pdf_logo_size_check CHECK (pdf_logo_size IN ('small','medium','large','xlarge')),
  ADD CONSTRAINT company_settings_pdf_logo_position_check CHECK (pdf_logo_position IN ('left','center','right'));