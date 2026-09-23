import { annualisedCostFromDisbursement, reducingBalanceEmi } from '../lib/finance/guide-examples';

/** Published terms are dated evidence. Every calculated outcome below uses an explicitly hypothetical borrower. */
export type ComparisonRow = { option: string; inputs: string; result: string };
export type SourceBackedComparison = {
  title: string;
  question: string;
  basis: string;
  rows: ComparisonRow[];
  takeaway: string;
  limitations: string;
  sources: { name: string; url: string; detail: string }[];
  checkedIso: string;
};

const money = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const principal = 500_000;
const term = 24;
const emi = reducingBalanceEmi(principal, 12, term);
const annualCost = (fee: number) =>
  `${annualisedCostFromDisbursement(principal - fee * 1.18, emi, term).toFixed(2)}%`;

const loan = 5_000_000;
const annualRate = 9;
const months = 240;
const initialEmi = reducingBalanceEmi(loan, annualRate, months);
const monthlyRate = annualRate / 1200;
const balanceAfterYear = loan * (1 + monthlyRate) ** 12
  - initialEmi * ((1 + monthlyRate) ** 12 - 1) / monthlyRate;
const remaining = balanceAfterYear - 100_000;
const reducedEmi = reducingBalanceEmi(remaining, annualRate, months - 12);
function interestRemaining(balance: number, payment: number): { interest: number; payments: number } {
  let interest = 0;
  let count = 0;
  while (balance > 0.005 && count < 240) {
    const monthlyInterest = balance * monthlyRate;
    interest += monthlyInterest;
    balance = Math.max(0, balance + monthlyInterest - payment);
    count += 1;
  }
  return { interest, payments: count };
}
const noPrepay = interestRemaining(balanceAfterYear, initialEmi);
const lowerEmi = interestRemaining(remaining, reducedEmi);
const shorterTerm = interestRemaining(remaining, initialEmi);

// Two transparent CTC constructions, with the EPFO's usual 12% contribution rate as a real rule input.
const monthlyCtc = 1_200_000 / 12;
const salaryCase = (basicShare: number) => {
  const contribution = monthlyCtc * basicShare * 0.12;
  return { contribution, gross: monthlyCtc - contribution, beforeTax: monthlyCtc - 2 * contribution };
};
const salary30 = salaryCase(0.30);
const salary50 = salaryCase(0.50);

export const sourceBackedComparisons: Record<string, SourceBackedComparison> = {
  'personal-loan-apr': {
    title: 'Published personal-loan fees, modelled on the same cash flows',
    question: 'How much does the disclosed upfront fee alone change the annualised cost?',
    basis: `${money(principal)} sanctioned, 24 month-end EMIs, an assumed 12% reducing rate for both cases, fee withheld upfront and illustrative 18% tax on the fee. The 12% rate is not an offer from either bank.`,
    rows: [
      { option: 'SBI published Xpress Credit fee cap', inputs: `Up to 1.50%; model at ${money(7_500)} plus tax = ${money(8_850)}`, result: `Net cash ${money(principal - 8_850)}; cash-flow cost ${annualCost(7_500)}` },
      { option: 'HDFC Bank published maximum fee', inputs: `Up to ${money(6_500)}; maximum with modelled tax ${money(7_670)}`, result: `Net cash ${money(principal - 7_670)}; cost at that fee ${annualCost(6_500)}` },
    ],
    takeaway: `At the same hypothetical 12% rate, the modelled fee difference is ${money(1_180)} upfront. A lower fee does not establish which bank would quote a lower APR to a particular borrower.`,
    limitations: 'SBI may waive or discount its fee for eligible borrowers; HDFC publishes an upper bound, not a universal fee. Rates, stamp duty, compulsory charges, GST treatment and payment dates vary. These calculated cash-flow yields are not lender KFS APRs or comparable live offers. Ask both lenders for your own KFS.',
    checkedIso: '2026-09-23',
    sources: [
      { name: 'SBI Personal Loan', url: 'https://sbi.bank.in/web/personal-banking/loans/personal-loans/sbi-personal-loan', detail: 'Xpress Credit fee up to 1.50%, minimum ₹1,000 and maximum ₹15,000, plus GST; concessions listed.' },
      { name: 'HDFC Bank personal-loan interest rates and charges', url: 'https://www.hdfc.bank.in/personal-loan/interest-rates-and-charges', detail: 'Processing fee up to ₹6,500 plus GST; Q1 FY 2026–27 published APR distribution is separate from this model.' },
      { name: 'SBI personal-loan rates', url: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/personal-loans-schemes', detail: 'Published 10%–15% effective interest-rate range from 30 June 2026; individual pricing varies.' },
    ],
  },
  'home-loan-prepayment': {
    title: 'One home loan: reduce the EMI or shorten the term?',
    question: 'What does a ₹1 lakh prepayment after 12 EMIs change?',
    basis: `${money(loan)} loan over 20 years at a fixed illustrative 9% reducing rate; original EMI ${money(initialEmi)}. Prepay ${money(100_000)} immediately after the twelfth EMI. No fees or rate resets.`,
    rows: [
      { option: 'No prepayment', inputs: `Keep ${money(initialEmi)} EMI`, result: `Remaining interest ${money(noPrepay.interest)} over ${noPrepay.payments} payments` },
      { option: 'Reduce EMI', inputs: `New EMI ${money(reducedEmi)} for 228 payments`, result: `Remaining interest ${money(lowerEmi.interest)}; save ${money(noPrepay.interest - lowerEmi.interest)}` },
      { option: 'Shorten term', inputs: `Keep ${money(initialEmi)} EMI; smaller final payment`, result: `Remaining interest ${money(shorterTerm.interest)} over ${shorterTerm.payments} payments; save ${money(noPrepay.interest - shorterTerm.interest)}` },
    ],
    takeaway: 'Keeping the original EMI saves more interest in this fixed-rate illustration; reducing EMI releases cash each month. Both paths use the same ₹1 lakh prepayment.',
    limitations: 'The 9% rate is a scenario, not SBI’s quoted rate. SBI published a 7.25% starting home-loan rate effective 1 April 2026, subject to conditions; the borrower’s actual rate and reset schedule can differ. Ask the lender how it applies a prepayment and check your agreement, KFS and applicable charges.',
    checkedIso: '2026-09-23',
    sources: [
      { name: 'SBI home-loan card rates', url: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/home-loans-interest-rates-current', detail: 'Published starting rate 7.25% from 1 April 2026; subject to terms and borrower-specific pricing.' },
      { name: 'RBI home-loan consumer guidance', url: 'https://www.rbi.org.in/commonman/english/scripts/FAQs.aspx?Id=701', detail: 'Check loan type, all fees and prepayment terms before comparing.' },
    ],
  },
  'salary-income-tax': {
    title: 'Same CTC, different basic-pay shares',
    question: 'Why can two ₹12 lakh CTC offers show different monthly cash pay?',
    basis: 'Two invented salary structures at ₹12 lakh annual CTC. Basic wage is modelled as 30% or 50% of monthly CTC; employee and employer PF each equal 12% of that modelled wage; employer PF is included in CTC. No wage ceiling, EPS adjustment, other benefits, TDS or professional tax is modelled.',
    rows: [
      { option: '30% modelled basic share', inputs: `Employee and employer PF ${money(salary30.contribution)} each per month`, result: `Gross ${money(salary30.gross)}; cash before tax ${money(salary30.beforeTax)}` },
      { option: '50% modelled basic share', inputs: `Employee and employer PF ${money(salary50.contribution)} each per month`, result: `Gross ${money(salary50.gross)}; cash before tax ${money(salary50.beforeTax)}` },
    ],
    takeaway: `The first scenario shows ${money(salary30.beforeTax - salary50.beforeTax)} more monthly cash before tax and ${money(salary50.contribution - salary30.contribution)} less employee PF contribution. This is a trade-off in these assumed structures, not a comparison of actual job offers.`,
    limitations: 'The EPFO 12% rate is a general rule with exceptions and a wage ceiling; whether contributions use higher wages, how EPS is allocated and what CTC includes depend on actual payroll terms. Net pay requires FY-specific income tax, state professional tax and all other deductions. Obtain both offer breakups and a real payslip before making a decision.',
    checkedIso: '2026-09-23',
    sources: [
      { name: 'EPFO contribution rates', url: 'https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/ContributionRate.pdf', detail: 'Typical 12% employee/employer contribution, with exceptions and wage-ceiling guidance.' },
      { name: 'Income Tax Department: salaried individuals', url: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1', detail: 'Check the applicable year and regime for actual salary tax treatment.' },
    ],
  },
};

const toolToComparison: Record<string, string> = {
  'personal-loan-true-apr-calculator-india': 'personal-loan-apr',
  'personal-loan-emi-calculator-india': 'personal-loan-apr',
  'home-loan-emi-calculator-india': 'home-loan-prepayment',
  'reduce-emi-vs-tenure-calculator-india': 'home-loan-prepayment',
  'salary-in-hand-calculator-india': 'salary-income-tax',
};

export function getSourceBackedComparison(slug: string): SourceBackedComparison | undefined {
  return sourceBackedComparisons[toolToComparison[slug] ?? slug];
}
