
-- 1) Alert settings table
CREATE TABLE IF NOT EXISTS public.admin_alert_settings (
  admin_user_id uuid PRIMARY KEY,
  churn_threshold int NOT NULL DEFAULT 70,
  inactivity_days int NOT NULL DEFAULT 14,
  email_enabled boolean NOT NULL DEFAULT false,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages own alert settings"
  ON public.admin_alert_settings
  FOR ALL
  TO authenticated
  USING (admin_user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (admin_user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_admin_alert_settings_updated_at
  BEFORE UPDATE ON public.admin_alert_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Power users (top 5 by engagement)
CREATE OR REPLACE FUNCTION public.get_admin_power_users(_from timestamptz, _to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.score DESC) INTO v_result FROM (
    WITH agg AS (
      SELECT
        e.user_id, e.company_id,
        SUM(e.active_seconds) AS total_seconds,
        COUNT(DISTINCT date_trunc('day', e.bucket_start)) AS active_days,
        COUNT(DISTINCT e.module) AS distinct_modules,
        MAX(e.bucket_start) AS last_active
      FROM user_activity_events e
      WHERE e.bucket_start >= _from AND e.bucket_start < _to
        AND NOT has_role(e.user_id, 'admin'::app_role)
      GROUP BY e.user_id, e.company_id
    )
    SELECT
      a.user_id,
      COALESCE(NULLIF(p.full_name, ''), '—') AS full_name,
      COALESCE(c.name, p.company_name, '—') AS company_name,
      ROUND((a.total_seconds::numeric / 3600), 2) AS hours,
      a.active_days::int,
      a.distinct_modules::int,
      a.last_active,
      LEAST(100, ROUND(
        0.4 * (LEAST(a.active_days, 30)::numeric / 30) * 100
        + 0.3 * LEAST(1, (a.total_seconds::numeric / NULLIF(a.active_days, 0)) / 7200) * 100
        + 0.3 * LEAST(1, a.distinct_modules::numeric / 6) * 100
      ))::int AS score
    FROM agg a
    LEFT JOIN profiles p ON p.user_id = a.user_id
    LEFT JOIN companies c ON c.id = a.company_id
    ORDER BY score DESC, hours DESC
    LIMIT 5
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 3) Feature funnel: calculator -> quote -> order -> invoice
CREATE OR REPLACE FUNCTION public.get_admin_feature_funnel(_from timestamptz, _to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_calc int;
  v_quote int;
  v_order int;
  v_invoice int;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  SELECT COUNT(DISTINCT user_id) INTO v_calc
  FROM user_activity_events
  WHERE bucket_start >= _from AND bucket_start < _to
    AND module = 'calculators'
    AND NOT has_role(user_id, 'admin'::app_role);

  SELECT COUNT(DISTINCT created_by) INTO v_quote
  FROM quotes
  WHERE created_at >= _from AND created_at < _to
    AND created_by IS NOT NULL
    AND NOT has_role(created_by, 'admin'::app_role);

  SELECT COUNT(DISTINCT created_by) INTO v_order
  FROM orders
  WHERE created_at >= _from AND created_at < _to
    AND created_by IS NOT NULL
    AND NOT has_role(created_by, 'admin'::app_role);

  SELECT COUNT(DISTINCT created_by) INTO v_invoice
  FROM invoices
  WHERE created_at >= _from AND created_at < _to
    AND created_by IS NOT NULL
    AND NOT has_role(created_by, 'admin'::app_role);

  RETURN jsonb_build_array(
    jsonb_build_object('step', 'calculator', 'label', 'Calculator 3D', 'users', v_calc),
    jsonb_build_object('step', 'quote', 'label', 'Ofertă salvată', 'users', v_quote),
    jsonb_build_object('step', 'order', 'label', 'Comandă creată', 'users', v_order),
    jsonb_build_object('step', 'invoice', 'label', 'Factură emisă', 'users', v_invoice)
  );
END;
$$;

-- 4) Activity heatmap: 7 dow x 24 hours
CREATE OR REPLACE FUNCTION public.get_admin_activity_heatmap(_from timestamptz, _to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  SELECT jsonb_agg(row_to_json(t)) INTO v_result FROM (
    SELECT
      EXTRACT(ISODOW FROM bucket_start)::int AS dow,
      EXTRACT(HOUR FROM bucket_start)::int AS hour,
      ROUND((SUM(active_seconds)::numeric / 3600), 2) AS hours,
      COUNT(DISTINCT user_id)::int AS users
    FROM user_activity_events
    WHERE bucket_start >= _from AND bucket_start < _to
      AND NOT has_role(user_id, 'admin'::app_role)
    GROUP BY 1, 2
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 5) User drilldown: extended history for #2
CREATE OR REPLACE FUNCTION public.get_admin_user_drilldown(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sessions jsonb;
  v_modules jsonb;
  v_orders jsonb;
  v_quotes jsonb;
  v_invoice jsonb;
  v_profile jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  -- last 30 days of sessions (per day)
  SELECT jsonb_agg(row_to_json(t) ORDER BY t.day DESC) INTO v_sessions FROM (
    SELECT date_trunc('day', bucket_start)::date AS day,
           ROUND((SUM(active_seconds)::numeric / 3600), 2) AS hours,
           COUNT(*)::int AS events
    FROM user_activity_events
    WHERE user_id = _user_id
      AND bucket_start >= now() - interval '30 days'
    GROUP BY 1
  ) t;

  -- top modules last 30 days
  SELECT jsonb_agg(row_to_json(t) ORDER BY t.hours DESC) INTO v_modules FROM (
    SELECT module,
           ROUND((SUM(active_seconds)::numeric / 3600), 2) AS hours,
           ROUND((SUM(active_seconds) / 60.0))::int AS minutes
    FROM user_activity_events
    WHERE user_id = _user_id
      AND bucket_start >= now() - interval '30 days'
    GROUP BY module
  ) t;

  -- orders last 30 days
  SELECT jsonb_build_object(
    'count', COUNT(*)::int,
    'total', COALESCE(SUM(total), 0),
    'recent', COALESCE(jsonb_agg(row_to_json(o) ORDER BY o.created_at DESC) FILTER (WHERE o.created_at IS NOT NULL), '[]'::jsonb)
  ) INTO v_orders
  FROM (
    SELECT id, order_number, status::text AS status, total, created_at
    FROM orders
    WHERE created_by = _user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) o;

  -- quotes last 30 days
  SELECT jsonb_build_object(
    'count', COUNT(*)::int,
    'recent', COALESCE(jsonb_agg(row_to_json(q) ORDER BY q.created_at DESC) FILTER (WHERE q.created_at IS NOT NULL), '[]'::jsonb)
  ) INTO v_quotes
  FROM (
    SELECT id, ref_number, product_label, total_price, status, created_at
    FROM quotes
    WHERE created_by = _user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) q;

  -- last invoice
  SELECT row_to_json(i) INTO v_invoice FROM (
    SELECT id, invoice_number, total, paid_amount, status::text AS status, issue_date, due_date
    FROM invoices
    WHERE created_by = _user_id
    ORDER BY created_at DESC
    LIMIT 1
  ) i;

  -- profile snapshot
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
    'auth_email', (SELECT email FROM auth.users WHERE id = _user_id)
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
    'last_invoice', v_invoice
  );
END;
$$;

-- 6) Churn alert targets (used by cron / edge function)
CREATE OR REPLACE FUNCTION public.get_admin_churn_alert_targets(_churn_threshold int DEFAULT 70, _inactivity_days int DEFAULT 14)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_churn jsonb;
  v_inactive jsonb;
BEGIN
  -- This can be called by admins OR by service role from cron
  IF auth.uid() IS NOT NULL AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins or service role';
  END IF;

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.score DESC) INTO v_churn FROM (
    SELECT * FROM jsonb_to_recordset((SELECT get_admin_churn_risk_for_service()))
      AS x(user_id uuid, full_name text, company_name text, score int, top_reason text, last_active timestamptz)
    WHERE x.score >= _churn_threshold
  ) t;

  SELECT jsonb_agg(row_to_json(t)) INTO v_inactive FROM (
    SELECT p.user_id,
           COALESCE(NULLIF(p.full_name, ''), '—') AS full_name,
           COALESCE(c.name, p.company_name, '—') AS company_name,
           (SELECT MAX(bucket_start) FROM user_activity_events e WHERE e.user_id = p.user_id) AS last_active,
           CASE
             WHEN (SELECT MAX(bucket_start) FROM user_activity_events e WHERE e.user_id = p.user_id) IS NULL
             THEN 9999
             ELSE EXTRACT(EPOCH FROM (now() - (SELECT MAX(bucket_start) FROM user_activity_events e WHERE e.user_id = p.user_id)))::int / 86400
           END AS days_inactive
    FROM profiles p
    LEFT JOIN companies c ON c.id = p.company_id
    WHERE p.is_approved = true
      AND NOT has_role(p.user_id, 'admin'::app_role)
  ) t
  WHERE (t->>'days_inactive')::int >= _inactivity_days;

  RETURN jsonb_build_object(
    'churn', COALESCE(v_churn, '[]'::jsonb),
    'inactive', COALESCE(v_inactive, '[]'::jsonb)
  );
END;
$$;

-- Helper that bypasses admin check (only callable from inside SECURITY DEFINER functions)
CREATE OR REPLACE FUNCTION public.get_admin_churn_risk_for_service()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_result jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(t) ORDER BY t.score DESC) INTO v_result FROM (
    WITH subs AS (
      SELECT p.user_id, p.full_name, p.company_name, p.approved_at, c.name AS company_real,
             (SELECT MAX(bucket_start) FROM user_activity_events e WHERE e.user_id = p.user_id) AS last_active,
             COALESCE((SELECT SUM(active_seconds) FROM user_activity_events e
                       WHERE e.user_id = p.user_id AND bucket_start >= now() - interval '14 days'), 0) AS secs_recent,
             COALESCE((SELECT SUM(active_seconds) FROM user_activity_events e
                       WHERE e.user_id = p.user_id AND bucket_start >= now() - interval '28 days'
                         AND bucket_start < now() - interval '14 days'), 0) AS secs_prev
      FROM profiles p
      LEFT JOIN companies c ON c.id = p.company_id
      WHERE p.is_approved = true
        AND NOT has_role(p.user_id, 'admin'::app_role)
    ),
    scored AS (
      SELECT s.*,
        LEAST(25, CASE
          WHEN last_active IS NULL THEN 25
          ELSE ROUND(LEAST(25, EXTRACT(EPOCH FROM (now() - last_active)) / 86400 * 25.0 / 14.0))
        END)::int AS inactivity_pts,
        CASE
          WHEN secs_prev = 0 AND secs_recent = 0 THEN 12
          WHEN secs_prev = 0 THEN 0
          WHEN secs_recent >= secs_prev THEN 0
          ELSE LEAST(25, ROUND(((secs_prev - secs_recent)::numeric / secs_prev) * 25))::int
        END AS trend_pts,
        CASE
          WHEN approved_at IS NULL THEN 0
          WHEN approved_at > now() - interval '30 days' AND last_active IS NULL THEN 25
          WHEN approved_at > now() - interval '30 days' AND secs_recent = 0 THEN 15
          ELSE 0
        END AS onboarding_pts
      FROM subs s
    )
    SELECT
      user_id,
      COALESCE(NULLIF(full_name, ''), '—') AS full_name,
      COALESCE(company_real, company_name, '—') AS company_name,
      last_active,
      (inactivity_pts + trend_pts + onboarding_pts)::int AS score,
      CASE
        WHEN onboarding_pts >= 15 THEN 'Onboarding incomplet'
        WHEN inactivity_pts >= 20 THEN 'Inactivitate prelungită'
        WHEN trend_pts >= 15 THEN 'Scădere accentuată'
        ELSE 'Risc moderat'
      END AS top_reason
    FROM scored
    WHERE (inactivity_pts + trend_pts + onboarding_pts) >= 30
  ) t;
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;
