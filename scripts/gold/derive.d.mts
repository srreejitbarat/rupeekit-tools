/**
 * Types for derive.mjs so TypeScript callers (tests, and any future app-side
 * import) get real checking instead of implicit any.
 */

export type Carat = '24K' | '22K' | '18K' | '14K';

export type SpotQuote = {
  provider: string;
  xauUsd: number;
  instrument?: 'spot' | 'futures';
  fetchedAt?: string;
};

export type FxQuote = { provider: string; usdInr: number; fetchedAt?: string };

export type HistoryEntry = {
  asOf: string;
  xauUsd?: number;
  usdInr?: number;
  perGram24K?: number;
  perGram22K?: number;
  [key: string]: string | number | undefined;
};

export type ReferenceQuote = {
  source: string;
  instrument: string;
  per10Gram24K: number;
  fetchedAt?: string;
};

export type CaratTable = {
  perGram: Record<Carat, number>;
  per10Gram: Record<Carat, number>;
};

export type AverageResult = { average: number | null; sampleDays: number; sufficient: boolean };

export type ReferenceEvaluation = {
  checked: boolean;
  source?: string;
  instrument?: string;
  referencePer10Gram24K?: number;
  divergencePct: number | null;
  limitPct?: number;
  failure: string | null;
};

export declare const purity: {
  carats: Record<Carat, { hallmark: number; fineness: number }>;
  loanValuationCarat: Carat;
  troyOunceGrams: number;
};

export declare const dutyConfig: {
  importDutyPct: number;
  gstPct: number;
  gstAppliesToValuation?: boolean;
  reviewedOn: string;
  importDutyBreakdown?: { basicCustomsDutyPct: number; aidcPct: number };
};

export declare const CARATS: Carat[];
export declare const BOUNDS: Record<'xauUsd' | 'usdInr' | 'perGram24k', { min: number; max: number }>;
export declare const MAX_DAILY_MOVE_PCT: number;
export declare const MAX_PROVIDER_DIVERGENCE_PCT: number;
export declare const MAX_FUTURES_BASIS_PCT: number;
export declare const MIN_AVERAGE_SAMPLE_DAYS: number;
export declare const MAX_REFERENCE_DIVERGENCE_PCT: number;
export declare const MAX_FUTURES_REFERENCE_DIVERGENCE_PCT: number;

export declare function pctDiff(a: number, b: number): number;

export declare function derivePerGramFine(args: {
  xauUsd: number;
  usdInr: number;
  importDutyPct: number;
  gstPct?: number;
}): number;

export declare function deriveCaratTable(perGramFine: number): CaratTable;

export declare function averageOverHistory(
  entries: HistoryEntry[],
  carat: Carat,
  days?: number
): AverageResult;

export declare function evaluateReference(args: {
  reference: ReferenceQuote | null;
  derivedPer10Gram24K: number;
}): ReferenceEvaluation;

export declare function guardrailFailures(args: {
  xauUsd: number;
  usdInr: number;
  perGram24k: number;
  spotQuotes?: SpotQuote[];
  previousPerGram24k?: number | null;
}): string[];

export declare function buildSnapshot(args: {
  asOf: string;
  fetchedAt: string;
  spotQuotes: SpotQuote[];
  usdInrQuote: FxQuote;
  history: HistoryEntry[];
  reference?: ReferenceQuote | null;
}): {
  failures: string[];
  historyEntry: HistoryEntry;
  // Shape mirrors data/gold-rates/current.json.
  snapshot: Record<string, unknown> & {
    status: string;
    derived: { perGramFine: number } & CaratTable;
    loanValuation: {
      carat: Carat;
      sampleDays: number;
      sufficient: boolean;
      averagePerGram: number | null;
      note: string | null;
    };
    inputs: {
      spot: { provider: string; xauUsd: number; fetchedAt?: string }[];
      fx: { provider: string; usdInr: number; fetchedAt?: string };
      levies: { importDutyPct: number; gstPct: number; gstAppliesToValuation: boolean; reviewedOn: string };
    };
    reference: Record<string, unknown>;
  };
};
