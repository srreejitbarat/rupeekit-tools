import { languageAlternates } from '@/lib/i18n/routing';
import type { Metadata } from 'next';
import Link from 'next/link';
import CalculatorJumpSearch from '@/components/home/CalculatorJumpSearch';
import { blogPosts } from '@/data/all-blog-posts';
import { getLiveTools, type Tool } from '@/lib/tools';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export const metadata: Metadata = {
  title: { absolute: 'RupeeKit - Free India Salary & Finance Calculators' },
  description:
    'Use free India-focused calculators, beginner guides, and visual breakdowns to estimate salary, loans, savings, tax, and everyday money decisions.',
  alternates: languageAlternates('/'),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
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
    sourceCategories: ['Planning', 'Insurance', 'Business'],
    iconPath: 'M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4',
  },
];

const QUICK_PICKS = [
  { slug: 'salary-in-hand-calculator-india', topic: 'Salary', question: 'How much salary will I get in hand?' },
  { slug: 'emi-calculator-india', topic: 'Loans', question: 'What will my monthly loan payment be?' },
  { slug: 'income-tax-calculator-old-vs-new-regime-india', topic: 'Tax', question: 'How much income tax will I pay?' },
  { slug: 'sip-calculator-india', topic: 'Investing', question: 'How could my monthly investments grow?' },
];

function toolsForGroup(tools: Tool[], group: CategoryGroup) {
  return tools.filter((tool) => group.sourceCategories.includes(tool.category));
}

export default function HomePage() {
  const tools = getLiveTools();
  const recentPosts = [...blogPosts]
    .sort((a, b) =>
      (b.modifiedDateISO ?? b.publishedDateISO ?? b.date).localeCompare(a.modifiedDateISO ?? a.publishedDateISO ?? a.date),
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <section className="grid items-center gap-6 rounded-2xl border border-brandBorder bg-white p-5 sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8 dark:bg-slate-900">
        <div className="min-w-0">
          <h1 className="text-balance text-brandText">Free money calculators for India</h1>
          <p className="mt-3 max-w-lg text-base leading-7 text-brandMuted">
            Check your in-hand salary, loan EMI, tax or savings. Enter your own numbers to see an estimate.
          </p>
          <CalculatorJumpSearch
            tools={tools.map(({ slug, name, category, shortDescription }) => ({ slug, name, category, shortDescription }))}
          />
        </div>
        <div className="rounded-xl border border-brandBorder bg-brandBgSoft p-4 sm:p-5">
          <h2 className="text-base font-semibold text-brandText">Start with a common question</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {QUICK_PICKS.map(({ slug, topic, question }) => (
              <li key={slug}>
                <Link href={`/tools/${slug}`} className="group flex h-full items-start justify-between gap-2 rounded-lg border border-brandBorder bg-white px-3 py-2.5 transition-colors hover:border-brandGrowthGreen dark:bg-slate-900 dark:hover:border-brandBrightGreen">
                  <span>
                    <span className="block text-xs font-semibold text-brandGrowthGreen dark:text-brandBrightGreen">{topic}</span>
                    <span className="mt-1 block text-sm font-medium leading-5 text-brandText group-hover:underline">{question}</span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 self-center text-brandMuted">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="calculators" className="mt-12 scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brandBorder pb-4 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-brandText">Browse calculators by topic</h2>
          <Link href="/tools" className="inline-flex min-h-11 items-center text-sm font-semibold text-brandNavy hover:underline dark:text-brandBrightGreen">
            View all calculators <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
        <div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
          {CATEGORY_GROUPS.map((group) => (
            <section key={group.name} className="rounded-lg border border-brandBorder bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-semibold text-brandText">{group.name}</h3>
              <ul className="mt-3 divide-y divide-brandBorder dark:divide-slate-800">
                {toolsForGroup(tools, group).map((tool) => (
                  <li key={tool.slug}>
                    <Link href={`/tools/${tool.slug}`} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm text-brandMuted hover:text-brandNavy hover:underline dark:hover:text-white">
                      <span>{tool.name}</span><span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-brandBorder pt-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-brandText">Latest guides</h2>
          <Link href="/blog" className="inline-flex min-h-11 items-center text-sm font-semibold text-brandNavy hover:underline dark:text-brandBrightGreen">Browse all articles <span aria-hidden="true">→</span></Link>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {recentPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block py-3 hover:underline">
              <span className="text-xs text-brandMuted">{post.category}</span>
              <h3 className="mt-2 text-base font-semibold leading-6 text-brandText">{post.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
