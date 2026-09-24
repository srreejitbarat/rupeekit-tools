export type ContextualNextStep = {
  question: string;
  label: string;
  href: string;
  destinationType: 'tool' | 'guide';
};

/**
 * Day 28 (#83): result-adjacent follow-ups for the highest-priority calculator set.
 *
 * The Day 27 GA4 report could not return a trustworthy live top-20 ranking, so this
 * list starts with the calculator URLs present in the established page-level GSC
 * opportunity set and fills the remaining slots with core surviving calculators
 * that sit in the same user journeys. This is intentionally explicit rather than
 * generated from generic related-tool categories: each question should be a real
 * follow-up to the result the user just calculated.
 */
export const CONTEXTUAL_NEXT_STEPS: Record<string, ContextualNextStep[]> = {
  'personal-loan-emi-calculator-india': [
    {
      question: 'Can my income comfortably support this EMI?',
      label: 'Check personal-loan eligibility and FOIR',
      href: '/tools/personal-loan-eligibility-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'What does this loan really cost after upfront charges?',
      label: 'Compare the true APR',
      href: '/tools/personal-loan-true-apr-calculator-india',
      destinationType: 'tool',
    },
  ],
  '8th-pay-commission-salary-calculator-india': [
    {
      question: 'What could the same scenario mean for arrears?',
      label: 'Model an unofficial arrears scenario',
      href: '/tools/8th-pay-commission-arrears-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Are you checking a pension instead of salary?',
      label: 'Open the pension scenario calculator',
      href: '/tools/8th-pay-commission-pension-calculator-india',
      destinationType: 'tool',
    },
  ],
  'emergency-fund-calculator-india': [
    {
      question: 'How much monthly take-home can fund this target?',
      label: 'Estimate salary in hand',
      href: '/tools/salary-in-hand-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Is an existing EMI making the target too high?',
      label: 'Review personal-loan EMI and total cost',
      href: '/tools/personal-loan-emi-calculator-india',
      destinationType: 'tool',
    },
  ],
  'personal-loan-eligibility-calculator-india': [
    {
      question: 'What would the estimated eligible amount cost each month?',
      label: 'Calculate the personal-loan EMI',
      href: '/tools/personal-loan-emi-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'How do fees change the effective borrowing cost?',
      label: 'Compare the true APR',
      href: '/tools/personal-loan-true-apr-calculator-india',
      destinationType: 'tool',
    },
  ],
  'gold-loan-calculator-india': [
    {
      question: 'Would an unsecured personal loan cost less overall?',
      label: 'Compare personal-loan EMI and total interest',
      href: '/tools/personal-loan-emi-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'How much borrowing can your monthly income support?',
      label: 'Check personal-loan eligibility',
      href: '/tools/personal-loan-eligibility-calculator-india',
      destinationType: 'tool',
    },
  ],
  'income-tax-calculator-old-vs-new-regime-india': [
    {
      question: 'What does the selected tax result mean for monthly take-home?',
      label: 'Estimate salary in hand',
      href: '/tools/salary-in-hand-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Do you also have listed-equity gains taxed at special rates?',
      label: 'Estimate equity STCG and LTCG separately',
      href: '/tools/capital-gains-tax-calculator-india',
      destinationType: 'tool',
    },
  ],
  'net-worth-calculator-india': [
    {
      question: 'Is enough of this net worth available for emergencies?',
      label: 'Size an emergency fund',
      href: '/tools/emergency-fund-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'What could regular investing add over time?',
      label: 'Model a monthly SIP',
      href: '/tools/sip-calculator-india',
      destinationType: 'tool',
    },
  ],
  'capital-gains-tax-calculator-india': [
    {
      question: 'How does equity capital-gains reporting fit into ITR-2?',
      label: 'Read the ITR-2 AY 2026-27 filing guide',
      href: '/blog/itr-2-ay-2026-27-filing-guide',
      destinationType: 'guide',
    },
    {
      question: 'Want to measure the investment return before tax?',
      label: 'Calculate XIRR for irregular cash flows',
      href: '/tools/xirr-portfolio-return-calculator-india',
      destinationType: 'tool',
    },
  ],
  'nps-calculator-india': [
    {
      question: 'How does the same monthly contribution look in a market-linked SIP?',
      label: 'Compare a SIP projection',
      href: '/tools/sip-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Do you want a government-backed long-term savings comparison?',
      label: 'Check a PPF projection',
      href: '/tools/ppf-calculator-india',
      destinationType: 'tool',
    },
  ],
  'sukanya-samriddhi-yojana-calculator-india': [
    {
      question: 'How would the same annual saving grow in PPF?',
      label: 'Compare with PPF',
      href: '/tools/ppf-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Need regular income instead of a long maturity target?',
      label: 'Review Post Office MIS',
      href: '/tools/post-office-monthly-income-scheme-calculator-india',
      destinationType: 'tool',
    },
  ],
  'sip-calculator-india': [
    {
      question: 'What if you increase the SIP every year?',
      label: 'Use the Step-Up SIP calculator',
      href: '/tools/step-up-sip-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'What if the money is invested as one lump sum instead?',
      label: 'Compare a lumpsum projection',
      href: '/tools/lumpsum-calculator-india',
      destinationType: 'tool',
    },
  ],
  'cagr-calculator-india': [
    {
      question: 'Were there multiple deposits or withdrawals between start and end?',
      label: 'Use XIRR for irregular cash flows',
      href: '/tools/xirr-portfolio-return-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Want to project a one-time investment forward?',
      label: 'Use the lumpsum calculator',
      href: '/tools/lumpsum-calculator-india',
      destinationType: 'tool',
    },
  ],
  'salary-in-hand-calculator-india': [
    {
      question: 'Would the old or new tax regime change this take-home?',
      label: 'Compare old vs new tax regimes',
      href: '/tools/income-tax-calculator-old-vs-new-regime-india',
      destinationType: 'tool',
    },
    {
      question: 'Can HRA reduce taxable salary under the old regime?',
      label: 'Estimate HRA exemption',
      href: '/tools/hra-exemption-calculator-india',
      destinationType: 'tool',
    },
  ],
  'step-up-sip-calculator-india': [
    {
      question: 'How does this compare with keeping the SIP fixed?',
      label: 'Run the regular SIP calculator',
      href: '/tools/sip-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'What annual growth rate does the result imply?',
      label: 'Check CAGR',
      href: '/tools/cagr-calculator-india',
      destinationType: 'tool',
    },
  ],
  'home-loan-emi-calculator-india': [
    {
      question: 'Would investing spare cash beat prepaying this loan?',
      label: 'Compare invest vs prepay',
      href: '/tools/invest-vs-prepay-home-loan-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'After a prepayment, should you reduce EMI or tenure?',
      label: 'Compare EMI reduction vs tenure reduction',
      href: '/tools/reduce-emi-vs-tenure-calculator-india',
      destinationType: 'tool',
    },
  ],
  'fd-calculator-india': [
    {
      question: 'Is this deposit part of your emergency reserve?',
      label: 'Check your emergency-fund target',
      href: '/tools/emergency-fund-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Want to compare with a longer-term government-backed option?',
      label: 'Project PPF maturity',
      href: '/tools/ppf-calculator-india',
      destinationType: 'tool',
    },
  ],
  'ppf-calculator-india': [
    {
      question: 'Saving specifically for a girl child?',
      label: 'Compare Sukanya Samriddhi Yojana',
      href: '/tools/sukanya-samriddhi-yojana-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Are you a senior citizen comparing income-oriented savings?',
      label: 'Review SCSS',
      href: '/tools/scss-calculator-india',
      destinationType: 'tool',
    },
  ],
  'epf-corpus-calculator-india': [
    {
      question: 'Want to model an additional retirement contribution?',
      label: 'Estimate an NPS corpus',
      href: '/tools/nps-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'How does your employment tenure affect gratuity?',
      label: 'Estimate gratuity',
      href: '/tools/gratuity-calculator-india',
      destinationType: 'tool',
    },
  ],
  'gratuity-calculator-india': [
    {
      question: 'What could this mean alongside your monthly take-home?',
      label: 'Estimate salary in hand',
      href: '/tools/salary-in-hand-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Want to estimate the EPF corpus built during service?',
      label: 'Estimate EPF corpus',
      href: '/tools/epf-corpus-calculator-india',
      destinationType: 'tool',
    },
  ],
  'emi-calculator-india': [
    {
      question: 'Is this specifically a home loan?',
      label: 'Use the home-loan EMI calculator',
      href: '/tools/home-loan-emi-calculator-india',
      destinationType: 'tool',
    },
    {
      question: 'Is this specifically a personal loan?',
      label: 'Use the personal-loan EMI calculator',
      href: '/tools/personal-loan-emi-calculator-india',
      destinationType: 'tool',
    },
  ],
};

export const CONTEXTUAL_NEXT_STEP_TOOL_SLUGS = Object.keys(CONTEXTUAL_NEXT_STEPS);
