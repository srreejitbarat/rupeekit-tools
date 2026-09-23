#!/usr/bin/env node
// Checks observable technical eligibility. Only Search Console can confirm Google's chosen canonical and index state.
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).filter((s) => s.startsWith('--')).map((s) => s.slice(2).split('=', 2)));
const origin = (args.origin || 'https://www.rupeekit.co.in').replace(/\/$/, '');
const output = args.output || 'automation/reports/ai-visibility/discovery.json';
const questions = JSON.parse(await fs.readFile(new URL('../data/ai-visibility-questions.json', import.meta.url), 'utf8'));
const paths = [...new Set(questions.map((q) => q.guidePath))];
paths.push('/tools/personal-loan-true-apr-calculator-india', '/tools/home-loan-emi-calculator-india', '/tools/salary-in-hand-calculator-india', '/tools/reduce-emi-vs-tenure-calculator-india');

async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'RupeeKitDiscoveryAudit/1.0' } });
  return { status: response.status, headers: response.headers, body: await response.text() };
}

function tagValue(html, tag, key, value, attribute) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) || [];
  const attr = (text, name) => text.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
  return tags.find((text) => attr(text, key)?.toLowerCase() === value)?.match(new RegExp(`\\b${attribute}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] || null;
}

const sitemap = await request(`${origin}/sitemap.xml`);
const robots = await request(`${origin}/robots.txt`);
const results = [];
for (const pagePath of paths) {
  try {
    const expected = `${origin}${pagePath}`;
    const response = await request(expected);
    const canonical = tagValue(response.body, 'link', 'rel', 'canonical', 'href');
    const metaRobots = tagValue(response.body, 'meta', 'name', 'robots', 'content') || '';
    const metaGooglebot = tagValue(response.body, 'meta', 'name', 'googlebot', 'content') || '';
    const directives = `${metaRobots},${metaGooglebot},${response.headers.get('x-robots-tag') || ''}`.toLowerCase();
    const issues = [];
    if (response.status !== 200) issues.push(`HTTP ${response.status}`);
    if (canonical !== expected) issues.push(`canonical is ${canonical || 'missing'}`);
    if (/\bnoindex\b|\bnosnippet\b|max-snippet\s*:\s*0\b/.test(directives)) issues.push(`restrictive snippet/index directive: ${directives}`);
    if (!sitemap.body.includes(`<loc>${expected}</loc>`)) issues.push('missing from sitemap');
    if (!/<main\b/i.test(response.body) || !/<h1\b/i.test(response.body)) issues.push('main heading missing from HTML');
    if (pagePath.startsWith('/money-guides/') && !response.body.includes('Direct answer')) issues.push('direct answer missing from HTML');
    if (['/money-guides/personal-loan-apr', '/money-guides/home-loan-prepayment', '/money-guides/salary-income-tax'].includes(pagePath) && !response.body.includes('Source-backed comparison')) issues.push('comparison missing from HTML');
    results.push({ path: pagePath, status: response.status, canonical, directives, technicalEligibility: issues.length === 0, issues });
  } catch (error) {
    results.push({ path: pagePath, technicalEligibility: false, issues: [String(error)] });
  }
}
const report = {
  checkedAt: new Date().toISOString(), origin,
  scope: 'Public crawl and on-page checks only; neither indexed status nor AI Overview selection can be inferred.',
  robotsStatus: robots.status, sitemapStatus: sitemap.status,
  robotsAllowsGuides: robots.status === 200 && !/^\s*Disallow:\s*\/(?:\s|$)/im.test(robots.body),
  results,
};
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Checked ${results.length} URLs: ${results.filter((r) => r.technicalEligibility).length} passed; report ${output}`);
if (robots.status !== 200 || sitemap.status !== 200 || !report.robotsAllowsGuides || results.some((r) => !r.technicalEligibility)) process.exitCode = 1;
