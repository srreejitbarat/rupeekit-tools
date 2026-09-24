'use client';

import React, { useMemo, useState } from 'react';
import { Parser } from 'expr-eval';
import type { Tool } from '@/lib/tools';

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

// 1. Result Summary Cards component
export function CalculatorResultSummary({
  results,
}: {
  results: Array<{ key: string; label: string; value: number; formatted: string }>;
}) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
      role="group"
      aria-live="polite"
      aria-label="Estimated results"
    >
      {results.map((result, index) => {
        const isLast = index === results.length - 1;
        return (
          <div
            key={result.key}
            className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
              isLast ? 'border-brandGrowthGreen/30 ring-1 ring-brandGrowthGreen/10' : 'border-slate-200'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{result.label}</p>
            <output
              className={`mt-2 block text-2xl font-black tracking-tight ${
                isLast ? 'text-brandGrowthGreen' : 'text-brandDeepNavy'
              }`}
            >
              {result.formatted}
            </output>
          </div>
        );
      })}
    </div>
  );
}

// Helper to draw SVG donut slices
function DonutChart({
  data,
  title,
  ariaLabel,
}: {
  data: Array<{ label: string; value: number; color: string; formatted: string }>;
  title?: string;
  ariaLabel: string;
}) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91
  
  let accumulatedPercent = 0;
  const slices = data.map((item) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += percent;
    return {
      ...item,
      percent,
      strokeOffset,
      strokeLength: (percent / 100) * circumference,
    };
  });

  return (
    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row" aria-label={ariaLabel}>
      <div className="relative h-44 w-44 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full transform -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#E5EAF0" strokeWidth="12" />
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={slice.strokeOffset}
              className="transition-all duration-500 ease-out"
              style={{ strokeDasharray: `${slice.strokeLength} ${circumference - slice.strokeLength}` }}
            />
          ))}
        </svg>
        {title && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
            <span className="text-sm font-black text-brandDeepNavy">
              {total > 0
                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(total)
                : '₹0'}
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow space-y-3 w-full">
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-brandDeepNavy">{item.formatted}</span>
                <span className="ml-2 text-xs font-semibold text-slate-400">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Define interfaces for the discriminated union ChartData
interface DonutChartItem {
  label: string;
  value: number;
  color: string;
  formatted: string;
}

interface DonutChartData {
  type: 'donut';
  title: string;
  ariaLabel: string;
  accessibilityText: string;
  data: DonutChartItem[];
}

interface StackedChartSegment {
  label: string;
  value: number;
  color: string;
  colorHex?: string;
  formatted: string;
}

interface StackedChartData {
  type: 'stacked';
  ariaLabel: string;
  accessibilityText: string;
  total: number;
  segments: StackedChartSegment[];
}

interface DoubleBarChartData {
  type: 'double-bar';
  ariaLabel: string;
  accessibilityText: string;
  oldTax: number;
  newTax: number;
}

interface LimitBarChartData {
  type: 'limit-bar';
  title: string;
  ariaLabel: string;
  accessibilityText: string;
  value: number;
  limit: number;
}

interface Section80CChartSegment {
  label: string;
  value: number;
  color: string;
}

interface Section80CBarChartData {
  type: '80c-bar';
  ariaLabel: string;
  accessibilityText: string;
  total: number;
  limit: number;
  segments: Section80CChartSegment[];
}

type ChartData = DonutChartData | StackedChartData | DoubleBarChartData | LimitBarChartData | Section80CBarChartData;

// 2. Main Result Chart Section component
export function CalculatorResultChart({ tool, values, results }: { tool: Tool; values: Record<string, number>; results: any[] }) {
  const chartData = useMemo<ChartData | null>(() => {
    const slug = tool.slug;
    const resMap = new Map<string, any>(results.map((r) => [r.key, r]));
    
    // 1. EMI
    if (slug === 'emi-calculator-india') {
      const principal = values.principal || 0;
      const totalInterest = resMap.get('totalInterest')?.value || 0;
      return {
        type: 'donut',
        title: 'Total Cost',
        ariaLabel: 'EMI loan breakdown donut chart showing Principal Loan Amount and Total Interest Paid.',
        accessibilityText: `Principal loan amount is ${formatValue(principal, 'currency')} and total interest is ${formatValue(totalInterest, 'currency')}.`,
        data: [
          { label: 'Principal Loan', value: principal, color: '#003080', formatted: formatValue(principal, 'currency') },
          { label: 'Total Interest', value: totalInterest, color: '#43A047', formatted: formatValue(totalInterest, 'currency') },
        ],
      };
    }

    // 2. SIP
    if (slug === 'sip-calculator-india') {
      const invested = resMap.get('investedAmount')?.value || 0;
      const gains = resMap.get('estimatedGains')?.value || 0;
      return {
        type: 'donut',
        title: 'Est. Wealth',
        ariaLabel: 'SIP investment breakdown donut chart showing Total Invested Amount and Estimated Returns/Gains.',
        accessibilityText: `Total invested amount is ${formatValue(invested, 'currency')} and estimated gains are ${formatValue(gains, 'currency')}.`,
        data: [
          { label: 'Total Invested', value: invested, color: '#003080', formatted: formatValue(invested, 'currency') },
          { label: 'Estimated Gains', value: gains, color: '#43A047', formatted: formatValue(gains, 'currency') },
        ],
      };
    }

    // 3. FD
    if (slug === 'fd-calculator-india') {
      const principal = values.principal || 0;
      const interest = resMap.get('interestEarned')?.value || 0;
      return {
        type: 'donut',
        title: 'Maturity Val',
        ariaLabel: 'Fixed Deposit breakdown donut chart showing Initial Deposit Amount and Estimated Interest Earned.',
        accessibilityText: `Principal deposit amount is ${formatValue(principal, 'currency')} and interest earned is ${formatValue(interest, 'currency')}.`,
        data: [
          { label: 'Deposit Amount', value: principal, color: '#003080', formatted: formatValue(principal, 'currency') },
          { label: 'Interest Earned', value: interest, color: '#43A047', formatted: formatValue(interest, 'currency') },
        ],
      };
    }

    // 4. GST
    if (slug === 'gst-calculator-india') {
      const taxable = values.taxableAmount || 0;
      const gst = resMap.get('gstAmount')?.value || 0;
      return {
        type: 'donut',
        title: 'Final Amount',
        ariaLabel: 'GST breakdown donut chart showing Net Taxable Price and GST Tax Amount.',
        accessibilityText: `Net taxable price is ${formatValue(taxable, 'currency')} and GST amount is ${formatValue(gst, 'currency')}.`,
        data: [
          { label: 'Net Price', value: taxable, color: '#003080', formatted: formatValue(taxable, 'currency') },
          { label: 'GST Tax', value: gst, color: '#43A047', formatted: formatValue(gst, 'currency') },
        ],
      };
    }

    // 5. HRA
    if (slug === 'hra-exemption-calculator-india') {
      const exempt = resMap.get('monthlyHraExemption')?.value || 0;
      const taxable = resMap.get('taxableHraMonthly')?.value || 0;
      return {
        type: 'donut',
        title: 'HRA Split',
        ariaLabel: 'HRA breakdown donut chart showing Monthly Tax Exempt HRA and Monthly Taxable HRA.',
        accessibilityText: `Exempt monthly HRA is ${formatValue(exempt, 'currency')} and taxable monthly HRA is ${formatValue(taxable, 'currency')}.`,
        data: [
          { label: 'Exempt HRA', value: exempt, color: '#43A047', formatted: formatValue(exempt, 'currency') },
          { label: 'Taxable HRA', value: taxable, color: '#003080', formatted: formatValue(taxable, 'currency') },
        ],
      };
    }

    // 6. Salary In Hand
    if (slug === 'salary-in-hand-calculator-india') {
      const inHand = resMap.get('monthlyInHand')?.value || 0;
      const pf = resMap.get('employeePf')?.value || 0;
      const tax = values.monthlyTax || 0;
      const pt = values.professionalTax || 0;
      const other = values.otherDeduction || 0;
      
      const total = inHand + pf + tax + pt + other;
      
      return {
        type: 'stacked',
        ariaLabel: 'Salary deductions horizontal stacked bar chart showing Monthly In-hand, PF contribution, TDS tax, Professional Tax and other deductions.',
        accessibilityText: `Monthly in-hand is ${formatValue(inHand, 'currency')}, employee PF is ${formatValue(pf, 'currency')}, monthly tax TDS is ${formatValue(tax, 'currency')}, professional tax is ${formatValue(pt, 'currency')}, and other deductions are ${formatValue(other, 'currency')}.`,
        total,
        segments: [
          { label: 'In-Hand Pay', value: inHand, color: '#43A047', formatted: formatValue(inHand, 'currency') },
          { label: 'Employee PF', value: pf, color: '#003080', formatted: formatValue(pf, 'currency') },
          { label: 'Income Tax', value: tax, color: '#E2E8F0', colorHex: '#94A3B8', formatted: formatValue(tax, 'currency') },
          { label: 'Prof. Tax', value: pt, color: '#CBD5E1', colorHex: '#64748B', formatted: formatValue(pt, 'currency') },
          { label: 'Other Ded.', value: other, color: '#94A3B8', colorHex: '#475569', formatted: formatValue(other, 'currency') },
        ],
      };
    }

    // 7. Income Tax Old vs New
    if (slug === 'income-tax-calculator-old-vs-new-regime-india') {
      const oldTax = resMap.get('taxPayableOldRegime')?.value || 0;
      const newTax = resMap.get('taxPayableNewRegime')?.value || 0;
      
      return {
        type: 'double-bar',
        ariaLabel: 'Income tax old versus new regime column comparison chart.',
        accessibilityText: `Estimated tax under the Old Regime is ${formatValue(oldTax, 'currency')} while under the New Regime it is ${formatValue(newTax, 'currency')}.`,
        oldTax,
        newTax,
      };
    }

    // 8. Gratuity
    if (slug === 'gratuity-calculator-india') {
      const payout = resMap.get('finalGratuityPayable')?.value || 0;
      const limit = 2000000;
      return {
        type: 'limit-bar',
        title: 'Gratuity Payout',
        ariaLabel: 'Gratuity comparison bar chart showing estimated gratuity payout compared to statutory limit of twenty lakh rupees.',
        accessibilityText: `Your estimated gratuity payout is ${formatValue(payout, 'currency')} against the statutory upper cap of ${formatValue(limit, 'currency')}.`,
        value: payout,
        limit,
      };
    }

    // 9. 80C Deductions
    if (slug === '80c-deduction-calculator-india') {
      const epf = values.epfContribution || 0;
      const ppf = values.ppfContribution || 0;
      const elss = values.elssInvestment || 0;
      const insurance = values.lifeInsurancePremium || 0;
      const loan = values.homeLoanPrincipal || 0;
      const tuition = values.tuitionFees || 0;
      const total = epf + ppf + elss + insurance + loan + tuition;
      const limit = 150000;
      
      return {
        type: '80c-bar',
        ariaLabel: 'Section 80C deductions stacked progress bar showing investments against the statutory limit of one lakh fifty thousand rupees.',
        accessibilityText: `Total entered investments are ${formatValue(total, 'currency')} with an eligible cap of ${formatValue(Math.min(total, limit), 'currency')}.`,
        total,
        limit,
        segments: [
          { label: 'EPF', value: epf, color: '#003080' },
          { label: 'PPF', value: ppf, color: '#43A047' },
          { label: 'ELSS', value: elss, color: '#50B040' },
          { label: 'Insurance', value: insurance, color: '#F59E0B' },
          { label: 'Home Principal', value: loan, color: '#6366F1' },
          { label: 'Tuition', value: tuition, color: '#EC4899' },
        ].filter((s) => s.value > 0),
      };
    }

    // 10. Home Loan EMI
    if (slug === 'home-loan-emi-calculator-india') {
      const principal = values.principal || 0;
      const totalInterest = resMap.get('totalInterest')?.value || 0;
      return {
        type: 'donut',
        title: 'Total Cost',
        ariaLabel: 'Home loan breakdown donut chart showing Principal Loan Amount and Total Interest Paid.',
        accessibilityText: `Principal loan amount is ${formatValue(principal, 'currency')} and total interest is ${formatValue(totalInterest, 'currency')}.`,
        data: [
          { label: 'Principal Loan', value: principal, color: '#003080', formatted: formatValue(principal, 'currency') },
          { label: 'Total Interest', value: totalInterest, color: '#43A047', formatted: formatValue(totalInterest, 'currency') },
        ],
      };
    }

    // 11. Gold Loan
    if (slug === 'gold-loan-calculator-india') {
      const goldValue = resMap.get('goldValue')?.value || 0;
      const eligibleLoan = resMap.get('eligibleLoanAmount')?.value || 0;
      const margin = Math.max(0, goldValue - eligibleLoan);
      return {
        type: 'donut',
        title: 'Gold Value',
        ariaLabel: 'Gold loan donut chart showing the eligible loan amount and the margin retained by the lender out of total gold value.',
        accessibilityText: `Eligible loan is ${formatValue(eligibleLoan, 'currency')} and the lender margin is ${formatValue(margin, 'currency')} out of a gold value of ${formatValue(goldValue, 'currency')}.`,
        data: [
          { label: 'Eligible Loan', value: eligibleLoan, color: '#003080', formatted: formatValue(eligibleLoan, 'currency') },
          { label: 'Margin (LTV gap)', value: margin, color: '#43A047', formatted: formatValue(margin, 'currency') },
        ],
      };
    }

    // 12. Personal Loan Eligibility — income allocation
    if (slug === 'personal-loan-eligibility-calculator-india') {
      const income = values.monthlyIncome || 0;
      const existingEmi = values.existingMonthlyEmi || 0;
      const maxEmi = resMap.get('maxAffordableEmi')?.value || 0;
      const remaining = Math.max(0, income - existingEmi - maxEmi);
      return {
        type: 'stacked',
        ariaLabel: 'Income allocation stacked bar chart showing new EMI capacity, existing EMIs and remaining income.',
        accessibilityText: `Of ${formatValue(income, 'currency')} monthly income, new EMI capacity is ${formatValue(maxEmi, 'currency')}, existing EMIs take ${formatValue(existingEmi, 'currency')}, and ${formatValue(remaining, 'currency')} remains for living costs.`,
        total: income,
        segments: [
          { label: 'New EMI Capacity', value: maxEmi, color: '#003080', formatted: formatValue(maxEmi, 'currency') },
          { label: 'Existing EMIs', value: existingEmi, color: '#94A3B8', colorHex: '#64748B', formatted: formatValue(existingEmi, 'currency') },
          { label: 'Living Expenses', value: remaining, color: '#43A047', formatted: formatValue(remaining, 'currency') },
        ],
      };
    }

    // 13. Capital Gains Tax
    if (slug === 'capital-gains-tax-calculator-india') {
      const totalGains = (values.stcgAmount || 0) + (values.ltcgAmount || 0);
      const tax = resMap.get('totalTaxWithCess')?.value || 0;
      const kept = Math.max(0, totalGains - tax);
      return {
        type: 'donut',
        title: 'Total Gains',
        ariaLabel: 'Capital gains donut chart showing tax payable and gains retained after tax.',
        accessibilityText: `Of ${formatValue(totalGains, 'currency')} total gains, estimated tax with cess is ${formatValue(tax, 'currency')} and ${formatValue(kept, 'currency')} is retained.`,
        data: [
          { label: 'Gains After Tax', value: kept, color: '#43A047', formatted: formatValue(kept, 'currency') },
          { label: 'Tax + Cess', value: tax, color: '#003080', formatted: formatValue(tax, 'currency') },
        ],
      };
    }

    // 14. PPF
    if (slug === 'ppf-calculator-india') {
      const invested = resMap.get('totalInvested')?.value || 0;
      const interest = resMap.get('totalInterest')?.value || 0;
      return {
        type: 'donut',
        title: 'Maturity Val',
        ariaLabel: 'PPF breakdown donut chart showing total invested amount and tax-free interest earned.',
        accessibilityText: `Total invested is ${formatValue(invested, 'currency')} and interest earned is ${formatValue(interest, 'currency')}.`,
        data: [
          { label: 'Total Invested', value: invested, color: '#003080', formatted: formatValue(invested, 'currency') },
          { label: 'Interest Earned', value: interest, color: '#43A047', formatted: formatValue(interest, 'currency') },
        ],
      };
    }

    // 15. Lumpsum
    if (slug === 'lumpsum-calculator-india') {
      const invested = values.investmentAmount || 0;
      const gain = resMap.get('totalGain')?.value || 0;
      return {
        type: 'donut',
        title: 'Future Value',
        ariaLabel: 'Lumpsum investment donut chart showing invested amount and estimated gains.',
        accessibilityText: `Invested amount is ${formatValue(invested, 'currency')} and estimated gain is ${formatValue(gain, 'currency')}.`,
        data: [
          { label: 'Invested Amount', value: invested, color: '#003080', formatted: formatValue(invested, 'currency') },
          { label: 'Estimated Gain', value: gain, color: '#43A047', formatted: formatValue(gain, 'currency') },
        ],
      };
    }

    // 16. EPF Corpus
    if (slug === 'epf-corpus-calculator-india') {
      const contributed = resMap.get('totalContributed')?.value || 0;
      const interest = resMap.get('totalInterest')?.value || 0;
      return {
        type: 'donut',
        title: 'EPF Corpus',
        ariaLabel: 'EPF corpus donut chart showing total contributions and interest earned.',
        accessibilityText: `Total contributions are ${formatValue(contributed, 'currency')} and interest earned is ${formatValue(interest, 'currency')}.`,
        data: [
          { label: 'Contributions', value: contributed, color: '#003080', formatted: formatValue(contributed, 'currency') },
          { label: 'Interest Earned', value: interest, color: '#43A047', formatted: formatValue(interest, 'currency') },
        ],
      };
    }

    return null;
  }, [tool.slug, values, results]);

  if (!chartData) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-brandDeepNavy">Visual Breakdown</h3>
      <p className="sr-only">{chartData.accessibilityText}</p>
      
      <div className="mt-6">
        {chartData.type === 'donut' && (
          <DonutChart data={chartData.data} title={chartData.title} ariaLabel={chartData.ariaLabel} />
        )}

        {chartData.type === 'stacked' && (
          <div className="space-y-6" aria-label={chartData.ariaLabel}>
            <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
              {chartData.segments.map((seg: any, idx: number) => {
                const pct = chartData.total > 0 ? (seg.value / chartData.total) * 100 : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={idx}
                    style={{ width: `${pct}%`, backgroundColor: seg.color || seg.colorHex }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 ease-out"
                    title={`${seg.label}: ${seg.formatted} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {chartData.segments.map((seg: any, idx: number) => {
                const pct = chartData.total > 0 ? ((seg.value / chartData.total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={idx} className="flex items-center gap-2 border border-slate-100 rounded-xl p-2 bg-slate-50">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color || seg.colorHex }} />
                    <div className="min-w-0 flex-grow">
                      <p className="text-xs font-semibold text-slate-500 truncate">{seg.label}</p>
                      <p className="text-sm font-bold text-brandDeepNavy truncate">
                        {seg.formatted} <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {chartData.type === 'double-bar' && (
          <div className="flex flex-col items-center justify-center gap-8 pt-4" aria-label={chartData.ariaLabel}>
            <div className="flex w-full max-w-md items-end justify-around gap-8 border-b border-slate-200 pb-2 h-48">
              {/* Old Regime Bar */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div
                  style={{
                    height: `${
                      Math.max(chartData.oldTax, chartData.newTax) > 0
                        ? (chartData.oldTax / Math.max(chartData.oldTax, chartData.newTax)) * 100
                        : 0
                    }%`,
                  }}
                  className="w-16 rounded-t-lg bg-slate-300 transition-all duration-500 ease-out min-h-[4px]"
                />
                <span className="text-xs font-semibold text-slate-500">Old Regime</span>
              </div>

              {/* New Regime Bar */}
              <div className="flex flex-col items-center gap-2 w-1/3">
                <div
                  style={{
                    height: `${
                      Math.max(chartData.oldTax, chartData.newTax) > 0
                        ? (chartData.newTax / Math.max(chartData.oldTax, chartData.newTax)) * 100
                        : 0
                    }%`,
                  }}
                  className="w-16 rounded-t-lg bg-brandGrowthGreen transition-all duration-500 ease-out min-h-[4px]"
                />
                <span className="text-xs font-semibold text-brandNavy font-bold">New Regime</span>
              </div>
            </div>

            <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold text-slate-500">Old Regime Tax</p>
                <p className="text-base font-bold text-slate-700 mt-1">{formatValue(chartData.oldTax, 'currency')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center ring-2 ring-brandGrowthGreen/20">
                <p className="text-xs font-semibold text-brandGrowthGreen font-bold">New Regime Tax</p>
                <p className="text-base font-black text-brandDeepNavy mt-1">{formatValue(chartData.newTax, 'currency')}</p>
              </div>
            </div>

            {chartData.oldTax > chartData.newTax ? (
              <div className="rounded-2xl border border-green-100 bg-green-50/50 px-4 py-3 text-center text-sm font-semibold text-brandGrowthGreen max-w-md w-full">
                💡 Choosing the New Regime saves you {formatValue(chartData.oldTax - chartData.newTax, 'currency')}!
              </div>
            ) : chartData.newTax > chartData.oldTax ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600 max-w-md w-full">
                💡 Choosing the Old Regime saves you {formatValue(chartData.newTax - chartData.oldTax, 'currency')}!
              </div>
            ) : null}
          </div>
        )}

        {chartData.type === 'limit-bar' && (
          <div className="space-y-4" aria-label={chartData.ariaLabel}>
            <div className="flex items-center justify-between text-sm font-bold text-brandDeepNavy">
              <span>Payout Estimate</span>
              <span>Max Cap: {formatValue(chartData.limit, 'currency')}</span>
            </div>
            
            <div className="relative h-6 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
              <div
                style={{ width: `${Math.min((chartData.value / chartData.limit) * 100, 100)}%` }}
                className="h-full bg-brandGrowthGreen transition-all duration-500 ease-out rounded-full"
              />
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{formatValue(chartData.value, 'currency')}</span>
              {chartData.value >= chartData.limit && (
                <span className="font-bold text-amber-600">⚠️ Statutorily capped at ₹20 Lakhs</span>
              )}
            </div>
          </div>
        )}

        {chartData.type === '80c-bar' && (
          <div className="space-y-6" aria-label={chartData.ariaLabel}>
            <div>
              <div className="flex items-center justify-between text-sm font-bold text-brandDeepNavy mb-2">
                <span>Total 80C Investments</span>
                <span>Limit: {formatValue(chartData.limit, 'currency')}</span>
              </div>
              <div className="relative h-7 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200 flex">
                {chartData.segments.map((seg: any, idx: number) => {
                  const segmentPercent = (seg.value / chartData.limit) * 100;
                  return (
                    <div
                      key={idx}
                      style={{ width: `${segmentPercent}%`, backgroundColor: seg.color || '#CBD5E1' }}
                      className="h-full first:rounded-l-full last:rounded-r-full border-r border-white/20 transition-all duration-500 ease-out"
                      title={`${seg.label}: ${formatValue(seg.value, 'currency')}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                <span>Invested: {formatValue(chartData.total, 'currency')}</span>
                {chartData.total > chartData.limit ? (
                  <span className="font-bold text-brandGrowthGreen">Capped Benefit: {formatValue(chartData.limit, 'currency')}</span>
                ) : (
                  <span>Remaining: {formatValue(Math.max(0, chartData.limit - chartData.total), 'currency')}</span>
                )}
              </div>
            </div>

            {chartData.segments.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {chartData.segments.map((seg: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 border border-slate-100 rounded-xl p-2 bg-slate-50">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color || '#CBD5E1' }} />
                    <div className="min-w-0 flex-grow">
                      <p className="text-xs font-semibold text-slate-500 truncate">{seg.label}</p>
                      <p className="text-sm font-bold text-brandDeepNavy truncate">{formatValue(seg.value, 'currency')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic text-center">Enter investment amounts above to see the breakdown progress bar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Periodic Breakdown Table component
export function CalculatorBreakdownTable({ tool, values }: { tool: Tool; values: Record<string, number> }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const breakdownData = useMemo(() => {
    const slug = tool.slug;
    const items: Array<{ period: string; opening: number; contribution: number; interest: number; closing: number }> = [];

    // 1. SIP Compounding Table
    if (slug === 'sip-calculator-india') {
      const monthly = values.monthlyInvestment || 0;
      const returnRate = values.expectedReturn || 0;
      const years = values.years || 0;
      const r = returnRate / 12 / 100;
      
      const getFv = (m: number) => {
        if (r === 0) return monthly * m;
        return monthly * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
      };

      const maxYears = Math.min(Math.ceil(years), 40);
      for (let t = 1; t <= maxYears; t++) {
        const isLast = t === maxYears;
        const endMonth = isLast ? years * 12 : t * 12;
        const startMonth = (t - 1) * 12;
        const duration = endMonth - startMonth;

        const opening = getFv(startMonth);
        const closing = getFv(endMonth);
        const contribution = monthly * duration;
        const interest = Math.max(0, closing - opening - contribution);

        items.push({
          period: `Year ${t}${isLast && years % 1 !== 0 ? ` (${(years % 1).toFixed(1)} yr)` : ''}`,
          opening,
          contribution,
          interest,
          closing,
        });
      }
      return items;
    }

    // 2. FD Compounding Table
    if (slug === 'fd-calculator-india') {
      const principal = values.principal || 0;
      const rate = values.annualRate || 0;
      const freq = values.compoundFrequency || 4;
      const years = values.years || 0;

      const getFv = (y: number) => {
        return principal * Math.pow(1 + rate / (freq * 100), freq * y);
      };

      const maxYears = Math.min(Math.ceil(years), 40);
      for (let t = 1; t <= maxYears; t++) {
        const isLast = t === maxYears;
        const endYear = isLast ? years : t;
        const startYear = t - 1;

        const opening = getFv(startYear);
        const closing = getFv(endYear);
        const contribution = 0;
        const interest = Math.max(0, closing - opening);

        items.push({
          period: `Year ${t}${isLast && years % 1 !== 0 ? ` (${(years % 1).toFixed(1)} yr)` : ''}`,
          opening,
          contribution,
          interest,
          closing,
        });
      }
      return items;
    }

    // 3. EMI Loan Amortization Table
    if (slug === 'emi-calculator-india') {
      const principal = values.principal || 0;
      const rate = values.annualRate || 0;
      const years = values.years || 0;
      const totalMonths = Math.ceil(years * 12);
      const r = rate / 12 / 100;
      
      let emi = 0;
      if (r > 0 && totalMonths > 0) {
        emi = principal * (r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
      } else if (totalMonths > 0) {
        emi = principal / totalMonths;
      }

      let balance = principal;
      const maxYears = Math.min(Math.ceil(years), 40);
      for (let t = 1; t <= maxYears; t++) {
        const opening = balance;
        let interestPaid = 0;
        let principalPaid = 0;
        let paymentsPaid = 0;

        const startMonth = (t - 1) * 12;
        const endMonth = Math.min(t * 12, totalMonths);

        for (let m = startMonth; m < endMonth; m++) {
          const interestMonth = balance * r;
          let principalMonth = emi - interestMonth;

          if (balance < principalMonth) {
            principalMonth = balance;
          }

          const paymentMonth = principalMonth + interestMonth;
          balance -= monthlyPrincipalAdjustment(balance, principalMonth);
          
          interestPaid += interestMonth;
          principalPaid += principalMonth;
          paymentsPaid += paymentMonth;
        }

        items.push({
          period: `Year ${t}`,
          opening,
          contribution: paymentsPaid,
          interest: interestPaid,
          closing: Math.max(0, balance),
        });
      }
      return items;
    }

    return null;
  }, [tool.slug, values]);

  // Helper adjustment logic inside amortization loop
  function monthlyPrincipalAdjustment(currentBal: number, pPaid: number) {
    return pPaid;
  }

  if (!breakdownData || breakdownData.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-brandDeepNavy">Yearly Breakdown</h3>
          <p className="text-xs text-slate-500 mt-1">Educational projection schedule of balances and interests.</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-brandNavy hover:bg-slate-50 transition"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide Schedule' : 'Show Schedule'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3 text-right">Opening Balance</th>
                  <th className="px-4 py-3 text-right">
                    {tool.slug === 'emi-calculator-india' ? 'Annual Payments' : 'Annual Contribution'}
                  </th>
                  <th className="px-4 py-3 text-right">
                    {tool.slug === 'sip-calculator-india' ? 'Estimated Growth' : 'Interest Earned'}
                  </th>
                  <th className="px-4 py-3 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {breakdownData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">{row.period}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatValue(row.opening, 'currency')}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatValue(row.contribution, 'currency')}</td>
                    <td className="px-4 py-3 text-right text-brandGrowthGreen">{formatValue(row.interest, 'currency')}</td>
                    <td className="px-4 py-3 text-right font-bold text-brandDeepNavy">{formatValue(row.closing, 'currency')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] text-slate-400 italic">
            * Note: Compounding schedules are rounded estimates. Final returns depend on exact daily accruals, transaction dates, and applicable fees or taxes.
          </p>
        </div>
      )}
    </div>
  );
}

// 4. What-If Scenario Comparison component
export function CalculatorScenarioComparison({ tool, values }: { tool: Tool; values: Record<string, number> }) {
  const scenarioConfig = useMemo(() => {
    const slug = tool.slug;
    
    // Maps slug to [primaryInputKey, primaryOutputKey, inputLabel, outputLabel]
    const mappings: Record<string, [string, string, string, string]> = {
      'sip-calculator-india': ['monthlyInvestment', 'futureValue', 'Monthly SIP Amount', 'Estimated Future Value'],
      'fd-calculator-india': ['principal', 'maturityAmount', 'Deposit Principal', 'Maturity Amount'],
      'emi-calculator-india': ['principal', 'emi', 'Loan Principal', 'Monthly EMI'],
      'salary-in-hand-calculator-india': ['annualCtc', 'monthlyInHand', 'Annual CTC', 'In-Hand Salary'],
      'gst-calculator-india': ['taxableAmount', 'finalAmount', 'Taxable Amount', 'Amount with GST'],
      'income-tax-calculator-old-vs-new-regime-india': ['grossAnnualIncome', 'taxPayableNewRegime', 'Gross Income', 'New Regime Tax'],
      'hra-exemption-calculator-india': ['basicSalary', 'annualHraExemption', 'Monthly Basic Salary', 'Annual HRA Exemption'],
      'gratuity-calculator-india': ['lastDrawnBasicPlusDA', 'finalGratuityPayable', 'Basic + DA Salary', 'Gratuity Payout'],
      'home-loan-emi-calculator-india': ['principal', 'monthlyEmi', 'Loan Amount', 'Monthly EMI'],
      'personal-loan-eligibility-calculator-india': ['monthlyIncome', 'eligibleLoanAmount', 'Net Monthly Income', 'Eligible Loan Amount'],
      'gold-loan-calculator-india': ['pricePerGram24k', 'eligibleLoanAmount', '24K Gold Price per Gram', 'Eligible Loan'],
      'capital-gains-tax-calculator-india': ['ltcgAmount', 'totalTaxWithCess', 'Long-Term Capital Gains', 'Total Tax with Cess'],
      'ppf-calculator-india': ['yearlyInvestment', 'maturityValue', 'Yearly Investment', 'Maturity Value'],
      'lumpsum-calculator-india': ['investmentAmount', 'futureValue', 'Investment Amount', 'Future Value'],
      'epf-corpus-calculator-india': ['monthlyBasicDa', 'estimatedCorpus', 'Monthly Basic + DA', 'EPF Corpus'],
    };

    return mappings[slug] || null;
  }, [tool.slug]);

  const scenarios = useMemo(() => {
    if (!scenarioConfig) return null;
    const [inputKey, outputKey, inputLabel, outputLabel] = scenarioConfig;
    
    const baseValue = values[inputKey] || 0;
    if (baseValue <= 0) return null;

    const runCalc = (targetInVal: number) => {
      const context: Record<string, number> = { ...values, [inputKey]: targetInVal };
      let lastVal = 0;
      let outputFormat = 'currency';

      for (const output of tool.outputs) {
        try {
          const evaluated = parser.parse(output.formula).evaluate(context);
          context[output.key] = evaluated;
          if (output.key === outputKey) {
            lastVal = evaluated;
            outputFormat = output.format;
          }
        } catch {
          // Fallback
        }
      }
      return { val: lastVal, formatted: formatValue(lastVal, outputFormat) };
    };

    const dec10 = baseValue * 0.9;
    const inc10 = baseValue * 1.1;

    const resDec = runCalc(dec10);
    const resBase = runCalc(baseValue);
    const resInc = runCalc(inc10);

    return {
      inputLabel,
      outputLabel,
      decInput: formatValue(dec10, 'currency'),
      baseInput: formatValue(baseValue, 'currency'),
      incInput: formatValue(inc10, 'currency'),
      decOutput: resDec.formatted,
      baseOutput: resBase.formatted,
      incOutput: resInc.formatted,
    };
  }, [scenarioConfig, values, tool.outputs]);

  if (!scenarios) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-brandDeepNavy">What-If Scenarios</h3>
      <p className="text-xs text-slate-500 mt-1">See how a 10% change in your primary input affects the final outcome.</p>
      
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {/* Decrease 10% */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
          <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">-10% Scenario</span>
          <p className="mt-3 text-xs font-semibold text-slate-500">{scenarios.inputLabel}</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5">{scenarios.decInput}</p>
          <div className="my-3 border-t border-dashed border-slate-200" />
          <p className="text-xs font-semibold text-slate-500">{scenarios.outputLabel}</p>
          <p className="text-base font-black text-brandDeepNavy mt-0.5">{scenarios.decOutput}</p>
        </div>

        {/* Current Base */}
        <div className="rounded-2xl border border-brandNavy/15 bg-brandNavy/5 p-4 text-center ring-1 ring-brandNavy/10">
          <span className="inline-block rounded-full bg-brandNavy/10 px-2.5 py-0.5 text-xs font-bold text-brandNavy">Current Baseline</span>
          <p className="mt-3 text-xs font-semibold text-slate-500">{scenarios.inputLabel}</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5">{scenarios.baseInput}</p>
          <div className="my-3 border-t border-dashed border-slate-200" />
          <p className="text-xs font-semibold text-slate-500">{scenarios.outputLabel}</p>
          <p className="text-lg font-black text-brandDeepNavy mt-0.5">{scenarios.baseOutput}</p>
        </div>

        {/* Increase 10% */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
          <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">+10% Scenario</span>
          <p className="mt-3 text-xs font-semibold text-slate-500">{scenarios.inputLabel}</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5">{scenarios.incInput}</p>
          <div className="my-3 border-t border-dashed border-slate-200" />
          <p className="text-xs font-semibold text-slate-500">{scenarios.outputLabel}</p>
          <p className="text-base font-black text-brandDeepNavy mt-0.5">{scenarios.incOutput}</p>
        </div>
      </div>
    </div>
  );
}

// 5. Insight box component
export function CalculatorInsightBox() {
  return (
    <div className="rounded-2xl border border-brandNavy/10 bg-brandNavy/5 px-5 py-4 text-sm leading-6 text-brandMuted">
      <p className="font-bold text-brandDeepNavy flex items-center gap-1.5">
        <span>💡</span> Educational Estimates Only
      </p>
      <p className="mt-1 text-slate-600">
        This visual breakdown and compounding model is for educational understanding only. Actual outcomes can vary depending on interest accrual dates, taxation brackets, processing fees, and individual employer/lender terms.
      </p>
    </div>
  );
}
