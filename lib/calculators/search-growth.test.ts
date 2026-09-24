import { describe, expect, it } from 'vitest';
import {
  calculateArrearsMonths,
  calculateEighthPayCommission,
  calculateEighthPayCommissionArrears,
  calculateEighthPayCommissionPension,
  calculateGoldLoan,
  calculateMaximumGoldLoanFromValue,
  calculatePersonalLoanEligibility,
  calculateReducingBalanceEmi,
  calculateSsyProjection,
  getGoldLoanLtvCap,
} from './search-growth';

describe('search-growth priority calculators', () => {
  it('keeps current DA in the current baseline and does not double-count it in revised basic', () => {
    const result = calculateEighthPayCommission({
      currentBasic: 44_900,
      currentDaPercent: 60,
      currentHraPercent: 30,
      currentTransportAllowance: 3_600,
      fitmentFactor: 2.57,
      projectedDaPercent: 0,
      projectedHraPercent: 30,
      projectedTransportAllowance: 3_600,
    });

    expect(result.currentDa).toBe(26_940);
    expect(result.currentGross).toBe(88_910);
    expect(result.revisedBasic).toBeCloseTo(115_393);
    expect(result.projectedDa).toBe(0);
    expect(result.projectedGross).toBeCloseTo(153_610.9);
    expect(result.currentHraAnnual).toBe(161_640);
    expect(result.projectedHraAnnual).toBeCloseTo(415_414.8);
    expect(result.hraChangeAnnual).toBeCloseTo(253_774.8);
  });

  it('counts arrears months up to but excluding the selected payment month', () => {
    expect(calculateArrearsMonths(2026, 1, 2027, 1)).toBe(12);
    expect(calculateArrearsMonths(2026, 1, 2027, 9)).toBe(20);
    expect(calculateArrearsMonths(2027, 9, 2026, 1)).toBe(0);
  });

  it('builds arrears from eligible monthly components without assuming an official date', () => {
    const result = calculateEighthPayCommissionArrears({
      currentBasic: 44_900,
      projectedBasic: 115_393,
      currentDa: 26_940,
      projectedDa: 0,
      currentHra: 13_470,
      projectedHra: 34_618,
      currentOtherPay: 3_600,
      projectedOtherPay: 3_600,
      effectiveYear: 2026,
      effectiveMonth: 1,
      paymentYear: 2027,
      paymentMonth: 1,
      oneTimeDeductions: 10_000,
    });

    expect(result.arrearsMonths).toBe(12);
    expect(result.currentEligibleMonthlyPay).toBe(88_910);
    expect(result.projectedEligibleMonthlyPay).toBe(153_611);
    expect(result.monthlyDifference).toBe(64_701);
    expect(result.grossArrearsScenario).toBe(776_412);
    expect(result.afterDeductionsScenario).toBe(766_412);
  });

  it('never reports negative arrears when the projected pay is lower', () => {
    const result = calculateEighthPayCommissionArrears({
      currentBasic: 50_000,
      projectedBasic: 40_000,
      currentDa: 30_000,
      projectedDa: 0,
      currentHra: 15_000,
      projectedHra: 10_000,
      currentOtherPay: 0,
      projectedOtherPay: 0,
      effectiveYear: 2026,
      effectiveMonth: 1,
      paymentYear: 2027,
      paymentMonth: 1,
      oneTimeDeductions: 5_000,
    });

    expect(result.monthlyDifference).toBe(0);
    expect(result.grossArrearsScenario).toBe(0);
    expect(result.afterDeductionsScenario).toBe(0);
  });

  it('keeps pension DR and revision-multiplier assumptions separate', () => {
    const result = calculateEighthPayCommissionPension({
      currentBasicPension: 25_000,
      currentDrPercent: 60,
      revisionMultiplier: 2.57,
      projectedDrPercent: 0,
      additionalPensionPercent: 0,
    });

    expect(result.currentDr).toBe(15_000);
    expect(result.currentMonthlyPension).toBe(40_000);
    expect(result.revisedBasicPensionScenario).toBeCloseTo(64_250);
    expect(result.projectedMonthlyPension).toBeCloseTo(64_250);
    expect(result.monthlyChange).toBeCloseTo(24_250);
    expect(result.annualChange).toBeCloseTo(291_000);
  });

  it('uses the exact RBI gold-loan LTV boundaries', () => {
    expect(getGoldLoanLtvCap(250_000)).toBe(85);
    expect(getGoldLoanLtvCap(250_001)).toBe(80);
    expect(getGoldLoanLtvCap(500_000)).toBe(80);
    expect(getGoldLoanLtvCap(500_001)).toBe(75);
  });

  it('handles the gold-loan LTV transition zones without an impossible bracket result', () => {
    expect(calculateMaximumGoldLoanFromValue(300_000)).toBe(250_000);
    expect(calculateMaximumGoldLoanFromValue(500_000)).toBe(400_000);
    expect(calculateMaximumGoldLoanFromValue(650_000)).toBe(500_000);
    expect(calculateMaximumGoldLoanFromValue(800_000)).toBe(600_000);
  });

  it('values only actual gold purity and caps a request to the maximum eligible amount', () => {
    const result = calculateGoldLoan({
      netGoldWeightGrams: 50,
      purityKarat: 22,
      lenderReferencePrice24k: 9_000,
      requestedLoanAmount: 400_000,
      annualRate: 10,
      tenureMonths: 12,
    });

    expect(result.assessedGoldValue).toBe(412_500);
    expect(result.maximumEligibleLoan).toBe(330_000);
    expect(result.estimatedFundableAmount).toBe(330_000);
    expect(result.shortfallAgainstRequest).toBe(70_000);
  });

  it('supports zero-rate EMI and personal-loan eligibility calculations', () => {
    expect(calculateReducingBalanceEmi(120_000, 0, 12)).toBe(10_000);
    const result = calculatePersonalLoanEligibility({
      monthlyIncome: 75_000,
      existingMonthlyEmi: 10_000,
      foirPercent: 50,
      annualRate: 0,
      tenureMonths: 48,
    });
    expect(result.maxAffordableEmi).toBe(27_500);
    expect(result.eligibleLoanAmount).toBe(1_320_000);
  });

  it('sets personal-loan capacity to zero when existing obligations exhaust FOIR', () => {
    const result = calculatePersonalLoanEligibility({
      monthlyIncome: 50_000,
      existingMonthlyEmi: 30_000,
      foirPercent: 50,
      annualRate: 14,
      tenureMonths: 48,
    });
    expect(result.maxAffordableEmi).toBe(0);
    expect(result.eligibleLoanAmount).toBe(0);
    expect(result.hasAvailableCapacity).toBe(false);
  });

  it('uses 15 years from SSY account opening for deposits and 21 years for maturity', () => {
    const newAccount = calculateSsyProjection({
      girlAgeAtOpening: 5,
      accountAgeYears: 0,
      currentBalance: 0,
      annualDeposit: 50_000,
      annualInterestRate: 8.2,
    });
    const existingAccount = calculateSsyProjection({
      girlAgeAtOpening: 2,
      accountAgeYears: 6,
      currentBalance: 400_000,
      annualDeposit: 50_000,
      annualInterestRate: 8.2,
    });

    expect(newAccount.eligibleOpeningAge).toBe(true);
    expect(newAccount.remainingDepositYears).toBe(15);
    expect(newAccount.yearsToMaturity).toBe(21);
    expect(newAccount.futureDeposits).toBe(750_000);
    expect(existingAccount.remainingDepositYears).toBe(9);
    expect(existingAccount.yearsToMaturity).toBe(15);
  });

  it('uses child age only for SSY opening eligibility', () => {
    const result = calculateSsyProjection({
      girlAgeAtOpening: 10,
      accountAgeYears: 0,
      currentBalance: 0,
      annualDeposit: 50_000,
      annualInterestRate: 8.2,
    });
    expect(result.eligibleOpeningAge).toBe(false);
    expect(result.yearsToMaturity).toBe(21);
  });
});
