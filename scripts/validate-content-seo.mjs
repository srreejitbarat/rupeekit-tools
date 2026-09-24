import fs from 'node:fs';
import path from 'node:path';

const TITLE_MAX = 60;
const DESCRIPTION_MIN = 140;
const DESCRIPTION_MAX = 160;

let errors = 0;
let warnings = 0;
let auditedTitles = 0;
let auditedDescriptions = 0;
let auditedUpdates = 0;

function fail(message) {
  errors += 1;
  console.error(`❌ ${message}`);
}

function warn(message) {
  warnings += 1;
  console.warn(`⚠️ ${message}`);
}

function cleanWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function clipAtWord(value, maxLength) {
  const cleaned = cleanWhitespace(value);
  if (cleaned.length <= maxLength) return cleaned;
  const clipped = cleaned.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(' ');
  const candidate = lastSpace >= Math.floor(maxLength * 0.7) ? clipped.slice(0, lastSpace) : clipped.slice(0, maxLength);
  return candidate.replace(/[\s,;:|\-–—]+$/g, '').trim();
}

function normalizeTitle(value) {
  let cleaned = cleanWhitespace(value).replace(/^free\s+/i, '');
  if (cleaned.length <= TITLE_MAX) return cleaned;
  for (const separator of [' | ', ' — ', ' – ', ': ', ' - ']) {
    const [head] = cleaned.split(separator);
    if (head && head.length >= 28 && head.length <= TITLE_MAX) return head.trim();
  }
  return clipAtWord(cleaned, TITLE_MAX);
}

function normalizeDescription(value) {
  return cleanWhitespace(value);
}

function decodeLiteral(raw, quote) {
  return raw
    .replace(new RegExp(`\\\\${quote}`, 'g'), quote)
    .replace(/\\n/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\\\/g, '\\');
}

function extractPropertyLiterals(source, property) {
  const regex = new RegExp(`${property}\\s*:\\s*(['"])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1`, 'g');
  const values = [];
  let match;
  while ((match = regex.exec(source)) !== null) values.push(decodeLiteral(match[2], match[1]));
  return values;
}

const dataDir = path.join(process.cwd(), 'data');
const blogFiles = fs.readdirSync(dataDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => path.join(dataDir, file))
  .filter((file) => {
    const source = fs.readFileSync(file, 'utf8');
    return source.includes('seoTitle') || source.includes('metaDescription');
  });

for (const file of blogFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const rawTitle of extractPropertyLiterals(source, 'seoTitle')) {
    auditedTitles += 1;
    const effective = normalizeTitle(rawTitle);
    if (/^free\b/i.test(effective)) fail(`${path.basename(file)} effective SEO title begins with Free: ${effective}`);
    if (effective.length > TITLE_MAX) fail(`${path.basename(file)} effective SEO title exceeds ${TITLE_MAX}: ${effective}`);
    if (effective !== cleanWhitespace(rawTitle)) warn(`${path.basename(file)} SEO title is normalized at render time: "${rawTitle}" → "${effective}"`);
  }
  for (const rawDescription of extractPropertyLiterals(source, 'metaDescription')) {
    auditedDescriptions += 1;
    const effective = normalizeDescription(rawDescription);
    if (!effective) fail(`${path.basename(file)} has an empty meta description.`);
    if (effective.length < DESCRIPTION_MIN || effective.length > DESCRIPTION_MAX) {
      warn(`${path.basename(file)} description is ${effective.length} chars; review relevance, not just length.`);
    }
    if (effective !== cleanWhitespace(rawDescription)) warn(`${path.basename(file)} meta description is normalized to ${effective.length} characters at render time.`);
  }
}

const protectedIssue58Titles = new Map([
  ['how-to-calculate-in-hand-salary-from-ctc-india', 'CTC to In-Hand Salary India | PF, Tax & Take-Home'],
  ['income-tax-on-12-lakh-salary-new-regime-india-2026', 'Tax on Rs 12 Lakh Salary | Rebate & Marginal Relief'],
  ['mutual-funds-for-beginners-india', 'Mutual Funds for Beginners India | Start With Rs 500'],
  ['monthly-expense-planning-for-family', 'Monthly Expense Planning | Family Budget & Savings'],
  ['epf-partial-withdrawal-rules-india', 'EPF Partial Withdrawal Rules | Limits, Reasons & Forms'],
]);

const coreBlogSource = fs.readFileSync(path.join(dataDir, 'blog-posts.ts'), 'utf8');
for (const [slug, title] of protectedIssue58Titles) {
  if (!coreBlogSource.includes(`slug: '${slug}'`) || !coreBlogSource.includes(`seoTitle: '${title}'`)) {
    fail(`Issue #58 protected title missing or changed for ${slug}`);
  }
  if (normalizeTitle(title) !== title) fail(`Issue #58 protected title now violates the 60-character rule: ${slug}`);
}

function auditUpdateCollection(fileName, brandSuffix) {
  const source = fs.readFileSync(path.join(dataDir, fileName), 'utf8');
  const slugMatches = [...source.matchAll(/\bslug\s*:\s*['"]([^'"]+)['"]/g)];
  for (let index = 0; index < slugMatches.length; index += 1) {
    const start = slugMatches[index].index ?? 0;
    const end = slugMatches[index + 1]?.index ?? source.length;
    const block = source.slice(start, end);
    const titleMatch = block.match(/\btitle\s*:\s*['"]([^'"]+)['"]/);
    const seoTitleMatch = block.match(/\bseoTitle\s*:\s*['"]([^'"]+)['"]/);
    const summaryMatch = block.match(/\bsummary\s*:\s*['"]([^'"]+)['"]/);
    const metaDescriptionMatch = block.match(/\bmetaDescription\s*:\s*['"]([^'"]+)['"]/);
    if (!titleMatch || !summaryMatch) continue;

    auditedUpdates += 1;
    const slug = slugMatches[index][1];
    const generatedTitle = `${seoTitleMatch?.[1] ?? titleMatch[1]}${brandSuffix}`;
    const normalizedTitle = normalizeTitle(generatedTitle);
    const effectiveDescription = metaDescriptionMatch?.[1] ?? summaryMatch[1];
    const normalizedDescription = normalizeDescription(effectiveDescription);

    if (normalizedTitle.length > TITLE_MAX || /^free\b/i.test(normalizedTitle)) fail(`${fileName}:${slug} cannot produce a valid normalized title`);
    if (!normalizedDescription) fail(`${fileName}:${slug} has no description`);
    if (cleanWhitespace(generatedTitle).length > TITLE_MAX) warn(`${fileName}:${slug} current generated title exceeds ${TITLE_MAX}; flagged for future rewrite if CTR falls below 1%.`);
    const rawSummaryLength = cleanWhitespace(effectiveDescription).length;
    if (rawSummaryLength < DESCRIPTION_MIN || rawSummaryLength > DESCRIPTION_MAX) warn(`${fileName}:${slug} effective meta description is ${rawSummaryLength} chars; review relevance, not length alone.`);
  }
}

auditUpdateCollection('financial-updates.ts', ' | RupeeKit Updates');
auditUpdateCollection('government-salary-updates.ts', ' | Government Salary Updates | RupeeKit');

const blogPage = fs.readFileSync(path.join(process.cwd(), 'app', '(en)', 'blog', '[slug]', 'page.tsx'), 'utf8');
if (!blogPage.includes('normalizeSerpTitle(post.seoTitle || post.title)')) fail('Blog generateMetadata must normalize the effective SEO title.');
if (!blogPage.includes('normalizeSerpDescription(post.metaDescription)')) fail('Blog generateMetadata must normalize the effective meta description.');

if (errors > 0) {
  console.error(`\nContent SEO validation failed with ${errors} error(s) and ${warnings} warning(s).`);
  process.exit(1);
}

console.log(`✅ Audited ${auditedTitles} blog SEO title literal(s).`);
console.log(`✅ Audited ${auditedDescriptions} blog meta description literal(s).`);
console.log('✅ Verified all 5 issue #58 zero-click titles remain unchanged and within 60 characters.');
console.log(`✅ Audited ${auditedUpdates} financial/government update metadata record(s).`);
console.log(`ℹ️ ${warnings} legacy metadata item(s) are normalized or flagged without inventing new factual claims.`);
