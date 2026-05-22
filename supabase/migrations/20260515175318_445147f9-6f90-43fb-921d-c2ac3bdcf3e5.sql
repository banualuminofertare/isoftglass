
-- Companies: e-invoicing emitter fields
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'RO',
  ADD COLUMN IF NOT EXISTS vat_id text,
  ADD COLUMN IF NOT EXISTS caen_code text,
  ADD COLUMN IF NOT EXISTS iban text,
  ADD COLUMN IF NOT EXISTS bic text,
  ADD COLUMN IF NOT EXISTS trade_register text,
  ADD COLUMN IF NOT EXISTS share_capital numeric,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS county text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS codice_fiscale text,
  ADD COLUMN IF NOT EXISTS regime_fiscale text,
  ADD COLUMN IF NOT EXISTS leitweg_id text,
  ADD COLUMN IF NOT EXISTS siret text,
  ADD COLUMN IF NOT EXISTS peppol_id text;

-- Clients: e-invoicing buyer fields
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS vat_id text,
  ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'RO',
  ADD COLUMN IF NOT EXISTS codice_destinatario text;

-- Invoices: e-invoice tracking
DO $$ BEGIN
  CREATE TYPE einvoice_status AS ENUM ('not_generated','generated','sent_external','acknowledged','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS einvoice_status einvoice_status NOT NULL DEFAULT 'not_generated',
  ADD COLUMN IF NOT EXISTS einvoice_xml_path text,
  ADD COLUMN IF NOT EXISTS einvoice_country text;

-- Storage bucket for generated XMLs
INSERT INTO storage.buckets (id, name, public)
VALUES ('einvoice-xml', 'einvoice-xml', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for einvoice-xml bucket: file path is {company_id}/{invoice_id}.xml
CREATE POLICY "Company members can read einvoice xml"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'einvoice-xml'
    AND user_belongs_to_company((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Company members can upload einvoice xml"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'einvoice-xml'
    AND user_belongs_to_company((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Company members can update einvoice xml"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'einvoice-xml'
    AND user_belongs_to_company((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Company members can delete einvoice xml"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'einvoice-xml'
    AND user_belongs_to_company((storage.foldername(name))[1]::uuid)
  );
