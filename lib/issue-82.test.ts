import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackAnalyticsEvent } from './analytics';

describe('issue #82 calculator journey analytics', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('records time to first calculation without financial values', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    expect(trackAnalyticsEvent('calculation_completed', {
      tool_slug: 'personal-loan-emi-calculator-india',
      tool_category: 'Loans',
      calculation_number: 1,
      time_to_first_calculation_ms: 4200,
    })).toBe(true);

    expect(gtag).toHaveBeenCalledWith('event', 'calculation_completed', {
      tool_slug: 'personal-loan-emi-calculator-india',
      tool_category: 'Loans',
      calculation_number: 1,
      time_to_first_calculation_ms: 4200,
    });
  });

  it('records a compact session summary with recalculation count and result visibility', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    trackAnalyticsEvent('calculator_session_summary', {
      tool_slug: 'sip-calculator-india',
      tool_category: 'Investments',
      calculations: 3,
      recalculations: 2,
      result_panel_viewed: true,
      engagement_time_msec: 18000,
    });

    expect(gtag).toHaveBeenCalledWith('event', 'calculator_session_summary', {
      tool_slug: 'sip-calculator-india',
      tool_category: 'Investments',
      calculations: 3,
      recalculations: 2,
      result_panel_viewed: true,
      engagement_time_msec: 18000,
    });
  });

  it('records abandonment before a calculation without PII', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    trackAnalyticsEvent('calculator_abandoned', {
      tool_slug: 'income-tax-calculator-old-vs-new-regime-india',
      tool_category: 'Tax',
      engagement_time_msec: 3100,
      reason: 'pagehide',
    });

    const payload = gtag.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('salary');
    expect(payload).not.toHaveProperty('income');
    expect(payload).not.toHaveProperty('tax');
    expect(payload).not.toHaveProperty('email');
  });
});
