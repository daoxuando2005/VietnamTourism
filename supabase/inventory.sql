-- Read-only inspection. Run against the authorized test project before migration.
SELECT current_database(), version();
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
SELECT table_name,column_name,data_type,is_nullable FROM information_schema.columns
 WHERE table_schema='public' ORDER BY table_name,ordinal_position;
SELECT * FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname;
SELECT grantee,table_name,privilege_type FROM information_schema.role_table_grants
 WHERE table_schema='public' ORDER BY table_name,grantee,privilege_type;
SELECT grantee,table_name,column_name,privilege_type FROM information_schema.column_privileges
 WHERE table_schema='public' AND grantee IN ('anon','authenticated','PUBLIC');
SELECT n.nspname,p.proname,p.prosecdef,p.proconfig,p.proacl,pg_get_functiondef(p.oid)
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('handle_new_user','handle_review_feed_activity','handle_favorite_feed_activity');
SELECT event_object_schema,event_object_table,trigger_name,action_statement FROM information_schema.triggers
 WHERE event_object_schema IN ('public','auth');
SELECT 'provinces' AS entity,count(*) AS rows FROM public.provinces
UNION ALL SELECT 'profiles',count(*) FROM public.profiles
UNION ALL SELECT 'destinations',count(*) FROM public.destinations
UNION ALL SELECT 'reviews',count(*) FROM public.reviews
UNION ALL SELECT 'favorites',count(*) FROM public.favorites
UNION ALL SELECT 'feed_activities',count(*) FROM public.feed_activities;
SELECT count(*) AS profiles_without_auth_subject FROM public.profiles p
 WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id=p.id);
