/**
 * Reproducible illustrations for the decision guides. All rates below are
 * scenario inputs supplied by RupeeKit, never quotes, notified rates, or
 * predictions. Keep the displayed assumptions beside every output.
 */
export type ExampleRow = { label: string; value: string };
export type GuideExample = {
  title: string;
  inputs: ExampleRow[];
  results: ExampleRow[];
  explanation: string;
  chart?: { title: string; bars: { label: string; value: number; display: string }[] };
};

const rupees = (amount: number) =>
  '₹' + Math.round(amount).toLocaleString('en-IN');

export function reducingBalanceEmi(
  principal: number,
  annualPercent: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0 || annualPercent < 0) throw new RangeError('Invalid loan inputs');
  const rate = annualPercent / 1200;
  if (rate === 0) return principal / months;
  return (principal * rate) / (1 - Math.pow(1 + rate, -months));
}

export function annualisedCostFromDisbursement(
  disbursement: number,
  monthlyPayment: number,
  months: number,
): number {
  if (disbursement <= 0 || monthlyPayment <= 0 || months <= 0 ||
      monthlyPayment * months <= disbursement) throw new RangeError('Invalid cash flows');
  const presentValue = (monthlyRate: number) =>
    monthlyPayment * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 100; i += 1) {
    const mid = (low + high) / 2;
    if (presentValue(mid) > disbursement) low = mid;
    else high = mid;
  }
  // Effective annual yield, including the initial fees subtracted from cash received.
  return (Math.pow(1 + (low + high) / 2, 12) - 1) * 100;
}

export function sipFutureValue(payment: number, annualPercent: number, months: number): number {
  if (payment < 0 || months < 0 || annualPercent < 0) throw new RangeError('Invalid SIP inputs');
  let balance = 0;
  for (let month = 0; month < months; month += 1) {
    balance = balance * (1 + annualPercent / 1200) + payment;
  }
  return balance; // End-of-month contributions; nominal annual rate / 12.
}

const emi20 = reducingBalanceEmi(5_000_000, 9, 240);
const emi15 = reducingBalanceEmi(5_000_000, 9, 180);
const emi25 = reducingBalanceEmi(5_000_000, 9, 300);
const personalEmi = reducingBalanceEmi(500_000, 12, 24);
const feeWithTax = 500_000 * 0.02 * 1.18;
const netDisbursement = 500_000 - feeWithTax;
const gratuity = 40_000 * 15 / 26 * 6;
const gstBaseFromInclusive = 10_000 / 1.18;

export const GUIDE_EXAMPLES: Record<string, GuideExample> = {
  'salary-income-tax': {
    title: 'Illustrative payslip: gross pay versus money received',
    inputs: [
      { label: 'Annual fixed gross pay', value: rupees(1_200_000) },
      { label: 'Employee PF (assumed monthly)', value: rupees(1_800) },
      { label: 'TDS (assumed monthly, not calculated here)', value: rupees(6_000) },
      { label: 'Professional tax (assumed monthly)', value: rupees(200) },
    ],
    results: [
      { label: 'Monthly gross', value: rupees(1_200_000 / 12) },
      { label: 'Illustrative in-hand', value: rupees(1_200_000 / 12 - 1_800 - 6_000 - 200) },
    ],
    explanation: 'This is payslip arithmetic, not an income-tax assessment. Employer PF, bonus, insurance and other CTC items may change the starting gross; actual TDS and professional tax depend on your situation.',
    chart: { title: 'Illustrative monthly gross and in-hand pay', bars: [
      { label: 'Gross cash pay', value: 100_000, display: rupees(100_000) },
      { label: 'In-hand pay', value: 92_000, display: rupees(92_000) },
    ] },
  },
  'home-loan-prepayment': {
    title: 'The same home loan over three repayment terms',
    inputs: [
      { label: 'Principal', value: rupees(5_000_000) },
      { label: 'Illustrative fixed annual rate', value: '9% (not a lender quote)' },
      { label: 'Method', value: 'Monthly reducing balance, equal payments, no fees or prepayment' },
    ],
    results: [
      { label: '15 years: EMI / total interest', value: `${rupees(emi15)} / ${rupees(emi15 * 180 - 5_000_000)}` },
      { label: '20 years: EMI / total interest', value: `${rupees(emi20)} / ${rupees(emi20 * 240 - 5_000_000)}` },
      { label: '25 years: EMI / total interest', value: `${rupees(emi25)} / ${rupees(emi25 * 300 - 5_000_000)}` },
    ],
    explanation: 'A longer term lowers the monthly instalment but raises total interest under these assumptions. The calculator can model a real offer, fees and the choice between reducing EMI or tenure after prepayment.',
    chart: { title: 'Total interest at the assumed 9% fixed rate', bars: [
      { label: '15 years', value: emi15 * 180 - 5_000_000, display: rupees(emi15 * 180 - 5_000_000) },
      { label: '20 years', value: emi20 * 240 - 5_000_000, display: rupees(emi20 * 240 - 5_000_000) },
      { label: '25 years', value: emi25 * 300 - 5_000_000, display: rupees(emi25 * 300 - 5_000_000) },
    ] },
  },
  'personal-loan-apr': {
    title: 'How fees change the cost of a personal loan',
    inputs: [
      { label: 'Loan amount / term', value: `${rupees(500_000)} / 24 months` },
      { label: 'Illustrative reducing rate', value: '12% per year (not a lender quote)' },
      { label: 'Assumed upfront fee', value: '2% of principal + 18% tax on that fee' },
    ],
    results: [
      { label: 'Monthly EMI', value: rupees(personalEmi) },
      { label: 'Fee including assumed tax', value: rupees(feeWithTax) },
      { label: 'Cash received if fee is withheld', value: rupees(netDisbursement) },
      { label: 'Illustrative effective annual cash-flow cost', value: annualisedCostFromDisbursement(netDisbursement, personalEmi, 24).toFixed(2) + '%' },
    ],
    explanation: 'Cash-flow cost treats the fee as withheld at disbursement and 24 equal month-end payments. Actual KFS APR may differ if tax treatment, dates, compulsory insurance or other charges differ. Compare the lender-provided KFS.',
    chart: { title: 'Advertised rate versus illustrative effective annual cost', bars: [
      { label: 'Quoted reducing rate', value: 12, display: '12%' },
      { label: 'Cash-flow cost with assumed fee', value: annualisedCostFromDisbursement(netDisbursement, personalEmi, 24), display: annualisedCostFromDisbursement(netDisbursement, personalEmi, 24).toFixed(2) + '%' },
    ] },
  },
  'sip-investment-returns': {
    title: 'One SIP amount, three assumed returns',
    inputs: [
      { label: 'Monthly SIP / period', value: `${rupees(10_000)} / 10 years` },
      { label: 'Contribution timing', value: 'End of each month' },
      { label: 'Compounding model', value: 'Illustrative nominal annual return divided by 12' },
    ],
    results: [
      { label: 'Amount invested', value: rupees(10_000 * 120) },
      { label: '8% scenario: estimated corpus', value: rupees(sipFutureValue(10_000, 8, 120)) },
      { label: '10% scenario: estimated corpus', value: rupees(sipFutureValue(10_000, 10, 120)) },
      { label: '12% scenario: estimated corpus', value: rupees(sipFutureValue(10_000, 12, 120)) },
    ],
    explanation: 'These are smooth mathematical paths, not fund performance or guaranteed outcomes. Actual NAVs change and tax, inflation and fund expenses are excluded.',
    chart: { title: 'Ten-year corpus under three assumed returns', bars: [8, 10, 12].map((rate) => ({
      label: `${rate}% assumed`, value: sipFutureValue(10_000, rate, 120), display: rupees(sipFutureValue(10_000, rate, 120)),
    })) },
  },
  'epf-salary-retirement': {
    title: 'Separate contributions from interest and pension',
    inputs: [
      { label: 'Illustrative employee PF deduction', value: rupees(1_800) + ' per month' },
      { label: 'Period', value: '12 months' },
    ],
    results: [
      { label: 'Employee contribution over 12 months', value: rupees(1_800 * 12) },
      { label: 'Employer EPF / EPS allocation', value: 'Requires the actual payslip and EPFO account' },
      { label: 'Interest credit', value: 'Not assumed in this contribution-only example' },
    ],
    explanation: 'An employer contribution does not always equal the amount posted to EPF; part may go to EPS and other components. Use the latest EPFO statement and the relevant year’s notified interest for a corpus estimate.',
    chart: { title: 'Annual employee deposits at three illustrative monthly amounts (before interest)', bars: [1_800, 2_000, 2_500].map((monthly) => ({
      label: `${rupees(monthly)}/month`, value: monthly * 12, display: rupees(monthly * 12),
    })) },
  },
  'ppf-small-savings': {
    title: 'PPF deposits before adding changing interest',
    inputs: [
      { label: 'Deposit timing', value: 'One deposit per year for 15 years' },
      { label: 'Interest', value: 'Excluded because the notified rate can change' },
    ],
    results: [
      { label: '₹50,000 per year: total deposits', value: rupees(50_000 * 15) },
      { label: '₹1,00,000 per year: total deposits', value: rupees(100_000 * 15) },
      { label: '₹1,50,000 per year: total deposits', value: rupees(150_000 * 15) },
    ],
    explanation: 'Deposit totals are exact arithmetic, not maturity values. Actual interest depends on the notified rate and when each deposit reaches the account. Recheck the National Savings Institute rate table before using the linked PPF calculator.',
    chart: { title: 'Fifteen-year deposit totals before interest', bars: [50_000, 100_000, 150_000].map((annual) => ({
      label: `${rupees(annual)}/year`, value: annual * 15, display: rupees(annual * 15),
    })) },
  },
  'credit-card-debt': {
    title: 'Why a small card payment barely changes the balance',
    inputs: [
      { label: 'Starting balance', value: rupees(50_000) },
      { label: 'Illustrative monthly interest', value: '3% on the starting balance' },
      { label: 'Illustrative payment', value: rupees(2_500) },
    ],
    results: [
      { label: 'Illustrative interest for one month', value: rupees(50_000 * 0.03) },
      { label: 'Principal repaid after that interest', value: rupees(2_500 - 50_000 * 0.03) },
      { label: 'Remaining balance', value: rupees(50_000 + 50_000 * 0.03 - 2_500) },
    ],
    explanation: 'This simplified monthly example excludes daily interest, taxes, fees, new purchases and the issuer’s minimum-due formula. A card’s statement and terms govern the real amount.',
    chart: { title: 'Where the illustrative first payment goes', bars: [
      { label: 'Interest', value: 1_500, display: rupees(1_500) },
      { label: 'Principal repaid', value: 1_000, display: rupees(1_000) },
    ] },
  },
  'gst-invoice': {
    title: 'Same assumed GST rate, two different invoice inputs',
    inputs: [
      { label: 'Assumed rate for illustration', value: '18% (check the actual HSN/SAC rate)' },
      { label: 'Example amount', value: rupees(10_000) },
    ],
    results: [
      { label: 'If ₹10,000 is before GST: tax / total', value: `${rupees(1_800)} / ${rupees(11_800)}` },
      { label: 'If ₹10,000 includes GST: base', value: rupees(gstBaseFromInclusive) },
      { label: 'If ₹10,000 includes GST: tax', value: rupees(10_000 - gstBaseFromInclusive) },
    ],
    explanation: 'Amounts are rounded independently to the nearest rupee for display. The 18% rate is an example only; classification, place of supply and exemptions must be checked on the GST portal.',
    chart: { title: 'GST-exclusive illustration at an assumed 18%', bars: [
      { label: 'Taxable base', value: 10_000, display: rupees(10_000) },
      { label: 'GST amount', value: 1_800, display: rupees(1_800) },
    ] },
  },
  'gratuity-labour': {
    title: 'Illustrative gratuity using the 15/26 method',
    inputs: [
      { label: 'Assumed last drawn monthly wages for this formula', value: rupees(40_000) },
      { label: 'Service used for illustration', value: '6 completed years' },
      { label: 'Method', value: 'Monthly wages × 15 ÷ 26 × years' },
    ],
    results: [
      { label: 'Illustrative gratuity before statutory limits', value: rupees(gratuity) },
    ],
    explanation: 'Actual eligible wages, service rounding, employee category, fixed-term and other exceptions, notified cap and employer terms affect entitlement. Check the Ministry of Labour guidance and your employment record.',
    chart: { title: 'Formula output at different eligible service durations (same assumed wages)', bars: [5, 6, 8].map((years) => ({
      label: `${years} years`, value: 40_000 * 15 / 26 * years, display: rupees(40_000 * 15 / 26 * years),
    })) },
  },
  'rent-property-housing': {
    title: 'Cash needed before comparing rent with buying',
    inputs: [
      { label: 'Illustrative property price', value: rupees(5_000_000) },
      { label: 'Down payment', value: rupees(1_000_000) },
      { label: 'Assumed registration / duty / other purchase costs', value: rupees(300_000) },
      { label: 'Assumed loan rate / term', value: '9% / 20 years (illustrative)' },
    ],
    results: [
      { label: 'Illustrative cash required at purchase', value: rupees(1_000_000 + 300_000) },
      { label: 'Loan principal', value: rupees(4_000_000) },
      { label: 'Monthly EMI before ownership costs', value: rupees(reducingBalanceEmi(4_000_000, 9, 240)) },
    ],
    explanation: 'The ₹3 lakh cost is an assumption, not a stamp-duty rate. It excludes furnishing, maintenance, insurance, taxes and resale costs. Use your state registration portal for actual charges.',
    chart: { title: 'Illustrative upfront cash composition', bars: [
      { label: 'Down payment', value: 1_000_000, display: rupees(1_000_000) },
      { label: 'Assumed purchase costs', value: 300_000, display: rupees(300_000) },
    ] },
  },
};
