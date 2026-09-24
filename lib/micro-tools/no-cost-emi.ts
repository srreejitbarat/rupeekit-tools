import { amortize, annualCost, check, payment, sum } from './common';

export type NoCostInput = {
  price: number; cashDiscount: number; downPayment: number;
  principalMode: 'upfront' | 'quoted'; quotedPrincipal: number; annualRate: number; months: number;
  processingFee: number; interestTaxRate: number; feeTaxRate: number;
  cashback: number; cashbackMonth: number;
  refundMonth: number; merchantRefund: number; retainedCashback: number; feeRefund: number;
  closurePercent: number; closureFixedFee: number;
};
export const NO_COST_EXAMPLE: NoCostInput = {
  price: 60_000, cashDiscount: 3_000, downPayment: 0, principalMode: 'upfront', quotedPrincipal: 60_000,
  annualRate: 15, months: 6, processingFee: 199, interestTaxRate: 18, feeTaxRate: 18,
  cashback: 0, cashbackMonth: 3, refundMonth: 3, merchantRefund: 20_000, retainedCashback: 0,
  feeRefund: 0, closurePercent: 3, closureFixedFee: 0,
};
export type EmiRow = { month: number; payment: number; interest: number; interestTax: number; balance: number; purchaseCash: number; keepCash: number; closeCash: number; keepTotal: number; closeTotal: number };
export type NoCostResult = {
  errors: string[]; principal: number; subsidy: number; emi: number; feesWithTax: number; totalInterest: number;
  totalInterestTax: number; cashPrice: number; purchaseTotal: number; extraVsCash: number; annualisedCost: number | null;
  closureBalance: number; closureCharges: number; settlementCash: number; keepTotal: number; closeTotal: number;
  closeSaving: number; rows: EmiRow[];
};
export function calculateNoCost(input: NoCostInput): NoCostResult {
  const errors: string[] = [];
  const empty: NoCostResult = { errors, principal: 0, subsidy: 0, emi: 0, feesWithTax: 0, totalInterest: 0, totalInterestTax: 0,
    cashPrice: 0, purchaseTotal: 0, extraVsCash: 0, annualisedCost: null, closureBalance: 0, closureCharges: 0, settlementCash: 0,
    keepTotal: 0, closeTotal: 0, closeSaving: 0, rows: [] };
  check(errors, input.price, 'Purchase price', 1, 10_000_000);
  check(errors, input.cashDiscount, 'Cash discount', 0, input.price);
  check(errors, input.downPayment, 'Down payment', 0, input.price - 1);
  check(errors, input.annualRate, 'Annual card interest rate', 0, 60);
  check(errors, input.months, 'EMI term', 1, 60, true);
  if (!['upfront', 'quoted'].includes(input.principalMode)) errors.push('Choose an upfront discount or an actual loan quote.');
  if (input.principalMode === 'quoted') check(errors, input.quotedPrincipal, 'Quoted financed principal', 1, input.price - input.downPayment);
  check(errors, input.processingFee, 'Processing fee', 0, 1_000_000);
  check(errors, input.interestTaxRate, 'Tax on interest', 0, 50);
  check(errors, input.feeTaxRate, 'Tax on fees', 0, 50);
  check(errors, input.cashback, 'Cashback', 0, input.price);
  check(errors, input.cashbackMonth, 'Cashback month', 1, input.months, true);
  check(errors, input.refundMonth, 'Return / closure month', 0, input.months, true);
  check(errors, input.merchantRefund, 'Merchant refund', 0, input.price);
  check(errors, input.retainedCashback, 'Cashback retained after return', 0, input.cashback);
  const feesWithTax = input.processingFee * (1 + input.feeTaxRate / 100);
  check(errors, input.feeRefund, 'Processing fee refund including tax', 0, feesWithTax);
  check(errors, input.closurePercent, 'Closure fee percentage', 0, 25);
  check(errors, input.closureFixedFee, 'Fixed closure fee', 0, 1_000_000);
  if (errors.length) return empty;

  const eligible = input.price - input.downPayment;
  // In a full upfront interest subsidy, the sum of instalments equals the
  // financed purchase price. Discount reduces principal before amortisation.
  const principal = input.principalMode === 'upfront' ? eligible / (payment(1, input.annualRate, input.months) * input.months) : input.quotedPrincipal;
  const schedule = amortize(principal, input.annualRate, input.months);
  const closureBalance = input.refundMonth === 0 ? principal : schedule[input.refundMonth - 1].balance;
  const closureCharges = closureBalance > 0.005 ? (closureBalance * input.closurePercent / 100 + input.closureFixedFee) * (1 + input.feeTaxRate / 100) : 0;
  const settlementCash = closureBalance + closureCharges;
  let keepTotal = 0, closeTotal = 0;
  const rows: EmiRow[] = Array.from({ length: input.months + 1 }, (_, month) => {
    const s = month ? schedule[month - 1] : undefined;
    const interestTax = (s?.interest ?? 0) * input.interestTaxRate / 100;
    const instalment = (s?.payment ?? 0) + interestTax;
    const upfront = month === 0 ? input.downPayment + feesWithTax : 0;
    const purchaseCashback = month === input.cashbackMonth ? input.cashback : 0;
    const returnCredit = month === input.refundMonth ? input.merchantRefund + input.feeRefund : 0;
    // A received cashback is reversed at return; a later cashback pays only the
    // retained amount. Merchant refund must exclude this separately entered reversal.
    const refundCashback = month === input.cashbackMonth ? (input.cashbackMonth <= input.refundMonth ? input.cashback : input.retainedCashback) : 0;
    const reversal = month === input.refundMonth && input.cashbackMonth <= input.refundMonth ? input.cashback - input.retainedCashback : 0;
    const common = upfront - returnCredit - refundCashback + reversal;
    const keepCash = instalment + common;
    const closeCash = (month <= input.refundMonth ? instalment : 0) + common + (month === input.refundMonth ? settlementCash : 0);
    keepTotal += keepCash; closeTotal += closeCash;
    return { month, payment: s?.payment ?? 0, interest: s?.interest ?? 0, interestTax, balance: month ? s!.balance : principal,
      purchaseCash: upfront + instalment - purchaseCashback, keepCash, closeCash, keepTotal, closeTotal };
  });
  const purchaseTotal = sum(rows.map(row => row.purchaseCash));
  const cashPrice = input.price - input.cashDiscount;
  return { errors, principal, subsidy: eligible - principal, emi: schedule[0].payment, feesWithTax,
    totalInterest: sum(schedule.map(s => s.interest)), totalInterestTax: sum(rows.map(r => r.interestTax)), cashPrice, purchaseTotal,
    extraVsCash: purchaseTotal - cashPrice,
    annualisedCost: annualCost(cashPrice - input.downPayment - feesWithTax, rows.slice(1).map(row => row.purchaseCash)),
    closureBalance, closureCharges, settlementCash, keepTotal, closeTotal, closeSaving: keepTotal - closeTotal, rows };
}
