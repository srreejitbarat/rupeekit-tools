import type { Metadata } from 'next';
import Link from 'next/link';

import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import EditorialByline from '@/components/seo/EditorialByline';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  SITE_URL,
  editorialTeamRef,
} from '@/lib/seo/editorial';

const PAGE_URL = `${SITE_URL}/nri`;
const LAST_REVIEWED_ISO = '2026-08-12';

const TITLE = 'NRI Tax & Money Guide India 2026 | NRE, NRO, Schedule FA';
const DESCRIPTION =
  'How NRE and NRO accounts are taxed, what DTAA relief actually does, the USD 1 million repatriation limit, and when Schedule FA and RSU disclosure apply. Sourced to RBI and the Income Tax Department.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
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

const accountComparison = [
  {
    feature: 'What you can pay in',
    nre: 'Foreign earnings only, converted to rupees on credit.',
    nro: 'Indian-source income — rent, dividends, interest, pension, property sale proceeds — and foreign funds.',
  },
  {
    feature: 'Tax on interest in India',
    nre: 'Interest is exempt from Indian income tax while you qualify as a non-resident.',
    nro: 'Interest is fully taxable in India.',
  },
  {
    feature: 'TDS on interest',
    nre: 'No TDS while the exemption applies.',
    nro: 'Deducted at source under section 195 at 30% plus applicable surcharge and 4% health and education cess — 31.2% before surcharge.',
  },
  {
    feature: 'Repatriation',
    nre: 'Principal and interest are freely repatriable.',
    nro: 'Up to USD 1 million per financial year, after taxes are paid and Form 15CA/15CB is filed.',
  },
  {
    feature: 'Typical use',
    nre: 'Parking overseas salary and savings in India.',
    nro: 'Receiving and managing money that arises in India.',
  },
];

const faqs = [
  {
    question: 'Is NRE account interest taxable in India?',
    answer:
      'No. Interest on an NRE account is exempt from Indian income tax for as long as you qualify as a non-resident under the Income Tax Act. The exemption is tied to your residential status, not to the account label — if you return to India and become a resident, the account has to be redesignated and the exemption stops. The interest may still be taxable in your country of residence.',
  },
  {
    question: 'How much TDS is deducted on NRO interest?',
    answer:
      'Banks deduct TDS on NRO interest under section 195 at 30% plus surcharge (where applicable) and 4% health and education cess, so the base rate works out to 31.2% before surcharge. There is no minimum threshold — TDS applies from the first rupee. If your actual tax liability is lower, you can either claim a DTAA rate up-front or claim a refund by filing an Indian return.',
  },
  {
    question: 'What does DTAA actually do for me?',
    answer:
      'A Double Taxation Avoidance Agreement stops the same income being fully taxed twice. In practice it does one of two things: it caps the rate India can deduct at source (often lower than 31.2% on interest), or it gives you a credit in your country of residence for tax already paid in India. To claim the lower Indian rate you generally need a Tax Residency Certificate from your country of residence plus Form 10F and a self-declaration filed with the bank — the reduced rate is not applied automatically.',
  },
  {
    question: 'How much can I repatriate from my NRO account?',
    answer:
      'RBI permits repatriation of up to USD 1 million per financial year from your NRO account. The limit is per person, not per property or per transaction, and it pools everything you send out that year — rent, dividends, interest, property sale proceeds and inherited funds. Each remittance needs Form 15CA from you and Form 15CB from a chartered accountant confirming Indian taxes have been paid. Going above USD 1 million in one financial year requires RBI approval through your bank.',
  },
  {
    question: 'Do I have to disclose foreign assets in my Indian return?',
    answer:
      'Schedule FA applies to residents who hold foreign assets — foreign bank accounts, overseas shares, RSUs and ESOPs from a foreign parent, foreign property, and foreign retirement accounts. It does not apply to non-residents. The common trap is the year you return to India: once you become a resident, foreign assets you have held for years become disclosable, and vested RSUs in a foreign parent company are the most frequently missed item. Schedule FA is filed with ITR-2 or ITR-3, not ITR-1.',
  },
  {
    question: 'Are foreign assets already visible to the tax department?',
    answer:
      'Increasingly, yes. Foreign asset information received under international exchange-of-information agreements now surfaces in the Annual Information Statement. Treat what appears in AIS as a prompt to check, not as a complete or automatically correct record — items can be missing, duplicated or misclassified, and your disclosure obligation does not depend on whether the item showed up in AIS.',
  },
];

const relatedTools = [
  {
    href: '/tools/capital-gains-tax-calculator-india',
    label: 'Capital Gains Tax Calculator (Equity)',
    note: 'Estimate STCG and LTCG on Indian listed equity before filling Schedule CG.',
  },
  {
    href: '/tools/income-tax-calculator-old-vs-new-regime-india',
    label: 'Old vs New Tax Regime Calculator',
    note: 'Compare regimes on Indian-source slab income for the year you file as a resident.',
  },
  {
    href: '/tools/fd-calculator-india',
    label: 'FD Calculator',
    note: 'Project NRO or resident fixed-deposit maturity before comparing post-tax returns.',
  },
  {
    href: '/tools/hra-exemption-calculator-india',
    label: 'HRA Exemption Calculator',
    note: 'Relevant in the year you move back and draw an Indian salary with rent paid.',
  },
];

const relatedReading = [
  {
    href: '/blog/itr-2-ay-2026-27-filing-guide',
    label: 'ITR-2 AY 2026-27: Deadline, Documents and Late Filing Guide',
    note: 'Covers Schedule CG, Schedule FA and RSU disclosure in detail.',
  },
  {
    href: '/financial-updates/foreign-assets-information-in-ais-july-2026',
    label: 'Foreign Assets Now Visible in AIS: What to Check Before Filing',
    note: 'What the AIS foreign-asset feed shows, and what it misses.',
  },
  {
    href: '/blog/save-capital-gains-tax-equity-india',
    label: 'How to Reduce Capital Gains Tax on Equity in India',
    note: 'Exemption, holding period and harvesting mechanics on Indian equity.',
  },
];

const officialSources = [
  {
    label: 'Reserve Bank of India — FEMA deposit and remittance rules',
    href: 'https://www.rbi.org.in/',
  },
  {
    label: 'Income Tax Department — residential status, DTAA and Schedule FA',
    href: 'https://www.incometax.gov.in/',
  },
  {
    label: 'Income Tax Department — Annual Information Statement',
    href: 'https://www.incometax.gov.in/iec/foportal/help/annual-information-statement',
  },
];

export default function NriHubPage() {
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
      about: { '@type': 'Thing', name: 'NRI taxation and banking in India' },
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
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'NRI Guide', item: PAGE_URL },
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
        <span>NRI Guide</span>
      </nav>

      <header className="mt-8">
        <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-sky-700">
          NRI &amp; Foreign Income
        </span>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-brandDeepNavy md:text-5xl">
          NRI Tax &amp; Money Guide India 2026
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          The rules that actually catch people out: which account is taxed and
          which is not, what a DTAA claim requires before the bank will honour it,
          how much you can send out of an NRO account in a year, and the return in
          which foreign assets have to be disclosed.
        </p>
        <EditorialByline className="mt-4" updatedIso={LAST_REVIEWED_ISO} />
      </header>

      <div className="mt-8">
      <QuickAnswerBox
        title="Quick Answer"
        question="How are NRE and NRO accounts taxed in India?"
        answer="NRE interest is exempt from Indian income tax while you are a non-resident. NRO interest is fully taxable, with TDS deducted at source under section 195 at 30% plus surcharge and 4% cess — 31.2% before surcharge. A DTAA can reduce that rate, but only if you file a Tax Residency Certificate and Form 10F with the bank first. NRO funds are repatriable up to USD 1 million per financial year once taxes are paid."
        note="Educational information only, not personal tax advice. Residential status is decided under the Income Tax Act by day-count, not by which account you hold. Verify against incometax.gov.in and rbi.org.in before acting."
      />
      </div>

      <AnswerEngineSummary
        className="mt-6"
        summary="RupeeKit's NRI hub explains Indian tax and remittance rules for non-resident Indians: NRE interest is tax-exempt in India while non-resident status holds; NRO interest is taxable with section 195 TDS at 30% plus surcharge and 4% cess; DTAA relief requires a Tax Residency Certificate and Form 10F; NRO repatriation is capped at USD 1 million per financial year with Forms 15CA and 15CB; and Schedule FA foreign-asset disclosure applies to residents, including RSUs in a foreign parent company, filed with ITR-2 or ITR-3."
      />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          NRE vs NRO: the difference that decides your tax
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Both are rupee accounts held by non-residents, and banks often open them
          together, which is exactly why they get mixed up. The distinction that
          matters is <strong>where the money came from</strong>: NRE holds money
          you earned abroad, NRO holds money that arose in India. That one
          difference drives the tax treatment, the TDS and the repatriation limit.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 pr-4 font-bold text-brandDeepNavy">&nbsp;</th>
                <th className="py-3 pr-4 font-bold text-brandDeepNavy">NRE account</th>
                <th className="py-3 font-bold text-brandDeepNavy">NRO account</th>
              </tr>
            </thead>
            <tbody>
              {accountComparison.map((row) => (
                <tr key={row.feature} className="border-b border-slate-200 align-top">
                  <td className="py-3 pr-4 font-semibold text-slate-800">{row.feature}</td>
                  <td className="py-3 pr-4 leading-6 text-slate-600">{row.nre}</td>
                  <td className="py-3 leading-6 text-slate-600">{row.nro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Claiming DTAA relief is a paperwork problem, not a rate problem
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Most people discover DTAA after the bank has already deducted 31.2% on
          their NRO interest. The treaty rate is not applied by default. To get it
          at source you generally have to give the bank, before the interest is
          credited:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-slate-700">
          <li>A Tax Residency Certificate issued by your country of residence.</li>
          <li>Form 10F, filed electronically on the income tax portal.</li>
          <li>A self-declaration that you have no permanent establishment in India.</li>
        </ul>
        <p className="mt-4 leading-8 text-slate-700">
          These are annual, not one-time. If you miss the window, the money is not
          lost — you file an Indian return and claim a refund of the excess. That
          is slower, and it is the reason a lot of NRIs have refunds sitting
          unclaimed for years.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Schedule FA: the year you move back is the risky one
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Schedule FA is a <em>resident</em> obligation. As a non-resident you do
          not file it. The problem is the transition year: the moment your
          day-count makes you a resident, foreign assets you have quietly held for
          a decade become disclosable — the overseas bank account you never
          closed, the brokerage account, the foreign pension, and above all
          vested RSUs or ESOPs in a foreign parent company.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          Schedule FA cannot be filed with ITR-1. If it applies to you, you are on
          ITR-2 or ITR-3. Our{' '}
          <Link
            href="/blog/itr-2-ay-2026-27-filing-guide"
            className="font-semibold text-brandNavy underline underline-offset-2"
          >
            ITR-2 filing guide
          </Link>{' '}
          works through Schedule CG and Schedule FA line by line.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Calculators for NRI planning</h2>
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
          NRI tax questions, answered
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

      <section id="source-and-methodology" className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Source and methodology</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Rates, limits and disclosure requirements on this page are stated as
          they apply under current Indian rules and are traced to the primary
          sources below. Tax treatment depends on your residential status under
          the Income Tax Act, which is determined by day-count for the relevant
          previous year — not by the type of bank account you hold, your passport,
          or your visa.
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
          Educational information only. This is not personalised tax, legal or
          investment advice, and it does not account for your country of
          residence&rsquo;s rules. Cross-border tax positions turn on facts that a
          web page cannot see — confirm with a qualified professional before
          acting. Found an error?{' '}
          <Link href="/corrections-policy" className="underline underline-offset-2">
            Tell us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
