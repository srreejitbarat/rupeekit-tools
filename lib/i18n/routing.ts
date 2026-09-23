export const LOCALES = ['en', 'hi', 'bn'] as const;
export type Locale = typeof LOCALES[number];
export const LOCALE_TAGS: Record<Locale, string> = { en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN' };
export const LOCALE_LABELS: Record<Locale, string> = { en: 'English', hi: 'हिंदी', bn: 'বাংলা' };

// Register each language independently, only after its visible content is
// translated. Never publish an English-only copy under a translated URL.
export const PUBLISHED_TRANSLATIONS = {
  hi: ['/', '/tools'],
  bn: ['/', '/tools'],
} as const;
export const LANGUAGE_RELEASE_DATE = '2026-09-23';
export const LANGUAGE_PREFERENCE_KEY = 'rupeekit-language';

export function englishPath(pathname: string): string {
  const path = pathname.replace(/\/$/, '') || '/';
  for (const locale of ['hi', 'bn']) {
    if (path === `/${locale}`) return '/';
    if (path.startsWith(`/${locale}/`)) return path.slice(locale.length + 1);
  }
  return path;
}

export function hasTranslatedPage(pathname: string, locale: Locale): boolean {
  if (locale === 'en') return true;
  return PUBLISHED_TRANSLATIONS[locale].some((path) => path === englishPath(pathname));
}

export function localizedHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const [pathname] = href.split(/[?#]/, 1);
  const suffix = href.slice(pathname.length);
  const path = englishPath(pathname);
  if (locale !== 'en' && hasTranslatedPage(path, locale)) {
    return `${path === '/' ? `/${locale}` : `/${locale}${path}`}${suffix}`;
  }
  return `${path}${suffix}`;
}

export function languageAlternates(pathname: string, locale: Locale = 'en') {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
  const absolute = (language: Locale) => {
    const path = localizedHref(pathname, language);
    return path === '/' ? baseUrl : `${baseUrl}${path}`;
  };
  const available = LOCALES.filter((language) => hasTranslatedPage(pathname, language));
  const languages: Record<string, string> = Object.fromEntries(available.map((language) => [LOCALE_TAGS[language], absolute(language)]));
  languages['x-default'] = absolute('en');
  return { canonical: absolute(locale), ...(available.length > 1 ? { languages } : {}) };
}
