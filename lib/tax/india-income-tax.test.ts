import { describe, expect, it } from 'vitest';
import { estimateIncomeTax, type FinancialYear } from './india-income-tax';

// This engine used to pick its new-regime slab table and Section 87A rebate limit with
// `financialYear === '2025-26' ? ... : ...`, so any year that was not literally
// '2025-26' silently fell back to the FY 2024-25 table and a Rs 7 lakh rebate limit.
// FY 2026-27 is now registered explicitly; these tests fail loudly if that fallback
// ever returns.
describe('estimateIncomeTax - new-regime year selection', () => {
  // Employer PF excluded and employee PF at 0% keeps gross salary equal to CTC, so
  // new-regime taxable income is simply CTC minus the Rs 75,000 standard deduction.
  const baseInput = {
    basicSalaryPercent: 40,
    employerPfIncludedInCtc: false,
    employeePfRate: 0,
    monthlyProfessionalTax: 0,
    monthlyOtherDeductions: 0,
    regime: 'new' as const,
    ageGroup: 'below60' as const,
    input80C: 0,
    input80D: 0,
    hraReceivedMonthly: 0,
    rentPaidMonthly: 0,
    cityType: 'metro' as const,
    otherDeductionsOldRegime: 0,
  };

  const atTaxableIncome = (taxableIncome: number, financialYear: FinancialYear) =>
    estimateIncomeTax({ ...baseInput, annualCtc: taxableIncome + 75000, financialYear });

  // The result's `taxBeforeCess` is the figure after the Section 87A rebate has been
  // applied, so the gross slab tax has to come from the slab breakdown.
  const grossSlabTax = (result: ReturnType<typeof estimateIncomeTax>) =>
    result.slabBreakdown.reduce((total, slab) => total + slab.taxInSlab, 0);

  it('applies the Rs 12 lakh rebate limit for FY 2026-27, not the Rs 7 lakh fallback', () => {
    // Taxable Rs 11 lakh sits above the old Rs 7 lakh limit but below Rs 12 lakh.
    // Under the correct FY 2026-27 rules the rebate wipes the tax out entirely;
    // under the old silent fallback this returned Rs 67,600.
    const result = atTaxableIncome(1100000, '2026-27');
    expect(result.taxableIncome).toBe(1100000);
    expect(grossSlabTax(result)).toBe(50000);
    expect(result.taxBeforeCess).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.totalTax).not.toBe(67600);
  });

  it('still applies the Rs 7 lakh limit and Budget 2024 slabs for FY 2024-25', () => {
    const result = atTaxableIncome(1100000, '2024-25');
    expect(grossSlabTax(result)).toBe(65000);
    expect(result.taxBeforeCess).toBe(65000);
    expect(result.totalTax).toBe(67600);
  });

  it('matches the published Rs 10,400 marginal-relief figure for FY 2026-27', () => {
    const result = atTaxableIncome(1210000, '2026-27');
    expect(grossSlabTax(result)).toBe(61500);
    expect(result.taxBeforeCess).toBe(10000);
    expect(result.cess).toBe(400);
    expect(result.totalTax).toBe(10400);
  });

  it('produces identical results for FY 2025-26 and FY 2026-27', () => {
    // Budget 2026 changed neither the slabs nor the rebate, so the two years must agree.
    for (const taxableIncome of [500000, 1100000, 1210000, 1500000, 2500000]) {
      const y2526 = atTaxableIncome(taxableIncome, '2025-26');
      const y2627 = atTaxableIncome(taxableIncome, '2026-27');
      expect(y2627.totalTax).toBe(y2526.totalTax);
      expect(y2627.slabBreakdown).toEqual(y2526.slabBreakdown);
    }
  });
});

describe('estimateIncomeTax - CTC to monthly take-home reconciliation', () => {
  it('reconciles a Rs 12 lakh annual CTC across annual and monthly units', () => {
    const result = estimateIncomeTax({
      annualCtc: 1_200_000,
      basicSalaryPercent: 50,
      employerPfIncludedInCtc: true,
      employeePfRate: 12,
      monthlyProfessionalTax: 200,
      monthlyOtherDeductions: 0,
      regime: 'new',
      financialYear: '2026-27',
      ageGroup: 'below60',
      input80C: 0,
      input80D: 0,
      hraReceivedMonthly: 0,
      rentPaidMonthly: 0,
      cityType: 'nonMetro',
      otherDeductionsOldRegime: 0,
    });

    expect(result.employerPfAnnual).toBe(72_000);
    expect(result.grossAnnualSalary + result.employerPfAnnual).toBe(1_200_000);
    expect(result.grossMonthlySalary * 12).toBe(result.grossAnnualSalary);
    expect(result.employeePfMonthly * 12).toBe(result.employeePfAnnual);
    expect(result.professionalTaxMonthly * 12).toBe(result.professionalTaxAnnual);
    expect(result.monthlyInHand * 12).toBe(result.annualInHand);
    expect(
      result.annualInHand
      + result.employeePfAnnual
      + result.professionalTaxAnnual
      + result.otherDeductionsAnnual
      + result.totalTax
    ).toBeCloseTo(result.grossAnnualSalary, 6);
    expect(result.monthlyInHand).toBe(87_800);
  });
});
