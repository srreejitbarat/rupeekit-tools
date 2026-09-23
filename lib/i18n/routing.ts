export type Locale = 'en' | 'hi';

// Register a route only after its visible content is translated. This list also
// controls the switcher, alternate links and sitemap; no English-only /hi copies.
export const HINDI_PATHS = ['/', '/tools'] as const;
export const HINDI_RELEASE_DATE = '2026-09-23';
export const LANGUAGE_PREFERENCE_KEY = 'rupeekit-language';

export function englishPath(pathname: string): string {
  const path = pathname.replace(/\/$/, '') || '/';
  return path === '/hi' ? '/' : path.startsWith('/hi/') ? path.slice(3) : path;
}

export function hasHindiPage(pathname: string): boolean {
  return HINDI_PATHS.some((path) => path === englishPath(pathname));
}

export function localizedHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const [pathname] = href.split(/[?#]/, 1);
  const suffix = href.slice(pathname.length);
  const path = englishPath(pathname);
  if (locale === 'hi' && hasHindiPage(path)) {
    return `${path === '/' ? '/hi' : `/hi${path}`}${suffix}`;
  }
  return `${path}${suffix}`;
}

export function languageAlternates(pathname: string, locale: Locale = 'en') {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
  const absolute = (language: Locale) => {
    const path = localizedHref(pathname, language);
    return path === '/' ? baseUrl : `${baseUrl}${path}`;
  };
  return {
    canonical: absolute(locale),
    ...(hasHindiPage(pathname) ? {
      languages: { 'en-IN': absolute('en'), 'hi-IN': absolute('hi'), 'x-default': absolute('en') },
    } : {}),
  };
}
