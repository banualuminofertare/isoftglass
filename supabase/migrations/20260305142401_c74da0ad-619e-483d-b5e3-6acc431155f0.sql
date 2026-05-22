
-- 1. Create companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL,
  max_members integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2. Create company_invitations table
CREATE TABLE public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  role app_role NOT NULL DEFAULT 'operator',
  has_calculator_access boolean NOT NULL DEFAULT true,
  has_operational_access boolean NOT NULL DEFAULT false,
  has_processing_access boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz DEFAULT NULL,
  UNIQUE(company_id, email)
);

ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

-- 3. Add company_id to profiles
ALTER TABLE public.profiles ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- 4. Create security definer function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 5. Create function to check if users are in the same company
CREATE OR REPLACE FUNCTION public.is_same_company(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p1.company_id = p2.company_id AND p1.company_id IS NOT NULL
    WHERE p1.user_id = auth.uid() AND p2.user_id = _user_id
  )
$$;

-- 6. Create function: is user the company owner?
CREATE OR REPLACE FUNCTION public.is_company_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies c
    JOIN public.profiles p ON p.company_id = c.id
    WHERE p.user_id = _user_id AND c.owner_id = _user_id
  )
$$;

-- 7. RLS for companies
CREATE POLICY "Owner can manage own company" ON public.companies
FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Members can view their company" ON public.companies
FOR SELECT TO authenticated
USING (id = public.get_user_company_id(auth.uid()));

-- 8. RLS for company_invitations
CREATE POLICY "Company owner can manage invitations" ON public.company_invitations
FOR ALL TO authenticated
USING (invited_by = auth.uid() OR company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()))
WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid()));

CREATE POLICY "Invited users can view their invitations" ON public.company_invitations
FOR SELECT TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Invited users can update their invitation status" ON public.company_invitations
FOR UPDATE TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 9. Update handle_new_user to auto-create company for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  pending_invitation record;
BEGIN
  -- Check if there's a pending invitation for this email
  SELECT * INTO pending_invitation
  FROM public.company_invitations
  WHERE email = NEW.email AND status = 'pending'
  LIMIT 1;

  IF pending_invitation IS NOT NULL THEN
    -- User was invited to a company
    INSERT INTO public.profiles (user_id, full_name, phone, company_name, is_approved, company_id,
      has_calculator_access, has_operational_access, has_processing_access)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
      true,
      pending_invitation.company_id,
      pending_invitation.has_calculator_access,
      pending_invitation.has_operational_access,
      pending_invitation.has_processing_access
    );

    -- Assign the role from invitation
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, pending_invitation.role)
    ON CONFLICT DO NOTHING;

    -- Mark invitation as accepted
    UPDATE public.company_invitations
    SET status = 'accepted', responded_at = now()
    WHERE id = pending_invitation.id;
  ELSE
    -- Regular signup: create a new company for this user
    INSERT INTO public.companies (name, owner_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Company')),
      NEW.id
    )
    RETURNING id INTO new_company_id;

    INSERT INTO public.profiles (user_id, full_name, phone, company_name, is_approved, company_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
      false,
      new_company_id
    );

    -- Auto-assign 'sales' role for new signups
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'sales')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
