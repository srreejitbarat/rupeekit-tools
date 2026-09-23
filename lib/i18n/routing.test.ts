import { describe, expect, it } from 'vitest';
import { englishPath, hasHindiPage, localizedHref, languageAlternates, HINDI_PATHS } from './routing';
import { getLiveTools } from '../tools';
import { hindiToolCatalog } from '../../data/hi/tool-catalog';
import { categoryLabel } from './messages';
import sitemap from '../../app/sitemap';

describe('published language pairs', () => {
  it('round-trips translated URLs while retaining queries and anchors', () => {
    expect(localizedHref('/tools?q=SIP#investing', 'hi')).toBe('/hi/tools?q=SIP#investing');
    expect(localizedHref('/hi/tools?q=SIP#investing', 'en')).toBe('/tools?q=SIP#investing');
    expect(localizedHref('/', 'hi')).toBe('/hi');
    expect(englishPath('/hi/')).toBe('/');
    expect(englishPath('/history')).toBe('/history');
  });

  it('does not invent Hindi pages or modify external URLs', () => {
    const calculator = '/tools/sip-calculator-india';
    expect(hasHindiPage(calculator)).toBe(false);
    expect(localizedHref(calculator, 'hi')).toBe(calculator);
    expect(localizedHref('https://example.com/hi', 'hi')).toBe('https://example.com/hi');
    expect(localizedHref('//example.com/hi', 'hi')).toBe('//example.com/hi');
    expect(languageAlternates(calculator).languages).toBeUndefined();
  });

  it('publishes self-canonicals and reciprocal alternates only for translated pages', () => {
    const routes = sitemap();
    expect(new Set(routes.map((entry) => entry.url)).size).toBe(routes.length);
    for (const path of HINDI_PATHS) {
      const en = languageAlternates(path);
      const hi = languageAlternates(path, 'hi');
      expect(hi.canonical).not.toBe(en.canonical);
      expect(en.languages).toEqual(hi.languages);
      expect(en.languages?.['x-default']).toBe(en.canonical);
      for (const metadata of [en, hi]) {
        expect(routes.find((entry) => entry.url === metadata.canonical)?.alternates?.languages).toEqual(metadata.languages);
      }
    }
    expect(routes.filter((entry) => new URL(entry.url).pathname.startsWith('/hi')).length).toBe(HINDI_PATHS.length);
  });

  it('has Hindi discovery copy for every live calculator and category', () => {
    for (const tool of getLiveTools()) {
      expect(hindiToolCatalog[tool.slug], tool.slug).toBeDefined();
      expect(hindiToolCatalog[tool.slug].name).toMatch(/[\u0900-\u097f]/);
      expect(hindiToolCatalog[tool.slug].shortDescription).toMatch(/[\u0900-\u097f]/);
      expect(categoryLabel(tool.category, 'hi')).toMatch(/[\u0900-\u097f]/);
    }
  });
});
