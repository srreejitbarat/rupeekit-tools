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
    slug: 'salary-income-tax',
    priority: 'P0',
    title: 'Salary, take-home pay and income tax in India',
    description: 'Trace CTC into gross and in-hand pay, check deductions, and compare tax regimes using your own salary structure.',
    directAnswer: 'Your in-hand salary starts with monthly gross cash pay, then subtracts employee PF, tax withheld and other payroll deductions. CTC can also include employer-side costs that never reach your bank account. For a tax-regime comparison, use the applicable assessment year and only deductions for which you are eligible.',
    decision: 'Which offer puts more money in your bank account each month, and how does that change your tax position?',
    formula: 'Illustrative in-hand = monthly gross cash pay − employee PF − TDS − professional tax − other deductions.',
    steps: [
      'Get the salary breakup and separate fixed cash gross from employer PF, gratuity provision, bonus and benefits.',
      'Enter the correct assessment year, eligible deductions and regime in the income-tax calculator; verify the resulting TDS with payroll.',
      'Compare monthly in-hand and annual benefits for two offers, then check any state-specific professional tax.',
    ],
    questions: [
      { question: 'Is CTC divided by 12 my in-hand salary?', answer: 'Usually no. CTC can include employer benefits or contributions, while the payslip deducts employee contributions and tax from gross cash pay.' },
      { question: 'Can I claim HRA in the new tax regime?', answer: 'The Income Tax Department says the HRA exemption applies under the old regime; check the correct assessment year and eligibility before claiming it.' },
    ],
    fact: { text: 'The Income Tax Department’s old-versus-new guidance distinguishes HRA availability by regime.', sourceId: 'hra' },
    sourceIds: ['tax', 'hra', 'epf'],
    toolSlugs: ['salary-in-hand-calculator-india', 'income-tax-calculator-old-vs-new-regime-india', 'hra-exemption-calculator-india', 'job-offer-comparison-calculator-india', 'bonus-tax-calculator-india'],
    relatedSlugs: ['epf-salary-retirement', 'gratuity-labour'],
    caveat: 'The worked payslip uses an assumed TDS amount; it does not calculate tax liability. Income-tax rules and payroll policies change by assessment year and employer.',
  },
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
    relatedSlugs: ['personal-loan-apr', 'rent-property-housing'],
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
    relatedSlugs: ['credit-card-debt', 'home-loan-prepayment'],
    caveat: 'The illustrative APR treats fee tax as an upfront cash cost; the lender’s regulatory APR and actual fee treatment may differ. Do not treat the example rate as a quote.',
  },
  {
    slug: 'sip-investment-returns',
    priority: 'P0',
    title: 'SIP goals, return assumptions and investment costs',
    description: 'Test monthly investing against several outcomes, inflation and time rather than relying on one projected return.',
    directAnswer: 'A SIP projection multiplies monthly contributions through an assumed return path; it cannot predict what a mutual fund will earn. Start with your goal and time horizon, compare conservative scenarios, then check inflation, investment costs and risks.',
    decision: 'How much could you contribute comfortably, and how would a weaker return or later start affect the goal?',
    formula: 'End-of-month projection: balance(next month) = balance(now) × (1 + assumed annual rate ÷ 12) + monthly SIP.',
    steps: [
      'Set a goal amount, target date and monthly investment you can sustain.',
      'Compare several assumed returns and calculate how much of the end value is your own contribution.',
      'Stress-test an unfavourable return, a delay or a pause; check fund risk and expenses separately.',
    ],
    questions: [
      { question: 'Are SIP calculator returns guaranteed?', answer: 'No. SEBI labels SIP calculator outputs as illustrations and says market returns cannot be predicted as a fixed rate.' },
      { question: 'Does a higher assumed return mean I can invest less?', answer: 'The model says so, but a higher assumption also raises the risk of missing the goal. Test lower scenarios and review the plan over time.' },
    ],
    fact: { text: 'SEBI’s own SIP calculator says its outputs are illustrations and do not represent actual returns.', sourceId: 'sip' },
    sourceIds: ['sip'],
    toolSlugs: ['sip-calculator-india', 'step-up-sip-calculator-india', 'xirr-portfolio-return-calculator-india', 'index-fund-vs-active-fund-cost-calculator-india'],
    relatedSlugs: ['ppf-small-savings', 'home-loan-prepayment'],
    caveat: 'The worked example assumes the same return each month and excludes tax, inflation, expenses and changes in NAV. It is a mathematical scenario.',
  },
  {
    slug: 'epf-salary-retirement',
    priority: 'P0',
    title: 'EPF, payslip contributions and retirement planning',
    description: 'Separate payroll PF deductions, employer allocation, credited interest and retirement balances.',
    directAnswer: 'Your EPF balance is not simply employee PF plus an equal employer amount times the number of months. Verify the employer’s EPF/EPS split and actual credits in your EPFO passbook, then use the rate notified for the relevant period when projecting interest.',
    decision: 'How much goes into your PF account, how much goes to pension, and what balance is available for retirement?',
    formula: 'Contribution-only total = sum of employee credits + actual employer EPF credits; interest must follow the applicable EPFO crediting rules.',
    steps: [
      'Read basic or eligible wages and PF deductions on the payslip.',
      'Match employee, employer EPF and EPS entries to the EPFO passbook for the same months.',
      'Project future deposits using explicit wage growth and rate assumptions; separate NPS and gratuity benefits.',
    ],
    questions: [
      { question: 'Does the full employer PF deduction go into my EPF balance?', answer: 'Not in every case. Check the employer EPF and EPS entries in your passbook rather than doubling the employee entry.' },
      { question: 'Should I use one EPF rate for the next 20 years?', answer: 'That is only a scenario. Verify the notified rate for each relevant period and show sensitivity to lower rates.' },
    ],
    fact: { text: 'EPFO publishes member guidance on contribution rules and the statutory contribution structure.', sourceId: 'epf' },
    sourceIds: ['epf'],
    toolSlugs: ['epf-corpus-calculator-india', 'epf-taxable-interest-rule-9d-calculator-india', 'salary-in-hand-calculator-india', 'nps-calculator-india', 'retirement-calculator-india'],
    relatedSlugs: ['salary-income-tax', 'gratuity-labour', 'ppf-small-savings'],
    caveat: 'The worked example deliberately excludes employer allocation and interest. Eligibility, wage ceiling, exemptions and rates can vary.',
  },
  {
    slug: 'ppf-small-savings',
    priority: 'P1',
    title: 'PPF and government small-savings decisions',
    description: 'Compare PPF, SCSS and post-office saving goals using official scheme terms and dated rates.',
    directAnswer: 'A PPF maturity figure depends on how much you deposit, when you deposit and the rate notified for each period. Government small-savings products have different eligibility, payout and liquidity rules; compare these before comparing projected maturity values.',
    decision: 'Do you need liquidity, regular income or a longer-term savings account, and which scheme fits that need?',
    formula: 'Total deposits = sum of deposits actually made; maturity adds interest credited under each scheme’s notified rate and timing rules.',
    steps: [
      'Check eligibility, account tenure and withdrawal needs for each scheme on the National Savings Institute website.',
      'Check the current notified rate table and its effective period before running the calculator.',
      'Compare deposit limits, cash-flow timing and tax treatment using the actual scheme, not an assumed universal rate.',
    ],
    questions: [
      { question: 'Does the PPF rate stay constant for 15 years?', answer: 'Do not assume that. Check the notified small-savings rate table for the relevant period and model possible rate changes.' },
      { question: 'Is an SCSS interest payout the same as PPF compounding?', answer: 'No. Their cash-flow and eligibility rules differ; compare the products using the scheme documents.' },
    ],
    fact: { text: 'The National Savings Institute describes PPF as a 15-financial-year account and publishes scheme details and rate notices.', sourceId: 'ppf' },
    sourceIds: ['ppf', 'savingsRates'],
    toolSlugs: ['ppf-calculator-india', 'scss-calculator-india', 'post-office-monthly-income-scheme-calculator-india', 'sukanya-samriddhi-yojana-calculator-india', 'fd-calculator-india'],
    relatedSlugs: ['sip-investment-returns', 'epf-salary-retirement'],
    caveat: 'The worked table totals deposits only. Rates, limits and taxes may change; the linked official rate table should be checked before a financial decision.',
  },
  {
    slug: 'credit-card-debt',
    priority: 'P1',
    title: 'Credit card minimum due and debt repayment',
    description: 'See how interest can consume a small payment and compare a card repayment plan with a loan.',
    directAnswer: 'Paying only the minimum due can avoid some immediate consequences but can leave most of the balance outstanding. If the full amount due is not cleared, the interest-free period can be lost under the card’s terms; check the issuer’s statement and repayment schedule.',
    decision: 'How fast can you clear the balance, and would a lower-cost refinancing offer reduce total cost after fees?',
    formula: 'Simplified next balance = opening balance + assumed interest + fees and tax − payment, excluding new spending.',
    steps: [
      'Find the total amount due, interest rate, due date, fees and minimum due on the card statement.',
      'Compare fixed payments above the minimum and stop new spending while testing the payoff path.',
      'If considering a personal loan, compare the loan KFS APR, total repayments and any conversion fees.',
    ],
    questions: [
      { question: 'Is paying minimum due enough to avoid interest?', answer: 'No. RBI’s FAQs say the interest-free period is lost if the total amount due is not paid by the due date.' },
      { question: 'Will a personal loan always be cheaper than revolving card debt?', answer: 'Not always. Compare the full cash flows including loan fees, rate, term and prepayment conditions.' },
    ],
    fact: { text: 'RBI’s card FAQs explain the loss of the interest-free credit period when the full amount due is not cleared.', sourceId: 'cards' },
    sourceIds: ['cards', 'loanKfs'],
    toolSlugs: ['credit-card-minimum-due-trap-calculator-india', 'credit-card-vs-personal-loan-calculator-india', 'debt-snowball-calculator-india', 'personal-loan-true-apr-calculator-india'],
    relatedSlugs: ['personal-loan-apr', 'salary-income-tax'],
    caveat: 'The one-month example uses an assumed monthly rate and simplified interest. Card issuers may use daily calculations, tax, fees and different payment allocation.',
  },
  {
    slug: 'gst-invoice',
    priority: 'P1',
    title: 'GST on an Indian invoice: inclusive and exclusive prices',
    description: 'Calculate tax from an invoice price while keeping classification and applicable GST rates tied to the official portal.',
    directAnswer: 'If the price excludes GST, multiply it by the applicable rate and add the tax. If the price includes GST, divide by one plus the rate to find the taxable base. The applicable rate depends on HSN/SAC classification and rules, so check the GST portal before invoicing.',
    decision: 'Is the quoted price before or after GST, and which rate applies to this supply?',
    formula: 'Exclusive total = base × (1 + rate); inclusive base = total ÷ (1 + rate).',
    steps: [
      'Identify the product or service and confirm the HSN/SAC classification and current rate on the GST portal.',
      'State clearly whether your quote is GST-inclusive or GST-exclusive.',
      'Calculate base, tax and final price; check place-of-supply and invoice requirements separately.',
    ],
    questions: [
      { question: 'Can I use 18% for every invoice?', answer: 'No. The worked example assumes 18% solely to show the calculation; verify the actual HSN/SAC classification and rate.' },
      { question: 'Why is GST included in ₹10,000 not ₹1,800?', answer: 'When ₹10,000 already includes GST, the taxable base is ₹10,000 ÷ 1.18 in an 18% illustration. Multiplying the inclusive amount by 18% counts tax twice.' },
    ],
    fact: { text: 'The GST portal provides an HSN/SAC search for the tax rate applicable to particular goods and services.', sourceId: 'gst' },
    sourceIds: ['gst'],
    toolSlugs: ['gst-calculator-india'],
    relatedSlugs: ['salary-income-tax'],
    caveat: 'The 18% used in the example is hypothetical for arithmetic; it is not a claim about the rate for a specific supply.',
  },
  {
    slug: 'gratuity-labour',
    priority: 'P1',
    title: 'Gratuity and labour rules: eligibility and calculation',
    description: 'Estimate gratuity with a transparent wage and service assumption while checking current labour-code exceptions.',
    directAnswer: 'A common gratuity illustration for monthly-paid employees uses last drawn eligible wages × 15 ÷ 26 × eligible years. Actual entitlement depends on the current labour rules, wage definition, service and employee category, including exceptions for death, disablement and fixed-term work.',
    decision: 'Which wage definition and service period apply to your employment, and is an exception relevant?',
    formula: 'Illustrative gratuity = last drawn eligible monthly wages × 15 ÷ 26 × eligible years of service.',
    steps: [
      'Check whether the labour-code provisions and establishment rules apply to your employment.',
      'Confirm eligible wages, dates of continuous service and any exception with employer records.',
      'Calculate a scenario and compare it with the applicable notified cap or better contractual terms.',
    ],
    questions: [
      { question: 'Is five years always required for gratuity?', answer: 'No. Ministry of Labour guidance lists exceptions, including death, disablement and expiration of fixed-term employment.' },
      { question: 'Can I multiply my full CTC by 15/26?', answer: 'No. The calculation uses eligible last drawn wages under the applicable rules, not the entire CTC.' },
    ],
    fact: { text: 'Ministry of Labour FAQs describe 15 days’ wages for each completed eligible year, special cases and a notified maximum.', sourceId: 'gratuity' },
    sourceIds: ['gratuity'],
    toolSlugs: ['gratuity-calculator-india', 'gratuity-2026-old-vs-new-calculator-india', 'gratuity-under-new-wage-code-calculator-india', 'new-labour-code-take-home-calculator-india'],
    relatedSlugs: ['salary-income-tax', 'epf-salary-retirement'],
    caveat: 'The ₹40,000 wage and six-year example is an illustration, not an eligibility decision. The applicable notified rules and service evidence control the result.',
  },
  {
    slug: 'rent-property-housing',
    priority: 'P1',
    title: 'Rent, buying a home and property transaction costs',
    description: 'Compare rent with purchase cash needs, EMI, recurring ownership costs and local registration charges.',
    directAnswer: 'Buying requires more than the down payment: add state-specific stamp duty, registration, lender charges and an emergency buffer before comparing EMI with rent. A rent-versus-buy decision also depends on maintenance, moving plans and what your deposit could earn elsewhere.',
    decision: 'How long will you live there, how much cash must stay liquid, and what are the full ownership costs?',
    formula: 'Initial purchase cash = down payment + applicable registration and stamp charges + other one-time costs.',
    steps: [
      'Record current rent, expected time in the home and cash you cannot afford to lock away.',
      'Get a real purchase price, loan KFS and a charge estimate from your state registration department.',
      'Compare total cash flows including EMI, maintenance, tax, insurance and eventual selling costs.',
    ],
    questions: [
      { question: 'Can I compare monthly rent directly with EMI?', answer: 'No. EMI partly repays principal, while buying also needs upfront cash and ongoing ownership costs; both paths have different investment and liquidity effects.' },
      { question: 'Is one stamp-duty rate valid across India?', answer: 'No. Rates and applicable fees depend on state and transaction. The linked West Bengal calculator is one official state example.' },
    ],
    fact: { text: 'West Bengal’s registration department publishes a transaction-specific stamp-duty and registration-fee calculator.', sourceId: 'property' },
    sourceIds: ['property', 'homeLoan'],
    toolSlugs: ['rent-vs-buy-calculator-india', 'home-affordability-calculator-india', 'rent-agreement-stamp-duty-registration-cost-calculator-india', 'rental-yield-calculator-india', 'home-loan-emi-calculator-india'],
    relatedSlugs: ['home-loan-prepayment', 'salary-income-tax'],
    caveat: 'The ₹3 lakh purchase charge in the example is a scenario input, not an official duty calculation. Use the registration authority for your state and transaction.',
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
