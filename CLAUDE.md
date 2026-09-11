# Claude Code Instructions

Playwright + TypeScript QA automation framework using Page Object Model.
Read these files in order before doing anything:

1. **`.claude/agents/playwright-agent.md`** — Framework rules: POM conventions, test structure, locator priority, anti-patterns
2. **`.claude/agents/app-config.md`** — App-specific config: auth, URLs, test case tracking, run commands
3. **`.claude/agents/knowledge-layer.md`** — 6-layer knowledge check system (always check before using MCP)

## Getting Started with a New Application

1. Copy `.env.example` to `.env` and add your credentials
2. Update `src/data/allURL.ts` with your app's URLs
3. Update `src/fixtures/auth.setup.ts` with your login flow
4. Update `src/data/testdata.json` with your test data
5. Update `.claude/agents/app-config.md` with your app details
6. Use `/discover-page <url>` to explore pages and scaffold page objects
7. Use `/write-test <description>` to implement test cases

## Custom Slash Commands

- `/write-test <id or description>` — Full workflow: knowledge layers → implement → run → mark done
- `/discover-page <url or page name>` — MCP explore → document page knowledge + locators + page object
- `/next-test` — Pick up next pending test case and implement it
- `/run-test <file or feature>` — Run a test with correct project, report results
- `/heal-test <file or TC id>` — Diagnose and fix failing tests (whole spec file or specific test)
- `/tc-status` — Show test case progress by module and screen

## Project Conventions

- **Source code**: All source lives under `src/` (tests, pages, locators, fixtures, utils)
- **Imports**: Always use `src/fixtures/baseTest.ts`, never `@playwright/test` directly
- **Test data**: `import testData from '../data/testdata'` (NOT `testdata.json` directly)
- **Secrets**: Use `$ENV_VAR` placeholders in `testdata.json`, actual values in `.env`
- **Test naming**: `TCXX - description` pattern
- **Page Object Model**: Locators in `src/locators/`, page objects in `src/pages/`
- **Example files**: `src/locators/example.locators.ts`, `src/pages/example.page.ts`, `src/tests/example.spec.ts` show the expected patterns
