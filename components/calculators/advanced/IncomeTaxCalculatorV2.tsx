'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Parser } from 'expr-eval';
import type { Tool } from '@/lib/tools';
import { CalculatorResultSummary } from '@/components/CalculatorVisualizations';

const parser = new Parser({
  operators: {
    add: true,
    concatenate: false,
    conditional: false,
    divide: true,
    factorial: false,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,
    logical: false,
    comparison: false,
    in: false,
    assignment: false,
  },
});

function formatValue(value: number, format: string) {
  if (!Number.isFinite(value)) return 'Check inputs';
  if (format === 'currency') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === 'percent') return `${value.toFixed(2)}%`;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
}

// Tooltip icon SVG
function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block text-slate-400 hover:text-brandNavy transition cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function IncomeTaxCalculatorV2({ tool }: { tool: Tool }) {
  const initialValues = useMemo(() => {
    return Object.fromEntries(tool.inputs.map((input) => [input.key, input.default]));
  }, [tool.inputs]);

  const [values, setValues] = useState<Record<string, number | ''>>(initialValues);
  const [growthPercent, setGrowthPercent] = useState<number | ''>('');
  
  // Show projection feature toggle
  const [showProjection, setShowProjection] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const numericValues = useMemo(() => {
    const next: Record<string, number> = {};
    for (const [k, v] of Object.entries(values)) {
      next[k] = v === '' ? 0 : v;
    }
    return next;
  }, [values]);

  // Current Year Evaluation
  const currentResults = useMemo(() => {
    const context: Record<string, number> = { ...numericValues };
    return tool.outputs.map((output) => {
      try {
        const value = parser.parse(output.formula).evaluate(context);
        context[output.key] = value;
        return { ...output, value, formatted: formatValue(value, output.format) };
      } catch (error) {
        return { ...output, value: Number.NaN, formatted: 'Check inputs' };
      }
    });
  }, [tool.outputs, numericValues]);

  // Projected Year Evaluation
  const projectedResults = useMemo(() => {
    const growth = growthPercent === '' ? 0 : growthPercent;
    if (growth <= 0) return null;

    const projectedGross = numericValues.grossAnnualIncome * (1 + growth / 100);
    const context: Record<string, number> = { ...numericValues, grossAnnualIncome: projectedGross };
    
    return tool.outputs.map((output) => {
      try {
        const value = parser.parse(output.formula).evaluate(context);
        context[output.key] = value;
        return { ...output, value, formatted: formatValue(value, output.format) };
      } catch (error) {
        return { ...output, value: Number.NaN, formatted: 'Check inputs' };
      }
    });
  }, [tool.outputs, numericValues, growthPercent]);

  const currentNewTax = currentResults.find(r => r.key === 'taxPayableNewRegime')?.value || 0;
  const projectedNewTax = projectedResults?.find(r => r.key === 'taxPayableNewRegime')?.value || 0;
  const projectedGross = projectedResults ? (numericValues.grossAnnualIncome * (1 + (growthPercent === '' ? 0 : growthPercent) / 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Prominent Disclaimer Banner */}
      <div className="rounded-2xl border-l-4 border-l-amber-500 bg-amber-50 p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-bold text-amber-900">
          ⚠️ Important Notice: Future Tax Planning
        </h3>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          Calculations are based on <strong>current financial year rules</strong>. Future rules (e.g., for FY 2027-28 / AY 2028-29) may vary significantly pending official Union Budget announcements. Use these estimates for educational planning only.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-brandDeepNavy">Tax Details</h2>
        <div className="group relative inline-block">
          <InfoIcon />
          <div className="absolute left-1/2 bottom-full mb-2 w-64 -translate-x-1/2 scale-95 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 pointer-events-none z-10 rounded-lg bg-slate-800 p-3 text-xs text-white shadow-xl">
            <strong>FY vs AY:</strong> &quot;Financial Year&quot; (FY) is when you earn the income (e.g., April 2026 - March 2027). &quot;Assessment Year&quot; (AY) is the year you file taxes for that income (e.g., 2027-28).
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-8">
          <div className="mt-2 grid gap-5">
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
                  onFocus={(e) => e.target.select()}
                  onChange={(event) => {
                    const val = event.target.value;
                    setValues((current) => ({
                      ...current,
                      [input.key]: val === '' ? '' : (Number.isFinite(Number(val)) ? Number(val) : 0),
                    }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white hover:border-slate-400 focus:ring-4 focus:ring-brandNavy/10"
                />
                {input.help ? <span className="mt-2 block text-xs leading-5 text-slate-500">{input.help}</span> : null}
              </label>
            ))}
          </div>

          {/* Future Projection Input (Optional) */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setShowProjection(!showProjection)}
              className="flex items-center gap-2 text-sm font-bold text-brandNavy hover:text-brandDeepNavy transition-colors"
            >
              <span>{showProjection ? '−' : '+'}</span>
              Future Projection Mode
            </button>
            
            <div className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${showProjection ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="rounded-2xl border border-brandGrowthGreen/20 bg-brandGrowthGreen/5 p-4">
                <label className="block">
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold text-brandGrowthGreen">
                    Expected Annual Income Growth
                    <span className="font-medium">%</span>
                  </span>
                  <input
                    type="number"
                    value={growthPercent}
                    min={0}
                    max={100}
                    step={1}
                    placeholder="e.g., 10 for a 10% appraisal"
                    onFocus={(e) => e.target.select()}
                    onChange={(event) => {
                      const val = event.target.value;
                      setGrowthPercent(val === '' ? '' : Math.max(0, Number(val)));
                    }}
                    className="mt-2 w-full rounded-2xl border border-brandGrowthGreen/30 bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-brandGrowthGreen focus:ring-4 focus:ring-brandGrowthGreen/10"
                  />
                  <span className="mt-2 block text-xs leading-5 text-slate-600">
                    See how a future salary hike affects your tax liability based on current rules.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-8">
            <h2 className="text-xl font-bold text-brandDeepNavy">Current Year Estimate</h2>
            <div className="mt-6">
              <CalculatorResultSummary results={currentResults} />
            </div>
            <p className="mt-6 rounded-2xl bg-white/70 p-4 text-xs leading-5 text-brandMuted border border-brandBorder">
              Note: This &quot;Illustrative Tax Payable&quot; uses simplified calculation parameters. Verify exact slab rates and 87A rebate eligibility via official filing utilities.
            </p>
          </div>

          {/* Compare Years Feature Panel */}
          {projectedResults && mounted && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl border border-brandGrowthGreen/20 bg-gradient-to-br from-white to-brandGrowthGreen/5 p-5 shadow-sm md:p-8">
              <h2 className="text-xl font-bold text-brandDeepNavy">Compare Years Projection</h2>
              <p className="mt-1 text-sm text-slate-600">
                With a {growthPercent}% income increase, your projected gross is <span className="font-bold text-brandGrowthGreen">{formatValue(projectedGross, 'currency')}</span>.
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-transform hover:scale-[1.02]">
                  <p className="text-xs font-semibold uppercase text-slate-500">Current Tax</p>
                  <p className="mt-2 text-xl font-bold text-slate-700">{formatValue(currentNewTax, 'currency')}</p>
                </div>
                <div className="rounded-2xl border border-brandGrowthGreen/30 bg-white p-4 text-center shadow-sm transition-transform hover:scale-[1.02] ring-2 ring-brandGrowthGreen/10">
                  <p className="text-xs font-semibold uppercase text-brandGrowthGreen">Projected Tax</p>
                  <p className="mt-2 text-xl font-black text-brandDeepNavy">
                    <span className="animate-[counter_1s_ease-out]">{formatValue(projectedNewTax, 'currency')}</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-3 text-sm font-semibold border border-brandBorder shadow-sm">
                <span className="text-slate-600">Tax Liability Increase:</span>
                <span className="text-brandGrowthGreen">+{formatValue(projectedNewTax - currentNewTax, 'currency')}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
