'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { calculateIndianIncomeTax, TaxInput } from '@/lib/tax/calculator';
import { availableTaxYears } from '@/lib/tax/indiaIncomeTaxRules';
import { TaxInputForm } from './TaxInputForm';
import { TaxResultPanel } from './TaxResultPanel';
import { TaxFutureProjection } from './TaxFutureProjection';
import CalculatorAnalyticsBoundary from '@/components/CalculatorAnalyticsBoundary';

const initialInput: TaxInput = {
  grossSalary: 1200000,
  hraExemption: 0,
  homeLoanInterest: 0,
  section80C: 150000,
  section80D: 25000,
  employerNPS: 0,
  otherDeductionsOldRegime: 0,
  otherDeductionsBothRegimes: 0,
  isSalaried: true,
};

const representativeSalaryInput: TaxInput = {
  grossSalary: 0,
  hraExemption: 0,
  homeLoanInterest: 0,
  section80C: 0,
  section80D: 0,
  employerNPS: 0,
  otherDeductionsOldRegime: 0,
  otherDeductionsBothRegimes: 0,
  isSalaried: true,
};

const representativeGrossSalaries = [800000, 1200000, 1500000, 2000000];

function formatInr(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function TaxCalculatorApp() {
  const [input, setInput] = useState<TaxInput>(initialInput);
  const [taxYear, setTaxYear] = useState<string>(availableTaxYears[0] ?? '2025-26');
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const result = useMemo(() => {
    try {
      return calculateIndianIncomeTax(input, taxYear);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [input, taxYear]);

  const representativeRows = useMemo(
    () =>
      representativeGrossSalaries.map((grossSalary) => {
        const comparison = calculateIndianIncomeTax(
          { ...representativeSalaryInput, grossSalary },
          taxYear
        );
        return {
          grossSalary,
          oldTax: comparison.oldRegime.finalTax,
          newTax: comparison.newRegime.finalTax,
          lowerEstimate:
            comparison.recommendedRegime === 'Equal'
              ? 'Equal'
              : `${comparison.recommendedRegime} regime`,
        };
      }),
    [taxYear]
  );

  if (!mounted) return <div className="animate-pulse h-[600px] bg-slate-100 rounded-3xl w-full"></div>;

  return (
    <CalculatorAnalyticsBoundary
      toolSlug="income-tax-calculator-old-vs-new-regime-india"
      toolCategory="Tax"
    >
    <div className="mx-auto w-full max-w-6xl">
      <section className="mb-6 rounded-3xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Compare regimes first</p>
            <h2 className="mt-1 text-xl font-black text-brandDeepNavy md:text-2xl">
              Old vs new tax regime at representative salaries
            </h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700">
            FY {taxYear}
          </span>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">
          These salary-only examples apply the configured salaried standard deduction for FY {taxYear} and no
          extra HRA, 80C, 80D, home-loan-interest or NPS deduction inputs. They are a starting comparison, not a
          recommendation; your actual deductions and special-rate income can change the result.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-sky-100 bg-white">
          <table className="w-full min-w-[680px] text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-semibold">Gross salary</th>
                <th className="px-4 py-3 font-semibold">Old regime tax</th>
                <th className="px-4 py-3 font-semibold">New regime tax</th>
                <th className="px-4 py-3 font-semibold">Lower estimate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {representativeRows.map((row) => (
                <tr key={row.grossSalary}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatInr(row.grossSalary)}</td>
                  <td className="px-4 py-3">{formatInr(row.oldTax)}</td>
                  <td className="px-4 py-3">{formatInr(row.newTax)}</td>
                  <td className="px-4 py-3 font-medium">{row.lowerEstimate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-600">
          Scope: resident-individual normal slab-rate income only. Equity STCG/LTCG and other special-rate income
          are outside this comparison and can change Section 87A treatment.
        </p>
      </section>

      <nav
        aria-label="Salary and tax planning journey"
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Continue the salary-tax journey</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/tools/salary-in-hand-calculator-india" className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            Salary In-Hand Calculator
          </Link>
          <Link href="/blog/how-to-calculate-in-hand-salary-from-ctc-india" className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            CTC to in-hand guide
          </Link>
          <Link href="/blog/income-tax-on-12-lakh-salary-new-regime-india-2026" className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            Tax on ₹12 lakh salary
          </Link>
          <Link href="/blog/old-vs-new-tax-regime-which-saves-more" className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            Old vs new regime guide
          </Link>
        </div>
      </nav>

      <div className="mb-6 flex gap-2 border-b border-brandBorder pb-4">
        <button
          onClick={() => setActiveTab('current')}
          className={`rounded-full px-5 py-2 text-sm font-bold transition ${activeTab === 'current' ? 'bg-brandNavy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Current Calculation
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={`rounded-full px-5 py-2 text-sm font-bold transition ${activeTab === 'future' ? 'bg-brandGrowthGreen text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Future Projection
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          {activeTab === 'current' ? (
            <TaxInputForm 
              input={input} 
              onChange={setInput} 
              taxYear={taxYear} 
              onTaxYearChange={setTaxYear} 
            />
          ) : (
            <TaxFutureProjection baseInput={input} taxYear={taxYear} />
          )}
        </div>
        <div>
          <TaxResultPanel result={result} input={input} taxYear={taxYear} />
        </div>
      </div>
    </div>
    </CalculatorAnalyticsBoundary>
  );
}
