import { blogPosts } from '@/data/all-blog-posts';
import { day18FinancialUpdates } from '@/data/day18-financial-updates';
import { financialUpdates } from '@/data/financial-updates';
import hindiCatalog from '@/lib/i18n/catalogs/hi.json';
import bengaliCatalog from '@/lib/i18n/catalogs/bn.json';
import { LANGUAGE_RELEASE_DATE, hasTranslatedPage, type Locale } from '@/lib/i18n/routing';

type Entry = { url: string; title: string; description: string; date: Date; sourceDate: Date };

const catalogs: Record<'hi' | 'bn', Record<string, string>> = {
  hi: hindiCatalog,
  bn: bengaliCatalog,
};
const scripts = { hi: /[\u0900-\u097f]/, bn: /[\u0980-\u09ff]/ };
const languageNames = { en: 'English', hi: 'हिंदी', bn: 'বাংলা' };
const descriptions = {
  en: 'Recently published and updated RupeeKit personal finance articles for India.',
  hi: 'भारत के लिए रुपीकिट के हाल में प्रकाशित और अपडेट किए गए पर्सनल फाइनेंस लेख।',
  bn: 'ভারতের জন্য রুপীকিটের সম্প্রতি প্রকাশিত ও হালনাগাদ ব্যক্তিগত অর্থবিষয়ক লেখা।',
};

function validDate(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value.slice(0, 10) ? null : date;
}

function escapeXml(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function translate(source: string, locale: Locale): string | null {
  if (locale === 'en') return source;
  const result = catalogs[locale][source.replace(/\s+/g, ' ').trim()];
  return result && scripts[locale].test(result) ? result : null;
}

/** RSS contains only dated, published articles with translated titles and summaries. */
export function buildRssFeed(locale: Locale): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
  const feedPath = locale === 'en' ? '/feed.xml' : `/${locale}/feed.xml`;
  const releaseDate = validDate(LANGUAGE_RELEASE_DATE)!;
  const entries: Entry[] = [];

  function add(path: string, titleSource: string, descriptionSource: string, dateSource?: string) {
    const sourceDate = validDate(dateSource);
    if (!sourceDate || sourceDate.valueOf() > Date.now()) return;
    if (locale !== 'en' && !hasTranslatedPage(path, locale)) return;
    const title = translate(titleSource, locale);
    const description = translate(descriptionSource, locale);
    if (!title || !description) return;
    const date = locale === 'en' || sourceDate > releaseDate ? sourceDate : releaseDate;
    const url = `${base}${locale === 'en' ? '' : `/${locale}`}${path}`;
    entries.push({ url, title, description, date, sourceDate });
  }

  for (const post of blogPosts) {
    add(`/blog/${post.slug}`, post.title, post.metaDescription, post.modifiedDateISO || post.publishedDateISO);
  }
  for (const update of [...day18FinancialUpdates, ...financialUpdates]) {
    if (update.status === 'sample') continue;
    add(`/financial-updates/${update.slug}`, update.title, update.summary, update.modifiedDate || update.publishedDate);
  }

  // A fixed cap keeps the feed useful to readers without presenting it as a full sitemap.
  entries.sort((a, b) => b.date.valueOf() - a.date.valueOf() || b.sourceDate.valueOf() - a.sourceDate.valueOf() || a.url.localeCompare(b.url));
  const recent = entries.slice(0, 50);
  const title = `RupeeKit — ${languageNames[locale]}`;
  const home = `${base}${locale === 'en' ? '' : `/${locale}`}`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n` +
    `<title>${escapeXml(title)}</title>\n<link>${escapeXml(home)}</link>\n` +
    `<description>${escapeXml(descriptions[locale])}</description>\n` +
    `<language>${locale}-IN</language>\n` +
    `<atom:link href="${escapeXml(base + feedPath)}" rel="self" type="application/rss+xml" />\n` +
    recent.map(({ url, title: itemTitle, description, date }) =>
      `<item><title>${escapeXml(itemTitle)}</title><link>${escapeXml(url)}</link>` +
      `<guid isPermaLink="true">${escapeXml(url)}</guid>` +
      `<description>${escapeXml(description)}</description><pubDate>${date.toUTCString()}</pubDate></item>`
    ).join('\n') + `\n</channel>\n</rss>\n`;
}
