// Job offer comparison on a post-tax basis.
//
// The headline number on an Indian offer letter is CTC, which is not
// comparable across employers: two offers at the same CTC produce different
// take-home pay because basic pay is a different share of each, and PF is a
// percentage of basic. This model therefore runs each offer through the same
// income-tax engine the salary calculators use, rather than comparing gross
// figures.
//
// Three values are reported per offer because they answer different questions:
//   - net cash value      — what actually reaches the bank account
//   - retirement savings  — employee and employer PF, deducted from cash but
//                           still the employee's money
//   - total economic value — the two added together
// An offer can lose on cash and win on total value. That is a real outcome of
// a higher basic percentage, not a rounding artefact, so both are shown.

import { estimateIncomeTax, type FinancialYear } from '../tax/india-income-tax';

/** Number of offers the comparison accepts. Two is the common case; the third is optional. */
export const MAX_OFFERS = 3;

export type JobOffer = {
  /** Display label, e.g. "Offer A". */
  label: string;
  /** Fixed pay for the year, in rupees. */
  fixedAnnual: number;
  /** Full variable/bonus pay at 100% payout, in rupees. */
  variableAnnual: number;
  /** Share of the variable component the employee realistically expects, 0-100. */
  variablePayoutPercent: number;
  /** Basic pay as a percentage of CTC. Drives PF on both sides. */
  basicPercent: number;
  /** Whether the employer PF contribution sits inside the quoted CTC. */
  employerPfInCtc: boolean;
  /**
   * Employee-valued benefits not taxed through payroll — insurance cover,
   * a device allowance, subsidised meals. Added after tax, never to the tax base.
   */
  benefitsAnnual: number;
  /** Recurring post-tax outflows caused by the job — commute, relocation rent premium. */
  workCostsAnnual: number;
  /** One-time joining bonus, in rupees. Fully taxable, but no PF is deducted on it. */
  joiningBonus: number;
};

export type JobOfferAssumptions = {
  financialYear: FinancialYear;
  regime: 'new' | 'old';
  /** State professional tax per month. */
  monthlyProfessionalTax: number;
  /** Old regime only: 80C investments beyond the employee PF contribution. */
  input80C: number;
  /** Old regime only: 80D health insurance premium. */
  input80D: number;
};

export type JobOfferResult = {
  label: string;
  /** Variable pay after applying the expected payout percentage. */
  expectedVariable: number;
  /** Taxable salary each ongoing year: fixed plus expected variable. */
  recurringCtc: number;
  /** Taxable salary in year one: recurring plus the joining bonus. */
  firstYearCtc: number;
  employeePfAnnual: number;
  employerPfAnnual: number;
  /** Employee plus employer PF — deducted from cash but retained by the employee. */
  retirementSavingsAnnual: number;
  recurringTax: number;
  firstYearTax: number;
  /** Cash reaching the bank each ongoing year, before benefits and work costs. */
  recurringInHand: number;
  firstYearInHand: number;
  /** Joining bonus after the marginal tax it attracts. */
  joiningBonusAfterTax: number;
  /** Ongoing-year cash position: in-hand plus benefits minus work costs. */
  recurringNetCashValue: number;
  /** Year-one cash position, including the post-tax joining bonus. */
  firstYearNetCashValue: number;
  monthlyRecurringNetCashValue: number;
  /** Ongoing-year cash plus retirement savings. */
  recurringTotalEconomicValue: number;
  /** Pre-tax comparison, retained so the gross gap stays visible alongside the net one. */
  grossFirstYearValue: number;
  /** Total tax as a share of taxable salary, for the ongoing year. */
  effectiveTaxRatePercent: number;
};

export type JobOfferComparison = {
  results: JobOfferResult[];
  /** Index of the offer with the highest ongoing-year net cash value. */
  bestByCashIndex: number;
  /** Index of the offer with the highest ongoing-year total economic value. */
  bestByTotalValueIndex: number;
  /**
   * True when the two rankings disagree — the cash winner is not the
   * economic winner, which is the case worth explaining to the reader.
   */
  rankingsDisagree: boolean;
  /** Ongoing-year net cash gap between the best and second-best offer. */
  cashGapToRunnerUp: number;
};

function positive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Runs one offer through the income-tax engine twice: once on recurring pay, and
 * once with the joining bonus added.
 *
 * The second run holds basic pay at its recurring rupee amount by scaling the
 * basic percentage down against the larger base. Without that, the bonus would
 * inflate basic and deduct PF on a one-time payment that carries none.
 */
export function evaluateJobOffer(offer: JobOffer, assumptions: JobOfferAssumptions): JobOfferResult {
  const fixedAnnual = positive(offer.fixedAnnual);
  const variableAnnual = positive(offer.variableAnnual);
  const joiningBonus = positive(offer.joiningBonus);
  const benefitsAnnual = positive(offer.benefitsAnnual);
  const workCostsAnnual = positive(offer.workCostsAnnual);
  const basicPercent = clampPercent(offer.basicPercent);

  const expectedVariable = (variableAnnual * clampPercent(offer.variablePayoutPercent)) / 100;
  const recurringCtc = fixedAnnual + expectedVariable;
  const firstYearCtc = recurringCtc + joiningBonus;

  const basicAnnual = (recurringCtc * basicPercent) / 100;
  // Hold basic constant in rupees so the bonus adds taxable pay without adding PF.
  const firstYearBasicPercent = firstYearCtc > 0 ? (basicAnnual / firstYearCtc) * 100 : 0;

  const shared = {
    employerPfIncludedInCtc: offer.employerPfInCtc,
    employeePfRate: 12,
    monthlyProfessionalTax: positive(assumptions.monthlyProfessionalTax),
    monthlyOtherDeductions: 0,
    regime: assumptions.regime,
    financialYear: assumptions.financialYear,
    ageGroup: 'below60' as const,
    input80C: assumptions.regime === 'old' ? positive(assumptions.input80C) : 0,
    input80D: assumptions.regime === 'old' ? positive(assumptions.input80D) : 0,
    // HRA exemption is not modelled here: it depends on rent paid and city, which
    // are properties of where the reader lives rather than of the offer. The page
    // links to the HRA calculator for that.
    hraReceivedMonthly: 0,
    rentPaidMonthly: 0,
    cityType: 'nonMetro' as const,
    otherDeductionsOldRegime: 0,
  };

  const recurring = estimateIncomeTax({
    ...shared,
    annualCtc: recurringCtc,
    basicSalaryPercent: basicPercent,
  });

  const firstYear = estimateIncomeTax({
    ...shared,
    annualCtc: firstYearCtc,
    basicSalaryPercent: firstYearBasicPercent,
  });

  const retirementSavingsAnnual = recurring.employeePfAnnual + recurring.employerPfAnnual;
  const recurringNetCashValue = recurring.annualInHand + benefitsAnnual - workCostsAnnual;
  const firstYearNetCashValue = firstYear.annualInHand + benefitsAnnual - workCostsAnnual;

  return {
    label: offer.label,
    expectedVariable,
    recurringCtc,
    firstYearCtc,
    employeePfAnnual: recurring.employeePfAnnual,
    employerPfAnnual: recurring.employerPfAnnual,
    retirementSavingsAnnual,
    recurringTax: recurring.totalTax,
    firstYearTax: firstYear.totalTax,
    recurringInHand: recurring.annualInHand,
    firstYearInHand: firstYear.annualInHand,
    joiningBonusAfterTax: Math.max(0, firstYear.annualInHand - recurring.annualInHand),
    recurringNetCashValue,
    firstYearNetCashValue,
    monthlyRecurringNetCashValue: recurringNetCashValue / 12,
    recurringTotalEconomicValue: recurringNetCashValue + retirementSavingsAnnual,
    grossFirstYearValue: fixedAnnual + expectedVariable + benefitsAnnual + joiningBonus - workCostsAnnual,
    effectiveTaxRatePercent: recurringCtc > 0 ? (recurring.totalTax / recurringCtc) * 100 : 0,
  };
}

function indexOfMax(values: number[]) {
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}

/** Compares two or three offers under one shared set of tax assumptions. */
export function compareJobOffers(
  offers: JobOffer[],
  assumptions: JobOfferAssumptions
): JobOfferComparison {
  const usable = offers.slice(0, MAX_OFFERS);
  const results = usable.map((offer) => evaluateJobOffer(offer, assumptions));

  if (results.length === 0) {
    return {
      results,
      bestByCashIndex: -1,
      bestByTotalValueIndex: -1,
      rankingsDisagree: false,
      cashGapToRunnerUp: 0,
    };
  }

  const cashValues = results.map((result) => result.recurringNetCashValue);
  const totalValues = results.map((result) => result.recurringTotalEconomicValue);
  const bestByCashIndex = indexOfMax(cashValues);
  const bestByTotalValueIndex = indexOfMax(totalValues);

  const sortedCash = [...cashValues].sort((a, b) => b - a);
  const cashGapToRunnerUp = sortedCash.length > 1 ? sortedCash[0] - sortedCash[1] : 0;

  return {
    results,
    bestByCashIndex,
    bestByTotalValueIndex,
    rankingsDisagree: bestByCashIndex !== bestByTotalValueIndex,
    cashGapToRunnerUp,
  };
}
