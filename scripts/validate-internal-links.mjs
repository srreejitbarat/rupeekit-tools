import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE_URL = 'https://www.rupeekit.co.in';
const toolFiles = [
  'tools.json',
  'growth-tools.json',
  'decision-tools-2026.json',
  'insurance-tools-2026.json',
  'investing-tools-2026.json',
  'lifestage-tools-2026.json',
  'policy-tools-2026.json',
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function fail(message) {
  console.error(`❌ ${message}`);
  failures += 1;
}

function walk(dir, extensions = new Set(['.ts', '.tsx', '.js', '.mjs'])) {
  const absolute = path.join(ROOT, dir);
  if (!fs.existsSync(absolute)) return [];
  const out = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(rel, extensions));
    else if (extensions.has(path.extname(entry.name))) out.push(rel);
  }
  return out;
}

function extractSetMembers(source, constantName) {
  const match = source.match(new RegExp(`export const ${constantName} = new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  if (!match) return new Set();
  return new Set([...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]));
}

function extractBlogSlugs() {
  const slugs = new Set();
  for (const rel of fs.readdirSync(path.join(ROOT, 'data'))) {
    if (!rel.endsWith('.ts')) continue;
    const source = read(path.join('data', rel));
    if (!source.includes('BlogPost') && !source.includes('relatedCalculators')) continue;
    for (const match of source.matchAll(/(?:"slug"|slug)\s*:\s*['"]([^'"]+)['"]/g)) {
      slugs.add(match[1]);
    }
  }
  return slugs;
}

function extractSampleSlugs(source) {
  const slugs = [];
  for (const entry of source.matchAll(/\{([\s\S]*?)\n\s*\},?/g)) {
    if (!/status\s*:\s*['"]sample['"]/.test(entry[1])) continue;
    const slug = entry[1].match(/slug\s*:\s*['"]([^'"]+)['"]/)?.[1];
    if (slug) slugs.push(slug);
  }
  return slugs;
}

function addInbound(target, source, kind) {
  if (!inbound.has(target)) inbound.set(target, []);
  inbound.get(target).push({ source, kind });
}

let failures = 0;
const consolidatedSource = read('lib/consolidated-routes.ts');
const consolidatedTools = extractSetMembers(consolidatedSource, 'CONSOLIDATED_TOOL_SLUGS');
const consolidatedBlogs = extractSetMembers(consolidatedSource, 'CONSOLIDATED_BLOG_SLUGS');

const tools = toolFiles.flatMap((fileName) =>
  JSON.parse(read(path.join('data', fileName))).map((tool) => ({ ...tool, _file: fileName }))
);
const liveTools = tools.filter((tool) => tool.status === 'live' && !consolidatedTools.has(tool.slug));
const liveToolBySlug = new Map(liveTools.map((tool) => [tool.slug, tool]));
const blogSlugs = new Set([...extractBlogSlugs()].filter((slug) => !consolidatedBlogs.has(slug)));
const issue79Related = JSON.parse(read('data/issue-79-related-overrides.json'));

const inbound = new Map();

for (const tool of liveTools) addInbound(`/tools/${tool.slug}`, '/tools', 'hub');
for (const slug of blogSlugs) addInbound(`/blog/${slug}`, '/blog', 'hub');

// Each live calculator should be rendered inside exactly one orienting cluster
// hub. That is stronger than a flat directory link because the hub explains when
// to use the tool and what to compare next. The hub route only renders a tool
// whose category is claimed by a cluster, so the inbound link is credited from
// the same category mapping rather than assumed for every live tool.
const clusterCategories = new Map();
for (const block of read('data/tool-clusters.ts').matchAll(/slug: '([a-z0-9-]+)',[\s\S]*?sourceCategories: \[([^\]]*)\]/g)) {
  const categories = [...block[2].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  for (const category of categories) {
    if (clusterCategories.has(category)) {
      fail(`Category ${category} is claimed by more than one cluster hub: ${clusterCategories.get(category)} and ${block[1]}`);
      continue;
    }
    clusterCategories.set(category, block[1]);
  }
}
for (const tool of liveTools) {
  const cluster = clusterCategories.get(tool.category);
  if (!cluster) {
    fail(`Live tool has no cluster hub for its category: /tools/${tool.slug} (${tool.category})`);
    continue;
  }
  addInbound(`/tools/${tool.slug}`, `/tool-hubs/${cluster}`, 'cluster-hub');
}

for (const tool of liveTools) {
  for (const relatedSlug of tool.related || []) {
    if (!liveToolBySlug.has(relatedSlug)) continue;
    addInbound(`/tools/${relatedSlug}`, `/tools/${tool.slug}`, 'related-tool');
  }
  for (const relatedSlug of issue79Related[tool.slug] || []) {
    if (!liveToolBySlug.has(relatedSlug)) {
      fail(`Issue 79 related override points to a non-live tool: ${tool.slug} -> ${relatedSlug}`);
      continue;
    }
    addInbound(`/tools/${relatedSlug}`, `/tools/${tool.slug}`, 'issue79-contextual');
  }
}

for (const rel of fs.readdirSync(path.join(ROOT, 'data'))) {
  if (!rel.endsWith('.ts')) continue;
  const source = read(path.join('data', rel));
  for (const arrayMatch of source.matchAll(/relatedCalculators\s*:\s*\[([\s\S]*?)\]/g)) {
    for (const slugMatch of arrayMatch[1].matchAll(/['"]([^'"]+)['"]/g)) {
      const slug = slugMatch[1];
      if (liveToolBySlug.has(slug)) addInbound(`/tools/${slug}`, `data/${rel}`, 'blog-related-calculator');
    }
  }
}

for (const rel of [...walk('app'), ...walk('components'), ...walk('data')]) {
  const source = read(rel);
  for (const match of source.matchAll(/['"]\/(tools|blog)\/([a-z0-9-]+)['"]/g)) {
    const target = `/${match[1]}/${match[2]}`;
    if (target === '/tools/' || target === '/blog/') continue;
    addInbound(target, rel, 'in-body');
  }
}

for (const tool of liveTools) {
  const target = `/tools/${tool.slug}`;
  const refs = inbound.get(target) || [];
  if (refs.length === 0) fail(`Orphan live tool: ${target}`);
  const contextual = refs.filter((ref) => ref.kind !== 'hub');
  if (contextual.length === 0) fail(`Live tool has no contextual inbound link: ${target}`);
}
for (const slug of blogSlugs) {
  const target = `/blog/${slug}`;
  if ((inbound.get(target) || []).length === 0) fail(`Orphan blog page: ${target}`);
}

const namedDiscoveryTargets = [
  'loan-foreclosure-net-savings-calculator-india',
  'personal-loan-true-apr-calculator-india',
  'reduce-emi-vs-tenure-calculator-india',
  'home-affordability-calculator-india',
];
for (const slug of namedDiscoveryTargets) {
  const refs = (inbound.get(`/tools/${slug}`) || []).filter((ref) => ref.kind === 'issue79-contextual');
  if (refs.length < 2) fail(`${slug} needs at least 2 explicit issue-79 contextual inbound links; found ${refs.length}`);
}

const sitemapSource = read('app/sitemap.ts');
for (const required of ['getLiveTools()', 'toolClusters.map', 'blogPosts.map', 'indexableFinancialUpdates.map', 'indexableGovernmentSalaryUpdates']) {
  if (!sitemapSource.includes(required)) fail(`app/sitemap.ts is missing expected route source: ${required}`);
}
for (const slug of consolidatedTools) {
  if (liveToolBySlug.has(slug)) fail(`Consolidated tool still treated as live: ${slug}`);
}
for (const slug of consolidatedBlogs) {
  if (blogSlugs.has(slug)) fail(`Consolidated blog still treated as live: ${slug}`);
}

const clusterSource = read('data/tool-clusters.ts');
const hubRouteSource = read('app/(en)/tool-hubs/[slug]/page.tsx');
const headerSource = read('components/SiteHeader.tsx');
for (const slug of ['loans-emi', 'tax-compliance', 'investing-markets', 'insurance-protection', 'government-pension', 'life-stage-planning', 'small-savings']) {
  if (!clusterSource.includes(`slug: '${slug}'`)) fail(`Missing required calculator cluster: ${slug}`);
}
if (!hubRouteSource.includes('getPrimaryClusterForTool')) fail('Cluster hub route does not render live tools by primary cluster');
if (!headerSource.includes("href: '/tool-hubs'")) fail('Primary navigation does not expose calculator hubs');

const toolRoute = read('app/(en)/tools/[slug]/page.tsx');
const blogRoute = read('app/(en)/blog/[slug]/page.tsx');
for (const [label, source] of [['tool route', toolRoute], ['blog route', blogRoute]]) {
  if (!source.includes('canonical: pageUrl')) fail(`${label} missing self-canonical metadata`);
  if (!source.includes('index: true') || !source.includes('follow: true')) fail(`${label} missing index/follow robots metadata`);
  if (!source.includes("'max-image-preview': 'large'")) fail(`${label} missing max-image-preview:large`);
}

const taxRoutePath = 'app/(en)/tools/income-tax-calculator-old-vs-new-regime-india/page.tsx';
if (fs.existsSync(path.join(ROOT, taxRoutePath))) {
  const taxRoute = read(taxRoutePath);
  if (!taxRoute.includes('canonical:') || !taxRoute.includes('index: true') || !taxRoute.includes("'max-image-preview': 'large'")) {
    fail('Dedicated income-tax calculator route is missing canonical/index/max-image-preview metadata');
  }
}

const redirectsSource = read('next.config.mjs');
const expectedRedirects = [
  ['/blog/home-loan-eligibility-25000-salary-india', '/blog/home-loan-eligibility-by-salary-india'],
  ['/blog/home-loan-eligibility-40000-salary-india', '/blog/home-loan-eligibility-by-salary-india'],
  ['/blog/home-loan-eligibility-45000-salary-india', '/blog/home-loan-eligibility-by-salary-india'],
  ['/tools/net-worth-tracker-calculator-india', '/tools/net-worth-calculator-india'],
];
for (const [source, destination] of expectedRedirects) {
  if (!redirectsSource.includes(`source: '${source}'`) || !redirectsSource.includes(`destination: '${destination}'`)) {
    fail(`Missing direct consolidation redirect: ${source} -> ${destination}`);
  }
}
if (!redirectsSource.includes('statusCode: 301')) fail('Consolidation redirects are not explicitly 301');

const removedFinancialUpdateSlugs = [
  'rbi-repo-rate-explainer',
  'income-tax-regime-comparison',
  'gst-council-explainer',
  'sebi-mutual-fund-explainer',
  'banking-fd-rate-tracker',
  'personal-finance-epf-explainer',
  'government-salary-da-link',
  'hra-exemption-explainer',
  'nps-tier1-explainer',
  'tds-26as-explainer',
];
for (const slug of removedFinancialUpdateSlugs) {
  const source = `/financial-updates/${slug}`;
  if (!redirectsSource.includes(`'${slug}'`) || !redirectsSource.includes("destination: '/financial-updates'")) {
    fail(`Missing retired-update redirect: ${source} -> /financial-updates`);
  }
}

const governmentUpdateSource = read('data/government-salary-updates.ts');
const sampleGovernmentUpdateSlugs = extractSampleSlugs(governmentUpdateSource);
const governmentHubSource = read('components/updates/GovernmentSalaryUpdatesClient.tsx');
const governmentDetailSource = read('app/(en)/government-salary-updates/[slug]/page.tsx');

if (!governmentHubSource.includes('indexableGovernmentSalaryUpdates')) {
  fail('Government salary hub can expose sample update links');
}
if (!governmentDetailSource.includes('indexableGovernmentSalaryUpdates')) {
  fail('Government salary detail route can render sample updates');
}
if (governmentDetailSource.includes('index: false') || governmentDetailSource.includes('follow: false')) {
  fail('Government salary detail route still emits noindex/nofollow metadata');
}
for (const slug of sampleGovernmentUpdateSlugs) {
  if (!redirectsSource.includes(`'${slug}'`)) {
    fail(`Missing retired-sample redirect: /government-salary-updates/${slug} -> /government-salary-updates`);
  }
}

const auditRows = liveTools.map((tool) => {
  const refs = inbound.get(`/tools/${tool.slug}`) || [];
  const contextual = refs.filter((ref) => ref.kind !== 'hub');
  return {
    url: `${SITE_URL}/tools/${tool.slug}`,
    inSitemap: true,
    canonical: `${SITE_URL}/tools/${tool.slug}`,
    inboundLinkCount: refs.length,
    contextualInboundLinkCount: contextual.length,
    indexedStatus: 'unknown-not-queried',
  };
});

console.log(`INDEXING_AUDIT_ROWS=${JSON.stringify(auditRows)}`);
console.log(`ℹ️ ${liveTools.length} live tools, ${blogSlugs.size} blog pages, ${auditRows.filter((row) => row.contextualInboundLinkCount === 0).length} tools without contextual inbound discovery.`);

if (failures > 0) {
  console.error(`\nInternal-link/indexing validation failed with ${failures} error(s).`);
  process.exit(1);
}

console.log('✅ Cluster hubs, contextual inbound links, sitemap sources, canonical/robots metadata, redirects, and zero-orphan crawl paths validated.');
