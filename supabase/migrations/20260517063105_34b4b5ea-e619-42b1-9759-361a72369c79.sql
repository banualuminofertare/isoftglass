CREATE OR REPLACE FUNCTION public.get_admin_all_subscribers()
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

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.full_name ASC) INTO v_result FROM (
    SELECT
      p.user_id,
      COALESCE(NULLIF(p.full_name, ''), '—') AS full_name,
      COALESCE(c.name, p.company_name, '—') AS company_name,
      COALESCE(c.country_code, 'RO') AS country_code,
      COALESCE(get_user_role(p.user_id)::text, 'sales') AS role,
      (SELECT MAX(bucket_start) FROM user_activity_events e WHERE e.user_id = p.user_id) AS last_active,
      COALESCE((SELECT ROUND((SUM(active_seconds)::numeric / 3600), 2)
                FROM user_activity_events e WHERE e.user_id = p.user_id), 0) AS total_hours
    FROM profiles p
    LEFT JOIN companies c ON c.id = p.company_id
    WHERE p.is_approved = true
      AND NOT has_role(p.user_id, 'admin'::app_role)
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;