// TEST ONLY: a local Auth protocol fixture. Never part of compose.yaml or a production image.
import http from 'node:http'
import { createHash, generateKeyPairSync, randomUUID, sign, verify } from 'node:crypto'

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
const rogue = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'fixture-key', use: 'sig', alg: 'ES256' }
const issuer = process.env.JWT_ISSUER || 'http://fixture-auth:9999/auth/v1'
const users = new Map(), refreshes = new Map(), codes = new Map()
let failRefresh = false
function user(email, id, username, displayName, password, confirmed = true) {
  return { id, email, password, confirmed, user_metadata: { username, displayName } }
}
function reset() {
  users.clear(); refreshes.clear(); codes.clear(); failRefresh = false
  for (const value of [user('a@example.test','11111111-1111-4111-8111-111111111111','fixture_a','Tài khoản A','fixture-password-A'),
    user('b@example.test','22222222-2222-4222-8222-222222222222','fixture_b','Tài khoản B','fixture-password-B'),
    user('admin@example.test','33333333-3333-4333-8333-333333333333','fixture_admin','Quản trị test','fixture-password-admin')]) users.set(value.email,value)
}
reset()
function view(u) { return { id:u.id,email:u.email,aud:'authenticated',role:'authenticated',email_confirmed_at:u.confirmed?'2026-11-21T00:00:00Z':null,created_at:'2026-11-21T00:00:00Z',app_metadata:{provider:'email'},user_metadata:u.user_metadata,identities:[] } }
function jwt(u, bad = false) {
  const body={iss:issuer,sub:u.id,aud:'authenticated',role:'authenticated',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,email:u.email,user_metadata:u.user_metadata}
  const header=Buffer.from(JSON.stringify({alg:'ES256',kid:'fixture-key',typ:'JWT'})).toString('base64url')
  const payload=Buffer.from(JSON.stringify(body)).toString('base64url')
  return `${header}.${payload}.${sign('sha256',Buffer.from(`${header}.${payload}`),{key:bad?rogue:privateKey,dsaEncoding:'ieee-p1363'}).toString('base64url')}`
}
function session(u,bad=false) {
  const refresh_token=randomUUID(); refreshes.set(refresh_token,u)
  return {access_token:jwt(u,bad),token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token,user:view(u)}
}
function principal(request) {
  try {
    const token=request.headers.authorization?.replace(/^Bearer /,''), [h,p,s]=token.split('.')
    if (!verify('sha256',Buffer.from(`${h}.${p}`),{key:publicKey,dsaEncoding:'ieee-p1363'},Buffer.from(s,'base64url'))) return null
    const claims=JSON.parse(Buffer.from(p,'base64url'))
    if(claims.iss!==issuer||claims.aud!=='authenticated'||claims.exp<=Date.now()/1000)return null
    return [...users.values()].find(u=>u.id===claims.sub)??null
  } catch { return null }
}
function reply(response,status,data) {
  if(data?.code)data={...data,error_code:data.code}
  response.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*',
    'X-Supabase-Api-Version':'2024-01-01','Access-Control-Expose-Headers':'X-Supabase-Api-Version',
    'Access-Control-Allow-Headers':'apikey,authorization,content-type,x-client-info,x-supabase-api-version','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS'})
  response.end(status===204?'':JSON.stringify(data))
}
const server=http.createServer(async(request,response)=>{
  if(request.method==='OPTIONS')return reply(response,204,{})
  const url=new URL(request.url,'http://fixture'), route=url.pathname
  let body={}
  try { let raw='';for await(const chunk of request)raw+=chunk;if(raw)body=JSON.parse(raw) } catch { return reply(response,400,{code:'invalid_json'}) }
  if(route==='/auth/v1/.well-known/jwks.json')return reply(response,200,{keys:[jwk]})
  if(route==='/health')return reply(response,200,{status:'UP'})
  if(route==='/__test/reset'){reset();return reply(response,200,{ok:true})}
  if(route==='/__test/mailbox')return reply(response,200,[...codes.entries()].filter(([,v])=>v.user.email===url.searchParams.get('email')).map(([code,v])=>({code,type:v.type})))
  if(route==='/__test/refresh-failure'){failRefresh=body.enabled;return reply(response,200,{ok:true})}
  if(route==='/__test/session'){
    const u=users.get(body.email);return u?reply(response,200,session(u,body.badSignature===true)):reply(response,404,{})
  }
  if(route==='/auth/v1/signup'){
    if(users.has(body.email))return reply(response,422,{code:'user_already_exists',msg:'Fixture duplicate'})
    const u=user(body.email,randomUUID(),body.data?.username,body.data?.displayName,body.password,false);users.set(u.email,u)
    codes.set(randomUUID(),{user:u,challenge:body.code_challenge,type:'signup'})
    return reply(response,200,view(u))
  }
  if(route==='/auth/v1/recover'){
    const u=users.get(body.email)
    if(u)codes.set(randomUUID(),{user:u,challenge:body.code_challenge,type:'recovery'})
    return reply(response,200,{})
  }
  if(route==='/auth/v1/token'){
    const grant=url.searchParams.get('grant_type')
    if(grant==='password'){
      const u=users.get(body.email)
      if(!u||u.password!==body.password)return reply(response,400,{code:'invalid_credentials',msg:'Fixture invalid credentials'})
      if(!u.confirmed)return reply(response,400,{code:'email_not_confirmed',msg:'Fixture email unconfirmed'})
      return reply(response,200,session(u))
    }
    if(grant==='refresh_token'){
      const u=refreshes.get(body.refresh_token)
      if(failRefresh||!u)return reply(response,400,{code:'refresh_token_not_found',msg:'Fixture refresh rejected'})
      refreshes.delete(body.refresh_token);return reply(response,200,session(u))
    }
    if(grant==='pkce'){
      const item=codes.get(body.auth_code)
      if(!item||!body.code_verifier||createHash('sha256').update(body.code_verifier).digest('base64url')!==item.challenge)return reply(response,400,{code:'otp_expired',msg:'Fixture PKCE rejected'})
      codes.delete(body.auth_code);item.user.confirmed=true;return reply(response,200,session(item.user))
    }
  }
  if(route==='/auth/v1/user'){
    const u=principal(request);if(!u)return reply(response,401,{code:'invalid_jwt',msg:'Fixture invalid JWT'})
    if(request.method==='PUT'&&body.password)u.password=body.password
    return reply(response,200,view(u))
  }
  if(route==='/auth/v1/logout')return reply(response,204,{})
  return reply(response,404,{code:'not_found'})
})
server.listen(Number(process.env.PORT||9999),process.env.HOST||'0.0.0.0',()=>process.stdout.write('Test Auth fixture ready (not Supabase)\n'))
