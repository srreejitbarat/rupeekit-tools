'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateSsyProjection } from '@/lib/calculators/search-growth';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function SsyCalculatorV2({ tool }: { tool: Tool }) {
  const [girlAgeAtOpening, setGirlAgeAtOpening] = useState<NumericValue>(5);
  const [accountAgeYears, setAccountAgeYears] = useState<NumericValue>(0);
  const [currentBalance, setCurrentBalance] = useState<NumericValue>(0);
  const [annualDeposit, setAnnualDeposit] = useState<NumericValue>(50_000);
  const [annualInterestRate, setAnnualInterestRate] = useState<NumericValue>(8.2);

  const result = useMemo(() => calculateSsyProjection({
    girlAgeAtOpening: numeric(girlAgeAtOpening),
    accountAgeYears: numeric(accountAgeYears),
    currentBalance: numeric(currentBalance),
    annualDeposit: numeric(annualDeposit),
    annualInterestRate: numeric(annualInterestRate),
  }), [girlAgeAtOpening, accountAgeYears, currentBalance, annualDeposit, annualInterestRate]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
        <p className="font-bold">Term follows account opening date, not the child&apos;s 21st birthday</p>
        <p className="mt-1">Deposits are permitted for 15 years from account opening and the account matures after 21 years from opening. Child age is used only to check opening eligibility.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-brandDeepNavy">Account timeline and deposit plan</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumericField id="ssy-opening-age" label="Girl's age when account opened" unit="completed years" value={girlAgeAtOpening} onChange={setGirlAgeAtOpening} min={0} max={18} step={1} help="The account can be opened only before she attains age 10." />
            <NumericField id="ssy-account-age" label="Account age today" unit="years since opening" value={accountAgeYears} onChange={setAccountAgeYears} min={0} max={21} step={1} help="Use 0 for a new account. The remaining term is calculated from this value." />
            <NumericField id="ssy-current-balance" label="Current account balance" unit="₹" value={currentBalance} onChange={setCurrentBalance} step={1_000} help="For an existing account, use the latest passbook balance." />
            <NumericField id="ssy-annual-deposit" label="Planned annual deposit" unit="₹ / year" value={annualDeposit} onChange={setAnnualDeposit} min={250} max={150_000} step={250} />
            <NumericField id="ssy-interest-rate" label="Projection interest rate" unit="% p.a." value={annualInterestRate} onChange={setAnnualInterestRate} min={0} max={20} step={0.1} help="Defaults to 8.2%, the official rate shown for Jul-Sep 2026. Future quarterly rates can change." />
          </div>
          {!result.eligibleOpeningAge ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950">The entered opening age is not eligible: an SSY account must be opened before the girl attains age 10.</p> : null}
          {numeric(accountAgeYears) > 0 && numeric(currentBalance) === 0 ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">For an existing account, add the current balance. Without it, the result includes only future deposits and understates maturity.</p> : null}
        </div>

        <div className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-brandDeepNavy">Projected maturity from today</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard label="Projected maturity amount" value={formatCurrency(result.projectedMaturityAmount)} detail={`Constant ${formatNumber(numeric(annualInterestRate), 1)}% planning assumption`} emphasis />
            <ResultCard label="Future deposits" value={formatCurrency(result.futureDeposits)} detail={`${result.remainingDepositYears} deposit years remaining`} />
            <ResultCard label="Projected interest from today" value={formatCurrency(result.projectedInterestFromToday)} detail="Maturity minus today's balance and future deposits" />
            <ResultCard label="Time remaining" value={`${result.yearsToMaturity} years`} detail="Until 21 years from account opening" />
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            The projection assumes one deposit at the beginning of each remaining scheme year and a constant annual rate. Actual SSY interest is government-notified and can change quarterly, so this is not a guaranteed maturity value.
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Opening eligibility</p><p className="mt-2 font-bold text-brandDeepNavy">Before age 10</p><p className="mt-1 text-xs leading-5 text-slate-500">Age validates whether a new account could be opened; it does not shorten the 21-year account term.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Deposit window</p><p className="mt-2 font-bold text-brandDeepNavy">15 years from opening</p><p className="mt-1 text-xs leading-5 text-slate-500">After that, the balance can continue earning applicable scheme interest until maturity.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tax note</p><p className="mt-2 font-bold text-brandDeepNavy">80C where applicable</p><p className="mt-1 text-xs leading-5 text-slate-500">A contribution may qualify within the overall Section 80C limit under the applicable tax regime. No automatic tax saving is claimed here.</p></div>
      </section>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
