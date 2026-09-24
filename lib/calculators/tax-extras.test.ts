import { describe, expect, it } from 'vitest';
import {
  KNOWN_CII,
  RULE_9D_THRESHOLD_WITHOUT_EMPLOYER,
  RULE_9D_THRESHOLD_WITH_EMPLOYER,
  calculateInheritedPropertyGains,
  calculateRule9d,
  type InheritedPropertyInputs,
  type Rule9dInputs,
} from './tax-extras';

const rule9dBase: Rule9dInputs = {
  annualEmployeeContribution: 400_000,
  interestRatePercent: 8.25,
  years: 3,
  employerAlsoContributes: true,
  panLinked: true,
  openingTaxableBalance: 0,
  openingNonTaxableBalance: 0,
};

describe('calculateRule9d', () => {
  it('splits contributions at the 2.5 lakh threshold', () => {
    const result = calculateRule9d(rule9dBase);

    expect(result.threshold).toBe(RULE_9D_THRESHOLD_WITH_EMPLOYER);
    expect(result.rows[0].nonTaxableContribution).toBe(250_000);
    expect(result.rows[0].taxableContribution).toBe(150_000);
  });

  it('raises the threshold to 5 lakh where the employer does not contribute', () => {
    const result = calculateRule9d({ ...rule9dBase, employerAlsoContributes: false });

    expect(result.threshold).toBe(RULE_9D_THRESHOLD_WITHOUT_EMPLOYER);
    expect(result.rows[0].taxableContribution).toBe(0);
    expect(result.entirelyBelowThreshold).toBe(true);
  });

  it('charges interest only on the taxable account', () => {
    const result = calculateRule9d(rule9dBase);
    const firstYear = result.rows[0];

    expect(firstYear.taxableInterest).toBeCloseTo(150_000 * 0.0825, 6);
    expect(firstYear.nonTaxableInterest).toBeCloseTo(250_000 * 0.0825, 6);
  });

  it('carries both balances forward so taxable interest compounds', () => {
    const result = calculateRule9d(rule9dBase);

    expect(result.rows[1].taxableInterest).toBeGreaterThan(result.rows[0].taxableInterest);
    expect(result.rows[2].taxableInterest).toBeGreaterThan(result.rows[1].taxableInterest);

    const expectedYearTwoBase = 150_000 * 1.0825 + 150_000;
    expect(result.rows[1].taxableInterest).toBeCloseTo(expectedYearTwoBase * 0.0825, 4);
  });

  it('deducts TDS at 10% once taxable interest passes 5,000', () => {
    const result = calculateRule9d(rule9dBase);

    expect(result.rows[0].taxableInterest).toBeGreaterThan(5_000);
    expect(result.rows[0].tdsDeducted).toBeCloseTo(result.rows[0].taxableInterest * 0.1, 6);
  });

  it('deducts TDS at 20% without a linked PAN', () => {
    const result = calculateRule9d({ ...rule9dBase, panLinked: false });

    expect(result.rows[0].tdsDeducted).toBeCloseTo(result.rows[0].taxableInterest * 0.2, 6);
  });

  it('skips TDS when taxable interest stays under the threshold', () => {
    const result = calculateRule9d({ ...rule9dBase, annualEmployeeContribution: 255_000 });

    // 5,000 of taxable contribution earns about 412 of interest.
    expect(result.rows[0].taxableInterest).toBeLessThan(5_000);
    expect(result.rows[0].tdsDeducted).toBe(0);
  });

  it('produces nothing taxable when contributions sit below the threshold', () => {
    const result = calculateRule9d({ ...rule9dBase, annualEmployeeContribution: 200_000 });

    expect(result.totalTaxableInterest).toBe(0);
    expect(result.totalTds).toBe(0);
    expect(result.entirelyBelowThreshold).toBe(true);
  });

  it('honours opening balances from earlier years', () => {
    const result = calculateRule9d({ ...rule9dBase, openingTaxableBalance: 500_000 });

    expect(result.rows[0].taxableInterest).toBeCloseTo((500_000 + 150_000) * 0.0825, 6);
    expect(result.entirelyBelowThreshold).toBe(false);
  });

  it('returns one row per projected year', () => {
    expect(calculateRule9d({ ...rule9dBase, years: 10 }).rows).toHaveLength(10);
    expect(calculateRule9d({ ...rule9dBase, years: 0 }).rows).toHaveLength(1);
  });
});

const propertyBase: InheritedPropertyInputs = {
  salePrice: 10_000_000,
  saleYearCii: KNOWN_CII['2026-27'],
  previousOwnerCost: 200_000,
  acquiredBeforeApril2001: true,
  fairMarketValue2001: 800_000,
  acquisitionYearCii: 100,
  costOfImprovement: 0,
  transferExpenses: 200_000,
  eligibleForIndexationChoice: true,
};

describe('calculateInheritedPropertyGains', () => {
  it('substitutes the 2001 fair market value when it is higher', () => {
    const result = calculateInheritedPropertyGains(propertyBase);

    expect(result.costOfAcquisitionUsed).toBe(800_000);
    expect(result.usedFairMarketValue).toBe(true);
    expect(result.effectiveAcquisitionCii).toBe(100);
  });

  it('keeps actual cost when it exceeds the 2001 value', () => {
    const result = calculateInheritedPropertyGains({
      ...propertyBase,
      previousOwnerCost: 1_200_000,
    });

    expect(result.costOfAcquisitionUsed).toBe(1_200_000);
    expect(result.usedFairMarketValue).toBe(false);
  });

  it('indexes from the base year for a pre-2001 acquisition', () => {
    const result = calculateInheritedPropertyGains(propertyBase);

    expect(result.indexedCostOfAcquisition).toBeCloseTo(800_000 * (384 / 100), 4);
  });

  it('uses the acquisition year index for a post-2001 acquisition', () => {
    const result = calculateInheritedPropertyGains({
      ...propertyBase,
      acquiredBeforeApril2001: false,
      previousOwnerCost: 2_000_000,
      acquisitionYearCii: 200,
    });

    expect(result.effectiveAcquisitionCii).toBe(200);
    expect(result.indexedCostOfAcquisition).toBeCloseTo(2_000_000 * (384 / 200), 4);
  });

  it('nets transfer expenses off the sale consideration', () => {
    const result = calculateInheritedPropertyGains(propertyBase);

    expect(result.netSaleConsideration).toBe(9_800_000);
  });

  it('computes both routes and picks the cheaper one', () => {
    const result = calculateInheritedPropertyGains(propertyBase);

    expect(result.gainWithoutIndexation).toBeCloseTo(9_800_000 - 800_000, 4);
    expect(result.gainWithIndexation).toBeCloseTo(9_800_000 - 800_000 * 3.84, 4);
    expect(result.taxPayable).toBeCloseTo(
      Math.min(result.taxWithoutIndexation, result.taxWithIndexation),
      6
    );
  });

  it('picks the cheaper route in each direction, not by holding period', () => {
    // The rate gap means indexation only wins below roughly 8.57x the cost.
    // A large gain on the same pre-2001 property still favours the flat 12.5%.
    const largeGain = calculateInheritedPropertyGains(propertyBase);
    expect(largeGain.betterOption).toBe('without-indexation');
    expect(largeGain.taxWithoutIndexation).toBeLessThan(largeGain.taxWithIndexation);

    // A smaller gain on the identical property flips the answer.
    const smallGain = calculateInheritedPropertyGains({
      ...propertyBase,
      salePrice: 5_000_000,
    });
    expect(smallGain.betterOption).toBe('with-indexation');
    expect(smallGain.taxWithIndexation).toBeLessThan(smallGain.taxWithoutIndexation);
    expect(smallGain.savingFromChoosing).toBeGreaterThan(0);
  });

  it('forces the 12.5% route when the choice is unavailable', () => {
    const result = calculateInheritedPropertyGains({
      ...propertyBase,
      eligibleForIndexationChoice: false,
    });

    expect(result.taxPayable).toBeCloseTo(result.taxWithoutIndexation, 6);
    expect(result.betterOption).toBe('without-indexation');
    expect(result.savingFromChoosing).toBe(0);
  });

  it('never reports a negative gain', () => {
    const result = calculateInheritedPropertyGains({
      ...propertyBase,
      salePrice: 100_000,
    });

    expect(result.gainWithoutIndexation).toBe(0);
    expect(result.gainWithIndexation).toBe(0);
    expect(result.taxPayable).toBe(0);
  });

  it('returns finite zeros for empty input', () => {
    const result = calculateInheritedPropertyGains({
      ...propertyBase,
      salePrice: 0,
      previousOwnerCost: 0,
      fairMarketValue2001: 0,
      transferExpenses: 0,
    });

    expect(Number.isFinite(result.taxPayable)).toBe(true);
    expect(result.taxPayable).toBe(0);
  });
});
