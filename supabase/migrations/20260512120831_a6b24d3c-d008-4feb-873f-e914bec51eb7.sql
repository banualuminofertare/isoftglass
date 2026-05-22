
-- Atomic-ish generator with retry on unique violation
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
    attempts INTEGER := 0;
BEGIN
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales')) THEN
        RAISE EXCEPTION 'Unauthorized: insufficient role';
    END IF;

    date_prefix := to_char(now(), 'YYMMDD');

    LOOP
        attempts := attempts + 1;
        SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 9) AS INTEGER)), 0) + 1
          INTO next_number
          FROM public.production_jobs
         WHERE job_number LIKE 'P' || date_prefix || '-%';

        job_num := 'P' || date_prefix || '-' || LPAD(next_number::TEXT, 3, '0');

        IF NOT EXISTS (SELECT 1 FROM public.production_jobs WHERE job_number = job_num) THEN
            RETURN job_num;
        END IF;

        IF attempts > 20 THEN
            RAISE EXCEPTION 'Could not generate unique job_number after % attempts', attempts;
        END IF;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
    order_num TEXT;
    attempts INTEGER := 0;
BEGIN
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sales')) THEN
        RAISE EXCEPTION 'Unauthorized: insufficient role';
    END IF;

    year_prefix := to_char(now(), 'YY');

    LOOP
        attempts := attempts + 1;
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 0) + 1
          INTO next_number
          FROM public.orders
         WHERE order_number LIKE year_prefix || '-%';

        order_num := year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');

        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_num) THEN
            RETURN order_num;
        END IF;

        IF attempts > 20 THEN
            RAISE EXCEPTION 'Could not generate unique order_number after % attempts', attempts;
        END IF;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
    ticket_num TEXT;
    attempts INTEGER := 0;
BEGIN
    IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales')) THEN
        RAISE EXCEPTION 'Unauthorized: insufficient role';
    END IF;

    year_prefix := 'R' || to_char(now(), 'YY');

    LOOP
        attempts := attempts + 1;
        SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
          INTO next_number
          FROM public.service_tickets
         WHERE ticket_number LIKE year_prefix || '-%';

        ticket_num := year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');

        IF NOT EXISTS (SELECT 1 FROM public.service_tickets WHERE ticket_number = ticket_num) THEN
            RETURN ticket_num;
        END IF;

        IF attempts > 20 THEN
            RAISE EXCEPTION 'Could not generate unique ticket_number after % attempts', attempts;
        END IF;
    END LOOP;
END;
$function$;

-- Backfill orphan production jobs (orders in_production without a production_job)
DO $backfill$
DECLARE
    o RECORD;
    new_job_id UUID;
    new_job_num TEXT;
    date_prefix TEXT;
    next_number INTEGER;
    cli_name TEXT;
BEGIN
    date_prefix := to_char(now(), 'YYMMDD');

    FOR o IN
        SELECT ord.id, ord.order_number, ord.delivery_date, ord.client_id
          FROM public.orders ord
          LEFT JOIN public.production_jobs pj ON pj.order_id = ord.id
         WHERE ord.status = 'in_production' AND pj.id IS NULL
    LOOP
        SELECT name INTO cli_name FROM public.clients WHERE id = o.client_id;

        SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 9) AS INTEGER)), 0) + 1
          INTO next_number
          FROM public.production_jobs
         WHERE job_number LIKE 'P' || date_prefix || '-%';

        new_job_num := 'P' || date_prefix || '-' || LPAD(next_number::TEXT, 3, '0');

        INSERT INTO public.production_jobs (order_id, job_number, current_stage, priority, client_name, due_date)
        VALUES (o.id, new_job_num, 'cutting', 0, cli_name, o.delivery_date)
        RETURNING id INTO new_job_id;

        INSERT INTO public.production_stages (job_id, stage, status)
        VALUES
          (new_job_id, 'cutting', 'pending'),
          (new_job_id, 'processing', 'pending'),
          (new_job_id, 'tempering', 'pending'),
          (new_job_id, 'coating', 'pending'),
          (new_job_id, 'assembly', 'pending'),
          (new_job_id, 'quality_control', 'pending'),
          (new_job_id, 'shipping', 'pending');
    END LOOP;
END;
$backfill$;
