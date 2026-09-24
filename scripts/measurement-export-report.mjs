#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i += 1; }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ''])));
}

function cleanGa4Export(text) {
  return text.split(/\r?\n/).filter((line) => !line.startsWith('#')).join('\n').trim();
}

function parsePercent(value) {
  return Number(String(value || '0').replace('%', '')) / 100;
}

function parseGa4Date(text, label) {
  const match = text.match(new RegExp(`# ${label}: (\\d{8})`));
  if (!match) return null;
  const raw = match[1];
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function inclusiveDays(start, end) {
  if (!start || !end) return null;
  return Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;
}

function summariseGsc(chartRows, pageRows) {
  const dates = chartRows.map((r) => r.Date).filter(Boolean).sort();
  const startDate = dates[0] || null;
  const endDate = dates.at(-1) || null;
  const totals = chartRows.reduce((acc, row) => {
    const impressions = Number(row.Impressions || 0);
    acc.clicks += Number(row.Clicks || 0);
    acc.impressions += impressions;
    acc.weightedPosition += Number(row.Position || 0) * impressions;
    return acc;
  }, { clicks: 0, impressions: 0, weightedPosition: 0 });
  const pages = pageRows.map((row) => ({
    page: row['Top pages'],
    clicks: Number(row.Clicks || 0),
    impressions: Number(row.Impressions || 0),
    ctr: parsePercent(row.CTR),
    position: Number(row.Position || 0),
  }));
  return {
    dateRange: { startDate, endDate, days: inclusiveDays(startDate, endDate) },
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: totals.impressions ? totals.clicks / totals.impressions : 0,
      averagePosition: totals.impressions ? totals.weightedPosition / totals.impressions : 0,
    },
    pageRows: pages.length,
    zeroClickPages50PlusImpressions: pages.filter((row) => row.clicks === 0 && row.impressions >= 50),
    topPagesByImpressions: [...pages].sort((a, b) => b.impressions - a.impressions).slice(0, 25),
    note: 'Headline totals come from Chart.csv, not by summing query or page exports. Page rows are retained only for page-level analysis.',
  };
}

function summariseGa4(rawText) {
  const startDate = parseGa4Date(rawText, 'Start date');
  const endDate = parseGa4Date(rawText, 'End date');
  const rows = toObjects(parseCsv(cleanGa4Export(rawText)));
  const additive = rows.reduce((acc, row) => {
    acc.views += Number(row.Views || 0);
    acc.eventCount += Number(row['Event count'] || 0);
    acc.keyEvents += Number(row['Key events'] || 0);
    acc.totalRevenue += Number(row['Total revenue'] || 0);
    return acc;
  }, { views: 0, eventCount: 0, keyEvents: 0, totalRevenue: 0 });
  return {
    dateRange: { startDate, endDate, days: inclusiveDays(startDate, endDate) },
    pageRows: rows.length,
    additiveTotalsAvailableFromThisExport: additive,
    unavailableFromPagesAndScreensExport: ['sessions', 'engagedSessions', 'calculatorCompletion', 'toolCtaClicks'],
    note: 'Active users and average engagement time are not summed because those page-level metrics are non-additive. Export GA4 overview and event breakdowns for the required Day-38 metrics.',
  };
}

async function copyRaw(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ['gsc-chart', 'gsc-pages', 'ga4-pages', 'as-of'];
  const missing = required.filter((key) => !args[key]);
  if (missing.length) throw new Error(`Missing required argument(s): ${missing.map((key) => `--${key}`).join(', ')}`);

  const [chartText, pagesText, ga4Text] = await Promise.all([
    fs.readFile(args['gsc-chart'], 'utf8'),
    fs.readFile(args['gsc-pages'], 'utf8'),
    fs.readFile(args['ga4-pages'], 'utf8'),
  ]);
  const gsc = summariseGsc(toObjects(parseCsv(chartText.trim())), toObjects(parseCsv(pagesText.trim())));
  const ga4 = summariseGa4(ga4Text);
  const expectedDays = Number(args['expected-days'] || 28);
  const gscComplete = gsc.dateRange.days === expectedDays;
  const ga4Complete = ga4.dateRange.days === expectedDays;
  const requiredGa4MetricsComplete = ga4.unavailableFromPagesAndScreensExport.length === 0;
  const authoritative = gscComplete && ga4Complete && requiredGa4MetricsComplete;

  const outDir = args.output || path.join('automation', 'reports', 'measurement', args['as-of']);
  await fs.mkdir(outDir, { recursive: true });
  await Promise.all([
    copyRaw(args['gsc-chart'], path.join(outDir, 'raw', 'gsc-chart.csv')),
    copyRaw(args['gsc-pages'], path.join(outDir, 'raw', 'gsc-pages.csv')),
    copyRaw(args['ga4-pages'], path.join(outDir, 'raw', 'ga4-pages-and-screens.csv')),
  ]);

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    asOfDate: args['as-of'],
    expectedDays,
    status: authoritative ? 'authoritative' : 'partial',
    authoritative,
    blockers: [
      ...(!gscComplete ? [`GSC export is ${gsc.dateRange.days} days; expected ${expectedDays}.`] : []),
      ...(!ga4Complete ? [`GA4 export is ${ga4.dateRange.days} days; expected ${expectedDays}.`] : []),
      ...(!requiredGa4MetricsComplete ? ['GA4 Pages & Screens export does not contain sessions, engaged sessions, calculator completion or CTA-click breakdowns.'] : []),
    ],
    gsc,
    ga4,
  };
  await fs.writeFile(path.join(outDir, 'summary.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.join(outDir, 'summary.json')}`);
  console.log(`Status: ${report.status}`);
  if (!authoritative && !args['allow-partial']) {
    throw new Error(`Measurement inputs are incomplete: ${report.blockers.join(' ')}`);
  }
}

main().catch((error) => {
  console.error(`measurement-export-report: ${error.message}`);
  process.exitCode = 1;
});
