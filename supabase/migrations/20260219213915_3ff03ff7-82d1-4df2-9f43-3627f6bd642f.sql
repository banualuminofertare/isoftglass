
-- 1. Update RLS on production_jobs to include 'sales' role
DROP POLICY IF EXISTS "Production staff can manage production jobs" ON production_jobs;

CREATE POLICY "Production and sales staff can manage production jobs"
  ON production_jobs FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'production_manager'::app_role) OR 
    has_role(auth.uid(), 'sales'::app_role)
  );

-- 2. Update generate_job_number to include 'sales' role
CREATE OR REPLACE FUNCTION public.generate_job_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    date_prefix TEXT;
    next_number INTEGER;
    job_num TEXT;
BEGIN
    -- Admin, production_manager, and sales can generate job numbers
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales')) THEN
        RAISE EXCEPTION 'Unauthorized: insufficient role';
    END IF;

    date_prefix := to_char(now(), 'YYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 8) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.production_jobs
    WHERE job_number LIKE 'P' || date_prefix || '%';
    
    job_num := 'P' || date_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
    RETURN job_num;
END;
$function$;

-- 3. Update RLS on production_stages to include 'sales' role
DROP POLICY IF EXISTS "Production staff can manage production stages" ON production_stages;

CREATE POLICY "Production and sales staff can manage production stages"
  ON production_stages FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'production_manager'::app_role) OR 
    has_role(auth.uid(), 'operator'::app_role) OR 
    has_role(auth.uid(), 'sales'::app_role)
  );
