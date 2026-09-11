import { Page, expect } from '@playwright/test';
import { ExampleLocators } from '../locators/example.locators';
import { takeScreenshot } from '../utils/screenshotUtils';

export class ExamplePage {
  readonly page: Page;
  readonly locators: ExampleLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new ExampleLocators(page);
  }

  async navigate(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async verifyPageLoaded() {
    await expect(this.locators.emailInput).toBeVisible();
    await expect(this.locators.submitButton).toBeVisible();
  }

  async fillEmail(email: string) {
    await this.locators.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.locators.passwordInput.fill(password);
  }

  async submit() {
    await expect(this.locators.submitButton).toBeEnabled({ timeout: 10000 });
    await this.locators.submitButton.click();
  }

  async verifySuccess() {
    await expect(this.locators.successMessage).toBeVisible({ timeout: 10000 });
  }

  async verifyError(expectedText?: string) {
    await expect(this.locators.errorMessage).toBeVisible({ timeout: 10000 });
    if (expectedText) {
      await expect(this.locators.errorMessage).toContainText(expectedText);
    }
  }

  async takeScreenshot(name: string) {
    return await takeScreenshot(this.page, name);
  }
}
