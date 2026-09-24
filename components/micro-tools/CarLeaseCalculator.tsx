'use client';

import { calculateCarLease, CAR_LEASE_EXAMPLE, type CarLeaseInput } from '@/lib/micro-tools/car-lease';
import { carLeaseReport, LEASE_ASSUMPTIONS } from '@/lib/micro-tools/reports';
import { money } from '@/lib/planning/common';
import PlanningGuide from '@/components/planning/PlanningGuide';
import PlanDownloads from '@/components/planning/PlanDownloads';
import { Check, DataTable, Errors, Field, Grid, muted, Note, numeric, panel, secondary, Select, Stat, Step, UpdatePlan, usePlanForm } from '@/components/planning/PlanningFields';
import { CashTrace, ComparisonBars, DecisionIntro, MethodDetails } from './DecisionUi';

export default function CarLeaseCalculator() {
  const f = usePlanForm(CAR_LEASE_EXAMPLE, calculateCarLease);
  const d = f.draft, r = f.result, input = f.committed;
  const number = (key: keyof CarLeaseInput, label: string, hint?: string, max?: number, min = 0, step: number | 'any' = 'any') => <Field label={label} value={d[key] as number} onChange={v => f.set(key, numeric(v))} hint={hint} min={min} max={max} step={step} />;
  return <div className="space-y-6">
    <DecisionIntro question="Changing jobs? Check what happens to your company car." text="Compare the future car cost of staying, buying out, returning or continuing an approved lease. See the cash needed at exit, any loan left later, and whether your reserve survives. This compares the car arrangement, not the value of your job offer." />
    <PlanningGuide name="car-lease-exit" steps={[
      { title: 'Choose the date and the cash you can use', text: 'Count the months left on your current lease. Choose when you might leave and the money available for the car after other household costs.' },
      { title: 'Use payroll’s actual take-home impact', text: 'Enter the lease deduction and the monthly tax saving confirmed by payroll. Do not assume the highest tax rate applies to the entire lease payment.' },
      { title: 'Collect two separate exit quotes', text: 'Ask for an all-in buyout quote and an all-in return settlement after that month’s normal payment. Include applicable tax and charges once. Continuation requires approval.' },
      { title: 'Compare cost and accessible cash', text: 'Remaining loan debt and the car’s value are included at the same end date. The car value is not cash for bills. Check reserves, then export the comparison for HR or the lessor.' },
    ]} />
    <div className="flex flex-wrap gap-2" role="group" aria-label="Example car lease scenarios">
      <button className={secondary} type="button" onClick={() => f.commit(CAR_LEASE_EXAMPLE)}>Leave after 12 months + buyout loan</button>
      <button className={secondary} type="button" onClick={() => f.commit({ ...CAR_LEASE_EXAMPLE, finance: 'cash' })}>Pay the buyout in cash</button>
      <button className={secondary} type="button" onClick={() => f.commit({ ...CAR_LEASE_EXAMPLE, continuationAllowed: true })}>Include an approved continuation quote</button>
    </div>
    <form onSubmit={f.submit} noValidate className="space-y-5">
      <Step number={1} title="Your timing and car budget" description="This starts today. Past lease payments are excluded. The same future monthly budget is used for every option.">
        <Grid>{number('remainingMonths', 'Months remaining on the lease', undefined, 120, 1, 1)}{number('exitMonth', 'Leave after month', '0 = leave now. Otherwise, exit follows that month’s normal payment.', d.remainingMonths, 0, 1)}
          {number('openingCash', 'Cash available today (₹)')}{number('reserve', 'Cash you want to protect (₹)')}{number('monthlyCarBudget', 'Monthly money available for the car (₹)', 'After other household spending. Also covers car running costs below.')}
        </Grid>
      </Step>
      <Step number={2} title="If you keep the current company lease">
        <Grid>{number('payrollDeduction', 'Monthly payroll lease deduction (₹)')}{number('payrollTaxSaving', 'Payroll-confirmed monthly tax saving (₹)', 'Use the difference shown by payroll. Enter 0 if unconfirmed.', d.payrollDeduction)}{number('leaseRunningCost', 'Extra monthly running costs while leasing (₹)', 'Costs not included in the payroll deduction, such as fuel.')}
          <Select label="At the original lease end" value={d.endAction} onChange={v => f.set('endAction', v as CarLeaseInput['endAction'])} options={[['buy', 'Buy the car'], ['return', 'Return the car']]} />
          {d.endAction === 'buy' ? number('endBuyout', 'All-in buyout at the original lease end (₹)') : number('endReturnFee', 'All-in return fee at the original lease end (₹)')}
          {number('terminalCarValue', 'Estimated car value at comparison end (₹)', 'Used only for options where you own the car at that date. Not treated as cash.')}
        </Grid>
      </Step>
      <Step number={3} title="If you leave and buy out the car" description="Use the all-in quote for your chosen exit month, after its normal lease payment. Include taxes, fees and any remaining obligations once.">
        <Grid>{number('exitBuyout', 'All-in early buyout quote (₹)', 'Do not add the remaining lease payments again.')}
          <Select label="How will you fund the early buyout?" value={d.finance} onChange={v => f.set('finance', v as CarLeaseInput['finance'])} options={[['cash', 'Pay cash'], ['loan', 'Down payment + loan']]} />
          {d.finance === 'loan' && <>{number('downPayment', 'Buyout down payment (₹)', 'Loan = buyout quote minus this amount. Exclude loan charges.', d.exitBuyout)}{number('loanFee', 'Upfront buyout loan charges including tax (₹)', 'Paid separately at exit. Do not include charges already in the buyout quote.')}{number('loanRate', 'Annual buyout loan rate (%)', undefined, 60)}{number('loanMonths', 'Buyout loan term (months)', 'Any debt left at the comparison end remains in the cost.', 120, 1, 1)}</>}
          {number('ownershipRunningCost', 'Monthly running costs after buying (₹)', 'Include insurance, maintenance, fuel and other car costs.')}
        </Grid>
      </Step>
      <Step number={4} title="If you return the car or continue the lease">
        <Grid>{number('exitReturnSettlement', 'All-in settlement to return the car at exit (₹)', 'Use the lessor’s surrender quote, including remaining obligations.')}{number('replacementMonthlyCost', 'Replacement transport each month (₹)', 'For example taxis, public transport or another complete car budget.')}</Grid>
        <div className="mt-5"><Check label="The lessor or employer permits continuation / transfer after I leave" checked={d.continuationAllowed} onChange={v => f.set('continuationAllowed', v)} /></div>
        {d.continuationAllowed && <div className="mt-4"><Grid>{number('continuationMonthlyCost', 'Total monthly cash cost after continuation (₹)', 'Include the new lease cost and running costs, after any confirmed payroll benefit.')}{number('continuationTransferFee', 'All-in transfer charge at exit (₹)')}
          <Select label="At the continued lease end" value={d.continuationEndAction} onChange={v => f.set('continuationEndAction', v as CarLeaseInput['continuationEndAction'])} options={[['buy', 'Buy the car'], ['return', 'Return the car']]} />
          {number('continuationEndCost', 'All-in continued lease end settlement (₹)', 'Buyout price or return charges, matching the choice above.')}
        </Grid></div>}
      </Step>
      <Note>Changing the exit month changes the timing in this model. Obtain new buyout, return and continuation quotes for that month; the amounts do not update automatically.</Note>
      <UpdatePlan dirty={f.dirty} label="Compare car lease exit options" />
    </form>
    <div ref={f.resultsRef} tabIndex={-1} className="space-y-6 outline-none" aria-label="Estimated results">
      <Errors errors={r.errors} />
      {!r.errors.length && <>
        <section className={panel}><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">The cash needed when you leave</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Buying out needs {money(r.buyoutCashNeeded)} {input.exitMonth === 0 ? 'now' : `at the end of month ${input.exitMonth}`}</h2>
          <p className={`mt-3 ${muted}`}>{input.finance === 'loan' ? `Plus a ${money(r.buyoutLoanEmi)} monthly loan EMI from the following month, before running costs.` : 'This pays the entered buyout quote in cash.'} Compare the other options and the reserve below before using the result.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Current net car cost / month" value={money(r.netLeaseMonthly)} /><Stat label="Return settlement at exit" value={money(input.exitReturnSettlement)} /><Stat label="Comparison horizon" value={`${input.remainingMonths} months`} detail="All options end on the same date." /></div>
        </section>
        <DataTable caption="Same-date car lease cost comparison" headers={['Option', 'Future cash paid', 'Loan debt at end', 'Car value at end', 'Net economic cost']} rows={r.options.map(o => [o.name, money(o.totalPaid), money(o.terminalDebt), money(o.terminalAsset), money(o.adjustedCost)])} />
        <p className={muted}>Net economic cost = future cash paid + remaining loan debt − retained car value. The car value is not added to cash, and no sale is assumed. Job income changes and investment returns are excluded.</p>
        <ComparisonBars title="Future car cost after allowing for debt and ownership" items={r.options.map(o => ({ name: o.name, value: o.adjustedCost }))} />
        <section className={panel}><h3 className="text-xl font-bold text-slate-900 dark:text-white">{r.bestFit ? `${r.bestFit.name} has the lowest modelled cost while preserving your reserve` : 'No entered option preserves your reserve throughout'}</h3>
          <p className={`mt-3 ${muted}`}>This compares car arrangements under your assumptions. A job move may change income and benefits that are outside this calculation.</p>
          <div className="mt-4"><DataTable caption="Cash reserve check for each lease option" headers={['Option', 'Lowest available cash', 'Extra cash to preserve reserve', 'Cash at comparison end']} rows={r.options.map(o => [o.name, money(o.lowestCash), money(o.reserveShortfall), money(o.closingCash)])} /></div>
        </section>
        <CashTrace title="Will your available cash stay above the protected reserve?" labels={r.options[0].rows.map(row => row.month ? `Month ${row.month}` : 'Today')} series={r.options.map(o => ({ name: o.name, values: o.rows.map(row => row.cash) }))} reserve={input.reserve} />
        <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">Inspect every month and the remaining loan</summary><div className="mt-4 space-y-5">{r.options.map(o => <DataTable key={o.id} caption={`${o.name}: monthly car cash flows`} headers={['Month', 'Car costs', 'Settlement', 'Loan EMI', 'Available cash', 'Loan debt']} rows={o.rows.map(row => [row.month, money(row.recurring), money(row.settlement), money(row.loanPayment), money(row.cash), money(row.debt)])} />)}</div></details>
        <PlanDownloads report={carLeaseReport(input, r)} disabled={f.dirty} />
        <MethodDetails assumptions={LEASE_ASSUMPTIONS} />
      </>}
    </div>
  </div>;
}
