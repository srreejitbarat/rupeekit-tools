import { describe, expect, it } from 'vitest';
import {
  MAX_COMMUTATION_PERCENT,
  calculateNotionalIncrement,
  calculatePensionCommutation,
  roundIncrementToHundred,
} from './pension-extras';

describe('roundIncrementToHundred', () => {
  it('rounds up to the next multiple of 100', () => {
    expect(roundIncrementToHundred(1_347)).toBe(1_400);
    expect(roundIncrementToHundred(1_400)).toBe(1_400);
    expect(roundIncrementToHundred(1_401)).toBe(1_500);
  });
});

describe('calculateNotionalIncrement', () => {
  const base = {
    lastBasicPay: 100_000,
    drPercent: 60,
    arrearsMonths: 24,
    commutedPercent: 0,
  };

  it('grants 3% of basic rounded up to the next hundred', () => {
    const result = calculateNotionalIncrement(base);

    expect(result.notionalIncrement).toBe(3_000);
    expect(result.revisedBasicPay).toBe(103_000);
  });

  it('rounds a non-round increment upward', () => {
    const result = calculateNotionalIncrement({ ...base, lastBasicPay: 44_900 });

    // 3% of 44,900 is 1,347, which rounds to 1,400.
    expect(result.notionalIncrement).toBe(1_400);
    expect(result.revisedBasicPay).toBe(46_300);
  });

  it('lifts pension by half the increment before dearness relief', () => {
    const result = calculateNotionalIncrement(base);

    expect(result.currentBasicPension).toBeCloseTo(50_000, 6);
    expect(result.revisedBasicPension).toBeCloseTo(51_500, 6);
    expect(result.basicPensionGain).toBeCloseTo(1_500, 6);
  });

  it('carries dearness relief on the gain', () => {
    const result = calculateNotionalIncrement(base);

    expect(result.monthlyGainWithDr).toBeCloseTo(1_500 * 1.6, 6);
    expect(result.annualGainWithDr).toBeCloseTo(result.monthlyGainWithDr * 12, 6);
  });

  it('scales arrears with the number of months claimed', () => {
    const result = calculateNotionalIncrement(base);

    expect(result.estimatedArrears).toBeCloseTo(result.monthlyGainWithDr * 24, 6);
    expect(calculateNotionalIncrement({ ...base, arrearsMonths: 0 }).estimatedArrears).toBe(0);
  });

  it('reduces pension for commutation but not dearness relief', () => {
    const result = calculateNotionalIncrement({ ...base, commutedPercent: 40 });

    // 50,000 basic pension: 60% is paid after commuting 40%, plus DR on the full amount.
    expect(result.currentMonthlyInHand).toBeCloseTo(50_000 * 0.6 + 50_000 * 0.6, 6);
    // The gain still flows through, so the revised figure stays higher.
    expect(result.revisedMonthlyInHand).toBeGreaterThan(result.currentMonthlyInHand);
  });

  it('caps commutation at the statutory maximum', () => {
    const overCap = calculateNotionalIncrement({ ...base, commutedPercent: 80 });
    const atCap = calculateNotionalIncrement({ ...base, commutedPercent: 40 });

    expect(overCap.currentMonthlyInHand).toBeCloseTo(atCap.currentMonthlyInHand, 6);
  });

  it('returns finite zeros for empty input', () => {
    const result = calculateNotionalIncrement({ ...base, lastBasicPay: 0 });

    expect(Number.isFinite(result.estimatedArrears)).toBe(true);
    expect(result.notionalIncrement).toBe(0);
  });
});

describe('calculatePensionCommutation', () => {
  const base = {
    basicPension: 50_000,
    commutedPercent: 40,
    commutationFactor: 8.194,
    drPercent: 60,
  };

  it('computes the lump sum as commuted pension x 12 x factor', () => {
    const result = calculatePensionCommutation(base);

    expect(result.commutedMonthlyPension).toBeCloseTo(20_000, 6);
    expect(result.lumpSum).toBeCloseTo(20_000 * 12 * 8.194, 4);
  });

  it('keeps dearness relief on the full basic pension', () => {
    const result = calculatePensionCommutation(base);

    // The rule most people miss: DR is not reduced by commutation.
    expect(result.monthlyDearnessRelief).toBeCloseTo(50_000 * 0.6, 6);
    expect(result.reducedBasicPension).toBeCloseTo(30_000, 6);
    expect(result.monthlyInHandAfterCommutation).toBeCloseTo(30_000 + 30_000, 6);
  });

  it('shows the monthly reduction as the commuted pension only', () => {
    const result = calculatePensionCommutation(base);

    expect(result.monthlyReduction).toBeCloseTo(20_000, 6);
    expect(
      result.monthlyInHandWithoutCommutation - result.monthlyInHandAfterCommutation
    ).toBeCloseTo(20_000, 6);
  });

  it('breaks even at roughly the factor in years', () => {
    const result = calculatePensionCommutation(base);

    // Lump sum / monthly reduction = 12 x factor months.
    expect(result.breakEvenMonths).toBeCloseTo(12 * 8.194, 4);
    expect(result.breakEvenMonths / 12).toBeCloseTo(8.194, 4);
  });

  it('leaves the pensioner ahead over the 15-year restoration period', () => {
    const result = calculatePensionCommutation(base);

    expect(result.restorationYears).toBe(15);
    expect(result.totalForgoneOverRestoration).toBeCloseTo(20_000 * 180, 6);
    // Break-even at ~8.2 years is inside 15, so the lump sum loses over the period.
    expect(result.netOverRestoration).toBeLessThan(0);
  });

  it('caps the commuted share at 40% and flags it', () => {
    const result = calculatePensionCommutation({ ...base, commutedPercent: 60 });

    expect(result.cappedAtMaximum).toBe(true);
    expect(result.commutedMonthlyPension).toBeCloseTo(
      50_000 * (MAX_COMMUTATION_PERCENT / 100),
      6
    );
  });

  it('returns finite zeros when nothing is commuted', () => {
    const result = calculatePensionCommutation({ ...base, commutedPercent: 0 });

    expect(result.lumpSum).toBe(0);
    expect(result.breakEvenMonths).toBe(0);
    expect(Number.isFinite(result.netOverRestoration)).toBe(true);
  });
});
