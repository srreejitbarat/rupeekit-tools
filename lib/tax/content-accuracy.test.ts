import { describe, expect, it } from 'vitest';
import { blogPosts } from '../../data/blog-posts';
import { getToolBySlug } from '../tools';
import { calculateIndianIncomeTax } from './calculator';

describe('regulated tax content safeguards', () => {
  it('describes marginal relief under Section 156 for Tax Year 2026–27', () => {
    const article = blogPosts.find(
      (post) => post.slug === 'income-tax-on-12-lakh-salary-new-regime-india-2026'
    );
    const copy = JSON.stringify(article);

    expect(copy).toContain('marginal relief');
    expect(copy).toContain('Section 156');
    expect(copy).toContain('₹10,400');
    expect(copy).not.toContain('A single rupee above Rs 12 lakh makes the full computed tax payable');
    expect(copy).not.toContain('Rs 63,960 tax cliff');
  });

  it('matches the current tax calculator for the published old and new regime examples', () => {
    const article = blogPosts.find((post) => post.slug === 'old-vs-new-tax-regime-which-saves-more');
    const salaryExamples = article?.sections[0].bullets ?? [];
    expect(salaryExamples).toHaveLength(3);

    const format = (amount: number) => Math.round(amount).toLocaleString('en-IN');
    for (const [index, salary] of [1_200_000, 1_500_000, 2_000_000].entries()) {
      const { oldRegime, newRegime } = calculateIndianIncomeTax({
        grossSalary: salary,
        hraExemption: 0,
        homeLoanInterest: 0,
        section80C: 0,
        section80D: 0,
        employerNPS: 0,
        otherDeductionsOldRegime: 0,
        otherDeductionsBothRegimes: 0,
        isSalaried: true,
      }, '2026-27');
      expect(salaryExamples[index]).toBe(
        `₹${salary / 100_000} lakh gross salary. Old regime ₹${format(oldRegime.finalTax)}. New regime ₹${format(newRegime.finalTax)}.`
      );
    }
  });

  it('does not present Section 80CCD(1B) as a new-regime self-contribution deduction', () => {
    const article = blogPosts.find(
      (post) => post.slug === 'income-tax-on-12-lakh-salary-new-regime-india-2026'
    );
    const salaryGuide = blogPosts.find(
      (post) => post.slug === 'how-to-calculate-in-hand-salary-from-ctc-india'
    );
    const npsTool = getToolBySlug('nps-calculator-india');
    const copy = JSON.stringify({ article, salaryGuide, npsTool });

    expect(copy).toContain('80CCD(2)');
    expect(copy).toContain('old regime');
    expect(copy).not.toContain('Under the new tax regime, very few deductions are allowed — but Section 80CCD(1B) still works');
  });

  it('keeps current NPS exit permission separate from lump-sum tax exemption', () => {
    const npsTool = getToolBySlug('nps-calculator-india');
    const annuityInput = npsTool?.inputs.find((input) => input.key === 'annuityPercent');
    const copy = JSON.stringify(npsTool);

    expect(annuityInput?.min).toBe(20);
    expect(copy).toContain('up to 80%');
    expect(copy).toContain('up to 60%');
    expect(copy).toContain('not identical');
    expect(copy).not.toContain('minimum 40% is mandatory');
  });
});
