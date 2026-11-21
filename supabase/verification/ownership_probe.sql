-- Owner-run permission probe. ALL fixture writes roll back inside a subtransaction.
-- This verifies database roles/RLS, not provider JWT issuance or email delivery.
DO $$
DECLARE a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid();
  prefix text:='__p0_'||replace(gen_random_uuid()::text,'-','');
  denied boolean; affected bigint;
BEGIN
  BEGIN
    INSERT INTO public.provinces(id,name,slug,region) VALUES(prefix,'P0 fixture',prefix,'north');
    INSERT INTO public.destinations(id,name,slug,province_id,description,image,category,latitude,longitude)
      VALUES(prefix,'P0 fixture',prefix,prefix,'Temporary access probe','fixture.png','test',0,0);
    INSERT INTO public.profiles(id,username,display_name) VALUES(a,'p0a_'||replace(a::text,'-',''),'A'),(b,'p0b_'||replace(b::text,'-',''),'B');
    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claim.sub',a::text,true);
    INSERT INTO public.favorites(id,user_id,destination_id) VALUES(prefix,a,prefix);
    INSERT INTO public.reviews(id,user_id,destination_id,rating,content) VALUES(prefix,a,prefix,5,'Access probe');
    INSERT INTO public.profiles_private(user_id,phone_number) VALUES(a,'fixture-private');
    IF (SELECT count(*) FROM public.favorites)<>1 OR (SELECT count(*) FROM public.profiles_private)<>1 THEN
      RAISE EXCEPTION 'Owner cannot read own data';
    END IF;
    PERFORM set_config('request.jwt.claim.sub',b::text,true);
    IF EXISTS(SELECT 1 FROM public.favorites WHERE user_id=a) OR EXISTS(SELECT 1 FROM public.profiles_private WHERE user_id=a) THEN
      RAISE EXCEPTION 'Cross-user private read allowed';
    END IF;
    UPDATE public.profiles SET display_name='forged' WHERE id=a;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected<>0 THEN RAISE EXCEPTION 'Cross-user profile update allowed'; END IF;
    DELETE FROM public.reviews WHERE id=prefix;
    GET DIAGNOSTICS affected=ROW_COUNT;
    IF affected<>0 THEN RAISE EXCEPTION 'Cross-user review deletion allowed'; END IF;
    denied:=false;
    BEGIN
      INSERT INTO public.favorites(id,user_id,destination_id) VALUES(prefix||'_forged',a,prefix);
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Forged owner insert allowed'; END IF;
    denied:=false;
    BEGIN
      PERFORM phone_number FROM public.profiles;
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Private legacy column readable'; END IF;
    SET LOCAL ROLE anon;
    denied:=false;
    BEGIN PERFORM id FROM public.favorites;
    EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
    IF NOT denied THEN RAISE EXCEPTION 'Guest favorite read allowed'; END IF;
    IF EXISTS(SELECT 1 FROM public.feed_activities WHERE type='favorite') THEN RAISE EXCEPTION 'Favorite published'; END IF;
    RESET ROLE;
    RAISE EXCEPTION USING ERRCODE='ZP002',MESSAGE='Probe passed; rollback fixtures';
  EXCEPTION WHEN SQLSTATE 'ZP002' THEN
    RESET ROLE;
    RAISE NOTICE 'PASS: owner access, cross-user denial, guest privacy, no favorite publishing; fixtures rolled back';
  END;
END $$;
