'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateLabourCodeImpact } from '@/lib/calculators/labour-code';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

function ToggleField({
  id,
  label,
  checked,
  onChange,
  help,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  help?: string;
}) {
  return (
    <label htmlFor={id} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 flex-none accent-brandNavy"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-700">{label}</span>
        {help ? <span className="mt-1 block text-xs leading-5 text-slate-500">{help}</span> : null}
      </span>
    </label>
  );
}

function ComparisonRow({
  label,
  before,
  after,
  hint,
  invertTone = false,
}: {
  label: string;
  before: string;
  after: string;
  hint?: string;
  invertTone?: boolean;
}) {
  return (
    <tr className="border-t border-slate-200">
      <th scope="row" className="py-3 pr-3 text-left align-top text-sm font-semibold text-slate-700">
        {label}
        {hint ? <span className="mt-0.5 block text-xs font-normal text-slate-500">{hint}</span> : null}
      </th>
      <td className="py-3 px-3 text-right align-top text-sm font-semibold tabular-nums text-slate-600">
        {before}
      </td>
      <td
        className={`py-3 pl-3 text-right align-top text-sm font-bold tabular-nums ${
          invertTone ? 'text-emerald-700' : 'text-brandDeepNavy'
        }`}
      >
        {after}
      </td>
    </tr>
  );
}

export default function LabourCodeTakeHomeCalculator({ tool }: { tool: Tool }) {
  const [annualCtc, setAnnualCtc] = useState<NumericValue>(1_200_000);
  const [currentBasicPercent, setCurrentBasicPercent] = useState<NumericValue>(30);
  const [monthlyProfessionalTax, setMonthlyProfessionalTax] = useState<NumericValue>(200);
  const [employerPfInCtc, setEmployerPfInCtc] = useState(true);
  const [gratuityAccrualInCtc, setGratuityAccrualInCtc] = useState(true);
  const [applyPfCeiling, setApplyPfCeiling] = useState(false);

  const result = useMemo(
    () =>
      calculateLabourCodeImpact({
        annualCtc: numeric(annualCtc),
        currentBasicPercent: numeric(currentBasicPercent),
        monthlyProfessionalTax: numeric(monthlyProfessionalTax),
        employerPfInCtc,
        gratuityAccrualInCtc,
        applyPfCeiling,
      }),
    [
      annualCtc,
      currentBasicPercent,
      monthlyProfessionalTax,
      employerPfInCtc,
      gratuityAccrualInCtc,
      applyPfCeiling,
    ]
  );

  const { before, after } = result;
  const takeHomeFalls = result.monthlyTakeHomeChange < -1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">What this models — and what it does not</p>
        <p className="mt-1">
          This compares your current salary structure with one where basic + DA is lifted to at
          least half of your cash remuneration, which is the structural effect of the wage
          definition in the labour codes. It does not assert the date on which your employer must
          restructure: states notify rules separately and payroll cycles differ. Confirm your own
          revised breakup with your employer before acting on these figures.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Your package</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            Enter your current CTC and breakup
          </h3>

          <div className="mt-5 grid gap-4">
            <NumericField
              id="lc-ctc"
              label="Annual CTC"
              unit="₹ / year"
              value={annualCtc}
              onChange={setAnnualCtc}
              min={0}
              max={100_000_000}
              step={10_000}
              help="Total cost to company as stated in your offer or appraisal letter."
            />
            <NumericField
              id="lc-basic"
              label="Current basic + DA"
              unit="% of CTC"
              value={currentBasicPercent}
              onChange={setCurrentBasicPercent}
              min={0}
              max={100}
              step={1}
              help="Most private-sector structures sit between 25% and 40%. Check your payslip."
            />
            <NumericField
              id="lc-ptax"
              label="Professional tax"
              unit="₹ / month"
              value={monthlyProfessionalTax}
              onChange={setMonthlyProfessionalTax}
              min={0}
              max={1_000}
              step={50}
              help="Set by your state and capped at ₹2,500 a year. Enter 0 if your state does not levy it."
            />
          </div>

          <div className="mt-5 grid gap-3">
            <ToggleField
              id="lc-employer-pf"
              label="Employer PF is included in my CTC"
              checked={employerPfInCtc}
              onChange={setEmployerPfInCtc}
              help="Usual for private-sector offers. Uncheck if your employer pays PF over and above CTC."
            />
            <ToggleField
              id="lc-gratuity"
              label="Gratuity accrual is included in my CTC"
              checked={gratuityAccrualInCtc}
              onChange={setGratuityAccrualInCtc}
            />
            <ToggleField
              id="lc-pf-ceiling"
              label="PF is contributed on the ₹15,000 ceiling"
              checked={applyPfCeiling}
              onChange={setApplyPfCeiling}
              help="Some employers restrict PF to the statutory ceiling instead of actual wages. This sharply reduces the impact."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Before vs after</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            {result.alreadyCompliant
              ? 'Your structure already clears the 50% floor'
              : takeHomeFalls
                ? 'Your monthly take-home falls, your retirement saving rises'
                : 'Your structure changes, with little effect on take-home'}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Monthly take-home change"
              value={formatCurrency(result.monthlyTakeHomeChange)}
              detail={`${formatNumber(result.takeHomeChangePercent, 1)}% versus your current structure`}
            />
            <ResultCard
              label="Monthly retirement saving change"
              value={formatCurrency(result.monthlyRetirementSavingChange)}
              detail={`${formatCurrency(result.annualRetirementSavingChange)} more set aside each year`}
              emphasis
            />
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Current salary structure compared with the revised wage definition
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="pb-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Component
                  </th>
                  <th scope="col" className="pb-2 px-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Now
                  </th>
                  <th scope="col" className="pb-2 pl-3 text-right text-xs font-bold uppercase tracking-wide text-brandNavy">
                    Revised
                  </th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="Wages (basic + DA)"
                  hint={`${formatNumber(before.wagesShareOfRemuneration, 0)}% → ${formatNumber(after.wagesShareOfRemuneration, 0)}% of cash pay`}
                  before={formatCurrency(before.monthlyWages)}
                  after={formatCurrency(after.monthlyWages)}
                />
                <ComparisonRow
                  label="Gross cash before deductions"
                  before={formatCurrency(before.monthlyGrossCash)}
                  after={formatCurrency(after.monthlyGrossCash)}
                />
                <ComparisonRow
                  label="Your PF contribution"
                  hint="12% of wages"
                  before={formatCurrency(before.monthlyEmployeePf)}
                  after={formatCurrency(after.monthlyEmployeePf)}
                />
                <ComparisonRow
                  label="Employer PF contribution"
                  hint="12% of wages"
                  before={formatCurrency(before.monthlyEmployerPf)}
                  after={formatCurrency(after.monthlyEmployerPf)}
                />
                <ComparisonRow
                  label="Gratuity accrued per month"
                  hint="15 days of wages per year of service"
                  before={formatCurrency(before.monthlyGratuityAccrual)}
                  after={formatCurrency(after.monthlyGratuityAccrual)}
                />
                <ComparisonRow
                  label="Take-home before income tax"
                  before={formatCurrency(before.monthlyTakeHome)}
                  after={formatCurrency(after.monthlyTakeHome)}
                  invertTone
                />
              </tbody>
            </table>
          </div>

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            Take-home is shown before income tax, because the tax you pay depends on your regime and
            deductions rather than on this restructuring. Nothing here leaves your browser.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
