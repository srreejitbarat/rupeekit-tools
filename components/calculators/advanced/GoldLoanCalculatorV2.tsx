'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateGoldLoan } from '@/lib/calculators/search-growth';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function GoldLoanCalculatorV2({ tool }: { tool: Tool }) {
  const [netGoldWeightGrams, setNetGoldWeightGrams] = useState<NumericValue>(50);
  const [purityKarat, setPurityKarat] = useState(22);
  const [lenderReferencePrice24k, setLenderReferencePrice24k] = useState<NumericValue>('');
  const [requestedLoanAmount, setRequestedLoanAmount] = useState<NumericValue>(250_000);
  const [annualRate, setAnnualRate] = useState<NumericValue>(10);
  const [tenureMonths, setTenureMonths] = useState<NumericValue>(12);

  const result = useMemo(() => calculateGoldLoan({
    netGoldWeightGrams: numeric(netGoldWeightGrams),
    purityKarat,
    lenderReferencePrice24k: numeric(lenderReferencePrice24k),
    requestedLoanAmount: numeric(requestedLoanAmount),
    annualRate: numeric(annualRate),
    tenureMonths: numeric(tenureMonths),
  }), [netGoldWeightGrams, purityKarat, lenderReferencePrice24k, requestedLoanAmount, annualRate, tenureMonths]);

  const hasReferencePrice = numeric(lenderReferencePrice24k) > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
        <p className="font-bold">RBI 2026 consumption-loan LTV tiers applied</p>
        <p className="mt-1">Up to ₹2.5 lakh: 85%; above ₹2.5 lakh to ₹5 lakh: 80%; above ₹5 lakh: 75%. The lender still decides valuation, credit approval, charges and final sanction.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-brandDeepNavy">Gold, request and repayment assumptions</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumericField
              id="gold-net-weight"
              label="Net eligible gold weight"
              unit="grams"
              value={netGoldWeightGrams}
              onChange={setNetGoldWeightGrams}
              step={0.1}
              help="Exclude stones, gems, lac, strings, fastenings and other non-gold weight."
            />
            <label htmlFor="gold-purity" className="block">
              <span className="text-sm font-semibold text-slate-700">Actual purity</span>
              <select id="gold-purity" value={purityKarat} onChange={(event) => setPurityKarat(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-brandNavy">
                <option value={18}>18K</option><option value={20}>20K</option><option value={22}>22K</option><option value={24}>24K</option>
              </select>
              <span className="mt-1.5 block text-xs leading-5 text-slate-500">Lenders assay purity and net weight; your estimate may differ.</span>
            </label>
            <NumericField
              id="gold-reference-price"
              label="Lender reference price for 24K"
              unit="₹ / gram"
              value={lenderReferencePrice24k}
              onChange={setLenderReferencePrice24k}
              step={50}
              help="Required user input. RupeeKit does not fetch a live gold price. Use the lender's published valuation reference."
            />
            <NumericField id="gold-requested-loan" label="Total consumption loan requested" unit="₹" value={requestedLoanAmount} onChange={setRequestedLoanAmount} step={10_000} />
            <NumericField id="gold-interest-rate" label="Annual reducing-balance rate" unit="% p.a." value={annualRate} onChange={setAnnualRate} max={60} step={0.1} />
            <NumericField id="gold-tenure" label="EMI tenure" unit="months" value={tenureMonths} onChange={setTenureMonths} min={1} max={120} step={1} />
          </div>
        </div>

        <div className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-brandDeepNavy">RBI-aware estimate</h3>
          {!hasReferencePrice ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Enter the lender&apos;s 24K reference price to calculate a value. No stale or live market price is inserted automatically.</p>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard label="Assessed intrinsic gold value" value={formatCurrency(result.assessedGoldValue)} detail={`${formatNumber(purityKarat / 24 * 100, 1)}% purity adjustment; non-gold parts excluded`} />
            <ResultCard label="Maximum eligible by collateral" value={formatCurrency(result.maximumEligibleLoan)} detail="Highest amount consistent with all three RBI LTV brackets" emphasis />
            <ResultCard label="Applicable LTV for request" value={`${result.requestedAmountLtvCapPercent}%`} detail={`For a total requested amount of ${formatCurrency(numeric(requestedLoanAmount))}`} />
            <ResultCard label="Estimated EMI" value={formatCurrency(result.monthlyEmi)} detail={`On ${formatCurrency(result.estimatedFundableAmount)} for ${Math.round(numeric(tenureMonths)) || 1} months`} />
          </div>
          {hasReferencePrice ? (
            <div className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${result.requestedAmountWithinMaximum ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
              <p className="font-bold">{result.requestedAmountWithinMaximum ? 'Request is within the calculated collateral maximum' : 'Request exceeds the calculated collateral maximum'}</p>
              {!result.requestedAmountWithinMaximum ? <p className="mt-1">Estimated shortfall: {formatCurrency(result.shortfallAgainstRequest)}. A final lender valuation can change this further.</p> : null}
              <p className="mt-1">Estimated total interest on the fundable amount: {formatCurrency(result.totalInterest)}.</p>
            </div>
          ) : null}
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-brandDeepNavy">RBI maximum LTV table</h3>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Total consumption loan per borrower</th><th className="px-4 py-3 text-right">Maximum LTV</th></tr></thead><tbody className="divide-y divide-slate-100"><tr><td className="px-4 py-3">Up to and including ₹2.5 lakh</td><td className="px-4 py-3 text-right font-bold">85%</td></tr><tr><td className="px-4 py-3">Above ₹2.5 lakh and up to ₹5 lakh</td><td className="px-4 py-3 text-right font-bold">80%</td></tr><tr><td className="px-4 py-3">Above ₹5 lakh</td><td className="px-4 py-3 text-right font-bold">75%</td></tr></tbody></table>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">For bullet-repayment loans, RBI requires LTV to consider the total amount repayable at maturity. This calculator shows a reducing-balance EMI illustration, not bullet-loan eligibility.</p>
      </section>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
