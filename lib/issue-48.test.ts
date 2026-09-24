import { describe, expect, it } from 'vitest';
import { blogPosts } from '../data/all-blog-posts';
import { day7ComparisonBlogPosts } from '../data/day7-comparison-blog-posts';
import { getLiveTools } from './tools';

const DAY7_SLUGS = [
  'epf-vs-nps-vs-ppf-retirement-india',
  'cashback-vs-rewards-credit-cards-india',
  'salary-hike-negotiation-beyond-base-pay-india',
  'robo-advisors-vs-diy-index-investing-india',
  'gold-asset-class-sgb-etf-physical-gold-loan-india-2026',
  'fy-2026-27-money-moves-salaried-indians-mid-year-checklist',
] as const;

const WEEK_TOOL_SLUGS = [
  'term-life-insurance-cover-calculator-india',
  'health-insurance-coverage-adequacy-calculator-india',
  'car-loan-emi-affordability-calculator-india',
  'two-wheeler-loan-emi-calculator-india',
  'credit-card-minimum-due-trap-calculator-india',
  'credit-card-vs-personal-loan-calculator-india',
  'sovereign-gold-bond-vs-physical-gold-calculator-india',
  'index-fund-vs-active-fund-cost-calculator-india',
  'elss-lock-in-vs-80c-options-calculator-india',
  'nps-tier-2-vs-mutual-fund-calculator-india',
  'xirr-portfolio-return-calculator-india',
  'rule-of-72-calculator-india',
  'ops-vs-nps-pension-comparison-calculator-india',
  'scss-calculator-india',
  'post-office-monthly-income-scheme-calculator-india',
  'child-education-cost-planner-india',
  'wedding-cost-planner-india',
  'rent-agreement-stamp-duty-registration-cost-calculator-india',
] as const;

const DAY4_SLUGS = [
  'section-44ada-presumptive-taxation-freelancers-india',
  'tds-fixed-deposit-interest-form-15g-15h-india',
  'itr-late-filing-penalty-interest-india-fy-2026-27',
  'gst-small-business-freelancers-registration-composition-india',
  'nri-taxation-basics-residency-taxable-income-india',
  'capital-gains-tax-changes-2026-equity-investors-india',
] as const;

describe('issue #48 day 7 comparison guides', () => {
  it('registers all six long-form posts with answer-first structure', () => {
    const registered = new Set(blogPosts.map((post) => post.slug));

    expect(day7ComparisonBlogPosts).toHaveLength(6);
    for (const post of day7ComparisonBlogPosts) {
      expect(DAY7_SLUGS).toContain(post.slug);
      expect(registered.has(post.slug), `${post.slug} should be registered`).toBe(true);
      expect(post.quickAnswer?.question.length).toBeGreaterThan(10);
      expect(post.answerEngineSummary?.length).toBeGreaterThan(80);
      expect(post.sections.length).toBeGreaterThanOrEqual(5);
      expect(post.faqs.length).toBeGreaterThanOrEqual(2);
      expect(post.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });

  it('keeps every related calculator link resolvable to a live tool', () => {
    const liveToolSlugs = new Set(getLiveTools().map((tool) => tool.slug));

    for (const post of day7ComparisonBlogPosts) {
      for (const slug of post.relatedCalculators) {
        expect(liveToolSlugs.has(slug), `${post.slug} links missing tool ${slug}`).toBe(true);
      }
    }
  });

  it('uses the weekly hub to give all 18 new calculators an inbound path', () => {
    const hub = day7ComparisonBlogPosts.find(
      (post) => post.slug === 'fy-2026-27-money-moves-salaried-indians-mid-year-checklist'
    );

    expect(hub).toBeDefined();
    const related = new Set(hub?.relatedCalculators ?? []);
    for (const slug of WEEK_TOOL_SLUGS) {
      expect(related.has(slug), `weekly hub should link ${slug}`).toBe(true);
    }
  });

  it('links the hub to the other Day 7 guides and all Day 4 compliance posts', () => {
    const registeredBlogs = new Set(blogPosts.map((post) => post.slug));
    const hub = day7ComparisonBlogPosts.find(
      (post) => post.slug === 'fy-2026-27-money-moves-salaried-indians-mid-year-checklist'
    );
    const quickLinks = new Set((hub?.quickAnswer?.links ?? []).map((link) => link.href));

    for (const slug of DAY7_SLUGS.filter((slug) => slug !== hub?.slug)) {
      expect(quickLinks.has(`/blog/${slug}`), `weekly hub should link ${slug}`).toBe(true);
    }

    for (const slug of DAY4_SLUGS) {
      expect(registeredBlogs.has(slug), `${slug} should be registered`).toBe(true);
      expect(quickLinks.has(`/blog/${slug}`), `weekly hub should link ${slug}`).toBe(true);
    }
  });
});
