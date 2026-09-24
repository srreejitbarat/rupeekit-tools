import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

const overrides = readJson('data/search-growth-overrides-2026-08-17.json');
const sourceTools = [
  ...readJson('data/tools.json'),
  ...readJson('data/growth-tools.json'),
];
const advancedRegistry = read('lib/advanced-calculators.ts');
const engine = read('lib/calculators/search-growth.ts');
const engineTests = read('lib/calculators/search-growth.test.ts');
const salaryTests = read('lib/tax/india-income-tax.test.ts');
const toolPage = read('app/(en)/tools/[slug]/page.tsx');
const toolLoader = read('lib/tools.ts');

const targets = [
  '8th-pay-commission-salary-calculator-india',
  '8th-pay-commission-arrears-calculator-india',
  '8th-pay-commission-pension-calculator-india',
  'gold-loan-calculator-india',
  'personal-loan-eligibility-calculator-india',
  'sukanya-samriddhi-yojana-calculator-india',
  'salary-in-hand-calculator-india',
];

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`❌ ${message}`);
};
const ensure = (condition, message) => {
  if (!condition) fail(message);
};

ensure(toolLoader.includes("search-growth-overrides-2026-08-17.json"), 'Runtime tool loader does not apply priority search overrides');

for (const slug of targets) {
  const source = sourceTools.find((tool) => tool.slug === slug);
  const override = overrides[slug] ?? source;
  ensure(Boolean(source), `${slug}: source tool is missing`);
  ensure(Boolean(override), `${slug}: priority governance record is missing`);
  if (!source || !override) continue;

  ensure(advancedRegistry.includes(`'${slug}'`), `${slug}: must use a dedicated advanced calculator`);
  ensure(override.formulaHold === false, `${slug}: formulaHold must be explicitly false before publish`);
  const expectedVersion = slug === '8th-pay-commission-salary-calculator-india'
    ? '2026-08-17.2'
    : '2026-08-17.1';
  ensure(override.calculationVersion === expectedVersion, `${slug}: calculationVersion is not current`);
  ensure(/^\d{4}-\d{2}-\d{2}$/.test(override.factsCheckedIso), `${slug}: factsCheckedIso must be an ISO date`);
  // Per-slug, like calculationVersion above. Only slugs whose facts were
  // actually re-verified appear here; everything else stays pinned to the
  // original review date, because a global bump would claim reviews that never
  // happened.
  const REVIEWED = {
    '8th-pay-commission-salary-calculator-india': '2026-08-22',
    'gold-loan-calculator-india': '2026-08-22',
  };
  const expectedReview = REVIEWED[slug] ?? '2026-08-17';
  ensure(
    override.lastReviewedIso === expectedReview,
    `${slug}: review date is not current (expected ${expectedReview})`
  );
  ensure(typeof override.nextReviewTrigger === 'string' && override.nextReviewTrigger.length >= 30, `${slug}: next review trigger is missing`);
  ensure(Array.isArray(override.calculationTests) && override.calculationTests.length >= 5, `${slug}: needs at least five named calculation checks`);
  ensure(Array.isArray(override.factRows) && override.factRows.length >= 5, `${slug}: needs at least five proof/fact rows`);
  ensure(Array.isArray(override.faqs) && override.faqs.length >= 5, `${slug}: needs at least five intent-matched FAQs`);
  ensure(Array.isArray(override.contentSections) && override.contentSections.length >= 3, `${slug}: needs complete research-backed content sections`);
}

for (const slug of [
  '8th-pay-commission-salary-calculator-india',
  '8th-pay-commission-arrears-calculator-india',
  '8th-pay-commission-pension-calculator-india',
  'gold-loan-calculator-india',
  'sukanya-samriddhi-yojana-calculator-india',
  'salary-in-hand-calculator-india',
]) {
  const record = overrides[slug] ?? sourceTools.find((tool) => tool.slug === slug);
  ensure(Array.isArray(record?.officialSources) && record.officialSources.length > 0, `${slug}: primary sources are missing`);
}

const requiredEngineEvidence = [
  'currentBasic * fitmentFactor',
  'calculateArrearsMonths',
  'paymentIndex - effectiveIndex',
  'currentBasicPension * revisionMultiplier',
  'if (amount <= 250_000) return 85',
  'if (amount <= 500_000) return 80',
  'assessedGoldValue * 0.75',
  'Math.max(0, totalEmiCap - existingMonthlyEmi)',
  '15 - accountAgeYears',
  '21 - accountAgeYears',
];
for (const evidence of requiredEngineEvidence) {
  ensure(engine.includes(evidence), `Priority engine is missing required rule evidence: ${evidence}`);
}

for (const boundary of ['250_000', '250_001', '500_000', '500_001']) {
  ensure(engineTests.includes(boundary), `Gold-loan boundary test is missing: ${boundary}`);
}
ensure(engineTests.includes('does not double-count'), '8th CPC DA double-counting regression test is missing');
ensure(engineTests.includes('excluding the selected payment month'), '8th CPC arrears month-boundary test is missing');
ensure(engineTests.includes('pension DR and revision-multiplier assumptions separate'), '8th CPC pension DR-separation test is missing');
ensure(engineTests.includes('15 years from SSY account opening'), 'SSY account-opening term regression test is missing');
ensure(salaryTests.includes('Rs 12 lakh annual CTC'), 'Salary Rs 12 lakh reconciliation fixture is missing');

const expectedTitles = [
  '8th Pay Commission Salary Calculator 2026 (Fitment Factor)',
  '8th Pay Commission Arrears Calculator 2026',
  '8th Pay Commission Pension Calculator 2026',
  'Gold Loan Interest Rate 2026: RBI LTV, Value & EMI',
  'Personal Loan Eligibility Calculator: Income & FOIR',
  'Sukanya Samriddhi Yojana Calculator 2026 | SSY Maturity',
  'Salary In-Hand Calculator 2026: CTC to Take-Home',
];
for (const title of expectedTitles) ensure(toolPage.includes(title), `CTR/H1 page override is missing: ${title}`);

const staleClaims = [
  ['8th-pay-commission-salary-calculator-india', /16 November 2025|expected implementation/i],
  ['gold-loan-calculator-india', /caps? gold loan LTV at 75%|many lenders offer 60-75%/i],
  ['sukanya-samriddhi-yojana-calculator-india', /matures when (the girl|she) turns 21|21\s*-\s*girlAge|generally preferred over PPF|deposits continue until she turns 15/i],
  ['salary-in-hand-calculator-india', /â‚¹|gross annual salary[^\n]{0,80}monthly/i],
  ['personal-loan-eligibility-calculator-india', /750\+ typically|guaranteed loan amount/i],
];
for (const [slug, pattern] of staleClaims) {
  ensure(!pattern.test(JSON.stringify(overrides[slug])), `${slug}: stale or overconfident claim matched ${pattern}`);
}

if (failures > 0) {
  console.error(`\nPriority search-growth validation failed with ${failures} error(s).`);
  process.exit(1);
}

console.log(`✅ Validated ${targets.length} priority search pages and calculation governance records.`);
console.log('✅ Verified RBI LTV boundaries, SSY account-opening terms, 8th CPC DA/HRA separation, arrears periods, pension DR separation, salary reconciliation and CTR copy.');
