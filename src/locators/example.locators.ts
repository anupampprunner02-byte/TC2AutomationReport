import { Page } from '@playwright/test';

export class ExampleLocators {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Section — Form inputs
  get emailInput() {
    return this.page.locator('input[name="email"]');
  }

  get passwordInput() {
    return this.page.locator('input[name="password"]');
  }

  // Section — Actions
  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  // Section — Feedback
  get successMessage() {
    return this.page.getByRole('alert').filter({ hasText: 'Success' });
  }

  get errorMessage() {
    return this.page.getByRole('alert').filter({ hasText: 'Error' });
  }
}
