// India Income Tax slab calculations library for FY 2024-25 through FY 2026-27.
// Rates should be updated periodically based on official Budget notifications.
//
// To add a financial year: extend FinancialYear, then add its entry to
// NEW_REGIME_CONFIG_BY_FY. The Record type makes that second step mandatory —
// a missing year is a compile error rather than a silent fallback to an older
// slab table and rebate limit.
export type FinancialYear = '2024-25' | '2025-26' | '2026-27';

export interface SlabBreakdown {
  slab: string;
  rate: number;
  taxableInSlab: number;
  taxInSlab: number;
}

export interface TaxCalculationResult {
  financialYear: FinancialYear;
  regime: 'new' | 'old';
  ageGroup: 'below60' | 'senior' | 'superSenior';
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  basicAnnual: number;
  basicMonthly: number;
  hraReceivedAnnual: number;
  hraReceivedMonthly: number;
  employerPfAnnual: number;
  employerPfMonthly: number;
  employeePfAnnual: number;
  employeePfMonthly: number;
  professionalTaxAnnual: number;
  professionalTaxMonthly: number;
  otherDeductionsAnnual: number;
  otherDeductionsMonthly: number;
  standardDeduction: number;
  hraExemption: number;
  eligible80C: number;
  eligible80D: number;
  otherDeductionsOldRegime: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeCess: number;
  cess: number;
  totalTax: number;
  monthlyTaxTds: number;
  monthlyDeductionsTotal: number;
  monthlyInHand: number;
  annualInHand: number;
  slabBreakdown: SlabBreakdown[];
}

export interface SlabConfig {
  limit: number; // Upper limit of the slab (Infinity for the top slab)
  rate: number;  // Tax rate as a percentage (e.g. 5 for 5%)
}

// Tax slabs configuration for New Tax Regime
const NEW_REGIME_SLABS_24_25: SlabConfig[] = [
  { limit: 300000, rate: 0 },
  { limit: 700000, rate: 5 },
  { limit: 1000000, rate: 10 },
  { limit: 1200000, rate: 15 },
  { limit: 1500000, rate: 20 },
  { limit: Infinity, rate: 30 }
];

const NEW_REGIME_SLABS_25_26: SlabConfig[] = [
  { limit: 400000, rate: 0 },
  { limit: 800000, rate: 5 },
  { limit: 1200000, rate: 10 },
  { limit: 1600000, rate: 15 },
  { limit: 2000000, rate: 20 },
  { limit: 2400000, rate: 25 },
  { limit: Infinity, rate: 30 }
];

// New-regime slab table and Section 87A rebate limit per financial year.
// Budget 2026 left the slabs, the rebate and the standard deduction untouched, so
// FY 2026-27 reuses the Finance Act 2025 structure rather than a table of its own.
const NEW_REGIME_CONFIG_BY_FY: Record<
  FinancialYear,
  { slabs: SlabConfig[]; rebateLimit: number }
> = {
  '2024-25': { slabs: NEW_REGIME_SLABS_24_25, rebateLimit: 700000 },
  '2025-26': { slabs: NEW_REGIME_SLABS_25_26, rebateLimit: 1200000 },
  '2026-27': { slabs: NEW_REGIME_SLABS_25_26, rebateLimit: 1200000 },
};

// Tax slabs configuration for Old Tax Regime
const OLD_REGIME_SLABS_BELOW_60: SlabConfig[] = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 5 },
  { limit: 1000000, rate: 20 },
  { limit: Infinity, rate: 30 }
];

const OLD_REGIME_SLABS_SENIOR: SlabConfig[] = [
  { limit: 300000, rate: 0 },
  { limit: 500000, rate: 5 },
  { limit: 1000000, rate: 20 },
  { limit: Infinity, rate: 30 }
];

const OLD_REGIME_SLABS_SUPER_SENIOR: SlabConfig[] = [
  { limit: 500000, rate: 0 },
  { limit: 1000000, rate: 20 },
  { limit: Infinity, rate: 30 }
];

export function estimateIncomeTax(inputs: {
  annualCtc: number;
  basicSalaryPercent: number;
  employerPfIncludedInCtc: boolean;
  employeePfRate: number; // typically 12
  monthlyProfessionalTax: number; // typically 200
  monthlyOtherDeductions: number;
  regime: 'new' | 'old';
  financialYear: FinancialYear;
  ageGroup: 'below60' | 'senior' | 'superSenior';
  input80C: number;
  input80D: number;
  hraReceivedMonthly: number;
  rentPaidMonthly: number;
  cityType: 'metro' | 'nonMetro';
  otherDeductionsOldRegime: number;
}): TaxCalculationResult {
  const {
    annualCtc,
    basicSalaryPercent,
    employerPfIncludedInCtc,
    employeePfRate,
    monthlyProfessionalTax,
    monthlyOtherDeductions,
    regime,
    financialYear,
    ageGroup,
    input80C,
    input80D,
    hraReceivedMonthly,
    rentPaidMonthly,
    cityType,
    otherDeductionsOldRegime
  } = inputs;

  // 1. Calculate basic salary from CTC (estimate basic if toggle/setting is applied)
  // Standard in India is that basic salary is a percent of CTC or gross salary.
  // We'll treat basic salary as basicSalaryPercent% of annualCtc by default.
  const basicAnnual = (annualCtc * basicSalaryPercent) / 100;
  const basicMonthly = basicAnnual / 12;

  // 2. PF calculation
  // Employer PF is typically 12% of basic salary.
  const employerPfAnnual = employerPfIncludedInCtc ? basicAnnual * 0.12 : 0;
  const employerPfMonthly = employerPfAnnual / 12;

  // Gross Salary is CTC minus employer contribution (if included in CTC)
  const grossAnnualSalary = annualCtc - employerPfAnnual;
  const grossMonthlySalary = grossAnnualSalary / 12;

  // Employee PF is also typically 12% of basic
  const employeePfAnnual = basicAnnual * (employeePfRate / 100);
  const employeePfMonthly = employeePfAnnual / 12;

  const professionalTaxMonthly = monthlyProfessionalTax;
  const professionalTaxAnnual = professionalTaxMonthly * 12;

  const otherDeductionsMonthly = monthlyOtherDeductions;
  const otherDeductionsAnnual = otherDeductionsMonthly * 12;

  // 3. Standard Deduction
  // For both years, New regime Standard Deduction is 75,000, and Old regime is 50,000
  const standardDeduction = regime === 'new' ? 75000 : 50000;

  // 4. Exemptions and deductions
  let hraExemption = 0;
  let eligible80C = 0;
  let eligible80D = 0;
  let otherDeductionsOld = 0;

  if (regime === 'old') {
    // A. HRA Exemption calculation
    const rentPaidAnnual = rentPaidMonthly * 12;
    const hraReceivedAnnual = hraReceivedMonthly * 12;

    if (hraReceivedAnnual > 0 && rentPaidAnnual > 0) {
      const cityFactor = cityType === 'metro' ? 0.5 : 0.4;
      const option1 = hraReceivedAnnual;
      const option2 = Math.max(0, rentPaidAnnual - 0.1 * basicAnnual);
      const option3 = basicAnnual * cityFactor;
      hraExemption = Math.min(option1, option2, option3);
    }

    // B. 80C Deduction (EPF employee contribution is automatically added, capped at 1.5L)
    eligible80C = Math.min(employeePfAnnual + input80C, 150000);

    // C. 80D Deduction (capped at 1.0L)
    eligible80D = Math.min(input80D, 100000);

    // D. Other deductions (e.g. 24b home loan interest, NPS, etc. capped or custom)
    otherDeductionsOld = otherDeductionsOldRegime;
  }

  const totalDeductions =
    regime === 'new'
      ? standardDeduction
      : standardDeduction + hraExemption + eligible80C + eligible80D + otherDeductionsOld + professionalTaxAnnual;

  // 5. Taxable income
  const taxableIncome = Math.max(0, grossAnnualSalary - totalDeductions);

  // 6. Tax calculation based on slabs
  let slabs: SlabConfig[] = [];
  if (regime === 'new') {
    slabs = NEW_REGIME_CONFIG_BY_FY[financialYear].slabs;
  } else {
    if (ageGroup === 'senior') {
      slabs = OLD_REGIME_SLABS_SENIOR;
    } else if (ageGroup === 'superSenior') {
      slabs = OLD_REGIME_SLABS_SUPER_SENIOR;
    } else {
      slabs = OLD_REGIME_SLABS_BELOW_60;
    }
  }

  const slabBreakdown: SlabBreakdown[] = [];
  let remainingIncome = taxableIncome;
  let prevLimit = 0;
  let taxBeforeCess = 0;

  for (let i = 0; i < slabs.length; i++) {
    const slab = slabs[i];
    const slabWidth = slab.limit - prevLimit;
    const taxableInSlab = Math.max(0, Math.min(remainingIncome, slabWidth));
    const taxInSlab = (taxableInSlab * slab.rate) / 100;

    taxBeforeCess += taxInSlab;
    remainingIncome -= taxableInSlab;

    const slabLabel =
      slab.limit === Infinity
        ? `Above ₹${(prevLimit / 100000).toFixed(1)}L`
        : `₹${(prevLimit / 100000).toFixed(1)}L - ₹${(slab.limit / 100000).toFixed(1)}L`;

    slabBreakdown.push({
      slab: slabLabel,
      rate: slab.rate,
      taxableInSlab,
      taxInSlab
    });

    prevLimit = slab.limit;
    if (remainingIncome <= 0) break;
  }

  // 7. Rebate under Section 87A
  // New Regime:
  // - FY 2024-25: Nil tax if taxable income <= 7,00,000. Marginal relief if income slightly above 7L.
  // - FY 2025-26 and FY 2026-27: Nil tax if taxable income <= 12,00,000. Marginal relief if income slightly above 12L.
  // Old Regime: Nil tax if taxable income <= 5,00,000. No marginal relief.
  let rebate = 0;
  if (regime === 'new') {
    const { rebateLimit } = NEW_REGIME_CONFIG_BY_FY[financialYear];
    if (taxableIncome <= rebateLimit) {
      rebate = taxBeforeCess;
    } else {
      // Marginal relief: tax cannot exceed the amount by which income exceeds the rebate limit
      const excessIncome = taxableIncome - rebateLimit;
      if (taxBeforeCess > excessIncome) {
        // Apply rebate such that tax payable matches excess income
        rebate = taxBeforeCess - excessIncome;
      }
    }
  } else {
    // Old regime
    if (taxableIncome <= 500000) {
      rebate = taxBeforeCess; // Up to 12500 rebate
    }
  }

  let finalTaxBeforeCess = Math.max(0, taxBeforeCess - rebate);

  // 8. Surcharges: Keep out of basic estimation (as requested, but can mention/exclude)
  // Health & Education Cess (4%)
  const cess = finalTaxBeforeCess * 0.04;
  const totalTax = finalTaxBeforeCess + cess;
  const monthlyTaxTds = totalTax / 12;

  // 9. Monthly in-hand salary calculations
  // Monthly Gross Salary = CTC/12 minus Employer PF/12 (which is grossMonthlySalary)
  // Monthly Deductions: Employee PF + Professional Tax + Monthly TDS + Other Deductions
  const monthlyDeductionsTotal = employeePfMonthly + professionalTaxMonthly + monthlyTaxTds + otherDeductionsMonthly;
  const monthlyInHand = Math.max(0, grossMonthlySalary - monthlyDeductionsTotal);
  const annualInHand = monthlyInHand * 12;

  return {
    financialYear,
    regime,
    ageGroup,
    grossAnnualSalary,
    grossMonthlySalary,
    basicAnnual,
    basicMonthly,
    hraReceivedAnnual: hraReceivedMonthly * 12,
    hraReceivedMonthly,
    employerPfAnnual,
    employerPfMonthly,
    employeePfAnnual,
    employeePfMonthly,
    professionalTaxAnnual,
    professionalTaxMonthly,
    otherDeductionsAnnual,
    otherDeductionsMonthly,
    standardDeduction,
    hraExemption,
    eligible80C,
    eligible80D,
    otherDeductionsOldRegime: otherDeductionsOld,
    totalDeductions,
    taxableIncome,
    taxBeforeCess: finalTaxBeforeCess,
    cess,
    totalTax,
    monthlyTaxTds,
    monthlyDeductionsTotal,
    monthlyInHand,
    annualInHand,
    slabBreakdown
  };
}
