
-- Create enum for lead pipeline stages
CREATE TYPE public.lead_stage AS ENUM ('nou', 'contactat', 'interesat', 'demo', 'negociere', 'castigat', 'pierdut');

-- Create enum for lead source
CREATE TYPE public.lead_source AS ENUM ('website', 'referral', 'social_media', 'cold_call', 'email', 'event', 'other');

-- Create leads/prospects table
CREATE TABLE public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  county TEXT,
  stage lead_stage NOT NULL DEFAULT 'nou',
  source lead_source NOT NULL DEFAULT 'other',
  estimated_value NUMERIC DEFAULT 0,
  notes TEXT,
  next_follow_up DATE,
  assigned_to UUID,
  converted_user_id UUID,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lead activities/notes table
CREATE TABLE public.crm_lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'note',
  description TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;

-- Only admins can manage leads
CREATE POLICY "Admins can manage all leads"
ON public.crm_leads FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all leads"
ON public.crm_leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all lead activities"
ON public.crm_lead_activities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all lead activities"
ON public.crm_lead_activities FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_crm_leads_updated_at
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
