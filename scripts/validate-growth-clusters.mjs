import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const growthTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'growth-tools.json'), 'utf8'));
const guideSource = fs.readFileSync(path.join(root, 'data', 'calculator-guides.ts'), 'utf8');

const expectedGrowthSlugs = new Set([
  'home-loan-swp-stress-test-india',
  'gratuity-2026-old-vs-new-calculator-india',
  'personal-loan-true-apr-calculator-india',
  'invest-vs-prepay-home-loan-calculator-india',
  'loan-foreclosure-net-savings-calculator-india',
  'reduce-emi-vs-tenure-calculator-india',
  '8th-pay-commission-arrears-calculator-india',
  '8th-pay-commission-pension-calculator-india',
]);

let errors = 0;
function ensure(condition, message) {
  if (!condition) {
    errors += 1;
    console.error(`FAIL: ${message}`);
  }
}

ensure(growthTools.length === 8, `Expected 8 new calculator records, found ${growthTools.length}`);
ensure(new Set(growthTools.map((tool) => tool.slug)).size === 8, 'New calculator slugs must be unique');

for (const tool of growthTools) {
  ensure(expectedGrowthSlugs.has(tool.slug), `Unexpected growth tool slug: ${tool.slug}`);
  ensure(tool.status === 'live', `${tool.slug} is not live`);
  ensure(typeof tool.lastReviewedIso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tool.lastReviewedIso), `${tool.slug} needs an ISO review date`);
  ensure(Array.isArray(tool.howToUse) && tool.howToUse.length >= 4, `${tool.slug} needs usable instructions`);
  ensure(Array.isArray(tool.assumptions) && tool.assumptions.length >= 3, `${tool.slug} needs assumptions`);
  ensure(Array.isArray(tool.commonMistakes) && tool.commonMistakes.length >= 3, `${tool.slug} needs mistake guidance`);
  ensure(Array.isArray(tool.officialSources) && tool.officialSources.length >= 1, `${tool.slug} needs a primary source`);
  for (const source of tool.officialSources ?? []) {
    ensure(/^https:\/\//.test(source.href), `${tool.slug} has a non-HTTPS source`);
  }
}

const guideSlugMatches = [...guideSource.matchAll(/\n\s+slug: '([^']+)'/g)].map((match) => match[1]);
ensure(guideSlugMatches.length === 34, `Expected 34 supporting guide records, found ${guideSlugMatches.length}`);
ensure(new Set(guideSlugMatches).size === 34, 'Supporting guide slugs must be unique');
ensure(guideSource.includes("id: 'home-loan-swp'"), 'SWP guide cluster is missing');
ensure(guideSource.includes("toolSlug: 'hra-exemption-calculator-india'"), 'HRA guide cluster is missing');
ensure(guideSource.includes("toolSlug: 'emergency-fund-calculator-india'"), 'Emergency-fund guide cluster is missing');

const toolPage = fs.readFileSync(path.join(root, 'app', '(en)', 'tools', '[slug]', 'page.tsx'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'app', 'sitemap.ts'), 'utf8');
const llms = fs.readFileSync(path.join(root, 'public', 'llms.txt'), 'utf8');
ensure(toolPage.includes('getGuidesForTool'), 'Calculator pages do not link their supporting guides');
// `allGuides` is the merged view of the original 34 calculator guides plus the
// policy guides added later. Asserting on it keeps the original intent — every
// guide reaches the sitemap — while covering both sets.
ensure(sitemap.includes('allGuides.map'), 'Supporting guides are missing from sitemap generation');
ensure(llms.includes('/tools/home-loan-swp-stress-test-india'), 'llms.txt is missing the SWP stress test');
ensure(llms.includes('/guides/can-swp-pay-home-loan-emi'), 'llms.txt is missing the SWP guide cluster');

if (errors) {
  console.error(`\nGrowth-cluster validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log('Validated 8 new calculators and 34 supporting guides.');
