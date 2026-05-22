CREATE OR REPLACE FUNCTION public.seed_admin_test_activity(_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted int := 0;
  v_users int := 0;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;

  IF _days < 1 OR _days > 365 THEN
    RAISE EXCEPTION 'Days must be between 1 and 365';
  END IF;

  -- Clear previous seed data before re-seeding to avoid duplicates
  DELETE FROM user_activity_events WHERE route LIKE '\_\_seed\_\_%' ESCAPE '\';

  WITH subs AS (
    SELECT p.user_id, p.company_id,
           -- assign behavior profile deterministically per user
           (abs(hashtext(p.user_id::text)) % 100) AS bucket
    FROM profiles p
    WHERE p.is_approved = true
      AND NOT has_role(p.user_id, 'admin'::app_role)
  ),
  profiled AS (
    SELECT user_id, company_id,
      CASE
        WHEN bucket < 20 THEN 'power'      -- 20%
        WHEN bucket < 70 THEN 'regular'    -- 50%
        WHEN bucket < 90 THEN 'casual'     -- 20%
        ELSE 'churning'                    -- 10%
      END AS profile_type
    FROM subs
  ),
  days AS (
    SELECT generate_series(0, _days - 1) AS d_offset
  ),
  modules AS (
    SELECT * FROM (VALUES
      ('calculators', 40),
      ('orders', 20),
      ('production', 15),
      ('crm', 10),
      ('inventory', 8),
      ('processing', 4),
      ('installation', 3)
    ) AS m(module, weight)
  ),
  -- Decide per (user, day) if active and how many seconds
  daily_sessions AS (
    SELECT
      p.user_id, p.company_id, p.profile_type,
      (now() - (d.d_offset || ' days')::interval)::date AS day,
      d.d_offset,
      -- Activity probability per profile
      CASE p.profile_type
        WHEN 'power'    THEN 0.80
        WHEN 'regular'  THEN 0.55
        WHEN 'casual'   THEN 0.25
        WHEN 'churning' THEN CASE WHEN d.d_offset > _days/2 THEN 0.05 ELSE 0.50 END
      END AS active_prob,
      -- Target seconds per active day
      CASE p.profile_type
        WHEN 'power'    THEN 7200 + (random() * 7200)::int   -- 2-4h
        WHEN 'regular'  THEN 3600 + (random() * 3600)::int   -- 1-2h
        WHEN 'casual'   THEN 1800 + (random() * 1800)::int   -- 0.5-1h
        WHEN 'churning' THEN 900 + (random() * 1800)::int    -- 0.25-0.75h
      END AS target_secs
    FROM profiled p
    CROSS JOIN days d
  ),
  active_days AS (
    SELECT * FROM daily_sessions WHERE random() < active_prob
  ),
  -- Distribute target_secs across 1-4 modules per day
  user_day_module AS (
    SELECT
      a.user_id, a.company_id, a.day,
      m.module,
      -- Weighted slice: bigger weight modules get more seconds
      GREATEST(60, (a.target_secs * m.weight / 100.0 * (0.5 + random()))::int) AS module_secs
    FROM active_days a
    CROSS JOIN LATERAL (
      SELECT module, weight FROM modules
      ORDER BY -ln(random()) / weight  -- weighted sample
      LIMIT (1 + (random() * 3)::int)
    ) m
  )
  INSERT INTO user_activity_events (user_id, company_id, route, module, active_seconds, bucket_start, country_code)
  SELECT
    user_id,
    company_id,
    '__seed__/' || module AS route,
    module,
    LEAST(900, module_secs) AS active_seconds,
    day::timestamptz + ((8 + random() * 10) || ' hours')::interval + ((random() * 3600) || ' seconds')::interval AS bucket_start,
    'RO'
  FROM user_day_module;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  SELECT COUNT(*) INTO v_users FROM profiles p
  WHERE p.is_approved = true AND NOT has_role(p.user_id, 'admin'::app_role);

  RETURN jsonb_build_object('inserted', v_inserted, 'users', v_users, 'days', _days);
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_admin_test_activity()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_deleted int := 0;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins';
  END IF;
  DELETE FROM user_activity_events WHERE route LIKE '\_\_seed\_\_%' ESCAPE '\';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN jsonb_build_object('deleted', v_deleted);
END;
$$;