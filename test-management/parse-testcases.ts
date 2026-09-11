import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pass the Excel filename as an argument: npx tsx test-management/parse-testcases.ts MyTestCases.xlsx
const excelFileName = process.argv[2] || 'testcases.xlsx';
const EXCEL_PATH = path.resolve(__dirname, '..', excelFileName);
const OUTPUT_PATH = path.resolve(__dirname, 'testcases.json');
const TRACKER_PATH = path.resolve(__dirname, 'tracker.json');

// Read the Excel file
const workbook = XLSX.readFile(EXCEL_PATH);

const allTestCases: any[] = [];

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (rows.length === 0) continue;

  // Log headers for debugging
  console.log(`\nSheet: "${sheetName}" — ${rows.length} rows`);
  console.log('Columns:', Object.keys(rows[0]));

  for (const row of rows) {
    // Map columns — try common header variations
    const tc: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const k = key.toLowerCase().trim();
      if (k.includes('module')) tc.module = String(value).trim();
      else if (k.includes('function') || k.includes('screen')) tc.screen = String(value).trim();
      else if (k.includes('scenario')) tc.scenario = String(value).trim();
      else if (k.includes('user entity') || k === 'entity') tc.userEntity = String(value).trim();
      else if (k.includes('user role') || k === 'role') tc.userRole = String(value).trim();
      else if (k.includes('precondition')) tc.preconditions = String(value).trim();
      else if (k.includes('test step') || k.includes('steps')) tc.testSteps = String(value).trim();
      else if (k.includes('expected')) tc.expectedResult = String(value).trim();
      else if (k.includes('test data') || k === 'data') tc.testData = String(value).trim();
    }

    // Skip empty rows
    if (!tc.scenario && !tc.testSteps) continue;

    allTestCases.push({
      id: allTestCases.length + 1,
      sheet: sheetName,
      ...tc,
    });
  }
}

// Write parsed test cases
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allTestCases, null, 2));
console.log(`\nParsed ${allTestCases.length} test cases → ${OUTPUT_PATH}`);

// Create or update tracker (preserves existing status)
let tracker: Record<string, string> = {};
if (fs.existsSync(TRACKER_PATH)) {
  tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf-8'));
}

for (const tc of allTestCases) {
  const key = `${tc.id}`;
  if (!tracker[key]) {
    tracker[key] = 'pending';
  }
}
fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));
console.log(`Tracker updated → ${TRACKER_PATH}`);

// Print summary
const statuses = Object.values(tracker);
const done = statuses.filter(s => s === 'done').length;
const pending = statuses.filter(s => s === 'pending').length;
const skipped = statuses.filter(s => s === 'skipped').length;
console.log(`\nSummary: ${done} done, ${pending} pending, ${skipped} skipped out of ${statuses.length} total`);
