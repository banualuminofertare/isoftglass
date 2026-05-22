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