
CREATE TABLE public.user_deactivated_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  material_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

ALTER TABLE public.user_deactivated_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_deactivated" ON public.user_deactivated_materials
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert_deactivated" ON public.user_deactivated_materials
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_delete_deactivated" ON public.user_deactivated_materials
  FOR DELETE USING (auth.uid() = user_id);
