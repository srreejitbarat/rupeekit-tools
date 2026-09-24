#!/usr/bin/env node

/**
 * Diagnostic: hit every configured provider and report what each one returns.
 *
 * The fetch script short-circuits on the first fatal problem, which is right
 * for production but useless for diagnosis -- a spot outage hides whether FX
 * works at all. This probes everything independently so one CI run tells you
 * exactly which endpoints are reachable from a real network.
 *
 *   node scripts/probe-gold-providers.mjs
 *
 * Exits non-zero only if no spot provider or no FX provider works, i.e. only
 * when the pipeline genuinely cannot run.
 */

import process from 'node:process';
import { FX_PROVIDERS, SPOT_PROVIDERS } from './gold/providers.mjs';
import { REFERENCE_SOURCES } from './gold/reference.mjs';

const PAD = 22;

async function probe(providers, label, valueKey) {
  console.log(`\n${label}`);
  console.log('-'.repeat(70));
  const working = [];
  for (const provider of providers) {
    const name = provider.name.replace(/^(spot|fx)From/, '');
    const started = Date.now();
    try {
      const quote = await provider();
      const ms = Date.now() - started;
      const kind = quote.instrument ? ` (${quote.instrument})` : '';
      console.log(`  ✓ ${name.padEnd(PAD)} ${String(quote[valueKey]).padStart(12)}   ${ms}ms   [${quote.provider}]${kind}`);
      working.push(quote);
    } catch (error) {
      const ms = Date.now() - started;
      console.log(`  ✗ ${name.padEnd(PAD)} ${'—'.padStart(12)}   ${ms}ms   ${error.message.slice(0, 90)}`);
    }
  }
  return working;
}

function reportSpread(allQuotes, valueKey, label) {
  // Spread is only meaningful within one instrument class.
  const quotes = allQuotes.filter((quote) => quote.instrument !== 'futures');
  if (quotes.length < 2) {
    if (allQuotes.length >= 2) {
      console.log(`\n  Only ${quotes.length} spot-class provider(s); futures quotes are excluded from the ${label} cross-check.`);
    }
    return;
  }
  const values = quotes.map((quote) => quote[valueKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = ((max - min) / ((max + min) / 2)) * 100;
  console.log(`\n  ${label} spread across ${quotes.length} working providers: ${spread.toFixed(3)}%`);
  if (spread > 2) {
    console.log('  ! Spread exceeds the 2% agreement guardrail; the pipeline would hold rather than publish.');
  }
}

async function main() {
  console.log('Probing gold rate providers from this network.\n');
  console.log(`GOLDAPI_KEY: ${process.env.GOLDAPI_KEY ? 'set' : 'not set (that provider will be skipped)'}`);

  const spot = await probe(SPOT_PROVIDERS, 'SPOT  (XAU/USD per troy ounce)', 'xauUsd');
  reportSpread(spot, 'xauUsd', 'XAU/USD');

  const fx = await probe(FX_PROVIDERS, 'FX  (USD/INR)', 'usdInr');
  reportSpread(fx, 'usdInr', 'USD/INR');

  const references = await probe(REFERENCE_SOURCES, 'REFERENCE  (Indian 10g 24K, gate only — never published)', 'per10Gram24K');

  console.log('\n' + '='.repeat(70));
  console.log(`spot providers working: ${spot.length}/${SPOT_PROVIDERS.length}`);
  console.log(`fx   providers working: ${fx.length}/${FX_PROVIDERS.length}`);
  console.log(`reference sources working: ${references.length}/${REFERENCE_SOURCES.length}`);
  if (references.length === 0) {
    console.warn('! No Indian reference responded. The pipeline will still publish, but with no external');
    console.warn('  check on the levy assumptions — the one class of error internal guardrails cannot catch.');
  }

  if (spot.length === 0 || fx.length === 0) {
    console.error('\n✗ Pipeline cannot run: needs at least one working provider on each side.');
    process.exit(1);
  }
  const spotClass = spot.filter((quote) => quote.instrument !== 'futures');
  console.log(`  of which spot-class (not futures): ${spotClass.length}`);
  if (spotClass.length === 0) {
    console.error('\n✗ No spot-class provider works. A futures price must not be published as a cash rate.');
    process.exit(1);
  }
  if (spotClass.length === 1) {
    console.warn('\n! Only one spot-class provider works. The 2% cross-check cannot run; add another source.');
  }
  console.log('\n✓ Pipeline has a usable provider on each side.');
}

main().catch((error) => {
  console.error(`probe failed: ${error.message}`);
  process.exit(1);
});
