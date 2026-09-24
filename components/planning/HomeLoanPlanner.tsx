'use client';

import { useMemo, useState } from 'react';
import { HOME_LOAN_EXAMPLE, planHomeLoan, type HomeLoanPlanInput } from '@/lib/planning/home-loan';
import { money, monthAt, monthLabel } from '@/lib/planning/common';
import { HOME_ASSUMPTIONS, homeReport } from '@/lib/planning/reports';
import PlanningGuide from './PlanningGuide';
import PlanDownloads from './PlanDownloads';
import { Check, DataTable, Errors, Field, Grid, Note, PlanChart, Select, Stat, Step, UpdatePlan, muted, numeric, panel, usePlanForm } from './PlanningFields';

const guide = [
  { title: 'Start with what you still owe', text: 'Enter the current loan balance, remaining months and interest rate from your lender statement. Choose when you want to be debt-free.' },
  { title: 'Set three limits', text: 'Choose a monthly loan-payment limit, a payoff deadline, and savings you want to protect. Add take-home income and other bills so the planner can check cash throughout the loan.' },
  { title: 'Compare real lender quotes', text: 'Add an optional prepayment, a repricing quote from your lender, or a balance-transfer quote. Enter all fees. The examples are illustrative, not live offers.' },
  { title: 'Check the fit, then the stress', text: 'Update the plan. A fitting option must meet all three limits. Compare interest and fees, inspect the income-loss and rate-rise tests, and download the assumptions and schedule.' },
];
export default function HomeLoanPlanner() {
  const p = usePlanForm(HOME_LOAN_EXAMPLE, planHomeLoan);
  const { draft: d, committed: c, result: r } = p;
  const [selected, setSelected] = useState('reprice');
  const [year, setYear] = useState('0');
  const report = useMemo(() => homeReport(c, r), [c, r]);
  const option = r.options.find(o => o.id === selected) ?? r.options.find(o => o.id === r.bestId) ?? r.options[0];
  const num = (key: keyof HomeLoanPlanInput, label: string, hint?: string, max?: number) => <Field label={label} value={d[key] as number} hint={hint} max={max} onChange={v => p.set(key, numeric(v))} />;
  const payoff = (months: number | null) => months === null ? 'Not within 50 years' : months === 0 ? 'Before month 1' : monthLabel(monthAt(c.startMonth, months - 1));
  const page = Math.min(Number(year), Math.max(0, Math.ceil(r.horizon / 12) - 1));
  return <div className="space-y-5">
    <PlanningGuide name="home-loan" steps={guide} />
    <p className={muted}>Example figures are loaded. Replace them with your loan statement and lender quotes. All amounts are in rupees.</p>
    <form onSubmit={p.submit} noValidate className="space-y-5">
      <Step number={1} title="Your loan and payoff goal" description="Use the outstanding balance and remaining term, rather than the original loan.">
        <Grid>{num('principal', 'Outstanding loan balance (₹)')}{num('annualRate', 'Current interest rate (%)', 'Annual rate; held constant in the base plan.', 30)}
          {num('remainingMonths', 'Remaining term (months)', 'Whole months on your current schedule.', 480)}
          <Field type="month" label="Plan starts" value={d.startMonth} onChange={v => p.set('startMonth', v)} />
          <Field type="month" label="Debt-free by" value={d.targetMonth} onChange={v => p.set('targetMonth', v)} />
          {num('paymentLimit', 'Monthly loan-payment limit (₹)', 'Maximum you want to pay towards this loan.')}
        </Grid>
      </Step>
      <Step number={2} title="Cash you can use and savings to protect">
        <Grid>{num('monthlyIncome', 'Household take-home / month (₹)')}{num('monthlyExpenses', 'Other bills / month (₹)', 'Living costs and other EMIs; exclude this loan payment.')}
          {num('openingCash', 'Accessible savings now (₹)', 'Cash available before fees and prepayment.')}{num('reserve', 'Protected savings (₹)', 'Minimum cash to preserve at every stage.')}
          {num('prepayment', 'One-off prepayment (₹)', 'Paid before month 1 in every alternative; zero for keeping the current schedule.')}
          {num('prepaymentFees', 'Prepayment charges (₹)', 'Added to every alternative with a prepayment. Use zero if none; exclude these from the quote fees below.')}
        </Grid>
      </Step>
      <Step number={3} title="Optional repricing and transfer quotes" description="Enter your own all-in fees, including applicable taxes, legal costs and charges. No live bank rates are assumed.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3"><Check label="Compare a quote from my current lender" checked={d.repriceEnabled} onChange={v => p.set('repriceEnabled', v)} />
            {d.repriceEnabled && <>{num('repriceRate', 'Repriced annual rate (%)', undefined, 30)}{num('repriceFees', 'Total repricing fees (₹)')}</>}
          </div>
          <div className="space-y-3"><Check label="Compare a transfer to another lender" checked={d.transferEnabled} onChange={v => p.set('transferEnabled', v)} />
            {d.transferEnabled && <>{num('transferRate', 'Transfer annual rate (%)', undefined, 30)}{num('transferFees', 'Total transfer fees (₹)')}</>}
          </div>
        </div>
      </Step>
      <UpdatePlan dirty={p.dirty} />
    </form>
    <div ref={p.resultsRef} tabIndex={-1} aria-label="Estimated results" className="space-y-5 outline-none">
      <Errors errors={r.errors} />
      {!r.errors.length && option && <>
        {p.dirty && <Note warning>These results still use your previous inputs. Select Update plan to refresh them.</Note>}
        <div className={panel}><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">Your decision at a glance</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{r.bestId ? `${r.options.find(o => o.id === r.bestId)!.label} has the lowest interest and fees among fitting plans` : 'No option meets all three limits yet'}</h3>
          <p className={`mt-3 ${muted}`}>Compared through {monthLabel(c.targetMonth)}. A fit means debt cleared by this date, payment within {money(c.paymentLimit)} a month, and cash at least {money(c.reserve)} after upfront payments and at each month end. Confirm any payment change with the lender.</p>
        </div>
        <DataTable caption="Compare loan options against your three limits" headers={['Option', 'Monthly payment', 'Payoff date', 'Interest + fees to deadline', 'Fits all limits?']}
          rows={r.options.map(o => [o.label, money(o.payment), payoff(o.payoffMonth), money(o.costAtGoal), o.feasible ? 'Yes' : 'No'])} />
        <Select label="Explore an option" value={option.id} onChange={setSelected} options={r.options.map(o => [o.id, o.label])} />
        <Grid><Stat label="Lowest available cash" value={money(option.lowestCash)} detail={`Includes the cash left immediately after ${money(option.upfront)} prepayment and ${money(option.fees)} fees.`} />
          <Stat label="Debt at your deadline" value={money(option.debtAtGoal)} detail={`Cash at the same date: ${money(option.cashAtGoal)}.`} />
          <Stat label="Ahead of keeping from" value={option.id === 'keep' ? 'Reference plan' : option.aheadFromMonth ? monthLabel(monthAt(c.startMonth, option.aheadFromMonth - 1)) : 'Not by deadline'} detail="Compares cash minus debt; the advantage must last through the deadline." /></Grid>
        {!option.feasible && <Note warning><strong>What needs to change</strong><ul className="mt-2 list-disc space-y-1 pl-5">{option.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></Note>}
        <PlanChart title="Remaining loan: compare the same dates" dates={option.rows.map(row => monthAt(c.startMonth, row.month - 1))} series={r.options.map(o => ({ label: o.label, values: o.rows.map(row => row.debt) }))} />
        <PlanChart title={`${option.label}: available cash after each month`} dates={option.rows.map(row => monthAt(c.startMonth, row.month - 1))} series={[{ label: 'Available cash', values: option.rows.map(row => row.cash) }]} reference={{ label: 'protected savings', value: c.reserve }} />
        <div className={panel}><h3 className="text-lg font-bold text-slate-900 dark:text-white">Test this plan under pressure</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><Stat label="No-income buffer" value={`${option.incomeGapMonths} month${option.incomeGapMonths === 1 ? '' : 's'}`} detail={`Full income stops at the start; bills and payments continue. Tested up to ${option.incomeGapLimit} months while preserving your reserve. ${option.reserveGap > 0.01 ? 'The base plan already breaches the reserve.' : ''}`} />
            <Stat label="Debt if the rate rises 1 point" value={money(option.rateRiseDebtAtGoal)} detail="Debt at the original deadline if the annual rate rises one percentage point from month 1 and payments stay unchanged." /></div>
          <p className={`mt-4 ${muted}`}>At your payment limit of {money(c.paymentLimit)}, the mathematical payoff date is {payoff(option.budgetPayoffMonth)}. {c.paymentLimit < option.contractualPayment ? 'That limit is below the assumed contractual EMI; this needs a lender-approved restructure.' : 'This alternative date does not itself certify that the reserve stays protected.'}</p>
        </div>
        <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">Inspect the monthly repayment and cash schedule</summary>
          <div className="mt-4 space-y-4"><Select label="Schedule year" value={String(page)} onChange={setYear} options={Array.from({ length: Math.ceil(r.horizon / 12) }, (_, i) => [String(i), `Year ${i + 1} · ${monthLabel(monthAt(c.startMonth, i * 12))}`])} />
            <DataTable caption={`${option.label} monthly schedule`} headers={['Month', 'Payment', 'Interest', 'Debt left', 'Available cash']} rows={option.rows.slice(page * 12, page * 12 + 12).map(row => [monthLabel(monthAt(c.startMonth, row.month - 1)), money(row.payment), money(row.interest), money(row.debt), money(row.cash)])} /></div>
        </details>
        <PlanDownloads report={report} disabled={p.dirty} />
      </>}
    </div>
    <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">Method, assumptions and lender checks</summary><ul className={`mt-4 list-disc space-y-3 pl-5 ${muted}`}>{HOME_ASSUMPTIONS.slice(0, -1).map(a => <li key={a}>{a}</li>)}</ul>
      <p className={`mt-4 ${muted}`}>Read the <a href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0" target="_blank" rel="noopener noreferrer" className="font-semibold underline">RBI guidance on floating-rate EMI resets</a> and confirm your lender’s terms.</p>
    </details>
  </div>;
}
