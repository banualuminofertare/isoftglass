
-- Secure generate_order_number with SECURITY DEFINER and role check
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
    order_num TEXT;
BEGIN
    -- Only admin and sales can generate order numbers
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sales')) THEN
        RAISE EXCEPTION 'Unauthorized: insufficient role';
    END IF;

    year_prefix := to_char(now(), 'YY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.orders
    WHERE order_number LIKE year_prefix || '-%';
    
    order_num := year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
    RETURN order_num;
END;
$function$;

-- Secure generate_job_number with SECURITY DEFINER and role check
CREATE OR REPLACE FUNCTION public.generate_job_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    date_prefix TEXT;
    next_number INTEGER;
    job_num TEXT;
BEGIN
    -- Only admin and production_manager can generate job numbers
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager')) THEN
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

-- Secure generate_ticket_number with SECURITY DEFINER and role check
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
    ticket_num TEXT;
BEGIN
    -- Admin, production_manager, and sales can generate ticket numbers
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales')) THEN
        RAISE EXCEPTION 'Unauthorized: insufficient role';
    END IF;

    year_prefix := 'R' || to_char(now(), 'YY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.service_tickets
    WHERE ticket_number LIKE year_prefix || '-%';
    ticket_num := year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
    RETURN ticket_num;
END;
$function$;
