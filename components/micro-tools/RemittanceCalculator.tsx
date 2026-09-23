'use client';

import { calculateRemittance, REMITTANCE_EXAMPLE, type RemittanceRoute } from '@/lib/micro-tools/remittance';
import { foreign, REMITTANCE_ASSUMPTIONS, remittanceReport } from '@/lib/micro-tools/reports';
import { money } from '@/lib/planning/common';
import PlanningGuide from '@/components/planning/PlanningGuide';
import PlanDownloads from '@/components/planning/PlanDownloads';
import { Check, DataTable, Errors, Field, Grid, muted, Note, numeric, panel, secondary, Select, Stat, Step, UpdatePlan, usePlanForm } from '@/components/planning/PlanningFields';
import { ComparisonBars, DecisionIntro, MethodDetails } from './DecisionUi';

export default function RemittanceCalculator() {
  const f = usePlanForm(REMITTANCE_EXAMPLE, calculateRemittance);
  const d = f.draft, r = f.result, input = f.committed;
  function routeSet(index: number, key: keyof RemittanceRoute, value: number | string) {
    f.setDraft(current => ({ ...current, routes: current.routes.map((route, i) => i === index ? { ...route, [key]: value } : route) as typeof current.routes }));
  }
  return <div className="space-y-6">
    <DecisionIntro question="Your invoice says one amount. Your bank shows another." text="Trace every entered fee and the exchange-rate difference, compare two quotes, then work backwards from the INR you want to receive. Example rates below are fictional planning inputs, not live prices." />
    <PlanningGuide name="remittance-fees" steps={[
      { title: 'Use one invoice and one quote date', text: 'Choose the invoice currency, amount and reference INR exchange rate. Compare quotes from the same date and payment route.' },
      { title: 'Separate foreign and rupee charges', text: 'Foreign fees are deducted before conversion. Bank, certificate and additional tax charges are entered in rupees. Do not count a tax-inclusive fee twice.' },
      { title: 'Reconcile the actual bank credit', text: 'Optionally enter the INR received through route 1. A remaining difference may be timing or a missing charge; it is not proof that anyone overcharged you.' },
      { title: 'Compare quotes and price your next invoice', text: 'Review net INR, the all-in rate, payment splitting and the invoice needed for a target receipt. Download the assumptions and ask the provider for a fresh quote.' },
    ]} />
    <div className="flex flex-wrap gap-2" role="group" aria-label="Example payment scenarios">
      <button className={secondary} type="button" onClick={() => f.commit(REMITTANCE_EXAMPLE)}>USD 2,000 invoice audit</button>
      <button className={secondary} type="button" onClick={() => f.commit({ ...REMITTANCE_EXAMPLE, invoice: 500, auditActual: false, targetInr: 45_000 })}>Small invoice, same fixed fees</button>
    </div>
    <form onSubmit={f.submit} noValidate className="space-y-5">
      <Step number={1} title="Your invoice and comparison basis">
        <Grid><Select label="Invoice currency" value={d.currency} onChange={v => f.set('currency', v)} options={['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD'].map(c => [c, c])} hint="Changing currency keeps the numeric inputs. Replace rates and fees with a quote in that currency." />
          <Field label={`Gross invoice (${d.currency})`} value={d.invoice} onChange={v => f.set('invoice', numeric(v))} min={0.01} />
          <Field label="Quote / statement date" type="date" value={d.quoteDate} onChange={v => f.set('quoteDate', v)} />
          <Field label={`Reference INR per 1 ${d.currency}`} value={d.referenceRate} onChange={v => f.set('referenceRate', numeric(v))} min={0.0001} hint="Use a rate from the same quote time. No live exchange rate is fetched." />
          <Field label="Target net bank receipt (₹)" value={d.targetInr} onChange={v => f.set('targetInr', numeric(v))} min={1} />
          <Field label="Similar invoices per year" value={d.transfersPerYear} onChange={v => f.set('transfersPerYear', numeric(v))} min={1} max={365} step={1} />
        </Grid>
      </Step>
      <Step number={2} title="Two payment quotes" description="These are your own routes, not provider rankings. All percentage charges apply to the gross invoice in this model.">
        <div className="grid gap-5 lg:grid-cols-2">{d.routes.map((route, index) => {
          const n = (key: keyof RemittanceRoute, label: string, hint?: string, max?: number, min = 0) => <Field label={`Route ${index + 1}: ${label}`} value={route[key] as number} onChange={v => routeSet(index, key, numeric(v))} hint={hint} max={max} min={min} />;
          return <fieldset key={index} className="min-w-0 space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><legend className="px-2 font-bold text-slate-900 dark:text-white">Route {index + 1}</legend>
            <Field label={`Route ${index + 1}: name`} value={route.name} type="text" onChange={v => routeSet(index, 'name', v)} />
            {n('conversionRate', `conversion INR per 1 ${d.currency}`, 'Actual quote after any FX markup. Do not subtract the spread again.', 1_000_000, 0.0001)}
            {n('percentageFee', 'fee on gross invoice (%)', undefined, 50)}
            {n('fixedForeign', `fixed platform fee (${d.currency})`)}
            {n('intermediaryForeign', `intermediary deductions (${d.currency})`, 'Deducted before conversion, in the invoice currency.')}
            <details className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><summary className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-100">Local fees, certificates and tax</summary><div className="mt-4 space-y-4">
              {n('bankFee', 'local bank fee (₹)')}{n('certificateFee', 'certificate / service fee (₹)')}{n('taxAmount', 'additional tax charged (₹)', 'Copy the quoted amount. Use 0 if already included in the other fees.')}
            </div></details>
          </fieldset>;
        })}</div>
      </Step>
      <Step number={3} title="Audit the receipt and test payment splitting">
        <Check label="I have the actual bank credit for route 1" checked={d.auditActual} onChange={v => f.set('auditActual', v)} />
        <Grid>{d.auditActual && <Field label="Actual bank credit for route 1 (₹)" value={d.actualReceived} onChange={v => f.set('actualReceived', numeric(v))} />}
          <Field label="Split the same invoice into this many payments" value={d.splitCount} onChange={v => f.set('splitCount', numeric(v))} min={1} max={52} step={1} hint="Each split repeats the entered fixed fees and INR tax. Actual smaller-payment quotes may differ." />
        </Grid>
      </Step>
      <UpdatePlan dirty={f.dirty} label="Audit and compare payment routes" />
    </form>
    <div ref={f.resultsRef} tabIndex={-1} className="space-y-6 outline-none" aria-label="Estimated results">
      <Errors errors={r.errors} />
      {!r.errors.length && <>
        <section className={panel}><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">Same invoice, different receipt</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{Math.abs(r.difference) < 0.5 ? 'Both quotes deliver the same modelled INR' : `${r.routes[r.difference > 0 ? 1 : 0].name} delivers ${money(Math.abs(r.difference))} more`}</h2>
          <p className={`mt-3 ${muted}`}>For {foreign(input.invoice, input.currency)}, using quotes entered for {input.quoteDate}. This is a comparison of the entered terms, not a live provider recommendation.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Gross reference value" value={money(r.referenceValue)} />{r.routes.map(route => <Stat key={route.name} label={`${route.name}: net INR`} value={money(route.net)} detail={`All-in rate: ${route.effectiveRate.toFixed(4)} INR per ${input.currency}`} />)}</div>
        </section>
        <ComparisonBars title="How much reaches your bank under each quote?" items={r.routes.map(route => ({ name: route.name, value: route.net }))} />
        <DataTable caption="Where the invoice-to-bank difference comes from" headers={['Reconciliation (INR)', ...r.routes.map(route => route.name)]} rows={[
          ['Gross invoice at reference rate', ...r.routes.map(route => money(route.referenceValue))],
          ['Less foreign fees, valued at reference rate', ...r.routes.map(route => money(route.foreignFeesInr))],
          ['Less FX rate difference on amount converted', ...r.routes.map(route => money(route.fxDifference))],
          ['Less local fees and additional tax', ...r.routes.map(route => money(route.localCharges))],
          ['Expected bank receipt', ...r.routes.map(route => money(route.net))],
          ['Total difference from reference', ...r.routes.map(route => `${money(route.allInCost)} (${route.costPercent.toFixed(2)}%)`)],
        ]} />
        <p className={muted}>A negative FX difference means the quoted rate is better than your reference. Foreign fees are converted at the reference rate so every line reconciles without counting the spread twice.</p>
        {input.auditActual && <section className={panel}><h3 className="text-xl font-bold text-slate-900 dark:text-white">Does route 1 match the actual bank credit?</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><Stat label="Actual bank credit" value={money(input.actualReceived)} /><Stat label={r.unexplained! >= 0 ? 'Model exceeds actual by' : 'Actual exceeds model by'} value={money(Math.abs(r.unexplained!))} /><Stat label="Actual all-in rate" value={r.actualEffectiveRate!.toFixed(4)} detail={`INR per 1 ${input.currency} invoiced, after all deductions.`} /></div>
          <p className={`mt-4 ${muted}`}>Use this difference to check the settlement date, reference rate and missing fees. It does not establish that a provider charged incorrectly.</p>
        </section>}
        <section className={panel}><h3 className="text-xl font-bold text-slate-900 dark:text-white">What should you invoice to receive {money(input.targetInr)}?</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{r.routes.map(route => <Stat key={route.name} label={route.name} value={foreign(route.targetInvoice, input.currency)} detail="Rounded up to two decimals; uses the same quote structure." />)}</div>
          <p className={`mt-4 ${muted}`}>The percentage fee scales with the invoice. Fixed fees, entered INR tax and exchange rates stay unchanged. Request a fresh quote for this amount before billing.</p>
        </section>
        <DataTable caption="Splitting the same invoice and repeating the fees" headers={['Route', 'One payment', `${input.splitCount} payments: total`, 'Extra split cost']} rows={r.routes.map(route => [route.name, money(route.net), route.splitNet === null ? 'Fees exceed split amount' : money(route.splitNet), route.splitExtraCost === null ? 'Unavailable' : money(route.splitExtraCost)])} />
        <Note>Across {input.transfersPerYear} identical invoices, the difference between the two routes would be {money(Math.abs(r.annualDifference))}. This holds today’s entered rate and charges constant; it is not an annual savings promise. Income-tax liability is outside this receipt audit.</Note>
        <PlanDownloads report={remittanceReport(input, r)} disabled={f.dirty} csvLabel="Download audit CSV" />
        <MethodDetails assumptions={REMITTANCE_ASSUMPTIONS} />
      </>}
    </div>
  </div>;
}
