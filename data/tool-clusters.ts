import type { Tool } from '@/lib/tools';

export type ToolCluster = {
  slug: string;
  name: string;
  targetKeyword: string;
  description: string;
  intro: string;
  journey: string[];
  sourceCategories: string[];
};

export const toolClusters: ToolCluster[] = [
  {
    slug: 'freelance-business',
    name: 'Freelance & Business',
    targetKeyword: 'freelancer payment calculators India',
    description: 'Reconcile overseas invoices, exchange rates and payment fees before pricing your next project.',
    intro: 'Compare quotes on the same date, separate foreign-currency charges from rupee deductions, and check what reached your bank. Receipt calculations are separate from tax filing and provider eligibility.',
    journey: ['Enter the invoice and a dated exchange-rate reference.', 'Reconcile fees and compare net rupees from two quotes.', 'Check your target receipt and download the audit.'],
    sourceCategories: ['Business'],
  },
  {
    slug: 'loans-emi',
    name: 'Loans & EMI',
    targetKeyword: 'loan calculators India',
    description: 'Compare borrowing cost, affordability, repayment and prepayment decisions before taking or restructuring a loan.',
    intro: 'Start with affordability, then model EMI and total interest, and only then compare fees, prepayment or alternative borrowing routes. The tools here are estimates, not lender approval or rate offers.',
    journey: ['Check what you can afford without stretching monthly cash flow.', 'Model EMI, total interest and fees for the borrowing route.', 'Compare foreclosure, APR and EMI-vs-tenure trade-offs before acting.'],
    sourceCategories: ['Loans', 'Debt', 'Housing'],
  },
  {
    slug: 'tax-compliance',
    name: 'Tax & Compliance',
    targetKeyword: 'tax calculators and compliance tools India',
    description: 'Work through salary, tax-regime, HRA, deductions and compliance questions with clear assumptions and source-backed explanations.',
    intro: 'Use these tools to estimate tax or salary outcomes, then verify filing eligibility, deductions and statutory rules against current official guidance. RupeeKit does not provide personalised tax or legal advice.',
    journey: ['Estimate salary or taxable-income inputs.', 'Compare the relevant tax or deduction scenario.', 'Use the linked guides and official sources before filing or claiming.'],
    sourceCategories: ['Tax', 'Salary'],
  },
  {
    slug: 'investing-markets',
    name: 'Investing & Markets',
    targetKeyword: 'investment calculators India',
    description: 'Model SIP, lumpsum, return, cost and market-linked scenarios without treating assumptions as guaranteed performance.',
    intro: 'Begin with the goal and time horizon, compare contribution methods and costs, then stress-test the return assumption. Market-linked outputs are scenarios, not forecasts or recommendations.',
    journey: ['Choose the goal, horizon and contribution pattern.', 'Compare compounding, fees or return metrics.', 'Stress-test with lower returns before using the result for planning.'],
    sourceCategories: ['Investing', 'Investments'],
  },
  {
    slug: 'insurance-protection',
    name: 'Insurance & Protection',
    targetKeyword: 'insurance planning calculators India',
    description: 'Estimate protection gaps for life and health decisions while keeping underwriting, exclusions and policy terms outside the calculator promise.',
    intro: 'Protection planning starts with the financial gap, not a product pitch. Estimate the cover need first, then compare actual policy wording, exclusions and insurer terms separately.',
    journey: ['Estimate the household or medical protection gap.', 'Test conservative assumptions around dependants and costs.', 'Verify policy terms and underwriting with the insurer before purchase.'],
    sourceCategories: ['Insurance'],
  },
  {
    slug: 'government-pension',
    name: 'Government & Pension',
    targetKeyword: 'government pension calculators India',
    description: 'Navigate pension, EPF, NPS, gratuity and government-pay scenarios with clear separation between notified rules and planning assumptions.',
    intro: 'Use this cluster for retirement and government-pay questions where rules and notifications matter. Scenario calculators are labelled as estimates whenever no final official figure exists.',
    journey: ['Identify the applicable scheme or service rule.', 'Estimate corpus, pension, gratuity or pay scenarios.', 'Re-check the latest notification before relying on a time-sensitive figure.'],
    sourceCategories: ['Retirement'],
  },
  {
    slug: 'life-stage-planning',
    name: 'Life-Stage Planning',
    targetKeyword: 'financial goal planning tools India',
    description: 'Plan education, wedding and other milestone costs by turning future goals into transparent savings assumptions.',
    intro: 'For long-term goals, first estimate the future cost, then subtract current savings and model the monthly contribution needed. Inflation and investment return are user-controlled assumptions.',
    journey: ['Estimate the future cost of the goal.', 'Account for current savings and time remaining.', 'Model the contribution needed and test more conservative assumptions.'],
    sourceCategories: ['Planning'],
  },
  {
    slug: 'small-savings',
    name: 'Small Savings',
    targetKeyword: 'small savings calculators India',
    description: 'Compare deposits, emergency buffers and government-backed small-savings products with current-rate context where relevant.',
    intro: 'Use these tools for cash buffers and savings products where liquidity, tenure and notified rates matter. Current scheme rates are dated and should be re-checked when they reset.',
    journey: ['Separate emergency liquidity from goal-based savings.', 'Compare tenure, payout and compounding assumptions.', 'For notified schemes, verify the current rate and eligibility before investing.'],
    sourceCategories: ['Savings'],
  },
];

const clusterBySlug = new Map(toolClusters.map((cluster) => [cluster.slug, cluster]));

export function getToolCluster(slug: string): ToolCluster | undefined {
  return clusterBySlug.get(slug);
}

export function getPrimaryClusterForTool(tool: Pick<Tool, 'category'>): ToolCluster | undefined {
  return toolClusters.find((cluster) => cluster.sourceCategories.includes(tool.category));
}
