import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('issue #87 monetisation readiness', () => {
  it('keeps commercial facts freshly verified and corrects the known broker-pricing errors', () => {
    const card = readFileSync('components/blog/BrokerComparisonCard.tsx', 'utf8');

    expect(card).toContain("BROKER_CHARGES_LAST_VERIFIED = '3 September 2026'");
    expect(card).toContain("delivery: 'Rs 0 brokerage for resident individual delivery trades'");
    expect(card).toContain("nri: 'NRI trading and demat accounts available; separate pricing and eligibility apply'");
    expect(card).toContain("delivery: 'Rs 20 per executed order'");
    expect(card).toContain("intraday: 'Rs 20 or 0.1%/order (lower)'");
    expect(card).toContain("delivery: 'After intro offer: Rs 20 or 0.1%/order (lower; Rs 5 minimum)'");
    expect(card).toContain("intraday: 'After intro offer: Rs 20 or 0.1%/order (lower; Rs 5 minimum)'");
    expect(card).toContain("amc: 'First year Rs 0; then non-BSDA Rs 60 + GST/quarter'");
  });

  it('requires disclosure before partner links and forbids payout-based ordering', () => {
    const card = readFileSync('components/blog/BrokerComparisonCard.tsx', 'utf8');
    const disclosure = card.indexOf('Commercial disclosure before partner links');
    const firstPartnerLink = card.indexOf('rel="noopener noreferrer sponsored"');

    expect(disclosure).toBeGreaterThan(-1);
    expect(firstPartnerLink).toBeGreaterThan(disclosure);
    expect(card).toContain('does not order recommendations by payout');
  });

  it('tracks broker affiliate clicks without collecting financial or identity data', () => {
    const analytics = readFileSync('lib/analytics.ts', 'utf8');
    const card = readFileSync('components/blog/BrokerComparisonCard.tsx', 'utf8');

    expect(analytics).toContain('affiliate_click');
    expect(analytics).toContain("broker: 'zerodha' | 'upstox' | 'angel_one'");
    expect(analytics).toContain("placement: 'comparison_card'");
    expect(analytics).toContain('page_path: string');
    expect(card).toContain("trackAnalyticsEvent('affiliate_click'");
    expect(card).toContain("page_path: BROKER_COMPARISON_PAGE");
    expect(card).toContain('RupeeKit never collects your PAN, Aadhaar, bank details or KYC documents');
  });

  it('applies the September CTR and decision-intent override to the commercial broker page', () => {
    const override = readFileSync('data/broker-comparison-override-2026-09-08.ts', 'utf8');
    const allPosts = readFileSync('data/all-blog-posts.ts', 'utf8');

    expect(override).toContain("seoTitle: 'Zerodha vs Upstox vs Angel One 2026: Which Is Best?'");
    expect(override).toContain("modifiedDateISO: '2026-09-08'");
    expect(override).toContain('Charges last verified 3 September 2026');
    expect(override).toMatch(/all three have NRI account options/i);
    expect(override).not.toContain('which Zerodha and Upstox do not offer');
    expect(allPosts).toContain('BROKER_COMPARISON_SLUG');
    expect(allPosts).toContain('{ ...mergedPost, ...brokerComparisonOverride }');
  });

  it('keeps the future commercial slot disabled by default and reserves space when enabled', () => {
    const slot = readFileSync('components/monetization/ReservedCommercialSlot.tsx', 'utf8');
    expect(slot).toContain('enabled = false');
    expect(slot).toContain('if (!enabled) return null');
    expect(slot).toContain('min-h-[180px]');
    expect(slot).toContain('data-commercial-slot="reserved"');
  });

  it('records a no-monetisation-yet decision, thresholds and review cadence', () => {
    const readiness = readFileSync('docs/monetisation-readiness-2026-09-03.md', 'utf8');
    const policy = readFileSync('docs/commercial-editorial-policy.md', 'utf8');

    expect(readiness).toContain('5,000 organic sessions/month');
    expect(readiness).toContain('500 sessions/month on commercial-intent');
    expect(readiness).toContain('50,000 sessions/month');
    expect(readiness).toContain('No ad network, sponsored unit, tracking pixel, or new commercial placement');
    expect(readiness).toContain('3 October 2026');

    expect(policy).toContain('Recommendations are never ordered by commission');
    expect(policy).toContain('primary source');
    expect(policy).toContain('verification date');
    expect(policy).toContain('every 30 days');
    expect(policy).toContain('fabricate ratings, reviews, testimonials, or review schema');
  });
});
