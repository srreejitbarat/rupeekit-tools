// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from './LanguageSwitcher';
import LanguagePreferenceNotice from './LanguagePreferenceNotice';
import ToolsExplorer from '../tools/ToolsExplorer';
import { LANGUAGE_PREFERENCE_KEY } from '@/lib/i18n/routing';

const route = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

beforeEach(() => {
  route.pathname = '/';
  window.history.replaceState(null, '', '/');
  localStorage.clear();
  sessionStorage.clear();
  window.gtag = vi.fn();
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('language choice', () => {
  it('retains the page, query and anchor between published translations', () => {
    route.pathname = '/tools';
    window.history.replaceState(null, '', '/tools?q=SIP#investing');
    render(<LanguageSwitcher locale="en" />);
    expect(screen.getByRole('link', { name: 'हिंदी' }).getAttribute('href')).toBe('/hi/tools?q=SIP#investing');
    expect(screen.getByRole('link', { name: 'English' }).getAttribute('aria-current')).toBe('page');
  });

  it('opens an honest fallback without losing form values and returns focus when closed', async () => {
    route.pathname = '/tools/sip-calculator-india';
    const user = userEvent.setup();
    render(<><input aria-label="Amount" defaultValue="5000" /><LanguageSwitcher locale="en" /></>);
    const amount = screen.getByRole('textbox', { name: 'Amount' });
    await user.clear(amount);
    await user.type(amount, '7500');
    const trigger = screen.getByRole('link', { name: 'हिंदी के विकल्प / Hindi options' });
    await user.click(trigger);
    expect(screen.getByRole('dialog').textContent).toContain('यह पेज अभी अंग्रेज़ी में उपलब्ध है');
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'इसी पेज पर रहें' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect((amount as HTMLInputElement).value).toBe('7500');
    expect(document.activeElement).toBe(trigger);
  });

  it('remembers Hindi without automatic redirects and allows choosing English immediately', async () => {
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, 'hi');
    render(<><LanguageSwitcher locale="en" /><LanguagePreferenceNotice /></>);
    expect(screen.getByRole('complementary').textContent).toContain('हिंदी');
    expect(window.location.pathname).toBe('/');
    await userEvent.setup().click(screen.getByRole('link', { name: 'English' }));
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBe('en');
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('never includes calculator query values in language analytics', () => {
    route.pathname = '/tools/sip-calculator-india';
    window.history.replaceState(null, '', '/tools/sip-calculator-india?rk_salary=98765');
    render(<LanguageSwitcher locale="en" />);
    fireEvent.click(screen.getByRole('link', { name: 'English' }));
    expect(window.gtag).toHaveBeenCalledWith('event', 'language_selected', expect.objectContaining({ page_path: route.pathname, language: 'en' }));
    expect(JSON.stringify(vi.mocked(window.gtag!).mock.calls)).not.toContain('98765');
  });

  it('keeps usable anchors when preference storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    route.pathname = '/hi';
    expect(() => render(<LanguageSwitcher locale="hi" />)).not.toThrow();
    expect(screen.getByRole('link', { name: 'English' }).getAttribute('href')).toBe('/');
    expect(() => fireEvent.click(screen.getByRole('link', { name: 'हिंदी' }))).not.toThrow();
  });
});

describe('Hindi calculator discovery', () => {
  it('supports Hindi and English search and marks calculator destinations as English', async () => {
    render(<ToolsExplorer locale="hi" tools={[
      { slug: 'salary-in-hand-calculator-india', category: 'Salary', name: 'हाथ में आने वाली सैलरी', shortDescription: 'सैलरी का अनुमान', searchTerms: 'salary take home' },
      { slug: 'sip-calculator-india', category: 'Investments', name: 'SIP से बचत', shortDescription: 'निवेश का अनुमान', searchTerms: 'sip investment' },
    ]} />);
    const search = screen.getByRole('searchbox');
    const user = userEvent.setup();
    await user.type(search, 'सैलरी');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/tools/salary-in-hand-calculator-india');
    expect(screen.getByRole('link').textContent).toContain('अंग्रेज़ी में उपलब्ध');
    await user.clear(search);
    await user.type(search, 'investment');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/tools/sip-calculator-india');
    await user.click(screen.getByRole('button', { name: 'सभी कैलकुलेटर दिखाएँ' }));
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
