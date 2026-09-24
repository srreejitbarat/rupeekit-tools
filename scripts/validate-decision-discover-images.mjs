import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const expected = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'decision-discover-brand-review-2026.json'), 'utf8'),
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'discover-images.json'), 'utf8'),
);
const decisionTools = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'decision-tools-2026.json'), 'utf8'),
);
const policy = fs.readFileSync(
  path.join(root, 'docs', 'discover-image-research-2026-07-17.md'),
  'utf8',
);

const errors = [];
const expectedSlugs = new Set(expected.map((entry) => entry.slug));
const decisionSlugs = new Set(decisionTools.map((tool) => tool.slug));
const sources = new Set();
let liveAssetCount = 0;

if (expected.length !== 10) {
  errors.push(`Expected 10 original decision-image review rows, found ${expected.length}.`);
}

for (const entry of expected) {
  if (!decisionSlugs.has(entry.slug)) {
    errors.push(`Decision-image review references unknown decision tool: ${entry.slug}`);
  }

  if (!entry.logoAsset || !fs.existsSync(path.join(root, entry.logoAsset))) {
    errors.push(`Missing declared RupeeKit logo asset for ${entry.slug}: ${entry.logoAsset}`);
  }

  const expectedPath = `/tools/${entry.slug}`;
  const image = manifest.find((candidate) => candidate.path === expectedPath);

  if (entry.consolidatedTo) {
    if (image) {
      errors.push(`Consolidated decision slug must not keep a Discover manifest row: ${expectedPath}.`);
    }
    const survivorPath = `/tools/${entry.consolidatedTo}`;
    if (!manifest.some((candidate) => candidate.path === survivorPath)) {
      errors.push(`Consolidated decision slug survivor has no Discover image: ${survivorPath}.`);
    }
    continue;
  }

  const expectedSrc = `/images/discover/${entry.slug}.webp`;
  if (!image) {
    errors.push(`Missing Discover manifest row for ${expectedPath}.`);
    continue;
  }
  liveAssetCount += 1;

  if (image.src !== expectedSrc) {
    errors.push(`Decision tool must use its own Discover source: ${expectedPath} -> ${image.src}`);
  }
  if (sources.has(image.src)) {
    errors.push(`Decision Discover source is reused: ${image.src}`);
  }
  sources.add(image.src);

  if (image.width !== 1600 || image.height !== 900) {
    errors.push(`Decision Discover image must be 1600x900: ${expectedPath} is ${image.width}x${image.height}.`);
  }
  if (!image.alt || image.alt.length < 40 || image.alt.length > 160) {
    errors.push(`Decision Discover alt must be 40-160 characters: ${expectedPath}.`);
  }

  const filePath = path.join(root, 'public', image.src.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing decision Discover image file: ${image.src}`);
    continue;
  }
  const size = fs.statSync(filePath).size;
  if (size > 350_000) {
    errors.push(`Decision Discover image exceeds 350 KB: ${image.src} (${size} bytes).`);
  }
  const header = fs.readFileSync(filePath, { start: 0, end: 11 });
  if (header.subarray(0, 4).toString('ascii') !== 'RIFF' || header.subarray(8, 12).toString('ascii') !== 'WEBP') {
    errors.push(`Decision Discover image is not a valid WebP: ${image.src}`);
  }
}

for (const slug of expectedSlugs) {
  if (!decisionSlugs.has(slug)) errors.push(`Expected decision slug not present in decision-tools dataset: ${slug}`);
}

if (!policy.includes('Decision-calculator branding policy')) {
  errors.push('Discover image policy does not document the decision-calculator branding exception.');
}
if (!policy.includes('RupeeKit logo')) {
  errors.push('Discover image policy does not mention the RupeeKit logo requirement.');
}

if (errors.length) {
  console.error('Decision Discover image validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Decision Discover image validation passed for ${liveAssetCount} live branded assets plus ${expected.length - liveAssetCount} consolidated legacy route(s).`,
);
