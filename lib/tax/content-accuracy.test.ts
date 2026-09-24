import { describe, expect, it } from 'vitest';
import { blogPosts } from '../../data/blog-posts';
import { getToolBySlug } from '../tools';

describe('regulated tax content safeguards', () => {
  it('describes marginal relief above the Section 87A threshold', () => {
    const article = blogPosts.find(
      (post) => post.slug === 'income-tax-on-12-lakh-salary-new-regime-india-2026'
    );
    const copy = JSON.stringify(article);

    expect(copy).toContain('marginal relief');
    expect(copy).toContain('Rs 10,400');
    expect(copy).not.toContain('A single rupee above Rs 12 lakh makes the full computed tax payable');
    expect(copy).not.toContain('Rs 63,960 tax cliff');
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
