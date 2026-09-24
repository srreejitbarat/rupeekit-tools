'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { calculateRule9d } from '@/lib/calculators/tax-extras';
import {
  CalculatorGovernanceStrip,
  NumericField,
  ResultCard,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

export default function Rule9dEpfInterestCalculator({ tool }: { tool: Tool }) {
  const [annualEmployeeContribution, setAnnualEmployeeContribution] =
    useState<NumericValue>(400_000);
  const [interestRatePercent, setInterestRatePercent] = useState<NumericValue>(8.25);
  const [years, setYears] = useState<NumericValue>(5);
  const [employerAlsoContributes, setEmployerAlsoContributes] = useState(true);
  const [panLinked, setPanLinked] = useState(true);
  const [openingTaxableBalance, setOpeningTaxableBalance] = useState<NumericValue>(0);
  const [openingNonTaxableBalance, setOpeningNonTaxableBalance] = useState<NumericValue>(0);

  const result = useMemo(
    () =>
      calculateRule9d({
        annualEmployeeContribution: numeric(annualEmployeeContribution),
        interestRatePercent: numeric(interestRatePercent),
        years: numeric(years),
        employerAlsoContributes,
        panLinked,
        openingTaxableBalance: numeric(openingTaxableBalance),
        openingNonTaxableBalance: numeric(openingNonTaxableBalance),
      }),
    [
      annualEmployeeContribution,
      interestRatePercent,
      years,
      employerAlsoContributes,
      panLinked,
      openingTaxableBalance,
      openingNonTaxableBalance,
    ]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">How Rule 9D works</p>
        <p className="mt-1">
          Where your own provident fund contributions exceed the threshold in a year, the fund is
          maintained as two notional accounts — taxable and non-taxable. Interest is credited to
          each separately and only the taxable account&apos;s interest is charged to tax. Both
          balances carry forward, so the taxable interest grows every year even if your
          contribution does not.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">
            Your contributions
          </p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            Employee contribution only
          </h3>

          <div className="mt-5 grid gap-4">
            <NumericField
              id="r9-contribution"
              label="Your annual contribution"
              unit="₹ / year"
              value={annualEmployeeContribution}
              onChange={setAnnualEmployeeContribution}
              min={0}
              max={10_000_000}
              step={10_000}
              help="Include voluntary provident fund. Employer contributions are not counted for this threshold."
            />
            <NumericField
              id="r9-rate"
              label="Interest rate credited"
              unit="% per year"
              value={interestRatePercent}
              onChange={setInterestRatePercent}
              min={0}
              max={20}
              step={0.05}
            />
            <NumericField
              id="r9-years"
              label="Years to project"
              unit="years"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
            />
            <NumericField
              id="r9-open-taxable"
              label="Opening taxable balance"
              unit="₹"
              value={openingTaxableBalance}
              onChange={setOpeningTaxableBalance}
              min={0}
              max={100_000_000}
              step={10_000}
              help="Carried forward from earlier years, if you have already crossed the threshold before."
            />
            <NumericField
              id="r9-open-nontaxable"
              label="Opening non-taxable balance"
              unit="₹"
              value={openingNonTaxableBalance}
              onChange={setOpeningNonTaxableBalance}
              min={0}
              max={100_000_000}
              step={10_000}
            />

            <label
              htmlFor="r9-employer"
              className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <input
                id="r9-employer"
                type="checkbox"
                checked={employerAlsoContributes}
                onChange={(event) => setEmployerAlsoContributes(event.target.checked)}
                className="mt-1 h-4 w-4 flex-none accent-brandNavy"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  My employer also contributes to the fund
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Uncheck for a fund where the employer makes no contribution — the threshold then
                  rises from ₹2.5 lakh to ₹5 lakh.
                </span>
              </span>
            </label>

            <label
              htmlFor="r9-pan"
              className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <input
                id="r9-pan"
                type="checkbox"
                checked={panLinked}
                onChange={(event) => setPanLinked(event.target.checked)}
                className="mt-1 h-4 w-4 flex-none accent-brandNavy"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-700">
                  My PAN is linked to the account
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  TDS is 10% with a linked PAN and 20% without.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Projection</p>
          <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
            {result.entirelyBelowThreshold
              ? `Below the ${formatCurrency(result.threshold)} threshold — nothing is taxable`
              : `${formatCurrency(result.rows[0].taxableContribution)} a year lands in the taxable account`}
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Threshold applied"
              value={formatCurrency(result.threshold)}
              detail={
                employerAlsoContributes
                  ? 'Employer contributes to the fund'
                  : 'No employer contribution'
              }
            />
            <ResultCard
              label="Total taxable interest"
              value={formatCurrency(result.totalTaxableInterest)}
              detail={`Over ${formatNumber(result.rows.length, 0)} years`}
              emphasis
            />
            <ResultCard
              label="Total TDS deducted"
              value={formatCurrency(result.totalTds)}
              detail={panLinked ? 'At 10% with linked PAN' : 'At 20% without linked PAN'}
            />
            <ResultCard
              label="Closing taxable balance"
              value={formatCurrency(result.finalTaxableBalance)}
              detail={`Non-taxable account holds ${formatCurrency(result.finalNonTaxableBalance)}`}
            />
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Year-by-year split of provident fund interest under Rule 9D
              </caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th scope="col" className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Year
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Taxable interest
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    TDS
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Taxable balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-slate-100 last:border-b-0">
                    <th scope="row" className="px-3 py-2.5 text-left font-semibold text-slate-700">
                      {row.year}
                    </th>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                      {formatCurrency(row.taxableInterest)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">
                      {row.tdsDeducted > 0 ? formatCurrency(row.tdsDeducted) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-brandDeepNavy">
                      {formatCurrency(row.closingTaxableBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
            Interest is applied here to the opening balance plus the whole year&apos;s
            contribution. A real fund credits interest on monthly running balances, so the first
            year of each contribution is slightly overstated. TDS is shown where taxable interest
            for the year exceeds ₹5,000; the interest remains taxable in your hands either way.
          </p>
        </section>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
