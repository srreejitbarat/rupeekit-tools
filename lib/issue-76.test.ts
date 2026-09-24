import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { blogPosts } from '../data/all-blog-posts';
import issue76ToolOverrides from '../data/issue-76-tool-overrides-2026-08-23.json';
import { getToolBySlug } from './tools';
import { availableTaxYears, indiaIncomeTaxRules } from './tax/indiaIncomeTaxRules';

const TAX_TOOL = 'income-tax-calculator-old-vs-new-regime-india';
const SALARY_TOOL = 'salary-in-hand-calculator-india';
const JOURNEY_BLOGS = [
  'how-to-calculate-in-hand-salary-from-ctc-india',
  'income-tax-on-12-lakh-salary-new-regime-india-2026',
  'old-vs-new-tax-regime-which-saves-more',
];

describe('issue #76 tax and salary rescue', () => {
  it('pins FY 2025-26 Finance Act 2025 new-regime parameters', () => {
    const rules = indiaIncomeTaxRules['2025-26'];
    expect(rules.ay).toBe('2026-27');
    expect(rules.cessRate).toBe(0.04);
    expect(rules.newRegime.standardDeduction).toBe(75000);
    expect(rules.newRegime.rebateLimit).toBe(1200000);
    expect(rules.newRegime.maxRebate).toBe(60000);
    expect(rules.newRegime.marginalReliefOnRebate).toBe(true);
    expect(rules.newRegime.slabs).toEqual([
      { min: 0, max: 400000, rate: 0 },
      { min: 400000, max: 800000, rate: 0.05 },
      { min: 800000, max: 1200000, rate: 0.10 },
      { min: 1200000, max: 1600000, rate: 0.15 },
      { min: 1600000, max: 2000000, rate: 0.20 },
      { min: 2000000, max: 2400000, rate: 0.25 },
      { min: 2400000, max: null, rate: 0.30 },
    ]);
  });

  it('keeps tax years newest-first and lets the app use that default', () => {
    expect(availableTaxYears[0]).toBe('2026-27');
    expect(availableTaxYears).toContain('2025-26');
    const appSource = readFileSync('components/tax/TaxCalculatorApp.tsx', 'utf8');
    expect(appSource).toContain("useState<string>(availableTaxYears[0] ?? '2025-26')");
  });

  it('puts a representative old-vs-new comparison before tax inputs and preserves scope language', () => {
    const appSource = readFileSync('components/tax/TaxCalculatorApp.tsx', 'utf8');
    const comparisonIndex = appSource.indexOf('Old vs new tax regime at representative salaries');
    const inputFormIndex = appSource.indexOf('<TaxInputForm');
    expect(comparisonIndex).toBeGreaterThan(-1);
    expect(inputFormIndex).toBeGreaterThan(comparisonIndex);
    expect(appSource).toContain('special-rate income');
    expect(appSource).toContain('/tools/salary-in-hand-calculator-india');
    JOURNEY_BLOGS.forEach((slug) => expect(appSource).toContain(`/blog/${slug}`));
  });

  it('adds CTC-component depth without changing salary calculator formulas', () => {
    const tool = getToolBySlug(SALARY_TOOL);
    expect(tool).toBeDefined();
    expect(tool?.contentSections?.some((section) => section.heading.includes('CTC'))).toBe(true);
    expect(tool?.contentSections?.some((section) => section.body.includes('employer PF'))).toBe(true);
    expect(tool?.contentSections?.some((section) => section.body.includes('gratuity'))).toBe(true);
    expect(tool?.contentSections?.some((section) => section.body.includes('professional tax'))).toBe(true);

    expect(tool?.outputs.find((output) => output.key === 'monthlyGross')?.formula).toBe('annualCtc / 12');
    expect(tool?.outputs.find((output) => output.key === 'monthlyInHand')?.formula).toBe(
      'annualCtc / 12 - (annualCtc / 12 * basicPercent / 100 * pfRate / 100) - monthlyTax - professionalTax - otherDeduction'
    );
  });

  it('links the salary calculator to the tax calculator and the three journey blogs', () => {
    const tool = getToolBySlug(SALARY_TOOL);
    const links = tool?.quickAnswer?.links ?? [];
    expect(tool?.related).toContain(TAX_TOOL);
    expect(links.some((link) => link.href === `/tools/${TAX_TOOL}`)).toBe(true);
    JOURNEY_BLOGS.forEach((slug) => {
      expect(links.some((link) => link.href === `/blog/${slug}`)).toBe(true);
    });
  });

  it('links all three journey blogs back to both calculators', () => {
    JOURNEY_BLOGS.forEach((slug) => {
      const post = blogPosts.find((item) => item.slug === slug);
      expect(post, `missing blog ${slug}`).toBeDefined();
      expect(post?.relatedCalculators).toContain(SALARY_TOOL);
      expect(post?.relatedCalculators).toContain(TAX_TOOL);
    });
  });

  it('keeps source verification current and educational', () => {
    const salary = issue76ToolOverrides[SALARY_TOOL];
    expect(salary.lastReviewedIso).toBe('2026-09-12');
    expect(salary.quickAnswer.note).toContain('Educational estimate only');
    expect(salary.officialSources.some((source) => source.href.includes('incometax.gov.in'))).toBe(true);
    expect(salary.officialSources.some((source) => source.href.includes('epfindia.gov.in'))).toBe(true);
  });
});
