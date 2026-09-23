import type { Metadata } from 'next';
import Link from 'next/link';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'About RupeeKit | Free India Finance Calculators';
const DESCRIPTION =
  'Learn who operates RupeeKit, how its India finance calculators are researched, reviewed and corrected, and the limits of its educational content.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/about`,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight">About RupeeKit</h1>
      <AnswerEngineSummary
        className="mt-6"
        summary="RupeeKit is an independent, calculator-first educational finance website for India. Its in-house editorial team builds and reviews calculators against primary Indian sources; RupeeKit is not a lender, tax firm, or SEBI-registered investment adviser."
      />

      <section aria-labelledby="who-runs-rupeekit" className="mt-8">
        <h2 id="who-runs-rupeekit" className="text-2xl font-bold text-brandDeepNavy">Who runs RupeeKit</h2>
        <p className="mt-4 leading-8 text-slate-700">
          RupeeKit is operated by the RupeeKit team as an independent educational website. Content is published under the
          <strong> RupeeKit Editorial Team</strong> organisational byline. We do not invent individual expert profiles,
          professional designations, certifications, or reviewer credentials that do not exist.
        </p>
      </section>

      <section aria-labelledby="how-we-work" className="mt-8">
        <h2 id="how-we-work" className="text-2xl font-bold text-brandDeepNavy">How we research and review</h2>
        <p className="mt-4 leading-8 text-slate-700">
          For changeable tax, loan, retirement and government-rule facts, we prefer primary sources such as the Income Tax
          Department, RBI, EPFO, PFRDA, PIB and the relevant ministry or legislation. Formula assumptions and source links
          are shown on the calculator or guide where they matter.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          Read our <Link href="/editorial-policy" className="font-semibold underline underline-offset-2">editorial policy</Link>{' '}
          for sourcing and review rules, and our <Link href="/corrections-policy" className="font-semibold underline underline-offset-2">corrections policy</Link>{' '}
          for how errors are handled.
        </p>
      </section>

      <section aria-labelledby="limits" className="mt-8">
        <h2 id="limits" className="text-2xl font-bold text-brandDeepNavy">What RupeeKit is not</h2>
        <p className="mt-4 leading-8 text-slate-700">
          RupeeKit calculators are educational estimates, not personalised financial, tax, legal or investment advice.
          RupeeKit is not a lender, broker, chartered accountancy firm or SEBI-registered investment adviser. Verify material
          decisions with the relevant official source or an appropriately qualified professional.
        </p>
      </section>

      <section aria-labelledby="contact" className="mt-8">
        <h2 id="contact" className="text-2xl font-bold text-brandDeepNavy">Contact and corrections</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Report a factual error, accessibility problem or calculator issue through our{' '}
          <Link href="/contact" className="font-semibold underline underline-offset-2">contact page</Link>. We do not ask for
          PAN, Aadhaar, bank statements or other sensitive financial documents to investigate a correction.
        </p>
      </section>
    </main>
  );
}
