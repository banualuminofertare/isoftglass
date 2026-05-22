
CREATE TABLE public.client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  error_message text NOT NULL,
  error_stack text NULL,
  component_stack text NULL,
  url text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  metadata jsonb NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert errors
CREATE POLICY "Authenticated users can insert error logs"
ON public.client_error_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only admins can view error logs
CREATE POLICY "Admins can view error logs"
ON public.client_error_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete error logs
CREATE POLICY "Admins can delete error logs"
ON public.client_error_logs
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
