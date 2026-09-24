'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateNotionalIncrement } from '@/lib/calculators/pension-extras';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function NotionalIncrementCalculator({ tool }: { tool: Tool }) {
  const [lastBasicPay, setLastBasicPay] = useState<NumericValue>(100_000);
  const [drPercent, setDrPercent] = useState<NumericValue>(60);
  const [arrearsMonths, setArrearsMonths] = useState<NumericValue>(24);
  const [commutedPercent, setCommutedPercent] = useState<NumericValue>(0);

  const result = useMemo(
    () =>
      calculateNotionalIncrement({
        lastBasicPay: numeric(lastBasicPay),
        drPercent: numeric(drPercent),
        arrearsMonths: numeric(arrearsMonths),
        commutedPercent: numeric(commutedPercent),
      }),
    [lastBasicPay, drPercent, arrearsMonths, commutedPercent]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">Who this applies to</p>
        <p className="mt-1">
          Central government employees who retired on <strong>30 June</strong> or{' '}
          <strong>31 December</strong> — one day before their annual increment fell due. A Supreme
          Court judgment of 20 February 2025 held that the increment should be counted notionally
          when pension is fixed, and a Department of Personnel office memorandum of 20 May 2025
          followed. The increment counts for pension only, not for other pensionary benefits, and
          no arrears run for any period before 30 April 2023.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Your service</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            Enter your last drawn basic pay
          </h3>

          <div className="mt-5 grid gap-4">
            <NumericField
              id="ni-basic"
              label="Last drawn basic pay"
              unit="₹ / month"
              value={lastBasicPay}
              onChange={setLastBasicPay}
              min={0}
              max={5_000_000}
              step={100}
              help="The pay matrix cell you held on 30 June or 31 December."
            />
            <NumericField
              id="ni-dr"
              label="Dearness relief"
              unit="% of basic pension"
              value={drPercent}
              onChange={setDrPercent}
              min={0}
              max={300}
              step={1}
              help="The rate currently applicable to your pension."
            />
            <NumericField
              id="ni-months"
              label="Months of arrears claimed"
              unit="months"
              value={arrearsMonths}
              onChange={setArrearsMonths}
              min={0}
              max={600}
              step={1}
              help="Counted from the later of 30 April 2023 and your retirement date."
            />
            <NumericField
              id="ni-commuted"
              label="Pension commuted"
              unit="% of basic pension"
              value={commutedPercent}
              onChange={setCommutedPercent}
              min={0}
              max={40}
              step={1}
              help="Leave at 0 if you did not commute. Dearness relief is not reduced by commutation."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Estimate</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            One notional increment of {formatCurrency(result.notionalIncrement)}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Revised basic pay"
              value={formatCurrency(result.revisedBasicPay)}
              detail={`3% of ${formatCurrency(numeric(lastBasicPay))}, rounded up to the next ₹100`}
            />
            <ResultCard
              label="Monthly gain with DR"
              value={formatCurrency(result.monthlyGainWithDr)}
              detail={`${formatCurrency(result.basicPensionGain)} of basic pension plus ${formatNumber(numeric(drPercent), 0)}% relief`}
              emphasis
            />
            <ResultCard
              label="Annual gain"
              value={formatCurrency(result.annualGainWithDr)}
              detail="Continues for life, and carries into future DR revisions"
            />
            <ResultCard
              label="Estimated arrears"
              value={formatCurrency(result.estimatedArrears)}
              detail={`${formatNumber(numeric(arrearsMonths), 0)} months at the monthly gain`}
            />
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Pension before and after the notional increment</caption>
              <thead>
                <tr>
                  <th scope="col" className="pb-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Component
                  </th>
                  <th scope="col" className="pb-2 px-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Without
                  </th>
                  <th scope="col" className="pb-2 pl-3 text-right text-xs font-bold uppercase tracking-wide text-brandNavy">
                    With increment
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <th scope="row" className="py-3 pr-3 text-left text-sm font-semibold text-slate-700">
                    Basic pay for pension
                  </th>
                  <td className="py-3 px-3 text-right text-sm font-semibold tabular-nums text-slate-600">
                    {formatCurrency(numeric(lastBasicPay))}
                  </td>
                  <td className="py-3 pl-3 text-right text-sm font-bold tabular-nums text-brandDeepNavy">
                    {formatCurrency(result.revisedBasicPay)}
                  </td>
                </tr>
                <tr className="border-t border-slate-200">
                  <th scope="row" className="py-3 pr-3 text-left text-sm font-semibold text-slate-700">
                    Basic pension
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                      Half of last basic pay
                    </span>
                  </th>
                  <td className="py-3 px-3 text-right text-sm font-semibold tabular-nums text-slate-600">
                    {formatCurrency(result.currentBasicPension)}
                  </td>
                  <td className="py-3 pl-3 text-right text-sm font-bold tabular-nums text-brandDeepNavy">
                    {formatCurrency(result.revisedBasicPension)}
                  </td>
                </tr>
                <tr className="border-t border-slate-200">
                  <th scope="row" className="py-3 pr-3 text-left text-sm font-semibold text-slate-700">
                    Monthly in hand
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                      After commutation, including DR
                    </span>
                  </th>
                  <td className="py-3 px-3 text-right text-sm font-semibold tabular-nums text-slate-600">
                    {formatCurrency(result.currentMonthlyInHand)}
                  </td>
                  <td className="py-3 pl-3 text-right text-sm font-bold tabular-nums text-emerald-700">
                    {formatCurrency(result.revisedMonthlyInHand)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            Pension is taken as half of last drawn basic pay, which is the usual position for a
            full qualifying service. Your sanctioned pension may differ, and the arrears figure
            depends on the months your pension disbursing authority actually admits.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
