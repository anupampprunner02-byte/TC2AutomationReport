Diagnose and fix failing Playwright test(s): $ARGUMENTS

Read `.claude/agents/test-healer.md` for the full healing methodology, then follow this workflow.

---

## STEP 1 — Resolve the Target

Parse `$ARGUMENTS` to determine what to heal:

- **Spec file** (e.g., `ag-grid-filter`, `login.spec.ts`) → run ALL tests in that file, heal every failure
- **Specific test** (e.g., `TC34`, `TC34 - Filter icon available`) → run only that test with `-g "TC34"`, heal that one failure
- **File + test** (e.g., `ag-grid-filter TC34`) → run that specific test from that file

**Project selection:**
- `login.spec.ts` → `--project=chromium-no-auth`
- Everything else → `--project=chromium`

---

## STEP 2 — Run and Capture Failures

```bash
# Whole spec file
npx playwright test src/tests/<file>.spec.ts --project=chromium --reporter=list

# Specific test by title
npx playwright test src/tests/<file>.spec.ts -g "TCXX" --project=chromium --reporter=list
```

If all tests pass, report success and stop.

---

## STEP 3 — For Each Failure, Diagnose

For each failing test:

1. **Read the error** — identify the line, assertion, and error type
2. **Check knowledge layers first** (before MCP):
   - `test-management/page-knowledge.json` — is this a known quirk?
   - `src/locators/*.locators.ts` — is the locator outdated?
   - `src/pages/*.page.ts` — is the page method wrong?
3. **Use MCP only if needed** — when the error is unclear or the selector needs live inspection:
   - `browser_navigate` → target URL
   - `browser_snapshot` → compare actual DOM with what the test expects
   - `browser_click` / `browser_type` → verify interactions manually

### Common failure patterns

| Error Pattern | Likely Cause | Fix Location |
|---------------|-------------|--------------|
| `Timeout waiting for toBeVisible` | Selector wrong or element not rendered | `src/locators/*.locators.ts` |
| `strict mode violation: N elements` | Selector matches multiple elements | Locator needs to be more specific |
| `expect(received).toBe(expected)` | App behavior changed or test data wrong | Page object or `testdata.json` |
| `Timeout waiting for toBeEnabled` | Element not interactive yet | Wait strategy in page object |
| `page.goto: net::ERR_*` | URL wrong or staging down | `src/data/allURL.ts` or retry later |
| Flaky (passes sometimes) | Race condition or data dependency | Add proper waits, use `expect.poll()` |

---

## STEP 4 — Fix in the Correct Layer

Apply fixes where they belong:
- **Wrong selector** → `src/locators/<feature>.locators.ts`
- **Wrong interaction/wait logic** → `src/pages/<feature>.page.ts`
- **Wrong assertion** → page object verify method
- **Wrong test data** → `src/data/testdata.json`
- **Wrong URL** → `src/data/allURL.ts`
- **Wrong test flow** → `src/tests/<feature>.spec.ts` (last resort)

---

## STEP 5 — Re-run and Verify

After fixing:
1. Re-run the specific failing test to confirm the fix
2. If healing a whole spec file, re-run the full file to check for regressions
3. Repeat Steps 3–5 for remaining failures

---

## STEP 6 — Update Knowledge Base

If you discovered anything non-obvious during diagnosis, update `test-management/page-knowledge.json`:
- New **interaction patterns** → `interaction_patterns`
- New **behavioral notes** → `behavioral_notes`
- New **known quirks/workarounds** → `known_quirks`

---

## STEP 7 — Report

For each test that was healed:
- **Test**: TC ID and name
- **Root cause**: What was wrong
- **Fix**: What was changed and in which file
- **Status**: Pass/fail after fix

If a test cannot be fixed after 3+ attempts and you believe it's an app bug (not a test issue), mark it with `test.fixme()` and document why.

---

## GUARDRAILS

| # | Rule |
|---|------|
| 1 | No locators in test files — fix in `src/locators/` |
| 2 | No logic in spec files — fix in `src/pages/` |
| 3 | No `page.waitForTimeout()` — use proper waits |
| 4 | No guessing selectors — use MCP to inspect live DOM |
| 5 | Always update `page-knowledge.json` with non-obvious findings |
| 6 | Import rules: `test/expect` from `baseTest`, `testData` from `../data/testdata`, URLs from `allURL` |
