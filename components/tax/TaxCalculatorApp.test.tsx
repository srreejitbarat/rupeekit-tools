// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { trackValidCalculation } from '@/lib/analytics';
import { TaxCalculatorApp } from './TaxCalculatorApp';

vi.mock('@/lib/analytics', () => ({ trackAnalyticsEvent: vi.fn(), trackValidCalculation: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

it('tracks a calculated tax result and ignores the defaults, blank income and tab changes', () => {
  vi.useFakeTimers();
  render(<TaxCalculatorApp />);
  const settle = () => act(() => vi.advanceTimersByTime(500));
  settle();
  fireEvent.click(screen.getByRole('button', { name: 'Future Projection' }));
  settle();
  fireEvent.click(screen.getByRole('button', { name: 'Current Calculation' }));
  const income = screen.getByDisplayValue('12,00,000');
  fireEvent.change(income, { target: { value: '' } });
  settle();
  expect(trackValidCalculation).not.toHaveBeenCalled();

  fireEvent.change(income, { target: { value: '6000000' } });
  settle();
  expect(trackValidCalculation).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
    tool_slug: 'income-tax-calculator-old-vs-new-regime-india',
    tool_category: 'Tax',
  }));
});
