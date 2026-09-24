import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import directAnswers from '../data/direct-answer-overrides-2026-08-17.json';
import { getToolBySlug } from './tools';

const requiredToolSlugs = [
  'nps-calculator-india',
  'ppf-calculator-india',
  'sip-calculator-india',
  'capital-gains-tax-calculator-india',
  'emergency-fund-calculator-india',
] as const;

describe('issue #70 above-the-fold direct answers', () => {
  it('provides concise direct-answer copy for the recorded page-one calculator set', () => {
    for (const slug of requiredToolSlugs) {
      const answer = directAnswers[slug];
      expect(answer, `${slug} should have a direct answer`).toBeTruthy();
      expect(answer.length).toBeGreaterThanOrEqual(60);
      expect(answer.length).toBeLessThanOrEqual(320);

      const tool = getToolBySlug(slug);
      expect(tool, `${slug} should remain live`).toBeTruthy();
      expect(tool?.shortDescription).toBe(answer);
    }
  });

  it('keeps the blog layout server-rendered and places the direct-answer marker before the article', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components', 'blog', 'BlogArticleLayout.tsx'),
      'utf8',
    );

    expect(source).not.toMatch(/^["']use client["'];/m);
    const directAnswerIndex = source.indexOf('data-direct-answer="server-rendered"');
    const articleIndex = source.indexOf('<article');
    expect(directAnswerIndex).toBeGreaterThan(-1);
    expect(articleIndex).toBeGreaterThan(directAnswerIndex);
  });
});
