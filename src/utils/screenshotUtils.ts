import { Page } from '@playwright/test';
import { getTimestamp } from './timeUtils';

export async function takeScreenshot(page: Page, name: string): Promise<string> {
  const timestamp = getTimestamp();

  const path = `reports/screenshots/${name}_${timestamp}.png`;

  await page.screenshot({
    path,
    fullPage: false,
    timeout: 5000
  });

  return path;
}