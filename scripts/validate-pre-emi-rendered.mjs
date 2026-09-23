import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlPath = path.join(root, '.next/server/app/tools/pre-emi-calculator-india.html');
const html = fs.readFileSync(htmlPath, 'utf8');
if ((html.match(/<main(?:\s|>)/g) ?? []).length !== 1) {
  throw new Error('The pre-EMI page must use the single main landmark provided by the root layout.');
}
const required = [
  'id="pre-emi-planner"',
  'id="pe-loanAmount"',
  'First loan payment',
  'Download PDF report',
  'Download full CSV',
  'Where will each plan leave you?',
];
const missing = required.filter(marker => !html.includes(marker));
if (missing.length) {
  console.error('The dedicated pre-EMI planner was not prerendered correctly. Check for a collision with app/tools/[slug].');
  console.error('Missing:', missing.join(', '));
  process.exit(1);
}
const trace = JSON.parse(fs.readFileSync(path.join(root, '.next/server/app/api/pre-emi/report/route.js.nft.json'), 'utf8'));
for (const font of ['RupeeKitReport-Regular.ttf', 'RupeeKitReport-Bold.ttf']) {
  if (!trace.files.some(file => file.endsWith(`/public/fonts/${font}`))) {
    throw new Error(`PDF runtime tracing is missing ${font}`);
  }
}
console.log('Dedicated pre-EMI planner HTML and Node PDF font tracing verified.');
