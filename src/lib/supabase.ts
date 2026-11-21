import { createClient } from '@supabase/supabase-js'
import { AUTH_STORAGE_KEY, authStorage } from './authStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !/^https?:\/\//.test(supabaseUrl) || !supabaseAnonKey) {
  throw new Error('Thiếu cấu hình Supabase công khai. Xem .env.example và README.md.')
}
if (supabaseAnonKey.startsWith('sb_secret_')) {
  throw new Error('Không được dùng khóa Supabase server trong frontend.')
}
// Legacy anon keys are JWTs. Reject a service-role key before initializing the SDK.
if (supabaseAnonKey.split('.').length === 3) {
  let role: string | undefined
  try {
    const payload = supabaseAnonKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    role = JSON.parse(atob(payload)).role
  } catch {
    throw new Error('Khóa Supabase công khai không hợp lệ.')
  }
  if (role !== 'anon') throw new Error('Frontend chỉ được dùng khóa Supabase công khai.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  { auth: { storage: authStorage, storageKey: AUTH_STORAGE_KEY, flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true } },
)
