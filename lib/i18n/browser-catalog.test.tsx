import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { createTranslator } from './translator';
import { addTranslations, registerTranslator } from './registry';

describe('browser catalog slices', () => {
  it('translates strings registered after creation, including templates', () => {
    const hi = createTranslator('hi', {});
    expect(hi.text('Monthly investment')).toBe('Monthly investment');
    hi.add({ 'Monthly investment': 'मासिक निवेश', 'Monthly EMI: ZXQ0QXZ': 'मासिक EMI: ZXQ0QXZ' });
    expect(hi.text('Monthly investment')).toBe('मासिक निवेश');
    expect(hi.text('Monthly EMI: Rs 12,000')).toBe('मासिक EMI: Rs 12,000');
  });

  it('collects translations for client props without touching machine values', () => {
    const server = createTranslator('hi', { 'Annual income': 'वार्षिक आय', 'Tax calculator': 'कर कैलकुलेटर' });
    const dict = server.collect({ label: 'Annual income', key: 'annualIncome', nested: [{ title: 'Tax calculator' }], amount: 5000 });
    expect(dict).toEqual({ 'Annual income': 'वार्षिक आय', 'Tax calculator': 'कर कैलकुलेटर' });
  });

  it('passes prop translations to the client scope before the child renders', () => {
    const browser = createTranslator('hi', {});
    const ClientScope = ({ dict, children }: { dict: Record<string, string>; children?: ReactNode }) => {
      browser.add(dict);
      return <>{children}</>;
    };
    const server = createTranslator('hi', { 'Annual income': 'वार्षिक आय' }, ClientScope);
    const Child = ({ label }: { label: string }) => <span>{browser.text(label)}</span>;
    expect(renderToStaticMarkup(<server.Scope><Child label="Annual income" /></server.Scope>)).toBe('<span>वार्षिक आय</span>');
  });

  it('keeps translations that arrive before the locale translator registers', () => {
    addTranslations('bn', { 'Annual income': 'বার্ষিক আয়' });
    const bn = createTranslator('bn', {});
    registerTranslator('bn', bn);
    expect(bn.text('Annual income')).toBe('বার্ষিক আয়');
  });

  it('formats dates identically on any runtime', () => {
    const hi = createTranslator('hi', {}), bn = createTranslator('bn', {});
    expect(bn.date(new Date('2026-01-15'), { month: 'long', year: 'numeric', timeZone: 'UTC' })).toBe('জানুয়ারি 2026');
    expect(hi.date('2026-09-24', { day: 'numeric', month: 'long', year: 'numeric' })).toBe('24 सितंबर 2026');
    expect(bn.date('2026-09-24', { day: 'numeric', month: 'long', year: 'numeric' })).toBe('24 সেপ্টেম্বর, 2026');
    // 20:00 UTC is already the next day in India.
    expect(hi.date('2026-09-24T20:00:00Z', { day: 'numeric', month: 'short', year: 'numeric' })).toBe('25 सितंबर 2026');
  });
});
