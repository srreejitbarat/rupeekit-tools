import { describe, expect, it } from 'vitest';
import {
  MAX_OFFERS,
  compareJobOffers,
  evaluateJobOffer,
  type JobOffer,
  type JobOfferAssumptions,
} from './job-offer';

const assumptions: JobOfferAssumptions = {
  financialYear: '2026-27',
  regime: 'new',
  monthlyProfessionalTax: 200,
  input80C: 0,
  input80D: 0,
};

const baseOffer: JobOffer = {
  label: 'Offer A',
  fixedAnnual: 1_500_000,
  variableAnnual: 200_000,
  variablePayoutPercent: 70,
  basicPercent: 40,
  employerPfInCtc: true,
  benefitsAnnual: 100_000,
  workCostsAnnual: 120_000,
  joiningBonus: 100_000,
};

describe('evaluateJobOffer', () => {
  it('applies the expected payout percentage to variable pay', () => {
    const result = evaluateJobOffer(baseOffer, assumptions);

    expect(result.expectedVariable).toBe(140_000);
    expect(result.recurringCtc).toBe(1_640_000);
    expect(result.firstYearCtc).toBe(1_740_000);
  });

  it('does not deduct provident fund on the joining bonus', () => {
    const withBonus = evaluateJobOffer(baseOffer, assumptions);
    const withoutBonus = evaluateJobOffer({ ...baseOffer, joiningBonus: 0 }, assumptions);

    // Basic pay — and therefore PF on both sides — is a property of recurring
    // pay only, so a one-time bonus must leave both contributions untouched.
    expect(withBonus.employeePfAnnual).toBeCloseTo(withoutBonus.employeePfAnnual, 6);
    expect(withBonus.employerPfAnnual).toBeCloseTo(withoutBonus.employerPfAnnual, 6);
  });

  it('taxes the joining bonus at the margin', () => {
    const result = evaluateJobOffer(baseOffer, assumptions);

    expect(result.firstYearTax).toBeGreaterThan(result.recurringTax);
    expect(result.joiningBonusAfterTax).toBeGreaterThan(0);
    expect(result.joiningBonusAfterTax).toBeLessThan(baseOffer.joiningBonus);
  });

  it('keeps benefits out of the tax base and work costs out of in-hand pay', () => {
    const withBenefits = evaluateJobOffer(baseOffer, assumptions);
    const withoutBenefits = evaluateJobOffer(
      { ...baseOffer, benefitsAnnual: 0, workCostsAnnual: 0 },
      assumptions
    );

    expect(withBenefits.recurringTax).toBeCloseTo(withoutBenefits.recurringTax, 6);
    expect(withBenefits.recurringInHand).toBeCloseTo(withoutBenefits.recurringInHand, 6);
    expect(withBenefits.recurringNetCashValue).toBeCloseTo(
      withoutBenefits.recurringNetCashValue - 120_000 + 100_000,
      6
    );
  });

  it('passes the section 87A rebate through for a 12 lakh new-regime salary', () => {
    const result = evaluateJobOffer(
      {
        ...baseOffer,
        fixedAnnual: 1_200_000,
        variableAnnual: 0,
        benefitsAnnual: 0,
        workCostsAnnual: 0,
        joiningBonus: 0,
        employerPfInCtc: false,
      },
      assumptions
    );

    // Gross 12L less the 75,000 standard deduction lands under the 12L rebate
    // limit, so the rebate wipes out the slab tax entirely.
    expect(result.recurringTax).toBe(0);
    expect(result.effectiveTaxRatePercent).toBe(0);
  });

  it('lowers take-home but raises retirement saving as basic pay rises', () => {
    const lowBasic = evaluateJobOffer({ ...baseOffer, basicPercent: 30 }, assumptions);
    const highBasic = evaluateJobOffer({ ...baseOffer, basicPercent: 50 }, assumptions);

    expect(highBasic.recurringInHand).toBeLessThan(lowBasic.recurringInHand);
    expect(highBasic.retirementSavingsAnnual).toBeGreaterThan(lowBasic.retirementSavingsAnnual);
  });

  it('treats zero and negative inputs as zero rather than producing NaN', () => {
    const result = evaluateJobOffer(
      {
        label: 'Empty',
        fixedAnnual: 0,
        variableAnnual: -50_000,
        variablePayoutPercent: 140,
        basicPercent: -10,
        employerPfInCtc: true,
        benefitsAnnual: 0,
        workCostsAnnual: 0,
        joiningBonus: 0,
      },
      assumptions
    );

    expect(Number.isFinite(result.recurringNetCashValue)).toBe(true);
    expect(result.recurringCtc).toBe(0);
    expect(result.effectiveTaxRatePercent).toBe(0);
  });
});

describe('compareJobOffers', () => {
  it('ranks a higher gross offer below a lower one once costs and tax are applied', () => {
    const modestPayHighCosts: JobOffer = {
      ...baseOffer,
      label: 'Offer A',
      fixedAnnual: 1_500_000,
      workCostsAnnual: 0,
    };
    const highPayHighCosts: JobOffer = {
      ...baseOffer,
      label: 'Offer B',
      fixedAnnual: 1_600_000,
      workCostsAnnual: 400_000,
    };

    const comparison = compareJobOffers([modestPayHighCosts, highPayHighCosts], assumptions);

    expect(comparison.results[1].recurringCtc).toBeGreaterThan(comparison.results[0].recurringCtc);
    expect(comparison.bestByCashIndex).toBe(0);
    expect(comparison.cashGapToRunnerUp).toBeGreaterThan(0);
  });

  it('flags when the cash winner is not the total-value winner', () => {
    const cashHeavy: JobOffer = { ...baseOffer, label: 'Offer A', basicPercent: 25 };
    const pfHeavy: JobOffer = { ...baseOffer, label: 'Offer B', basicPercent: 60 };

    const comparison = compareJobOffers([cashHeavy, pfHeavy], assumptions);

    expect(comparison.bestByCashIndex).toBe(0);
    expect(comparison.bestByTotalValueIndex).toBe(1);
    expect(comparison.rankingsDisagree).toBe(true);
  });

  it('compares a third offer and can rank it first', () => {
    const offers: JobOffer[] = [
      { ...baseOffer, label: 'Offer A', fixedAnnual: 1_500_000 },
      { ...baseOffer, label: 'Offer B', fixedAnnual: 1_600_000 },
      { ...baseOffer, label: 'Offer C', fixedAnnual: 1_900_000 },
    ];

    const comparison = compareJobOffers(offers, assumptions);

    expect(comparison.results).toHaveLength(3);
    expect(comparison.bestByCashIndex).toBe(2);
  });

  it('ignores offers beyond the supported maximum', () => {
    const offers = Array.from({ length: MAX_OFFERS + 2 }, (_, index) => ({
      ...baseOffer,
      label: `Offer ${index}`,
    }));

    expect(compareJobOffers(offers, assumptions).results).toHaveLength(MAX_OFFERS);
  });

  it('returns a neutral comparison when given no offers', () => {
    const comparison = compareJobOffers([], assumptions);

    expect(comparison.results).toHaveLength(0);
    expect(comparison.bestByCashIndex).toBe(-1);
    expect(comparison.rankingsDisagree).toBe(false);
  });
});
