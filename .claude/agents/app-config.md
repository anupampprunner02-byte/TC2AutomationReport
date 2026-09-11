# App Configuration

> **This is the ONLY file you need to edit when adopting this framework for a new application.**

---

## Application

- **Name**: [Your Application Name]
- **Environment**: [Staging / Production]
- **Base URL**: Defined in `src/data/allURL.ts`

---

## Auth Details

- **Method**: [Describe your login flow, e.g. "Standard email + password", "Two-step with OTP", "SSO"]
- **Env vars**: `LOGIN_EMAIL`, `LOGIN_PASSWORD` in `.env` (see `.env.example`)
- **Storage state file**: `src/fixtures/.auth/user.json`

---

## Setup Steps for a New Application

1. Copy `.env.example` to `.env` and fill in real credentials
2. Update `src/data/allURL.ts` with your application's URLs
3. Update `src/fixtures/auth.setup.ts` with your login page's selectors and flow
4. Update `src/data/testdata.json` with your test data (use `$ENV_VAR` for secrets)
5. Run `npm run tc:parse` if you have a test case Excel file, otherwise add test cases to `test-management/testcases.json` manually
6. Use `/discover-page <url>` to explore pages and scaffold page objects
7. Use `/write-test <id or description>` to implement test cases

---

## Test Case Source

- **Source file**: *(optional)* An Excel file with test cases — run `npm run tc:parse` to import
- **Parsed output**: `test-management/testcases.json`
- **Status tracker**: `test-management/tracker.json`

---

## Pages & URLs

Defined in `src/data/allURL.ts` — update this file with your application's routes.

---

## Existing Page Objects & Key Methods

Once page objects are created via `/discover-page`, document key reusable methods here:

| Method | Page | Description |
|--------|------|-------------|
| *(add entries as you build out the framework)* | | |
