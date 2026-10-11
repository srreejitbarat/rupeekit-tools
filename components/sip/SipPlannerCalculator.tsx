'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Tool } from '@/lib/tools';
import { CalculatorResultSummary } from '@/components/CalculatorVisualizations';
import DownloadSipPlanButton from '@/components/sip/DownloadSipPlanButton';
import type { SipPlanPdfData } from '@/components/sip/SipPlanPdfDocument';
import { trackToolEvent } from '@/lib/events';
import { getSipReturnPresetKey, isSipReturnPreset } from '@/lib/sip/presets';
import CalculatorPresets, { type CalculatorPreset } from '@/components/calculators/CalculatorPresets';

type SipMode = 'regular' | 'step-up' | 'goal' | 'compare';
type CatchUpPreference = 'none' | 'equal';
type PauseRestartMode = 'same' | 'higher';
type SalaryIncreaseMode = 'hike-share' | 'fixed';
type ExplanationMode = 'simple' | 'detailed' | 'hinglish';

type ProjectionRecord = {
  month: number;
  invested: number;
  value: number;
  gains: number;
  monthlyContribution: number;
};

type ProjectionSummary = {
  totalInvested: number;
  futureValue: number;
  estimatedGains: number;
  finalMonthlySip: number;
  records: ProjectionRecord[];
};

type MilestoneRow = {
  label: string;
  invested: number;
  value: number;
  gains: number;
};

type BreakpointRow = {
  target: number;
  month: number;
  label: string;
  invested: number;
  value: number;
  gains: number;
};

type SummaryCard = {
  key: string;
  label: string;
  value: number;
  formatted: string;
};

type PlanQualityBadge = {
  label:
    | 'Balanced SIP Plan'
    | 'Inflation-Aware Plan'
    | 'Needs Higher SIP'
    | 'Aggressive Return Assumption'
    | 'Consistency Risk'
    | 'Goal Gap Alert';
  reason: string;
};

type AssumptionWarning = {
  id: string;
  message: string;
};

const BREAKPOINT_TARGETS = [100000, 500000, 1000000, 2500000, 5000000, 10000000];

function parsePositiveIntegerParam(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

const SIP_MODE_OPTIONS: Array<{ key: SipMode; label: string }> = [
  { key: 'regular', label: 'Regular SIP' },
  { key: 'step-up', label: 'Step-Up SIP' },
  { key: 'goal', label: 'Goal SIP' },
  { key: 'compare', label: 'Compare Regular vs Step-Up' },
];

const SIP_PRESETS: CalculatorPreset[] = [
  {
    id: 'sip-5k-10y',
    label: 'Rs 5,000 monthly for 10 years',
    description: 'Regular SIP of Rs 5,000 per month for 10 years using your expected-return assumption.',
    values: { mode: 'regular', monthlySip: 5000, durationYears: 10 },
  },
  {
    id: 'sip-10k-15y',
    label: 'Rs 10,000 monthly for 15 years',
    description: 'Regular SIP of Rs 10,000 per month for 15 years using your expected-return assumption.',
    values: { mode: 'regular', monthlySip: 10000, durationYears: 15 },
  },
  {
    id: 'sip-1-crore-goal',
    label: 'Rs 1 crore goal',
    description: 'Switches to Goal SIP mode with a Rs 1 crore target over 15 years to estimate the required monthly SIP.',
    values: { mode: 'goal', targetCorpus: 10000000, goalYears: 15 },
  },
  {
    id: 'sip-regular-vs-step-up',
    label: 'Regular vs step-up SIP',
    description: 'Switches to comparison mode with a 10% yearly step-up against a flat SIP of the same starting amount.',
    values: { mode: 'compare', stepUpRate: 10 },
  },
  {
    id: 'sip-start-1-year-late',
    label: 'Start one year late',
    description: 'Keeps your inputs and highlights the "delay SIP by 1 year" estimate shown below the results.',
    values: { mode: 'regular' },
  },
  {
    id: 'sip-pause-6-months',
    label: 'Pause SIP for 6 months',
    description: 'Sets the pause-and-restart scenario to a 6-month pause so you can compare continuity versus pausing.',
    values: { mode: 'regular', pauseDurationMonths: 6 },
  },
];

const SIP_REVIEW_CHECKLIST = [
  'Are you assuming returns as estimates, not guarantees?',
  'Did you include inflation?',
  'Do you have an emergency fund before aggressive investing?',
  'Are you reviewing SIP yearly?',
  'Did your income or goal change?',
  'Are you aware tax, expense ratio, and exit load may affect actual outcomes?',
];

function clampNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function toMonths(years: number) {
  return Math.max(0, Math.round(clampNonNegative(years) * 12));
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return 'Check inputs';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
}

function simulateSipProjection({
  initialMonthlySip,
  annualReturnPercent,
  years,
  annualStepUpPercent = 0,
  currentSavings = 0,
}: {
  initialMonthlySip: number;
  annualReturnPercent: number;
  years: number;
  annualStepUpPercent?: number;
  currentSavings?: number;
}): ProjectionSummary {
  const safeMonthlySip = clampNonNegative(initialMonthlySip);
  const safeAnnualReturn = clampNonNegative(annualReturnPercent);
  const safeStepUp = clampNonNegative(annualStepUpPercent) / 100;
  const safeCurrentSavings = clampNonNegative(currentSavings);
  const monthlyRate = safeAnnualReturn / 1200;
  const months = toMonths(years);

  let value = safeCurrentSavings;
  let invested = safeCurrentSavings;
  let finalMonthlySip = safeMonthlySip;
  const records: ProjectionRecord[] = [];

  for (let month = 1; month <= months; month += 1) {
    const yearIndex = Math.floor((month - 1) / 12);
    const monthlyContribution = safeMonthlySip * Math.pow(1 + safeStepUp, yearIndex);
    finalMonthlySip = monthlyContribution;
    value += monthlyContribution;
    invested += monthlyContribution;
    if (monthlyRate !== 0) {
      value *= 1 + monthlyRate;
    }
    records.push({
      month,
      invested,
      value,
      gains: value - invested,
      monthlyContribution,
    });
  }

  if (months === 0) {
    finalMonthlySip = safeMonthlySip;
  }

  return {
    totalInvested: invested,
    futureValue: value,
    estimatedGains: value - invested,
    finalMonthlySip,
    records,
  };
}

function calculateRegularSipFromFormula({
  monthlySip,
  annualReturnPercent,
  years,
  currentSavings = 0,
}: {
  monthlySip: number;
  annualReturnPercent: number;
  years: number;
  currentSavings?: number;
}) {
  const safeMonthly = clampNonNegative(monthlySip);
  const safeReturn = clampNonNegative(annualReturnPercent);
  const safeYears = clampNonNegative(years);
  const safeSavings = clampNonNegative(currentSavings);
  const monthlyRate = safeReturn / 1200;
  const periods = safeYears * 12;

  const sipFutureValue =
    monthlyRate === 0
      ? safeMonthly * periods
      : safeMonthly * (((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate) * (1 + monthlyRate));
  const savingsFutureValue = safeSavings * Math.pow(1 + monthlyRate, periods);
  const totalInvested = safeSavings + safeMonthly * periods;
  const futureValue = sipFutureValue + savingsFutureValue;

  return {
    totalInvested,
    futureValue,
    estimatedGains: futureValue - totalInvested,
  };
}

function simulateProjectionWithContribution({
  annualReturnPercent,
  years,
  currentSavings = 0,
  contributionForMonth,
}: {
  annualReturnPercent: number;
  years: number;
  currentSavings?: number;
  contributionForMonth: (month: number) => number;
}): ProjectionSummary {
  const safeAnnualReturn = clampNonNegative(annualReturnPercent);
  const safeCurrentSavings = clampNonNegative(currentSavings);
  const months = toMonths(years);
  const monthlyRate = safeAnnualReturn / 1200;
  let value = safeCurrentSavings;
  let invested = safeCurrentSavings;
  let finalMonthlySip = 0;
  const records: ProjectionRecord[] = [];

  for (let month = 1; month <= months; month += 1) {
    const contribution = clampNonNegative(contributionForMonth(month));
    finalMonthlySip = contribution;
    value += contribution;
    invested += contribution;
    if (monthlyRate !== 0) {
      value *= 1 + monthlyRate;
    }
    records.push({
      month,
      invested,
      value,
      gains: value - invested,
      monthlyContribution: contribution,
    });
  }

  return {
    totalInvested: invested,
    futureValue: value,
    estimatedGains: value - invested,
    finalMonthlySip,
    records,
  };
}

function simulateConsistencyProjection({
  monthlySip,
  annualReturnPercent,
  years,
  annualStepUpPercent,
  currentSavings = 0,
  missedSipsPerYear,
  catchUpPreference,
}: {
  monthlySip: number;
  annualReturnPercent: number;
  years: number;
  annualStepUpPercent: number;
  currentSavings?: number;
  missedSipsPerYear: number;
  catchUpPreference: CatchUpPreference;
}) {
  const safeMonthlySip = clampNonNegative(monthlySip);
  const safeMissedPerYear = Math.min(4, Math.max(0, Math.round(missedSipsPerYear)));
  const safeStepUpFactor = Math.max(0, annualStepUpPercent) / 100;
  const months = toMonths(years);
  const monthlyCatchUpExtra = new Map<number, number>();
  let totalCatchUpContributed = 0;

  const projection = simulateProjectionWithContribution({
    annualReturnPercent,
    years,
    currentSavings,
    contributionForMonth: (month) => {
      const yearIndex = Math.floor((month - 1) / 12);
      const monthInYear = ((month - 1) % 12) + 1;
      const baseContribution = safeMonthlySip * Math.pow(1 + safeStepUpFactor, yearIndex);
      const isMissedMonth = monthInYear <= safeMissedPerYear;
      const carryOver = monthlyCatchUpExtra.get(month) ?? 0;

      if (isMissedMonth) {
        if (catchUpPreference === 'equal') {
          const extraPerMonth = baseContribution / 12;
          for (let addMonth = month + 1; addMonth <= Math.min(month + 12, months); addMonth += 1) {
            monthlyCatchUpExtra.set(addMonth, (monthlyCatchUpExtra.get(addMonth) ?? 0) + extraPerMonth);
          }
        }
        return 0;
      }

      const totalContribution = baseContribution + carryOver;
      if (carryOver > 0) {
        totalCatchUpContributed += carryOver;
      }
      return totalContribution;
    },
  });

  const catchUpMonthlyAmount =
    catchUpPreference === 'equal' && months > 0 ? totalCatchUpContributed / months : 0;

  return {
    projection,
    catchUpMonthlyAmount,
  };
}

function simulatePauseRestartProjection({
  annualReturnPercent,
  years,
  pauseMonths,
  restartMonthlySip,
}: {
  annualReturnPercent: number;
  years: number;
  pauseMonths: number;
  restartMonthlySip: number;
}) {
  const safePauseMonths = Math.max(0, Math.round(pauseMonths));
  const safeRestartSip = clampNonNegative(restartMonthlySip);
  return simulateProjectionWithContribution({
    annualReturnPercent,
    years,
    contributionForMonth: (month) => (month <= safePauseMonths ? 0 : safeRestartSip),
  });
}

function solveRestartSipToRecoverPauseGap({
  baseTargetValue,
  annualReturnPercent,
  years,
  pauseMonths,
  minRestartSip,
}: {
  baseTargetValue: number;
  annualReturnPercent: number;
  years: number;
  pauseMonths: number;
  minRestartSip: number;
}) {
  const totalMonths = toMonths(years);
  const safePauseMonths = Math.max(0, Math.round(pauseMonths));
  if (totalMonths <= safePauseMonths) return minRestartSip;

  let low = Math.max(0, minRestartSip);
  let high = Math.max(low + 500, low * 1.25);

  for (let i = 0; i < 40; i += 1) {
    const trial = simulatePauseRestartProjection({
      annualReturnPercent,
      years,
      pauseMonths: safePauseMonths,
      restartMonthlySip: high,
    }).futureValue;
    if (trial >= baseTargetValue) break;
    high *= 1.5;
  }

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const trial = simulatePauseRestartProjection({
      annualReturnPercent,
      years,
      pauseMonths: safePauseMonths,
      restartMonthlySip: mid,
    }).futureValue;
    if (trial >= baseTargetValue) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return high;
}

function solveRequiredMonthlySipWithYearlyTopUp({
  targetCorpus,
  currentSavings,
  annualReturnPercent,
  years,
  yearlyTopUpAmount,
}: {
  targetCorpus: number;
  currentSavings: number;
  annualReturnPercent: number;
  years: number;
  yearlyTopUpAmount: number;
}) {
  const safeTarget = clampNonNegative(targetCorpus);
  const safeSavings = clampNonNegative(currentSavings);
  const safeYears = clampNonNegative(years);
  const safeTopUp = clampNonNegative(yearlyTopUpAmount);
  if (safeYears <= 0) return 0;

  const baseline = simulateProjectionWithContribution({
    annualReturnPercent,
    years: safeYears,
    currentSavings: safeSavings,
    contributionForMonth: (month) => (((month - 1) % 12) + 1 === 12 ? safeTopUp : 0),
  }).futureValue;
  if (baseline >= safeTarget) return 0;

  let low = 0;
  let high = Math.max(1000, safeTarget / Math.max(1, safeYears * 12));

  for (let i = 0; i < 40; i += 1) {
    const trial = simulateProjectionWithContribution({
      annualReturnPercent,
      years: safeYears,
      currentSavings: safeSavings,
      contributionForMonth: (month) => {
        const monthInYear = ((month - 1) % 12) + 1;
        return monthInYear === 12 ? high + safeTopUp : high;
      },
    }).futureValue;
    if (trial >= safeTarget) break;
    high *= 2;
  }

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const trial = simulateProjectionWithContribution({
      annualReturnPercent,
      years: safeYears,
      currentSavings: safeSavings,
      contributionForMonth: (month) => {
        const monthInYear = ((month - 1) % 12) + 1;
        return monthInYear === 12 ? mid + safeTopUp : mid;
      },
    }).futureValue;
    if (trial >= safeTarget) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return high;
}

function simulateSalaryHikeSip({
  currentMonthlySip,
  annualReturnPercent,
  years,
  increaseMode,
  expectedIncomeHikePercent,
  hikeShareForSipPercent,
  fixedYearlySipIncrease,
}: {
  currentMonthlySip: number;
  annualReturnPercent: number;
  years: number;
  increaseMode: SalaryIncreaseMode;
  expectedIncomeHikePercent: number;
  hikeShareForSipPercent: number;
  fixedYearlySipIncrease: number;
}) {
  const safeCurrentSip = clampNonNegative(currentMonthlySip);
  const safeHikePercent = clampNonNegative(expectedIncomeHikePercent);
  const safeSharePercent = clampNonNegative(hikeShareForSipPercent);
  const safeFixedIncrease = clampNonNegative(fixedYearlySipIncrease);
  const annualSipIncreasePercent = (safeHikePercent * safeSharePercent) / 100;

  const projection = simulateProjectionWithContribution({
    annualReturnPercent,
    years,
    contributionForMonth: (month) => {
      const yearIndex = Math.floor((month - 1) / 12);
      if (increaseMode === 'fixed') {
        return safeCurrentSip + yearIndex * safeFixedIncrease;
      }
      return safeCurrentSip * Math.pow(1 + annualSipIncreasePercent / 100, yearIndex);
    },
  });

  return {
    projection,
    finalYearSipAmount: projection.finalMonthlySip,
  };
}

function simulateEmiRedirect({
  currentSip,
  emiAmount,
  redirectPercent,
  emiEndsAfterMonths,
  annualReturnPercent,
  years,
}: {
  currentSip: number;
  emiAmount: number;
  redirectPercent: number;
  emiEndsAfterMonths: number;
  annualReturnPercent: number;
  years: number;
}) {
  const safeCurrentSip = clampNonNegative(currentSip);
  const safeEmiAmount = clampNonNegative(emiAmount);
  const safeRedirectPercent = clampNonNegative(redirectPercent);
  const safeEmiEndsAfterMonths = Math.max(0, Math.round(emiEndsAfterMonths));
  const redirectedAmount = safeEmiAmount * safeRedirectPercent / 100;

  const projection = simulateProjectionWithContribution({
    annualReturnPercent,
    years,
    contributionForMonth: (month) => {
      if (month > safeEmiEndsAfterMonths) {
        return safeCurrentSip + redirectedAmount;
      }
      return safeCurrentSip;
    },
  });

  return {
    projection,
    increasedFromMonth: safeEmiEndsAfterMonths + 1,
    redirectedSipIncrease: redirectedAmount,
  };
}

function solveRequiredMonthlySip({
  targetCorpus,
  currentSavings,
  annualReturnPercent,
  years,
}: {
  targetCorpus: number;
  currentSavings: number;
  annualReturnPercent: number;
  years: number;
}) {
  const safeTarget = clampNonNegative(targetCorpus);
  const safeSavings = clampNonNegative(currentSavings);
  const safeReturn = clampNonNegative(annualReturnPercent);
  const safeYears = clampNonNegative(years);
  const monthlyRate = safeReturn / 1200;
  const periods = safeYears * 12;

  if (periods <= 0) return 0;

  const futureFromSavings = safeSavings * Math.pow(1 + monthlyRate, periods);
  const requiredFromSip = Math.max(safeTarget - futureFromSavings, 0);
  const factor =
    monthlyRate === 0
      ? periods
      : ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate) * (1 + monthlyRate);
  if (factor <= 0) return 0;
  return requiredFromSip / factor;
}

function solveRequiredMonthlySipWithStepUp({
  targetCorpus,
  currentSavings,
  annualReturnPercent,
  years,
  annualStepUpPercent,
}: {
  targetCorpus: number;
  currentSavings: number;
  annualReturnPercent: number;
  years: number;
  annualStepUpPercent: number;
}) {
  const safeTarget = clampNonNegative(targetCorpus);
  const safeSavings = clampNonNegative(currentSavings);
  const safeYears = clampNonNegative(years);
  if (safeYears <= 0) return 0;

  const onlySavingsFuture = simulateSipProjection({
    initialMonthlySip: 0,
    annualReturnPercent,
    years: safeYears,
    annualStepUpPercent,
    currentSavings: safeSavings,
  }).futureValue;
  if (onlySavingsFuture >= safeTarget) return 0;

  let low = 0;
  let high = Math.max(1000, safeTarget / Math.max(1, safeYears * 12));
  for (let i = 0; i < 40; i += 1) {
    const trial = simulateSipProjection({
      initialMonthlySip: high,
      annualReturnPercent,
      years: safeYears,
      annualStepUpPercent,
      currentSavings: safeSavings,
    }).futureValue;
    if (trial >= safeTarget) break;
    high *= 2;
  }

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const trial = simulateSipProjection({
      initialMonthlySip: mid,
      annualReturnPercent,
      years: safeYears,
      annualStepUpPercent,
      currentSavings: safeSavings,
    }).futureValue;
    if (trial >= safeTarget) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return high;
}

function buildMilestones(records: ProjectionRecord[], years: number): MilestoneRow[] {
  if (records.length === 0) return [];
  const finalYear = Math.max(1, Math.ceil(clampNonNegative(years)));
  const yearStops = [1, 3, 5, 10].filter((value) => value <= finalYear);
  if (!yearStops.includes(finalYear)) {
    yearStops.push(finalYear);
  }

  return yearStops.map((yearStop) => {
    const monthIndex = Math.min(records.length, yearStop * 12) - 1;
    const row = records[Math.max(0, monthIndex)];
    return {
      label: yearStop === finalYear ? `Final Year (${finalYear})` : `End of Year ${yearStop}`,
      invested: row.invested,
      value: row.value,
      gains: row.gains,
    };
  });
}

function buildBreakpoints(records: ProjectionRecord[]): BreakpointRow[] {
  if (records.length === 0) return [];
  return BREAKPOINT_TARGETS.map((target) => {
    const hit = records.find((row) => row.value >= target);
    if (!hit) return null;
    const years = Math.floor((hit.month - 1) / 12);
    const months = ((hit.month - 1) % 12) + 1;
    return {
      target,
      month: hit.month,
      label: `Year ${years + 1}, Month ${months}`,
      invested: hit.invested,
      value: hit.value,
      gains: hit.gains,
    };
  }).filter((item): item is BreakpointRow => item !== null);
}

function downloadSvgResultImage({
  modeLabel,
  monthlySip,
  years,
  expectedReturn,
  futureValue,
  planBadge,
}: {
  modeLabel: string;
  monthlySip: number;
  years: number;
  expectedReturn: number;
  futureValue: number;
  planBadge: string;
}) {
  const safeMode = modeLabel.replace(/&/g, '&amp;');
  const safeMonthlySip = formatCurrency(monthlySip).replace(/&/g, '&amp;');
  const safeYears = formatNumber(years).replace(/&/g, '&amp;');
  const safeReturn = formatPercent(expectedReturn).replace(/&/g, '&amp;');
  const safeFuture = formatCurrency(futureValue).replace(/&/g, '&amp;');
  const safePlanBadge = planBadge.replace(/&/g, '&amp;');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RupeeKit SIP estimate summary">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b2f5b" />
      <stop offset="100%" stop-color="#0f4a8a" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1200" height="675" fill="url(#bg)" />
  <rect x="54" y="54" width="1092" height="567" rx="24" fill="#ffffff" opacity="0.96" />
  <text x="94" y="130" fill="#0b2f5b" font-size="44" font-family="Arial, sans-serif" font-weight="700">RupeeKit</text>
  <text x="94" y="176" fill="#334155" font-size="22" font-family="Arial, sans-serif">SIP Result Snapshot (${safeMode})</text>
  <text x="94" y="250" fill="#111827" font-size="28" font-family="Arial, sans-serif" font-weight="700">Monthly SIP: ${safeMonthlySip}</text>
  <text x="94" y="305" fill="#111827" font-size="28" font-family="Arial, sans-serif" font-weight="700">Duration: ${safeYears} years</text>
  <text x="94" y="360" fill="#111827" font-size="28" font-family="Arial, sans-serif" font-weight="700">Expected return: ${safeReturn}</text>
  <text x="94" y="445" fill="#0f2f5a" font-size="30" font-family="Arial, sans-serif" font-weight="700">Estimated future value</text>
  <text x="94" y="505" fill="#166534" font-size="56" font-family="Arial, sans-serif" font-weight="700">${safeFuture}</text>
  <text x="94" y="545" fill="#1e293b" font-size="22" font-family="Arial, sans-serif" font-weight="700">Plan badge: ${safePlanBadge}</text>
  <text x="94" y="575" fill="#475569" font-size="20" font-family="Arial, sans-serif">Educational estimate only. Returns are not guaranteed.</text>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sip-result-rupeekit.svg';
  link.click();
  URL.revokeObjectURL(url);
}

function InputField({
  label,
  unit,
  value,
  onChange,
  inputId,
  min = 0,
  step = 1,
  help,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (value: number) => void;
  inputId?: string;
  min?: number;
  step?: number;
  help?: string;
}) {
  const [draftValue, setDraftValue] = useState<string>(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-800">
        {label}
        {unit ? <span className="font-medium text-slate-500">{unit}</span> : null}
      </span>
      <input
        id={inputId}
        type="number"
        value={draftValue}
        min={min}
        step={step}
        onFocus={(event) => event.target.select()}
        onChange={(event) => {
          const rawValue = event.target.value;
          if (rawValue === '') {
            setDraftValue('');
            return;
          }

          const parsed = Number(rawValue);
          if (!Number.isFinite(parsed)) return;

          setDraftValue(rawValue);
          onChange(parsed);
        }}
        onBlur={() => {
          if (draftValue === '') {
            const fallback = Number.isFinite(min) ? min : 0;
            onChange(fallback);
            setDraftValue(String(fallback));
            return;
          }

          const parsed = Number(draftValue);
          if (!Number.isFinite(parsed)) {
            const fallback = Number.isFinite(min) ? min : 0;
            onChange(fallback);
            setDraftValue(String(fallback));
            return;
          }

          setDraftValue(String(parsed));
        }}
        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
      />
      {help ? <span className="mt-2 block text-xs leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function BarComparison({
  label,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  label: string;
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}) {
  const maxValue = Math.max(leftValue, rightValue, 1);
  const leftWidth = (leftValue / maxValue) * 100;
  const rightWidth = (rightValue / maxValue) * 100;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-label={label}>
      <h3 className="text-lg font-bold text-brandDeepNavy">{label}</h3>
      <p className="mt-2 text-xs text-slate-500">
        Regular SIP vs Step-Up SIP future value comparison based on the same return and duration assumptions.
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>{leftLabel}</span>
            <span>{formatCurrency(leftValue)}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-slate-100" aria-hidden="true">
            <div className="h-3 rounded-full bg-[#0f2f5a]" style={{ width: `${leftWidth}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>{rightLabel}</span>
            <span>{formatCurrency(rightValue)}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-slate-100" aria-hidden="true">
            <div className="h-3 rounded-full bg-[#2e8b57]" style={{ width: `${rightWidth}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function InvestmentBreakdown({
  invested,
  gains,
}: {
  invested: number;
  gains: number;
}) {
  const safeInvested = Math.max(0, invested);
  const safeGains = Math.max(0, gains);
  const total = Math.max(safeInvested + safeGains, 1);
  const investedWidth = (safeInvested / total) * 100;
  const gainsWidth = (safeGains / total) * 100;

  return (
    <section
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label="SIP invested amount and estimated gains visual breakdown"
    >
      <h3 className="text-lg font-bold text-brandDeepNavy">Visual breakdown</h3>
      <p className="mt-2 text-sm text-slate-600">
        Total invested amount is {formatCurrency(safeInvested)} and estimated gains are {formatCurrency(safeGains)}.
      </p>
      <div className="mt-4 h-5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        <div className="flex h-full w-full" aria-hidden="true">
          <div className="h-full bg-[#0f2f5a]" style={{ width: `${investedWidth}%` }} />
          <div className="h-full bg-[#2e8b57]" style={{ width: `${gainsWidth}%` }} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total invested</p>
          <p className="mt-1 font-bold text-slate-900">{formatCurrency(safeInvested)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated gains</p>
          <p className="mt-1 font-bold text-slate-900">{formatCurrency(safeGains)}</p>
        </div>
      </div>
    </section>
  );
}

export default function SipPlannerCalculator({ tool }: { tool: Tool }) {
  const monthlyInputDefault = tool.inputs.find((input) => input.key === 'monthlyInvestment')?.default ?? 10000;
  const expectedReturnDefault = tool.inputs.find((input) => input.key === 'expectedReturn')?.default ?? 12;
  const yearsDefault = tool.inputs.find((input) => input.key === 'years')?.default ?? 10;

  const [mode, setMode] = useState<SipMode>('regular');
  const [activeSipPresetId, setActiveSipPresetId] = useState<string | null>(null);
  const [monthlySip, setMonthlySip] = useState(monthlyInputDefault);
  const [expectedReturn, setExpectedReturn] = useState(expectedReturnDefault);
  const [lastCustomExpectedReturn, setLastCustomExpectedReturn] = useState(
    isSipReturnPreset(expectedReturnDefault) ? 11 : expectedReturnDefault
  );
  const [durationYears, setDurationYears] = useState(yearsDefault);
  const [stepUpRate, setStepUpRate] = useState(10);
  const [targetCorpus, setTargetCorpus] = useState(10000000);
  const [goalYears, setGoalYears] = useState(10);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [existingMonthlySip, setExistingMonthlySip] = useState(0);
  const [inflationRate, setInflationRate] = useState(6);
  const [yearlyTopUpAmount, setYearlyTopUpAmount] = useState(50000);
  const [missedSipsPerYear, setMissedSipsPerYear] = useState(0);
  const [catchUpPreference, setCatchUpPreference] = useState<CatchUpPreference>('none');
  const [pauseDurationMonths, setPauseDurationMonths] = useState(3);
  const [restartMode, setRestartMode] = useState<PauseRestartMode>('same');
  const [higherSipAfterPause, setHigherSipAfterPause] = useState(monthlyInputDefault + 2000);
  const [salaryIncreaseMode, setSalaryIncreaseMode] = useState<SalaryIncreaseMode>('hike-share');
  const [salaryPlannerCurrentSip, setSalaryPlannerCurrentSip] = useState(monthlyInputDefault);
  const [salaryHikePercent, setSalaryHikePercent] = useState(8);
  const [salaryHikeToSipPercent, setSalaryHikeToSipPercent] = useState(30);
  const [salaryHikeFixedIncrement, setSalaryHikeFixedIncrement] = useState(1000);
  const [salaryPlannerDurationYears, setSalaryPlannerDurationYears] = useState(yearsDefault);
  const [salaryPlannerExpectedReturn, setSalaryPlannerExpectedReturn] = useState(expectedReturnDefault);
  const [redirectCurrentSip, setRedirectCurrentSip] = useState(monthlyInputDefault);
  const [redirectEmiAmount, setRedirectEmiAmount] = useState(15000);
  const [redirectEmiEndsAfterMonths, setRedirectEmiEndsAfterMonths] = useState(24);
  const [redirectPercent, setRedirectPercent] = useState(50);
  const [redirectDurationYears, setRedirectDurationYears] = useState(yearsDefault);
  const [redirectExpectedReturn, setRedirectExpectedReturn] = useState(expectedReturnDefault);
  const [emergencyFundAcknowledged, setEmergencyFundAcknowledged] = useState(false);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('simple');
  const [imageDownloadError, setImageDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const amountParam = parsePositiveIntegerParam(searchParams.get('amount'));
    const yearsParam = parsePositiveIntegerParam(searchParams.get('years'));

    if (amountParam === null || yearsParam === null) return;

    setMonthlySip(amountParam);
    setDurationYears(yearsParam);
  }, []);

  useEffect(() => {
    if (!isSipReturnPreset(expectedReturn)) {
      setLastCustomExpectedReturn(expectedReturn);
    }
  }, [expectedReturn]);

  const regularResult = useMemo(
    () =>
      calculateRegularSipFromFormula({
        monthlySip,
        annualReturnPercent: expectedReturn,
        years: durationYears,
      }),
    [monthlySip, expectedReturn, durationYears]
  );

  const stepUpResult = useMemo(
    () =>
      simulateSipProjection({
        initialMonthlySip: monthlySip,
        annualReturnPercent: expectedReturn,
        years: durationYears,
        annualStepUpPercent: stepUpRate,
      }),
    [monthlySip, expectedReturn, durationYears, stepUpRate]
  );

  const goalRequiredMonthlySip = useMemo(
    () =>
      solveRequiredMonthlySip({
        targetCorpus,
        currentSavings,
        annualReturnPercent: expectedReturn,
        years: goalYears,
      }),
    [targetCorpus, currentSavings, expectedReturn, goalYears]
  );

  const goalRequiredWithFiveStepUp = useMemo(
    () =>
      solveRequiredMonthlySipWithStepUp({
        targetCorpus,
        currentSavings,
        annualReturnPercent: expectedReturn,
        years: goalYears,
        annualStepUpPercent: 5,
      }),
    [targetCorpus, currentSavings, expectedReturn, goalYears]
  );

  const goalRequiredWithTenStepUp = useMemo(
    () =>
      solveRequiredMonthlySipWithStepUp({
        targetCorpus,
        currentSavings,
        annualReturnPercent: expectedReturn,
        years: goalYears,
        annualStepUpPercent: 10,
      }),
    [targetCorpus, currentSavings, expectedReturn, goalYears]
  );

  const goalExistingSipProjection = useMemo(
    () =>
      simulateSipProjection({
        initialMonthlySip: existingMonthlySip,
        annualReturnPercent: expectedReturn,
        years: goalYears,
        annualStepUpPercent: 0,
        currentSavings,
      }),
    [existingMonthlySip, expectedReturn, goalYears, currentSavings]
  );

  const goalGap = useMemo(() => targetCorpus - goalExistingSipProjection.futureValue, [targetCorpus, goalExistingSipProjection]);

  const onTrackStatus = useMemo(() => {
    if (goalGap <= 0) return 'On Track';
    if (targetCorpus > 0 && goalGap <= targetCorpus * 0.1) return 'Slight Gap';
    return 'Large Gap';
  }, [goalGap, targetCorpus]);

  const activeProjection = useMemo(() => {
    if (mode === 'step-up' || mode === 'compare') return stepUpResult;
    if (mode === 'goal') {
      return simulateSipProjection({
        initialMonthlySip: goalRequiredMonthlySip,
        annualReturnPercent: expectedReturn,
        years: goalYears,
        annualStepUpPercent: 0,
        currentSavings,
      });
    }
    return simulateSipProjection({
      initialMonthlySip: monthlySip,
      annualReturnPercent: expectedReturn,
      years: durationYears,
      annualStepUpPercent: 0,
    });
  }, [mode, stepUpResult, goalRequiredMonthlySip, expectedReturn, goalYears, currentSavings, monthlySip, durationYears]);

  const activeYears = mode === 'goal' ? goalYears : durationYears;
  const activeModeLabel = SIP_MODE_OPTIONS.find((item) => item.key === mode)?.label ?? 'Regular SIP';

  const delayCost = useMemo(() => {
    const yearsAfterDelay = Math.max(activeYears - 1, 0);
    const delayedProjection =
      mode === 'step-up' || mode === 'compare'
        ? simulateSipProjection({
            initialMonthlySip: monthlySip,
            annualReturnPercent: expectedReturn,
            years: yearsAfterDelay,
            annualStepUpPercent: stepUpRate,
            currentSavings: 0,
          })
        : simulateSipProjection({
            initialMonthlySip: mode === 'goal' ? goalRequiredMonthlySip : monthlySip,
            annualReturnPercent: expectedReturn,
            years: yearsAfterDelay,
            annualStepUpPercent: 0,
            currentSavings: mode === 'goal' ? currentSavings : 0,
          });

    return {
      startingNow: activeProjection.futureValue,
      startingAfterOneYear: delayedProjection.futureValue,
      difference: Math.max(activeProjection.futureValue - delayedProjection.futureValue, 0),
    };
  }, [
    activeYears,
    mode,
    monthlySip,
    expectedReturn,
    stepUpRate,
    goalRequiredMonthlySip,
    currentSavings,
    activeProjection.futureValue,
  ]);

  const milestoneRows = useMemo(() => buildMilestones(activeProjection.records, activeYears), [activeProjection.records, activeYears]);
  const breakpointRows = useMemo(() => buildBreakpoints(activeProjection.records), [activeProjection.records]);

  const inflationAdjusted = useMemo(() => {
    const safeInflation = clampNonNegative(inflationRate);
    const safeYears = clampNonNegative(activeYears);
    const divisor = Math.pow(1 + safeInflation / 100, safeYears);
    const presentValue = divisor > 0 ? activeProjection.futureValue / divisor : activeProjection.futureValue;
    return {
      inflationRate: safeInflation,
      futureValue: activeProjection.futureValue,
      presentValue,
    };
  }, [inflationRate, activeProjection.futureValue, activeYears]);

  const scenarioRows = useMemo(() => {
    if (mode === 'goal') return [];
    const scenarios = [0.9, 1, 1.1];
    return scenarios.map((factor) => {
      const adjustedSip = monthlySip * factor;
      const futureValue =
        mode === 'step-up' || mode === 'compare'
          ? simulateSipProjection({
              initialMonthlySip: adjustedSip,
              annualReturnPercent: expectedReturn,
              years: durationYears,
              annualStepUpPercent: stepUpRate,
            }).futureValue
          : calculateRegularSipFromFormula({
              monthlySip: adjustedSip,
              annualReturnPercent: expectedReturn,
              years: durationYears,
            }).futureValue;

      return {
        key: factor,
        label: `${Math.round(factor * 100)}% SIP`,
        sipAmount: adjustedSip,
        futureValue,
      };
    });
  }, [mode, monthlySip, expectedReturn, durationYears, stepUpRate]);

  const goalRequiredWithYearlyTopUp = useMemo(
    () =>
      solveRequiredMonthlySipWithYearlyTopUp({
        targetCorpus,
        currentSavings,
        annualReturnPercent: expectedReturn,
        years: goalYears,
        yearlyTopUpAmount,
      }),
    [targetCorpus, currentSavings, expectedReturn, goalYears, yearlyTopUpAmount]
  );

  const consistencyBaseMonthlySip = mode === 'goal' ? goalRequiredMonthlySip : monthlySip;
  const consistencyBaseStepUp = mode === 'step-up' || mode === 'compare' ? stepUpRate : 0;
  const consistencyBaseYears = mode === 'goal' ? goalYears : durationYears;
  const consistencyBaseCurrentSavings = mode === 'goal' ? currentSavings : 0;

  const consistencyPerfectProjection = useMemo(
    () =>
      simulateSipProjection({
        initialMonthlySip: consistencyBaseMonthlySip,
        annualReturnPercent: expectedReturn,
        years: consistencyBaseYears,
        annualStepUpPercent: consistencyBaseStepUp,
        currentSavings: consistencyBaseCurrentSavings,
      }),
    [
      consistencyBaseMonthlySip,
      expectedReturn,
      consistencyBaseYears,
      consistencyBaseStepUp,
      consistencyBaseCurrentSavings,
    ]
  );

  const consistencySimulation = useMemo(
    () =>
      simulateConsistencyProjection({
        monthlySip: consistencyBaseMonthlySip,
        annualReturnPercent: expectedReturn,
        years: consistencyBaseYears,
        annualStepUpPercent: consistencyBaseStepUp,
        currentSavings: consistencyBaseCurrentSavings,
        missedSipsPerYear,
        catchUpPreference,
      }),
    [
      consistencyBaseMonthlySip,
      expectedReturn,
      consistencyBaseYears,
      consistencyBaseStepUp,
      consistencyBaseCurrentSavings,
      missedSipsPerYear,
      catchUpPreference,
    ]
  );

  const consistencyImpact = useMemo(
    () => Math.max(consistencyPerfectProjection.futureValue - consistencySimulation.projection.futureValue, 0),
    [consistencyPerfectProjection.futureValue, consistencySimulation.projection.futureValue]
  );

  const pauseRestartSipAmount = restartMode === 'higher' ? higherSipAfterPause : monthlySip;

  const pauseWithoutPause = useMemo(
    () =>
      simulatePauseRestartProjection({
        annualReturnPercent: expectedReturn,
        years: durationYears,
        pauseMonths: 0,
        restartMonthlySip: monthlySip,
      }),
    [expectedReturn, durationYears, monthlySip]
  );

  const pauseWithRestart = useMemo(
    () =>
      simulatePauseRestartProjection({
        annualReturnPercent: expectedReturn,
        years: durationYears,
        pauseMonths: pauseDurationMonths,
        restartMonthlySip: pauseRestartSipAmount,
      }),
    [expectedReturn, durationYears, pauseDurationMonths, pauseRestartSipAmount]
  );

  const pauseGap = useMemo(
    () => Math.max(pauseWithoutPause.futureValue - pauseWithRestart.futureValue, 0),
    [pauseWithoutPause.futureValue, pauseWithRestart.futureValue]
  );

  const pauseRecoverySip = useMemo(
    () =>
      solveRestartSipToRecoverPauseGap({
        baseTargetValue: pauseWithoutPause.futureValue,
        annualReturnPercent: expectedReturn,
        years: durationYears,
        pauseMonths: pauseDurationMonths,
        minRestartSip: pauseRestartSipAmount,
      }),
    [
      pauseWithoutPause.futureValue,
      expectedReturn,
      durationYears,
      pauseDurationMonths,
      pauseRestartSipAmount,
    ]
  );

  const pauseExtraRecoverySipNeeded = useMemo(
    () => Math.max(pauseRecoverySip - pauseRestartSipAmount, 0),
    [pauseRecoverySip, pauseRestartSipAmount]
  );

  const salaryHikePlan = useMemo(
    () =>
      simulateSalaryHikeSip({
        currentMonthlySip: salaryPlannerCurrentSip,
        annualReturnPercent: salaryPlannerExpectedReturn,
        years: salaryPlannerDurationYears,
        increaseMode: salaryIncreaseMode,
        expectedIncomeHikePercent: salaryHikePercent,
        hikeShareForSipPercent: salaryHikeToSipPercent,
        fixedYearlySipIncrease: salaryHikeFixedIncrement,
      }),
    [
      salaryPlannerCurrentSip,
      salaryPlannerExpectedReturn,
      salaryPlannerDurationYears,
      salaryIncreaseMode,
      salaryHikePercent,
      salaryHikeToSipPercent,
      salaryHikeFixedIncrement,
    ]
  );

  const salaryHikeFlatPlan = useMemo(
    () =>
      simulateSipProjection({
        initialMonthlySip: salaryPlannerCurrentSip,
        annualReturnPercent: salaryPlannerExpectedReturn,
        years: salaryPlannerDurationYears,
      }),
    [salaryPlannerCurrentSip, salaryPlannerExpectedReturn, salaryPlannerDurationYears]
  );

  const salaryHikeExtraCorpus = useMemo(
    () => Math.max(salaryHikePlan.projection.futureValue - salaryHikeFlatPlan.futureValue, 0),
    [salaryHikePlan.projection.futureValue, salaryHikeFlatPlan.futureValue]
  );

  const emiRedirectWithIncrease = useMemo(
    () =>
      simulateEmiRedirect({
        currentSip: redirectCurrentSip,
        emiAmount: redirectEmiAmount,
        redirectPercent,
        emiEndsAfterMonths: redirectEmiEndsAfterMonths,
        annualReturnPercent: redirectExpectedReturn,
        years: redirectDurationYears,
      }),
    [
      redirectCurrentSip,
      redirectEmiAmount,
      redirectPercent,
      redirectEmiEndsAfterMonths,
      redirectExpectedReturn,
      redirectDurationYears,
    ]
  );

  const emiRedirectWithoutIncrease = useMemo(
    () =>
      simulateSipProjection({
        initialMonthlySip: redirectCurrentSip,
        annualReturnPercent: redirectExpectedReturn,
        years: redirectDurationYears,
      }),
    [redirectCurrentSip, redirectExpectedReturn, redirectDurationYears]
  );

  const emiRedirectExtraCorpus = useMemo(
    () => Math.max(emiRedirectWithIncrease.projection.futureValue - emiRedirectWithoutIncrease.futureValue, 0),
    [emiRedirectWithIncrease.projection.futureValue, emiRedirectWithoutIncrease.futureValue]
  );

  const assumptionWarnings = useMemo<AssumptionWarning[]>(() => {
    const warnings: AssumptionWarning[] = [];
    if (expectedReturn > 15) {
      warnings.push({
        id: 'high-return',
        message: 'Check this assumption: Expected return above 15% can make projections optimistic.',
      });
    }
    if (targetCorpus >= 10000000 && goalYears < 7) {
      warnings.push({
        id: 'short-duration-large-goal',
        message: 'Check this assumption: Duration may be short for a large target corpus.',
      });
    }
    if (inflationRate <= 0) {
      warnings.push({
        id: 'inflation-missing',
        message: 'Check this assumption: Add an inflation value to evaluate purchasing-power impact.',
      });
    }
    if (missedSipsPerYear >= 3) {
      warnings.push({
        id: 'missed-sips-high',
        message: 'Check this assumption: High missed SIP frequency can reduce long-term corpus estimates.',
      });
    }
    if (mode === 'goal' && targetCorpus > 0 && Math.max(goalGap, 0) > targetCorpus * 0.25) {
      warnings.push({
        id: 'goal-gap-large',
        message: 'Check this assumption: Current plan shows a large gap versus your selected goal.',
      });
    }
    if (!emergencyFundAcknowledged) {
      warnings.push({
        id: 'emergency-fund-check',
        message: 'Check this assumption: Review emergency fund readiness before increasing SIP commitments.',
      });
    }
    if (mode === 'goal' && existingMonthlySip > 0 && existingMonthlySip < goalRequiredMonthlySip * 0.5) {
      warnings.push({
        id: 'sip-vs-target',
        message: 'Check this assumption: Current SIP may be low versus the selected target and timeline.',
      });
    }
    return warnings;
  }, [
    expectedReturn,
    targetCorpus,
    goalYears,
    inflationRate,
    missedSipsPerYear,
    mode,
    goalGap,
    emergencyFundAcknowledged,
    existingMonthlySip,
    goalRequiredMonthlySip,
  ]);

  const planQualityBadge = useMemo<PlanQualityBadge>(() => {
    if (expectedReturn > 15) {
      return {
        label: 'Aggressive Return Assumption',
        reason: 'Return assumption is above 15%, so projection confidence should be treated with caution.',
      };
    }
    if (mode === 'goal' && targetCorpus > 0 && Math.max(goalGap, 0) > targetCorpus * 0.25) {
      return {
        label: 'Goal Gap Alert',
        reason: 'Current SIP path shows a sizeable gap compared with your selected target.',
      };
    }
    if (missedSipsPerYear >= 3 || pauseDurationMonths >= 4) {
      return {
        label: 'Consistency Risk',
        reason: 'Frequent missed SIP or long pause assumptions can materially reduce projected corpus.',
      };
    }
    if (mode === 'goal' && existingMonthlySip > 0 && existingMonthlySip < goalRequiredMonthlySip) {
      return {
        label: 'Needs Higher SIP',
        reason: 'Current SIP appears below the monthly level estimated for your selected goal timeline.',
      };
    }
    if (inflationRate > 0) {
      return {
        label: 'Inflation-Aware Plan',
        reason: 'You are evaluating both nominal corpus and inflation-adjusted value.',
      };
    }
    return {
      label: 'Balanced SIP Plan',
      reason: 'Inputs are within moderate planning ranges for educational SIP estimation.',
    };
  }, [
    expectedReturn,
    mode,
    targetCorpus,
    goalGap,
    missedSipsPerYear,
    pauseDurationMonths,
    existingMonthlySip,
    goalRequiredMonthlySip,
    inflationRate,
  ]);

  const oneYearActionPlan = useMemo(() => {
    const selectedSipAmount = mode === 'goal' ? goalRequiredMonthlySip : monthlySip;
    return [
      `Start or continue selected SIP amount: ${formatCurrency(selectedSipAmount)}.`,
      'Review progress after 3 months.',
      'Review emergency fund status before increasing risk exposure.',
      'Recheck inflation-adjusted goal value.',
      'Review after salary hike or major income change.',
      'Increase SIP if affordable and sustainable.',
      'Recalculate after major expense or income change.',
    ];
  }, [mode, goalRequiredMonthlySip, monthlySip]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    if (mode === 'goal') {
      return [
        {
          key: 'requiredMonthlySip',
          label: 'Required monthly SIP',
          value: goalRequiredMonthlySip,
          formatted: formatCurrency(goalRequiredMonthlySip),
        },
        {
          key: 'requiredSip5StepUp',
          label: 'Required monthly SIP with 5% annual step-up',
          value: goalRequiredWithFiveStepUp,
          formatted: formatCurrency(goalRequiredWithFiveStepUp),
        },
        {
          key: 'requiredSip10StepUp',
          label: 'Required monthly SIP with 10% annual step-up',
          value: goalRequiredWithTenStepUp,
          formatted: formatCurrency(goalRequiredWithTenStepUp),
        },
        {
          key: 'requiredSipYearlyTopUp',
          label: 'Required SIP with yearly top-up',
          value: goalRequiredWithYearlyTopUp,
          formatted: `${formatCurrency(goalRequiredWithYearlyTopUp)} + yearly top-up ${formatCurrency(yearlyTopUpAmount)}`,
        },
        {
          key: 'goalGap',
          label: 'Goal gap with existing SIP',
          value: Math.max(goalGap, 0),
          formatted: formatCurrency(Math.max(goalGap, 0)),
        },
      ];
    }

    if (mode === 'step-up') {
      return [
        {
          key: 'stepUpInvested',
          label: 'Total invested amount',
          value: stepUpResult.totalInvested,
          formatted: formatCurrency(stepUpResult.totalInvested),
        },
        {
          key: 'stepUpFutureValue',
          label: 'Estimated future value',
          value: stepUpResult.futureValue,
          formatted: formatCurrency(stepUpResult.futureValue),
        },
        {
          key: 'stepUpGains',
          label: 'Estimated gains',
          value: stepUpResult.estimatedGains,
          formatted: formatCurrency(stepUpResult.estimatedGains),
        },
        {
          key: 'extraVsRegular',
          label: 'Extra estimated value vs regular SIP',
          value: Math.max(stepUpResult.futureValue - regularResult.futureValue, 0),
          formatted: formatCurrency(Math.max(stepUpResult.futureValue - regularResult.futureValue, 0)),
        },
        {
          key: 'finalYearSip',
          label: 'Final-year monthly SIP amount',
          value: stepUpResult.finalMonthlySip,
          formatted: formatCurrency(stepUpResult.finalMonthlySip),
        },
      ];
    }

    if (mode === 'compare') {
      return [
        {
          key: 'compareRegularFuture',
          label: 'Regular SIP future value',
          value: regularResult.futureValue,
          formatted: formatCurrency(regularResult.futureValue),
        },
        {
          key: 'compareStepUpFuture',
          label: 'Step-Up SIP future value',
          value: stepUpResult.futureValue,
          formatted: formatCurrency(stepUpResult.futureValue),
        },
        {
          key: 'compareExtraCorpus',
          label: 'Extra estimated corpus from step-up',
          value: stepUpResult.futureValue - regularResult.futureValue,
          formatted: formatCurrency(stepUpResult.futureValue - regularResult.futureValue),
        },
        {
          key: 'compareGainsDiff',
          label: 'Estimated gains difference',
          value: stepUpResult.estimatedGains - regularResult.estimatedGains,
          formatted: formatCurrency(stepUpResult.estimatedGains - regularResult.estimatedGains),
        },
      ];
    }

    return [
      {
        key: 'regularInvested',
        label: 'Total invested amount',
        value: regularResult.totalInvested,
        formatted: formatCurrency(regularResult.totalInvested),
      },
      {
        key: 'regularFuture',
        label: 'Estimated future value',
        value: regularResult.futureValue,
        formatted: formatCurrency(regularResult.futureValue),
      },
      {
        key: 'regularGains',
        label: 'Estimated gains',
        value: regularResult.estimatedGains,
        formatted: formatCurrency(regularResult.estimatedGains),
      },
    ];
  }, [
    mode,
    goalRequiredMonthlySip,
    goalRequiredWithFiveStepUp,
    goalRequiredWithTenStepUp,
    goalRequiredWithYearlyTopUp,
    yearlyTopUpAmount,
    goalGap,
    stepUpResult,
    regularResult,
  ]);

  const presetActive = useMemo(() => {
    return getSipReturnPresetKey(expectedReturn);
  }, [expectedReturn]);

  const sipPlanPdfData = useMemo<SipPlanPdfData>(() => {
    const inputs: Array<{ label: string; value: string }> = [];
    if (mode === 'goal') {
      inputs.push(
        { label: 'Target corpus', value: formatCurrency(targetCorpus) },
        { label: 'Years to goal', value: `${formatNumber(goalYears)} years` },
        { label: 'Expected annual return', value: formatPercent(expectedReturn) },
        { label: 'Current savings', value: formatCurrency(currentSavings) },
        { label: 'Existing monthly SIP', value: formatCurrency(existingMonthlySip) },
        { label: 'Yearly top-up amount', value: formatCurrency(yearlyTopUpAmount) }
      );
    } else {
      inputs.push(
        { label: 'Monthly SIP', value: formatCurrency(monthlySip) },
        { label: 'Expected annual return', value: formatPercent(expectedReturn) },
        { label: 'Investment duration', value: `${formatNumber(durationYears)} years` }
      );
      if (mode === 'step-up' || mode === 'compare') {
        inputs.push({ label: 'Annual SIP increase', value: formatPercent(stepUpRate) });
      }
    }
    inputs.push({ label: 'Inflation assumption', value: formatPercent(inflationRate) });

    const resultHighlights = summaryCards.map((card) => ({ label: card.label, value: card.formatted }));
    resultHighlights.push({ label: 'Plan quality badge', value: planQualityBadge.label });

    return {
      generatedAt: '',
      modeLabel: activeModeLabel,
      inputs,
      resultHighlights,
      stepUpComparison:
        mode === 'step-up' || mode === 'compare'
          ? {
              regularFutureValue: regularResult.futureValue,
              stepUpFutureValue: stepUpResult.futureValue,
              investedDifference: stepUpResult.totalInvested - regularResult.totalInvested,
              gainsDifference: stepUpResult.estimatedGains - regularResult.estimatedGains,
              extraCorpus: stepUpResult.futureValue - regularResult.futureValue,
            }
          : undefined,
      goalSummary:
        mode === 'goal'
          ? {
              requiredMonthlySip: goalRequiredMonthlySip,
              requiredWith5StepUp: goalRequiredWithFiveStepUp,
              requiredWith10StepUp: goalRequiredWithTenStepUp,
              goalGapWithExistingSip: Math.max(goalGap, 0),
              onTrackStatus,
            }
          : undefined,
      delayCost: {
        startingNow: delayCost.startingNow,
        startingAfterOneYear: delayCost.startingAfterOneYear,
        difference: delayCost.difference,
        note: 'Delay cost is an estimate based on the same assumed return and duration. It is not a guarantee.',
      },
      milestones: milestoneRows.map((row) => ({
        label: row.label,
        invested: row.invested,
        value: row.value,
        gains: row.gains,
      })),
      inflationAdjusted: {
        inflationRate: inflationAdjusted.inflationRate,
        futureValue: inflationAdjusted.futureValue,
        presentValue: inflationAdjusted.presentValue,
      },
      reviewChecklist: SIP_REVIEW_CHECKLIST,
      disclaimer:
        'Educational estimate only. Actual mutual fund returns may vary due to market movement, expense ratio, exit load, taxes, and fund performance.',
    };
  }, [
    mode,
    targetCorpus,
    goalYears,
    expectedReturn,
    currentSavings,
    existingMonthlySip,
    yearlyTopUpAmount,
    monthlySip,
    durationYears,
    stepUpRate,
    inflationRate,
    summaryCards,
    activeModeLabel,
    regularResult,
    stepUpResult,
    goalRequiredMonthlySip,
    goalRequiredWithFiveStepUp,
    goalRequiredWithTenStepUp,
    goalGap,
    onTrackStatus,
    delayCost,
    milestoneRows,
    inflationAdjusted,
    planQualityBadge,
  ]);

  const applySipPreset = (preset: CalculatorPreset) => {
    const v = preset.values as Record<string, number | string>;
    if (typeof v.mode === 'string') setMode(v.mode as SipMode);
    if (typeof v.monthlySip === 'number' && Number.isFinite(v.monthlySip)) setMonthlySip(Math.max(0, v.monthlySip));
    if (typeof v.durationYears === 'number' && Number.isFinite(v.durationYears)) setDurationYears(Math.max(0.5, v.durationYears));
    if (typeof v.stepUpRate === 'number' && Number.isFinite(v.stepUpRate)) setStepUpRate(Math.max(0, v.stepUpRate));
    if (typeof v.targetCorpus === 'number' && Number.isFinite(v.targetCorpus)) setTargetCorpus(Math.max(0, v.targetCorpus));
    if (typeof v.goalYears === 'number' && Number.isFinite(v.goalYears)) setGoalYears(Math.max(0.5, v.goalYears));
    if (typeof v.pauseDurationMonths === 'number' && Number.isFinite(v.pauseDurationMonths)) {
      setPauseDurationMonths(Math.max(1, Math.round(v.pauseDurationMonths)));
    }
    if (typeof v.missedSipsPerYear === 'number' && Number.isFinite(v.missedSipsPerYear)) {
      setMissedSipsPerYear(Math.max(0, Math.round(v.missedSipsPerYear)));
    }
    setActiveSipPresetId(preset.id);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-brandBorder bg-white p-4">
        <label htmlFor="sip-mode" className="flex flex-wrap items-center gap-3 text-sm font-semibold text-brandText">
          <span>Choose SIP mode</span>
          <select
            id="sip-mode"
            value={mode}
            onChange={(event) => {
              setActiveSipPresetId(null);
              setMode(event.target.value as SipMode);
            }}
            className="min-h-11 w-full rounded-lg border border-brandBorder bg-white px-3 text-sm text-brandText sm:w-auto"
          >
            {SIP_MODE_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
          </select>
        </label>
        <CalculatorPresets
          className="mt-4"
          presets={SIP_PRESETS}
          activePresetId={activeSipPresetId}
          onApply={applySipPreset}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-brandBorder bg-white p-5 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-brandDeepNavy">Enter your values</h2>
          <div className="mt-6 grid gap-5">
            {mode === 'goal' ? (
              <>
                <InputField
                  label="Target corpus"
                  unit="Rs"
                  value={targetCorpus}
                  min={0}
                  step={10000}
                  help="Enter your target amount for the goal."
                  onChange={setTargetCorpus}
                />
                <InputField
                  label="Years to goal"
                  unit="years"
                  value={goalYears}
                  min={0.5}
                  step={0.5}
                  help="Enter the number of years available to reach your goal."
                  onChange={setGoalYears}
                />
                <InputField
                  label="Expected annual return"
                  unit="%"
                  value={expectedReturn}
                  inputId="sip-expected-return"
                  min={0}
                  step={0.1}
                  help="Expected annual return assumption used for educational projection."
                  onChange={setExpectedReturn}
                />
                <InputField
                  label="Current savings (optional)"
                  unit="Rs"
                  value={currentSavings}
                  min={0}
                  step={1000}
                  help="Current amount already set aside for this goal."
                  onChange={setCurrentSavings}
                />
                <InputField
                  label="Existing monthly SIP (optional)"
                  unit="Rs"
                  value={existingMonthlySip}
                  min={0}
                  step={500}
                  help="Current monthly SIP for this same goal, if any."
                  onChange={setExistingMonthlySip}
                />
                <InputField
                  label="One-time yearly top-up amount (optional)"
                  unit="Rs"
                  value={yearlyTopUpAmount}
                  min={0}
                  step={1000}
                  help="Used in goal trade-off planning to estimate monthly SIP with annual top-up."
                  onChange={setYearlyTopUpAmount}
                />
              </>
            ) : (
              <>
                <InputField
                  label={mode === 'step-up' ? 'Initial monthly SIP amount' : 'Monthly SIP amount'}
                  unit="Rs"
                  value={monthlySip}
                  min={0}
                  step={500}
                  help="Amount invested every month."
                  onChange={setMonthlySip}
                />
                <InputField
                  label="Expected annual return"
                  unit="%"
                  value={expectedReturn}
                  inputId="sip-expected-return"
                  min={0}
                  step={0.1}
                  help="Expected average annual return. This is not guaranteed."
                  onChange={setExpectedReturn}
                />
                <InputField
                  label="Investment duration"
                  unit="years"
                  value={durationYears}
                  min={0.5}
                  step={0.5}
                  help="How long you plan to continue the SIP."
                  onChange={setDurationYears}
                />
                {(mode === 'step-up' || mode === 'compare') ? (
                  <InputField
                    label="Annual SIP increase percentage"
                    unit="%"
                    value={stepUpRate}
                    min={0}
                    step={0.5}
                    help="Step-up SIP estimate assumes the monthly SIP increases once every year by the selected percentage."
                    onChange={setStepUpRate}
                  />
                ) : null}
              </>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">SIP assumption presets</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setExpectedReturn(8)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    presetActive === '8'
                      ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Conservative 8%
                </button>
                <button
                  type="button"
                  onClick={() => setExpectedReturn(10)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    presetActive === '10'
                      ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Moderate 10%
                </button>
                <button
                  type="button"
                  onClick={() => setExpectedReturn(12)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    presetActive === '12'
                      ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Growth 12%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExpectedReturn((current) => (
                      isSipReturnPreset(current) ? lastCustomExpectedReturn : current
                    ));
                    const input = document.getElementById('sip-expected-return');
                    if (input instanceof HTMLInputElement) {
                      input.focus();
                      input.select();
                    }
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    presetActive === 'custom'
                      ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            <InputField
              label="Inflation assumption (optional)"
              unit="%"
              value={inflationRate}
              min={0}
              step={0.1}
              help="Present-value estimate uses this inflation assumption."
              onChange={setInflationRate}
            />

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={emergencyFundAcknowledged}
                onChange={(event) => setEmergencyFundAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brandNavy focus:ring-brandNavy"
              />
              <span>
                I reviewed emergency readiness before increasing SIP commitments. You can cross-check with the{' '}
                <Link href="/tools/emergency-fund-calculator-india" className="font-semibold text-sky-700 hover:underline">
                  emergency fund calculator
                </Link>
                .
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 shadow-sm md:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-brandDeepNavy">Estimated results</h2>
            <div className="mt-6">
              <CalculatorResultSummary results={summaryCards} />
            </div>

            {mode === 'goal' ? (
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-7 text-slate-700">
                <p className="font-semibold text-slate-900">Goal tracking status: {onTrackStatus}</p>
                <p className="mt-2">
                  This is an educational estimate based on user-entered assumptions.
                </p>
              </div>
            ) : null}

            {(mode === 'step-up' || mode === 'compare') ? (
              <p className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
                Step-up SIP estimate assumes the monthly SIP increases once every year by the selected percentage.
              </p>
            ) : null}

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Plan quality badge</p>
              <p className="mt-1 text-lg font-bold text-emerald-900">{planQualityBadge.label}</p>
              <p className="mt-2 leading-6 text-slate-700">{planQualityBadge.reason}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Explanation mode</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setExplanationMode('simple')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    explanationMode === 'simple'
                      ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Simple explanation
                </button>
                <button
                  type="button"
                  onClick={() => setExplanationMode('detailed')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    explanationMode === 'detailed'
                      ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Detailed formula
                </button>
                <button
                  type="button"
                  onClick={() => setExplanationMode('hinglish')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    explanationMode === 'hinglish'
                      ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  Hindi-English explanation
                </button>
              </div>
              {explanationMode === 'simple' ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Total invested: {formatCurrency(activeProjection.totalInvested)}. Estimated gains:{' '}
                  {formatCurrency(activeProjection.estimatedGains)}. Estimated future value:{' '}
                  {formatCurrency(activeProjection.futureValue)}. Actual outcome may vary due to market movement, fund
                  costs, taxes, and contribution timing.
                </p>
              ) : null}
              {explanationMode === 'detailed' ? (
                <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                  Future Value of SIP = monthly SIP x [((1 + monthly return) ^ number of months - 1) / monthly return]
                  x (1 + monthly return)
                </p>
              ) : null}
              {explanationMode === 'hinglish' ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Ye ek estimate hai. Actual mutual fund return market par depend karega. SIP amount, duration aur
                  return assumption change karne se result bhi change hota hai.
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <DownloadSipPlanButton data={sipPlanPdfData} />
              <button
                type="button"
                onClick={() => {
                  setImageDownloadError(null);
                  try {
                    const imageMonthlySip = mode === 'goal' ? goalRequiredMonthlySip : monthlySip;
                    downloadSvgResultImage({
                      modeLabel: activeModeLabel,
                      monthlySip: imageMonthlySip,
                      years: activeYears,
                      expectedReturn,
                      futureValue: activeProjection.futureValue,
                      planBadge: planQualityBadge.label,
                    });
                    trackToolEvent({
                      eventName: 'result_image_download',
                      page: '/tools/sip-calculator-india',
                      toolSlug: 'sip-calculator-india',
                      context: 'sip-result-image',
                    });
                  } catch {
                    setImageDownloadError('Could not download result image. Please try again.');
                  }
                }}
                className="inline-flex items-center rounded-full border border-brandNavy bg-white px-4 py-2 text-xs font-bold text-brandNavy transition hover:bg-brandNavy/10"
              >
                Download SIP Result Card
              </button>
            </div>
            {imageDownloadError ? <p className="mt-2 text-xs text-rose-700">{imageDownloadError}</p> : null}
          </div>
          <div className="mt-6">
            <p className="rounded-2xl bg-white/70 p-4 text-sm leading-6 text-brandMuted border border-brandBorder">
              Educational estimate only. RupeeKit does not provide financial, investment, legal, or tax advice.
            </p>
          </div>
        </div>
      </section>

      {mode === 'compare' ? (
        <section className="space-y-6">
          <BarComparison
            label="Comparison chart"
            leftLabel="Regular SIP future value"
            leftValue={regularResult.futureValue}
            rightLabel="Step-Up SIP future value"
            rightValue={stepUpResult.futureValue}
          />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-brandDeepNavy">Regular SIP vs Step-Up SIP</h3>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Metric</th>
                    <th className="px-4 py-3 text-right">Regular SIP</th>
                    <th className="px-4 py-3 text-right">Step-Up SIP</th>
                    <th className="px-4 py-3 text-right">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Total invested amount</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(regularResult.totalInvested)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(stepUpResult.totalInvested)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(stepUpResult.totalInvested - regularResult.totalInvested)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Estimated future value</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(regularResult.futureValue)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(stepUpResult.futureValue)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brandDeepNavy">
                      {formatCurrency(stepUpResult.futureValue - regularResult.futureValue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Estimated gains</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(regularResult.estimatedGains)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(stepUpResult.estimatedGains)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(stepUpResult.estimatedGains - regularResult.estimatedGains)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Extra estimated corpus from step-up</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                      {formatCurrency(stepUpResult.futureValue - regularResult.futureValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {mode === 'goal' ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brandDeepNavy">Ways to reach the same goal</h3>
          <p className="mt-2 text-sm text-slate-600">
            Compare different contribution styles for the same target corpus and timeline assumptions.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Regular monthly SIP</p>
              <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(goalRequiredMonthlySip)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SIP with 5% yearly step-up</p>
              <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(goalRequiredWithFiveStepUp)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SIP with 10% yearly step-up</p>
              <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(goalRequiredWithTenStepUp)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SIP with yearly top-up</p>
              <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(goalRequiredWithYearlyTopUp)}</p>
              <p className="mt-1 text-xs text-slate-500">+ yearly top-up {formatCurrency(yearlyTopUpAmount)}</p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Option</th>
                  <th className="px-4 py-3 text-right">Required monthly SIP</th>
                  <th className="px-4 py-3 text-right">Yearly top-up</th>
                  <th className="px-4 py-3">Use case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Regular SIP</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(goalRequiredMonthlySip)}</td>
                  <td className="px-4 py-3 text-right">Rs 0</td>
                  <td className="px-4 py-3">Simple fixed SIP discipline</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Step-up SIP (5%)</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(goalRequiredWithFiveStepUp)}</td>
                  <td className="px-4 py-3 text-right">Rs 0</td>
                  <td className="px-4 py-3">Gradual SIP increase each year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Step-up SIP (10%)</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(goalRequiredWithTenStepUp)}</td>
                  <td className="px-4 py-3 text-right">Rs 0</td>
                  <td className="px-4 py-3">Faster yearly SIP increments</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">Regular SIP + yearly top-up</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(goalRequiredWithYearlyTopUp)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(yearlyTopUpAmount)}</td>
                  <td className="px-4 py-3">Useful when yearly bonus/top-up is possible</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {mode !== 'goal' && scenarioRows.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-brandDeepNavy">What-if scenarios</h3>
          <p className="mt-2 text-sm text-slate-600">
            See how a 10% change in monthly SIP may change the estimated future value.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {scenarioRows.map((scenario) => (
              <div key={scenario.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{scenario.label}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(scenario.sipAmount)}</p>
                <div className="my-3 border-t border-dashed border-slate-200" />
                <p className="text-xs font-semibold text-slate-500">Estimated Future Value</p>
                <p className="mt-1 text-base font-black text-brandDeepNavy">{formatCurrency(scenario.futureValue)}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}


      <details className="tool-guide">
        <summary>Detailed breakdown</summary>
        <div className="space-y-6 pt-2">
<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">What if you delay SIP by 1 year?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Delay cost is an estimate based on the same assumed return and duration. It is not a guarantee.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Starting now</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(delayCost.startingNow)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Starting after 1 year</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(delayCost.startingAfterOneYear)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Estimated difference</p>
            <p className="mt-2 text-lg font-black text-emerald-800">{formatCurrency(delayCost.difference)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">What if you miss some SIPs?</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="Missed SIPs per year"
            unit="count"
            value={missedSipsPerYear}
            min={0}
            step={1}
            help="Set missed SIP frequency between 0 and 4 months per year."
            onChange={(value) => setMissedSipsPerYear(Math.min(4, Math.max(0, Math.round(value))))}
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">Catch-up preference</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCatchUpPreference('none')}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  catchUpPreference === 'none'
                    ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                No catch-up
              </button>
              <button
                type="button"
                onClick={() => setCatchUpPreference('equal')}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  catchUpPreference === 'equal'
                    ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                Catch up equally over next 12 months
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Perfect SIP future value</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(consistencyPerfectProjection.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Realistic value after misses</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(consistencySimulation.projection.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated impact</p>
            <p className="mt-2 text-lg font-black text-rose-700">{formatCurrency(consistencyImpact)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catch-up SIP amount</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">
              {catchUpPreference === 'equal' ? formatCurrency(consistencySimulation.catchUpMonthlyAmount) : 'Not applied'}
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          Missing SIPs can affect long-term projections. This is an educational estimate only.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">What if you pause SIP for a few months?</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="Pause duration"
            unit="months"
            value={pauseDurationMonths}
            min={0}
            step={1}
            help="Number of months SIP contributions are paused."
            onChange={(value) => setPauseDurationMonths(Math.max(0, Math.round(value)))}
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">Restart after pause</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRestartMode('same')}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  restartMode === 'same'
                    ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                Same SIP amount
              </button>
              <button
                type="button"
                onClick={() => setRestartMode('higher')}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  restartMode === 'higher'
                    ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                Higher SIP amount
              </button>
            </div>
          </div>
        </div>
        {restartMode === 'higher' ? (
          <div className="mt-4">
            <InputField
              label="Higher SIP amount after restart"
              unit="Rs"
              value={higherSipAfterPause}
              min={0}
              step={500}
              help="Optional higher SIP amount used after pause."
              onChange={setHigherSipAfterPause}
            />
          </div>
        ) : null}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Without pause</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(pauseWithoutPause.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">With pause</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(pauseWithRestart.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated difference</p>
            <p className="mt-2 text-lg font-black text-rose-700">{formatCurrency(pauseGap)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extra SIP to recover gap</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(pauseExtraRecoverySipNeeded)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">Use salary hike to increase SIP</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="Current monthly SIP"
            unit="Rs"
            value={salaryPlannerCurrentSip}
            min={0}
            step={500}
            help="No salary input required. Use only SIP value."
            onChange={setSalaryPlannerCurrentSip}
          />
          <InputField
            label="Duration"
            unit="years"
            value={salaryPlannerDurationYears}
            min={0.5}
            step={0.5}
            help="Planning duration for salary hike SIP scenario."
            onChange={setSalaryPlannerDurationYears}
          />
          <InputField
            label="Expected annual return"
            unit="%"
            value={salaryPlannerExpectedReturn}
            min={0}
            step={0.1}
            help="Educational return assumption."
            onChange={setSalaryPlannerExpectedReturn}
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">SIP increase model</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSalaryIncreaseMode('hike-share')}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  salaryIncreaseMode === 'hike-share'
                    ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                Percent from hike
              </button>
              <button
                type="button"
                onClick={() => setSalaryIncreaseMode('fixed')}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  salaryIncreaseMode === 'fixed'
                    ? 'border-brandNavy bg-brandNavy/10 text-brandNavy'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                Fixed yearly SIP increase
              </button>
            </div>
          </div>
        </div>
        {salaryIncreaseMode === 'hike-share' ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputField
              label="Expected annual income hike"
              unit="%"
              value={salaryHikePercent}
              min={0}
              step={0.5}
              help="Estimated yearly income hike percentage."
              onChange={setSalaryHikePercent}
            />
            <InputField
              label="Percent of hike allocated to SIP"
              unit="%"
              value={salaryHikeToSipPercent}
              min={0}
              step={1}
              help="Share of hike planned for SIP increase."
              onChange={setSalaryHikeToSipPercent}
            />
          </div>
        ) : (
          <div className="mt-4">
            <InputField
              label="Fixed yearly SIP increase"
              unit="Rs"
              value={salaryHikeFixedIncrement}
              min={0}
              step={100}
              help="Flat annual SIP increase amount."
              onChange={setSalaryHikeFixedIncrement}
            />
          </div>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Final-year monthly SIP</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(salaryHikePlan.finalYearSipAmount)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated future value</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(salaryHikePlan.projection.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extra corpus vs flat SIP</p>
            <p className="mt-2 text-lg font-black text-emerald-700">{formatCurrency(salaryHikeExtraCorpus)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">What if an EMI ends and you redirect part of it to SIP?</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InputField
            label="Current SIP"
            unit="Rs"
            value={redirectCurrentSip}
            min={0}
            step={500}
            help="Current monthly SIP amount."
            onChange={setRedirectCurrentSip}
          />
          <InputField
            label="EMI amount"
            unit="Rs"
            value={redirectEmiAmount}
            min={0}
            step={500}
            help="EMI amount that may end in the future."
            onChange={setRedirectEmiAmount}
          />
          <InputField
            label="EMI ends after"
            unit="months"
            value={redirectEmiEndsAfterMonths}
            min={0}
            step={1}
            help="Month count after which EMI is assumed to close."
            onChange={(value) => setRedirectEmiEndsAfterMonths(Math.max(0, Math.round(value)))}
          />
          <InputField
            label="Percent of EMI to redirect to SIP"
            unit="%"
            value={redirectPercent}
            min={0}
            step={1}
            help="Share of closed EMI planned for SIP increase."
            onChange={setRedirectPercent}
          />
          <InputField
            label="Duration"
            unit="years"
            value={redirectDurationYears}
            min={0.5}
            step={0.5}
            help="Planning duration for this redirect scenario."
            onChange={setRedirectDurationYears}
          />
          <InputField
            label="Expected annual return"
            unit="%"
            value={redirectExpectedReturn}
            min={0}
            step={0.1}
            help="Educational return assumption."
            onChange={setRedirectExpectedReturn}
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Without redirect</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(emiRedirectWithoutIncrease.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">With EMI redirect</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(emiRedirectWithIncrease.projection.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extra estimated corpus</p>
            <p className="mt-2 text-lg font-black text-emerald-700">{formatCurrency(emiRedirectExtraCorpus)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Month SIP increases from</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">
              Month {emiRedirectWithIncrease.increasedFromMonth}
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          This is a planning scenario only. Do not redirect money without considering emergency fund, debt terms, and
          household needs.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">SIP Mistake Detector</h3>
        {assumptionWarnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {assumptionWarnings.map((warning) => (
              <li key={warning.id} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                {warning.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            No high-risk assumption flag from the current input set.
          </p>
        )}
      </section>

      <InvestmentBreakdown invested={activeProjection.totalInvested} gains={activeProjection.estimatedGains} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">SIP milestone timeline</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Milestone</th>
                <th className="px-4 py-3 text-right">Total invested till then</th>
                <th className="px-4 py-3 text-right">Estimated value</th>
                <th className="px-4 py-3 text-right">Estimated gains</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestoneRows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.label}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.invested)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.value)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(row.gains)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">Breakpoint milestones</h3>
        <p className="mt-2 text-sm text-slate-600">
          Shows when the estimate may cross common corpus levels within your selected duration.
        </p>
        {breakpointRows.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Target level</th>
                  <th className="px-4 py-3">Reached around</th>
                  <th className="px-4 py-3 text-right">Invested at milestone</th>
                  <th className="px-4 py-3 text-right">Estimated value</th>
                  <th className="px-4 py-3 text-right">Estimated gains</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {breakpointRows.map((row) => (
                  <tr key={row.target}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(row.target)}</td>
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.invested)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.value)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.gains)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">No listed milestone target is reached within the selected duration.</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">Inflation-adjusted value</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated future value</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(inflationAdjusted.futureValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approx present-value equivalent</p>
            <p className="mt-2 text-lg font-black text-brandDeepNavy">{formatCurrency(inflationAdjusted.presentValue)}</p>
          </div>
        </div>
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          Present-value estimate shows what the future amount may roughly feel like in today&apos;s purchasing power,
          based on your inflation assumption.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">One-Year SIP Action Plan</h3>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-700">
          {oneYearActionPlan.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brandDeepNavy">SIP Review Checklist</h3>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
          {SIP_REVIEW_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
            </div>
      </details>
    </div>
  );
}
