'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { KNOWN_CII, calculateInheritedPropertyGains } from '@/lib/calculators/tax-extras';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function InheritedPropertyGainsCalculator({ tool }: { tool: Tool }) {
  const [salePrice, setSalePrice] = useState<NumericValue>(10_000_000);
  const [saleYearCii, setSaleYearCii] = useState<NumericValue>(KNOWN_CII['2026-27']);
  const [previousOwnerCost, setPreviousOwnerCost] = useState<NumericValue>(200_000);
  const [acquiredBeforeApril2001, setAcquiredBeforeApril2001] = useState(true);
  const [fairMarketValue2001, setFairMarketValue2001] = useState<NumericValue>(800_000);
  const [acquisitionYearCii, setAcquisitionYearCii] = useState<NumericValue>(200);
  const [costOfImprovement, setCostOfImprovement] = useState<NumericValue>(0);
  const [transferExpenses, setTransferExpenses] = useState<NumericValue>(200_000);
  const [eligibleForIndexationChoice, setEligibleForIndexationChoice] = useState(true);

  const result = useMemo(
    () =>
      calculateInheritedPropertyGains({
        salePrice: numeric(salePrice),
        saleYearCii: numeric(saleYearCii),
        previousOwnerCost: numeric(previousOwnerCost),
        acquiredBeforeApril2001,
        fairMarketValue2001: numeric(fairMarketValue2001),
        acquisitionYearCii: numeric(acquisitionYearCii),
        costOfImprovement: numeric(costOfImprovement),
        transferExpenses: numeric(transferExpenses),
        eligibleForIndexationChoice,
      }),
    [
      salePrice,
      saleYearCii,
      previousOwnerCost,
      acquiredBeforeApril2001,
      fairMarketValue2001,
      acquisitionYearCii,
      costOfImprovement,
      transferExpenses,
      eligibleForIndexationChoice,
    ]
  );

  const indexWins = result.betterOption === 'with-indexation';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">Inheritance itself is not taxed — the sale is</p>
        <p className="mt-1">
          There is no tax when you inherit. When you sell, the gain is worked out from the{' '}
          <strong>previous owner&apos;s</strong> cost and their holding period, not yours. That is
          why a generic capital gains calculator gives the wrong answer here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">The property</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">Sale and original purchase</h3>

          <div className="mt-5 grid gap-4">
            <NumericField
              id="ip-sale"
              label="Sale price"
              unit="₹"
              value={salePrice}
              onChange={setSalePrice}
              min={0}
              max={1_000_000_000}
              step={100_000}
            />
            <NumericField
              id="ip-expenses"
              label="Transfer expenses"
              unit="₹"
              value={transferExpenses}
              onChange={setTransferExpenses}
              min={0}
              max={100_000_000}
              step={10_000}
              help="Brokerage, legal fees and stamp duty borne by you on the sale."
            />
            <NumericField
              id="ip-sale-cii"
              label="Cost inflation index for the sale year"
              unit="index"
              value={saleYearCii}
              onChange={setSaleYearCii}
              min={100}
              max={2_000}
              step={1}
              help="Notified by CBDT: 363 for FY 2024-25, 376 for FY 2025-26, 384 for FY 2026-27."
            />

            <label
              htmlFor="ip-pre2001"
              className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <input
                id="ip-pre2001"
                type="checkbox"
                checked={acquiredBeforeApril2001}
                onChange={(event) => setAcquiredBeforeApril2001(event.target.checked)}
                className="mt-1 h-4 w-4 flex-none accent-brandNavy"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  The previous owner acquired it before 1 April 2001
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  If so, you may substitute the fair market value as at 1 April 2001 where that is
                  higher than actual cost.
                </span>
              </span>
            </label>

            <NumericField
              id="ip-cost"
              label="What the previous owner paid"
              unit="₹"
              value={previousOwnerCost}
              onChange={setPreviousOwnerCost}
              min={0}
              max={500_000_000}
              step={50_000}
            />

            {acquiredBeforeApril2001 ? (
              <NumericField
                id="ip-fmv"
                label="Fair market value as at 1 April 2001"
                unit="₹"
                value={fairMarketValue2001}
                onChange={setFairMarketValue2001}
                min={0}
                max={500_000_000}
                step={50_000}
                help="From a registered valuer's report. The index for 2001-02 is 100."
              />
            ) : (
              <NumericField
                id="ip-acq-cii"
                label="Cost inflation index for the acquisition year"
                unit="index"
                value={acquisitionYearCii}
                onChange={setAcquisitionYearCii}
                min={100}
                max={2_000}
                step={1}
                help="The CBDT-notified index for the financial year the previous owner bought it."
              />
            )}

            <NumericField
              id="ip-improvement"
              label="Cost of improvement"
              unit="₹"
              value={costOfImprovement}
              onChange={setCostOfImprovement}
              min={0}
              max={100_000_000}
              step={50_000}
              help="Only capital improvements made on or after 1 April 2001 count."
            />

            <label
              htmlFor="ip-choice"
              className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <input
                id="ip-choice"
                type="checkbox"
                checked={eligibleForIndexationChoice}
                onChange={(event) => setEligibleForIndexationChoice(event.target.checked)}
                className="mt-1 h-4 w-4 flex-none accent-brandNavy"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  Acquired before 23 July 2024
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Only then may you choose between 12.5% without indexation and 20% with it.
                  Otherwise the flat 12.5% applies.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Result</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            {eligibleForIndexationChoice
              ? indexWins
                ? 'Indexation at 20% is cheaper for you'
                : 'The flat 12.5% is cheaper for you'
              : 'Flat 12.5% applies — no choice available'}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Cost of acquisition used"
              value={formatCurrency(result.costOfAcquisitionUsed)}
              detail={
                result.usedFairMarketValue
                  ? '2001 fair market value, being higher than actual cost'
                  : "The previous owner's actual cost"
              }
            />
            <ResultCard
              label="Tax payable"
              value={formatCurrency(result.taxPayable)}
              detail={
                eligibleForIndexationChoice
                  ? `Saves ${formatCurrency(result.savingFromChoosing)} against the other route`
                  : 'Before surcharge and cess'
              }
              emphasis
            />
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">The two taxation routes compared</caption>
              <thead>
                <tr>
                  <th scope="col" className="pb-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Route
                  </th>
                  <th scope="col" className="pb-2 px-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Taxable gain
                  </th>
                  <th scope="col" className="pb-2 pl-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Tax
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <th scope="row" className="py-3 pr-3 text-left align-top text-sm font-semibold text-slate-700">
                    12.5% without indexation
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                      Cost taken at {formatCurrency(result.costOfAcquisitionUsed)}
                    </span>
                  </th>
                  <td className="py-3 px-3 text-right align-top text-sm tabular-nums text-slate-600">
                    {formatCurrency(result.gainWithoutIndexation)}
                  </td>
                  <td
                    className={`py-3 pl-3 text-right align-top text-sm font-bold tabular-nums ${
                      !indexWins ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    {formatCurrency(result.taxWithoutIndexation)}
                  </td>
                </tr>
                <tr className="border-t border-slate-200">
                  <th scope="row" className="py-3 pr-3 text-left align-top text-sm font-semibold text-slate-700">
                    20% with indexation
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                      Indexed cost {formatCurrency(result.indexedCostOfAcquisition)} at index{' '}
                      {formatNumber(result.effectiveAcquisitionCii, 0)} →{' '}
                      {formatNumber(numeric(saleYearCii), 0)}
                    </span>
                  </th>
                  <td className="py-3 px-3 text-right align-top text-sm tabular-nums text-slate-600">
                    {formatCurrency(result.gainWithIndexation)}
                  </td>
                  <td
                    className={`py-3 pl-3 text-right align-top text-sm font-bold tabular-nums ${
                      indexWins && eligibleForIndexationChoice
                        ? 'text-emerald-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {eligibleForIndexationChoice
                      ? formatCurrency(result.taxWithIndexation)
                      : 'Not available'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            A lower rate does not always mean lower tax — that depends on how large the gain is
            relative to cost. Surcharge, cess and any exemption under sections 54 or 54EC are not
            applied here, and reinvestment relief can change which route suits you.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
