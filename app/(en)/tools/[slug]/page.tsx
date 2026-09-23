import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/data/all-blog-posts';
import Calculator from '@/components/Calculator';
import PlanningFeatureSummary from '@/components/planning/PlanningFeatureSummary';
import ToolAdPlacement from '@/components/micro-tools/ToolAdPlacement';
import { isMicroTool } from '@/lib/micro-tools/common';
import DownloadHraChecklistButton from '@/components/hra/DownloadHraChecklistButton';
import PersonalLoanDecisionSimulator from '@/components/personal-loan/PersonalLoanDecisionSimulator';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import FactsTable from '@/components/seo/FactsTable';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import DiscoverHeroImage from '@/components/seo/DiscoverHeroImage';
import AnalyticsLink from '@/components/AnalyticsLink';
import EditorialByline from '@/components/seo/EditorialByline';
import { editorialTeamRef } from '@/lib/seo/editorial';
import { getGuidesForTool } from '@/data/calculator-guides';
import { getMoneyGuidesForTool } from '@/data/money-authority';
import SourceBackedComparison from '@/components/seo/SourceBackedComparison';
import { getDiscoverImage } from '@/data/discover-images';
import { getLiveTools, getRelatedTools, getToolBySlug, type Tool, type ToolQuickAnswer } from '@/lib/tools';
import { buildGoldLoanExamples } from '@/lib/gold-rates';

const SITE_URL = 'https://www.rupeekit.co.in';
const HRA_SLUG = 'hra-exemption-calculator-india';
const PERSONAL_LOAN_SLUG = 'personal-loan-emi-calculator-india';
const SIP_SLUG = 'sip-calculator-india';
const EMERGENCY_FUND_SLUG = 'emergency-fund-calculator-india';
const CAPITAL_GAINS_SLUG = 'capital-gains-tax-calculator-india';
const EIGHTH_PAY_SLUG = '8th-pay-commission-salary-calculator-india';
const EIGHTH_PAY_ARREARS_SLUG = '8th-pay-commission-arrears-calculator-india';
const EIGHTH_PAY_PENSION_SLUG = '8th-pay-commission-pension-calculator-india';
const EIGHTH_PAY_CLUSTER_SLUGS = new Set([
  EIGHTH_PAY_SLUG,
  EIGHTH_PAY_ARREARS_SLUG,
  EIGHTH_PAY_PENSION_SLUG,
]);
const PERSONAL_LOAN_ANSWER_ENGINE_SUMMARY =
  'RupeeKit\'s Personal Loan EMI Calculator estimates monthly EMI, total interest, total repayment, processing fee impact, EMI burden, tenure comparison, and repayment schedule using user-entered assumptions. It is a neutral educational calculator and does not provide loan approval, lender recommendations, or live bank interest rates.';

/**
 * Single source of truth for per-calculator SEO/content overrides.
 * Every field falls back to the tool's own data (tool.seoTitle, tool.name,
 * tool.metaDescription, tool.shortDescription, tool.lastReviewedIso) when omitted.
 */
type ToolSeoOverride = {
  title?: string;
  description?: string;
  h1?: string;
  heroDescription?: string;
  lastReviewedIso?: string;
};

const TOOL_SEO_OVERRIDES: Record<string, ToolSeoOverride> = {
  [HRA_SLUG]: {
    title: 'HRA Calculator FY 2026-27 | Rule 279 & 50% City Check',
    description:
      'Calculate HRA exemption under Rule 279. Check the 50% city list and compare actual HRA, rent minus 10% of salary, and old-regime exempt HRA.',
    h1: 'HRA Exemption Calculator India',
    heroDescription:
      'Calculate your likely HRA exemption under Rule 279 in seconds. Enter your salary, HRA, rent, and city type to compare the three legal limits and estimate how much HRA can stay tax-exempt under the old regime. Includes FY 2026-27 metro-city rules, a worked example, and a document checklist.',
    lastReviewedIso: '2026-07-16',
  },
  [PERSONAL_LOAN_SLUG]: {
    title: 'Personal Loan EMI Calculator 2026 | EMI, Fees & Total Cost',
    description:
      'Calculate personal loan EMI, interest, processing fee, GST and total repayment in India. Compare tenure and check affordability before applying.',
    lastReviewedIso: '2026-08-03',
  },
  [EMERGENCY_FUND_SLUG]: {
    title: 'Emergency Fund Calculator India | 3-12 Months + EMI',
    description:
      'Calculate a 3, 6, 9 or 12-month emergency fund using essential expenses and home, personal or car-loan EMIs. Check your shortfall and savings target.',
    h1: 'Emergency Fund Calculator India',
    lastReviewedIso: '2026-08-03',
  },
  [SIP_SLUG]: {
    title: 'SIP Calculator India 2026 | Step-Up & Multiple Goals',
    description:
      'Calculate SIP returns and step-ups, then plan several goals with one budget. Compare inflation, funding gaps, priority allocation and deadline changes.',
    heroDescription:
      'Estimate regular and step-up SIP returns, or plan up to five goals with one monthly budget. Compare funding gaps, inflation and lower-return scenarios, then test changes to your budget, deadlines or targets.',
    lastReviewedIso: '2026-08-03',
  },
  [CAPITAL_GAINS_SLUG]: {
    // Title mirrors the H1 "Capital Gains Tax Calculator India (Equity)" so Google
    // has less reason to rewrite it (rewrite rate drops sharply when title == H1).
    title: 'Capital Gains Tax Calculator India 2026 (Equity STCG & LTCG)',
    description:
      'Calculate equity STCG (20%) and LTCG (12.5% above Rs 1.25 lakh) for FY 2025-26, with the exact formula and a worked example. Educational estimate only.',
    lastReviewedIso: '2026-08-03',
  },
  [EIGHTH_PAY_SLUG]: {
    title: '8th Pay Commission Salary Calculator 2026 (Fitment Factor)',
    description:
      'Calculate revised basic pay, DA, HRA and gross salary across unofficial 8th Pay Commission fitment-factor scenarios. No final factor has been notified.',
    h1: '8th Pay Commission Status, Date and Salary Calculator',
    heroDescription:
      'No fitment factor, pay matrix, revised HRA or implementation date has been notified. The Commission was constituted on 3 November 2025 with an 18-month window to report. Below: where it stands today, then a scenario calculator that compares every fitment factor at once, with minimum-HRA floors, NPS/UPS/OPS deductions and a conditional arrears estimate.',
    lastReviewedIso: '2026-09-03',
  },
  [EIGHTH_PAY_ARREARS_SLUG]: {
    title: '8th Pay Commission Arrears Calculator 2026',
    description:
      'Estimate an unofficial 8th Pay Commission arrears scenario from current and projected monthly basic, DA, HRA, other pay, dates and entered deductions.',
    h1: '8th Pay Commission Arrears Calculator (Unofficial)',
    heroDescription:
      'Compare current and projected monthly basic, DA, HRA and other eligible pay across dates you select. No implementation date, arrears period, payment rule or eligible allowance is assumed to be official.',
    lastReviewedIso: '2026-08-17',
  },
  [EIGHTH_PAY_PENSION_SLUG]: {
    title: '8th Pay Commission Pension Calculator 2026',
    description:
      'Compare current pension plus DR with an unofficial 8th Pay Commission multiplier scenario, projected DR and additional pension rate. No official method assumed.',
    h1: '8th Pay Commission Pension Calculator (Unofficial)',
    heroDescription:
      'Compare current basic pension plus DR with a flat-multiplier scenario, projected DR and an optional additional-pension rate. No official multiplier, parity formula or notional-fixation method is assumed.',
    lastReviewedIso: '2026-08-17',
  },
  // Titles for these two are the H1-aligned rewrites from the Aug 2026 SEO
  // analysis; it calls out the previous "PPF Calculator India | 15-Year
  // Maturity & Interest" as a title/H1 mismatch driving Google rewrites.
  'nps-calculator-india': {
    title: 'NPS Calculator India 2026 - Pension & Corpus Estimate',
    description:
      'Estimate your NPS corpus, lump sum and monthly pension at retirement. Adjust contribution, return and annuity assumptions. Free, with a worked example.',
  },
  'ppf-calculator-india': {
    title: 'PPF Calculator India 2026 - Maturity & Tax-Free Interest',
    description:
      'See your PPF maturity and tax-free interest at the current 7.1% notified rate. Enter yearly deposit and tenure to get the formula and a 15-year worked example.',
  },
  'step-up-sip-calculator-india': {
    title: 'Step-Up SIP Calculator | Annual Increase & Corpus',
    description:
      'Estimate your step-up SIP corpus, total invested amount and gains clearly when your monthly contribution rises by a chosen percentage every year.',
  },
  'cagr-calculator-india': {
    title: 'CAGR Calculator India | Growth Rate From Start to End',
    description:
      'Calculate compound annual growth rate from starting value, ending value and holding period, with the absolute gain shown for your investment.',
  },
  'personal-loan-eligibility-calculator-india': {
    title: 'Personal Loan Eligibility Calculator: Income & FOIR',
    description:
      'Estimate personal-loan eligibility from take-home income, existing EMIs, FOIR, rate and tenure. Instant browser calculation; not lender approval.',
    h1: 'Personal Loan Eligibility Calculator India',
    heroDescription:
      'Estimate affordable EMI and borrowing capacity from take-home income and existing obligations, then test FOIR, interest-rate and tenure assumptions. No phone number, lender lead form or bureau lookup is required.',
    lastReviewedIso: '2026-08-17',
  },
  'net-worth-calculator-india': {
    title: 'Net Worth Calculator India | Assets, Debt & Liquid Worth',
    description:
      'Calculate total assets, liabilities, personal net worth, liquid net worth and debt-to-asset ratio from your current financial balances in one view.',
  },
  'gold-loan-calculator-india': {
    title: 'Gold Loan Interest Rate 2026: RBI LTV, Value & EMI',
    description:
      'Gold loan rates start near 8.5% at banks and run higher at NBFCs. Check RBI LTV tiers of 85%, 80% and 75%, your eligible gold value per gram and EMI.',
    h1: 'Gold Loan Interest Rate and Eligibility Calculator India',
    heroDescription:
      'Banks price gold loans from about 8.5% a year and NBFCs charge more for faster disbursal. Value only the eligible gold content, apply the RBI consumption-loan LTV tier for the amount you want, and estimate EMI and total interest before you pledge.',
    lastReviewedIso: '2026-08-22',
  },
  'sukanya-samriddhi-yojana-calculator-india': {
    title: 'Sukanya Samriddhi Yojana Calculator 2026 | SSY Maturity',
    description:
      'Calculate Sukanya Samriddhi Yojana maturity using 15 deposit years and a 21-year term from account opening. Editable 8.2% rate, post office and bank SSY.',
    h1: 'Sukanya Samriddhi Yojana (SSY) Calculator 2026',
    heroDescription:
      'Project a new or existing SSY account using the correct account-opening timeline: deposits for 15 years and maturity after 21 years. The 8.2% default is an editable Jul-Sep 2026 assumption, not a lifetime guarantee.',
    lastReviewedIso: '2026-08-17',
  },
  'salary-in-hand-calculator-india': {
    title: 'Salary In-Hand Calculator 2026: CTC to Take-Home',
    description:
      'Convert CTC to in-hand salary, compare two offers by monthly cash, bonus timing and switching costs, and find the fixed CTC for your target take-home.',
    h1: 'Salary In-Hand Calculator India 2026',
    heroDescription:
      'Reconcile CTC, PF, tax and monthly take-home, then compare two salary options on a twelve-month cash calendar. Include bonus dates, delayed first pay and switching costs, or solve for the fixed CTC behind your target monthly in-hand.',
    lastReviewedIso: '2026-08-17',
  },
  'fd-calculator-india': {
    lastReviewedIso: '2026-05-01',
  },
  'home-loan-emi-calculator-india': {
    title: 'Home Loan EMI Calculator India | Repayment & Transfer',
    description: 'Calculate home loan EMI and compare prepayment, repricing and transfer. Check your monthly budget, debt-free deadline, protected savings and rate risk.',
    heroDescription: 'Estimate your home-loan EMI, then compare repayment plans against your monthly payment limit, debt-free date and protected savings. Add lender quotes and fees to test prepayment, repricing or a balance transfer.',
  },
  'salary-hike-calculator-india': {
    title: 'Salary Hike Calculator India 2026 | New Salary After Hike',
    description:
      'Calculate your new salary after a hike percentage and see the annual and monthly increase in India. Gross estimate before tax and deductions.',
    h1: 'Salary Hike Calculator India',
    heroDescription:
      'Enter your current annual salary and hike percentage to see your new annual salary, annual increase and approximate monthly increase. This is a gross before-tax estimate — your actual in-hand increase also depends on the new tax slab, PF, professional tax and other deductions.',
    lastReviewedIso: '2026-08-08',
  },
};

const liveToolSlugs = new Set(getLiveTools().map((tool) => tool.slug));
const blogSlugs = new Set(blogPosts.map((post) => post.slug));

const HRA_TOC = [
  { id: 'how-to-calculate-hra-exemption', title: 'How is HRA exemption calculated?' },
  { id: 'hra-exemption-formula-under-rule-279', title: 'HRA Exemption Formula under Rule 279' },
  { id: 'fy-2026-27-hra-city-rules-50-and-40-salary-cap', title: 'Which cities use the 50% HRA salary cap?' },
  { id: 'old-tax-regime-vs-new-tax-regime-for-hra', title: 'Can HRA be claimed in the new tax regime?' },
  { id: 'hra-calculation-example', title: 'HRA Calculation Example' },
  { id: 'documents-required-to-claim-hra', title: 'What documents are required for HRA exemption?' },
  { id: 'what-if-you-missed-hra-proof-submission', title: 'What if You Missed HRA Proof Submission?' },
  { id: 'can-you-pay-rent-to-parents-and-claim-hra', title: 'Can you pay rent to parents and claim HRA?' },
  { id: 'landlord-details-and-relationship-disclosure', title: 'Landlord Details and Relationship Disclosure' },
  { id: 'common-hra-claim-mistakes', title: 'Common HRA Claim Mistakes' },
  { id: 'when-this-calculator-is-useful', title: 'When This Calculator Is Useful' },
  { id: 'source-and-methodology', title: 'Source and methodology' },
  { id: 'faqs', title: 'FAQs' },
] as const;

const PERSONAL_LOAN_TOC = [
  { id: 'how-is-personal-loan-emi-calculated', title: 'How is personal loan EMI calculated?' },
  { id: 'is-lower-emi-always-cheaper', title: 'Is lower EMI always cheaper?' },
  { id: 'what-affects-your-personal-loan-emi', title: 'What affects your personal loan EMI?' },
  { id: 'how-does-processing-fee-affect-total-loan-cost', title: 'How does processing fee affect total loan cost?' },
  { id: 'how-much-emi-is-safe-for-monthly-income', title: 'How much EMI is safe for monthly income?' },
  { id: 'can-prepayment-reduce-total-interest', title: 'Can prepayment reduce total interest?' },
  { id: 'what-happens-if-you-miss-or-pause-emi', title: 'What happens if you miss or pause EMI?' },
  { id: 'does-rupeekit-show-live-personal-loan-interest-rates', title: 'Does RupeeKit show live personal loan interest rates?' },
  { id: 'is-rupeekit-a-lender', title: 'Is RupeeKit a lender?' },
  { id: 'source-and-methodology', title: 'Source and methodology' },
  { id: 'faqs', title: 'FAQs' },
] as const;

const SIP_TOC = [
  { id: 'answer-engine-summary', title: 'Answer Engine Summary' },
  { id: 'what-happens-if-you-miss-a-sip', title: 'What happens if you miss a SIP?' },
  { id: 'can-you-pause-and-restart-sip-later', title: 'Can you pause and restart SIP later?' },
  { id: 'what-is-step-up-sip', title: 'What is step-up SIP?' },
  { id: 'how-much-sip-is-needed-for-a-goal', title: 'How much SIP is needed for a goal?' },
  { id: 'how-does-inflation-affect-sip-planning', title: 'How does inflation affect SIP planning?' },
  { id: 'can-emi-amount-be-redirected-into-sip-after-loan-closure', title: 'Can EMI amount be redirected into SIP after loan closure?' },
  { id: 'is-sip-return-guaranteed', title: 'Is SIP return guaranteed?' },
  { id: 'sip-calculator-facts', title: 'SIP Calculator Facts' },
  { id: 'source-and-methodology', title: 'Source and methodology' },
  { id: 'faqs', title: 'FAQs' },
] as const;

const PERSONAL_LOAN_SECTION_IDS: Record<string, string> = {
  'What Is a Personal Loan EMI?': 'what-is-a-personal-loan-emi',
  'How is personal loan EMI calculated?': 'how-is-personal-loan-emi-calculated',
  'Personal Loan EMI Formula': 'how-is-personal-loan-emi-calculated',
  'How to Use This Personal Loan EMI Calculator': 'how-to-use-this-calculator',
  'EMI Calculation Example': 'emi-calculation-example',
  'Personal Loan EMI Example': 'emi-calculation-example',
  'What affects your personal loan EMI?': 'what-affects-your-personal-loan-emi',
  'Why Tenure in Months Matters': 'tenure-in-months',
  'How does processing fee affect total loan cost?': 'how-does-processing-fee-affect-total-loan-cost',
  'Processing Fee and Total Borrowing Cost': 'how-does-processing-fee-affect-total-loan-cost',
  'Processing Fee and Total Cost': 'how-does-processing-fee-affect-total-loan-cost',
  'Is lower EMI always cheaper?': 'is-lower-emi-always-cheaper',
  'Why Lower EMI Is Not Always Cheaper': 'is-lower-emi-always-cheaper',
  'Interest Rate vs Total Interest': 'is-lower-emi-always-cheaper',
  'How much EMI is safe for monthly income?': 'how-much-emi-is-safe-for-monthly-income',
  'Can prepayment reduce total interest?': 'can-prepayment-reduce-total-interest',
  'What happens if you miss or pause EMI?': 'what-happens-if-you-miss-or-pause-emi',
  'Does RupeeKit show live personal loan interest rates?': 'does-rupeekit-show-live-personal-loan-interest-rates',
  'Is RupeeKit a lender?': 'is-rupeekit-a-lender',
  'Can I Use This for SBI, HDFC, BOB or IDFC Personal Loans?': 'sbi-hdfc-bob-idfc-usage',
  'Common Mistakes Before Taking a Personal Loan': 'common-mistakes-before-taking-a-personal-loan',
};

type ContextualLink = {
  href: string;
  label: string;
};

type SearchIntentSection = {
  heading: string;
  body: string;
  bullets: string[];
};

const BURIED_TOOL_INTENT_CONTENT: Record<string, SearchIntentSection[]> = {
  'personal-loan-eligibility-calculator-india': [
    {
      heading: 'Personal loan eligibility by monthly salary',
      body:
        'Salary-band searches are only starting points because existing EMIs, FOIR, rate and tenure change the result. With no existing EMI, 50% FOIR, 14% annual rate and 48 months, the calculator gives these illustrative amounts:',
      bullets: [
        'Rs 12,000 salary: about Rs 2.20 lakh',
        'Rs 13,000 salary: about Rs 2.38 lakh',
        'Rs 14,000 salary: about Rs 2.56 lakh',
        'Rs 25,000 salary: about Rs 4.57 lakh',
        'Rs 40,000 salary: about Rs 7.32 lakh',
        'Rs 45,000 salary: about Rs 8.23 lakh',
      ],
    },
    {
      heading: 'FOIR and bank-wise eligibility checks',
      body:
        'FOIR is the share of take-home income already committed to EMIs plus the proposed EMI. Bank-wise approval is not uniform: each lender applies its own minimum-income, employer, age, bureau-score, city, tenure and internal credit rules.',
      bullets: [
        'Use the calculator for an eligibility check before comparing lender offers.',
        'Enter every current EMI; omitting one can materially overstate eligibility.',
        'For SBI, HDFC Bank, ICICI Bank, Axis Bank or another lender, verify current criteria on that lender’s official website.',
        'A calculator estimate is not pre-approval, sanction or a guaranteed loan amount.',
      ],
    },
  ],
  'net-worth-calculator-india': [
    {
      heading: 'Total net worth versus liquid net worth',
      body:
        'Total net worth includes property and other illiquid assets. Liquid net worth focuses on cash, deposits and market investments after non-property debts, which can be more useful for near-term resilience.',
      bullets: [
        'Total net worth = all assets minus all liabilities.',
        'Liquid assets = cash, deposits, mutual funds and stocks entered above.',
        'Liquid net worth = liquid assets minus personal loans, cards and other non-property liabilities.',
        'Debt-to-asset ratio shows how much of the asset base is matched by debt.',
      ],
    },
  ],
  'gold-loan-calculator-india': [
    {
      heading: 'Gold-loan eligibility check: value, RBI tier and repayment',
      body:
        'The estimate separates intrinsic gold value from the maximum amount supported across the RBI 85%, 80% and 75% consumption-loan bands, then calculates EMI and interest on the fundable request.',
      bullets: [
        'Enter net gold weight after stones, gems, lac, strings, fastenings and other non-gold parts are excluded.',
        'Use the lender’s published 24K reference price; the calculator does not insert a live market quote.',
        'The exact ₹2.5 lakh and ₹5 lakh boundaries are applied to total consumption-loan amount per borrower.',
        'Final assay, valuation, repayment-capacity review, fees and sanction remain with the lender.',
      ],
    },
  ],
  'sukanya-samriddhi-yojana-calculator-india': [
    {
      heading: 'SSY maturity by account age and annual deposit',
      body:
        'Use completed years since account opening to calculate the remaining 15-year deposit window and 21-year maturity term. Child age checks opening eligibility only; it does not determine maturity.',
      bullets: [
        'Use account age 0 and current balance 0 for a new account.',
        'For an existing account, enter the latest passbook balance so historical credited rates are preserved.',
        'The 8.2% default is checked for Jul-Sep 2026 and remains editable because rates can change quarterly.',
        'Review future deposits and projected interest separately; no fixed 80C tax saving is assumed.',
      ],
    },
  ],
  'salary-in-hand-calculator-india': [
    {
      heading: 'CTC-to-take-home checks across salary offers',
      body:
        'Use the same fields to compare Rs 6 lakh, Rs 10 lakh, Rs 15 lakh or another annual CTC. The result is strongest when basic pay, PF, monthly TDS and deductions come from the actual offer letter or payslip.',
      bullets: [
        'CTC can include employer costs that are not paid as monthly cash salary.',
        'Employee PF, TDS, professional tax and other deductions reduce take-home pay.',
        'Bonus, variable pay, insurance and gratuity treatment varies by employer structure.',
        'Compare offers using monthly in-hand pay as well as total annual CTC.',
      ],
    },
  ],
};

function getToolHeading(slug: string, fallback: string) {
  return TOOL_SEO_OVERRIDES[slug]?.h1 ?? fallback;
}

function getToolDescription(slug: string, fallback: string) {
  return TOOL_SEO_OVERRIDES[slug]?.heroDescription ?? fallback;
}

function listLabels(labels: string[]) {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function firstSentence(text: string) {
  const match = text.trim().match(/[^.!?]+[.!?]?/);
  return match ? match[0].trim() : text.trim();
}

function buildFallbackQuickAnswer(tool: Tool): ToolQuickAnswer {
  const keyInputs = tool.inputs.slice(0, 3).map((input) => input.label);
  const keyOutputs = tool.outputs.filter((output) => !output.hidden).slice(0, 3).map((output) => output.label);
  const conciseFormula = firstSentence(tool.formulaExplanation);
  const conciseExample = firstSentence(tool.example);

  return {
    title: `${tool.name} Quick Answer`,
    question: `How does this calculator work?`,
    answer:
      keyInputs.length > 0 && keyOutputs.length > 0
        ? `It estimates ${listLabels(keyOutputs)} using inputs such as ${listLabels(keyInputs)}.`
        : 'It converts your inputs into educational estimate outputs using the calculator formula shown on this page.',
    formula: conciseFormula.length <= 220 ? conciseFormula : undefined,
    example: conciseExample.length <= 220 ? conciseExample : undefined,
    note:
      'Educational estimate only. RupeeKit does not provide personalized financial, tax, legal, investment, or loan advice.',
  };
}

function buildGenericAnswerEngineSummary(tool: Tool) {
  const keyInputs = tool.inputs.slice(0, 4).map((input) => input.label);
  const keyOutputs = tool.outputs.filter((output) => !output.hidden).slice(0, 4).map((output) => output.label);
  const methodLine = firstSentence(tool.formulaExplanation);
  const inputText = keyInputs.length > 0 ? listLabels(keyInputs) : 'the values you enter';
  const outputText = keyOutputs.length > 0 ? listLabels(keyOutputs) : 'the result metrics';

  return `This calculator estimates ${outputText} using ${inputText}. ${methodLine} Results are educational estimates only and should be verified with official records, lender statements, payroll data, or filing utilities where applicable.`;
}

function buildGenericCalculatorFacts(tool: Tool) {
  if (tool.factRows?.length) return tool.factRows;
  const keyInputs = tool.inputs.slice(0, 4).map((input) => input.label);
  const keyOutputs = tool.outputs.filter((output) => !output.hidden).slice(0, 4).map((output) => output.label);
  return [
    {
      topic: 'Calculation type',
      explanation: 'Formula-based educational estimate from user-entered values',
    },
    {
      topic: 'Key inputs',
      explanation: keyInputs.length > 0 ? listLabels(keyInputs) : 'Depends on calculator mode and input fields',
    },
    {
      topic: 'Primary outputs',
      explanation: keyOutputs.length > 0 ? listLabels(keyOutputs) : 'Depends on calculator mode and output fields',
    },
    {
      topic: 'Method reference',
      explanation: firstSentence(tool.formulaExplanation),
    },
    {
      topic: 'Advice boundary',
      explanation:
        'RupeeKit provides educational information only and does not provide personalized financial, tax, legal, investment, or loan advice.',
    },
  ];
}

// These calculators have their own literal routes under app/tools.
// They must be excluded here too, otherwise this dynamic route and a literal route both try to
// pre-render the same output path, and the build nondeterministically picks a winner.
const SLUGS_WITH_DEDICATED_ROUTE = new Set([
  'income-tax-calculator-old-vs-new-regime-india',
  'pre-emi-calculator-india',
]);

export function generateStaticParams() {
  return getLiveTools()
    .filter((tool) => !SLUGS_WITH_DEDICATED_ROUTE.has(tool.slug))
    .map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  if (SLUGS_WITH_DEDICATED_ROUTE.has(params.slug)) return {};
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};

  const pageUrl = `${SITE_URL}/tools/${tool.slug}`;
  const discoverImage = getDiscoverImage(`/tools/${tool.slug}`);
  const discoverImageUrl = discoverImage ? `${SITE_URL}${discoverImage.src}` : undefined;
  const override = TOOL_SEO_OVERRIDES[tool.slug];
  const description = override?.description ?? tool.metaDescription;
  const absoluteTitle = override?.title ?? tool.seoTitle;
  const pageTitle = absoluteTitle ?? tool.name;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : tool.name,
    description,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
    openGraph: {
      title: pageTitle,
      description,
      url: pageUrl,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
      ...(discoverImageUrl && discoverImage
        ? {
            images: [
              {
                url: discoverImageUrl,
                width: discoverImage.width,
                height: discoverImage.height,
                alt: discoverImage.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      ...(discoverImageUrl ? { images: [discoverImageUrl] } : {}),
    },
  };
}

function HraEducationalContent({ links }: { links: ContextualLink[] }) {
  return (
    <>
      <section id="how-to-calculate-hra-exemption" className="scroll-mt-24">
        <h2 className="text-2xl font-bold">How is HRA exemption calculated?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Use this HRA exemption calculator to calculate HRA exemption by comparing three legal limits under Rule 279.
          Enter salary components, actual HRA received, rent paid, and city cap. The lowest value is the likely exempt
          amount under old tax regime HRA exemption.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
          <li>Actual HRA received.</li>
          <li>Rent paid minus 10% of salary.</li>
          <li>City-based cap: 50% or 40% of salary.</li>
        </ul>
        <p className="mt-4 leading-8 text-slate-700">
          Use the calculator above to calculate HRA exemption instantly using your salary, HRA received, rent paid and city type.
        </p>
      </section>

      <section id="hra-exemption-formula-under-rule-279" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">HRA Exemption Formula under Rule 279</h2>
        <p className="mt-4 leading-8 text-slate-700">
          The HRA calculation formula is the least of these values: actual HRA received, rent paid minus 10% of salary,
          and the city salary cap. This HRA tax exemption calculator follows that structure so your HRA exemption
          calculation and HRA deduction calculation remain easy to understand.
        </p>
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          Trust note: this tool gives an estimate only. If your salary structure, landlord relationship, or declaration
          process is complex, verify with your employer payroll team or CA before filing.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Formula Part 1</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Actual HRA received</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Formula Part 2</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Rent paid minus 10% of salary</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Formula Part 3</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">50% or 40% city salary cap</p>
          </div>
        </div>
      </section>

      <section id="fy-2026-27-hra-city-rules-50-and-40-salary-cap" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Which cities use the 50% HRA salary cap?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Rule 279 HRA exemption uses two city groups for salary cap.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] rounded-2xl border border-slate-200 text-left text-xs text-slate-700 md:text-sm">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3 font-semibold">City category</th>
                <th className="px-4 py-3 font-semibold">Salary cap</th>
                <th className="px-4 py-3 font-semibold">Example cities</th>
                <th className="px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium">Specified city list</td>
                <td className="px-4 py-3">50% of salary</td>
                <td className="px-4 py-3">Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad, Bengaluru</td>
                <td className="px-4 py-3">Use this cap when your city is in the Rule 279 specified list.</td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium">Other Indian cities</td>
                <td className="px-4 py-3">40% of salary</td>
                <td className="px-4 py-3">Cities not listed in the specified 50% group</td>
                <td className="px-4 py-3">Use this cap for non-specified city category cases.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="old-tax-regime-vs-new-tax-regime-for-hra" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Can HRA be claimed in the new tax regime?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          HRA exemption is relevant under the old tax regime. In the default new tax regime, HRA exemption is generally
          not available, so this calculator is best used for old regime tax planning and comparison.
        </p>
      </section>

      <section id="hra-calculation-example" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">HRA Calculation Example</h2>

        <h3 className="mt-5 text-xl font-bold">A) Metro/50% city example: Bengaluru</h3>
        <p className="mt-3 leading-8 text-slate-700">
          Annual basic salary + DA is Rs 6,00,000. Annual HRA received is Rs 2,40,000 and annual rent paid is
          Rs 3,00,000. Actual HRA received is Rs 2,40,000. 50% of salary is Rs 3,00,000. Rent paid minus 10% of salary
          is Rs 2,40,000. The least value is Rs 2,40,000, so exempt HRA is Rs 2,40,000.
        </p>

        <h3 className="mt-5 text-xl font-bold">B) Other city/40% example: Indore</h3>
        <p className="mt-3 leading-8 text-slate-700">
          Annual basic salary + DA is Rs 6,00,000. Annual HRA received is Rs 2,40,000 and annual rent paid is
          Rs 3,00,000. Actual HRA received is Rs 2,40,000. 40% of salary is Rs 2,40,000. Rent paid minus 10% of salary
          is Rs 2,40,000. The least value is Rs 2,40,000, so exempt HRA is Rs 2,40,000.
        </p>
      </section>

      <section id="documents-required-to-claim-hra" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">What documents are required for HRA exemption?</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
          <li>Rent receipts.</li>
          <li>Rent agreement, if available.</li>
          <li>Landlord PAN where applicable.</li>
          <li>Employer HRA declaration.</li>
          <li>Salary slip showing basic salary, DA if applicable, and HRA.</li>
          <li>Bank transfer proof if rent is paid digitally.</li>
          <li>Landlord relationship disclosure where required.</li>
        </ul>
        <DownloadHraChecklistButton className="mt-4" />
      </section>

      <section id="what-if-you-missed-hra-proof-submission" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">What if You Missed HRA Proof Submission?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          If proof was missed during payroll declaration, employer TDS may be higher. In many cases, you can still claim
          eligible HRA exemption while filing your return, subject to records and current filing rules.
        </p>
      </section>

      <section id="can-you-pay-rent-to-parents-and-claim-hra" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Can you pay rent to parents and claim HRA?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Yes, if rent is genuinely paid and documented. Keep receipts and payment trail, and ensure rental income is
          disclosed by parents where required.
        </p>
      </section>

      <section id="landlord-details-and-relationship-disclosure" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Landlord Details and Relationship Disclosure</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Where Form 12BB, Form 124, or any applicable employer declaration asks for landlord details, keep the
          landlord name, address, PAN/Aadhaar where applicable, rent paid and relationship with the landlord ready.
        </p>
      </section>

      <section id="common-hra-claim-mistakes" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Common HRA Claim Mistakes</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
          <li>Using the wrong city cap for HRA exemption calculation.</li>
          <li>Assuming full HRA is exempt without applying the least-of-three rule.</li>
          <li>Using non-eligible salary components in the HRA calculation formula.</li>
          <li>Submitting incomplete rent records or missing landlord PAN where needed.</li>
          <li>Missing landlord detail disclosure where requested in employer declaration.</li>
        </ul>
      </section>

      <section id="when-this-calculator-is-useful" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">When This Calculator Is Useful</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
          <li>Before choosing between old and new regime during payroll planning.</li>
          <li>When you want a quick HRA exemption calculation estimate.</li>
          <li>When reviewing if full HRA received can actually stay tax-exempt.</li>
        </ul>

        {links.length ? (
          <>
            <h3 className="mt-6 text-xl font-bold">Related reads and calculators</h3>
            <p className="mt-3 leading-8 text-slate-700">
              For full planning, compare with your{' '}
              {links.map((link, index) => (
                <span key={link.href}>
                  {index > 0 ? ', ' : ''}
                  <Link href={link.href} className="font-medium text-sky-700 hover:underline">
                    {link.label}
                  </Link>
                </span>
              ))}
              .
            </p>
          </>
        ) : null}
      </section>
    </>
  );
}

function SipEducationalContent({ links, lastReviewed }: { links: ContextualLink[]; lastReviewed?: string }) {
  return (
    <>
      <section id="what-happens-if-you-miss-a-sip" className="scroll-mt-24">
        <h2 className="text-2xl font-bold">What happens if you miss a SIP?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Missing SIP installments can reduce your projected corpus because fewer contributions get time to compound.
          In RupeeKit, the missed SIP scenario estimates this impact using your selected contribution gap and return
          assumptions. It is a planning estimate and not a prediction of actual fund performance.
        </p>
      </section>

      <section id="can-you-pause-and-restart-sip-later" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Can you pause and restart SIP later?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          SIPs can be paused and restarted, but pausing usually lowers projected corpus because the skipped period does
          not accumulate contributions. RupeeKit&apos;s pause-and-restart view helps compare continuity versus pause
          scenarios with the same return inputs. Use it as an educational comparison before deciding your savings plan.
        </p>
      </section>

      <section id="what-is-step-up-sip" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">What is step-up SIP?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Step-up SIP means increasing the SIP amount periodically, usually every year, instead of keeping it flat.
          RupeeKit estimates how these planned increases may change invested amount and projected future value compared
          with regular SIP. This helps you evaluate whether gradual contribution growth may support long-term goals.
        </p>
      </section>

      <section id="how-much-sip-is-needed-for-a-goal" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">How much SIP is needed for a goal?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Goal SIP mode estimates a monthly SIP amount for a target corpus using your expected return and time horizon.
          RupeeKit also lets you compare regular SIP and step-up SIP style assumptions for the same goal. This is a
          planning estimate only and should be reviewed as income, tenure, or market assumptions change.
        </p>
      </section>

      <section id="how-does-inflation-affect-sip-planning" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">How does inflation affect SIP planning?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          Inflation reduces the real purchasing power of future money, so a corpus target may need adjustment over
          time. RupeeKit&apos;s inflation-adjusted view converts projected corpus into today&apos;s value terms for
          practical goal planning. This helps compare nominal growth and real-value outcomes side by side.
        </p>
      </section>

      <section id="can-emi-amount-be-redirected-into-sip-after-loan-closure" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Can EMI amount be redirected into SIP after loan closure?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          After a loan closes, some households may choose to redirect the freed EMI amount into SIP contributions for
          goal planning. RupeeKit includes an EMI-to-SIP redirect scenario to estimate how this change may affect the
          projected corpus over remaining tenure. It is an educational planning scenario, not a recommendation.
        </p>
      </section>

      <section id="is-sip-return-guaranteed" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Is SIP return guaranteed?</h2>
        <p className="mt-4 leading-8 text-slate-700">
          No. SIP returns are market-linked and not guaranteed. RupeeKit uses user-entered return assumptions only for
          projection, so actual outcomes can be higher or lower than estimated values.
        </p>
      </section>

      <FactsTable
        id="sip-calculator-facts"
        title="SIP Calculator Facts"
        className="mt-8"
        rows={[
          { topic: 'SIP return', explanation: 'Market-linked and not guaranteed' },
          { topic: 'Calculation type', explanation: 'Monthly compounding-style estimate' },
          { topic: 'Step-up SIP', explanation: 'SIP amount increases yearly or by selected interval' },
          { topic: 'Inflation-adjusted value', explanation: 'Shows future value in today\'s purchasing-power terms' },
          { topic: 'Missed SIP impact', explanation: 'Estimates reduction from skipped installments' },
          { topic: 'EMI-to-SIP redirect', explanation: 'Scenario planner after EMI closure' },
          { topic: 'Product recommendation', explanation: 'RupeeKit does not recommend mutual funds' },
        ]}
      />

      <section id="source-and-methodology" className="mt-8 scroll-mt-24">
        <h2 className="text-2xl font-bold">Source and methodology</h2>
        {lastReviewed ? <p className="mt-2 text-sm text-slate-500">Last reviewed: {lastReviewed}</p> : null}
        <p className="mt-4 leading-8 text-slate-700">
          This calculator uses user-entered SIP amount, expected return, tenure, optional step-up, missed SIP, pause,
          goal, inflation, and EMI redirect assumptions. It uses monthly compounding-style projection for educational
          planning. It does not recommend mutual funds, does not fetch live fund returns, and does not guarantee outcomes.
        </p>
      </section>

      {links.length ? (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Related calculators and guides</h2>
          <p className="mt-4 leading-8 text-slate-700">
            For broader money planning, also review{' '}
            {links.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? ', ' : ''}
                <Link href={link.href} className="font-medium text-sky-700 hover:underline">
                  {link.label}
                </Link>
              </span>
            ))}
            .
          </p>
        </section>
      ) : null}
    </>
  );
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  if (SLUGS_WITH_DEDICATED_ROUTE.has(params.slug)) notFound();
  const tool = getToolBySlug(params.slug);
  // Server-rendered so a crawler and any answer engine quoting this page see
  // real figures. Null when no live rate exists, so we show the method rather
  // than invent numbers.
  const goldLoanExamples =
    params.slug === 'gold-loan-calculator-india' ? buildGoldLoanExamples() : null;
  if (!tool) notFound();

  const isHraPage = tool.slug === HRA_SLUG;
  const isPersonalLoanPage = tool.slug === PERSONAL_LOAN_SLUG;
  const isSipPage = tool.slug === SIP_SLUG;
  const isEmergencyFundPage = tool.slug === EMERGENCY_FUND_SLUG;
  const isCapitalGainsPage = tool.slug === CAPITAL_GAINS_SLUG;
  const isEighthPayPage = EIGHTH_PAY_CLUSTER_SLUGS.has(tool.slug);
  const heading = getToolHeading(tool.slug, tool.name);
  const description = getToolDescription(tool.slug, tool.shortDescription);
  const discoverImage = getDiscoverImage(`/tools/${tool.slug}`);

  const related = getRelatedTools(tool);
  const supportingGuides = getGuidesForTool(tool.slug);
  const moneyGuideLinks = getMoneyGuidesForTool(tool.slug);

  const salaryClusterSlugs = new Set([
    'gratuity-calculator-india',
    ...EIGHTH_PAY_CLUSTER_SLUGS,
    'salary-in-hand-calculator-india',
  ]);
  const isSalaryClusterPage = salaryClusterSlugs.has(tool.slug);

  const contextualLinks: ContextualLink[] = [
    isSalaryClusterPage ? {
      href: '/8th-pay-commission',
      label: '8th Pay Commission hub covering fitment factor, DA merger and status',
    } : null,
    tool.slug === CAPITAL_GAINS_SLUG ? {
      href: '/nri',
      label: 'NRI tax guide covering NRE/NRO, DTAA and Schedule FA',
    } : null,
    isSalaryClusterPage && blogSlugs.has('new-labour-code-gratuity-rules-india-2026') ? {
      href: '/blog/new-labour-code-gratuity-rules-india-2026',
      label: 'new gratuity rules 2026 guide covering the 1-year vs 5-year rule',
    } : null,
    isSalaryClusterPage && tool.slug !== 'gratuity-calculator-india' && liveToolSlugs.has('gratuity-calculator-india') ? {
      href: '/tools/gratuity-calculator-india',
      label: 'gratuity calculator',
    } : null,
    isSalaryClusterPage && tool.slug !== EIGHTH_PAY_SLUG && liveToolSlugs.has(EIGHTH_PAY_SLUG) ? {
      href: '/tools/8th-pay-commission-salary-calculator-india',
      label: '8th Pay Commission fitment-factor scenario calculator',
    } : null,
    isEighthPayPage && tool.slug !== EIGHTH_PAY_ARREARS_SLUG && liveToolSlugs.has(EIGHTH_PAY_ARREARS_SLUG) ? {
      href: `/tools/${EIGHTH_PAY_ARREARS_SLUG}`,
      label: '8th Pay Commission arrears scenario calculator',
    } : null,
    isEighthPayPage && tool.slug !== EIGHTH_PAY_PENSION_SLUG && liveToolSlugs.has(EIGHTH_PAY_PENSION_SLUG) ? {
      href: `/tools/${EIGHTH_PAY_PENSION_SLUG}`,
      label: '8th Pay Commission pension revision scenario calculator',
    } : null,
    ['gold-loan-calculator-india', 'personal-loan-eligibility-calculator-india'].includes(tool.slug)
      && liveToolSlugs.has(PERSONAL_LOAN_SLUG) ? {
      href: `/tools/${PERSONAL_LOAN_SLUG}`,
      label: 'personal loan EMI calculator for total-cost comparison',
    } : null,
    tool.slug === 'gold-loan-calculator-india'
      && liveToolSlugs.has('personal-loan-eligibility-calculator-india') ? {
      href: '/tools/personal-loan-eligibility-calculator-india',
      label: 'personal loan eligibility calculator for income-based capacity',
    } : null,
    tool.slug === 'personal-loan-eligibility-calculator-india'
      && liveToolSlugs.has('emergency-fund-calculator-india') ? {
      href: '/tools/emergency-fund-calculator-india',
      label: 'emergency fund calculator before taking a new EMI',
    } : null,
    tool.slug === 'personal-loan-eligibility-calculator-india'
      && liveToolSlugs.has('gold-loan-calculator-india') ? {
      href: '/tools/gold-loan-calculator-india',
      label: 'gold loan calculator for a collateral-backed alternative',
    } : null,
    ['ppf-calculator-india', '80c-deduction-calculator-india'].includes(tool.slug)
      && liveToolSlugs.has('sukanya-samriddhi-yojana-calculator-india') ? {
      href: '/tools/sukanya-samriddhi-yojana-calculator-india',
      label: 'SSY calculator for the 15-year deposit and 21-year account term',
    } : null,
    tool.slug === 'sukanya-samriddhi-yojana-calculator-india'
      && liveToolSlugs.has('ppf-calculator-india') ? {
      href: '/tools/ppf-calculator-india',
      label: 'PPF calculator for a rules-and-term comparison',
    } : null,
    tool.slug === 'sukanya-samriddhi-yojana-calculator-india'
      && liveToolSlugs.has(SIP_SLUG) ? {
      href: `/tools/${SIP_SLUG}`,
      label: 'SIP calculator for a market-linked goal scenario',
    } : null,
    liveToolSlugs.has('salary-in-hand-calculator-india') && tool.slug !== 'salary-in-hand-calculator-india' ? {
      href: '/tools/salary-in-hand-calculator-india',
      label: 'salary in-hand calculator',
    } : null,
    liveToolSlugs.has('income-tax-calculator-old-vs-new-regime-india') ? {
      href: '/tools/income-tax-calculator-old-vs-new-regime-india',
      label: 'Old vs New Tax Regime Calculator',
    } : null,
    liveToolSlugs.has('80c-deduction-calculator-india') ? {
      href: '/tools/80c-deduction-calculator-india',
      label: '80C deduction calculator',
    } : null,
    liveToolSlugs.has('emi-calculator-india') ? {
      href: '/tools/emi-calculator-india',
      label: 'EMI calculator',
    } : null,
    blogSlugs.has('itr-2-ay-2026-27-filing-guide') ? {
      href: '/blog/itr-2-ay-2026-27-filing-guide',
      label: 'ITR-2 filing guide',
    } : null,
    blogSlugs.has('how-much-emergency-fund') ? {
      href: '/blog/how-much-emergency-fund',
      label: 'emergency fund guide',
    } : null,
  ].filter((item): item is ContextualLink => item !== null);

  const hraLinks: ContextualLink[] = [
    liveToolSlugs.has('income-tax-calculator-old-vs-new-regime-india')
      ? { href: '/tools/income-tax-calculator-old-vs-new-regime-india', label: 'Old vs New Tax Regime Calculator' }
      : null,
    liveToolSlugs.has('80c-deduction-calculator-india')
      ? { href: '/tools/80c-deduction-calculator-india', label: '80C deduction calculator' }
      : null,
    liveToolSlugs.has('salary-in-hand-calculator-india')
      ? { href: '/tools/salary-in-hand-calculator-india', label: 'salary in-hand calculator' }
      : null,
    blogSlugs.has('itr-2-ay-2026-27-filing-guide')
      ? { href: '/blog/itr-2-ay-2026-27-filing-guide', label: 'ITR-2 filing guide' }
      : null,
  ].filter((item): item is ContextualLink => item !== null);

  const hasLowerEmiBlog = blogSlugs.has('lower-emi-not-always-cheaper');
  const hasProcessingFeeBlog = blogSlugs.has('personal-loan-processing-fee-explained');
  const personalLoanLinks: ContextualLink[] = [
    hasLowerEmiBlog
      ? { href: '/blog/lower-emi-not-always-cheaper', label: 'why lower EMI is not always cheaper guide' }
      : null,
    hasProcessingFeeBlog
      ? {
          href: '/blog/personal-loan-processing-fee-explained',
          label: 'personal loan processing fee explained guide',
        }
      : null,
    liveToolSlugs.has('personal-loan-eligibility-calculator-india')
      ? {
          href: '/tools/personal-loan-eligibility-calculator-india',
          label: 'personal loan eligibility calculator to estimate a safe loan amount',
        }
      : null,
    { href: '/guides/personal-loan-apr-processing-fee-gst', label: 'true APR guide covering processing fee and GST' },
    {
      href: '/guides/flat-rate-vs-reducing-rate-personal-loan',
      label: 'flat-rate versus reducing-balance interest guide',
    },
    liveToolSlugs.has('loan-foreclosure-net-savings-calculator-india')
      ? {
          href: '/tools/loan-foreclosure-net-savings-calculator-india',
          label: 'loan foreclosure net-savings calculator',
        }
      : null,
    liveToolSlugs.has('personal-loan-true-apr-calculator-india')
      ? {
          href: '/tools/personal-loan-true-apr-calculator-india',
          label: 'personal loan true APR calculator including fees and GST',
        }
      : null,
    liveToolSlugs.has('reduce-emi-vs-tenure-calculator-india')
      ? {
          href: '/tools/reduce-emi-vs-tenure-calculator-india',
          label: 'reduce EMI versus tenure comparison calculator',
        }
      : null,
    liveToolSlugs.has('salary-in-hand-calculator-india')
      ? { href: '/tools/salary-in-hand-calculator-india', label: 'in-hand salary calculator to check EMI affordability' }
      : null,
    liveToolSlugs.has('emergency-fund-calculator-india')
      ? { href: '/tools/emergency-fund-calculator-india', label: 'emergency fund calculator for cash-buffer planning' }
      : null,
    liveToolSlugs.has('fd-calculator-india')
      ? { href: '/tools/fd-calculator-india', label: 'FD calculator for low-volatility parking scenarios' }
      : null,
    { href: '/resources', label: 'RupeeKit resources hub for checklists and planning guides' },
  ].filter((item): item is ContextualLink => item !== null);

  const emergencyFundLinks: ContextualLink[] = [
    blogSlugs.has('how-much-emergency-fund')
      ? { href: '/blog/how-much-emergency-fund', label: 'emergency fund guide' }
      : null,
    liveToolSlugs.has('personal-loan-emi-calculator-india')
      ? { href: '/tools/personal-loan-emi-calculator-india', label: 'personal loan EMI calculator' }
      : null,
    liveToolSlugs.has('fd-calculator-india')
      ? { href: '/tools/fd-calculator-india', label: 'FD calculator' }
      : null,
    liveToolSlugs.has('sip-calculator-india')
      ? { href: '/tools/sip-calculator-india', label: 'SIP calculator' }
      : null,
    liveToolSlugs.has('recurring-deposit-calculator-india')
      ? { href: '/tools/recurring-deposit-calculator-india', label: 'recurring deposit calculator' }
      : null,
    liveToolSlugs.has('salary-in-hand-calculator-india')
      ? { href: '/tools/salary-in-hand-calculator-india', label: 'in-hand salary calculator to size monthly savings' }
      : null,
    { href: '/guides/emergency-fund-with-home-loan-emi', label: 'guide to emergency funds when you have a home-loan EMI' },
  ].filter((item): item is ContextualLink => item !== null);

  const sipLinks: ContextualLink[] = [
    liveToolSlugs.has('step-up-sip-calculator-india')
      ? { href: '/tools/step-up-sip-calculator-india', label: 'step-up SIP calculator for annual contribution increases' }
      : null,
    liveToolSlugs.has('lumpsum-calculator-india')
      ? { href: '/tools/lumpsum-calculator-india', label: 'lumpsum calculator for one-time investments' }
      : null,
    liveToolSlugs.has('cagr-calculator-india')
      ? { href: '/tools/cagr-calculator-india', label: 'CAGR calculator for annualised growth' }
      : null,
    liveToolSlugs.has('fd-calculator-india')
      ? { href: '/tools/fd-calculator-india', label: 'FD calculator for fixed-return comparison' }
      : null,
    liveToolSlugs.has('personal-loan-emi-calculator-india')
      ? { href: '/tools/personal-loan-emi-calculator-india', label: 'personal loan EMI calculator for obligation planning' }
      : null,
    liveToolSlugs.has('emergency-fund-calculator-india')
      ? { href: '/tools/emergency-fund-calculator-india', label: 'emergency fund calculator before aggressive investing' }
      : null,
    blogSlugs.has('how-much-emergency-fund')
      ? { href: '/blog/how-much-emergency-fund', label: 'guide on how much emergency fund may be practical' }
      : null,
    blogSlugs.has('mutual-funds-for-beginners-india')
      ? { href: '/blog/mutual-funds-for-beginners-india', label: 'beginner guide to mutual funds in India' }
      : null,
    liveToolSlugs.has('net-worth-calculator-india')
      ? { href: '/tools/net-worth-calculator-india', label: 'net worth calculator to track overall progress' }
      : null,
    { href: '/resources', label: 'RupeeKit resources hub' },
  ].filter((item): item is ContextualLink => item !== null);

  if (
    tool.slug === 'home-loan-emi-calculator-india' &&
    liveToolSlugs.has('home-affordability-calculator-india')
  ) {
    contextualLinks.unshift({
      href: '/tools/home-affordability-calculator-india',
      label: 'home affordability calculator based on income and existing EMIs',
    });
  }

  const taxGuideHref = '/blog/itr-2-ay-2026-27-filing-guide';
  const taxGuideToolSlugs = new Set([
    'income-tax-calculator-old-vs-new-regime-india',
    'hra-exemption-calculator-india',
    '80c-deduction-calculator-india',
  ]);
  const showTaxGuideLink = blogSlugs.has('itr-2-ay-2026-27-filing-guide') && taxGuideToolSlugs.has(tool.slug);
  const showPersonalLoanLinkOnEmiPage =
    tool.slug === 'emi-calculator-india' && liveToolSlugs.has(PERSONAL_LOAN_SLUG);
  const effectiveQuickAnswer = tool.quickAnswer ?? buildFallbackQuickAnswer(tool);
  const genericAnswerEngineSummary = buildGenericAnswerEngineSummary(tool);
  const genericCalculatorFacts = buildGenericCalculatorFacts(tool);
  const buriedIntentSections = BURIED_TOOL_INTENT_CONTENT[tool.slug] ?? [];
  const personalLoanFacts = [
    {
      topic: 'EMI formula',
      explanation: 'Uses loan amount, monthly interest rate, and tenure',
    },
    {
      topic: 'Lower EMI',
      explanation: 'May increase total interest if tenure is longer',
    },
    {
      topic: 'Processing fee',
      explanation: 'Can increase total borrowing cost',
    },
    {
      topic: 'GST',
      explanation: 'May apply on fees depending on lender/product terms',
    },
    {
      topic: 'Prepayment',
      explanation: 'May reduce interest, but charges may apply',
    },
    {
      topic: 'Live rates',
      explanation: 'RupeeKit does not fetch live lender rates',
    },
    {
      topic: 'Loan approval',
      explanation: 'RupeeKit does not provide loan approval',
    },
    {
      topic: 'Data privacy',
      explanation: 'Calculator values are processed in-browser and not saved by default',
    },
  ];
  const hasSourceMethodologyInSections =
    Array.isArray(tool.contentSections)
    && tool.contentSections.some((section) => /source and methodology/i.test(section.heading));
  const showGenericSourceMethodology =
    !isHraPage && !isPersonalLoanPage && !isSipPage && !hasSourceMethodologyInSections;

  const pageUrl = `${SITE_URL}/tools/${tool.slug}`;
  const discoverImageUrl = discoverImage ? `${SITE_URL}${discoverImage.src}` : undefined;

  const faqSchema =
    tool.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tool.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;

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
        name: heading,
        item: pageUrl,
      },
    ],
  };

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isHraPage ? 'HRA Exemption Calculator India' : tool.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a JavaScript-enabled web browser.',
    url: pageUrl,
    description: isHraPage
      ? 'Calculate likely HRA exemption under Indian tax rules.'
      : tool.metaDescription,
    dateModified: tool.lastReviewedIso ?? TOOL_SEO_OVERRIDES[tool.slug]?.lastReviewedIso,
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    creator: editorialTeamRef,
    maintainer: editorialTeamRef,
    ...(discoverImageUrl ? { image: discoverImageUrl } : {}),
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
      {tool.howToUse && tool.howToUse.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: `How to use the ${tool.name}`,
              step: tool.howToUse.map((text, i) => ({
                '@type': 'HowToStep',
                position: i + 1,
                text,
              })),
            }),
          }}
        />
      ) : null}

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-950">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-slate-950">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span>{heading}</span>
      </nav>

      <header className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.5fr] lg:items-end">
        <div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-sky-700">
            {tool.category}
          </span>

          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            {heading}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>

          {isMicroTool(tool.slug) && <a href="#calculator" className="mt-5 inline-flex rounded-xl bg-teal-800 px-5 py-3 text-sm font-bold text-white hover:bg-teal-900">Try the calculator ↓</a>}

          <EditorialByline
            className="mt-4"
            updatedIso={tool.lastReviewedIso ?? TOOL_SEO_OVERRIDES[tool.slug]?.lastReviewedIso}
            updatedFallback={tool.lastReviewed}
          />

          {tool.calculationVersion || tool.factsCheckedIso ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              {tool.calculationVersion ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold">
                  Tested calculation v{tool.calculationVersion}
                </span>
              ) : null}
              {tool.factsCheckedIso ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold">
                  Primary sources checked {tool.factsCheckedIso}
                </span>
              ) : null}
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold">
                Inputs processed in your browser
              </span>
            </div>
          ) : null}

          {isHraPage ? (
            <p className="mt-2 text-sm text-slate-500">
              Reviewed for FY 2026-27 HRA city-rule changes.
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          {discoverImage ? <DiscoverHeroImage image={discoverImage} priority /> : null}
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <p className="font-bold">Educational estimate only</p>
            <p className="mt-2">
              Results can vary based on company policy, lender terms, tax law, and personal assumptions.
            </p>
            {isHraPage ? (
              <p className="mt-2">
                For HRA claims, verify final eligibility and documentation with your employer payroll team, CA, and
                official rules before filing.
              </p>
            ) : null}
            {isPersonalLoanPage ? (
              <p className="mt-2">
                RupeeKit is not a lender, does not provide loan approval, and does not publish official live bank rates.
              </p>
            ) : null}
            {isEmergencyFundPage ? (
              <p className="mt-2">
                Emergency fund outputs are planning estimates only and are not financial or investment advice.
              </p>
            ) : null}
            <p className="mt-2 text-xs text-amber-800">See the Source and methodology section below for details.</p>
          </div>
        </div>
      </header>

      {isCapitalGainsPage ? (
        <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-800">What this calculator covers</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            For <strong>listed equity shares and equity-oriented mutual funds</strong> where STT applies: 20% short-term
            capital gains tax, 12.5% long-term capital gains tax above the Rs 1.25 lakh annual exemption, plus 4% cess.
            It does <strong>not</strong> calculate capital gains on property, debt funds, gold, cryptocurrency or
            unlisted shares — those follow different rules and rates.
          </p>
        </section>
      ) : null}

      {isSipPage ? (
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
            More than a basic SIP calculator
          </p>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm leading-6 text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            <li>Regular SIP projection</li>
            <li>Step-up SIP</li>
            <li>Goal-based SIP</li>
            <li>Cost of delaying 1 year</li>
            <li>Missed-SIP impact</li>
            <li>Pause-and-restart scenario</li>
            <li>Inflation-adjusted value</li>
            <li>EMI-to-SIP redirect</li>
          </ul>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            All projections use your own return assumption. Mutual fund returns are market-linked and not guaranteed.
          </p>
        </section>
      ) : null}

      {isEmergencyFundPage ? (
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Direct answer</p>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-900">
            Emergency fund target = essential monthly expenses plus unavoidable EMIs, multiplied by the number of
            months of protection required.
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            Choose 3, 6, 9 or 12 months based on income stability, dependants and financial obligations: 3 months can
            suit stable dual-income households, 6 months is a common baseline, and 9-12 months suits single-income
            families, freelancers and variable-income households.
          </p>
        </section>
      ) : null}

      {isEighthPayPage ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Scenario-based estimates</p>
          <p className="mt-2 text-sm leading-7 text-amber-900">
            The 8th Central Pay Commission has not notified a final fitment factor. These values are user-selectable
            planning scenarios, not official salary recommendations. Verify current status on the official 8th CPC and
            PIB websites before relying on any figure.
          </p>
        </section>
      ) : null}

      {isPersonalLoanPage ? (
          <div className="mt-10">
            <PersonalLoanDecisionSimulator
              tool={tool}
              quickAnswer={effectiveQuickAnswer}
              answerEngineSummary={PERSONAL_LOAN_ANSWER_ENGINE_SUMMARY}
            />
          </div>
      ) : (
        <>
          <div className="mt-10" id="calculator">
            <Calculator tool={tool} />
          </div>
          <PlanningFeatureSummary slug={tool.slug} />
          {effectiveQuickAnswer ? (
            <section className="mt-6">
              <QuickAnswerBox
                title={effectiveQuickAnswer.title}
                question={effectiveQuickAnswer.question}
                answer={effectiveQuickAnswer.answer}
                formula={effectiveQuickAnswer.formula}
                example={effectiveQuickAnswer.example}
                note={effectiveQuickAnswer.note}
                links={effectiveQuickAnswer.links}
              />
            </section>
          ) : null}
          <AnswerEngineSummary
            id="answer-engine-summary"
            summary={
              isSipPage
                ? 'A SIP calculator estimates the future value of monthly investments using SIP amount, expected annual return, and investment duration. RupeeKit\'s SIP calculator also shows step-up SIP, goal SIP, missed SIP impact, pause-and-restart scenarios, inflation-adjusted value, and EMI-to-SIP redirect scenarios. Results are educational estimates only because mutual fund returns are market-linked and not guaranteed.'
                : genericAnswerEngineSummary
            }
          />
        </>
      )}

      <SourceBackedComparison slug={tool.slug} linkToGuide />

      {buriedIntentSections.length > 0 ? (
        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {buriedIntentSections.map((section) => (
            <article key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brandDeepNavy">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{section.body}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </article>
          ))}
        </section>
      ) : null}

      {supportingGuides.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-5 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Supporting answers</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Questions this calculator helps answer</h2>
            </div>
            <AnalyticsLink
              href="/guides"
              analyticsEvent="tool_cta_click"
              toolSlug={tool.slug}
              toolCategory={tool.category}
              ctaType="resource"
              className="text-sm font-bold text-sky-800 hover:underline"
            >
              Browse all calculator guides
            </AnalyticsLink>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {supportingGuides.map((guide) => (
              <AnalyticsLink
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                analyticsEvent="guide_click"
                toolSlug={tool.slug}
                toolCategory={tool.category}
                className="rounded-2xl border border-sky-100 bg-white p-4 font-bold text-slate-900 transition hover:border-sky-300 hover:text-sky-800 hover:shadow-sm"
              >
                {guide.title}
              </AnalyticsLink>
            ))}
          </div>
        </section>
      ) : null}

      {isEmergencyFundPage ? (
        <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm leading-7 text-slate-700">
            An emergency fund is money kept aside only for genuine financial shocks such as job loss, medical
            expenses, urgent home repair or an EMI gap. In India, the right target is usually not based on salary
            alone. It should reflect essential monthly expenses, dependants, loan obligations and income stability.
            Use this emergency fund calculator to estimate a practical 3, 6, 9 or 12 month buffer and see how much
            you may need to save each month to get there.
          </p>
        </section>
      ) : null}

      {showPersonalLoanLinkOnEmiPage ? (
        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm leading-7 text-slate-700">
            Need EMI for a personal loan? Use the{' '}
            <Link
              href="/tools/personal-loan-emi-calculator-india"
              className="font-semibold text-emerald-800 hover:underline"
            >
              Personal Loan EMI Calculator India
            </Link>
            .
          </p>
        </section>
      ) : null}

      {showTaxGuideLink ? (
        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">Tax Filing Resource</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            ITR-2 AY 2026-27: Who Must File, Due Date and Preparation Guide
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Use this guide to verify ITR-2 applicability, required documents, and filing steps.
          </p>
          <Link
            href={taxGuideHref}
            className="mt-4 inline-flex items-center rounded-full bg-sky-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-800"
          >
            Read ITR-2 Guide
          </Link>
        </section>
      ) : null}

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {isHraPage ? (
            <HraEducationalContent links={contextualLinks} />
          ) : isSipPage ? (
            <SipEducationalContent links={sipLinks} lastReviewed={tool.lastReviewed} />
          ) : (
            <>
              {!isPersonalLoanPage && !isEmergencyFundPage ? (
                <>
                  <h2 className="text-2xl font-bold">Formula used</h2>
                  <p className="mt-4 leading-8 text-slate-700">{tool.formulaExplanation}</p>
                </>
              ) : null}

              {!isPersonalLoanPage && !isEmergencyFundPage ? (
                <>
                  <h2 className="mt-8 text-2xl font-bold">Example calculation</h2>
                  <p className="mt-4 leading-8 text-slate-700">{tool.example}</p>
                </>
              ) : null}

              {goldLoanExamples ? (
                <>
                  <h2 className="mt-8 text-2xl font-bold">
                    How much gold loan for 10g, 20g, 50g or 100g
                  </h2>
                  <p className="mt-4 leading-8 text-slate-700">
                    Worked from the bullion value on {goldLoanExamples.asOf} of{' '}
                    ₹{goldLoanExamples.perGram['22K'].toLocaleString('en-IN')} per gram for 22K and{' '}
                    ₹{goldLoanExamples.perGram['18K'].toLocaleString('en-IN')} per gram for 18K, then
                    the RBI consumption-loan LTV band that the resulting amount falls into. Gold
                    content only: making charges, wastage and stones are excluded, and your lender
                    values on its own reference rate.
                  </p>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-300">
                          <th className="py-2 pr-4 font-semibold">Gold pledged</th>
                          <th className="py-2 pr-4 font-semibold">Intrinsic value</th>
                          <th className="py-2 pr-4 font-semibold">LTV band</th>
                          <th className="py-2 font-semibold">Indicative loan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {goldLoanExamples.rows.map((row) => (
                          <tr key={`${row.carat}-${row.grams}`} className="border-b border-slate-200">
                            <td className="py-2 pr-4">{row.grams}g of {row.carat}</td>
                            <td className="py-2 pr-4">₹{row.intrinsicValue.toLocaleString('en-IN')}</td>
                            <td className="py-2 pr-4">{row.ltvPct}%</td>
                            <td className="py-2">₹{row.eligibleLoan.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {goldLoanExamples.basis === 'average'
                      ? 'Based on the 30-day trailing average, the basis RBI-regulated lenders use to value pledged gold.'
                      : 'Based on the latest bullion value. A 30-day trailing average is not yet available, so a lender may value your gold slightly differently.'}
                  </p>
                </>
              ) : null}

              {tool.howToUse?.length && !isPersonalLoanPage && !isEmergencyFundPage ? (
                <>
                  <h2 className="mt-8 text-2xl font-bold">How to use this calculator</h2>
                  <ol className="mt-4 list-decimal space-y-2 pl-6 leading-7 text-slate-700">
                    {tool.howToUse.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </>
              ) : null}

              {tool.assumptions?.length ? (
                <>
                  <h2 className="mt-8 text-2xl font-bold">Important assumptions</h2>
                  {['home-loan-emi-calculator-india', 'sip-calculator-india', 'salary-in-hand-calculator-india'].includes(tool.slug) ? <p className="mt-3 text-sm leading-7 text-slate-600">The assumptions below describe the Quick calculator and its examples. The additional planner has its own visible method, input limits and assumptions, also included in its downloads.</p> : null}
                  <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                    {tool.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {tool.commonMistakes?.length && !isPersonalLoanPage && !isEmergencyFundPage ? (
                <>
                  <h2 className="mt-8 text-2xl font-bold">Common mistakes to avoid</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                    {tool.commonMistakes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {tool.contentSections?.map((section) => (
                <section
                  key={section.heading}
                  id={
                    /source and methodology/i.test(section.heading)
                      ? 'source-and-methodology'
                      : isPersonalLoanPage
                      ? PERSONAL_LOAN_SECTION_IDS[section.heading]
                      : isEmergencyFundPage && section.heading === 'Source and Methodology'
                        ? 'source-and-methodology'
                        : undefined
                  }
                  className="mt-8 scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold">{section.heading}</h2>
                  {/source and methodology/i.test(section.heading) ? (
                    <p className="mt-2 text-sm text-slate-500">Last reviewed: {tool.lastReviewed ?? 'July 2026'}</p>
                  ) : null}
                  <p className="mt-4 leading-8 text-slate-700">{section.body}</p>
                  {/source and methodology/i.test(section.heading) ? (
                    <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {tool.calculationVersion ? (
                        <p><strong>Calculation version:</strong> {tool.calculationVersion}{tool.factsCheckedIso ? <> · <strong>Facts checked:</strong> {tool.factsCheckedIso}</> : null}</p>
                      ) : null}
                      {tool.nextReviewTrigger ? <p><strong>Next review trigger:</strong> {tool.nextReviewTrigger}</p> : null}
                      <p>Educational estimate only. RupeeKit does not provide personalized financial, investment, legal, tax or loan advice.</p>
                      {tool.officialSources?.length ? (
                        <div>
                          <p className="font-bold text-slate-900">Primary references</p>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {tool.officialSources.map((source) => (
                              <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 hover:underline">{source.label}</a></li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {isEmergencyFundPage && section.heading === 'Emergency Fund by Life Situation' ? (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[680px] rounded-2xl border border-slate-200 text-left text-xs text-slate-700 md:text-sm">
                        <thead className="bg-slate-50 text-slate-900">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Life situation</th>
                            <th className="px-4 py-3 font-semibold">Emergency fund range</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">Single salaried person, stable job</td>
                            <td className="px-4 py-3">May consider 3-6 months</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">Married couple, dual income</td>
                            <td className="px-4 py-3">May consider 3-6 months</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">Married couple, single income</td>
                            <td className="px-4 py-3">May consider 6-9 months</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">Family with kids and EMI</td>
                            <td className="px-4 py-3">May consider 6-12 months</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">Freelancer or business owner</td>
                            <td className="px-4 py-3">May consider 9-12 months</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">Unstable income</td>
                            <td className="px-4 py-3">May consider 9-12 months</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {isEmergencyFundPage && section.heading === 'Where should you keep emergency fund in India?' ? (
                    <>
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[680px] rounded-2xl border border-slate-200 text-left text-xs text-slate-700 md:text-sm">
                          <thead className="bg-slate-50 text-slate-900">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Option</th>
                              <th className="px-4 py-3 font-semibold">Good for</th>
                              <th className="px-4 py-3 font-semibold">Caution</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-slate-200">
                              <td className="px-4 py-3">Savings account</td>
                              <td className="px-4 py-3">Instant access for immediate needs</td>
                              <td className="px-4 py-3">Returns may be lower than other options</td>
                            </tr>
                            <tr className="border-t border-slate-200">
                              <td className="px-4 py-3">Sweep-in FD</td>
                              <td className="px-4 py-3">Quick access with linked deposit discipline</td>
                              <td className="px-4 py-3">Bank terms and break conditions may vary</td>
                            </tr>
                            <tr className="border-t border-slate-200">
                              <td className="px-4 py-3">Short-term FD</td>
                              <td className="px-4 py-3">Planned parking for part of emergency corpus</td>
                              <td className="px-4 py-3">Premature withdrawal terms can apply</td>
                            </tr>
                            <tr className="border-t border-slate-200">
                              <td className="px-4 py-3">Liquid fund</td>
                              <td className="px-4 py-3">Low-risk liquid option for some households</td>
                              <td className="px-4 py-3">Not risk-free; exit terms and volatility can vary</td>
                            </tr>
                            <tr className="border-t border-slate-200">
                              <td className="px-4 py-3">Small cash at home</td>
                              <td className="px-4 py-3">Urgent same-day cash-only situations</td>
                              <td className="px-4 py-3">Keep only a limited amount for safety</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                        Keep at least one part of your emergency fund instantly accessible. Do not keep your core
                        emergency money in equity, crypto, long lock-in products or anything that may fall sharply
                        when you need cash.
                      </p>
                    </>
                  ) : null}

                  {section.bullets?.length ? (
                    <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              {isEmergencyFundPage ? (
                <>
                  <section className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">3-Month vs 6-Month vs 9-Month vs 12-Month Emergency Fund</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      A 3-month target may cover short disruptions for stable households, while 6 months is a common
                      baseline for many families. A 9 or 12 month target can be more practical when income is variable,
                      dependants are high, or EMI obligations are large.
                    </p>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[680px] rounded-2xl border border-slate-200 text-left text-xs text-slate-700 md:text-sm">
                        <thead className="bg-slate-50 text-slate-900">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Fund size</th>
                            <th className="px-4 py-3 font-semibold">May suit</th>
                            <th className="px-4 py-3 font-semibold">Caution</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">3 months</td>
                            <td className="px-4 py-3">Stable salaried income with lower fixed obligations</td>
                            <td className="px-4 py-3">May be thin for job loss, medical shocks, or high EMIs</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">6 months</td>
                            <td className="px-4 py-3">Many households with moderate EMI and dependants</td>
                            <td className="px-4 py-3">Review after expense spikes or income instability</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">9 months</td>
                            <td className="px-4 py-3">Single-income families or higher uncertainty phases</td>
                            <td className="px-4 py-3">Needs disciplined monthly top-ups to maintain target</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3">12 months</td>
                            <td className="px-4 py-3">Business/freelance income, high obligations, or volatile cash flow</td>
                            <td className="px-4 py-3">Avoid over-allocating if it blocks essential debt reduction goals</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">Should EMI be included in emergency fund calculation?</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      Yes, EMI commitments are usually included because they remain due during income disruption.
                      This calculator adds monthly EMI commitments to essential expenses before multiplying by
                      target months.
                    </p>
                  </section>

                  <section className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">How often should you review your emergency fund?</h2>
                    <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                      <li>Recalculate monthly survival cost after rent, school fee, insurance, or EMI changes.</li>
                      <li>Review target months after job changes, role changes, or family dependency changes.</li>
                      <li>Keep at least one part of the corpus instantly accessible.</li>
                      <li>Refill emergency savings after any withdrawal.</li>
                      <li>Review the plan at least every 6 to 12 months.</li>
                    </ul>
                  </section>

                  <section className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">Is an emergency fund different from investment savings?</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      Emergency money is for immediate liquidity during shocks. Investment savings are usually for
                      long-term growth goals and can carry market risk or lock-ins. Keep your core emergency corpus
                      separate from long-term investment buckets.
                    </p>
                  </section>
                </>
              ) : null}

              {isPersonalLoanPage ? (
                <>
                  <section id="what-affects-your-personal-loan-emi" className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">What affects your personal loan EMI?</h2>
                    <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                      <li>Higher loan amount generally increases monthly EMI.</li>
                      <li>Higher annual interest rate increases EMI and total interest cost.</li>
                      <li>Longer tenure can reduce EMI but may increase total interest paid.</li>
                      <li>Existing EMIs affect your overall monthly debt burden.</li>
                      <li>Processing fee can increase total borrowing cost even when EMI stays unchanged.</li>
                    </ul>
                  </section>

                  <section id="tenure-comparison-12-24-36-48-60-months" className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">Tenure Comparison: 12, 24, 36, 48, 60 Months</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      Use the tenure comparison table and visuals on this page to compare EMI, total interest, and total
                      repayment across common month-based options before selecting a tenure.
                    </p>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[680px] rounded-2xl border border-slate-200 text-left text-xs text-slate-700 md:text-sm">
                        <thead className="bg-slate-50 text-slate-900">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Tenure choice</th>
                            <th className="px-4 py-3 font-semibold">EMI impact</th>
                            <th className="px-4 py-3 font-semibold">Total interest impact</th>
                            <th className="px-4 py-3 font-semibold">Useful when</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3 font-medium">Short tenure</td>
                            <td className="px-4 py-3">Higher monthly EMI</td>
                            <td className="px-4 py-3">Usually lower total interest</td>
                            <td className="px-4 py-3">Cash flow can handle higher EMI and you want faster closure</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-4 py-3 font-medium">Long tenure</td>
                            <td className="px-4 py-3">Lower monthly EMI</td>
                            <td className="px-4 py-3">Usually higher total interest</td>
                            <td className="px-4 py-3">Need lower monthly EMI to manage near-term budget pressure</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section id="emi-burden-on-monthly-income" className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">What is EMI burden on monthly income?</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      This page estimates EMI-to-income and total EMI burden percentages so you can check affordability.
                      This is a budgeting indicator only and not a lender approval signal.
                    </p>
                  </section>

                  <section id="live-bank-interest-rates" className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">Does RupeeKit show live bank interest rates?</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      No. RupeeKit does not fetch live lender rates, offers, approvals, or disbursal data. Enter
                      official lender values for loan amount, annual interest rate, fees, and tenure before using
                      results for comparison.
                    </p>
                  </section>

                  <section id="personal-loan-repayment-schedule-amortization" className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">Personal Loan Repayment Schedule / Amortization</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      The yearly amortization summary shows how each year&apos;s EMI is split between principal and
                      interest. It helps you understand how repayment composition changes over the loan tenure.
                    </p>
                  </section>

                  <section id="flat-rate-vs-reducing-balance" className="mt-8 scroll-mt-24">
                    <h2 className="text-2xl font-bold">Flat rate vs reducing-balance rate</h2>
                    <p className="mt-4 leading-8 text-slate-700">
                      This calculator uses the <strong>reducing-balance</strong> method, where interest is charged only
                      on the outstanding principal each month — the standard for most bank personal loans. A{' '}
                      <strong>flat rate</strong> charges interest on the full original loan amount for the whole tenure,
                      so a &quot;10% flat&quot; loan can cost roughly as much as an 17-19% reducing-balance loan over a
                      typical tenure. Always confirm which method a lender quotes before comparing offers, and read the{' '}
                      <Link
                        href="/guides/flat-rate-vs-reducing-rate-personal-loan"
                        className="font-medium text-sky-700 hover:underline"
                      >
                        flat-rate versus reducing-balance guide
                      </Link>{' '}
                      for worked examples.
                    </p>
                  </section>
                </>
              ) : null}

              {isPersonalLoanPage && personalLoanLinks.length ? (
                <section className="mt-8">
                  <h2 className="text-2xl font-bold">Related calculators and guides</h2>
                  <p className="mt-4 leading-8 text-slate-700">
                    You can cross-check this estimate using related RupeeKit tools and guides:{' '}
                    {personalLoanLinks.map((link, index) => (
                      <span key={link.href}>
                        {index > 0 ? ', ' : ''}
                        <AnalyticsLink
                          href={link.href}
                          analyticsEvent={link.href.startsWith('/guides/') ? 'guide_click' : 'tool_cta_click'}
                          toolSlug={tool.slug}
                          toolCategory={tool.category}
                          ctaType={link.href.startsWith('/tools/') ? 'related_tool' : 'resource'}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {link.label}
                        </AnalyticsLink>
                      </span>
                    ))}
                    .
                  </p>
                </section>
              ) : null}

              {isEmergencyFundPage && emergencyFundLinks.length ? (
                <section className="mt-8">
                  <h2 className="text-2xl font-bold">Related calculators and guides</h2>
                  <p className="mt-4 leading-8 text-slate-700">
                    You can continue planning with these RupeeKit resources:{' '}
                    {emergencyFundLinks.map((link, index) => (
                      <span key={link.href}>
                        {index > 0 ? ', ' : ''}
                        <AnalyticsLink
                          href={link.href}
                          analyticsEvent={link.href.startsWith('/guides/') ? 'guide_click' : 'tool_cta_click'}
                          toolSlug={tool.slug}
                          toolCategory={tool.category}
                          ctaType={link.href.startsWith('/tools/') ? 'related_tool' : 'resource'}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {link.label}
                        </AnalyticsLink>
                      </span>
                    ))}
                    .
                  </p>
                </section>
              ) : null}

              {isHraPage && hraLinks.length ? (
                <section className="mt-8">
                  <h2 className="text-2xl font-bold">Related calculators and guides</h2>
                  <p className="mt-4 leading-8 text-slate-700">
                    HRA exemption only applies under the old tax regime, so also compare using:{' '}
                    {hraLinks.map((link, index) => (
                      <span key={link.href}>
                        {index > 0 ? ', ' : ''}
                        <AnalyticsLink
                          href={link.href}
                          analyticsEvent={link.href.startsWith('/guides/') ? 'guide_click' : 'tool_cta_click'}
                          toolSlug={tool.slug}
                          toolCategory={tool.category}
                          ctaType={link.href.startsWith('/tools/') ? 'related_tool' : 'resource'}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {link.label}
                        </AnalyticsLink>
                      </span>
                    ))}
                    .
                  </p>
                </section>
              ) : null}

              {!isHraPage && !isPersonalLoanPage && !isEmergencyFundPage && !isSipPage && contextualLinks.length ? (
                <section className="mt-8">
                  <h2 className="text-2xl font-bold">Related calculators and guides</h2>
                  <p className="mt-4 leading-8 text-slate-700">
                    You can cross-check this estimate using:{' '}
                    {contextualLinks.map((link, index) => (
                      <span key={link.href}>
                        {index > 0 ? ', ' : ''}
                        <AnalyticsLink
                          href={link.href}
                          analyticsEvent={link.href.startsWith('/guides/') ? 'guide_click' : 'tool_cta_click'}
                          toolSlug={tool.slug}
                          toolCategory={tool.category}
                          ctaType={link.href.startsWith('/tools/') ? 'related_tool' : 'resource'}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {link.label}
                        </AnalyticsLink>
                      </span>
                    ))}
                    .
                  </p>
                </section>
              ) : null}

              {!isEmergencyFundPage ? (
                <>
                  <h2 className="mt-8 text-2xl font-bold">When this tool is useful</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                    <li>When you want a fast estimate before making a financial or salary decision.</li>
                    <li>When you want to compare different assumptions in seconds.</li>
                    <li>When you want to understand the formula behind the result.</li>
                  </ul>
                </>
              ) : null}
            </>
          )}
          {isMicroTool(tool.slug) && <ToolAdPlacement />}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {moneyGuideLinks.length > 0 ? (
            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/20">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Understand the decision</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {moneyGuideLinks.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/money-guides/${guide.slug}`} className="inline-flex min-h-11 items-center font-semibold text-sky-800 hover:underline dark:text-sky-200">
                      {guide.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold">Related calculators</h2>

            <div className="mt-5 grid gap-3">
              {related.length > 0 ? (
                related.map((item) => (
                  <AnalyticsLink
                    key={item.slug}
                    href={`/tools/${item.slug}`}
                    analyticsEvent="tool_cta_click"
                    toolSlug={tool.slug}
                    toolCategory={tool.category}
                    ctaType="related_tool"
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                  >
                    <p className="font-bold text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.shortDescription}</p>
                  </AnalyticsLink>
                ))
              ) : (
                <p className="text-sm text-slate-600">More related calculators will be added soon.</p>
              )}
            </div>
          </div>

          {isHraPage || isPersonalLoanPage || isSipPage ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">On this page</h2>
              <nav className="mt-4">
                <ul className="space-y-2 text-sm text-slate-700">
                  {(isHraPage ? HRA_TOC : isPersonalLoanPage ? PERSONAL_LOAN_TOC : SIP_TOC).map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="hover:text-sky-700 hover:underline">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ) : null}
        </aside>
      </section>

      {isHraPage ? (
        <section id="source-and-methodology" className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 scroll-mt-24">
          <h2 className="text-2xl font-bold">Source and methodology</h2>
          <p className="mt-4 leading-8 text-slate-700">
            This calculator compares actual HRA, rent paid minus 10% of salary, and city-based salary cap. It is
            designed for educational estimation under old-regime HRA rules and should be verified with employer payroll,
            official guidance, or a qualified tax professional.
          </p>
          <p className="mt-4 leading-8 text-slate-700">
            This calculator uses the HRA exemption formula under Rule 279 of the Income-tax Rules, 2026. The estimated
            exemption is calculated as the least of:
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 leading-7 text-slate-700">
            <li>Actual HRA received</li>
            <li>Rent paid minus 10% of salary</li>
            <li>50% of salary for specified cities or 40% of salary for other cities</li>
          </ol>
          <p className="mt-4 leading-8 text-slate-700">
            For FY 2026-27, the specified 50% cities include Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune,
            Ahmedabad and Bengaluru. Please verify your final claim with your employer, payroll team or tax
            professional before filing.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Official source:{' '}
            <a
              href="https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-03/En-Notified-IT-Rules-2026-20-03-2026.pdf?mobile-app=1"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-700 hover:underline"
            >
              Income-tax Rules, 2026 notification, Ministry of Finance / CBDT
            </a>
            .
          </p>
        </section>
      ) : null}

      {isPersonalLoanPage ? (
        <FactsTable
          id="personal-loan-calculator-facts"
          title="Personal Loan EMI Calculator Facts"
          rows={personalLoanFacts}
        />
      ) : !isSipPage ? (
        <FactsTable id="calculator-facts" rows={genericCalculatorFacts} />
      ) : null}

      {showGenericSourceMethodology ? (
        <section id="source-and-methodology" className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 scroll-mt-24">
          <h2 className="text-2xl font-bold">Source and methodology</h2>
          {tool.lastReviewed ? <p className="mt-2 text-sm text-slate-500">Last reviewed: {tool.lastReviewed}</p> : null}
          <p className="mt-4 leading-8 text-slate-700">
            This calculator uses user-entered values and the formula logic shown on this page to generate educational
            estimates. Method reference: {firstSentence(tool.formulaExplanation)}
          </p>
          <p className="mt-4 leading-8 text-slate-700">
            Inputs are processed in-page to show planning outputs. RupeeKit does not provide personalized financial,
            tax, legal, investment, or loan advice.
          </p>
          {tool.calculationVersion ? (
            <p className="mt-4 text-sm leading-6 text-slate-700">
              <strong>Calculation version:</strong> {tool.calculationVersion}
              {tool.factsCheckedIso ? <> · <strong>Facts checked:</strong> {tool.factsCheckedIso}</> : null}
            </p>
          ) : null}
          {tool.nextReviewTrigger ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              <strong>Next review trigger:</strong> {tool.nextReviewTrigger}
            </p>
          ) : null}
          {tool.officialSources?.length ? (
            <>
              <h3 className="mt-6 text-lg font-bold text-slate-950">Primary references</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {tool.officialSources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sky-700 hover:underline"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      <section
        id="faqs"
        className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 scroll-mt-24"
      >
        <h2 className="text-2xl font-bold">FAQs</h2>

        <div className="mt-6 grid gap-4">
          {tool.faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl bg-slate-50 p-5">
              <summary className="cursor-pointer font-bold text-slate-950">{faq.question}</summary>
              <p className="mt-3 leading-7 text-slate-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {isPersonalLoanPage ? (
        <section id="source-and-methodology" className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 scroll-mt-24">
          <h2 className="text-2xl font-bold">Source and methodology</h2>
          <p className="mt-2 text-sm text-slate-500">Last reviewed: {tool.lastReviewed ?? 'July 2026'}</p>
          <p className="mt-4 leading-8 text-slate-700">
            This calculator uses the standard reducing-balance EMI formula based on loan amount, monthly interest rate,
            and tenure in months. It also estimates processing fee impact and EMI burden using user-entered values.
          </p>
          <p className="mt-4 leading-8 text-slate-700">
            RupeeKit does not show live bank interest rates or loan offers. Verify final rates, fees, eligibility,
            prepayment and foreclosure charges on the official lender website.
          </p>
          <p className="mt-4 leading-8 text-slate-700">
            RupeeKit is not a lender and does not provide loan approval, disbursal, or official bank rate quotes.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            RupeeKit is not affiliated with SBI, HDFC, Bank of Baroda, IDFC, ICICI, Axis Bank or any lender. You can
            use this calculator for any lender by entering the official loan amount, interest rate and tenure offered
            by that lender. Always verify latest rates, fees, eligibility, prepayment charges and foreclosure charges
            on the lender&apos;s official website.
          </p>
        </section>
      ) : null}
    </div>
  );
}
