import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { Parser } from 'expr-eval';
import { solveMonthlyIrr } from '../finance/apr';

type FormulaTool = {
  slug: string;
  inputs: Array<{ key: string; default: number }>;
  outputs: Array<{ key: string; formula: string }>;
};

const parser = new Parser({
  operators: {
    add: true,
    concatenate: false,
    conditional: false,
    divide: true,
    factorial: false,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,
    logical: false,
    comparison: false,
    in: false,
    assignment: false,
  },
});

function loadGrowthTools() {
  const file = path.join(process.cwd(), 'data', 'growth-tools.json');
  return JSON.parse(fs.readFileSync(file, 'utf8')) as FormulaTool[];
}

function evaluate(tool: FormulaTool) {
  const context: Record<string, number> = Object.fromEntries(
    tool.inputs.map((input) => [input.key, input.default])
  );
  for (const output of tool.outputs) {
    context[output.key] = parser.parse(output.formula).evaluate(context);
  }
  return context;
}

describe('growth calculator clusters', () => {
  it('models the Rs 80 lakh SWP example and makes the stress path weaker', () => {
    const tool = loadGrowthTools().find((item) => item.slug === 'home-loan-swp-stress-test-india');
    expect(tool).toBeDefined();
    const result = evaluate(tool!);

    expect(result.loanPrincipal).toBe(8_000_000);
    expect(result.monthlyEmi).toBeGreaterThan(66_000);
    expect(result.monthlyEmi).toBeLessThan(68_000);
    expect(result.requiredGrossReturn).toBeLessThan(12);
    expect(result.steadyEndCorpus).toBeGreaterThan(0);
    expect(result.stressEndCorpus).toBeLessThan(result.steadyEndCorpus);
  });

  it('keeps shorter-tenure interest below reduced-EMI interest', () => {
    const tool = loadGrowthTools().find((item) => item.slug === 'reduce-emi-vs-tenure-calculator-india');
    expect(tool).toBeDefined();
    const result = evaluate(tool!);

    expect(result.newTenureMonths).toBeLessThan(result.remainingMonths);
    expect(result.interestWithShorterTenure).toBeLessThan(result.interestWithReducedEmi);
    expect(result.extraInterestSavedByTenure).toBeGreaterThan(0);
  });

  it('solves cash-flow IRR at the quoted monthly rate when there are no fees', () => {
    const principal = 500_000;
    const monthlyRate = 0.01;
    const months = 36;
    const emi = principal * monthlyRate * (1 + monthlyRate) ** months /
      ((1 + monthlyRate) ** months - 1);

    expect(solveMonthlyIrr(principal, emi, months)).toBeCloseTo(monthlyRate, 8);
    expect(solveMonthlyIrr(principal - 20_000, emi, months)).toBeGreaterThan(monthlyRate);
  });
});
