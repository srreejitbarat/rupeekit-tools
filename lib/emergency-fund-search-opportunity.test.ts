import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { blogPosts } from '../data/blog-posts';

describe('how much emergency fund search opportunity', () => {
  const post = blogPosts.find((candidate) => candidate.slug === 'how-much-emergency-fund');

  it('preserves the ranking title and answers the observed query variants', () => {
    expect(post).toBeDefined();
    expect(post?.seoTitle).toBe('How Much Emergency Fund Do You Need? India 2026 Guide');

    const questions = post?.faqs.map((faq) => faq.question.toLowerCase()) ?? [];
    expect(questions).toContain('how much should i have in my emergency fund?');
    expect(questions.some((question) => question.startsWith('how much emergency fund should i have'))).toBe(true);
  });

  it('includes a transparent methodology and primary-source references', () => {
    expect(post?.sections.some((section) => /methodology/i.test(section.title))).toBe(true);
    expect(post?.officialSources?.map((source) => source.href)).toEqual(
      expect.arrayContaining([
        'https://www.dicgc.org.in/',
        'https://investor.sebi.gov.in/riskometer.html',
      ]),
    );
  });

  it('does not change the emergency calculator formulas', () => {
    const tools = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'tools.json'), 'utf8'));
    const tool = tools.find((candidate: { slug?: string }) => candidate.slug === 'emergency-fund-calculator-india');
    const formulas = Object.fromEntries(
      tool.outputs.map((output: { key: string; formula: string }) => [output.key, output.formula]),
    );

    expect(formulas).toMatchObject({
      monthlySurvivalCost: 'monthlyEssentialExpenses + monthlyEmiCommitments',
      targetEmergencyFund: '(monthlyEssentialExpenses + monthlyEmiCommitments) * targetMonths',
      currentShortfall: 'max(((monthlyEssentialExpenses + monthlyEmiCommitments) * targetMonths) - currentEmergencySavings, 0)',
    });
  });
});
