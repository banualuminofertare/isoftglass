
-- Function to check if admin has an accepted access request for any user in a company
CREATE OR REPLACE FUNCTION public.has_accepted_access_to_company(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_access_requests aar
    JOIN public.profiles p ON p.user_id = aar.target_user_id
    WHERE aar.requester_id = auth.uid()
      AND aar.status = 'accepted'
      AND p.company_id = _company_id
      AND _company_id IS NOT NULL
  )
$$;

-- Re-add admin policies conditioned on accepted access request

-- pricing_config
CREATE POLICY "admin_impersonate_pricing"
ON public.pricing_config
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
);

-- user_accessory_presets
CREATE POLICY "admin_impersonate_presets"
ON public.user_accessory_presets
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
);

-- client_type_pricing
CREATE POLICY "admin_impersonate_ctp"
ON public.client_type_pricing
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
);

-- sliding_mechanisms
CREATE POLICY "admin_impersonate_sliding"
ON public.sliding_mechanisms
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND has_accepted_access_to_company(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND has_accepted_access_to_company(company_id)
);

-- processing_templates (update existing admin policy)
DROP POLICY IF EXISTS "Admins can manage global processing templates" ON public.processing_templates;

CREATE POLICY "admin_manage_or_impersonate_templates"
ON public.processing_templates
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) AND (
    company_id IS NULL
    OR has_accepted_access_to_company(company_id)
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND (
    company_id IS NULL
    OR has_accepted_access_to_company(company_id)
  )
);

-- accessory_kits - also needs impersonation support
CREATE POLICY "admin_impersonate_kits"
ON public.accessory_kits
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
);
