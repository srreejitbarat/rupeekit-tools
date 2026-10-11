'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Parser } from 'expr-eval';
import { CalculatorResultSummary } from '@/components/CalculatorVisualizations';
import DownloadPersonalLoanReportButton from '@/components/personal-loan/DownloadPersonalLoanReportButton';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import type {
  PersonalLoanAmortizationRow,
  PersonalLoanEmiReportPdfData,
  PersonalLoanPauseScenario,
  PersonalLoanPrepaymentScenario,
  PersonalLoanTenureRow,
} from '@/components/personal-loan/PersonalLoanEmiReportPdfDocument';
import type { Tool, ToolInput, ToolQuickAnswer } from '@/lib/tools';
import { trackToolEvent } from '@/lib/events';
import CalculatorPresets, { type CalculatorPreset } from '@/components/calculators/CalculatorPresets';

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

type LoanScheduleRow = {
  month: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
  extraPayment: number;
};

type LoanScheduleSummary = {
  rows: LoanScheduleRow[];
  totalInterest: number;
  totalRepayment: number;
  monthsTaken: number;
};

type PrepaymentMode = 'reduce-tenure' | 'reduce-emi';
type PauseRestartMode = 'same-emi' | 'higher-emi';

interface PersonalLoanDecisionSimulatorProps {
  tool: Tool;
  quickAnswer?: ToolQuickAnswer;
  answerEngineSummary?: string;
}

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

function formatCurrency(value: number) {
  return formatValue(value, 'currency');
}

function formatPercent(value: number) {
  return `${Number.isFinite(value) ? value.toFixed(2) : '0.00'}%`;
}

function clampNumber(value: number, min = 0, max?: number) {
  let next = Number.isFinite(value) ? value : min;
  if (next < min) next = min;
  if (typeof max === 'number' && next > max) next = max;
  return next;
}

function calculateEmi(principal: number, monthlyRate: number, months: number) {
  const safePrincipal = Math.max(0, principal);
  const safeMonths = Math.max(1, Math.round(months));
  if (safePrincipal === 0) return 0;
  if (monthlyRate <= 0) return safePrincipal / safeMonths;
  const factor = (1 + monthlyRate) ** safeMonths;
  return safePrincipal * monthlyRate * factor / (factor - 1);
}

function runSchedule({
  principal,
  monthlyRate,
  tenureMonths,
  initialEmi,
  prepaymentAmount = 0,
  prepaymentAfterMonth = 0,
  prepaymentMode = 'reduce-tenure',
}: {
  principal: number;
  monthlyRate: number;
  tenureMonths: number;
  initialEmi: number;
  prepaymentAmount?: number;
  prepaymentAfterMonth?: number;
  prepaymentMode?: PrepaymentMode;
}): LoanScheduleSummary & { revisedEmi: number } {
  const rows: LoanScheduleRow[] = [];
  const safePrincipal = Math.max(0, principal);
  const safeTenureMonths = Math.max(1, Math.round(tenureMonths));
  const safePrepaymentAmount = Math.max(0, prepaymentAmount);
  const safePrepaymentAfterMonth = Math.max(0, Math.round(prepaymentAfterMonth));

  let balance = safePrincipal;
  let currentEmi = Math.max(0, initialEmi);
  let totalInterest = 0;
  let totalRepayment = 0;
  let month = 1;
  const maxMonths = safeTenureMonths + 240;
  let revisedEmi = currentEmi;

  while (balance > 0.01 && month <= maxMonths) {
    if (currentEmi <= 0) break;

    const interestPaid = monthlyRate > 0 ? balance * monthlyRate : 0;
    let principalPaid = currentEmi - interestPaid;
    if (principalPaid < 0) principalPaid = 0;

    if (principalPaid > balance) {
      principalPaid = balance;
      currentEmi = principalPaid + interestPaid;
    }

    balance = Math.max(0, balance - principalPaid);
    let extraPayment = 0;

    if (safePrepaymentAmount > 0 && month === safePrepaymentAfterMonth && balance > 0) {
      extraPayment = Math.min(safePrepaymentAmount, balance);
      balance = Math.max(0, balance - extraPayment);
      if (prepaymentMode === 'reduce-emi') {
        const remainingMonths = Math.max(1, safeTenureMonths - month);
        revisedEmi = calculateEmi(balance, monthlyRate, remainingMonths);
        currentEmi = revisedEmi;
      }
    }

    rows.push({
      month,
      emi: currentEmi,
      principalPaid,
      interestPaid,
      closingBalance: balance,
      extraPayment,
    });

    totalInterest += interestPaid;
    totalRepayment += currentEmi + extraPayment;
    month += 1;
  }

  return {
    rows,
    totalInterest,
    totalRepayment,
    monthsTaken: rows.length,
    revisedEmi,
  };
}

function buildPauseScenario({
  principal,
  monthlyRate,
  tenureMonths,
  monthlyEmi,
  pauseMonths,
  restartMode,
}: {
  principal: number;
  monthlyRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  pauseMonths: number;
  restartMode: PauseRestartMode;
}): LoanScheduleSummary & { revisedEmi: number; unpaidEmiAmount: number } {
  const safePrincipal = Math.max(0, principal);
  const safeTenureMonths = Math.max(1, Math.round(tenureMonths));
  const safePauseMonths = clampNumber(Math.round(pauseMonths), 0, 3);
  const safeMonthlyEmi = Math.max(0, monthlyEmi);

  const rows: LoanScheduleRow[] = [];
  let balance = safePrincipal;
  let totalInterest = 0;
  let totalRepayment = 0;

  for (let month = 1; month <= safePauseMonths; month += 1) {
    const interestPaid = monthlyRate > 0 ? balance * monthlyRate : 0;
    balance += interestPaid;
    rows.push({
      month,
      emi: 0,
      principalPaid: 0,
      interestPaid,
      closingBalance: balance,
      extraPayment: 0,
    });
    totalInterest += interestPaid;
  }

  const remainingMonths = Math.max(1, safeTenureMonths - safePauseMonths);
  let revisedEmi =
    restartMode === 'higher-emi' ? calculateEmi(balance, monthlyRate, remainingMonths) : safeMonthlyEmi;
  if (revisedEmi <= 0) revisedEmi = safeMonthlyEmi;

  let month = safePauseMonths + 1;
  const maxMonths = safeTenureMonths + 240;

  while (balance > 0.01 && month <= maxMonths) {
    if (revisedEmi <= 0) break;

    const interestPaid = monthlyRate > 0 ? balance * monthlyRate : 0;
    let principalPaid = revisedEmi - interestPaid;
    if (principalPaid < 0) principalPaid = 0;

    if (principalPaid > balance) {
      principalPaid = balance;
      revisedEmi = principalPaid + interestPaid;
    }

    balance = Math.max(0, balance - principalPaid);
    rows.push({
      month,
      emi: revisedEmi,
      principalPaid,
      interestPaid,
      closingBalance: balance,
      extraPayment: 0,
    });

    totalInterest += interestPaid;
    totalRepayment += revisedEmi;
    month += 1;
  }

  return {
    rows,
    totalInterest,
    totalRepayment,
    monthsTaken: rows.length,
    revisedEmi,
    unpaidEmiAmount: safeMonthlyEmi * safePauseMonths,
  };
}

function buildYearlySummary(rows: LoanScheduleRow[]): PersonalLoanAmortizationRow[] {
  const yearMap = new Map<number, PersonalLoanAmortizationRow>();
  for (const row of rows) {
    const year = Math.floor((row.month - 1) / 12) + 1;
    const current = yearMap.get(year) ?? {
      yearLabel: `Year ${year}`,
      emiPaid: 0,
      principalPaid: 0,
      interestPaid: 0,
      closingBalance: row.closingBalance,
    };
    current.emiPaid += row.emi + row.extraPayment;
    current.principalPaid += row.principalPaid + row.extraPayment;
    current.interestPaid += row.interestPaid;
    current.closingBalance = row.closingBalance;
    yearMap.set(year, current);
  }
  return [...yearMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map((entry) => entry[1]);
}

function getAffordabilityStatus(emiToIncomePercent: number) {
  if (emiToIncomePercent <= 20) {
    return { label: 'Comfortable', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  if (emiToIncomePercent <= 35) {
    return { label: 'Caution', tone: 'text-amber-700 bg-amber-50 border-amber-200' };
  }
  if (emiToIncomePercent <= 50) {
    return { label: 'High burden', tone: 'text-orange-700 bg-orange-50 border-orange-200' };
  }
  return { label: 'Very high burden', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function downloadPersonalLoanResultCardSvg({
  principal,
  tenureMonths,
  annualInterestRate,
  monthlyEmi,
  totalInterest,
  totalRepayment,
}: {
  principal: number;
  tenureMonths: number;
  annualInterestRate: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
}) {
  const safePrincipal = escapeSvgText(formatCurrency(principal));
  const safeTenure = escapeSvgText(`${tenureMonths} months`);
  const safeRate = escapeSvgText(formatPercent(annualInterestRate));
  const safeEmi = escapeSvgText(formatCurrency(monthlyEmi));
  const safeInterest = escapeSvgText(formatCurrency(totalInterest));
  const safeRepayment = escapeSvgText(formatCurrency(totalRepayment));

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RupeeKit personal loan EMI result card">
  <defs>
    <linearGradient id="pl-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2f5a" />
      <stop offset="100%" stop-color="#14532d" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1200" height="675" fill="url(#pl-bg)" />
  <rect x="56" y="56" width="1088" height="563" rx="24" fill="#ffffff" opacity="0.97" />
  <text x="96" y="128" fill="#0f2f5a" font-size="46" font-family="Arial, sans-serif" font-weight="700">RupeeKit</text>
  <text x="96" y="176" fill="#334155" font-size="22" font-family="Arial, sans-serif">Personal Loan EMI Result Card</text>
  <text x="96" y="246" fill="#111827" font-size="30" font-family="Arial, sans-serif" font-weight="700">Loan amount: ${safePrincipal}</text>
  <text x="96" y="298" fill="#111827" font-size="30" font-family="Arial, sans-serif" font-weight="700">Tenure: ${safeTenure}</text>
  <text x="96" y="350" fill="#111827" font-size="30" font-family="Arial, sans-serif" font-weight="700">Assumed rate: ${safeRate}</text>
  <text x="96" y="432" fill="#0f2f5a" font-size="30" font-family="Arial, sans-serif" font-weight="700">Estimated EMI</text>
  <text x="96" y="504" fill="#166534" font-size="64" font-family="Arial, sans-serif" font-weight="700">${safeEmi}</text>
  <text x="640" y="246" fill="#0f172a" font-size="28" font-family="Arial, sans-serif" font-weight="700">Total interest: ${safeInterest}</text>
  <text x="640" y="298" fill="#0f172a" font-size="28" font-family="Arial, sans-serif" font-weight="700">Total repayment: ${safeRepayment}</text>
  <text x="96" y="570" fill="#475569" font-size="20" font-family="Arial, sans-serif">Educational estimate only. RupeeKit is not a lender.</text>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'personal-loan-emi-result-card-rupeekit.svg';
  anchor.click();
  URL.revokeObjectURL(url);
}

function toReportDateLabel() {
  return new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toNumberOrFallback(raw: string, fallback: number, min?: number, max?: number) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return clampNumber(parsed, typeof min === 'number' ? min : Number.NEGATIVE_INFINITY, max);
}

function PersonalLoanInput({
  input,
  value,
  onChange,
  onBlur,
}: {
  input: ToolInput;
  value: string;
  onChange: (raw: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
        {input.label}
        {input.unit ? <span className="font-medium text-slate-500">{input.unit}</span> : null}
      </span>
      <input
        type="number"
        value={value}
        min={input.min}
        max={input.max}
        step={input.step ?? 1}
        onFocus={(event) => event.target.select()}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
      />
      {input.help ? <span className="mt-2 block text-xs leading-5 text-slate-600">{input.help}</span> : null}
    </label>
  );
}

function AdvancedSectionCard({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandNavy/30">
        <div>
          <h2 className="text-xl font-bold text-brandDeepNavy">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{summary}</p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 group-open:hidden">
          Expand
        </span>
        <span className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 group-open:inline-flex">
          Collapse
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function TenureBarCard({
  title,
  subtitle,
  rows,
  valueKey,
  barClassName,
}: {
  title: string;
  subtitle: string;
  rows: PersonalLoanTenureRow[];
  valueKey: 'monthlyEmi' | 'totalInterest';
  barClassName: string;
}) {
  const maxValue = Math.max(...rows.map((row) => row[valueKey]), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-base font-bold text-brandDeepNavy">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">{subtitle}</p>
      <div className="mt-4 overflow-x-auto">
        <div className="grid min-w-[520px] grid-cols-5 items-end gap-3">
          {rows.map((row) => {
            const value = row[valueKey];
            const height = Math.max(10, Math.round((value / maxValue) * 100));
            return (
              <div key={`${valueKey}-${row.tenure}`} className="min-w-0">
                <div className="flex h-40 items-end rounded-xl bg-slate-100 p-1.5">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ease-out ${barClassName}`}
                    style={{ height: `${height}%` }}
                    aria-label={`${row.tenure} months: ${formatCurrency(value)}`}
                  />
                </div>
                <p className="mt-2 text-center text-[11px] font-bold text-slate-700">{row.tenure}m</p>
                <p className="mt-1 text-center text-[11px] font-semibold text-slate-600">
                  {formatCurrency(value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PrincipalInterestCard({
  principal,
  totalInterest,
}: {
  principal: number;
  totalInterest: number;
}) {
  const safePrincipal = Math.max(0, principal);
  const safeInterest = Math.max(0, totalInterest);
  const total = safePrincipal + safeInterest;
  const principalPct = total > 0 ? safePrincipal / total : 0;
  const interestPct = total > 0 ? safeInterest / total : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const principalLength = circumference * principalPct;
  const interestLength = circumference * interestPct;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-base font-bold text-brandDeepNavy">Principal vs Interest</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Current selected tenure split between principal and total interest.
      </p>
      <div className="mt-4 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative h-44 w-44">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label="Donut chart showing selected personal loan split between principal amount and total interest."
          >
            <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#003080"
              strokeWidth="12"
              strokeDasharray={`${principalLength} ${Math.max(circumference - principalLength, 0)}`}
              strokeDashoffset={0}
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#43A047"
              strokeWidth="12"
              strokeDasharray={`${interestLength} ${Math.max(circumference - interestLength, 0)}`}
              strokeDashoffset={-principalLength}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total cost</p>
            <p className="mt-1 text-sm font-black text-brandDeepNavy">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="w-full space-y-3 md:max-w-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Principal</p>
            <p className="mt-1 text-sm font-bold text-brandDeepNavy">{formatCurrency(safePrincipal)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Total interest</p>
            <p className="mt-1 text-sm font-bold text-brandDeepNavy">{formatCurrency(safeInterest)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmiBurdenProgressCard({
  emiToIncomePercent,
  hasMonthlyIncome,
}: {
  emiToIncomePercent: number;
  hasMonthlyIncome: boolean;
}) {
  const safePercent = Math.max(0, emiToIncomePercent);
  const markerPosition = Math.min(100, safePercent);
  const isHigh = safePercent >= 50;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-base font-bold text-brandDeepNavy">EMI Burden Progress</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        EMI as a share of monthly income can help compare affordability across tenures.
      </p>

      <div className="mt-4">
        <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute inset-y-0 left-0 w-[30%] bg-emerald-500/60" />
          <div className="absolute inset-y-0 left-[30%] w-[20%] bg-amber-400/70" />
          <div className="absolute inset-y-0 left-[50%] right-0 bg-rose-400/70" />
          <div
            className="absolute -top-1 h-6 w-1 rounded-full bg-brandDeepNavy"
            style={{ left: `calc(${markerPosition}% - 2px)` }}
            aria-hidden="true"
          />
        </div>

        <div className="mt-3 flex justify-between text-[11px] font-semibold text-slate-600">
          <span>Comfortable range</span>
          <span>Watch range</span>
          <span>High burden range</span>
        </div>

        <p className="mt-3 text-sm font-bold text-brandDeepNavy">
          EMI as % of income: {formatPercent(safePercent)}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {hasMonthlyIncome
            ? 'This indicator is only a budgeting estimate. It is not loan eligibility, approval advice, or financial advice.'
            : 'Add monthly income in the calculator above to personalize this budgeting estimate.'}
        </p>

        {isHigh ? (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            Your EMI burden may feel high compared with your monthly income. Consider comparing tenure, loan amount
            and lender terms before applying.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function PersonalLoanDecisionSimulator({
  tool,
  quickAnswer,
  answerEngineSummary,
}: PersonalLoanDecisionSimulatorProps) {
  const initialValues = useMemo(
    () => Object.fromEntries(tool.inputs.map((input) => [input.key, Number(input.default ?? 0)])),
    [tool.inputs]
  );
  const initialDraftValues = useMemo(
    () => Object.fromEntries(tool.inputs.map((input) => [input.key, String(Number(input.default ?? 0))])),
    [tool.inputs]
  );

  const [values, setValues] = useState<Record<string, number>>(initialValues);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(initialDraftValues);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const inputByKey = useMemo(() => new Map(tool.inputs.map((input) => [input.key, input])), [tool.inputs]);

  const applyPreset = (preset: CalculatorPreset) => {
    const applied: Record<string, number> = {};
    for (const [key, rawValue] of Object.entries(preset.values)) {
      const inputDef = inputByKey.get(key);
      if (!inputDef || typeof rawValue !== 'number' || !Number.isFinite(rawValue)) continue;
      applied[key] = clampNumber(rawValue, inputDef.min ?? Number.NEGATIVE_INFINITY, inputDef.max);
    }
    setValues((current) => ({ ...current, ...applied }));
    setDraftValues((current) => ({
      ...current,
      ...Object.fromEntries(Object.entries(applied).map(([key, value]) => [key, String(value)])),
    }));
    setActivePresetId(preset.id);
    trackToolEvent({
      eventName: 'personal_loan_preset_applied',
      page: '/tools/personal-loan-emi-calculator-india',
      toolSlug: 'personal-loan-emi-calculator-india',
      context: preset.id,
    });
  };
  const [prepaymentAmount, setPrepaymentAmount] = useState(0);
  const [prepaymentAfterMonth, setPrepaymentAfterMonth] = useState(12);
  const [prepaymentMode, setPrepaymentMode] = useState<PrepaymentMode>('reduce-tenure');
  const [missedMonths, setMissedMonths] = useState(1);
  const [pauseRestartMode, setPauseRestartMode] = useState<PauseRestartMode>('same-emi');
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [resultCardError, setResultCardError] = useState<string | null>(null);

  const trackedStart = useRef(false);
  const trackedResult = useRef(false);
  const trackedTrueCost = useRef(false);
  const trackedPrepayment = useRef(false);

  useEffect(() => {
    setValues(initialValues);
    setDraftValues(initialDraftValues);
  }, [initialValues, initialDraftValues]);

  useEffect(() => {
    setPrepaymentAfterMonth((current) =>
      clampNumber(current, 1, Math.max(1, Math.round((values.tenureMonths ?? 1) - 1)))
    );
  }, [values.tenureMonths]);

  useEffect(() => {
    if (trackedStart.current) return;
    trackToolEvent({
      eventName: 'personal_loan_calculator_started',
      page: '/tools/personal-loan-emi-calculator-india',
      toolSlug: 'personal-loan-emi-calculator-india',
      context: 'decision-simulator',
    });
    trackedStart.current = true;
  }, []);

  const results = useMemo(() => {
    const context: Record<string, number> = { ...values };
    return tool.outputs.map((output) => {
      try {
        const value = parser.parse(output.formula).evaluate(context);
        context[output.key] = value;
        return { ...output, value, formatted: formatValue(value, output.format) };
      } catch {
        return { ...output, value: Number.NaN, formatted: 'Check inputs' };
      }
    });
  }, [tool.outputs, values]);

  const resultMap = useMemo(() => new Map(results.map((result) => [result.key, result])), [results]);

  const principal = Math.max(0, values.principal ?? 0);
  const annualInterestRate = Math.max(0, values.annualInterestRate ?? 0);
  const tenureMonths = Math.max(1, Math.round(values.tenureMonths ?? 1));
  const monthlyRate = annualInterestRate / 1200;
  const monthlyIncome = Math.max(0, values.monthlyIncome ?? 0);
  const existingMonthlyEmi = Math.max(0, values.existingMonthlyEmi ?? 0);

  const monthlyEmi = Number.isFinite(resultMap.get('monthlyEmi')?.value)
    ? resultMap.get('monthlyEmi')!.value
    : calculateEmi(principal, monthlyRate, tenureMonths);
  const totalRepayment = Number.isFinite(resultMap.get('totalPayment')?.value)
    ? resultMap.get('totalPayment')!.value
    : monthlyEmi * tenureMonths;
  const totalInterest = Number.isFinite(resultMap.get('totalInterest')?.value)
    ? resultMap.get('totalInterest')!.value
    : Math.max(0, totalRepayment - principal);
  const processingFee = Number.isFinite(resultMap.get('processingFee')?.value)
    ? resultMap.get('processingFee')!.value
    : 0;
  const gstOnProcessingFee = Number.isFinite(resultMap.get('gstOnProcessingFee')?.value)
    ? resultMap.get('gstOnProcessingFee')!.value
    : 0;
  const optionalAddOnCost = Number.isFinite(resultMap.get('optionalAddOnCost')?.value)
    ? resultMap.get('optionalAddOnCost')!.value
    : 0;
  const totalUpfrontCharges = Number.isFinite(resultMap.get('totalUpfrontCharges')?.value)
    ? resultMap.get('totalUpfrontCharges')!.value
    : processingFee + gstOnProcessingFee + optionalAddOnCost;
  const totalCostWithFee = Number.isFinite(resultMap.get('totalCostWithFee')?.value)
    ? resultMap.get('totalCostWithFee')!.value
    : totalRepayment + totalUpfrontCharges;
  const netDisbursedAmount = Number.isFinite(resultMap.get('netDisbursedAmount')?.value)
    ? resultMap.get('netDisbursedAmount')!.value
    : principal - totalUpfrontCharges;
  const emiToIncomePercent = monthlyIncome > 0 ? (monthlyEmi / monthlyIncome) * 100 : 0;
  const totalEmiBurdenPercent = monthlyIncome > 0 ? ((monthlyEmi + existingMonthlyEmi) / monthlyIncome) * 100 : 0;
  const affordabilityStatus = getAffordabilityStatus(emiToIncomePercent);

  const baseSchedule = useMemo(
    () =>
      runSchedule({
        principal,
        monthlyRate,
        tenureMonths,
        initialEmi: monthlyEmi,
      }),
    [principal, monthlyRate, tenureMonths, monthlyEmi]
  );

  const yearlyAmortizationRows = useMemo(() => buildYearlySummary(baseSchedule.rows), [baseSchedule.rows]);
  const previewRows = useMemo(() => baseSchedule.rows.slice(0, Math.min(12, baseSchedule.rows.length)), [baseSchedule.rows]);

  const tenureComparisonRows = useMemo<PersonalLoanTenureRow[]>(() => {
    const tenures = [12, 24, 36, 48, 60];
    const rows = tenures.map((tenure) => {
      const emi = calculateEmi(principal, monthlyRate, tenure);
      const repayment = emi * tenure;
      const interest = Math.max(0, repayment - principal);
      return {
        tenure,
        monthlyEmi: emi,
        totalInterest: interest,
        totalRepayment: repayment,
        extraInterestVsShortest: 0,
      };
    });
    const shortestInterest = rows[0]?.totalInterest ?? 0;
    return rows.map((row) => ({
      ...row,
      extraInterestVsShortest: Math.max(0, row.totalInterest - shortestInterest),
    }));
  }, [principal, monthlyRate]);

  const prepaymentScenario = useMemo<PersonalLoanPrepaymentScenario | null>(() => {
    if (prepaymentAmount <= 0 || prepaymentAfterMonth < 1 || prepaymentAfterMonth >= tenureMonths) return null;

    const revisedSchedule = runSchedule({
      principal,
      monthlyRate,
      tenureMonths,
      initialEmi: monthlyEmi,
      prepaymentAmount,
      prepaymentAfterMonth,
      prepaymentMode,
    });

    return {
      mode: prepaymentMode,
      prepaymentAmount,
      prepaymentAfterMonth,
      originalTotalInterest: totalInterest,
      revisedTotalInterest: revisedSchedule.totalInterest,
      interestSaved: Math.max(0, totalInterest - revisedSchedule.totalInterest),
      monthsReduced:
        prepaymentMode === 'reduce-tenure' ? Math.max(0, tenureMonths - revisedSchedule.monthsTaken) : 0,
      revisedEmi: prepaymentMode === 'reduce-emi' ? revisedSchedule.revisedEmi : monthlyEmi,
      revisedTenureMonths: revisedSchedule.monthsTaken,
      revisedTotalRepayment: revisedSchedule.totalRepayment,
    };
  }, [
    prepaymentAmount,
    prepaymentAfterMonth,
    tenureMonths,
    principal,
    monthlyRate,
    monthlyEmi,
    prepaymentMode,
    totalInterest,
  ]);

  const pauseScenario = useMemo<PersonalLoanPauseScenario>(() => {
    const revisedSchedule = buildPauseScenario({
      principal,
      monthlyRate,
      tenureMonths,
      monthlyEmi,
      pauseMonths: missedMonths,
      restartMode: pauseRestartMode,
    });
    return {
      pauseMonths: missedMonths,
      restartOption: pauseRestartMode,
      unpaidEmiAmount: revisedSchedule.unpaidEmiAmount,
      possibleRepaymentDelayMonths: Math.max(0, revisedSchedule.monthsTaken - tenureMonths),
      estimatedExtraInterestImpact: Math.max(0, revisedSchedule.totalInterest - totalInterest),
      revisedEmi: revisedSchedule.revisedEmi,
    };
  }, [principal, monthlyRate, tenureMonths, monthlyEmi, missedMonths, pauseRestartMode, totalInterest]);

  const hasUserChangedCoreInput = useMemo(
    () => Object.keys(initialValues).some((key) => (values[key] ?? 0) !== (initialValues[key] ?? 0)),
    [values, initialValues]
  );

  useEffect(() => {
    if (trackedResult.current || !hasUserChangedCoreInput || !Number.isFinite(monthlyEmi) || monthlyEmi <= 0) return;
    trackToolEvent({
      eventName: 'personal_loan_result_calculated',
      page: '/tools/personal-loan-emi-calculator-india',
      toolSlug: 'personal-loan-emi-calculator-india',
      context: 'core-result',
    });
    trackedResult.current = true;
  }, [hasUserChangedCoreInput, monthlyEmi]);

  useEffect(() => {
    const feeInputsTouched =
      (values.processingFeePercent ?? 0) !== (initialValues.processingFeePercent ?? 0)
      || (values.processingFeeFixedAmount ?? 0) !== (initialValues.processingFeeFixedAmount ?? 0)
      || (values.processingFeeGstRate ?? 0) !== (initialValues.processingFeeGstRate ?? 0)
      || (values.includeGstOnProcessingFee ?? 0) !== (initialValues.includeGstOnProcessingFee ?? 0)
      || (values.insuranceAddonFee ?? 0) !== (initialValues.insuranceAddonFee ?? 0)
      || (values.documentationFee ?? 0) !== (initialValues.documentationFee ?? 0);

    if (!trackedTrueCost.current && feeInputsTouched) {
      trackToolEvent({
        eventName: 'personal_loan_true_cost_used',
        page: '/tools/personal-loan-emi-calculator-india',
        toolSlug: 'personal-loan-emi-calculator-india',
        context: 'true-cost-section',
      });
      trackedTrueCost.current = true;
    }
  }, [values, initialValues]);

  useEffect(() => {
    if (!trackedPrepayment.current && prepaymentAmount > 0 && prepaymentAfterMonth > 0) {
      trackToolEvent({
        eventName: 'personal_loan_prepayment_used',
        page: '/tools/personal-loan-emi-calculator-india',
        toolSlug: 'personal-loan-emi-calculator-india',
        context: prepaymentMode,
      });
      trackedPrepayment.current = true;
    }
  }, [prepaymentAmount, prepaymentAfterMonth, prepaymentMode]);

  const monthlyScheduleForPdf = useMemo(
    () =>
      baseSchedule.rows.map((row) => ({
        month: row.month,
        emi: row.emi + row.extraPayment,
        principalPaid: row.principalPaid + row.extraPayment,
        interestPaid: row.interestPaid,
        closingBalance: row.closingBalance,
      })),
    [baseSchedule.rows]
  );

  const personalLoanReportData = useMemo<PersonalLoanEmiReportPdfData>(() => ({
    generatedAt: toReportDateLabel(),
    principal,
    annualInterestRate,
    tenureMonths,
    processingFeePercent: Math.max(0, values.processingFeePercent ?? 0),
    processingFeeFixedAmount: Math.max(0, values.processingFeeFixedAmount ?? 0),
    includeGstOnProcessingFee: (values.includeGstOnProcessingFee ?? 1) >= 1,
    processingFeeGstRate: Math.max(0, values.processingFeeGstRate ?? 0),
    insuranceAddonFee: Math.max(0, values.insuranceAddonFee ?? 0),
    documentationFee: Math.max(0, values.documentationFee ?? 0),
    monthlyIncome,
    existingMonthlyEmi,
    monthlyEmi,
    totalInterest,
    totalRepayment,
    processingFee,
    estimatedProcessingFee: processingFee,
    gstOnProcessingFee,
    optionalAddOnCost,
    totalUpfrontCharges,
    totalCostWithFee,
    netDisbursedAmount,
    emiToIncomePercent,
    totalEmiBurdenPercent,
    affordabilityStatus: monthlyIncome > 0 ? affordabilityStatus.label : undefined,
    tenureComparison: tenureComparisonRows,
    amortization: yearlyAmortizationRows,
    monthlySchedule: monthlyScheduleForPdf,
    prepaymentScenario: prepaymentScenario ?? undefined,
    pauseScenario,
  }), [
    principal,
    annualInterestRate,
    tenureMonths,
    values.processingFeePercent,
    values.processingFeeFixedAmount,
    values.includeGstOnProcessingFee,
    values.processingFeeGstRate,
    values.insuranceAddonFee,
    values.documentationFee,
    monthlyIncome,
    existingMonthlyEmi,
    monthlyEmi,
    totalInterest,
    totalRepayment,
    processingFee,
    gstOnProcessingFee,
    optionalAddOnCost,
    totalUpfrontCharges,
    totalCostWithFee,
    netDisbursedAmount,
    emiToIncomePercent,
    totalEmiBurdenPercent,
    affordabilityStatus.label,
    tenureComparisonRows,
    yearlyAmortizationRows,
    monthlyScheduleForPdf,
    prepaymentScenario,
    pauseScenario,
  ]);

  const handleResultCardDownload = () => {
    setResultCardError(null);
    try {
      downloadPersonalLoanResultCardSvg({
        principal,
        tenureMonths,
        annualInterestRate,
        monthlyEmi,
        totalInterest,
        totalRepayment,
      });
      trackToolEvent({
        eventName: 'personal_loan_result_card_downloaded',
        page: '/tools/personal-loan-emi-calculator-india',
        toolSlug: 'personal-loan-emi-calculator-india',
        context: 'emi-result-card',
      });
    } catch {
      setResultCardError('Could not download the EMI result card. Please try again.');
    }
  };

  return (
    <div className="space-y-6">


      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-brandDeepNavy">Enter your values</h2>
          {tool.presets?.length ? (
            <CalculatorPresets
              className="mt-4"
              presets={tool.presets}
              activePresetId={activePresetId}
              onApply={applyPreset}
            />
          ) : null}
          <div className="mt-6 grid gap-5">
            {tool.inputs.map((input) => (
              <PersonalLoanInput
                key={input.key}
                input={input}
                value={draftValues[input.key] ?? ''}
                onChange={(raw) => {
                  setActivePresetId(null);
                  setDraftValues((current) => ({ ...current, [input.key]: raw }));
                  if (raw === '') {
                    setValues((current) => ({ ...current, [input.key]: 0 }));
                    return;
                  }
                  const parsed = Number(raw);
                  if (!Number.isFinite(parsed)) return;
                  setValues((current) => ({ ...current, [input.key]: parsed }));
                }}
                onBlur={() => {
                  const fallback = Number(input.default ?? 0);
                  const raw = draftValues[input.key] ?? '';
                  const parsed = raw.trim() === ''
                    ? clampNumber(fallback, input.min ?? Number.NEGATIVE_INFINITY, input.max)
                    : toNumberOrFallback(raw, fallback, input.min, input.max);

                  setValues((current) => ({ ...current, [input.key]: parsed }));
                  setDraftValues((current) => ({ ...current, [input.key]: String(parsed) }));
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-8">
          <div>
            <h2 className="text-xl font-bold text-brandDeepNavy">Estimated results</h2>
            <div className="mt-6">
              <CalculatorResultSummary results={results} />
            </div>

            <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <h3 className="text-base font-bold text-slate-900">Result insight</h3>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Your estimated EMI is <span className="font-semibold">{formatCurrency(monthlyEmi)}</span>. Over the selected
                tenure, total repayment may be <span className="font-semibold">{formatCurrency(totalRepayment)}</span>, including{' '}
                <span className="font-semibold">{formatCurrency(totalInterest)}</span> estimated interest.
                {processingFee > 0 || gstOnProcessingFee > 0 || optionalAddOnCost > 0
                  ? ` Entered fees and add-ons may add around ${formatCurrency(totalUpfrontCharges)} to upfront borrowing cost.`
                  : ' Entered fee values are currently minimal, so upfront fee impact may stay low in this estimate.'}
                {monthlyIncome > 0
                  ? ` Based on your entered income, EMI burden status is ${affordabilityStatus.label.toLowerCase()} (${formatPercent(emiToIncomePercent)}).`
                  : ''}
                {' '}A lower EMI may reduce monthly pressure, but longer tenure can increase total interest.
              </p>
            </section>

            <p className="mt-4 text-sm leading-6 text-slate-700">
              Free educational calculator. No login. No documents. RupeeKit is not a lender.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <DownloadPersonalLoanReportButton data={personalLoanReportData} />
              <button
                type="button"
                onClick={handleResultCardDownload}
                className="inline-flex items-center rounded-full border border-brandNavy bg-white px-4 py-2 text-sm font-bold text-brandNavy transition hover:bg-brandNavy/10"
              >
                Download EMI Result Card
              </button>
            </div>
            {resultCardError ? <p className="mt-2 text-sm text-rose-700">{resultCardError}</p> : null}
          </div>

          <p className="mt-6 rounded-2xl border border-brandBorder bg-white/70 p-4 text-sm leading-6 text-brandMuted">
            Educational estimate only. RupeeKit is not a lender and does not provide loan approval, lender
            recommendation, or live bank interest rates.
          </p>
        </div>
      </section>


      <details className="tool-guide">
        <summary>Detailed breakdown</summary>
        <div className="space-y-6 pt-2">
<section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-sm font-semibold text-emerald-900">
          Free educational calculator. No login. No documents. RupeeKit is not a lender.
        </p>
      </section>
      {quickAnswer ? (
        <QuickAnswerBox
          title={quickAnswer.title}
          question={quickAnswer.question}
          answer={quickAnswer.answer}
          formula={quickAnswer.formula}
          example={quickAnswer.example}
          note={quickAnswer.note}
          links={quickAnswer.links}
        />
      ) : null}

      {answerEngineSummary ? (
        <AnswerEngineSummary id="answer-engine-summary" summary={answerEngineSummary} className="mt-0" />
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-brandDeepNavy">Visual Loan Breakdown</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          A lower EMI is not always cheaper. Compare EMI and total interest together before choosing a loan tenure.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <TenureBarCard
            title="EMI vs Tenure"
            subtitle="Monthly EMI across common tenures"
            rows={tenureComparisonRows}
            valueKey="monthlyEmi"
            barClassName="bg-brandDeepNavy"
          />
          <TenureBarCard
            title="Total Interest vs Tenure"
            subtitle="Total interest paid across common tenures"
            rows={tenureComparisonRows}
            valueKey="totalInterest"
            barClassName="bg-brandGrowthGreen"
          />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PrincipalInterestCard principal={principal} totalInterest={totalInterest} />
          <EmiBurdenProgressCard
            emiToIncomePercent={emiToIncomePercent}
            hasMonthlyIncome={monthlyIncome > 0}
          />
        </div>
        <p className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-slate-700">
          RupeeKit does not show live personal loan interest rates. Enter the official rate offered by your lender and
          verify fees, eligibility, prepayment and foreclosure charges before applying.
        </p>
      </section>

      <section id="advanced-simulator" className="space-y-4">
        <AdvancedSectionCard
          title="True Cost of Loan"
          summary="Estimate total repayment, fee impact, GST impact, add-on costs, and net disbursed amount."
          defaultOpen
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">EMI</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(monthlyEmi)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total interest</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(totalInterest)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total repayment</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(totalRepayment)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Processing fee</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(processingFee)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GST on processing fee</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(gstOnProcessingFee)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Optional add-on cost</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(optionalAddOnCost)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Total cost including fees</p>
              <p className="mt-1 text-lg font-bold text-emerald-900">{formatCurrency(totalCostWithFee)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Amount effectively received</p>
              <p className="mt-1 text-lg font-bold text-emerald-900">{formatCurrency(netDisbursedAmount)}</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            Fees and GST treatment vary by lender and product. Verify latest charges with the lender before borrowing.
          </p>
        </AdvancedSectionCard>

        <AdvancedSectionCard
          title="Why lower EMI is not always cheaper"
          summary="Compare 12 to 60 month options with extra interest vs shortest tenure."
          defaultOpen
        >
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[860px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tenure</th>
                  <th className="px-4 py-3 text-right font-semibold">EMI</th>
                  <th className="px-4 py-3 text-right font-semibold">Total interest</th>
                  <th className="px-4 py-3 text-right font-semibold">Total repayment</th>
                  <th className="px-4 py-3 text-right font-semibold">Extra interest vs 12 months</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenureComparisonRows.map((row) => (
                  <tr key={row.tenure}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.tenure} months</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.monthlyEmi)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.totalInterest)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.totalRepayment)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-700">
                      {formatCurrency(row.extraInterestVsShortest ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            Lower EMI may reduce monthly pressure, but longer tenure can increase total interest.
          </p>
        </AdvancedSectionCard>

        <AdvancedSectionCard
          title="EMI Affordability Score"
          summary="Optional in-browser salary check to compare EMI burden levels."
          defaultOpen
        >
          {monthlyIncome > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${affordabilityStatus.tone}`}>
                <p className="text-sm font-semibold">Affordability status</p>
                <p className="mt-1 text-xl font-bold">{affordabilityStatus.label}</p>
                <p className="mt-1 text-sm">EMI burden: {formatPercent(emiToIncomePercent)}</p>
                <p className="mt-1 text-sm">Total EMI burden (incl. existing EMI): {formatPercent(totalEmiBurdenPercent)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <ul className="space-y-1">
                  <li>Up to 20%: Comfortable</li>
                  <li>20-35%: Caution</li>
                  <li>35-50%: High burden</li>
                  <li>Above 50%: Very high burden</li>
                </ul>
                <p className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  This is a simple affordability indicator, not loan eligibility, loan advice, or approval guidance.
                </p>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Add monthly income to view your EMI affordability score.
            </p>
          )}
        </AdvancedSectionCard>

        <AdvancedSectionCard
          title="Prepayment Simulator"
          summary="Estimate potential interest savings with reduce-tenure or reduce-EMI mode."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Prepayment amount</span>
              <input
                type="number"
                value={prepaymentAmount}
                min={0}
                step={1000}
                onFocus={(event) => event.target.select()}
                onChange={(event) => setPrepaymentAmount(Math.max(0, Number(event.target.value) || 0))}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Prepayment after month</span>
              <input
                type="number"
                value={prepaymentAfterMonth}
                min={1}
                max={Math.max(1, tenureMonths - 1)}
                step={1}
                onFocus={(event) => event.target.select()}
                onChange={(event) =>
                  setPrepaymentAfterMonth(
                    clampNumber(Number(event.target.value) || 1, 1, Math.max(1, tenureMonths - 1))
                  )
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Prepayment choice</span>
              <select
                value={prepaymentMode}
                onChange={(event) => setPrepaymentMode(event.target.value as PrepaymentMode)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
              >
                <option value="reduce-tenure">Reduce tenure</option>
                <option value="reduce-emi">Reduce EMI</option>
              </select>
            </label>
          </div>

          {prepaymentScenario ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Original total interest</p>
                <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(prepaymentScenario.originalTotalInterest)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revised total interest</p>
                <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(prepaymentScenario.revisedTotalInterest)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Estimated interest saved</p>
                <p className="mt-1 text-lg font-bold text-emerald-900">{formatCurrency(prepaymentScenario.interestSaved)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Updated schedule summary</p>
                <p className="mt-1 text-sm text-slate-700">Revised tenure: {prepaymentScenario.revisedTenureMonths} months</p>
                <p className="text-sm text-slate-700">Revised total repayment: {formatCurrency(prepaymentScenario.revisedTotalRepayment)}</p>
              </div>
              {prepaymentScenario.mode === 'reduce-tenure' ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated months reduced</p>
                  <p className="mt-1 text-lg font-bold text-brandDeepNavy">{prepaymentScenario.monthsReduced} months</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revised EMI</p>
                  <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(prepaymentScenario.revisedEmi)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Enter prepayment amount and month to estimate revised interest and schedule impact.
            </p>
          )}

          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            Actual prepayment, foreclosure, and part-payment rules depend on lender policy and loan agreement.
          </p>
        </AdvancedSectionCard>

        <AdvancedSectionCard
          title="EMI Pause / Missed EMI Scenario"
          summary="Run a 1 to 3 month missed EMI scenario with same-EMI or higher-EMI restart."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Pause or missed EMI months</span>
              <select
                value={missedMonths}
                onChange={(event) => setMissedMonths(clampNumber(Number(event.target.value), 1, 3))}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
              >
                <option value={1}>1 month</option>
                <option value={2}>2 months</option>
                <option value={3}>3 months</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Restart option</span>
              <select
                value={pauseRestartMode}
                onChange={(event) => setPauseRestartMode(event.target.value as PauseRestartMode)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
              >
                <option value="same-emi">Same EMI</option>
                <option value="higher-emi">Higher EMI</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unpaid EMI amount</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(pauseScenario.unpaidEmiAmount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Possible repayment delay</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{pauseScenario.possibleRepaymentDelayMonths} months</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Estimated extra interest</p>
              <p className="mt-1 text-lg font-bold text-amber-900">{formatCurrency(pauseScenario.estimatedExtraInterestImpact)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revised EMI after restart</p>
              <p className="mt-1 text-lg font-bold text-brandDeepNavy">{formatCurrency(pauseScenario.revisedEmi)}</p>
            </div>
          </div>

          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            Missed EMI charges, credit-score impact, and restructuring terms depend on lender policy. This is only an
            educational scenario.
          </p>
        </AdvancedSectionCard>

        <AdvancedSectionCard
          title="Hidden Charges Checklist"
          summary="Quick checklist before comparing personal loan offers."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Processing fee',
              'GST on processing fee',
              'Foreclosure charge',
              'Part-payment charge',
              'Late payment penalty',
              'Insurance or optional add-on',
              'Documentation or convenience fee',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-900">
            Use this checklist before comparing personal loan offers.
          </p>
        </AdvancedSectionCard>

        <AdvancedSectionCard
          title="Amortisation Schedule"
          summary="Year-wise summary and 12-month preview shown by default. Expand to view full monthly schedule."
          defaultOpen
        >
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[760px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Year</th>
                  <th className="px-4 py-3 text-right font-semibold">EMI paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Principal paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Interest paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Closing balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyAmortizationRows.map((row) => (
                  <tr key={row.yearLabel}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.yearLabel}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.emiPaid)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.principalPaid)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.interestPaid)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-5 text-base font-bold text-brandDeepNavy">First 12 months preview</h3>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[860px] text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Month number</th>
                  <th className="px-4 py-3 text-right font-semibold">EMI</th>
                  <th className="px-4 py-3 text-right font-semibold">Principal paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Interest paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Remaining balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row) => (
                  <tr key={`preview-${row.month}`}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.month}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.emi + row.extraPayment)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.principalPaid + row.extraPayment)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.interestPaid)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => setShowFullSchedule((current) => !current)}
            className="mt-4 inline-flex items-center rounded-full border border-brandNavy px-4 py-2 text-sm font-bold text-brandNavy transition hover:bg-brandNavy/10"
            aria-expanded={showFullSchedule}
          >
            {showFullSchedule ? 'Hide full schedule' : 'View full monthly schedule'}
          </button>

          {showFullSchedule ? (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[860px] text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Month number</th>
                    <th className="px-4 py-3 text-right font-semibold">EMI</th>
                    <th className="px-4 py-3 text-right font-semibold">Principal paid</th>
                    <th className="px-4 py-3 text-right font-semibold">Interest paid</th>
                    <th className="px-4 py-3 text-right font-semibold">Remaining balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {baseSchedule.rows.map((row) => (
                    <tr key={row.month}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.month}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.emi + row.extraPayment)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.principalPaid + row.extraPayment)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.interestPaid)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </AdvancedSectionCard>
      </section>
            </div>
      </details>
    </div>
  );
}
