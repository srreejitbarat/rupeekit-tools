import { money, moneyNumber, monthAt, monthLabel } from './common';
import { planHomeLoan, type HomeLoanPlanInput } from './home-loan';
import { planSipGoals, type SipGoalsInput } from './sip-goals';
import { planSalaryCash, type SalaryCashInput } from './salary-cash';

export type PlanReport = {
  title: string; subtitle: string; filename: string; url: string;
  inputNote?: string; inputsHeading?: string; scheduleHeading?: string;
  sections: { title: string; lines?: string[]; headers?: string[]; rows?: string[][] }[];
  assumptions: string[]; inputs: string[][]; schedule: (string | number)[][];
};

const human = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).replace(/Ctc/g, 'CTC').replace(/Pf/g, 'PF');
const inputLabels: Record<string, string> = {
  principal: 'Outstanding loan balance (INR)', annualRate: 'Current annual rate (%)', remainingMonths: 'Remaining loan term (months)',
  monthlyIncome: 'Household take-home per month (INR)', monthlyExpenses: 'Other bills per month (INR)', paymentLimit: 'Loan-payment limit per month (INR)',
  openingCash: 'Opening accessible cash (INR)', reserve: 'Protected savings (INR)', prepayment: 'Upfront prepayment (INR)', prepaymentFees: 'Prepayment charges (INR)',
  repriceRate: 'Repriced annual rate (%)', repriceFees: 'Repricing fees excluding prepayment charges (INR)',
  transferRate: 'Transfer annual rate (%)', transferFees: 'Transfer fees excluding prepayment charges (INR)',
  startMonth: 'Start month', targetMonth: 'Debt-free target month', monthlyBudget: 'Shared monthly budget (INR)', annualReturn: 'Assumed annual return (%)', inflation: 'Annual inflation (%)',
  targetBasis: 'Target basis', allocation: 'Budget allocation method', target: 'Goal target (INR)', deadline: 'Deadline month', savings: 'Dedicated opening savings (INR)',
  financialYear: 'Tax-rule year', livingCosts: 'Household costs per month (INR)', targetInHand: 'Target normal net pay per month (INR)',
  priorGross: 'Earlier gross salary this FY (INR)', priorTaxPaid: 'Earlier salary TDS this FY (INR)', priorPf: 'Earlier employee PF this FY (INR)', priorProfessionalTax: 'Earlier professional tax this FY (INR)',
  deduction80C: 'Annual eligible 80C excluding PF (INR)', deduction80D: 'Annual eligible health-insurance deduction (INR)', otherOldDeductions: 'Other eligible annual old-regime deductions (INR)',
  fixedCtc: 'Annual fixed CTC excluding bonuses (INR)', basicPercent: 'Basic as share of fixed CTC (%)', pfRate: 'PF contribution rate (%)', capPf: 'Apply entered PF wage cap', monthlyPfWageCap: 'Monthly PF wage cap assumption (INR)',
  employerPfIncluded: 'Employer PF included in fixed CTC', professionalTax: 'Professional tax per month (INR)', otherDeductions: 'Other payroll deductions per month (INR)',
  variablePay: 'Annual variable-pay target (INR)', variablePayoutPercent: 'Variable payout assumption (%)', variableMonth: 'Variable payout month number',
  joiningBonus: 'Gross joining bonus (INR)', joiningMonth: 'Joining-bonus payout month number', clawbackMonths: 'Clawback term from job start (months)',
  firstPayDelay: 'First regular salary delay (months)', switchingCost: 'One-off switching costs in month 1 (INR)', workCost: 'Work costs per month (INR)',
};
function inputs(value: object, prefix = ''): string[][] {
  return Object.entries(value).flatMap(([key, item]): string[][] => {
    if (key === 'id') return [];
    const label = `${prefix}${inputLabels[key] ?? human(key)}`;
    if (Array.isArray(item)) return item.flatMap((child, i) => inputs(child, `${human(key)} ${i + 1} / `));
    return [[label, typeof item === 'boolean' ? item ? 'Yes' : 'No' : typeof item === 'number' ? Number.isFinite(item) ? item.toLocaleString('en-IN', { maximumFractionDigits: 4 }) : 'Not entered (unused)' : String(item)]];
  });
}
export function reportCsv(report: PlanReport) {
  return [[report.title], [report.subtitle], ['Source', report.url], [], [report.inputsHeading ?? 'INPUTS (rupees unless %, months or date)'], ...report.inputs,
    [], ['ASSUMPTIONS'], ...report.assumptions.map(a => [a]),
    ...report.sections.flatMap(s => [[], [s.title], ...(s.lines ?? []).map(line => [line]), ...(s.headers ? [s.headers] : []), ...(s.rows ?? [])]),
    [], [report.scheduleHeading ?? 'MONTHLY SCHEDULE (all amounts INR)'], ...report.schedule];
}

export const HOME_ASSUMPTIONS = [
  'Illustrative fixed-rate, monthly reducing-balance projection. Payments occur at month end; prepayment and all entered fees leave savings before month 1. Enter the outstanding balance, not the original sanction.',
  'All plans share the same deadline. Repricing and transfer use the entered quote and current remaining term; planned payments can be higher to reach the deadline. Same-lender prepayment keeps the original EMI floor. Confirm permitted payments and fees with the lender.',
  'A plan fits only when its payment is within the entered limit, cash is at least the protected reserve after upfront payments and at each month end, and debt is cleared by the target month. Intramonth bill timing is not modelled. Interest plus fees is compared over the same horizon; principal is not counted as a cost.',
  'Cash has no assumed interest or investment return. Income, other bills and quoted rates stay constant. Include all applicable conversion, transfer, legal, tax and insurance costs in each quote fee. Separate prepayment charges are added to every alternative with a prepayment; avoid counting them twice. Home-loan tax deductions and property values are excluded.',
  'Income stress removes all income from the first month for up to 12 months while bills and loan payments continue. Rate stress adds one percentage point from month 1 with payments unchanged. These are separate scenarios.',
  'Ahead of keeping means cash minus remaining debt is higher and stays at least as high through the deadline. It is not a lender approval or a guarantee. RBI reference: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0',
];
export function homeReport(input: HomeLoanPlanInput, result: ReturnType<typeof planHomeLoan>): PlanReport {
  const payoff = (month: number | null) => month === null ? 'Beyond model range' : month === 0 ? 'Before month 1' : monthLabel(monthAt(input.startMonth, month - 1));
  return {
    title: 'Home-loan repayment plan', subtitle: `${monthLabel(input.startMonth)} to ${monthLabel(input.targetMonth)} | Estimates from your inputs`,
    filename: 'rupeekit-home-loan-plan', url: 'https://www.rupeekit.co.in/tools/home-loan-emi-calculator-india', inputs: inputs(input), assumptions: HOME_ASSUMPTIONS,
    sections: [
      { title: 'Deadline and affordability', headers: ['Option', 'Monthly payment', 'Payoff', 'Fits all limits?'], rows: result.options.map(o => [o.label, money(o.payment), payoff(o.payoffMonth), o.feasible ? 'Yes' : 'No']) },
      { title: 'Same-date comparison', headers: ['Option', 'Interest + fees', 'Lowest cash', 'Debt at deadline'], rows: result.options.map(o => [o.label, money(o.costAtGoal), money(o.lowestCash), money(o.debtAtGoal)]) },
      ...result.options.map(o => ({ title: o.label, lines: [
        o.feasible ? 'Fits the entered deadline, payment limit and protected savings.' : o.reasons.join(' '),
        `Upfront prepayment ${money(o.upfront)}; fees ${money(o.fees)}; cash at deadline ${money(o.cashAtGoal)}.`,
        `Income interruption supported: ${o.incomeGapMonths} month(s), tested up to ${o.incomeGapLimit}. Debt at deadline after a 1 percentage point rate rise: ${money(o.rateRiseDebtAtGoal)}.`,
        o.id === 'keep' ? 'Reference schedule.' : `Sustained advantage over keeping: ${o.aheadFromMonth === null ? 'not reached by deadline' : payoff(o.aheadFromMonth)}.`,
      ] })),
    ],
    schedule: [['Option', 'Month', 'Opening debt', 'Interest', 'Payment', 'Closing debt', 'Cash', 'Cumulative interest'], ...result.options.flatMap(o => o.rows.map(row => [o.label, monthAt(input.startMonth, row.month - 1), ...[row.openingDebt, row.interest, row.payment, row.debt, row.cash, row.interestToDate].map(moneyNumber)]))],
  };
}
export const SIP_ASSUMPTIONS = [
  'Hypothetical projections, not promised returns or a recommended asset allocation. All goals use the same user-entered annual return divided by 12, compounded monthly. Contributions are invested at the start of each month. Taxes, fees and market fluctuations are excluded.',
  'Today-cost goals grow at the entered annual inflation rate until each deadline. Future targets are used as entered. Dedicated savings remain assigned to their own goal; the monthly budget is shared and recalculated each month.',
  'Balanced allocation splits the budget in proportion to each active goal’s recalculated SIP need. Priority allocation serves the listed goals in order. Once a deadline passes, that goal stops receiving contributions. Unneeded budget stays outside the projection.',
  'The required budget is the smallest whole-rupee estimate found for the selected allocation method, not a global investment optimum. Date adjustment shifts all deadlines equally, searching up to ten extra years without exceeding the 30-year model horizon. More time can increase an inflation-linked target.',
  'The lower-return scenario reduces the assumed annual rate by four percentage points and repeats the same contribution schedule. It is a stress scenario, not a probability or worst-case loss.',
];
export function sipReport(input: SipGoalsInput, result: ReturnType<typeof planSipGoals>): PlanReport {
  return {
    title: 'SIP plan for multiple goals', subtitle: `${money(input.monthlyBudget)} monthly budget | ${input.allocation} allocation | Start ${monthLabel(input.startMonth)}`,
    filename: 'rupeekit-sip-goal-plan', url: 'https://www.rupeekit.co.in/tools/sip-calculator-india', inputs: inputs(input), assumptions: SIP_ASSUMPTIONS,
    sections: [
      { title: 'Budget decision', lines: [`${result.fits ? 'All goals are funded' : 'Some goals have a shortfall'} under the entered return assumption.`, `Required shared budget: ${money(result.requiredBudget)} per month. Additional budget: ${money(result.extraBudget)} per month.`, `Equal deadline extension at current budget: ${result.extensionMonths === null ? `no solution within ${result.extensionSearchMonths} extra months searched` : `${result.extensionMonths} months`}.`] },
      { title: 'Goals at their deadlines', headers: ['Goal / deadline', 'Future target', 'Projected value', 'Shortfall'], rows: result.goals.map(g => [`${g.name} / ${monthLabel(g.deadline)}`, money(g.futureTarget), money(g.projected), money(g.gap)]) },
      { title: 'Allocation and lower-return test', headers: ['Goal', 'Month 1 SIP', 'Value at lower return', 'Affordable target*'], rows: result.goals.map(g => [g.name, money(g.firstAllocation), money(g.lowerReturnValue), money(g.affordableToday)]), lines: ['*Affordable target uses the same today-cost or future-target basis you selected.'] },
    ],
    schedule: [['Goal', 'Month', 'Contribution', 'Invested incl. opening savings', 'Projected value', 'Shared budget used', 'Unused budget'], ...result.goals.flatMap(g => g.rows.map(row => [g.name, monthAt(input.startMonth, row.month - 1), ...[row.contribution, row.invested, row.value, result.budgetRows[row.month - 1].contributed, result.budgetRows[row.month - 1].unused].map(moneyNumber)]))],
  };
}
export const SALARY_ASSUMPTIONS = [
  'A salary-only estimate for an Indian resident below 60. Gross salary, including bonuses, must be at most Rs 50 lakh in each projected financial year; surcharge, non-salary income, special-rate income, equity compensation, gratuity and employer benefits other than the entered PF are excluded.',
  'Fixed CTC excludes variable pay and joining bonus. Basic pay is the entered percentage of fixed CTC. Employee and employer PF use the same contribution rate and the optional user-entered monthly wage cap. The cap is a payroll assumption, not an automatic statutory limit; confirm the PF wage base and cap with HR. Employer PF reduces gross only when included in fixed CTC. Enter actual professional tax and other deductions.',
  'Tax is estimated separately for each April-March financial year, projecting continued employment through March and an annual variable payout in the selected calendar month. The first year includes your earlier salary, TDS, PF and professional tax. The selected tax-rule year is held constant across the whole plan, including future years.',
  'Regular tax is reserved across the remaining financial-year months. Bonuses carry incremental annual tax at payout, after any available prior TDS credit. Actual payroll TDS may differ; excess credit is shown separately and no tax refund is added to cash.',
  'Delayed first salary means employed but unpaid initially, with the accrued net salary and tax reserve released at the first payment. It does not represent unemployment. Bonuses follow their chosen dates independently. Living and work costs continue during the delay; switching costs are paid in month 1.',
  'Joining-bonus exposure is the full gross bonus, from receipt through the entered number of months after starting this job (month 1). Cash after reserving that exposure is shown separately; no automatic repayment, prorating or tax recovery is assumed. Check the employment contract.',
  'The target solver finds fixed CTC for a normal full year with no bonuses or salary delay. It includes entered PF, tax and recurring deductions, but excludes living and work costs. Annual old-regime deductions must be eligible amounts; additional 80C excludes PF to prevent double counting.',
  'Tax references: https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1 and https://www.indiabudget.gov.in/doc/memo.pdf . Legacy 80C/80D labels identify familiar deduction categories; eligibility must be checked for the selected tax year.',
];
export function salaryReport(input: SalaryCashInput, result: ReturnType<typeof planSalaryCash>): PlanReport {
  return {
    title: 'Salary cash calendar and offer comparison', subtitle: `${monthLabel(input.startMonth)} to ${monthLabel(monthAt(input.startMonth, 11))} | ${input.regime} regime | ${input.financialYear} tax rules`,
    filename: 'rupeekit-salary-cash-plan', url: 'https://www.rupeekit.co.in/tools/salary-in-hand-calculator-india', inputs: inputs(input), assumptions: SALARY_ASSUMPTIONS,
    sections: [
      { title: 'Twelve-month comparison', headers: ['Option', 'Normal fixed net / mo', 'Lowest cash', 'Closing cash'], rows: result.offers.map(o => [o.name, money(o.fixedMonthlyInHand), money(o.lowestCash), money(o.closingCash)]) },
      { title: 'Fixed salary target', lines: [`Target: ${money(input.targetInHand)} a month before household and work expenses.`], headers: ['Option structure', 'Required fixed CTC / yr', 'Gross salary / yr'], rows: result.offers.map(o => [o.name, o.targetFixedCtc === null ? 'Above model limit' : money(o.targetFixedCtc), o.targetGrossSalary === null ? 'Above model limit' : money(o.targetGrossSalary)]) },
      ...result.offers.map(o => ({ title: `${o.name}: tax and bonus exposure`, lines: [
        `Total net receipts in 12 months: ${money(o.totalReceipts)}. End-of-plan joining-bonus exposure: ${money(o.closingClawback)}.`,
        ...o.fiscalEstimates.map(f => `FY ${f.year}-${String(f.year + 1).slice(-2)}: projected gross ${money(f.gross)}, tax ${money(f.tax)}, TDS paid before plan ${money(f.paidBeforePlan)}, unused tax credit ${money(f.unallocatedTaxCredit)}.`),
      ] })),
    ],
    schedule: [['Option', 'Month', 'Fixed net received', 'Gross bonus', 'Tax reserved incl. bonus', 'Incremental bonus tax', 'Total net received', 'Living/work/switch costs', 'Closing cash', 'Gross clawback exposure', 'Cash after clawback reserve'], ...result.offers.flatMap(o => o.rows.map(row => [o.name, row.date, ...[row.fixedCash, row.bonuses, row.taxReserve, row.bonusTax, row.inHand, row.costs, row.cash, row.clawback, row.uncommittedCash].map(moneyNumber)]))],
  };
}
