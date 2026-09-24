import { describe, it, expect } from 'vitest';
import { calculateIndianIncomeTax, TaxInput } from './calculator';
import { availableTaxYears, indiaIncomeTaxRules } from './indiaIncomeTaxRules';

describe('calculateIndianIncomeTax - FY 2024-25', () => {
  const taxYear = '2024-25';

  const baseInput: TaxInput = {
    grossSalary: 0,
    hraExemption: 0,
    homeLoanInterest: 0,
    section80C: 0,
    section80D: 0,
    employerNPS: 0,
    otherDeductionsOldRegime: 0,
    otherDeductionsBothRegimes: 0,
    isSalaried: true,
  };

  it('should return 0 tax for zero income', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 0 }, taxYear);
    expect(result.oldRegime.finalTax).toBe(0);
    expect(result.newRegime.finalTax).toBe(0);
  });

  it('should apply standard deduction correctly', () => {
    // 800,000 gross. Old regime std: 50,000. New regime std: 75,000
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 800000 }, taxYear);
    expect(result.oldRegime.taxableIncome).toBe(750000);
    expect(result.newRegime.taxableIncome).toBe(725000);
  });

  it('should apply Section 87A rebate and return 0 tax below limits', () => {
    // Old regime limit: 5L. So gross 5.5L with 50k std ded = 5L taxable.
    const resultOld = calculateIndianIncomeTax({ ...baseInput, grossSalary: 550000 }, taxYear);
    expect(resultOld.oldRegime.finalTax).toBe(0);

    // New regime limit: 7L. So gross 7.75L with 75k std ded = 7L taxable.
    const resultNew = calculateIndianIncomeTax({ ...baseInput, grossSalary: 775000 }, taxYear);
    expect(resultNew.newRegime.finalTax).toBe(0);
  });

  it('should apply marginal relief correctly in new regime', () => {
    // Gross 7.76L -> taxable 7.01L in new regime.
    // Tax without relief:
    // 3L to 7L (4L * 5% = 20k)
    // 7L to 7.01L (1k * 10% = 100)
    // Total slab tax = 20100.
    // Income exceeding limit = 1000.
    // Since 20100 > 1000, marginal relief applies.
    // Tax after rebate = 1000.
    // Cess 4% = 40.
    // Final tax = 1040.
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 776000 }, taxYear);
    expect(result.newRegime.rebate).toBe(19100);
    expect(result.newRegime.taxAfterRebate).toBe(1000);
    expect(result.newRegime.cess).toBe(40);
    expect(result.newRegime.finalTax).toBe(1040);
  });

  it('should calculate old regime with deductions accurately', () => {
    const input: TaxInput = {
      ...baseInput,
      grossSalary: 1200000,
      section80C: 150000,
      hraExemption: 100000,
      section80D: 25000,
    };
    const result = calculateIndianIncomeTax(input, taxYear);
    
    // Total Old Deds = 50k (std) + 150k + 100k + 25k = 325,000
    // Taxable Old = 12,00,000 - 325,000 = 8,75,000
    // Slabs Old: 0-2.5L (0), 2.5-5L (12500), 5-8.75L (3.75L * 20% = 75000) = 87500
    // Cess: 87500 * 0.04 = 3500
    // Final Old = 91000
    expect(result.oldRegime.taxableIncome).toBe(875000);
    expect(result.oldRegime.finalTax).toBe(91000);

    // New Deds = 75k (std)
    // Taxable New = 11,25,000
    // Slabs New: 0-3L(0), 3-7L(20k), 7-10L(30k), 10-11.25L(1.25L*15%=18750) = 68750
    // Cess: 68750 * 0.04 = 2750
    // Final New = 71500
    expect(result.newRegime.taxableIncome).toBe(1125000);
    expect(result.newRegime.finalTax).toBe(71500);

    expect(result.recommendedRegime).toBe('New');
    expect(result.savingsAmount).toBe(19500);
  });
});

describe('calculateIndianIncomeTax - FY 2025-26 (AY 2026-27)', () => {
  const taxYear = '2025-26';

  const baseInput: TaxInput = {
    grossSalary: 0,
    hraExemption: 0,
    homeLoanInterest: 0,
    section80C: 0,
    section80D: 0,
    employerNPS: 0,
    otherDeductionsOldRegime: 0,
    otherDeductionsBothRegimes: 0,
    isSalaried: true,
  };

  it('is exposed as an available tax year', () => {
    expect(availableTaxYears).toContain('2025-26');
    expect(indiaIncomeTaxRules['2025-26'].ay).toBe('2026-27');
  });

  it('returns 0 tax for zero income in both regimes', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 0 }, taxYear);
    expect(result.oldRegime.finalTax).toBe(0);
    expect(result.newRegime.finalTax).toBe(0);
  });

  it('applies the new-regime standard deduction of Rs 75,000 for salaried input', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1000000 }, taxYear);
    expect(result.newRegime.taxableIncome).toBe(925000);
  });

  it('keeps the old-regime standard deduction at Rs 50,000', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1000000 }, taxYear);
    expect(result.oldRegime.taxableIncome).toBe(950000);
  });

  it('does not apply the salary standard deduction for non-salaried input', () => {
    const result = calculateIndianIncomeTax(
      { ...baseInput, grossSalary: 1000000, isSalaried: false },
      taxYear
    );
    expect(result.oldRegime.taxableIncome).toBe(1000000);
    expect(result.newRegime.taxableIncome).toBe(1000000);
  });

  it('computes new-regime slab boundaries correctly (no rebate cases)', () => {
    // Taxable exactly 16,00,000 (gross 16.75L): 0 + 20,000 + 40,000 + 60,000 = 1,20,000; cess 4,800
    const at16 = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1675000 }, taxYear);
    expect(at16.newRegime.taxableIncome).toBe(1600000);
    expect(at16.newRegime.totalSlabTax).toBe(120000);
    expect(at16.newRegime.finalTax).toBe(124800);

    // Taxable exactly 24,00,000 (gross 24.75L): 20k + 40k + 60k + 80k + 1L = 3,00,000; cess 12,000
    const at24 = calculateIndianIncomeTax({ ...baseInput, grossSalary: 2475000 }, taxYear);
    expect(at24.newRegime.taxableIncome).toBe(2400000);
    expect(at24.newRegime.totalSlabTax).toBe(300000);
    expect(at24.newRegime.finalTax).toBe(312000);

    // Taxable 26,00,000 (gross 26.75L): 3,00,000 + 2,00,000 * 30% = 3,60,000; cess 14,400
    const at26 = calculateIndianIncomeTax({ ...baseInput, grossSalary: 2675000 }, taxYear);
    expect(at26.newRegime.totalSlabTax).toBe(360000);
    expect(at26.newRegime.finalTax).toBe(374400);
  });

  it('gives zero new-regime tax at Rs 12.75 lakh gross salary via the Section 87A rebate', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1275000 }, taxYear);
    expect(result.newRegime.taxableIncome).toBe(1200000);
    expect(result.newRegime.totalSlabTax).toBe(60000);
    expect(result.newRegime.rebate).toBe(60000);
    expect(result.newRegime.taxAfterRebate).toBe(0);
    expect(result.newRegime.finalTax).toBe(0);
  });

  it('caps the Section 87A rebate at the configured maximum', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1275000 }, taxYear);
    expect(result.newRegime.rebate).toBeLessThanOrEqual(
      indiaIncomeTaxRules[taxYear].newRegime.maxRebate
    );
    expect(indiaIncomeTaxRules[taxYear].newRegime.maxRebate).toBe(60000);
  });

  it('applies marginal relief at Rs 12.76 lakh gross salary (taxable 12.01 lakh)', () => {
    // Taxable 12,01,000. Slab tax = 20,000 + 40,000 + 1,000 * 15% = 60,150.
    // Income exceeding limit = 1,000. 60,150 > 1,000, so relief applies.
    // Tax after rebate = 1,000; cess = 40; final = 1,040.
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1276000 }, taxYear);
    expect(result.newRegime.taxableIncome).toBe(1201000);
    expect(result.newRegime.totalSlabTax).toBe(60150);
    expect(result.newRegime.rebate).toBe(59150);
    expect(result.newRegime.taxAfterRebate).toBe(1000);
    expect(result.newRegime.cess).toBe(40);
    expect(result.newRegime.finalTax).toBe(1040);
  });

  it('computes Rs 97,500 new-regime tax for Rs 15 lakh gross salary with no extra deductions', () => {
    // Taxable 14,25,000: 20,000 + 40,000 + 2,25,000 * 15% = 93,750; cess 3,750; final 97,500.
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1500000 }, taxYear);
    expect(result.newRegime.taxableIncome).toBe(1425000);
    expect(result.newRegime.totalSlabTax).toBe(93750);
    expect(result.newRegime.finalTax).toBe(97500);
  });

  it('derives cess from the configured cessRate', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1500000 }, taxYear);
    const expectedCess = Math.round(
      result.newRegime.taxAfterRebate * indiaIncomeTaxRules[taxYear].cessRate
    );
    expect(result.newRegime.cess).toBe(expectedCess);
  });

  it('keeps old-regime rebate behaviour at the Rs 5 lakh limit', () => {
    // Gross 5.5L - 50k std = 5L taxable. Slab tax 12,500 fully rebated.
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 550000 }, taxYear);
    expect(result.oldRegime.taxableIncome).toBe(500000);
    expect(result.oldRegime.rebate).toBe(12500);
    expect(result.oldRegime.finalTax).toBe(0);
  });

  it('still recommends a regime and reports savings', () => {
    const result = calculateIndianIncomeTax({ ...baseInput, grossSalary: 1500000 }, taxYear);
    expect(['Old', 'New', 'Equal']).toContain(result.recommendedRegime);
    expect(result.recommendedRegime).toBe('New');
    expect(result.savingsAmount).toBe(result.oldRegime.finalTax - result.newRegime.finalTax);
  });

  it('throws a clear error for unsupported years', () => {
    expect(() => calculateIndianIncomeTax({ ...baseInput, grossSalary: 1000000 }, '2030-31')).toThrow(
      'Tax rules for year 2030-31 not found.'
    );
  });
});

// These pin the figures published in the "Income Tax on Rs 12 Lakh Salary" article
// to the engine, so the two cannot drift apart again. The article previously claimed
// an all-or-nothing cliff (Rs 63,960 of tax on Rs 12.1 lakh) while the engine had
// always applied marginal relief correctly.
//
// The article is written for FY 2026-27. Budget 2026 left the slabs and the rebate
// unchanged, so both supported years must produce the same published figures — and
// running against both is what proves the article's year is genuinely covered.
describe.each(['2025-26', '2026-27'])(
  'Section 87A marginal relief - published article figures (FY %s)',
  (taxYear) => {
  const STANDARD_DEDUCTION = 75000;
  const REBATE_LIMIT = 1200000;

  const baseInput: TaxInput = {
    grossSalary: 0,
    hraExemption: 0,
    homeLoanInterest: 0,
    section80C: 0,
    section80D: 0,
    employerNPS: 0,
    otherDeductionsOldRegime: 0,
    otherDeductionsBothRegimes: 0,
    isSalaried: true,
  };

  const atTaxableIncome = (taxableIncome: number) =>
    calculateIndianIncomeTax(
      { ...baseInput, grossSalary: taxableIncome + STANDARD_DEDUCTION },
      taxYear
    ).newRegime;

  it('charges Rs 10,400 on taxable income of Rs 12.1 lakh, not the Rs 63,960 cliff', () => {
    // Slab tax 61,500 = 20,000 + 40,000 + 10,000 * 15%.
    // Excess over Rs 12L is 10,000, so relief caps tax before cess at 10,000.
    const result = atTaxableIncome(1210000);
    expect(result.taxableIncome).toBe(1210000);
    expect(result.totalSlabTax).toBe(61500);
    expect(result.rebate).toBe(51500);
    expect(result.taxAfterRebate).toBe(10000);
    expect(result.cess).toBe(400);
    expect(result.finalTax).toBe(10400);
    expect(result.finalTax).not.toBe(63960);
  });

  it('charges Rs 52,000 on taxable income of Rs 12.5 lakh', () => {
    // Slab tax 67,500; excess over Rs 12L is 50,000, so relief still binds.
    const result = atTaxableIncome(1250000);
    expect(result.totalSlabTax).toBe(67500);
    expect(result.taxAfterRebate).toBe(50000);
    expect(result.cess).toBe(2000);
    expect(result.finalTax).toBe(52000);
  });

  it('tapers relief away once slab tax no longer exceeds the excess', () => {
    // Break-even is at 60,000 / 0.85 = Rs 70,588 above the limit.
    const stillRelieved = atTaxableIncome(1270000);
    expect(stillRelieved.totalSlabTax).toBe(70500);
    expect(stillRelieved.taxAfterRebate).toBe(70000);
    expect(stillRelieved.finalTax).toBe(72800);

    const noLongerRelieved = atTaxableIncome(1271000);
    expect(noLongerRelieved.totalSlabTax).toBe(70650);
    expect(noLongerRelieved.rebate).toBe(0);
    expect(noLongerRelieved.taxAfterRebate).toBe(70650);
    expect(noLongerRelieved.finalTax).toBe(73476);
  });

  it('applies plain slab tax well above the relief band', () => {
    const result = atTaxableIncome(1300000);
    expect(result.totalSlabTax).toBe(75000);
    expect(result.rebate).toBe(0);
    expect(result.finalTax).toBe(78000);
  });

  it('caps tax before cess at the excess over Rs 12 lakh throughout the relief band', () => {
    for (let taxableIncome = 1200500; taxableIncome <= 1270000; taxableIncome += 500) {
      const result = atTaxableIncome(taxableIncome);
      expect(result.taxAfterRebate).toBe(taxableIncome - REBATE_LIMIT);
    }
  });

  it('never lets tax fall as income rises across the Rs 12 lakh boundary', () => {
    // The defining property of marginal relief: no cliff anywhere across the threshold.
    let previousTax = -1;
    for (let grossSalary = 1270000; grossSalary <= 1400000; grossSalary += 5000) {
      const { finalTax } = calculateIndianIncomeTax({ ...baseInput, grossSalary }, taxYear).newRegime;
      expect(finalTax).toBeGreaterThanOrEqual(previousTax);
      previousTax = finalTax;
    }
  });
  }
);

describe('FY 2026-27 (AY 2027-28) rules', () => {
  it('is registered and is the latest supported year', () => {
    expect(availableTaxYears).toContain('2026-27');
    expect(availableTaxYears[0]).toBe('2026-27');
    expect(indiaIncomeTaxRules['2026-27'].ay).toBe('2027-28');
  });

  it('carries the Finance Act 2025 new-regime structure forward unchanged', () => {
    // Budget 2026 announced no slab, rebate or standard-deduction change. If a future
    // Budget does change them, this assertion should fail and be updated deliberately.
    const y2526 = indiaIncomeTaxRules['2025-26'].newRegime;
    const y2627 = indiaIncomeTaxRules['2026-27'].newRegime;
    expect(y2627.slabs).toEqual(y2526.slabs);
    expect(y2627.rebateLimit).toBe(1200000);
    expect(y2627.maxRebate).toBe(60000);
    expect(y2627.standardDeduction).toBe(75000);
    expect(y2627.marginalReliefOnRebate).toBe(true);
    expect(indiaIncomeTaxRules['2026-27'].cessRate).toBe(0.04);
  });

  it('gives zero tax at Rs 12.75 lakh gross salary, matching the article headline', () => {
    const result = calculateIndianIncomeTax(
      {
        grossSalary: 1275000,
        hraExemption: 0,
        homeLoanInterest: 0,
        section80C: 0,
        section80D: 0,
        employerNPS: 0,
        otherDeductionsOldRegime: 0,
        otherDeductionsBothRegimes: 0,
        isSalaried: true,
      },
      '2026-27'
    );
    expect(result.newRegime.taxableIncome).toBe(1200000);
    expect(result.newRegime.finalTax).toBe(0);
  });
});
