-- Profile-service is the only profile writer. Preserve compatibility identity rows
-- for legacy review/feed foreign keys; the trusted Auth trigger can still insert them.
-- No data is deleted or copied into the new service without a migration plan.
BEGIN;
SET LOCAL lock_timeout='5s';
REVOKE INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON public.profiles FROM PUBLIC,anon,authenticated;
REVOKE ALL ON public.profiles_private FROM PUBLIC,anon,authenticated;
DO $$ DECLARE c record; BEGIN
  FOR c IN SELECT table_name,column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name IN ('profiles','profiles_private') LOOP
    IF c.table_name='profiles' THEN
      EXECUTE format('REVOKE INSERT (%I), UPDATE (%I), REFERENCES (%I) ON public.profiles FROM PUBLIC,anon,authenticated',c.column_name,c.column_name,c.column_name);
    ELSE
      EXECUTE format('REVOKE ALL (%I) ON public.profiles_private FROM PUBLIC,anon,authenticated',c.column_name);
    END IF;
  END LOOP;
END $$;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS private_read_own ON public.profiles_private;
DROP POLICY IF EXISTS private_insert_own ON public.profiles_private;
DROP POLICY IF EXISTS private_update_own ON public.profiles_private;
COMMIT;
