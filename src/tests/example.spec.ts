import { test, expect } from '../fixtures/baseTest';
import { URLs } from '../data/allURL';
import testData from '../data/testdata';
import { ExamplePage } from '../pages/example.page';

test.describe('TC01 - Example Feature', () => {
  let examplePage: ExamplePage;

  test.beforeEach(async ({ page }) => {
    examplePage = new ExamplePage(page);
    await examplePage.navigate(URLs.dashboard);
  });

  test('TC01 - Page loads with required elements visible', async ({ page }) => {
    // Step 1: Verify page loaded
    await examplePage.verifyPageLoaded();
    await examplePage.takeScreenshot('step1_page_loaded');
  });

  test('TC02 - Valid submission shows success message', async ({ page }) => {
    // Step 1: Fill form
    await examplePage.fillEmail(testData.login.validUser.email);
    await examplePage.fillPassword(testData.login.validUser.password);
    await examplePage.takeScreenshot('step1_form_filled');

    // Step 2: Submit
    await examplePage.submit();

    // Step 3: Verify success
    await examplePage.verifySuccess();
    await examplePage.takeScreenshot('step2_success');
  });

  test('TC03 - Invalid credentials show error message', async ({ page }) => {
    // Step 1: Fill with invalid credentials
    await examplePage.fillEmail(testData.login.invalidUser.email);
    await examplePage.fillPassword(testData.login.invalidUser.password);

    // Step 2: Submit
    await examplePage.submit();

    // Step 3: Verify error
    await examplePage.verifyError();
    await examplePage.takeScreenshot('step1_error_shown');
  });
});
