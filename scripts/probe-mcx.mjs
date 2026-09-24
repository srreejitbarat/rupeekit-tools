#!/usr/bin/env node

/**
 * Diagnostic: is the MCX bhavcopy reachable from a CI runner at all?
 *
 * The only publicly documented way to obtain it is Selenium automation of an
 * ASP.NET postback page, and an earlier attempt at the market-watch backpage
 * endpoint returned 403 from a GitHub runner. Before building a headless
 * browser into a twice-daily job, establish whether MCX serves datacenter IPs
 * at all. If everything here 403s, the route is closed and no amount of
 * parsing work will open it.
 *
 * Read-only. Reports and exits 0 regardless: this is a fact-finding run, not
 * a gate.
 */

import process from 'node:process';

const TIMEOUT_MS = 20_000;
const UA = 'RupeeKitGoldRates/1.0 (+https://www.rupeekit.co.in)';
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const MW = 'https://www.mcxindia.com/backpage.aspx/GetMarketWatch';

// The HTML pages 403 from datacenter IPs whatever UA is used. The JSON page
// method answered POST with 200. Open question: was that the method, or the
// browser UA? Prefer the honest UA if it works -- spoofing past a deliberate
// filter is not something to build a pipeline on.
const attempts = [
  { label: 'market watch POST, honest UA', url: MW, ua: UA, method: 'POST', dump: true },
  { label: 'market watch POST, browser UA', url: MW, ua: BROWSER_UA, method: 'POST', dump: true },
  { label: 'market watch GET, honest UA', url: MW, ua: UA },
];

async function attempt({ label, url, ua, method = 'GET', dump = false }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        'user-agent': ua,
        accept: method === 'POST' ? 'application/json' : 'text/html,*/*',
        ...(method === 'POST' ? { 'content-type': 'application/json' } : {}),
      },
      ...(method === 'POST' ? { body: '{}' } : {}),
    });
    const body = await response.text();
    const ms = Date.now() - started;
    console.log(
      `  ${response.ok ? '✓' : '✗'} ${label.padEnd(28)} HTTP ${response.status}  ${ms}ms  ${body.length} bytes`
    );
    if (response.ok && dump) {
      try {
        const payload = JSON.parse(body);
        console.log(`      top-level keys: ${Object.keys(payload).join(', ')}`);
        const rows = payload?.d?.Data ?? payload?.d ?? payload?.Data ?? payload?.data ?? [];
        const list = Array.isArray(rows) ? rows : [];
        console.log(`      rows: ${list.length}`);
        if (list.length) console.log(`      row keys: ${Object.keys(list[0]).join(', ')}`);
        const gold = list.filter((r) => String(r?.Symbol ?? '').toUpperCase() === 'GOLD');
        console.log(`      GOLD rows: ${gold.length}`);
        if (gold.length) console.log(`      first GOLD: ${JSON.stringify(gold[0]).slice(0, 320)}`);
      } catch (error) {
        console.log(`      not JSON (${error.message.slice(0, 50)}); first 200 chars: ${body.slice(0, 200)}`);
      }
    }
  } catch (error) {
    console.log(`  ✗ ${label.padEnd(28)} ${error.message.slice(0, 80)}`);
  } finally {
    clearTimeout(timer);
  }
}

console.log('Probing MCX reachability from this runner.\n');
for (const a of attempts) await attempt(a);
console.log('\nIf the honest-UA POST works, the reference gate can be closed without');
console.log('spoofing anything. If only the browser UA works, that is a deliberate');
console.log('filter and the route should be treated as closed.');
