import { languageAlternates } from '@/lib/i18n/routing';
import type { Metadata } from 'next';
import Link from 'next/link';
import CalculatorJumpSearch from '@/components/home/CalculatorJumpSearch';
import { blogPosts } from '@/data/all-blog-posts';
import { getLiveTools, type Tool } from '@/lib/tools';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export const metadata: Metadata = {
  title: { absolute: 'RupeeKit - Free India Salary & Finance Calculators' },
  description:
    'Use free India-focused calculators, beginner guides, and visual breakdowns to estimate salary, loans, savings, tax, and everyday money decisions.',
  alternates: languageAlternates('/'),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: 'RupeeKit - Free India Salary & Finance Calculators',
    description:
      'Use free India-focused calculators, beginner guides, and visual breakdowns to estimate salary, loans, savings, tax, and everyday money decisions.',
    url: SITE_URL,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN', 'bn_IN'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RupeeKit - Free India Salary & Finance Calculators',
    description: 'Free India-focused calculators for salary, tax, loans, savings and investing.',
  },
};

type CategoryGroup = {
  name: string;
  description: string;
  sourceCategories: string[];
  iconPath: string;
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: 'Loans',
    description: 'EMIs, affordability and the real cost of borrowing.',
    sourceCategories: ['Loans'],
    iconPath: 'M4 10h16M6 10V7l6-3 6 3v3M6 10v8m4-8v8m4-8v8m4-8v8M4 20h16',
  },
  {
    name: 'Savings',
    description: 'Build buffers and make deposits work harder.',
    sourceCategories: ['Savings'],
    iconPath: 'M5 9a7 7 0 0 1 14 0v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2h4m9-5 2-2m-8 5h4',
  },
  {
    name: 'Tax',
    description: 'Compare regimes, deductions and tax outcomes.',
    sourceCategories: ['Tax'],
    iconPath: 'M6 3h9l3 3v15H6V3Zm8 0v4h4M9 11h6M9 15h6',
  },
  {
    name: 'Salary',
    description: 'Understand take-home pay and salary structure.',
    sourceCategories: ['Salary'],
    iconPath: 'M4 7h16v11H4V7Zm4 0V5h8v2m-5 5h2m-9 1c5 2 11 2 16 0',
  },
  {
    name: 'Retirement',
    description: 'Plan income, pensions and long-term security.',
    sourceCategories: ['Retirement'],
    iconPath: 'M12 3v18m5-14H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H6',
  },
  {
    name: 'Housing',
    description: 'Make clearer rent, buy and home-loan decisions.',
    sourceCategories: ['Housing'],
    iconPath: 'm3 11 9-7 9 7M5 10v10h14V10m-9 10v-6h4v6',
  },
  {
    name: 'Investing',
    description: 'Model SIPs, returns and market-linked goals.',
    sourceCategories: ['Investing', 'Investments'],
    iconPath: 'M4 18 9 13l3 3 7-9m-5 0h5v5',
  },
  {
    name: 'Debt',
    description: 'Compare payoff paths and escape expensive debt.',
    sourceCategories: ['Debt'],
    iconPath: 'M7 7h10M7 12h7M7 17h4M4 3h16v18H4V3Z',
  },
  {
    name: 'Planning',
    description: 'Prepare for protection, milestones and trade-offs.',
    sourceCategories: ['Planning', 'Insurance'],
    iconPath: 'M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4',
  },
];

function toolsForGroup(tools: Tool[], group: CategoryGroup) {
  return tools.filter((tool) => group.sourceCategories.includes(tool.category));
}

export default function HomePage() {
  const tools = getLiveTools();
  const recentPosts = [...blogPosts]
    .sort((a, b) =>
      (b.publishedDateISO || b.date).localeCompare(a.publishedDateISO || a.date),
    )
    .slice(0, 3);

  return (
    <div className="pb-8 md:pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-950 text-white">
        <div aria-hidden="true" className="absolute -left-36 top-32 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-brandBrightGreen/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center md:px-6 md:py-24">
          <div className="w-full max-w-5xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brandBrightGreen">
              Money math, made useful
            </p>
            <h1
              className="mx-auto mt-5 max-w-5xl text-4xl font-extrabold leading-[0.98] tracking-[-0.035em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif' }}
            >
              One wrong number can change the decision.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-200 md:text-xl md:leading-8">
              Check your EMI, tax, take-home salary, SIP and savings numbers before you decide —
              free India-focused calculators, private by default, with no signup required.
            </p>

            <CalculatorJumpSearch
              tools={tools.map(({ slug, name, category, shortDescription }) => ({
                slug,
                name,
                category,
                shortDescription,
              }))}
            />

            <div className="mx-auto mt-8 grid w-full max-w-4xl grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/10 py-5 backdrop-blur-sm">
              <div className="px-3 text-center md:px-6">
                <strong className="block text-xl font-black text-white md:text-3xl">{tools.length}</strong>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-slate-300">Calculators</span>
              </div>
              <div className="px-3 text-center md:px-6">
                <strong className="block text-xl font-black text-white md:text-3xl">{CATEGORY_GROUPS.length}</strong>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-slate-300">Money goals</span>
              </div>
              <div className="px-3 text-center md:px-6">
                <strong className="block text-xl font-black text-white md:text-3xl">₹0</strong>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-slate-300">No signup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-14 md:px-6 md:py-20">
        <section id="calculators" className="scroll-mt-28">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brandGrowthGreen dark:text-brandBrightGreen">
                Browse by goal
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brandDeepNavy dark:text-white md:text-4xl">
                Start with the decision in front of you
              </h2>
              <p className="mt-3 text-sm leading-7 text-brandMuted dark:text-slate-400 md:text-base">
                Each category opens into focused tools, so you can move from a question to a useful
                estimate without hunting through a flat directory.
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-brandNavy hover:underline dark:text-brandBrightGreen"
            >
              View all calculators <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {CATEGORY_GROUPS.map((group) => {
              const groupTools = toolsForGroup(tools, group);
              return (
                <article
                  key={group.name}
                  className="rounded-3xl border border-brandBorder bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-cardHover dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brandNavy/10 text-brandNavy dark:bg-brandBrightGreen/10 dark:text-brandBrightGreen">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d={group.iconPath} />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-xl font-black text-brandDeepNavy dark:text-white">{group.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-brandMuted dark:text-slate-400">{group.description}</p>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-1 border-t border-brandBorder pt-4 dark:border-slate-800">
                    {groupTools.map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="group flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-bold text-brandText transition hover:bg-brandBgSoft hover:text-brandNavy dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <span>{tool.name}</span>
                          <span aria-hidden="true" className="text-brandGrowthGreen transition group-hover:translate-x-1">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] bg-brandDeepNavy px-6 py-10 text-white shadow-elevated md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brandBrightGreen">Recent reading</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Fresh context for changing money rules</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Practical explainers for tax, policy and personal-finance decisions — connected back
                to calculators you can use immediately.
              </p>
              <Link href="/blog" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-black text-brandBrightGreen hover:underline">
                Browse all articles <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex min-h-64 flex-col rounded-2xl border border-white/15 bg-white/10 p-5 transition hover:-translate-y-1 hover:bg-white/15"
                >
                  <span className="text-xs font-black uppercase tracking-wide text-brandBrightGreen">{post.category}</span>
                  <h3 className="mt-4 text-base font-black leading-snug text-white">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{post.intro}</p>
                  <span className="mt-auto pt-5 text-sm font-black text-white">Read article →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            ['Private by default', 'Calculations run in your browser. No account, phone number, or email is needed.'],
            ['Transparent formulas', 'See assumptions, worked examples, FAQs, and the math behind each estimate.'],
            ['Built for India', 'Use tools shaped around Indian salaries, taxes, lending, saving, and investing.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-brandBorder bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-brandGrowthGreen/10 text-lg font-black text-brandGrowthGreen">✓</span>
              <h2 className="mt-5 text-lg font-black text-brandDeepNavy dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-brandMuted dark:text-slate-400">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
