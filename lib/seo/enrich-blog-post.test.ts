import { describe, expect, it } from 'vitest';
import type { BlogPost } from '@/data/blog-posts';
import { enrichLegacyBlogPost } from './enrich-blog-post';

describe('authored article presentation', () => {
  const article = {
    slug: 'example', title: 'A budget example', h1: 'A budget example',
    intro: 'An example uses 2.5 months of costs. This is an assumption, not a rule.',
    metaDescription: 'A budget example.', category: 'Budgeting', date: 'May 2026', readTime: '2 min',
    sections: [{ title: '1. Calculate your costs', paragraphs: ['Use your own bills.'] }],
    faqs: [], relatedCalculators: [],
  } satisfies BlogPost;
  it('does not manufacture questions or truncate a decimal into a misleading answer', () => {
    const result = enrichLegacyBlogPost(article);
    expect(result.sections[0].title).toBe('1. Calculate your costs');
    expect(result.quickAnswer).toBeUndefined();
    expect(result.answerEngineSummary).toBeUndefined();
    expect(result.intro).toContain('2.5 months');
  });
  it('retains deliberately written answers and summaries', () => {
    const result = enrichLegacyBlogPost({...article, quickAnswer: {question:'Where do I start?',answer:'List the bills.'}, answerEngineSummary:'Start with your bills.'});
    expect(result.quickAnswer?.answer).toBe('List the bills.');
    expect(result.answerEngineSummary).toBe('Start with your bills.');
  });
});
