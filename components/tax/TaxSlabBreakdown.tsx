import React, { useState } from 'react';
import { RegimeTaxResult } from '@/lib/tax/calculator';

interface TaxSlabBreakdownProps {
  oldRegime: RegimeTaxResult;
  newRegime: RegimeTaxResult;
}

export function TaxSlabBreakdown({ oldRegime, newRegime }: TaxSlabBreakdownProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-xl border border-brandBorder bg-white py-3 text-sm font-bold text-brandNavy hover:bg-slate-50 transition"
      >
        View Detailed Math Calculation ↓
      </button>
    );
  }

  const renderBreakdown = (title: string, result: RegimeTaxResult) => (
    <div className="flex-1 rounded-2xl border border-brandBorder bg-white p-5 shadow-sm text-sm">
      <h4 className="font-bold text-brandDeepNavy mb-4 border-b border-brandBorder pb-2">{title}</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-slate-600">
          <span>Gross Income</span>
          <span>₹{(result.taxableIncome + result.totalDeductions).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-brandGrowthGreen font-medium">
          <span>Total Deductions</span>
          <span>- ₹{result.totalDeductions.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between font-bold text-brandDeepNavy pt-2 border-t border-brandBorder/50">
          <span>Taxable Income</span>
          <span>₹{result.taxableIncome.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-brandBorder/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Slab Tax Calculation</span>
          <div className="mt-2 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {result.slabTaxBreakdown.length === 0 && (
              <p className="text-xs text-slate-500 italic">No tax applicable in slabs.</p>
            )}
            {result.slabTaxBreakdown.map((b, i) => (
              <div key={i} className="flex justify-between text-xs text-slate-700 font-medium">
                <span>{b.slab.rate * 100}% on ₹{b.amountInSlab.toLocaleString('en-IN')}</span>
                <span>₹{b.tax.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between font-bold text-slate-700 pt-2 border-t border-brandBorder/50">
          <span>Total Tax Before Rebate</span>
          <span>₹{result.totalSlabTax.toLocaleString('en-IN')}</span>
        </div>

        {result.rebate > 0 && (
          <div className="flex justify-between text-brandGrowthGreen font-medium">
            <span>Tax rebate</span>
            <span>- ₹{result.rebate.toLocaleString('en-IN')}</span>
          </div>
        )}

        {result.surcharge > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Surcharge after marginal relief</span>
            <span>+ ₹{result.surcharge.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Health & Education Cess (4%)</span>
          <span>+ ₹{result.cess.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between font-black text-brandNavy pt-3 mt-3 border-t-2 border-brandBorder text-base">
          <span>Final Tax</span>
          <span>₹{result.finalTax.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-brandDeepNavy">How this was calculated</h3>
        <button onClick={() => setOpen(false)} className="text-xs font-bold text-brandMuted hover:text-brandNavy">
          Hide Details ↑
        </button>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        {renderBreakdown('Old Regime', oldRegime)}
        {renderBreakdown('New Regime', newRegime)}
      </div>
    </div>
  );
}
