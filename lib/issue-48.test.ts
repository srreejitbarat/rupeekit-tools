import { describe, expect, it } from 'vitest';
import { blogPosts } from '../data/all-blog-posts';
import retiredPages from '../data/retired-pages.json';
import { getLiveTools } from './tools';

// Issue #48 shipped six Day 7 comparison posts plus a weekly hub. The AdSense
// low-value-content review later retired all six as generic, figure-free
// frameworks; each now redirects to the kept page that covers the same need.
const DAY7_SLUGS = [
  'epf-vs-nps-vs-ppf-retirement-india',
  'cashback-vs-rewards-credit-cards-india',
  'salary-hike-negotiation-beyond-base-pay-india',
  'robo-advisors-vs-diy-index-investing-india',
  'gold-asset-class-sgb-etf-physical-gold-loan-india-2026',
  'fy-2026-27-money-moves-salaried-indians-mid-year-checklist',
] as const;

const DAY4_SLUGS = [
  'section-44ada-presumptive-taxation-freelancers-india',
  'tds-fixed-deposit-interest-form-15g-15h-india',
  'itr-late-filing-penalty-interest-india-fy-2026-27',
  'gst-small-business-freelancers-registration-composition-india',
  'nri-taxation-basics-residency-taxable-income-india',
] as const;

const redirects = retiredPages as Record<string, string>;

describe('issue #48 day 7 comparison guides', () => {
  it('no longer publishes the retired Day 7 posts', () => {
    const published = new Set(blogPosts.map((post) => post.slug));
    for (const slug of DAY7_SLUGS) {
      expect(published.has(slug), `${slug} should be retired`).toBe(false);
    }
  });

  it('redirects every retired Day 7 post to a published page', () => {
    const publishedPaths = new Set([
      '/blog',
      ...blogPosts.map((post) => `/blog/${post.slug}`),
      ...getLiveTools().map((tool) => `/tools/${tool.slug}`),
    ]);
    for (const slug of DAY7_SLUGS) {
      const destination = redirects[`/blog/${slug}`];
      expect(destination, `${slug} needs a redirect`).toBeDefined();
      expect(publishedPaths.has(destination), `${slug} -> ${destination}`).toBe(true);
    }
  });

  it('keeps the substantive Day 4 compliance posts registered', () => {
    const registered = new Set(blogPosts.map((post) => post.slug));
    for (const slug of DAY4_SLUGS) {
      expect(registered.has(slug), `${slug} should be registered`).toBe(true);
    }
  });
});
