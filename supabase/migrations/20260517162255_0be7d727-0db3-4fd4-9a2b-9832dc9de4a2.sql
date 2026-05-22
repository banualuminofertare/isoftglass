-- Ensure one active session per user (for upsert)
ALTER TABLE public.user_activity_sessions
  ADD CONSTRAINT user_activity_sessions_user_id_key UNIQUE (user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_sessions_user_last
  ON public.user_activity_sessions(user_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_events_user_country
  ON public.user_activity_events(user_id, country_code, bucket_start DESC);

-- Extend drilldown RPC to include last country + last 5 sessions
CREATE OR REPLACE FUNCTION public.get_admin_user_drilldown(_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sessions jsonb;
  v_modules jsonb;
  v_orders jsonb;
  v_quotes jsonb;
  v_invoice jsonb;
  v_profile jsonb;
  v_last_country text;
  v_recent_countries jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.day DESC) INTO v_sessions FROM (
    SELECT date_trunc('day', bucket_start)::date AS day,
           ROUND((SUM(active_seconds)::numeric / 3600), 2) AS hours,
           COUNT(*)::int AS events
    FROM user_activity_events
    WHERE user_id = _user_id
      AND bucket_start >= now() - interval '30 days'
    GROUP BY 1
  ) t;

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.hours DESC) INTO v_modules FROM (
    SELECT module,
           ROUND((SUM(active_seconds)::numeric / 3600), 2) AS hours,
           ROUND((SUM(active_seconds) / 60.0))::int AS minutes
    FROM user_activity_events
    WHERE user_id = _user_id
      AND bucket_start >= now() - interval '30 days'
    GROUP BY module
  ) t;

  SELECT jsonb_build_object(
    'count', COUNT(*)::int,
    'total', COALESCE(SUM(total), 0),
    'recent', COALESCE(jsonb_agg(row_to_json(o) ORDER BY o.created_at DESC) FILTER (WHERE o.created_at IS NOT NULL), '[]'::jsonb)
  ) INTO v_orders
  FROM (
    SELECT id, order_number, status::text AS status, total, created_at
    FROM orders WHERE created_by = _user_id
    ORDER BY created_at DESC LIMIT 10
  ) o;

  SELECT jsonb_build_object(
    'count', COUNT(*)::int,
    'recent', COALESCE(jsonb_agg(row_to_json(q) ORDER BY q.created_at DESC) FILTER (WHERE q.created_at IS NOT NULL), '[]'::jsonb)
  ) INTO v_quotes
  FROM (
    SELECT id, ref_number, product_label, total_price, status, created_at
    FROM quotes WHERE created_by = _user_id
    ORDER BY created_at DESC LIMIT 10
  ) q;

  SELECT row_to_json(i) INTO v_invoice FROM (
    SELECT id, invoice_number, total, paid_amount, status::text AS status, issue_date, due_date
    FROM invoices WHERE created_by = _user_id
    ORDER BY created_at DESC LIMIT 1
  ) i;

  -- Last known country (sessions first, fallback events)
  SELECT country_code INTO v_last_country
  FROM user_activity_sessions
  WHERE user_id = _user_id AND country_code IS NOT NULL
  ORDER BY last_seen_at DESC LIMIT 1;

  IF v_last_country IS NULL THEN
    SELECT country_code INTO v_last_country
    FROM user_activity_events
    WHERE user_id = _user_id AND country_code IS NOT NULL
    ORDER BY bucket_start DESC LIMIT 1;
  END IF;

  -- Recent distinct countries (up to 5)
  SELECT jsonb_agg(row_to_json(t)) INTO v_recent_countries FROM (
    SELECT country_code, MAX(bucket_start) AS last_seen
    FROM user_activity_events
    WHERE user_id = _user_id AND country_code IS NOT NULL
    GROUP BY country_code
    ORDER BY MAX(bucket_start) DESC
    LIMIT 5
  ) t;

  SELECT jsonb_build_object(
    'full_name', p.full_name,
    'phone', p.phone,
    'company_name', COALESCE(c.name, p.company_name),
    'company_email', c.email,
    'role', get_user_role(_user_id)::text,
    'approved_at', p.approved_at,
    'is_approved', p.is_approved,
    'days_since_approval',
      CASE WHEN p.approved_at IS NULL THEN NULL
      ELSE EXTRACT(EPOCH FROM (now() - p.approved_at))::int / 86400 END,
    'auth_email', (SELECT email FROM auth.users WHERE id = _user_id),
    'last_country', v_last_country
  ) INTO v_profile
  FROM profiles p
  LEFT JOIN companies c ON c.id = p.company_id
  WHERE p.user_id = _user_id;

  RETURN jsonb_build_object(
    'profile', COALESCE(v_profile, '{}'::jsonb),
    'sessions', COALESCE(v_sessions, '[]'::jsonb),
    'modules', COALESCE(v_modules, '[]'::jsonb),
    'orders', COALESCE(v_orders, jsonb_build_object('count', 0, 'total', 0, 'recent', '[]'::jsonb)),
    'quotes', COALESCE(v_quotes, jsonb_build_object('count', 0, 'recent', '[]'::jsonb)),
    'last_invoice', v_invoice,
    'recent_countries', COALESCE(v_recent_countries, '[]'::jsonb)
  );
END;
$function$;