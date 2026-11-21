// Read-only requests using the project's PUBLIC anon key. No user records are downloaded.
import { loadEnv } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'
const env = loadEnv('development', process.cwd(), 'VITE_')
const base = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (!base || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(base)) {
  throw new Error('Configured hosted Supabase public URL/key required; no values printed')
}
const results = await Promise.all(['provinces','profiles','destinations','reviews','favorites','feed_activities'].map(async table => {
  try {
    const r = await fetch(`${base}/rest/v1/${table}?select=id`, { method: 'HEAD',
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' }, signal: AbortSignal.timeout(10000) })
    return { table, status: r.status, visibleCount: r.headers.get('content-range')?.split('/')[1] ?? null }
  } catch (error) { return { table, status: 'connection-failed', visibleCount: null, reason: error.cause?.code ?? error.name } }
}))
let signing = { status: 'connection-failed', algorithms: [] }
try {
  const r = await fetch(`${base}/auth/v1/.well-known/jwks.json`, { signal: AbortSignal.timeout(10000) })
  const body = r.ok ? await r.json() : null
  signing = { status: r.status, algorithms: [...new Set((body?.keys ?? []).map(k => k.alg))] }
} catch (error) { signing.reason = error.cause?.code ?? error.name }
const report = { date: '2026-11-21', mode: 'read-only public HEAD counts; no private records or DDL access', results, signing,
  limitation: 'Anon-visible counts are not owner inventory or proof of deployed RLS, trigger definitions, grants, backups or Auth E2E.' }
mkdirSync('docs/verification/evidence', { recursive: true })
writeFileSync('docs/verification/evidence/P0-02-public-probe.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
