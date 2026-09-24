// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import NoCostEmiCalculator from './NoCostEmiCalculator';
import RemittanceCalculator from './RemittanceCalculator';
import CarLeaseCalculator from './CarLeaseCalculator';
import ToolAdPlacement from './ToolAdPlacement';

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });
describe('micro-tool user journeys', () => {
  it('invalidates the old EMI result and download after an incomplete edit', () => {
    render(<NoCostEmiCalculator />);
    const price = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(price, { target: { value: '' } });
    expect((screen.getByRole('button', { name: 'Download plan PDF' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.submit(price.closest('form')!);
    expect(screen.getByRole('alert').textContent).toContain('Purchase price');
    expect(screen.queryByRole('button', { name: 'Download plan PDF' })).toBeNull();
    fireEvent.change(price, { target: { value: '60000' } }); fireEvent.submit(price.closest('form')!);
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('keeps the bank audit tied to submitted inputs and labels foreign currency explicitly', () => {
    render(<RemittanceCalculator />);
    fireEvent.change(screen.getByLabelText('Invoice currency'), { target: { value: 'EUR' } });
    expect(screen.getByLabelText('Gross invoice (EUR)')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Download audit CSV' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('I have the actual bank credit for route 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Audit and compare payment routes' }));
    expect(screen.queryByRole('heading', { name: 'Does route 1 match the actual bank credit?' })).toBeNull();
    expect(screen.getByText(/For EUR 2,000.00/)).toBeTruthy();
  });
  it('adds a continuation scenario only after the user confirms eligibility', () => {
    render(<CarLeaseCalculator />);
    const table = () => screen.getByRole('region', { name: 'Same-date car lease cost comparison' });
    expect(table().textContent).not.toContain('approved continuation');
    fireEvent.click(screen.getByLabelText('The lessor or employer permits continuation / transfer after I leave'));
    expect(screen.getByLabelText('All-in transfer charge at exit (₹)')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Compare car lease exit options' }));
    expect(table().textContent).toContain('Exit + approved continuation');
  });
  it('supports a four-step popup, skip and reopening without saving financial input', () => {
    render(<RemittanceCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Show guide' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Step 1 of 4')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(within(dialog).getByText('Step 2 of 4')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Skip guide' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.length).toBe(1);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Show guide' }));
  });
  it('renders no fake advertising block without a real publisher and numeric slot', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', 'ca-pub-1234567890');
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_TOOL_SLOT', '');
    const { rerender, container } = render(<ToolAdPlacement />);
    expect(container.innerHTML).toBe('');
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_TOOL_SLOT', '1234567890'); rerender(<ToolAdPlacement />);
    expect(screen.getByRole('region', { name: 'Advertisement' })).toBeTruthy();
    expect(container.querySelector('ins')?.getAttribute('data-ad-slot')).toBe('1234567890');
  });
});
