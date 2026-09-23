'use client';

import { useMemo, useState } from 'react';
import { SALARY_CASH_EXAMPLE, planSalaryCash, type CashOffer, type SalaryCashInput } from '@/lib/planning/salary-cash';
import { money, monthAt, monthIndex, monthLabel } from '@/lib/planning/common';
import { SALARY_ASSUMPTIONS, salaryReport } from '@/lib/planning/reports';
import PlanningGuide from './PlanningGuide';
import PlanDownloads from './PlanDownloads';
import { Check, DataTable, Errors, Field, Grid, Note, PlanChart, Select, Stat, Step, UpdatePlan, muted, numeric, panel, secondary, usePlanForm } from './PlanningFields';

const guide = [
  { title: 'Compare the same twelve months', text: 'Choose a start month and your opening cash. Enter each option’s annual fixed CTC separately from variable pay and joining bonus. Replace the example salary history with your own.' },
  { title: 'Put payments on the calendar', text: 'Choose when bonuses arrive and whether the first regular salary is delayed. A delay means you are employed and the unpaid salary arrives as arrears, not that you are unemployed.' },
  { title: 'Include the costs of switching', text: 'Add one-off switching costs, monthly work costs and living expenses. A joining bonus may need repaying; the chart can reserve the full gross exposure separately from cash.' },
  { title: 'Compare cash and negotiate fixed pay', text: 'Update to see cash month by month and when the second option stays ahead. The target solver estimates the annual fixed CTC for your desired normal monthly in-hand, without relying on bonuses.' },
];

export default function SalaryCashPlanner() {
  const p = usePlanForm(SALARY_CASH_EXAMPLE, planSalaryCash);
  const { draft: d, committed: c, result: r } = p;
  const [selected, setSelected] = useState('offer');
  const [cashView, setCashView] = useState('cash');
  const report = useMemo(() => salaryReport(c, r), [c, r]);
  const option = r.offers.find(o => o.id === selected) ?? r.offers[0];
  const num = (key: keyof SalaryCashInput, label: string, hint?: string) => <Field label={label} value={d[key] as number} hint={hint} onChange={v => p.set(key, numeric(v))} />;
  function offerSet<K extends keyof CashOffer>(id: string, key: K, value: CashOffer[K]) { p.set('offers', d.offers.map(o => o.id === id ? { ...o, [key]: value } : o)); }
  const offerNum = (offer: CashOffer, index: number, key: keyof CashOffer, label: string, hint?: string, max?: number) => <Field label={`Option ${index + 1}: ${label}`} value={offer[key] as number} hint={hint} max={max} onChange={v => offerSet(offer.id, key, numeric(v))} />;
  const months: [string, string][] = Array.from({ length: 12 }, (_, i) => [String(i + 1), `Month ${i + 1} · ${monthLabel(monthAt(d.startMonth, i))}`]);
  return <div className="space-y-5">
    <PlanningGuide name="salary-cash" steps={guide} />
    <Note>Example salary figures and earlier-year income are loaded. Replace both before using the comparison. This model covers salary-only income for residents below 60, up to ₹50 lakh gross in each projected financial year.</Note>
    <form onSubmit={p.submit} noValidate className="space-y-5">
      <Step number={1} title="Your dates, cash and tax assumptions">
        <Grid><Field type="month" label="Comparison starts" value={d.startMonth} onChange={v => p.setDraft(current => ({ ...current, startMonth: v, ...(monthIndex(v) % 12 === 3 ? { priorGross: 0, priorTaxPaid: 0, priorPf: 0, priorProfessionalTax: 0 } : {}) }))} />
          <Select label="Tax-rule year to use" value={d.financialYear} onChange={v => p.set('financialYear', v as SalaryCashInput['financialYear'])} options={['2026-27', '2025-26', '2024-25'].map(v => [v, v])} hint="These rules are held constant even if the calendar enters another financial year." />
          <Select label="Tax regime" value={d.regime} onChange={v => p.set('regime', v as SalaryCashInput['regime'])} options={[['new', 'New regime'], ['old', 'Old regime']]} />
          {num('openingCash', 'Opening accessible cash (₹)')}{num('livingCosts', 'Monthly household costs (₹)', 'Exclude the work and switching costs entered below.')}
          {num('targetInHand', 'Target normal monthly in-hand (₹)', 'For the fixed-pay solver; before living and work costs.')}
        </Grid>
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700"><h4 className="font-bold text-slate-900 dark:text-white">Earlier in the first financial year</h4>
          <p className={`mb-4 mt-1 ${muted}`}>Totals from April through the month before this plan starts, shared by both options. Use zero for an April start. Gross salary includes any earlier taxable bonus.</p>
          <Grid>{num('priorGross', 'Earlier gross salary (₹)')}{num('priorTaxPaid', 'Earlier salary TDS paid (₹)')}{num('priorPf', 'Earlier employee PF (₹)')}{num('priorProfessionalTax', 'Earlier professional tax (₹)')}</Grid>
        </div>
        {d.regime === 'old' && <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700"><h4 className="mb-4 font-bold text-slate-900 dark:text-white">Annual eligible deductions · familiar 80C / 80D categories</h4>
          <Grid>{num('deduction80C', 'Additional eligible 80C (₹)', 'Exclude employee PF; the combined 80C amount is capped at ₹1.5 lakh.')}{num('deduction80D', 'Eligible health-insurance deduction (₹)', 'Enter the eligible amount for your circumstances.')}{num('otherOldDeductions', 'Other eligible deductions / exemptions (₹)', 'Annual eligible HRA and other deductions, excluding PF, 80C, 80D and professional tax.')}</Grid>
        </div>}
      </Step>
      <Step number={2} title="The two salary options" description="Enter annual fixed CTC without variable pay or joining bonus. Both options are modelled as employed from month 1.">
        <div className="grid gap-5 lg:grid-cols-2">{d.offers.map((offer, i) => <fieldset key={offer.id} className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><legend className="px-2 text-sm font-bold text-teal-900 dark:text-teal-200">Option {i + 1}</legend>
          <div className="space-y-4"><Field label={`Option ${i + 1}: name`} type="text" value={offer.name} onChange={v => offerSet(offer.id, 'name', v)} />
            {offerNum(offer, i, 'fixedCtc', 'annual fixed CTC (₹)', 'Remove gratuity, equity and non-cash benefits before entering.', 5_000_000)}
            <Check label={`Option ${i + 1}: employer PF is inside fixed CTC`} checked={offer.employerPfIncluded} onChange={v => offerSet(offer.id, 'employerPfIncluded', v)} />
            <details className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-100">PF and recurring deductions</summary><div className="mt-4 space-y-4">
              {offerNum(offer, i, 'basicPercent', 'basic as % of fixed CTC', undefined, 100)}{offerNum(offer, i, 'pfRate', 'PF contribution rate (%)', 'The same rate is applied to employee and employer PF.', 12)}
              <Check label={`Option ${i + 1}: apply a monthly PF wage cap`} checked={offer.capPf} onChange={v => offerSet(offer.id, 'capPf', v)} />
              {offer.capPf && offerNum(offer, i, 'monthlyPfWageCap', 'monthly PF wage cap (₹)', 'Editable payroll assumption, not an automatic statement of the statutory limit. Confirm the wage base and cap with HR.', 1_000_000)}
              {offerNum(offer, i, 'professionalTax', 'professional tax / month (₹)', 'Enter your actual state/payroll amount. No state rate is assumed.')}
              {offerNum(offer, i, 'otherDeductions', 'other payroll deductions / month (₹)')}
            </div></details>
            <details open className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-100">Bonus amounts and payment dates</summary><div className="mt-4 space-y-4">
              {offerNum(offer, i, 'variablePay', 'annual variable-pay target (₹)')}{offerNum(offer, i, 'variablePayoutPercent', 'variable payout assumption (%)', 'A scenario assumption, not a payout probability.', 100)}
              <Select label={`Option ${i + 1}: variable-pay month`} value={String(offer.variableMonth)} onChange={v => offerSet(offer.id, 'variableMonth', Number(v))} options={months} />
              {offerNum(offer, i, 'joiningBonus', 'gross joining bonus (₹)')}
              <Select label={`Option ${i + 1}: joining-bonus month`} value={String(offer.joiningMonth)} onChange={v => offerSet(offer.id, 'joiningMonth', Number(v))} options={months} />
              {offerNum(offer, i, 'clawbackMonths', 'bonus clawback period (months)', 'From starting this job in month 1, inclusive. Full gross repayment exposure; enter 0 if none.', 36)}
            </div></details>
            <details open className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-100">First salary and switching costs</summary><div className="mt-4 space-y-4">
              <Select label={`Option ${i + 1}: first salary delay`} value={String(offer.firstPayDelay)} onChange={v => offerSet(offer.id, 'firstPayDelay', Number(v))} options={[["0", 'None · paid from month 1'], ['1', '1 month · arrears in month 2'], ['2', '2 months · arrears in month 3'], ['3', '3 months · arrears in month 4']]} hint="Employed throughout; delayed salary is paid later. Bonuses keep their own dates." />
              {offerNum(offer, i, 'switchingCost', 'one-off switching costs (₹)', 'Paid in month 1: moving, notice buyout or other cash costs.')}
              {offerNum(offer, i, 'workCost', 'monthly work costs (₹)', 'For example travel, extra rent or childcare; exclude household costs above.')}
            </div></details>
          </div>
        </fieldset>)}</div>
      </Step>
      <UpdatePlan dirty={p.dirty} label="Update cash comparison" />
    </form>
    <div ref={p.resultsRef} tabIndex={-1} aria-label="Estimated results" className="space-y-5 outline-none">
      <Errors errors={r.errors} />
      {!r.errors.length && option && <>
        {p.dirty && <Note warning>These results still use the previous inputs. Update the cash comparison to refresh them.</Note>}
        <div className={panel}><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">Beyond the headline CTC</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{r.offers[1].name} ends the year with {money(Math.abs(r.cashDifference))} {r.cashDifference >= 0 ? 'more' : 'less'} cash</h3>
          <p className={`mt-3 ${muted}`}>Compared with {r.offers[0].name}, after entered taxes, deductions, living costs and switching costs. {r.offers[1].firstPositiveMonth ? `It stays ahead from ${monthLabel(monthAt(c.startMonth, r.offers[1].firstPositiveMonth - 1))} through the end of this 12-month view.` : 'It does not establish a sustained cash advantage within these 12 months.'} Joining-bonus repayment exposure is separate.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">{r.offers.map(o => <div key={o.id} className={panel}><h4 className="text-lg font-bold text-slate-900 dark:text-white">{o.name}</h4>
          <dl className="mt-4 space-y-3 text-sm text-slate-800 dark:text-slate-100">{[
            ['Normal fixed net / month', money(o.fixedMonthlyInHand)], ['Net receipts across 12 months', money(o.totalReceipts)], ['Lowest available cash', money(o.lowestCash)], ['Closing cash', money(o.closingCash)], ['Joining-bonus exposure at end', money(o.closingClawback)],
          ].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="text-right font-semibold tabular-nums">{value}</dd></div>)}</dl>
          <p className={`mt-4 ${muted}`}>{o.lowestCash < 0 ? `${money(-o.lowestCash)} more opening cash would cover the deepest projected shortage, before any clawback reserve.` : 'Cash stays non-negative in this scenario, before reserving possible bonus repayment.'}</p>
        </div>)}</div>
        <Select label="Chart cash measure" value={cashView} onChange={setCashView} options={[['cash', 'Available cash'], ['uncommitted', 'Cash after reserving gross bonus clawback']]} />
        <PlanChart title={cashView === 'cash' ? 'Available cash after each month' : 'Cash after reserving possible joining-bonus repayment'} dates={option.rows.map(row => row.date)} series={r.offers.map(o => ({ label: o.name, values: o.rows.map(row => cashView === 'cash' ? row.cash : row.uncommittedCash) }))} reference={{ label: 'zero cash', value: 0 }} />
        <DataTable caption="Twelve-month salary and cash comparison" headers={['Month', `${r.offers[0].name}: net received`, `${r.offers[1].name}: net received`, 'Option 1 cash', 'Option 2 cash']}
          rows={r.offers[0].rows.map((row, i) => [monthLabel(row.date), money(row.inHand), money(r.offers[1].rows[i].inHand), money(row.cash), money(r.offers[1].rows[i].cash)])} />
        <div className={panel}><h3 className="text-xl font-bold text-slate-900 dark:text-white">What fixed CTC reaches {money(c.targetInHand)} in hand?</h3>
          <p className={`mt-2 ${muted}`}>For a normal full year under the selected tax rules, with each option’s PF and recurring deductions. Excludes bonuses, salary delay, living costs and work costs.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{r.offers.map(o => <div key={o.id} className="space-y-3"><Stat label={`${o.name} · annual fixed CTC`} value={o.targetFixedCtc === null ? 'Above model limit' : money(o.targetFixedCtc)} detail={o.targetGrossSalary === null ? `At ₹50 lakh fixed CTC, normal net is ${money(o.maximumModelledInHand)} per month.` : `Annual gross salary: ${money(o.targetGrossSalary)}. Employer PF is inside CTC only if selected.`} />
            <button type="button" className={secondary} disabled={p.dirty || o.targetFixedCtc === null} onClick={() => { if (o.targetFixedCtc !== null) p.commit({ ...c, offers: c.offers.map(offer => offer.id === o.id ? { ...offer, fixedCtc: o.targetFixedCtc! } : offer) }); }}>Try this fixed CTC for {o.name}</button>
          </div>)}</div>
        </div>
        <Select label="Inspect one option" value={option.id} onChange={setSelected} options={r.offers.map(o => [o.id, o.name])} />
        <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">Bonus, tax and repayment-exposure detail</summary><div className="mt-4 space-y-4">
          <DataTable caption={`${option.name} receipts and bonus exposure`} headers={['Month', 'Fixed net received', 'Gross bonus', 'Bonus tax reserved', 'Clawback exposure', 'Cash after exposure']} rows={option.rows.map(row => [monthLabel(row.date), money(row.fixedCash), money(row.bonuses), money(row.bonusTax), money(row.clawback), money(row.uncommittedCash)])} />
          <p className={muted}>The full gross joining bonus remains a potential liability through the entered clawback period. Reserving it reduces uncommitted cash; no repayment is deducted unless you choose to make one outside this model.</p>
        </div></details>
        <div className={panel}><h3 className="font-bold text-slate-900 dark:text-white">Tax reconciliation · {option.name}</h3><p className={`my-3 ${muted}`}>Projected employment continues through each March for tax estimation. Every year below uses the selected {c.financialYear} rules, including future years. Actual payroll withholding can differ.</p>
          <DataTable caption={`${option.name} financial-year tax estimates`} headers={['Financial year', 'Projected gross', 'Estimated tax', 'TDS before plan', 'Unused tax credit']} rows={option.fiscalEstimates.map(f => [`${f.year}-${String(f.year + 1).slice(-2)}`, money(f.gross), money(f.tax), money(f.paidBeforePlan), money(f.unallocatedTaxCredit)])} />
          <p className={`mt-3 ${muted}`}>Unused credit is not added to your cash as a refund. Employee PF: {money(option.employeePfMonthly)} per month. Employer PF inside fixed CTC: {money(option.employerPfAnnual)} per year.</p>
        </div>
        <PlanDownloads report={report} disabled={p.dirty} />
      </>}
    </div>
    <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">How salary, tax and cash timing are modelled</summary><ul className={`mt-4 list-disc space-y-3 pl-5 ${muted}`}>{SALARY_ASSUMPTIONS.slice(0, -1).map(a => <li key={a}>{a}</li>)}</ul>
      <p className={`mt-4 ${muted}`}>Sources: <a href="https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Income Tax Department</a> and the <a href="https://www.indiabudget.gov.in/doc/memo.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Union Budget 2026 memorandum</a>. Check deduction eligibility for the chosen tax year.</p>
    </details>
  </div>;
}
