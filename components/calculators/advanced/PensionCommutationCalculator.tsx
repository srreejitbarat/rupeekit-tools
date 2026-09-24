'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import {
  MAX_COMMUTATION_PERCENT,
  calculatePensionCommutation,
} from '@/lib/calculators/pension-extras';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function PensionCommutationCalculator({ tool }: { tool: Tool }) {
  const [basicPension, setBasicPension] = useState<NumericValue>(50_000);
  const [commutedPercent, setCommutedPercent] = useState<NumericValue>(40);
  const [commutationFactor, setCommutationFactor] = useState<NumericValue>(8.194);
  const [drPercent, setDrPercent] = useState<NumericValue>(60);

  const result = useMemo(
    () =>
      calculatePensionCommutation({
        basicPension: numeric(basicPension),
        commutedPercent: numeric(commutedPercent),
        commutationFactor: numeric(commutationFactor),
        drPercent: numeric(drPercent),
      }),
    [basicPension, commutedPercent, commutationFactor, drPercent]
  );

  const breakEvenYears = result.breakEvenMonths / 12;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">Take the commutation factor from the official table</p>
        <p className="mt-1">
          The factor depends on your <strong>age next birthday</strong> and is set by the table in
          the CCS (Commutation of Pension) Rules. Published copies of that table differ between
          websites, so this calculator asks you to enter the figure rather than guessing it. Read
          it off the rules or ask your pension disbursing authority.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Your pension</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            What you would commute
          </h3>

          <div className="mt-5 grid gap-4">
            <NumericField
              id="pc-basic"
              label="Basic pension"
              unit="₹ / month"
              value={basicPension}
              onChange={setBasicPension}
              min={0}
              max={2_000_000}
              step={500}
              help="Before dearness relief and before commutation."
            />
            <NumericField
              id="pc-percent"
              label="Share you want to commute"
              unit="% of basic pension"
              value={commutedPercent}
              onChange={setCommutedPercent}
              min={0}
              max={MAX_COMMUTATION_PERCENT}
              step={1}
              help={`Central government pensioners may commute up to ${MAX_COMMUTATION_PERCENT}%.`}
            />
            <NumericField
              id="pc-factor"
              label="Commutation factor"
              unit="from the rules"
              value={commutationFactor}
              onChange={setCommutationFactor}
              min={0}
              max={25}
              step={0.001}
              help="Read against age next birthday. The default shown is illustrative only — replace it with your own."
            />
            <NumericField
              id="pc-dr"
              label="Dearness relief"
              unit="% of basic pension"
              value={drPercent}
              onChange={setDrPercent}
              min={0}
              max={300}
              step={1}
            />
          </div>

          {result.cappedAtMaximum ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
              Held at the {MAX_COMMUTATION_PERCENT}% statutory maximum.
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Result</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            {formatCurrency(result.lumpSum)} now, {formatCurrency(result.monthlyReduction)} less
            each month
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Lump sum"
              value={formatCurrency(result.lumpSum)}
              detail={`${formatCurrency(result.commutedMonthlyPension)} × 12 × ${formatNumber(numeric(commutationFactor), 3)}`}
              emphasis
            />
            <ResultCard
              label="Monthly pension after"
              value={formatCurrency(result.monthlyInHandAfterCommutation)}
              detail={`Down from ${formatCurrency(result.monthlyInHandWithoutCommutation)}`}
            />
            <ResultCard
              label="Break-even"
              value={`${formatNumber(breakEvenYears, 1)} years`}
              detail="When the reductions have matched the lump sum"
            />
            <ResultCard
              label="Restored after"
              value={`${result.restorationYears} years`}
              detail="The commuted portion returns automatically"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              The rule most people miss
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-950">
              Dearness relief stays on your <strong>full</strong> basic pension of{' '}
              {formatCurrency(numeric(basicPension))}, not the reduced figure. So your monthly
              relief of {formatCurrency(result.monthlyDearnessRelief)} does not shrink when you
              commute — only the {formatCurrency(result.monthlyReduction)} of basic pension does.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Across the {result.restorationYears}-year restoration period
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Lump sum received</dt>
                <dd className="font-semibold tabular-nums text-slate-800">
                  {formatCurrency(result.lumpSum)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Pension given up</dt>
                <dd className="font-semibold tabular-nums text-slate-800">
                  {formatCurrency(result.totalForgoneOverRestoration)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                <dt className="font-semibold text-slate-700">Difference</dt>
                <dd
                  className={`font-bold tabular-nums ${
                    result.netOverRestoration >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatCurrency(result.netOverRestoration)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              This is a simple cash comparison. It ignores what you might earn by investing the
              lump sum, and it ignores inflation — both of which matter to the decision.
            </p>
          </div>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
