\set ON_ERROR_STOP on
CREATE SCHEMA test_support;
GRANT USAGE ON SCHEMA test_support TO anon, authenticated;
CREATE FUNCTION test_support.assert(ok boolean, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %',label; END IF; RAISE NOTICE 'PASS: %',label; END $$;
CREATE FUNCTION test_support.denied(statement text, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN EXECUTE statement;
  EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'PASS: %',label; RETURN;
  END;
  RAISE EXCEPTION 'FAIL: expected permission denial: %',label;
END $$;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test_support TO anon, authenticated;

INSERT INTO public.provinces(id,name,slug,region) VALUES ('test','Test','test','north');
INSERT INTO public.destinations(id,name,slug,province_id,description,image,category,latitude,longitude)
 VALUES ('test','Test','test','test','Fixture','fixture.png','nature',0,0);
INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES
 ('00000000-0000-4000-8000-000000000001','a@example.test','{"username":"traveler","role":"admin"}'),
 ('00000000-0000-4000-8000-000000000002','b@example.test','{"username":"traveler"}');
SELECT test_support.assert((SELECT count(DISTINCT username)=2 FROM public.profiles), 'duplicate signup username has safe fallback');
UPDATE public.profiles SET birth_date='1990-01-01',phone_number='test-private' WHERE id='00000000-0000-4000-8000-000000000002';
-- Reapply migration separately to test copying pre-existing private data.

SET ROLE anon;
SELECT test_support.assert((SELECT count(*)=2 FROM public.profiles), 'guest reads public profile rows');
SELECT test_support.denied('SELECT phone_number FROM public.profiles','guest cannot read private legacy column');
SELECT test_support.denied('SELECT * FROM public.profiles','wildcard private profile projection denied');
SELECT test_support.denied('SELECT * FROM public.profiles_private','guest cannot read private table');
SELECT test_support.denied('SELECT * FROM public.favorites','guest cannot read favorites');
SELECT test_support.denied($q$INSERT INTO public.reviews(id,user_id,destination_id,rating,content) VALUES ('guest','00000000-0000-4000-8000-000000000001','test',4,'x')$q$, 'guest write denied');
RESET ROLE;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
INSERT INTO public.reviews(id,user_id,destination_id,rating,content) VALUES ('review-a','00000000-0000-4000-8000-000000000001','test',4,'a');
INSERT INTO public.favorites(id,user_id,destination_id) VALUES ('favorite-a','00000000-0000-4000-8000-000000000001','test');
UPDATE public.profiles SET display_name='A updated' WHERE id='00000000-0000-4000-8000-000000000001';
INSERT INTO public.profiles_private(user_id,phone_number) VALUES ('00000000-0000-4000-8000-000000000001','a-private');
UPDATE public.profiles_private SET birth_date='2000-01-01' WHERE user_id='00000000-0000-4000-8000-000000000001';
SELECT test_support.assert((SELECT count(*)=1 FROM public.profiles_private),'A reads only own private profile');
SELECT test_support.denied($q$INSERT INTO public.favorites(id,user_id,destination_id) VALUES ('forged','00000000-0000-4000-8000-000000000002','test')$q$, 'A cannot forge favorite owner');
SELECT test_support.denied($q$INSERT INTO public.reviews(id,user_id,destination_id,rating,content) VALUES ('forged','00000000-0000-4000-8000-000000000002','test',4,'x')$q$, 'A cannot forge review owner');
SELECT test_support.denied($q$INSERT INTO public.profiles_private(user_id,phone_number) VALUES ('00000000-0000-4000-8000-000000000002','stolen')$q$, 'A cannot write B private profile');
SELECT test_support.denied($q$UPDATE public.profiles SET follower_count=999$q$, 'client cannot spoof authoritative counters');
SELECT test_support.denied($q$UPDATE public.reviews SET user_id='00000000-0000-4000-8000-000000000002' WHERE id='review-a'$q$, 'cannot transfer review ownership');
SELECT test_support.denied('SELECT phone_number FROM public.profiles','authenticated cannot read legacy private column');
SELECT test_support.denied($q$INSERT INTO public.destinations(id) VALUES ('forged')$q$, 'metadata role admin does not grant content write');
SELECT test_support.denied($q$INSERT INTO public.feed_activities(id) VALUES ('forged')$q$, 'cannot directly forge feed');
SELECT test_support.denied('SELECT public.handle_new_user()','trigger function has no API EXECUTE grant');
SELECT test_support.assert((SELECT count(*)=1 FROM public.feed_activities),'review trigger works and favorite never publishes');
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false);
SELECT test_support.assert((SELECT count(*)=0 FROM public.favorites),'B cannot read A favorites');
WITH changed AS (UPDATE public.reviews SET content='hacked' WHERE id='review-a' RETURNING id)
 SELECT test_support.assert((SELECT count(*)=0 FROM changed),'B cannot update A review');
WITH changed AS (DELETE FROM public.reviews WHERE id='review-a' RETURNING id)
 SELECT test_support.assert((SELECT count(*)=0 FROM changed),'B cannot delete A review');
WITH changed AS (DELETE FROM public.favorites WHERE id='favorite-a' RETURNING id)
 SELECT test_support.assert((SELECT count(*)=0 FROM changed),'B cannot delete A favorite');
WITH changed AS (UPDATE public.profiles SET display_name='hacked' WHERE id='00000000-0000-4000-8000-000000000001' RETURNING id)
 SELECT test_support.assert((SELECT count(*)=0 FROM changed),'B cannot edit A public profile');
WITH changed AS (UPDATE public.profiles_private SET phone_number='hacked' WHERE user_id='00000000-0000-4000-8000-000000000001' RETURNING user_id)
 SELECT test_support.assert((SELECT count(*)=0 FROM changed),'B cannot edit A private profile');
SELECT set_config('request.jwt.claim.sub','',false);
SELECT test_support.assert((SELECT count(*)=0 FROM public.profiles_private),'missing subject fails closed');
SELECT test_support.assert((SELECT count(*)=0 FROM public.favorites),'missing subject cannot read favorites');
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
UPDATE public.reviews SET content='updated',rating=5 WHERE id='review-a';
SELECT test_support.assert((SELECT review_content='updated' AND rating=5 FROM public.feed_activities WHERE source_id='review-a'), 'owner update synchronizes review feed');
DELETE FROM public.reviews WHERE id='review-a';
SELECT test_support.assert((SELECT count(*)=0 FROM public.feed_activities),'owner deletion removes review activity');
DELETE FROM public.favorites WHERE id='favorite-a';
SELECT test_support.assert((SELECT count(*)=0 FROM public.favorites),'owner can remove favorite');
RESET ROLE;
INSERT INTO public.feed_activities(id,type,user_id,destination_id,source_id) VALUES ('old-private-save','favorite','00000000-0000-4000-8000-000000000001','test','legacy');
SET ROLE anon;
SELECT test_support.assert((SELECT count(*)=0 FROM public.feed_activities),'existing favorite activities remain private');
RESET ROLE;
