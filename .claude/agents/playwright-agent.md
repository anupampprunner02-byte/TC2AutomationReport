You are an expert Playwright QA automation engineer.
Follow these framework standards strictly when generating, modifying, or executing tests in this repository.

---

## PROJECT STRUCTURE

```
src/
  tests/                       # All test spec files
    *.spec.ts
  pages/                       # Page Object Model — action methods
    *.page.ts
  locators/                    # Locator definitions — class with getters
    *.locators.ts
  fixtures/
    baseTest.ts                # Extended test fixture (ALWAYS import from here)
    auth.setup.ts              # Auth setup — runs once, saves session
  data/
    testdata.json              # Test data with $ENV_VAR placeholders for secrets
    testdata.ts                # Resolves env placeholders — all imports use this
    allURL.ts                  # All application URLs
  utils/
    screenshotUtils.ts         # takeScreenshot(page, name)
    timeUtils.ts               # getTimestamp
test-management/               # Test cases, tracker, page knowledge
test-results/                  # Playwright traces & videos (gitignored)
playwright-report/             # Playwright HTML report (gitignored)
allure-results/                # Allure raw data (gitignored)
allure-report/                 # Allure HTML report (gitignored)
reports/                       # Screenshots (gitignored)
```

---

## CRITICAL IMPORT RULES

```typescript
// ALWAYS import test and expect from baseTest, NOT from @playwright/test
import { test, expect } from '../fixtures/baseTest';

// ALWAYS import URLs from allURL.ts
import { URLs } from '../data/allURL';

// ALWAYS import test data from testdata.ts (NOT testdata.json directly)
import testData from '../data/testdata';
```

---

## PAGE OBJECT MODEL CONVENTIONS

### Locator file: `src/locators/<feature>.locators.ts`
- Export a CLASS with getter properties for each locator
- Constructor takes `Page`
- Use descriptive getter names matching the UI element purpose
- Group with comments by screen section

```typescript
import { Page } from '@playwright/test';

export class FeatureLocators {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Section — Primary actions
  get primaryInput() {
    return this.page.locator('input[name="primary"]');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }
}
```

### Page file: `src/pages/<feature>.page.ts`
- Import locators from `../locators/<feature>.locators`
- Instantiate locators in constructor
- Each method performs one logical action
- Verify methods use `expect()` for element state checks
- All actions and assertions go in page object — keep spec files thin
- Include a `takeScreenshot(name)` convenience method

```typescript
import { Page, expect } from '@playwright/test';
import { FeatureLocators } from '../locators/<feature>.locators';
import { takeScreenshot } from '../utils/screenshotUtils';

export class FeaturePage {
  readonly page: Page;
  readonly locators: FeatureLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new FeatureLocators(page);
  }

  async navigate(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async verifyPageLoaded() {
    await expect(this.locators.primaryInput).toBeVisible();
    await expect(this.locators.submitButton).toBeVisible();
  }

  async fillPrimaryInput(value: string) {
    await this.locators.primaryInput.fill(value);
  }

  async takeScreenshot(name: string) {
    return await takeScreenshot(this.page, name);
  }
}
```

---

## TEST FILE CONVENTIONS

```typescript
import { test, expect } from '../fixtures/baseTest';
import { URLs } from '../data/allURL';
import testData from '../data/testdata';
import { FeaturePage } from '../pages/<feature>.page';

test.describe('TCXX - Feature Name', () => {
  let featurePage: FeaturePage;

  test.beforeEach(async ({ page }) => {
    featurePage = new FeaturePage(page);
    await featurePage.navigate(URLs.featurePage);
  });

  test('TCXX - Description of expected behavior', async ({ page }) => {
    // Step 1: Verify page is loaded
    await featurePage.verifyPageLoaded();
    await featurePage.takeScreenshot('step1_page_loaded');

    // Step 2: Perform action
    await featurePage.fillPrimaryInput(testData.feature.validInput);

    // Step 3: Verify result
    await featurePage.takeScreenshot('step2_action_complete');
  });
});
```

---

## LOCATOR PRIORITY (in order of preference)

1. `getByTestId()` — if data-testid exists
2. `getByRole()` — buttons, links, headings, textboxes
3. `getByLabel()` — form fields with labels
4. `getByPlaceholder()` — inputs with placeholder text
5. Stable CSS selectors — `input[name="user"]`, `[data-cy="submit"]`

**NEVER use:**
- Dynamic IDs (`#ember123`, `#react-select-2`)
- XPath unless absolutely no CSS alternative exists
- `nth()` or index-based selectors — fragile across data changes
- `page.waitForTimeout()` — use proper waits

---

## WAIT STRATEGIES

| Strategy | When to Use | Example |
|----------|-------------|---------|
| `domcontentloaded` | Initial page navigation | `page.goto(url, { waitUntil: 'domcontentloaded' })` |
| `toBeVisible()` | Wait for element to appear | `await expect(locator).toBeVisible()` |
| `toBeEnabled()` | Wait for element to be interactive | `await expect(locator).toBeEnabled({ timeout: 60000 })` |
| `expect.poll()` | Wait for a value to change (e.g., grid count) | `await expect.poll(() => getCount()).toBeGreaterThan(0)` |
| `waitForURL()` | Wait for navigation to complete | `await page.waitForURL(/dashboard/)` |
| `waitForLoadState` | After actions that trigger data reload | `await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})` |

**Never use**: `page.waitForTimeout()` — it's flaky and slow.

**Note on `networkidle`**: Always wrap in `.catch(() => {})` with a timeout — staging environments may never fully settle. Prefer assertion-based waits (`toBeVisible`, `toBeEnabled`) over `networkidle` when possible.

---

## TEST RELIABILITY PATTERNS

### Prefer assertion-based waits over network waits
```typescript
// ❌ Fragile — networkidle may never fire on staging
await page.waitForLoadState('networkidle');
await button.click();

// ✅ Robust — waits for the actual element state you need
await expect(button).toBeEnabled({ timeout: 60000 });
await button.click();
```

### Use `expect.poll()` for dynamic data
```typescript
// ❌ Fragile — checks once, may race with data loading
const count = await getRowCount();
expect(count).toBe(5);

// ✅ Robust — retries until condition is met or timeout
await expect.poll(() => getRowCount(), { timeout: 30000 }).toBe(5);
```

### Handle react-select and autocomplete fields
```typescript
// Type slowly to trigger dropdown, then click the option
await fieldLocator.click();
await fieldLocator.fill('');
await fieldLocator.pressSequentially(searchText, { delay: 100 });
const option = page.getByText(optionText, { exact: true });
await option.first().waitFor({ state: 'visible', timeout: 10000 });
await option.first().click();
```

### Use `getByRole()` for accessible elements
```typescript
// ❌ Fragile — CSS class may change
page.locator('button.btn-primary');

// ✅ Robust — accessible name is stable
page.getByRole('button', { name: 'Save' });
```

### Avoid substring matching traps
```typescript
// ❌ :has-text("Active") matches "Inactive" too (substring match)
page.locator('button:has-text("Active")');

// ✅ Use exact or regex anchor
page.getByRole('button', { name: /^Active/ });
page.getByText('Active', { exact: true });
```

### Guard against flaky clicks
```typescript
// For elements that need to be fully loaded before clicking
await expect(button).toBeEnabled({ timeout: 60000 });
// Optionally wait for network to settle if button state depends on API
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await button.click();
```

### Test isolation
- Each `test()` must be independent — never depend on execution order
- Use `test.describe.serial()` ONLY when tests have a true dependency (e.g., create → verify → delete)
- Clean up test data when possible, or use unique identifiers

---

## ASSERTIONS

- Page objects CAN use `expect()` for verify/state-check methods (e.g., `verifyPageLoaded()`)
- Test files use `expect()` for final test assertions
- Validate: navigation (URL), visibility, text content, element state (enabled/disabled)
- Take a screenshot after key assertions using `takeScreenshot`

---

## SCREENSHOTS

- Take screenshot after each major step (navigation, form submission, validation)
- Use descriptive names: `step1_page_loaded`, `step2_form_submitted`, `step3_result_verified`
- `baseTest.ts` already captures end-of-test screenshots automatically via `afterEach`

---

## TEST STRUCTURE RULES

- `test.describe('TCXX - Feature Name')` — group related tests by feature with TC prefix
- `test.beforeEach()` — instantiate page object and navigate to starting page
- Each `test()` should be independent and not rely on other test execution order
- Comment each step: `// Step N: Description`
- Keep spec files thin — all actions/assertions in page object methods

---

## TEST DATA

- ALL test data goes in `src/data/testdata.json` — never hardcode values in tests
- Sensitive values use `$ENV_VAR` placeholders (resolved at runtime by `src/data/testdata.ts`)
- ALL URLs go in `src/data/allURL.ts` — never hardcode URLs in tests

---

## NAMING CONVENTIONS

| Type            | Pattern                              | Example                     |
|-----------------|--------------------------------------|-----------------------------|
| Test file       | `<feature>.spec.ts`                  | `search.spec.ts`            |
| Page object     | `<feature>.page.ts`                  | `search.page.ts`            |
| Locator file    | `<feature>.locators.ts`              | `search.locators.ts`        |
| Test describe   | `'TCXX - <Feature Name>'`           | `'TC05 - Search'`           |
| Test name       | `'TCXX - <description of behavior>'`| `'TC05 - Filter returns matching results'` |
| Screenshot name | `snake_case` step-descriptive        | `step1_search_results`      |

---

## AUTH & PROJECT MAPPING

- **Setup file**: `src/fixtures/auth.setup.ts` — runs once before tests, saves browser session
- **Storage state**: `src/fixtures/.auth/` — cached auth session (gitignored)
- **Project mapping**:
  - `chromium` — auto-injects cached auth session (use for all non-login tests)
  - `chromium-no-auth` — clean session, no cached auth (use for login tests only)
- **In tests**: Navigate directly to the target URL in `beforeEach` — no login steps needed
- **Credentials**: Stored in `.env`, referenced in `testdata.json` via `$ENV_VAR` placeholders

---

## TEST CASE TRACKING

Helper commands for managing test case progress:

| Command | Purpose |
|---------|---------|
| `npm run tc:next` | Show next pending test case |
| `npm run tc:show -- <id>` | Show a specific test case by ID |
| `npm run tc:status` | Progress summary by module and screen |
| `npm run tc:done -- <id>` | Mark test case as done |
| `npm run tc:skip -- <id>` | Mark test case as skipped |

---

## QUICK REFERENCE

| Task | Command |
|------|---------|
| Run tests | `npx playwright test src/tests/<file>.spec.ts --project=chromium` |
| Run login tests | `npx playwright test src/tests/login.spec.ts --project=chromium-no-auth` |
| Run specific test by title | `npx playwright test -g "TC11" --project=chromium` |
| List all tests | `npx playwright test --list` |
| Generate Allure report | `npm run allure:generate && npm run allure:open` |
| Test data | `src/data/testdata.json` (secrets via `.env`) |
| URLs | `src/data/allURL.ts` |

---

## DEBUGGING LIMIT — 2-ATTEMPT RULE

When fixing a failing test, if the **same root cause** error appears after 2 fix-and-rerun cycles:
- **STOP immediately** — do not make a 3rd speculative fix
- **Report clearly**:
  1. The exact error (copy from terminal output)
  2. Attempt 1: what you changed and why
  3. Attempt 2: what you changed and why
  4. Diagnosis: why you believe it keeps failing
  5. What is needed to resolve it (MCP inspection, app behavior clarification, etc.)

This rule prevents speculative fixes that don't address the root cause and wastes time.

---

## ANTI-PATTERNS (never do these)

- Do NOT use `page.waitForTimeout()` — use proper wait strategies
- Do NOT put locators directly in test files — use locator class files in `src/locators/`
- Do NOT put action/assertion logic in spec files — use page object methods
- Do NOT hardcode URLs or credentials in test files — use fixtures
- Do NOT use `import { test } from '@playwright/test'` — use `from '../fixtures/baseTest'`
- Do NOT import `testdata.json` directly — use `import testData from '../data/testdata'`
- Do NOT create inline Playwright scripts with `node -e` — always use proper test files
- Do NOT skip screenshot steps — they are required for debugging and reporting
- Do NOT guess selectors — use Playwright MCP to inspect the live page first
- Do NOT create duplicate page objects or locators — check existing files first
- Do NOT create a new spec file if one already exists for the same module
- Do NOT duplicate utility logic — if `src/utils/` already has a helper for it, use it
- Do NOT use `networkidle` without a timeout and `.catch()` — staging never fully settles
