import currentSnapshot from '../data/gold-rates/current.json';
import purityConfig from '../data/gold-rates/purity.json';

export type Carat = '24K' | '22K' | '18K' | '14K';

export type GoldRateReference =
  | {
      source: string;
      instrument: string;
      per10Gram24K: number;
      divergencePct: number;
      limitPct: number;
      checkedAt: string;
    }
  | { checked: false; note: string };

export type GoldRateSnapshot = {
  schemaVersion: number;
  status: 'ok' | 'forced' | 'unavailable';
  asOf: string | null;
  fetchedAt: string | null;
  derived: {
    perGramFine: number;
    perGram: Record<Carat, number>;
    per10Gram: Record<Carat, number>;
  } | null;
  loanValuation: {
    carat: Carat;
    basis: string;
    averagePerGram: number | null;
    sampleDays: number;
    sufficient: boolean;
    note: string | null;
  } | null;
  purchase: {
    perGramFine: number;
    perGram: Record<Carat, number>;
    per10Gram: Record<Carat, number>;
    note: string;
  } | null;
  reference?: GoldRateReference;
  inputs: {
    spot: { provider: string; xauUsd: number; fetchedAt: string }[];
    fx: { provider: string; usdInr: number; fetchedAt: string };
    levies: { importDutyPct: number; gstPct: number; reviewedOn: string };
  } | null;
  disclosure: string;
};

const snapshot = currentSnapshot as unknown as GoldRateSnapshot;

export const CARAT_FINENESS = Object.fromEntries(
  Object.entries(purityConfig.carats).map(([carat, spec]) => [carat, (spec as { fineness: number }).fineness])
) as Record<Carat, number>;

export const LOAN_VALUATION_CARAT = purityConfig.loanValuationCarat as Carat;

export function getGoldRateSnapshot(): GoldRateSnapshot {
  return snapshot;
}

/** True only when we hold a real, guardrail-passed reading. */
export function hasLiveGoldRate(): boolean {
  return snapshot.status !== 'unavailable' && snapshot.derived !== null && snapshot.asOf !== null;
}

export function getPerGramRate(carat: Carat): number | null {
  if (!hasLiveGoldRate() || !snapshot.derived) return null;
  const value = snapshot.derived.perGram[carat];
  return Number.isFinite(value) ? value : null;
}

/**
 * The figure a gold-loan calculator should use.
 *
 * RBI-regulated lenders value pledged gold on a trailing average rather than
 * spot, so we prefer the average and fall back to spot only when we do not yet
 * hold enough history. The caller gets `sufficient` so the page can say which
 * one it is instead of implying an average it does not have.
 */
export function getLoanValuationRate(): {
  perGram: number | null;
  carat: Carat;
  basis: 'average' | 'spot' | 'none';
  sampleDays: number;
  sufficient: boolean;
} {
  const carat = LOAN_VALUATION_CARAT;
  if (!hasLiveGoldRate() || !snapshot.loanValuation) {
    return { perGram: null, carat, basis: 'none', sampleDays: 0, sufficient: false };
  }
  const { averagePerGram, sampleDays, sufficient } = snapshot.loanValuation;
  if (sufficient && Number.isFinite(averagePerGram)) {
    return { perGram: averagePerGram, carat, basis: 'average', sampleDays, sufficient: true };
  }
  return { perGram: getPerGramRate(carat), carat, basis: 'spot', sampleDays, sufficient: false };
}

/**
 * Fine-gold price implied per carat. Exposed so pages can render a carat table
 * from one fetched number rather than pretending to source four.
 */
export function deriveCaratRate(perGramFine: number, carat: Carat): number {
  return perGramFine * CARAT_FINENESS[carat];
}

/** Human-readable "as of" line. Pages must always show provenance. */
export function getRateProvenance(): { asOf: string | null; sources: string[]; disclosure: string } {
  return {
    asOf: snapshot.asOf,
    sources: snapshot.inputs
      ? [...snapshot.inputs.spot.map((quote) => quote.provider), snapshot.inputs.fx.provider]
      : [],
    disclosure: snapshot.disclosure,
  };
}

/**
 * Public API payload. Deliberately includes the inputs, the levies and the
 * reference check, not just the headline number: anyone should be able to
 * re-derive the rate themselves and see what it was validated against.
 */
export function getGoldRatePayload() {
  const snapshot = getGoldRateSnapshot();
  if (!hasLiveGoldRate() || !snapshot.derived) {
    return {
      schemaVersion: '1.0',
      status: snapshot.status,
      asOf: null,
      available: false,
      note: 'No gold rate has been published yet. The rate is deliberately absent rather than estimated.',
      disclosure: snapshot.disclosure,
    };
  }

  const loan = getLoanValuationRate();
  return {
    schemaVersion: '1.0',
    status: snapshot.status,
    available: true,
    asOf: snapshot.asOf,
    fetchedAt: snapshot.fetchedAt,
    valuation: {
      basis: 'Landed bullion value including import duty, excluding GST',
      perGram: snapshot.derived.perGram,
      per10Gram: snapshot.derived.per10Gram,
    },
    purchase: snapshot.purchase
      ? { perGram: snapshot.purchase.perGram, per10Gram: snapshot.purchase.per10Gram, note: snapshot.purchase.note }
      : null,
    loanValuation: {
      carat: loan.carat,
      perGram: loan.perGram,
      basis: loan.basis,
      sampleDays: loan.sampleDays,
      sufficient: loan.sufficient,
    },
    reference: snapshot.reference ?? { checked: false, note: 'No reference recorded for this snapshot.' },
    inputs: snapshot.inputs,
    disclosure: snapshot.disclosure,
  };
}

export type GoldLoanExampleRow = {
  grams: number;
  carat: Carat;
  perGram: number;
  intrinsicValue: number;
  ltvPct: number;
  eligibleLoan: number;
};

// RBI consumption-loan LTV bands, most generous first. The band is chosen by the
// resulting loan amount, so the pairing has to be self-consistent: a value whose
// 85% figure lands above Rs 2.5 lakh does not get the 85% band at all.
const LTV_BANDS: { pct: number; maxLoan: number }[] = [
  { pct: 85, maxLoan: 250_000 },
  { pct: 80, maxLoan: 500_000 },
  { pct: 75, maxLoan: Number.POSITIVE_INFINITY },
];

export function resolveLtvBand(intrinsicValue: number): { pct: number; loan: number } {
  for (const band of LTV_BANDS) {
    const loan = intrinsicValue * (band.pct / 100);
    if (loan <= band.maxLoan) return { pct: band.pct, loan };
  }
  const last = LTV_BANDS[LTV_BANDS.length - 1];
  return { pct: last.pct, loan: intrinsicValue * (last.pct / 100) };
}

const EXAMPLE_WEIGHTS = [10, 20, 50, 100];
const EXAMPLE_CARATS: Carat[] = ['22K', '18K'];

/**
 * Server-rendered worked examples for the gold loan page.
 *
 * Calculators compute in the browser, so a crawler — and any answer engine
 * quoting this page — sees only what is rendered as text. That makes these rows
 * the site's citable surface, which is exactly why they must never carry a
 * stale price. Returns null when no live rate exists, so the page shows the
 * method instead of inventing figures.
 */
export function buildGoldLoanExamples(): {
  asOf: string;
  perGram: Record<Carat, number>;
  basis: 'average' | 'spot';
  rows: GoldLoanExampleRow[];
} | null {
  const snapshot = getGoldRateSnapshot();
  if (!hasLiveGoldRate() || !snapshot.derived || !snapshot.asOf) return null;

  const loan = getLoanValuationRate();
  const rows: GoldLoanExampleRow[] = [];
  for (const carat of EXAMPLE_CARATS) {
    const perGram = snapshot.derived.perGram[carat];
    if (!Number.isFinite(perGram)) continue;
    for (const grams of EXAMPLE_WEIGHTS) {
      const intrinsicValue = Math.round(grams * perGram);
      const band = resolveLtvBand(intrinsicValue);
      rows.push({
        grams,
        carat,
        perGram: Math.round(perGram),
        intrinsicValue,
        ltvPct: band.pct,
        eligibleLoan: Math.round(band.loan),
      });
    }
  }
  if (rows.length === 0) return null;

  return {
    asOf: snapshot.asOf,
    perGram: snapshot.derived.perGram,
    basis: loan.basis === 'average' ? 'average' : 'spot',
    rows: rows.sort((a, b) => a.carat.localeCompare(b.carat) || a.grams - b.grams),
  };
}
