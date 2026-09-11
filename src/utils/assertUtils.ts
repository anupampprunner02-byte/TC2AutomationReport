import { expect, Locator, Page } from '@playwright/test';
import { takeScreenshot } from './screenshotUtils';

export async function expectVisible(locator: Locator, page: Page, name: string) {
  await expect(locator).toBeVisible();

  await takeScreenshot(page, `assert_${name}`);
}