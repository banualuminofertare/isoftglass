
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, company_name, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    false
  );
  
  -- Auto-assign 'sales' role for new signups
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'sales')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$function$;
