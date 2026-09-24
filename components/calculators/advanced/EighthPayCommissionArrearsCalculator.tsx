'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateEighthPayCommissionArrears } from '@/lib/calculators/search-growth';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const YEARS = Array.from({ length: 8 }, (_, index) => 2025 + index);

function MonthYearFields({
  prefix,
  label,
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  prefix: string;
  label: string;
  month: number;
  year: number;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
}) {
  const selectClass = 'mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10';

  return (
    <fieldset className="rounded-2xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-bold text-slate-800">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor={`${prefix}-month`} className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Month</span>
          <select id={`${prefix}-month`} value={month} onChange={(event) => onMonthChange(Number(event.target.value))} className={selectClass}>
            {MONTHS.map((monthLabel, index) => <option key={monthLabel} value={index + 1}>{monthLabel}</option>)}
          </select>
        </label>
        <label htmlFor={`${prefix}-year`} className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Year</span>
          <select id={`${prefix}-year`} value={year} onChange={(event) => onYearChange(Number(event.target.value))} className={selectClass}>
            {YEARS.map((yearOption) => <option key={yearOption} value={yearOption}>{yearOption}</option>)}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

export default function EighthPayCommissionArrearsCalculator({ tool }: { tool: Tool }) {
  const [currentBasic, setCurrentBasic] = useState<NumericValue>(44_900);
  const [projectedBasic, setProjectedBasic] = useState<NumericValue>(115_393);
  const [currentDa, setCurrentDa] = useState<NumericValue>(26_940);
  const [projectedDa, setProjectedDa] = useState<NumericValue>(0);
  const [currentHra, setCurrentHra] = useState<NumericValue>(13_470);
  const [projectedHra, setProjectedHra] = useState<NumericValue>(34_618);
  const [currentOtherPay, setCurrentOtherPay] = useState<NumericValue>(3_600);
  const [projectedOtherPay, setProjectedOtherPay] = useState<NumericValue>(3_600);
  const [effectiveMonth, setEffectiveMonth] = useState(1);
  const [effectiveYear, setEffectiveYear] = useState(2026);
  const [paymentMonth, setPaymentMonth] = useState(1);
  const [paymentYear, setPaymentYear] = useState(2027);
  const [oneTimeDeductions, setOneTimeDeductions] = useState<NumericValue>(0);

  const result = useMemo(() => calculateEighthPayCommissionArrears({
    currentBasic: numeric(currentBasic),
    projectedBasic: numeric(projectedBasic),
    currentDa: numeric(currentDa),
    projectedDa: numeric(projectedDa),
    currentHra: numeric(currentHra),
    projectedHra: numeric(projectedHra),
    currentOtherPay: numeric(currentOtherPay),
    projectedOtherPay: numeric(projectedOtherPay),
    effectiveMonth,
    effectiveYear,
    paymentMonth,
    paymentYear,
    oneTimeDeductions: numeric(oneTimeDeductions),
  }), [
    currentBasic,
    projectedBasic,
    currentDa,
    projectedDa,
    currentHra,
    projectedHra,
    currentOtherPay,
    projectedOtherPay,
    effectiveMonth,
    effectiveYear,
    paymentMonth,
    paymentYear,
    oneTimeDeductions,
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">Unofficial arrears scenario — no arrears have been notified</p>
        <p className="mt-1">
          Enter every date and pay component yourself. The 8th CPC has not notified an implementation date, payment date, arrears period, pay matrix, HRA rule or pension method.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <section>
            <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Monthly eligible pay</p>
            <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">Enter current and projected components</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Use monthly rupee amounts. Include only components that an eventual order says are eligible for the same arrears period.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <NumericField id="arrears-current-basic" label="Current basic pay" unit="₹ / month" value={currentBasic} onChange={setCurrentBasic} step={100} />
              <NumericField id="arrears-projected-basic" label="Projected basic scenario" unit="₹ / month" value={projectedBasic} onChange={setProjectedBasic} step={100} />
              <NumericField id="arrears-current-da" label="Current DA amount" unit="₹ / month" value={currentDa} onChange={setCurrentDa} step={100} />
              <NumericField id="arrears-projected-da" label="Projected DA scenario" unit="₹ / month" value={projectedDa} onChange={setProjectedDa} step={100} help="Keep 0 unless you deliberately want to model a future DA amount." />
              <NumericField id="arrears-current-hra" label="Current HRA amount" unit="₹ / month" value={currentHra} onChange={setCurrentHra} step={100} />
              <NumericField id="arrears-projected-hra" label="Projected HRA scenario" unit="₹ / month" value={projectedHra} onChange={setProjectedHra} step={100} />
              <NumericField id="arrears-current-other" label="Other current eligible pay" unit="₹ / month" value={currentOtherPay} onChange={setCurrentOtherPay} step={100} help="For example, TA only if the eventual order makes it eligible." />
              <NumericField id="arrears-projected-other" label="Other projected eligible pay" unit="₹ / month" value={projectedOtherPay} onChange={setProjectedOtherPay} step={100} />
            </div>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Scenario period</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <MonthYearFields prefix="arrears-effective" label="Assumed effective month" month={effectiveMonth} year={effectiveYear} onMonthChange={setEffectiveMonth} onYearChange={setEffectiveYear} />
              <MonthYearFields prefix="arrears-payment" label="Assumed payment month" month={paymentMonth} year={paymentYear} onMonthChange={setPaymentMonth} onYearChange={setPaymentYear} />
            </div>
            <div className="mt-4">
              <NumericField id="arrears-deductions" label="Entered one-time deductions" unit="₹" value={oneTimeDeductions} onChange={setOneTimeDeductions} step={1_000} help="Optional planning adjustment. Tax, NPS, CGHS and recovery rules are not estimated automatically." />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Illustrative result</p>
            <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">Arrears scenario</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ResultCard label="Gross arrears scenario" value={formatCurrency(result.grossArrearsScenario)} detail={`${result.arrearsMonths} accrued months × ${formatCurrency(result.monthlyDifference)}`} emphasis />
              <ResultCard label="After entered deductions" value={formatCurrency(result.afterDeductionsScenario)} detail={`Less ${formatCurrency(result.oneTimeDeductions)} entered deductions`} />
              <ResultCard label="Current eligible pay" value={formatCurrency(result.currentEligibleMonthlyPay)} detail="Monthly components entered in the current column" />
              <ResultCard label="Projected eligible pay" value={formatCurrency(result.projectedEligibleMonthlyPay)} detail="Monthly components entered in the projected column" />
              <ResultCard label="Monthly difference" value={formatCurrency(result.monthlyDifference)} detail="Negative differences are floored at zero" />
              <ResultCard label="Accrued months" value={`${result.arrearsMonths}`} detail="From effective month up to, but excluding, payment month" />
            </div>
          </section>

          {result.arrearsMonths === 0 ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950">
              The payment month must be later than the effective month to create an accrued period.
            </p>
          ) : null}
          {result.projectedEligibleMonthlyPay <= result.currentEligibleMonthlyPay ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Projected eligible monthly pay is not above current eligible pay, so this scenario produces no positive arrears difference.
            </p>
          ) : null}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            Formula: positive monthly eligible-pay difference × elapsed months. The selected payment month is excluded because it is treated as the month in which revised pay begins. Change the dates if an eventual order uses a different convention.
          </div>
        </div>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
