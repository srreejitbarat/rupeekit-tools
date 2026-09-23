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
    language: 'en' | 'hi';
    previous_language: 'en' | 'hi';
    page_path: string;
    fallback: boolean;
  };
  calculator_used: CalculatorAnalyticsBase;
  result_viewed: CalculatorAnalyticsBase;
  calculation_completed: CalculatorAnalyticsBase & {
    calculation_number: number;
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

function sendGtagEvent(eventName: string, parameters: GtagParameters): boolean {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false;
  window.gtag('event', eventName, parameters);
  return true;
}

export function trackAnalyticsEvent<EventName extends keyof AnalyticsEventMap>(
  eventName: EventName,
  parameters: AnalyticsEventMap[EventName]
): boolean {
  return sendGtagEvent(eventName, parameters);
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
