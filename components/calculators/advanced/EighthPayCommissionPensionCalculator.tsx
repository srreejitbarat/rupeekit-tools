'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateEighthPayCommissionPension } from '@/lib/calculators/search-growth';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

const MULTIPLIER_SCENARIOS = [1.92, 2.08, 2.57, 2.86, 3];

export default function EighthPayCommissionPensionCalculator({ tool }: { tool: Tool }) {
  const [currentBasicPension, setCurrentBasicPension] = useState<NumericValue>(25_000);
  const [currentDrPercent, setCurrentDrPercent] = useState<NumericValue>(60);
  const [revisionMultiplier, setRevisionMultiplier] = useState<NumericValue>(2.57);
  const [projectedDrPercent, setProjectedDrPercent] = useState<NumericValue>(0);
  const [additionalPensionPercent, setAdditionalPensionPercent] = useState<NumericValue>(0);

  const result = useMemo(() => calculateEighthPayCommissionPension({
    currentBasicPension: numeric(currentBasicPension),
    currentDrPercent: numeric(currentDrPercent),
    revisionMultiplier: numeric(revisionMultiplier),
    projectedDrPercent: numeric(projectedDrPercent),
    additionalPensionPercent: numeric(additionalPensionPercent),
  }), [currentBasicPension, currentDrPercent, revisionMultiplier, projectedDrPercent, additionalPensionPercent]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">Unofficial pension multiplier scenario</p>
        <p className="mt-1">
          No 8th CPC pension revision method, multiplier, parity formula, projected DR rate or implementation date has been notified. This tool does not perform notional pay fixation.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Pension inputs</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">Compare current pension with one scenario</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumericField id="pension-current-basic" label="Current basic pension" unit="₹ / month" value={currentBasicPension} onChange={setCurrentBasicPension} step={100} help="Use basic pension before DR and any age-related additional pension." />
            <NumericField id="pension-current-dr" label="Current DR" unit="% of basic pension" value={currentDrPercent} onChange={setCurrentDrPercent} max={200} help="Defaults to 60%. Change it if the rate applicable to you differs." />
            <label htmlFor="pension-multiplier" className="block">
              <span className="text-sm font-semibold text-slate-700">Revision multiplier scenario</span>
              <select
                id="pension-multiplier"
                value={revisionMultiplier}
                onChange={(event) => setRevisionMultiplier(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-semibold outline-none focus:border-brandNavy"
              >
                {MULTIPLIER_SCENARIOS.map((factor) => <option key={factor} value={factor}>{factor.toFixed(2)}× scenario</option>)}
              </select>
            </label>
            <NumericField id="pension-custom-multiplier" label="Or enter a custom multiplier" unit="× current basic pension" value={revisionMultiplier} onChange={setRevisionMultiplier} min={0.1} max={10} step={0.01} />
            <NumericField id="pension-projected-dr" label="Projected DR scenario" unit="% of revised pension" value={projectedDrPercent} onChange={setProjectedDrPercent} max={200} help="Defaults to 0% to keep current DR separate from the revision scenario." />
            <NumericField id="pension-additional-rate" label="Additional pension rate" unit="% of revised basic" value={additionalPensionPercent} onChange={setAdditionalPensionPercent} max={100} help="Optional user-entered rate if an age-related additional pension applies. Verify the applicable rule." />
          </div>
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Illustrative result</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">Current vs projected pension</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard label="Current monthly pension" value={formatCurrency(result.currentMonthlyPension)} detail={`${formatCurrency(numeric(currentBasicPension))} basic + ${formatCurrency(result.currentDr)} DR`} />
            <ResultCard label="Revised basic scenario" value={formatCurrency(result.revisedBasicPensionScenario)} detail={`${formatNumber(numeric(revisionMultiplier), 2)}× current basic pension`} emphasis />
            <ResultCard label="Projected monthly pension" value={formatCurrency(result.projectedMonthlyPension)} detail="Revised basic + projected DR + entered additional pension" />
            <ResultCard label="Monthly change" value={formatCurrency(result.monthlyChange)} detail={`${formatCurrency(result.annualChange)} annual change`} />
            <ResultCard label="Projected DR amount" value={formatCurrency(result.projectedDr)} detail={`${formatNumber(numeric(projectedDrPercent), 1)}% user-entered scenario`} />
            <ResultCard label="Additional pension amount" value={formatCurrency(result.additionalPension)} detail={`${formatNumber(numeric(additionalPensionPercent), 1)}% user-entered rate`} />
          </div>
          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            This is a flat-multiplier comparison only. An eventual government resolution may use notional pay fixation, pension parity, minimum-pension rules, rounding or another method that produces a different result.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
