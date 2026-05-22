
-- Activity events: aggregated 60s buckets
CREATE TABLE public.user_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid,
  country_code text,
  route text NOT NULL DEFAULT '/',
  module text NOT NULL DEFAULT 'other',
  active_seconds integer NOT NULL DEFAULT 0,
  bucket_start timestamptz NOT NULL DEFAULT date_trunc('minute', now()),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_uae_user_bucket ON public.user_activity_events(user_id, bucket_start DESC);
CREATE INDEX idx_uae_company_bucket ON public.user_activity_events(company_id, bucket_start DESC);
CREATE INDEX idx_uae_module_bucket ON public.user_activity_events(module, bucket_start DESC);
CREATE INDEX idx_uae_bucket ON public.user_activity_events(bucket_start DESC);

ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own activity"
ON public.user_activity_events FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own activity"
ON public.user_activity_events FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins view all activity"
ON public.user_activity_events FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete activity"
ON public.user_activity_events FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Sessions
CREATE TABLE public.user_activity_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid,
  country_code text,
  user_agent text,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  active_seconds integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_uas_user ON public.user_activity_sessions(user_id, started_at DESC);

ALTER TABLE public.user_activity_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own session"
ON public.user_activity_sessions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own session"
ON public.user_activity_sessions FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users view own sessions"
ON public.user_activity_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins view all sessions"
ON public.user_activity_sessions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin-only analytics aggregator
CREATE OR REPLACE FUNCTION public.get_admin_analytics(_from timestamptz, _to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_top_users jsonb;
  v_module_usage jsonb;
  v_country_usage jsonb;
  v_per_user jsonb;
  v_kpis jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can access analytics';
  END IF;

  -- KPIs
  SELECT jsonb_build_object(
    'total_active_users', COUNT(DISTINCT user_id),
    'total_hours', ROUND((SUM(active_seconds)::numeric / 3600), 2),
    'total_events', COUNT(*),
    'avg_hours_per_user_per_day',
      CASE WHEN COUNT(DISTINCT user_id) = 0 THEN 0
      ELSE ROUND(
        (SUM(active_seconds)::numeric / 3600)
        / NULLIF(COUNT(DISTINCT user_id), 0)
        / NULLIF(GREATEST(EXTRACT(EPOCH FROM (_to - _from)) / 86400, 1), 0),
        2)
      END
  ) INTO v_kpis
  FROM user_activity_events
  WHERE bucket_start >= _from AND bucket_start < _to;

  -- Top users
  SELECT jsonb_agg(row_to_json(t)) INTO v_top_users FROM (
    SELECT
      e.user_id,
      COALESCE(p.full_name, '—') as full_name,
      COALESCE(c.name, '—') as company_name,
      COALESCE(e.country_code, c.country_code, 'RO') as country_code,
      COALESCE(get_user_role(e.user_id)::text, 'sales') as role,
      ROUND((SUM(e.active_seconds)::numeric / 3600), 2) as hours,
      MAX(e.bucket_start) as last_active
    FROM user_activity_events e
    LEFT JOIN profiles p ON p.user_id = e.user_id
    LEFT JOIN companies c ON c.id = e.company_id
    WHERE e.bucket_start >= _from AND e.bucket_start < _to
    GROUP BY e.user_id, p.full_name, c.name, e.country_code, c.country_code
    ORDER BY hours DESC
    LIMIT 50
  ) t;

  -- Module usage
  SELECT jsonb_agg(row_to_json(t)) INTO v_module_usage FROM (
    SELECT module, ROUND((SUM(active_seconds)::numeric / 3600), 2) as hours
    FROM user_activity_events
    WHERE bucket_start >= _from AND bucket_start < _to
    GROUP BY module
    ORDER BY hours DESC
  ) t;

  -- Country usage
  SELECT jsonb_agg(row_to_json(t)) INTO v_country_usage FROM (
    SELECT
      COALESCE(e.country_code, c.country_code, 'RO') as country_code,
      ROUND((SUM(e.active_seconds)::numeric / 3600), 2) as hours,
      COUNT(DISTINCT e.user_id) as users
    FROM user_activity_events e
    LEFT JOIN companies c ON c.id = e.company_id
    WHERE e.bucket_start >= _from AND e.bucket_start < _to
    GROUP BY COALESCE(e.country_code, c.country_code, 'RO')
    ORDER BY hours DESC
  ) t;

  -- Per-user detail with engagement score
  SELECT jsonb_agg(row_to_json(t)) INTO v_per_user FROM (
    WITH base AS (
      SELECT
        e.user_id,
        e.company_id,
        e.active_seconds,
        e.module,
        e.bucket_start
      FROM user_activity_events e
      WHERE e.bucket_start >= _from AND e.bucket_start < _to
    ),
    agg AS (
      SELECT
        user_id,
        company_id,
        SUM(active_seconds) as total_seconds,
        COUNT(DISTINCT date_trunc('day', bucket_start)) as active_days,
        COUNT(DISTINCT module) as distinct_modules,
        MAX(bucket_start) as last_active,
        (SELECT module FROM base b2
          WHERE b2.user_id = base.user_id
          GROUP BY module ORDER BY SUM(active_seconds) DESC LIMIT 1) as top_module
      FROM base
      GROUP BY user_id, company_id
    )
    SELECT
      a.user_id,
      COALESCE(p.full_name, '—') as full_name,
      COALESCE(c.name, '—') as company_name,
      COALESCE(c.country_code, 'RO') as country_code,
      COALESCE(get_user_role(a.user_id)::text, 'sales') as role,
      ROUND((a.total_seconds::numeric / 3600), 2) as hours,
      a.active_days,
      a.distinct_modules,
      a.top_module,
      a.last_active,
      LEAST(100, ROUND(
        0.4 * (LEAST(a.active_days, 30)::numeric / 30) * 100
        + 0.3 * LEAST(1, (a.total_seconds::numeric / NULLIF(a.active_days, 0)) / 7200) * 100
        + 0.3 * LEAST(1, a.distinct_modules::numeric / 6) * 100
      ))::int as engagement_score
    FROM agg a
    LEFT JOIN profiles p ON p.user_id = a.user_id
    LEFT JOIN companies c ON c.id = a.company_id
    ORDER BY hours DESC
  ) t;

  v_result := jsonb_build_object(
    'kpis', COALESCE(v_kpis, '{}'::jsonb),
    'top_users', COALESCE(v_top_users, '[]'::jsonb),
    'module_usage', COALESCE(v_module_usage, '[]'::jsonb),
    'country_usage', COALESCE(v_country_usage, '[]'::jsonb),
    'per_user', COALESCE(v_per_user, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$;

-- Per-user detail (timeline + module breakdown)
CREATE OR REPLACE FUNCTION public.get_admin_user_analytics(_user_id uuid, _from timestamptz, _to timestamptz)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_modules jsonb;
  v_timeline jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  SELECT jsonb_agg(row_to_json(t)) INTO v_modules FROM (
    SELECT module, ROUND((SUM(active_seconds)::numeric / 3600), 2) as hours
    FROM user_activity_events
    WHERE user_id = _user_id AND bucket_start >= _from AND bucket_start < _to
    GROUP BY module ORDER BY hours DESC
  ) t;

  SELECT jsonb_agg(row_to_json(t)) INTO v_timeline FROM (
    SELECT date_trunc('day', bucket_start)::date as day,
           ROUND((SUM(active_seconds)::numeric / 3600), 2) as hours
    FROM user_activity_events
    WHERE user_id = _user_id AND bucket_start >= _from AND bucket_start < _to
    GROUP BY 1 ORDER BY 1
  ) t;

  RETURN jsonb_build_object(
    'modules', COALESCE(v_modules, '[]'::jsonb),
    'timeline', COALESCE(v_timeline, '[]'::jsonb)
  );
END;
$$;
