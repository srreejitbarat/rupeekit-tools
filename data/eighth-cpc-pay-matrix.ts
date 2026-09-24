// Static reference data for the 8th CPC scenario calculator.
//
// Everything in this file describes the *current* 7th CPC structure, which is
// settled and published. Nothing here states an 8th CPC outcome: no fitment
// factor, revised matrix, HRA percentage, transport-allowance rate or pension
// formula has been notified. The calculator applies a user-selected multiplier
// to these settled figures and labels every output as a projection.
//
// Shipped as a module constant rather than a database lookup so the calculator
// stays pure client-side arithmetic with no request on the critical path.

export type CityClass = 'X' | 'Y' | 'Z';
export type TransportCityClass = 'higher' | 'other';
export type PensionScheme = 'NPS' | 'UPS' | 'OPS';
export type EmployeeGroup = 'A' | 'B' | 'C';
export type CalculatorMode = 'employee' | 'pensioner';

/** Pay Level 1 cell 1 — the statutory minimum basic pay under the 7th CPC. */
export const SEVENTH_CPC_MINIMUM_BASIC = 18_000;

/**
 * The date from which revised pay is commonly referenced in 8th CPC coverage.
 * It is a reference point for an arrears scenario, not a notified effective
 * date. No implementation or arrears order has been published.
 */
export const ARREARS_REFERENCE_ISO = '2026-01-01';

/**
 * Default "accrued through" month for the arrears block. Held as a constant so
 * the server-rendered HTML and the first client render agree; the component
 * moves it to the real current month after mount.
 */
export const ARREARS_DEFAULT_THROUGH_ISO = '2026-09-01';

/** Date this reference data was last checked against published sources. */
export const PAY_DATA_REVIEWED_ISO = '2026-09-03';

export type PayLevelBand = {
  level: string;
  /** Cell 1 of this level in the 7th CPC pay matrix. */
  minBasic: number;
  /** Last cell of this level in the 7th CPC pay matrix. */
  maxBasic: number;
  /** Which transport-allowance band the level falls in. */
  transportBand: 'apex' | 'middle' | 'entry';
  /** Group most commonly associated with the level, for the CGEGIS default. */
  typicalGroup: EmployeeGroup;
  /** Levels 17 and 18 are fixed-pay apex posts with a single cell. */
  fixedPay?: boolean;
};

/**
 * 7th CPC pay matrix level bands. Levels 13A, 17 and 18 are included because
 * the calculator validates entered basic pay against the level, even though
 * the hub does not publish a separate scenario page for every apex level.
 */
export const PAY_LEVEL_BANDS: PayLevelBand[] = [
  { level: '1', minBasic: 18_000, maxBasic: 56_900, transportBand: 'entry', typicalGroup: 'C' },
  { level: '2', minBasic: 19_900, maxBasic: 63_200, transportBand: 'entry', typicalGroup: 'C' },
  { level: '3', minBasic: 21_700, maxBasic: 69_100, transportBand: 'middle', typicalGroup: 'C' },
  { level: '4', minBasic: 25_500, maxBasic: 81_100, transportBand: 'middle', typicalGroup: 'C' },
  { level: '5', minBasic: 29_200, maxBasic: 92_300, transportBand: 'middle', typicalGroup: 'C' },
  { level: '6', minBasic: 35_400, maxBasic: 112_400, transportBand: 'middle', typicalGroup: 'B' },
  { level: '7', minBasic: 44_900, maxBasic: 142_400, transportBand: 'middle', typicalGroup: 'B' },
  { level: '8', minBasic: 47_600, maxBasic: 151_100, transportBand: 'middle', typicalGroup: 'B' },
  { level: '9', minBasic: 53_100, maxBasic: 167_800, transportBand: 'apex', typicalGroup: 'B' },
  { level: '10', minBasic: 56_100, maxBasic: 177_500, transportBand: 'apex', typicalGroup: 'A' },
  { level: '11', minBasic: 67_700, maxBasic: 208_700, transportBand: 'apex', typicalGroup: 'A' },
  { level: '12', minBasic: 78_800, maxBasic: 209_200, transportBand: 'apex', typicalGroup: 'A' },
  { level: '13', minBasic: 123_100, maxBasic: 215_900, transportBand: 'apex', typicalGroup: 'A' },
  { level: '13A', minBasic: 131_100, maxBasic: 216_600, transportBand: 'apex', typicalGroup: 'A' },
  { level: '14', minBasic: 144_200, maxBasic: 218_200, transportBand: 'apex', typicalGroup: 'A' },
  { level: '15', minBasic: 182_200, maxBasic: 224_100, transportBand: 'apex', typicalGroup: 'A' },
  { level: '16', minBasic: 205_400, maxBasic: 224_400, transportBand: 'apex', typicalGroup: 'A' },
  { level: '17', minBasic: 225_000, maxBasic: 225_000, transportBand: 'apex', typicalGroup: 'A', fixedPay: true },
  { level: '18', minBasic: 250_000, maxBasic: 250_000, transportBand: 'apex', typicalGroup: 'A', fixedPay: true },
];

export function getPayLevelBand(level: string): PayLevelBand | undefined {
  return PAY_LEVEL_BANDS.find((band) => band.level === level);
}

/**
 * HRA percentages that would apply on a fresh commission. A new pay commission
 * has historically restarted HRA at the lower 24/16/8 slab, reverting from the
 * 30/20/10 rates reached once DA crossed 50%. No 8th CPC HRA rate is notified;
 * this is the historical pattern, exposed so the user can see its effect.
 */
export const PROJECTED_HRA_RATES: Record<CityClass, number> = { X: 24, Y: 16, Z: 8 };

/** Current 7th CPC HRA percentages, applicable because DA has crossed 50%. */
export const CURRENT_HRA_RATES: Record<CityClass, number> = { X: 30, Y: 20, Z: 10 };

/**
 * Current 7th CPC minimum HRA floors. These are exactly the 30/20/10 rates
 * applied to the minimum basic of Rs 18,000, which is what makes them scalable
 * to a projected structure by the same fitment factor.
 */
export const CURRENT_HRA_FLOORS: Record<CityClass, number> = { X: 5_400, Y: 3_600, Z: 1_800 };

/**
 * Percentage of the minimum basic that each current HRA floor represents.
 * Used to scale the floors with the fitment factor so a fresh entrant in an
 * X-city does not take a pay cut when HRA reverts from 30% to 24%.
 */
export const HRA_FLOOR_RATE_OF_MINIMUM: Record<CityClass, number> = { X: 30, Y: 20, Z: 10 };

/**
 * 7th CPC transport allowance by level band and city group. TA is a flat
 * amount rather than a percentage of basic, and no 8th CPC TA rate has been
 * notified, so the calculator carries these forward as an editable assumption.
 */
export const TRANSPORT_ALLOWANCE: Record<'apex' | 'middle' | 'entry', Record<TransportCityClass, number>> = {
  apex: { higher: 7_200, other: 3_600 },
  middle: { higher: 3_600, other: 1_800 },
  entry: { higher: 1_350, other: 900 },
};

/**
 * Levels 1 and 2 employees drawing at least this basic pay receive the middle
 * band TA rather than the entry rate.
 */
export const ENTRY_BAND_TA_UPGRADE_BASIC = 24_200;

/** CGEGIS monthly subscription by group, unchanged since the 1980 scheme. */
export const CGEGIS_BY_GROUP: Record<EmployeeGroup, number> = { A: 120, B: 60, C: 30 };

/**
 * Contribution rates on (basic + DA). NPS and UPS are the notified central
 * government rates; OPS is a defined-benefit scheme with no mandatory
 * employee contribution (GPF subscription is voluntary and not modelled).
 */
export const SCHEME_CONTRIBUTIONS: Record<PensionScheme, { employee: number; government: number; note: string }> = {
  NPS: {
    employee: 10,
    government: 14,
    note: 'National Pension System: 10% employee and 14% government contribution on basic plus DA.',
  },
  UPS: {
    employee: 10,
    government: 18.5,
    note: 'Unified Pension Scheme: 10% employee contribution, with an 18.5% total government outgo including the pool corpus.',
  },
  OPS: {
    employee: 0,
    government: 0,
    note: 'Old Pension Scheme is defined-benefit, so there is no mandatory pension deduction. Voluntary GPF subscription is not modelled.',
  },
};

/**
 * Fitment-factor presets. Every one of these is a scenario: the Commission has
 * not recommended a factor and the government has not notified one. 2.57 is
 * the factor the 7th CPC actually used and is included as a reference point.
 */
export const FITMENT_PRESETS: { value: number; label: string; note: string }[] = [
  { value: 1.92, label: '1.92x', note: 'Low-end projection circulating in commentary. Not a recommendation.' },
  { value: 2.28, label: '2.28x', note: 'The most frequently cited projection. Still a projection, not a decision.' },
  { value: 2.57, label: '2.57x', note: 'The factor the 7th CPC used. A historical reference point, not a forecast.' },
  { value: 2.86, label: '2.86x', note: 'Commonly quoted employee-association demand.' },
  { value: 3.0, label: '3.00x', note: 'Upper-end demand figure used to bound the range.' },
];

/** The factors shown in the side-by-side comparison table. */
export const COMPARISON_FACTORS = FITMENT_PRESETS.map((preset) => preset.value);

export const DEFAULT_FITMENT_FACTOR = 2.28;

/**
 * DA presets for the 7th CPC baseline. 60% is the rate approved with effect
 * from 1 January 2026. The 64% option is a projection of the July 2026
 * revision and has not been notified.
 */
export const DA_PRESETS: { value: number; label: string; notified: boolean }[] = [
  { value: 60, label: '60% (notified, w.e.f. 1 Jan 2026)', notified: true },
  { value: 64, label: '64% (July 2026 projection, not notified)', notified: false },
];

export const DEFAULT_DA_PERCENT = 60;

/** Default basic pay: Level 7 cell 1, the most commonly searched starting point. */
export const DEFAULT_BASIC_PAY = 44_900;
export const DEFAULT_PAY_LEVEL = '7';
export const DEFAULT_BASIC_PENSION = 31_550;
