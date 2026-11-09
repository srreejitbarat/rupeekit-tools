import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackAnalyticsEvent, trackValidCalculation } from './analytics';

describe('issue #82 calculator journey analytics', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('records a valid calculation without inputs or share URL parameters', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', {
      gtag,
      location: new URL('https://www.rupeekit.co.in/tools/emi-calculator-india?rk_principal=123456#result'),
    });
    vi.stubGlobal('document', { referrer: 'https://www.rupeekit.co.in/tools?rk_salary=99999' });

    const calculation = {
      tool_slug: 'personal-loan-emi-calculator-india',
      tool_category: 'Loans',
      time_to_first_calculation_ms: 4200,
      principal: 123456,
    };
    expect(trackValidCalculation(calculation)).toBe(true);

    expect(gtag).toHaveBeenCalledWith('event', 'valid_calculation', {
      tool_slug: 'personal-loan-emi-calculator-india',
      tool_category: 'Loans',
      page_location: 'https://www.rupeekit.co.in/tools/emi-calculator-india',
      page_referrer: 'https://www.rupeekit.co.in/tools',
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
