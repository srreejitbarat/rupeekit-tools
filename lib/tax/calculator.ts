import { indiaIncomeTaxRules, TaxRegimeConfig, TaxSlab } from './indiaIncomeTaxRules';

export type TaxInput = {
  grossSalary: number;
  hraExemption: number;
  homeLoanInterest: number;
  section80C: number;
  section80D: number;
  employerNPS: number;
  otherDeductionsOldRegime: number;
  otherDeductionsBothRegimes: number;
  isSalaried: boolean;
};

export type RegimeTaxResult = {
  totalDeductions: number;
  taxableIncome: number;
  slabTaxBreakdown: { slab: TaxSlab; tax: number; amountInSlab: number }[];
  totalSlabTax: number;
  rebate: number;
  taxAfterRebate: number;
  surcharge: number;
  cess: number;
  finalTax: number;
  effectiveTaxRate: number;
};

export type TaxResult = {
  taxYear: string;
  grossIncome: number;
  oldRegime: RegimeTaxResult;
  newRegime: RegimeTaxResult;
  savingsAmount: number;
  recommendedRegime: 'Old' | 'New' | 'Equal';
};

type SurchargeBand = { threshold: number; rate: number };

const NEW_REGIME_SURCHARGE: readonly SurchargeBand[] = [
  { threshold: 20_000_000, rate: 0.25 },
  { threshold: 10_000_000, rate: 0.15 },
  { threshold: 5_000_000, rate: 0.10 },
];
const OLD_REGIME_SURCHARGE: readonly SurchargeBand[] = [
  { threshold: 50_000_000, rate: 0.37 },
  ...NEW_REGIME_SURCHARGE,
];

function calculateSlabTaxBreakdown(taxableIncome: number, slabs: TaxSlab[]) {
  const breakdown: RegimeTaxResult['slabTaxBreakdown'] = [];

  for (const slab of slabs) {
    const min = slab.min;
    const max = slab.max === null ? Infinity : slab.max;

    if (taxableIncome > min) {
      const amountInSlab = Math.min(taxableIncome, max) - min;
      const tax = amountInSlab * slab.rate;
      breakdown.push({ slab, tax, amountInSlab });
    }
  }

  return breakdown;
}

function calculateSurcharge(
  taxableIncome: number,
  taxAfterRebate: number,
  slabs: TaxSlab[],
  bands: readonly SurchargeBand[],
): number {
  const bandIndex = bands.findIndex(({ threshold }) => taxableIncome > threshold);
  if (bandIndex === -1) return 0;

  const { threshold, rate } = bands[bandIndex];
  const lowerRate = bands[bandIndex + 1]?.rate ?? 0;
  const slabTaxAtThreshold = calculateSlabTaxBreakdown(threshold, slabs)
    .reduce((sum, { tax }) => sum + tax, 0);

  // Surcharge relief caps pre-cess tax at the tax payable at the threshold
  // plus the income above it. This is separate from rebate marginal relief.
  const maxTaxWithSurcharge = slabTaxAtThreshold * (1 + lowerRate) + (taxableIncome - threshold);
  return Math.min(taxAfterRebate * rate, Math.max(0, maxTaxWithSurcharge - taxAfterRebate));
}

function calculateRegimeTax(
  taxableIncome: number,
  config: TaxRegimeConfig,
  cessRate: number,
  surchargeBands: readonly SurchargeBand[],
): Omit<RegimeTaxResult, 'totalDeductions' | 'taxableIncome' | 'effectiveTaxRate'> {
  const slabTaxBreakdown = calculateSlabTaxBreakdown(taxableIncome, config.slabs);
  const totalSlabTax = slabTaxBreakdown.reduce((sum, { tax }) => sum + tax, 0);
  let rebate = 0;
  let taxAfterRebate = totalSlabTax;

  if (taxableIncome <= config.rebateLimit) {
    // Section 87A rebate is capped by statute (e.g. Rs 60,000 for FY 2025-26 new regime)
    rebate = Math.min(totalSlabTax, config.maxRebate);
    taxAfterRebate = totalSlabTax - rebate;
  } else if (config.marginalReliefOnRebate && taxableIncome > config.rebateLimit) {
    // Marginal relief for 87A: If tax > (Income - RebateLimit), then tax = Income - RebateLimit
    const incomeExceedingLimit = taxableIncome - config.rebateLimit;
    if (totalSlabTax > incomeExceedingLimit) {
      rebate = totalSlabTax - incomeExceedingLimit;
      taxAfterRebate = incomeExceedingLimit;
    }
  }

  const surcharge = calculateSurcharge(taxableIncome, taxAfterRebate, config.slabs, surchargeBands);
  const taxWithSurcharge = taxAfterRebate + surcharge;
  const cess = taxWithSurcharge * cessRate;
  const finalTax = Math.round(taxWithSurcharge + cess);

  return {
    slabTaxBreakdown,
    totalSlabTax,
    rebate,
    taxAfterRebate,
    surcharge,
    cess: Math.round(cess),
    finalTax
  };
}

export function calculateIndianIncomeTax(input: TaxInput, taxYear: string): TaxResult {
  const config = indiaIncomeTaxRules[taxYear];
  if (!config) {
    throw new Error(`Tax rules for year ${taxYear} not found.`);
  }

  const { grossSalary, isSalaried } = input;

  // OLD REGIME DEDUCTIONS
  const standardDeductionOld = isSalaried ? config.oldRegime.standardDeduction : 0;
  const totalDeductionsOld = 
    standardDeductionOld + 
    input.hraExemption + 
    input.homeLoanInterest + 
    input.section80C + 
    input.section80D + 
    input.employerNPS + 
    input.otherDeductionsOldRegime + 
    input.otherDeductionsBothRegimes;
  
  const taxableIncomeOld = Math.max(0, grossSalary - totalDeductionsOld);

  // NEW REGIME DEDUCTIONS
  const standardDeductionNew = isSalaried ? config.newRegime.standardDeduction : 0;
  const totalDeductionsNew = 
    standardDeductionNew + 
    input.employerNPS + // Sec 80CCD(2) allowed in new regime
    input.otherDeductionsBothRegimes; // e.g. 80CCH Agniveer
  
  const taxableIncomeNew = Math.max(0, grossSalary - totalDeductionsNew);

  // CALCULATE TAX
  const oldRegimeResultBase = calculateRegimeTax(taxableIncomeOld, config.oldRegime, config.cessRate, OLD_REGIME_SURCHARGE);
  const newRegimeResultBase = calculateRegimeTax(taxableIncomeNew, config.newRegime, config.cessRate, NEW_REGIME_SURCHARGE);

  const oldRegime: RegimeTaxResult = {
    totalDeductions: totalDeductionsOld,
    taxableIncome: taxableIncomeOld,
    ...oldRegimeResultBase,
    effectiveTaxRate: grossSalary > 0 ? (oldRegimeResultBase.finalTax / grossSalary) * 100 : 0
  };

  const newRegime: RegimeTaxResult = {
    totalDeductions: totalDeductionsNew,
    taxableIncome: taxableIncomeNew,
    ...newRegimeResultBase,
    effectiveTaxRate: grossSalary > 0 ? (newRegimeResultBase.finalTax / grossSalary) * 100 : 0
  };

  let recommendedRegime: 'Old' | 'New' | 'Equal' = 'Equal';
  let savingsAmount = 0;

  if (oldRegime.finalTax < newRegime.finalTax) {
    recommendedRegime = 'Old';
    savingsAmount = newRegime.finalTax - oldRegime.finalTax;
  } else if (newRegime.finalTax < oldRegime.finalTax) {
    recommendedRegime = 'New';
    savingsAmount = oldRegime.finalTax - newRegime.finalTax;
  }

  return {
    taxYear,
    grossIncome: grossSalary,
    oldRegime,
    newRegime,
    savingsAmount,
    recommendedRegime
  };
}
