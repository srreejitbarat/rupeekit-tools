import { amortize, check } from './common';

export type CarLeaseInput = {
  remainingMonths: number; exitMonth: number; openingCash: number; reserve: number; monthlyCarBudget: number;
  payrollDeduction: number; payrollTaxSaving: number; leaseRunningCost: number;
  endAction: 'buy' | 'return'; endBuyout: number; endReturnFee: number; terminalCarValue: number;
  exitBuyout: number; finance: 'cash' | 'loan'; downPayment: number; loanFee: number; loanRate: number; loanMonths: number;
  ownershipRunningCost: number; exitReturnSettlement: number; replacementMonthlyCost: number;
  continuationAllowed: boolean; continuationMonthlyCost: number; continuationTransferFee: number;
  continuationEndAction: 'buy' | 'return'; continuationEndCost: number;
};
export const CAR_LEASE_EXAMPLE: CarLeaseInput = {
  remainingMonths: 36, exitMonth: 12, openingCash: 600_000, reserve: 150_000, monthlyCarBudget: 30_000,
  payrollDeduction: 28_000, payrollTaxSaving: 6_000, leaseRunningCost: 2_000,
  endAction: 'buy', endBuyout: 400_000, endReturnFee: 0, terminalCarValue: 600_000,
  exitBuyout: 850_000, finance: 'loan', downPayment: 200_000, loanFee: 0, loanRate: 10.5, loanMonths: 48,
  ownershipRunningCost: 4_000, exitReturnSettlement: 250_000, replacementMonthlyCost: 12_000,
  continuationAllowed: false, continuationMonthlyCost: 34_000, continuationTransferFee: 10_000,
  continuationEndAction: 'buy', continuationEndCost: 400_000,
};
export type LeaseRow = { month: number; recurring: number; settlement: number; loanPayment: number; outflow: number; cash: number; debt: number; totalPaid: number };
export type LeaseOption = { id: 'stay' | 'buy' | 'return' | 'continue'; name: string; exitSettlement: number; totalPaid: number;
  terminalDebt: number; terminalAsset: number; adjustedCost: number; lowestCash: number; closingCash: number;
  reserveShortfall: number; fitsReserve: boolean; rows: LeaseRow[] };
export type CarLeaseResult = { errors: string[]; options: LeaseOption[]; netLeaseMonthly: number; buyoutLoanEmi: number;
  buyoutCashNeeded: number; bestFit: LeaseOption | null };
export function calculateCarLease(input: CarLeaseInput): CarLeaseResult {
  const errors: string[] = [];
  const empty: CarLeaseResult = { errors, options: [], netLeaseMonthly: 0, buyoutLoanEmi: 0, buyoutCashNeeded: 0, bestFit: null };
  check(errors, input.remainingMonths, 'Remaining lease months', 1, 120, true);
  check(errors, input.exitMonth, 'Exit after month', 0, input.remainingMonths, true);
  for (const [key, label] of [['openingCash', 'Opening cash'], ['reserve', 'Protected cash'], ['monthlyCarBudget', 'Monthly car budget'],
    ['payrollDeduction', 'Payroll lease deduction'], ['leaseRunningCost', 'Extra lease running costs'], ['terminalCarValue', 'Car value at comparison end'],
    ['exitBuyout', 'Exit buyout quote'], ['ownershipRunningCost', 'Ownership running costs'], ['exitReturnSettlement', 'Return settlement quote'],
    ['replacementMonthlyCost', 'Replacement transport cost']] as const) check(errors, input[key], label, 0, 100_000_000);
  check(errors, input.payrollTaxSaving, 'Payroll-confirmed monthly tax saving', 0, input.payrollDeduction);
  if (!['buy', 'return'].includes(input.endAction) || !['buy', 'return'].includes(input.continuationEndAction)) errors.push('Choose buy or return at the end of the lease.');
  check(errors, input.endAction === 'buy' ? input.endBuyout : input.endReturnFee, 'End-of-lease settlement', 0, 100_000_000);
  if (!['cash', 'loan'].includes(input.finance)) errors.push('Choose cash or a buyout loan.');
  if (input.finance === 'loan') {
    check(errors, input.downPayment, 'Buyout down payment', 0, input.exitBuyout);
    check(errors, input.loanFee, 'Upfront buyout loan charges', 0, 100_000_000);
    check(errors, input.loanRate, 'Buyout loan rate', 0, 60);
    check(errors, input.loanMonths, 'Buyout loan months', 1, 120, true);
  }
  if (input.continuationAllowed) {
    check(errors, input.continuationMonthlyCost, 'Continuation monthly total cost', 0, 100_000_000);
    check(errors, input.continuationTransferFee, 'Transfer fee', 0, 100_000_000);
    check(errors, input.continuationEndCost, 'Continuation final settlement', 0, 100_000_000);
  }
  if (errors.length) return empty;
  const netLeaseMonthly = input.payrollDeduction - input.payrollTaxSaving + input.leaseRunningCost;
  const buyoutCashNeeded = input.finance === 'cash' ? input.exitBuyout : input.downPayment + input.loanFee;
  const loanPrincipal = input.finance === 'loan' ? input.exitBuyout - input.downPayment : 0;
  const loan = loanPrincipal ? amortize(loanPrincipal, input.loanRate, input.loanMonths) : [];
  const names = { stay: 'Stay with employer', buy: 'Exit + buy out', return: 'Exit + return car', continue: 'Exit + approved continuation' };
  const ids: LeaseOption['id'][] = ['stay', 'buy', 'return', ...(input.continuationAllowed ? ['continue' as const] : [])];
  const options = ids.map(id => {
    let cash = input.openingCash, lowestCash = cash, totalPaid = 0;
    const exitSettlement = id === 'buy' ? buyoutCashNeeded : id === 'return' ? input.exitReturnSettlement : id === 'continue' ? input.continuationTransferFee : 0;
    const rows: LeaseRow[] = Array.from({ length: input.remainingMonths + 1 }, (_, month) => {
      const afterExit = month > input.exitMonth;
      const loanIndex = month - input.exitMonth - 1;
      const loanRow = id === 'buy' && afterExit ? loan[loanIndex] : undefined;
      const debt = id !== 'buy' || month < input.exitMonth ? 0 : month === input.exitMonth ? loanPrincipal : loanRow?.balance ?? 0;
      let recurring = 0, settlement = 0;
      if (month > 0) recurring = id === 'stay' || !afterExit ? netLeaseMonthly : id === 'buy' ? input.ownershipRunningCost : id === 'return' ? input.replacementMonthlyCost : input.continuationMonthlyCost;
      if (month === input.exitMonth && id !== 'stay') settlement += exitSettlement;
      if (month === input.remainingMonths) {
        if (id === 'stay') settlement += input.endAction === 'buy' ? input.endBuyout : input.endReturnFee;
        if (id === 'continue') settlement += input.continuationEndCost;
      }
      const loanPayment = loanRow?.payment ?? 0;
      const outflow = recurring + settlement + loanPayment;
      cash += (month > 0 ? input.monthlyCarBudget : 0) - outflow;
      lowestCash = Math.min(lowestCash, cash); totalPaid += outflow;
      return { month, recurring, settlement, loanPayment, outflow, cash, debt, totalPaid };
    });
    const terminalDebt = rows[rows.length - 1].debt;
    const owns = id === 'buy' || (id === 'stay' && input.endAction === 'buy') || (id === 'continue' && input.continuationEndAction === 'buy');
    const terminalAsset = owns ? input.terminalCarValue : 0;
    return { id, name: names[id], exitSettlement, totalPaid, terminalDebt, terminalAsset,
      adjustedCost: totalPaid + terminalDebt - terminalAsset, lowestCash, closingCash: cash,
      reserveShortfall: Math.max(0, input.reserve - lowestCash), fitsReserve: lowestCash >= input.reserve - 0.005, rows };
  });
  return { errors, options, netLeaseMonthly, buyoutLoanEmi: loan[0]?.payment ?? 0, buyoutCashNeeded,
    bestFit: [...options].filter(o => o.fitsReserve).sort((a, b) => a.adjustedCost - b.adjustedCost)[0] ?? null };
}
