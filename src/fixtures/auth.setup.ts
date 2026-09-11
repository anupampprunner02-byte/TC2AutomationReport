import { test as setup } from '@playwright/test';
import { URLs } from '../data/allURL';
import testData from '../data/testdata';

const AUTH_FILE = 'src/fixtures/.auth/user.json';

setup('authenticate', async ({ page }) => {
  setup.setTimeout(120000);

  await page.goto(URLs.login, { waitUntil: 'domcontentloaded', timeout: 120000 });

  // TODO: Update selectors and flow to match your application's login page
  // Example for a standard email + password login:
  await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('input[name="email"]').fill(testData.login.validUser.email);
  await page.locator('input[name="password"]').fill(testData.login.validUser.password);
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for successful login — update the URL pattern to match your app's post-login URL
  await page.waitForURL(/\/dashboard/, { timeout: 60000, waitUntil: 'domcontentloaded' });

  await page.context().storageState({ path: AUTH_FILE });
});
