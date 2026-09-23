'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { localizedHref, hasTranslatedPage, type Locale } from '@/lib/i18n/routing';
import { categoryLabel, explorerMessages } from '@/lib/i18n/messages';

type ExplorerTool = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  searchTerms?: string;
};

const CATEGORY_ORDER = [
  'Salary',
  'Tax',
  'Loans',
  'Savings',
  'Investments',
  'Investing',
  'Retirement',
  'Housing',
  'Debt',
  'Planning',
  'Insurance',
  'Business',
];

function slugifyCategory(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Both source categories have the same translated label. Present one filter.
function categoryGroup(category: string, locale: Locale) {
  return locale !== 'en' && category === 'Investments' ? 'Investing' : category;
}

export default function ToolsExplorer({ tools, locale = 'en' }: { tools: ExplorerTool[]; locale?: Locale }) {
  const isLocalized = locale !== 'en';
  const copy = explorerMessages(locale);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(
    () =>
      Array.from(new Set(tools.map((tool) => categoryGroup(tool.category, locale)))).sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(a);
        const bIndex = CATEGORY_ORDER.indexOf(b);
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      }),
    [tools, locale],
  );

  useEffect(() => {
    const selectFromHash = () => {
      const rawHash = window.location.hash.slice(1);
      const hash = locale !== 'en' && rawHash === 'investments' ? 'investing' : rawHash;
      const matchingCategory = categories.find((category) => slugifyCategory(category) === hash);
      if (matchingCategory) setActiveCategory(matchingCategory);
    };

    selectFromHash();
    window.addEventListener('hashchange', selectFromHash);
    return () => window.removeEventListener('hashchange', selectFromHash);
  }, [categories, locale]);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const categoryMatches = activeCategory === 'All' || categoryGroup(tool.category, locale) === activeCategory;
      const searchMatches =
        !normalizedQuery ||
        [tool.name, tool.category, categoryLabel(tool.category, locale), tool.shortDescription, tool.searchTerms]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, query, tools, locale]);

  function selectCategory(category: string) {
    setActiveCategory(category);
    const hash = category === 'All' ? '' : `#${slugifyCategory(category)}`;
    window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
  }

  return (
    <section className="mt-10" aria-label={copy.catalog}>
      <div className="sticky top-[4.5rem] z-30 rounded-3xl border border-brandBorder bg-white/95 p-4 shadow-soft backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 md:p-5">
        <label htmlFor="tools-search" className="text-sm font-black text-brandDeepNavy dark:text-white">
          {copy.search}
        </label>
        <div className="relative mt-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brandMuted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="tools-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.placeholder}
            className="h-12 w-full rounded-2xl border border-brandBorder bg-brandBgSoft pl-12 pr-4 text-sm text-brandText outline-none transition placeholder:text-brandMuted focus:border-brandNavy focus:ring-4 focus:ring-brandNavy/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label={copy.filter}>
          {['All', ...categories].map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                aria-pressed={isActive}
                className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition ${
                  isActive
                    ? 'bg-brandNavy text-white shadow-sm'
                    : 'border border-brandBorder bg-white text-brandText hover:border-brandNavy/40 hover:text-brandNavy dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-white'
                }`}
              >
                {categoryLabel(category, locale)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-brandMuted dark:text-slate-400" aria-live="polite">
          {filteredTools.length} {isLocalized ? copy.count : filteredTools.length === 1 ? 'calculator' : 'calculators'}
          {activeCategory !== 'All' ? isLocalized ? ` · ${categoryLabel(activeCategory, locale)}` : ` in ${activeCategory}` : ''}
        </p>
        {activeCategory !== 'All' || query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              selectCategory('All');
            }}
            className="min-h-11 text-sm font-bold text-brandNavy hover:underline dark:text-brandBrightGreen"
          >
            {copy.clear}
          </button>
        ) : null}
      </div>

      {filteredTools.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={localizedHref(`/tools/${tool.slug}`, locale)}
              hrefLang={isLocalized && hasTranslatedPage(`/tools/${tool.slug}`, locale) ? `${locale}-IN` : 'en-IN'}
              className="group flex min-h-64 flex-col rounded-3xl border border-brandBorder bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brandNavy/30 hover:shadow-cardHover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
            >
              <span className="w-fit rounded-full bg-brandNavy/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-brandNavy dark:bg-brandBrightGreen/10 dark:text-brandBrightGreen">
                {categoryLabel(tool.category, locale)}
              </span>
              <h2 className="mt-5 text-lg font-black leading-snug text-brandDeepNavy transition group-hover:text-brandNavy dark:text-white dark:group-hover:text-brandBrightGreen">
                {tool.name}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-brandMuted dark:text-slate-400">
                {tool.shortDescription}
              </p>
              <span className="mt-auto flex items-center gap-2 border-t border-brandBorder pt-5 text-sm font-black text-brandGrowthGreen dark:border-slate-800 dark:text-brandBrightGreen">
                {copy.open} <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
              </span>
              {isLocalized && !hasTranslatedPage(`/tools/${tool.slug}`, locale) ? <span className="mt-2 text-xs leading-6 text-brandMuted dark:text-slate-400">{copy.english}</span> : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-dashed border-brandBorder bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-black text-brandDeepNavy dark:text-white">{copy.empty}</h2>
          <p className="mt-2 text-sm text-brandMuted dark:text-slate-400">
            {copy.retry}
          </p>
        </div>
      )}
    </section>
  );
}
