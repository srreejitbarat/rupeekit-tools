import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

function readJson(relativePath, fallback = null) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readGuides() {
  const source = fs.readFileSync(path.join(root, 'data', 'calculator-guides.ts'), 'utf8');
  const guideArray = source.split('export const calculatorGuides: CalculatorGuide[] = [')[1]?.split('\n];')[0] ?? '';
  return [...guideArray.matchAll(/slug:\s*'([^']+)'[\s\S]*?clusterId:\s*'([^']+)'/g)]
    .map((match) => ({ slug: match[1], clusterId: match[2] }));
}

const guides = readGuides();
const clusterImages = readJson(path.join('data', 'discover-guide-clusters.json'), []);
const baseManifest = [
  ...readJson(path.join('data', 'discover-images.json'), []),
  ...readJson(path.join('data', 'discover-images-fcra.json'), []),
];
const clusterById = new Map(clusterImages.map((image) => [image.clusterId, image]));
const baseSources = new Set(baseManifest.map((image) => image.src));
const guidePaths = new Set();

if (!guides.length) errors.push('No calculator guides found.');
if (!clusterImages.length) errors.push('Discover guide cluster image mapping is empty.');

for (const guide of guides) {
  const pagePath = `/guides/${guide.slug}`;
  if (guidePaths.has(pagePath)) errors.push(`Duplicate calculator guide path: ${pagePath}`);
  guidePaths.add(pagePath);

  const image = clusterById.get(guide.clusterId);
  if (!image) {
    errors.push(`Guide cluster is missing a Discover image mapping: ${guide.clusterId} (${pagePath})`);
    continue;
  }

  if (!image.src?.startsWith('/images/discover/') || !image.src.endsWith('.webp')) {
    errors.push(`Invalid Discover image source for ${guide.clusterId}: ${image.src}`);
  }
  if (!image.alt || image.alt.length < 40 || image.alt.length > 160) {
    errors.push(`Guide-cluster alt text must be 40-160 characters for ${guide.clusterId}.`);
  }
  if (!baseSources.has(image.src)) {
    errors.push(`Guide cluster reuses an image that is not in the reviewed base manifest: ${image.src}`);
  }

  const filePath = path.join(root, 'public', image.src.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) errors.push(`Missing guide-cluster Discover asset: ${image.src}`);
}

const guidePageSource = fs.readFileSync(path.join(root, 'app', '(en)', 'guides', '[slug]', 'page.tsx'), 'utf8');
for (const required of [
  "getDiscoverImage(canonicalPath)",
  '<DiscoverHeroImage image={discoverImage}',
  "'max-image-preview': 'large'",
  "twitter:",
  "images:",
  "image: discoverImageUrl",
]) {
  if (!guidePageSource.includes(required)) {
    errors.push(`Calculator guide page is missing Discover integration: ${required}`);
  }
}

const registrySource = fs.readFileSync(path.join(root, 'data', 'discover-images.ts'), 'utf8');
for (const required of [
  "discover-guide-clusters.json",
  "calculatorGuides",
  "...guideImages",
]) {
  if (!registrySource.includes(required)) {
    errors.push(`Discover registry is missing calculator-guide coverage: ${required}`);
  }
}

// Issue #129 identified a validator gap for a future policy-lane dataset. Main does
// not currently contain that file, so do not invent pages. When the dataset lands,
// require every live policy calculator to have a preferred image mapping.
const policyTools = readJson(path.join('data', 'policy-tools-2026.json'), null);
if (policyTools === null) {
  warnings.push('policy-tools-2026.json is not present on this branch; policy-lane image coverage will activate automatically when it is added.');
} else {
  const basePaths = new Set(baseManifest.map((image) => image.path));
  for (const tool of policyTools) {
    const isLive = tool.status !== 'draft' && tool.status !== 'hidden';
    if (isLive && !basePaths.has(`/tools/${tool.slug}`)) {
      errors.push(`Live policy calculator is missing a Discover image: /tools/${tool.slug}`);
    }
  }
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (errors.length) {
  console.error('Calculator guide Discover image validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Calculator guide Discover validation passed for ${guides.length} guides across ${clusterImages.length} reviewed cluster images.`);
