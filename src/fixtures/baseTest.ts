import { test as base } from '@playwright/test';
import { takeScreenshot } from '../utils/screenshotUtils';

export const test = base.extend({

});

test.afterEach(async ({ page }, testInfo) => {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach("End of Test Screenshot", {
    body: screenshot,
    contentType: "image/png"
  });

  const name = testInfo.title.replace(/[\s–\-]+/g, '_').replace(/[^a-z0-9_]/gi, '').toLowerCase() + '_final';
  await takeScreenshot(page, name);
});

export { expect } from '@playwright/test';