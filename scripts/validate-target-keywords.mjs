import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
const toolFiles = [
  'tools.json',
  'growth-tools.json',
  'decision-tools-2026.json',
  'insurance-tools-2026.json',
  'investing-tools-2026.json',
  'lifestage-tools-2026.json',
  'policy-tools-2026.json',
];

const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDir, fileName), 'utf8'));
const tools = toolFiles.flatMap(readJson);
const toolOverrides = readJson('issue-80-tool-overrides-2026-08-27.json');
const blogOverrides = readJson('issue-80-blog-overrides-2026-08-27.json');

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const ownersByKeyword = new Map();
let errors = 0;

function fail(message) {
  errors += 1;
  console.error(`❌ ${message}`);
}

function register(kind, slug, keyword) {
  if (typeof keyword !== 'string' || !keyword.trim()) {
    fail(`${kind} ${slug} is missing targetKeyword`);
    return;
  }
  const normalized = normalize(keyword);
  const owner = ownersByKeyword.get(normalized);
  if (owner && owner.slug !== slug) {
    fail(`Duplicate targetKeyword "${keyword}" on ${kind} ${slug}; already used by ${owner.kind} ${owner.slug}`);
    return;
  }
  ownersByKeyword.set(normalized, { kind, slug, keyword });
}

for (const tool of tools) {
  if (tool.status !== 'live') continue;
  const effectiveKeyword = toolOverrides[tool.slug]?.targetKeyword ?? tool.targetKeyword;
  register('tool', tool.slug, effectiveKeyword);
}

for (const [slug, override] of Object.entries(blogOverrides)) {
  register('blog', slug, override.targetKeyword);
}

const requiredClusterSlugs = [
  'sip-calculator-india',
  'step-up-sip-calculator-india',
  'lumpsum-calculator-india',
  'index-fund-vs-active-fund-cost-calculator-india',
  'nps-tier-2-vs-mutual-fund-calculator-india',
  'xirr-portfolio-return-calculator-india',
  'elss-lock-in-vs-80c-options-calculator-india',
];
for (const slug of requiredClusterSlugs) {
  if (!toolOverrides[slug]?.targetKeyword) {
    fail(`Issue #80 cluster tool ${slug} is missing an explicit targetKeyword override`);
  }
}

const requiredBlogSlugs = [
  'mutual-funds-for-beginners-india',
  'robo-advisors-vs-diy-index-investing-india',
];
for (const slug of requiredBlogSlugs) {
  if (!blogOverrides[slug]?.targetKeyword) {
    fail(`Issue #80 cluster blog ${slug} is missing an explicit targetKeyword override`);
  }
}

if (errors) {
  console.error(`\nTarget-keyword validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log(`✅ Target keywords are unique across ${tools.filter((tool) => tool.status === 'live').length} live tools and ${Object.keys(blogOverrides).length} explicitly targeted cluster blogs.`);
