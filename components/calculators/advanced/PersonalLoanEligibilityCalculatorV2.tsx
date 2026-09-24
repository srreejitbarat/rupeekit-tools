'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculatePersonalLoanEligibility } from '@/lib/calculators/search-growth';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

const TENURE_SCENARIOS = [36, 48, 60];

export default function PersonalLoanEligibilityCalculatorV2({ tool }: { tool: Tool }) {
  const [monthlyIncome, setMonthlyIncome] = useState<NumericValue>(75_000);
  const [existingMonthlyEmi, setExistingMonthlyEmi] = useState<NumericValue>(10_000);
  const [foirPercent, setFoirPercent] = useState<NumericValue>(50);
  const [annualRate, setAnnualRate] = useState<NumericValue>(14);
  const [tenureMonths, setTenureMonths] = useState<NumericValue>(48);

  const inputs = useMemo(() => ({
    monthlyIncome: numeric(monthlyIncome),
    existingMonthlyEmi: numeric(existingMonthlyEmi),
    foirPercent: numeric(foirPercent),
    annualRate: numeric(annualRate),
    tenureMonths: numeric(tenureMonths),
  }), [monthlyIncome, existingMonthlyEmi, foirPercent, annualRate, tenureMonths]);
  const result = useMemo(() => calculatePersonalLoanEligibility(inputs), [inputs]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
        <p className="font-bold">Instant estimate — no phone number, lead form or bureau lookup</p>
        <p className="mt-1">The calculation runs in your browser. It estimates repayment capacity only; it is not pre-approval, sanction or a guaranteed rate.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Quick check</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">Income and existing obligations</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumericField id="eligibility-income" label="Net monthly income" unit="₹ / month" value={monthlyIncome} onChange={setMonthlyIncome} step={1_000} help="Use take-home income after tax and payroll deductions, not CTC." />
            <NumericField id="eligibility-existing-emi" label="All existing fixed obligations" unit="₹ / month" value={existingMonthlyEmi} onChange={setExistingMonthlyEmi} step={500} help="Include loan EMIs, card EMIs and other fixed credit obligations." />
          </div>

          <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4" open>
            <summary className="cursor-pointer text-sm font-bold text-brandDeepNavy">Advanced lender assumptions</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumericField id="eligibility-foir" label="FOIR cap" unit="% of net income" value={foirPercent} onChange={setFoirPercent} min={10} max={70} step={1} help="A planning assumption, not a universal lender rule." />
              <NumericField id="eligibility-rate" label="Expected reducing-balance rate" unit="% p.a." value={annualRate} onChange={setAnnualRate} max={60} step={0.1} />
              <NumericField id="eligibility-tenure" label="Expected tenure" unit="months" value={tenureMonths} onChange={setTenureMonths} min={1} max={120} step={1} />
            </div>
          </details>
        </div>

        <div className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-brandDeepNavy">Estimated capacity</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard label="Maximum affordable new EMI" value={formatCurrency(result.maxAffordableEmi)} detail={`Total EMI cap: ${formatCurrency(result.totalEmiCap)}`} />
            <ResultCard label="Estimated eligible loan" value={formatCurrency(result.eligibleLoanAmount)} detail={`${formatNumber(numeric(annualRate), 1)}% for ${Math.round(numeric(tenureMonths)) || 1} months`} emphasis />
            <ResultCard label="Total repayment" value={formatCurrency(result.totalRepayment)} detail="If the full calculated capacity were borrowed" />
            <ResultCard label="Estimated total interest" value={formatCurrency(result.totalInterest)} detail="Excludes processing fee, GST, insurance and penalties" />
          </div>
          {!result.hasAvailableCapacity ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Existing obligations already meet or exceed the selected FOIR cap, so this model shows no available EMI capacity.</p> : null}
          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">Approval also depends on the lender&apos;s minimum income, age, employer category, city, credit report, repayment history, documents and internal policy. Do not treat this number as sanctioned credit.</p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-brandDeepNavy">Tenure sensitivity</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">The same EMI capacity can support a larger principal over a longer tenure, but the total interest rises.</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Tenure</th><th className="px-4 py-3 text-right">Estimated eligibility</th><th className="px-4 py-3 text-right">Total interest</th></tr></thead><tbody className="divide-y divide-slate-100">{TENURE_SCENARIOS.map((tenure) => { const scenario = calculatePersonalLoanEligibility({ ...inputs, tenureMonths: tenure }); return <tr key={tenure}><td className="px-4 py-3 font-semibold">{tenure} months</td><td className="px-4 py-3 text-right">{formatCurrency(scenario.eligibleLoanAmount)}</td><td className="px-4 py-3 text-right">{formatCurrency(scenario.totalInterest)}</td></tr>; })}</tbody></table>
        </div>
      </section>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
