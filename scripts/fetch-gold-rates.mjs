#!/usr/bin/env node

/**
 * Fetch international spot gold and USD/INR, derive the Indian landed bullion
 * value per carat, and write a snapshot the site renders statically.
 *
 * Fail-closed by design. If anything is wrong -- a provider is down, two
 * providers disagree, the number moved implausibly -- we do NOT write. The
 * existing snapshot stays in place with its real, older timestamp, and the
 * process exits non-zero so the scheduled run goes red. Publishing a wrong gold
 * price is worse than publishing an openly stale one.
 *
 *   node scripts/fetch-gold-rates.mjs
 *   node scripts/fetch-gold-rates.mjs --dry-run
 *   node scripts/fetch-gold-rates.mjs --force     # bypass guardrails, ops escape hatch
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { buildSnapshot } from './gold/derive.mjs';
import { collectSpotQuotes, resolveFxQuote } from './gold/providers.mjs';
import { resolveReference } from './gold/reference.mjs';

const dataDir = path.join(process.cwd(), 'data', 'gold-rates');
const currentPath = path.join(dataDir, 'current.json');
const historyPath = path.join(dataDir, 'history.json');

const HISTORY_RETENTION_DAYS = 400;

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
  };
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function fail(message, details = []) {
  console.error(`\n✗ gold rates NOT updated: ${message}`);
  details.forEach((detail) => console.error(`  - ${detail}`));
  const existing = readJson(currentPath, null);
  if (existing?.asOf) {
    console.error(`\n  Existing snapshot retained (asOf ${existing.asOf}). Pages keep showing that date, not a guessed rate.`);
  } else {
    console.error('\n  No usable snapshot exists yet: gold pages will render the "rate unavailable" state.');
  }
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const { quotes, errors: spotErrors } = await collectSpotQuotes();
  spotErrors.forEach((error) => console.warn(`  ! spot provider unavailable: ${error}`));
  if (quotes.length === 0) {
    fail('no spot gold provider responded', spotErrors);
  }
  // The cross-check needs two SPOT-class quotes. A futures quote does not
  // count: it carries a basis and cannot confirm a spot number.
  const spotClass = quotes.filter((quote) => quote.instrument !== 'futures');
  if (spotClass.length === 0) {
    fail('only futures quotes available; refusing to publish a futures price as a cash rate', [
      `responders: ${quotes.map((q) => q.provider).join(', ')}`,
    ]);
  }
  if (spotClass.length === 1) {
    console.warn(
      `  ! only one spot-class provider responded (${spotClass[0].provider}); the 2% cross-check cannot run this cycle`
    );
  }

  const { quote: fxQuote, errors: fxErrors } = await resolveFxQuote();
  fxErrors.forEach((error) => console.warn(`  ! fx provider unavailable: ${error}`));
  if (!fxQuote) {
    fail('no USD/INR provider responded', fxErrors);
  }

  // Independent Indian reference. Unavailability is tolerated by design: it
  // skips the external check rather than blocking the update.
  const { reference, errors: referenceErrors } = await resolveReference();
  referenceErrors.forEach((error) => console.warn(`  ! reference unavailable: ${error}`));
  if (!reference) {
    console.warn('  ! no independent reference responded; publishing without an external cross-check');
  }

  const historyFile = readJson(historyPath, { schemaVersion: 1, entries: [] });
  const fetchedAt = new Date().toISOString();
  const asOf = fetchedAt.slice(0, 10);

  const { snapshot, historyEntry, failures } = buildSnapshot({
    asOf,
    fetchedAt,
    spotQuotes: quotes,
    usdInrQuote: fxQuote,
    history: historyFile.entries,
    reference,
  });

  // Print what we derived before deciding whether to accept it, so a rejected
  // reading is diagnosable from the log rather than just "guardrails failed".
  console.log(`\n  spot     ${quotes.map((q) => `${q.provider}=${q.xauUsd}`).join('  ')}`);
  console.log(`  fx       ${fxQuote.provider}=${fxQuote.usdInr}`);
  console.log(`  24K/gram ₹${snapshot.derived.perGram['24K']}`);
  console.log(`  22K/gram ₹${snapshot.derived.perGram['22K']}`);
  console.log(`  levies   ${snapshot.inputs.levies.importDutyPct}% duty, GST ${snapshot.inputs.levies.gstPct}% (excluded from valuation)`);
  console.log(
    snapshot.reference?.source
      ? `  ref      ${snapshot.reference.source} 10g ₹${snapshot.reference.per10Gram24K}  divergence ${snapshot.reference.divergencePct}%  (limit ${snapshot.reference.limitPct}%)`
      : '  ref      none available — published without an external cross-check'
  );
  console.log(
    `  ${snapshot.loanValuation.carat} ${snapshot.loanValuation.sampleDays}-day avg ₹${snapshot.loanValuation.averagePerGram}` +
      `${snapshot.loanValuation.sufficient ? '' : '  (INSUFFICIENT HISTORY — not a 30-day average yet)'}`
  );

  if (failures.length > 0 && !args.force) {
    fail('guardrails rejected this reading', failures);
  }
  if (failures.length > 0 && args.force) {
    console.warn('\n  ! --force: writing despite guardrail failures:');
    failures.forEach((failure) => console.warn(`    - ${failure}`));
    snapshot.status = 'forced';
    snapshot.guardrailOverrides = failures;
  }

  const nextEntries = [
    ...historyFile.entries.filter((entry) => entry.asOf !== asOf),
    historyEntry,
  ]
    .sort((a, b) => a.asOf.localeCompare(b.asOf))
    .slice(-HISTORY_RETENTION_DAYS);

  if (args.dryRun) {
    console.log('\n  --dry-run: nothing written.');
    return;
  }

  writeJson(currentPath, snapshot);
  writeJson(historyPath, { schemaVersion: 1, entries: nextEntries });
  console.log(`\n✓ wrote current.json and history.json (${nextEntries.length} day(s) retained)`);
}

main().catch((error) => {
  fail(error.message);
});
