import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = fileURLToPath(new URL('../', import.meta.url))
const prefix = ['compose','-f','infra/gateway/compose.smoke.yaml','-p','vt-p0-04-smoke']
const transcript = []
function docker(args) {
  const r = spawnSync('docker', args, { encoding:'utf8', cwd:root, timeout:120000, maxBuffer:8*1024*1024 })
  transcript.push(`$ docker ${args.join(' ')}\n${r.stdout ?? ''}${r.stderr ?? ''}`)
  if (r.error || r.status !== 0) throw new Error(r.error?.message ?? r.stderr ?? 'Docker failed')
  return r.stdout
}
function compose(args) { return docker([...prefix,...args]) }
async function request(route, options) {
  return fetch(`http://127.0.0.1:${process.env.SMOKE_PORT||8080}${route}`, { ...options, signal:AbortSignal.timeout(8000) })
}
async function connected() {
  for (let i=0; i<60; i++) {
    try { if ((await request('/api/v1/profiles/ab')).status === 400) return } catch { /* still starting */ }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error('Gateway/profile startup timed out')
}
async function check(route, status, code, options) {
  const r = await request(route, options)
  assert.equal(r.status,status,route)
  const body = await r.json()
  if (code) {
    assert.equal(body.code,code)
    assert.equal(body.requestId,r.headers.get('x-request-id'))
    assert.match(body.requestId,/^[a-f0-9]{32}$/)
    assert.ok(Array.isArray(body.errors))
  }
  transcript.push(`PASS: ${route} -> ${status} ${code ?? ''}`)
  return { response:r, body }
}
let started = false
try {
  compose(['config','--quiet'])
  started = true
  compose(['up','-d','--no-build'])
  await connected()
  await check('/health/live',200)
  const readiness = await check('/health/ready',503)
  assert.equal(readiness.body.status,'DOWN')
  const missing = await check('/api/v1/profiles/traveler',503,'DEPENDENCY_UNAVAILABLE', {
    headers:{ 'X-Request-ID':'forged-edge-id', Authorization:'Bearer synthetic-secret-do-not-log', 'X-User-ID':'forged-user' }
  })
  assert.notEqual(missing.body.requestId,'forged-edge-id')
  await check('/api/v1/profiles/ab',400,'INVALID_ARGUMENT')
  await check('/api/v1/me/profile',401,'UNAUTHENTICATED')
  await check('/api/v1/unknown',404,'NOT_FOUND')
  await check('/api/v1/profiles/traveler',413,'PAYLOAD_TOO_LARGE', { method:'POST', body:'x'.repeat(1024*1024+1) })
  assert.equal(compose(['exec','-T','profile-service','id','-u']).trim(),'10001')
  assert.equal(compose(['exec','-T','gateway','id','-u']).trim(),'101')
  assert.equal(compose(['exec','-T','profile-service','sh','-c','command -v javac || true']).trim(),'')
  assert.equal(compose(['exec','-T','profile-service','find','/app','-name','.env*']).trim(),'')
  const runtime = compose(['exec','-T','profile-service','wget','-qO-','http://127.0.0.1:8081/q/openapi?format=JSON'])
  const runtimePath = path.join(root,'.tools/P0-04-runtime-openapi.json')
  mkdirSync(path.dirname(runtimePath),{recursive:true})
  writeFileSync(runtimePath,runtime)
  const contract = spawnSync(process.execPath,['scripts/check-contract.mjs'], {
    cwd:root,encoding:'utf8',env:{...process.env,PROFILE_OPENAPI_FILE:runtimePath}
  })
  transcript.push(contract.stdout + contract.stderr)
  assert.equal(contract.status,0,'runtime contract comparison')
  compose(['stop','profile-service'])
  await check('/api/v1/profiles/traveler',503,'DEPENDENCY_UNAVAILABLE')
  compose(['start','profile-service'])
  await connected()
  transcript.push('PASS: upstream stop/start recovers without restarting gateway')
  const logs = compose(['logs','--no-color'])
  assert.ok(logs.includes(missing.body.requestId),'request ID appears in gateway/service logs')
  assert.ok(!logs.includes('synthetic-secret-do-not-log'),'Authorization not logged')
  assert.ok(!logs.includes('forged-user'),'identity headers not logged')
  transcript.push('PASS: users non-root; no runtime compiler/env; request IDs correlate; no Authorization/identity values in logs')
  console.log('PASS: gateway routing/errors, readiness, request IDs, non-root images, runtime OpenAPI, dependency stop/recovery')
} finally {
  if (started) {
    const r=spawnSync('docker',[...prefix,'down'],{encoding:'utf8',cwd:root,timeout:120000})
    transcript.push(`Cleanup smoke stack: ${r.status === 0 ? 'OK' : r.stderr}`)
  }
  mkdirSync(path.join(root,'docs/verification/evidence'),{recursive:true})
  writeFileSync(path.join(root,'docs/verification/evidence/P0-04-gateway.txt'),transcript.join('\n'))
}
