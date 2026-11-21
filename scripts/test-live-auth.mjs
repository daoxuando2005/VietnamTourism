// Opt-in verification against the configured Supabase test project and LOCAL stack.
// Never logs credentials/JWT, browser traces, screenshots, DOM, or provider bodies.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import { chromium } from '@playwright/test'
import { loadEnv } from 'vite'
// Passwords are literal, including $, rather than dotenv-expand expressions.
const env={...loadEnv('development',process.cwd(),''),...(existsSync('.env.e2e.local')?parseEnv(readFileSync('.env.e2e.local','utf8')):{})}
const required=['E2E_EMAIL_A','E2E_PASSWORD_A','E2E_EMAIL_B','E2E_PASSWORD_B']
if(!existsSync('.env.e2e.local')||required.some(k=>!env[k]))throw new Error('Missing .env.e2e.local test accounts; live verification has NOT run')
const provider=new URL(env.VITE_SUPABASE_URL)
if(provider.protocol!=='https:'||!provider.hostname.endsWith('.supabase.co'))throw new Error('Live verification requires a hosted Supabase URL')
const base=env.E2E_BASE_URL||'http://localhost:3000'
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Live test only supports the local development stack')
const clients=[],sessions=[],report={provider:'Supabase hosted',checks:[],passed:false}
let browser,step='provider sign-in'
const check=(ok,name)=>{if(!ok)throw new Error('Verification failed');report.checks.push(name)}
async function api(path,token,options={}) {
  return fetch(`${base}/api/v1${path}`,{...options,signal:AbortSignal.timeout(15000),headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...options.headers}})
}
try {
  for(const name of ['A','B']) {
    const sdk=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
    clients.push(sdk)
    const {data,error}=await sdk.auth.signInWithPassword({email:env[`E2E_EMAIL_${name}`],password:env[`E2E_PASSWORD_${name}`]})
    check(!error&&!!data.session&&!!data.user?.email_confirmed_at,`confirmed hosted user ${name}`)
    sessions.push(data.session)
  }
  check(sessions[0].user.id!==sessions[1].user.id,'two distinct subjects')
  step='browser sign-in, bootstrap and persistence'
  browser=await chromium.launch({headless:true})
  const page=await browser.newPage()
  for(const name of ['A','B']) {
    await page.goto(`${base}/auth/login?returnTo=%2Fprofile%3Fsource%3Dlive`)
    await page.getByLabel('Email',{exact:true}).fill(env[`E2E_EMAIL_${name}`])
    await page.getByLabel('Mật khẩu',{exact:true}).fill(env[`E2E_PASSWORD_${name}`])
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).click()
    await page.waitForURL(/\/profile\?source=live$/,{timeout:30000})
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('vietnam-tourism-auth-v1')||'null'))
    const expected=sessions[name==='A'?0:1].user.id
    check(stored?.user.id===expected,`browser subject ${name}`)
    const own=await api('/me/profile',stored.access_token)
    check(own.status===200&&(await own.json()).id===expected,`hosted JWT → gateway/JPA owner ${name}`)
    await page.reload()
    await page.getByRole('button',{name:'Đăng xuất',exact:true}).waitFor()
    check((await api('/me/profile',stored.access_token)).status===200,`reload keeps durable profile ${name}`)
    await page.getByRole('button',{name:'Đăng xuất',exact:true}).click()
    await page.waitForURL(/\/auth\/login/)
    check(await page.evaluate(()=>localStorage.getItem('vietnam-tourism-auth-v1'))===null,`logout clears session ${name}`)
  }
  step='public/private isolation'
  const ownA=await(await api('/me/profile',sessions[0].access_token)).json()
  const publicA=await api(`/profiles/${encodeURIComponent(ownA.username)}`)
  check(publicA.status===200,'guest public profile')
  const data=await publicA.json()
  check(!['email','phoneNumber','birthDate','role'].some(k=>k in data),'public DTO has no private fields')
  check((await api('/me/profile')).status===401,'guest private API denied')
  const forged=await api('/me/profile',sessions[1].access_token,{headers:{'X-User-Id':sessions[0].user.id,'X-Role':'ADMIN'}})
  check((await forged.json()).id===sessions[1].user.id,'B cannot impersonate A')
  check((await api('/admin/access',sessions[1].access_token)).status===403,'member cannot claim admin')
  report.passed=true
  console.log(`PASS: ${report.checks.length} live Supabase/browser/gateway/JPA checks`)
} catch {
  console.error(`FAIL: live verification at ${step}; sensitive details omitted`)
  process.exitCode=1
} finally {
  await browser?.close()
  for(const sdk of clients)await sdk.auth.signOut({scope:'local'}).catch(()=>{})
  mkdirSync('.tools',{recursive:true})
  writeFileSync('.tools/P0-10-live.json',JSON.stringify(report,null,2)+'\n')
}
