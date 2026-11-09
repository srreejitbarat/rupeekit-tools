export type CalculatorAnalyticsBase = {
  tool_slug: string;
  tool_category: string;
};

type NewsletterAnalyticsBase = {
  placement: 'financial_update' | 'calculator_result' | 'provider_confirmation';
  context: string;
};

export type AnalyticsEventMap = {
  language_selected: {
    language: 'en' | 'hi' | 'bn';
    previous_language: 'en' | 'hi' | 'bn';
    page_path: string;
    fallback: boolean;
  };
  calculator_used: CalculatorAnalyticsBase;
  result_viewed: CalculatorAnalyticsBase;
  valid_calculation: CalculatorAnalyticsBase & {
    time_to_first_calculation_ms?: number;
  };
  result_panel_viewed: CalculatorAnalyticsBase & {
    calculation_number: number;
  };
  calculator_session_summary: CalculatorAnalyticsBase & {
    calculations: number;
    recalculations: number;
    result_panel_viewed: boolean;
    engagement_time_msec: number;
  };
  calculator_abandoned: CalculatorAnalyticsBase & {
    engagement_time_msec: number;
    reason: 'pagehide' | 'hidden' | 'unmount';
  };
  result_shared: CalculatorAnalyticsBase & {
    share_method: 'copy_link' | 'native_share';
  };
  guide_click: CalculatorAnalyticsBase & {
    destination: string;
  };
  tool_cta_click: CalculatorAnalyticsBase & {
    destination: string;
    cta_type: 'related_tool' | 'resource' | 'contextual_next_step';
  };
  affiliate_click: {
    broker: 'zerodha' | 'upstox' | 'angel_one';
    placement: 'comparison_card';
    page_path: string;
  };
  newsletter_form_viewed: NewsletterAnalyticsBase;
  newsletter_form_submitted: NewsletterAnalyticsBase;
  newsletter_confirmed: NewsletterAnalyticsBase;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type GtagParameters = Record<string, string | number | boolean>;

const SESSION_LOOKUP_TIMEOUT_MS = 2_500;
const SESSION_LOCK_TIMEOUT_MS = 1_000;
const SESSION_MARKER_PREFIX = 'rupeekit-valid-calculation-session';
let pendingSessionLookup: Promise<number | null> | null = null;
let lastSentSession = 0;

function sendGtagEvent(eventName: string, parameters: GtagParameters): boolean {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false;
  window.gtag('event', eventName, parameters);
  return true;
}

export function trackAnalyticsEvent<EventName extends Exclude<keyof AnalyticsEventMap, 'valid_calculation'>>(
  eventName: EventName,
  parameters: AnalyticsEventMap[EventName]
): boolean {
  return sendGtagEvent(eventName, parameters);
}

function parseSessionId(value: unknown): number | null {
  const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0 ? id : null;
}

function getGaSessionId(gtag: NonNullable<Window['gtag']>, gaId: string): Promise<number | null> {
  pendingSessionLookup ??= new Promise<number | null>((resolve) => {
    const timeout = setTimeout(() => resolve(null), SESSION_LOOKUP_TIMEOUT_MS);
    try {
      gtag('get', gaId, 'session_id', (value: unknown) => {
        clearTimeout(timeout);
        resolve(parseSessionId(value));
      });
    } catch {
      clearTimeout(timeout);
      resolve(null);
    }
  }).finally(() => { pendingSessionLookup = null; });

  return pendingSessionLookup;
}

function sendFirstCalculation(sessionId: number, markerKey: string, parameters: GtagParameters): boolean {
  if (lastSentSession >= sessionId) return false;

  let storage: Storage | undefined;
  try {
    storage = window.localStorage;
    const storedSession = parseSessionId(storage.getItem(markerKey));
    // GA4 session IDs are start timestamps. A late callback must not replace a newer marker.
    if (storedSession !== null && storedSession >= sessionId) {
      lastSentSession = storedSession;
      return false;
    }
  } catch {
    // Some browsers block storage. The in-page marker still applies.
  }

  try {
    if (!sendGtagEvent('valid_calculation', parameters)) return false;
  } catch {
    return false;
  }
  lastSentSession = sessionId;
  try {
    storage?.setItem(markerKey, String(sessionId));
  } catch {
    // Keep the in-page marker when writing persistent storage fails.
  }
  return true;
}

export async function trackValidCalculation({
  tool_slug,
  tool_category,
  time_to_first_calculation_ms,
}: AnalyticsEventMap['valid_calculation']): Promise<boolean> {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId || typeof window === 'undefined' || typeof window.gtag !== 'function') return false;

  const { origin, pathname } = window.location;
  const parameters = {
    tool_slug,
    tool_category,
    page_location: `${origin}${pathname}`,
    page_title: document.title,
    page_referrer: document.referrer.split(/[?#]/, 1)[0],
    ...(time_to_first_calculation_ms === undefined ? {} : { time_to_first_calculation_ms }),
  };

  const sessionId = await getGaSessionId(window.gtag, gaId);
  if (sessionId === null) return false;

  const markerKey = `${SESSION_MARKER_PREFIX}:${gaId}`;
  const send = () => sendFirstCalculation(sessionId, markerKey, parameters);
  const locks = window.navigator?.locks;
  if (!locks) return send();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SESSION_LOCK_TIMEOUT_MS);
  try {
    return await locks.request(markerKey, { signal: controller.signal }, send);
  } catch {
    // A rejected lock must not race another tab's check and send.
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export function trackPageView(pathname: string): boolean {
  // Calculator share URLs can contain user-entered values in the query string.
  // Never send those values to analytics; page reporting is intentionally path-only.
  const pageLocation =
    typeof window !== 'undefined' && window.location
      ? `${window.location.origin}${pathname}`
      : pathname;
  const pageTitle = typeof document !== 'undefined' ? document.title : '';

  return sendGtagEvent('page_view', {
    page_path: pathname,
    page_location: pageLocation,
    page_title: pageTitle,
  });
}

export function trackUserEngagement(pathname: string, engagementTimeMs: number): boolean {
  if (!Number.isFinite(engagementTimeMs) || engagementTimeMs < 100) return false;

  return sendGtagEvent('user_engagement', {
    page_path: pathname,
    engagement_time_msec: Math.min(Math.round(engagementTimeMs), 3_600_000),
  });
}
