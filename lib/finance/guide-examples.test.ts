import { describe, expect, it } from 'vitest';
import { moneyGuides, officialSources } from '../../data/money-authority';
import { getToolBySlug } from '../tools';
import {
  GUIDE_EXAMPLES,
  annualisedCostFromDisbursement,
  reducingBalanceEmi,
  sipFutureValue,
} from './guide-examples';

describe('money decision guide calculations and references', () => {
  it('matches independently checked repayment and SIP scenarios', () => {
    expect(reducingBalanceEmi(5_000_000, 9, 240)).toBeCloseTo(44_986.30, 1);
    expect(reducingBalanceEmi(500_000, 0, 10)).toBe(50_000);
    expect(sipFutureValue(10_000, 10, 120)).toBeCloseTo(2_048_449.79, 1);
    expect(annualisedCostFromDisbursement(488_200, reducingBalanceEmi(500_000, 12, 24), 24))
      .toBeCloseTo(15.41, 1);
    expect(() => reducingBalanceEmi(-1, 9, 12)).toThrow(RangeError);
  });

  it('publishes the two kept guides with supported examples and working catalog targets', () => {
    // Eight thinner guides were retired as duplicates of their calculators.
    expect(moneyGuides.map((guide) => guide.slug)).toEqual(['home-loan-prepayment', 'personal-loan-apr']);
    expect(moneyGuides.every((guide) => guide.priority === 'P0')).toBe(true);
    const slugs = new Set(moneyGuides.map((guide) => guide.slug));
    for (const guide of moneyGuides) {
      expect(GUIDE_EXAMPLES[guide.slug]).toBeTruthy();
      expect(guide.example.inputs.length).toBeGreaterThan(0);
      expect(guide.example.results.length).toBeGreaterThan(0);
      expect(guide.sourceIds).toContain(guide.fact.sourceId);
      expect(guide.relatedSlugs.every((slug) => slugs.has(slug))).toBe(true);
      expect(guide.toolSlugs.every((slug) => Boolean(getToolBySlug(slug))), guide.slug).toBe(true);
      expect(guide.caveat.length).toBeGreaterThan(30);
    }
  });

  it('cites primary Indian bodies for every factual rule', () => {
    const officialDomains = [
      'incometax.gov.in',
      'rbi.org.in',
      'investor.sebi.gov.in',
      'epfindia.gov.in',
      'nsiindia.gov.in',
      'tutorial.gst.gov.in',
      'labour.gov.in',
      'wbregistration.gov.in',
    ];
    for (const guide of moneyGuides) {
      for (const sourceId of guide.sourceIds) {
        const source = officialSources[sourceId];
        expect(source, guide.slug).toBeTruthy();
        expect(officialDomains.some((domain) => new URL(source.url).hostname.endsWith(domain))).toBe(true);
      }
    }
  });
});
