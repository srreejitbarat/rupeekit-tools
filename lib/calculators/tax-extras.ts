// Two tax computations that are widely written about and rarely built:
// the Rule 9D split of provident fund interest into taxable and non-taxable
// accounts, and capital gains on inherited property.

/** Threshold where the employer also contributes to the fund. */
export const RULE_9D_THRESHOLD_WITH_EMPLOYER = 250_000;

/** Threshold where the employer makes no contribution — the government case. */
export const RULE_9D_THRESHOLD_WITHOUT_EMPLOYER = 500_000;

/** TDS under section 194A applies once accrued taxable interest passes this. */
export const RULE_9D_TDS_THRESHOLD = 5_000;

export const RULE_9D_TDS_RATE_WITH_PAN = 0.1;
export const RULE_9D_TDS_RATE_WITHOUT_PAN = 0.2;

export type Rule9dInputs = {
  /** Employee contribution each year, including any voluntary provident fund. */
  annualEmployeeContribution: number;
  /** Interest rate credited by the fund, as a percentage. */
  interestRatePercent: number;
  /** Years to project. */
  years: number;
  /** False where the employer makes no contribution, raising the threshold. */
  employerAlsoContributes: boolean;
  /** A higher TDS rate applies where PAN is not linked. */
  panLinked: boolean;
  /** Balance already sitting in the taxable account. */
  openingTaxableBalance: number;
  /** Balance already sitting in the non-taxable account. */
  openingNonTaxableBalance: number;
};

export type Rule9dYear = {
  year: number;
  nonTaxableContribution: number;
  taxableContribution: number;
  nonTaxableInterest: number;
  taxableInterest: number;
  tdsDeducted: number;
  closingNonTaxableBalance: number;
  closingTaxableBalance: number;
};

export type Rule9dResult = {
  threshold: number;
  rows: Rule9dYear[];
  totalTaxableInterest: number;
  totalNonTaxableInterest: number;
  totalTds: number;
  finalTaxableBalance: number;
  finalNonTaxableBalance: number;
  /** True when contributions stay within the threshold and nothing is taxable. */
  entirelyBelowThreshold: boolean;
};

function safe(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/**
 * Rule 9D requires the fund to be maintained as two notional accounts. Interest
 * is credited on each separately, and only the taxable account's interest is
 * charged to tax.
 *
 * Interest is applied to the opening balance plus the year's contribution.
 * A real fund credits interest on monthly running balances, so this slightly
 * overstates the first year of each contribution; the calculator says so.
 */
export function calculateRule9d(inputs: Rule9dInputs): Rule9dResult {
  const contribution = safe(inputs.annualEmployeeContribution);
  const rate = safe(inputs.interestRatePercent) / 100;
  const years = Math.min(Math.max(Math.round(safe(inputs.years)), 1), 40);
  const threshold = inputs.employerAlsoContributes
    ? RULE_9D_THRESHOLD_WITH_EMPLOYER
    : RULE_9D_THRESHOLD_WITHOUT_EMPLOYER;
  const tdsRate = inputs.panLinked ? RULE_9D_TDS_RATE_WITH_PAN : RULE_9D_TDS_RATE_WITHOUT_PAN;

  const nonTaxableContribution = Math.min(contribution, threshold);
  const taxableContribution = Math.max(0, contribution - threshold);

  let nonTaxableBalance = safe(inputs.openingNonTaxableBalance);
  let taxableBalance = safe(inputs.openingTaxableBalance);

  const rows: Rule9dYear[] = [];
  let totalTaxableInterest = 0;
  let totalNonTaxableInterest = 0;
  let totalTds = 0;

  for (let year = 1; year <= years; year += 1) {
    const nonTaxableBase = nonTaxableBalance + nonTaxableContribution;
    const taxableBase = taxableBalance + taxableContribution;

    const nonTaxableInterest = nonTaxableBase * rate;
    const taxableInterest = taxableBase * rate;

    const tdsDeducted = taxableInterest > RULE_9D_TDS_THRESHOLD ? taxableInterest * tdsRate : 0;

    nonTaxableBalance = nonTaxableBase + nonTaxableInterest;
    taxableBalance = taxableBase + taxableInterest;

    totalNonTaxableInterest += nonTaxableInterest;
    totalTaxableInterest += taxableInterest;
    totalTds += tdsDeducted;

    rows.push({
      year,
      nonTaxableContribution,
      taxableContribution,
      nonTaxableInterest,
      taxableInterest,
      tdsDeducted,
      closingNonTaxableBalance: nonTaxableBalance,
      closingTaxableBalance: taxableBalance,
    });
  }

  return {
    threshold,
    rows,
    totalTaxableInterest,
    totalNonTaxableInterest,
    totalTds,
    finalTaxableBalance: taxableBalance,
    finalNonTaxableBalance: nonTaxableBalance,
    entirelyBelowThreshold: taxableContribution === 0 && safe(inputs.openingTaxableBalance) === 0,
  };
}

// ---------------------------------------------------------------------------

/** The indexation base year. Cost inflation index for 2001-02 is 100. */
export const CII_BASE_YEAR_VALUE = 100;

/**
 * Cost inflation index values notified by the CBDT. Only values verified
 * against notifications are listed; anything else is entered by the user.
 */
export const KNOWN_CII: Record<string, number> = {
  '2001-02': 100,
  '2024-25': 363,
  '2025-26': 376,
  '2026-27': 384,
};

export const LTCG_RATE_WITHOUT_INDEXATION = 0.125;
export const LTCG_RATE_WITH_INDEXATION = 0.2;

export type InheritedPropertyInputs = {
  salePrice: number;
  /** Cost inflation index for the year of sale. */
  saleYearCii: number;
  /** What the previous owner actually paid. */
  previousOwnerCost: number;
  /** True where the previous owner acquired the property before 1 April 2001. */
  acquiredBeforeApril2001: boolean;
  /** Fair market value as at 1 April 2001, used only for pre-2001 acquisitions. */
  fairMarketValue2001: number;
  /** Cost inflation index for the acquisition year, where acquired after 2001. */
  acquisitionYearCii: number;
  /** Improvements incurred on or after 1 April 2001. */
  costOfImprovement: number;
  /** Brokerage, stamp duty and other transfer costs. */
  transferExpenses: number;
  /**
   * The choice between 12.5% without indexation and 20% with indexation is
   * available only where the property was acquired before 23 July 2024.
   */
  eligibleForIndexationChoice: boolean;
};

export type InheritedPropertyResult = {
  /** Higher of actual cost and 2001 fair market value, for pre-2001 acquisitions. */
  costOfAcquisitionUsed: number;
  /** True when the 2001 fair market value was the higher figure. */
  usedFairMarketValue: boolean;
  effectiveAcquisitionCii: number;
  indexedCostOfAcquisition: number;
  netSaleConsideration: number;
  gainWithoutIndexation: number;
  gainWithIndexation: number;
  taxWithoutIndexation: number;
  taxWithIndexation: number;
  /** The lower of the two where the choice is available; otherwise the 12.5% figure. */
  taxPayable: number;
  betterOption: 'without-indexation' | 'with-indexation';
  savingFromChoosing: number;
};

export function calculateInheritedPropertyGains(
  inputs: InheritedPropertyInputs
): InheritedPropertyResult {
  const salePrice = safe(inputs.salePrice);
  const saleCii = Math.max(safe(inputs.saleYearCii), 1);
  const actualCost = safe(inputs.previousOwnerCost);
  const fmv2001 = safe(inputs.fairMarketValue2001);
  const improvement = safe(inputs.costOfImprovement);
  const expenses = safe(inputs.transferExpenses);

  // For a pre-2001 acquisition the taxpayer may substitute the 1 April 2001
  // fair market value where it is higher than actual cost.
  const costOfAcquisitionUsed = inputs.acquiredBeforeApril2001
    ? Math.max(actualCost, fmv2001)
    : actualCost;
  const usedFairMarketValue = inputs.acquiredBeforeApril2001 && fmv2001 > actualCost;

  const effectiveAcquisitionCii = inputs.acquiredBeforeApril2001
    ? CII_BASE_YEAR_VALUE
    : Math.max(safe(inputs.acquisitionYearCii), 1);

  const indexedCostOfAcquisition = costOfAcquisitionUsed * (saleCii / effectiveAcquisitionCii);

  const netSaleConsideration = salePrice - expenses;

  const gainWithoutIndexation = Math.max(
    0,
    netSaleConsideration - costOfAcquisitionUsed - improvement
  );
  const gainWithIndexation = Math.max(
    0,
    netSaleConsideration - indexedCostOfAcquisition - improvement
  );

  const taxWithoutIndexation = gainWithoutIndexation * LTCG_RATE_WITHOUT_INDEXATION;
  const taxWithIndexation = gainWithIndexation * LTCG_RATE_WITH_INDEXATION;

  const taxPayable = inputs.eligibleForIndexationChoice
    ? Math.min(taxWithoutIndexation, taxWithIndexation)
    : taxWithoutIndexation;

  const betterOption =
    inputs.eligibleForIndexationChoice && taxWithIndexation < taxWithoutIndexation
      ? 'with-indexation'
      : 'without-indexation';

  return {
    costOfAcquisitionUsed,
    usedFairMarketValue,
    effectiveAcquisitionCii,
    indexedCostOfAcquisition,
    netSaleConsideration,
    gainWithoutIndexation,
    gainWithIndexation,
    taxWithoutIndexation,
    taxWithIndexation,
    taxPayable,
    betterOption,
    savingFromChoosing: inputs.eligibleForIndexationChoice
      ? Math.abs(taxWithoutIndexation - taxWithIndexation)
      : 0,
  };
}
