
-- Drop the global unique constraint on material_code_prefix
ALTER TABLE public.processing_templates DROP CONSTRAINT processing_templates_material_code_prefix_key;

-- Add a composite unique constraint per company (NULL company_id = global templates)
CREATE UNIQUE INDEX processing_templates_prefix_company_unique 
ON public.processing_templates (material_code_prefix, company_id) 
WHERE company_id IS NOT NULL;

-- Global templates (company_id IS NULL) should still be unique per prefix
CREATE UNIQUE INDEX processing_templates_prefix_global_unique 
ON public.processing_templates (material_code_prefix) 
WHERE company_id IS NULL;
