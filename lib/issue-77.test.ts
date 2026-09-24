import { describe, expect, it } from 'vitest';
import { getToolBySlug } from './tools';

const getTool = (slug: string) => {
  const tool = getToolBySlug(slug);
  expect(tool, `expected live tool ${slug}`).toBeDefined();
  return tool!;
};

describe('issue #77 gold loan and SSY rescue', () => {
  it('adds a sourced, worked gold-loan answer without changing calculator formulas', () => {
    const tool = getTool('gold-loan-calculator-india');
    expect(tool.quickAnswer?.example).toContain('50g');
    expect(tool.quickAnswer?.answer).toContain('85%');
    expect(tool.quickAnswer?.answer).toContain('80%');
    expect(tool.quickAnswer?.answer).toContain('75%');
    expect(tool.factRows?.some((row) => row.topic === 'Consumption-loan LTV')).toBe(true);
    expect(tool.contentSections?.some((section) => section.heading.includes('purity'))).toBe(true);
    expect(tool.contentSections?.some((section) => section.heading.includes('Bullet repayment'))).toBe(true);
    expect(tool.contentSections?.some((section) => section.heading.includes('not repaid'))).toBe(true);
    expect(tool.officialSources?.some((source) => source.label.includes('RBI'))).toBe(true);
    expect(tool.factsCheckedIso).toBe('2026-08-24');
  });

  it('adds the current SSY quarter, scheme timeline, limits and worked example', () => {
    const tool = getTool('sukanya-samriddhi-yojana-calculator-india');
    expect(tool.quickAnswer?.title).toContain('8.2%');
    expect(tool.quickAnswer?.answer).toContain('July-September 2026');
    expect(tool.quickAnswer?.answer).toContain('₹250');
    expect(tool.quickAnswer?.answer).toContain('₹1.5 lakh');
    expect(tool.quickAnswer?.example).toContain('15 deposit years');
    expect(tool.contentSections?.some((section) => section.heading.includes('15 years'))).toBe(true);
    expect(tool.contentSections?.some((section) => section.heading.includes('Partial withdrawal'))).toBe(true);
    expect(tool.factRows?.some((row) => row.topic === 'Maturity' && row.explanation.includes('21 years'))).toBe(true);
    expect(tool.officialSources?.some((source) => source.label.includes('India Post'))).toBe(true);
    expect(tool.officialSources?.some((source) => source.label.includes('National Savings Institute'))).toBe(true);
    expect(tool.factsCheckedIso).toBe('2026-08-24');
  });

  it('builds two-way small-savings links', () => {
    const cluster = [
      'sukanya-samriddhi-yojana-calculator-india',
      'ppf-calculator-india',
      'scss-calculator-india',
      'post-office-monthly-income-scheme-calculator-india',
    ];

    for (const slug of cluster) {
      const tool = getTool(slug);
      for (const other of cluster.filter((candidate) => candidate !== slug)) {
        expect(tool.related, `${slug} should link to ${other}`).toContain(other);
      }
    }
  });

  it('links gold loan and personal-loan pages in both directions', () => {
    const gold = getTool('gold-loan-calculator-india');
    const personalLoanSlugs = [
      'personal-loan-emi-calculator-india',
      'personal-loan-eligibility-calculator-india',
      'personal-loan-true-apr-calculator-india',
    ];

    for (const slug of personalLoanSlugs) {
      expect(gold.related).toContain(slug);
      expect(getTool(slug).related).toContain('gold-loan-calculator-india');
    }
  });
});
