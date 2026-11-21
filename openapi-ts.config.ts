import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'docs/api/profile-v1.yaml',
  output: 'src/api/generated',
  plugins: ['@hey-api/typescript'],
})
