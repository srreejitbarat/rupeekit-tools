import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  EDITORIAL_TEAM_NAME,
  ORGANIZATION_ID,
  SITE_URL,
} from '@/lib/seo/editorial';

const TITLE = 'Editorial Policy | How RupeeKit Researches and Reviews';
const DESCRIPTION =
  'How RupeeKit sources, writes, reviews and updates its India finance calculators and guides — primary sources used, review cadence, and what we will not publish.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLanguageAlternates({ canonical: EDITORIAL_POLICY_URL }),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: EDITORIAL_POLICY_URL,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const primarySources = [
  {
    name: 'Income Tax Department & the Finance Act',
    href: 'https://www.incometax.gov.in/',
    used: 'Slab rates, deductions, capital-gains rules, ITR form applicability, filing deadlines and utility releases.',
  },
  {
    name: 'Reserve Bank of India',
    href: 'https://www.rbi.org.in/',
    used: 'Repo rate, lending-rate frameworks, NRE/NRO account rules and remittance limits.',
  },
  {
    name: 'EPFO',
    href: 'https://www.epfindia.gov.in/',
    used: 'EPF contribution rules, interest-rate notifications and withdrawal conditions.',
  },
  {
    name: 'PFRDA',
    href: 'https://www.pfrda.org.in/',
    used: 'NPS tier structure, contribution limits and annuity rules.',
  },
  {
    name: 'PIB and the relevant ministry',
    href: 'https://www.pib.gov.in/',
    used: 'Pay commission announcements, labour-code notifications and gratuity changes.',
  },
];

export default function EditorialPolicyPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': EDITORIAL_POLICY_URL,
    name: TITLE,
    description: DESCRIPTION,
    url: EDITORIAL_POLICY_URL,
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <h1 className="text-4xl font-black tracking-tight text-brandNavy dark:text-white">
        Editorial Policy
      </h1>
      <p className="mt-6 leading-8 text-brandText dark:text-slate-300">
        RupeeKit publishes calculators and explainers about money — tax, salary,
        loans, retirement and investments. Getting those wrong costs readers real
        rupees, so this page sets out exactly how the content is produced, who
        stands behind it, and how to challenge it.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        Who writes and reviews this content
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        All content is produced by the <strong>{EDITORIAL_TEAM_NAME}</strong>, our
        in-house personal-finance research desk. We publish under an
        organisational byline rather than inventing individual expert profiles.
        Where a topic requires professional judgement — for example, whether a
        specific deduction applies to your return — we say so and point you to a
        qualified professional instead of guessing on your behalf.
      </p>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        The editorial team is responsible for research, formulas and publication. A dated source check means the linked
        disclosures were checked on that date; it is not a claim that a bank endorsed our calculation. We credit a
        named specialist reviewer only after that person has reviewed the specific work and agreed to be identified.
        No external specialist signoff is claimed for the decision guides. Priority guides carry a visible revision
        trail and source dates so readers can see what changed and report an error.
      </p>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        RupeeKit is not a SEBI-registered investment adviser, a chartered
        accountancy firm, or a lender. Nothing on this site is personalised
        financial, tax, legal or investment advice.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        Sources we use
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        Every rule, rate, threshold and deadline is traced to a primary Indian
        source. We do not cite other finance blogs as authority for a number.
      </p>
      <ul className="mt-4 space-y-3">
        {primarySources.map((source) => (
          <li
            key={source.name}
            className="rounded-xl border border-brandBorder bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brandNavy underline underline-offset-2 dark:text-slate-100"
            >
              {source.name}
            </a>
            <p className="mt-1 text-sm leading-6 text-brandMuted dark:text-slate-400">
              {source.used}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        How calculators are built and checked
      </h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 leading-8 text-brandText dark:text-slate-300">
        <li>
          The formula is written out in plain text on the page, so you can check
          our arithmetic rather than trust a black box.
        </li>
        <li>
          Each calculator has automated tests covering its formula and edge cases;
          these run on every change before it can be merged.
        </li>
        <li>
          A worked example with real numbers is published alongside the tool.
        </li>
        <li>
          Assumptions that the user cannot see — compounding frequency, rounding,
          which financial year the rates belong to — are stated in a
          &ldquo;Source and methodology&rdquo; section.
        </li>
      </ol>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        Review cadence
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        Every page carries a visible &ldquo;last reviewed&rdquo; date. Tax and
        salary pages are re-checked after the Union Budget, at the start of each
        financial year, and whenever the underlying rule changes. Rate-sensitive
        pages (PPF, EPF, NPS, FD, repo-linked loans) are re-checked when the
        governing body notifies a new rate. If a page has not been re-verified
        against its source, the date does not move — we do not refresh dates
        cosmetically to look current.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        What we will not publish
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-brandText dark:text-slate-300">
        <li>Buy/sell recommendations on specific stocks, funds or insurance products.</li>
        <li>Guaranteed-return claims, or projections presented as certainties.</li>
        <li>Paid placements disguised as editorial recommendations.</li>
        <li>Numbers we cannot trace to a primary source.</li>
        <li>Invented author credentials or fabricated expert quotes.</li>
      </ul>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        Independence and funding
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        RupeeKit is funded by advertising and affiliate links, disclosed on our{' '}
        <Link
          href="/affiliate-disclosure"
          className="font-semibold text-brandNavy underline underline-offset-2 dark:text-slate-200"
        >
          affiliate disclosure
        </Link>{' '}
        page. Commercial relationships never determine what a calculator outputs,
        which rules we report, or the order in which options are presented.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        Errors
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        We get things wrong sometimes. When we do, we fix them in the open — see
        the{' '}
        <Link
          href="/corrections-policy"
          className="font-semibold text-brandNavy underline underline-offset-2 dark:text-slate-200"
        >
          corrections policy
        </Link>
        , which explains how to report an error and what we do about it.
      </p>

      <p className="mt-10 text-sm text-brandMuted dark:text-slate-400">
        Questions about this policy?{' '}
        <Link href="/contact" className="underline underline-offset-2">
          Contact us
        </Link>
        . Corrections:{' '}
        <a href={CORRECTIONS_POLICY_URL} className="underline underline-offset-2">
          corrections policy
        </a>
        .
      </p>
    </div>
  );
}
