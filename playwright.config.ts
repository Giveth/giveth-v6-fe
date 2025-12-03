import type { PlaywrightTestConfig } from '@playwright/test'

const PORT = process.env.PORT ?? '3000'

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `PORT=${PORT} pnpm dev`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
}

export default config
