import type { Metadata } from 'next';
import Link from 'next/link';

import {
  CORRECTIONS_POLICY_URL,
  ORGANIZATION_ID,
  SITE_URL,
} from '@/lib/seo/editorial';

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'rupeekitofficial@gmail.com';

const TITLE = 'Corrections Policy | Report an Error on RupeeKit';
const DESCRIPTION =
  'How to report an error in a RupeeKit calculator, guide or update — what we fix, how fast, and how corrections are disclosed on the page.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: CORRECTIONS_POLICY_URL },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CORRECTIONS_POLICY_URL,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const severityTiers = [
  {
    tier: 'Calculation error',
    examples:
      'A formula, rate, slab or threshold that produces a wrong number for a valid input.',
    response:
      'Treated as urgent. The page is corrected as soon as the error is confirmed against the primary source, and a dated correction note is added to the page.',
  },
  {
    tier: 'Outdated rule',
    examples:
      'A rate, limit or deadline that was correct when published but has since changed.',
    response:
      'Corrected and the "last reviewed" date updated. If the change is material, the update is also noted on the page.',
  },
  {
    tier: 'Factual or contextual error',
    examples:
      'A misstated rule, a wrong citation, a mislabelled chart, or a claim not supported by its source.',
    response:
      'Corrected in place. A correction note is added where the original wording could have misled a reader.',
  },
  {
    tier: 'Typo or broken link',
    examples: 'Spelling, formatting or a dead outbound link.',
    response: 'Fixed silently in the next routine update. No correction note.',
  },
];

export default function CorrectionsPolicyPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': CORRECTIONS_POLICY_URL,
    name: TITLE,
    description: DESCRIPTION,
    url: CORRECTIONS_POLICY_URL,
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
        Corrections Policy
      </h1>
      <p className="mt-6 leading-8 text-brandText dark:text-slate-300">
        RupeeKit publishes numbers people act on. When one of those numbers is
        wrong, the fix matters more than the embarrassment. This page explains how
        to tell us, and what we do about it.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        How to report an error
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        Email{' '}
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Correction%3A%20`}
          className="font-semibold text-brandNavy underline underline-offset-2 dark:text-slate-200"
        >
          {CONTACT_EMAIL}
        </a>{' '}
        with the subject line starting <strong>&ldquo;Correction:&rdquo;</strong>,
        or use the{' '}
        <Link
          href="/contact"
          className="font-semibold text-brandNavy underline underline-offset-2 dark:text-slate-200"
        >
          contact page
        </Link>
        . The report is far quicker to action if it includes:
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-brandText dark:text-slate-300">
        <li>The page URL.</li>
        <li>What the page says, and what you believe it should say.</li>
        <li>
          For calculators: the exact inputs you used and the output you got.
        </li>
        <li>
          A source, if you have one — ideally the Income Tax Department, RBI,
          EPFO, PFRDA or the relevant gazette notification.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        What happens next
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        We aim to acknowledge correction reports within two working days. We
        verify the claim against the primary source before changing anything — a
        report is not automatically accepted, and we will tell you if we conclude
        the page is right as published.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-brandBorder dark:border-slate-800">
              <th className="py-3 pr-4 font-bold text-brandDeepNavy dark:text-white">
                Type of error
              </th>
              <th className="py-3 pr-4 font-bold text-brandDeepNavy dark:text-white">
                Examples
              </th>
              <th className="py-3 font-bold text-brandDeepNavy dark:text-white">
                How we handle it
              </th>
            </tr>
          </thead>
          <tbody>
            {severityTiers.map((row) => (
              <tr
                key={row.tier}
                className="border-b border-brandBorder align-top dark:border-slate-800"
              >
                <td className="py-3 pr-4 font-semibold text-brandText dark:text-slate-200">
                  {row.tier}
                </td>
                <td className="py-3 pr-4 leading-6 text-brandMuted dark:text-slate-400">
                  {row.examples}
                </td>
                <td className="py-3 leading-6 text-brandMuted dark:text-slate-400">
                  {row.response}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        How corrections are disclosed
      </h2>
      <p className="mt-4 leading-8 text-brandText dark:text-slate-300">
        Substantive corrections are made on the original page, not on a separate
        page that nobody reads. Where a reader could have relied on the wrong
        version, we add a dated correction note at the point of the error and
        update the page&rsquo;s <code>dateModified</code>. We do not quietly
        delete a page to make an error disappear; if a page is withdrawn, it is
        replaced with an explanation.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-brandDeepNavy dark:text-white">
        What this policy does not cover
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-brandText dark:text-slate-300">
        <li>
          Disagreements about assumptions you chose yourself — for example, the
          rate of return you entered into a SIP projection.
        </li>
        <li>
          Requests to remove accurate information because it is commercially
          inconvenient.
        </li>
        <li>
          Requests for personalised tax or investment advice. See our{' '}
          <Link
            href="/editorial-policy"
            className="underline underline-offset-2"
          >
            editorial policy
          </Link>{' '}
          for what we do and do not publish.
        </li>
      </ul>

      <p className="mt-10 text-sm text-brandMuted dark:text-slate-400">
        Last reviewed 12 August 2026.
      </p>
    </div>
  );
}
