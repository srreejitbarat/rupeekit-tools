// Financial updates are populated only through a manual-review workflow
// using complete official sources and human approval.
// No auto-publishing, auto-merging, or auto-indexing.

export interface FinancialUpdateLink {
  label: string;
  href: string;
}

export interface FinancialUpdateFaq {
  question: string;
  answer: string;
}

export interface FinancialUpdateSlide {
  src: string;
  alt: string;
  caption: string;
}

export interface FinancialUpdate {
  id: string;
  slug: string;
  title: string;
  category:
    | 'RBI'
    | 'Income Tax'
    | 'GST'
    | 'SEBI'
    | 'Banking'
    | 'Personal Finance'
    | 'Markets'
    | 'Government Salary';
  sourceName: string;
  sourceUrl?: string;
  officialSources?: FinancialUpdateLink[];
  publishedDate: string;
  modifiedDate?: string;
  lastReviewed?: string;
  effectiveDate?: string;
  seoTitle?: string;
  metaDescription?: string;
  summary: string;
  quickAnswer?: string;
  storyTitle?: string;
  story?: string;
  whatHappened?: string;
  officialFacts?: string[];
  plainLanguageExplanation?: string;
  whyItMatters: string;
  whoMayBeAffected?: string;
  whoMayNotBeAffected?: string;
  realisticExample?: {
    title: string;
    body: string;
  };
  practicalSteps?: string[];
  commonMisunderstandings?: {
    claim: string;
    reality: string;
  }[];
  whatToVerify: string;
  announcementVsOrderNote?: string;
  methodology?: string;
  relatedRupeeKitLinks: FinancialUpdateLink[];
  tags?: string[];
  visualType?: string;
  schemaType?: 'Article' | 'NewsArticle';
  heroImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  carouselSlides?: FinancialUpdateSlide[];
  faqs?: FinancialUpdateFaq[];
  status: 'official' | 'explainer' | 'sample';
}

export const financialUpdates: FinancialUpdate[] = [
  {
    id: 'income-tax-demand-facilitation-centre-july-2026',
    slug: 'income-tax-demand-facilitation-centre-july-2026',
    title: 'Old Income Tax Demand Showing Against Your PAN? A New Help Centre Can Guide You',
    seoTitle: 'Old Tax Demand on Your PAN? Centre Offers Guidance',
    metaDescription:
      'The Income Tax Department’s Demand Management Facilitation Centre guides taxpayers on outstanding demands. It cannot cancel, reduce or decide a demand.',
    category: 'Income Tax',
    sourceName: 'Income Tax Department, Ministry of Finance, Government of India',
    sourceUrl: 'https://www.incometax.gov.in/iec/foportal/',
    officialSources: [
      {
        label: 'Income Tax Department homepage announcement for the Demand Management Facilitation Centre',
        href: 'https://www.incometax.gov.in/iec/foportal/',
      },
      {
        label: 'Official Respond to Outstanding Demand FAQs',
        href: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/response-outstanding-demand',
      },
      {
        label: 'Official Respond to Outstanding Demand user manual',
        href: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/response-outstanding-demand-UM',
      },
    ],
    publishedDate: '2026-07-26',
    modifiedDate: '2026-07-26',
    lastReviewed: '26 July 2026',
    effectiveDate:
      'The Income Tax Department homepage displayed the Demand Management Facilitation Centre contact details when reviewed on 26 July 2026. The announcement does not state a closing date. Taxpayers should recheck the official portal before contacting the centre because operational details may change.',
    summary:
      'The Income Tax Department has introduced a Demand Management Facilitation Centre to guide taxpayers who have questions or grievances about outstanding tax demands. The centre can explain the available process, but it does not automatically cancel, reduce or decide whether a demand is correct.',
    quickAnswer:
      'An old tax demand appearing against your PAN does not mean you should pay immediately without checking it. The Income Tax Department now lists a Demand Management Facilitation Centre for guidance on outstanding-demand issues. First open Pending Actions on the official e-Filing portal, review the demand and notice, then choose the correct response: agree, partly disagree or fully disagree.',
    storyTitle: 'Ananya saw a seven-year-old demand just as she expected a refund',
    story:
      'Ananya filed her return and expected a refund. When she opened the e-Filing portal, she found an old outstanding demand from an earlier assessment year. Her first reaction was to pay quickly so the refund would not be affected. Instead, she downloaded the demand details, checked her earlier return and challan, and used the newly listed Demand Management Facilitation Centre to understand the process. The centre did not decide her tax case for her, but it helped her identify where to respond and what records to keep ready.',
    whatHappened:
      'The Income Tax Department homepage announced that a Demand Management Facilitation Centre has been set up to guide taxpayers on issues and grievances relating to outstanding demands. It lists the email taxdemand@cpc.incometax.gov.in, toll-free number 1800 309 0131 and chargeable number 0821-6671200.',
    officialFacts: [
      'The centre is described as a guidance and facilitation channel for outstanding-demand issues and grievances.',
      'The official e-Filing portal allows registered users to view demands under Pending Actions, then Response to Outstanding Demand.',
      'A taxpayer can agree with a demand, partly disagree or fully disagree and provide the applicable reasons and supporting details.',
      'The official FAQ says an unanswered demand may be confirmed and adjusted against a refund, or continue to appear as payable when no refund is due.',
      'If a taxpayer partly disagrees, the official guidance says the undisputed portion should be paid while the disputed portion is explained through the response process.',
    ],
    plainLanguageExplanation:
      'Think of the new centre as a help desk for understanding the route, not as a court or an automatic demand-cancellation service. It can guide you, but the demand must still be checked and responded to through the official portal using your records.',
    whyItMatters:
      'Old demands can delay or reduce an expected refund and can remain attached to a PAN for years. Taxpayers may also panic and pay an amount that was already paid, corrected or disputed. A dedicated guidance channel may make it easier to understand the next step without sharing sensitive login details with an unknown intermediary.',
    whoMayBeAffected:
      'Registered taxpayers who see a pending outstanding demand, receive a section 245 adjustment communication, expect a refund that may be adjusted, have already paid but the payment is not reflected, or disagree fully or partly with a demand raised by CPC or an Assessing Officer.',
    whoMayNotBeAffected:
      'Taxpayers with no outstanding demand shown under Pending Actions may not need this service. The centre is also not a replacement for filing an appeal, rectification request or other formal remedy when one is legally required.',
    realisticExample: {
      title: 'Example: ₹18,000 demand, but ₹12,000 was already paid',
      body:
        'Suppose Ananya sees an ₹18,000 demand. Her records show that ₹12,000 was already paid through a valid challan, while she agrees that ₹6,000 remains unpaid. She should not mark the full demand as correct without checking. She can use the official response flow, enter the challan details for the amount already paid, verify the remaining amount, and retain the transaction or response reference. This is only an example; the correct response depends on the actual notice and records.',
    },
    practicalSteps: [
      'Log in only through the official Income Tax e-Filing portal.',
      'Open Pending Actions, then Response to Outstanding Demand.',
      'Download and read the demand details and any available section 245 notice.',
      'Compare the demand with the relevant return, intimation, challan, rectification order and tax-credit records.',
      'Choose Agree, Partly Disagree or Fully Disagree only after checking the records and enter the required details.',
      'Save the transaction ID, acknowledgement and submitted response for future reference.',
      'Use the official Demand Management Facilitation Centre when you need guidance, but never share passwords or OTPs.',
    ],
    commonMisunderstandings: [
      {
        claim: 'A demand on the portal is automatically correct and must be paid immediately.',
        reality:
          'The Department gives taxpayers an opportunity to review and respond. The demand may be accepted, partly disputed or fully disputed with reasons and details.',
      },
      {
        claim: 'Calling the facilitation centre will cancel the demand.',
        reality:
          'The announcement describes the centre as a guidance channel. It does not promise cancellation, reduction or a decision on the merits of a demand.',
      },
      {
        claim: 'Ignoring the demand has no effect if I am expecting a refund.',
        reality:
          'The official FAQ says an unanswered demand may be confirmed and adjusted against a refund, subject to the applicable process.',
      },
      {
        claim: 'I should send my portal password, OTP or complete financial records by email.',
        reality:
          'Do not share passwords or OTPs. Use the official portal for formal responses and provide only what the official process requires.',
      },
    ],
    whatToVerify:
      'Verify the assessment year, demand reference, notice, amount, earlier payment details and the status of any revised return or rectification request. Recheck the centre contact details on the official Income Tax portal before calling or emailing. For legal interpretation, appeal deadlines or case-specific tax advice, consult a qualified tax professional.',
    announcementVsOrderNote:
      'The new announcement creates a facilitation channel; it does not amend tax law, extend a response deadline or decide an individual demand. Formal action still takes place through the e-Filing portal and the applicable statutory process.',
    methodology:
      'RupeeKit reviewed the Income Tax Department homepage announcement, the official outstanding-demand FAQ and the complete user manual. The article separates the new facilitation-centre announcement from the existing response process and does not infer any power to cancel demands or provide personalised tax advice.',
    relatedRupeeKitLinks: [
      {
        label: 'ITR-2 Filing Guide for AY 2026-27',
        href: '/blog/itr-2-ay-2026-27-filing-guide',
      },
      {
        label: 'Income Tax Old vs New Regime Calculator',
        href: '/tools/income-tax-calculator-old-vs-new-regime-india',
      },
      {
        label: 'Salary In-Hand Calculator India',
        href: '/tools/salary-in-hand-calculator-india',
      },
    ],
    tags: ['Outstanding Tax Demand', 'Income Tax Refund', 'Section 245', 'CPC', 'Demand Management Facilitation Centre'],
    visualType: 'income-tax',
    schemaType: 'NewsArticle',
    heroImage: {
      src: '/images/updates/income-tax-demand-help-centre/hero-old-tax-demand-help.svg',
      alt: 'Indian taxpayer reviewing an old outstanding income-tax demand and the official Demand Management Facilitation Centre guidance options',
      width: 1600,
      height: 900,
    },
    carouselSlides: [
      {
        src: '/images/updates/income-tax-demand-help-centre/slide-1-ananya-sees-demand.svg',
        alt: 'Indian taxpayer Ananya sees an old outstanding tax demand while waiting for an income-tax refund',
        caption: 'Ananya sees an old demand and pauses before making a payment.',
      },
      {
        src: '/images/updates/income-tax-demand-help-centre/slide-2-what-centre-does.svg',
        alt: 'Visual explaining that the Demand Management Facilitation Centre provides guidance but does not cancel tax demands',
        caption: 'The new centre guides taxpayers; it does not decide or cancel a demand.',
      },
      {
        src: '/images/updates/income-tax-demand-help-centre/slide-3-check-portal.svg',
        alt: 'Step-by-step visual for opening Pending Actions and Response to Outstanding Demand on the official e-Filing portal',
        caption: 'Check the demand and notice through the official portal first.',
      },
      {
        src: '/images/updates/income-tax-demand-help-centre/slide-4-three-responses.svg',
        alt: 'Three response choices for an income-tax demand: agree, partly disagree or fully disagree',
        caption: 'Choose the response that matches your records.',
      },
      {
        src: '/images/updates/income-tax-demand-help-centre/slide-5-refund-risk.svg',
        alt: 'Illustration showing that an unanswered outstanding demand may be adjusted against an expected tax refund',
        caption: 'An unanswered demand may affect an expected refund.',
      },
      {
        src: '/images/updates/income-tax-demand-help-centre/slide-6-safe-checklist.svg',
        alt: 'Safe checklist for tax-demand guidance showing official portal, records, acknowledgement and no password or OTP sharing',
        caption: 'Keep records ready, save references and protect your login credentials.',
      },
    ],
    faqs: [
      {
        question: 'What is the Demand Management Facilitation Centre?',
        answer:
          'It is a guidance channel listed by the Income Tax Department for taxpayers with issues or grievances relating to outstanding demands. The announcement does not say that it can cancel or decide a demand.',
      },
      {
        question: 'How can I check an outstanding demand against my PAN?',
        answer:
          'Log in to the official e-Filing portal and open Pending Actions, then Response to Outstanding Demand. The page shows the status of past and existing demands and provides Pay Now or Submit Response options where applicable.',
      },
      {
        question: 'What happens if I do not respond to an outstanding demand?',
        answer:
          'The official FAQ says the demand may be confirmed and adjusted against a refund, or continue to show as payable when no refund is due.',
      },
      {
        question: 'Can I disagree with an income-tax demand?',
        answer:
          'Yes. The official portal allows a taxpayer to disagree fully or partly, select the relevant reasons and provide the required details before submitting the response.',
      },
      {
        question: 'What if I already paid the tax but the demand still appears?',
        answer:
          'The user manual provides a response option for a demand already paid. Taxpayers may need to enter challan details such as amount, BSR code, serial number and payment date and upload the challan copy where required.',
      },
      {
        question: 'Can the facilitation centre extend my response or appeal deadline?',
        answer:
          'The official announcement does not state that the centre can extend statutory deadlines. Check the notice and applicable official process immediately.',
      },
      {
        question: 'What are the official Demand Management Facilitation Centre contacts?',
        answer:
          'When reviewed on 26 July 2026, the Income Tax Department homepage listed taxdemand@cpc.incometax.gov.in, toll-free number 1800 309 0131 and chargeable number 0821-6671200. Recheck the official portal before use.',
      },
      {
        question: 'Should I share my password or OTP with a helpdesk caller?',
        answer:
          'No. Never share your e-Filing password or OTP. Use official portal workflows for formal responses and verify contact details directly on the Income Tax Department website.',
      },
    ],
    status: 'official',
  },
  {
    id: 'foreign-assets-information-in-ais-july-2026',
    slug: 'foreign-assets-information-in-ais-july-2026',
    title: 'Foreign Assets Now Visible in AIS: What Indian Taxpayers Should Check Before Filing',
    seoTitle: 'Foreign Assets in AIS: What Taxpayers Should Check',
    metaDescription:
      'CBDT says some foreign asset and income details from partner countries now appear in AIS. Check them against your records before filing; AIS may be incomplete.',
    category: 'Income Tax',
    sourceName: 'Central Board of Direct Taxes, Ministry of Finance, Government of India',
    sourceUrl:
      'https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-07/Annexure.pdf',
    officialSources: [
      {
        label: 'CBDT taxpayer information note dated 20 July 2026',
        href: 'https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-07/Annexure.pdf',
      },
      {
        label: 'CBDT office memorandum dated 17 July 2026',
        href: 'https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-07/OM_17.07.2026_Hosting%20of%20Note%20on%20CRS%20in%20AIS.pdf',
      },
      {
        label: 'Income Tax Department latest news page',
        href: 'https://www.incometax.gov.in/iec/foportal/latest-news',
      },
    ],
    publishedDate: '2026-07-20',
    modifiedDate: '2026-07-23',
    lastReviewed: '23 July 2026',
    effectiveDate:
      'The feature is available on the Income Tax e-Filing portal. The official note says information received for calendar years 2022, 2023 and 2024 is currently displayed. Calendar year 2025 information is expected after it is received in September or October 2026.',
    summary:
      'CBDT has enabled eligible taxpayers to view certain foreign-asset and foreign-income information received from partner jurisdictions inside the Annual Information Statement. The facility is meant to help with accurate reporting, but the displayed information may not be complete.',
    quickAnswer:
      'CBDT has added a Foreign Assets Information report under AIS for taxpayers whose information has been received through international exchange arrangements. It is a taxpayer-support feature, not a standalone scrutiny or investigation notice. Use it as a cross-check, because applicable foreign assets and foreign-source income may still need to be reported even when an item does not appear in AIS.',
    storyTitle: 'Neha found a foreign account in AIS and immediately worried',
    story:
      'Neha is an Indian software professional who worked overseas for a short period. She still has a small foreign bank account and received a little interest. While preparing her return, she opens AIS and sees a new Foreign Assets Information report. Her first thought is that she has received a tax notice. The official CBDT note gives a calmer explanation: the report is designed to show information already available with the Department so taxpayers can cross-check their records and report correctly. Neha downloads the report, compares it with her own bank and investment statements, and does not assume that a missing item can be ignored.',
    whatHappened:
      'CBDT enabled the display of foreign-asset and foreign-income information received under the Automatic Exchange of Information framework, including CRS and FATCA reporting, in the AIS of eligible taxpayers. The report is available through the Reports section of the Compliance Portal linked from AIS.',
    officialFacts: [
      'India receives financial-account information relating to tax residents from more than 100 partner jurisdictions under international information-exchange arrangements.',
      'The information may include foreign bank accounts, custodial accounts, certain financial investments, interest, dividends and other specified financial income reported by partner jurisdictions.',
      'The official note says calendar-year information for 2022, 2023 and 2024 is currently displayed. Calendar-year 2025 information is expected after receipt in September or October 2026.',
      'The report is accessible only to the concerned taxpayer through secure login credentials on the e-Filing portal.',
      'CBDT describes the initiative as facilitative and not as a scrutiny or investigation tool.',
    ],
    plainLanguageExplanation:
      'Think of this report as an extra checklist supplied by the Income Tax Department. It can help you notice an overseas account or income entry before filing. It is not a complete inventory, so it should be compared with your own records rather than treated as the final answer.',
    whyItMatters:
      'Foreign accounts, investments and income can be easy to overlook, especially when an account is old, has a small balance or was opened during overseas employment. The new AIS view may reduce accidental omissions, but it does not transfer responsibility for complete reporting from the taxpayer to the portal.',
    whoMayBeAffected:
      'Taxpayers for whom the Department has received foreign financial information, including people who hold or previously held foreign bank or custodial accounts, certain overseas investments, or received foreign interest, dividends or other specified financial income.',
    whoMayNotBeAffected:
      'People with no foreign financial assets, foreign accounts or foreign-source income may not see any information in this report. The official note does not provide a broader eligibility definition beyond taxpayers for whom information is available. Return-form and schedule applicability can vary, so users should verify their own position from official guidance or qualified tax help.',
    realisticExample: {
      title: 'Example: one item appears, another does not',
      body:
        'Neha’s AIS report shows her foreign bank account and interest received during calendar year 2024, but it does not show a small overseas investment she still holds. She should not conclude that the investment is irrelevant merely because it is absent from AIS. She compares the report with her own records and verifies whether Schedule FA, Schedule FSI or another return disclosure applies to her circumstances.',
    },
    practicalSteps: [
      'Visit the official Income Tax e-Filing portal and log in using your own secure credentials.',
      'Open AIS. The portal will direct you to the Compliance Portal.',
      'Choose Reports, then select Foreign Assets Information.',
      'Select the relevant calendar year and download the PDF report.',
      'Compare the report with your foreign bank, investment and income records.',
      'Verify the correct return form and the applicability of Schedule FA and Schedule FSI before filing.',
    ],
    commonMisunderstandings: [
      {
        claim: 'Seeing this report means I have received a tax notice.',
        reality:
          'CBDT says the feature is designed for taxpayer facilitation and is not a scrutiny or investigation tool.',
      },
      {
        claim: 'AIS contains every foreign asset and every foreign-income item.',
        reality:
          'The official note says the displayed information is not complete or exhaustive. It only reflects information received through the relevant exchange arrangements.',
      },
      {
        claim: 'If an asset is missing from AIS, I do not need to report it.',
        reality:
          'The official note says taxpayers must correctly and completely report applicable foreign assets and foreign-source income irrespective of whether they appear in AIS.',
      },
      {
        claim: 'Calendar year and assessment year are the same thing.',
        reality:
          'The report is organised by calendar year, while the return is filed for an assessment year. Match the information carefully and verify the correct reporting period.',
      },
    ],
    whatToVerify:
      'Check that you selected the correct calendar year, compare the downloaded report with your own records, and verify the correct return form and disclosure schedules. Do not share PAN, passwords, OTPs or downloaded AIS data with untrusted persons. Use only the official e-Filing portal or a qualified tax professional for case-specific help.',
    announcementVsOrderNote:
      'The 20 July taxpayer note explains the feature and its use. The underlying CBDT office memorandum is dated 17 July 2026 and requests that the explanatory note be hosted on the e-Filing portal. Neither document changes the basic requirement to report applicable foreign assets and foreign-source income correctly.',
    methodology:
      'RupeeKit reviewed the CBDT office memorandum, the enclosed eight-page taxpayer information note, the access steps and the stated calendar-year coverage. This explanation separates direct official facts from RupeeKit’s plain-language interpretation. No personalised conclusion about residence status, return-form selection, Schedule FA, Schedule FSI or tax liability is made.',
    relatedRupeeKitLinks: [
      {
        label: 'ITR-2 Filing Guide for AY 2026-27',
        href: '/blog/itr-2-ay-2026-27-filing-guide',
      },
      {
        label: 'Income Tax Old vs New Regime Calculator',
        href: '/tools/income-tax-calculator-old-vs-new-regime-india',
      },
      {
        label: 'Capital Gains Tax Calculator India',
        href: '/tools/capital-gains-tax-calculator-india',
      },
      {
        label: 'NRI Tax Guide: NRE vs NRO, DTAA and Schedule FA',
        href: '/nri',
      },
    ],
    tags: [
      'AIS',
      'Foreign Assets',
      'Foreign Income',
      'Schedule FA',
      'Schedule FSI',
      'CBDT',
      'AY 2026-27',
    ],
    visualType: 'income-tax',
    schemaType: 'NewsArticle',
    heroImage: {
      src: '/images/updates/cbdt-foreign-assets-ais/hero-foreign-assets-ais.svg',
      alt: 'Indian taxpayer reviewing the new Foreign Assets Information report inside the Annual Information Statement before filing an income-tax return',
      width: 1600,
      height: 900,
    },
    carouselSlides: [
      {
        src: '/images/updates/cbdt-foreign-assets-ais/slide-1-neha-sees-ais.svg',
        alt: 'Indian professional Neha notices the Foreign Assets Information option under Reports in the AIS portal',
        caption: 'Neha notices a new Foreign Assets Information report while preparing her return.',
      },
      {
        src: '/images/updates/cbdt-foreign-assets-ais/slide-2-not-a-tax-notice.svg',
        alt: 'Visual comparison explaining that the AIS foreign-assets feature is for taxpayer support and not a standalone investigation notice',
        caption: 'CBDT describes the feature as facilitative, not as a scrutiny or investigation tool.',
      },
      {
        src: '/images/updates/cbdt-foreign-assets-ais/slide-3-what-may-appear.svg',
        alt: 'Story slide showing foreign bank accounts, custodial accounts, investments, interest and dividends that may appear in AIS',
        caption: 'The report may contain several categories of information received from partner jurisdictions.',
      },
      {
        src: '/images/updates/cbdt-foreign-assets-ais/slide-4-how-to-check.svg',
        alt: 'Five-step visual showing how to open AIS Reports and download Foreign Assets Information for a selected calendar year',
        caption: 'The official note provides a five-step route to download the report.',
      },
      {
        src: '/images/updates/cbdt-foreign-assets-ais/slide-5-ais-not-complete.svg',
        alt: 'Visual warning that the Foreign Assets Information report in AIS may not contain every applicable foreign asset or income item',
        caption: 'AIS is a cross-check, not a complete inventory of every foreign asset or income item.',
      },
      {
        src: '/images/updates/cbdt-foreign-assets-ais/slide-6-next-steps.svg',
        alt: 'Indian taxpayer comparing the AIS foreign-assets report with personal bank and investment records before filing',
        caption: 'Compare the report with personal records and verify the correct return schedules before filing.',
      },
    ],
    faqs: [
      {
        question: 'Is Foreign Assets Information in AIS a tax notice?',
        answer:
          'No. CBDT describes the feature as a taxpayer-facilitation initiative and says it is not designed as a scrutiny or investigation tool. It still deserves careful review because it can help identify information relevant to return filing.',
      },
      {
        question: 'What information can appear in the AIS foreign-assets report?',
        answer:
          'The official note says it may include foreign bank accounts, custodial accounts, certain financial investments, interest, dividends and other specified financial income reported by partner jurisdictions.',
      },
      {
        question: 'Which calendar years are currently available?',
        answer:
          'The official note says information received for calendar years 2022, 2023 and 2024 is currently displayed. Calendar year 2025 information is expected after it is received in September or October 2026.',
      },
      {
        question: 'Where can I find Foreign Assets Information in AIS?',
        answer:
          'Log in to the official e-Filing portal, open AIS, go to the Compliance Portal, choose Reports, select Foreign Assets Information, choose the calendar year and download the PDF.',
      },
      {
        question: 'What should I do if a foreign asset is missing from AIS?',
        answer:
          'Do not assume that a missing item has no reporting requirement. CBDT says the AIS display is not complete or exhaustive and applicable foreign assets and foreign-source income must be reported correctly regardless of whether they appear in AIS.',
      },
      {
        question: 'Which income-tax schedules may be relevant?',
        answer:
          'The official note refers to Schedule FA and Schedule FSI wherever applicable. The correct return form and schedule depend on the taxpayer’s facts, so verify official guidance or seek qualified tax help.',
      },
      {
        question: 'Can another person view my foreign-assets report?',
        answer:
          'CBDT says the information is accessible only to the concerned taxpayer through secure login credentials on the e-Filing portal. Never share passwords, OTPs or downloaded reports with untrusted persons.',
      },
      {
        question: 'Can Kar Saathi help with foreign-asset reporting questions?',
        answer:
          'The CBDT note says taxpayers may use Kar Saathi, the e-Filing portal’s virtual assistant, for guidance on return-form selection, foreign-asset and foreign-income reporting, and other tax-related queries.',
      },
    ],
    status: 'official',
  },
];
