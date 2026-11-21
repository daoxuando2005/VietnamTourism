import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
export function context() { return JSON.parse(readFileSync('.tools/stack-context.json','utf8')) }
export function compose(...args) {
  const c=context()
  if(!/^vt-p0-test-[a-f0-9]{12}$/.test(c.project))throw new Error('Unsafe test project')
  const r=spawnSync('docker',['compose','--env-file',c.envFile,'-f','compose.yaml','-f','tests/compose.integration.yaml','-p',c.project,...args],{encoding:'utf8',input:undefined})
  if(r.status!==0)throw new Error(`Compose ${args[0]} failed: ${r.stderr}`)
  return r.stdout.trim()
}
export function sql(query) {
  const c=context()
  if(!/^vt-p0-test-[a-f0-9]{12}$/.test(c.project))throw new Error('Unsafe test project')
  const r=spawnSync('docker',['compose','--env-file',c.envFile,'-f','compose.yaml','-f','tests/compose.integration.yaml','-p',c.project,'exec','-T','profile-db','psql','-U','postgres','-d','profile','-At','-v','ON_ERROR_STOP=1'],{encoding:'utf8',input:query})
  if(r.status!==0)throw new Error(`Test SQL failed: ${r.stderr}`)
  return r.stdout.trim()
}
