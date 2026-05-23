-- Grant execute permissions on all public functions to authenticated and anon roles
-- Fixes "permission denied for function has_role" error on production_jobs queries
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
