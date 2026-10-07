import fs from 'node:fs';
import { liveTools, inspectTool } from './content-quality.mjs';

const tools = liveTools();
const failures = tools.flatMap((tool) => inspectTool(tool).errors.map((error) => `${tool.slug}: ${error}`));
const bannedCopy = [
  ['components/Calculator.tsx', 'Verify final numbers with your payslip, lender, tax advisor or official source.'],
  ['components/CalculatorVisualizations.tsx', 'This visual breakdown and compounding model'],
  ['app/(en)/tools/[slug]/page.tsx', 'When you want a fast estimate before making a financial or salary decision.'],
  ['components/layout/SiteLayout.tsx', "RupeeKit's in-house personal-finance research desk."],
];
for (const [path, text] of bannedCopy) {
  if (fs.readFileSync(path, 'utf8').includes(text)) failures.push(`${path}: obsolete boilerplate or unsupported claim`);
}
if (failures.length) {
  console.error('Content-quality checks failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Content-integrity checks passed for ${tools.length} composed live tools. Originality, financial accuracy and language quality still require editorial review.`);
