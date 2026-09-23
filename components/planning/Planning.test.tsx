// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import HomeLoanPlanner from './HomeLoanPlanner';
import SipGoalsPlanner from './SipGoalsPlanner';
import SalaryCashPlanner from './SalaryCashPlanner';
import PlanningGuide from './PlanningGuide';
import PlanningExperience from './PlanningExperience';
import CalculatorAnalyticsBoundary from '@/components/CalculatorAnalyticsBoundary';

vi.mock('@/lib/analytics', () => ({ trackAnalyticsEvent: vi.fn() }));
vi.mock('@/components/ContextualNextSteps', () => ({ default: () => null }));
vi.mock('@/components/updates/FinancialUpdatesSignup', () => ({ default: () => null }));
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/tools/salary-in-hand-calculator-india');
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('planning user journeys', () => {
  it('prevents stale downloads, validates blanks and recovers the home-loan plan', () => {
    render(<HomeLoanPlanner />);
    expect((screen.getByRole('button', { name: 'Download plan PDF' }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.change(screen.getByLabelText('Outstanding loan balance (₹)'), { target: { value: '' } });
    expect((screen.getByRole('button', { name: 'Download plan PDF' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Update plan' }));
    expect(screen.getByRole('alert').textContent).toContain('Loan balance');
    expect(screen.queryByRole('button', { name: 'Download plan PDF' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Outstanding loan balance (₹)'), { target: { value: '5000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update plan' }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('region', { name: 'Compare loan options against your three limits' })).toBeTruthy();
  });

  it('preserves goal identities when reordered and applies a budget that funds the goals', () => {
    render(<SipGoalsPlanner />);
    fireEvent.change(screen.getByLabelText('How to share the budget'), { target: { value: 'priority' } });
    fireEvent.click(screen.getByRole('button', { name: 'Move goal 2 up' }));
    expect((screen.getByLabelText('Goal 1 name') as HTMLInputElement).value).toBe('Education');
    fireEvent.click(screen.getByRole('button', { name: 'Add a goal (3/5)' }));
    expect(screen.getByLabelText('Goal 4 name')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove goal 4' }));
    fireEvent.change(screen.getByLabelText('Monthly investment budget (₹)'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update plan' }));
    expect(screen.getByRole('heading', { name: /goals need an adjustment/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try this budget' }));
    expect(screen.getByRole('heading', { name: 'Your budget funds every goal in this scenario' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Download monthly CSV' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('resets earlier-year history for April, updates salary timing and guards the supported income range', () => {
    render(<SalaryCashPlanner />);
    fireEvent.change(screen.getByLabelText('Comparison starts'), { target: { value: '2026-04' } });
    expect((screen.getByLabelText('Earlier gross salary (₹)') as HTMLInputElement).value).toBe('0');
    expect((screen.getByLabelText('Earlier salary TDS paid (₹)') as HTMLInputElement).value).toBe('0');
    fireEvent.change(screen.getByLabelText('Option 2: first salary delay'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update cash comparison' }));
    expect(screen.queryByRole('alert')).toBeNull();
    const table = screen.getByRole('region', { name: 'Twelve-month salary and cash comparison' });
    expect(table.textContent).toContain('Apr 2026');
    expect(table.textContent).toContain('Mar 2027');
    fireEvent.change(screen.getByLabelText('Option 2: annual fixed CTC (₹)'), { target: { value: '5000000' } });
    fireEvent.change(screen.getByLabelText('Option 2: gross joining bonus (₹)'), { target: { value: '1000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update cash comparison' }));
    expect(screen.getByRole('alert').textContent).toContain('exceeds ₹50 lakh');
  });

  it('makes the guide skippable, keyboard-dismissable and repeatable without storing finances', () => {
    const steps = [{ title: 'Choose a budget', text: 'Budget details.' }, { title: 'Review the plan', text: 'Result details.' }];
    render(<PlanningGuide name="test" steps={steps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show guide' }));
    let dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Step 1 of 2')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(within(dialog).getByText('Step 2 of 2')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Back' }));
    fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem('rupeekit:planning-guide:test:v1')).toBe('seen');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Show guide' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show guide' }));
    dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Skip guide' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.length).toBe(1);
  });

  it('keeps planner numbers and names out of shared links', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    window.history.replaceState({}, '', '/tools/salary-in-hand-calculator-india?rk_secret=100000');
    render(<CalculatorAnalyticsBoundary toolSlug="salary-in-hand-calculator-india" toolCategory="Salary" shareInputs={false}>
      <input id="secret" defaultValue="2500000" /><input id="offer-name" defaultValue="Private employer" />
    </CalculatorAnalyticsBoundary>);
    expect((document.getElementById('secret') as HTMLInputElement).value).toBe('2500000');
    fireEvent.click(screen.getByRole('button', { name: 'Copy calculator link' }));
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    const url = writeText.mock.calls[0][0];
    expect(url).not.toContain('?'); expect(url).not.toContain('2500000'); expect(url).not.toContain('Private');
  });

  it('keeps quick-calculator edits when switching to the planner and back', async () => {
    render(<PlanningExperience slug="home-loan-emi-calculator-india" category="Loans" quick={<label>Existing amount<input defaultValue="1000" /></label>} />);
    fireEvent.change(screen.getByLabelText('Existing amount'), { target: { value: '2000' } });
    fireEvent.click(screen.getByRole('tab', { name: 'Repayment planner' }));
    await screen.findByLabelText('Outstanding loan balance (₹)');
    fireEvent.change(screen.getByLabelText('Outstanding loan balance (₹)'), { target: { value: '4000000' } });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Repayment planner' }), { key: 'ArrowLeft' });
    expect((screen.getByLabelText('Existing amount') as HTMLInputElement).value).toBe('2000');
    fireEvent.click(screen.getByRole('tab', { name: 'Repayment planner' }));
    expect((screen.getByLabelText('Outstanding loan balance (₹)') as HTMLInputElement).value).toBe('4000000');
  });
});
