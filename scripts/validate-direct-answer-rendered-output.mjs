import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const directAnswers = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'direct-answer-overrides-2026-08-17.json'), 'utf8'),
);

const positionBandBlogs = [
  '/blog/itr-2-ay-2026-27-filing-guide',
  '/blog/zerodha-vs-upstox-vs-angel-one-demat-account',
  '/blog/new-labour-code-gratuity-rules-india-2026',
  '/blog/monthly-expense-planning-for-family',
  '/blog/epf-partial-withdrawal-rules-india',
];

const errors = [];

function renderedHtmlFor(route) {
  const htmlPath = path.join(root, '.next', 'server', 'app', `${route.replace(/^\//, '')}.html`);
  if (!fs.existsSync(htmlPath)) {
    errors.push(`Missing prerendered HTML for ${route}`);
    return '';
  }
  return fs.readFileSync(htmlPath, 'utf8');
}

for (const [slug, answer] of Object.entries(directAnswers)) {
  const route = `/tools/${slug}`;
  const html = renderedHtmlFor(route);
  if (!html) continue;

  const answerIndex = html.indexOf(answer);
  if (answerIndex < 0) {
    errors.push(`Direct answer text is missing from rendered HTML for ${route}`);
    continue;
  }

  // Calculator UI is client-interactive but server-rendered. A direct answer must
  // occur before the first form so the answer is visible before calculator inputs.
  const formIndex = html.indexOf('<form');
  if (formIndex >= 0 && answerIndex > formIndex) {
    errors.push(`Direct answer appears after calculator inputs for ${route}`);
  }
}

for (const route of positionBandBlogs) {
  const html = renderedHtmlFor(route);
  if (!html) continue;

  const marker = 'data-direct-answer="server-rendered"';
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) {
    errors.push(`Missing server-rendered direct-answer marker for ${route}`);
    continue;
  }

  const articleIndex = html.indexOf('<article');
  if (articleIndex >= 0 && markerIndex > articleIndex) {
    errors.push(`Direct answer is not above the main article body for ${route}`);
  }
}

const blogLayoutSource = fs.readFileSync(
  path.join(root, 'components', 'blog', 'BlogArticleLayout.tsx'),
  'utf8',
);
if (/^["']use client["'];/m.test(blogLayoutSource)) {
  errors.push('BlogArticleLayout must remain a server component so direct answers are in the initial HTML.');
}

if (errors.length) {
  console.error('Rendered direct-answer validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Rendered direct-answer validation passed for ${Object.keys(directAnswers).length} calculator pages and ${positionBandBlogs.length} blog pages.`,
);
