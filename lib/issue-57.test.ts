import { afterEach, describe, expect, it, vi } from 'vitest';
import { blogPosts } from '../data/all-blog-posts';
import { discoverImages } from '../data/discover-images';
import { trackAnalyticsEvent } from './analytics';
import { getLiveTools } from './tools';

const consolidatedBlogSlugs = [
  'home-loan-eligibility-25000-salary-india',
  'home-loan-eligibility-40000-salary-india',
  'home-loan-eligibility-45000-salary-india',
];

describe('issue #57 consolidation and discovery', () => {
  it('excludes redirected pages from sitemap source collections', () => {
    const blogSlugs = new Set(blogPosts.map((post) => post.slug));
    const toolSlugs = new Set(getLiveTools().map((tool) => tool.slug));
    const discoverPaths = new Set(discoverImages.map((image) => image.path));

    for (const slug of consolidatedBlogSlugs) {
      expect(blogSlugs.has(slug)).toBe(false);
      expect(discoverPaths.has(`/blog/${slug}`)).toBe(false);
    }
    expect(toolSlugs.has('net-worth-tracker-calculator-india')).toBe(false);
  });

  it('keeps priority calculator destinations indexable', () => {
    const toolSlugs = new Set(getLiveTools().map((tool) => tool.slug));

    for (const slug of [
      'net-worth-calculator-india',
      'loan-foreclosure-net-savings-calculator-india',
      'personal-loan-true-apr-calculator-india',
      'reduce-emi-vs-tenure-calculator-india',
      'home-affordability-calculator-india',
    ]) {
      expect(toolSlugs.has(slug), `${slug} should be indexable`).toBe(true);
    }
  });
});

describe('GA4 calculator events', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not throw when gtag is unavailable', () => {
    vi.stubGlobal('window', {});
    expect(
      trackAnalyticsEvent('calculator_used', {
        tool_slug: 'sip-calculator-india',
        tool_category: 'Investing',
      })
    ).toBe(false);
  });

  it('sends typed event names and parameters to gtag', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    expect(
      trackAnalyticsEvent('tool_cta_click', {
        tool_slug: 'sip-calculator-india',
        tool_category: 'Investing',
        destination: '/tools/step-up-sip-calculator-india',
        cta_type: 'related_tool',
      })
    ).toBe(true);
    expect(gtag).toHaveBeenCalledWith('event', 'tool_cta_click', {
      tool_slug: 'sip-calculator-india',
      tool_category: 'Investing',
      destination: '/tools/step-up-sip-calculator-india',
      cta_type: 'related_tool',
    });
  });
});
