import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifest = [
  ...JSON.parse(fs.readFileSync(path.join(root, 'data', 'discover-images.json'), 'utf8')),
  ...JSON.parse(fs.readFileSync(path.join(root, 'data', 'discover-images-fcra.json'), 'utf8')),
];
const creativeBriefs = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'discover-creative-briefs-2026-08-24.json'), 'utf8'),
);
const baseTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'tools.json'), 'utf8'));
const growthTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'growth-tools.json'), 'utf8'));
const decisionTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'decision-tools-2026.json'), 'utf8'));
const insuranceTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'insurance-tools-2026.json'), 'utf8'));
const investingTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'investing-tools-2026.json'), 'utf8'));
const lifestageTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'lifestage-tools-2026.json'), 'utf8'));
const policyTools = JSON.parse(fs.readFileSync(path.join(root, 'data', 'policy-tools-2026.json'), 'utf8'));
const tools = [...baseTools, ...growthTools, ...decisionTools, ...insuranceTools, ...investingTools, ...lifestageTools, ...policyTools];
const errors = [];
const warnings = [];
const day7BlogSource = fs.readFileSync(
  path.join(root, 'data', 'day7-comparison-blog-posts.ts'),
  'utf8',
);
const day7ImageSlugs = [
  'epf-vs-nps-vs-ppf-retirement-india',
  'cashback-vs-rewards-credit-cards-india',
  'salary-hike-negotiation-beyond-base-pay-india',
  'robo-advisors-vs-diy-index-investing-india',
  'gold-asset-class-sgb-etf-physical-gold-loan-india-2026',
  'fy-2026-27-money-moves-salaried-indians-mid-year-checklist',
];

const CONSOLIDATED_TOOL_SLUGS = new Set(
  fs
    .readFileSync(path.join(root, 'lib', 'consolidated-routes.ts'), 'utf8')
    .match(/CONSOLIDATED_TOOL_SLUGS = new Set\(\[([\s\S]*?)\]\)/)[1]
    .match(/'[^']+'/g)
    .map((s) => s.slice(1, -1)),
);

const imageSitemapSource = fs.readFileSync(
  path.join(root, 'app', 'image-sitemap.xml', 'route.ts'),
  'utf8',
);
const robotsSource = fs.readFileSync(path.join(root, 'app', 'robots.ts'), 'utf8');

if (!imageSitemapSource.includes('discoverImages')) {
  errors.push('Image sitemap is not generated from the Discover image manifest.');
}
if (!robotsSource.includes('/image-sitemap.xml')) {
  errors.push('robots.ts does not advertise the image sitemap.');
}

// Includes the three September micro-niche decision tools.
if (manifest.length !== 108) {
  errors.push(`Expected 108 Discover images, found ${manifest.length}.`);
}

for (const slug of day7ImageSlugs) {
  const imageSource = `/images/discover/${slug}.webp`;
  if (!manifest.some((image) => image.path === `/blog/${slug}` && image.src === imageSource)) {
    errors.push(`Day 7 blog is missing its Discover manifest entry: ${slug}`);
  }
  if (!day7BlogSource.includes(`heroImage: '${imageSource}'`)) {
    errors.push(`Day 7 blog card is missing its hero image reference: ${slug}`);
  }
}

const paths = new Set();
const sources = new Set();
// Policy-lane calculators launched before their bespoke Discover assets exist.
// They reuse the reviewed parent-topic image of the calculator they extend, the
// same strategy the calculator guides use. Issue #129 still tracks bespoke P0
// artwork; these rows are interim coverage, not the final creative.
const reusableSources = new Set([
  '/images/discover/epf-corpus-calculator-india.webp',
  '/images/discover/8th-pay-commission-salary-calculator-india.webp',
  '/images/discover/health-insurance-coverage-adequacy-calculator-india.webp',
  '/images/discover/capital-gains-tax-calculator-india.webp',
  '/images/discover/salary-in-hand-calculator-india.webp',
  '/images/discover/gratuity-2026-old-vs-new-calculator-india.webp',
]);

for (const image of manifest) {
  if (!image.path?.startsWith('/')) errors.push(`Invalid canonical path: ${image.path}`);
  if (paths.has(image.path)) errors.push(`Duplicate canonical path: ${image.path}`);
  paths.add(image.path);

  if (!image.src?.startsWith('/images/discover/') || !image.src.endsWith('.webp')) {
    errors.push(`Unexpected image source for ${image.path}: ${image.src}`);
  }
  if (sources.has(image.src) && !reusableSources.has(image.src)) {
    errors.push(`Duplicate image source: ${image.src}`);
  }
  sources.add(image.src);

  if (image.width < 1200 || image.height < 675) {
    errors.push(`Image is below large-preview dimensions for ${image.path}: ${image.width}x${image.height}`);
  }
  if (Math.abs(image.width / image.height - 16 / 9) > 0.01) {
    errors.push(`Image is not 16:9 for ${image.path}: ${image.width}x${image.height}`);
  }
  if (!image.alt || image.alt.length < 40 || image.alt.length > 160) {
    errors.push(`Alt text should be 40-160 characters for ${image.path}.`);
  }

  const filePath = path.join(root, 'public', image.src.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing image file: ${image.src}`);
    continue;
  }

  const fileSize = fs.statSync(filePath).size;
  if (fileSize > 350_000) {
    errors.push(`Image exceeds 350 KB budget for ${image.path}: ${fileSize} bytes`);
  }

  const header = fs.readFileSync(filePath, { start: 0, end: 11 });
  if (header.subarray(0, 4).toString('ascii') !== 'RIFF' || header.subarray(8, 12).toString('ascii') !== 'WEBP') {
    errors.push(`Image is not a valid WebP container: ${image.src}`);
  }
}

for (const tool of tools) {
  const isLive = tool.status !== 'draft' && tool.status !== 'hidden' && !CONSOLIDATED_TOOL_SLUGS.has(tool.slug);
  const calculatorPath = `/tools/${tool.slug}`;
  if (isLive && !paths.has(calculatorPath)) {
    errors.push(`Live calculator is missing a Discover image: ${calculatorPath}`);
  }
}

// Creative quality governance for the highest-value Discover candidates.
// These checks deliberately validate the brief and safety constraints rather than pretending
// static code can judge whether a generated person's face, currency symbol, or document is visually correct.
if (!Array.isArray(creativeBriefs) || creativeBriefs.length !== 24) {
  errors.push(`Expected 24 priority Discover creative briefs, found ${Array.isArray(creativeBriefs) ? creativeBriefs.length : 0}.`);
} else {
  const manifestByPath = new Map(manifest.map((image) => [image.path, image]));
  const briefPaths = new Set();
  const p0Sources = new Set();
  const bannedHookPattern = /(guaranteed|instant\s+approval|lowest\s+rate|must\s+see|shocking|unbelievable|risk[- ]?free|assured\s+return|get\s+rich)/i;

  for (const brief of creativeBriefs) {
    if (!brief.path || (!brief.path.startsWith('/blog/') && !brief.path.startsWith('/tools/'))) {
      errors.push(`Creative brief has invalid page path: ${brief.path}`);
      continue;
    }
    if (briefPaths.has(brief.path)) errors.push(`Duplicate Discover creative brief path: ${brief.path}`);
    briefPaths.add(brief.path);

    const image = manifestByPath.get(brief.path);
    if (!image) {
      errors.push(`Priority Discover creative brief has no preferred image mapping: ${brief.path}`);
      continue;
    }

    if (!['P0', 'P1'].includes(brief.priority)) {
      errors.push(`Discover creative brief priority must be P0 or P1 for ${brief.path}.`);
    }
    if (!['article', 'calculator'].includes(brief.contentType)) {
      errors.push(`Discover creative brief contentType must be article or calculator for ${brief.path}.`);
    }
    if (!brief.safeHook || brief.safeHook.length > 32) {
      errors.push(`Discover safe hook is missing or too long for ${brief.path}.`);
    } else {
      const hookWords = brief.safeHook.trim().split(/\s+/).filter(Boolean).length;
      if (hookWords > 5) errors.push(`Discover safe hook exceeds five words for ${brief.path}: ${brief.safeHook}`);
      if (hookWords > 4) warnings.push(`Prefer four or fewer overlay words for ${brief.path}: ${brief.safeHook}`);
      if (bannedHookPattern.test(brief.safeHook)) {
        errors.push(`Discover safe hook uses sensational/unsafe language for ${brief.path}: ${brief.safeHook}`);
      }
    }

    if (!brief.story || brief.story.length < 80) {
      errors.push(`Discover creative story is too thin for ${brief.path}.`);
    }
    if (!brief.composition || brief.composition.length < 60) {
      errors.push(`Discover composition guidance is too thin for ${brief.path}.`);
    }
    if (!brief.generationPrompt || brief.generationPrompt.length < 220) {
      errors.push(`Discover generation prompt is too thin for ${brief.path}.`);
    }
    if (!Array.isArray(brief.avoid) || brief.avoid.length < 4) {
      errors.push(`Discover creative brief needs at least four explicit avoid rules for ${brief.path}.`);
    }

    if (/logo|brand mark only/i.test(image.alt)) {
      errors.push(`Priority Discover preferred image alt appears generic/logo-led for ${brief.path}.`);
    }
    if (!/Indian|India/i.test(image.alt)) {
      warnings.push(`Priority Discover alt should usually retain India-local relevance for ${brief.path}: ${image.alt}`);
    }

    if (brief.priority === 'P0') {
      if (p0Sources.has(image.src)) {
        errors.push(`P0 Discover pages should not reuse the same preferred image source: ${image.src}`);
      }
      p0Sources.add(image.src);
    }
  }
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (errors.length) {
  console.error('Discover image validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Discover image validation passed for ${manifest.length} unique pages.`);
console.log(`Discover creative quality governance passed for ${creativeBriefs.length} priority pages.`);
