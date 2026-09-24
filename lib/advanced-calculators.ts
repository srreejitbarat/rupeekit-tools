// Registry mapping specific tool slugs to advanced V2 components

export const ADVANCED_CALCULATORS = {
  SALARY: 'salary-in-hand-calculator-india',
  GST: 'gst-calculator-india',
  INCOME_TAX: 'income-tax-calculator-old-vs-new-regime-india',
  PERSONAL_LOAN_APR: 'personal-loan-true-apr-calculator-india',
  EIGHTH_PAY_COMMISSION: '8th-pay-commission-salary-calculator-india',
  EIGHTH_PAY_COMMISSION_ARREARS: '8th-pay-commission-arrears-calculator-india',
  EIGHTH_PAY_COMMISSION_PENSION: '8th-pay-commission-pension-calculator-india',
  GOLD_LOAN: 'gold-loan-calculator-india',
  PERSONAL_LOAN_ELIGIBILITY: 'personal-loan-eligibility-calculator-india',
  SSY: 'sukanya-samriddhi-yojana-calculator-india',
  LABOUR_CODE_TAKE_HOME: 'new-labour-code-take-home-calculator-india',
  NEW_WAGE_GRATUITY: 'gratuity-under-new-wage-code-calculator-india',
  ROOM_RENT_DEDUCTION: 'room-rent-proportionate-deduction-calculator-india',
  NOTIONAL_INCREMENT: 'notional-increment-pension-calculator-india',
  PENSION_COMMUTATION: 'pension-commutation-calculator-india',
  RULE_9D_EPF_INTEREST: 'epf-taxable-interest-rule-9d-calculator-india',
  INHERITED_PROPERTY_GAINS: 'inherited-property-capital-gains-calculator-india',
  JOB_OFFER_COMPARISON: 'job-offer-comparison-calculator-india',
  NO_COST_EMI: 'no-cost-emi-calculator-india',
  REMITTANCE_FEES: 'freelancer-remittance-fee-calculator-india',
  CAR_LEASE_EXIT: 'company-car-lease-exit-calculator-india',
} as const;

export type AdvancedCalculatorSlug = typeof ADVANCED_CALCULATORS[keyof typeof ADVANCED_CALCULATORS];

export function isAdvancedCalculator(slug: string): boolean {
  return Object.values(ADVANCED_CALCULATORS).includes(slug as any);
}
