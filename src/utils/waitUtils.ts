import { Page, Locator } from '@playwright/test';

export async function waitForElementVisible(locator: Locator) {
  await locator.waitFor({ state: 'visible', timeout: 10000 });
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function waitForElementClickable(locator: Locator) {
  await locator.waitFor({ state: 'attached' });
}