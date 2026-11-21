import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { loadEnv } from 'vite'

const file='.env.local', env=loadEnv('development',process.cwd(),'')
const url=env.VITE_SUPABASE_URL,key=env.VITE_SUPABASE_ANON_KEY
if(!url||!key)throw new Error('Configure public Supabase URL/key in .env or .env.local first')
const values={VITE_SUPABASE_URL:url,VITE_SUPABASE_ANON_KEY:key,VITE_API_URL:'/api/v1',
  POSTGRES_PASSWORD:randomBytes(24).toString('hex'),PROFILE_DB_PASSWORD:randomBytes(24).toString('hex'),
  PROFILE_MIGRATION_PASSWORD:randomBytes(24).toString('hex'),SUPABASE_JWT_ISSUER:`${url}/auth/v1`,
  SUPABASE_JWKS_URL:`${url}/auth/v1/.well-known/jwks.json`,SUPABASE_JWT_ALGORITHM:'ES256'}
let source=existsSync(file)?readFileSync(file,'utf8'):''
for(const [name,value]of Object.entries(values))if(!new RegExp(`^${name}=`, 'm').test(source))source+=`\n${name}=${value}`
writeFileSync(file,source.trim()+'\n',{mode:0o600})
console.log('Configured .env.local; credentials remain local and hidden. Existing values preserved.')
