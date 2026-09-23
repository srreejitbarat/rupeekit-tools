import { estimateIncomeTax, type FinancialYear } from '../tax/india-income-tax';
import { inRange, monthAt, monthIndex, sustainedLead } from './common';

export type CashOffer = {
  id: string; name: string;
  fixedCtc: number; basicPercent: number; pfRate: number; capPf: boolean; monthlyPfWageCap: number; employerPfIncluded: boolean;
  professionalTax: number; otherDeductions: number;
  variablePay: number; variablePayoutPercent: number; variableMonth: number;
  joiningBonus: number; joiningMonth: number; clawbackMonths: number;
  firstPayDelay: number; switchingCost: number; workCost: number;
};
export type SalaryCashInput = {
  startMonth: string; financialYear: FinancialYear; regime: 'new' | 'old';
  openingCash: number; livingCosts: number; targetInHand: number;
  priorGross: number; priorTaxPaid: number; priorPf: number; priorProfessionalTax: number;
  deduction80C: number; deduction80D: number; otherOldDeductions: number;
  offers: CashOffer[];
};
export type SalaryMonth = {
  month: number; date: string; grossEarned: number; fixedCash: number;
  bonuses: number; taxReserve: number; bonusTax: number; pf: number;
  inHand: number; costs: number; cash: number; clawback: number; uncommittedCash: number;
};
export type FiscalEstimate = { year: number; gross: number; tax: number; paidBeforePlan: number; unallocatedTaxCredit: number };
export type SalaryOfferResult = {
  id: string; name: string; grossFixedAnnual: number; employeePfMonthly: number; employerPfAnnual: number;
  fixedMonthlyInHand: number; totalReceipts: number; closingCash: number; lowestCash: number;
  closingClawback: number; firstPositiveMonth: number | null; rows: SalaryMonth[]; fiscalEstimates: FiscalEstimate[];
  targetFixedCtc: number | null; targetGrossSalary: number | null; maximumModelledInHand: number;
};

export const SALARY_CASH_EXAMPLE: SalaryCashInput = {
  startMonth: '2026-10', financialYear: '2026-27', regime: 'new',
  openingCash: 200_000, livingCosts: 50_000, targetInHand: 100_000,
  priorGross: 676_800, priorTaxPaid: 37_331, priorPf: 43_200, priorProfessionalTax: 1_200,
  deduction80C: 0, deduction80D: 0, otherOldDeductions: 0,
  offers: [
    { id: 'current', name: 'Stay in current job', fixedCtc: 1_440_000, basicPercent: 50, pfRate: 12, capPf: false, monthlyPfWageCap: 15_000,
      employerPfIncluded: true, professionalTax: 200, otherDeductions: 0, variablePay: 0, variablePayoutPercent: 100,
      variableMonth: 6, joiningBonus: 0, joiningMonth: 1, clawbackMonths: 12, firstPayDelay: 0, switchingCost: 0, workCost: 3_000 },
    { id: 'offer', name: 'New offer', fixedCtc: 1_800_000, basicPercent: 40, pfRate: 12, capPf: false, monthlyPfWageCap: 15_000,
      employerPfIncluded: true, professionalTax: 200, otherDeductions: 0, variablePay: 200_000, variablePayoutPercent: 70,
      variableMonth: 6, joiningBonus: 100_000, joiningMonth: 2, clawbackMonths: 12, firstPayDelay: 1, switchingCost: 75_000, workCost: 8_000 },
  ],
};

function salaryParts(offer: CashOffer, fixedCtc = offer.fixedCtc) {
  const basic = fixedCtc * offer.basicPercent / 100;
  const annualPf = Math.min(basic, offer.capPf ? offer.monthlyPfWageCap * 12 : Infinity) * offer.pfRate / 100;
  const employerPfAnnual = offer.employerPfIncluded ? annualPf : 0;
  return { gross: fixedCtc - employerPfAnnual, pf: annualPf, employerPfAnnual };
}

function taxOnSalary(gross: number, pf: number, professionalTax: number, input: SalaryCashInput) {
  return estimateIncomeTax({
    annualCtc: gross, basicSalaryPercent: 0, employerPfIncludedInCtc: false, employeePfRate: 0,
    monthlyProfessionalTax: professionalTax / 12, monthlyOtherDeductions: 0,
    financialYear: input.financialYear, regime: input.regime, ageGroup: 'below60',
    input80C: Math.min(150_000, pf + input.deduction80C), input80D: input.deduction80D,
    hraReceivedMonthly: 0, rentPaidMonthly: 0, cityType: 'nonMetro',
    otherDeductionsOldRegime: input.otherOldDeductions,
  });
}

export function regularSalary(offer: CashOffer, input: SalaryCashInput, fixedCtc = offer.fixedCtc) {
  const parts = salaryParts(offer, fixedCtc);
  const tax = taxOnSalary(parts.gross, parts.pf, offer.professionalTax * 12, input);
  return { ...parts, taxableIncome: tax.taxableIncome,
    inHand: (parts.gross - parts.pf - tax.totalTax) / 12 - offer.professionalTax - offer.otherDeductions };
}

/** Find the first salary that reaches the target, including rebate discontinuities. */
export function solveFixedSalary(offer: CashOffer, input: SalaryCashInput) {
  const cap = 5_000_000;
  const evaluate = (ctc: number) => regularSalary(offer, input, ctc);
  const boundaries = [0, cap];
  // Rebate thresholds are local take-home maxima: plain binary search can skip an
  // earlier solution when tax plus cess briefly consumes more than an extra rupee.
  for (const taxable of [250_000, 300_000, 400_000, 500_000, 700_000, 800_000, 1_000_000, 1_200_000, 1_600_000, 2_000_000, 2_400_000]) {
    if (evaluate(cap).taxableIncome < taxable) continue;
    let lo = 0, hi = cap;
    for (let i = 0; i < 45; i++) {
      const mid = (lo + hi) / 2;
      if (evaluate(mid).taxableIncome <= taxable) lo = mid; else hi = mid;
    }
    boundaries.push(lo, hi);
  }
  boundaries.sort((a, b) => a - b);
  let required: number | null = null;
  for (let i = 0; i < boundaries.length; i++) {
    const end = boundaries[i];
    if (evaluate(end).inHand + 1e-7 < input.targetInHand) continue;
    let lo = i === 0 ? 0 : boundaries[i - 1], hi = end;
    for (let j = 0; j < 45; j++) {
      const mid = (lo + hi) / 2;
      if (evaluate(mid).inHand >= input.targetInHand) hi = mid; else lo = mid;
    }
    // Quote whole rupees and verify after rounding, especially at a rebate cliff.
    const rounded = Math.ceil(hi - 1e-6);
    if (evaluate(rounded).inHand + 1e-6 >= input.targetInHand) { required = rounded; break; }
  }
  return { required, gross: required === null ? null : evaluate(required).gross, maximum: evaluate(cap).inHand };
}

export function validateSalaryCash(input: SalaryCashInput) {
  const errors: string[] = [];
  if (!Number.isFinite(monthIndex(input.startMonth))) errors.push('Choose a valid start month.');
  if (monthIndex(input.startMonth) % 12 === 3 && [input.priorGross, input.priorTaxPaid, input.priorPf, input.priorProfessionalTax].some(value => value !== 0)) {
    errors.push('An April start has no earlier months in that financial year. Set earlier salary, TDS, PF and professional tax to zero.');
  }
  if (!['2024-25', '2025-26', '2026-27'].includes(input.financialYear)) errors.push('Choose a supported tax-rule year.');
  if (!['old', 'new'].includes(input.regime)) errors.push('Choose a tax regime.');
  const limits: [keyof SalaryCashInput, string, number][] = [
    ['openingCash', 'Opening cash', 100_000_000], ['livingCosts', 'Living costs', 1_000_000],
    ['targetInHand', 'Target monthly in-hand', 1_000_000], ['priorGross', 'Earlier salary in this financial year', 5_000_000],
    ['priorTaxPaid', 'Earlier TDS', 5_000_000], ['priorPf', 'Earlier employee PF', 1_000_000],
    ['priorProfessionalTax', 'Earlier professional tax', 10_000], ['deduction80C', 'Additional eligible 80C', 150_000],
    ['deduction80D', 'Eligible 80D', 100_000], ['otherOldDeductions', 'Other eligible old-regime deductions', 5_000_000],
  ];
  for (const [key, label, max] of limits) if (!inRange(input[key] as number, 0, max)) errors.push(`${label} must be between 0 and ${max.toLocaleString('en-IN')} rupees.`);
  if (input.offers.length !== 2) errors.push('Compare exactly two offers.');
  if (new Set(input.offers.map(o => o.id)).size !== input.offers.length) errors.push('Each offer needs a unique identifier.');
  for (const [index, offer] of input.offers.entries()) {
    const label = `Offer ${index + 1}`;
    if (!offer.name.trim() || offer.name.length > 60) errors.push(`${label}: use a name of 1–60 characters.`);
    if (offer.capPf && !inRange(offer.monthlyPfWageCap, 0, 1_000_000)) errors.push(`${label}: enter a monthly PF wage cap from 0 to 10 lakh rupees.`);
    for (const [key, max] of Object.entries({ fixedCtc: 5_000_000, basicPercent: 100, pfRate: 12, professionalTax: 2_500,
      otherDeductions: 1_000_000, variablePay: 5_000_000, variablePayoutPercent: 100, joiningBonus: 5_000_000,
      switchingCost: 5_000_000, workCost: 1_000_000 })) {
      if (!inRange(offer[key as keyof CashOffer] as number, 0, max)) errors.push(`${label}: check ${key}.`);
    }
    for (const [key, min, max] of [['variableMonth', 1, 12], ['joiningMonth', 1, 12], ['clawbackMonths', 0, 36], ['firstPayDelay', 0, 3]] as const) {
      if (!Number.isInteger(offer[key]) || !inRange(offer[key], min, max)) errors.push(`${label}: ${key} must be a whole number from ${min} to ${max}.`);
    }
  }
  return errors;
}

function fiscalYear(index: number) {
  const year = Math.floor(index / 12);
  return index % 12 < 3 ? year - 1 : year;
}

function offerCalendar(offer: CashOffer, input: SalaryCashInput): { result?: SalaryOfferResult; error?: string } {
  const start = monthIndex(input.startMonth);
  const firstFy = fiscalYear(start);
  const lastFy = fiscalYear(start + 11);
  const parts = salaryParts(offer);
  const variable = offer.variablePay * offer.variablePayoutPercent / 100;
  const variableCalendarMonth = (start + offer.variableMonth - 1) % 12;
  const bonusIndex = start + offer.joiningMonth - 1;
  const estimates: FiscalEstimate[] = [];
  const reserves = new Map<number, { regular: number; bonuses: number }>();
  for (let fy = firstFy; fy <= lastFy; fy++) {
    const from = Math.max(start, fy * 12 + 3);
    const to = (fy + 1) * 12 + 2; // March. Project regular employment through fiscal year end.
    const months = to - from + 1;
    const priorGross = fy === firstFy ? input.priorGross : 0;
    const priorPf = fy === firstFy ? input.priorPf : 0;
    const priorPt = fy === firstFy ? input.priorProfessionalTax : 0;
    const paidBeforePlan = fy === firstFy ? input.priorTaxPaid : 0;
    const grossBase = priorGross + parts.gross / 12 * months;
    const pf = priorPf + parts.pf / 12 * months;
    const pt = priorPt + offer.professionalTax * months;
    const payouts: { date: number; value: number }[] = [];
    for (let date = from; date <= to; date++) {
      let value = date % 12 === variableCalendarMonth ? variable : 0;
      if (date === bonusIndex) value += offer.joiningBonus;
      if (value) payouts.push({ date, value });
    }
    const gross = grossBase + payouts.reduce((sum, payout) => sum + payout.value, 0);
    if (gross > 5_000_000 + 0.01) return { error: `${offer.name}: projected FY ${fy}-${String(fy + 1).slice(-2)} gross salary exceeds ₹50 lakh. This salary-only model excludes surcharge; reduce the scenario or use a specialist estimate.` };
    const baseTax = taxOnSalary(grossBase, pf, pt, input).totalTax;
    const regular = Math.max(0, baseTax - paidBeforePlan) / months;
    let credit = Math.max(0, paidBeforePlan - baseTax);
    let earned = grossBase;
    let previousTax = baseTax;
    for (let date = from; date <= to; date++) reserves.set(date, { regular, bonuses: 0 });
    for (const payout of payouts) {
      earned += payout.value;
      const newTax = taxOnSalary(earned, pf, pt, input).totalTax;
      const extraTax = Math.max(0, newTax - previousTax);
      const usedCredit = Math.min(credit, extraTax);
      reserves.get(payout.date)!.bonuses = extraTax - usedCredit;
      credit -= usedCredit;
      previousTax = newTax;
    }
    estimates.push({ year: fy, gross, tax: previousTax, paidBeforePlan, unallocatedTaxCredit: credit });
  }
  let cash = input.openingCash;
  let lowestCash = cash;
  let heldCash = 0;
  let heldTax = 0;
  let totalReceipts = 0;
  const rows: SalaryMonth[] = [];
  for (let month = 1; month <= 12; month++) {
    const date = start + month - 1;
    const reserve = reserves.get(date)!;
    const regularNet = parts.gross / 12 - parts.pf / 12 - offer.professionalTax - offer.otherDeductions - reserve.regular;
    heldCash += regularNet;
    heldTax += reserve.regular;
    const fixedCash = month > offer.firstPayDelay ? heldCash : 0;
    const regularTaxPaid = month > offer.firstPayDelay ? heldTax : 0;
    if (month > offer.firstPayDelay) { heldCash = 0; heldTax = 0; }
    const bonuses = (month === offer.variableMonth ? variable : 0) + (month === offer.joiningMonth ? offer.joiningBonus : 0);
    const inHand = fixedCash + bonuses - reserve.bonuses;
    const costs = input.livingCosts + offer.workCost + (month === 1 ? offer.switchingCost : 0);
    cash += inHand - costs;
    lowestCash = Math.min(lowestCash, cash);
    totalReceipts += inHand;
    const clawback = month >= offer.joiningMonth && month <= offer.clawbackMonths ? offer.joiningBonus : 0;
    rows.push({ month, date: monthAt(input.startMonth, month - 1), grossEarned: parts.gross / 12,
      fixedCash, bonuses, taxReserve: regularTaxPaid + reserve.bonuses, bonusTax: reserve.bonuses,
      pf: parts.pf / 12, inHand, costs, cash, clawback, uncommittedCash: cash - clawback });
  }
  const target = solveFixedSalary(offer, input);
  return { result: {
    id: offer.id, name: offer.name, grossFixedAnnual: parts.gross, employeePfMonthly: parts.pf / 12,
    employerPfAnnual: parts.employerPfAnnual, fixedMonthlyInHand: regularSalary(offer, input).inHand,
    totalReceipts, closingCash: cash, lowestCash, closingClawback: rows[11].clawback,
    firstPositiveMonth: null, rows, fiscalEstimates: estimates,
    targetFixedCtc: target.required, targetGrossSalary: target.gross, maximumModelledInHand: target.maximum,
  } };
}

export function planSalaryCash(input: SalaryCashInput) {
  const errors = validateSalaryCash(input);
  if (errors.length) return { errors, offers: [] as SalaryOfferResult[], cashDifference: 0 };
  const offers: SalaryOfferResult[] = [];
  for (const offer of input.offers) {
    const calculated = offerCalendar(offer, input);
    if (calculated.error) errors.push(calculated.error);
    else if (calculated.result) offers.push(calculated.result);
  }
  if (errors.length) return { errors, offers: [] as SalaryOfferResult[], cashDifference: 0 };
  const [current, next] = offers;
  next.firstPositiveMonth = sustainedLead(next.rows.map((row, i) => row.cash - current.rows[i].cash));
  return { errors, offers, cashDifference: next.closingCash - current.closingCash };
}
