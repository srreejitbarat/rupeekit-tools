import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const errors = [];
const warnings = [];
const posts = [];
const publishedBlogSlugs = new Set(JSON.parse(fs.readFileSync(path.join(root, 'lib/i18n/public-routes.json'), 'utf8'))
  .filter(route => route.startsWith('/blog/')).map(route => route.slice('/blog/'.length)));

const discoverManifest = [
  ...JSON.parse(fs.readFileSync(path.join(dataDir, 'discover-images.json'), 'utf8')),
];
const discoverPaths = new Set(discoverManifest.map((item) => item.path));

function propName(node) {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isStringLiteralLike(node)) return node.text;
  return '';
}

function getProperty(object, name) {
  return object.properties.find(
    (prop) => ts.isPropertyAssignment(prop) && propName(prop.name) === name,
  );
}

function stringValue(object, name) {
  const prop = getProperty(object, name);
  if (!prop || !ts.isPropertyAssignment(prop)) return '';
  const value = prop.initializer;
  return ts.isStringLiteralLike(value) || ts.isNoSubstitutionTemplateLiteral(value) ? value.text.trim() : '';
}

function arrayLength(object, name) {
  const prop = getProperty(object, name);
  if (!prop || !ts.isPropertyAssignment(prop) || !ts.isArrayLiteralExpression(prop.initializer)) return 0;
  return prop.initializer.elements.length;
}

function hasObjectProperty(object, name) {
  const prop = getProperty(object, name);
  return Boolean(prop && ts.isPropertyAssignment(prop) && ts.isObjectLiteralExpression(prop.initializer));
}

function collectBlogObjects(sourceFile) {
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const slug = stringValue(node, 'slug');
      const title = stringValue(node, 'title');
      const metaDescription = stringValue(node, 'metaDescription');
      const sections = getProperty(node, 'sections');
      const faqs = getProperty(node, 'faqs');
      if (publishedBlogSlugs.has(slug) && title && metaDescription && sections && faqs) posts.push({ node, source: sourceFile });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

for (const file of fs.readdirSync(dataDir).filter((name) => name.endsWith('.ts'))) {
  const fullPath = path.join(dataDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  collectBlogObjects(source);
}

const seenSlugs = new Set();
const riskyClaimPatterns = [
  /guaranteed\s+(?:return|returns|approval|loan|saving|savings|ranking)/i,
  /instant\s+approval/i,
  /lowest\s+(?:interest\s+)?rate/i,
  /assured\s+returns?/i,
];

for (const { node, source } of posts) {
  const file = source.fileName;
  const slug = stringValue(node, 'slug');
  const h1 = stringValue(node, 'h1');
  const intro = stringValue(node, 'intro');
  const metaDescription = stringValue(node, 'metaDescription');
  const quickAnswer = hasObjectProperty(node, 'quickAnswer');
  const heroImage = stringValue(node, 'heroImage');
  const heroImageAlt = stringValue(node, 'heroImageAlt');
  const visualType = stringValue(node, 'visualType');
  const visualAlt = stringValue(node, 'visualAlt');
  const sectionsCount = arrayLength(node, 'sections');
  const calculatorsCount = arrayLength(node, 'relatedCalculators');
  const sourceCount = arrayLength(node, 'officialSources');
  const text = node.getText(source);
  const hasExample = /example:\s*\{/i.test(text);
  const hasMethodology = /source(?:s)?\s+and\s+methodology|methodology/i.test(text);
  const hasDiscoverImage = discoverPaths.has(`/blog/${slug}`);

  if (seenSlugs.has(slug)) errors.push(`${file}:${slug} duplicate blog slug.`);
  seenSlugs.add(slug);

  if (!h1) errors.push(`${file}:${slug} missing H1.`);
  if (!intro) errors.push(`${file}:${slug} intro is missing.`);
  if (!metaDescription) errors.push(`${file}:${slug} missing meta description.`);
  if (sectionsCount < 1) errors.push(`${file}:${slug} needs substantive article content.`);
  if (calculatorsCount < 1) warnings.push(`${file}:${slug} has no related RupeeKit calculator/tool; acceptable when no relevant calculator exists.`);

  if (heroImage && !heroImageAlt) errors.push(`${file}:${slug} has a hero image without descriptive heroImageAlt.`);
  if (visualType && !visualAlt) errors.push(`${file}:${slug} has an inline visual without descriptive visualAlt.`);
  if (!heroImage && !visualType && !hasDiscoverImage) {
    warnings.push(`${file}:${slug} has no dedicated hero/visual/Discover image; create a high-CTR 16:9 asset.`);
  }

  if (!quickAnswer) warnings.push(`${file}:${slug} has no authored direct-answer box; add one only when it helps the reader.`);
  if (!hasExample) warnings.push(`${file}:${slug} has no worked/practical example.`);
  if (!hasMethodology) warnings.push(`${file}:${slug} has no article-specific source/methodology section; the shared educational disclaimer does not establish sources or methodology.`);

  const isHighTrustTopic = /tax|itr|hra|epf|ppf|nps|gratuity|fcra|government|loan|insurance|capital-gains/i.test(
    `${slug} ${stringValue(node, 'category')} ${h1}`,
  );
  if (isHighTrustTopic && sourceCount === 0) {
    warnings.push(`${file}:${slug} is a high-trust finance/compliance topic without configured officialSources.`);
  }

  for (const pattern of riskyClaimPatterns) {
    if (pattern.test(text)) warnings.push(`${file}:${slug} contains wording matching ${pattern}; human review should confirm it is contextual, factual, and not promotional.`);
  }
}

if (posts.length === 0) errors.push('No blog post objects were discovered in data/*.ts.');
for (const slug of publishedBlogSlugs) {
  if (!seenSlugs.has(slug)) errors.push(`Published blog ${slug} has no auditable source record.`);
}

const blogHeroSource = fs.readFileSync(path.join(root, 'components', 'blog', 'BlogHero.tsx'), 'utf8');
if (!blogHeroSource.includes('aspect-[16/9]')) errors.push('BlogHero must preserve a 16:9 hero image area.');
if (!blogHeroSource.includes('object-contain')) errors.push('BlogHero must show the complete click-through creative without cropping important text.');
if (!blogHeroSource.includes('sizes=')) errors.push('BlogHero must provide responsive Next/Image sizes.');

const financeDisclaimerSource = fs.readFileSync(path.join(root, 'components', 'blog', 'FinanceDisclaimer.tsx'), 'utf8');
if (!financeDisclaimerSource.includes('id="source-and-methodology"')) errors.push('Every standard blog must preserve the educational disclaimer anchor.');
if (!financeDisclaimerSource.includes('does not guarantee returns, tax savings, rankings, or loan approval')) {
  errors.push('Shared blog disclosure must include safe no-guarantee wording.');
}

const blogPageSource = fs.readFileSync(path.join(root, 'app', '(en)', 'blog', '[slug]', 'page.tsx'), 'utf8');
if (!blogPageSource.includes("'max-image-preview': 'large'")) errors.push('Blog metadata must allow max-image-preview: large.');
if (!blogPageSource.includes("twitter: { card: 'summary_large_image'")) errors.push('Blog metadata must use Twitter large-image cards.');
if (!blogPageSource.includes('alternates: withLanguageAlternates({ canonical: pageUrl })')) errors.push('Blog pages must remain self-canonical.');
if (!blogPageSource.includes("'@type': 'Article'")) errors.push('Blog Article schema is missing.');
if (!blogPageSource.includes("'@type': 'BreadcrumbList'")) errors.push('Blog Breadcrumb schema is missing.');

console.log(`Blog SEO quality audit: ${posts.length} post objects checked.`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
console.log(`Blog SEO quality audit warnings: ${warnings.length}.`);

if (errors.length) {
  console.error(`Blog SEO quality validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('PASS: universal blog SEO quality gate passed all blocking checks.');
