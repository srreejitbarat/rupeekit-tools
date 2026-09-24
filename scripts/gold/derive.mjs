import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data', 'gold-rates');

export const purity = JSON.parse(fs.readFileSync(path.join(dataDir, 'purity.json'), 'utf8'));
export const dutyConfig = JSON.parse(fs.readFileSync(path.join(dataDir, 'duty-config.json'), 'utf8'));

export const CARATS = Object.keys(purity.carats);

// Guardrail envelopes. These are deliberately wide: they exist to catch a broken
// feed (an HTML error page parsed as a number, a currency mix-up), not to second
// guess the market.
export const BOUNDS = {
  xauUsd: { min: 500, max: 20_000 },
  usdInr: { min: 50, max: 200 },
  perGram24k: { min: 1_000, max: 100_000 },
};

// Gold moving more than this in a single day is far more likely to be a data
// error than a real market move, so we hold rather than publish.
export const MAX_DAILY_MOVE_PCT = 10;

// Two independent SPOT providers disagreeing by more than this means we cannot
// say which one is right, so we publish neither.
export const MAX_PROVIDER_DIVERGENCE_PCT = 2;

// Futures carry a basis over spot (contango/backwardation) that routinely runs
// past 1%, so a futures quote is never a peer of a spot quote. It is only a
// wide sanity band: useful for catching an order-of-magnitude error, useless
// for catching a small one.
export const MAX_FUTURES_BASIS_PCT = 5;

export const MIN_AVERAGE_SAMPLE_DAYS = 30;

// Divergence from an independent Indian cash reference beyond this means one of
// our levy assumptions is wrong. The 6% -> 15% duty error showed as 5.08%.
export const MAX_REFERENCE_DIVERGENCE_PCT = 2;

// Futures references carry a basis on top of any levy error, so they need more
// room before the signal is trustworthy.
export const MAX_FUTURES_REFERENCE_DIVERGENCE_PCT = 4;

function round(value, dp = 2) {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

export function pctDiff(a, b) {
  if (!a || !b) return Infinity;
  return Math.abs((a - b) / ((a + b) / 2)) * 100;
}

/**
 * Landed price per gram of FINE gold (999.9), before hallmark fineness is applied.
 *
 *   troy ounce -> gram, USD -> INR, then import duty, then optionally GST.
 *
 * This yields a bullion value: gold content only, excluding jeweller making
 * charges and stones. That is the correct basis for gold-loan valuation, where
 * lenders advance against metal content alone.
 *
 * GST defaults to zero because it is a transaction tax charged at billing, not
 * part of the metal's value. The Indian "gold rate today" convention quotes the
 * pre-GST landed rate, and lenders value pledged gold on that same basis.
 * Validated 22 Aug 2026: duty-only derivation matched the reported national
 * 24K and 22K rates to within 0.02%, while adding GST overshot by ~3%.
 */
export function derivePerGramFine({ xauUsd, usdInr, importDutyPct, gstPct = 0 }) {
  const perGramUsd = xauUsd / purity.troyOunceGrams;
  const perGramInr = perGramUsd * usdInr;
  const withDuty = perGramInr * (1 + importDutyPct / 100);
  return withDuty * (1 + gstPct / 100);
}

export function deriveCaratTable(perGramFine) {
  const perGram = {};
  const per10Gram = {};
  for (const [carat, spec] of Object.entries(purity.carats)) {
    const value = perGramFine * spec.fineness;
    perGram[carat] = round(value);
    per10Gram[carat] = round(value * 10);
  }
  return { perGram, per10Gram };
}

/**
 * RBI-regulated lenders value pledged gold on a trailing average rather than
 * today's spot, so a live-spot figure overstates eligibility on a rising
 * market. We report the average AND whether we actually have enough history to
 * call it a 30-day average, because a "30-day average" computed from four days
 * is a false claim.
 */
export function averageOverHistory(entries, carat, days = MIN_AVERAGE_SAMPLE_DAYS) {
  const key = `perGram${carat}`;
  const usable = entries
    .filter((entry) => typeof entry[key] === 'number' && Number.isFinite(entry[key]))
    .slice(-days);
  if (usable.length === 0) {
    return { average: null, sampleDays: 0, sufficient: false };
  }
  const sum = usable.reduce((total, entry) => total + entry[key], 0);
  return {
    average: round(sum / usable.length),
    sampleDays: usable.length,
    sufficient: usable.length >= days,
  };
}

/**
 * Compare the derived rate against an independent Indian reference.
 *
 * The failure mode here is deliberately ASYMMETRIC, and getting it backwards
 * breaks the pipeline in one of two ways:
 *
 *   reference unavailable  -> skip the check, publish anyway.
 *       Absence of evidence is not evidence of error. A rotted scraper must
 *       never be able to block every future update.
 *
 *   reference present and diverging -> HOLD.
 *       This is the only signal we have that a levy assumption drifted.
 *
 * Returns { checked, divergencePct, failure } where `failure` is a string only
 * when the update should be held.
 */
export function evaluateReference({ reference, derivedPer10Gram24K }) {
  if (!reference || !Number.isFinite(reference.per10Gram24K)) {
    return { checked: false, divergencePct: null, failure: null };
  }
  const divergence = ((derivedPer10Gram24K - reference.per10Gram24K) / reference.per10Gram24K) * 100;
  const limit =
    reference.instrument === 'futures'
      ? MAX_FUTURES_REFERENCE_DIVERGENCE_PCT
      : MAX_REFERENCE_DIVERGENCE_PCT;

  const failure =
    Math.abs(divergence) > limit
      ? `Derived 10g 24K ₹${derivedPer10Gram24K.toFixed(2)} diverges ${divergence.toFixed(2)}% from ${reference.source} ₹${reference.per10Gram24K.toFixed(2)} (limit ${limit}%). A levy assumption is probably stale — check duty-config.json against the current CBIC notification.`
      : null;

  return {
    checked: true,
    source: reference.source,
    instrument: reference.instrument,
    referencePer10Gram24K: round(reference.per10Gram24K),
    divergencePct: round(divergence, 3),
    limitPct: limit,
    failure,
  };
}

function withinBounds(value, bound) {
  return Number.isFinite(value) && value >= bound.min && value <= bound.max;
}

/**
 * Every reason we would refuse to publish, collected in one place.
 * Returns [] when the reading is safe to publish.
 */
export function guardrailFailures({ xauUsd, usdInr, perGram24k, spotQuotes = [], previousPerGram24k = null }) {
  const failures = [];

  if (!withinBounds(xauUsd, BOUNDS.xauUsd)) {
    failures.push(`XAU/USD ${xauUsd} outside plausible range ${BOUNDS.xauUsd.min}-${BOUNDS.xauUsd.max}`);
  }
  if (!withinBounds(usdInr, BOUNDS.usdInr)) {
    failures.push(`USD/INR ${usdInr} outside plausible range ${BOUNDS.usdInr.min}-${BOUNDS.usdInr.max}`);
  }
  if (!withinBounds(perGram24k, BOUNDS.perGram24k)) {
    failures.push(`Derived 24K/gram ${perGram24k} outside plausible range ${BOUNDS.perGram24k.min}-${BOUNDS.perGram24k.max}`);
  }

  const quoted = spotQuotes.filter((quote) => Number.isFinite(quote.xauUsd));
  // Only compare like with like. A futures quote sitting 1.6% above spot is the
  // basis, not a disagreement, and treating it as one both masks real errors and
  // causes spurious holds when the basis widens.
  const spotOnly = quoted.filter((quote) => quote.instrument !== 'futures');
  const futuresOnly = quoted.filter((quote) => quote.instrument === 'futures');

  for (let i = 0; i < spotOnly.length; i += 1) {
    for (let j = i + 1; j < spotOnly.length; j += 1) {
      const divergence = pctDiff(spotOnly[i].xauUsd, spotOnly[j].xauUsd);
      if (divergence > MAX_PROVIDER_DIVERGENCE_PCT) {
        failures.push(
          `Spot providers disagree by ${divergence.toFixed(2)}% (${spotOnly[i].provider} ${spotOnly[i].xauUsd} vs ${spotOnly[j].provider} ${spotOnly[j].xauUsd}), limit ${MAX_PROVIDER_DIVERGENCE_PCT}%`
        );
      }
    }
  }

  const primarySpot = spotOnly[0];
  if (primarySpot) {
    for (const future of futuresOnly) {
      const basis = pctDiff(primarySpot.xauUsd, future.xauUsd);
      if (basis > MAX_FUTURES_BASIS_PCT) {
        failures.push(
          `Futures quote ${future.provider} ${future.xauUsd} is ${basis.toFixed(2)}% from spot ${primarySpot.xauUsd}, beyond the ${MAX_FUTURES_BASIS_PCT}% sanity band`
        );
      }
    }
  }

  if (Number.isFinite(previousPerGram24k) && previousPerGram24k > 0) {
    const move = pctDiff(perGram24k, previousPerGram24k);
    if (move > MAX_DAILY_MOVE_PCT) {
      failures.push(
        `Day-over-day move ${move.toFixed(2)}% exceeds ${MAX_DAILY_MOVE_PCT}% (was ${previousPerGram24k}, now ${perGram24k})`
      );
    }
  }

  return failures;
}

export function buildSnapshot({ asOf, fetchedAt, spotQuotes, usdInrQuote, history, reference = null }) {
  // The published rate must come from a spot quote: futures include a basis
  // that is not part of the metal's cash value.
  const primary = spotQuotes.find((quote) => quote.instrument !== 'futures') ?? spotQuotes[0];
  // Valuation rate: duty only. This is the published "gold rate" and the basis
  // a lender advances against.
  const perGramFine = derivePerGramFine({
    xauUsd: primary.xauUsd,
    usdInr: usdInrQuote.usdInr,
    importDutyPct: dutyConfig.importDutyPct,
  });
  const { perGram, per10Gram } = deriveCaratTable(perGramFine);

  // Purchase rate: what a buyer is billed, before making charges. Kept separate
  // so neither figure can be mistaken for the other.
  const purchasePerGramFine = derivePerGramFine({
    xauUsd: primary.xauUsd,
    usdInr: usdInrQuote.usdInr,
    importDutyPct: dutyConfig.importDutyPct,
    gstPct: dutyConfig.gstPct,
  });
  const purchaseTable = deriveCaratTable(purchasePerGramFine);

  const previous = history.length > 0 ? history[history.length - 1] : null;
  const failures = guardrailFailures({
    xauUsd: primary.xauUsd,
    usdInr: usdInrQuote.usdInr,
    perGram24k: perGram['24K'],
    spotQuotes,
    previousPerGram24k: previous ? previous.perGram24K : null,
  });

  const referenceCheck = evaluateReference({
    reference,
    derivedPer10Gram24K: per10Gram['24K'],
  });
  if (referenceCheck.failure) failures.push(referenceCheck.failure);

  const loanCarat = purity.loanValuationCarat;
  const projectedHistory = [
    ...history.filter((entry) => entry.asOf !== asOf),
    { asOf, [`perGram${loanCarat}`]: perGram[loanCarat], [`perGram24K`]: perGram['24K'] },
  ];
  const average = averageOverHistory(projectedHistory, loanCarat);

  return {
    failures,
    historyEntry: {
      asOf,
      xauUsd: primary.xauUsd,
      usdInr: usdInrQuote.usdInr,
      perGram24K: perGram['24K'],
      [`perGram${loanCarat}`]: perGram[loanCarat],
    },
    snapshot: {
      schemaVersion: 1,
      status: 'ok',
      asOf,
      fetchedAt,
      derived: { perGramFine: round(perGramFine), perGram, per10Gram },
      reference: referenceCheck.checked
        ? {
            source: referenceCheck.source,
            instrument: referenceCheck.instrument,
            per10Gram24K: referenceCheck.referencePer10Gram24K,
            divergencePct: referenceCheck.divergencePct,
            limitPct: referenceCheck.limitPct,
            checkedAt: fetchedAt,
          }
        : { checked: false, note: 'No independent reference responded this cycle; the derived rate was published without an external cross-check.' },
      purchase: {
        perGramFine: round(purchasePerGramFine),
        perGram: purchaseTable.perGram,
        per10Gram: purchaseTable.per10Gram,
        note: `Valuation rate plus ${dutyConfig.gstPct}% GST. Excludes making charges and wastage, which jewellers add on top.`,
      },
      loanValuation: {
        carat: loanCarat,
        basis: `${MIN_AVERAGE_SAMPLE_DAYS}-day trailing average of ${loanCarat} per-gram bullion value`,
        averagePerGram: average.average,
        sampleDays: average.sampleDays,
        sufficient: average.sufficient,
        note: average.sufficient
          ? null
          : `Only ${average.sampleDays} day(s) of history: this is NOT yet a ${MIN_AVERAGE_SAMPLE_DAYS}-day average and must not be presented as one.`,
      },
      inputs: {
        spot: spotQuotes.map((quote) => ({ provider: quote.provider, xauUsd: quote.xauUsd, fetchedAt: quote.fetchedAt })),
        fx: { provider: usdInrQuote.provider, usdInr: usdInrQuote.usdInr, fetchedAt: usdInrQuote.fetchedAt },
        levies: {
          importDutyPct: dutyConfig.importDutyPct,
          gstPct: dutyConfig.gstPct,
          gstAppliesToValuation: dutyConfig.gstAppliesToValuation === true,
          reviewedOn: dutyConfig.reviewedOn,
        },
      },
      disclosure:
        'Indicative bullion value derived from international spot gold and the USD/INR rate plus statutory import duty. Quoted pre-GST, the basis on which lenders value pledged gold. Excludes jeweller making charges, wastage and stones. Not a quoted dealing price.',
    },
  };
}
