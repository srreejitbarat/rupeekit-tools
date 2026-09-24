import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let errors = 0;

function read(...segments) {
  return fs.readFileSync(path.join(root, ...segments), 'utf8').replace(/\r\n/g, '\n');
}

function ensure(condition, message) {
  if (!condition) {
    errors += 1;
    console.error(`FAIL: ${message}`);
  }
}

function count(source, token) {
  return source.split(token).length - 1;
}

const toolSource = read('app', '(en)', 'tools', '[slug]', 'page.tsx');
const taxToolSource = read('app', '(en)', 'tools', 'income-tax-calculator-old-vs-new-regime-india', 'page.tsx');
const blogSource = read('app', '(en)', 'blog', '[slug]', 'page.tsx');
const blogLayoutSource = read('components', 'blog', 'BlogArticleLayout.tsx');
const guideSource = read('app', '(en)', 'guides', '[slug]', 'page.tsx');
const financialUpdateSource = read('app', '(en)', 'financial-updates', '[slug]', 'page.tsx');
const governmentUpdateSource = read('app', '(en)', 'government-salary-updates', '[slug]', 'page.tsx');

const schemaSources = [
  ['tool route', toolSource],
  ['dedicated income-tax route', taxToolSource],
  ['blog route', blogSource],
  ['guide route', guideSource],
  ['financial update route', financialUpdateSource],
  ['government salary update route', governmentUpdateSource],
];

for (const [label, source] of schemaSources) {
  ensure(source.includes('application/ld+json'), `${label} does not emit JSON-LD`);
  ensure(!source.includes("'@type': 'Product'"), `${label} must not emit Product schema`);
  ensure(!source.includes("'@type': 'Review'"), `${label} must not emit Review schema`);
  ensure(!source.includes("'@type': 'AggregateRating'"), `${label} must not emit AggregateRating schema`);
}

// Calculator routes: exactly one application entity and one breadcrumb entity are expected.
ensure(count(toolSource, "'@type': 'WebApplication'") === 1, 'generic tool route should define exactly one WebApplication schema');
ensure(count(toolSource, "'@type': 'BreadcrumbList'") === 1, 'generic tool route should define exactly one BreadcrumbList schema');
ensure(toolSource.includes("applicationCategory: 'FinanceApplication'"), 'generic tool WebApplication is missing applicationCategory');
ensure(toolSource.includes("'@type': 'Offer'"), 'generic tool WebApplication is missing Offer');
ensure(toolSource.includes("price: '0'"), 'generic tool WebApplication Offer must state the free price explicitly');
ensure(toolSource.includes("priceCurrency: 'INR'"), 'generic tool WebApplication Offer must state INR');
ensure(toolSource.includes('dateModified:'), 'generic tool WebApplication is missing dateModified');
ensure(toolSource.includes("tool.faqs.length > 0"), 'generic tool FAQ schema must be conditional on visible FAQs');
ensure(toolSource.includes('tool.faqs.map((faq)'), 'generic tool FAQ schema must derive from the same FAQ data rendered on page');
ensure(toolSource.includes('id="faqs"'), 'generic tool route should render a visible FAQ section target');
ensure(toolSource.includes("item: `${SITE_URL}/tools`"), 'generic tool breadcrumb schema must point to /tools');
ensure(toolSource.includes('item: pageUrl'), 'generic tool breadcrumb final item must equal the canonical page URL');

ensure(taxToolSource.includes("'@type': 'WebApplication'"), 'dedicated tax calculator is missing WebApplication schema');
ensure(taxToolSource.includes('applicationCategory:'), 'dedicated tax calculator WebApplication is missing applicationCategory');
ensure(taxToolSource.includes("'@type': 'Offer'"), 'dedicated tax calculator WebApplication is missing Offer');
ensure(taxToolSource.includes('dateModified:'), 'dedicated tax calculator WebApplication is missing dateModified');
ensure(taxToolSource.includes('const faqSchema = faqs.length > 0 ?'), 'dedicated tax FAQ schema must be conditional on visible FAQs');

// Blog schema is Article + BreadcrumbList + conditional FAQPage, with real source dates only.
ensure(count(blogSource, "'@type': 'Article'") === 1, 'blog route should define exactly one Article schema');
ensure(count(blogSource, "'@type': 'BreadcrumbList'") === 1, 'blog route should define exactly one BreadcrumbList schema');
ensure(blogSource.includes('datePublished: post.publishedDateISO || undefined'), 'blog Article datePublished should derive from stored publication data');
ensure(blogSource.includes('dateModified: post.modifiedDateISO || post.publishedDateISO || undefined'), 'blog Article dateModified should derive from stored review/publication data');
ensure(!blogSource.includes('dateModified: new Date('), 'blog Article must not manufacture dateModified at request/build time');
ensure(blogSource.includes('post.faqs?.length ?'), 'blog FAQPage must be conditional on visible FAQ data');
ensure(blogLayoutSource.includes('<FAQSection faqs={post.faqs} />'), 'blog FAQ schema data must have matching visible FAQ rendering');
ensure(blogSource.includes("item: `${siteUrl}/blog`"), 'blog breadcrumb schema must point to /blog');
ensure(blogSource.includes('item: pageUrl'), 'blog breadcrumb final item must equal the canonical page URL');

// Calculator guides visibly render methodSteps as an ordered list, so HowTo mirrors visible steps.
ensure(count(guideSource, "'@type': 'Article'") === 1, 'guide route should define exactly one Article schema');
ensure(count(guideSource, "'@type': 'BreadcrumbList'") === 1, 'guide route should define exactly one BreadcrumbList schema');
ensure(count(guideSource, "'@type': 'FAQPage'") === 1, 'guide route should define exactly one FAQPage schema');
ensure(count(guideSource, "'@type': 'HowTo'") === 1, 'guide route should define exactly one HowTo schema');
ensure(guideSource.includes("'@type': 'HowToStep'"), 'guide HowTo schema is missing HowToStep entries');
ensure(guideSource.includes('step: cluster.methodSteps.map'), 'guide HowTo schema must derive from visible methodSteps');
ensure(guideSource.includes('{cluster.methodSteps.map((step, index) => ('), 'guide page must visibly render the same methodSteps used by HowTo schema');
ensure(guideSource.includes('dateModified: guide.lastReviewedIso'), 'guide Article dateModified should derive from stored review data');
ensure(guideSource.includes("item: `${SITE_URL}/guides`"), 'guide breadcrumb schema must point to /guides');

// Financial updates already use a current-content date fallback and conditionally visible FAQs.
ensure(financialUpdateSource.includes('const dateModified = update.modifiedDate || update.publishedDate'), 'financial update should derive dateModified from stored dates');
ensure(financialUpdateSource.includes("'@type': update.schemaType ?? 'Article'"), 'financial update is missing Article schema');
ensure(financialUpdateSource.includes("'@type': 'BreadcrumbList'"), 'financial update is missing BreadcrumbList schema');
ensure(financialUpdateSource.includes('const faqSchema = update.faqs && update.faqs.length > 0'), 'financial update FAQPage must be conditional on FAQ data');
ensure(financialUpdateSource.includes('update.faqs.map'), 'financial update page should visibly use the same FAQ collection as schema');
ensure(financialUpdateSource.includes("item: `${SITE_URL}/financial-updates`"), 'financial update breadcrumb must point to /financial-updates');

// Government salary updates intentionally have no FAQ schema because the data model has no visible FAQ collection.
ensure(governmentUpdateSource.includes("'@type': 'Article'"), 'government salary update is missing Article schema');
ensure(governmentUpdateSource.includes("'@type': 'BreadcrumbList'"), 'government salary update is missing BreadcrumbList schema');
ensure(governmentUpdateSource.includes('const dateModified ='), 'government salary update is missing a stored dateModified fallback');
ensure(governmentUpdateSource.includes("item: `${SITE_URL}/government-salary-updates`"), 'government salary breadcrumb must point to /government-salary-updates');
ensure(!governmentUpdateSource.includes("'@type': 'FAQPage'"), 'government salary update must not emit FAQPage without visible FAQs');

if (errors > 0) {
  console.error(`\nStructured-data validation failed with ${errors} issue(s).`);
  process.exit(1);
}

console.log('PASS: structured-data inventory and source-binding checks passed.');
