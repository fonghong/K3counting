import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: { baseURL: 'http://localhost:5173', viewport: { width: 1440, height: 900 }, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'webkit', use: { browserName: 'webkit' } }],
  webServer: { command: 'npm run dev -- --host 0.0.0.0 --port 5173 --strictPort', url: 'http://localhost:5173', reuseExistingServer: !process.env.CI },
})