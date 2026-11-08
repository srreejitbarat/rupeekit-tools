import { describe, expect, it } from 'vitest';
import {
  GRATUITY_CEILING,
  calculateLabourCodeImpact,
  calculateNewWageGratuity,
  type LabourCodeInputs,
} from './labour-code';

const baseInputs: LabourCodeInputs = {
  annualCtc: 1_200_000,
  currentBasicPercent: 30,
  monthlyProfessionalTax: 200,
  employerPfInCtc: true,
  gratuityAccrualInCtc: true,
  applyPfCeiling: false,
};

describe('calculateLabourCodeImpact', () => {
  it('lifts wages to half of cash remuneration when basic is below the floor', () => {
    const result = calculateLabourCodeImpact(baseInputs);

    expect(result.after.wagesShareOfRemuneration).toBeCloseTo(50, 4);
    expect(result.after.monthlyWages).toBeGreaterThan(result.before.monthlyWages);
    expect(result.alreadyCompliant).toBe(false);
  });

  it('reduces take-home and raises retirement saving for a low-basic structure', () => {
    const result = calculateLabourCodeImpact(baseInputs);

    expect(result.monthlyTakeHomeChange).toBeLessThan(0);
    expect(result.monthlyRetirementSavingChange).toBeGreaterThan(0);
    expect(result.annualTakeHomeChange).toBeCloseTo(result.monthlyTakeHomeChange * 12, 6);
  });

  it('keeps the CTC identity intact in both scenarios', () => {
    const result = calculateLabourCodeImpact(baseInputs);
    const monthlyCtc = baseInputs.annualCtc / 12;

    for (const scenario of [result.before, result.after]) {
      const reconstructed =
        scenario.monthlyGrossCash + scenario.monthlyEmployerPf + scenario.monthlyGratuityAccrual;
      expect(reconstructed).toBeCloseTo(monthlyCtc, 2);
    }
  });

  it('leaves a structure that already clears 50% unchanged', () => {
    const result = calculateLabourCodeImpact({ ...baseInputs, currentBasicPercent: 60 });

    expect(result.alreadyCompliant).toBe(true);
    expect(result.monthlyTakeHomeChange).toBeCloseTo(0, 2);
    expect(result.monthlyRetirementSavingChange).toBeCloseTo(0, 2);
  });

  it.each([
    [20_000, 2_400],
    [25_000, 3_000],
    [30_000, 3_000],
  ])('caps PF on wages of %i at a contribution of %i per side', (wages, contribution) => {
    const result = calculateLabourCodeImpact({
      ...baseInputs,
      annualCtc: wages * 24,
      currentBasicPercent: 50,
      applyPfCeiling: true,
    });
    for (const scenario of [result.before, result.after]) {
      expect(scenario.monthlyEmployeePf).toBeCloseTo(contribution, 6);
      expect(scenario.monthlyEmployerPf).toBeCloseTo(contribution, 6);
    }
  });

  it('drops employer PF from CTC when the employer pays it on top', () => {
    const result = calculateLabourCodeImpact({ ...baseInputs, employerPfInCtc: false });

    expect(result.before.monthlyEmployerPf).toBe(0);
    expect(result.after.monthlyEmployerPf).toBe(0);
  });

  it('scales take-home linearly with CTC at a fixed structure', () => {
    const single = calculateLabourCodeImpact(baseInputs);
    const double = calculateLabourCodeImpact({
      ...baseInputs,
      annualCtc: baseInputs.annualCtc * 2,
      monthlyProfessionalTax: baseInputs.monthlyProfessionalTax * 2,
    });

    expect(double.after.monthlyTakeHome).toBeCloseTo(single.after.monthlyTakeHome * 2, 2);
  });

  it('returns finite zeroed output for empty input rather than NaN', () => {
    const result = calculateLabourCodeImpact({ ...baseInputs, annualCtc: 0 });

    expect(Number.isFinite(result.after.monthlyTakeHome)).toBe(true);
    expect(result.after.monthlyTakeHome).toBe(0);
    expect(Number.isFinite(result.takeHomeChangePercent)).toBe(true);
  });
});

describe('calculateNewWageGratuity', () => {
  const inputs = {
    currentMonthlyBasic: 30_000,
    monthlyGrossCash: 100_000,
    yearsOfService: 10,
    isFixedTermEmployee: false,
  };

  it('applies the 15/26 formula on the revised wage base', () => {
    const result = calculateNewWageGratuity(inputs);

    expect(result.revisedWages).toBeCloseTo(50_000, 6);
    expect(result.gratuityOnRevisedWages).toBeCloseTo((50_000 / 26) * 15 * 10, 6);
    expect(result.gratuityIncrease).toBeGreaterThan(0);
  });

  it.each([
    [4.99, 0],
    [5, 5],
    [5.5, 5],
    [5.51, 6],
  ])('counts %s years of regular service as %s payable years', (serviceYears, payableYears) => {
    const result = calculateNewWageGratuity({ ...inputs, yearsOfService: serviceYears });
    expect(result.isEligible).toBe(payableYears > 0);
    expect(result.gratuityOnCurrentWages).toBeCloseTo((30_000 / 26) * 15 * payableYears);
    expect(result.cappedGratuity).toBeCloseTo((50_000 / 26) * 15 * payableYears);
  });

  it.each([
    [0.99, 0],
    [1, 1],
    [1.75, 1.75],
  ])('prorates %s years at fixed-term contract expiry as %s payable years', (serviceYears, payableYears) => {
    const result = calculateNewWageGratuity({ ...inputs, yearsOfService: serviceYears, isFixedTermEmployee: true });
    expect(result.isEligible).toBe(payableYears > 0);
    expect(result.cappedGratuity).toBeCloseTo((50_000 / 26) * 15 * payableYears);
  });

  it('holds the payout at the statutory ceiling', () => {
    const result = calculateNewWageGratuity({
      ...inputs,
      currentMonthlyBasic: 500_000,
      monthlyGrossCash: 1_000_000,
      yearsOfService: 30,
    });

    expect(result.gratuityOnRevisedWages).toBeGreaterThan(GRATUITY_CEILING);
    expect(result.cappedGratuity).toBe(GRATUITY_CEILING);
  });

  it('does not reduce wages when basic already exceeds half of cash pay', () => {
    const result = calculateNewWageGratuity({ ...inputs, currentMonthlyBasic: 70_000 });

    expect(result.revisedWages).toBeCloseTo(70_000, 6);
    expect(result.gratuityIncrease).toBeCloseTo(0, 6);
  });
});
