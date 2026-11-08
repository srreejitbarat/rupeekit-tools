// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorAnalyticsBoundary from './CalculatorAnalyticsBoundary';
import { trackAnalyticsEvent } from '@/lib/analytics';

vi.mock('@/lib/analytics', () => ({ trackAnalyticsEvent: vi.fn() }));

const toolPath = '/tools/ppf-calculator-india';

function Calculator() {
  const [amount, setAmount] = useState('1000');

  return (
    <CalculatorAnalyticsBoundary toolSlug="ppf-calculator-india" toolCategory="Investments">
      <label>
        Amount
        <input id="calculator-input-amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
      </label>
      <output>Estimated amount: {amount}</output>
    </CalculatorAnalyticsBoundary>
  );
}

function completeDebounce() {
  act(() => vi.advanceTimersByTime(350));
}

function completedCalculations() {
  return vi.mocked(trackAnalyticsEvent).mock.calls.filter(([event]) => event === 'calculation_completed');
}

describe('calculator sharing and analytics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    window.history.replaceState({}, '', toolPath);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('copies calculator inputs without a draft newsletter email or a new calculation', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<Calculator />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1200' } });
    completeDebounce();
    expect(completedCalculations()).toHaveLength(1);

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'draft@example.test' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share result link' }));
    });
    completeDebounce();

    expect(writeText).toHaveBeenCalledOnce();
    const url = new URL(writeText.mock.calls[0][0]);
    expect([...url.searchParams]).toEqual([['rk_amount', '1200']]);
    expect(completedCalculations()).toHaveLength(1);
    expect(trackAnalyticsEvent).toHaveBeenCalledWith('result_shared', expect.objectContaining({ share_method: 'copy_link' }));
  });

  it('restores a shared scenario without recording a calculation until the visitor edits it', () => {
    window.history.replaceState({}, '', `${toolPath}?rk_amount=1400`);
    render(<Calculator />);

    expect(screen.getByText('Estimated amount: 1400')).toBeTruthy();
    completeDebounce();
    expect(completedCalculations()).toHaveLength(0);
    expect(screen.queryByLabelText('Email address')).toBeNull();

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1500' } });
    completeDebounce();
    expect(completedCalculations()).toHaveLength(1);
  });
});
