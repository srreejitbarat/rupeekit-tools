'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { GRATUITY_CEILING, calculateNewWageGratuity } from '@/lib/calculators/labour-code';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function NewWageGratuityCalculator({ tool }: { tool: Tool }) {
  const [currentMonthlyBasic, setCurrentMonthlyBasic] = useState<NumericValue>(30_000);
  const [monthlyGrossCash, setMonthlyGrossCash] = useState<NumericValue>(100_000);
  const [yearsOfService, setYearsOfService] = useState<NumericValue>(10);
  const [isFixedTermEmployee, setIsFixedTermEmployee] = useState(false);

  const result = useMemo(
    () =>
      calculateNewWageGratuity({
        currentMonthlyBasic: numeric(currentMonthlyBasic),
        monthlyGrossCash: numeric(monthlyGrossCash),
        yearsOfService: numeric(yearsOfService),
        isFixedTermEmployee,
      }),
    [currentMonthlyBasic, monthlyGrossCash, yearsOfService, isFixedTermEmployee]
  );

  const hitsCeiling = result.gratuityOnRevisedWages > GRATUITY_CEILING;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">An estimate, not an entitlement</p>
        <p className="mt-1">
          Gratuity is paid on the wages actually recorded by your employer at exit. This tool shows
          how the revised wage definition changes that base. It does not confirm your eligibility,
          your employer&apos;s coverage under the Payment of Gratuity Act, or the date your
          structure changes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Your service</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            Enter the figures from your payslip
          </h3>

          <div className="mt-5 grid gap-4">
            <NumericField
              id="gr-basic"
              label="Current basic + DA"
              unit="₹ / month"
              value={currentMonthlyBasic}
              onChange={setCurrentMonthlyBasic}
              min={0}
              max={5_000_000}
              step={1_000}
              help="The wages line on your payslip today."
            />
            <NumericField
              id="gr-gross"
              label="Monthly gross cash pay"
              unit="₹ / month"
              value={monthlyGrossCash}
              onChange={setMonthlyGrossCash}
              min={0}
              max={10_000_000}
              step={1_000}
              help="Basic + DA + every allowance, before deductions and excluding employer PF."
            />
            <NumericField
              id="gr-years"
              label="Completed years of service"
              unit="years"
              value={yearsOfService}
              onChange={setYearsOfService}
              min={0}
              max={45}
              step={0.5}
              help="Six months or more in the final year is generally counted as a full year."
            />
            <label
              htmlFor="gr-fixed-term"
              className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <input
                id="gr-fixed-term"
                type="checkbox"
                checked={isFixedTermEmployee}
                onChange={(event) => setIsFixedTermEmployee(event.target.checked)}
                className="mt-1 h-4 w-4 flex-none accent-brandNavy"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  I am a fixed-term employee
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Fixed-term employees accrue gratuity from one year of service rather than five.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Estimate</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            {result.isEligible
              ? 'What the revised wage base is worth to you'
              : `Not yet eligible — ${formatNumber(result.eligibilityYears, 0)} years of service required`}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Wage base for gratuity"
              value={formatCurrency(result.revisedWages)}
              detail={`Up from ${formatCurrency(result.currentWages)} on your current breakup`}
            />
            <ResultCard
              label="Increase in gratuity"
              value={formatCurrency(result.gratuityIncrease)}
              detail="Difference between the two wage bases"
              emphasis
            />
            <ResultCard
              label="On your current wages"
              value={formatCurrency(result.gratuityOnCurrentWages)}
              detail="15/26 × wages × years of service"
            />
            <ResultCard
              label="On the revised wages"
              value={formatCurrency(result.cappedGratuity)}
              detail={
                hitsCeiling
                  ? `Held at the ₹20 lakh statutory ceiling`
                  : '15/26 × revised wages × years of service'
              }
            />
          </div>

          {!result.isEligible ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
              These figures show what would accrue once you cross{' '}
              {formatNumber(result.eligibilityYears, 0)} years. Gratuity is generally payable
              earlier only on death or disablement.
            </p>
          ) : null}

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            Gratuity up to ₹20 lakh is exempt from income tax for employees covered by the Act.
            Amounts above the ceiling, and payments from employers outside the Act, follow different
            rules.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
