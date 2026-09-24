import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import FactsTable from '@/components/seo/FactsTable';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import DiscoverHeroImage from '@/components/seo/DiscoverHeroImage';
import EditorialByline from '@/components/seo/EditorialByline';
import { editorialTeamRef } from '@/lib/seo/editorial';
import { TaxCalculatorApp } from '@/components/tax/TaxCalculatorApp';
import { getDiscoverImage } from '@/data/discover-images';
import { calculateIndianIncomeTax, type TaxInput } from '@/lib/tax/calculator';
import { availableTaxYears, indiaIncomeTaxRules } from '@/lib/tax/indiaIncomeTaxRules';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const PAGE_URL = `${SITE_URL}/tools/income-tax-calculator-old-vs-new-regime-india`;
const DISCOVER_IMAGE = getDiscoverImage('/tools/income-tax-calculator-old-vs-new-regime-india');
const DISCOVER_IMAGE_URL = DISCOVER_IMAGE ? `${SITE_URL}${DISCOVER_IMAGE.src}` : undefined;

const latestSupportedFy = availableTaxYears[0];
const latestSupportedRules = indiaIncomeTaxRules[latestSupportedFy];

// Derived from the rules table so the copy cannot drift from the year actually
// used for the calculations below.
const TARGET_FY = latestSupportedFy;
const TARGET_AY = latestSupportedRules.ay;

const pageTitle = 'Old vs New Tax Regime Calculator | Compare Tax & Savings';
const pageDescription =
  'Compare estimated tax under old and new regimes using salary, deductions, HRA, 80C, 80D, NPS and home-loan inputs for the selected financial year.';

function formatInr(value: number) {
  return `Rs ${Math.round(value).toLocaleString('en-IN')}`;
}

const comparisonRows = [
  {
    point: 'Tax slab structure',
    oldRegime: 'Generally higher slab rates.',
    newRegime: 'Generally lower slab rates for many income bands.',
  },
  {
    point: 'Major deductions (80C, 80D, HRA, home loan interest)',
    oldRegime: 'Many deductions and exemptions may be claimed where applicable.',
    newRegime: 'Most of these are not available, except specific allowed items.',
  },
  {
    point: 'Standard deduction for salaried taxpayers',
    oldRegime: 'Available as per supported year rules.',
    newRegime: 'Available as per supported year rules.',
  },
  {
    point: 'Ease of filing inputs',
    oldRegime: 'More documents and deduction tracking may be needed.',
    newRegime: 'Can be simpler when deduction claims are low.',
  },
  {
    point: 'Who may find it useful',
    oldRegime: 'May be useful when deduction claims are high.',
    newRegime: 'May be useful when deductions are limited.',
  },
];

const salaryExampleIncomes = [700000, 1000000, 1200000, 1500000, 2000000];
const baseEstimateInput: TaxInput = {
  grossSalary: 0,
  hraExemption: 0,
  homeLoanInterest: 0,
  section80C: 0,
  section80D: 0,
  employerNPS: 0,
  otherDeductionsOldRegime: 0,
  otherDeductionsBothRegimes: 0,
  isSalaried: true,
};

const salaryExampleRows = salaryExampleIncomes.map((grossSalary) => {
  const result = calculateIndianIncomeTax({ ...baseEstimateInput, grossSalary }, latestSupportedFy);
  const difference = Math.abs(result.oldRegime.finalTax - result.newRegime.finalTax);
  return {
    grossSalary,
    oldTax: result.oldRegime.finalTax,
    newTax: result.newRegime.finalTax,
    lowerRegime: result.recommendedRegime === 'Equal' ? 'Equal' : `${result.recommendedRegime} regime`,
    difference,
  };
});

const deductionImpactScenarios: Array<{
  label: string;
  field: keyof TaxInput;
  amount: number;
  note: string;
}> = [
  {
    label: 'Section 80C',
    field: 'section80C',
    amount: 150000,
    note: 'Old regime deduction bucket, subject to applicable limits and eligibility.',
  },
  {
    label: 'HRA exemption',
    field: 'hraExemption',
    amount: 150000,
    note: 'Illustrative exempt HRA value, only where eligibility conditions are met.',
  },
  {
    label: 'Section 80D',
    field: 'section80D',
    amount: 25000,
    note: 'Health insurance deduction scenario under old regime eligibility.',
  },
  {
    label: 'Employer NPS (80CCD(2))',
    field: 'employerNPS',
    amount: 50000,
    note: 'Illustrative amount often considered in both regimes where allowed.',
  },
  {
    label: 'Home loan interest (Section 24b)',
    field: 'homeLoanInterest',
    amount: 200000,
    note: 'Illustrative old-regime deduction scenario with self-occupied cap context.',
  },
];

const deductionImpactBaseInput: TaxInput = {
  ...baseEstimateInput,
  grossSalary: 1200000,
};
const deductionImpactBaseResult = calculateIndianIncomeTax(deductionImpactBaseInput, latestSupportedFy);
const deductionImpactRows = deductionImpactScenarios.map((scenario) => {
  const scenarioInput: TaxInput = {
    ...deductionImpactBaseInput,
    [scenario.field]: scenario.amount,
  };
  const scenarioResult = calculateIndianIncomeTax(scenarioInput, latestSupportedFy);
  return {
    label: scenario.label,
    amount: scenario.amount,
    oldTaxChange: Math.max(0, deductionImpactBaseResult.oldRegime.finalTax - scenarioResult.oldRegime.finalTax),
    newTaxChange: Math.max(0, deductionImpactBaseResult.newRegime.finalTax - scenarioResult.newRegime.finalTax),
    note: scenario.note,
  };
});

const faqs = [
  {
    question: 'Which is better: old tax regime or new tax regime?',
    answer:
      'The new tax regime may be simpler for taxpayers with fewer deductions, while the old tax regime may save more tax when deductions such as 80C, HRA, NPS, health insurance and home loan interest are high. Use this calculator to compare both regimes using your income and deductions. This is an educational estimate, not tax advice.',
  },
  {
    question: 'How does the old vs new tax regime calculator work?',
    answer:
      'It applies supported-year slab, deduction, rebate and cess rules to your entered values, then compares estimated outcomes for old and new regimes side by side.',
  },
  {
    question: 'Can HRA be claimed in the new tax regime?',
    answer:
      'Major HRA exemption claims are generally not available in the new regime. Use this calculator to compare outcomes after entering your own deduction assumptions.',
  },
  {
    question: 'Are 80C and 80D allowed in the new tax regime?',
    answer:
      'Most old-regime deduction buckets such as 80C and 80D are generally not available in the new regime. Check applicable-year rules before filing.',
  },
  {
    question: 'Is the new tax regime mandatory?',
    answer:
      'The new regime may be the default in many filing flows, but taxpayers should verify current-year option rules and eligibility before final submission.',
  },
  {
    question: 'Does the calculator include Section 87A rebate and cess?',
    answer:
      'Yes. Rebate logic for supported years and 4% health and education cess are included in the estimate output.',
  },
  {
    question: 'Which financial years are currently supported here?',
    answer: `This calculator supports ${availableTaxYears.map((year) => `FY ${year}`).join(', ')}. FY ${TARGET_FY} (AY ${TARGET_AY}) is the default. Budget 2026 left the new-regime slabs unchanged, so it applies the Finance Act, 2025 slabs, the Rs 75,000 standard deduction for salaried taxpayers, the Section 87A rebate up to Rs 60,000 with marginal relief, and 4% health and education cess.`,
  },
  {
    question: 'Does this calculator handle capital gains or other special-rate income?',
    answer:
      'No. It compares regimes for normal slab-rate income such as salary for a resident individual. Equity STCG, LTCG and other special-rate income follow separate rates and different Section 87A rebate treatment, so total tax can differ when such income exists. Use the capital gains calculator for equity gains and verify combined liability in the official filing utility.',
  },
  {
    question: 'Should I rely on this as final tax advice?',
    answer:
      'No. This page provides educational estimates only. Verify final tax with official filing utilities, Form 16, AIS/Form 26AS, and a qualified tax professional.',
  },
  {
    question: 'Is there a free online calculator to compare old vs new tax regime?',
    answer:
      'Yes. This page is a free online old vs new tax regime calculator for India. Enter your income and deductions to instantly compare estimated tax under both regimes, with no signup required.',
  },
  {
    question: 'नई और पुरानी टैक्स रिज़ीम में कौन सी बेहतर है?',
    answer:
      'यह पूरी तरह आपकी कटौतियों (deductions) पर निर्भर करता है। नई रिज़ीम में दरें कम हैं लेकिन 80C, HRA, 80D जैसी अधिकांश छूट नहीं मिलतीं; पुरानी रिज़ीम में दरें ऊँची हैं पर ये छूट उपलब्ध हैं। अगर आप HRA, होम लोन ब्याज और 80C का पूरा लाभ लेते हैं तो पुरानी रिज़ीम फ़ायदेमंद हो सकती है, वरना आमतौर पर नई रिज़ीम बेहतर बैठती है। कोई एक नियम सबके लिए सही नहीं है — ऊपर दिए कैलकुलेटर में अपने वास्तविक आँकड़े डालकर दोनों की तुलना करें।',
  },
  {
    question: '12 लाख की आय पर कितना टैक्स लगेगा?',
    answer: `नई टैक्स रिज़ीम में वित्त वर्ष ${TARGET_FY} के लिए, यदि आपकी सामान्य दर वाली कर योग्य आय ₹12 लाख तक है तो धारा 87A की छूट (अधिकतम ₹60,000) से कर शून्य हो सकता है। वेतनभोगी करदाताओं के लिए ₹75,000 की स्टैंडर्ड डिडक्शन जोड़कर यह सीमा लगभग ₹12.75 लाख सकल वेतन तक पहुँच जाती है। ₹12 लाख से थोड़ा ऊपर जाने पर पूरा टैक्स एकदम से नहीं लगता — मार्जिनल रिलीफ़ के कारण सेस से पहले कर उतना ही सीमित रहता है जितनी आय ₹12 लाख से ऊपर है। विशेष दर वाली आय होने पर गणना बदल सकती है।`,
  },
];

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: withLanguageAlternates({
    canonical: PAGE_URL,
  }),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: PAGE_URL,
    siteName: 'RupeeKit',
    type: 'article',
    locale: 'en_IN',
    ...(DISCOVER_IMAGE_URL && DISCOVER_IMAGE
      ? {
          images: [
            {
              url: DISCOVER_IMAGE_URL,
              width: DISCOVER_IMAGE.width,
              height: DISCOVER_IMAGE.height,
              alt: DISCOVER_IMAGE.alt,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    ...(DISCOVER_IMAGE_URL ? { images: [DISCOVER_IMAGE_URL] } : {}),
  },
};

export default function IncomeTaxCalculatorPage() {
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Calculators',
        item: `${SITE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Old vs New Tax Regime Calculator',
        item: PAGE_URL,
      },
    ],
  };

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Old vs New Tax Regime Calculator India',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a JavaScript-enabled web browser.',
    url: PAGE_URL,
    description: pageDescription,
    dateModified: '2026-08-03',
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    creator: editorialTeamRef,
    maintainer: editorialTeamRef,
    ...(DISCOVER_IMAGE_URL ? { image: DISCOVER_IMAGE_URL } : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <nav className="mb-8 text-sm text-slate-500 no-print">
        <Link href="/" className="transition hover:text-slate-950">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="transition hover:text-slate-950">Calculators</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-900">Old vs New Tax Regime Calculator</span>
      </nav>

      <p className="mb-6 text-sm leading-7 text-slate-700 no-print">
        Need to connect your tax result to the payslip? See the{' '}
        <Link href="/money-guides/salary-income-tax" className="font-semibold text-brandNavy underline">
          salary and income-tax decision guide
        </Link>{' '}for a worked gross-to-in-hand example and official sources.
      </p>

      <header className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.52fr] lg:items-start no-print">
        <div>
          <span className="mb-4 inline-block rounded-full bg-brandNavy/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brandNavy">
            Tax Planning
          </span>
          <h1 className="text-4xl font-black tracking-tight text-brandDeepNavy md:text-5xl lg:text-6xl">
            Old vs New Tax Regime Calculator India
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
            Compare old vs new regime tax estimates for FY {TARGET_FY} (AY {TARGET_AY}) using your salary and
            deduction inputs. FY {TARGET_FY} slabs, the Rs 75,000 new-regime standard deduction, the Section 87A
            rebate up to Rs 60,000 with marginal relief, and 4% cess are configured and tested. Earlier years remain
            selectable.
          </p>
          <EditorialByline className="mt-4" updatedIso="2026-08-03" />
        </div>
        <div className="space-y-4">
          {DISCOVER_IMAGE ? <DiscoverHeroImage image={DISCOVER_IMAGE} priority /> : null}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900 shadow-sm">
            <p className="font-bold">Educational estimate only</p>
            <p className="mt-2 text-amber-800">
              Final tax outcomes can differ based on return data, official utilities, and year-specific provisions.
              Verify before filing.
            </p>
          </div>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 no-print">
        <h2 className="text-base font-bold text-slate-900">Scope of this calculator</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          This comparison assumes a resident individual with normal slab-rate income (mainly salary) and the
          deduction inputs shown below. Capital gains and other special-rate income (for example, equity STCG or
          LTCG) are taxed at separate rates with different Section 87A treatment and are not modelled here. If you
          have special-rate income, your total tax can be more than this estimate even when taxable income is
          within the rebate limit — income up to Rs 12 lakh is not automatically tax-free in that case. Use the{' '}
          <Link href="/tools/capital-gains-tax-calculator-india" className="font-semibold text-sky-700 hover:underline">
            Capital Gains Tax Calculator
          </Link>{' '}
          for equity gains.
        </p>
      </section>

      <section className="mb-6">
        <QuickAnswerBox
          title="Tax Regime Quick Answer"
          question="Which is better: old tax regime or new tax regime?"
          answer="The new tax regime may be simpler for taxpayers with fewer deductions, while the old tax regime may save more tax when deductions such as 80C, HRA, NPS, health insurance and home loan interest are high. Use this calculator to compare both regimes using your income and deductions. This is an educational estimate, not tax advice."
          note="Educational estimate only. Verify final tax with official filing utility output, Form 16, AIS/Form 26AS and qualified tax guidance."
        />
      </section>

      <AnswerEngineSummary
        id="answer-engine-summary"
        className="mb-10 no-print"
        summary={`This old-vs-new tax regime calculator compares estimated taxable income, rebate impact, cess, and final tax for supported financial years (${availableTaxYears.map((year) => `FY ${year}`).join(', ')}). It helps scenario planning for FY ${TARGET_FY} decisions but should be cross-checked with official return utilities before filing.`}
      />

      <TaxCalculatorApp />

      <section className="mt-12 space-y-8 no-print">
        <section id="how-does-the-old-vs-new-tax-regime-calculator-work" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">How does the old vs new tax regime calculator work?</h2>
          <p className="mt-4 leading-8 text-slate-700">
            The calculator applies configured slab rates, deductions, rebate logic, and 4% cess for each supported
            year. It then compares estimated old-regime tax and new-regime tax for the same input profile.
          </p>
          <p className="mt-4 leading-8 text-slate-700">
            This can help compare scenarios quickly, but final tax may differ due to filing-level validation and
            data reconciliation.
          </p>
        </section>

        <section id="what-is-the-difference-between-old-and-new-tax-regime" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">What is the difference between old and new tax regime?</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] rounded-2xl border border-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Comparison point</th>
                  <th className="px-4 py-3 font-semibold">Old regime</th>
                  <th className="px-4 py-3 font-semibold">New regime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisonRows.map((row) => (
                  <tr key={row.point}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.point}</td>
                    <td className="px-4 py-3">{row.oldRegime}</td>
                    <td className="px-4 py-3">{row.newRegime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This table is educational and can help compare structures. Final applicability depends on year-specific tax rules and taxpayer profile.
          </p>
        </section>

        <section id="which-tax-regime-is-better-for-salaried-employees" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">Which tax regime is better for salaried employees?</h2>
          <p className="mt-4 leading-8 text-slate-700">
            There is no single best regime for everyone. New regime may be useful for simpler filing when deductions
            are low. Old regime may be useful when deduction claims like 80C, HRA, 80D, employer NPS and home loan
            interest are meaningful.
          </p>
          <p className="mt-4 leading-8 text-slate-700">
            Use the calculator above with your actual income and deduction assumptions to compare both outcomes before selecting a regime.
          </p>
        </section>

        <section id="salary-example-table" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">Salary example table (educational estimate)</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Illustration for salaried profile with no extra deductions beyond built-in supported-year logic. Rule year used:
            {' '}FY {latestSupportedFy} (AY {latestSupportedRules.ay}).
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] rounded-2xl border border-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Gross salary</th>
                  <th className="px-4 py-3 font-semibold">Old regime estimated tax</th>
                  <th className="px-4 py-3 font-semibold">New regime estimated tax</th>
                  <th className="px-4 py-3 font-semibold">Lower estimated regime</th>
                  <th className="px-4 py-3 font-semibold">Estimated difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {salaryExampleRows.map((row) => (
                  <tr key={row.grossSalary}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatInr(row.grossSalary)}</td>
                    <td className="px-4 py-3">{formatInr(row.oldTax)}</td>
                    <td className="px-4 py-3">{formatInr(row.newTax)}</td>
                    <td className="px-4 py-3">{row.lowerRegime}</td>
                    <td className="px-4 py-3">{formatInr(row.difference)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="how-much-deduction-is-needed-to-make-the-old-regime-better" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">How much deduction is needed to make the old regime better?</h2>
          <p className="mt-4 leading-8 text-slate-700">
            The break-even deduction level depends on your salary and available deduction buckets. The calculator
            result panel shows an estimated additional old-regime-only deduction needed to match new-regime tax in your current scenario.
          </p>
          <p className="mt-4 leading-8 text-slate-700">
            This is an educational estimate and should be validated against deduction eligibility and documentation before filing.
          </p>
        </section>

        <section id="deduction-impact-table" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">Deduction impact table (80C, HRA, 80D, NPS, home loan interest)</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Illustrative tax change vs a no-deduction baseline at gross salary {formatInr(deductionImpactBaseInput.grossSalary)} in FY {latestSupportedFy}. This can help compare directionally and is not final tax advice.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[980px] rounded-2xl border border-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Deduction scenario</th>
                  <th className="px-4 py-3 font-semibold">Illustrative amount</th>
                  <th className="px-4 py-3 font-semibold">Old regime estimated tax reduction</th>
                  <th className="px-4 py-3 font-semibold">New regime estimated tax reduction</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deductionImpactRows.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.label}</td>
                    <td className="px-4 py-3">{formatInr(row.amount)}</td>
                    <td className="px-4 py-3">{formatInr(row.oldTaxChange)}</td>
                    <td className="px-4 py-3">{formatInr(row.newTaxChange)}</td>
                    <td className="px-4 py-3 text-xs leading-6 text-slate-600">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="can-hra-be-claimed-in-the-new-tax-regime" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">Can HRA be claimed in the new tax regime?</h2>
          <p className="mt-4 leading-8 text-slate-700">
            In general comparison usage, major HRA exemption claims are part of old-regime planning. For HRA-specific
            estimation, use the{' '}
            <Link href="/tools/hra-exemption-calculator-india" className="font-semibold text-sky-700 hover:underline">
              HRA Exemption Calculator
            </Link>
            {' '}and verify year-specific rules.
          </p>
        </section>

        <section id="are-80c-and-80d-allowed-in-the-new-tax-regime" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">Are 80C and 80D allowed in the new tax regime?</h2>
          <p className="mt-4 leading-8 text-slate-700">
            Most old-regime deduction categories such as 80C and 80D are generally limited in the new regime.
            Use this page to compare both estimates and validate allowed items from official guidance for your year.
          </p>
        </section>

        <section id="is-the-new-tax-regime-mandatory" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-brandDeepNavy">Is the new tax regime mandatory?</h2>
          <p className="mt-4 leading-8 text-slate-700">
            Regime selection rules can vary by taxpayer profile and applicable-year filing provisions. Use this
            calculator for educational comparison, then verify your final choice in official filing utilities.
          </p>
        </section>
      </section>

      <FactsTable
        id="calculator-facts"
        className="mt-12 no-print"
        rows={[
          { topic: 'Calculation type', explanation: 'Rule-driven educational estimate from user-entered values' },
          { topic: 'Key inputs', explanation: 'Income, deductions, exemptions, year selection, and salaried profile toggle' },
          { topic: 'Primary outputs', explanation: 'Old/new regime taxable income, estimated tax, difference, and lower-tax indicator' },
          { topic: 'Supported years', explanation: `Currently configured years: ${availableTaxYears.map((year) => `FY ${year}`).join(', ')}` },
          { topic: 'Scope', explanation: 'Resident individual, normal slab-rate income. Capital gains and other special-rate income are not modelled.' },
          { topic: 'Advice boundary', explanation: 'Educational information only. Not personalized tax, legal, or investment advice.' },
        ]}
      />

      <section id="source-and-methodology" className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 no-print">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Source and methodology</h2>
        <p className="mt-2 text-sm text-slate-500">Last reviewed: August 3, 2026 (IST)</p>
        <p className="mt-4 leading-8 text-slate-700">
          Method: This calculator applies configured slab rules, standard deduction, selected deduction inputs, rebate
          logic, and 4% health and education cess to estimate old and new regime outcomes.
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          Official reference: Use the Income Tax Department portal and filing utilities for final validation.
          {' '}
          <a
            href="https://www.incometax.gov.in/iec/foportal/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-700 hover:underline"
          >
            Income Tax India portal
          </a>
          .
        </p>
        <p className="mt-4 leading-8 text-slate-700">
          Final step before filing: verify with Form 16, AIS/Form 26AS, and applicable schedules in official utility.
          Where needed, consult a qualified tax professional.
        </p>
      </section>

      <section className="mt-12 grid gap-6 no-print md:grid-cols-2">
        <div className="rounded-3xl border border-brandBorder bg-slate-50 p-6">
          <h3 className="mb-3 text-lg font-bold text-brandDeepNavy">Related tax tools</h3>
          <ul className="space-y-2 text-sm leading-7">
            <li>
              <Link href="/tools/hra-exemption-calculator-india" className="font-medium text-sky-700 hover:underline">
                HRA Exemption Calculator
              </Link>
            </li>
            <li>
              <Link href="/tools/80c-deduction-calculator-india" className="font-medium text-sky-700 hover:underline">
                Section 80C Deduction Calculator
              </Link>
            </li>
            <li>
              <Link href="/tools/salary-in-hand-calculator-india" className="font-medium text-sky-700 hover:underline">
                Salary In-Hand Calculator India
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border border-brandNavy/10 bg-brandBgSoft p-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brandNavy">Tax filing guide</h3>
          <p className="text-sm leading-7 text-slate-700">
            Read the{' '}
            <Link href="/blog/itr-2-ay-2026-27-filing-guide" className="font-semibold text-brandNavy hover:underline">
              ITR-2 AY 2026-27 filing guide
            </Link>
            {' '}for document readiness and filing checkpoints.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Also review the{' '}
            <Link href="/blog/income-tax-calculator-2026-calculator-guide" className="font-semibold text-brandNavy hover:underline">
              Income Tax Calculator 2026 planning guide
            </Link>
            {' '}for scenario setup.
          </p>
        </div>
      </section>

      <section className="mt-14 no-print">
        <h2 className="text-2xl font-bold text-brandDeepNavy">FAQs</h2>
        <div className="mt-6 space-y-5">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-bold text-slate-900">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
