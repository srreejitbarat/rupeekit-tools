import { TaxInput, TaxResult } from '@/lib/tax/calculator';
import { indiaIncomeTaxRules } from '@/lib/tax/indiaIncomeTaxRules';

export interface TaxPdfData {
  generatedAt: string;
  financialYear: string;
  assessmentYear?: string;
  // Input
  isSalaried: boolean;
  grossIncome: number;
  standardDeductionOld: number;
  standardDeductionNew: number;
  hraExemption: number;
  homeLoanInterest: number;
  section80C: number;
  section80D: number;
  employerNPS: number;
  otherDeductionsOldRegime: number;
  otherDeductionsBothRegimes: number;
  // Result summary
  recommendedRegime: 'Old' | 'New' | 'Equal';
  savingsAmount: number;
  explanation: string;
  // Old regime
  old_totalDeductions: number;
  old_taxableIncome: number;
  old_totalSlabTax: number;
  old_rebate: number;
  old_surcharge: number;
  old_cess: number;
  old_finalTax: number;
  old_effectiveTaxRate: number;
  // New regime
  new_totalDeductions: number;
  new_taxableIncome: number;
  new_totalSlabTax: number;
  new_rebate: number;
  new_surcharge: number;
  new_cess: number;
  new_finalTax: number;
  new_effectiveTaxRate: number;
}

function buildExplanation(data: Omit<TaxPdfData, 'explanation'>): string {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  if (data.recommendedRegime === 'Old') {
    return `Old regime saves you ${fmt(data.savingsAmount)} because your old regime deductions (${fmt(data.old_totalDeductions)}) are high enough to bring your taxable income down significantly more than the new regime's lower slab rates can compensate for. Verify with a chartered accountant before filing.`;
  } else if (data.recommendedRegime === 'New') {
    return `New regime saves you ${fmt(data.savingsAmount)} because your old regime deductions (${fmt(data.old_totalDeductions)}) are not high enough to offset the lower slab rates and the higher rebate available under the new regime. Verify with a chartered accountant before filing.`;
  }
  return 'Both regimes result in identical tax liability for your current income and deduction profile. Verify with a chartered accountant before filing.';
}

export function buildTaxPdfData(
  input: TaxInput,
  result: TaxResult,
  selectedTaxYear: string
): TaxPdfData {
  const config = indiaIncomeTaxRules[selectedTaxYear];
  const fy = config?.fy ?? selectedTaxYear;
  const ay = config?.ay;

  const standardDeductionOld = input.isSalaried ? (config?.oldRegime.standardDeduction ?? 0) : 0;
  const standardDeductionNew = input.isSalaried ? (config?.newRegime.standardDeduction ?? 0) : 0;

  const base: Omit<TaxPdfData, 'explanation'> = {
    generatedAt: new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    financialYear: fy,
    assessmentYear: ay,
    isSalaried: input.isSalaried,
    grossIncome: input.grossSalary,
    standardDeductionOld,
    standardDeductionNew,
    hraExemption: input.hraExemption,
    homeLoanInterest: input.homeLoanInterest,
    section80C: input.section80C,
    section80D: input.section80D,
    employerNPS: input.employerNPS,
    otherDeductionsOldRegime: input.otherDeductionsOldRegime,
    otherDeductionsBothRegimes: input.otherDeductionsBothRegimes,
    recommendedRegime: result.recommendedRegime,
    savingsAmount: result.savingsAmount,
    old_totalDeductions: result.oldRegime.totalDeductions,
    old_taxableIncome: result.oldRegime.taxableIncome,
    old_totalSlabTax: result.oldRegime.totalSlabTax,
    old_rebate: result.oldRegime.rebate,
    old_surcharge: result.oldRegime.surcharge,
    old_cess: result.oldRegime.cess,
    old_finalTax: result.oldRegime.finalTax,
    old_effectiveTaxRate: result.oldRegime.effectiveTaxRate,
    new_totalDeductions: result.newRegime.totalDeductions,
    new_taxableIncome: result.newRegime.taxableIncome,
    new_totalSlabTax: result.newRegime.totalSlabTax,
    new_rebate: result.newRegime.rebate,
    new_surcharge: result.newRegime.surcharge,
    new_cess: result.newRegime.cess,
    new_finalTax: result.newRegime.finalTax,
    new_effectiveTaxRate: result.newRegime.effectiveTaxRate,
  };

  return { ...base, explanation: buildExplanation(base) };
}
