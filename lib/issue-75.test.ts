import { describe, expect, it } from 'vitest';
import { allTools } from './tools';

const eligibilitySlug = 'personal-loan-eligibility-calculator-india';

function getTool(slug: string) {
  const tool = allTools.find((candidate) => candidate.slug === slug);
  expect(tool, `Expected live tool ${slug}`).toBeTruthy();
  return tool!;
}

describe('issue #75 personal-loan eligibility rescue', () => {
  it('keeps the salary-band, FOIR, eligibility-check and lender sub-intents on the parent page', () => {
    const tool = getTool(eligibilitySlug);
    const searchable = JSON.stringify({
      contentSections: tool.contentSections,
      faqs: tool.faqs,
      officialSources: tool.officialSources,
    });

    for (const required of ['₹12,000', '₹13,000', '₹14,000', '₹25,000', '₹40,000', '₹45,000']) {
      expect(searchable).toContain(required);
    }
    expect(searchable).toMatch(/FOIR/i);
    expect(searchable).toMatch(/eligibility check/i);
    expect(searchable).toMatch(/SBI/i);
    expect(searchable).toMatch(/lender discretion|approval|sanction/i);
  });

  it('keeps official lender sourcing on the eligibility page', () => {
    const tool = getTool(eligibilitySlug);
    const sourceUrls = (tool.officialSources ?? []).map((source) => source.href);

    expect(sourceUrls.some((url) => url.includes('sbi.co.in') || url.includes('sbi.bank.in'))).toBe(true);
    expect(sourceUrls.every((url) => /^https:\/\//.test(url))).toBe(true);
  });

  it('links into eligibility from three adjacent higher-intent loan tools', () => {
    const inboundSources = [
      'personal-loan-emi-calculator-india',
      'personal-loan-true-apr-calculator-india',
      'loan-foreclosure-net-savings-calculator-india',
    ];

    for (const sourceSlug of inboundSources) {
      expect(getTool(sourceSlug).related).toContain(eligibilitySlug);
    }
  });

  it('does not create salary-specific calculator children', () => {
    const salaryChildPattern = /personal-loan-eligibility-(12000|13000|14000|25000|40000|45000)/;
    expect(allTools.some((tool) => salaryChildPattern.test(tool.slug))).toBe(false);
  });
});
