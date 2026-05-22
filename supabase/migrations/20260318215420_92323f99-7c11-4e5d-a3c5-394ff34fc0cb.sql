
CREATE OR REPLACE FUNCTION public.delete_client_everywhere(p_client_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_client_company_id uuid;
  v_deleted_orders int := 0;
  v_deleted_tickets int := 0;
  v_order_ids uuid[];
BEGIN
  -- Get caller's company
  SELECT company_id INTO v_company_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  
  -- Verify client exists and caller has access
  SELECT company_id INTO v_client_company_id FROM public.clients WHERE id = p_client_id;
  
  IF v_client_company_id IS NULL AND NOT EXISTS (
    SELECT 1 FROM public.clients WHERE id = p_client_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Client not found or access denied';
  END IF;
  
  IF v_client_company_id IS NOT NULL AND v_client_company_id != v_company_id THEN
    -- Check admin impersonation
    IF NOT (has_role(auth.uid(), 'admin') AND has_accepted_access_to_company(v_client_company_id)) THEN
      RAISE EXCEPTION 'Access denied';
    END IF;
  END IF;

  -- Collect order IDs for this client
  SELECT array_agg(id) INTO v_order_ids FROM public.orders WHERE client_id = p_client_id;

  -- Delete service tickets linked to this client
  DELETE FROM public.service_tickets WHERE client_id = p_client_id;
  GET DIAGNOSTICS v_deleted_tickets = ROW_COUNT;

  -- Also delete service tickets linked to client's orders
  IF v_order_ids IS NOT NULL THEN
    DELETE FROM public.service_tickets WHERE order_id = ANY(v_order_ids) AND client_id IS DISTINCT FROM p_client_id;
    v_deleted_tickets := v_deleted_tickets + ROW_COUNT;
  END IF;

  -- Delete orders (cascades to order_products, order_history, order_documents, order_payments, stock_reservations, production_jobs -> production_stages, production_issues)
  DELETE FROM public.orders WHERE client_id = p_client_id;
  GET DIAGNOSTICS v_deleted_orders = ROW_COUNT;

  -- Delete client (cascades to client_contacts)
  DELETE FROM public.clients WHERE id = p_client_id;

  RETURN jsonb_build_object(
    'deleted_orders', v_deleted_orders,
    'deleted_tickets', v_deleted_tickets
  );
END;
$$;
