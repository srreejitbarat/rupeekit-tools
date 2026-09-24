import type { FinancialUpdate } from './financial-updates';

/**
 * Day 18 (20 Aug 2026) official-source update batch.
 *
 * URL policy:
 * - slugs are dated/topic-specific and remain self-canonical;
 * - a later announcement gets a new URL when it represents a new event;
 * - factual corrections update the existing URL and modifiedDate;
 * - superseded pages remain useful historical explainers and must not be
 *   redirected merely because a newer update exists.
 */
export const day18FinancialUpdates: FinancialUpdate[] = [
  {
    id: '8th-cpc-chandigarh-visit-september-2026',
    slug: '8th-cpc-chandigarh-visit-september-2026',
    title: '8th Pay Commission Chandigarh Visit Set for 16-18 September 2026: What Is Official?',
    seoTitle: '8th Pay Commission Chandigarh Visit: 16–18 September 2026',
    category: 'Government Salary',
    sourceName: '8th Central Pay Commission, Government of India',
    sourceUrl: 'https://8cpc.gov.in/document/notice-regarding-8cpc-visit-to-chandigarh-on-16th-17th-and-18th-september-2026-last-date-25th-august/',
    officialSources: [
      {
        label: '8th CPC notice for Chandigarh visit on 16-18 September 2026',
        href: 'https://8cpc.gov.in/document/notice-regarding-8cpc-visit-to-chandigarh-on-16th-17th-and-18th-september-2026-last-date-25th-august/',
      },
      {
        label: '8th CPC official homepage and current notices',
        href: 'https://8cpc.gov.in/',
      },
    ],
    publishedDate: '2026-08-20',
    modifiedDate: '2026-08-20',
    lastReviewed: '20 August 2026',
    effectiveDate: 'The official notice schedules the Chandigarh visit for 16, 17 and 18 September 2026 and names 25 August 2026 as the last date connected with the notice.',
    summary: 'The 8th Central Pay Commission has an official Chandigarh visit scheduled for 16-18 September 2026. This confirms the consultation calendar, not a final fitment factor, pay matrix, revised HRA, pension formula or implementation date.',
    quickAnswer: 'The official 8th CPC website confirms a Chandigarh visit on 16-18 September 2026. It does not announce a final salary multiplier or revised pay matrix. Treat fitment-factor values in calculators as scenarios until the Commission or Government publishes an official recommendation or order.',
    whatHappened: 'The 8th Central Pay Commission published a notice dated 28 July 2026 for a Chandigarh visit on 16, 17 and 18 September 2026, with a 25 August 2026 last date referenced in the notice.',
    officialFacts: [
      'The 8th Central Pay Commission is an officially constituted Government of India commission.',
      'The Chandigarh visit is scheduled for 16-18 September 2026.',
      'The official notice names 25 August 2026 as the relevant last date.',
      'The notice does not publish a final fitment factor, revised pay matrix, revised HRA rate or final implementation order.',
    ],
    plainLanguageExplanation: 'The consultation process is active, but a meeting or visit is not the same thing as a salary revision order. Employees and pensioners should separate official process milestones from viral fitment-factor claims.',
    whyItMatters: 'A consultation visit is a step in the review process. It does not confirm a salary increase. Use the calculator to compare possible outcomes, and wait for an official recommendation or order before treating any figure as final.',
    whoMayBeAffected: 'Central government employees and pensioners following the 8th CPC process, especially stakeholders interested in the Commission consultation schedule.',
    whoMayNotBeAffected: 'This notice does not itself revise anyone’s salary, pension, DA, DR, HRA or arrears.',
    whatToVerify: 'Check the 8th CPC website for newer notices, recommendations or Government orders before treating any fitment factor or implementation date as official.',
    announcementVsOrderNote: 'This is a Commission visit notice, not a pay-revision notification or implementation order.',
    methodology: 'RupeeKit reviewed the official 8th CPC notice and homepage on 20 August 2026 and limited this explainer to facts visible in those primary sources.',
    relatedRupeeKitLinks: [
      { label: '8th Pay Commission Salary Calculator (unofficial scenarios)', href: '/tools/8th-pay-commission-salary-calculator-india' },
      { label: '8th Pay Commission Arrears Calculator', href: '/tools/8th-pay-commission-arrears-calculator-india' },
      { label: '8th Pay Commission Pension Calculator', href: '/tools/8th-pay-commission-pension-calculator-india' },
    ],
    faqs: [
      {
        question: 'Has the 8th Pay Commission announced the final fitment factor?',
        answer: 'Not in this Chandigarh visit notice. The notice confirms the consultation schedule, not a final fitment factor or pay matrix.',
      },
      {
        question: 'Does the September Chandigarh visit mean revised salaries start in September?',
        answer: 'No. A Commission visit does not itself implement revised salary or pension. Implementation requires the applicable recommendations and Government decision or order.',
      },
    ],
    status: 'official',
  },
  {
    id: 'rbi-repo-rate-5-25-august-2026',
    slug: 'rbi-repo-rate-5-25-august-2026',
    title: 'RBI Repo Rate Is 5.25% After August 2026 Policy: What Borrowers Should Check',
    category: 'RBI',
    sourceName: 'Reserve Bank of India',
    sourceUrl: 'https://www.rbi.org.in/',
    officialSources: [
      { label: 'RBI current policy rates', href: 'https://www.rbi.org.in/' },
      { label: 'RBI August 2026 monetary-policy announcements', href: 'https://www.rbi.org.in/' },
    ],
    publishedDate: '2026-08-20',
    modifiedDate: '2026-08-20',
    lastReviewed: '20 August 2026',
    effectiveDate: 'RBI’s official current-rates display showed a 5.25% policy repo rate after the 3-5 August 2026 MPC meeting; borrowers should recheck RBI for any later policy action.',
    summary: 'RBI’s official current-rates page shows the policy repo rate at 5.25%, the Standing Deposit Facility rate at 5.00%, and the MSF and Bank Rate at 5.50% after the August 2026 policy meeting.',
    quickAnswer: 'The RBI policy repo rate is 5.25% in the official post-August-policy rates display. That does not mean every home-loan or personal-loan EMI changes immediately: repricing depends on your lender, benchmark, reset date, spread and loan contract.',
    whatHappened: 'The Reserve Bank of India published its August 2026 monetary-policy material after the MPC meeting held from 3 to 5 August. Its official current-rates display shows the repo rate at 5.25%.',
    officialFacts: [
      'Policy repo rate: 5.25% on the RBI current-rates display reviewed for this update.',
      'Standing Deposit Facility rate: 5.00%.',
      'Marginal Standing Facility rate and Bank Rate: 5.50%.',
      'A policy-rate level does not by itself specify the exact retail rate charged on an individual loan.',
    ],
    plainLanguageExplanation: 'Repo rate is an important policy benchmark, but your EMI depends on the benchmark written into your loan contract and when the lender resets it. A repo-rate headline is therefore a signal to check your loan terms, not a guarantee of an immediate EMI change.',
    whyItMatters: 'Borrowers comparing EMI, prepayment or refinance scenarios need the policy context, while still entering their actual lender rate into the calculator.',
    whoMayBeAffected: 'Borrowers with floating-rate loans or people comparing new loan offers may want to check whether their benchmark-linked rate changes after the policy cycle.',
    whoMayNotBeAffected: 'Fixed-rate borrowers may not see any contractual rate change from a repo-rate movement during the fixed period.',
    whatToVerify: 'Check your lender’s benchmark, spread, reset frequency, sanction letter and latest statement. Use the actual quoted loan rate in RupeeKit calculators rather than assuming repo rate equals your borrowing rate.',
    methodology: 'RupeeKit used RBI’s official current-rates display and August 2026 monetary-policy listing. No lender-specific pass-through or EMI reduction is assumed.',
    relatedRupeeKitLinks: [
      { label: 'Home Loan EMI Calculator India', href: '/tools/home-loan-emi-calculator-india' },
      { label: 'Personal Loan EMI Calculator India', href: '/tools/personal-loan-emi-calculator-india' },
      { label: 'Reduce EMI vs Tenure Calculator', href: '/tools/reduce-emi-vs-tenure-calculator-india' },
    ],
    faqs: [
      {
        question: 'Does a 5.25% repo rate mean my home-loan rate is 5.25%?',
        answer: 'No. Retail loan pricing includes the applicable benchmark and lender spread, and it follows the reset terms in your contract.',
      },
      {
        question: 'Will my EMI change immediately after RBI policy?',
        answer: 'Not necessarily. Timing depends on your loan benchmark, lender process and reset date.',
      },
    ],
    status: 'official',
  },
  {
    id: 'small-savings-rates-july-september-2026',
    slug: 'small-savings-rates-july-september-2026',
    title: 'PPF, SSY, SCSS and Post Office MIS Rates for July-September 2026',
    category: 'Personal Finance',
    sourceName: 'Department of Economic Affairs and India Post, Government of India',
    sourceUrl: 'https://dea.gov.in/budget-division/revision-interest-rates-small-savings-schemes-reg',
    officialSources: [
      {
        label: 'Department of Economic Affairs small-savings rate notification dated 30 June 2026',
        href: 'https://dea.gov.in/budget-division/revision-interest-rates-small-savings-schemes-reg',
      },
      {
        label: 'India Post current savings-scheme rates',
        href: 'https://www.indiapost.gov.in/banking-services/savings',
      },
    ],
    publishedDate: '2026-08-20',
    modifiedDate: '2026-08-20',
    lastReviewed: '20 August 2026',
    effectiveDate: 'These rates apply to the July-September 2026 quarter; recheck the next quarterly notification before using them for a later period.',
    summary: 'Official Government sources show PPF at 7.1%, Sukanya Samriddhi at 8.2%, SCSS at 8.2% and Post Office Monthly Income Scheme at 7.4% for the current July-September 2026 quarter.',
    quickAnswer: 'For July-September 2026, India Post lists PPF at 7.1% p.a., Sukanya Samriddhi at 8.2% p.a., SCSS at 8.2% p.a. and Post Office MIS at 7.4% p.a. These are scheme rates for the current quarter, not guaranteed future rates.',
    whatHappened: 'The Department of Economic Affairs published the Q2 FY 2026-27 small-savings rate notification on 30 June 2026. India Post’s current scheme page lists the applicable rates used in this explainer.',
    officialFacts: [
      'PPF: 7.1% per annum, compounded yearly.',
      'Sukanya Samriddhi Account: 8.2% per annum, yearly compounded.',
      'Senior Citizens Savings Scheme: 8.2% per annum.',
      'Post Office Monthly Income Scheme: 7.4% per annum, payable monthly.',
      'Small-savings rates are reviewed on a quarterly cycle, so later quarters must be rechecked.',
    ],
    plainLanguageExplanation: 'If you are using a calculator for PPF, SSY, SCSS or MIS, use the rate applicable to the period you are modelling and do not assume today’s rate will remain unchanged for the whole tenure.',
    whyItMatters: 'These calculators are sensitive to the entered rate. Showing the current official quarter beside the tool helps prevent users from treating a long-term projection as a guaranteed maturity value.',
    whoMayBeAffected: 'People opening or modelling PPF, SSY, SCSS or Post Office MIS accounts during the July-September 2026 quarter.',
    whoMayNotBeAffected: 'The exact interest treatment of an already-open account can depend on scheme rules and the period for which a rate is notified; this update is not a personalised maturity statement.',
    whatToVerify: 'Recheck the Department of Economic Affairs or India Post rate page for the quarter relevant to your deposit or projection.',
    methodology: 'RupeeKit cross-checked the Department of Economic Affairs Q2 notification listing with India Post’s current savings-scheme rate page on 20 August 2026.',
    relatedRupeeKitLinks: [
      { label: 'PPF Calculator India', href: '/tools/ppf-calculator-india' },
      { label: 'Sukanya Samriddhi Calculator India', href: '/tools/sukanya-samriddhi-yojana-calculator-india' },
      { label: 'SCSS Calculator India', href: '/tools/scss-calculator-india' },
      { label: 'Post Office MIS Calculator India', href: '/tools/post-office-monthly-income-scheme-calculator-india' },
    ],
    faqs: [
      {
        question: 'Are these small-savings rates fixed for the full account tenure?',
        answer: 'Do not assume so. Government small-savings rates are notified periodically; use the rate applicable to the relevant period and recheck later notifications.',
      },
      {
        question: 'What PPF rate should I enter for July-September 2026?',
        answer: 'The current India Post scheme page lists PPF at 7.1% per annum for the period covered by this update.',
      },
    ],
    status: 'official',
  },
  {
    id: 'income-tax-itr7-utility-available-august-2026',
    slug: 'income-tax-itr7-utility-available-august-2026',
    title: 'ITR-7 Online Utility for AY 2026-27 Is Live: What the Tax Portal Confirms',
    seoTitle: 'ITR-7 Utility Live for AY 2026-27',
    metaDescription:
      'The online ITR-7 utility for AY 2026-27 became available on 11 August. The portal also lists online and offline options for ITR-1 to ITR-5, Excel for ITR-6, and online and Excel utilities for ITR-7.',
    category: 'Income Tax',
    sourceName: 'Income Tax Department, Government of India',
    sourceUrl: 'https://www.incometax.gov.in/iec/foportal/',
    officialSources: [
      { label: 'Income Tax e-Filing portal latest updates', href: 'https://www.incometax.gov.in/iec/foportal/' },
    ],
    publishedDate: '2026-08-20',
    modifiedDate: '2026-08-20',
    lastReviewed: '20 August 2026',
    effectiveDate: 'The Income Tax portal lists the ITR-7 online utility as enabled from 11 August 2026. Taxpayers should verify the portal again before filing.',
    summary: 'The Income Tax Department’s portal says the online utility of ITR-7 for AY 2026-27 was enabled on 11 August 2026. The same portal currently states that ITR-1 to ITR-5 are available online and offline, ITR-6 through Excel, and ITR-7 through Online and Excel utilities.',
    quickAnswer: 'ITR-7’s online utility for AY 2026-27 is available according to the official Income Tax portal update dated 11 August 2026. Availability of a utility does not decide which ITR form applies to you; choose the form only after checking the official eligibility rules.',
    whatHappened: 'The e-Filing portal posted an 11 August 2026 update saying the online ITR-7 utility for AY 2026-27 is enabled.',
    officialFacts: [
      'The portal update is dated 11 August 2026.',
      'ITR-7 is shown as available through Online and Excel utilities.',
      'Utility availability is operational information, not a filing-form eligibility determination.',
    ],
    plainLanguageExplanation: 'This is mainly a filing-readiness update. If ITR-7 is the correct form for your entity or case, the online utility is now available; if you are an individual deciding between ITR-1, ITR-2, ITR-3 or another form, this update does not change those eligibility rules.',
    whyItMatters: 'Taxpayers and professionals often wait for the relevant utility before preparing or submitting a return. A dated availability update is more useful than an evergreen claim that can quickly become stale.',
    whoMayBeAffected: 'Taxpayers for whom ITR-7 is the applicable return form for AY 2026-27 and professionals preparing such returns.',
    whoMayNotBeAffected: 'Most salaried individuals using ITR-1 or ITR-2 are not made eligible for ITR-7 merely because its utility is available.',
    whatToVerify: 'Check the official e-Filing portal for the latest utility status and the official return-form eligibility instructions before filing.',
    methodology: 'RupeeKit reviewed the Income Tax Department homepage and latest-update panel on 20 August 2026. The article does not infer filing eligibility from utility availability.',
    relatedRupeeKitLinks: [
      { label: 'ITR-2 AY 2026-27 Filing Guide', href: '/blog/itr-2-ay-2026-27-filing-guide' },
      { label: 'Old vs New Tax Regime Calculator', href: '/tools/income-tax-calculator-old-vs-new-regime-india' },
    ],
    faqs: [
      {
        question: 'Does ITR-7 utility availability mean I should file ITR-7?',
        answer: 'No. Utility availability and return-form eligibility are different questions. Use the form that applies under the official eligibility rules.',
      },
      {
        question: 'When did the portal say ITR-7 online filing became available?',
        answer: 'The Income Tax portal lists the online utility as enabled on 11 August 2026.',
      },
    ],
    status: 'official',
  },
  {
    id: 'epfo-vishwas-amnesty-2026-live',
    slug: 'epfo-vishwas-amnesty-2026-live',
    title: 'EPFO VISHWAS and AMNESTY 2026 Are Live: Who These Schemes Are For',
    category: 'Personal Finance',
    sourceName: 'Employees’ Provident Fund Organisation / Ministry of Labour & Employment',
    sourceUrl: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2291296&lang=1&reg=1',
    officialSources: [
      {
        label: 'PIB: EPFO launches VISHWAS, 2026 and AMNESTY, 2026',
        href: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2291296&lang=1&reg=1',
      },
      {
        label: 'EPFO official website',
        href: 'https://www.epfindia.gov.in/',
      },
    ],
    publishedDate: '2026-08-20',
    modifiedDate: '2026-08-20',
    lastReviewed: '20 August 2026',
    effectiveDate: 'The schemes were notified from 29 June 2026 and the cited official update says they operate for six months from that date, subject to the notified scheme conditions.',
    summary: 'EPFO has launched VISHWAS, 2026 and AMNESTY, 2026 as time-bound employer/compliance schemes for legacy provident-fund disputes and PF-trust regularisation. They are not a new EPF withdrawal benefit or a new member interest rate.',
    quickAnswer: 'VISHWAS, 2026 and AMNESTY, 2026 are EPFO compliance and legacy-case schemes primarily relevant to eligible employers and PF trusts. A normal EPF member should not read these headlines as a new withdrawal rule, higher interest rate or automatic account credit.',
    whatHappened: 'A 29 July 2026 PIB release says EPFO launched VISHWAS, 2026 and AMNESTY, 2026, both notified under G.S.R. 525(E) dated 29 June 2026 and operating for six months from notification.',
    officialFacts: [
      'VISHWAS, 2026 is described as a one-time dispute-resolution mechanism for eligible damages/penalty cases.',
      'AMNESTY, 2026 is aimed at eligible provident-fund trusts seeking regularisation of exemption status.',
      'The cited official release says both schemes were notified from 29 June 2026 for a six-month operational window.',
      'These schemes do not themselves change an individual member’s EPF corpus formula.',
    ],
    plainLanguageExplanation: 'These are mostly employer-side compliance measures. If you are simply checking your own EPF retirement corpus, the announcement does not mean your contribution, balance or withdrawal entitlement has automatically changed.',
    whyItMatters: 'EPFO headlines are often interpreted as member-benefit changes even when the underlying notification is employer-facing. Clear scope reduces misinformation while linking users back to the relevant retirement calculator.',
    whoMayBeAffected: 'Eligible establishments, exempted PF trusts and employers with covered legacy disputes or regularisation needs.',
    whoMayNotBeAffected: 'An ordinary EPF member with no employer-compliance issue may have no action to take because of these schemes.',
    whatToVerify: 'Employers should read G.S.R. 525(E), the applicable EPFO circular/SOP and jurisdictional guidance before applying. Members should use separate EPFO guidance for withdrawals, claims and account-specific issues.',
    methodology: 'RupeeKit reviewed the Ministry of Labour & Employment/PIB release and EPFO references on 20 August 2026 and kept the explainer limited to the scheme scope described by those sources.',
    relatedRupeeKitLinks: [
      { label: 'EPF Corpus Calculator India', href: '/tools/epf-corpus-calculator-india' },
      { label: 'EPF vs NPS vs PPF Guide', href: '/blog/epf-vs-nps-vs-ppf-retirement-instrument-india' },
    ],
    faqs: [
      {
        question: 'Does VISHWAS 2026 increase my EPF interest rate?',
        answer: 'No. The cited scheme concerns eligible disputes over damages or penalties; it is not an EPF member interest-rate announcement.',
      },
      {
        question: 'Is AMNESTY 2026 a new EPF withdrawal rule?',
        answer: 'No. The cited scheme concerns regularisation of eligible PF-trust exemption status, not a general member withdrawal entitlement.',
      },
    ],
    status: 'official',
  },
];

export const day18UpdateSlugs = new Set(day18FinancialUpdates.map((update) => update.slug));
