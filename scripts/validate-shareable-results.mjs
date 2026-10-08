import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const readText = (p) => fs.readFile(path.join(ROOT, p), 'utf8');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const [middleware, boundary, analytics, calculator, sitemap] = await Promise.all([
  readText('middleware.ts'),
  readText('components/CalculatorAnalyticsBoundary.tsx'),
  readText('lib/analytics.ts'),
  readText('components/Calculator.tsx'),
  readText('app/sitemap.ts'),
]);

assert(calculator.includes('<CalculatorAnalyticsBoundary'), 'All calculator variants must remain behind CalculatorAnalyticsBoundary.');
assert(boundary.includes("const SHARE_PARAM_PREFIX = 'rk_';"), 'Shared query-state prefix is missing.');
assert(boundary.includes("querySelectorAll<ShareableField>('input, select, textarea')"), 'Shared state bridge must cover calculator form fields.');
assert(boundary.includes("trackAnalyticsEvent('result_shared'"), 'Share action must emit result_shared.');
assert(analytics.includes('result_shared:'), 'Typed analytics map must define result_shared.');
assert(!analytics.includes('window.location.search'), 'Analytics page_location must not include user-entered query values.');

assert(middleware.includes("X-Robots-Tag')") || middleware.includes("X-Robots-Tag', 'noindex, follow'"), 'Parameter URLs must receive X-Robots-Tag noindex.');
// The matcher may list further shareable-scenario surfaces (the 8th CPC hub
// embeds the same calculator), so require coverage rather than an exact list.
assert(middleware.includes("'/tools/:path*'"), 'Noindex middleware must cover calculator routes.');
// Per-amount scenario pages were retired as thin variants of their calculators;
// shared results must stay parameter URLs that are never submitted.
assert(!sitemap.includes('/tools/scenarios/'), 'Scenario pages must not be submitted in the sitemap.');
assert(!sitemap.includes('rk_'), 'Shared parameter URLs must not be submitted in the sitemap.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Shareable-results validation passed: shared calculator permalinks stay noindexed and out of the sitemap.');
