import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';

import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import EditorialByline from '@/components/seo/EditorialByline';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';
import {
  DEADLINE_CONFIDENCE_LABEL,
  SMALL_SAVINGS_REVIEW_QUARTERS,
  TAX_DEADLINES,
  TAX_DEADLINES_LAST_REVIEWED,
} from '@/data/tax-deadlines';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  SITE_URL,
  editorialTeamRef,
} from '@/lib/seo/editorial';

const PAGE_URL = `${SITE_URL}/deadlines`;
const FIRST_PUBLISHED_ISO = '2026-08-25';
const AUDIT_EXTENSION = 'For Assessment Year 2026–27, the CBDT moved the return deadline to 21 November 2026 for specified audit cases.';
const AUDIT_EXTENSION_SOURCE = 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2316050&lang=1&reg=3';

const TITLE = 'Income Tax Deadlines India: The Statutory Calendar';
const DESCRIPTION =
  'Every recurring income tax deadline in India’s financial year: advance tax instalments, TDS returns, ITR due dates, the 31 March cut-off and common extensions.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLanguageAlternates({ canonical: PAGE_URL }),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const ordered = [...TAX_DEADLINES].sort((a, b) => a.monthOrder - b.monthOrder);

export default function DeadlinesPage() {
  const quickAnswer = {
    question: 'What are the income tax deadlines in India?',
    answer:
      'For most salaried people, the usual return deadline is 31 July. Eligible businesses without an audit have until 31 August. The usual date for tax audit cases is 31 October. If you missed your deadline, you can usually file by 31 December. To correct a return you already filed, you usually have until 31 March.',
    note: AUDIT_EXTENSION,
    links: [
      {
        label: 'Estimate your liability before an instalment',
        href: '/tools/income-tax-calculator-old-vs-new-regime-india',
      },
      { label: '80C deduction calculator', href: '/tools/80c-deduction-calculator-india' },
      { label: 'Latest official updates', href: '/financial-updates' },
      { label: 'CBDT audit filing extension', href: AUDIT_EXTENSION_SOURCE },
    ],
  };

  const answerEngineSummary =
    'The income tax year runs from April to March. Advance tax payments usually reach 15% by 15 June, 45% by 15 September, 75% by 15 December and 100% by 15 March. Late returns usually close on 31 December. Revised returns usually close on 31 March. Use the income tax portal to check the deadline for your filing category.';

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      datePublished: FIRST_PUBLISHED_ISO,
      dateModified: TAX_DEADLINES_LAST_REVIEWED,
      author: editorialTeamRef,
      reviewedBy: editorialTeamRef,
      publishingPrinciples: EDITORIAL_POLICY_URL,
      correctionsPolicy: CORRECTIONS_POLICY_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Deadlines', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: quickAnswer.question,
          acceptedAnswer: { '@type': 'Answer', text: quickAnswer.answer },
        },
        {
          '@type': 'Question',
          name: 'What is the extended deadline for eligible audit cases?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: AUDIT_EXTENSION,
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if I miss an advance tax instalment?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Interest accrues under sections 234B and 234C on the shortfall. Because the instalments are cumulative, a missed June payment can be made good in September, but interest runs on the gap in the meantime.',
          },
        },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {schemas.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <header>
        <h1 className="text-3xl font-black tracking-tight text-brandDeepNavy sm:text-4xl">
          Income Tax Deadlines in India: The Statutory Calendar
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Every recurring date in the Indian tax year, in the order it arrives, with a clear mark on
          which dates are fixed by statute and which get extended by circular. Missing one of these
          costs interest or a fee; assuming an extension that has not been announced costs the same.
        </p>
        <EditorialByline className="mt-4" updatedIso={TAX_DEADLINES_LAST_REVIEWED} />
      </header>

      <div className="mt-8">
        <QuickAnswerBox
          title="The tax calendar in short"
          question={quickAnswer.question}
          answer={quickAnswer.answer}
          note={quickAnswer.note}
          links={quickAnswer.links}
        />
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">The year in order</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Listed from the start of the financial year in April. Dates marked{' '}
          <em>often extended</em> are real statutory deadlines that the CBDT has moved in several
          recent years — treat the statutory date as the one that binds you.
        </p>

        <ol className="mt-6 space-y-4">
          {ordered.map((deadline) => (
            <li
              key={deadline.id}
              className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-lg font-black tracking-tight text-brandDeepNavy">
                  {deadline.date}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    deadline.confidence === 'statutory'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {DEADLINE_CONFIDENCE_LABEL[deadline.confidence]}
                </span>
              </div>
              <p className="mt-2 font-bold text-brandNavy">{deadline.title}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{deadline.who}</p>
              <p className="mt-3 leading-7 text-slate-600">{deadline.detail}</p>
              {deadline.relatedHref && deadline.relatedLabel ? (
                <Link
                  href={deadline.relatedHref}
                  className="mt-3 inline-block text-sm font-semibold text-brandNavy underline underline-offset-2"
                >
                  {deadline.relatedLabel}
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Dates that move: small savings rates
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Interest rates on PPF, Sukanya Samriddhi, the Senior Citizens Savings Scheme and the Post
          Office Monthly Income Scheme are reviewed every quarter rather than fixed for the year.
          The review covers these four periods:
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {SMALL_SAVINGS_REVIEW_QUARTERS.map((quarter) => (
            <span
              key={quarter}
              className="rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-brandNavy"
            >
              {quarter}
            </span>
          ))}
        </div>
        <p className="mt-4 leading-8 text-slate-700">
          A revision announced for one quarter does not change interest already credited for
          earlier quarters.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Why we do not predict extensions
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Every filing season brings speculation that a due date will be pushed back, and in several
          recent years it has been. But an extension exists only when the CBDT issues a circular
          granting it. Publishing a predicted date as though it were real would encourage readers to
          plan around a deadline that may never arrive — and the cost of being wrong falls on them,
          in the form of a section 234F fee and lost loss carry-forward.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          So this page shows the statutory date and marks where extensions have been common. When
          one is actually notified, it is recorded as an update with the circular cited.
        </p>
      </section>

      <AnswerEngineSummary className="mt-12" summary={answerEngineSummary} />
    </div>
  );
}
