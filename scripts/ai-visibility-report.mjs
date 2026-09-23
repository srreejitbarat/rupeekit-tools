#!/usr/bin/env node
// Combine first-party exports and a small manual question sample; missing inputs stay null, never zero.
import fs from 'node:fs/promises';
import path from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i += 1) {
  if (!process.argv[i].startsWith('--')) continue;
  const key = process.argv[i].slice(2);
  args[key] = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
}
const asOf = args['as-of'] || new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error('--as-of must be YYYY-MM-DD');
const output = args.output || `automation/reports/ai-visibility/${asOf}/summary.json`;
const questions = JSON.parse(await fs.readFile(new URL('../data/ai-visibility-questions.json', import.meta.url), 'utf8'));

function csv(text) {
  const records = [];
  let field = '', row = [], quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted && ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { row.push(field); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.some((cell) => cell !== '')) records.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (field || row.length) { row.push(field); records.push(row); }
  if (!records.length) return [];
  const [headers, ...values] = records;
  return values.map((cells) => Object.fromEntries(headers.map((h, i) => [h.trim(), cells[i] ?? ''])));
}
async function readCsv(key) {
  if (!args[key]) return null;
  const raw = await fs.readFile(args[key], 'utf8');
  const cleaned = raw.split(/\r?\n/).filter((line) => !line.startsWith('#')).join('\n').trim().replace(/^\uFEFF/, '');
  const expected = {
    'gsc-ai-chart': ['Date', 'Impressions'],
    'gsc-ai-pages': ['Top pages', 'Impressions'],
    'gsc-web-pages': ['Top pages', 'Clicks', 'Impressions'],
    'ga4-pages': ['Page path and screen class', 'Views', 'Average engagement time per active user'],
    observations: ['date', 'questionId', 'locale', 'device', 'aiOverviewShown', 'rupeekitCited', 'citedUrl'],
  }[key];
  const header = cleaned.split('\n', 1)[0]?.split(',').map((value) => value.trim()) || [];
  const missing = expected.filter((field) => !header.includes(field));
  if (missing.length) throw new Error(`${key} is missing column(s): ${missing.join(', ')}`);
  return csv(cleaned);
}
const [aiChart, aiPages, webPages, ga4Pages, observations] = await Promise.all([
  readCsv('gsc-ai-chart'), readCsv('gsc-ai-pages'), readCsv('gsc-web-pages'), readCsv('ga4-pages'), readCsv('observations'),
]);
const number = (v) => Number(String(v || '0').replace(/,/g, ''));
const byPath = (rows, label) => new Map((rows || []).map((row) => [new URL(row[label], 'https://www.rupeekit.co.in').pathname.replace(/\/$/, ''), row]));
const aiByPath = byPath(aiPages, 'Top pages');
const webByPath = byPath(webPages, 'Top pages');
const ga4ByPath = byPath(ga4Pages, 'Page path and screen class');
const knownIds = new Set(questions.map((q) => q.id));
for (const row of observations || []) {
  if (!knownIds.has(row.questionId)) throw new Error(`Unknown questionId: ${row.questionId}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new Error(`Invalid observation date: ${row.date}`);
  if (!['yes', 'no'].includes(row.aiOverviewShown)) throw new Error(`Expected yes/no aiOverviewShown: ${row.questionId}`);
  if (!['yes', 'no'].includes(row.rupeekitCited)) throw new Error(`Expected yes/no rupeekitCited: ${row.questionId}`);
  if (row.rupeekitCited === 'yes' && (row.aiOverviewShown !== 'yes' || !/^https:\/\/(www\.)?rupeekit\.co\.in\//.test(row.citedUrl || ''))) {
    throw new Error(`A RupeeKit citation needs an AI Overview and a matching URL: ${row.questionId}`);
  }
}
const pages = [...new Set(questions.map((q) => q.guidePath))].map((pagePath) => {
  const ai = aiByPath.get(pagePath), web = webByPath.get(pagePath), ga4 = ga4ByPath.get(pagePath);
  return {
    path: pagePath,
    generativeAiImpressions: aiPages ? number(ai?.Impressions) : null,
    webSearchClicks: webPages ? number(web?.Clicks) : null,
    webSearchImpressions: webPages ? number(web?.Impressions) : null,
    ga4Views: ga4Pages ? number(ga4?.Views) : null,
    ga4AverageEngagementSecondsPerActiveUser: ga4Pages && ga4 ? number(ga4['Average engagement time per active user']) : null,
  };
});
const totalAiImpressions = aiChart ? aiChart.reduce((sum, row) => sum + number(row.Impressions), 0) : null;
const manual = questions.map((q) => {
  const checks = (observations || []).filter((o) => o.questionId === q.id);
  return { ...q, observations: observations ? checks.length : null, aiOverviewObserved: observations ? checks.filter((o) => o.aiOverviewShown === 'yes').length : null, rupeekitCited: observations ? checks.filter((o) => o.rupeekitCited === 'yes').length : null, latestObservation: checks.sort((a, b) => b.date.localeCompare(a.date))[0] || null };
});
const missing = ['gsc-ai-chart', 'gsc-ai-pages', 'gsc-web-pages', 'ga4-pages', 'observations'].filter((key) => !args[key]);
const report = {
  schemaVersion: 1, asOf, generatedAt: new Date().toISOString(),
  status: missing.length ? 'partial' : 'complete-inputs', missingInputs: missing,
  generativeAiChartImpressions: totalAiImpressions,
  chartDates: aiChart ? { first: aiChart[0]?.Date || null, last: aiChart.at(-1)?.Date || null } : null,
  pages, questions: manual,
  interpretation: [
    'The separate Search Console generative AI report counts impressions for AI Overviews and AI Mode; it does not expose query-level citations or clicks.',
    'Web Search clicks and GA4 engagement are separate metrics. Do not attribute them to AI Overview impressions.',
    'Page table totals need not equal the property-level chart total because their aggregation differs.',
    'Manual observations are a small location/device-dependent sample, not a Google ranking or a complete citation count.',
    'Missing export files produce null metrics. A zero is used only when a provided export contains no matching page rows.',
  ],
};
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${output}; ${pages.length} pages; ${questions.length} questions; status ${report.status}`);
