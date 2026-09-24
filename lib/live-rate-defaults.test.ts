import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Tool } from './tools';

const mocks = vi.hoisted(() => ({
  hasLiveGoldRate: vi.fn(),
  getLoanValuationRate: vi.fn(),
}));

vi.mock('./gold-rates', () => ({
  hasLiveGoldRate: mocks.hasLiveGoldRate,
  getLoanValuationRate: mocks.getLoanValuationRate,
}));

const { applyLiveRateDefaults } = await import('./live-rate-defaults');

const goldTool = {
  slug: 'gold-loan-calculator-india',
  inputs: [
    { key: 'goldWeightGrams', label: 'Gold weight', default: 50 },
    { key: 'pricePerGram24k', label: '24K gold price per gram', default: 7200, help: 'Enter the current 24K price.' },
    { key: 'ltvPercent', label: 'LTV', default: 75 },
  ],
} as unknown as Tool;

const otherTool = {
  slug: 'sip-calculator-india',
  inputs: [{ key: 'monthlyInvestment', label: 'Monthly investment', default: 5000 }],
} as unknown as Tool;

describe('live rate defaults', () => {
  beforeEach(() => {
    mocks.hasLiveGoldRate.mockReset();
    mocks.getLoanValuationRate.mockReset();
  });

  it('replaces the stale hardcoded gold price with the live valuation rate', () => {
    mocks.hasLiveGoldRate.mockReturnValue(true);
    mocks.getLoanValuationRate.mockReturnValue({
      perGram: 9_500,
      carat: '22K',
      basis: 'average',
      sampleDays: 30,
      sufficient: true,
    });

    const result = applyLiveRateDefaults(goldTool);
    const priceInput = result.inputs.find((input) => input.key === 'pricePerGram24k');

    expect(priceInput?.default).not.toBe(7200);
    // 22K average scaled back up to a 24K basis.
    expect(priceInput?.default).toBe(Math.round((9_500 / 0.916) * 0.999));
    expect(priceInput?.help).toMatch(/30-day average/);
  });

  it('says so when the figure is spot rather than a full trailing average', () => {
    mocks.hasLiveGoldRate.mockReturnValue(true);
    mocks.getLoanValuationRate.mockReturnValue({
      perGram: 9_500,
      carat: '22K',
      basis: 'spot',
      sampleDays: 3,
      sufficient: false,
    });

    const priceInput = applyLiveRateDefaults(goldTool).inputs.find((i) => i.key === 'pricePerGram24k');
    expect(priceInput?.help).toMatch(/not yet available/);
    expect(priceInput?.help).not.toMatch(/30-day average/);
  });

  it('keeps the authored default when no live rate exists, never blanking the calculator', () => {
    mocks.hasLiveGoldRate.mockReturnValue(false);
    mocks.getLoanValuationRate.mockReturnValue({
      perGram: null,
      carat: '22K',
      basis: 'none',
      sampleDays: 0,
      sufficient: false,
    });

    const priceInput = applyLiveRateDefaults(goldTool).inputs.find((i) => i.key === 'pricePerGram24k');
    expect(priceInput?.default).toBe(7200);
  });

  it('leaves inputs that are user assumptions untouched', () => {
    mocks.hasLiveGoldRate.mockReturnValue(true);
    mocks.getLoanValuationRate.mockReturnValue({
      perGram: 9_500,
      carat: '22K',
      basis: 'average',
      sampleDays: 30,
      sufficient: true,
    });

    const result = applyLiveRateDefaults(goldTool);
    expect(result.inputs.find((i) => i.key === 'ltvPercent')?.default).toBe(75);
    expect(result.inputs.find((i) => i.key === 'goldWeightGrams')?.default).toBe(50);
  });

  it('does not touch tools with no live-rate inputs', () => {
    mocks.hasLiveGoldRate.mockReturnValue(true);
    expect(applyLiveRateDefaults(otherTool)).toBe(otherTool);
  });
});
