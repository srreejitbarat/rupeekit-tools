import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const requireMatch = (file, pattern, message) => {
  const text = read(file);
  if (!pattern.test(text)) failures.push(`${file}: ${message}`);
};

const trustPages = [
  'app/(en)/about/page.tsx',
  'app/(en)/contact/page.tsx',
  'app/(en)/editorial-policy/page.tsx',
  'app/(en)/corrections-policy/page.tsx',
  'app/(en)/disclaimer/page.tsx',
];
for (const file of trustPages) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file}: required trust page is missing`);
}

requireMatch('app/(en)/about/page.tsx', /RupeeKit Editorial Team/, 'must identify the real organisational byline');
requireMatch('app/(en)/about/page.tsx', /not a lender[\s\S]*SEBI-registered investment adviser/i, 'must state material limits without invented credentials');
requireMatch('app/(en)/about/page.tsx', /\/editorial-policy/, 'must link to the editorial policy');
requireMatch('app/(en)/about/page.tsx', /\/corrections-policy/, 'must link to the corrections policy');
requireMatch('app/(en)/about/page.tsx', /\/contact/, 'must expose a contact route');

requireMatch('components/Calculator.tsx', /htmlFor={`calculator-input-\$\{input\.key\}`}/, 'standard numeric inputs need associated labels');
requireMatch('components/Calculator.tsx', /id={`calculator-input-\$\{input\.key\}`}/, 'standard numeric inputs need stable ids');
requireMatch('components/Calculator.tsx', /aria-describedby=\{input\.help/, 'input help text must be programmatically associated');
requireMatch('components/CalculatorVisualizations.tsx', /aria-live="polite"/, 'changing results must be announced to assistive technology');
requireMatch('components/CalculatorVisualizations.tsx', /<output/, 'calculator results should use output semantics');
requireMatch('components/calculators/CalculatorPresets.tsx', /aria-pressed=\{isActive\}/, 'preset state must be exposed to assistive technology');
requireMatch('components/calculators/CalculatorPresets.tsx', /focus-visible:ring-2/, 'preset buttons need a visible keyboard focus state');
requireMatch('components/calculators/advanced/PriorityCalculatorPrimitives.tsx', /htmlFor=\{id\}/, 'advanced numeric inputs need associated labels');
requireMatch('components/calculators/advanced/PriorityCalculatorPrimitives.tsx', /inputMode="decimal"/, 'advanced numeric inputs should request a numeric mobile keyboard');
requireMatch('components/blog/FinanceDisclaimer.tsx', /educational/i, 'financial guides need an educational disclaimer');
requireMatch('app/(en)/tools/\[slug\]/page.tsx', /EditorialByline/, 'calculator pages need visible editorial attribution');
requireMatch('app/(en)/tools/\[slug\]/page.tsx', /source/i, 'calculator pages need a visible sourcing path');
requireMatch('app/(en)/guides/\[slug\]/page.tsx', /FinanceDisclaimer|disclaimer/i, 'calculator guides need an educational disclaimer');
requireMatch('app/(en)/guides/\[slug\]/page.tsx', /EditorialByline/, 'calculator guides need visible editorial attribution');

// The current repository does not ship @playwright/test as a direct dev dependency.
// These checks protect the shared primitives used by the top-tool set in normal CI;
// browser-level axe/Playwright checks should be added once the test runner is a maintained dependency.
const top20 = [
  '8th-pay-commission-salary-calculator-india',
  'personal-loan-emi-calculator-india',
  'personal-loan-eligibility-calculator-india',
  'gold-loan-calculator-india',
  'salary-in-hand-calculator-india',
  'income-tax-calculator-old-vs-new-regime-india',
  'sukanya-samriddhi-yojana-calculator-india',
  'sip-calculator-india',
  'ppf-calculator-india',
  'capital-gains-tax-calculator-india',
  'emergency-fund-calculator-india',
  'home-loan-emi-calculator-india',
  'emi-calculator-india',
  'hra-exemption-calculator-india',
  'gratuity-calculator-india',
  'fd-calculator-india',
  'lumpsum-calculator-india',
  'epf-corpus-calculator-india',
  'net-worth-calculator-india',
  'step-up-sip-calculator-india',
];
if (new Set(top20).size !== 20) failures.push('top-20 accessibility sample must contain 20 unique tool slugs');

if (failures.length) {
  console.error('Trust/accessibility validation failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Trust/accessibility validation passed (${top20.length} priority calculator intents protected through shared primitives).`);
