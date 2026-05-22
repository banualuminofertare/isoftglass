
-- Categoria 1: Trigger-only / interne — REVOKE de la toți
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_invoice_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_churn_risk_for_service() FROM PUBLIC, anon, authenticated;

-- Categoria 2: Helper-uri RLS — REVOKE de la PUBLIC + anon, păstrăm authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_approved_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_company_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_same_company(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_belongs_to_company(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_company_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_accepted_access_to_company(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_actively_impersonating(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_auth_email() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_ticket_number() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_job_number() FROM PUBLIC, anon;

-- Categoria 3: RPC-uri client — REVOKE de la PUBLIC + anon
REVOKE EXECUTE ON FUNCTION public.get_admin_analytics(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_analytics(uuid, timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_drilldown(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_drilldown(uuid, timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_activity_trend(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_activity_heatmap(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_cohort_retention(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_feature_funnel(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_top_modules(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_power_users(timestamptz, timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_churn_risk() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_churn_alert_targets(integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_all_subscribers() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_live_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_impersonation_target(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.clear_impersonation_target() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_client_everywhere(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.issue_invoice(uuid) FROM PUBLIC, anon;
