import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackAnalyticsEvent, trackPageView, trackUserEngagement } from './analytics';

describe('issue #63 analytics plumbing', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps calculator events safe when gtag is blocked', () => {
    vi.stubGlobal('window', {});
    expect(trackAnalyticsEvent('result_viewed', { tool_slug: 'term-life-insurance-cover-calculator-india', tool_category: 'Insurance' })).toBe(false);
  });

  it('sends explicit route page views', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag, location: { origin: 'https://www.rupeekit.co.in', search: '' } });
    vi.stubGlobal('document', { title: 'RupeeKit calculator' });
    expect(trackPageView('/tools/sip-calculator-india')).toBe(true);
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/tools/sip-calculator-india',
      page_location: 'https://www.rupeekit.co.in/tools/sip-calculator-india',
      page_title: 'RupeeKit calculator',
    });
  });

  it('sends non-zero engagement time without financial inputs', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    expect(trackUserEngagement('/tools/sip-calculator-india', 6250)).toBe(true);
    expect(gtag).toHaveBeenCalledWith('event', 'user_engagement', {
      page_path: '/tools/sip-calculator-india', engagement_time_msec: 6250,
    });
  });

  it('drops invalid or trivial engagement intervals', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    expect(trackUserEngagement('/tools/sip-calculator-india', Number.NaN)).toBe(false);
    expect(trackUserEngagement('/tools/sip-calculator-india', 99)).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });
});
