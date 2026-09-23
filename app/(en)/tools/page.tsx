import { languageAlternates } from '@/lib/i18n/routing';
import type { Metadata } from 'next';
import Link from 'next/link';
import ToolsExplorer from '@/components/tools/ToolsExplorer';
import { getLiveTools } from '@/lib/tools';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Free Financial Calculators India | RupeeKit';
const DESCRIPTION =
  'Browse all free RupeeKit calculators for India — salary, income tax, EMI, home loan, PPF, EPF, SIP, FD, gold loan and more. No signup, instant results.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: languageAlternates('/tools'),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/tools`,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN', 'bn_IN'],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function ToolsIndexPage() {
  const tools = getLiveTools();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${SITE_URL}/tools` },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'RupeeKit Financial Calculators for India',
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `${SITE_URL}/tools/${tool.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <nav className="text-sm font-medium text-brandMuted dark:text-slate-400">
        <Link href="/" className="transition hover:text-brandNavy dark:hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Calculators</span>
      </nav>

      <header className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 px-6 py-10 text-white shadow-elevated md:px-10 md:py-12">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brandBrightGreen/20 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brandBrightGreen">
            {tools.length} free tools · no signup
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-display">
            One clear place for every money calculation
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
            Search by goal, narrow by category, and open an India-focused calculator that explains
            the formula as clearly as the result.
          </p>
        </div>
      </header>

      <ToolsExplorer
        tools={tools.map(({ slug, name, category, shortDescription }) => ({
          slug,
          name,
          category,
          shortDescription,
        }))}
      />

      <section className="mt-16 rounded-3xl border border-brandBorder bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <h2 className="text-xl font-black text-brandDeepNavy dark:text-white">Made to show the working</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
          RupeeKit calculators are built for Indian salary structures, tax rules and financial
          products. Each one shows the formula, a worked example, common mistakes and FAQs, so you
          understand the math rather than just the final number. All results are educational
          estimates — verify major tax, loan and investment decisions with official sources or a
          qualified professional. New here? Start with the{' '}
          <Link href="/start-here" className="font-bold text-brandNavy hover:underline dark:text-brandBrightGreen">
            Start Here guide
          </Link>{' '}
          or take the{' '}
          <Link href="/money-health-check" className="font-bold text-brandNavy hover:underline dark:text-brandBrightGreen">
            Money Health Check
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
