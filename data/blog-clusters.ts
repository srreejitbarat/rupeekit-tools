export type BlogCluster = {
  id: string;
  label: string;
  description: string;
  calculatorHref: string;
  calculatorLabel: string;
  secondaryCalculatorHref?: string;
  secondaryCalculatorLabel?: string;
};

export const BLOG_CLUSTERS: BlogCluster[] = [
  {
    id: 'money-planning',
    label: 'Budgeting & Money Planning',
    description: 'Build a monthly system, emergency buffer and practical money habits.',
    calculatorHref: '/tools/emergency-fund-calculator-india',
    calculatorLabel: 'Emergency fund calculator',
  },
  {
    id: 'loans-debt',
    label: 'Loans & Debt',
    description: 'Compare affordability, true borrowing cost, repayment and debt choices.',
    calculatorHref: '/tools/personal-loan-eligibility-calculator-india',
    calculatorLabel: 'Loan eligibility calculator',
    secondaryCalculatorHref: '/tools/gold-loan-calculator-india',
    secondaryCalculatorLabel: 'Gold loan calculator',
  },
  {
    id: 'income-tax',
    label: 'Income Tax',
    description: 'Understand filing, deductions, capital gains, GST and compliance rules.',
    calculatorHref: '/tools/income-tax-calculator-old-vs-new-regime-india',
    calculatorLabel: 'Income tax calculator',
  },
  {
    id: 'salary-benefits',
    label: 'Salary & Benefits',
    description: 'Decode CTC, take-home pay, career offers and government salary updates.',
    calculatorHref: '/tools/salary-in-hand-calculator-india',
    calculatorLabel: 'Salary in-hand calculator',
    secondaryCalculatorHref: '/tools/8th-pay-commission-salary-calculator-india',
    secondaryCalculatorLabel: '8th CPC scenario calculator',
  },
  {
    id: 'savings-retirement',
    label: 'Savings & Retirement',
    description: 'Plan SSY, PPF, deposits, pension and goal-based long-term savings.',
    calculatorHref: '/tools/sukanya-samriddhi-yojana-calculator-india',
    calculatorLabel: 'SSY calculator',
  },
  {
    id: 'investing',
    label: 'Investing',
    description: 'Learn SIPs, funds, brokers, risk, returns and portfolio trade-offs.',
    calculatorHref: '/tools/sip-calculator-india',
    calculatorLabel: 'SIP calculator',
  },
  {
    id: 'government-compliance',
    label: 'Government & Compliance',
    description: 'Follow official schemes, regulatory changes and documentation duties.',
    calculatorHref: '/tools/8th-pay-commission-salary-calculator-india',
    calculatorLabel: '8th CPC scenario calculator',
  },
];

const CATEGORY_TO_CLUSTER: Record<string, string> = {
  Budgeting: 'money-planning',
  'Personal Finance': 'money-planning',
  Mindset: 'money-planning',
  'Money Planning': 'money-planning',
  Checklists: 'money-planning',
  Resources: 'money-planning',
  Loans: 'loans-debt',
  'Debt Management': 'loans-debt',
  'Credit Cards': 'loans-debt',
  Tax: 'income-tax',
  'Tax & Compliance': 'income-tax',
  'Tax & Savings': 'income-tax',
  'NRI Tax': 'income-tax',
  'Salary & Tax': 'salary-benefits',
  'Salary & Career': 'salary-benefits',
  Savings: 'savings-retirement',
  Retirement: 'savings-retirement',
  Investing: 'investing',
  'Investing & Tax': 'investing',
  'Government & Compliance': 'government-compliance',
  'GST & Business': 'government-compliance',
};

const clusterById = new Map(BLOG_CLUSTERS.map((cluster) => [cluster.id, cluster]));

export function getBlogCluster(category: string): BlogCluster {
  const clusterId = CATEGORY_TO_CLUSTER[category] ?? 'money-planning';
  return clusterById.get(clusterId) ?? BLOG_CLUSTERS[0];
}
