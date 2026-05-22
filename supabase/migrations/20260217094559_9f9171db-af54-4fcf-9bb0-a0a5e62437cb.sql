
-- Fix: Restrict clients SELECT to authorized roles only (not operators)
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;

CREATE POLICY "Authorized roles can view clients"
ON public.clients FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'sales'::app_role) OR
  has_role(auth.uid(), 'production_manager'::app_role)
);

-- Also restrict client_contacts to same roles
DROP POLICY IF EXISTS "Authenticated users can view client contacts" ON public.client_contacts;

CREATE POLICY "Authorized roles can view client contacts"
ON public.client_contacts FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'sales'::app_role) OR
  has_role(auth.uid(), 'production_manager'::app_role)
);
