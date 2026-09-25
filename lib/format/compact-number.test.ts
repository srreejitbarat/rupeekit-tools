import { describe, expect, it } from 'vitest';
import { compactIndianNumber } from './compact-number';

describe('compactIndianNumber', () => {
  it('uses fixed Indian suffixes', () => {
    expect(compactIndianNumber(0)).toBe('0');
    expect(compactIndianNumber(950)).toBe('950');
    expect(compactIndianNumber(20450)).toBe('20.4K');
    expect(compactIndianNumber(40900)).toBe('40.9K');
    expect(compactIndianNumber(350000)).toBe('3.5L');
    expect(compactIndianNumber(12000000)).toBe('1.2Cr');
    expect(compactIndianNumber(-25000)).toBe('-25K');
  });
});
