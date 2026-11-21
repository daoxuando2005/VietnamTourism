import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { compose, sql } from '../tests/stack/helpers.mjs'
mkdirSync('.tools',{recursive:true})
const project=`vt-p0-test-${randomBytes(6).toString('hex')}`
const envFile=`.tools/${project}.env`
writeFileSync(envFile,`POSTGRES_PASSWORD=${randomBytes(24).toString('hex')}\nPROFILE_DB_PASSWORD=${randomBytes(24).toString('hex')}\nPROFILE_MIGRATION_PASSWORD=${randomBytes(24).toString('hex')}\nSUPABASE_JWT_ISSUER=http://fixture-auth:9999/auth/v1\nSUPABASE_JWKS_URL=http://fixture-auth:9999/auth/v1/.well-known/jwks.json\nVITE_SUPABASE_URL=http://127.0.0.1:54321\nVITE_SUPABASE_ANON_KEY=sb_publishable_fixture_not_real\nFRONTEND_PORT=4300\nGATEWAY_PORT=4301\nIMAGE_TAG=p0-test\n`,{mode:0o600})
writeFileSync('.tools/stack-context.json',JSON.stringify({project,envFile}))
async function waitHealthy() {
  for(let i=0;i<60;i++) {
    try {if((await fetch('http://127.0.0.1:4300/api/v1/profiles/fixture_a',{signal:AbortSignal.timeout(8000)})).status===200)return} catch { /* container starting */ }
    await new Promise(r=>setTimeout(r,1000))
  }
  throw new Error('Stack recovery timed out')
}
try {
  console.log('Building isolated stack')
  console.log(compose('build'))
  console.log(compose('up','-d','--wait','--wait-timeout','180'))
  const browser=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','--config','playwright.stack.config.ts'],{stdio:'inherit'})
  assert.equal(browser.status,0,'Browser integration suite')
  const ids=Object.fromEntries(['profile-db','profile-service'].map(s=>[s,compose('ps','-q',s)]))
  console.log(compose('up','-d','--no-deps','--force-recreate','frontend'))
  for(const [service,id] of Object.entries(ids))assert.equal(compose('ps','-q',service),id,'Frontend recreate must preserve other containers')
  console.log(compose('up','-d','--no-deps','--force-recreate','profile-service'))
  await waitHealthy()
  assert.equal(sql("SELECT display_name FROM profile_public WHERE username='fixture_a';"),'Tài khoản A')
  console.log(compose('stop','profile-db'))
  const down=await fetch('http://127.0.0.1:4301/health/ready');assert.equal(down.status,503)
  const unavailable=await fetch('http://127.0.0.1:4300/api/v1/profiles/fixture_a');assert.equal(unavailable.status,503)
  console.log(compose('up','-d','--no-deps','--force-recreate','profile-db'))
  await waitHealthy()
  assert.equal(sql("SELECT count(*) FROM profile_public WHERE username IN ('fixture_a','fixture_b');"),'2')
  assert.equal(sql('SELECT count(*) FROM flyway_schema_history WHERE success;'),'1')
  console.log(compose('run','--rm','--no-deps','profile-migrate'))
  assert.equal(sql('SELECT count(*) FROM flyway_schema_history WHERE success;'),'1')
  for(const [service,uid] of [['frontend','101'],['gateway','101'],['profile-service','10001']])assert.equal(compose('exec','-T',service,'id','-u'),uid)
  const config=JSON.parse(compose('config','--format','json'))
  assert.ok(!('PROFILE_MIGRATION_PASSWORD' in config.services['profile-service'].environment))
  assert.equal(compose('exec','-T','profile-service','find','/app','-name','.env*'),'')
  assert.equal(compose('exec','-T','profile-service','sh','-c','command -v javac || true'),'')
  for(const service of ['frontend','gateway','profile-service']) {
    const inspect=spawnSync('docker',['inspect',compose('ps','-q',service),'--format','{{.HostConfig.ReadonlyRootfs}}'],{encoding:'utf8'})
    assert.equal(inspect.stdout.trim(),'true')
  }
  assert.equal(sql("SELECT rolname||':'||rolsuper||':'||rolcreatedb||':'||rolcreaterole FROM pg_roles WHERE rolname='profile_runtime';"),'profile_runtime:false:false:false')
  assert.equal(sql("SELECT has_database_privilege('profile_runtime','postgres','CONNECT');"),'f')
  assert.equal(sql("SELECT has_schema_privilege('profile_runtime','public','CREATE');"),'f')
  assert.equal(sql("SELECT has_column_privilege('profile_runtime','profile_access','app_role','UPDATE');"),'f')
  for(const service of ['profile-db','profile-service']) {
    const inspect=spawnSync('docker',['inspect',compose('ps','-q',service),'--format','{{json .HostConfig.PortBindings}}'],{encoding:'utf8'})
    assert.equal(inspect.status,0)
    assert.ok(['{}','null'].includes(inspect.stdout.trim()),'Private services have no published port')
  }
  console.log('PASS: browser real API/JPA, independent container recreate, DB outage/recovery, durable volume, one-shot migration, non-root and least privilege')
} finally {
  // Only this random test namespace owns the volume; never delete development volumes.
  const volume=`${project}_profile_data`
  const inspect=spawnSync('docker',['volume','inspect',volume,'--format','{{index .Labels "com.docker.compose.project"}}'],{encoding:'utf8'})
  if(inspect.status===0&&inspect.stdout.trim()!==project)throw new Error('Refusing cleanup: volume ownership mismatch')
  console.log(compose('down','--volumes','--remove-orphans'))
}
