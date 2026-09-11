# Knowledge Layer System

> Check what you already know before reaching for MCP. Each layer builds on the previous one.

---

## Layer 1: Page Knowledge Base — `test-management/page-knowledge.json`

The primary knowledge base. Contains per-page entries with three sections:

- **interaction_patterns** — How to operate complex widgets (date pickers, autocompletes, custom dropdowns, data grids). Copy these patterns directly into page object methods.
- **behavioral_notes** — What the app does in specific scenarios (which fields are copied on duplicate, when buttons are enabled/disabled, default values, etc.)
- **known_quirks** — Timing issues, race conditions, and their proven fixes.

**Rule**: If a page or scenario is already documented here, **do not use MCP** — use the knowledge directly.

---

## Layer 2: Locator Files — `src/locators/*.locators.ts`

The source of truth for element selectors. Before defining any new locator:
1. Check if a locator file exists for the target page
2. Check if the needed selector is already defined
3. Only create new locators if genuinely missing

---

## Layer 3: Utility Files — `src/utils/*.ts`

Shared helper functions used across all page objects and tests. **Always check here before writing any helper logic** — if a similar function exists, use it.

| File | Functions | Purpose |
|------|-----------|---------|
| `waitUtils.ts` | `waitForElementVisible`, `waitForPageLoad`, `waitForElementClickable` | Wait strategies — use instead of `waitForTimeout` |
| `assertUtils.ts` | `expectVisible` | Assert visibility + auto-screenshot |
| `screenshotUtils.ts` | `takeScreenshot` | Screenshot with timestamp, returns file path |
| `elementUtils.ts` | `safeClick`, `safeFill`, `getText` | Safe interactions with auto-wait |
| `timeUtils.ts` | `getTimestamp` | Formatted timestamp (YYYYMMdd_HHmmss) |

---

## Layer 4: Page Object Files — `src/pages/*.page.ts`

The source of truth for reusable interaction logic. Before writing any new method:
1. Check if a page object exists for the target page
2. Check if the needed method (or a similar one) already exists
3. Check app-specific method catalog in `.claude/agents/app-config.md`
4. Check `src/utils/*.ts` — don't reimplement what's already in utils

---

## Layer 5: Existing Test Specs — `src/tests/*.spec.ts`

Before writing a new test, check how similar scenarios were structured:
- Serial vs parallel mode setup
- `beforeEach` navigation patterns
- Screenshot naming conventions
- Count-based assertions (e.g., polling for grid row count changes)

---

## Layer 6: Playwright MCP (Last Resort)

Use MCP only when something is genuinely missing from Layers 1–5.

**When to use:**
- A page has no entry in `page-knowledge.json`
- A needed selector doesn't exist in any locator file
- A widget's interaction pattern is unknown

**After discovering via MCP or during test debugging, always update the knowledge base:**
1. Add new **interaction patterns**, **behavioral notes**, or **known quirks** to `page-knowledge.json`
2. Add new **locators** to the appropriate `src/locators/*.locators.ts`
3. Add new **methods** to the appropriate `src/pages/*.page.ts`

> **Important**: Knowledge updates are NOT just for MCP discoveries. Any non-obvious finding during test implementation — selector gotchas, DOM behavior quirks, timing issues, validation rules — must be recorded in `page-knowledge.json` so future tests benefit.

---

## `page-knowledge.json` Schema

```json
{
  "_meta": {
    "description": "Page interaction knowledge base",
    "last_updated": "YYYY-MM-DD"
  },
  "page_name": {
    "interaction_patterns": {
      "widget_name": {
        "description": "What this widget is",
        "steps": ["step 1", "step 2"],
        "code_snippet": "optional Playwright code"
      }
    },
    "behavioral_notes": {
      "scenario_name": "description of behavior"
    },
    "known_quirks": {
      "quirk_name": {
        "problem": "what goes wrong",
        "fix": "proven workaround"
      }
    }
  }
}
```

---

## Test Case Workflow

> **This workflow applies ANY time you write, create, implement, or add a test — whether via slash command or natural language.**

### 1. Parse Input
- If given a numeric ID → run `npm run tc:show -- <id>` to get full test case details
- If given a description → use it directly
- If asked for "next" → run `npm run tc:next` to get the next pending test case
- If asked for "next N" → implement each one before fetching the next
- If no pending test cases remain, report completion and show status

**Batch mode**: Group tests that share the same module into the same spec file. After each test case: run it, mark done/skipped, then move to the next. If a test fails after reasonable fix attempts, mark it skipped and continue.

### 2. Identify Module & Screen
- Determine which module/feature the test belongs to
- Determine which screen/page the test operates on

### 3. Walk Through Knowledge Layers
Check each layer in order — do NOT skip to MCP:
- **Layer 1**: `page-knowledge.json` — known patterns, behaviors, quirks
- **Layer 2**: `src/locators/*.locators.ts` — existing selectors
- **Layer 3**: `src/utils/*.ts` — existing helpers
- **Layer 4**: `src/pages/*.page.ts` — existing reusable methods
- **Layer 5**: `src/tests/*.spec.ts` — similar test patterns
- **Layer 6**: Playwright MCP — only if genuinely missing

### 4. Decide File Strategy
- **Add to existing spec** if one covers this module/screen
- **Create new spec** if this is a new module/screen
- **Update existing page object/locators** if missing needed methods/selectors
- **Create new page object + locators** if none exist for this screen

### 5. Implement (in order)
1. Utils (if new shared helper needed — check existing first)
2. Locators → `src/locators/<feature>.locators.ts`
3. Page object methods → `src/pages/<feature>.page.ts`
4. Test spec → `src/tests/<feature>.spec.ts`
5. Test data → `src/data/testdata.json` (if needed)
6. URLs → `src/data/allURL.ts` (if needed)

### 6. Run and Validate
- Run: `npx playwright test src/tests/<file>.spec.ts --project=chromium` (or `chromium-no-auth` for login tests)
- If test fails, read the error, fix, and re-run

### 7. Update Knowledge Base
After implementing and passing a test, **always** check if you discovered anything that should be saved for future tests:
- **New interaction patterns** (e.g., how drag-and-drop works, how a widget behaves) → add to `page-knowledge.json` under `interaction_patterns`
- **New behavioral notes** (e.g., field defaults, button states, validation rules) → add to `page-knowledge.json` under `behavioral_notes`
- **New quirks or gotchas** (e.g., DOM order vs visual order, selector traps, timing issues) → add to `page-knowledge.json` under `known_quirks`

This applies whether the finding came from MCP exploration OR from debugging test failures during implementation. If you had to fix a non-obvious issue to make a test pass, that fix belongs in page-knowledge.

### 8. Mark Done & Report
- Run `npm run tc:done -- <id>` (or `tc:skip` if failed)
- Show pass/fail status, what was created/modified
- For batch runs: show final summary with IDs and outcomes
- Show current progress via `npm run tc:status`
