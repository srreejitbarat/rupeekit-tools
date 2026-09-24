import { describe, expect, it } from 'vitest';
import { englishPath, hasTranslatedPage, localizedHref, languageAlternates, LOCALES, PUBLISHED_TRANSLATIONS } from './routing';
import { getLiveTools } from '../tools';
import { hindiToolCatalog } from '../../data/hi/tool-catalog';
import { bengaliToolCatalog } from '../../data/bn/tool-catalog';
import { categoryLabel } from './messages';
import sitemap from '../../app/sitemap';

describe('published translations', () => {
  it('round-trips translated URLs while retaining queries and anchors', () => {
    expect(localizedHref('/tools?q=SIP#investing', 'hi')).toBe('/hi/tools?q=SIP#investing');
    expect(localizedHref('/hi/tools?q=SIP#investing', 'en')).toBe('/tools?q=SIP#investing');
    expect(localizedHref('/hi/tools?q=SIP#investing', 'bn')).toBe('/bn/tools?q=SIP#investing');
    expect(localizedHref('/bn/tools?q=SIP#investing', 'hi')).toBe('/hi/tools?q=SIP#investing');
    expect(localizedHref('/bn/tools?q=SIP#investing', 'en')).toBe('/tools?q=SIP#investing');
    expect(localizedHref('/', 'hi')).toBe('/hi');
    expect(localizedHref('/', 'bn')).toBe('/bn');
    expect(englishPath('/hi/')).toBe('/');
    expect(englishPath('/bn/')).toBe('/');
    expect(englishPath('/history')).toBe('/history');
  });

  it('does not invent translated pages or modify external URLs', () => {
    const calculator = '/tools/not-a-real-calculator';
    for (const locale of ['hi', 'bn'] as const) {
      expect(hasTranslatedPage(calculator, locale)).toBe(false);
      expect(localizedHref(calculator, locale)).toBe(calculator);
      expect(localizedHref('https://example.com/hi', locale)).toBe('https://example.com/hi');
      expect(localizedHref('//example.com/hi', locale)).toBe('//example.com/hi');
    }
    expect(languageAlternates(calculator).languages).toBeUndefined();
  });

  it('publishes self-canonicals and reciprocal alternates only for translated pages', () => {
    const routes = sitemap();
    expect(new Set(routes.map((entry) => entry.url)).size).toBe(routes.length);
    for (const path of ['/', '/tools']) {
      const en = languageAlternates(path);
      const translations = LOCALES.map((locale) => languageAlternates(path, locale));
      expect(new Set(translations.map((metadata) => metadata.canonical)).size).toBe(3);
      expect(Object.keys(en.languages!)).toEqual(['en-IN', 'hi-IN', 'bn-IN', 'x-default']);
      expect(en.languages?.['x-default']).toBe(en.canonical);
      for (const metadata of translations) {
        expect(metadata.languages).toEqual(en.languages);
        expect(routes.find((entry) => entry.url === metadata.canonical)?.alternates?.languages).toEqual(metadata.languages);
      }
    }
    for (const locale of ['hi', 'bn'] as const) {
      expect(routes.filter((entry) => new URL(entry.url).pathname.startsWith(`/${locale}`)).length).toBe(PUBLISHED_TRANSLATIONS[locale].length);
    }
  });

  it('has Hindi discovery copy for every live calculator and category', () => {
    for (const tool of getLiveTools()) {
      expect(hindiToolCatalog[tool.slug], tool.slug).toBeDefined();
      expect(hindiToolCatalog[tool.slug].name).toMatch(/[\u0900-\u097f]/);
      expect(hindiToolCatalog[tool.slug].shortDescription).toMatch(/[\u0900-\u097f]/);
      expect(categoryLabel(tool.category, 'hi')).toMatch(/[\u0900-\u097f]/);
    }
  });

  it('has Bengali discovery copy for every live calculator and category', () => {
    for (const tool of getLiveTools()) {
      expect(bengaliToolCatalog[tool.slug], tool.slug).toBeDefined();
      expect(bengaliToolCatalog[tool.slug].name).toMatch(/[\u0980-\u09ff]/);
      expect(bengaliToolCatalog[tool.slug].shortDescription).toMatch(/[\u0980-\u09ff]/);
      expect(categoryLabel(tool.category, 'bn')).toMatch(/[\u0980-\u09ff]/);
    }
  });
});
