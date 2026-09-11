Pick up and implement the next pending test case(s).

**Usage**: `/next-test` or `/next-test <count>`
- No argument → implement 1 test case
- With number → implement that many test cases (e.g., `/next-test 5`)

Argument: $ARGUMENTS

## Workflow

1. **Determine count**: Parse the argument as a number. Default to 1 if empty or not a number.

2. **Loop** for each test case (up to the requested count):
   a. Run `npm run tc:next` to get the next pending test case
   b. If no pending test cases remain, stop the loop and report completion
   c. Execute the full test-writing workflow from `.claude/agents/knowledge-layer.md` → "Test Case Workflow" section:
      - Parse the test case details
      - Walk through knowledge layers
      - Decide file strategy (group tests into the same spec file when they share a module)
      - Implement locators → page object → test spec
      - Run and validate the test
      - Mark done on success via `npm run tc:done -- <id>`
   d. If a test fails after reasonable attempts, mark it skipped via `npm run tc:skip -- <id>`, note the failure reason, and continue to the next one

3. **Final report**:
   - Summary: how many implemented, passed, failed/skipped
   - List of test case IDs and their outcomes
   - Show current progress via `npm run tc:status`
