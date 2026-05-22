
-- Delete stages first then jobs for the 3 safe duplicates (newer fiche per order_id, no work started)
DELETE FROM public.production_stages
WHERE job_id IN (
  '78e42ef3-283d-4857-8600-957b01764c18',  -- P260512-000
  'ab5e25fe-3a6a-4393-9627-fa47ec5838b2',  -- P260415-000
  '8ffbb281-a411-4fae-853d-6d25dd8a602f'   -- P260219-000
);

DELETE FROM public.production_jobs
WHERE id IN (
  '78e42ef3-283d-4857-8600-957b01764c18',
  'ab5e25fe-3a6a-4393-9627-fa47ec5838b2',
  '8ffbb281-a411-4fae-853d-6d25dd8a602f'
);
