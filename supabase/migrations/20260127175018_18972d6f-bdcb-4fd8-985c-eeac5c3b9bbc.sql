-- =============================================
-- FAZA 3: Gestiune Clienți, Stocuri, Producție, Rapoarte
-- =============================================

-- Enum pentru tip client
CREATE TYPE public.client_type AS ENUM ('person', 'company', 'distributor');

-- Enum pentru status comandă/ofertă
CREATE TYPE public.order_status AS ENUM ('quote', 'confirmed', 'in_production', 'completed', 'delivered', 'cancelled');

-- Enum pentru etape producție
CREATE TYPE public.production_stage AS ENUM ('cutting', 'processing', 'tempering', 'coating', 'assembly', 'quality_control', 'shipping');

-- Enum pentru tip material
CREATE TYPE public.material_type AS ENUM ('glass', 'hardware', 'consumable');

-- Enum pentru unitate de măsură
CREATE TYPE public.unit_type AS ENUM ('sqm', 'lm', 'pcs', 'kg', 'l');

-- =============================================
-- 1. MODUL CLIENȚI (CRM)
-- =============================================

CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_type client_type NOT NULL DEFAULT 'person',
    name TEXT NOT NULL,
    company_name TEXT,
    cui TEXT,
    reg_com TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    county TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'România',
    discount_percent NUMERIC(5,2) DEFAULT 0,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    payment_term_days INTEGER DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contacte multiple pentru clienți
CREATE TABLE public.client_contacts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 2. MODUL COMENZI/OFERTE
-- =============================================

CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.clients(id),
    status order_status NOT NULL DEFAULT 'quote',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_percent NUMERIC(5,2) DEFAULT 19,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) DEFAULT 0,
    delivery_address TEXT,
    delivery_date DATE,
    notes TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Produse din comandă (items)
CREATE TABLE public.order_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL,
    configuration JSONB NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Istoric stări comandă (timeline)
CREATE TABLE public.order_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status order_status,
    to_status order_status NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documente atașate comenzii
CREATE TABLE public.order_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plăți pentru comenzi
CREATE TABLE public.order_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 3. MODUL INVENTAR/STOCURI
-- =============================================

CREATE TABLE public.materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    material_type material_type NOT NULL,
    unit unit_type NOT NULL DEFAULT 'pcs',
    unit_price NUMERIC(12,2) DEFAULT 0,
    stock_quantity NUMERIC(12,3) DEFAULT 0,
    min_stock_level NUMERIC(12,3) DEFAULT 0,
    location TEXT,
    supplier TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mișcări stoc
CREATE TABLE public.stock_movements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment', 'reserved'
    quantity NUMERIC(12,3) NOT NULL,
    reference_type TEXT, -- 'order', 'production', 'manual'
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rezervări stoc pentru comenzi
CREATE TABLE public.stock_reservations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    quantity NUMERIC(12,3) NOT NULL,
    is_fulfilled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 4. MODUL PRODUCȚIE
-- =============================================

-- Fișe de producție
CREATE TABLE public.production_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_number TEXT NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_product_id UUID REFERENCES public.order_products(id),
    current_stage production_stage NOT NULL DEFAULT 'cutting',
    priority INTEGER DEFAULT 0,
    due_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Etape producție (tracking)
CREATE TABLE public.production_stages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.production_jobs(id) ON DELETE CASCADE,
    stage production_stage NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
    operator_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Probleme/defecte în producție
CREATE TABLE public.production_issues (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.production_jobs(id) ON DELETE CASCADE,
    stage production_stage NOT NULL,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    is_resolved BOOLEAN DEFAULT false,
    resolution TEXT,
    reported_by UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ENABLE RLS
-- =============================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_issues ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Clienți
-- =============================================

CREATE POLICY "Authenticated users can view clients"
ON public.clients FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Sales and admins can manage clients"
ON public.clients FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'sales')
);

CREATE POLICY "Authenticated users can view client contacts"
ON public.client_contacts FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Sales and admins can manage client contacts"
ON public.client_contacts FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'sales')
);

-- =============================================
-- RLS POLICIES - Comenzi
-- =============================================

CREATE POLICY "Authenticated users can view orders"
ON public.orders FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Sales can create orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'sales')
);

CREATE POLICY "Sales and admins can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'sales') OR
    has_role(auth.uid(), 'production_manager')
);

CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Order products
CREATE POLICY "Authenticated users can view order products"
ON public.order_products FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Sales and admins can manage order products"
ON public.order_products FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'sales')
);

-- Order history
CREATE POLICY "Authenticated users can view order history"
ON public.order_history FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can add order history"
ON public.order_history FOR INSERT TO authenticated
WITH CHECK (true);

-- Order documents
CREATE POLICY "Authenticated users can view order documents"
ON public.order_documents FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage order documents"
ON public.order_documents FOR ALL TO authenticated
USING (true);

-- Order payments
CREATE POLICY "Authenticated users can view order payments"
ON public.order_payments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Sales and admins can manage order payments"
ON public.order_payments FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'sales')
);

-- =============================================
-- RLS POLICIES - Inventar
-- =============================================

CREATE POLICY "Authenticated users can view materials"
ON public.materials FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins and managers can manage materials"
ON public.materials FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'production_manager')
);

CREATE POLICY "Authenticated users can view stock movements"
ON public.stock_movements FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Production staff can manage stock movements"
ON public.stock_movements FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'production_manager') OR
    has_role(auth.uid(), 'operator')
);

CREATE POLICY "Authenticated users can view stock reservations"
ON public.stock_reservations FOR SELECT TO authenticated
USING (true);

CREATE POLICY "System can manage stock reservations"
ON public.stock_reservations FOR ALL TO authenticated
USING (true);

-- =============================================
-- RLS POLICIES - Producție
-- =============================================

CREATE POLICY "Authenticated users can view production jobs"
ON public.production_jobs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Production staff can manage production jobs"
ON public.production_jobs FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'production_manager')
);

CREATE POLICY "Authenticated users can view production stages"
ON public.production_stages FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Production staff can manage production stages"
ON public.production_stages FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'production_manager') OR
    has_role(auth.uid(), 'operator')
);

CREATE POLICY "Authenticated users can view production issues"
ON public.production_issues FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Production staff can manage production issues"
ON public.production_issues FOR ALL TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'production_manager') OR
    has_role(auth.uid(), 'operator')
);

-- =============================================
-- TRIGGERS pentru updated_at
-- =============================================

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON public.materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_jobs_updated_at
    BEFORE UPDATE ON public.production_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCȚIE pentru generare număr comandă
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
    order_num TEXT;
BEGIN
    year_prefix := to_char(now(), 'YY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.orders
    WHERE order_number LIKE year_prefix || '-%';
    
    order_num := year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
    RETURN order_num;
END;
$$;

-- =============================================
-- FUNCȚIE pentru generare număr job producție
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_job_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    date_prefix TEXT;
    next_number INTEGER;
    job_num TEXT;
BEGIN
    date_prefix := to_char(now(), 'YYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 8) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.production_jobs
    WHERE job_number LIKE 'P' || date_prefix || '%';
    
    job_num := 'P' || date_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
    RETURN job_num;
END;
$$;

-- =============================================
-- INDEX-uri pentru performanță
-- =============================================

CREATE INDEX idx_clients_type ON public.clients(client_type);
CREATE INDEX idx_clients_is_active ON public.clients(is_active);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_client ON public.orders(client_id);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_materials_type ON public.materials(material_type);
CREATE INDEX idx_materials_code ON public.materials(code);
CREATE INDEX idx_production_jobs_status ON public.production_jobs(current_stage);
CREATE INDEX idx_production_jobs_order ON public.production_jobs(order_id);
CREATE INDEX idx_production_jobs_due ON public.production_jobs(due_date);