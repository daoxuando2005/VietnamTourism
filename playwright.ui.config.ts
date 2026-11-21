import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/ui', workers: 1, timeout: 30000,
  reporter: [['list'], ['json', { outputFile: '.tools/P0-07-ui.json' }]],
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, trace: 'off' },
  webServer: [
    { command: 'node tests/fixtures/auth/server.mjs', url: 'http://127.0.0.1:54321/health', env: { PORT: '54321', HOST: '127.0.0.1' }, reuseExistingServer: false },
    { command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173',
      env: { VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_ANON_KEY: 'sb_publishable_fixture_not_real', VITE_API_URL: '/api/v1' }, reuseExistingServer: false },
  ],
})
