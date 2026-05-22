
DO $$
DECLARE
  rec RECORD;
  v_company_id uuid;
BEGIN
  FOR rec IN
    SELECT p.user_id, COALESCE(p.company_name, p.full_name, 'Compania mea') as cname
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.company_id IS NULL AND ur.role = 'sales'
  LOOP
    INSERT INTO public.companies (name, owner_id)
    VALUES (rec.cname, rec.user_id)
    RETURNING id INTO v_company_id;

    UPDATE public.profiles SET company_id = v_company_id WHERE user_id = rec.user_id;
  END LOOP;
END $$;
