import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'data/day18-financial-updates.ts');
const sitemapPath = path.join(root, 'app/sitemap.ts');
const hubPath = path.join(root, 'components/updates/FinancialUpdatesClient.tsx');
const backlinkPath = path.join(root, 'components/seo/LatestOfficialUpdateLink.tsx');

const expectedSlugs = [
  '8th-cpc-chandigarh-visit-september-2026',
  'rbi-repo-rate-5-25-august-2026',
  'small-savings-rates-july-september-2026',
  'income-tax-itr7-utility-available-august-2026',
  'epfo-vishwas-amnesty-2026-live',
];

for (const file of [dataPath, sitemapPath, hubPath, backlinkPath]) {
  if (!fs.existsSync(file)) throw new Error(`Missing required issue #73 file: ${path.relative(root, file)}`);
}

const data = fs.readFileSync(dataPath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const hub = fs.readFileSync(hubPath, 'utf8');
const backlinks = fs.readFileSync(backlinkPath, 'utf8');

for (const slug of expectedSlugs) {
  if (!data.includes(`slug: '${slug}'`)) throw new Error(`Missing update data for ${slug}`);
  const route = path.join(root, `app/(en)/financial-updates/${slug}/page.tsx`);
  if (!fs.existsSync(route)) throw new Error(`Missing static route for ${slug}`);
  const routeSource = fs.readFileSync(route, 'utf8');
  if (!routeSource.includes(slug)) throw new Error(`Route ${slug} is not wired to its data slug`);
}

const slugMatches = [...data.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]);
if (new Set(slugMatches).size !== slugMatches.length) throw new Error('Duplicate Day 18 update slug detected');

for (const required of [
  "publishedDate: '2026-08-20'",
  "lastReviewed: '20 August 2026'",
  'officialSources:',
  'relatedRupeeKitLinks:',
  "status: 'official'",
]) {
  if (!data.includes(required)) throw new Error(`Day 18 update data missing required marker: ${required}`);
}

if (!/https:\/\/(8cpc\.gov\.in|www\.rbi\.org\.in|dea\.gov\.in|www\.indiapost\.gov\.in|www\.incometax\.gov\.in|www\.pib\.gov\.in|www\.epfindia\.gov\.in)/.test(data)) {
  throw new Error('Expected primary Government source domains were not found');
}

if (!sitemap.includes("day18FinancialUpdates") || !sitemap.includes('allFinancialUpdates')) {
  throw new Error('Day 18 updates are not included in sitemap generation');
}
if (!hub.includes('day18FinancialUpdates') || !hub.includes('allFinancialUpdates')) {
  throw new Error('Day 18 updates are not included in the financial-updates hub');
}

const requiredToolPaths = [
  '/tools/8th-pay-commission-salary-calculator-india',
  '/tools/home-loan-emi-calculator-india',
  '/tools/ppf-calculator-india',
  '/tools/income-tax-calculator-old-vs-new-regime-india',
  '/tools/epf-corpus-calculator-india',
];
for (const toolPath of requiredToolPaths) {
  if (!backlinks.includes(toolPath)) throw new Error(`Missing calculator-to-update backlink for ${toolPath}`);
}

console.log(`✓ Issue #73 financial-update batch validated (${expectedSlugs.length} new update pages)`);
