import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import EditorialByline from '@/components/seo/EditorialByline';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import {
  ASSUMED_CURRENT_DA_PERCENT,
  FITMENT_SCENARIOS,
  PAY_MATRIX_LEVELS,
  getPayMatrixLevel,
} from '@/data/pay-matrix-levels';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  SITE_URL,
  editorialTeamRef,
} from '@/lib/seo/editorial';

const LAST_REVIEWED_ISO = '2026-08-25';
const CALCULATOR_URL = '/tools/8th-pay-commission-salary-calculator-india';
const ARREARS_CALCULATOR_URL = '/tools/8th-pay-commission-arrears-calculator-india';
const PENSION_CALCULATOR_URL = '/tools/8th-pay-commission-pension-calculator-india';

const inr = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export function generateStaticParams() {
  return PAY_MATRIX_LEVELS.map((entry) => ({ level: entry.slug }));
}

function buildScenarios(entryPay: number) {
  const currentDa = (ASSUMED_CURRENT_DA_PERCENT / 100) * entryPay;
  const currentTotal = entryPay + currentDa;

  return FITMENT_SCENARIOS.map((scenario) => {
    const revisedBasic = entryPay * scenario.factor;
    const change = revisedBasic - currentTotal;
    return {
      ...scenario,
      revisedBasic,
      change,
      changePercent: currentTotal > 0 ? (change / currentTotal) * 100 : 0,
    };
  });
}

export function generateMetadata({ params }: { params: { level: string } }): Metadata {
  const entry = getPayMatrixLevel(params.level);
  if (!entry) return {};

  const pageUrl = `${SITE_URL}/8th-pay-commission/${entry.slug}`;
  const title = `8th Pay Commission Level ${entry.level}: Salary & Fitment Factor`;
  const description = `Check Level ${entry.level} entry pay of ${inr(entry.entryPay)} and compare revised basic salary across 8th Pay Commission fitment-factor scenarios. No final factor has been notified.`;

  return {
    title: { absolute: title },
    description,
    alternates: withLanguageAlternates({ canonical: pageUrl }),
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function PayMatrixLevelPage({ params }: { params: { level: string } }) {
  const entry = getPayMatrixLevel(params.level);
  if (!entry) notFound();

  const pageUrl = `${SITE_URL}/8th-pay-commission/${entry.slug}`;
  const scenarios = buildScenarios(entry.entryPay);
  const currentDa = (ASSUMED_CURRENT_DA_PERCENT / 100) * entry.entryPay;
  const currentTotal = entry.entryPay + currentDa;
  const lowest = scenarios[0];
  const highest = scenarios[scenarios.length - 1];

  const siblings = PAY_MATRIX_LEVELS.filter((item) => item.slug !== entry.slug);

  const quickAnswer = {
    question: `What would 8th Pay Commission Level ${entry.level} pay look like?`,
    answer: `Level ${entry.level} entry pay in the current matrix is ${inr(entry.entryPay)} a month, with dearness allowance of roughly ${inr(currentDa)} on top at an assumed ${ASSUMED_CURRENT_DA_PERCENT}% rate — about ${inr(currentTotal)} in all. No 8th CPC fitment factor has been notified. Across the four scenarios in public discussion, revised basic pay for this level would fall between ${inr(lowest.revisedBasic)} and ${inr(highest.revisedBasic)}. Compared with what is received today, that is a change of ${lowest.changePercent.toFixed(0)}% to ${highest.changePercent.toFixed(0)}% — much smaller than the fitment factor alone suggests, because existing DA is merged into the revised basic.`,
    note: 'Every projected figure on this page is a scenario, not a decision. The 8th Central Pay Commission has not notified a fitment factor, a revised pay matrix, HRA slabs or an implementation date.',
    links: [
      { label: 'Set your own fitment factor and DA', href: CALCULATOR_URL },
      { label: 'Estimate arrears for an assumed effective date', href: ARREARS_CALCULATOR_URL },
      { label: 'Read the full 8th Pay Commission status', href: '/8th-pay-commission' },
    ],
  };

  const answerEngineSummary = `In the 7th CPC pay matrix, Level ${entry.level} has an entry cell of ${inr(entry.entryPay)} a month and replaced grade pay of ${inr(entry.gradePay)}. It is commonly associated with ${entry.commonlyAssociatedWith.toLowerCase()}. The 8th Central Pay Commission was constituted in November 2025 and has not notified a fitment factor, revised matrix or implementation date. Applying the four factors currently discussed in public — 1.92, 2.28, 2.57 and 2.86 — to the Level ${entry.level} entry cell gives revised basic pay between ${inr(lowest.revisedBasic)} and ${inr(highest.revisedBasic)}. Because accumulated dearness allowance is folded into revised basic when a pay commission takes effect, the increase against current basic-plus-DA is materially smaller than the fitment factor implies.`;

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `8th Pay Commission Level ${entry.level}: Salary & Fitment Factor`,
      description: `Fitment scenarios applied to the Level ${entry.level} entry cell of the pay matrix.`,
      url: pageUrl,
      datePublished: LAST_REVIEWED_ISO,
      dateModified: LAST_REVIEWED_ISO,
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
        {
          '@type': 'ListItem',
          position: 2,
          name: '8th Pay Commission',
          item: `${SITE_URL}/8th-pay-commission`,
        },
        { '@type': 'ListItem', position: 3, name: `Level ${entry.level}`, item: pageUrl },
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
          name: `Has the 8th CPC fitment factor for Level ${entry.level} been announced?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. No fitment factor has been notified for any level. The figures circulating in news coverage are staff-side demands and analyst projections. This page shows them as labelled scenarios so the difference between them is visible.',
          },
        },
      ],
    },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {schemas.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/8th-pay-commission" className="font-semibold text-brandNavy hover:underline">
          8th Pay Commission
        </Link>
        <span className="mx-2">/</span>
        <span>Level {entry.level}</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-black tracking-tight text-brandDeepNavy sm:text-4xl">
          8th Pay Commission Level {entry.level} Salary: What the Scenarios Show
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          Level {entry.level} carries an entry cell of {inr(entry.entryPay)} in the current pay
          matrix and replaced grade pay of {inr(entry.gradePay)}. It is commonly associated with{' '}
          {entry.commonlyAssociatedWith.toLowerCase()}. Below is what four publicly discussed
          fitment factors would do to that figure — and why the headline number is not the raise.
        </p>
        <EditorialByline className="mt-4" updatedIso={LAST_REVIEWED_ISO} />
      </header>

      <div className="mt-8">
        <QuickAnswerBox
          title={`Level ${entry.level} at a glance`}
          question={quickAnswer.question}
          answer={quickAnswer.answer}
          note={quickAnswer.note}
          links={quickAnswer.links}
        />
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          What you receive today at this level
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-brandBorder bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Entry basic pay
            </p>
            <p className="mt-1 text-2xl font-black text-brandDeepNavy">{inr(entry.entryPay)}</p>
            <p className="mt-1 text-xs text-slate-500">Cell 1 of the current matrix</p>
          </div>
          <div className="rounded-2xl border border-brandBorder bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Dearness allowance
            </p>
            <p className="mt-1 text-2xl font-black text-brandDeepNavy">{inr(currentDa)}</p>
            <p className="mt-1 text-xs text-slate-500">
              At an assumed {ASSUMED_CURRENT_DA_PERCENT}% rate
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Basic + DA
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-800">{inr(currentTotal)}</p>
            <p className="mt-1 text-xs text-emerald-700">The figure a revision must beat</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          HRA, transport allowance and any post-specific allowances sit on top of this and are
          excluded here, because they are recalculated separately on the revised basic. Use the{' '}
          <Link href={CALCULATOR_URL} className="font-semibold text-brandNavy underline underline-offset-2">
            salary calculator
          </Link>{' '}
          to include them with your own figures.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Four fitment scenarios for Level {entry.level}
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          None of these factors has been notified. They are the values under public discussion,
          shown side by side so the spread between them is obvious.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-brandBorder bg-white">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Fitment factor scenarios applied to Level {entry.level} entry pay
            </caption>
            <thead>
              <tr className="border-b border-brandBorder bg-slate-50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Scenario
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Revised basic
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  vs basic + DA now
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario.factor} className="border-b border-slate-100 last:border-b-0">
                  <th scope="row" className="px-4 py-3 text-left align-top">
                    <span className="font-bold text-brandDeepNavy">
                      {scenario.factor.toFixed(2)}×
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                      {scenario.label}
                    </span>
                  </th>
                  <td className="px-4 py-3 text-right align-top font-semibold tabular-nums text-brandDeepNavy">
                    {inr(scenario.revisedBasic)}
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums">
                    <span className="font-semibold text-slate-700">{inr(scenario.change)}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {scenario.changePercent >= 0 ? '+' : ''}
                      {scenario.changePercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Why {highest.factor.toFixed(2)}× is not a {((highest.factor - 1) * 100).toFixed(0)}% raise
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          The fitment factor multiplies <em>basic pay</em>, but a large share of what it appears to
          add is dearness allowance you already receive. When a pay commission takes effect,
          accumulated DA is folded into the revised basic and the DA percentage restarts near zero.
          At Level {entry.level}, DA at the assumed {ASSUMED_CURRENT_DA_PERCENT}% rate is already{' '}
          {inr(currentDa)} a month.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          So the {highest.factor.toFixed(2)}× scenario takes basic from {inr(entry.entryPay)} to{' '}
          {inr(highest.revisedBasic)} — but measured against the {inr(currentTotal)} of basic plus DA
          actually received today, the gain is {inr(highest.change)}, or{' '}
          {highest.changePercent.toFixed(1)}%. The lower {lowest.factor.toFixed(2)}× scenario gives{' '}
          {lowest.changePercent.toFixed(1)}%. Compare revised gross against current gross, never
          revised basic against current basic.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">What has not been decided</h2>
        <ul className="mt-5 space-y-3 text-slate-700">
          {[
            'The fitment factor, for this level or any other.',
            'The revised pay matrix and how cells map across levels.',
            'Revised HRA slabs and transport allowance rates.',
            'The date from which a revised structure takes effect, and therefore the arrears period.',
            'Whether pension revision follows the same multiplier or a separate method.',
          ].map((item) => (
            <li key={item} className="flex gap-3 rounded-2xl border border-brandBorder bg-white p-4">
              <span aria-hidden="true" className="font-bold text-rose-500">
                ✕
              </span>
              <span className="leading-7">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <AnswerEngineSummary className="mt-12" summary={answerEngineSummary} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Run your own numbers</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            {
              href: CALCULATOR_URL,
              label: 'Salary scenario calculator',
              note: 'Set the fitment factor, DA and HRA yourself instead of using the entry cell.',
            },
            {
              href: ARREARS_CALCULATOR_URL,
              label: 'Arrears calculator',
              note: 'Estimate what accumulates between an assumed effective date and payment date.',
            },
            {
              href: PENSION_CALCULATOR_URL,
              label: 'Pension scenario calculator',
              note: 'Compare current pension with a revision scenario for the same level.',
            },
            {
              href: '/8th-pay-commission',
              label: 'Full status page',
              note: 'What is settled, what is speculation, and what the commission has actually done.',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm transition hover:border-brandNavy/30 hover:shadow-md"
            >
              <p className="font-bold text-brandNavy">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Other pay matrix levels</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {siblings.map((item) => (
            <Link
              key={item.slug}
              href={`/8th-pay-commission/${item.slug}`}
              className="rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-brandNavy transition hover:border-brandNavy/40 hover:bg-slate-50"
            >
              Level {item.level}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
