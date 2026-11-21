import SwaggerParser from '@apidevtools/swagger-parser'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const spec = await SwaggerParser.validate(fileURLToPath(new URL('../docs/api/profile-v1.yaml', import.meta.url)))
assert.equal(spec.openapi, '3.0.3')
assert.equal(spec.paths['/api/v1/profiles/{username}'].get.operationId, 'getPublicProfile')
const fields = Object.keys(spec.components.schemas.PublicProfile.properties).sort()
assert.deepEqual(fields, ['id','username','displayName','bio','avatarUrl','coverUrl','website','location','createdAt'].sort())
assert.deepEqual(spec.paths['/api/v1/profiles/{username}'].get.security, [])
if (process.env.PROFILE_OPENAPI_URL || process.env.PROFILE_OPENAPI_FILE) {
  let runtime
  if (process.env.PROFILE_OPENAPI_FILE) {
    runtime = JSON.parse(readFileSync(process.env.PROFILE_OPENAPI_FILE, 'utf8'))
  } else {
    const response = await fetch(process.env.PROFILE_OPENAPI_URL, { signal: AbortSignal.timeout(5000) })
    assert.equal(response.status, 200)
    runtime = await response.json()
  }
  assert.equal(runtime.paths['/api/v1/profiles/{username}'].get.operationId, 'getPublicProfile')
  const dto = runtime.components.schemas.PublicProfileResponse
  assert.ok(dto, 'runtime public DTO schema exists')
  assert.deepEqual(Object.keys(dto.properties).sort(), fields)
  for(const [route,path] of Object.entries(spec.paths)) {
    for(const method of ['get','post'])if(path[method])assert.equal(runtime.paths[route]?.[method]?.operationId,path[method].operationId)
  }
  assert.deepEqual(Object.keys(runtime.components.schemas.OwnProfileResponse.properties).sort(),Object.keys(spec.components.schemas.OwnProfile.properties).sort())
  assert.deepEqual(Object.keys(runtime.components.schemas.BootstrapRequest.properties).sort(),Object.keys(spec.components.schemas.BootstrapRequest.properties).sort())
  console.log('PASS: runtime public/owner/bootstrap DTO fields and all operations match reviewed contract')
}
console.log('PASS: OpenAPI 3.0 validation, public field boundary, public route security declaration')
