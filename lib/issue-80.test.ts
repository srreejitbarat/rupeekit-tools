import { describe, expect, it } from 'vitest';
import { getToolBySlug, getLiveTools } from './tools';
import { blogPosts } from '../data/all-blog-posts';

const toolSlugs = [
  'sip-calculator-india',
  'step-up-sip-calculator-india',
  'lumpsum-calculator-india',
  'index-fund-vs-active-fund-cost-calculator-india',
] as const;

// The NPS Tier 2, XIRR and ELSS lock-in calculators and the robo-adviser post
// were later retired as thin or misleading; their URLs redirect to kept pages.
const blogSlugs = [
  'mutual-funds-for-beginners-india',
] as const;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

describe('issue #80 SIP and mutual-fund cannibalisation controls', () => {
  it('assigns distinct target keywords to every cluster tool', () => {
    const tools = toolSlugs.map((slug) => getToolBySlug(slug));
    expect(tools.every(Boolean)).toBe(true);
    const keywords = tools.map((tool) => normalize(tool!.targetKeyword));
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it('keeps all live tool target keywords globally unique', () => {
    const keywords = getLiveTools().map((tool) => normalize(tool.targetKeyword));
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it('differentiates each cluster tool with a quick answer, FAQs and cross-links', () => {
    for (const slug of toolSlugs) {
      const tool = getToolBySlug(slug)!;
      expect(tool.quickAnswer?.answer.length).toBeGreaterThan(60);
      expect(tool.quickAnswer?.links?.length ?? 0).toBeGreaterThanOrEqual(2);
      expect(tool.faqs.length).toBeGreaterThanOrEqual(2);
      expect(tool.contentSections?.some((section) => !/source|methodology/i.test(section.heading))).toBe(true);
    }
  });

  it('gives the beginner investing blog its own intent and descriptive calculator routes', () => {
    const posts = blogSlugs.map((slug) => blogPosts.find((post) => post.slug === slug));
    expect(posts.every(Boolean)).toBe(true);
    const keywords = posts.map((post) => normalize(post!.targetKeyword ?? ''));
    expect(keywords.every(Boolean)).toBe(true);
    expect(new Set(keywords).size).toBe(keywords.length);

    const beginner = posts[0]!;
    expect(beginner.h1.toLowerCase()).toContain('beginners');
    expect(beginner.relatedCalculators).toContain('sip-calculator-india');
    expect(beginner.relatedCalculators).toContain('lumpsum-calculator-india');
    expect(beginner.quickAnswer?.links?.some((link) => link.href === '/tools/index-fund-vs-active-fund-cost-calculator-india')).toBe(true);
  });

  it('does not collapse distinct calculator intents into redirects or replacements', () => {
    expect(getToolBySlug('sip-calculator-india')).toBeTruthy();
    expect(getToolBySlug('step-up-sip-calculator-india')).toBeTruthy();
    expect(getToolBySlug('lumpsum-calculator-india')).toBeTruthy();
  });
});
