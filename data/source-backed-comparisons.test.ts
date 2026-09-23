import { describe, expect, it } from 'vitest';
import { getSourceBackedComparison, sourceBackedComparisons } from './source-backed-comparisons';

describe('source-backed guide comparisons', () => {
  it('keeps the published fee disclosure separate from hypothetical APR results', () => {
    const comparison = sourceBackedComparisons['personal-loan-apr'];
    expect(comparison.basis).toContain('not an offer');
    expect(comparison.limitations).toContain('KFS');
    expect(comparison.rows[0].inputs).toContain('₹8,850');
    expect(comparison.rows[1].inputs).toContain('₹7,670');
    expect(comparison.takeaway).toContain('₹1,180');
    expect(comparison.rows.every((row) => /cash-flow cost|cost at that fee/.test(row.result))).toBe(true);
  });

  it('repays faster and saves more interest when tenure is shortened at unchanged EMI', () => {
    const comparison = sourceBackedComparisons['home-loan-prepayment'];
    expect(comparison.rows[0].result).toContain('228 payments');
    expect(comparison.rows[1].result).toContain('₹1,09,052');
    expect(comparison.rows[2].result).toContain('217 payments');
    expect(comparison.rows[2].result).toContain('₹4,27,594');
  });

  it('ties every priority comparison to a checked, direct source and calculator route', () => {
    expect(Object.keys(sourceBackedComparisons)).toEqual(['personal-loan-apr', 'home-loan-prepayment', 'salary-income-tax']);
    for (const value of Object.values(sourceBackedComparisons)) {
      expect(value.checkedIso).toBe('2026-09-23');
      expect(value.sources.length).toBeGreaterThanOrEqual(2);
      expect(value.sources.every((source) => source.url.startsWith('https://') && source.detail.length > 20)).toBe(true);
    }
    expect(getSourceBackedComparison('salary-in-hand-calculator-india')).toBe(sourceBackedComparisons['salary-income-tax']);
    expect(getSourceBackedComparison('personal-loan-true-apr-calculator-india')).toBe(sourceBackedComparisons['personal-loan-apr']);
  });
});
