'use client';

import React, { useState, useMemo } from 'react';
import type { Tool } from '@/lib/tools';
import { estimateIncomeTax, type FinancialYear } from '@/lib/tax/india-income-tax';

// Assessment year and the Budget whose slabs apply, per financial year. Keep in
// step with FinancialYear in lib/tax/india-income-tax.ts.
const FY_META: Record<FinancialYear, { ay: string; budget: string }> = {
  '2026-27': { ay: '2027-28', budget: 'Budget 2025 slabs, unchanged by Budget 2026' },
  '2025-26': { ay: '2026-27', budget: 'Budget 2025 slabs' },
  '2024-25': { ay: '2025-26', budget: 'Budget 2024 slabs' },
};

const formatCurrency = (val: number) => {
  if (!Number.isFinite(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function SalaryInHandCalculatorV2({ tool }: { tool: Tool }) {
  // Inputs state
  const [annualCtc, setAnnualCtc] = useState<number | ''>(1200000);
  const [autoBasic, setAutoBasic] = useState<boolean>(true);
  const [basicPercent, setBasicPercent] = useState<number>(40);
  const [employerPfIncluded, setEmployerPfIncluded] = useState<boolean>(true);
  const [employeePfRate, setEmployeePfRate] = useState<number>(12);
  const [professionalTax, setProfessionalTax] = useState<number | ''>(200);
  const [otherDeductions, setOtherDeductions] = useState<number | ''>(0);
  
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [financialYear, setFinancialYear] = useState<FinancialYear>('2026-27');
  const [ageGroup, setAgeGroup] = useState<'below60' | 'senior' | 'superSenior'>('below60');

  // Old regime inputs
  const [hraReceived, setHraReceived] = useState<number | ''>(30000);
  const [rentPaid, setRentPaid] = useState<number | ''>(25000);
  const [cityType, setCityType] = useState<'metro' | 'nonMetro'>('nonMetro');
  const [deductions80C, setDeductions80C] = useState<number | ''>(50000);
  const [deductions80D, setDeductions80D] = useState<number | ''>(15000);
  const [otherOldRegimeDeductions, setOtherOldRegimeDeductions] = useState<number | ''>(0);

  // Active basic percent based on auto toggle
  const activeBasicPercent = autoBasic ? 50 : basicPercent;

  // Perform tax estimation
  const result = useMemo(() => {
    return estimateIncomeTax({
      annualCtc: annualCtc === '' ? 0 : annualCtc,
      basicSalaryPercent: activeBasicPercent,
      employerPfIncludedInCtc: employerPfIncluded,
      employeePfRate,
      monthlyProfessionalTax: professionalTax === '' ? 0 : professionalTax,
      monthlyOtherDeductions: otherDeductions === '' ? 0 : otherDeductions,
      regime,
      financialYear,
      ageGroup,
      input80C: deductions80C === '' ? 0 : deductions80C,
      input80D: deductions80D === '' ? 0 : deductions80D,
      hraReceivedMonthly: hraReceived === '' ? 0 : hraReceived,
      rentPaidMonthly: rentPaid === '' ? 0 : rentPaid,
      cityType,
      otherDeductionsOldRegime: otherOldRegimeDeductions === '' ? 0 : otherOldRegimeDeductions
    });
  }, [
    annualCtc,
    activeBasicPercent,
    employerPfIncluded,
    employeePfRate,
    professionalTax,
    otherDeductions,
    regime,
    financialYear,
    ageGroup,
    deductions80C,
    deductions80D,
    hraReceived,
    rentPaid,
    cityType,
    otherOldRegimeDeductions
  ]);

  // Tab State for Breakup Table
  const [breakupTab, setBreakupTab] = useState<'monthly' | 'annual'>('monthly');
  const isMonthlyBreakup = breakupTab === 'monthly';

  // Calculate percentage of CTC segments for stacked chart
  const chartSegments = useMemo(() => {
    const total = result.grossMonthlySalary + result.employerPfMonthly;
    if (total <= 0) return [];

    return [
      { label: 'Monthly In-Hand', value: result.monthlyInHand, color: '#43A047' },
      { label: 'Income Tax (TDS)', value: result.monthlyTaxTds, color: '#003080' },
      { label: 'Employee PF', value: result.employeePfMonthly, color: '#F59E0B' },
      { label: 'Professional Tax', value: result.professionalTaxMonthly, color: '#EC4899' },
      { label: 'Employer PF', value: result.employerPfMonthly, color: '#6366F1' },
      { label: 'Other Deductions', value: result.otherDeductionsMonthly, color: '#94A3B8' }
    ].filter(s => s.value > 0);
  }, [result]);

  return (
    <div className="space-y-8">
      {/* Disclaimer Top Alert */}
      <div className="rounded-2xl border border-brandNavy/10 bg-brandNavy/5 p-4 text-sm leading-6 text-brandNavy">
        <p className="font-bold flex items-center gap-1.5 text-brandDeepNavy">
          <span>💼</span> FY {financialYear} (AY {FY_META[financialYear].ay}) Estimate
        </p>
        <p className="mt-1 text-slate-600">
          This salary in-hand calculator uses revised tax brackets including the latest Union Budget changes for New Regime ({FY_META[financialYear].budget}). All calculations are estimates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Form Controls */}
        <div className="space-y-6">
          
          {/* Section 1: Income & Salary Components */}
          <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
              1. Base Compensation
            </h3>
            
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="flex justify-between text-sm font-semibold text-slate-700">
                  Annual CTC (Cost to Company)
                  <span className="text-xs text-brandMuted">in INR (₹)</span>
                </span>
                <input
                  type="number"
                  value={annualCtc}
                  min={0}
                  step={50000}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setAnnualCtc(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                />
                <span className="mt-1 block text-xs text-slate-500">Your total annual CTC package offered by your employer.</span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <span className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                    Basic Salary
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoBasic}
                        onChange={(e) => setAutoBasic(e.target.checked)}
                        className="rounded border-slate-300 text-brandNavy focus:ring-brandNavy/20"
                      />
                      <span className="text-xs text-brandNavy font-bold">Auto (50%)</span>
                    </label>
                  </span>
                  
                  {!autoBasic && (
                    <div className="mt-3">
                      <span className="text-xs font-bold text-slate-500">Basic as % of CTC: {basicPercent}%</span>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={basicPercent}
                        onChange={(e) => setBasicPercent(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brandNavy mt-2"
                      />
                    </div>
                  )}
                  {autoBasic && (
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Standard auto-estimate sets Basic Salary at 50% of CTC.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-center">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={employerPfIncluded}
                      onChange={(e) => setEmployerPfIncluded(e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-brandNavy focus:ring-brandNavy/20"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Employer PF in CTC?</span>
                      <span className="block text-xs text-slate-500 mt-0.5">
                        Deducts employer&apos;s 12% PF contribution from CTC to find true gross salary.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Deductions & Allowances */}
          <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
              2. Monthly Deductions & PF
            </h3>
            
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Employee PF Rate</span>
                <select
                  value={employeePfRate}
                  onChange={(e) => setEmployeePfRate(Number(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white"
                >
                  <option value={12}>12% of Basic (Standard)</option>
                  <option value={10}>10% of Basic</option>
                  <option value={0}>0% (No Provident Fund)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Professional Tax (Monthly)</span>
                <input
                  type="number"
                  value={professionalTax}
                  min={0}
                  step={50}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setProfessionalTax(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                />
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  State-specific and not universal. Use your payslip amount or enter 0 if it does not apply.
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Other Monthly Deductions</span>
                <input
                  type="number"
                  value={otherDeductions}
                  min={0}
                  step={100}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setOtherDeductions(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                />
                <span className="mt-1 block text-xs text-slate-500">Includes recurring deductions like corporate health plans, insurance, or meal vouchers.</span>
              </label>
            </div>
          </div>

          {/* Section 3: Tax Regime & Fiscal Year */}
          <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
              3. Tax Settings & Regime
            </h3>
            
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Financial Year</span>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value as FinancialYear)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white"
                >
                  <option value="2026-27">FY 2026-27 (AY 2027-28 - Latest)</option>
                  <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
                  <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Tax Regime</span>
                <select
                  value={regime}
                  onChange={(e) => setRegime(e.target.value as any)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white"
                >
                  <option value="new">New Regime (Lower Rates - Default)</option>
                  <option value="old">Old Regime (Allows Deductions/Exemptions)</option>
                </select>
              </label>

              {regime === 'old' && (
                <label className="block sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Age Bracket (Old Regime only)</span>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as any)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white"
                  >
                    <option value="below60">Below 60 Years (General)</option>
                    <option value="senior">60 to 79 Years (Senior Citizen)</option>
                    <option value="superSenior">80 Years & Above (Super Senior)</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          {/* Section 4: Old Regime Deductions (Conditional) */}
          {regime === 'old' && (
            <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-6 transition-all">
              <h3 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
                4. Old Regime Deductions & HRA
              </h3>
              
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Monthly HRA Received</span>
                    <input
                      type="number"
                      value={hraReceived}
                      min={0}
                      step={1000}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setHraReceived(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Monthly Rent Paid</span>
                    <input
                      type="number"
                      value={rentPaid}
                      min={0}
                      step={1000}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setRentPaid(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">City Type (for HRA)</span>
                    <select
                      value={cityType}
                      onChange={(e) => setCityType(e.target.value as any)}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white"
                    >
                      <option value="nonMetro">Non-Metro (40% Basic Cap)</option>
                      <option value="metro">Metro (50% Basic Cap - Delhi, Mumbai, Kolkata, Chennai)</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Section 80C (PPF, ELSS, Insurance)</span>
                    <input
                      type="number"
                      value={deductions80C}
                      min={0}
                      max={150000}
                      step={5000}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setDeductions80C(e.target.value === '' ? '' : Math.min(150000, Math.max(0, Number(e.target.value))))}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                    />
                    <span className="mt-1 block text-[10px] text-slate-400">Exclude EPF contribution; EPF is auto-calculated. Capped at ₹1.5L.</span>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Section 80D (Health Insurance)</span>
                    <input
                      type="number"
                      value={deductions80D}
                      min={0}
                      max={100000}
                      step={1000}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setDeductions80D(e.target.value === '' ? '' : Math.min(100000, Math.max(0, Number(e.target.value))))}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                    />
                    <span className="mt-1 block text-[10px] text-slate-400">Self + Family + Parents insurance premium. Capped at ₹1L.</span>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Other Deductions (Home Loan 24b, NPS)</span>
                    <input
                      type="number"
                      value={otherOldRegimeDeductions}
                      min={0}
                      step={5000}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setOtherOldRegimeDeductions(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Outcomes */}
        <div className="space-y-6">
          
          {/* Summary Outcomes */}
          <div className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-6 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-brandDeepNavy">
              Estimated Monthly In-Hand
            </h3>
            
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 ring-2 ring-brandGrowthGreen/20">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Monthly In-Hand</span>
                <p className="mt-1 text-3xl font-black text-brandGrowthGreen tracking-tight">
                  {formatCurrency(result.monthlyInHand)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Monthly Salary</span>
                <p className="mt-1 text-2xl font-bold text-brandDeepNavy tracking-tight">
                  {formatCurrency(result.grossMonthlySalary)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly TDS (Tax)</span>
                <p className="mt-1 text-2xl font-bold text-brandDeepNavy tracking-tight">
                  {formatCurrency(result.monthlyTaxTds)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Deductions</span>
                <p className="mt-1 text-2xl font-bold text-brandDeepNavy tracking-tight">
                  {formatCurrency(result.monthlyDeductionsTotal - result.monthlyTaxTds)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 leading-relaxed bg-white/70 rounded-xl p-3 border border-slate-100">
              * Net monthly in-hand is estimated from gross salary minus employee PF ({employeePfRate}%), professional tax, estimated tax/TDS, and other deductions.
            </p>
          </div>

          {/* SVG Visual Stacked Bar Chart */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h4 className="text-sm font-bold text-brandDeepNavy">Monthly Allocation Breakdown</h4>
            <div className="mt-4 flex h-6 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              {chartSegments.map((seg, idx) => {
                const totalMonthlyAllocation = result.grossMonthlySalary + result.employerPfMonthly;
                const pct = totalMonthlyAllocation > 0 ? (seg.value / totalMonthlyAllocation) * 100 : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={idx}
                    style={{ width: `${pct}%`, backgroundColor: seg.color }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 ease-out"
                    title={`${seg.label}: ${formatCurrency(seg.value)} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className="mt-4 grid gap-2 grid-cols-2 text-xs">
              {chartSegments.map((seg, idx) => {
                const totalMonthlyAllocation = result.grossMonthlySalary + result.employerPfMonthly;
                const pct = totalMonthlyAllocation > 0 ? ((seg.value / totalMonthlyAllocation) * 100).toFixed(1) : '0.0';
                return (
                  <div key={idx} className="flex items-center gap-1.5 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-slate-600 truncate">{seg.label}</span>
                    <span className="font-bold text-slate-800 ml-auto flex-shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakup Breakdowns Tab Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-brandDeepNavy">Salary Breakup Grid</h4>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                <button
                  onClick={() => setBreakupTab('monthly')}
                  className={`rounded-md px-3 py-1.5 transition ${breakupTab === 'monthly' ? 'bg-white text-brandNavy shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBreakupTab('annual')}
                  className={`rounded-md px-3 py-1.5 transition ${breakupTab === 'annual' ? 'bg-white text-brandNavy shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Annual
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-600">{isMonthlyBreakup ? 'Monthly CTC equivalent' : 'Annual CTC'}</span>
                <span className="font-bold text-slate-800">
                  {isMonthlyBreakup
                    ? formatCurrency((annualCtc === '' ? 0 : annualCtc) / 12)
                    : formatCurrency(annualCtc === '' ? 0 : annualCtc)}
                </span>
              </div>
              {employerPfIncluded && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 pl-3">Less: Employer PF (12% of Basic)</span>
                  <span className="text-slate-700">
                    - {isMonthlyBreakup ? formatCurrency(result.employerPfMonthly) : formatCurrency(result.employerPfAnnual)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-100 pb-2 font-bold bg-slate-50 p-2 rounded-xl">
                <span className="text-brandDeepNavy">{isMonthlyBreakup ? 'Gross monthly salary' : 'Gross annual salary'}</span>
                <span className="text-brandDeepNavy">
                  {isMonthlyBreakup ? formatCurrency(result.grossMonthlySalary) : formatCurrency(result.grossAnnualSalary)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 pl-3">
                <span className="text-slate-500">Basic Salary</span>
                <span className="text-slate-800">
                  {isMonthlyBreakup ? formatCurrency(result.basicMonthly) : formatCurrency(result.basicAnnual)}
                </span>
              </div>
              
              <div className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Deductions & Taxes</div>
              <div className="flex justify-between border-b border-slate-100 pb-2 pl-3">
                <span className="text-slate-500">Employee PF ({employeePfRate}%)</span>
                <span className="text-slate-800">
                  - {isMonthlyBreakup ? formatCurrency(result.employeePfMonthly) : formatCurrency(result.employeePfAnnual)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 pl-3">
                <span className="text-slate-500">Professional Tax</span>
                <span className="text-slate-800">
                  - {isMonthlyBreakup ? formatCurrency(result.professionalTaxMonthly) : formatCurrency(result.professionalTaxAnnual)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 pl-3">
                <span className="text-slate-500">Estimated Income Tax (TDS)</span>
                <span className="text-slate-800">
                  - {isMonthlyBreakup ? formatCurrency(result.monthlyTaxTds) : formatCurrency(result.totalTax)}
                </span>
              </div>
              {typeof otherDeductions === 'number' && otherDeductions > 0 && (
                <div className="flex justify-between border-b border-slate-100 pb-2 pl-3">
                  <span className="text-slate-500">Other Deductions</span>
                  <span className="text-slate-800">
                    - {isMonthlyBreakup ? formatCurrency(result.otherDeductionsMonthly) : formatCurrency(result.otherDeductionsAnnual)}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-brandGrowthGreen bg-green-50 p-2 rounded-xl mt-3 text-base">
                <span>Net In-Hand Salary</span>
                <span>
                  {isMonthlyBreakup ? formatCurrency(result.monthlyInHand) : formatCurrency(result.annualInHand)}
                </span>
              </div>
            </div>
          </div>

          {/* Slab calculation details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 overflow-hidden">
            <h4 className="text-sm font-bold text-brandDeepNavy mb-3">Estimated Tax Slab Breakdown</h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[300px] border-collapse text-left text-xs font-semibold">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Slab</th>
                    <th className="px-3 py-2 text-center">Rate</th>
                    <th className="px-3 py-2 text-right">Income in Slab</th>
                    <th className="px-3 py-2 text-right">Tax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {result.slabBreakdown.map((row, idx) => (
                    <tr key={idx} className={row.taxableInSlab > 0 ? "bg-brandNavy/[0.02]" : ""}>
                      <td className="px-3 py-2 font-bold">{row.slab}</td>
                      <td className="px-3 py-2 text-center">{row.rate}%</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(row.taxableInSlab)}</td>
                      <td className="px-3 py-2 text-right font-bold">{formatCurrency(row.taxInSlab)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="px-3 py-2">Tax before Cess/Rebate</td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(result.slabBreakdown.reduce((s, r) => s + r.taxInSlab, 0))}
                    </td>
                  </tr>
                  {result.taxBeforeCess < result.slabBreakdown.reduce((s, r) => s + r.taxInSlab, 0) && (
                    <tr className="text-brandGrowthGreen font-bold bg-green-50/50">
                      <td colSpan={3} className="px-3 py-2">Section 87A Rebate / Marginal Relief</td>
                      <td className="px-3 py-2 text-right">
                        - {formatCurrency(result.slabBreakdown.reduce((s, r) => s + r.taxInSlab, 0) - result.taxBeforeCess)}
                      </td>
                    </tr>
                  )}
                  <tr className="text-slate-500">
                    <td colSpan={3} className="px-3 py-2 pl-4">Health & Education Cess (4%)</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(result.cess)}</td>
                  </tr>
                  <tr className="bg-brandNavy text-white font-extrabold text-sm">
                    <td colSpan={3} className="px-3 py-3 rounded-bl-xl">Total Estimated Annual Tax</td>
                    <td className="px-3 py-3 text-right rounded-br-xl">{formatCurrency(result.totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span>Gross Annual Income:</span>
                <span className="font-bold text-slate-700">{formatCurrency(result.grossAnnualSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span>Eligible Deductions/Exemptions:</span>
                <span className="font-bold text-slate-700">- {formatCurrency(result.totalDeductions)}</span>
              </div>
              <div className="flex justify-between">
                <span>Net Taxable Income:</span>
                <span className="font-bold text-brandDeepNavy">{formatCurrency(result.taxableIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Educational Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-bold text-brandDeepNavy border-b border-slate-100 pb-3">
          Salary Structure FAQs
        </h4>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600">
          <div>
            <h5 className="font-bold text-slate-900">What is the difference between CTC and gross salary?</h5>
            <p className="mt-1">
              CTC (Cost to Company) represents the total expense an employer incurs on an employee. This includes elements you never see directly in cash, such as the employer&apos;s contribution to EPF, gratuity provisions, health insurance premiums, and other employee benefits. Gross salary is the amount calculated after subtracting non-cash employer provisions (like employer PF) from CTC but before subtracting statutory employee contributions and income tax.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900">Is standard deduction applicable automatically?</h5>
            <p className="mt-1">
              Yes, standard deduction is a flat tax deduction available to all salaried taxpayers and pensioners. For FY 2024-25 through FY 2026-27, it is ₹75,000 for the New Regime, and ₹50,000 for the Old Regime. This has been factored into your calculations automatically based on your regime selection.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900">How does HRA exemption work in the Old Tax Regime?</h5>
            <p className="mt-1">
              HRA (House Rent Allowance) exemption reduces your taxable income under Section 10(13A). It is calculated as the lowest of: (1) actual HRA received, (2) actual rent paid minus 10% of your basic salary, or (3) 50% of basic salary for metro cities (Delhi, Mumbai, Chennai, Kolkata) or 40% for other cities. HRA exemption is not available in the New Tax Regime.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer Bottom Card */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-xs text-amber-900 leading-relaxed">
        <p className="font-bold uppercase tracking-wider text-amber-800">⚠️ Educational Estimate Only</p>
        <p className="mt-2 text-amber-950">
          This calculator provides an educational estimate only. Actual salary structures, tax deductions, surcharge rates, marginal relief eligibility, cess computations, and employee benefits vary across organizations and states. Surcharges on income exceeding ₹50 Lakhs are not included in this basic model. Please verify your final numbers against your actual offer letter, monthly payslip, Form 16, or with your company&apos;s payroll department, a certified tax advisor, or the official Income Tax Department portal.
        </p>
      </div>
    </div>
  );
}
