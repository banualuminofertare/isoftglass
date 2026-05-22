-- 1) Activity trend: DAU, WAU (rolling 7d), MAU (rolling 30d), hours per day
CREATE OR REPLACE FUNCTION public.get_admin_activity_trend(_from timestamptz, _to timestamptz)
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

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.day ASC) INTO v_result FROM (
    WITH days AS (
      SELECT generate_series(date_trunc('day', _from), date_trunc('day', _to), interval '1 day')::date AS day
    ),
    daily AS (
      SELECT date_trunc('day', bucket_start)::date AS day,
             user_id,
             SUM(active_seconds) AS secs
      FROM user_activity_events
      WHERE bucket_start >= _from - interval '30 days' AND bucket_start < _to
        AND NOT has_role(user_id, 'admin'::app_role)
      GROUP BY 1, 2
    )
    SELECT
      d.day::text AS day,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM daily WHERE daily.day = d.day), 0)::int AS dau,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM daily WHERE daily.day > d.day - 7 AND daily.day <= d.day), 0)::int AS wau,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM daily WHERE daily.day > d.day - 30 AND daily.day <= d.day), 0)::int AS mau,
      COALESCE((SELECT ROUND((SUM(secs)::numeric / 3600), 2) FROM daily WHERE daily.day = d.day), 0) AS hours
    FROM days d
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 2) Churn risk score: 4 factors (each 0-25), total 0-100
CREATE OR REPLACE FUNCTION public.get_admin_churn_risk()
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

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.score DESC) INTO v_result FROM (
    WITH subs AS (
      SELECT p.user_id, p.full_name, p.company_name, p.approved_at, c.name AS company_real,
             (SELECT MAX(bucket_start) FROM user_activity_events e WHERE e.user_id = p.user_id) AS last_active,
             COALESCE((SELECT SUM(active_seconds) FROM user_activity_events e
                       WHERE e.user_id = p.user_id AND bucket_start >= now() - interval '14 days'), 0) AS secs_recent,
             COALESCE((SELECT SUM(active_seconds) FROM user_activity_events e
                       WHERE e.user_id = p.user_id AND bucket_start >= now() - interval '28 days'
                         AND bucket_start < now() - interval '14 days'), 0) AS secs_prev,
             COALESCE((SELECT COUNT(DISTINCT module) FROM user_activity_events e
                       WHERE e.user_id = p.user_id AND bucket_start >= now() - interval '14 days'), 0) AS mods_recent,
             COALESCE((SELECT COUNT(DISTINCT module) FROM user_activity_events e
                       WHERE e.user_id = p.user_id AND bucket_start >= now() - interval '28 days'
                         AND bucket_start < now() - interval '14 days'), 0) AS mods_prev
      FROM profiles p
      LEFT JOIN companies c ON c.id = p.company_id
      WHERE p.is_approved = true
        AND NOT has_role(p.user_id, 'admin'::app_role)
    ),
    scored AS (
      SELECT s.*,
        -- Inactivity 0-25
        LEAST(25, CASE
          WHEN last_active IS NULL THEN 25
          ELSE ROUND(LEAST(25, EXTRACT(EPOCH FROM (now() - last_active)) / 86400 * 25.0 / 14.0))
        END)::int AS inactivity_pts,
        -- Trend 0-25 (decline of recent vs previous)
        CASE
          WHEN secs_prev = 0 AND secs_recent = 0 THEN 12
          WHEN secs_prev = 0 THEN 0
          WHEN secs_recent >= secs_prev THEN 0
          ELSE LEAST(25, ROUND(((secs_prev - secs_recent)::numeric / secs_prev) * 25))::int
        END AS trend_pts,
        -- Modules decline 0-25
        CASE
          WHEN mods_prev = 0 AND mods_recent = 0 THEN 10
          WHEN mods_prev = 0 THEN 0
          WHEN mods_recent >= mods_prev THEN 0
          ELSE LEAST(25, ROUND(((mods_prev - mods_recent)::numeric / mods_prev) * 25))::int
        END AS modules_pts,
        -- Onboarding penalty 0-25 (new subscriber <30d with no activity)
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
      inactivity_pts, trend_pts, modules_pts, onboarding_pts,
      (inactivity_pts + trend_pts + modules_pts + onboarding_pts)::int AS score,
      CASE
        WHEN onboarding_pts >= 15 THEN 'Onboarding incomplet'
        WHEN inactivity_pts >= 20 THEN 'Inactivitate prelungită'
        WHEN trend_pts >= 15 THEN 'Scădere accentuată a activității'
        WHEN modules_pts >= 15 THEN 'Folosește mai puține module'
        WHEN inactivity_pts >= 10 THEN 'Inactivitate moderată'
        ELSE 'Activitate redusă'
      END AS top_reason
    FROM scored
    WHERE (inactivity_pts + trend_pts + modules_pts + onboarding_pts) >= 30
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 3) Cohort retention by month
CREATE OR REPLACE FUNCTION public.get_admin_cohort_retention(_months int DEFAULT 6)
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

  SELECT jsonb_agg(row_to_json(t) ORDER BY t.cohort_month DESC) INTO v_result FROM (
    WITH cohorts AS (
      SELECT user_id, date_trunc('month', approved_at)::date AS cohort_month
      FROM profiles
      WHERE is_approved = true
        AND approved_at IS NOT NULL
        AND approved_at >= date_trunc('month', now()) - (_months || ' months')::interval
        AND NOT has_role(user_id, 'admin'::app_role)
    ),
    sized AS (
      SELECT cohort_month, COUNT(*)::int AS cohort_size, array_agg(user_id) AS user_ids
      FROM cohorts
      GROUP BY cohort_month
    ),
    activity AS (
      SELECT c.cohort_month, c.cohort_size,
             EXTRACT(YEAR FROM age(date_trunc('month', e.bucket_start), c.cohort_month))::int * 12
             + EXTRACT(MONTH FROM age(date_trunc('month', e.bucket_start), c.cohort_month))::int AS m_offset,
             e.user_id
      FROM sized c
      LEFT JOIN user_activity_events e ON e.user_id = ANY(c.user_ids)
        AND date_trunc('month', e.bucket_start) >= c.cohort_month
    )
    SELECT
      to_char(s.cohort_month, 'YYYY-MM') AS cohort_month,
      s.cohort_size,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.m_offset = 0 THEN a.user_id END) / NULLIF(s.cohort_size, 0))::int AS m0,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.m_offset = 1 THEN a.user_id END) / NULLIF(s.cohort_size, 0))::int AS m1,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.m_offset = 2 THEN a.user_id END) / NULLIF(s.cohort_size, 0))::int AS m2,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.m_offset = 3 THEN a.user_id END) / NULLIF(s.cohort_size, 0))::int AS m3,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.m_offset = 4 THEN a.user_id END) / NULLIF(s.cohort_size, 0))::int AS m4,
      ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.m_offset = 5 THEN a.user_id END) / NULLIF(s.cohort_size, 0))::int AS m5
    FROM sized s
    LEFT JOIN activity a ON a.cohort_month = s.cohort_month
    GROUP BY s.cohort_month, s.cohort_size
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 4) Top modules
CREATE OR REPLACE FUNCTION public.get_admin_top_modules(_from timestamptz, _to timestamptz)
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

  SELECT jsonb_agg(row_to_json(t)) INTO v_result FROM (
    SELECT module,
           ROUND((SUM(active_seconds)::numeric / 3600), 2) AS total_hours,
           COUNT(DISTINCT user_id)::int AS unique_users
    FROM user_activity_events
    WHERE bucket_start >= _from AND bucket_start < _to
      AND NOT has_role(user_id, 'admin'::app_role)
    GROUP BY module
    ORDER BY total_hours DESC
    LIMIT 15
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Helpful composite index (idempotent)
CREATE INDEX IF NOT EXISTS idx_user_activity_events_user_bucket
  ON public.user_activity_events (user_id, bucket_start DESC);