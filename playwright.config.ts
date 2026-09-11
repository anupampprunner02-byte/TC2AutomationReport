import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './src/tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 2,

  workers: process.env.CI ? 1 : 1,

  timeout: 180000,

  expect: {
    timeout: 10000
  },

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright']
  ],

  use: {
    headless: true,

    trace: 'retain-on-failure',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    actionTimeout: 30000,

    navigationTimeout: 30000
  },

  reportSlowTests: {
    max: 0,
    threshold: 30000
  },

  projects: [
    // Auth setup — runs once, saves session to reuse
    {
      name: 'setup',
      testDir: './src/fixtures',
      testMatch: /auth\.setup\.ts/,
    },

    // Main project — reuses auth session (use for all non-login tests)
    {
      name: 'chromium',
      testIgnore: /login\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'src/fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Login tests — clean session, no cached auth
    {
      name: 'chromium-no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /login\.spec\.ts/,
    },
  ],

});
