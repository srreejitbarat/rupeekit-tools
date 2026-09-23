/** Public revision summaries; dates move only when a verifiable content change is published. */
const sourceAddition = 'Added a dated comparison using linked primary-source disclosures, explicit model assumptions and a cash-flow calculation.';

export const moneyGuideRevisions: Record<string, { date: string; change: string }[]> = {
  'salary-income-tax': [
    { date: '2026-09-23', change: sourceAddition },
    { date: '2026-09-23', change: 'Published the decision guide with a disclosed illustrative salary calculation.' },
  ],
  'home-loan-prepayment': [
    { date: '2026-09-23', change: 'Added a reduce-EMI versus shorten-tenure calculation with an explicit prepayment date and lender-rate context.' },
    { date: '2026-09-23', change: 'Published the decision guide with a disclosed illustrative loan calculation.' },
  ],
  'personal-loan-apr': [
    { date: '2026-09-23', change: sourceAddition },
    { date: '2026-09-23', change: 'Published the decision guide with an illustrative APR calculation.' },
  ],
};
