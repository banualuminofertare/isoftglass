
-- Enum-uri noi
CREATE TYPE public.ticket_type AS ENUM ('defect_productie', 'defect_montaj', 'deteriorare_transport', 'reclamatie_client');
CREATE TYPE public.ticket_priority AS ENUM ('scazuta', 'medie', 'urgenta', 'critica');
CREATE TYPE public.ticket_status AS ENUM ('deschis', 'in_evaluare', 'programat', 'in_lucru', 'rezolvat', 'inchis');
CREATE TYPE public.intervention_result AS ENUM ('rezolvat', 'partial', 'necesita_revenire');

-- Functie generare numar ticket
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
    ticket_num TEXT;
BEGIN
    year_prefix := 'R' || to_char(now(), 'YY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.service_tickets
    WHERE ticket_number LIKE year_prefix || '-%';
    ticket_num := year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
    RETURN ticket_num;
END;
$function$;

-- Tabel service_tickets
CREATE TABLE public.service_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL DEFAULT public.generate_ticket_number(),
    order_id UUID REFERENCES public.orders(id),
    client_id UUID REFERENCES public.clients(id),
    ticket_type public.ticket_type NOT NULL DEFAULT 'reclamatie_client',
    priority public.ticket_priority NOT NULL DEFAULT 'medie',
    status public.ticket_status NOT NULL DEFAULT 'deschis',
    description TEXT NOT NULL,
    intervention_address TEXT,
    resolution_deadline DATE,
    created_by UUID,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service tickets"
ON public.service_tickets FOR SELECT USING (true);

CREATE POLICY "Admin, production_manager, sales can manage service tickets"
ON public.service_tickets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role) OR has_role(auth.uid(), 'sales'::app_role));

CREATE TRIGGER update_service_tickets_updated_at
BEFORE UPDATE ON public.service_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabel service_interventions
CREATE TABLE public.service_interventions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.service_tickets(id) ON DELETE CASCADE,
    assigned_to TEXT,
    scheduled_date DATE,
    completed_date DATE,
    duration_minutes INTEGER,
    materials_used TEXT,
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    result public.intervention_result,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service interventions"
ON public.service_interventions FOR SELECT USING (true);

CREATE POLICY "Admin, production_manager, sales can manage service interventions"
ON public.service_interventions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role) OR has_role(auth.uid(), 'sales'::app_role));

-- Tabel service_photos
CREATE TABLE public.service_photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.service_tickets(id) ON DELETE CASCADE,
    intervention_id UUID REFERENCES public.service_interventions(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    photo_type TEXT NOT NULL DEFAULT 'before',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service photos"
ON public.service_photos FOR SELECT USING (true);

CREATE POLICY "Admin, production_manager, sales can manage service photos"
ON public.service_photos FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role) OR has_role(auth.uid(), 'sales'::app_role));
