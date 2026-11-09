'use client';

import { useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import { useCalculatorResult } from '@/components/useCalculatorResult';
import { solveMonthlyIrr } from '@/lib/finance/apr';

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number) {
  return `${value.toFixed(2)}%`;
}

export default function PersonalLoanAprCalculator({ tool }: { tool: Tool }) {
  const [values, setValues] = useState<Record<string, number | ''>>(() =>
    Object.fromEntries(tool.inputs.map((input) => [input.key, input.default]))
  );

  const numericValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value === '' ? 0 : value])
    ) as Record<string, number>;
  }, [values]);

  const result = useMemo(() => {
    const principal = Math.max(0, numericValues.principal ?? 0);
    const quotedRate = Math.max(0, numericValues.annualInterestRate ?? 0);
    const tenureMonths = Math.max(1, Math.round(numericValues.tenureMonths ?? 1));
    const monthlyRate = quotedRate / 12 / 100;
    const emi = monthlyRate > 0
      ? principal * monthlyRate * (1 + monthlyRate) ** tenureMonths /
        ((1 + monthlyRate) ** tenureMonths - 1)
      : principal / tenureMonths;
    const processingFee = principal * Math.max(0, numericValues.processingFeePercent ?? 0) / 100;
    const processingFeeGst = processingFee * Math.max(0, numericValues.gstPercent ?? 0) / 100;
    const otherUpfront = Math.max(0, numericValues.insuranceAndOtherUpfront ?? 0);
    const advanceEmis = Math.min(
      Math.max(0, Math.round(numericValues.advanceEmis ?? 0)),
      Math.max(tenureMonths - 1, 0)
    );
    const netCash = principal - processingFee - processingFeeGst - otherUpfront - advanceEmis * emi;
    const remainingPayments = tenureMonths - advanceEmis;
    const monthlyIrr = solveMonthlyIrr(netCash, emi, remainingPayments);
    const effectiveAnnualApr = Number.isFinite(monthlyIrr)
      ? ((1 + monthlyIrr) ** 12 - 1) * 100
      : Number.NaN;
    const nominalAnnualisedIrr = Number.isFinite(monthlyIrr) ? monthlyIrr * 12 * 100 : Number.NaN;
    const totalCharges = processingFee + processingFeeGst + otherUpfront;
    const totalInterest = emi * tenureMonths - principal;

    return {
      principal,
      quotedRate,
      tenureMonths,
      emi,
      processingFee,
      processingFeeGst,
      otherUpfront,
      advanceEmis,
      netCash,
      remainingPayments,
      monthlyIrr,
      effectiveAnnualApr,
      nominalAnnualisedIrr,
      totalCharges,
      totalInterest,
      totalBorrowingCost: totalInterest + totalCharges,
      valid: netCash > 0 && Number.isFinite(effectiveAnnualApr),
    };
  }, [numericValues]);

  const validInputs = values.annualInterestRate !== '' && tool.inputs.every(({ key, min, max }) => {
    const value = numericValues[key];
    return Number.isFinite(value) && value >= (min ?? 0) && value <= (max ?? Infinity);
  });
  useCalculatorResult(result, validInputs && result.valid);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-brandDeepNavy">Enter the offer cash flows</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Copy these figures from the sanction letter and Key Facts Statement. Do not use a flat-rate quote in the
            reducing-rate field.
          </p>
          <div className="mt-6 grid gap-5">
            {tool.inputs.map((input) => (
              <label key={input.key} className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                  {input.label}
                  {input.unit ? <span className="font-medium text-slate-500">{input.unit}</span> : null}
                </span>
                <input
                  type="number"
                  value={values[input.key] ?? ''}
                  min={input.min}
                  max={input.max}
                  step={input.step ?? 1}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) => {
                    const next = event.target.value;
                    setValues((current) => ({
                      ...current,
                      [input.key]: next === '' ? '' : Number(next),
                    }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                />
                {input.help ? <span className="mt-2 block text-xs leading-5 text-slate-500">{input.help}</span> : null}
              </label>
            ))}
          </div>
        </div>

        <div data-calculator-result className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brandNavy">Cash-flow result</p>
          <h2 className="mt-2 text-xl font-bold text-brandDeepNavy">Estimated effective annual APR</h2>

          {result.valid ? (
            <>
              <p className="mt-4 text-4xl font-black tracking-tight text-brandDeepNavy">
                {percent(result.effectiveAnnualApr)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This is the compounded annual rate implied by net cash received and the remaining monthly instalments.
                The nominal annualised monthly IRR is {percent(result.nominalAnnualisedIrr)}.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ['Quoted rate', percent(result.quotedRate)],
                  ['Scheduled EMI', currency(result.emi)],
                  ['Net cash received', currency(result.netCash)],
                  ['Upfront charges', currency(result.totalCharges)],
                  ['Scheduled interest', currency(result.totalInterest)],
                  ['Total borrowing cost', currency(result.totalBorrowingCost)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <p className="font-bold">Verify against the lender&apos;s KFS</p>
                <p className="mt-1">
                  The model assumes equal monthly spacing. Disbursal dates, broken-period interest, rounding and charge
                  classification can make the disclosed APR different.
                </p>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
              Upfront deductions leave no valid positive net disbursal, or there are no remaining payments to solve.
              Check the amount, charges, tenure and advance-EMI count.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-7">
        <h2 className="text-xl font-bold text-slate-900">Cash-flow assumptions used</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
          <li>Net disbursal: sanctioned amount minus fees, GST, other upfront charges and advance EMIs.</li>
          <li>Future cash flows: {result.remainingPayments} equal monthly payments of {currency(result.emi)}.</li>
          <li>Advance EMIs are treated as paid at disbursal and removed from the later payment count.</li>
          <li>Late fees, optional future services and broken-period interest are not included.</li>
        </ul>
      </section>
    </div>
  );
}
