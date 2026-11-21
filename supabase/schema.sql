-- Historical schema/seed is archived as plain text in archive/legacy-demo.sql.txt.
-- Never reset a database to initialize this project. Follow ../migration_guide.md.
-- This entry point intentionally contains NO DROP/CREATE TABLE/seed operations,
-- including when a SQL client continues after an error.
DO $$ BEGIN
  RAISE EXCEPTION 'Archived reset script disabled. Use versioned migrations and migration_guide.md';
END $$;
