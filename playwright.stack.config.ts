import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir:'./tests/stack',testMatch:'*.spec.ts',workers:1,timeout:45000,
  reporter:[['list']],use:{baseURL:'http://127.0.0.1:4300',headless:true,trace:'off'},
})
