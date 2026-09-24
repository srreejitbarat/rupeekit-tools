import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const clusterImages = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'discover-guide-clusters.json'), 'utf8'),
);
const clusterById = new Map(clusterImages.map((image) => [image.clusterId, image]));
const guideSource = fs.readFileSync(path.join(root, 'data', 'calculator-guides.ts'), 'utf8');
const guideArray = guideSource.split('export const calculatorGuides: CalculatorGuide[] = [')[1]?.split('\n];')[0] ?? '';
const guides = [...guideArray.matchAll(/slug:\s*'([^']+)'[\s\S]*?clusterId:\s*'([^']+)'/g)]
  .map((match) => ({ slug: match[1], clusterId: match[2] }));
const imageSitemapPath = path.join(root, '.next', 'server', 'app', 'image-sitemap.xml.body');
const renderedImageSitemap = fs.existsSync(imageSitemapPath)
  ? fs.readFileSync(imageSitemapPath, 'utf8')
  : '';
const siteUrl = renderedImageSitemap.match(/<loc>(https?:\/\/[^/]+)\//)?.[1]
  ?? 'https://www.rupeekit.co.in';

for (const guide of guides) {
  const image = clusterById.get(guide.clusterId);
  if (!image) {
    errors.push(`Missing cluster image for rendered guide: ${guide.clusterId}`);
    continue;
  }

  const pagePath = `/guides/${guide.slug}`;
  const htmlPath = path.join(root, '.next', 'server', 'app', `guides/${guide.slug}.html`);
  if (!fs.existsSync(htmlPath)) {
    errors.push(`Missing prerendered HTML for ${pagePath}`);
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const escapedImagePath = image.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const absoluteImageUrlPattern = `https?:\\/\\/[^\"']+${escapedImagePath}`;

  if (!new RegExp(`<meta property="og:image" content="${absoluteImageUrlPattern}"`).test(html)) {
    errors.push(`Missing Open Graph image for ${pagePath}; expected ${image.src}`);
  }
  if (!new RegExp(`<meta name="twitter:image" content="${absoluteImageUrlPattern}"`).test(html)) {
    errors.push(`Missing Twitter image for ${pagePath}; expected ${image.src}`);
  }
  if (!html.includes(`alt="${image.alt}"`)) {
    errors.push(`Missing visible Discover hero alt for ${pagePath}`);
  }
  if ((html.match(new RegExp(escapedImagePath, 'g')) ?? []).length < 3) {
    errors.push(`Expected metadata, schema and visible references to ${image.src} for ${pagePath}`);
  }

  const pageUrl = `${siteUrl}${pagePath}`;
  const imageUrl = `${siteUrl}${image.src}`;
  if (!renderedImageSitemap.includes(`<loc>${pageUrl}</loc>`)) {
    errors.push(`Image sitemap is missing guide page URL: ${pagePath}`);
  }
  if (!renderedImageSitemap.includes(`<image:loc>${imageUrl}</image:loc>`)) {
    errors.push(`Image sitemap is missing guide image URL: ${image.src}`);
  }
}

if (errors.length) {
  console.error('Rendered calculator-guide Discover validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Rendered calculator-guide Discover validation passed for ${guides.length} guides.`);
