import React, { useMemo, useState } from 'react';
import { calculateIndianIncomeTax, TaxInput } from '@/lib/tax/calculator';
import { useCalculatorResult } from '@/components/useCalculatorResult';

interface TaxFutureProjectionProps {
  baseInput: TaxInput;
  taxYear: string;
}

export function TaxFutureProjection({ baseInput, taxYear }: TaxFutureProjectionProps) {
  const [expectedHikePercent, setExpectedHikePercent] = useState(10);
  const [deductionGrowthPercent, setDeductionGrowthPercent] = useState(0);

  const projectedGross = Math.round(baseInput.grossSalary * (1 + expectedHikePercent / 100));
  
  // Apply deduction growth to old regime deductions only as an example
  const projectedInput: TaxInput = useMemo(() => ({
    ...baseInput,
    grossSalary: projectedGross,
    section80C: Math.min(150000, Math.round(baseInput.section80C * (1 + deductionGrowthPercent / 100))),
    section80D: Math.round(baseInput.section80D * (1 + deductionGrowthPercent / 100)),
    employerNPS: Math.round(baseInput.employerNPS * (1 + deductionGrowthPercent / 100)),
  }), [baseInput, deductionGrowthPercent, projectedGross]);

  const projectedResult = useMemo(() => calculateIndianIncomeTax(projectedInput, taxYear), [projectedInput, taxYear]);
  useCalculatorResult(projectedResult, Number.isFinite(projectedGross) && projectedGross > 0);

  return (
    <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-brandDeepNavy">Future Projection Mode</h3>
      <p className="mt-1 text-xs text-brandMuted mb-6">
        Estimate next year&apos;s taxes assuming the current {taxYear} rules remain identical.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Expected Income Increment (%)</label>
          <input 
            type="range" 
            min="0" max="50" step="1"
            value={expectedHikePercent}
            onChange={(e) => setExpectedHikePercent(Number(e.target.value))}
            className="w-full accent-brandNavy"
          />
          <div className="text-right text-sm font-bold text-brandNavy">{expectedHikePercent}% (₹{projectedGross.toLocaleString('en-IN')})</div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Expected Deduction Growth (%)</label>
          <input 
            type="range" 
            min="0" max="50" step="1"
            value={deductionGrowthPercent}
            onChange={(e) => setDeductionGrowthPercent(Number(e.target.value))}
            className="w-full accent-brandGrowthGreen"
          />
          <div className="text-right text-sm font-bold text-brandGrowthGreen">{deductionGrowthPercent}%</div>
        </div>
      </div>

      <div data-calculator-result className="mt-8 rounded-xl bg-slate-50 p-5 border border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Projected Output</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="block text-xs text-slate-600">Projected Old Regime Tax</span>
            <span className="text-xl font-black text-brandDeepNavy">₹{projectedResult.oldRegime.finalTax.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-600">Projected New Regime Tax</span>
            <span className="text-xl font-black text-brandDeepNavy">₹{projectedResult.newRegime.finalTax.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-brandMuted">
          *Future projection uses current {taxYear} tax rules for estimation. Actual rules may change.
        </p>
      </div>
    </div>
  );
}
