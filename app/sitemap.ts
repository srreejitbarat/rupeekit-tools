import { PUBLISHED_TRANSLATIONS, LANGUAGE_RELEASE_DATE, type Locale, isIndexedLocale, languageAlternates } from '@/lib/i18n/routing';
import type { MetadataRoute } from 'next';
import { getLiveTools } from '@/lib/tools';
import { blogPosts } from '@/data/all-blog-posts';
import { financialUpdates } from '@/data/financial-updates';
import { moneyGuides } from '@/data/money-authority';
import { TAX_DEADLINES_LAST_REVIEWED } from '@/data/tax-deadlines';

const STATIC_LAST_MODIFIED = new Date('2026-05-29');

function parseIsoDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveToolLastModified(lastReviewed?: string): Date {
  if (!lastReviewed) return STATIC_LAST_MODIFIED;
  const trimmed = lastReviewed.trim();
  if (/^[A-Za-z]+\s+\d{4}$/.test(trimmed)) {
    return STATIC_LAST_MODIFIED;
  }
  return parseIsoDate(trimmed) ?? STATIC_LAST_MODIFIED;
}

function latestDate(dates: Date[], fallback = STATIC_LAST_MODIFIED): Date {
  if (dates.length === 0) return fallback;
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
  const liveTools = getLiveTools();
  const allFinancialUpdates = [...financialUpdates];
  const indexableFinancialUpdates = allFinancialUpdates.filter((update) => update.status !== 'sample');

  const toolDates = liveTools.map((tool) =>
    resolveToolLastModified(tool.lastReviewedIso ?? tool.lastReviewed)
  );
  const blogDates = blogPosts.map(
    (post) =>
      parseIsoDate(post.modifiedDateISO) ??
      parseIsoDate(post.publishedDateISO) ??
      STATIC_LAST_MODIFIED
  );
  const moneyGuideDates = moneyGuides.map((guide) => parseIsoDate(guide.lastReviewedIso) ?? STATIC_LAST_MODIFIED);
  const financialUpdateDates = indexableFinancialUpdates.map(
    (update) =>
      parseIsoDate((update as { modifiedDate?: string }).modifiedDate) ??
      parseIsoDate(update.publishedDate) ??
      STATIC_LAST_MODIFIED
  );

  const latestToolDate = latestDate(toolDates);
  const latestBlogDate = latestDate(blogDates);
  const latestFinancialUpdateDate = latestDate(financialUpdateDates);
  const latestSiteDate = latestDate([
    ...toolDates,
    ...moneyGuideDates,
    ...blogDates,
    ...financialUpdateDates,
  ]);

  const staticRoutes = [
    '',
    '/tools',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/editorial-policy',
    '/corrections-policy',
    '/blog',
    '/api-docs',
    '/affiliate-disclosure',
    '/financial-updates',
    '/deadlines',
    '/nri',
    '/8th-pay-commission',
  ];

  const staticRouteLastModified = new Map<string, Date>([
    ['', latestSiteDate],
    ['/tools', latestToolDate],
    ['/blog', latestBlogDate],
    ['/financial-updates', latestFinancialUpdateDate],
    ['/deadlines', new Date(TAX_DEADLINES_LAST_REVIEWED)],
  ]);

  const hubRoutes = new Set(['/blog', '/tools', '/nri', '/8th-pay-commission']);
  const lowPriorityRoutes = new Set(['/privacy-policy', '/terms', '/disclaimer', '/affiliate-disclosure']);

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: staticRouteLastModified.get(route) ?? STATIC_LAST_MODIFIED,
      ...(languageAlternates(route || '/').languages ? { alternates: { languages: languageAlternates(route || '/').languages } } : {}),
      changeFrequency: (
        route === '' ? 'daily' :
        hubRoutes.has(route) ? 'weekly' :
        'monthly'
      ) as 'daily' | 'weekly' | 'monthly' | 'yearly',
      priority:
        route === '' ? 1 :
        hubRoutes.has(route) ? 0.8 :
        lowPriorityRoutes.has(route) ? 0.3 :
        0.5,
    })),
    ...Object.entries(PUBLISHED_TRANSLATIONS).filter(([locale]) => isIndexedLocale(locale as Locale)).flatMap(([locale, routes]) => routes.map((route) => ({
      url: languageAlternates(route, locale as Locale).canonical,
      lastModified: new Date(LANGUAGE_RELEASE_DATE),
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 0.9 : 0.8,
      alternates: { languages: languageAlternates(route, locale as Locale).languages },
    }))),
    ...moneyGuides.map((guide) => ({
      url: `${baseUrl}/money-guides/${guide.slug}`,
      lastModified: parseIsoDate(guide.lastReviewedIso) ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
    ...liveTools.map((tool) => {
      const lastModified = resolveToolLastModified(tool.lastReviewedIso ?? tool.lastReviewed);
      return {
        url: `${baseUrl}/tools/${tool.slug}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    }),
    ...blogPosts.map((post) => {
      const lastModified =
        parseIsoDate(post.modifiedDateISO) ??
        parseIsoDate(post.publishedDateISO) ??
        STATIC_LAST_MODIFIED;
      return {
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    }),
    ...indexableFinancialUpdates.map((u) => {
      const lastModified =
        parseIsoDate((u as { modifiedDate?: string }).modifiedDate) ??
        parseIsoDate(u.publishedDate) ??
        STATIC_LAST_MODIFIED;
      return {
        url: `${baseUrl}/financial-updates/${u.slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    }),
  ];
  return entries.map(entry => ({...entry, alternates: {languages: languageAlternates(new URL(entry.url).pathname).languages}}));
}
