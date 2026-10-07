import { describe, expect, it } from 'vitest';
import { Parser } from 'expr-eval';
import { getLiveTools, getToolBySlug } from '../tools';

const key = (text: string) => text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function rentalResult(vacancyMonths: number, annualMaintenance = 40000) {
  const tool = getToolBySlug('rental-yield-calculator-india')!;
  const values: Record<string, number> = {
    propertyValue: 5000000, monthlyRent: 20000, vacancyMonths,
    annualMaintenance, propertyTax: 0, otherCosts: 0, annualAppreciation: 0,
  };
  const parser = new Parser();
  for (const output of tool.outputs) values[output.key] = parser.evaluate(output.formula, values);
  return values;
}

describe('calculator content integrity', () => {
  it('composes overrides without repeated visible questions or section headings', () => {
    for (const tool of getLiveTools()) {
      const questions = tool.faqs.map((faq) => key(faq.question));
      const headings = (tool.contentSections ?? []).map((section) => key(section.heading));
      expect(new Set(questions).size, tool.slug).toBe(questions.length);
      expect(new Set(headings).size, tool.slug).toBe(headings.length);
    }
  });

  it('reproduces the published rental-yield example and vacancy comparison', () => {
    const oneMonth = rentalResult(1);
    expect(oneMonth.grossAnnualRent).toBe(240000);
    expect(oneMonth.effectiveRent).toBe(220000);
    expect(oneMonth.netAnnualRent).toBe(180000);
    expect(oneMonth.grossYield).toBeCloseTo(4.8);
    expect(oneMonth.netYield).toBeCloseTo(3.6);
    expect(rentalResult(2).netYield).toBeCloseTo(3.2);
  });

  it('preserves losses and a fully vacant year instead of implying a positive yield', () => {
    expect(rentalResult(12, 0).netYield).toBe(0);
    expect(rentalResult(12).netAnnualRent).toBe(-40000);
    expect(rentalResult(12).netYield).toBeCloseTo(-0.8);
  });
});
