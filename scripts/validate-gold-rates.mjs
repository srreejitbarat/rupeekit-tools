#!/usr/bin/env node

/**
 * Guards the gold-rate pipeline's committed state.
 *
 * The failure this exists to prevent is a wrong number reaching a page that
 * people use to value a gold pledge. It therefore fails the build on a
 * fabricated-looking snapshot, an out-of-envelope price, or a duty config that
 * has not been reviewed since the last Budget could have changed it.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { BOUNDS, purity, dutyConfig } from './gold/derive.mjs';

const dataDir = path.join(process.cwd(), 'data', 'gold-rates');
const errors = [];
const warnings = [];

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));

const DUTY_REVIEW_MAX_AGE_DAYS = 180;
const SNAPSHOT_STALE_WARN_DAYS = 3;

function daysSince(isoDate) {
  const then = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(then)) return Infinity;
  return Math.floor((Date.now() - then) / 86_400_000);
}

// --- purity table ---------------------------------------------------------
const expectedFineness = { '24K': 0.999, '22K': 0.916, '18K': 0.75, '14K': 0.585 };
for (const [carat, expected] of Object.entries(expectedFineness)) {
  const actual = purity.carats?.[carat]?.fineness;
  if (actual !== expected) {
    errors.push(`purity.json: ${carat} fineness is ${actual}, expected the ${expected * 1000} hallmark standard (${expected}).`);
  }
}
if (Math.abs(purity.troyOunceGrams - 31.1034768) > 1e-6) {
  errors.push(`purity.json: troyOunceGrams is ${purity.troyOunceGrams}, expected 31.1034768.`);
}
if (!purity.carats?.[purity.loanValuationCarat]) {
  errors.push(`purity.json: loanValuationCarat "${purity.loanValuationCarat}" is not present in the carat table.`);
}

// --- duty config ----------------------------------------------------------
const dutyAge = daysSince(dutyConfig.reviewedOn);
if (dutyAge > DUTY_REVIEW_MAX_AGE_DAYS) {
  errors.push(
    `duty-config.json: import duty / GST last reviewed ${dutyAge} days ago (limit ${DUTY_REVIEW_MAX_AGE_DAYS}). ` +
      'Re-confirm against the current CBIC notification and bump reviewedOn.'
  );
}
if (!(dutyConfig.importDutyPct >= 0 && dutyConfig.importDutyPct <= 50)) {
  errors.push(`duty-config.json: importDutyPct ${dutyConfig.importDutyPct} is outside 0-50%.`);
}
if (!(dutyConfig.gstPct >= 0 && dutyConfig.gstPct <= 50)) {
  errors.push(`duty-config.json: gstPct ${dutyConfig.gstPct} is outside 0-50%.`);
}
if (dutyConfig.gstAppliesToValuation === true) {
  errors.push(
    'duty-config.json: gstAppliesToValuation must stay false. GST is charged at billing, not part of metal value; ' +
      'folding it into the valuation rate overstates it by ~3% and breaks the market-rate regression test.'
  );
}
if (dutyConfig.importDutyBreakdown) {
  const { basicCustomsDutyPct = 0, aidcPct = 0 } = dutyConfig.importDutyBreakdown;
  if (Math.abs(basicCustomsDutyPct + aidcPct - dutyConfig.importDutyPct) > 0.001) {
    errors.push(
      `duty-config.json: breakdown (${basicCustomsDutyPct}% BCD + ${aidcPct}% AIDC) does not sum to importDutyPct ${dutyConfig.importDutyPct}%.`
    );
  }
}

// --- snapshot -------------------------------------------------------------
const snapshot = readJson('current.json');

if (snapshot.status === 'unavailable') {
  if (snapshot.derived !== null || snapshot.asOf !== null) {
    errors.push('current.json: status is "unavailable" but it still carries a price. An unavailable snapshot must hold no rate.');
  }
  warnings.push('current.json: no live gold rate yet. Gold pages will render the unavailable state until the first successful fetch.');
} else {
  if (!snapshot.derived?.perGram) {
    errors.push('current.json: status is not "unavailable" but derived.perGram is missing.');
  } else {
    for (const carat of Object.keys(purity.carats)) {
      const value = snapshot.derived.perGram[carat];
      if (!Number.isFinite(value)) {
        errors.push(`current.json: derived.perGram.${carat} is not a number.`);
      }
    }
    const twentyFourK = snapshot.derived.perGram['24K'];
    if (Number.isFinite(twentyFourK) && (twentyFourK < BOUNDS.perGram24k.min || twentyFourK > BOUNDS.perGram24k.max)) {
      errors.push(
        `current.json: 24K/gram ${twentyFourK} is outside the plausible envelope ${BOUNDS.perGram24k.min}-${BOUNDS.perGram24k.max}.`
      );
    }
    // Carats must be derived from one fine price, never sourced independently.
    const fine = snapshot.derived.perGramFine;
    for (const [carat, spec] of Object.entries(purity.carats)) {
      const expected = fine * spec.fineness;
      const actual = snapshot.derived.perGram[carat];
      if (Number.isFinite(expected) && Number.isFinite(actual) && Math.abs(expected - actual) > 0.05) {
        errors.push(`current.json: ${carat} (${actual}) does not match perGramFine x ${spec.fineness} (${expected.toFixed(2)}).`);
      }
    }
  }

  if (!snapshot.asOf || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.asOf)) {
    errors.push('current.json: asOf must be a YYYY-MM-DD date when a rate is present.');
  } else if (daysSince(snapshot.asOf) > SNAPSHOT_STALE_WARN_DAYS) {
    warnings.push(
      `current.json: rate is ${daysSince(snapshot.asOf)} days old. Check the scheduled fetch — pages are showing a stale "as of" date.`
    );
  }

  // The purchase figure must sit above the valuation figure by exactly GST.
  if (snapshot.purchase?.perGramFine && snapshot.derived?.perGramFine) {
    const expected = snapshot.derived.perGramFine * (1 + dutyConfig.gstPct / 100);
    if (Math.abs(expected - snapshot.purchase.perGramFine) > 0.5) {
      errors.push(
        `current.json: purchase.perGramFine ${snapshot.purchase.perGramFine} is not the valuation rate plus ${dutyConfig.gstPct}% GST (${expected.toFixed(2)}).`
      );
    }
  }

  // A published rate must record whether it was externally cross-checked. The
  // absence of a reference is acceptable; silently omitting the field is not,
  // because then nobody can tell which happened.
  if (!snapshot.reference) {
    errors.push('current.json: a published rate must carry a reference block, even one recording that no reference responded.');
  } else if (snapshot.reference.source && Number.isFinite(snapshot.reference.divergencePct)) {
    const limit = snapshot.reference.limitPct ?? 2;
    if (Math.abs(snapshot.reference.divergencePct) > limit) {
      errors.push(
        `current.json: recorded divergence ${snapshot.reference.divergencePct}% from ${snapshot.reference.source} exceeds its ${limit}% limit; this snapshot should never have been written.`
      );
    }
  } else if (snapshot.reference.checked !== false) {
    errors.push('current.json: reference block is neither a completed check nor an explicit { checked: false }.');
  }

  const loan = snapshot.loanValuation;
  if (loan && loan.sufficient === false && loan.note === null) {
    errors.push('current.json: loanValuation is not based on a full window but carries no note saying so.');
  }
  if (loan && loan.sufficient === true && loan.sampleDays < 30) {
    errors.push(`current.json: loanValuation claims sufficient with only ${loan.sampleDays} sample days.`);
  }
}

if (!snapshot.disclosure || snapshot.disclosure.length < 40) {
  errors.push('current.json: disclosure text is missing or too short. Every rendered rate needs its basis stated.');
}

// --- history --------------------------------------------------------------
const history = readJson('history.json');
if (!Array.isArray(history.entries)) {
  errors.push('history.json: entries must be an array.');
} else {
  const seen = new Set();
  let previous = '';
  for (const entry of history.entries) {
    if (seen.has(entry.asOf)) errors.push(`history.json: duplicate entry for ${entry.asOf}.`);
    seen.add(entry.asOf);
    if (entry.asOf < previous) errors.push(`history.json: entries out of order at ${entry.asOf}.`);
    previous = entry.asOf;
  }
}

// --- report ---------------------------------------------------------------
warnings.forEach((warning) => console.warn(`  ! ${warning}`));
if (errors.length > 0) {
  console.error('\n✗ gold rate validation failed:');
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}
console.log(`✓ gold rates valid (status: ${snapshot.status}${warnings.length ? `, ${warnings.length} warning(s)` : ''})`);
