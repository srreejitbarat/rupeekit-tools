'use client';

import { useMemo, useState } from 'react';
import { useCalculatorResult } from '@/components/useCalculatorResult';
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

  useCalculatorResult(result, numeric(monthlyGrossCash) > 0 &&
    numeric(currentMonthlyBasic) <= numeric(monthlyGrossCash) &&
    [currentMonthlyBasic, monthlyGrossCash, yearsOfService, result.cappedGratuity].every(Number.isFinite));

  const hitsCeiling = result.gratuityOnRevisedWages > GRATUITY_CEILING;

  return (
    <div className="space-y-6">


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
              label="Total years of continuous service"
              unit="years"
              value={yearsOfService}
              onChange={setYearsOfService}
              min={0}
              max={45}
              step={0.01}
              help="Enter service as a decimal, such as 5.75 for 5 years and 9 months."
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
                  My direct fixed-term contract is ending
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  At contract expiry, eligible fixed-term employees with at least one year of service receive a prorated amount.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section data-calculator-result className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Estimate</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            {result.isEligible
              ? 'What the revised wage base is worth to you'
              : `This scenario requires ${formatNumber(result.eligibilityYears, 0)} years of service`}
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
              detail="15/26 × wages × qualifying service"
            />
            <ResultCard
              label="On the revised wages"
              value={formatCurrency(result.cappedGratuity)}
              detail={
                hitsCeiling
                  ? `Held at the ₹20 lakh statutory ceiling`
                  : '15/26 × revised wages × qualifying service'
              }
            />
          </div>

          {!result.isEligible ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
              Special rules can apply to death, disablement and some categories of employment.
            </p>
          ) : null}

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            The statutory gratuity ceiling is ₹20 lakh. Income tax exemptions depend on your employment category and circumstances.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">How this estimate works</p>
        <p className="mt-1">
          Section 53 of the Code on Social Security uses last-drawn wages. For regular service,
          a partial year counts as a full year only when it exceeds six months. This comparison
          uses half of cash pay as a simplified wage base. Check your last-drawn wages and
          eligibility with your employer.
        </p>
      </div>
    </div>
  );
}
