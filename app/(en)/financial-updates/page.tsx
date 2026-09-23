import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import FinancialUpdatesClient from '@/components/updates/FinancialUpdatesClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Latest Financial Updates, Tax, GST and RBI News | RupeeKit';
const DESCRIPTION =
  'Follow important finance, tax, GST, RBI, SEBI, market and personal finance updates with simple educational summaries from RupeeKit.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/financial-updates`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/financial-updates`,
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

function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-brandBorder bg-white overflow-hidden shadow-sm">
      <div className="h-20 bg-slate-800 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-brandBgSoft rounded animate-pulse" />
        <div className="h-3 bg-brandBgSoft rounded w-3/4 animate-pulse" />
        <div className="h-12 bg-brandBgSoft rounded animate-pulse" />
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {['All', 'RBI', 'Income Tax', 'GST', 'SEBI', 'Banking'].map((c) => (
          <div key={c} className="h-7 w-20 rounded-full bg-brandBgSoft border border-brandBorder animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

const officialFinancialSources = [
  { name: 'Reserve Bank of India', url: 'https://rbi.org.in' },
  { name: 'Income Tax Department', url: 'https://incometax.gov.in' },
  { name: 'GST Council / CBIC', url: 'https://cbic.gov.in' },
  { name: 'Securities and Exchange Board of India (SEBI)', url: 'https://sebi.gov.in' },
];

const officialGovtSources = [
  { name: 'Press Information Bureau (PIB)', url: 'https://pib.gov.in' },
  { name: 'Ministry of Finance', url: 'https://finmin.nic.in' },
  { name: 'EPFO Member Portal', url: 'https://epfindia.gov.in' },
  { name: 'PFRDA (NPS)', url: 'https://pfrda.org.in' },
];

export default function FinancialUpdatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-10">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 px-6 py-10 md:px-12 md:py-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-brandGrowthGreen/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-brandNavy/40 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-white/20 mb-4">
            Educational Summaries
          </span>
          <h1 className="text-3xl font-black tracking-tight leading-tight md:text-5xl text-white">
            Financial &amp; Tax Updates
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
            Follow important finance, income tax, GST, RBI policy, SEBI, banking, and personal finance
            updates explained simply. All summaries are educational — always verify with the official
            source before acting.
          </p>
          <div className="mt-6">
            <Link
              href="/updates"
              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-bold text-white hover:bg-white/20 transition"
            >
              ← Back to Updates Hub
            </Link>
          </div>
        </div>
      </section>

      {/* Client-side filtered content */}
      <Suspense fallback={<LoadingFallback />}>
        <FinancialUpdatesClient />
      </Suspense>

      {/* Official Sources */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-brandDeepNavy mb-6">Official Sources to Verify</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-brandNavy mb-3">
              Regulatory Bodies
            </h3>
            <ul className="space-y-2">
              {officialFinancialSources.map((src) => (
                <li key={src.name}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brandNavy hover:text-brandDeepNavy transition"
                  >
                    {src.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-brandNavy mb-3">
              Government Portals
            </h3>
            <ul className="space-y-2">
              {officialGovtSources.map((src) => (
                <li key={src.name}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brandNavy hover:text-brandDeepNavy transition"
                  >
                    {src.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-xs text-brandMuted border-t border-brandBorder pt-4">
          RupeeKit is not affiliated with, endorsed by, or representing any of the above official bodies.
          Links are provided for reference only.
        </p>
      </section>

      {/* Educational Disclaimer */}
      <section className="rounded-2xl border border-brandBorder bg-brandBgSoft p-5 text-xs leading-relaxed text-brandMuted">
        <p className="font-bold text-brandDeepNavy mb-1">Educational Disclaimer</p>
        <p>
          RupeeKit financial updates are for general educational information only and are not
          financial, tax, legal, or investment advice. All content is manually reviewed before
          publication. Verify all information with official sources. RupeeKit does not guarantee the
          accuracy, completeness, or timeliness of any information published here.
        </p>
      </section>
    </div>
  );
}
