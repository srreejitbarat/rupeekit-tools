'use client';

import type { ReactNode, SyntheticEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trackAnalyticsEvent, trackValidCalculation } from '@/lib/analytics';
import FinancialUpdatesSignup from '@/components/updates/FinancialUpdatesSignup';
import ContextualNextSteps from '@/components/ContextualNextSteps';
import { CalculatorResultContext } from '@/components/useCalculatorResult';

const UPDATE_ALERT_TOOL_SLUGS = new Set([
  '8th-pay-commission-salary-calculator-india',
  '8th-pay-commission-arrears-calculator-india',
  '8th-pay-commission-pension-calculator-india',
  'income-tax-calculator-old-vs-new-regime-india',
  'ppf-calculator-india',
  'sukanya-samriddhi-yojana-calculator-india',
  'scss-calculator-india',
  'post-office-monthly-income-scheme-calculator-india',
]);

const SHARE_PARAM_PREFIX = 'rk_';

type ShareableField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function getShareKey(field: ShareableField): string | null {
  const explicit = field.getAttribute('data-calculator-key');
  if (explicit) return explicit;
  if (field.name) return field.name;
  if (field.id?.startsWith('calculator-input-')) return field.id.slice('calculator-input-'.length);
  if (field.id) return field.id;
  return null;
}

function setNativeValue(field: ShareableField, value: string) {
  const prototype =
    field instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : field instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLTextAreaElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(field, value);
  else field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

const CALCULATION_DEBOUNCE_MS = 350;
const INPUT_RESULT_WINDOW_MS = 1_000;
const RESULT_MARKER = 'data-calculator-result';

export default function CalculatorAnalyticsBoundary({
  toolSlug,
  toolCategory,
  children,
  shareInputs = true,
  analyticsOnly = false,
}: {
  toolSlug: string;
  toolCategory: string;
  children: ReactNode;
  shareInputs?: boolean;
  analyticsOnly?: boolean;
}) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const calculatorRef = useRef<HTMLDivElement | null>(null);
  const restoringInputsRef = useRef(false);
  const mountedAtRef = useRef<number>(0);
  const calculationCountRef = useRef(0);
  const resultPanelViewedRef = useRef(false);
  const summarySentRef = useRef(false);
  const calculationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputAtRef = useRef<number | null>(null);
  const analyticsBase = useMemo(() => ({ tool_slug: toolSlug, tool_category: toolCategory }), [toolSlug, toolCategory]);

  useEffect(() => {
    mountedAtRef.current = performance.now();
  }, []);

  // Restores inputs from an `rk_`-prefixed share permalink before any
  // interaction is recorded, so a restored scenario is not counted as a
  // user-entered calculation.
  useEffect(() => {
    const root = calculatorRef.current;
    if (!root || typeof window === 'undefined' || !shareInputs || analyticsOnly) return;
    const params = new URLSearchParams(window.location.search);
    if (![...params.keys()].some((key) => key.startsWith(SHARE_PARAM_PREFIX))) return;

    const fields = root.querySelectorAll<ShareableField>('input, select, textarea');
    restoringInputsRef.current = true;
    try {
      fields.forEach((field) => {
        const key = getShareKey(field);
        if (!key) return;
        const raw = params.get(`${SHARE_PARAM_PREFIX}${key}`);
        if (raw === null) return;

        if (field instanceof HTMLInputElement && ['number', 'range'].includes(field.type)) {
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) return;
          const min = field.min === '' ? undefined : Number(field.min);
          const max = field.max === '' ? undefined : Number(field.max);
          let safe = parsed;
          if (Number.isFinite(min)) safe = Math.max(min as number, safe);
          if (Number.isFinite(max)) safe = Math.min(max as number, safe);
          setNativeValue(field, String(safe));
          return;
        }

        setNativeValue(field, raw);
      });
    } finally {
      restoringInputsRef.current = false;
    }
  }, [shareInputs, analyticsOnly]);

  const elapsedMs = useCallback(() => {
    if (!mountedAtRef.current) return 0;
    return Math.max(0, Math.round(performance.now() - mountedAtRef.current));
  }, []);

  const recordCalculation = useCallback(() => {
    calculationTimerRef.current = null;
    calculationCountRef.current += 1;
    setHasCalculated(true);
    const firstCalculation = calculationCountRef.current === 1;
    if (firstCalculation) {
      trackAnalyticsEvent('calculator_used', analyticsBase);
      trackAnalyticsEvent('result_viewed', analyticsBase);
    }
    trackValidCalculation({
      ...analyticsBase,
      time_to_first_calculation_ms: firstCalculation ? elapsedMs() : undefined,
    });
  }, [analyticsBase, elapsedMs]);

  const clearScheduledCalculation = useCallback(() => {
    if (calculationTimerRef.current === null) return;
    clearTimeout(calculationTimerRef.current);
    calculationTimerRef.current = null;
  }, []);

  const recordInput = (event: SyntheticEvent<HTMLElement>) => {
    if (restoringInputsRef.current) return;
    const target = event.target;
    if (target instanceof Element && target.hasAttribute('data-calculation-ignore')) {
      inputAtRef.current = null;
      return;
    }
    setHasInteracted(true);
    clearScheduledCalculation();
    if (target instanceof HTMLInputElement && target.type === 'number' &&
        (target.value === '' || target.validity.badInput || target.validity.rangeUnderflow || target.validity.rangeOverflow)) {
      inputAtRef.current = null;
      return;
    }
    inputAtRef.current = performance.now();
  };

  const markCalculationAction = (event: SyntheticEvent<HTMLElement>) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button?.hasAttribute('data-calculation-action')) recordInput(event);
    else inputAtRef.current = null;
  };

  const reportResult = useCallback((valid: boolean, submitted: boolean) => {
    if (restoringInputsRef.current) return;
    const inputAt = inputAtRef.current;
    inputAtRef.current = null;
    if (!submitted && (inputAt === null || performance.now() - inputAt > INPUT_RESULT_WINDOW_MS)) return;

    setHasInteracted(true);
    clearScheduledCalculation();
    if (!valid) return;
    if (submitted) recordCalculation();
    else calculationTimerRef.current = setTimeout(recordCalculation, CALCULATION_DEBOUNCE_MS);
  }, [clearScheduledCalculation, recordCalculation]);

  useEffect(() => {
    const calculator = calculatorRef.current;
    if (!hasCalculated || resultPanelViewedRef.current || !calculator) return;

    const labelledResults = calculator.querySelector<HTMLElement>(`[${RESULT_MARKER}]`) ??
      calculator.querySelector<HTMLElement>('[aria-label="Estimated results"]');
    const resultsHeading = Array.from(calculator.querySelectorAll<HTMLElement>('h2, h3')).find((node) =>
      node.textContent?.trim().toLowerCase().includes('estimated results')
    );
    const resultPanel = labelledResults ?? resultsHeading?.parentElement ?? null;
    if (!resultPanel) return;

    const markResultViewed = () => {
      if (resultPanelViewedRef.current) return;
      resultPanelViewedRef.current = true;
      trackAnalyticsEvent('result_panel_viewed', {
        ...analyticsBase,
        calculation_number: Math.max(calculationCountRef.current, 1),
      });
    };

    if (typeof IntersectionObserver === 'undefined') {
      const rect = resultPanel.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) markResultViewed();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25)) {
          markResultViewed();
          observer.disconnect();
        }
      },
      { threshold: [0.25] }
    );
    observer.observe(resultPanel);
    return () => observer.disconnect();
  }, [analyticsBase, hasCalculated]);

  useEffect(() => {
    const finishSession = (reason: 'pagehide' | 'unmount') => {
      if (summarySentRef.current) return;
      summarySentRef.current = true;
      clearScheduledCalculation();

      const engagementTime = elapsedMs();
      if (calculationCountRef.current === 0) {
        trackAnalyticsEvent('calculator_abandoned', {
          ...analyticsBase,
          engagement_time_msec: engagementTime,
          reason,
        });
        return;
      }

      trackAnalyticsEvent('calculator_session_summary', {
        ...analyticsBase,
        calculations: calculationCountRef.current,
        recalculations: Math.max(calculationCountRef.current - 1, 0),
        result_panel_viewed: resultPanelViewedRef.current,
        engagement_time_msec: engagementTime,
      });
    };

    const onPageHide = () => finishSession('pagehide');
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      finishSession('unmount');
    };
  }, [analyticsBase, clearScheduledCalculation, elapsedMs]);

  const showUpdateSignup = hasInteracted && UPDATE_ALERT_TOOL_SLUGS.has(toolSlug);

  const buildPermalink = () => {
    const root = calculatorRef.current;
    if (!root || typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';

    if (!shareInputs) return url.toString();

    const fields = root.querySelectorAll<ShareableField>('input, select, textarea');
    fields.forEach((field) => {
      const key = getShareKey(field);
      if (!key || field.value === '') return;
      url.searchParams.set(`${SHARE_PARAM_PREFIX}${key}`, field.value);
    });
    return url.toString();
  };

  const shareResult = async () => {
    const permalink = buildPermalink();
    if (!permalink) return;
    const shareData = {
      title: 'RupeeKit calculator result',
      text: shareInputs ? 'Open this RupeeKit calculator with the same input values.' : 'Explore this RupeeKit planning calculator.',
      url: permalink,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        trackAnalyticsEvent('result_shared', { ...analyticsBase, share_method: 'native_share' });
        setShareStatus('Share link ready.');
        return;
      } catch {
        // User cancellation or unsupported share target falls back to copying the link.
      }
    }

    try {
      await navigator.clipboard.writeText(permalink);
      trackAnalyticsEvent('result_shared', { ...analyticsBase, share_method: 'copy_link' });
      setShareStatus(shareInputs ? 'Permalink copied. It restores these calculator inputs.' : 'Calculator link copied. Your financial inputs are not included.');
    } catch {
      setShareStatus('Could not copy automatically. Use your browser address bar to copy this scenario URL.');
      window.history.replaceState({}, '', permalink);
    }
  };

  const calculator = (
    <div
      ref={calculatorRef}
      onChangeCapture={recordInput}
      onInputCapture={recordInput}
      onClickCapture={markCalculationAction}
    >
      <CalculatorResultContext.Provider value={reportResult}>{children}</CalculatorResultContext.Provider>
    </div>
  );

  if (analyticsOnly) return calculator;

  return (
    <div>
      {calculator}
      <ContextualNextSteps toolSlug={toolSlug} toolCategory={toolCategory} visible={hasCalculated} />
      {showUpdateSignup ? (
        <div className="mt-6">
          <FinancialUpdatesSignup placement="calculator_result" context={toolSlug} />
        </div>
      ) : null}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">{shareInputs ? 'Share this calculator scenario' : 'Share this planning calculator'}</p>
            {shareInputs ? null : (
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Share a link to the calculator. Use the PDF or CSV above when you want to share your actual plan and input snapshot.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={shareResult}
            className="rounded-xl border border-brandNavy bg-white px-4 py-2 text-sm font-semibold text-brandNavy transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brandNavy/20"
          >
            {shareInputs ? 'Share result link' : 'Copy calculator link'}
          </button>
        </div>
        {shareStatus ? <p className="mt-3 text-xs font-medium text-slate-700" role="status">{shareStatus}</p> : null}
      </div>
    </div>
  );
}
