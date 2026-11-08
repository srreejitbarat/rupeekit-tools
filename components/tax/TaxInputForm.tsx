import React, { useState } from 'react';
import { TaxInput } from '@/lib/tax/calculator';
import { availableTaxYears, indiaIncomeTaxRules } from '@/lib/tax/indiaIncomeTaxRules';
import { extractDigits, parseIntegerFromTextInput, stripLeadingZeros } from '@/lib/forms/numeric-input';

interface TaxInputFormProps {
  input: TaxInput;
  onChange: (newInput: TaxInput) => void;
  taxYear: string;
  onTaxYearChange: (year: string) => void;
}

type NumericField =
  | 'grossSalary'
  | 'hraExemption'
  | 'section80C'
  | 'section80D'
  | 'homeLoanInterest'
  | 'employerNPS'
  | 'otherDeductionsOldRegime'
  | 'otherDeductionsBothRegimes';

function formatNumberForInput(value: number): string {
  return value.toLocaleString('en-IN');
}

export function TaxInputForm({ input, onChange, taxYear, onTaxYearChange }: TaxInputFormProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    deductions: false,
    other: false,
  });
  const [displayValues, setDisplayValues] = useState<Record<NumericField, string>>({
    grossSalary: formatNumberForInput(input.grossSalary),
    hraExemption: formatNumberForInput(input.hraExemption),
    section80C: formatNumberForInput(input.section80C),
    section80D: formatNumberForInput(input.section80D),
    homeLoanInterest: formatNumberForInput(input.homeLoanInterest),
    employerNPS: formatNumberForInput(input.employerNPS),
    otherDeductionsOldRegime: formatNumberForInput(input.otherDeductionsOldRegime),
    otherDeductionsBothRegimes: formatNumberForInput(input.otherDeductionsBothRegimes),
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNumChange = (field: NumericField, value: string) => {
    const digits = stripLeadingZeros(extractDigits(value));
    setDisplayValues((prev) => ({ ...prev, [field]: digits }));
    onChange({ ...input, [field]: parseIntegerFromTextInput(digits) });
  };

  const handleNumFocus = (field: NumericField) => {
    setDisplayValues((prev) => {
      const noCommas = prev[field].replace(/,/g, '');
      return { ...prev, [field]: noCommas === '0' ? '' : noCommas };
    });
  };

  const handleNumBlur = (field: NumericField) => {
    const currentValue = input[field];
    const safeValue = Number.isFinite(currentValue) ? currentValue : 0;
    setDisplayValues((prev) => ({ ...prev, [field]: formatNumberForInput(safeValue) }));
  };

  return (
    <div className="space-y-4">
      {/* Settings Block */}
      <div className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
        <label className="block text-sm font-bold text-brandDeepNavy mb-2">Financial Year (FY)</label>
        <select 
          value={taxYear}
          onChange={(e) => onTaxYearChange(e.target.value)}
          className="w-full rounded-xl border border-brandBorder bg-slate-50 px-4 py-3 text-sm text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
        >
          {availableTaxYears.map((year) => (
            <option key={year} value={year}>
              {indiaIncomeTaxRules[year].ay ? `FY ${year} (AY ${indiaIncomeTaxRules[year].ay})` : `Tax Year ${year}`}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[10px] text-brandMuted">Rules last reviewed: August 2026. Verify official tax rules before filing.</p>
        <div className="mt-4 flex items-center gap-3">
          <input 
            type="checkbox" 
            id="isSalaried" 
            checked={input.isSalaried}
            onChange={(e) => onChange({ ...input, isSalaried: e.target.checked })}
            className="h-4 w-4 rounded border-brandBorder text-brandNavy focus:ring-brandNavy"
          />
          <label htmlFor="isSalaried" className="text-sm font-medium text-slate-700">
            Salaried Employee (eligible for Standard Deduction)
          </label>
        </div>
      </div>

      {/* Income Section */}
      <div className="rounded-2xl border border-brandBorder bg-white overflow-hidden shadow-sm">
        <button 
          onClick={() => toggleSection('basic')}
          className="flex w-full items-center justify-between bg-brandBgSoft px-5 py-4 text-left transition hover:bg-slate-100"
        >
          <span className="font-bold text-brandDeepNavy">1. Income Details</span>
          <span className="text-slate-400">{openSections.basic ? '▲' : '▼'}</span>
        </button>
        {openSections.basic && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Gross Annual Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.grossSalary}
                  onFocus={() => handleNumFocus('grossSalary')}
                  onBlur={() => handleNumBlur('grossSalary')}
                  onChange={(e) => handleNumChange('grossSalary', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-[11px] text-brandMuted">Total income before any deductions.</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Exempt Allowances (HRA, LTA, etc.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.hraExemption}
                  onFocus={() => handleNumFocus('hraExemption')}
                  onBlur={() => handleNumBlur('hraExemption')}
                  onChange={(e) => handleNumChange('hraExemption', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-[11px] text-brandMuted">Only valid in old regime. Only enter the exempt portion, not the total received.</p>
            </div>
          </div>
        )}
      </div>

      {/* Deductions Section */}
      <div className="rounded-2xl border border-brandBorder bg-white overflow-hidden shadow-sm">
        <button 
          onClick={() => toggleSection('deductions')}
          className="flex w-full items-center justify-between bg-brandBgSoft px-5 py-4 text-left transition hover:bg-slate-100"
        >
          <span className="font-bold text-brandDeepNavy">2. Major Deductions (Old Regime)</span>
          <span className="text-slate-400">{openSections.deductions ? '▲' : '▼'}</span>
        </button>
        {openSections.deductions && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Section 80C (PPF, ELSS, EPF, LIC)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.section80C}
                  onFocus={() => handleNumFocus('section80C')}
                  onBlur={() => handleNumBlur('section80C')}
                  onChange={(e) => handleNumChange('section80C', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="Max 1,50,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Section 80D (Health Insurance)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.section80D}
                  onFocus={() => handleNumFocus('section80D')}
                  onBlur={() => handleNumBlur('section80D')}
                  onChange={(e) => handleNumChange('section80D', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Home Loan Interest (Section 24b)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.homeLoanInterest}
                  onFocus={() => handleNumFocus('homeLoanInterest')}
                  onBlur={() => handleNumBlur('homeLoanInterest')}
                  onChange={(e) => handleNumChange('homeLoanInterest', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="Max 2,00,000 for self-occupied"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Deductions Section */}
      <div className="rounded-2xl border border-brandBorder bg-white overflow-hidden shadow-sm">
        <button 
          onClick={() => toggleSection('other')}
          className="flex w-full items-center justify-between bg-brandBgSoft px-5 py-4 text-left transition hover:bg-slate-100"
        >
          <span className="font-bold text-brandDeepNavy">3. Other Deductions</span>
          <span className="text-slate-400">{openSections.other ? '▲' : '▼'}</span>
        </button>
        {openSections.other && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Employer NPS (Sec 80CCD(2))</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.employerNPS}
                  onFocus={() => handleNumFocus('employerNPS')}
                  onBlur={() => handleNumBlur('employerNPS')}
                  onChange={(e) => handleNumChange('employerNPS', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="0"
                />
              </div>
              <p className="mt-1 text-[11px] text-brandGrowthGreen font-medium">Allowed in BOTH old and new tax regimes.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Other Deductions (Old Regime Only)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.otherDeductionsOldRegime}
                  onFocus={() => handleNumFocus('otherDeductionsOldRegime')}
                  onBlur={() => handleNumBlur('otherDeductionsOldRegime')}
                  onChange={(e) => handleNumChange('otherDeductionsOldRegime', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="e.g. LTA, 80E, 80G, etc."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Other Deductions (Both Regimes)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input 
                  type="text" 
                  value={displayValues.otherDeductionsBothRegimes}
                  onFocus={() => handleNumFocus('otherDeductionsBothRegimes')}
                  onBlur={() => handleNumBlur('otherDeductionsBothRegimes')}
                  onChange={(e) => handleNumChange('otherDeductionsBothRegimes', e.target.value)}
                  className="w-full rounded-xl border border-brandBorder bg-white py-3 pl-8 pr-4 text-sm font-bold text-brandDeepNavy outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
                  placeholder="e.g. 80CCH Agniveer Corpus Fund"
                />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
