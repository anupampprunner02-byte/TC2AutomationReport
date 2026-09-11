Discover and document the page: $ARGUMENTS

## Workflow

1. **Navigate** to the target page using Playwright MCP `browser_navigate`. If the argument is a URL, use it directly. If it's a page name, look up the URL in `src/data/allURL.ts`.

2. **Take a snapshot** using MCP `browser_snapshot` to get the full accessibility tree and DOM structure.

3. **Identify all interactive elements**: buttons, inputs, dropdowns, links, grids, tabs, modals, etc.

4. **Test key interactions** using MCP tools (`browser_click`, `browser_fill_form`, `browser_type`) to validate selectors and understand widget behavior.

5. **Update the knowledge base**:
   - Add/update entry in `test-management/page-knowledge.json` with:
     - `interaction_patterns` for complex widgets
     - `behavioral_notes` for app-specific behavior
     - `known_quirks` for timing or rendering issues found
   - Add new locators to `src/locators/<feature>.locators.ts` (create file if needed)
   - Add new methods to `src/pages/<feature>.page.ts` (create file if needed)

6. **Report**: Summary of elements found, patterns documented, and files created/updated.
