# Playwright Base Framework

Generic Playwright + TypeScript QA automation framework using Page Object Model (POM) with Claude Code integration.

---

## Tech Stack

| | |
|--|--|
| Playwright | Browser automation |
| TypeScript | Type safety |
| Allure | Test reporting |
| allure-playwright | Allure integration |
| dotenv | Environment variable management |

---

## Project Structure

```
src/
├── data/
│   ├── allURL.ts                       # All application URLs (update for your app)
│   ├── testdata.json                   # Test data — use $ENV_VAR placeholders for secrets
│   └── testdata.ts                     # Typed test data loader — always import from here
├── fixtures/
│   ├── baseTest.ts                     # Extended test fixture — always import from here
│   └── auth.setup.ts                   # Auth setup — runs once, saves session to .auth/
├── locators/
│   └── example.locators.ts             # Example locator class — copy to add new pages
├── pages/
│   └── example.page.ts                 # Example page object — copy to add new pages
├── tests/
│   └── example.spec.ts                 # Example test spec — copy to add new features
└── utils/
    ├── agGridUtils.ts                  # AG Grid helper functions
    ├── assertUtils.ts                  # Custom assertion helpers
    ├── elementUtils.ts                 # Safe element interaction helpers
    ├── screenshotUtils.ts              # Screenshot with timestamp
    ├── timeUtils.ts                    # Date/time utilities
    └── waitUtils.ts                    # Custom wait conditions

test-management/                        # Test case tracking (testcases.json, tracker.json)
.claude/                                # Claude Code agents and slash commands
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
npx playwright install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your application credentials
```

### 3. Configure your application

Edit these files to point to your application:
- `src/data/allURL.ts` — add your app's URLs
- `src/fixtures/auth.setup.ts` — update login selectors and flow
- `src/data/testdata.json` — add your test data
- `.claude/agents/app-config.md` — document your app config for Claude

### 4. (Optional) Import test cases from Excel

If you have test cases in an Excel file:
```bash
npm run tc:parse -- MyTestCases.xlsx
```

---

## Running Tests

```bash
npm test                                                          # all tests
npx playwright test src/tests/example.spec.ts --project=chromium # single file
npx playwright test -g "TC01" --project=chromium                  # by TC ID
npx playwright test src/tests/login.spec.ts --project=chromium-no-auth  # login tests (no auth)
npx playwright test --headed                                      # headed mode
npx playwright test --list                                        # list all tests
```

---

## Test Case Management

```bash
npm run tc:status       # show progress (pending / done / skipped)
npm run tc:next         # show next pending test case
npm run tc:done -- <id> # mark test case as done
npm run tc:skip -- <id> # mark test case as skipped
npm run tc:show -- <id> # show test case details
npm run tc:parse        # re-parse testcases.json from Excel file
```

---

## Reporting

```bash
npm run allure:generate && npm run allure:open   # Allure report
npx playwright show-report                       # Playwright HTML report
```

---

## Claude Code Slash Commands

```
/discover-page <url>          # Explore a page via MCP and scaffold locators + page object
/write-test <id or desc>      # Implement a test case end-to-end
/next-test                    # Pick up and implement the next pending test case
/heal-test <file or TC id>    # Diagnose and fix a failing test
```

---

## Key Conventions

- **Imports**: always use `src/fixtures/baseTest.ts`, never `@playwright/test` directly
- **Test data**: `import testData from '../data/testdata'` — never import `.json` directly
- **Secrets**: use `$ENV_VAR` placeholders in `testdata.json`, actual values in `.env`
- **Test naming**: `TCXX - description` pattern
- **Screenshots**: taken after each major step for debugging and reporting
- **Locators**: never guess — use `getByRole`, `getByTestId`, or Playwright MCP to discover selectors
