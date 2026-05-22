
-- Create installation status enum
CREATE TYPE public.installation_status AS ENUM ('scheduled', 'in_progress', 'completed', 'postponed', 'cancelled');

-- Create installation_teams table
CREATE TABLE public.installation_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  vehicle text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.installation_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view installation teams"
  ON public.installation_teams FOR SELECT TO authenticated
  USING (user_belongs_to_company(company_id));

CREATE POLICY "Company members can manage installation teams"
  ON public.installation_teams FOR ALL TO authenticated
  USING (is_approved_user() AND user_belongs_to_company(company_id))
  WITH CHECK (is_approved_user() AND company_id = get_user_company_id(auth.uid()));

CREATE POLICY "admin_impersonate_installation_teams"
  ON public.installation_teams FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin') AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id));

-- Create installation_jobs table
CREATE TABLE public.installation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  estimated_duration interval DEFAULT '2 hours',
  status public.installation_status NOT NULL DEFAULT 'scheduled',
  team_id uuid REFERENCES public.installation_teams(id) ON DELETE SET NULL,
  address text,
  city text,
  postal_code text,
  client_name text,
  client_phone text,
  notes text,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  completion_notes text,
  client_signature_url text,
  completion_photos text[] DEFAULT '{}',
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.installation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view installation jobs"
  ON public.installation_jobs FOR SELECT TO authenticated
  USING (user_belongs_to_company(company_id));

CREATE POLICY "Company members can manage installation jobs"
  ON public.installation_jobs FOR ALL TO authenticated
  USING (is_approved_user() AND user_belongs_to_company(company_id))
  WITH CHECK (is_approved_user() AND company_id = get_user_company_id(auth.uid()));

CREATE POLICY "admin_impersonate_installation_jobs"
  ON public.installation_jobs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin') AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id));

-- Create installation_checklist_templates table
CREATE TABLE public.installation_checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  product_type text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.installation_checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view checklist templates"
  ON public.installation_checklist_templates FOR SELECT TO authenticated
  USING (user_belongs_to_company(company_id));

CREATE POLICY "Company members can manage checklist templates"
  ON public.installation_checklist_templates FOR ALL TO authenticated
  USING (is_approved_user() AND user_belongs_to_company(company_id))
  WITH CHECK (is_approved_user() AND company_id = get_user_company_id(auth.uid()));

CREATE POLICY "admin_impersonate_checklist_templates"
  ON public.installation_checklist_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin') AND company_id IS NOT NULL AND has_accepted_access_to_company(company_id));

-- Add updated_at triggers
CREATE TRIGGER update_installation_teams_updated_at BEFORE UPDATE ON public.installation_teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_installation_jobs_updated_at BEFORE UPDATE ON public.installation_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_installation_checklist_templates_updated_at BEFORE UPDATE ON public.installation_checklist_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
