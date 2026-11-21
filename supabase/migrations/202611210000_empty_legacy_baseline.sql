-- Baseline ONLY for an inventory-confirmed empty Supabase public schema.
-- Existing legacy installations apply 202611210001 directly after backup.
-- No demo seed, reset, table deletion or permissive policies.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public') THEN
    RAISE EXCEPTION 'Existing public schema: inspect drift and apply the hardening migration directly';
  END IF;
END $$;
CREATE TABLE public.provinces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  description TEXT,
  map_x INTEGER,
  map_y INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- 2. Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- References auth.users(id) in live db
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  birth_date TEXT,
  phone_number TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create destinations table
CREATE TABLE public.destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  province_id TEXT REFERENCES public.provinces(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  rating DOUBLE PRECISION DEFAULT 0.0,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- 4. Create reviews table
CREATE TABLE public.reviews (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Create favorites table
CREATE TABLE public.favorites (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, destination_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 6. Create feed_activities table
CREATE TABLE public.feed_activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('review', 'favorite')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  source_id TEXT NOT NULL,
  rating INTEGER,
  review_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feed_activities ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- Triggers configuration
-- ==========================================

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

CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE OR REPLACE TRIGGER on_review_changed AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_review_feed_activity();
CREATE OR REPLACE TRIGGER on_favorite_changed AFTER INSERT OR DELETE ON public.favorites
FOR EACH ROW EXECUTE FUNCTION public.handle_favorite_feed_activity();
