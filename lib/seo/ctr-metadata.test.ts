import { describe, expect, it } from 'vitest';
import { normalizeSerpDescription } from './ctr-metadata';

describe('reader-focused search descriptions', () => {
  it('does not pad a useful short description with generic promises', () => {
    expect(normalizeSerpDescription('Compare rent and home-loan costs.')).toBe('Compare rent and home-loan costs.');
  });
  it('keeps the complete source so translation lookup and caveats survive', () => {
    const source = 'Compare the monthly cost of renting with buying a home, including the deposit, loan interest, maintenance and other assumptions. Results are estimates and depend on the values you enter.';
    expect(normalizeSerpDescription(source)).toBe(source);
  });
  it('normalizes whitespace without cutting Hindi or Bengali text', () => {
    expect(normalizeSerpDescription('  নিজের খরচ\n মিলিয়ে দেখুন।  ')).toBe('নিজের খরচ মিলিয়ে দেখুন।');
  });
});
