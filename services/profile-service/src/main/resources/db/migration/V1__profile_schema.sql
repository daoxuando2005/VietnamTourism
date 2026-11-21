REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO profile_runtime;

CREATE TABLE profile_public (
  id uuid PRIMARY KEY,
  username varchar(40) NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,40}$'),
  display_name varchar(100) NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 100),
  bio varchar(1000), avatar_url varchar(2048), cover_url varchar(2048),
  website varchar(2048), location varchar(200),
  account_status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE','BLOCKED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE profile_private (
  id uuid PRIMARY KEY REFERENCES profile_public(id) ON DELETE CASCADE,
  birth_date date, phone_number varchar(30),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE profile_access (
  id uuid PRIMARY KEY REFERENCES profile_public(id) ON DELETE CASCADE,
  app_role varchar(20) NOT NULL DEFAULT 'MEMBER' CHECK (app_role IN ('MEMBER','ADMIN'))
);

CREATE FUNCTION create_profile_access() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profile_access(id) VALUES (NEW.id);
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION create_profile_access() FROM PUBLIC, profile_runtime;
CREATE TRIGGER profile_access_created AFTER INSERT ON profile_public
FOR EACH ROW EXECUTE FUNCTION create_profile_access();

GRANT SELECT ON profile_public,profile_private,profile_access TO profile_runtime;
GRANT INSERT(id,username,display_name,bio,avatar_url,cover_url,website,location) ON profile_public TO profile_runtime;
GRANT UPDATE(username,display_name,bio,avatar_url,cover_url,website,location) ON profile_public TO profile_runtime;
GRANT INSERT(id,birth_date,phone_number,updated_at), UPDATE(birth_date,phone_number,updated_at) ON profile_private TO profile_runtime;
-- No runtime DDL, role/status write, migration-history access or cross-database grants.
