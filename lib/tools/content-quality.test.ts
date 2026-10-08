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

function retirementResult(postRetirementReturn = 8) {
  const tool = getToolBySlug('retirement-calculator-india')!;
  const values: Record<string, number> = {
    currentAge: 30, retirementAge: 60, expectedLifeAge: 85,
    monthlyExpenseNow: 50000, expenseReductionPercent: 20,
    inflationRate: 6, postRetirementReturn,
    existingCorpus: 0, monthlySip: 10000, sipReturn: 12,
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

  it('keeps salary methodology consistent with the tax-driven calculator and published example', () => {
    const tool = getToolBySlug('salary-in-hand-calculator-india')!;
    const sections = (tool.contentSections ?? []).map((section) => section.body).join(' ');
    expect(sections).not.toContain('accepts monthly tax as an input');
    expect(sections).not.toContain('numeric formulas are unchanged');
    expect(tool.example).toContain('₹94,000');
    expect(tool.example).toContain('₹6,000');
    expect(tool.example).toContain('₹87,800');
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

  it('reproduces the published debt-snowball stage approximation', () => {
    const tool = getToolBySlug('debt-snowball-calculator-india')!;
    const values: Record<string, number> = {
      debt1: 50000, rate1: 18, min1: 3000,
      debt2: 150000, rate2: 14, min2: 5000,
      debt3: 400000, rate3: 11, min3: 9000, extraPayment: 5000,
    };
    const parser = new Parser();
    for (const output of tool.outputs) values[output.key] = parser.evaluate(output.formula, values);

    expect(values.totalDebt).toBe(600000);
    expect(values.startingPayment).toBe(22000);
    expect(values.rolledPayment2).toBe(13000);
    expect(values.rolledPayment3).toBe(22000);
    expect(values.debt1Months).toBeCloseTo(6.611769, 5);
    expect(values.debt2Months).toBeCloseTo(12.464828, 5);
    expect(values.debt3Months).toBeCloseTo(19.980647, 5);
    expect(values.estimatedTotalMonths).toBeCloseTo(39.057244, 5);
  });

  it('reproduces the retirement example using matching dates and an additional SIP', () => {
    const tool = getToolBySlug('retirement-calculator-india')!;
    const values = retirementResult();
    expect(values.monthlyExpenseAtRetirement).toBe(40000);
    expect(values.annualExpenseAtRetirement / 12).toBeCloseTo(229739.65, 2);
    expect(values.retirementCorpusNeeded).toBeCloseTo(9371259.11, 2);
    expect(values.futureCorpusNeeded).toBeCloseTo(53823743.96, 2);
    expect(values.totalFutureCorpus).toBeCloseTo(35299137.74, 2);
    expect(values.corpusShortfall).toBeCloseTo(18524606.22, 2);
    expect(Math.round(values.requiredMonthlySip)).toBe(5248);
    expect(tool.example).toContain("₹93.71 lakh in today's rupees");
    expect(tool.example).toContain('₹5.38 crore at retirement');
    expect(tool.example).toContain('₹5,248 extra monthly SIP');
    expect(tool.formulaExplanation).not.toContain('perpetuity');
  });

  it('documents the positive model floor when assumed returns do not beat inflation', () => {
    const tool = getToolBySlug('retirement-calculator-india')!;
    expect(retirementResult(6).retirementCorpusNeeded).toBeCloseTo(10571114.74, 2);
    expect(retirementResult(4).retirementCorpusNeeded).toBe(retirementResult(6).retirementCorpusNeeded);
    expect(tool.assumptions).toContain('The annual return-after-inflation approximation is floored at 1%; it does not model zero or negative real returns.');
  });

  it('reproduces the published fee-drag example without implying a performance forecast', () => {
    const tool = getToolBySlug('index-fund-vs-active-fund-cost-calculator-india')!;
    const calculate = (activeExpenseRatio: number) => {
      const values: Record<string, number> = {
        investmentAmount: 500000, years: 15, grossReturn: 12,
        indexExpenseRatio: 0.2, activeExpenseRatio,
      };
      const parser = new Parser();
      for (const output of tool.outputs) values[output.key] = parser.evaluate(output.formula, values);
      return values;
    };

    const values = calculate(1.5);
    expect(values.indexNetReturn).toBeCloseTo(11.8);
    expect(values.activeNetReturn).toBeCloseTo(10.5);
    expect(values.indexFutureValue).toBeCloseTo(2664385.48, 2);
    expect(values.activeFutureValue).toBeCloseTo(2235651.86, 2);
    expect(values.futureValueDifference).toBeCloseTo(428733.62, 2);
    expect(calculate(0.2).futureValueDifference).toBe(0);
    expect(tool.example).toContain('₹26.64 lakh');
    expect(tool.example).toContain('₹22.36 lakh');
    expect(tool.example).toContain('₹4.29 lakh from fees alone');
    expect(tool.faqs.filter((faq) => /expense ratio.*guarantee/.test(faq.question))).toHaveLength(1);
  });
});
