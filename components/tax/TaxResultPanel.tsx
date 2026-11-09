'use client';
import React, { useMemo } from 'react';
import { calculateIndianIncomeTax, TaxInput, TaxResult } from '@/lib/tax/calculator';
import { TaxVisualComparison } from './TaxVisualComparison';
import { TaxSlabBreakdown } from './TaxSlabBreakdown';
import { useDownloadTaxPdf } from '@/hooks/useDownloadTaxPdf';
import { useCalculatorResult } from '@/components/useCalculatorResult';

interface TaxResultPanelProps {
  result: TaxResult | null;
  input: TaxInput;
  taxYear: string;
}

function formatInr(value: number) {
  return `Rs ${Math.round(value).toLocaleString('en-IN')}`;
}

function estimateBreakEvenAdditionalOldDeduction(input: TaxInput, taxYear: string) {
  const base = calculateIndianIncomeTax(input, taxYear);
  if (base.oldRegime.finalTax <= base.newRegime.finalTax) {
    return 0;
  }

  let low = 0;
  let high = Math.max(0, Math.round(input.grossSalary));
  let answer: number | null = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const simulatedInput: TaxInput = {
      ...input,
      otherDeductionsOldRegime: input.otherDeductionsOldRegime + mid,
    };
    const simulated = calculateIndianIncomeTax(simulatedInput, taxYear);

    if (simulated.oldRegime.finalTax <= base.newRegime.finalTax) {
      answer = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return answer;
}

export function TaxResultPanel({ result, input, taxYear }: TaxResultPanelProps) {
  const { handleDownloadTaxPdf, isGenerating, error } = useDownloadTaxPdf();
  useCalculatorResult(result, result !== null && Number.isFinite(input.grossSalary) && input.grossSalary > 0);

  const breakEvenAdditionalOldDeduction = useMemo(
    () => estimateBreakEvenAdditionalOldDeduction(input, taxYear),
    [input, taxYear]
  );

  if (!result) return null;

  const { recommendedRegime, oldRegime, newRegime, savingsAmount } = result;

  let recommendationTitle = '';
  let recommendationClass = '';
  let rationale = '';

  if (recommendedRegime === 'Old') {
    recommendationTitle = 'Old Regime May Be Lower in This Estimate';
    recommendationClass = 'bg-indigo-50 border-indigo-200 text-indigo-900';
    rationale = `In this scenario, old regime estimated tax is lower by ${formatInr(savingsAmount)}. This can happen when deduction values are relatively high.`;
  } else if (recommendedRegime === 'New') {
    recommendationTitle = 'New Regime May Be Lower in This Estimate';
    recommendationClass = 'bg-brandGrowthGreen/10 border-brandGrowthGreen/30 text-brandDeepNavy';
    rationale = `In this scenario, new regime estimated tax is lower by ${formatInr(savingsAmount)}. This can happen when old-regime-only deductions are limited.`;
  } else {
    recommendationTitle = 'Both Regimes Are Equal in This Estimate';
    recommendationClass = 'bg-slate-50 border-slate-200 text-slate-800';
    rationale = 'For your current inputs, estimated tax is the same under both regimes.';
  }

  return (
    <div data-calculator-result className="sticky top-28 z-10 rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8 lg:top-32">
      <h2 className="text-xl font-black tracking-tight text-brandDeepNavy">Your Tax Estimate</h2>
      <p className="mt-1 text-xs text-brandMuted">For {result.taxYear}</p>

      <div className={`mt-6 rounded-2xl border p-5 ${recommendationClass}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Estimated comparison</p>
        <p className="mt-1 text-lg font-black">{recommendationTitle}</p>
        <p className="mt-2 text-xs leading-relaxed opacity-90">{rationale}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
        <h3 className="border-b border-slate-200 pb-1 font-bold text-slate-700">Result insight</h3>
        <div className="mt-2 space-y-1.5 text-slate-700">
          <div className="flex justify-between">
            <span>Old regime estimated tax</span>
            <span className="font-semibold">{formatInr(oldRegime.finalTax)}</span>
          </div>
          <div className="flex justify-between">
            <span>New regime estimated tax</span>
            <span className="font-semibold">{formatInr(newRegime.finalTax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated difference</span>
            <span className="font-semibold">{formatInr(Math.abs(oldRegime.finalTax - newRegime.finalTax))}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxable income (old)</span>
            <span className="font-semibold">{formatInr(oldRegime.taxableIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxable income (new)</span>
            <span className="font-semibold">{formatInr(newRegime.taxableIncome)}</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
            Recommended lower-tax regime in this estimate:{' '}
            <span className="font-semibold">
              {recommendedRegime === 'Equal' ? 'Both are equal' : `${recommendedRegime} regime`}
            </span>
            .
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
            Break-even additional old-regime-only deduction estimate:{' '}
            <span className="font-semibold">
              {breakEvenAdditionalOldDeduction === null
                ? 'Not reached within this input range'
                : formatInr(breakEvenAdditionalOldDeduction)}
            </span>
            .
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
            Cess note: both estimates include 4% health and education cess after rebate handling.
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
            The estimate applies the rebate and marginal relief rules for the selected year.
          </div>
        </div>
      </div>

      <TaxVisualComparison oldTax={oldRegime.finalTax} newTax={newRegime.finalTax} />
      <TaxSlabBreakdown oldRegime={oldRegime} newRegime={newRegime} />

      <div className="mt-8 flex flex-col gap-3 border-t border-brandBorder pt-6">
        <div>
          <button
            onClick={() => handleDownloadTaxPdf(input, result, taxYear)}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brandNavy px-4 py-3 text-sm font-bold text-white transition hover:bg-brandDeepNavy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? 'Generating PDF...' : 'Download Tax Estimate PDF'}
          </button>
          <p className="mt-2 text-center text-[10px] text-brandMuted">
            Includes your entered values and tax-estimate comparison from this page.
          </p>
          {error ? <p className="mt-1 text-center text-[10px] font-medium text-red-600">{error}</p> : null}
        </div>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-brandMuted">
          Educational estimate only. Tax rules change by financial year. Verify slabs, rebates, deductions, and final
          tax with official filing utilities and records.
        </p>
      </div>
    </div>
  );
}
