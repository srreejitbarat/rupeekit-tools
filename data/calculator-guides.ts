import { policyGuideClusters, policyGuides } from './policy-guides-2026';

export type GuideSource = {
  label: string;
  href: string;
};

export type CalculatorGuideCluster = {
  id: string;
  title: string;
  description: string;
  toolSlug: string;
  toolName: string;
  methodSteps: string[];
  riskNote: string;
  sources: GuideSource[];
  relatedToolLinks?: { label: string; href: string }[];
};

export type CalculatorGuide = {
  slug: string;
  clusterId: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  question: string;
  answer: string;
  example: string;
  keyPoints: string[];
  lastReviewedIso: string;
};

export const calculatorGuideClusters: CalculatorGuideCluster[] = [
  {
    id: 'home-loan-swp',
    title: 'Home Loan + SWP Stress Test',
    description: 'Test whether monthly investment withdrawals can support a home-loan EMI through both smooth and difficult markets.',
    toolSlug: 'home-loan-swp-stress-test-india',
    toolName: 'Home Loan + SWP Stress Test India',
    methodSteps: [
      'Calculate the reducing-balance home-loan EMI from principal, rate and tenure.',
      'Treat that EMI as a monthly withdrawal from the investment corpus.',
      'Apply return drag and compare a steady path with a bad-first-year path.',
      'Check ending corpus and keep a separate liquid EMI reserve.',
    ],
    riskNote: 'Market returns are variable, while the EMI is contractual. A 12% return is an assumption—not a promise—and an early market fall can damage an SWP plan even when the long-run average looks adequate.',
    sources: [
      { label: 'SEBI investor calculator disclaimer', href: 'https://investor.sebi.gov.in/calculators/sip_calculator.html' },
      { label: 'SEBI Riskometer guidance', href: 'https://investor.sebi.gov.in/riskometer.html' },
      { label: 'SEBI exit-load explainer', href: 'https://investor.sebi.gov.in/exit_load.html' },
    ],
  },
  {
    id: 'hra-2026',
    title: 'HRA Rule 279',
    description: 'Understand the FY 2026-27 least-of-three HRA calculation, city cap and old-regime boundary.',
    toolSlug: 'hra-exemption-calculator-india',
    toolName: 'HRA Exemption Calculator India',
    methodSteps: [
      'Build eligible HRA salary from Basic, eligible DA and eligible fixed commission.',
      'Calculate actual HRA, rent minus 10% of salary and the applicable 50% or 40% salary cap.',
      'Use the lowest non-negative amount as the estimated exemption.',
      'Verify tax regime, city group and documents before filing.',
    ],
    riskNote: 'This is an educational HRA estimate. Payroll periods, salary components, rent evidence and filing facts can change the claim; verify the current rules and your records.',
    sources: [
      { label: 'Income-tax Rules, 2026 notification PDF', href: 'https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-03/En-Notified-IT-Rules-2026-20-03-2026.pdf?mobile-app=1' },
    ],
  },
  {
    id: 'gratuity-2026',
    title: 'Gratuity 2026 Old vs New',
    description: 'Compare gratuity wage-base scenarios without treating a simplified 50% input as an individual legal determination.',
    toolSlug: 'gratuity-2026-old-vs-new-calculator-india',
    toolName: 'Gratuity 2026 Old vs New Calculator',
    methodSteps: [
      'Enter the current eligible monthly wage used for gratuity.',
      'Build a separate wage-base scenario from remuneration and the selected share.',
      'Apply eligible wage x 15/26 x eligible service years to both cases.',
      'Apply the verified cap and compare the results.',
    ],
    riskNote: 'The calculator does not decide eligibility, statutory wage components, service rounding or transition treatment. Use the service and cap that legally apply to the employee.',
    sources: [
      { label: 'Labour Ministry fixed-term employee FAQ, March 2026', href: 'https://www.labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf' },
      { label: 'Labour Ministry general FAQ, January 2026', href: 'https://www.labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf' },
    ],
  },
  {
    id: 'personal-loan-apr',
    title: 'Personal Loan True APR',
    description: 'Compare loan offers using net disbursal and repayment cash flows instead of EMI or quoted rate alone.',
    toolSlug: 'personal-loan-true-apr-calculator-india',
    toolName: 'Personal Loan True APR Calculator India',
    methodSteps: [
      'Calculate EMI from sanctioned principal, reducing rate and tenure.',
      'Subtract attributable upfront charges and advance EMIs from the cash received.',
      'Solve the monthly internal rate that equates net cash with later repayments.',
      'Annualise the result and compare it with the lender Key Facts Statement.',
    ],
    riskNote: 'Dates, broken-period interest, rounding and charge classification can change APR. The lender Key Facts Statement is the offer-specific disclosure to verify.',
    sources: [
      { label: 'RBI Key Facts Statement for Loans and Advances', href: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12663&Mode=0' },
    ],
    relatedToolLinks: [
      { label: 'Personal Loan EMI Calculator India', href: '/tools/personal-loan-emi-calculator-india' },
      { label: 'Personal Loan Eligibility Calculator India', href: '/tools/personal-loan-eligibility-calculator-india' },
    ],
  },
  {
    id: 'emergency-fund-emi',
    title: 'Emergency Fund with EMI',
    description: 'Size emergency savings from survival expenses, fixed EMIs, dependants and income stability.',
    toolSlug: 'emergency-fund-calculator-india',
    toolName: 'Emergency Fund Calculator India',
    methodSteps: [
      'Add essential monthly expenses and unavoidable EMI commitments.',
      'Choose a baseline number of months.',
      'Add dependant and income-risk buffer months, capped at 12 in the tool.',
      'Subtract current emergency savings and plan the monthly shortfall contribution.',
    ],
    riskNote: 'An emergency-fund target is personal and cannot guarantee coverage of every event. Keep core emergency money accessible and separate from volatile long-term investments.',
    sources: [],
    relatedToolLinks: [
      { label: 'Personal Loan EMI Calculator India', href: '/tools/personal-loan-emi-calculator-india' },
    ],
  },
  {
    id: 'invest-vs-prepay',
    title: 'Invest vs Prepay Home Loan',
    description: 'Compare predictable loan-interest savings with uncertain after-drag investment gains over the same time horizon.',
    toolSlug: 'invest-vs-prepay-home-loan-calculator-india',
    toolName: 'Invest vs Prepay Home Loan Calculator India',
    methodSteps: [
      'Calculate remaining EMI interest without a prepayment.',
      'Apply the lump sum to principal while keeping EMI unchanged.',
      'Calculate interest saved from the shorter estimated tenure.',
      'Compound the same lump sum at the after-drag investment return and compare gains.',
    ],
    riskNote: 'Prepayment savings are comparatively predictable; investment gains are not. Preserve emergency liquidity and separately account for verified tax benefits and charges.',
    sources: [
      { label: 'SEBI Riskometer guidance', href: 'https://investor.sebi.gov.in/riskometer.html' },
      { label: 'RBI pre-payment charges directions', href: 'https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12878&Mode=0' },
    ],
  },
  {
    id: 'foreclosure-savings',
    title: 'Foreclosure Net Savings',
    description: 'Calculate interest avoided after foreclosure charge, GST and the opportunity cost of cash.',
    toolSlug: 'loan-foreclosure-net-savings-calculator-india',
    toolName: 'Loan Foreclosure Net Savings Calculator India',
    methodSteps: [
      'Reconstruct future interest from principal, rate and remaining tenure.',
      'Subtract the lender foreclosure charge and GST.',
      'Estimate the alternative growth forgone by using cash to close the loan.',
      'Compare the result with a dated lender foreclosure statement.',
    ],
    riskNote: 'Actual closure figures can include daily interest and contract-specific amounts. Charge rules depend on lender, loan purpose, rate type and current directions.',
    sources: [
      { label: 'RBI pre-payment charges directions', href: 'https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12878&Mode=0' },
    ],
    relatedToolLinks: [
      { label: 'Personal Loan EMI Calculator India', href: '/tools/personal-loan-emi-calculator-india' },
      { label: 'Personal Loan True APR Calculator India', href: '/tools/personal-loan-true-apr-calculator-india' },
    ],
  },
  {
    id: 'reduce-emi-tenure',
    title: 'Reduce EMI vs Tenure',
    description: 'Compare monthly cash-flow relief with the extra interest saving from keeping EMI unchanged after prepayment.',
    toolSlug: 'reduce-emi-vs-tenure-calculator-india',
    toolName: 'Reduce EMI vs Tenure Calculator India',
    methodSteps: [
      'Apply the prepayment to current principal.',
      'Recalculate EMI while preserving the original remaining tenure.',
      'Separately solve the new tenure while preserving the original EMI.',
      'Compare monthly relief, months saved and total remaining interest.',
    ],
    riskNote: 'The lender may not apply your preferred option automatically. Submit instructions and verify the revised amortisation schedule and any applicable charge.',
    sources: [
      { label: 'RBI pre-payment charges directions', href: 'https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12878&Mode=0' },
    ],
    relatedToolLinks: [
      { label: 'Personal Loan EMI Calculator India', href: '/tools/personal-loan-emi-calculator-india' },
      { label: 'Home Loan EMI Calculator India', href: '/tools/home-loan-emi-calculator-india' },
    ],
  },
];

export const calculatorGuides: CalculatorGuide[] = [
  {
    slug: 'can-swp-pay-home-loan-emi',
    clusterId: 'home-loan-swp',
    title: 'Can SWP Pay My Home-Loan EMI?',
    seoTitle: 'Can SWP Pay My Home-Loan EMI? India Stress Test',
    metaDescription: 'See when an SWP can mathematically cover a home-loan EMI and why return drag, rate resets and an early market fall can break the plan.',
    question: 'Can a systematic withdrawal plan pay a home-loan EMI?',
    answer: 'Yes, an SWP can be set equal to the EMI, but that only matches cash flow. The plan survives only if the corpus can absorb withdrawals, costs, taxes and poor return sequences for the full loan period.',
    example: 'An Rs 80 lakh corpus funding a roughly Rs 66,900 EMI needs about a 10% annual withdrawal yield before allowing for costs. A 12% gross return may work in a smooth illustration, but it is not assured.',
    keyPoints: ['Match the actual EMI, not a rounded withdrawal.', 'Compare net return with the withdrawal rate.', 'Run a bad-first-year scenario and keep EMIs outside the market.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: '80-lakh-investment-80-lakh-home-loan',
    clusterId: 'home-loan-swp',
    title: 'Rs 80 Lakh Investment with Rs 80 Lakh Home Loan',
    seoTitle: 'Rs 80 Lakh Investment + Rs 80 Lakh Home Loan Example',
    metaDescription: 'Stress-test an Rs 80 lakh investment against an Rs 80 lakh home loan at 8% for 20 years, including EMI, return drag and market fall.',
    question: 'What happens when an Rs 80 lakh corpus funds an Rs 80 lakh home-loan EMI?',
    answer: 'At 8% for 20 years, the loan EMI is about Rs 66,900 a month. An equal-sized investment corpus can support that withdrawal in favourable scenarios, but the investment is exposed to volatility while the loan payment remains due.',
    example: 'With 12% gross return and 0.75% annual drag, the smooth model can end with money remaining. Change the first year to -20% to see why the same headline return assumption can produce a much weaker result.',
    keyPoints: ['Include a realistic annual drag.', 'Do not ignore floating-rate EMI or tenure changes.', 'Keep stamp duty, emergency savings and purchase costs outside the corpus.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'return-required-to-cover-home-loan-emi',
    clusterId: 'home-loan-swp',
    title: 'What Return Is Required to Cover a Home-Loan EMI?',
    seoTitle: 'Return Required to Cover Home-Loan EMI with SWP',
    metaDescription: 'Calculate the approximate investment return needed to fund a home-loan EMI, then test whether the corpus survives monthly withdrawals.',
    question: 'How much annual return is required for an investment corpus to cover EMI?',
    answer: 'A quick screen divides annual EMI withdrawals by the starting corpus and then adds expected cost and tax drag. That rate only maintains the starting balance in a smooth approximation; a survival test must model monthly withdrawals and variable returns.',
    example: 'Annual EMIs of about Rs 8.03 lakh from an Rs 80 lakh corpus equal roughly 10.04% of starting corpus. Adding 0.75% drag gives an approximate gross hurdle near 10.79%, before sequence risk.',
    keyPoints: ['Use annual EMI divided by investable corpus as a first screen.', 'Add fees and tax drag.', 'Do not call the hurdle a guaranteed break-even return.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'what-if-markets-fall-during-swp',
    clusterId: 'home-loan-swp',
    title: 'What Happens If Markets Fall During SWP?',
    seoTitle: 'What If Markets Fall During SWP? EMI Sequence Risk',
    metaDescription: 'Understand sequence-of-returns risk when a home-loan EMI is funded by SWP and see why an early fall can permanently reduce the corpus.',
    question: 'Why is a market fall dangerous when SWP is paying an EMI?',
    answer: 'The withdrawal continues even when unit values fall, so more units must be sold to produce the same EMI cash. An early fall leaves fewer units for the recovery and can shorten how long the corpus lasts.',
    example: 'A -20% first year plus 12 monthly withdrawals is more damaging than receiving the same -20% year near the end of the loan. Average return alone hides this ordering effect.',
    keyPoints: ['Stress the first year, not only the average return.', 'Hold a liquid EMI reserve.', 'Reduce withdrawals or use income cash flow during a severe fall when feasible.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'pay-cash-or-take-home-loan',
    clusterId: 'home-loan-swp',
    title: 'Pay Cash or Take a Home Loan?',
    seoTitle: 'Pay Cash or Take a Home Loan? India Decision Guide',
    metaDescription: 'Compare paying cash for a home with taking a loan and investing the money, including liquidity, taxes, return risk and EMI stress.',
    question: 'Is it better to pay cash for a house or take a loan and invest the cash?',
    answer: 'Paying cash avoids contractual interest and EMI risk but concentrates capital in the property. Borrowing preserves liquidity and potential investment upside, but adds rate risk, market risk and behavioural pressure.',
    example: 'For a Rs 1 crore home, paying Rs 20 lakh and borrowing Rs 80 lakh preserves an Rs 80 lakh corpus. The correct comparison includes purchase costs, emergency reserves, after-tax investment return and a bad-market case.',
    keyPoints: ['Protect liquidity before either choice.', 'Compare after-tax outcomes over the same horizon.', 'Choose debt only if EMI remains affordable without investment returns.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'sip-vs-swp-vs-home-loan-prepayment',
    clusterId: 'home-loan-swp',
    title: 'SIP vs SWP vs Home-Loan Prepayment',
    seoTitle: 'SIP vs SWP vs Home-Loan Prepayment Explained',
    metaDescription: 'See the different jobs of SIP, SWP and home-loan prepayment and avoid comparing contribution, withdrawal and debt-reduction tools as equals.',
    question: 'How do SIP, SWP and home-loan prepayment differ?',
    answer: 'SIP contributes money to investments, SWP withdraws money from investments and prepayment reduces debt principal. They solve different cash-flow problems and should be compared by the household goal, risk and liquidity—not by one headline percentage.',
    example: 'A borrower may prepay part of a bonus, keep an EMI reserve and continue a smaller SIP. Using an SWP to pay EMI is a separate strategy that adds sequence risk.',
    keyPoints: ['SIP builds a corpus; SWP consumes or distributes it.', 'Prepayment creates a predictable interest saving.', 'A blended choice can protect both liquidity and debt reduction.'],
    lastReviewedIso: '2026-07-16',
  },

  {
    slug: 'hra-rule-279-calculation',
    clusterId: 'hra-2026',
    title: 'HRA Rule 279 Calculation',
    seoTitle: 'HRA Rule 279 Calculation FY 2026-27 Explained',
    metaDescription: 'Calculate HRA exemption under Rule 279 using actual HRA, rent minus 10% of salary and the applicable 50% or 40% salary cap.',
    question: 'How is HRA exemption calculated under Rule 279?',
    answer: 'The estimated exemption is the lowest of actual HRA received, rent paid minus 10% of eligible salary, and 50% or 40% of eligible salary based on the specified city group. Negative rent-minus-salary results are treated as zero in the calculator.',
    example: 'Salary Rs 50,000, HRA Rs 20,000 and rent Rs 25,000 in a 50% city produce limits of Rs 20,000, Rs 20,000 and Rs 25,000. Estimated monthly exemption is Rs 20,000.',
    keyPoints: ['Use eligible salary components only.', 'Apply the correct city cap.', 'HRA exemption is generally an old-regime calculation.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'hra-50-percent-cities-fy-2026-27',
    clusterId: 'hra-2026',
    title: 'HRA 50% Cities for FY 2026-27',
    seoTitle: 'HRA 50% Cities FY 2026-27 | Rule 279 List',
    metaDescription: 'Check the FY 2026-27 specified city list for the 50% HRA salary cap and when the 40% cap applies under Rule 279.',
    question: 'Which cities use the 50% HRA salary cap for FY 2026-27?',
    answer: 'The Rule 279 specified-city group used by RupeeKit includes Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad and Bengaluru. Other Indian cities use the 40% salary cap in this least-of-three calculation.',
    example: 'Select 50% for Bengaluru and 40% for Indore, then compare that cap with actual HRA and rent minus 10% of salary.',
    keyPoints: ['City percentage is only one of three limits.', 'Use the work/rented-residence facts for the relevant period.', 'Verify the notified rules before filing.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'hra-old-vs-new-tax-regime',
    clusterId: 'hra-2026',
    title: 'HRA in Old vs New Tax Regime',
    seoTitle: 'HRA Exemption: Old vs New Tax Regime FY 2026-27',
    metaDescription: 'Understand why HRA exemption is generally relevant under the old regime and how to include it in a full old-versus-new tax comparison.',
    question: 'Can HRA exemption be claimed in the new tax regime?',
    answer: 'HRA exemption is generally available when computing salary income under the old regime and is generally not available under the default new regime. Compare the full tax result because HRA alone does not determine the better regime.',
    example: 'First calculate eligible HRA under Rule 279, then enter that benefit with other deductions and income in a complete old-versus-new regime calculator.',
    keyPoints: ['Do not compare regimes using HRA alone.', 'Use the exemption only where legally available.', 'Verify payroll declarations and final return computation.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'claim-hra-paying-rent-to-parents',
    clusterId: 'hra-2026',
    title: 'Can You Claim HRA When Paying Rent to Parents?',
    seoTitle: 'Claim HRA Paying Rent to Parents | Documents & Checks',
    metaDescription: 'See when rent paid to parents may support an HRA claim, which records to keep and why the arrangement and rental income must be genuine.',
    question: 'Can an employee claim HRA for rent paid to parents?',
    answer: 'A genuine rental arrangement with actual payment and supporting records may qualify, subject to the normal HRA rules. The parent-landlord should report rental income where applicable, and ownership and occupancy facts must support the claim.',
    example: 'Keep a rent agreement, periodic receipts, bank transfers and landlord details. Calculate exemption using actual HRA, eligible salary, rent and city cap like any other claim.',
    keyPoints: ['Make real, traceable rent payments.', 'Keep landlord and property records.', 'Do not create backdated or circular payment evidence.'],
    lastReviewedIso: '2026-07-16',
  },

  {
    slug: 'gratuity-2026-old-vs-new',
    clusterId: 'gratuity-2026',
    title: 'Gratuity 2026: Old vs New Wage Base',
    seoTitle: 'Gratuity 2026 Old vs New Wage Base Comparison',
    metaDescription: 'Compare gratuity using current Basic+DA and a new wage-base scenario while keeping service years and statutory cap consistent.',
    question: 'How can the 2026 wage-base scenario change gratuity?',
    answer: 'If the eligible monthly wage rises, the uncapped gratuity estimate rises in the same proportion. The actual change can be smaller or zero when the cap applies or the assumed wage definition does not match the employee facts.',
    example: 'Moving the test wage from Rs 40,000 to Rs 50,000 increases the 15/26 calculation by 25% before the cap, when service years stay the same.',
    keyPoints: ['Compare wage bases with identical service years.', 'Apply the cap to both results.', 'Treat the 50% field as a scenario, not a legal conclusion.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'fixed-term-employee-gratuity-one-year',
    clusterId: 'gratuity-2026',
    title: 'Fixed-Term Employee Gratuity After One Year',
    seoTitle: 'Fixed-Term Employee Gratuity After One Year | 2026 FAQ',
    metaDescription: 'Review the Labour Ministry FAQ on one-year gratuity eligibility for directly engaged fixed-term employees and calculate a scenario carefully.',
    question: 'Can a fixed-term employee receive gratuity after one year?',
    answer: 'The Labour Ministry March 2026 FAQ states that a fixed-term employee directly engaged by an employer is eligible for gratuity after one year, subject to the applicable legal conditions. Contract type and engagement facts still need verification.',
    example: 'For an eligible directly engaged fixed-term employee, enter the applicable wage and eligible service period; do not automatically apply the rule to a contractor workforce arrangement.',
    keyPoints: ['Confirm direct fixed-term engagement.', 'Use the applicable wage definition.', 'Retain the contract and service records.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'gratuity-50-percent-wage-rule',
    clusterId: 'gratuity-2026',
    title: 'Gratuity and the 50% Wage Rule',
    seoTitle: 'Gratuity 50% Wage Rule Explained with Calculator',
    metaDescription: 'Understand why the wage-definition inclusion rule is not simply 50% of CTC and how to run a cautious gratuity wage-base scenario.',
    question: 'Does the 50% wage rule mean gratuity is always calculated on half of CTC?',
    answer: 'No. CTC can include employer contributions and benefits that are not the relevant remuneration base. The statutory wage definition and treatment of excluded components must be applied before choosing an eligible wage.',
    example: 'Use Rs 1 lakh remuneration and a 50% scenario only as a test, then replace the result with the wage figure verified from payroll and current rules.',
    keyPoints: ['Do not substitute CTC automatically.', 'Identify included and excluded remuneration.', 'Ask HR for the gratuity wage basis used.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'gratuity-calculation-with-joining-and-exit-dates',
    clusterId: 'gratuity-2026',
    title: 'Gratuity Calculation with Joining and Exit Dates',
    seoTitle: 'Gratuity Service Years from Joining and Exit Dates',
    metaDescription: 'Work out service duration from joining and exit records, then use only the legally eligible years in a gratuity estimate.',
    question: 'How should joining and exit dates be used for gratuity?',
    answer: 'Calculate the actual service period from employer records first, then apply the eligibility and rounding rule that governs the case. A calculator should not silently turn every partial year into a full year.',
    example: 'If records show 10 years and several additional months, verify how the additional period is treated for that employment before entering the eligible service value.',
    keyPoints: ['Use documented joining and last-working dates.', 'Separate eligibility from amount calculation.', 'Avoid disputed service shortcuts without verification.'],
    lastReviewedIso: '2026-07-16',
  },

  {
    slug: 'personal-loan-apr-processing-fee-gst',
    clusterId: 'personal-loan-apr',
    title: 'Personal Loan APR with Processing Fee and GST',
    seoTitle: 'Personal Loan APR with Processing Fee & GST Calculator',
    metaDescription: 'See how a processing fee and GST reduce net personal-loan disbursal and raise the effective annual cost above the quoted rate.',
    question: 'How do processing fee and GST affect personal-loan APR?',
    answer: 'EMI is normally calculated on the sanctioned principal, while fee and GST may reduce the money available to the borrower. Paying the same EMI against lower net cash raises the internal rate and annualised cost.',
    example: 'A 2% fee on Rs 5 lakh is Rs 10,000; 18% GST on that fee is Rs 1,800. If both are deducted, only Rs 4,88,200 remains before other charges.',
    keyPoints: ['Apply GST to the charge where applicable, not principal.', 'Use net cash actually received.', 'Compare with the KFS APR.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: '5-lakh-personal-loan-true-cost',
    clusterId: 'personal-loan-apr',
    title: 'Rs 5 Lakh Personal Loan True Cost',
    seoTitle: 'Rs 5 Lakh Personal Loan True Cost: EMI, Fees & APR',
    metaDescription: 'Calculate the EMI, interest, fees, GST, net disbursal and effective APR of an Rs 5 lakh personal loan before accepting an offer.',
    question: 'What is the true cost of an Rs 5 lakh personal loan?',
    answer: 'True cost is the scheduled interest plus attributable charges, measured against the net amount available—not just the Rs 5 lakh sanction. The exact result depends on the rate, tenure, fee, GST, insurance and payment timing.',
    example: 'Enter Rs 5 lakh, 12%, 36 months, 2% fee and 18% GST on the fee. Add insurance only if attributable to the loan offer, then compare effective APR with the quoted 12%.',
    keyPoints: ['Record sanctioned and net disbursed amounts.', 'Include compulsory attributable charges.', 'Longer tenure can lower EMI but raise total interest.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'flat-rate-vs-reducing-rate-personal-loan',
    clusterId: 'personal-loan-apr',
    title: 'Flat Rate vs Reducing Rate Personal Loan',
    seoTitle: 'Flat Rate vs Reducing Rate Personal Loan Explained',
    metaDescription: 'Learn why a flat-rate personal-loan quote cannot be entered as an equivalent reducing rate and compare offers using APR instead.',
    question: 'Why is a flat personal-loan rate different from a reducing-balance rate?',
    answer: 'Flat interest is calculated on the original principal for the full tenure, while reducing-balance interest is calculated on the declining outstanding principal. The same percentage therefore produces very different EMIs and costs.',
    example: 'Do not enter a 10% flat quote as 10% reducing. Ask for the reducing rate, full repayment schedule and KFS APR before using the calculator.',
    keyPoints: ['Identify the rate convention.', 'Compare total cash flows, not labels.', 'APR is more useful for comparing differently structured offers.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'compare-two-personal-loan-offers',
    clusterId: 'personal-loan-apr',
    title: 'How to Compare Two Personal Loan Offers',
    seoTitle: 'Compare Two Personal Loan Offers by APR & Net Disbursal',
    metaDescription: 'Compare two personal-loan offers using equal loan needs, net cash received, APR, total cost, prepayment terms and EMI affordability.',
    question: 'What should be compared across two personal-loan offers?',
    answer: 'Compare net cash received, effective APR, total repayment, EMI, charge schedule and prepayment terms using the same borrowing need and tenure. A lower EMI can simply reflect a longer and more expensive loan.',
    example: 'Run Offer A and Offer B separately, save each APR and total cost, then check the KFS and foreclosure clauses before choosing.',
    keyPoints: ['Normalise amount and tenure.', 'Include all attributable charges.', 'Read prepayment, late-fee and insurance terms.'],
    lastReviewedIso: '2026-07-16',
  },

  {
    slug: 'emergency-fund-with-home-loan-emi',
    clusterId: 'emergency-fund-emi',
    title: 'Emergency Fund with Home-Loan EMI',
    seoTitle: 'Emergency Fund with Home-Loan EMI Calculator India',
    metaDescription: 'Calculate emergency savings using essential expenses plus home-loan EMI and add buffers for dependants and income risk.',
    question: 'Should home-loan EMI be included in an emergency fund?',
    answer: 'Yes, include the EMI because it remains a fixed obligation during an income disruption. Also include essential household expenses and any other unavoidable instalments, but exclude discretionary spending.',
    example: 'Rs 40,000 essential expenses plus Rs 45,000 home-loan EMI creates an Rs 85,000 monthly survival cost. Six months equals Rs 5.1 lakh before extra risk buffers.',
    keyPoints: ['Use survival expenses, not salary.', 'Include every unavoidable EMI.', 'Keep this reserve separate from an SWP corpus.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'emergency-fund-for-sole-earner-india',
    clusterId: 'emergency-fund-emi',
    title: 'Emergency Fund for a Sole Earner in India',
    seoTitle: 'Emergency Fund for Sole Earner in India with EMIs',
    metaDescription: 'Estimate a sole-earner emergency fund from household costs, EMIs, dependants and a longer income-risk buffer.',
    question: 'How much emergency fund should a sole earner keep?',
    answer: 'A sole-earner household often needs a larger buffer because one income interruption affects the full household. Start with survival cost, then add dependant and income-risk months instead of relying on a generic salary multiple.',
    example: 'A six-month baseline plus one dependant month and two income-risk months gives a nine-month target in the calculator, capped at twelve months.',
    keyPoints: ['Count all financial dependants.', 'Review insurance separately.', 'Increase the target when re-employment could take longer.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'emergency-fund-for-freelancer-india',
    clusterId: 'emergency-fund-emi',
    title: 'Emergency Fund for Freelancers in India',
    seoTitle: 'Emergency Fund for Freelancer India | Variable Income',
    metaDescription: 'Build a freelancer emergency fund using survival costs, EMIs, delayed client payments and a larger variable-income buffer.',
    question: 'How should a freelancer calculate an emergency fund?',
    answer: 'Use essential personal expenses plus fixed EMIs, then add a larger income-risk buffer for delayed invoices, client concentration and uneven work. Keep business operating cash separate from the personal emergency fund.',
    example: 'A freelancer choosing six baseline months plus four income-risk months would test a ten-month household target, then separately fund taxes and business expenses.',
    keyPoints: ['Use a conservative monthly expense average.', 'Separate tax and business reserves.', 'Rebuild after every withdrawal.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: '3-vs-6-vs-12-month-emergency-fund',
    clusterId: 'emergency-fund-emi',
    title: '3 vs 6 vs 12-Month Emergency Fund',
    seoTitle: '3 vs 6 vs 12-Month Emergency Fund Calculator',
    metaDescription: 'Compare 3, 6 and 12 months of essential expenses and EMIs and choose a buffer based on income stability and dependants.',
    question: 'Should an emergency fund cover 3, 6 or 12 months?',
    answer: 'Three months can cover short disruptions, six months is a common planning baseline and twelve months offers more protection for variable or concentrated income. The appropriate point depends on dependants, EMI burden and time needed to replace income.',
    example: 'At Rs 60,000 monthly survival cost, the three targets are Rs 1.8 lakh, Rs 3.6 lakh and Rs 7.2 lakh.',
    keyPoints: ['Start with a reachable first milestone.', 'Increase the target as fixed obligations rise.', 'Review at least after major income or family changes.'],
    lastReviewedIso: '2026-07-16',
  },

  {
    slug: 'invest-or-prepay-home-loan',
    clusterId: 'invest-vs-prepay',
    title: 'Invest or Prepay Home Loan?',
    seoTitle: 'Invest or Prepay Home Loan? India Calculator Guide',
    metaDescription: 'Compare after-drag investment gain with home-loan interest saved and make the choice after protecting liquidity and testing risk.',
    question: 'Is investing better than prepaying a home loan?',
    answer: 'Investing can finish ahead when realised after-tax returns beat the value of interest avoided, but that outcome is uncertain. Prepayment offers a more predictable saving and faster debt reduction, while sacrificing liquidity.',
    example: 'Compare a Rs 5 lakh lump sum invested at 10% gross minus 1% drag with the interest saved on an 8.5% loan over the same remaining horizon.',
    keyPoints: ['Use after-drag investment return.', 'Include verified loan tax effects separately.', 'Stress-test lower returns before choosing investment.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'use-bonus-to-prepay-or-invest',
    clusterId: 'invest-vs-prepay',
    title: 'Use a Bonus to Prepay or Invest?',
    seoTitle: 'Use Bonus to Prepay Home Loan or Invest? Calculator',
    metaDescription: 'Decide how to use a bonus by comparing debt reduction, investment growth, emergency reserves and near-term cash needs.',
    question: 'Should a salary bonus be used for home-loan prepayment or investment?',
    answer: 'First fund taxes, near-term commitments and emergency reserves. Then compare the predictable interest saving on the remaining bonus with a conservative investment scenario; splitting the amount can be reasonable when both goals matter.',
    example: 'From a Rs 6 lakh bonus, a household might retain Rs 1 lakh for liquidity and compare investing versus prepaying the remaining Rs 5 lakh.',
    keyPoints: ['Do not commit the bonus before it is received net of tax.', 'Protect short-term goals.', 'A split decision can reduce regret and concentration.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'home-loan-rate-vs-investment-return',
    clusterId: 'invest-vs-prepay',
    title: 'Home-Loan Rate vs Investment Return',
    seoTitle: 'Home-Loan Rate vs Investment Return: Correct Comparison',
    metaDescription: 'Learn why an 8% home loan and 12% expected investment return do not create a guaranteed 4% profit after tax, costs and risk.',
    question: 'Can I subtract the home-loan rate from expected investment return?',
    answer: 'Only as a rough starting point. Loan interest avoided is comparatively certain, while investment return is variable and affected by tax, costs, time horizon and sequence; the two headline percentages are not equivalent.',
    example: 'A 12% gross assumption minus 1% drag is 11%, but the realised path can still underperform an 8.5% prepayment saving over a particular period.',
    keyPoints: ['Compare like-for-like time periods.', 'Use after-tax, after-cost investment assumptions.', 'Account for volatility and liquidity value.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'prepay-home-loan-or-keep-emergency-fund',
    clusterId: 'invest-vs-prepay',
    title: 'Prepay Home Loan or Keep Emergency Fund?',
    seoTitle: 'Prepay Home Loan or Keep Emergency Fund First?',
    metaDescription: 'Understand why emergency liquidity usually needs protection before an optional home-loan prepayment, even when interest savings look attractive.',
    question: 'Should I use my emergency fund to prepay a home loan?',
    answer: 'Usually, essential emergency liquidity should remain available because a home-loan prepayment is hard to reverse. Losing cash can force expensive new borrowing during job loss or medical stress, offsetting the interest saved.',
    example: 'Calculate the household target including EMI first. Compare only the cash above that reserve as the optional prepayment amount.',
    keyPoints: ['Keep survival cash accessible.', 'Do not count volatile investments as the full emergency fund.', 'Prepay surplus liquidity, not essential liquidity.'],
    lastReviewedIso: '2026-07-16',
  },

  {
    slug: 'is-personal-loan-foreclosure-worth-it',
    clusterId: 'foreclosure-savings',
    title: 'Is Personal-Loan Foreclosure Worth It?',
    seoTitle: 'Is Personal-Loan Foreclosure Worth It? Net Savings',
    metaDescription: 'Calculate whether future personal-loan interest avoided exceeds foreclosure charges, GST and the opportunity cost of cash.',
    question: 'How can I tell whether personal-loan foreclosure is worth it?',
    answer: 'Estimate future interest remaining, then subtract the foreclosure charge and GST. Also consider the return or liquidity lost by using cash today and verify the result against a dated lender quote.',
    example: 'On Rs 5 lakh outstanding with 30 months left, a high rate can make closure valuable, but a 3% fee and GST reduce the saving.',
    keyPoints: ['Use principal outstanding from the statement.', 'Compare future interest—not total EMI—with charges.', 'Preserve emergency cash.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'loan-foreclosure-charges-gst-savings',
    clusterId: 'foreclosure-savings',
    title: 'Loan Foreclosure Charges, GST and Savings',
    seoTitle: 'Loan Foreclosure Charges & GST: Net Savings Formula',
    metaDescription: 'Break down foreclosure charge, GST, daily-interest differences and net interest saved before closing a loan.',
    question: 'How do foreclosure charge and GST change the saving?',
    answer: 'The charge is normally applied using the contract or lender quote, and GST may apply to that service charge. Both amounts reduce the future interest avoided; daily accrued interest can also change the final payment.',
    example: 'A 3% charge on Rs 5 lakh is Rs 15,000 and 18% GST on the charge is Rs 2,700, reducing gross interest savings by Rs 17,700.',
    keyPoints: ['Enter the quoted charge basis exactly.', 'Do not apply GST to principal.', 'Request a dated closure statement.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'best-time-to-foreclose-loan',
    clusterId: 'foreclosure-savings',
    title: 'Best Time to Foreclose a Loan',
    seoTitle: 'Best Time to Foreclose a Loan | Interest vs Charges',
    metaDescription: 'See why foreclosure often saves more earlier in a loan but still requires a month-specific comparison of interest, charges and liquidity.',
    question: 'When is the best time to foreclose a loan?',
    answer: 'Earlier closure often avoids more future interest because reducing-balance loans collect more interest while principal is high. The best month still depends on lock-ins, charges, principal outstanding and whether cash has a better essential use.',
    example: 'Run the calculator using today’s statement, then rerun with a later principal and lower remaining tenure to compare waiting.',
    keyPoints: ['Check lock-in and charge slabs.', 'Use the current rate and principal.', 'Do not wait solely for a round anniversary without calculating.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'partial-prepayment-vs-full-foreclosure',
    clusterId: 'foreclosure-savings',
    title: 'Partial Prepayment vs Full Foreclosure',
    seoTitle: 'Partial Prepayment vs Full Loan Foreclosure Compared',
    metaDescription: 'Compare partial loan prepayment with full foreclosure using interest savings, fees, liquidity and the revised repayment schedule.',
    question: 'Is partial prepayment better than full foreclosure?',
    answer: 'Partial prepayment keeps more liquidity and still reduces future interest, while full foreclosure removes the EMI and all remaining loan interest. Compare charges and revised schedules for both rather than assuming the same terms apply.',
    example: 'If Rs 5 lakh is outstanding but only Rs 3 lakh is safely available, test a partial prepayment and request the new EMI or tenure before considering full closure later.',
    keyPoints: ['Compare charge rules for each option.', 'Choose EMI or tenure treatment in writing.', 'Keep enough cash after either payment.'],
    lastReviewedIso: '2026-07-16',
  },

  {
    slug: 'reduce-emi-or-tenure-after-prepayment',
    clusterId: 'reduce-emi-tenure',
    title: 'Reduce EMI or Tenure After Prepayment?',
    seoTitle: 'Reduce EMI or Tenure After Prepayment Calculator',
    metaDescription: 'Compare lower monthly EMI with shorter loan tenure after prepayment and see which option saves more interest.',
    question: 'Should I reduce EMI or tenure after making a prepayment?',
    answer: 'Keeping EMI unchanged generally closes the loan sooner and saves more interest. Reducing EMI provides immediate monthly relief and may be preferable when income is uncertain or cash flow is stretched.',
    example: 'Apply the same Rs 5 lakh prepayment to both options: one recalculates EMI over the old tenure, while the other solves a shorter tenure at the old EMI.',
    keyPoints: ['Use the same prepayment in both scenarios.', 'Compare total remaining interest.', 'Ask the lender to apply your chosen option.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: '5-lakh-home-loan-prepayment-impact',
    clusterId: 'reduce-emi-tenure',
    title: 'Rs 5 Lakh Home-Loan Prepayment Impact',
    seoTitle: 'Rs 5 Lakh Home-Loan Prepayment: EMI & Tenure Impact',
    metaDescription: 'Estimate how an Rs 5 lakh home-loan prepayment changes EMI, remaining tenure and interest at your current principal and rate.',
    question: 'How much difference can an Rs 5 lakh home-loan prepayment make?',
    answer: 'The impact is larger when principal, interest rate and remaining tenure are high. Enter current statement values because using the original loan amount or tenure can materially overstate the result.',
    example: 'On Rs 50 lakh outstanding at 8.5% with 180 months left, test Rs 5 lakh and compare the lower EMI result with the shorter-tenure result.',
    keyPoints: ['Use current—not original—loan values.', 'Check whether charges apply.', 'Compare the revised lender schedule with the estimate.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'how-many-months-can-prepayment-save',
    clusterId: 'reduce-emi-tenure',
    title: 'How Many Months Can Loan Prepayment Save?',
    seoTitle: 'How Many Months Can Prepayment Save? Tenure Calculator',
    metaDescription: 'Calculate the estimated loan months saved when a principal prepayment is made and the existing EMI is kept unchanged.',
    question: 'How are months saved after loan prepayment calculated?',
    answer: 'Subtract the prepayment from principal, then solve the number of payments needed to amortise the smaller balance at the same rate and EMI. The difference from the original remaining months is the estimated tenure saving.',
    example: 'If 180 payments remain and the recalculated same-EMI tenure is 150.4 months, the estimate is about 29.6 months saved before lender rounding.',
    keyPoints: ['Keep EMI and rate constant for this comparison.', 'Expect lender rounding to whole instalments.', 'Rate resets will change the realised saving.'],
    lastReviewedIso: '2026-07-16',
  },
  {
    slug: 'reduce-emi-for-cash-flow-or-tenure-for-interest',
    clusterId: 'reduce-emi-tenure',
    title: 'Reduce EMI for Cash Flow or Tenure for Interest?',
    seoTitle: 'Lower EMI for Cash Flow vs Shorter Tenure for Interest',
    metaDescription: 'Choose between monthly EMI relief and maximum interest saving after prepayment based on cash-flow resilience and debt goals.',
    question: 'When should cash-flow relief take priority over maximum interest saving?',
    answer: 'Choose a lower EMI when the current payment threatens emergency savings, essential spending or higher-cost debt repayment. Keep EMI unchanged when it is comfortably affordable and faster loan closure is the priority.',
    example: 'A household with unstable income may use EMI relief temporarily, while a stable household with a funded reserve may prefer the shorter tenure.',
    keyPoints: ['Optimise household resilience, not only interest.', 'Repay costlier debt first when appropriate.', 'Revisit voluntary overpayments if income improves.'],
    lastReviewedIso: '2026-07-16',
  },
];

// Policy guides live in their own module so this file stays the frozen record
// of the original 34-guide set that validate-growth-clusters.mjs asserts on.
// Everything downstream reads the merged views below.
export const allGuideClusters: CalculatorGuideCluster[] = [
  ...calculatorGuideClusters,
  ...policyGuideClusters,
];

export const allGuides: CalculatorGuide[] = [...calculatorGuides, ...policyGuides];

export function getCalculatorGuide(slug: string) {
  return allGuides.find((guide) => guide.slug === slug);
}

export function getCalculatorGuideCluster(clusterId: string) {
  return allGuideClusters.find((cluster) => cluster.id === clusterId);
}

export function getGuidesForTool(toolSlug: string) {
  const cluster = allGuideClusters.find((item) => item.toolSlug === toolSlug);
  return cluster ? allGuides.filter((guide) => guide.clusterId === cluster.id) : [];
}
