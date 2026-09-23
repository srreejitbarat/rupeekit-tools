import { HINDI_PATHS, HINDI_RELEASE_DATE, languageAlternates } from '@/lib/i18n/routing';
import type { MetadataRoute } from 'next';
import { getLiveTools } from '@/lib/tools';
import { blogPosts } from '@/data/all-blog-posts';
import { financialUpdates } from '@/data/financial-updates';
import { day18FinancialUpdates } from '@/data/day18-financial-updates';
import { indexableGovernmentSalaryUpdates } from '@/data/government-salary-updates';
import { allGuides } from '@/data/calculator-guides';
import { PAY_MATRIX_LEVELS } from '@/data/pay-matrix-levels';
import { toolClusters } from '@/data/tool-clusters';
import { moneyGuides } from '@/data/money-authority';
import calculatorScenarios from '@/data/indexable-calculator-scenarios.json';

const STATIC_LAST_MODIFIED = new Date('2026-05-29');
const PAY_MATRIX_LEVEL_LAST_MODIFIED = new Date('2026-08-25');

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
  const allFinancialUpdates = [...day18FinancialUpdates, ...financialUpdates];
  const indexableFinancialUpdates = allFinancialUpdates.filter((update) => update.status !== 'sample');

  const toolDates = liveTools.map((tool) =>
    resolveToolLastModified(tool.lastReviewedIso ?? tool.lastReviewed)
  );
  const guideDates = allGuides.map(
    (guide) => parseIsoDate(guide.lastReviewedIso) ?? STATIC_LAST_MODIFIED
  );
  const blogDates = blogPosts.map(
    (post) =>
      parseIsoDate(post.modifiedDateISO) ??
      parseIsoDate(post.publishedDateISO) ??
      STATIC_LAST_MODIFIED
  );
  const moneyGuideDates = moneyGuides.map((guide) => parseIsoDate(guide.lastReviewedIso) ?? STATIC_LAST_MODIFIED);
  const scenarioDates = calculatorScenarios.map(
    (scenario) => parseIsoDate(scenario.lastModifiedIso) ?? STATIC_LAST_MODIFIED
  );
  const financialUpdateDates = indexableFinancialUpdates.map(
    (update) =>
      parseIsoDate((update as { modifiedDate?: string }).modifiedDate) ??
      parseIsoDate(update.publishedDate) ??
      STATIC_LAST_MODIFIED
  );
  const governmentUpdateDates = indexableGovernmentSalaryUpdates.map(
    (update) =>
      parseIsoDate((update as { modifiedDate?: string }).modifiedDate) ??
      parseIsoDate(update.publishedDate) ??
      STATIC_LAST_MODIFIED
  );

  const latestToolDate = latestDate(toolDates);
  const latestGuideDate = latestDate(guideDates);
  const latestMoneyGuideDate = latestDate(moneyGuideDates);
  const latestBlogDate = latestDate(blogDates);
  const latestFinancialUpdateDate = latestDate(financialUpdateDates);
  const latestGovernmentUpdateDate = latestDate(governmentUpdateDates);
  const latestUpdateDate = latestDate([
    ...financialUpdateDates,
    ...governmentUpdateDates,
  ]);
  const latestSiteDate = latestDate([
    ...toolDates,
    ...guideDates,
    ...moneyGuideDates,
    ...blogDates,
    ...scenarioDates,
    ...financialUpdateDates,
    ...governmentUpdateDates,
  ]);

  const staticRoutes = [
    '',
    '/tools',
    '/tool-hubs',
    '/money-guides',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/editorial-policy',
    '/corrections-policy',
    '/blog',
    '/guides',
    '/resources',
    '/api-docs',
    '/affiliate-disclosure',
    '/money-health-check',
    '/resources/30-day-budget-challenge',
    '/resources/recommended-money-tools',
    '/start-here',
    '/government-salary-updates',
    '/financial-updates',
    '/deadlines',
    '/updates',
    '/nri',
    '/8th-pay-commission',
  ];

  const staticRouteLastModified = new Map<string, Date>([
    ['', latestSiteDate],
    ['/tools', latestToolDate],
    ['/tool-hubs', latestToolDate],
    ['/money-guides', latestMoneyGuideDate],
    ['/guides', latestGuideDate],
    ['/blog', latestBlogDate],
    ['/financial-updates', latestFinancialUpdateDate],
    ['/government-salary-updates', latestGovernmentUpdateDate],
    ['/updates', latestUpdateDate],
  ]);

  const hubRoutes = new Set(['/blog', '/tools', '/tool-hubs', '/money-guides', '/guides', '/nri', '/8th-pay-commission']);
  const lowPriorityRoutes = new Set(['/privacy-policy', '/terms', '/disclaimer', '/affiliate-disclosure']);

  return [
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
    ...HINDI_PATHS.map((route) => ({
      url: languageAlternates(route, 'hi').canonical,
      lastModified: new Date(HINDI_RELEASE_DATE),
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 0.9 : 0.8,
      alternates: { languages: languageAlternates(route, 'hi').languages },
    })),
    ...toolClusters.map((cluster) => ({
      url: `${baseUrl}/tool-hubs/${cluster.slug}`,
      lastModified: latestToolDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
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
    ...calculatorScenarios.map((scenario) => ({
      url: `${baseUrl}/tools/scenarios/${scenario.slug}`,
      lastModified: parseIsoDate(scenario.lastModifiedIso) ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
    ...allGuides.map((guide) => ({
      url: `${baseUrl}/guides/${guide.slug}`,
      lastModified: parseIsoDate(guide.lastReviewedIso) ?? STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
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
    ...PAY_MATRIX_LEVELS.map((entry) => ({
      url: `${baseUrl}/8th-pay-commission/${entry.slug}`,
      lastModified: PAY_MATRIX_LEVEL_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...indexableGovernmentSalaryUpdates.map((u) => {
      const lastModified =
        parseIsoDate((u as { modifiedDate?: string }).modifiedDate) ??
        parseIsoDate(u.publishedDate) ??
        STATIC_LAST_MODIFIED;
      return {
        url: `${baseUrl}/government-salary-updates/${u.slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    }),
  ];
}
