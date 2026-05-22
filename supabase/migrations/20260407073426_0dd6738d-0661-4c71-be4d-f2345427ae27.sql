
-- Create vehicle status enum
CREATE TYPE public.vehicle_status AS ENUM ('available', 'in_service', 'occupied');

-- Create installation_vehicles table
CREATE TABLE public.installation_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id),
  plate_number text NOT NULL,
  brand text,
  model text,
  year integer,
  team_id uuid REFERENCES public.installation_teams(id) ON DELETE SET NULL,
  itp_expiry date,
  rca_expiry date,
  revision_date date,
  status vehicle_status NOT NULL DEFAULT 'available',
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.installation_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as installation_teams)
CREATE POLICY "Company members can manage installation vehicles"
  ON public.installation_vehicles FOR ALL
  TO authenticated
  USING (is_approved_user() AND user_belongs_to_company(company_id))
  WITH CHECK (is_approved_user() AND (company_id = get_user_company_id(auth.uid())));

CREATE POLICY "Company members can view installation vehicles"
  ON public.installation_vehicles FOR SELECT
  TO authenticated
  USING (user_belongs_to_company(company_id));

CREATE POLICY "admin_impersonate_installation_vehicles"
  ON public.installation_vehicles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id));
