-- Owner-run, all fixtures rolled back; this probes DB permissions, not JWT issuance.
DO $$
DECLARE a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid();
  prefix text:='__cutover_'||replace(gen_random_uuid()::text,'-','');
  denied boolean; changed bigint;
BEGIN
  BEGIN
    INSERT INTO public.provinces(id,name,slug,region) VALUES(prefix,'Test only',prefix,'north');
    INSERT INTO public.destinations(id,name,slug,province_id,description,image,category,latitude,longitude)
      VALUES(prefix,'Test only',prefix,prefix,'Temporary probe','fixture.png','test',0,0);
    INSERT INTO public.profiles(id,username,display_name) VALUES(a,prefix||'a','A'),(b,prefix||'b','B');
    INSERT INTO public.profiles_private(user_id,phone_number) VALUES(a,'TEST-PRIVATE');
    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claim.sub',a::text,true);
    IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=a) THEN RAISE EXCEPTION 'Compatibility public read broken'; END IF;
    denied:=false;
    BEGIN UPDATE public.profiles SET display_name='forged' WHERE id=a;
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Owner legacy profile write remains open'; END IF;
    denied:=false;
    BEGIN INSERT INTO public.profiles(id,username) VALUES(gen_random_uuid(),prefix||'forged');
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Legacy profile insert remains open'; END IF;
    denied:=false;
    BEGIN PERFORM phone_number FROM public.profiles_private;
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Legacy private read remains open'; END IF;
    denied:=false;
    BEGIN PERFORM phone_number FROM public.profiles;
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Legacy contact column readable'; END IF;
    INSERT INTO public.favorites(id,user_id,destination_id) VALUES(prefix,a,prefix);
    INSERT INTO public.reviews(id,user_id,destination_id,rating,content) VALUES(prefix,a,prefix,5,'Test only');
    PERFORM set_config('request.jwt.claim.sub',b::text,true);
    IF EXISTS(SELECT 1 FROM public.favorites WHERE user_id=a) THEN RAISE EXCEPTION 'Cross-user save readable'; END IF;
    DELETE FROM public.reviews WHERE id=prefix;
    GET DIAGNOSTICS changed=ROW_COUNT;
    IF changed<>0 THEN RAISE EXCEPTION 'Cross-user review delete allowed'; END IF;
    denied:=false;
    BEGIN INSERT INTO public.favorites(id,user_id,destination_id) VALUES(prefix||'b',a,prefix);
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Forged save owner allowed'; END IF;
    SET LOCAL ROLE anon;
    IF EXISTS(SELECT 1 FROM public.feed_activities WHERE type='favorite') THEN RAISE EXCEPTION 'Save published'; END IF;
    denied:=false;
    BEGIN PERFORM id FROM public.favorites;
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Guest save read allowed'; END IF;
    RESET ROLE;
    RAISE EXCEPTION USING ERRCODE='ZP010',MESSAGE='Pass and roll back';
  EXCEPTION WHEN SQLSTATE 'ZP010' THEN
    RESET ROLE;
    RAISE NOTICE 'PASS: profile bypass closed; public joins and legacy review/save ownership retained; fixtures rolled back';
  END;
END $$;
