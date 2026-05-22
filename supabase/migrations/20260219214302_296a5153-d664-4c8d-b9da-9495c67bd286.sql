
-- Add client_name to production_jobs for denormalized access
ALTER TABLE production_jobs ADD COLUMN client_name text;
