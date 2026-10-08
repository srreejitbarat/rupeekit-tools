import { GUIDE_EXAMPLES, type GuideExample } from '../lib/finance/guide-examples';

/**
 * Curated official references. A link here establishes provenance for the
 * stated rule, not a live-rate feed. Recheck time-sensitive values before
 * adding them to calculators or claiming they are current.
 */
export const officialSources = {
  tax: {
    name: 'Income Tax Department: salaried individuals and tax regimes',
    publisher: 'Income Tax Department',
    url: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
  },
  hra: {
    name: 'Income Tax Department: old and new tax regime FAQs',
    publisher: 'Income Tax Department',
    url: 'https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs',
  },
  homeLoan: {
    name: 'RBI: home-loan consumer guidance',
    publisher: 'Reserve Bank of India',
    url: 'https://www.rbi.org.in/commonman/english/scripts/FAQs.aspx?Id=701',
  },
  loanKfs: {
    name: 'RBI: floating-rate loans, APR and Key Facts Statement FAQs',
    publisher: 'Reserve Bank of India',
    url: 'https://www.rbi.org.in/commonman/english/scripts/FAQs.aspx?Id=3687',
  },
  sip: {
    name: 'SEBI Investor: SIP illustration and return limitations',
    publisher: 'Securities and Exchange Board of India',
    url: 'https://investor.sebi.gov.in/calculators/sip_calculator.html',
  },
  epf: {
    name: 'EPFO: member contribution FAQs',
    publisher: 'Employees’ Provident Fund Organisation',
    url: 'https://www.epfindia.gov.in/site_en/FAQ.php',
  },
  ppf: {
    name: 'National Savings Institute: PPF account information',
    publisher: 'National Savings Institute',
    url: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=55',
  },
  savingsRates: {
    name: 'National Savings Institute: notified small-savings rates',
    publisher: 'National Savings Institute',
    url: 'https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=132',
  },
  cards: {
    name: 'RBI: credit and debit card Master Direction FAQs',
    publisher: 'Reserve Bank of India',
    url: 'https://www.rbi.org.in/commonman/English/scripts/FAQs.aspx?Id=3580',
  },
  gst: {
    name: 'GST portal: search HSN/SAC tax rates',
    publisher: 'Goods and Services Tax Network',
    url: 'https://tutorial.gst.gov.in/userguide/taxpayersdashboard/Search_HSN_SAC_Tax_Rates.htm',
  },
  gratuity: {
    name: 'Ministry of Labour: gratuity and labour codes FAQs',
    publisher: 'Ministry of Labour and Employment',
    url: 'https://www.labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf',
  },
  property: {
    name: 'West Bengal Registration: stamp duty and fee calculator (state example)',
    publisher: 'Directorate of Registration and Stamp Revenue, West Bengal',
    url: 'https://wbregistration.gov.in/SD_RF_Calculator.aspx',
  },
} as const;

export type OfficialSourceId = keyof typeof officialSources;
export type MoneyGuide = {
  slug: string;
  priority: 'P0' | 'P1';
  title: string;
  description: string;
  directAnswer: string;
  decision: string;
  formula: string;
  steps: [string, string, string];
  questions: { question: string; answer: string }[];
  fact: { text: string; sourceId: OfficialSourceId };
  sourceIds: OfficialSourceId[];
  toolSlugs: string[];
  relatedSlugs: string[];
  caveat: string;
  lastReviewedIso: string;
  example: GuideExample;
};

type GuideInput = Omit<MoneyGuide, 'example' | 'lastReviewedIso'>;
const guideInputs: GuideInput[] = [
  {
    slug: 'home-loan-prepayment',
    priority: 'P0',
    title: 'Home loan EMI, affordability and prepayment',
    description: 'Compare loan terms, interest and cash needs before choosing a home loan or making a prepayment.',
    directAnswer: 'For the same loan and rate, a longer term usually lowers EMI while increasing total interest. A prepayment saves future interest; the size of the saving depends on when it is made and whether the lender reduces EMI or tenure. Compare all fees and the Key Facts Statement before deciding.',
    decision: 'Should you borrow less, choose a shorter term, reduce EMI, shorten tenure or keep cash available?',
    formula: 'Monthly reducing-balance EMI = P × r ÷ [1 − (1 + r)^(-n)], where r is the monthly rate and n is the number of payments.',
    steps: [
      'Set the property budget using down payment, transaction costs, emergency cash and a comfortable EMI.',
      'Compare offers on rate type, APR, charges and total repayment across several terms.',
      'For a lump sum, model prepayment timing and compare lower EMI, shorter tenure and alternative uses of the cash.',
    ],
    questions: [
      { question: 'Does a lower EMI mean a cheaper loan?', answer: 'No. A longer repayment term often lowers EMI while raising total interest. Compare total cost at the same assumed interest rate.' },
      { question: 'Should I reduce EMI or tenure after prepaying?', answer: 'Shorter tenure usually saves more interest under unchanged terms; lower EMI improves monthly cash flow. Run both paths using the lender’s actual terms.' },
    ],
    fact: { text: 'RBI consumer guidance recommends checking APR and charges when comparing home loans.', sourceId: 'homeLoan' },
    sourceIds: ['homeLoan', 'loanKfs'],
    toolSlugs: ['home-loan-emi-calculator-india', 'home-affordability-calculator-india', 'reduce-emi-vs-tenure-calculator-india', 'invest-vs-prepay-home-loan-calculator-india', 'loan-foreclosure-net-savings-calculator-india'],
    relatedSlugs: ['personal-loan-apr'],
    caveat: 'The table holds the rate fixed for the entire term. Floating rates, insurance, lender fees and prepayment conditions change the actual outcome.',
  },
  {
    slug: 'personal-loan-apr',
    priority: 'P0',
    title: 'Personal loan EMI, true cost and KFS',
    description: 'Understand the difference between an advertised rate, actual cash received, monthly EMI and annualised cost.',
    directAnswer: 'A processing fee withheld from a personal loan can make its effective annual cost higher than the quoted interest rate. Compare the lender’s KFS APR, amount disbursed, repayment schedule, insurance and all disclosed charges, using the same loan amount and term.',
    decision: 'Which offer costs less for the cash you actually receive, and can your income safely support the EMI?',
    formula: 'Effective annual cash-flow cost = (1 + monthly IRR)^12 − 1, where IRR equates net cash received to the present value of EMIs.',
    steps: [
      'Request the lender’s KFS and check disbursal, term, instalments, APR and every upfront or ongoing charge.',
      'Model EMI and fees using the same amount and dates for each offer.',
      'Check income after essential costs and existing EMIs before accepting a lower-EMI, longer-term offer.',
    ],
    questions: [
      { question: 'Is the advertised interest rate the same as APR?', answer: 'Not necessarily. APR reflects specified borrowing costs in addition to the interest rate; use the lender’s KFS for the binding disclosure.' },
      { question: 'What if the processing fee is paid separately?', answer: 'Change the cash-flow timing accordingly. The example assumes a fee withheld at disbursement, so it cannot be copied to every lender offer.' },
    ],
    fact: { text: 'RBI guidance says the applicable annualised interest rate or APR is to be disclosed in the Key Facts Statement.', sourceId: 'loanKfs' },
    sourceIds: ['loanKfs', 'homeLoan'],
    toolSlugs: ['personal-loan-emi-calculator-india', 'personal-loan-true-apr-calculator-india', 'personal-loan-eligibility-calculator-india', 'loan-foreclosure-net-savings-calculator-india'],
    relatedSlugs: ['home-loan-prepayment'],
    caveat: 'The illustrative APR treats fee tax as an upfront cash cost; the lender’s regulatory APR and actual fee treatment may differ. Do not treat the example rate as a quote.',
  },
];

export const moneyGuides: MoneyGuide[] = guideInputs.map((guide) => ({
  ...guide,
  lastReviewedIso: '2026-09-23',
  example: GUIDE_EXAMPLES[guide.slug],
}));

const guideBySlug = new Map(moneyGuides.map((guide) => [guide.slug, guide]));
export function getMoneyGuide(slug: string): MoneyGuide | undefined {
  return guideBySlug.get(slug);
}
export function getMoneyGuidesForTool(slug: string): MoneyGuide[] {
  return moneyGuides.filter((guide) => guide.toolSlugs.includes(slug));
}
