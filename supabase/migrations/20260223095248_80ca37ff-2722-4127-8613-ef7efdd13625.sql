
-- Fix crm_leads: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.crm_leads;

CREATE POLICY "Admins can manage all leads"
ON public.crm_leads FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix crm_lead_activities: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can manage all lead activities" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "Admins can view all lead activities" ON public.crm_lead_activities;

CREATE POLICY "Admins can manage all lead activities"
ON public.crm_lead_activities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
