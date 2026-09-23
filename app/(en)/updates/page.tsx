import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'RupeeKit Updates Hub | Finance, Tax and Salary Updates';
const DESCRIPTION =
  'Browse RupeeKit finance, tax, RBI, GST, SEBI, banking and government salary updates explained in simple educational language.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/updates`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/updates`,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const updateCards = [
  {
    title: 'Financial & Tax Updates',
    description: 'RBI, income tax, GST, SEBI, banking and personal finance updates in plain language.',
    href: '/financial-updates',
    badge: 'Finance & Tax',
  },
  {
    title: 'Government Salary Updates',
    description: 'Track DA, DR, pay revision, pension, arrears and circular summaries by state and category.',
    href: '/government-salary-updates',
    badge: 'Salary & Pension',
  },
  {
    title: 'Resources',
    description: 'Go deeper with practical guides, checklists and beginner-friendly finance explainers.',
    href: '/resources',
    badge: 'Resources',
  },
];

export default function UpdatesHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12 space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-black tracking-tight text-brandDeepNavy md:text-5xl">
          RupeeKit Updates Hub
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-brandMuted md:text-base">
          Browse educational update hubs for finance, tax, and salary topics. Always verify final decisions with
          official sources before acting.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        {updateCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-3xl border border-brandBorder bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brandNavy/30 hover:shadow-md"
          >
            <span className="inline-block rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brandNavy">
              {card.badge}
            </span>
            <h2 className="mt-4 text-xl font-bold text-brandDeepNavy group-hover:text-brandNavy">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brandMuted">{card.description}</p>
            <p className="mt-5 text-xs font-bold text-brandGrowthGreen group-hover:text-brandBrightGreen">
              Open hub →
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-brandBorder bg-brandBgSoft p-5 text-xs leading-relaxed text-brandMuted">
        <p className="font-bold text-brandDeepNavy mb-1">Educational disclaimer</p>
        <p>
          RupeeKit updates are educational summaries and not financial, tax, legal, or investment advice. Verify
          dates, circulars, eligibility, and rates from official sources before making decisions.
        </p>
      </section>
    </div>
  );
}
