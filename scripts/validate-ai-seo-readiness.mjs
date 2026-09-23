import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const PRIORITY_TOOL_SLUGS = [
  'emergency-fund-calculator-india',
  'personal-loan-emi-calculator-india',
  'hra-exemption-calculator-india',
  'sip-calculator-india',
  'fd-calculator-india',
];

const PRIORITY_BLOG_SLUGS = [
  'how-much-emergency-fund',
  'itr-2-ay-2026-27-filing-guide',
  'income-tax-calculator-2026-calculator-guide',
];

let errors = 0;

function fail(message) {
  errors += 1;
  console.error(`FAIL: ${message}`);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function readText(...segments) {
  return fs.readFileSync(path.join(root, ...segments), 'utf8').replace(/\r\n/g, '\n');
}

function readJson(...segments) {
  return JSON.parse(readText(...segments));
}

const tools = [
  ...readJson('data', 'tools.json'),
  ...readJson('data', 'growth-tools.json'),
];
const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

const toolPageSource = readText('app', '(en)', 'tools', '[slug]', 'page.tsx');
const homePageSource = readText('app', '(en)', 'page.tsx');
const resourcesPageSource = readText('app', '(en)', 'resources', 'page.tsx');
const blogPageSource = readText('app', '(en)', 'blog', '[slug]', 'page.tsx');
const blogLayoutSource = readText('components', 'blog', 'BlogArticleLayout.tsx');
const blogFaqSectionSource = readText('components', 'blog', 'FAQSection.tsx');
const factsTableSource = readText('components', 'seo', 'FactsTable.tsx');
const sipCalculatorSource = readText('components', 'sip', 'SipPlannerCalculator.tsx');
const dedicatedIncomeTaxToolSource = readText('app', '(en)', 'tools', 'income-tax-calculator-old-vs-new-regime-india', 'page.tsx');
const rootLayoutSource = readText('components', 'layout', 'SiteLayout.tsx');
const guidePageSource = readText('app', '(en)', 'guides', '[slug]', 'page.tsx');
const robotsSource = readText('app', 'robots.ts');
const sitemapSource = readText('app', 'sitemap.ts');
const blogDataSource = readText('data', 'blog-posts.ts');
const llmsFullRouteSource = readText('app', 'llms-full.txt', 'route.ts');
const llmsFullCatalogSource = readText('lib', 'seo', 'llms-full.ts');
const llmsTxtPath = path.join(root, 'public', 'llms.txt');
const llmsTxtSource = fs.existsSync(llmsTxtPath) ? fs.readFileSync(llmsTxtPath, 'utf8') : '';

function getBlogBlock(slug) {
  const marker = `slug: '${slug}'`;
  const start = blogDataSource.indexOf(marker);
  if (start === -1) return '';
  const nextStart = blogDataSource.indexOf(`\n  {\n    slug: '`, start + marker.length);
  return blogDataSource.slice(start, nextStart === -1 ? blogDataSource.length : nextStart);
}

for (const slug of PRIORITY_TOOL_SLUGS) {
  const tool = toolBySlug.get(slug);
  ensure(Boolean(tool), `Missing priority tool record: ${slug}`);
  if (!tool) continue;

  ensure(tool.status === 'live', `Priority tool is not live: ${slug}`);
  ensure(Boolean(tool.quickAnswer), `Priority tool missing quickAnswer: ${slug}`);
  ensure(
    typeof tool.quickAnswer?.question === 'string' && tool.quickAnswer.question.trim().length > 0,
    `quickAnswer.question missing for ${slug}`
  );
  ensure(
    typeof tool.quickAnswer?.answer === 'string' && tool.quickAnswer.answer.trim().length > 0,
    `quickAnswer.answer missing for ${slug}`
  );

  const minimumFaqCount = 8;
  ensure(
    Array.isArray(tool.faqs) && tool.faqs.length >= minimumFaqCount,
    `Priority tool must have at least ${minimumFaqCount} FAQs: ${slug}`
  );
  ensure(typeof tool.lastReviewed === 'string' && tool.lastReviewed.trim().length > 0, `Priority tool missing lastReviewed: ${slug}`);

  const hasSourceMethodology = Array.isArray(tool.contentSections)
    && tool.contentSections.some((section) => /source and methodology/i.test(section.heading));

  if (slug === 'emergency-fund-calculator-india') {
    ensure(hasSourceMethodology, 'Emergency fund tool missing Source and Methodology section in data/tools.json');
    const sourceText = (tool.contentSections || [])
      .filter((section) => /source and methodology/i.test(section.heading))
      .map((section) => section.body)
      .join(' ')
      .toLowerCase();
    ensure(sourceText.includes('monthly essential expenses'), 'Emergency methodology text should mention monthly essential expenses');
    ensure(sourceText.includes('emi commitments'), 'Emergency methodology text should mention EMI commitments');
    ensure(sourceText.includes('current emergency savings'), 'Emergency methodology text should mention current emergency savings');
    ensure(sourceText.includes('target months'), 'Emergency methodology text should mention target months');
    ensure(sourceText.includes('monthly saving capacity'), 'Emergency methodology text should mention monthly saving capacity');
  }

  if (slug === 'personal-loan-emi-calculator-india') {
    ensure(
      Array.isArray(tool.faqs) && tool.faqs.length >= 10,
      'Personal loan tool must have at least 10 visible FAQs'
    );
    ensure(
      typeof tool.quickAnswer?.question === 'string'
        && /how is personal loan emi calculated\?/i.test(tool.quickAnswer.question),
      'Personal loan quickAnswer question is missing or misaligned'
    );
    ensure(
      toolPageSource.includes('PERSONAL_LOAN_ANSWER_ENGINE_SUMMARY')
        && toolPageSource.includes('id="answer-engine-summary"'),
      'Personal loan page is missing the dedicated Answer Engine Summary block'
    );
    ensure(
      toolPageSource.includes('Personal Loan EMI Calculator Facts')
        && toolPageSource.includes('id="personal-loan-calculator-facts"'),
      'Personal loan page is missing the Personal Loan EMI Calculator Facts table'
    );
    ensure(
      toolPageSource.includes('id="source-and-methodology"') && toolPageSource.includes('isPersonalLoanPage'),
      'Personal loan page is missing source-and-methodology rendering block'
    );
    ensure(
      toolPageSource.includes('standard reducing-balance EMI formula')
        && toolPageSource.includes('processing fee impact')
        && toolPageSource.includes('EMI burden'),
      'Personal loan methodology block is missing required formula/fee/burden wording'
    );
    ensure(
      /RupeeKit is not a lender/i.test(toolPageSource)
        && /live bank interest rates/i.test(toolPageSource),
      'Personal loan page is missing required educational disclaimer wording'
    );
    ensure(
      toolPageSource.includes("'@type': 'WebApplication'")
        && toolPageSource.includes("'@type': 'BreadcrumbList'"),
      'Personal loan page schema blocks for WebApplication or Breadcrumb are missing'
    );
  }

  if (slug === 'hra-exemption-calculator-india') {
    ensure(
      toolPageSource.includes('id="source-and-methodology"') && toolPageSource.includes('isHraPage'),
      'HRA page is missing source-and-methodology rendering block'
    );
    ensure(
      toolPageSource.includes('actual HRA')
        && toolPageSource.includes('rent paid minus 10% of salary')
        && toolPageSource.includes('city-based salary cap'),
      'HRA methodology block is missing required comparison wording'
    );
  }

  if (slug === 'sip-calculator-india') {
    ensure(hasSourceMethodology, 'SIP tool missing Source and Methodology section in data/tools.json');
    const sourceText = (tool.contentSections || [])
      .filter((section) => /source and methodology/i.test(section.heading))
      .map((section) => section.body)
      .join(' ')
      .toLowerCase();
    ensure(sourceText.includes('monthly sip amount'), 'SIP methodology should mention monthly SIP amount');
    ensure(sourceText.includes('expected annual return'), 'SIP methodology should mention expected annual return');
    ensure(sourceText.includes('investment duration'), 'SIP methodology should mention investment duration');
    ensure(sourceText.includes('monthly compounding-style projection'), 'SIP methodology should mention monthly compounding-style projection');
    ensure(
      toolPageSource.includes('SipEducationalContent') && toolPageSource.includes('isSipPage'),
      'SIP page rendering block is missing in app/tools/[slug]/page.tsx'
    );
    ensure(
      toolPageSource.includes('Answer Engine Summary')
        && toolPageSource.includes('id="answer-engine-summary"'),
      'SIP page is missing the Answer Engine Summary block'
    );
    ensure(
      toolPageSource.includes('What happens if you miss a SIP?')
        && toolPageSource.includes('Can you pause and restart SIP later?')
        && toolPageSource.includes('What is step-up SIP?')
        && toolPageSource.includes('How much SIP is needed for a goal?')
        && toolPageSource.includes('How does inflation affect SIP planning?')
        && toolPageSource.includes('Can EMI amount be redirected into SIP after loan closure?')
        && toolPageSource.includes('Is SIP return guaranteed?'),
      'SIP page is missing one or more citation-ready answer sections'
    );
    ensure(
      toolPageSource.includes('SIP Calculator Facts')
        && toolPageSource.includes('id="sip-calculator-facts"')
        && factsTableSource.includes('Topic')
        && factsTableSource.includes('RupeeKit explanation'),
      'SIP page is missing the SIP Calculator Facts table'
    );
    ensure(
      /optional step-up,\s*missed sip,\s*pause,\s*goal,\s*inflation,\s*and emi redirect assumptions/i.test(toolPageSource)
        && /does not recommend mutual funds/i.test(toolPageSource)
        && /does not fetch live fund returns/i.test(toolPageSource)
        && /does not guarantee outcomes/i.test(toolPageSource),
      'SIP source and methodology wording is missing required educational disclosures'
    );
    ensure(
      toolPageSource.includes('id="source-and-methodology"'),
      'SIP source-and-methodology section id is missing'
    );
    ensure(
      sipCalculatorSource.includes('Educational estimate only'),
      'SIP calculator should include a visible educational disclaimer'
    );
  }
}

ensure(fs.existsSync(llmsTxtPath), 'public/llms.txt file is missing');
ensure(llmsTxtSource.includes('# RupeeKit'), 'public/llms.txt should include the RupeeKit heading');
ensure(
  llmsTxtSource.includes('https://www.rupeekit.co.in/tools/sip-calculator-india'),
  'public/llms.txt should include the SIP calculator URL'
);

for (const tool of tools.filter((item) => item.status === 'live')) {
  ensure(
    llmsTxtSource.includes(`https://www.rupeekit.co.in/tools/${tool.slug}`),
    `public/llms.txt is missing live calculator URL: ${tool.slug}`
  );
}

ensure(
  llmsTxtSource.includes('https://www.rupeekit.co.in/llms-full.txt'),
  'public/llms.txt should link to the full machine-readable catalog'
);
ensure(
  llmsFullRouteSource.includes('buildLlmsFullCatalog')
    && llmsFullRouteSource.includes("'Content-Type': 'text/plain; charset=utf-8'"),
  'llms-full.txt route should return the generated catalog as plain text'
);
ensure(
  llmsFullCatalogSource.includes('getLiveTools')
    && llmsFullCatalogSource.includes('calculatorGuides')
    && llmsFullCatalogSource.includes('blogPosts')
    && llmsFullCatalogSource.includes('financialUpdates'),
  'Full content catalog must derive calculators, guides, articles, and explainers from source data'
);

ensure(
  rootLayoutSource.includes('"@graph"')
    && rootLayoutSource.includes('"@type": "Organization"')
    && rootLayoutSource.includes('"@type": "WebSite"')
    && rootLayoutSource.includes('/#organization')
    && rootLayoutSource.includes('/#website'),
  'Root JSON-LD should define linked Organization and WebSite entities'
);
ensure(
  guidePageSource.includes("inLanguage: 'en-IN'")
    && guidePageSource.includes('citation: cluster.sources.map')
    && guidePageSource.includes("isPartOf: { '@id': `${SITE_URL}/#website` }"),
  'Guide Article schema should identify language, site entity, and visible primary-source citations'
);
ensure(
  toolPageSource.includes("browserRequirements: 'Requires a JavaScript-enabled web browser.'")
    && toolPageSource.includes("publisher: {\n      '@id': `${SITE_URL}/#organization`,"),
  'Calculator WebApplication schema should link to the site publisher and state browser requirements'
);
ensure(
  robotsSource.includes('disallow: "/api/"'),
  'robots.txt generation should keep internal API routes out of crawl paths'
);

ensure(
  toolPageSource.includes('@type\': \'FAQPage\'') && toolPageSource.includes('tool.faqs.map((faq) =>'),
  'Tool FAQPage schema should be generated from visible tool.faqs'
);
ensure(
  toolPageSource.includes('tool.faqs.length > 0'),
  'Tool FAQPage schema should only render when visible FAQs exist'
);
ensure(
  toolPageSource.includes('buildFallbackQuickAnswer') && toolPageSource.includes('effectiveQuickAnswer'),
  'Tool page should provide quick answer fallback support for all calculators'
);
ensure(
  toolPageSource.includes('id="answer-engine-summary"'),
  'Tool page should include a visible Answer Engine Summary block'
);
ensure(
  toolPageSource.includes('id="calculator-facts"'),
  'Tool page should include a visible Calculator Facts section for non-SIP calculators'
);
ensure(
  toolPageSource.includes('showGenericSourceMethodology') && toolPageSource.includes('id="source-and-methodology"'),
  'Tool page should include generic source-and-methodology fallback handling'
);
ensure(
  dedicatedIncomeTaxToolSource.includes('QuickAnswerBox')
    && dedicatedIncomeTaxToolSource.includes('id="answer-engine-summary"')
    && dedicatedIncomeTaxToolSource.includes('id="calculator-facts"')
    && dedicatedIncomeTaxToolSource.includes('id="source-and-methodology"'),
  'Dedicated income-tax calculator page should include quick answer, answer summary, facts, and methodology sections'
);
ensure(
  dedicatedIncomeTaxToolSource.includes('const faqSchema = faqs.length > 0 ?'),
  'Dedicated income-tax FAQPage schema must be conditional on visible FAQs'
);
ensure(
  dedicatedIncomeTaxToolSource.includes("inLanguage: 'en-IN'")
    && dedicatedIncomeTaxToolSource.includes("publisher: { '@id': `${SITE_URL}/#organization` }"),
  'Dedicated income-tax WebApplication schema should link to the site publisher and identify language'
);
ensure(
  [...dedicatedIncomeTaxToolSource.matchAll(/question:\s*'[^']+'/g)].length >= 8,
  'Dedicated income-tax calculator should include at least 8 visible FAQs'
);

const disallowedSchemaTokens = [
  /@type['"]?\s*:\s*['"]Product['"]/,
  /@type['"]?\s*:\s*['"]Review['"]/,
  /@type['"]?\s*:\s*['"]AggregateRating['"]/,
  /ratingValue/i,
];

for (const pattern of disallowedSchemaTokens) {
  const combinedSources = `${toolPageSource}\n${blogPageSource}\n${blogLayoutSource}\n${dedicatedIncomeTaxToolSource}`;
  ensure(!pattern.test(combinedSources), `Disallowed schema token found in page schema sources: ${pattern}`);
}

const staticRouteBlock = sitemapSource.match(/const staticRoutes = \[([\s\S]*?)\];/);
const staticRoutes = new Set(
  (staticRouteBlock?.[1]?.match(/'([^']*)'/g) || []).map((entry) => entry.slice(1, -1))
);

const liveToolPaths = tools
  .filter((tool) => tool.status === 'live')
  .map((tool) => `/tools/${tool.slug}`);

const blogSlugs = new Set(
  [...blogDataSource.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
);
const blogPaths = [...blogSlugs].map((slug) => `/blog/${slug}`);

const sitemapPaths = new Set([...staticRoutes, ...liveToolPaths, ...blogPaths]);

const priorityPaths = [
  '/tools/emergency-fund-calculator-india',
  '/tools/personal-loan-emi-calculator-india',
  '/tools/hra-exemption-calculator-india',
  '/tools/sip-calculator-india',
  '/tools/fd-calculator-india',
  '/tools/income-tax-calculator-old-vs-new-regime-india',
  '/blog/how-much-emergency-fund',
  '/blog/itr-2-ay-2026-27-filing-guide',
  '/blog/income-tax-calculator-2026-calculator-guide',
  '/resources',
];

for (const pagePath of priorityPaths) {
  ensure(sitemapPaths.has(pagePath), `Priority path missing from sitemap derivation: ${pagePath}`);
}
ensure(staticRoutes.has(''), 'Homepage root route is missing from sitemap staticRoutes');
ensure(
  !sitemapSource.includes("route === '' ? new Date()"),
  'Homepage sitemap lastModified must be derived from real content dates, not generation time'
);
ensure(
  sitemapSource.includes("['', latestSiteDate]")
    && sitemapSource.includes("['/tools', latestToolDate]")
    && sitemapSource.includes("['/guides', latestGuideDate]"),
  'Sitemap hubs should use the newest verifiable date from their underlying content'
);

for (const slug of PRIORITY_BLOG_SLUGS) {
  ensure(blogSlugs.has(slug), `Priority blog slug missing from data/blog-posts.ts: ${slug}`);

  const block = getBlogBlock(slug);
  ensure(block.length > 0, `Unable to read blog block from data/blog-posts.ts for: ${slug}`);
  ensure(/quickAnswer:\s*\{/.test(block), `Priority blog missing quickAnswer config: ${slug}`);
  ensure(/question:\s*'[^']+/.test(block), `Priority blog quickAnswer.question missing: ${slug}`);
  ensure(/answer:\s*'[^']+/.test(block), `Priority blog quickAnswer.answer missing: ${slug}`);
  ensure(/answerEngineSummary:\s*'[^']+/.test(block), `Priority blog missing answerEngineSummary: ${slug}`);
  ensure(
    [...block.matchAll(/question:\s*'[^']+'/g)].length >= 8,
    `Priority blog must have at least 8 FAQs: ${slug}`
  );
}

ensure(
  blogLayoutSource.includes('QuickAnswerBox') && blogLayoutSource.includes('post.quickAnswer'),
  'Blog quick answer rendering is missing in BlogArticleLayout'
);
ensure(
  blogLayoutSource.includes('AnswerEngineSummary') && blogLayoutSource.includes('answerEngineSummary'),
  'Blog answer engine summary rendering is missing in BlogArticleLayout'
);
ensure(
  blogLayoutSource.includes('Last updated:') && blogLayoutSource.includes('Educational information only.'),
  'Blog layout should show last updated and educational note near the top'
);
const blogQuickAnswerIndex = blogLayoutSource.indexOf('post.quickAnswer');
const blogAnswerSummaryIndex = blogLayoutSource.indexOf('<AnswerEngineSummary');
const blogSectionsIndex = blogLayoutSource.indexOf('/* Sections */');
ensure(
  blogQuickAnswerIndex !== -1
    && blogAnswerSummaryIndex !== -1
    && blogSectionsIndex !== -1
    && blogQuickAnswerIndex < blogAnswerSummaryIndex
    && blogAnswerSummaryIndex < blogSectionsIndex,
  'Blog quick answer should render before long-form sections'
);

ensure(
  blogPageSource.includes("'@type': 'Article'"),
  'Blog page is missing Article schema'
);
ensure(
  blogPageSource.includes("mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }")
    && blogPageSource.includes("inLanguage: 'en-IN'")
    && blogPageSource.includes('citation: post.officialSources.map')
    && blogPageSource.includes("isPartOf: { '@id': `${siteUrl}/#website` }"),
  'Blog Article schema should identify the canonical page, language, site entity, and visible citations'
);

ensure(
  // Accepts either the long form or the optional-chained `post.faqs?.length`
  // shorthand the page was later refactored to. Both gate the FAQPage schema on
  // FAQs that are actually rendered, which is what this check is protecting.
  /const faqSchema = post\.faqs(\?\.length|\s*&&\s*post\.faqs\.length > 0)\s*\?/.test(
    blogPageSource
  ),
  'FAQPage schema must be conditional on visible FAQs'
);
ensure(
  blogLayoutSource.includes('<FAQSection faqs={post.faqs} />'),
  'Visible FAQ section binding is missing from blog layout'
);
ensure(
  blogFaqSectionSource.includes('if (!faqs || faqs.length === 0) return null;'),
  'FAQSection visibility guard is missing for empty FAQ arrays'
);

ensure(homePageSource.includes("alternates: languageAlternates('/')"), 'Homepage must use the shared self-canonical and language-alternate helper (also verified in rendered output)');
ensure(
  resourcesPageSource.includes('canonical: `${SITE_URL}/resources`'),
  'Resources page canonical is missing or not self-canonical'
);
ensure(
  toolPageSource.includes('canonical: pageUrl') && toolPageSource.includes('const pageUrl = `${SITE_URL}/tools/${tool.slug}`;'),
  'Tool page canonical is missing or not self-canonical'
);
ensure(
  blogPageSource.includes('canonical: pageUrl') && blogPageSource.includes('const pageUrl = `${siteUrl}/blog/${post.slug}`;'),
  'Blog page canonical is missing or not self-canonical'
);

if (errors > 0) {
  console.error(`\nAI SEO readiness validation failed with ${errors} issue(s).`);
  process.exit(1);
}

console.log('PASS: AI SEO readiness validation passed.');
