-- Transitional Supabase Data API permissions. Run by the database owner, after backup.
-- No table/row deletion. Any incompatible schema aborts this entire transaction.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

CREATE TABLE IF NOT EXISTS public.profiles_private (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  birth_date text,
  phone_number text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.profiles_private(user_id, birth_date, phone_number)
SELECT id, birth_date, phone_number FROM public.profiles
WHERE birth_date IS NOT NULL OR phone_number IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;
-- Original private columns are retained for recovery, but no API role can access them.

DO $$
DECLARE p record; t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['provinces','profiles','profiles_private','destinations','reviews','favorites','feed_activities'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', t);
  END LOOP;
END $$;

-- REVOKE table grants does not remove existing column grants. Remove those too.
DO $$
DECLARE c record;
BEGIN
  FOR c IN SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' LOOP
    EXECUTE format('REVOKE ALL (%I) ON public.profiles FROM PUBLIC, anon, authenticated', c.column_name);
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.provinces, public.destinations, public.reviews, public.feed_activities TO anon, authenticated;
GRANT SELECT ON public.favorites, public.profiles_private TO authenticated;
GRANT SELECT (id,username,display_name,avatar_url,cover_url,bio,website,location,follower_count,following_count,created_at,updated_at)
  ON public.profiles TO anon, authenticated;
GRANT INSERT (id,username,display_name,avatar_url,cover_url,bio,website,location)
  ON public.profiles TO authenticated;
GRANT UPDATE (username,display_name,avatar_url,cover_url,bio,website,location,updated_at)
  ON public.profiles TO authenticated;
GRANT INSERT, DELETE ON public.reviews TO authenticated;
GRANT UPDATE (rating,title,content,updated_at) ON public.reviews TO authenticated;
GRANT INSERT, DELETE ON public.favorites TO authenticated;
GRANT INSERT (user_id,birth_date,phone_number,updated_at), UPDATE (birth_date,phone_number,updated_at)
  ON public.profiles_private TO authenticated;

CREATE POLICY provinces_read ON public.provinces FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY destinations_read ON public.destinations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY private_read_own ON public.profiles_private FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY private_insert_own ON public.profiles_private FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY private_update_own ON public.profiles_private FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY reviews_read ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY reviews_insert_own ON public.reviews FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY reviews_update_own ON public.reviews FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY reviews_delete_own ON public.reviews FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY favorites_read_own ON public.favorites FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY favorites_insert_own ON public.favorites FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY favorites_delete_own ON public.favorites FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY feed_reviews_only ON public.feed_activities FOR SELECT TO anon, authenticated USING (type = 'review');

-- Never publish saves. Keep old rows for recovery but hide them with RLS.
CREATE OR REPLACE FUNCTION public.handle_favorite_feed_activity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN RETURN NULL; END $$;

CREATE OR REPLACE FUNCTION public.handle_review_feed_activity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.feed_activities(id,type,user_id,destination_id,source_id,rating,review_content,created_at)
    VALUES ('act-rev-'||NEW.id,'review',NEW.user_id,NEW.destination_id,NEW.id,NEW.rating,NEW.content,NEW.created_at);
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.feed_activities SET rating=NEW.rating,review_content=NEW.content
      WHERE type='review' AND source_id=OLD.id;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.feed_activities WHERE type='review' AND source_id=OLD.id;
  END IF;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE candidate text;
BEGIN
  candidate := left(regexp_replace(lower(coalesce(NEW.raw_user_meta_data->>'username','')), '[^a-z0-9_]', '', 'g'),32);
  IF candidate = '' THEN candidate := 'user_' || replace(NEW.id::text,'-',''); END IF;
  BEGIN
    INSERT INTO public.profiles(id,username,display_name)
    VALUES (NEW.id,candidate,left(coalesce(NEW.raw_user_meta_data->>'displayName',candidate),100))
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.profiles(id,username,display_name)
    VALUES (NEW.id,'user_'||replace(NEW.id::text,'-',''),left(coalesce(NEW.raw_user_meta_data->>'displayName','Traveler'),100))
    ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.handle_new_user(), public.handle_review_feed_activity(), public.handle_favorite_feed_activity()
  FROM PUBLIC, anon, authenticated;
COMMIT;
