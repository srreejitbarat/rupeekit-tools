import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';

import EighthPayCommissionCalculator from '@/components/calculators/advanced/EighthPayCommissionCalculator';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import EditorialByline from '@/components/seo/EditorialByline';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import { PAY_MATRIX_LEVELS } from '@/data/pay-matrix-levels';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  SITE_URL,
  editorialTeamRef,
} from '@/lib/seo/editorial';

const PAGE_URL = `${SITE_URL}/8th-pay-commission`;
const CALCULATOR_URL = '/tools/8th-pay-commission-salary-calculator-india';
const ARREARS_CALCULATOR_URL = '/tools/8th-pay-commission-arrears-calculator-india';
const PENSION_CALCULATOR_URL = '/tools/8th-pay-commission-pension-calculator-india';
const LAST_REVIEWED_ISO = '2026-09-08';
const STATUS_AS_OF = '8 September 2026';

// News velocity on this cluster is high and the status block is dated, so the
// page is revalidated hourly rather than pinned to a build.
export const revalidate = 3600;

const TITLE = '8th Pay Commission 2026: Fitment Factor, Salary & Status';
const DESCRIPTION =
  'Status as of September 2026: no 8th CPC fitment factor is final. Model your revised basic, HRA, net pay and arrears across every fitment-factor scenario.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLanguageAlternates({ canonical: PAGE_URL }),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const settledVsSpeculation = [
  {
    claim: 'A fitment factor of 2.57 / 2.86 / 3.68 has been approved',
    verdict: 'Not settled',
    detail:
      'No fitment factor has been notified. 2.57 is the factor the 7th CPC used; the larger numbers circulating are association demands and media projections, not decisions. Every figure on our calculator is a user-selectable scenario for exactly this reason.',
  },
  {
    claim: 'Revised basic = current basic × fitment factor',
    verdict: 'Settled mechanics',
    detail:
      'This is how a pay commission revision has historically worked. The multiplier is unknown; the arithmetic is not. DA, HRA and transport allowance are then recalculated on the new basic.',
  },
  {
    claim: 'DA resets to zero on implementation',
    verdict: 'Historically true',
    detail:
      'When a new pay structure takes effect, accumulated DA is merged into the revised basic and the DA percentage restarts from a low base. This is why a large fitment factor does not translate into a proportionate rise in take-home pay.',
  },
  {
    claim: 'Revised X/Y/Z HRA rates have been approved',
    verdict: 'Not settled',
    detail:
      'No 8th CPC HRA percentages or revised city classifications have been notified. Current 7th CPC HRA can be used as a clearly labelled planning reference, but not presented as the future rule.',
  },
  {
    claim: 'A single pension multiplier has been approved',
    verdict: 'Not settled',
    detail:
      'No pension revision multiplier, parity formula or notional pay-fixation method has been notified. Pension scenarios must keep current DR separate and state which illustrative method they use.',
  },
  {
    claim: 'Arrears will be paid from the effective date',
    verdict: 'Depends on notification',
    detail:
      'Whether arrears are paid, and from which date, is decided in the government resolution accepting the recommendations — not by the Commission itself. Do not plan around an arrears figure until the resolution is published.',
  },
];

const officialStatus = [
  {
    milestone: 'Commission constituted',
    date: '3 November 2025',
    status: 'Completed',
    detail: 'The Government of India constituted the 8th Central Pay Commission. Its 18-month period is for submitting recommendations; it is not an implementation deadline.',
  },
  {
    milestone: 'Public questionnaire',
    date: '5 February-31 March 2026',
    status: 'Closed',
    detail: 'The official questionnaire window has ended. Treat deadline searches as a completed consultation milestone, not a current submission opportunity.',
  },
  {
    milestone: 'Memoranda and representations',
    date: '5 March-15 June 2026',
    status: 'Closed',
    detail: 'The main online memorandum-submission window is closed. Separate visit-specific representation deadlines can still appear in official notices.',
  },
  {
    milestone: 'Report and recommendations',
    date: 'Within 18 months of constitution',
    status: 'In progress',
    detail: 'No final report, fitment factor, pay matrix, HRA rule, pension-revision method or arrears order is published on the official site as at this review.',
  },
  {
    milestone: 'Government implementation',
    date: 'Not notified',
    status: 'Not notified',
    detail: 'A government resolution and departmental fixation orders are needed after recommendations. An expected effect date is not the same as a notified implementation or payment date.',
  },
];

const currentActivities = [
  {
    activity: 'Chennai stakeholder visit',
    schedule: '7-8 September 2026',
    deadline: 'Representations requested by 18 August 2026',
  },
  {
    activity: 'Puducherry stakeholder visit',
    schedule: '9 September 2026',
    deadline: 'Representations requested by 18 August 2026',
  },
  {
    activity: 'Chandigarh stakeholder visit',
    schedule: '16-18 September 2026',
    deadline: 'Representations requested by 25 August 2026',
  },
  {
    activity: 'Bengaluru stakeholder visit',
    schedule: '7-8 October 2026',
    deadline: 'Representations requested by 18 September 2026',
  },
];

const commissionComparison = [
  {
    commission: '6th CPC',
    effectiveFrom: '1 January 2006',
    fitmentFactor: '1.86x',
    basis: 'Applied to basic pay, with grade pay added on top. Notified in the government resolution of August 2008.',
    settled: true,
  },
  {
    commission: '7th CPC',
    effectiveFrom: '1 January 2016',
    fitmentFactor: '2.57x',
    basis: 'Applied uniformly to 6th CPC basic plus grade pay to build the pay matrix. Notified in July 2016.',
    settled: true,
  },
  {
    commission: '8th CPC',
    effectiveFrom: 'Not notified',
    fitmentFactor: 'Not announced',
    basis: 'The Commission was constituted on 3 November 2025 and has not submitted recommendations. Every figure in circulation is a projection or a demand.',
    settled: false,
  },
];

const faqs = [
  {
    question: 'What is the fitment factor, in plain terms?',
    answer:
      'It is a single multiplier applied to your existing basic pay to arrive at your revised basic pay. If your basic is Rs 44,900 and the factor is 2.57, your revised basic is Rs 1,15,393. Everything computed as a percentage of basic — DA, HRA, transport allowance, and eventually pension and gratuity — is then recalculated on the higher figure, which is why this one number dominates every projection you see.',
  },
  {
    question: 'Has the 8th Pay Commission fitment factor been announced?',
    answer:
      'No. As at the last review of this page, no fitment factor has been officially notified. Figures being quoted publicly are either the 7th CPC factor of 2.57 used as a reference point, or demands and projections from employee associations and media. Treat every salary projection — including ours — as a scenario, not a forecast.',
  },
  {
    question: 'Why does a 2.57x fitment factor not mean 2.57x my salary?',
    answer:
      'Because your current gross already includes a large DA component that gets merged into the revised basic and then restarts near zero. The multiplier applies to basic pay, not to gross. A big jump in basic combined with a DA reset typically produces a much smaller increase in actual take-home pay than the headline factor suggests.',
  },
  {
    question: 'When will the 8th Pay Commission be implemented?',
    answer:
      'Implementation follows a sequence: the Commission is constituted, terms of reference are notified, it submits recommendations, the government issues a resolution accepting or modifying them, and departments then issue pay-fixation orders. Dates circulating before the government resolution are projections. Check the Department of Expenditure and PIB for the official position rather than relying on news aggregation.',
  },
  {
    question: 'What fitment factor should government employees plan around?',
    answer:
      'A range rather than a number. The figures in circulation run from about 1.92 at the low end to 3.00 at the top of association demands, with 2.28 the most frequently cited projection and 2.57 the factor the 7th CPC actually used. None of them is a recommendation. The calculator on this page runs your own basic pay through all five at once so you can see the spread instead of anchoring on a single figure someone else picked.',
  },
  {
    question: 'How does the fitment factor apply to pensioners?',
    answer:
      'Historically the same multiplier applied to basic pension has produced the revised basic pension, with dearness relief then restarting from a low base exactly as DA does for serving employees. The 8th CPC has not notified a pension multiplier, a parity formula or a notional pay-fixation method, and past commissions have differed on which of those they used. Switch the calculator to pensioner mode to model a flat multiplier on your basic pension.',
  },
  {
    question: 'When will the fitment factor be announced?',
    answer:
      'The Commission has an 18-month window from its 3 November 2025 constitution, which points to recommendations around May or June 2027. The fitment factor becomes real only when the government issues a resolution accepting or modifying those recommendations, and departments then issue pay-fixation orders. Any date circulating before that resolution is a projection.',
  },
  {
    question: 'How does the 8th CPC compare with the 6th and 7th Pay Commissions?',
    answer:
      'The 6th CPC used a fitment factor of 1.86 effective 1 January 2006, and the 7th CPC used 2.57 effective 1 January 2016. Both were notified in a government resolution after the Commission reported. The 8th CPC has no factor and no effective date, because it has not reported. Comparing the previous two is useful for understanding the mechanism and the roughly ten-year cadence; it does not predict the third.',
  },
  {
    question: 'How will it affect pension and gratuity?',
    answer:
      'Pension revision has historically tracked the pay revision, and gratuity is computed on basic plus DA, so both move with the revised structure. The exact mechanism — whether by notional pay fixation or a flat multiplier — is set out in the government resolution, and it has differed between commissions.',
  },
];

const relatedTools = [
  {
    href: CALCULATOR_URL,
    label: '8th Pay Commission Salary Calculator',
    note: 'Run your own basic pay through selectable fitment-factor scenarios and see revised basic, DA, HRA and gross.',
  },
  {
    href: ARREARS_CALCULATOR_URL,
    label: '8th Pay Commission Arrears Calculator',
    note: 'Model current versus projected basic, DA, HRA and other eligible pay across dates you choose. No date is assumed official.',
  },
  {
    href: PENSION_CALCULATOR_URL,
    label: '8th Pay Commission Pension Calculator',
    note: 'Compare current basic pension plus DR with an unofficial flat-multiplier scenario while keeping future DR separate.',
  },
  {
    href: '/tools/salary-in-hand-calculator-india',
    label: 'In-Hand Salary Calculator',
    note: 'Work back from gross to take-home after PF, professional tax and income tax.',
  },
  {
    href: '/tools/gratuity-calculator-india',
    label: 'Gratuity Calculator',
    note: 'Gratuity is computed on basic plus DA, so a pay revision moves it too.',
  },
  {
    href: '/tools/hra-exemption-calculator-india',
    label: 'HRA Exemption Calculator',
    note: 'A higher basic changes both your HRA and the exemption you can claim on it.',
  },
  {
    href: '/tools/epf-corpus-calculator-india',
    label: 'EPF Corpus Calculator',
    note: 'Higher basic means higher statutory contributions and a larger long-run corpus.',
  },
  {
    href: '/tools/nps-calculator-india',
    label: 'NPS Calculator',
    note: 'Central government employees under NPS contribute a percentage of basic plus DA.',
  },
];

const relatedReading = [
  {
    href: '/blog/how-to-calculate-in-hand-salary-from-ctc-india',
    label: 'How to Calculate In-Hand Salary from CTC in India',
    note: 'Why gross and take-home diverge — the same reason a fitment factor overstates the raise.',
  },
  {
    href: '/blog/new-labour-code-gratuity-rules-india-2026',
    label: 'New Labour Code Gratuity Rules 2026',
    note: 'How the wage definition change interacts with basic pay.',
  },
  {
    href: '/government-salary-updates',
    label: 'Government Salary Updates',
    note: 'DA, pay revision, pension and allowance tracking.',
  },
];

const officialSources = [
  {
    label: '8th Central Pay Commission — official website and current notices',
    href: 'https://8cpc.gov.in/',
  },
  {
    label: '8th CPC — official questionnaire page',
    href: 'https://8cpc.gov.in/8th-central-pay-commission/',
  },
  {
    label: '8th CPC — official memorandum-submission page',
    href: 'https://8cpc.gov.in/8cpc-memorandum-submission/',
  },
  {
    label: 'PIB — terms of reference and 18-month report period',
    href: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2183289',
  },
];

export default function EighthPayCommissionHubPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@type': 'Thing', name: '8th Central Pay Commission' },
      author: editorialTeamRef,
      reviewedBy: editorialTeamRef,
      publisher: { '@id': `${SITE_URL}/#organization` },
      publishingPrinciples: EDITORIAL_POLICY_URL,
      correctionsPolicy: CORRECTIONS_POLICY_URL,
      dateModified: LAST_REVIEWED_ISO,
      citation: officialSources.map((source) => source.href),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': `${PAGE_URL}#calculator`,
      name: '8th Pay Commission Salary Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a JavaScript-enabled web browser.',
      url: `${PAGE_URL}#calculator`,
      description:
        'Scenario calculator for the 8th Central Pay Commission. Applies a user-selected fitment factor to current basic pay or basic pension and returns revised basic, HRA with minimum-HRA floors, transport allowance, NPS/UPS/OPS deductions, CGEGIS, net pay and a conditional arrears estimate.',
      inLanguage: 'en-IN',
      isAccessibleForFree: true,
      dateModified: LAST_REVIEWED_ISO,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      publisher: { '@id': `${SITE_URL}/#organization` },
      creator: editorialTeamRef,
      maintainer: editorialTeamRef,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '8th Pay Commission', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {schemas.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-950">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>8th Pay Commission</span>
      </nav>

      <header className="mt-8">
        <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-800">
          Government Salary
        </span>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-brandDeepNavy md:text-5xl">
          8th Pay Commission September 2026: Fitment Factor &amp; Latest Status
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Almost every 8th Pay Commission number in circulation is a projection
          wearing the clothes of a decision. This page separates what is actually
          settled from what is not, explains the arithmetic that will apply
          whatever the final factor turns out to be, and points you at the
          official sources.
        </p>
        <EditorialByline className="mt-4" updatedIso={LAST_REVIEWED_ISO} />
      </header>

      <section
        id="status"
        className="mt-8 rounded-3xl border-l-4 border-l-rose-500 border-y border-r border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
          Latest verified update — {STATUS_AS_OF}
        </p>
        <p className="mt-2 text-lg font-bold leading-8 text-brandDeepNavy">
          The official 8th CPC calendar lists the Chennai stakeholder visit for 7-8 September and Puducherry
          for 9 September. No fitment factor is final: the Commission has not submitted its report, and the
          government has not issued a resolution, pay matrix, HRA structure or implementation date.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Constituted</dt>
            <dd className="mt-1 font-bold text-slate-900">3 November 2025</dd>
            <dd className="mt-1 text-xs leading-5 text-slate-600">
              Justice Ranjana Prakash Desai, Chairperson
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Report expected</dt>
            <dd className="mt-1 font-bold text-slate-900">Around May-June 2027</dd>
            <dd className="mt-1 text-xs leading-5 text-slate-600">
              An 18-month window to report, not a deadline to implement
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Fitment factor</dt>
            <dd className="mt-1 font-bold text-rose-700">Not announced</dd>
            <dd className="mt-1 text-xs leading-5 text-slate-600">
              Every figure in circulation is a projection or a demand
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm font-semibold text-slate-700">Consultation schedule currently listed:</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-600">
          {currentActivities.map((item) => (
            <li key={item.activity}>
              <strong className="font-semibold text-slate-800">{item.activity}</strong> — {item.schedule}.{' '}
              <span className="text-slate-500">{item.deadline}.</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Reviewed {STATUS_AS_OF}. Stakeholder visits show evidence gathering is active; they do not announce
          salary or pension outcomes. Visit schedules and representation deadlines can change — confirm the
          latest notice on the official 8th CPC website before acting.
        </p>
      </section>

      <div className="mt-8">
        <QuickAnswerBox
          title="Quick Answer"
          question="How much will salary rise under the 8th Pay Commission?"
          answer="Revised basic pay = current basic pay × fitment factor. No fitment factor has been officially notified, so no reliable rupee answer exists yet. The 7th Pay Commission used 2.57, which is why it is the common reference point. Because accumulated DA is merged into the revised basic and restarts near zero, take-home pay rises by considerably less than the fitment factor implies."
          formula="Revised basic = current basic × fitment factor; DA, HRA and TA are then recalculated on the revised basic"
          example="A current basic of Rs 44,900 at a 2.57 factor gives a revised basic of Rs 1,15,393 — a scenario, not a forecast."
          note="No fitment factor has been notified. Every figure here is a planning scenario. Confirm the official position on doe.gov.in and pib.gov.in."
          links={[
            {
              label: 'Run your own basic pay through the scenarios',
              href: '#calculator',
            },
            {
              label: 'Model an arrears period without assuming a date',
              href: ARREARS_CALCULATOR_URL,
            },
          ]}
        />
      </div>

      <AnswerEngineSummary
        className="mt-6"
        summary="RupeeKit's 8th Pay Commission hub explains that revised basic pay equals current basic pay multiplied by a fitment factor, that no fitment factor has been officially notified as at 8 September 2026, and that widely quoted figures such as 2.57 are references to the 7th Pay Commission rather than decisions. The official 8th CPC calendar lists stakeholder consultations in Chennai on 7-8 September and Puducherry on 9 September. Because accumulated dearness allowance is merged into the revised basic and restarts from a low base, the increase in take-home pay is materially smaller than the fitment factor suggests. Arrears and pension revision depend on the government resolution accepting the recommendations, not on the Commission's report alone."
      />

      {/* The calculator is the reason this page exists: a snippet can restate
          "no factor announced", but it cannot run the reader's own basic pay
          through five scenarios at once. */}
      <section id="calculator" className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          8th Pay Commission salary calculator
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-700">
          Enter your current basic pay and choose a fitment factor. The calculator applies the multiplier to
          basic pay, resets DA to zero as a new structure would, reverts HRA to the lower 24/16/8 slab with
          the minimum-HRA floors that stop an entry-level employee taking a pay cut, and deducts NPS, UPS or
          CGEGIS to reach a net figure. Pensioners can switch modes for a basic-pension projection.
        </p>
        <div className="mt-6">
          <EighthPayCommissionCalculator />
        </div>
      </section>

      <section id="is-it-announced" className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Is the fitment factor officially announced?
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          No. As at {STATUS_AS_OF} the 8th Central Pay Commission has not submitted recommendations, and the
          government has not issued the resolution that would make any factor operative. There is no official
          8th CPC fitment factor to report, and any page that names one is reporting a projection as a
          decision.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          This matters practically, not just editorially. The difference between the low-end 1.92 projection
          and the 3.00 demand figure is roughly a doubling of the increase, and nobody outside the Commission
          knows which end the recommendation will sit at. That is why{' '}
          <Link href="#calculator" className="font-semibold text-brandNavy underline underline-offset-2">
            the calculator above
          </Link>{' '}
          shows all five scenarios side by side rather than picking one for you.
        </p>
      </section>

      <section id="fitment-factor-employees" className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          8th CPC fitment factor for government employees
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          For a serving employee the factor multiplies basic pay only. Take a Level 7 employee on a basic of
          Rs 44,900: at 2.28 the revised basic is Rs 1,02,400, and at 2.57 it is Rs 1,15,400. Both look like
          large jumps, and both overstate the change to take-home pay, because the 60% DA currently sitting on
          top of that basic is merged into the revised figure and then restarts from zero.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          Two further mechanics move the net figure. HRA reverts from the current 30/20/10 rates to 24/16/8,
          and transport allowance stays a flat amount that no longer attracts DA. Against that, the
          minimum-HRA floors scale with the fitment factor, which is what protects an employee on the Rs 18,000
          minimum basic from losing money on the HRA line when the percentage drops. Compare revised gross
          against current gross, never revised basic against current basic.
        </p>
      </section>

      <section id="fitment-factor-pensioners" className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Fitment factor for pensioners</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Pension revision has historically tracked the pay revision, with the same multiplier applied to basic
          pension and dearness relief restarting from a low base exactly as DA does. On a basic pension of
          Rs 31,550, a 2.28 factor gives a revised basic pension of Rs 71,900 before any DR.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          What is genuinely unsettled is the method. Commissions have differed between notional pay fixation,
          full parity and a flat multiplier, and the 8th CPC has notified none of them. Pensioner mode in the
          calculator models the flat-multiplier case and keeps current DR separate rather than folding it in,
          so the projection is not quietly double-counting relief you already receive.
        </p>
      </section>

      <section id="when-announced" className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          When will the fitment factor be announced?
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          The Commission was constituted on 3 November 2025 with an 18-month window to report, which points to
          recommendations around May or June 2027. That is a reporting window, not an implementation date. The
          factor becomes operative only after the government publishes a resolution accepting or modifying the
          recommendations, and departments then issue pay-fixation orders — a sequence that took roughly a year
          after the 7th CPC reported.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          Whether any of it is paid retrospectively is a separate decision made in that same resolution. The
          arrears figure in the calculator accrues from 1 January 2026 because that is the date most commonly
          referenced in coverage, and it is labelled conditional for exactly this reason: no effective date,
          arrears period or payment order exists yet.
        </p>
      </section>

      <section id="commission-comparison" className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          6th vs 7th vs 8th CPC fitment factor
        </h2>
        <p className="mt-3 leading-7 text-slate-700">
          The first two rows are settled history. The third is blank because the Commission has not reported —
          and a blank cell is the accurate entry.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-brandBorder bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Commission</th>
                <th scope="col" className="px-4 py-3">Effective from</th>
                <th scope="col" className="px-4 py-3">Fitment factor</th>
                <th scope="col" className="px-4 py-3">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissionComparison.map((row) => (
                <tr key={row.commission} className={row.settled ? undefined : 'bg-rose-50/50'}>
                  <th scope="row" className="px-4 py-4 text-left font-bold text-slate-900">
                    {row.commission}
                  </th>
                  <td className="px-4 py-4 text-slate-600">{row.effectiveFrom}</td>
                  <td className={`px-4 py-4 font-bold ${row.settled ? 'text-slate-900' : 'text-rose-700'}`}>
                    {row.fitmentFactor}
                  </td>
                  <td className="px-4 py-4 leading-6 text-slate-600">{row.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          The roughly ten-year cadence between commissions is a pattern, not a rule, and the 1.86-to-2.57 step
          between the last two does not establish a trend that fixes the next one.
        </p>
      </section>

      <section className="mt-12 rounded-3xl border border-sky-200 bg-sky-50 p-5 md:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Official status checked {STATUS_AS_OF}</p>
        <h2 className="mt-2 text-2xl font-bold text-brandDeepNavy">8th Pay Commission timeline and what is pending</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-700">
          The Commission is active and collecting evidence, but the official record still does not contain a final fitment factor, pay matrix, revised HRA rate, pension method, implementation date or arrears order.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-sky-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-sky-100/70 text-xs uppercase tracking-wide text-sky-900">
              <tr><th className="px-4 py-3">Milestone</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">What it means</th></tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {officialStatus.map((item) => (
                <tr key={item.milestone}>
                  <td className="px-4 py-4 font-bold text-slate-900">{item.milestone}</td>
                  <td className="px-4 py-4 text-slate-600">{item.date}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.status}</span></td>
                  <td className="px-4 py-4 leading-6 text-slate-600">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Settled vs speculation
        </h2>
        <div className="mt-5 space-y-4">
          {settledVsSpeculation.map((row) => (
            <div
              key={row.claim}
              className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-bold text-slate-900">{row.claim}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    row.verdict === 'Not settled'
                      ? 'bg-rose-100 text-rose-700'
                      : row.verdict === 'Depends on notification'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {row.verdict}
                </span>
              </div>
              <p className="mt-3 leading-7 text-slate-600">{row.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Why the headline factor overstates your raise
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Your current gross is basic plus a DA percentage that has been climbing
          for years, plus HRA and allowances. When a new pay structure takes
          effect, that accumulated DA is folded into the revised basic and the DA
          percentage restarts near zero. So the fitment factor is applied to
          basic, but a large part of what it &ldquo;adds&rdquo; is money you were
          already receiving as DA.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          The practical consequence: compare <em>revised gross against current
          gross</em>, never revised basic against current basic. The{' '}
          <Link
            href={CALCULATOR_URL}
            className="font-semibold text-brandNavy underline underline-offset-2"
          >
            8th Pay Commission salary calculator
          </Link>{' '}
          lets you set the fitment factor and DA percentage yourself so you can
          see that gap for your own pay, rather than a stock example.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Scenarios by pay matrix level
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Each level starts from a different cell of the current matrix, so the
          same fitment factor produces a very different figure. Pick your level
          to see the four published scenarios applied to its entry pay, and how
          much of the apparent rise is really the DA merge.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {PAY_MATRIX_LEVELS.map((entry) => (
            <Link
              key={entry.slug}
              href={`/8th-pay-commission/${entry.slug}`}
              className="rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-brandNavy transition hover:border-brandNavy/40 hover:bg-slate-50"
            >
              Level {entry.level}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Levels 15 to 18 are fixed-pay apex posts held by a very small number of
          officers and are not published as separate pages.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Calculators for this cluster
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {relatedTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm transition hover:border-brandNavy/30 hover:shadow-md"
            >
              <p className="font-bold text-brandNavy">{tool.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-brandBorder bg-slate-50 p-5 md:p-6">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Related pages in this cluster</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Pay matrix</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/8th-pay-commission/level-1" className="font-semibold text-brandNavy underline underline-offset-2">
                  Level 1 pay matrix scenarios
                </Link>
              </li>
              <li>
                <Link href="/8th-pay-commission/level-7" className="font-semibold text-brandNavy underline underline-offset-2">
                  Level 7 pay matrix scenarios
                </Link>
              </li>
              <li>
                <Link href="/8th-pay-commission/level-10" className="font-semibold text-brandNavy underline underline-offset-2">
                  Level 10 pay matrix scenarios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Pension</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href={PENSION_CALCULATOR_URL} className="font-semibold text-brandNavy underline underline-offset-2">
                  8th CPC pension calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/pension-commutation-calculator-india" className="font-semibold text-brandNavy underline underline-offset-2">
                  Pension commutation calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/notional-increment-pension-calculator-india" className="font-semibold text-brandNavy underline underline-offset-2">
                  Notional increment on pension
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">DA and allowances</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/government-salary-updates" className="font-semibold text-brandNavy underline underline-offset-2">
                  DA revision tracking
                </Link>
              </li>
              <li>
                <Link href={ARREARS_CALCULATOR_URL} className="font-semibold text-brandNavy underline underline-offset-2">
                  8th CPC arrears calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/hra-exemption-calculator-india" className="font-semibold text-brandNavy underline underline-offset-2">
                  HRA exemption calculator
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Read next</h2>
        <ul className="mt-5 space-y-3">
          {relatedReading.map((item) => (
            <li key={item.href} className="rounded-2xl border border-brandBorder bg-white p-5">
              <Link
                href={item.href}
                className="font-bold text-brandNavy underline underline-offset-2"
              >
                {item.label}
              </Link>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="faqs" className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          8th Pay Commission questions, answered
        </h2>
        <div className="mt-5 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm"
            >
              <h3 className="font-bold text-slate-900">{faq.question}</h3>
              <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="source-and-methodology"
        className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <h2 className="text-2xl font-bold text-brandDeepNavy">Source and methodology</h2>
        <p className="mt-4 leading-8 text-slate-700">
          This page describes the mechanics of a pay commission revision, which
          are stable across commissions, and is explicit about which inputs are
          undecided. It does not state a fitment factor as fact, and it does not
          reproduce projections from news aggregation as if they were decisions.
          When the government resolution is published, this page and the
          calculator will be revised against it and the review date updated.
        </p>
        <ul className="mt-4 space-y-2">
          {officialSources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brandNavy underline underline-offset-2"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-slate-500">
          Educational information only, not personal financial advice. RupeeKit is
          not affiliated with or endorsed by any government department. Spotted
          something out of date?{' '}
          <Link href="/corrections-policy" className="underline underline-offset-2">
            Tell us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
