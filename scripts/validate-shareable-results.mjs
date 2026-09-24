import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const readText = (p) => fs.readFile(path.join(ROOT, p), 'utf8');
const readJson = async (p) => JSON.parse(await readText(p));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const toolFiles = [
  'data/tools.json',
  'data/growth-tools.json',
  'data/decision-tools-2026.json',
  'data/insurance-tools-2026.json',
  'data/investing-tools-2026.json',
  'data/lifestage-tools-2026.json',
  'data/policy-tools-2026.json',
];

const [scenarios, middleware, boundary, analytics, calculator, sitemap, route] = await Promise.all([
  readJson('data/indexable-calculator-scenarios.json'),
  readText('middleware.ts'),
  readText('components/CalculatorAnalyticsBoundary.tsx'),
  readText('lib/analytics.ts'),
  readText('components/Calculator.tsx'),
  readText('app/sitemap.ts'),
  readText('app/(en)/tools/scenarios/[slug]/page.tsx'),
]);

const allTools = (await Promise.all(toolFiles.map(readJson))).flat();
const liveBySlug = new Map(allTools.filter((tool) => tool.status === 'live').map((tool) => [tool.slug, tool]));

assert(Array.isArray(scenarios) && scenarios.length >= 2, 'At least two evidence-backed indexable scenarios are required.');
const slugs = new Set();
const targets = new Set();
for (const scenario of scenarios) {
  assert(!slugs.has(scenario.slug), `Duplicate scenario slug: ${scenario.slug}`);
  slugs.add(scenario.slug);
  assert(!targets.has(scenario.targetKeyword.toLowerCase()), `Duplicate scenario targetKeyword: ${scenario.targetKeyword}`);
  targets.add(scenario.targetKeyword.toLowerCase());
  assert(scenario.title.length <= 60, `Scenario title exceeds 60 chars: ${scenario.slug}`);
  assert(scenario.metaDescription.length >= 140 && scenario.metaDescription.length <= 160, `Scenario description must be 140-160 chars: ${scenario.slug}`);
  assert(typeof scenario.evidence === 'string' && /Issue #84/i.test(scenario.evidence), `Scenario must cite demand evidence: ${scenario.slug}`);
  const tool = liveBySlug.get(scenario.calculatorSlug);
  assert(Boolean(tool), `Scenario points to missing/non-live calculator: ${scenario.slug}`);
  if (tool) {
    const inputKeys = new Set(tool.inputs.map((input) => input.key));
    for (const key of Object.keys(scenario.queryValues ?? {})) {
      assert(inputKeys.has(key), `Scenario ${scenario.slug} uses unknown calculator input: ${key}`);
    }
    assert(tool.targetKeyword.toLowerCase() !== scenario.targetKeyword.toLowerCase(), `Scenario targetKeyword duplicates parent calculator: ${scenario.slug}`);
  }
}

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
assert(sitemap.includes('indexable-calculator-scenarios.json'), 'Indexable scenario pages must be sourced by sitemap.');
assert(sitemap.includes('/tools/scenarios/${scenario.slug}'), 'Scenario sitemap URLs are missing.');
assert(route.includes('alternates: withLanguageAlternates({ canonical })'), 'Scenario pages must be self-canonical.');
assert(route.includes('robots: { index: true'), 'Evidence-backed scenario pages must be explicitly indexable.');
assert(route.includes('Open pre-filled calculator'), 'Scenario pages must link to a pre-filled calculator.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Shareable-results validation passed for ${scenarios.length} indexable scenarios and the shared calculator permalink bridge.`);
