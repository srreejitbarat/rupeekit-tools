'use client';

import { useMemo, useState } from 'react';
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

import dynamic from 'next/dynamic';
import {
  CalculatorResultSummary,
  CalculatorInsightBox,
} from './CalculatorVisualizations';

// Performance: lazy-load the heavier visualization components so the calculator
// renders below-the-fold charts/tables only after the interactive core is ready.
const CalculatorResultChart = dynamic(() =>
  import('./CalculatorVisualizations').then((m) => m.CalculatorResultChart),
  { ssr: false }
);
const CalculatorBreakdownTable = dynamic(() =>
  import('./CalculatorVisualizations').then((m) => m.CalculatorBreakdownTable),
  { ssr: false }
);
const CalculatorScenarioComparison = dynamic(() =>
  import('./CalculatorVisualizations').then((m) => m.CalculatorScenarioComparison),
  { ssr: false }
);
import { isAdvancedCalculator } from '@/lib/advanced-calculators';
import AdvancedCalculatorRenderer from '@/components/calculators/advanced/AdvancedCalculatorRenderer';
import DownloadHraChecklistButton from '@/components/hra/DownloadHraChecklistButton';
import DownloadPersonalLoanReportButton from '@/components/personal-loan/DownloadPersonalLoanReportButton';
import PersonalLoanVisualBreakdown from '@/components/personal-loan/PersonalLoanVisualBreakdown';
import PersonalLoanDecisionSimulator from '@/components/personal-loan/PersonalLoanDecisionSimulator';
import EmergencyFundVisualBreakdown from '@/components/emergency-fund/EmergencyFundVisualBreakdown';
import DownloadEmergencyFundPlanButton from '@/components/emergency-fund/DownloadEmergencyFundPlanButton';
import SipPlannerCalculator from '@/components/sip/SipPlannerCalculator';
import CalculatorPresets, { type CalculatorPreset } from '@/components/calculators/CalculatorPresets';
import type { PersonalLoanEmiReportPdfData } from '@/components/personal-loan/PersonalLoanEmiReportPdfDocument';
import type { EmergencyFundPlanPdfData } from '@/components/emergency-fund/EmergencyFundPlanPdfDocument';
import CalculatorAnalyticsBoundary from '@/components/CalculatorAnalyticsBoundary';
import GenericCalculatorExperience from '@/components/GenericCalculatorExperience';
import PlanningExperience, { PLANNING_TOOLS, type PlanningSlug } from '@/components/planning/PlanningExperience';
import { isMicroTool } from '@/lib/micro-tools/common';

export default function Calculator({ tool }: { tool: Tool }) {
  let calculator;

  if (isAdvancedCalculator(tool.slug)) {
    calculator = <AdvancedCalculatorRenderer tool={tool} />;
  } else if (tool.slug === 'personal-loan-emi-calculator-india') {
    calculator = <PersonalLoanDecisionSimulator tool={tool} />;
  } else if (tool.slug === 'sip-calculator-india') {
    calculator = <SipPlannerCalculator tool={tool} />;
  } else {
    calculator = <StandardCalculator tool={tool} />;
  }

  if (tool.slug in PLANNING_TOOLS) {
    return <PlanningExperience slug={tool.slug as PlanningSlug} category={tool.category} quick={calculator} />;
  }

  return (
    <CalculatorAnalyticsBoundary toolSlug={tool.slug} toolCategory={tool.category} shareInputs={!isMicroTool(tool.slug)}>
      {calculator}
    </CalculatorAnalyticsBoundary>
  );
}

function StandardCalculator({ tool }: { tool: Tool }) {
  const initialValues = useMemo(() => {
    return Object.fromEntries(tool.inputs.map((input) => [input.key, input.default]));
  }, [tool.inputs]);


  const [values, setValues] = useState<Record<string, number | ''>>(initialValues);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const inputByKey = useMemo(
    () => new Map(tool.inputs.map((input) => [input.key, input])),
    [tool.inputs]
  );

  const applyPreset = (preset: CalculatorPreset) => {
    setValues((current) => {
      const next = { ...current };
      for (const [key, rawValue] of Object.entries(preset.values)) {
        const inputDef = inputByKey.get(key);
        if (!inputDef || typeof rawValue !== 'number' || !Number.isFinite(rawValue)) continue;
        let value = rawValue;
        if (typeof inputDef.min === 'number') value = Math.max(inputDef.min, value);
        if (typeof inputDef.max === 'number') value = Math.min(inputDef.max, value);
        next[key] = value;
      }
      return next;
    });
    setActivePresetId(preset.id);
  };

  const numericValues = useMemo(() => {
    const next: Record<string, number> = {};
    for (const [k, v] of Object.entries(values)) {
      next[k] = v === '' ? 0 : v;
    }
    return next;
  }, [values]);

  const results = useMemo(() => {
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

  const visibleResults = useMemo(
    () => results.filter((result) => !result.hidden),
    [results]
  );

  const hasChart = useMemo(() => {
    return [
      'sip-calculator-india',
      'fd-calculator-india',
      'emi-calculator-india',
      'salary-in-hand-calculator-india',
      'gst-calculator-india',
      'income-tax-calculator-old-vs-new-regime-india',
      'hra-exemption-calculator-india',
      'gratuity-calculator-india',
      '80c-deduction-calculator-india',
      'home-loan-emi-calculator-india',
      'personal-loan-eligibility-calculator-india',
      'gold-loan-calculator-india',
      'capital-gains-tax-calculator-india',
      'ppf-calculator-india',
      'lumpsum-calculator-india',
      'epf-corpus-calculator-india',
    ].includes(tool.slug);
  }, [tool.slug]);

  const hasComparison = useMemo(() => {
    return [
      'sip-calculator-india',
      'fd-calculator-india',
      'emi-calculator-india',
      'salary-in-hand-calculator-india',
      'gst-calculator-india',
      'income-tax-calculator-old-vs-new-regime-india',
      'hra-exemption-calculator-india',
      'gratuity-calculator-india',
      'home-loan-emi-calculator-india',
      'personal-loan-eligibility-calculator-india',
      'gold-loan-calculator-india',
      'capital-gains-tax-calculator-india',
      'ppf-calculator-india',
      'lumpsum-calculator-india',
      'epf-corpus-calculator-india',
    ].includes(tool.slug);
  }, [tool.slug]);

  const hasBreakdown = useMemo(() => {
    return ['sip-calculator-india', 'fd-calculator-india', 'emi-calculator-india'].includes(tool.slug);
  }, [tool.slug]);

  const showHraRuleUpdate = tool.slug === 'hra-exemption-calculator-india';
  const isPersonalLoanPage = tool.slug === 'personal-loan-emi-calculator-india';
  const isEmergencyFundPage = tool.slug === 'emergency-fund-calculator-india';
  const isEighthPayPage = tool.slug === '8th-pay-commission-salary-calculator-india';
  const resultMap = useMemo(
    () => new Map(results.map((result) => [result.key, result])),
    [results]
  );

  const personalLoanSummary = useMemo(() => {
    if (!isPersonalLoanPage) return null;

    const principal = Math.max(0, numericValues.principal ?? 0);
    const annualRate = Math.max(0, numericValues.annualInterestRate ?? 0);
    const tenureMonths = Math.max(1, Math.round(numericValues.tenureMonths ?? 1));
    const monthlyIncome = Math.max(0, numericValues.monthlyIncome ?? 0);
    const existingMonthlyEmi = Math.max(0, numericValues.existingMonthlyEmi ?? 0);

    const monthlyRate = annualRate / 12 / 100;
    const fallbackEmi =
      monthlyRate > 0
        ? principal * monthlyRate * (1 + monthlyRate) ** tenureMonths / ((1 + monthlyRate) ** tenureMonths - 1)
        : principal / tenureMonths;

    const monthlyEmi = Number.isFinite(resultMap.get('monthlyEmi')?.value)
      ? resultMap.get('monthlyEmi')!.value
      : fallbackEmi;
    const hasMonthlyIncome = monthlyIncome > 0;
    const emiToIncomePercent = hasMonthlyIncome
      ? Number.isFinite(resultMap.get('emiToIncomePercent')?.value)
        ? resultMap.get('emiToIncomePercent')!.value
        : (monthlyEmi / monthlyIncome) * 100
      : 0;
    const totalEmiBurdenPercent = hasMonthlyIncome
      ? Number.isFinite(resultMap.get('totalEmiBurdenPercent')?.value)
        ? resultMap.get('totalEmiBurdenPercent')!.value
        : ((monthlyEmi + existingMonthlyEmi) / monthlyIncome) * 100
      : 0;

    return {
      monthlyEmi,
      monthlyIncome,
      existingMonthlyEmi,
      emiToIncomePercent,
      totalEmiBurdenPercent,
      showHighBurdenNote: totalEmiBurdenPercent >= 50,
    };
  }, [isPersonalLoanPage, numericValues, resultMap]);

  const personalLoanTenureRows = useMemo(() => {
    if (!isPersonalLoanPage) return [];

    const principal = Math.max(0, numericValues.principal ?? 0);
    const annualRate = Math.max(0, numericValues.annualInterestRate ?? 0);
    const monthlyRate = annualRate / 12 / 100;
    const tenures = [12, 24, 36, 48, 60];

    return tenures.map((tenure) => {
      const monthlyEmi =
        monthlyRate > 0
          ? principal * monthlyRate * (1 + monthlyRate) ** tenure / ((1 + monthlyRate) ** tenure - 1)
          : principal / Math.max(tenure, 1);
      const totalRepayment = monthlyEmi * tenure;
      const totalInterest = totalRepayment - principal;

      return {
        tenure,
        monthlyEmi,
        totalInterest,
        totalRepayment,
      };
    });
  }, [isPersonalLoanPage, numericValues.principal, numericValues.annualInterestRate]);

  const personalLoanAmortizationRows = useMemo(() => {
    if (!isPersonalLoanPage) return [];

    const principal = Math.max(0, numericValues.principal ?? 0);
    const annualRate = Math.max(0, numericValues.annualInterestRate ?? 0);
    const tenureMonths = Math.max(1, Math.round(numericValues.tenureMonths ?? 1));
    const monthlyRate = annualRate / 12 / 100;
    const monthlyEmi =
      monthlyRate > 0
        ? principal * monthlyRate * (1 + monthlyRate) ** tenureMonths / ((1 + monthlyRate) ** tenureMonths - 1)
        : principal / tenureMonths;

    let balance = principal;
    const rows: Array<{
      yearLabel: string;
      emiPaid: number;
      principalPaid: number;
      interestPaid: number;
      closingBalance: number;
    }> = [];
    const yearCount = Math.ceil(tenureMonths / 12);

    for (let year = 1; year <= yearCount; year += 1) {
      let emiPaid = 0;
      let principalPaid = 0;
      let interestPaid = 0;
      const startMonth = (year - 1) * 12;
      const endMonth = Math.min(year * 12, tenureMonths);

      for (let month = startMonth; month < endMonth; month += 1) {
        const interestComponent = monthlyRate > 0 ? balance * monthlyRate : 0;
        let principalComponent = monthlyEmi - interestComponent;
        if (principalComponent > balance) principalComponent = balance;
        const payment = principalComponent + interestComponent;

        balance = Math.max(0, balance - principalComponent);
        emiPaid += payment;
        principalPaid += principalComponent;
        interestPaid += interestComponent;
      }

      rows.push({
        yearLabel: `Year ${year}`,
        emiPaid,
        principalPaid,
        interestPaid,
        closingBalance: balance,
      });
    }

    return rows;
  }, [isPersonalLoanPage, numericValues.principal, numericValues.annualInterestRate, numericValues.tenureMonths]);

  const personalLoanReportData = useMemo<PersonalLoanEmiReportPdfData | null>(() => {
    if (!isPersonalLoanPage || !personalLoanSummary) return null;

    const principal = Math.max(0, numericValues.principal ?? 0);
    const annualInterestRate = Math.max(0, numericValues.annualInterestRate ?? 0);
    const tenureMonths = Math.max(1, Math.round(numericValues.tenureMonths ?? 1));
    const processingFeePercent = Math.max(0, numericValues.processingFeePercent ?? 0);
    const monthlyIncome = Math.max(0, numericValues.monthlyIncome ?? 0);
    const existingMonthlyEmi = Math.max(0, numericValues.existingMonthlyEmi ?? 0);

    const monthlyEmi = personalLoanSummary.monthlyEmi;
    const totalRepayment = Number.isFinite(resultMap.get('totalPayment')?.value)
      ? resultMap.get('totalPayment')!.value
      : monthlyEmi * tenureMonths;
    const totalInterest = Number.isFinite(resultMap.get('totalInterest')?.value)
      ? resultMap.get('totalInterest')!.value
      : Math.max(0, totalRepayment - principal);
    const estimatedProcessingFee = Number.isFinite(resultMap.get('processingFee')?.value)
      ? resultMap.get('processingFee')!.value
      : principal * processingFeePercent / 100;
    const totalCostWithFee = Number.isFinite(resultMap.get('totalCostWithFee')?.value)
      ? resultMap.get('totalCostWithFee')!.value
      : totalRepayment + estimatedProcessingFee;

    return {
      generatedAt: '',
      principal,
      annualInterestRate,
      tenureMonths,
      processingFeePercent,
      monthlyIncome,
      existingMonthlyEmi,
      monthlyEmi,
      totalInterest,
      totalRepayment,
      estimatedProcessingFee,
      totalCostWithFee,
      emiToIncomePercent: personalLoanSummary.emiToIncomePercent,
      totalEmiBurdenPercent: personalLoanSummary.totalEmiBurdenPercent,
      tenureComparison: personalLoanTenureRows,
      amortization: personalLoanAmortizationRows,
    };
  }, [
    isPersonalLoanPage,
    personalLoanSummary,
    numericValues,
    resultMap,
    personalLoanTenureRows,
    personalLoanAmortizationRows,
  ]);

  const emergencyFundSummary = useMemo(() => {
    if (!isEmergencyFundPage) return null;

    const monthlyEssentialExpenses = Math.max(0, numericValues.monthlyEssentialExpenses ?? 0);
    const monthlyEmiCommitments = Math.max(0, numericValues.monthlyEmiCommitments ?? 0);
    const currentEmergencySavings = Math.max(0, numericValues.currentEmergencySavings ?? 0);
    const targetMonths = Math.max(1, Math.round(numericValues.targetMonths ?? 6));

    const monthlySurvivalCost = Number.isFinite(resultMap.get('monthlySurvivalCost')?.value)
      ? resultMap.get('monthlySurvivalCost')!.value
      : monthlyEssentialExpenses + monthlyEmiCommitments;
    const targetEmergencyFund = Number.isFinite(resultMap.get('targetEmergencyFund')?.value)
      ? resultMap.get('targetEmergencyFund')!.value
      : (monthlyEssentialExpenses + monthlyEmiCommitments) * targetMonths;
    const currentShortfall = Number.isFinite(resultMap.get('currentShortfall')?.value)
      ? resultMap.get('currentShortfall')!.value
      : Math.max(targetEmergencyFund - currentEmergencySavings, 0);
    const monthsToReachTarget = Number.isFinite(resultMap.get('monthsToReachTarget')?.value)
      ? resultMap.get('monthsToReachTarget')!.value
      : 0;
    const threeMonthFund = Number.isFinite(resultMap.get('threeMonthFund')?.value)
      ? resultMap.get('threeMonthFund')!.value
      : (monthlyEssentialExpenses + monthlyEmiCommitments) * 3;
    const sixMonthFund = Number.isFinite(resultMap.get('sixMonthFund')?.value)
      ? resultMap.get('sixMonthFund')!.value
      : (monthlyEssentialExpenses + monthlyEmiCommitments) * 6;
    const nineMonthFund = Number.isFinite(resultMap.get('nineMonthFund')?.value)
      ? resultMap.get('nineMonthFund')!.value
      : (monthlyEssentialExpenses + monthlyEmiCommitments) * 9;
    const twelveMonthFund = Number.isFinite(resultMap.get('twelveMonthFund')?.value)
      ? resultMap.get('twelveMonthFund')!.value
      : (monthlyEssentialExpenses + monthlyEmiCommitments) * 12;
    const targetWithBuffer = Number.isFinite(resultMap.get('targetWithBuffer')?.value)
      ? resultMap.get('targetWithBuffer')!.value
      : undefined;

    return {
      monthlyEssentialExpenses,
      monthlyEmiCommitments,
      monthlySavingCapacity: Math.max(0, numericValues.monthlySavingCapacity ?? 0),
      monthlySurvivalCost,
      targetEmergencyFund,
      currentEmergencySavings,
      currentShortfall,
      monthsToReachTarget,
      targetMonths,
      milestones: [
        { months: 3, amount: threeMonthFund },
        { months: 6, amount: sixMonthFund },
        { months: 9, amount: nineMonthFund },
        { months: 12, amount: twelveMonthFund },
      ],
      targetWithBuffer,
    };
  }, [isEmergencyFundPage, numericValues, resultMap]);

  const emergencyFundReportData = useMemo<EmergencyFundPlanPdfData | null>(() => {
    if (!isEmergencyFundPage || !emergencyFundSummary) return null;

    const threeMonthFund = emergencyFundSummary.milestones.find((item) => item.months === 3)?.amount ?? 0;
    const sixMonthFund = emergencyFundSummary.milestones.find((item) => item.months === 6)?.amount ?? 0;
    const nineMonthFund = emergencyFundSummary.milestones.find((item) => item.months === 9)?.amount ?? 0;
    const twelveMonthFund = emergencyFundSummary.milestones.find((item) => item.months === 12)?.amount ?? 0;

    return {
      generatedAt: '',
      monthlyEssentialExpenses: emergencyFundSummary.monthlyEssentialExpenses,
      monthlyEmiCommitments: emergencyFundSummary.monthlyEmiCommitments,
      monthlySurvivalCost: emergencyFundSummary.monthlySurvivalCost,
      currentEmergencySavings: emergencyFundSummary.currentEmergencySavings,
      targetMonths: emergencyFundSummary.targetMonths,
      targetEmergencyFund: emergencyFundSummary.targetEmergencyFund,
      currentShortfall: emergencyFundSummary.currentShortfall,
      monthlySavingCapacity: emergencyFundSummary.monthlySavingCapacity,
      monthsToReachTarget: emergencyFundSummary.monthsToReachTarget,
      threeMonthFund,
      sixMonthFund,
      nineMonthFund,
      twelveMonthFund,
    };
  }, [isEmergencyFundPage, emergencyFundSummary]);

  const hraEstimateSummary = useMemo(() => {
    if (!showHraRuleUpdate) return null;

    const salaryForHra =
      (numericValues.basicSalary ?? 0) +
      (numericValues.dearnessAllowance ?? 0) +
      (numericValues.commission ?? 0);
    const cityRatePercent = numericValues.cityRatePercent ?? 40;
    const salaryCapUsed = cityRatePercent >= 50 ? 50 : 40;
    const actualHraReceived = numericValues.hraReceived ?? 0;
    const rentMinusTenPercent = Math.max(0, (numericValues.rentPaid ?? 0) - salaryForHra * 0.1);
    const salaryCapAmount = salaryForHra * salaryCapUsed / 100;

    const resultExemption = results.find((item) => item.key === 'monthlyHraExemption')?.value;
    const estimatedExemptHra = typeof resultExemption === 'number' && Number.isFinite(resultExemption)
      ? resultExemption
      : Math.max(
          0,
          Math.min(actualHraReceived, salaryForHra * cityRatePercent / 100, rentMinusTenPercent)
        );
    const resultTaxable = results.find((item) => item.key === 'taxableHraMonthly')?.value;
    const taxableHra = typeof resultTaxable === 'number' && Number.isFinite(resultTaxable)
      ? resultTaxable
      : Math.max(0, actualHraReceived - estimatedExemptHra);

    return {
      salaryForHra,
      cityRatePercent,
      actualHraReceived,
      salaryCapUsed,
      salaryCapAmount,
      rentMinusTenPercent,
      estimatedExemptHra,
      taxableHra,
    };
  }, [showHraRuleUpdate, numericValues, results]);

  return (
    <div className="space-y-8">
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
              <label key={input.key} className="block" htmlFor={`calculator-input-${input.key}`}>
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                  {input.label}
                  {input.unit ? <span className="font-medium text-slate-500">{input.unit}</span> : null}
                </span>
                <input
                  id={`calculator-input-${input.key}`}
                  type="number"
                  inputMode="decimal"
                  aria-describedby={input.help ? `calculator-help-${input.key}` : undefined}
                  value={values[input.key] ?? ''}
                  min={input.min}
                  max={input.max}
                  step={input.step ?? 1}
                  onFocus={(e) => e.target.select()}
                  onChange={(event) => {
                    const val = event.target.value;
                    setActivePresetId(null);
                    setValues((current) => ({
                      ...current,
                      [input.key]: val === '' ? '' : (Number.isFinite(Number(val)) ? Number(val) : 0),
                    }));
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
                />
                {input.help ? <span id={`calculator-help-${input.key}`} className="mt-2 block text-xs leading-5 text-slate-500">{input.help}</span> : null}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-brandDeepNavy">Estimated results</h2>
            <div className="mt-6">
              <CalculatorResultSummary results={visibleResults} />
            </div>

            {hraEstimateSummary ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-emerald-900">Based on your inputs:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Actual HRA received: {formatValue(hraEstimateSummary.actualHraReceived, 'currency')}</li>
                  <li>Salary cap used: {hraEstimateSummary.salaryCapUsed}%</li>
                  <li>
                    Rent minus 10% of salary: {formatValue(hraEstimateSummary.rentMinusTenPercent, 'currency')}
                  </li>
                  <li>
                    Estimated exempt HRA: {formatValue(hraEstimateSummary.estimatedExemptHra, 'currency')}
                  </li>
                </ul>
              </div>
            ) : null}

            {showHraRuleUpdate ? (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                  Important FY 2026-27 update
                </p>
                <p className="mt-2">
                  Important FY 2026-27 update: Under Rule 279 of the Income-tax Rules, 2026, Mumbai, Kolkata, Delhi,
                  Chennai, Hyderabad, Pune, Ahmedabad and Bengaluru follow the 50% salary cap for HRA exemption. All
                  other cities use the 40% cap. Where the applicable employer declaration or prescribed form asks for
                  landlord details, keep the landlord name, address, PAN/Aadhaar where applicable, rent paid and
                  relationship with the landlord ready.
                </p>
                <DownloadHraChecklistButton
                  className="mt-4"
                  data={
                    hraEstimateSummary
                      ? {
                          basicSalary: numericValues.basicSalary,
                          dearnessAllowance: numericValues.dearnessAllowance,
                          commission: numericValues.commission,
                          hraReceived: numericValues.hraReceived,
                          rentPaid: numericValues.rentPaid,
                          cityRatePercent: hraEstimateSummary.cityRatePercent,
                          actualHra: hraEstimateSummary.actualHraReceived,
                          rentMinusTenPercent: hraEstimateSummary.rentMinusTenPercent,
                          salaryCapAmount: hraEstimateSummary.salaryCapAmount,
                          estimatedExemptHra: hraEstimateSummary.estimatedExemptHra,
                          taxableHra: hraEstimateSummary.taxableHra,
                        }
                      : undefined
                  }
                />
              </div>
            ) : null}

            {personalLoanSummary ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-emerald-900">Based on your inputs:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Estimated monthly EMI: {formatValue(personalLoanSummary.monthlyEmi, 'currency')}</li>
                  {personalLoanSummary.monthlyIncome > 0 ? (
                    <>
                      <li>Monthly income used: {formatValue(personalLoanSummary.monthlyIncome, 'currency')}</li>
                      <li>Existing monthly EMI: {formatValue(personalLoanSummary.existingMonthlyEmi, 'currency')}</li>
                      <li>EMI as % of income: {formatValue(personalLoanSummary.emiToIncomePercent, 'percent')}</li>
                      <li>Total EMI burden: {formatValue(personalLoanSummary.totalEmiBurdenPercent, 'percent')}</li>
                    </>
                  ) : (
                    <li>Add monthly income to calculate EMI affordability and total EMI burden.</li>
                  )}
                </ul>
              </div>
            ) : null}

            {emergencyFundSummary ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-800">
                <p>
                  Based on your expenses and EMIs, your target emergency fund is{' '}
                  <span className="font-semibold">
                    {formatValue(emergencyFundSummary.targetEmergencyFund, 'currency')}
                  </span>{' '}
                  for{' '}
                  <span className="font-semibold">{emergencyFundSummary.targetMonths} months</span>. You already have{' '}
                  <span className="font-semibold">
                    {formatValue(emergencyFundSummary.currentEmergencySavings, 'currency')}
                  </span>{' '}
                  saved, so your current shortfall is{' '}
                  <span className="font-semibold">
                    {formatValue(emergencyFundSummary.currentShortfall, 'currency')}
                  </span>
                  . At your current monthly saving capacity, it may take around{' '}
                  <span className="font-semibold">
                    {formatValue(emergencyFundSummary.monthsToReachTarget, 'number')} months
                  </span>{' '}
                  to reach the target.
                </p>
              </div>
            ) : null}

            {personalLoanSummary?.showHighBurdenNote ? (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                Your EMI burden may feel high compared with your monthly income. Consider comparing tenure, loan amount
                and lender terms before applying.
              </p>
            ) : null}

            {isPersonalLoanPage ? (
              <DownloadPersonalLoanReportButton
                className="mt-4"
                data={personalLoanReportData ?? undefined}
              />
            ) : null}

            {isEmergencyFundPage ? (
              <DownloadEmergencyFundPlanButton
                className="mt-4"
                data={emergencyFundReportData ?? undefined}
              />
            ) : null}
          </div>
          <div className="mt-6">
            <p className="rounded-2xl bg-white/70 p-4 text-sm leading-6 text-brandMuted border border-brandBorder">
              {showHraRuleUpdate
                ? 'This result is an estimate for educational use. RupeeKit does not provide tax, legal or filing advice. Your final exemption may depend on salary structure, employer policy, proof submission and applicable tax rules.'
                : isEmergencyFundPage
                  ? 'Educational estimate only. RupeeKit does not provide financial, investment, legal or tax advice. The result is for planning support only.'
                : 'This calculator gives an educational estimate. Verify final numbers with your payslip, lender, tax advisor or official source.'}
            </p>
          </div>
        </div>
      </section>

      {isPersonalLoanPage && personalLoanSummary ? (
        <PersonalLoanVisualBreakdown
          principal={Math.max(0, numericValues.principal ?? 0)}
          totalInterestForSelectedTenure={personalLoanReportData?.totalInterest ?? 0}
          emiToIncomePercent={personalLoanSummary.emiToIncomePercent}
          tenureRows={personalLoanTenureRows}
          reportData={personalLoanReportData ?? undefined}
        />
      ) : null}

      {isEmergencyFundPage && emergencyFundSummary ? (
        <EmergencyFundVisualBreakdown
          monthlySurvivalCost={emergencyFundSummary.monthlySurvivalCost}
          targetEmergencyFund={emergencyFundSummary.targetEmergencyFund}
          currentEmergencySavings={emergencyFundSummary.currentEmergencySavings}
          currentShortfall={emergencyFundSummary.currentShortfall}
          monthsToReachTarget={emergencyFundSummary.monthsToReachTarget}
          targetMonths={emergencyFundSummary.targetMonths}
          milestones={emergencyFundSummary.milestones}
          targetWithBuffer={emergencyFundSummary.targetWithBuffer}
          reportData={emergencyFundReportData ?? undefined}
        />
      ) : null}

      {isEighthPayPage ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brandDeepNavy">Fitment-Factor Scenarios Side by Side</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Revised basic pay for your current basic of {formatValue(Math.max(0, numericValues.currentBasic ?? 0), 'currency')}{' '}
            under each user-selectable scenario. These are planning scenarios, not official recommendations.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[560px] text-left text-xs text-slate-700 md:text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fitment-factor scenario</th>
                  <th className="px-4 py-3 text-right">Revised basic pay (estimate)</th>
                  <th className="px-4 py-3 text-right">Increase over current basic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1.92, 2.08, 2.57, 2.86, 3.0].map((factor) => {
                  const currentBasic = Math.max(0, numericValues.currentBasic ?? 0);
                  const revised = currentBasic * factor;
                  return (
                    <tr key={factor}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{factor.toFixed(2)}× scenario</td>
                      <td className="px-4 py-3 text-right">{formatValue(revised, 'currency')}</td>
                      <td className="px-4 py-3 text-right">{formatValue(revised - currentBasic, 'currency')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            The 8th Central Pay Commission has not notified a final fitment factor. These values are user-selectable
            planning scenarios, not official salary recommendations.
          </p>
        </section>
      ) : null}

      {isPersonalLoanPage ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brandDeepNavy">Tenure Comparison</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Compare how EMI and total interest may change across common tenure options.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[680px] text-left text-xs text-slate-700 md:text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tenure</th>
                  <th className="px-4 py-3 text-right">Monthly EMI</th>
                  <th className="px-4 py-3 text-right">Total interest</th>
                  <th className="px-4 py-3 text-right">Total repayment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {personalLoanTenureRows.map((row) => (
                  <tr key={row.tenure}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.tenure} months</td>
                    <td className="px-4 py-3 text-right">{formatValue(row.monthlyEmi, 'currency')}</td>
                    <td className="px-4 py-3 text-right">{formatValue(row.totalInterest, 'currency')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brandDeepNavy">
                      {formatValue(row.totalRepayment, 'currency')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasChart && (
        <GenericCalculatorExperience tool={tool} values={numericValues} results={results} />
      )}

      {/* Visualizations (Chart & What-If Comparison) */}
      {(hasChart || hasComparison) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {hasChart && <CalculatorResultChart tool={tool} values={numericValues} results={results} />}
          {hasComparison && <CalculatorScenarioComparison tool={tool} values={numericValues} />}
        </div>
      )}

      {isPersonalLoanPage && personalLoanAmortizationRows.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brandDeepNavy">Yearly Amortization Summary</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This table shows yearly EMI paid, principal paid, interest paid and closing balance.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[760px] text-left text-xs text-slate-700 md:text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3 text-right">EMI paid</th>
                  <th className="px-4 py-3 text-right">Principal paid</th>
                  <th className="px-4 py-3 text-right">Interest paid</th>
                  <th className="px-4 py-3 text-right">Closing balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {personalLoanAmortizationRows.map((row) => (
                  <tr key={row.yearLabel}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.yearLabel}</td>
                    <td className="px-4 py-3 text-right">{formatValue(row.emiPaid, 'currency')}</td>
                    <td className="px-4 py-3 text-right">{formatValue(row.principalPaid, 'currency')}</td>
                    <td className="px-4 py-3 text-right">{formatValue(row.interestPaid, 'currency')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brandDeepNavy">
                      {formatValue(row.closingBalance, 'currency')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Amortization/Compounding Schedule */}
      {hasBreakdown && <CalculatorBreakdownTable tool={tool} values={numericValues} />}

      {/* Dynamic Insight disclaimer box */}
      <CalculatorInsightBox />
    </div>
  );
}
