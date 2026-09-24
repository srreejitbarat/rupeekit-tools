'use client';

import { calculateNoCost, NO_COST_EXAMPLE, type NoCostInput } from '@/lib/micro-tools/no-cost-emi';
import { EMI_ASSUMPTIONS, noCostReport } from '@/lib/micro-tools/reports';
import { money } from '@/lib/planning/common';
import PlanningGuide from '@/components/planning/PlanningGuide';
import PlanDownloads from '@/components/planning/PlanDownloads';
import { DataTable, Errors, Field, Grid, muted, Note, numeric, panel, secondary, Select, Stat, Step, UpdatePlan, usePlanForm } from '@/components/planning/PlanningFields';
import { CashTrace, ComparisonBars, DecisionIntro, MethodDetails } from './DecisionUi';

export default function NoCostEmiCalculator() {
  const f = usePlanForm(NO_COST_EXAMPLE, calculateNoCost);
  const d = f.draft, r = f.result, input = f.committed;
  const number = (key: keyof NoCostInput, label: string, hint?: string, max?: number, min = 0, step: number | 'any' = 'any') => <Field label={label} value={d[key] as number} onChange={v => f.set(key, numeric(v))} hint={hint} min={min} max={max} step={step} />;
  return <div className="space-y-6">
    <DecisionIntro question="Is the EMI offer cheaper than paying upfront?" text="See the full purchase cost, then ask a second question: what happens to your money if you return the item? The example includes a partial return; replace it with your issuer’s quote." />
    <PlanningGuide name="no-cost-emi" steps={[
      { title: 'Start with the two purchase prices', text: 'Enter the EMI purchase price and any extra discount for paying upfront. Choose the full upfront interest subsidy or copy the financed principal from the issuer.' },
      { title: 'Add the charges outside the EMI', text: 'Enter processing fees, the tax charged on interest and fees, and any separate cashback. Example rates are editable; check your statement.' },
      { title: 'Test a return or early closure', text: 'Choose a month after its EMI has been paid. Enter the actual merchant refund and cashback you keep. A refund does not necessarily close the EMI loan.' },
      { title: 'Compare cash, then save the details', text: 'The purchase comparison and return comparison answer different questions. Check the gross settlement needed before a refund arrives, then download your inputs and schedule.' },
    ]} />
    <div className="flex flex-wrap gap-2" role="group" aria-label="Example EMI scenarios">
      <button className={secondary} type="button" onClick={() => f.commit(NO_COST_EXAMPLE)}>₹60,000 purchase + partial return</button>
      <button className={secondary} type="button" onClick={() => f.commit({ ...NO_COST_EXAMPLE, refundMonth: 0, merchantRefund: 57_400 })}>Return before the first EMI</button>
      <button className={secondary} type="button" onClick={() => f.commit({ ...NO_COST_EXAMPLE, principalMode: 'quoted', quotedPrincipal: 60_000, cashback: 2600, retainedCashback: 0 })}>Quoted loan + delayed cashback</button>
    </div>
    <form onSubmit={f.submit} noValidate className="space-y-5">
      <Step number={1} title="The purchase and the EMI quote" description="Use the purchase price before the EMI interest subsidy. Ordinary seller discounts should already be included.">
        <Grid>{number('price', 'EMI purchase price (₹)', undefined, 10_000_000, 1)}{number('cashDiscount', 'Extra discount for paying upfront (₹)', 'This reduces the cash-payment alternative only.', d.price)}{number('downPayment', 'Down payment for EMI (₹)', undefined, d.price - 1)}
          {number('annualRate', 'Annual card interest rate (%)', 'The underlying interest rate, even when the seller subsidises it.', 60)}{number('months', 'Number of monthly EMIs', undefined, 60, 1, 1)}
          <Select label="How is the loan principal set?" value={d.principalMode} onChange={v => f.set('principalMode', v as NoCostInput['principalMode'])} options={[['upfront', 'Full interest discount upfront'], ['quoted', 'Use actual financed principal']]} />
          {d.principalMode === 'quoted' && number('quotedPrincipal', 'Actual financed principal (₹)', 'Copy the loan principal, not the total of all EMIs.', d.price - d.downPayment, 1)}
        </Grid>
      </Step>
      <Step number={2} title="Fees, taxes and separate cashback">
        <Grid>{number('processingFee', 'Processing fee before tax (₹)')}{number('interestTaxRate', 'Tax charged on interest (%)', 'Editable credit-card EMI assumption; use your issuer’s treatment.', 50)}{number('feeTaxRate', 'Tax charged on fees (%)', undefined, 50)}
          {number('cashback', 'Separate cashback if you keep the item (₹)', 'Exclude the upfront interest subsidy.', d.price)}{number('cashbackMonth', 'Cashback paid in month', 'Count from 1. Keep a valid month even when cashback is zero.', d.months, 1, 1)}
        </Grid>
      </Step>
      <Step number={3} title="What if you return the item?" description="Both paths below use the same refund. One keeps the EMI schedule; the other closes the entire loan. Enter 0 refund to test early closure alone.">
        <Grid>{number('refundMonth', 'Return / close after month', 'After that month’s EMI. 0 means before the first EMI.', d.months, 0, 1)}{number('merchantRefund', 'Merchant refund before cashback reversal (₹)', 'Use the actual usable credit promised by the seller or issuer.', d.price)}
          {number('retainedCashback', 'Cashback you keep after the return (₹)', 'The remaining cashback is reversed or never paid.', d.cashback)}{number('feeRefund', 'Confirmed processing fee refund incl. tax (₹)', 'Leave 0 unless the issuer confirms a refund.', d.processingFee * (1 + d.feeTaxRate / 100))}
          {number('closurePercent', 'Closure fee on outstanding principal (%)', 'Applies only when closing with debt still outstanding.', 25)}{number('closureFixedFee', 'Extra fixed closure charge before tax (₹)')}
        </Grid>
      </Step>
      <UpdatePlan dirty={f.dirty} label="Compare purchase and return costs" />
    </form>
    <div ref={f.resultsRef} tabIndex={-1} className="space-y-6 outline-none" aria-label="Estimated results">
      <Errors errors={r.errors} />
      {!r.errors.length && <>
        <section className={panel}><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">If you buy and keep it</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{Math.abs(r.extraVsCash) < 0.5 ? 'Cash and EMI have the same modelled cost' : `${r.extraVsCash > 0 ? 'Paying upfront' : 'The EMI route'} costs ${money(Math.abs(r.extraVsCash))} less`}</h2>
          <p className={`mt-3 ${muted}`}>Includes the entered discount, processing fee, tax and cashback. This comparison excludes a return and any investment return on money kept in your bank.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Pay upfront" value={money(r.cashPrice)} /><Stat label="EMI route total" value={money(r.purchaseTotal)} /><Stat label="Base EMI each month" value={money(r.emi)} detail="Tax on interest is additional and changes each month." /></div>
        </section>
        <ComparisonBars title="The price you actually pay if you keep the item" items={[{ name: 'Pay upfront', value: r.cashPrice }, { name: 'EMI route including costs', value: r.purchaseTotal }]} />
        <DataTable caption="Purchase cost breakdown" headers={['Component', 'Amount']} rows={[
          ['Financed principal', money(r.principal)], ['Upfront principal discount', money(r.subsidy)], ['Interest within the base EMIs', money(r.totalInterest)],
          ['Tax on interest', money(r.totalInterestTax)], ['Processing fee including tax', money(r.feesWithTax)], ['Separate cashback', money(input.cashback)],
          ['Effective annualised cost versus paying cash', r.annualisedCost === null ? 'Not shown for these cash flows' : `${r.annualisedCost.toFixed(2)}%`],
        ]} />
        <p className={muted}>The annualised figure includes the cash discount you give up and is not the lender’s disclosed APR. It is omitted when cashback creates mixed-sign payments or the initial financed benefit is not positive.</p>
        <section className={panel}><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">If you return or close after month {input.refundMonth}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{Math.abs(r.closeSaving) < 0.5 ? 'Keeping and closing EMI have the same net outflow' : `${r.closeSaving > 0 ? 'Closing EMI' : 'Keeping the EMI schedule'} has ${money(Math.abs(r.closeSaving))} less net outflow`}</h2>
          <p className={`mt-3 ${muted}`}>Both paths include the same {money(input.merchantRefund)} merchant refund and {money(input.retainedCashback)} retained cashback. Remaining goods are not valued.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Keep EMI: net outflow" value={money(r.keepTotal)} /><Stat label="Close EMI: net outflow" value={money(r.closeTotal)} /><Stat label="Gross loan settlement" value={money(r.settlementCash)} detail="May be needed before the merchant refund arrives." /></div>
        </section>
        <Note>A refund is not automatic EMI cancellation. Confirm how the issuer applies the credit and whether a separate closure request is required. The model assumes the refund is usable in the selected month.</Note>
        <CashTrace title="Cumulative net cash paid after the same return" labels={r.rows.map(row => row.month ? `Month ${row.month}` : 'Checkout')} series={[{ name: 'Keep EMI', values: r.rows.map(row => row.keepTotal) }, { name: 'Close EMI', values: r.rows.map(row => row.closeTotal) }]} />
        <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">Every EMI, tax charge and return cash flow</summary><div className="mt-4"><DataTable caption="Monthly EMI and return cash flows" headers={['Month', 'Base EMI', 'Interest tax', 'Keep: net paid', 'Close: net paid', 'Scheduled debt']} rows={r.rows.map(row => [row.month === 0 ? 'Checkout' : row.month, money(row.payment), money(row.interestTax), money(row.keepCash), money(row.closeCash), money(row.balance)])} /></div></details>
        <PlanDownloads report={noCostReport(input, r)} disabled={f.dirty} />
        <MethodDetails assumptions={EMI_ASSUMPTIONS} />
      </>}
    </div>
  </div>;
}
