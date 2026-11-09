import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';

import EditorialByline from '@/components/seo/EditorialByline';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import { nriTaxationPost } from '@/data/nri-taxation-basics-residency-taxable-income-india';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';
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
  'How NRE and NRO accounts are taxed, what DTAA relief does, the USD 1 million repatriation limit and when Schedule FA and RSU disclosure apply.';

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

const accountComparison = [
  {
    feature: 'What you can pay in',
    nre: 'Overseas remittances, transfers from eligible NRE/FCNR(B) accounts and other permitted credits, including eligible current income from India.',
    nro: 'Indian-source income — rent, dividends, interest, pension, property sale proceeds — and foreign funds.',
  },
  {
    feature: 'Tax on interest in India',
    nre: 'Interest exemption depends on FEMA residential status or RBI permission to maintain the account, not income-tax residency alone.',
    nro: 'Interest is fully taxable in India.',
  },
  {
    feature: 'TDS on interest',
    nre: 'No TDS while the exemption applies.',
    nro: 'Withholding applies under the rules for the relevant tax year. Treaty relief or a valid lower-deduction certificate can change the rate.',
  },
  {
    feature: 'Repatriation',
    nre: 'Principal and interest are freely repatriable.',
    nro: 'Current income has a separate remittance route. Other eligible NRO balances and assets share a USD 1 million annual facility, subject to RBI conditions and tax compliance.',
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
      'NRE interest is exempt when the account is maintained under FEMA and you are a person resident outside India under FEMA, or RBI permits you to maintain it. Income-tax residential status is a separate test. Returning to India can require account redesignation even if you remain resident but not ordinarily resident for income tax. Check the bank rules before assuming the exemption continues; your country of residence may also tax the interest.',
  },
  {
    question: 'How much TDS is deducted on NRO interest?',
    answer:
      'NRO interest is taxable and the bank applies the withholding rules for the relevant tax year. The amount withheld is not automatically your final tax liability. Ask the bank to confirm the applicable rate, surcharge and cess, and whether treaty documents or a valid lower-deduction certificate change the deduction. A return may establish an excess-tax refund, subject to your facts and filing requirements.',
  },
  {
    question: 'What does DTAA actually do for me?',
    answer:
      'A Double Taxation Avoidance Agreement can provide relief through the relevant treaty article, such as a withholding limit or a credit for tax paid in the other country. Eligibility depends on the income and the treaty conditions. Provide a Tax Residency Certificate and the required declaration: Form 41 under the Income-tax Rules, 2026 replaces Form 10F under the earlier rules. Ask the bank which tax-year documents it needs before applying a treaty rate.',
  },
  {
    question: 'How much can I repatriate from my NRO account?',
    answer:
      'RBI distinguishes remittance of current income, such as rent, dividends, pension and interest, from the USD 1 million per financial year facility for other eligible NRO balances and assets. Do not automatically count current-income remittances against that asset facility. Ask your authorised dealer bank to classify the funds, check taxes and confirm documents. The accountant’s certificate, now Form 146 under the 2026 rules (previously Form 15CB), is conditional; taxability, amount and an assessing-officer certificate can affect the requirement.',
  },
  {
    question: 'Do I have to disclose foreign assets in my Indian return?',
    answer:
      'Schedule FA generally applies to a resident and ordinarily resident taxpayer with reportable foreign assets. The official instructions exclude non-residents and residents who are not ordinarily resident (RNOR). Returning to India does not by itself make Schedule FA mandatory: establish your status for the relevant year and follow that return’s reporting period. When applicable, check overseas accounts, shares, property and other reportable interests; use the appropriate ITR-2 or ITR-3 instructions rather than ITR-1.',
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
    href: `/blog/${nriTaxationPost.slug}`,
    label: nriTaxationPost.title,
    note: nriTaxationPost.metaDescription,
  },
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
    label: 'RBI — Accounts in India by Non-residents, permitted credits and repatriation (16 January 2025)',
    href: 'https://www.rbi.org.in/commonman/Upload/English/FAQs/PDFs/Accountresidents16012025.pdf',
  },
  {
    label: 'Income Tax Department — Non-Resident FAQs, NRE exemption and FEMA status (questions 23–24)',
    href: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/non%20resident%20-faq',
  },
  {
    label: 'Income Tax Department — Schedule FA instructions and NR/RNOR exclusions (page 4)',
    href: 'https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-01/Refer%20annexure%20and%20step%20by%20step%20guide.pdf',
  },
  {
    label: 'Income Tax Department — Form 15CB conditions and certificate requirements',
    href: 'https://www.incometax.gov.in/iec/foportal/help/statutory-forms/popular-form/form15cb-faq',
  },
  {
    label: 'Income Tax Department — Form 146, current remittance certificate conditions',
    href: 'https://www.incometaxindia.gov.in/documents/d/guest/fn-146',
  },
  {
    label: 'Income Tax Department — Form 41, treaty declaration replacing Form 10F',
    href: 'https://www.incometaxindia.gov.in/documents/d/guest/fn-41',
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
        answer="NRE interest exemption depends on FEMA status or RBI permission. NRO interest is taxable, with withholding subject to the applicable tax-year rules and any available treaty relief. RBI treats current-income remittances separately from the USD 1 million annual facility for other eligible NRO balances and assets. Schedule FA excludes non-residents and RNOR taxpayers."
        note="FEMA residence and income-tax residence are separate tests. Confirm account eligibility, tax-year rules and remittance documents with the bank and the exact official sources below."
      />
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          NRE vs NRO: the difference that decides your tax
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          Check <strong>account eligibility and permitted credits</strong> before
          routing a payment. NRE accounts can receive eligible overseas funds and
          some permitted Indian current income; NRO accounts can receive Indian
          income and overseas remittances. The source of money alone does not
          establish income-tax residence or determine every remittance condition.
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
          Check treaty eligibility before the bank credits interest. A reduced
          treaty rate is not applied by default. To claim it
          at source you generally have to give the bank, before the interest is
          credited:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-slate-700">
          <li>A Tax Residency Certificate issued by your country of residence.</li>
          <li>Form 41 under the 2026 rules, or Form 10F where the earlier rules apply, filed electronically on the income tax portal.</li>
          <li>Any additional declarations the bank requires to establish the applicable treaty conditions.</li>
        </ul>
        <p className="mt-4 leading-8 text-slate-700">
          Check the validity period and the bank’s document requirements for the
          relevant year. If excess tax was withheld, a refund depends on your
          final liability and an appropriate return; it is not automatic.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-brandDeepNavy">
          Schedule FA: the year you move back is the risky one
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          The official instructions exclude <strong>non-residents and residents
          who are not ordinarily resident (RNOR)</strong> from Schedule FA. A
          returning taxpayer should first establish whether the relevant year’s
          status is NR, RNOR or resident and ordinarily resident. Where disclosure
          applies, check the return’s reporting period and each reportable foreign
          account, investment or other interest. A change in bank-account status
          does not by itself decide Schedule FA eligibility.
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
          The linked documents support the distinctions between FEMA and tax
          residence, permitted account credits, current-income and asset
          remittances, conditional accountant certification and the NR/RNOR
          exclusion from Schedule FA. Income-tax residence depends on the
          applicable year’s tests and exceptions; FEMA uses a separate definition.
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          These specific source corrections were checked on 8 October 2026.
          This is a limited source check, not a full review of every treaty,
          withholding rate or filing requirement. Use the instructions for your
          tax year, including any replacement form numbers under the new Act.
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
