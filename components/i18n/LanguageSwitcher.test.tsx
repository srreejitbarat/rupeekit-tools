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
    expect(screen.getByRole('link', { name: 'বাংলা' }).getAttribute('href')).toBe('/bn/tools?q=SIP#investing');
    expect(screen.getByRole('link', { name: 'English' }).getAttribute('aria-current')).toBe('page');
  });

  it('connects Bengali to the matching Hindi and English pages', () => {
    route.pathname = '/bn/tools';
    window.history.replaceState(null, '', '/bn/tools#investing');
    render(<LanguageSwitcher locale="bn" />);
    expect(screen.getByRole('link', { name: 'বাংলা' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'English' }).getAttribute('href')).toBe('/tools#investing');
    expect(screen.getByRole('link', { name: 'हिंदी' }).getAttribute('href')).toBe('/hi/tools#investing');
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBe('bn');
  });

  it.each([
    ['hi', 'हिंदी के विकल्प / Hindi options', 'यह पेज अभी अंग्रेज़ी में उपलब्ध है', 'इसी पेज पर रहें', 'हिंदी होमपेज खोलें'],
    ['bn', 'বাংলা ভাষার বিকল্প / Bengali options', 'এই পেজটি এখন ইংরেজিতে আছে', 'এই পেজেই থাকুন', 'বাংলা হোমপেজ খুলুন'],
  ])('offers an honest %s fallback without losing form values and restores focus', async (language, options, title, stay, home) => {
    route.pathname = '/tools/not-a-real-calculator';
    const user = userEvent.setup();
    render(<><input aria-label="Amount" defaultValue="5000" /><LanguageSwitcher locale="en" /></>);
    const amount = screen.getByRole('textbox', { name: 'Amount' });
    await user.clear(amount);
    await user.type(amount, '7500');
    const trigger = screen.getByRole('link', { name: options });
    await user.click(trigger);
    expect(screen.getByRole('dialog').textContent).toContain(title);
    expect(screen.getByRole('link', { name: home }).getAttribute('href')).toBe(`/${language}`);
    expect(localStorage.getItem(LANGUAGE_PREFERENCE_KEY)).toBeNull();
    await user.click(screen.getByRole('button', { name: stay }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect((amount as HTMLInputElement).value).toBe('7500');
    expect(document.activeElement).toBe(trigger);
  });

  it.each([['hi', 'हिंदी'], ['bn', 'বাংলা']])('remembers %s without redirects and allows choosing English immediately', async (language, label) => {
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    render(<><LanguageSwitcher locale="en" /><LanguagePreferenceNotice /></>);
    expect(screen.getByRole('complementary').textContent).toContain(label);
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

  it.each(['hi', 'bn'] as const)('keeps usable %s anchors when preference storage is blocked', (locale) => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    route.pathname = `/${locale}`;
    expect(() => render(<LanguageSwitcher locale={locale} />)).not.toThrow();
    expect(screen.getByRole('link', { name: 'English' }).getAttribute('href')).toBe('/');
    expect(() => fireEvent.click(screen.getByRole('link', { name: locale === 'bn' ? 'বাংলা' : 'हिंदी' }))).not.toThrow();
  });
});

describe('translated calculator discovery', () => {
  it.each([['hi', 'निवेश', 'सभी'], ['bn', 'বিনিয়োগ', 'সব']] as const)('combines the investment categories for %s and accepts the English anchor', async (locale, investment, all) => {
    window.history.replaceState(null, '', `/${locale}/tools#investments`);
    render(<ToolsExplorer locale={locale} tools={[
      { slug: 'sip-calculator-india', category: 'Investments', name: 'SIP', shortDescription: 'निवेश' },
      { slug: 'cagr-calculator-india', category: 'Investing', name: 'CAGR', shortDescription: 'रिटर्न' },
      { slug: 'fd-calculator-india', category: 'Savings', name: 'FD', shortDescription: 'बचत' },
    ]} />);
    expect(screen.getAllByRole('button', { name: investment })).toHaveLength(1);
    expect(screen.getByRole('button', { name: investment }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    await userEvent.setup().click(screen.getByRole('button', { name: all }));
    expect(screen.getAllByRole('link')).toHaveLength(3);
    await userEvent.setup().click(screen.getByRole('button', { name: investment }));
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('supports Hindi and English search and links to matching Hindi calculators', async () => {
    render(<ToolsExplorer locale="hi" tools={[
      { slug: 'salary-in-hand-calculator-india', category: 'Salary', name: 'हाथ में आने वाली सैलरी', shortDescription: 'सैलरी का अनुमान', searchTerms: 'salary take home' },
      { slug: 'sip-calculator-india', category: 'Investments', name: 'SIP से बचत', shortDescription: 'निवेश का अनुमान', searchTerms: 'sip investment' },
    ]} />);
    const search = screen.getByRole('searchbox');
    const user = userEvent.setup();
    await user.type(search, 'सैलरी');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/hi/tools/salary-in-hand-calculator-india');
    expect(screen.getByRole('link').textContent).not.toContain('अंग्रेज़ी में उपलब्ध');
    await user.clear(search);
    await user.type(search, 'investment');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/hi/tools/sip-calculator-india');
    await user.click(screen.getByRole('button', { name: 'सभी कैलकुलेटर दिखाएँ' }));
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('supports Bengali and English search with matching Bengali destinations', async () => {
    render(<ToolsExplorer locale="bn" tools={[
      { slug: 'salary-in-hand-calculator-india', category: 'Salary', name: 'হাতে পাওয়া বেতন', shortDescription: 'বেতনের অনুমান', searchTerms: 'salary take home' },
      { slug: 'sip-calculator-india', category: 'Investments', name: 'SIP-এ সঞ্চয়', shortDescription: 'বিনিয়োগের হিসাব', searchTerms: 'sip investment' },
    ]} />);
    const search = screen.getByRole('searchbox', { name: 'ক্যালকুলেটর খুঁজুন' });
    const user = userEvent.setup();
    await user.type(search, 'বেতন');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/bn/tools/salary-in-hand-calculator-india');
    expect(screen.getByRole('link').getAttribute('hrefLang')).toBe('bn-IN');
    expect(screen.getByRole('link').textContent).not.toContain('ইংরেজিতে পাওয়া যাবে');
    await user.clear(search);
    await user.type(search, 'investment');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/bn/tools/sip-calculator-india');
    await user.click(screen.getByRole('button', { name: 'সব ক্যালকুলেটর দেখান' }));
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
