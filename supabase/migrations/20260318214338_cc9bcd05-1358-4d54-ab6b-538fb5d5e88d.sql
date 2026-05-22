-- orders: drop & recreate FK with SET NULL
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- service_tickets: drop & recreate FK with SET NULL
ALTER TABLE public.service_tickets DROP CONSTRAINT IF EXISTS service_tickets_client_id_fkey;
ALTER TABLE public.service_tickets ADD CONSTRAINT service_tickets_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;