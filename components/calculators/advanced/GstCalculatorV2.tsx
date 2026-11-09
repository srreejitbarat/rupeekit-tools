'use client';

import React, { useState, useMemo } from 'react';
import type { Tool } from '@/lib/tools';
import { useCalculatorResult } from '@/components/useCalculatorResult';
import { calculateGst, GST_CATEGORIES } from '@/lib/gst/india-gst-rates';

const formatCurrency = (val: number) => {
  if (!Number.isFinite(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);
};

export default function GstCalculatorV2({ tool }: { tool: Tool }) {
  // Inputs state
  const [amount, setAmount] = useState<number | ''>(10000);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra');
  const [categoryKey, setCategoryKey] = useState<string>('standard-high');
  const [customRate, setCustomRate] = useState<number>(18);

  // Find active category
  const activeCategory = useMemo(() => {
    return GST_CATEGORIES.find(cat => cat.key === categoryKey) || GST_CATEGORIES[3];
  }, [categoryKey]);

  // Determine active rate
  const activeRate = useMemo(() => {
    if (categoryKey === 'custom') {
      return customRate;
    }
    return activeCategory.defaultRate;
  }, [categoryKey, activeCategory, customRate]);

  // GST calculations
  const result = useMemo(() => {
    return calculateGst({
      amount: amount === '' ? 0 : amount,
      rate: activeRate,
      mode,
      supplyType,
    });
  }, [amount, activeRate, mode, supplyType]);

  useCalculatorResult(result, typeof amount === 'number' && amount > 0 && Number.isFinite(result.finalAmount));

  return (
    <div className="space-y-8">
      {/* Top informational header banner */}
      <div className="rounded-2xl border border-brandNavy/10 bg-brandNavy/5 p-4 text-sm leading-6 text-brandNavy">
        <p className="font-bold flex items-center gap-1.5 text-brandDeepNavy">
          <span>📊</span> Interactive Goods & Services Tax (GST) Calculator
        </p>
        <p className="mt-1 text-slate-600">
          Determine the net price, tax amount, and SGST/CGST/IGST breakdown under Indian GST rules. Use predefined tax slabs or input a custom tax rate.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Form Controls */}
        <div className="space-y-6">
          {/* Section 1: Principal Details */}
          <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
              1. Base Amount & Mode
            </h3>
            
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="flex justify-between text-sm font-semibold text-slate-700">
                  Amount
                  <span className="text-xs text-brandMuted">in INR (₹)</span>
                </span>
                <input
                  type="number"
                  value={amount}
                  min={0}
                  step={500}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  {mode === 'add'
                    ? 'The net amount before adding GST tax.'
                    : 'The final amount including GST tax.'}
                </span>
              </label>

              {/* Mode Selector */}
              <div>
                <span className="text-sm font-semibold text-slate-700">Calculation Type</span>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-calculation-action
                    onClick={() => setMode('add')}
                    className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${
                      mode === 'add'
                        ? 'border-brandNavy bg-brandNavy/5 text-brandNavy'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>➕ Add GST</span>
                    <span className="text-[10px] font-normal opacity-85">Amount + Tax = Total</span>
                  </button>
                  <button
                    type="button"
                    data-calculation-action
                    onClick={() => setMode('remove')}
                    className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${
                      mode === 'remove'
                        ? 'border-brandNavy bg-brandNavy/5 text-brandNavy'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>➖ Remove GST</span>
                    <span className="text-[10px] font-normal opacity-85">Amount (inclusive) - Tax = Base</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: GST Categories & Rates */}
          <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
              2. GST Rate & Category
            </h3>
            
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Select GST Rate Slab / Category</span>
                <select
                  value={categoryKey}
                  onChange={(e) => setCategoryKey(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white"
                >
                  {GST_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Show category description */}
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                <span className="font-bold text-slate-700 block mb-0.5">Classification Details:</span>
                {activeCategory.description}
              </div>

              {/* Custom rate controls */}
              {categoryKey === 'custom' && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-sm font-semibold text-slate-700">
                    <span>Custom GST Rate</span>
                    <span className="text-brandNavy font-bold">{customRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.1"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brandNavy mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% (Exempt)</span>
                    <span>28% (Luxury)</span>
                    <span>50% (Max)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Supply / Location Split */}
          <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
              3. Supply Type (Tax Split Rules)
            </h3>
            
            <div className="mt-4">
              <span className="text-sm font-semibold text-slate-700">Location of Transaction</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-calculation-action
                  onClick={() => setSupplyType('intra')}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${
                    supplyType === 'intra'
                      ? 'border-brandNavy bg-brandNavy/5 text-brandNavy'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>🏙️ Intra-State</span>
                  <span className="text-[10px] font-normal opacity-85">Splits into CGST + SGST</span>
                </button>
                <button
                  type="button"
                  data-calculation-action
                  onClick={() => setSupplyType('inter')}
                  className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${
                    supplyType === 'inter'
                      ? 'border-brandNavy bg-brandNavy/5 text-brandNavy'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>🌉 Inter-State</span>
                  <span className="text-[10px] font-normal opacity-85">Single levy IGST</span>
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {supplyType === 'intra'
                  ? 'Both buyer and seller are located in the same State/UT. Taxes are shared equally between Central and State governments.'
                  : 'Buyer and seller are located in different States/UTs. A unified tax goes to the Central government.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Outcomes & Invoice Preview */}
        <div className="space-y-6">
          {/* Key Summary Cards */}
          <div data-calculator-result className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-brandDeepNavy mb-4">Calculation Results</h3>
            
            <div className="space-y-4">
              {/* Highlighted final billing cost */}
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 ring-2 ring-brandNavy/20">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Final Amount (Gross)
                </span>
                <p className="mt-1 text-3xl font-black text-brandDeepNavy tracking-tight">
                  {formatCurrency(result.finalAmount)}
                </p>
              </div>

              {/* Sub-cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Price (Net)</span>
                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {formatCurrency(result.baseAmount)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total GST Tax ({activeRate}%)</span>
                  <p className="mt-1 text-xl font-bold text-brandGrowthGreen">
                    {formatCurrency(result.gstAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Invoice Receipt Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 relative overflow-hidden">
            {/* Design accents for ticket/receipt feel */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brandNavy" />
            <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-bold text-brandDeepNavy uppercase tracking-wider">RupeeKit GST Invoice</h4>
                <p className="text-[10px] text-slate-400">Tax Breakdown Receipt</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                Draft
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal (Base Cost)</span>
                <span className="text-slate-800">{formatCurrency(result.baseAmount)}</span>
              </div>

              {/* Conditional Tax Splits */}
              {supplyType === 'intra' ? (
                <>
                  <div className="flex justify-between pl-3 border-l-2 border-brandNavy/20 py-0.5">
                    <span className="text-slate-500">CGST (Central Tax) @ {(activeRate / 2).toFixed(2)}%</span>
                    <span className="text-slate-800">{formatCurrency(result.cgst)}</span>
                  </div>
                  <div className="flex justify-between pl-3 border-l-2 border-brandNavy/20 py-0.5">
                    <span className="text-slate-500">SGST (State Tax) @ {(activeRate / 2).toFixed(2)}%</span>
                    <span className="text-slate-800">{formatCurrency(result.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between pl-3 border-l-2 border-brandNavy/20 py-0.5">
                  <span className="text-slate-500">IGST (Integrated Tax) @ {activeRate.toFixed(2)}%</span>
                  <span className="text-slate-800">{formatCurrency(result.igst)}</span>
                </div>
              )}

              <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800">Total Invoice Amount</span>
                <span className="text-lg font-black text-brandDeepNavy">{formatCurrency(result.finalAmount)}</span>
              </div>
            </div>

            {/* Visual Indicator of tax component percentage using dynamic SVG / stacked bar */}
            {activeRate > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Composition Analysis
                </span>
                
                {/* SVG Visual bar */}
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
                  <div
                    style={{ width: `${(result.baseAmount / result.finalAmount) * 100}%` }}
                    className="h-full bg-brandNavy transition-all duration-300"
                    title={`Base Price: ${((result.baseAmount / result.finalAmount) * 100).toFixed(1)}%`}
                  />
                  {supplyType === 'intra' ? (
                    <>
                      <div
                        style={{ width: `${(result.cgst / result.finalAmount) * 100}%` }}
                        className="h-full bg-amber-500 transition-all duration-300"
                        title={`CGST: ${((result.cgst / result.finalAmount) * 100).toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${(result.sgst / result.finalAmount) * 100}%` }}
                        className="h-full bg-brandGrowthGreen transition-all duration-300"
                        title={`SGST: ${((result.sgst / result.finalAmount) * 100).toFixed(1)}%`}
                      />
                    </>
                  ) : (
                    <div
                      style={{ width: `${(result.igst / result.finalAmount) * 100}%` }}
                      className="h-full bg-brandGrowthGreen transition-all duration-300"
                      title={`IGST: ${((result.igst / result.finalAmount) * 100).toFixed(1)}%`}
                    />
                  )}
                </div>

                {/* SVG legend */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brandNavy" />
                    <span>Base: {((result.baseAmount / result.finalAmount) * 100).toFixed(1)}%</span>
                  </div>
                  {supplyType === 'intra' ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>CGST: {((result.cgst / result.finalAmount) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-brandGrowthGreen" />
                        <span>SGST: {((result.sgst / result.finalAmount) * 100).toFixed(1)}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-brandGrowthGreen" />
                      <span>IGST: {((result.igst / result.finalAmount) * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories table info panel */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
          India GST Rate Structure & Slabs
        </h4>
        <div className="mt-4 overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full min-w-[500px] border-collapse text-left text-xs font-semibold">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">GST Slab</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Typical Included Items / Services</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {GST_CATEGORIES.filter(cat => cat.key !== 'custom').map((cat) => (
                <tr key={cat.key} className={cat.key === categoryKey ? "bg-brandNavy/[0.02]" : ""}>
                  <td className="px-4 py-3 font-bold text-brandDeepNavy">{cat.defaultRate}%</td>
                  <td className="px-4 py-3 font-bold">{cat.label.replace(/\s*\(\d+%\)/, '')}</td>
                  <td className="px-4 py-3 font-normal text-slate-500 leading-relaxed">{cat.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimers card */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-xs text-amber-900 leading-relaxed">
        <p className="font-bold uppercase tracking-wider text-amber-800">⚠️ Educational Estimate Only</p>
        <p className="mt-2 text-amber-950">
          This calculator provides basic mathematical estimations based on standard Indian GST rates and slab classifications. Actual GST rates, exemption rules, reverse charge mechanism (RCM) applicability, input tax credit (ITC) eligibility, cess additions, and local state splits may vary significantly depending on the exact HSN (Harmonized System of Nomenclature) or SAC (Services Accounting Code) code, industry guidelines, and specific government notifications. Please consult a qualified tax professional or certified chartered accountant to verify tax rates before taking business decisions.
        </p>
      </div>
    </div>
  );
}
