import { Locator } from '@playwright/test';

export async function safeClick(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}

export async function safeFill(locator: Locator, text: string) {
  await locator.waitFor({ state: 'visible' });
  await locator.fill(text);
}

export async function getText(locator: Locator) {
  await locator.waitFor({ state: 'visible' });
  return await locator.textContent();
}