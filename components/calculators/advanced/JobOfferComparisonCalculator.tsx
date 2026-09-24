'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import {
  MAX_OFFERS,
  compareJobOffers,
  type JobOffer,
  type JobOfferAssumptions,
} from '@/lib/calculators/job-offer';
import type { FinancialYear } from '@/lib/tax/india-income-tax';
import {
  CalculatorGovernanceStrip,
  NumericField,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

type OfferDraft = {
  label: string;
  fixedAnnual: NumericValue;
  variableAnnual: NumericValue;
  variablePayoutPercent: NumericValue;
  basicPercent: NumericValue;
  employerPfInCtc: boolean;
  benefitsAnnual: NumericValue;
  workCostsAnnual: NumericValue;
  joiningBonus: NumericValue;
};

const OFFER_DEFAULTS: OfferDraft[] = [
  {
    label: 'Offer A',
    fixedAnnual: 1_500_000,
    variableAnnual: 200_000,
    variablePayoutPercent: 70,
    basicPercent: 40,
    employerPfInCtc: true,
    benefitsAnnual: 100_000,
    workCostsAnnual: 120_000,
    joiningBonus: 100_000,
  },
  {
    label: 'Offer B',
    fixedAnnual: 1_700_000,
    variableAnnual: 100_000,
    variablePayoutPercent: 90,
    basicPercent: 30,
    employerPfInCtc: true,
    benefitsAnnual: 80_000,
    workCostsAnnual: 180_000,
    joiningBonus: 0,
  },
  {
    label: 'Offer C',
    fixedAnnual: 1_600_000,
    variableAnnual: 150_000,
    variablePayoutPercent: 60,
    basicPercent: 50,
    employerPfInCtc: false,
    benefitsAnnual: 60_000,
    workCostsAnnual: 60_000,
    joiningBonus: 50_000,
  },
];

const FINANCIAL_YEARS: FinancialYear[] = ['2024-25', '2025-26', '2026-27'];

function toOffer(draft: OfferDraft): JobOffer {
  return {
    label: draft.label,
    fixedAnnual: numeric(draft.fixedAnnual),
    variableAnnual: numeric(draft.variableAnnual),
    variablePayoutPercent: numeric(draft.variablePayoutPercent),
    basicPercent: numeric(draft.basicPercent),
    employerPfInCtc: draft.employerPfInCtc,
    benefitsAnnual: numeric(draft.benefitsAnnual),
    workCostsAnnual: numeric(draft.workCostsAnnual),
    joiningBonus: numeric(draft.joiningBonus),
  };
}

function OfferColumn({
  draft,
  index,
  onChange,
  onRemove,
}: {
  draft: OfferDraft;
  index: number;
  onChange: (index: number, patch: Partial<OfferDraft>) => void;
  onRemove?: () => void;
}) {
  const id = (field: string) => `offer-${index}-${field}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-brandDeepNavy">{draft.label}</h3>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        <NumericField
          id={id('fixed')}
          label="Fixed pay"
          unit="Rs/year"
          value={draft.fixedAnnual}
          step={10_000}
          onChange={(value) => onChange(index, { fixedAnnual: value })}
        />
        <NumericField
          id={id('variable')}
          label="Variable pay at full payout"
          unit="Rs/year"
          value={draft.variableAnnual}
          step={10_000}
          onChange={(value) => onChange(index, { variableAnnual: value })}
        />
        <NumericField
          id={id('payout')}
          label="Expected payout"
          unit="%"
          value={draft.variablePayoutPercent}
          max={100}
          onChange={(value) => onChange(index, { variablePayoutPercent: value })}
          help="Use the historical payout record at that company, not the advertised maximum."
        />
        <NumericField
          id={id('basic')}
          label="Basic pay share of CTC"
          unit="%"
          value={draft.basicPercent}
          max={100}
          onChange={(value) => onChange(index, { basicPercent: value })}
          help="Drives provident fund on both sides. A higher basic lowers cash and raises retirement saving."
        />
        <label
          htmlFor={id('employerPf')}
          className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
        >
          <input
            id={id('employerPf')}
            type="checkbox"
            checked={draft.employerPfInCtc}
            onChange={(event) => onChange(index, { employerPfInCtc: event.target.checked })}
            className="mt-1 h-4 w-4 flex-none accent-brandNavy"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-700">
              Employer PF is inside this CTC
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Uncheck when the employer contribution is paid on top of the quoted number.
            </span>
          </span>
        </label>
        <NumericField
          id={id('benefits')}
          label="Benefits you value"
          unit="Rs/year"
          value={draft.benefitsAnnual}
          step={5_000}
          onChange={(value) => onChange(index, { benefitsAnnual: value })}
          help="Insurance cover, devices, meals. Added after tax, never to the taxable salary."
        />
        <NumericField
          id={id('costs')}
          label="Recurring work costs"
          unit="Rs/year"
          value={draft.workCostsAnnual}
          step={5_000}
          onChange={(value) => onChange(index, { workCostsAnnual: value })}
          help="Commute, relocation rent premium and anything else the job forces you to spend."
        />
        <NumericField
          id={id('joining')}
          label="Joining bonus"
          unit="Rs, one-time"
          value={draft.joiningBonus}
          step={5_000}
          onChange={(value) => onChange(index, { joiningBonus: value })}
        />
      </div>
    </div>
  );
}

export default function JobOfferComparisonCalculator({ tool }: { tool: Tool }) {
  const [drafts, setDrafts] = useState<OfferDraft[]>(OFFER_DEFAULTS.slice(0, 2));
  const [financialYear, setFinancialYear] = useState<FinancialYear>('2026-27');
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [monthlyProfessionalTax, setMonthlyProfessionalTax] = useState<NumericValue>(200);
  const [input80C, setInput80C] = useState<NumericValue>(0);
  const [input80D, setInput80D] = useState<NumericValue>(0);

  const assumptions: JobOfferAssumptions = useMemo(
    () => ({
      financialYear,
      regime,
      monthlyProfessionalTax: numeric(monthlyProfessionalTax),
      input80C: numeric(input80C),
      input80D: numeric(input80D),
    }),
    [financialYear, regime, monthlyProfessionalTax, input80C, input80D]
  );

  const comparison = useMemo(
    () => compareJobOffers(drafts.map(toOffer), assumptions),
    [drafts, assumptions]
  );

  const updateOffer = (index: number, patch: Partial<OfferDraft>) => {
    setDrafts((current) =>
      current.map((draft, i) => (i === index ? { ...draft, ...patch } : draft))
    );
  };

  const addOffer = () => {
    setDrafts((current) =>
      current.length >= MAX_OFFERS ? current : [...current, OFFER_DEFAULTS[current.length]]
    );
  };

  const removeOffer = (index: number) => {
    setDrafts((current) =>
      current.length <= 2
        ? current
        : current
            .filter((_, i) => i !== index)
            .map((draft, i) => ({ ...draft, label: OFFER_DEFAULTS[i].label }))
    );
  };

  const { results, bestByCashIndex, bestByTotalValueIndex, rankingsDisagree, cashGapToRunnerUp } =
    comparison;
  const cashWinner = results[bestByCashIndex];
  const valueWinner = results[bestByTotalValueIndex];

  const rows: { label: string; hint?: string; pick: (index: number) => string; strong?: boolean }[] = [
    {
      label: 'Taxable salary',
      hint: 'Fixed pay plus expected variable',
      pick: (i) => formatCurrency(results[i].recurringCtc),
    },
    {
      label: 'Income tax',
      hint: 'Including 4% cess',
      pick: (i) =>
        `${formatCurrency(results[i].recurringTax)} (${formatNumber(
          results[i].effectiveTaxRatePercent
        )}%)`,
    },
    {
      label: 'In-hand pay',
      hint: 'After tax, PF and professional tax',
      pick: (i) => formatCurrency(results[i].recurringInHand),
    },
    {
      label: 'Net cash value',
      hint: 'In-hand plus benefits minus work costs',
      pick: (i) => formatCurrency(results[i].recurringNetCashValue),
      strong: true,
    },
    {
      label: 'Per month',
      pick: (i) => formatCurrency(results[i].monthlyRecurringNetCashValue),
    },
    {
      label: 'Retirement saving',
      hint: 'Employee plus employer PF',
      pick: (i) => formatCurrency(results[i].retirementSavingsAnnual),
    },
    {
      label: 'Total economic value',
      hint: 'Net cash plus retirement saving',
      pick: (i) => formatCurrency(results[i].recurringTotalEconomicValue),
      strong: true,
    },
    {
      label: 'Year one only',
      hint: 'Net cash including the post-tax joining bonus',
      pick: (i) => formatCurrency(results[i].firstYearNetCashValue),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
        <p className="font-bold">CTC is not comparable across employers</p>
        <p className="mt-1">
          Two offers at the same CTC pay differently because basic pay is a different share of each,
          and provident fund is a percentage of basic. Every offer below is run through the same
          income-tax calculation, so the figures compared are post-tax rather than headline.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">Shared tax assumptions</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          One set of assumptions is applied to every offer. Varying them per offer would compare
          tax positions rather than the offers themselves.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label htmlFor="assumption-fy" className="block">
            <span className="block text-sm font-semibold text-slate-700">Financial year</span>
            <select
              id="assumption-fy"
              value={financialYear}
              onChange={(event) => setFinancialYear(event.target.value as FinancialYear)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
            >
              {FINANCIAL_YEARS.map((year) => (
                <option key={year} value={year}>
                  FY {year}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="assumption-regime" className="block">
            <span className="block text-sm font-semibold text-slate-700">Tax regime</span>
            <select
              id="assumption-regime"
              value={regime}
              onChange={(event) => setRegime(event.target.value as 'new' | 'old')}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
            >
              <option value="new">New regime</option>
              <option value="old">Old regime</option>
            </select>
          </label>
          <NumericField
            id="assumption-pt"
            label="Professional tax"
            unit="Rs/month"
            value={monthlyProfessionalTax}
            max={1_000}
            step={50}
            onChange={setMonthlyProfessionalTax}
          />
          {regime === 'old' ? (
            <>
              <NumericField
                id="assumption-80c"
                label="80C beyond employee PF"
                unit="Rs/year"
                value={input80C}
                max={150_000}
                step={5_000}
                onChange={setInput80C}
              />
              <NumericField
                id="assumption-80d"
                label="80D health premium"
                unit="Rs/year"
                value={input80D}
                max={100_000}
                step={5_000}
                onChange={setInput80D}
              />
            </>
          ) : null}
        </div>
        {regime === 'old' ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            HRA exemption is not modelled here — it depends on the rent you pay and your city, not
            on the offer. Work it out on the{' '}
            <a className="font-semibold underline" href="/tools/hra-exemption-calculator-india">
              HRA exemption calculator
            </a>{' '}
            and treat the result as a reduction in tax for both offers alike.
          </p>
        ) : null}
      </div>

      <div className={`grid gap-5 ${drafts.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {drafts.map((draft, index) => (
          <OfferColumn
            key={draft.label}
            draft={draft}
            index={index}
            onChange={updateOffer}
            onRemove={drafts.length > 2 ? () => removeOffer(index) : undefined}
          />
        ))}
      </div>

      {drafts.length < MAX_OFFERS ? (
        <button
          type="button"
          onClick={addOffer}
          className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-brandNavy hover:text-brandDeepNavy"
        >
          + Add a third offer
        </button>
      ) : null}

      {cashWinner && valueWinner ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
            On ongoing-year net cash
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-emerald-700">
            {cashWinner.label} leads by {formatCurrency(cashGapToRunnerUp)} a year
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            That is {formatCurrency(cashGapToRunnerUp / 12)} a month against the next best offer,
            after tax, provident fund, benefits and work costs.
          </p>
          {rankingsDisagree ? (
            <p className="mt-3 rounded-2xl border border-emerald-300 bg-white/70 p-3 text-sm leading-6 text-emerald-900">
              <strong>{valueWinner.label} wins on total economic value.</strong> It pays less cash
              but puts more into provident fund, which is still your money. Which one is better
              depends on whether you need the cash now or are saving for the long term.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <caption className="sr-only">
            Post-tax comparison of each offer for an ongoing year
          </caption>
          <thead>
            <tr>
              <th scope="col" className="px-5 py-4 text-sm font-bold text-slate-700">
                Ongoing year
              </th>
              {results.map((result, index) => (
                <th
                  key={result.label}
                  scope="col"
                  className={`px-5 py-4 text-right text-sm font-bold ${
                    index === bestByCashIndex ? 'text-emerald-700' : 'text-brandDeepNavy'
                  }`}
                >
                  {result.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-200">
                <th scope="row" className="px-5 py-3 text-left align-top text-sm font-semibold text-slate-700">
                  {row.label}
                  {row.hint ? (
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">{row.hint}</span>
                  ) : null}
                </th>
                {results.map((result, index) => (
                  <td
                    key={result.label}
                    className={`px-5 py-3 text-right align-top tabular-nums ${
                      row.strong
                        ? 'text-base font-bold text-brandDeepNavy'
                        : 'text-sm font-semibold text-slate-600'
                    }`}
                  >
                    {row.pick(index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
        <p className="font-bold text-slate-700">What this model assumes</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            Benefits you enter are valued by you and are not taxed through payroll. Taxable
            perquisites should be added to fixed pay instead.
          </li>
          <li>
            The joining bonus is taxed as salary but carries no provident fund, so it is added to
            year one only.
          </li>
          <li>
            Employee provident fund is deducted from in-hand pay but counted in total economic
            value, because it remains yours.
          </li>
          <li>
            Surcharge on income above ₹50 lakh and HRA exemption are not modelled. Educational
            estimate only.
          </li>
        </ul>
      </div>

      <CalculatorGovernanceStrip tool={tool} />
    </div>
  );
}
