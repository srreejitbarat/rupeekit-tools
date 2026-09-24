'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeroMotionBackdrop from '@/components/home/HeroMotionBackdrop';

type SearchTool = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
};

export default function CalculatorJumpSearch({ tools }: { tools: SearchTool[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return tools
      .filter((tool) =>
        [tool.name, tool.category, tool.shortDescription]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 5);
  }, [query, tools]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = matches[0];
    if (destination) router.push(`/tools/${destination.slug}`);
  }

  return (
    <>
      <HeroMotionBackdrop />

      <div className="relative mx-auto mt-9 w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="homepage-calculator-search">
            Search calculators
          </label>
          <div className="relative min-w-0 flex-1">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="homepage-calculator-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search EMI, tax, salary, SIP…"
              autoComplete="off"
              className="h-16 w-full rounded-2xl border border-white/30 bg-white pl-14 pr-4 text-base font-semibold text-slate-950 shadow-lg outline-none ring-0 placeholder:text-slate-500 focus:border-brandBrightGreen focus:ring-4 focus:ring-brandBrightGreen/25 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={matches.length === 0}
            className="h-16 rounded-2xl bg-brandGrowthGreen px-8 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brandBrightGreen disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
          >
            Open calculator
          </button>
        </form>

        {query.trim() ? (
          <div className="absolute inset-x-0 top-[4.75rem] z-20 overflow-hidden rounded-2xl border border-brandBorder bg-white shadow-2xl sm:right-48 dark:border-slate-700 dark:bg-slate-900">
            {matches.length ? (
              <ul aria-label="Calculator search results" className="divide-y divide-brandBorder dark:divide-slate-700">
                {matches.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-brandBgSoft dark:hover:bg-slate-800"
                    >
                      <span>
                        <span className="block text-sm font-bold text-brandDeepNavy dark:text-white">
                          {tool.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-brandMuted dark:text-slate-400">
                          {tool.category}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-brandGrowthGreen">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm text-brandMuted dark:text-slate-400">
                No calculator found. Try “loan”, “tax”, or “savings”.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
