Write a Playwright test for: $ARGUMENTS

---

## STEP 1 — Understand the Scenario

Read the input and extract:
- **Feature / module name** (maps to file names and `test.describe`)
- **Screen** the test operates on
- **URL** to navigate to
- **User actions** (clicks, fills, selections, navigation)
- **Assertions** (what must be verified)
- **Test data** needed (inputs, expected values)

If the argument is a numeric ID, run `npm run tc:show -- <id>` to get full test case details.
If it's a description, use it directly.

---

## STEP 2 — Walk Through Knowledge Layers

Check each layer in order — do NOT skip to MCP:

1. **`test-management/page-knowledge.json`** — known interaction patterns, behavioral notes, quirks
2. **`src/locators/*.locators.ts`** — existing selectors
3. **`src/utils/*.ts`** — existing helper functions (don't reimplement)
4. **`src/pages/*.page.ts`** — existing reusable methods (also check catalog in `.claude/agents/app-config.md`)
5. **`src/tests/*.spec.ts`** — similar test patterns to reuse
6. **Playwright MCP** — only if something is genuinely missing from layers 1–5

---

## STEP 3 — Inspect the Page (only if needed)

If Layer 6 is required (new page, missing selectors), use Playwright MCP:

1. `browser_navigate` → target URL
2. `browser_snapshot` → capture accessibility tree
3. Identify selectors using priority:
   - `getByTestId()` → if `data-testid` exists
   - `getByRole()` → buttons, links, headings, textboxes
   - `getByLabel()` → form fields with labels
   - Stable CSS → `input[name="user"]`, `[data-cy="submit"]`
   - **Never** use dynamic IDs, `nth()`, or index-based selectors
4. `browser_click` / `browser_type` → validate selectors work
5. Update knowledge: add patterns to `page-knowledge.json`, locators to `src/locators/*.locators.ts`

---

## STEP 4 — Decide File Strategy

**Add to existing spec** when:
- A `src/tests/<feature>.spec.ts` already exists for this module/screen
- The new test belongs to the same `test.describe()` group

**Create new spec** when:
- No spec file exists for this module/screen

**Update existing locators/page object** when:
- Files exist but are missing needed selectors or methods

**Create new locators + page object** when:
- No files exist for this screen

---

## STEP 5 — Implement (in order)

1. **Locators** → `src/locators/<feature>.locators.ts`
2. **Page object** → `src/pages/<feature>.page.ts`
3. **Test spec** → `src/tests/<feature>.spec.ts`
4. **Test data** → `src/data/testdata.json` (if new data needed, use `$ENV_VAR` for secrets)
5. **URLs** → `src/data/allURL.ts` (if new URLs needed)

### File conventions

**Locator file** (`src/locators/<feature>.locators.ts`):
- Class with getter properties, constructor takes `Page`
- Group by screen section with comments

**Page object** (`src/pages/<feature>.page.ts`):
- Import locators from `../locators/<feature>.locators`
- Each method = one logical action
- Verify methods use `expect()` for state checks
- Include `takeScreenshot(name)` method
- All actions and assertions go in page object methods — keep specs thin

**Test spec** (`src/tests/<feature>.spec.ts`):
- Import `test, expect` from `../fixtures/baseTest` (NEVER from `@playwright/test`)
- Import `testData` from `../data/testdata` (NEVER from `testdata.json` directly)
- Import URLs from `../data/allURL`
- `test.describe('TCXX - Feature Name')` grouping
- `test.beforeEach` → instantiate page object + navigate
- Comment each step: `// Step N: Description`
- Each test should be independent
- Take screenshots after key steps

---

## STEP 6 — Run and Validate

```bash
npx playwright test src/tests/<file>.spec.ts --project=chromium
```
Use `--project=chromium-no-auth` for login tests only.

If the test fails:
- Read the error carefully
- Fix the root cause (don't just retry)
- Re-run until passing

### Common failures

| Error | Likely cause | Fix |
|-------|-------------|-----|
| Element not found / timeout | Selector is wrong or element not rendered | Inspect live DOM via MCP, update locator |
| Strict mode violation: N elements | Selector matches multiple elements | Use more specific selector or `.first()` |
| `toBeVisible` timeout on grid | Grid data still loading | Use `expect.poll()` or wait for a count/indicator |
| Navigation timeout | Staging is slow | Increase timeout, use `domcontentloaded` not `networkidle` |

---

## STEP 7 — Update Knowledge Base

If you discovered any non-obvious findings during implementation or debugging, update `test-management/page-knowledge.json`:
- New **interaction patterns** (how a widget/feature works, drag-and-drop behavior, etc.)
- New **behavioral notes** (field defaults, validation rules, button states)
- New **known quirks** (DOM vs visual order, selector traps, timing issues, workarounds)

This applies whether the finding came from MCP or from fixing test failures. If you had to debug something non-trivial, save the knowledge.

---

## STEP 8 — Mark Done & Report

1. Run `npm run tc:done -- <id>` (or `tc:skip` with reason if it can't pass)
2. Show: pass/fail status, files created/modified
3. Show current progress via `npm run tc:status`

---

## GUARDRAILS

| # | Rule |
|---|------|
| 1 | No locators in test files — use locator classes in `src/locators/` |
| 2 | No logic in spec files — all actions/assertions go in page object methods |
| 3 | No hardcoded URLs or credentials — use `src/data/allURL.ts` and `src/data/testdata.ts` |
| 4 | No `page.waitForTimeout()` — use proper waits (`toBeVisible`, `expect.poll`, `waitForLoadState`) |
| 5 | No `import { test } from '@playwright/test'` — use `from '../fixtures/baseTest'` |
| 6 | No `import testdata.json` directly — use `import testData from '../data/testdata'` |
| 7 | No guessing selectors — use MCP to inspect live DOM first |
| 8 | No duplicate page objects or locator files — check existing files first |
| 9 | No duplicate utility logic — check `src/utils/` before writing helpers |
| 10 | Tests must be independent — no shared mutable state between tests |
| 11 | Screenshots after key steps — required for debugging |
| 12 | Always update `page-knowledge.json` with non-obvious findings from debugging or MCP — save knowledge for future tests |
