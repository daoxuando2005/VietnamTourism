import { spawnSync } from 'node:child_process'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const name = `vt-p0-legacy-${process.pid}`
const image = 'postgres:17.12-alpine'
const transcript = []
function docker(args, input) {
  const r = spawnSync('docker', args, { input, encoding: 'utf8', cwd: root, timeout: 120000, maxBuffer: 8 * 1024 * 1024 })
  transcript.push(`$ docker ${args.join(' ')}\n${r.stdout ?? ''}${r.stderr ?? ''}`)
  if (r.error || r.status !== 0) throw new Error(r.error?.message ?? r.stderr ?? 'Docker failed')
  return r.stdout
}
function sql(source, db = 'postgres') { return docker(['exec', '-i', name, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db], source) }
let created = false
try {
  docker(['run', '-d', '--rm', '--name', name, '--tmpfs', '/var/lib/postgresql/data', '-e', 'POSTGRES_PASSWORD=local-test-only', image])
  created = true
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    const r = spawnSync('docker', ['exec', name, 'pg_isready', '-U', 'postgres'], { encoding: 'utf8' })
    if (r.status === 0) { ready = true; break }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('PostgreSQL readiness timed out')
  const legacy = readFileSync(path.join(root, 'supabase/archive/legacy-demo.sql.txt'), 'utf8')
  // Extract definitions only. Never execute the archived reset script or demo seed.
  const definitions = legacy.slice(legacy.indexOf('CREATE TABLE public.provinces'), legacy.indexOf('-- Trigger to automatically create'))
  const triggers = legacy.slice(legacy.indexOf('CREATE OR REPLACE FUNCTION public.handle_new_user'), legacy.indexOf('INSERT INTO public.provinces'))
  if (/\bDROP\s+(TABLE|TRIGGER)\b/i.test(definitions + triggers)) throw new Error('Destructive fixture extraction rejected')
  sql(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE SCHEMA auth;
    GRANT USAGE ON SCHEMA auth TO anon,authenticated;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    ${definitions}\n${triggers}
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,authenticated;
    GRANT SELECT(phone_number) ON public.profiles TO anon;`)
  const migration = readFileSync(path.join(root, 'supabase/migrations/202611210001_legacy_access_hardening.sql'), 'utf8')
  sql(migration)
  sql(readFileSync(path.join(root, 'tests/legacy-db/access.test.sql'), 'utf8'))
  sql(migration)
  sql(`SELECT test_support.assert((SELECT phone_number='test-private' FROM public.profiles_private WHERE user_id='00000000-0000-4000-8000-000000000002'),'legacy contact values preserved');
    SELECT test_support.assert((SELECT count(*)=1 FROM public.feed_activities),'migration preserves existing private feed rows');`)
  docker(['exec', name, 'pg_dump', '-U', 'postgres', '-Fc', '-f', '/tmp/legacy.dump', 'postgres'])
  docker(['exec', name, 'createdb', '-U', 'postgres', 'restored'])
  docker(['exec', name, 'pg_restore', '-U', 'postgres', '-d', 'restored', '--exit-on-error', '/tmp/legacy.dump'])
  sql(`SELECT test_support.assert((SELECT count(*)=2 FROM public.profiles),'restore profile row counts');
    SELECT test_support.assert((SELECT count(*)=2 FROM public.profiles_private),'restore private data row counts');
    SET ROLE anon;
    SELECT test_support.denied('SELECT phone_number FROM public.profiles','restored column protection');
    SELECT test_support.assert((SELECT count(*)=0 FROM public.feed_activities),'restored privacy policies');
    RESET ROLE;`, 'restored')
  console.log('PASS: legacy migration, ownership/privacy matrix, idempotency, backup/restore')
} finally {
  if (created) {
    const r = spawnSync('docker', ['rm', '-f', name], { encoding: 'utf8' })
    transcript.push(`Cleanup test container: ${r.status === 0 ? 'OK' : r.stderr}`)
  }
  mkdirSync(path.join(root, 'docs/verification/evidence'), { recursive: true })
  writeFileSync(path.join(root, 'docs/verification/evidence/P0-02-legacy-db.txt'), transcript.join('\n'))
}
