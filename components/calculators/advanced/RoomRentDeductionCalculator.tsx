'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateRoomRentClaim, roomRentCapFromPercent } from '@/lib/calculators/insurance-claim';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function RoomRentDeductionCalculator({ tool }: { tool: Tool }) {
  const [sumInsured, setSumInsured] = useState<NumericValue>(500_000);
  const [capMode, setCapMode] = useState<'rupees' | 'percent'>('rupees');
  const [eligibleRoomRent, setEligibleRoomRent] = useState<NumericValue>(5_000);
  const [capPercent, setCapPercent] = useState<NumericValue>(1);
  const [actualRoomRent, setActualRoomRent] = useState<NumericValue>(8_000);
  const [daysAdmitted, setDaysAdmitted] = useState<NumericValue>(5);
  const [proratedExpenses, setProratedExpenses] = useState<NumericValue>(150_000);
  const [nonProratedExpenses, setNonProratedExpenses] = useState<NumericValue>(40_000);

  const eligibleRate =
    capMode === 'percent'
      ? roomRentCapFromPercent(numeric(sumInsured), numeric(capPercent))
      : numeric(eligibleRoomRent);

  const result = useMemo(
    () =>
      calculateRoomRentClaim({
        eligibleRoomRentPerDay: eligibleRate,
        actualRoomRentPerDay: numeric(actualRoomRent),
        daysAdmitted: numeric(daysAdmitted),
        proratedExpenses: numeric(proratedExpenses),
        nonProratedExpenses: numeric(nonProratedExpenses),
        sumInsured: numeric(sumInsured),
      }),
    [
      eligibleRate,
      actualRoomRent,
      daysAdmitted,
      proratedExpenses,
      nonProratedExpenses,
      sumInsured,
    ]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">Check your own policy wording</p>
        <p className="mt-1">
          Which expense heads are excluded from proration varies between policies. Pharmacy,
          consumables, implants, diagnostics and ICU charges are commonly left out, but your
          insurer&apos;s wording decides. Enter those separately below and read your schedule
          before relying on any figure here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Your policy</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">Room rent cap and hospital bill</h3>

          <div className="mt-5 grid gap-4">
            <NumericField
              id="rr-sum-insured"
              label="Sum insured"
              unit="₹"
              value={sumInsured}
              onChange={setSumInsured}
              min={0}
              max={50_000_000}
              step={50_000}
              help="The cover available for this claim."
            />

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <legend className="px-1 text-sm font-semibold text-slate-700">
                How is your room rent capped?
              </legend>
              <div className="mt-2 flex flex-wrap gap-4">
                <label htmlFor="rr-mode-rupees" className="flex items-center gap-2 text-sm">
                  <input
                    id="rr-mode-rupees"
                    type="radio"
                    name="rr-cap-mode"
                    checked={capMode === 'rupees'}
                    onChange={() => setCapMode('rupees')}
                    className="h-4 w-4 accent-brandNavy"
                  />
                  A rupee amount per day
                </label>
                <label htmlFor="rr-mode-percent" className="flex items-center gap-2 text-sm">
                  <input
                    id="rr-mode-percent"
                    type="radio"
                    name="rr-cap-mode"
                    checked={capMode === 'percent'}
                    onChange={() => setCapMode('percent')}
                    className="h-4 w-4 accent-brandNavy"
                  />
                  A percent of sum insured
                </label>
              </div>
            </fieldset>

            {capMode === 'rupees' ? (
              <NumericField
                id="rr-eligible"
                label="Room rent your policy allows"
                unit="₹ / day"
                value={eligibleRoomRent}
                onChange={setEligibleRoomRent}
                min={0}
                max={200_000}
                step={500}
                help="Enter 0 if your policy has no room rent limit."
              />
            ) : (
              <NumericField
                id="rr-percent"
                label="Daily room rent cap"
                unit="% of sum insured"
                value={capPercent}
                onChange={setCapPercent}
                min={0}
                max={10}
                step={0.25}
                help={`At ${formatNumber(numeric(capPercent), 2)}% this works out to ${formatCurrency(eligibleRate)} a day.`}
              />
            )}

            <NumericField
              id="rr-actual"
              label="Room rent actually charged"
              unit="₹ / day"
              value={actualRoomRent}
              onChange={setActualRoomRent}
              min={0}
              max={200_000}
              step={500}
            />
            <NumericField
              id="rr-days"
              label="Days admitted"
              unit="days"
              value={daysAdmitted}
              onChange={setDaysAdmitted}
              min={0}
              max={365}
              step={1}
            />
            <NumericField
              id="rr-prorated"
              label="Expenses that get prorated"
              unit="₹"
              value={proratedExpenses}
              onChange={setProratedExpenses}
              min={0}
              max={50_000_000}
              step={5_000}
              help="Surgeon and anaesthetist fees, nursing, operation theatre — the heads that move with room category."
            />
            <NumericField
              id="rr-non-prorated"
              label="Expenses your policy does not prorate"
              unit="₹"
              value={nonProratedExpenses}
              onChange={setNonProratedExpenses}
              min={0}
              max={50_000_000}
              step={5_000}
              help="Commonly pharmacy, consumables, implants, diagnostics and ICU charges. Check your wording."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">What you pay</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            {result.withinLimit
              ? 'Your room is within the cap — no proportionate deduction'
              : `The insurer will meet ${formatNumber(result.admissibleRatio * 100, 1)}% of the prorated heads`}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Hospital bill"
              value={formatCurrency(result.totalBill)}
              detail={`${formatCurrency(result.actualRoomCharges)} of it is room rent`}
            />
            <ResultCard
              label="Insurer pays"
              value={formatCurrency(result.totalPayable)}
              detail={
                result.cappedBySumInsured
                  ? 'Limited by your sum insured, not the room cap'
                  : 'After the room cap and proration'
              }
              emphasis
            />
            <ResultCard
              label="You pay"
              value={formatCurrency(result.outOfPocket)}
              detail="Room rent gap plus the proportionate deduction"
            />
            <ResultCard
              label="Lost to proration alone"
              value={formatCurrency(result.proportionateDeduction)}
              detail="Over and above the room rent difference"
            />
          </div>

          {!result.withinLimit ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Why the shortfall is bigger than the room gap
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Room rent above the cap</dt>
                  <dd className="font-semibold tabular-nums text-slate-800">
                    {formatCurrency(result.roomRentShortfall)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-600">Proportionate deduction on other heads</dt>
                  <dd className="font-semibold tabular-nums text-slate-800">
                    {formatCurrency(result.proportionateDeduction)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
                  <dt className="font-semibold text-slate-700">Total out of pocket</dt>
                  <dd className="font-bold tabular-nums text-brandDeepNavy">
                    {formatCurrency(result.outOfPocket)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Choosing a room within your cap would have avoided the second line entirely.
              </p>
            </div>
          ) : null}

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            This is an estimate of the deduction mechanism, not a claim decision. Co-payment,
            sub-limits on specific procedures and non-medical exclusions are not modelled here.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
