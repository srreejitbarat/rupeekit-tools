// Two central government pension calculations that are widely explained and
// rarely computed: the notional increment for employees who retire the day
// before their increment falls due, and commutation of pension.

/** Annual increment rate in the pay matrix. */
export const ANNUAL_INCREMENT_RATE = 0.03;

/** Pension is conventionally half of last drawn basic pay. */
export const PENSION_FRACTION = 0.5;

/**
 * A Supreme Court judgment of 20 February 2025 held that employees retiring on
 * 30 June or 31 December — one day before the increment date — should have that
 * increment counted notionally when pension is fixed. The Department of
 * Personnel office memorandum of 20 May 2025 followed, and provides that no
 * arrears accrue for any period before 30 April 2023.
 */
export const NOTIONAL_INCREMENT_ARREARS_START = '2023-04-30';

export type NotionalIncrementInputs = {
  /** Last drawn basic pay in the pay matrix. */
  lastBasicPay: number;
  /** Dearness relief applicable to pension, as a percentage. */
  drPercent: number;
  /** Whole months for which arrears are claimed. */
  arrearsMonths: number;
  /** Commuted fraction of pension, as a percentage, if commutation was taken. */
  commutedPercent: number;
};

export type NotionalIncrementResult = {
  /** The increment, rounded up to the next multiple of 100 as the matrix requires. */
  notionalIncrement: number;
  revisedBasicPay: number;
  currentBasicPension: number;
  revisedBasicPension: number;
  /** Gain in basic pension before dearness relief. */
  basicPensionGain: number;
  /** Gain including dearness relief, which is what actually reaches the bank. */
  monthlyGainWithDr: number;
  annualGainWithDr: number;
  estimatedArrears: number;
  /** Commutation is deducted from basic pension; DR is not reduced by it. */
  currentMonthlyInHand: number;
  revisedMonthlyInHand: number;
};

function safe(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/** Pay matrix increments are rounded up to the next multiple of 100. */
export function roundIncrementToHundred(value: number) {
  return Math.ceil(value / 100) * 100;
}

export function calculateNotionalIncrement(
  inputs: NotionalIncrementInputs
): NotionalIncrementResult {
  const basic = safe(inputs.lastBasicPay);
  const dr = safe(inputs.drPercent) / 100;
  const months = safe(inputs.arrearsMonths);
  const commuted = Math.min(Math.max(safe(inputs.commutedPercent), 0), 40) / 100;

  const notionalIncrement = roundIncrementToHundred(basic * ANNUAL_INCREMENT_RATE);
  const revisedBasicPay = basic + notionalIncrement;

  const currentBasicPension = PENSION_FRACTION * basic;
  const revisedBasicPension = PENSION_FRACTION * revisedBasicPay;
  const basicPensionGain = revisedBasicPension - currentBasicPension;

  // Dearness relief is paid on the full basic pension, so the gain carries it too.
  const monthlyGainWithDr = basicPensionGain * (1 + dr);

  // Commutation reduces the pension paid, but dearness relief stays on the
  // full basic pension — a rule that is easy to miss.
  const inHand = (basicPension: number) =>
    basicPension * (1 - commuted) + basicPension * dr;

  return {
    notionalIncrement,
    revisedBasicPay,
    currentBasicPension,
    revisedBasicPension,
    basicPensionGain,
    monthlyGainWithDr,
    annualGainWithDr: monthlyGainWithDr * 12,
    estimatedArrears: monthlyGainWithDr * months,
    currentMonthlyInHand: inHand(currentBasicPension),
    revisedMonthlyInHand: inHand(revisedBasicPension),
  };
}

/** Central government pensioners may commute up to this share of basic pension. */
export const MAX_COMMUTATION_PERCENT = 40;

/** The commuted portion is restored after this many years. */
export const COMMUTATION_RESTORATION_YEARS = 15;

export type PensionCommutationInputs = {
  /** Basic pension before commutation and before dearness relief. */
  basicPension: number;
  /** Share of basic pension being commuted, capped at 40%. */
  commutedPercent: number;
  /**
   * Commutation factor from the table in the CCS (Commutation of Pension)
   * Rules, read against age next birthday. Entered by the user because the
   * published table is the authority, not this calculator.
   */
  commutationFactor: number;
  /** Dearness relief applicable to pension, as a percentage. */
  drPercent: number;
};

export type PensionCommutationResult = {
  /** Monthly pension being given up. */
  commutedMonthlyPension: number;
  /** Lump sum: commuted monthly pension x 12 x factor. */
  lumpSum: number;
  /** Basic pension actually paid after commutation. */
  reducedBasicPension: number;
  /** Dearness relief, which stays on the full basic pension. */
  monthlyDearnessRelief: number;
  monthlyInHandAfterCommutation: number;
  monthlyInHandWithoutCommutation: number;
  monthlyReduction: number;
  /** Total pension given up across the restoration period. */
  totalForgoneOverRestoration: number;
  /** Lump sum minus what is given up; negative means the lump sum is smaller. */
  netOverRestoration: number;
  /** Months until the lump sum is matched by the reductions. */
  breakEvenMonths: number;
  restorationYears: number;
  /** True when the requested percentage exceeded the statutory cap. */
  cappedAtMaximum: boolean;
};

export function calculatePensionCommutation(
  inputs: PensionCommutationInputs
): PensionCommutationResult {
  const basicPension = safe(inputs.basicPension);
  const requested = safe(inputs.commutedPercent);
  const cappedAtMaximum = requested > MAX_COMMUTATION_PERCENT;
  const commuted = Math.min(requested, MAX_COMMUTATION_PERCENT) / 100;
  const factor = safe(inputs.commutationFactor);
  const dr = safe(inputs.drPercent) / 100;

  const commutedMonthlyPension = basicPension * commuted;
  const lumpSum = commutedMonthlyPension * 12 * factor;

  const reducedBasicPension = basicPension - commutedMonthlyPension;

  // Dearness relief is calculated on the full basic pension, not the reduced
  // one, so commutation does not shrink the DR component.
  const monthlyDearnessRelief = basicPension * dr;

  const monthlyInHandAfterCommutation = reducedBasicPension + monthlyDearnessRelief;
  const monthlyInHandWithoutCommutation = basicPension + monthlyDearnessRelief;
  const monthlyReduction = commutedMonthlyPension;

  const restorationMonths = COMMUTATION_RESTORATION_YEARS * 12;
  const totalForgoneOverRestoration = monthlyReduction * restorationMonths;

  return {
    commutedMonthlyPension,
    lumpSum,
    reducedBasicPension,
    monthlyDearnessRelief,
    monthlyInHandAfterCommutation,
    monthlyInHandWithoutCommutation,
    monthlyReduction,
    totalForgoneOverRestoration,
    netOverRestoration: lumpSum - totalForgoneOverRestoration,
    breakEvenMonths: monthlyReduction > 0 ? lumpSum / monthlyReduction : 0,
    restorationYears: COMMUTATION_RESTORATION_YEARS,
    cappedAtMaximum,
  };
}
