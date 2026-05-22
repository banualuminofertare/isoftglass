-- Purge existing admin data
DELETE FROM public.user_activity_events
WHERE user_id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');
DELETE FROM public.user_activity_sessions
WHERE user_id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

-- Live users: exclude admins
CREATE OR REPLACE FUNCTION public.get_admin_live_users()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.last_active DESC) INTO v_result FROM (
    WITH recent AS (
      SELECT user_id, company_id, module, country_code, active_seconds, bucket_start,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY bucket_start DESC) AS rn
      FROM user_activity_events
      WHERE bucket_start >= now() - interval '5 minutes'
        AND NOT has_role(user_id, 'admin'::app_role)
    ),
    agg AS (
      SELECT user_id, company_id,
             MAX(bucket_start) AS last_active,
             SUM(active_seconds) AS seconds_5min
      FROM recent
      GROUP BY user_id, company_id
    )
    SELECT
      a.user_id,
      COALESCE(p.full_name, '—') AS full_name,
      COALESCE(c.name, '—') AS company_name,
      COALESCE(c.country_code, 'RO') AS country_code,
      COALESCE(get_user_role(a.user_id)::text, 'sales') AS role,
      (SELECT module FROM recent r WHERE r.user_id = a.user_id AND r.rn = 1) AS current_module,
      a.last_active,
      a.seconds_5min AS active_seconds_5min
    FROM agg a
    LEFT JOIN profiles p ON p.user_id = a.user_id
    LEFT JOIN companies c ON c.id = a.company_id
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- User detail: exclude admins
CREATE OR REPLACE FUNCTION public.get_admin_user_analytics(_user_id uuid, _from timestamp with time zone, _to timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      AND NOT has_role(user_id, 'admin'::app_role)
    GROUP BY module ORDER BY hours DESC
  ) t;

  SELECT jsonb_agg(row_to_json(t)) INTO v_timeline FROM (
    SELECT date_trunc('day', bucket_start)::date as day,
           ROUND((SUM(active_seconds)::numeric / 3600), 2) as hours
    FROM user_activity_events
    WHERE user_id = _user_id AND bucket_start >= _from AND bucket_start < _to
      AND NOT has_role(user_id, 'admin'::app_role)
    GROUP BY 1 ORDER BY 1
  ) t;

  RETURN jsonb_build_object(
    'modules', COALESCE(v_modules, '[]'::jsonb),
    'timeline', COALESCE(v_timeline, '[]'::jsonb)
  );
END;
$function$;

-- Global analytics: exclude admins
CREATE OR REPLACE FUNCTION public.get_admin_analytics(_from timestamp with time zone, _to timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE bucket_start >= _from AND bucket_start < _to
    AND NOT has_role(user_id, 'admin'::app_role);

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
      AND NOT has_role(e.user_id, 'admin'::app_role)
    GROUP BY e.user_id, p.full_name, c.name, e.country_code, c.country_code
    ORDER BY hours DESC
    LIMIT 50
  ) t;

  SELECT jsonb_agg(row_to_json(t)) INTO v_module_usage FROM (
    SELECT module, ROUND((SUM(active_seconds)::numeric / 3600), 2) as hours
    FROM user_activity_events
    WHERE bucket_start >= _from AND bucket_start < _to
      AND NOT has_role(user_id, 'admin'::app_role)
    GROUP BY module
    ORDER BY hours DESC
  ) t;

  SELECT jsonb_agg(row_to_json(t)) INTO v_country_usage FROM (
    SELECT
      COALESCE(e.country_code, c.country_code, 'RO') as country_code,
      ROUND((SUM(e.active_seconds)::numeric / 3600), 2) as hours,
      COUNT(DISTINCT e.user_id) as users
    FROM user_activity_events e
    LEFT JOIN companies c ON c.id = e.company_id
    WHERE e.bucket_start >= _from AND e.bucket_start < _to
      AND NOT has_role(e.user_id, 'admin'::app_role)
    GROUP BY COALESCE(e.country_code, c.country_code, 'RO')
    ORDER BY hours DESC
  ) t;

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
        AND NOT has_role(e.user_id, 'admin'::app_role)
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
$function$;