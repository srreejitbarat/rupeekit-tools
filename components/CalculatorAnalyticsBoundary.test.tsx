// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CalculatorAnalyticsBoundary from './CalculatorAnalyticsBoundary';
import { useCalculatorResult } from './useCalculatorResult';
import { usePlanForm } from '@/components/planning/PlanningFields';
import { trackAnalyticsEvent, trackValidCalculation } from '@/lib/analytics';

vi.mock('@/lib/analytics', () => ({ trackAnalyticsEvent: vi.fn(), trackValidCalculation: vi.fn() }));

const toolPath = '/tools/ppf-calculator-india';

function CalculatorFields() {
  const [amount, setAmount] = useState('1000');
  useCalculatorResult(amount, Number(amount) >= 100);

  return (
    <>
      <label>
        Amount
        <input id="calculator-input-amount" type="number" min={100} value={amount} onChange={(event) => setAmount(event.target.value)} />
      </label>
      <output>Estimated amount: {amount}</output>
      <button type="button">Download results</button>
      <button type="button" data-calculation-action onClick={() => setAmount('1800')}>Use example</button>
    </>
  );
}

function Calculator() {
  return (
    <CalculatorAnalyticsBoundary toolSlug="ppf-calculator-india" toolCategory="Investments">
      <CalculatorFields />
    </CalculatorAnalyticsBoundary>
  );
}

function calculatePlan(amount: string) {
  return { errors: Number(amount) > 0 ? [] : ['Enter a positive amount'] };
}

function PlannerFields() {
  const { draft, setDraft, submit } = usePlanForm('1000', calculatePlan);
  return (
    <form noValidate onSubmit={submit}>
      <label>
        Plan amount
        <input type="number" value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <button type="submit">Update plan</button>
    </form>
  );
}

function completeDebounce() {
  act(() => {
    vi.advanceTimersByTime(350);
  });
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
    expect(trackValidCalculation).toHaveBeenCalledOnce();

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'draft@example.test' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share result link' }));
    });
    completeDebounce();

    expect(writeText).toHaveBeenCalledOnce();
    const url = new URL(writeText.mock.calls[0][0]);
    expect([...url.searchParams]).toEqual([['rk_amount', '1200']]);
    expect(trackValidCalculation).toHaveBeenCalledOnce();
    expect(trackAnalyticsEvent).toHaveBeenCalledWith('result_shared', expect.objectContaining({ share_method: 'copy_link' }));
  });

  it('restores a shared scenario without recording a calculation until the visitor edits it', () => {
    window.history.replaceState({}, '', `${toolPath}?rk_amount=1400`);
    render(<Calculator />);

    expect(screen.getByText('Estimated amount: 1400')).toBeTruthy();
    completeDebounce();
    expect(trackValidCalculation).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Email address')).toBeNull();

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1500' } });
    completeDebounce();
    expect(trackValidCalculation).toHaveBeenCalledOnce();
  });

  it('counts only a settled valid result after live edits or a calculation preset', () => {
    render(<Calculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Download results' }));
    completeDebounce();
    expect(trackValidCalculation).not.toHaveBeenCalled();

    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '1200' } });
    fireEvent.change(input, { target: { value: '' } });
    completeDebounce();
    fireEvent.change(input, { target: { value: '50' } });
    completeDebounce();
    expect(trackValidCalculation).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Use example' }));
    completeDebounce();
    expect(trackValidCalculation).toHaveBeenCalledExactlyOnceWith({
      tool_slug: 'ppf-calculator-india',
      tool_category: 'Investments',
      time_to_first_calculation_ms: expect.any(Number),
    });
  });

  it('counts a submitted plan only after the committed calculation succeeds', () => {
    render(
      <CalculatorAnalyticsBoundary toolSlug="planner" toolCategory="Planning" shareInputs={false}>
        <PlannerFields />
      </CalculatorAnalyticsBoundary>
    );
    const input = screen.getByLabelText('Plan amount');
    const update = screen.getByRole('button', { name: 'Update plan' });

    fireEvent.change(input, { target: { value: '1500' } });
    completeDebounce();
    expect(trackValidCalculation).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(update);
    expect(trackValidCalculation).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '1500' } });
    fireEvent.click(update);
    expect(trackValidCalculation).toHaveBeenCalledOnce();
  });
});
