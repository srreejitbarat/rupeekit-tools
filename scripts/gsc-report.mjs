#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GSC_API = 'https://searchconsole.googleapis.com/webmasters/v3';
const GA4_API = 'https://analyticsdata.googleapis.com/v1beta';
const ROW_LIMIT = 25000;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function assertIsoDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    throw new Error(`${label} must be YYYY-MM-DD.`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} is not a valid calendar date.`);
  }
}

function dateDiffInclusive(start, end) {
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  if (endMs < startMs) throw new Error('End date must be on or after start date.');
  return Math.floor((endMs - startMs) / 86400000) + 1;
}

function shiftDate(date, days) {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function previousPeriod(start, end) {
  const days = dateDiffInclusive(start, end);
  return {
    startDate: shiftDate(start, -days),
    endDate: shiftDate(start, -1),
  };
}

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken({ clientEmail, privateKey, scopes }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: clientEmail,
    scope: scopes.join(' '),
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), privateKey);
  const assertion = `${unsigned}.${base64Url(signature)}`;

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await response.json();
  if (!response.ok || !json.access_token) {
    throw new Error(`Google OAuth token request failed (${response.status}): ${json.error_description || json.error || 'unknown error'}`);
  }
  return json.access_token;
}

async function queryGscPageRows({ token, siteUrl, startDate, endDate }) {
  const rows = [];
  let startRow = 0;

  while (true) {
    const endpoint = `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        type: 'web',
        dataState: 'final',
        rowLimit: ROW_LIMIT,
        startRow,
      }),
    });
    const json = await response.json();
    if (!response.ok) {
      const message = json?.error?.message || 'unknown Search Console API error';
      throw new Error(`Search Console query failed (${response.status}): ${message}`);
    }
    const batch = Array.isArray(json.rows) ? json.rows : [];
    rows.push(...batch);
    if (batch.length < ROW_LIMIT) break;
    startRow += batch.length;
  }

  return rows.map((row) => ({
    page: row.keys?.[0] || '(unknown)',
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    ctr: Number(row.ctr || 0),
    position: Number(row.position || 0),
  }));
}

function safeCtr(clicks, impressions) {
  return impressions > 0 ? clicks / impressions : 0;
}

function round(value, digits = 6) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function summariseRows(rows) {
  const totals = rows.reduce((acc, row) => {
    acc.clicks += row.clicks;
    acc.impressions += row.impressions;
    acc.weightedPosition += row.position * row.impressions;
    return acc;
  }, { clicks: 0, impressions: 0, weightedPosition: 0 });

  const positionBands = {
    '1-3': { clicks: 0, impressions: 0, weightedPosition: 0, pages: 0 },
    '4-10': { clicks: 0, impressions: 0, weightedPosition: 0, pages: 0 },
    '11-30': { clicks: 0, impressions: 0, weightedPosition: 0, pages: 0 },
    '31+': { clicks: 0, impressions: 0, weightedPosition: 0, pages: 0 },
  };

  for (const row of rows) {
    const band = row.position <= 3 ? '1-3' : row.position <= 10 ? '4-10' : row.position <= 30 ? '11-30' : '31+';
    const target = positionBands[band];
    target.clicks += row.clicks;
    target.impressions += row.impressions;
    target.weightedPosition += row.position * row.impressions;
    target.pages += 1;
  }

  for (const band of Object.values(positionBands)) {
    band.ctr = round(safeCtr(band.clicks, band.impressions));
    band.averagePosition = round(band.impressions ? band.weightedPosition / band.impressions : 0, 3);
    delete band.weightedPosition;
  }

  const topPages = [...rows]
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks || a.page.localeCompare(b.page))
    .slice(0, 25)
    .map((row) => ({ ...row, ctr: round(safeCtr(row.clicks, row.impressions)), position: round(row.position, 3) }));

  const zeroClickPages = rows
    .filter((row) => row.clicks === 0 && row.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions || a.page.localeCompare(b.page))
    .map((row) => ({ ...row, ctr: 0, position: round(row.position, 3) }));

  return {
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: round(safeCtr(totals.clicks, totals.impressions)),
      averagePosition: round(totals.impressions ? totals.weightedPosition / totals.impressions : 0, 3),
      pageRows: rows.length,
    },
    positionBands,
    topPages,
    zeroClickPages,
  };
}

function metricDelta(current, previous) {
  const absolute = round(current - previous);
  const percent = previous === 0 ? null : round((current - previous) / Math.abs(previous));
  return { current: round(current), previous: round(previous), absolute, percent };
}

function diffSummaries(current, previous) {
  const totals = {
    clicks: metricDelta(current.totals.clicks, previous.totals.clicks),
    impressions: metricDelta(current.totals.impressions, previous.totals.impressions),
    ctr: metricDelta(current.totals.ctr, previous.totals.ctr),
    averagePosition: metricDelta(current.totals.averagePosition, previous.totals.averagePosition),
  };

  const positionBands = {};
  for (const bandName of ['1-3', '4-10', '11-30', '31+']) {
    const a = current.positionBands[bandName];
    const b = previous.positionBands[bandName];
    positionBands[bandName] = {
      clicks: metricDelta(a.clicks, b.clicks),
      impressions: metricDelta(a.impressions, b.impressions),
      ctr: metricDelta(a.ctr, b.ctr),
      averagePosition: metricDelta(a.averagePosition, b.averagePosition),
    };
  }
  return { totals, positionBands };
}

async function queryGa4Totals({ token, propertyId, startDate, endDate }) {
  const endpoint = `${GA4_API}/properties/${encodeURIComponent(propertyId)}:runReport`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'engagedSessions' },
        { name: 'averageSessionDuration' },
        { name: 'eventCount' },
        { name: 'keyEvents' },
        { name: 'totalRevenue' },
      ],
    }),
  });
  const json = await response.json();
  if (!response.ok) {
    return {
      status: 'unavailable',
      reason: json?.error?.message || `GA4 Data API returned ${response.status}`,
    };
  }
  const headers = (json.metricHeaders || []).map((item) => item.name);
  const values = json.rows?.[0]?.metricValues || [];
  const totals = Object.fromEntries(headers.map((name, index) => [name, Number(values[index]?.value || 0)]));
  return { status: 'ok', totals };
}

function requiredEnv() {
  const missing = ['GSC_SITE_URL', 'GSC_CLIENT_EMAIL', 'GSC_PRIVATE_KEY'].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
      'Copy .env.example, grant the service account access to Search Console, and export the GSC_* values before running this command.'
    );
  }
  return {
    siteUrl: process.env.GSC_SITE_URL,
    clientEmail: process.env.GSC_CLIENT_EMAIL,
    privateKey: process.env.GSC_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ga4PropertyId: process.env.GA4_PROPERTY_ID || null,
  };
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function printHelp() {
  console.log(`Usage:\n  npm run report:gsc -- --start YYYY-MM-DD --end YYYY-MM-DD [--as-of YYYY-MM-DD]\n\nThe script always queries the page dimension, automatically compares the immediately preceding equal-length period, and writes automation/reports/gsc/<as-of-or-end>.json.\n\nRequired env: GSC_SITE_URL, GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY\nOptional env: GA4_PROPERTY_ID (same service account must have GA4 property access)`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const startDate = args.start;
  const endDate = args.end;
  const asOfDate = args['as-of'] || endDate;
  assertIsoDate(startDate, '--start');
  assertIsoDate(endDate, '--end');
  assertIsoDate(asOfDate, '--as-of');
  dateDiffInclusive(startDate, endDate);

  const env = requiredEnv();
  const scopes = [GSC_SCOPE, ...(env.ga4PropertyId ? [GA4_SCOPE] : [])];
  const token = await getAccessToken({ clientEmail: env.clientEmail, privateKey: env.privateKey, scopes });

  const comparison = previousPeriod(startDate, endDate);
  const [currentRows, previousRows] = await Promise.all([
    queryGscPageRows({ token, siteUrl: env.siteUrl, startDate, endDate }),
    queryGscPageRows({ token, siteUrl: env.siteUrl, ...comparison }),
  ]);
  const current = summariseRows(currentRows);
  const previous = summariseRows(previousRows);

  const ga4 = env.ga4PropertyId
    ? await queryGa4Totals({ token, propertyId: env.ga4PropertyId, startDate, endDate })
    : {
        status: 'not-configured',
        reason: 'GA4_PROPERTY_ID is not set. GSC reporting remains fully functional; add the property ID and grant the same service account Viewer access to include GA4 totals.',
      };

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    asOfDate,
    source: {
      system: 'Google Search Console Search Analytics API',
      dimension: 'page',
      searchType: 'web',
      dataState: 'final',
      siteUrl: env.siteUrl,
      pageLevelIsAuthoritative: true,
      queryLevelAggregationProhibited: true,
    },
    dateRange: { startDate, endDate },
    comparisonDateRange: comparison,
    searchConsole: current,
    weekOverWeek: diffSummaries(current, previous),
    ga4,
  };

  const outputPath = path.join('automation', 'reports', 'gsc', `${asOfDate}.json`);
  await writeJson(outputPath, report);
  console.log(`Wrote ${outputPath}`);
  console.log(`GSC: ${current.totals.clicks} clicks / ${current.totals.impressions} impressions / ${(current.totals.ctr * 100).toFixed(2)}% CTR / position ${current.totals.averagePosition.toFixed(2)}`);
  if (ga4.status !== 'ok') console.warn(`GA4: ${ga4.status} — ${ga4.reason}`);
}

main().catch((error) => {
  console.error(`gsc-report: ${error.message}`);
  process.exitCode = 1;
});
