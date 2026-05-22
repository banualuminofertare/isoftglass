
-- Create a security definer function to get the current user's email
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

-- Drop old policies that reference auth.users directly
DROP POLICY IF EXISTS "Invited users can view their invitations" ON public.company_invitations;
DROP POLICY IF EXISTS "Invited users can update their invitation status" ON public.company_invitations;

-- Recreate policies using the security definer function
CREATE POLICY "Invited users can view their invitations"
ON public.company_invitations
FOR SELECT
TO authenticated
USING (email = public.get_auth_email());

CREATE POLICY "Invited users can update their invitation status"
ON public.company_invitations
FOR UPDATE
TO authenticated
USING (email = public.get_auth_email());
