DO $$
DECLARE
  r RECORD;
  new_qual TEXT;
  new_check TEXT;
  sql TEXT;
  updated_count INT := 0;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid())%')
        OR
        (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(SELECT auth.uid())%')
      )
  LOOP
    new_qual := REPLACE(COALESCE(r.qual, ''), 'auth.uid()', '(SELECT auth.uid())');
    new_check := REPLACE(COALESCE(r.with_check, ''), 'auth.uid()', '(SELECT auth.uid())');

    sql := format('ALTER POLICY %I ON %I.%I',
                  r.policyname, r.schemaname, r.tablename);

    IF r.qual IS NOT NULL THEN
      sql := sql || format(' USING (%s)', new_qual);
    END IF;

    IF r.with_check IS NOT NULL THEN
      sql := sql || format(' WITH CHECK (%s)', new_check);
    END IF;

    BEGIN
      EXECUTE sql;
      updated_count := updated_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped policy % on %.%: %', r.policyname, r.schemaname, r.tablename, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Optimized % RLS policies', updated_count;
END$$;