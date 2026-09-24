'use client';

import type { ReactNode, SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';
import FinancialUpdatesSignup from '@/components/updates/FinancialUpdatesSignup';
import ContextualNextSteps from '@/components/ContextualNextSteps';

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

export default function CalculatorAnalyticsBoundary({
  toolSlug,
  toolCategory,
  children,
  shareInputs = true,
}: {
  toolSlug: string;
  toolCategory: string;
  children: ReactNode;
  shareInputs?: boolean;
}) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mountedAtRef = useRef<number>(0);
  const calculationCountRef = useRef(0);
  const resultPanelViewedRef = useRef(false);
  const summarySentRef = useRef(false);
  const calculationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedAtRef.current = performance.now();
  }, []);

  // Restores inputs from an `rk_`-prefixed share permalink before any
  // interaction is recorded, so a restored scenario is not counted as a
  // user-entered calculation.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined' || !shareInputs) return;
    const params = new URLSearchParams(window.location.search);
    if (![...params.keys()].some((key) => key.startsWith(SHARE_PARAM_PREFIX))) return;

    const fields = root.querySelectorAll<ShareableField>('input, select, textarea');
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
  }, [shareInputs]);

  const elapsedMs = () => {
    if (!mountedAtRef.current) return 0;
    return Math.max(0, Math.round(performance.now() - mountedAtRef.current));
  };

  const baseParameters = () => ({ tool_slug: toolSlug, tool_category: toolCategory });

  const recordCalculation = () => {
    calculationCountRef.current += 1;
    setHasCalculated(true);
    const calculationNumber = calculationCountRef.current;
    const parameters = baseParameters();

    if (calculationNumber === 1) {
      trackAnalyticsEvent('calculator_used', parameters);
      trackAnalyticsEvent('result_viewed', parameters);
      trackAnalyticsEvent('calculation_completed', {
        ...parameters,
        calculation_number: calculationNumber,
        time_to_first_calculation_ms: elapsedMs(),
      });
      return;
    }

    trackAnalyticsEvent('calculation_completed', {
      ...parameters,
      calculation_number: calculationNumber,
    });
  };

  const scheduleCalculation = () => {
    setHasInteracted(true);
    if (calculationTimerRef.current) clearTimeout(calculationTimerRef.current);
    calculationTimerRef.current = setTimeout(recordCalculation, CALCULATION_DEBOUNCE_MS);
  };

  const markButtonUse = (event: SyntheticEvent<HTMLElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest('button')) scheduleCalculation();
  };

  useEffect(() => {
    if (!hasInteracted || resultPanelViewedRef.current || !rootRef.current) return;

    const labelledResults = rootRef.current.querySelector<HTMLElement>('[aria-label="Estimated results"]');
    const resultsHeading = Array.from(rootRef.current.querySelectorAll<HTMLElement>('h2, h3')).find((node) =>
      node.textContent?.trim().toLowerCase().includes('estimated results')
    );
    const resultPanel = labelledResults ?? resultsHeading?.parentElement ?? null;
    if (!resultPanel) return;

    const markResultViewed = () => {
      if (resultPanelViewedRef.current) return;
      resultPanelViewedRef.current = true;
      trackAnalyticsEvent('result_panel_viewed', {
        ...baseParameters(),
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
  }, [hasInteracted, toolCategory, toolSlug]);

  useEffect(() => {
    const finishSession = (reason: 'pagehide' | 'unmount') => {
      if (summarySentRef.current) return;
      summarySentRef.current = true;
      if (calculationTimerRef.current) {
        clearTimeout(calculationTimerRef.current);
        calculationTimerRef.current = null;
      }

      const engagementTime = elapsedMs();
      const parameters = baseParameters();
      if (calculationCountRef.current === 0) {
        trackAnalyticsEvent('calculator_abandoned', {
          ...parameters,
          engagement_time_msec: engagementTime,
          reason,
        });
        return;
      }

      trackAnalyticsEvent('calculator_session_summary', {
        ...parameters,
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
  }, [toolCategory, toolSlug]);

  const showUpdateSignup = hasInteracted && UPDATE_ALERT_TOOL_SLUGS.has(toolSlug);

  const buildPermalink = () => {
    const root = rootRef.current;
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
    const analyticsBase = baseParameters();
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

  return (
    <div
      ref={rootRef}
      onChangeCapture={scheduleCalculation}
      onInputCapture={scheduleCalculation}
      onClickCapture={markButtonUse}
    >
      {children}
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
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {shareInputs ? 'Copy a permalink that restores the current inputs. Shared parameter URLs are kept out of search indexing and canonicalize to the base calculator.' : 'Share a link to the calculator. Use the PDF or CSV above when you want to share your actual plan and input snapshot.'}
            </p>
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
        <p className="mt-2 text-[11px] leading-4 text-slate-500">
          {shareInputs ? 'The link contains only the values you explicitly entered. RupeeKit does not send those values as analytics event parameters.' : 'This planner keeps financial inputs out of share URLs and analytics event parameters.'}
        </p>
      </div>
    </div>
  );
}
