// Enforces the CTR rules on what Google actually receives for every tool page.
//
// The title and description a tool page ships are assembled from three layers:
// the raw entry in a data/*.json tool file, the Aug 15 CTR override, and the
// per-slug override in app/tools/[slug]/page.tsx. Checking any single layer
// gives the wrong answer — a data-layer title that breaks the rules may be
// repaired by page.tsx, and a compliant data-layer title may be replaced by a
// non-compliant one. Only the prerendered HTML settles it.
//
// This exists because the Aug 15 CTR pass covered the five dated tool files and
// growth-tools.json, but nothing held data/tools.json to the same rules. Titles
// there kept shipping over the 60-character SERP limit and with a leading
// "Free", which Google frequently rewrites. Validating the rendered output
// closes that gap for every tool file, present and future.

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsDir = path.join(root, '.next', 'server', 'app', 'tools');

const TITLE_MAX = 60;
const DESCRIPTION_MIN = 140;
const DESCRIPTION_MAX = 160;

const errors = [];

/**
 * Titles are compared at their rendered length, so HTML entities must be
 * decoded first: "&amp;" occupies one character in a SERP, not five.
 */
function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ');
}

if (!fs.existsSync(toolsDir)) {
  console.error('❌ No prerendered tool pages found. Run this after next build.');
  process.exit(1);
}

const pages = fs.readdirSync(toolsDir).filter((file) => file.endsWith('.html'));

if (pages.length === 0) {
  console.error('❌ No prerendered tool pages found in .next/server/app/tools.');
  process.exit(1);
}

for (const file of pages) {
  const slug = file.replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(toolsDir, file), 'utf8');

  const title = decodeEntities((html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '');
  const description = decodeEntities(
    (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? ''
  );

  if (!title) {
    errors.push(`${slug}: rendered page has no <title>`);
  } else {
    if (title.length > TITLE_MAX) {
      errors.push(`${slug}: rendered title is ${title.length} characters, over the ${TITLE_MAX} limit — "${title}"`);
    }
    if (/^free\b/i.test(title.trim())) {
      errors.push(`${slug}: rendered title opens with "Free", which spends the highest-value SERP pixels on a non-differentiating word — "${title}"`);
    }
  }

  if (!description) {
    errors.push(`${slug}: rendered page has no meta description`);
  } else if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
    console.warn(`${slug}: description is ${description.length} characters; review for relevance. Length is advisory.`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`❌ ${error}`);
  console.error(`\nRendered tool SERP validation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`✅ Rendered SERP validation passed for ${pages.length} tool pages (title ≤ ${TITLE_MAX}, no "Free" prefix, nonempty description; description length is advisory).`);
