
-- Create admin access requests table
CREATE TABLE public.admin_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.admin_access_requests ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage access requests"
  ON public.admin_access_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Target users can view their own pending requests
CREATE POLICY "Users can view their access requests"
  ON public.admin_access_requests
  FOR SELECT
  USING (target_user_id = auth.uid());

-- Target users can update (accept/reject) their own requests
CREATE POLICY "Users can respond to access requests"
  ON public.admin_access_requests
  FOR UPDATE
  USING (target_user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_access_requests;
