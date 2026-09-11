import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTCASES_PATH = path.resolve(__dirname, 'testcases.json');
const TRACKER_PATH = path.resolve(__dirname, 'tracker.json');

const testcases = JSON.parse(fs.readFileSync(TESTCASES_PATH, 'utf-8'));
const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf-8'));

const action = process.argv[2]; // "next", "show <id>", "done <id>", "skip <id>", "status"

function formatPrompt(tc: any): string {
  return `Module: ${tc.module}
Function/Screen Name: ${tc.screen}
Scenario name: ${tc.scenario}
User Entity: ${tc.userEntity}
User Role: ${tc.userRole}
Preconditions: ${tc.preconditions}
Test Steps:
${tc.testSteps.replace(/\r\n/g, '\n')}
Expected Result: ${tc.expectedResult}
Test Data: ${tc.testData}`;
}

function showStatus() {
  const statuses = Object.values(tracker) as string[];
  const done = statuses.filter(s => s === 'done').length;
  const pending = statuses.filter(s => s === 'pending').length;
  const skipped = statuses.filter(s => s === 'skipped').length;
  console.log(`\n📊 Test Case Tracker`);
  console.log(`   Done:    ${done}`);
  console.log(`   Pending: ${pending}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total:   ${statuses.length}\n`);

  // Group by module
  const byModule: Record<string, { done: number; pending: number; skipped: number; total: number }> = {};
  for (const tc of testcases) {
    const mod = tc.module || 'Unknown';
    if (!byModule[mod]) byModule[mod] = { done: 0, pending: 0, skipped: 0, total: 0 };
    byModule[mod].total++;
    const status = tracker[String(tc.id)] || 'pending';
    if (status === 'done') byModule[mod].done++;
    else if (status === 'skipped') byModule[mod].skipped++;
    else byModule[mod].pending++;
  }
  console.log('   Module breakdown:');
  for (const [mod, counts] of Object.entries(byModule)) {
    console.log(`   ${mod}: ${counts.done}/${counts.total} done, ${counts.pending} pending, ${counts.skipped} skipped`);
  }

  // Group by module > screen
  const byScreen: Record<string, Record<string, { done: number; pending: number; skipped: number; total: number }>> = {};
  for (const tc of testcases) {
    const mod = tc.module || 'Unknown';
    const screen = tc.screen || 'Unknown';
    if (!byScreen[mod]) byScreen[mod] = {};
    if (!byScreen[mod][screen]) byScreen[mod][screen] = { done: 0, pending: 0, skipped: 0, total: 0 };
    byScreen[mod][screen].total++;
    const status = tracker[String(tc.id)] || 'pending';
    if (status === 'done') byScreen[mod][screen].done++;
    else if (status === 'skipped') byScreen[mod][screen].skipped++;
    else byScreen[mod][screen].pending++;
  }
  console.log('\n   Screen breakdown:');
  for (const [mod, screens] of Object.entries(byScreen)) {
    console.log(`   [${mod}]`);
    for (const [screen, counts] of Object.entries(screens)) {
      const statusIcon = counts.pending === 0 ? '✅' : counts.done > 0 ? '🔶' : '⬜';
      console.log(`     ${statusIcon} ${screen}: ${counts.done}/${counts.total} done, ${counts.pending} pending, ${counts.skipped} skipped`);
    }
  }
}

function markDone(id: string) {
  tracker[id] = 'done';
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));
  console.log(`Marked test case #${id} as done.`);
}

function markSkip(id: string) {
  tracker[id] = 'skipped';
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));
  console.log(`Marked test case #${id} as skipped.`);
}

if (action === 'status') {
  showStatus();
} else if (action === 'done') {
  const id = process.argv[3];
  if (id) markDone(id);
  else console.log('Usage: next-testcase.ts done <id>');
} else if (action === 'skip') {
  const id = process.argv[3];
  if (id) markSkip(id);
  else console.log('Usage: next-testcase.ts skip <id>');
} else if (action === 'show') {
  const id = process.argv[3];
  const tc = testcases.find((t: any) => String(t.id) === id);
  if (tc) {
    console.log(`\n--- Test Case #${tc.id} [${tracker[String(tc.id)]}] ---\n`);
    console.log(formatPrompt(tc));
  } else {
    console.log(`Test case #${id} not found.`);
  }
} else {
  // Default: show next pending
  const next = testcases.find((tc: any) => tracker[String(tc.id)] === 'pending');
  if (next) {
    console.log(`\n--- Next Pending: Test Case #${next.id} ---\n`);
    console.log(formatPrompt(next));
    console.log(`\n--- Copy the above into Claude Code to automate this test case ---`);
    console.log(`--- After done, run: npx tsx test-management/next-testcase.ts done ${next.id} ---\n`);
  } else {
    console.log('All test cases are done or skipped!');
  }
}
