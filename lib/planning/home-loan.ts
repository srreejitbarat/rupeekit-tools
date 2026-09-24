import { inRange, monthIndex, sustainedLead } from './common';

export type HomeLoanPlanInput = {
  principal: number;
  annualRate: number;
  remainingMonths: number;
  startMonth: string;
  targetMonth: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  paymentLimit: number;
  openingCash: number;
  reserve: number;
  prepayment: number;
  prepaymentFees: number;
  repriceEnabled: boolean;
  repriceRate: number;
  repriceFees: number;
  transferEnabled: boolean;
  transferRate: number;
  transferFees: number;
};

export type LoanMonth = {
  month: number;
  openingDebt: number;
  interest: number;
  payment: number;
  debt: number;
  cash: number;
  interestToDate: number;
};

export type LoanOption = {
  id: string;
  label: string;
  rate: number;
  fees: number;
  upfront: number;
  contractualPayment: number;
  payment: number;
  payoffMonth: number | null;
  cashAtGoal: number;
  debtAtGoal: number;
  costAtGoal: number;
  lowestCash: number;
  reserveGap: number;
  monthlyGap: number;
  feasible: boolean;
  reasons: string[];
  rows: LoanMonth[];
  aheadFromMonth: number | null;
  incomeGapMonths: number;
  incomeGapLimit: number;
  rateRiseDebtAtGoal: number;
  budgetPayoffMonth: number | null;
};

export const HOME_LOAN_EXAMPLE: HomeLoanPlanInput = {
  principal: 5_000_000, annualRate: 8.5, remainingMonths: 240,
  startMonth: '2026-10', targetMonth: '2041-09', monthlyIncome: 120_000,
  monthlyExpenses: 65_000, paymentLimit: 50_000, openingCash: 900_000,
  reserve: 500_000, prepayment: 200_000, prepaymentFees: 0,
  repriceEnabled: true, repriceRate: 8, repriceFees: 6_000,
  transferEnabled: true, transferRate: 7.75, transferFees: 50_000,
};

export function loanPayment(principal: number, annualRate: number, months: number) {
  if (principal <= 0) return 0;
  const r = annualRate / 1200;
  return r === 0 ? principal / months : principal * r / -Math.expm1(-months * Math.log1p(r));
}

export function validateHomeLoan(input: HomeLoanPlanInput) {
  const errors: string[] = [];
  const limits: [keyof HomeLoanPlanInput, string, number, number][] = [
    ['principal', 'Loan balance', 1, 1_000_000_000], ['annualRate', 'Current rate', 0, 30],
    ['remainingMonths', 'Remaining term', 1, 480], ['monthlyIncome', 'Monthly income', 0, 10_000_000],
    ['monthlyExpenses', 'Other monthly bills', 0, 10_000_000], ['paymentLimit', 'Monthly loan limit', 0, 10_000_000],
    ['openingCash', 'Accessible savings', 0, 1_000_000_000], ['reserve', 'Protected savings', 0, 1_000_000_000],
    ['prepayment', 'One-off prepayment', 0, input.principal],
    ['prepaymentFees', 'Prepayment charges', 0, 10_000_000],
  ];
  if (input.repriceEnabled) limits.push(['repriceRate', 'Repriced rate', 0, 30], ['repriceFees', 'Repricing fees', 0, 10_000_000]);
  if (input.transferEnabled) limits.push(['transferRate', 'Transfer rate', 0, 30], ['transferFees', 'Transfer fees', 0, 10_000_000]);
  for (const [key, label, min, max] of limits) if (!inRange(input[key] as number, min, max)) errors.push(`${label} must be between ${min.toLocaleString('en-IN')} and ${max.toLocaleString('en-IN')}.`);
  if (!Number.isInteger(input.remainingMonths)) errors.push('Remaining term must use whole months.');
  const horizon = monthIndex(input.targetMonth) - monthIndex(input.startMonth) + 1;
  if (!inRange(horizon, 1, 480)) errors.push('Choose a target month between the start month and 40 years later.');
  return errors;
}

function simulate(input: HomeLoanPlanInput, rate: number, fees: number, upfront: number, payment: number, months: number, incomeGap = 0) {
  let debt = Math.max(0, input.principal - upfront);
  let cash = input.openingCash - fees - upfront;
  let lowestCash = cash;
  let interestToDate = 0;
  let payoffMonth: number | null = debt <= 0.005 ? 0 : null;
  const rows: LoanMonth[] = [];
  for (let month = 1; month <= months; month++) {
    const openingDebt = debt;
    const interest = debt * rate / 1200;
    const paid = Math.min(payment, debt + interest);
    debt = Math.max(0, debt + interest - paid);
    if (debt < 0.005) debt = 0;
    if (payoffMonth === null && debt === 0) payoffMonth = month;
    cash += (month <= incomeGap ? 0 : input.monthlyIncome) - input.monthlyExpenses - paid;
    lowestCash = Math.min(lowestCash, cash);
    interestToDate += interest;
    rows.push({ month, openingDebt, interest, payment: paid, debt, cash, interestToDate });
  }
  return { rows, lowestCash, payoffMonth };
}

function payoffMonths(principal: number, rate: number, payment: number) {
  if (principal <= 0.005) return 0;
  if (payment <= principal * rate / 1200 || payment <= 0) return null;
  const r = rate / 1200;
  const n = r === 0 ? principal / payment : -Math.log1p(-principal * r / payment) / Math.log1p(r);
  return Number.isFinite(n) && n <= 600 ? Math.max(1, Math.ceil(n - 1e-8)) : null;
}

export function planHomeLoan(input: HomeLoanPlanInput) {
  const errors = validateHomeLoan(input);
  if (errors.length) return { errors, options: [] as LoanOption[], bestId: null as string | null, horizon: 0 };
  const horizon = monthIndex(input.targetMonth) - monthIndex(input.startMonth) + 1;
  const prepaymentFees = input.prepayment > 0 ? input.prepaymentFees : 0;
  const specs = [
    { id: 'keep', label: 'Keep current schedule', rate: input.annualRate, fees: 0, upfront: 0 },
    { id: 'prepay', label: input.prepayment ? 'Prepay + pay towards goal' : 'Pay towards goal', rate: input.annualRate, fees: prepaymentFees, upfront: input.prepayment },
    ...(input.repriceEnabled ? [{ id: 'reprice', label: input.prepayment ? 'Reprice + prepay' : 'Reprice with current lender', rate: input.repriceRate, fees: input.repriceFees + prepaymentFees, upfront: input.prepayment }] : []),
    ...(input.transferEnabled ? [{ id: 'transfer', label: input.prepayment ? 'Transfer + prepay' : 'Transfer to another lender', rate: input.transferRate, fees: input.transferFees + prepaymentFees, upfront: input.prepayment }] : []),
  ];
  const options: LoanOption[] = specs.map(spec => {
    const principal = input.principal - spec.upfront;
    // Keep the original contractual term on repricing/transfer; extra payments only shorten it.
    // For same-lender prepayment keep the original EMI, rather than assuming an automatic recast.
    const contractualPayment = principal <= 0 ? 0 : loanPayment(
      spec.id === 'prepay' ? input.principal : principal, spec.rate, input.remainingMonths,
    );
    const required = loanPayment(principal, spec.rate, horizon);
    const payment = spec.id === 'keep' ? contractualPayment : Math.max(contractualPayment, required);
    const projection = simulate(input, spec.rate, spec.fees, spec.upfront, payment, horizon);
    const last = projection.rows[horizon - 1];
    const reserveGap = Math.max(0, input.reserve - projection.lowestCash);
    const monthlyGap = Math.max(0, payment - input.paymentLimit);
    const payoffMonth = payoffMonths(principal, spec.rate, payment);
    const reasons: string[] = [];
    if (monthlyGap > 0.01) reasons.push(`The planned payment exceeds your monthly limit by ${Math.ceil(monthlyGap).toLocaleString('en-IN')} rupees.`);
    if (reserveGap > 0.01) reasons.push(`The plan needs ${Math.ceil(reserveGap).toLocaleString('en-IN')} rupees more cash to preserve your reserve throughout the comparison.`);
    if (last.debt > 0.01) reasons.push(`The loan still has ${Math.ceil(last.debt).toLocaleString('en-IN')} rupees outstanding at your deadline.`);
    const incomeGapLimit = Math.min(12, horizon);
    let incomeGapMonths = 0;
    for (let gap = 1; gap <= incomeGapLimit; gap++) {
      if (simulate(input, spec.rate, spec.fees, spec.upfront, payment, horizon, gap).lowestCash < input.reserve - 0.01) break;
      incomeGapMonths = gap;
    }
    const rateRise = simulate(input, spec.rate + 1, spec.fees, spec.upfront, payment, horizon);
    return {
      ...spec, contractualPayment, payment, payoffMonth, cashAtGoal: last.cash, debtAtGoal: last.debt,
      costAtGoal: last.interestToDate + spec.fees, lowestCash: projection.lowestCash,
      reserveGap, monthlyGap, feasible: reasons.length === 0, reasons, rows: projection.rows,
      aheadFromMonth: null, incomeGapMonths, incomeGapLimit, rateRiseDebtAtGoal: rateRise.rows[horizon - 1].debt,
      budgetPayoffMonth: payoffMonths(principal, spec.rate, input.paymentLimit),
    };
  });
  const baseline = options[0];
  for (const option of options.slice(1)) {
    option.aheadFromMonth = sustainedLead(option.rows.map((row, i) =>
      (row.cash - row.debt) - (baseline.rows[i].cash - baseline.rows[i].debt)));
  }
  const best = options.filter(option => option.feasible).sort((a, b) => a.costAtGoal - b.costAtGoal)[0];
  return { errors, options, bestId: best?.id ?? null, horizon };
}
