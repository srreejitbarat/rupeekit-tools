import type { CalculatorGuide, CalculatorGuideCluster } from './calculator-guides';

// The guide format is the best-converting on the site (1.47% CTR in the
// 24 May - 23 Aug 2026 Search Console export) but the existing 34 guides answer
// questions with almost no demand: 0.24 impressions per page per day. These
// clusters point the same format at the policy questions where RupeeKit already
// ranks in the top five.

export const policyGuideClusters: CalculatorGuideCluster[] = [
  {
    id: 'labour-code-wages',
    title: 'The 50% Wage Rule',
    description:
      'What happens to take-home pay, provident fund and gratuity when basic pay is lifted to at least half of cash remuneration.',
    toolSlug: 'new-labour-code-take-home-calculator-india',
    toolName: 'New Labour Code Take-Home Calculator India',
    methodSteps: [
      'Read basic plus dearness allowance off your payslip and express it as a share of monthly CTC.',
      'Establish your cash remuneration: basic, DA and every allowance, excluding employer contributions.',
      'Apply the floor — wages become the greater of your current basic and half of that cash remuneration.',
      'Recalculate provident fund at 12% and gratuity accrual at 15/26 on the revised wage base.',
      'Hold CTC constant to see how much cash pay is displaced by the higher employer contributions.',
    ],
    riskNote:
      'Employers restructure on their own payroll cycles and states notify rules separately, so the date this reaches your payslip is not something RupeeKit can tell you. Treat every figure as an estimate and confirm your revised breakup with your employer.',
    sources: [
      {
        label: 'Code on Wages, 2019 (Ministry of Labour and Employment)',
        href: 'https://labour.gov.in/sites/default/files/the_code_on_wages_2019.pdf',
      },
      {
        label: 'Ministry of Labour & Employment — Labour Codes FAQs',
        href: 'https://labour.gov.in/en/faqs-labour-codes',
      },
    ],
    relatedToolLinks: [
      {
        label: 'Gratuity under the new wage code',
        href: '/tools/gratuity-under-new-wage-code-calculator-india',
      },
      { label: 'Salary in-hand calculator', href: '/tools/salary-in-hand-calculator-india' },
    ],
  },
  {
    id: 'eighth-cpc-arrears',
    title: '8th CPC Arrears and the DA Merge',
    description:
      'How arrears accumulate between an effective date and a payment date, and why the fitment factor overstates the real increase.',
    toolSlug: '8th-pay-commission-arrears-calculator-india',
    toolName: '8th Pay Commission Arrears Calculator India',
    methodSteps: [
      'Take the difference between projected eligible monthly pay and current eligible monthly pay.',
      'Count the whole months between the assumed effective date and the assumed payment date.',
      'Multiply the monthly difference by that month count to get gross arrears.',
      'Subtract any one-time deductions your department applies before release.',
      'Compare revised gross against current gross, never revised basic against current basic.',
    ],
    riskNote:
      'No fitment factor, revised pay matrix or implementation date has been notified by the 8th Central Pay Commission. Every projected figure is a scenario you have chosen, not a government decision, and the arrears period cannot be known until an effective date is announced.',
    sources: [
      {
        label: 'Department of Expenditure — Pay Commission resolutions',
        href: 'https://doe.gov.in/order-circular/implementation-recommendations-7th-central-pay-commission',
      },
    ],
    relatedToolLinks: [
      {
        label: '8th Pay Commission salary calculator',
        href: '/tools/8th-pay-commission-salary-calculator-india',
      },
      { label: '8th Pay Commission status', href: '/8th-pay-commission' },
    ],
  },
];

export const policyGuides: CalculatorGuide[] = [
  {
    slug: 'why-my-take-home-fell-after-labour-codes',
    clusterId: 'labour-code-wages',
    title: 'Why did my take-home fall after the labour codes?',
    seoTitle: 'Why Your Take-Home Fell Under the New Labour Codes',
    metaDescription:
      'Your CTC did not change, but more of it now goes to provident fund and gratuity. Here is the arithmetic behind a 2% to 6% drop in monthly pay.',
    question: 'Why did my take-home salary fall when my CTC did not change?',
    answer:
      'Because a larger share of the same CTC is now being set aside rather than paid to you in cash. Provident fund and gratuity are both calculated on "wages", which the Code on Wages defines as basic pay plus dearness allowance plus retaining allowance — with a floor at half of your cash remuneration. If your basic sat at 30% of CTC, that floor lifts your wage base sharply. Employee provident fund is 12% of wages and the employer matches it, and gratuity accrues at 15 days of wages a year. Since employer provident fund and gratuity accrual usually sit inside CTC, raising the wage base leaves less room for cash pay. The money has not gone anywhere: it is in your provident fund account and your gratuity entitlement. Whether that trade suits you depends on whether you need the cash now.',
    example:
      'On a ₹12 lakh package with basic at 30% of CTC, wages are ₹30,000 a month today. Lifting them to half of cash pay takes the base to roughly ₹46,000. Employee and employer provident fund each rise from ₹3,600 to about ₹5,500, gratuity accrual rises in step, and monthly take-home falls by roughly 5%. Your retirement saving rises by about ₹4,600 a month — more than the reduction in take-home.',
    keyPoints: [
      'CTC is unchanged; the split between cash and retirement saving is what moved.',
      'The lower your old basic percentage, the larger the reduction.',
      'Employers who cap provident fund at the ₹15,000 ceiling see far less change.',
    ],
    lastReviewedIso: '2026-08-25',
  },
  {
    slug: 'basic-below-50-percent-ctc-what-changes',
    clusterId: 'labour-code-wages',
    title: 'My basic is below 50% of CTC — what changes?',
    seoTitle: 'Basic Below 50% of CTC: What the Wage Rule Changes',
    metaDescription:
      'If your basic pay is under half your salary, the excess allowances are added back to wages. See what that does to PF, gratuity and monthly pay.',
    question: 'What happens if my basic pay is below half of my salary?',
    answer:
      'The excess is added back. The Code on Wages lists components that are excluded from wages — most allowances — but adds a proviso: where those excluded components exceed one half of all remuneration, the excess counts as wages anyway. In practice this means your wage base cannot settle below half of the cash remuneration you actually receive, however your payslip is labelled. The consequence is not cosmetic, because three separate entitlements run off that base. Provident fund is 12% from you and 12% from your employer. Gratuity accrues at fifteen days of wages for every completed year of service. Both rise together. The test is applied to cash remuneration rather than to CTC, which is why the revised wage figure is not simply half your CTC — employer contributions are excluded from the remuneration figure the test runs on.',
    example:
      'Suppose your monthly cash pay is ₹92,000, of which basic plus DA is ₹30,000 and allowances are ₹62,000. Allowances are 67% of remuneration, above the half-way mark. The excess is added back to wages until the floor is met, taking the wage base to ₹46,000. Provident fund and gratuity are then calculated on ₹46,000, not ₹30,000.',
    keyPoints: [
      'The 50% test applies to cash remuneration, not to CTC.',
      'Excess allowances are added back to wages automatically.',
      'A structure already at or above the floor sees no change at all.',
    ],
    lastReviewedIso: '2026-08-25',
  },
  {
    slug: 'is-gratuity-higher-under-new-wage-code',
    clusterId: 'labour-code-wages',
    title: 'Is gratuity higher under the new wage code?',
    seoTitle: 'Is Gratuity Higher Under the New Wage Code?',
    metaDescription:
      'The 15/26 gratuity formula has not changed — the wage base it runs on has. See why that lifts the payout for every past year of service too.',
    question: 'Does the new wage definition increase my gratuity payout?',
    answer:
      'Yes, if your basic sits below half of your cash pay. The formula itself is unchanged: fifteen days of wages for every completed year of service, using a twenty-six day month. What changes is the wage base the formula runs on. Because gratuity is calculated on last drawn wages rather than on an average across your service, a higher base applies to every completed year — not only to the years worked after the restructuring. That is why the effect on long-serving employees is much larger than the monthly numbers suggest. Two eligibility rules sit alongside the arithmetic. Permanent employees generally qualify after five years of continuous service, while fixed-term employees accrue from one year under the Code on Social Security. The statutory ceiling holds the payable amount at ₹20 lakh however large the calculation becomes, and gratuity up to that ceiling is exempt from income tax for employees covered by the Act.',
    example:
      'An employee with ten completed years, basic of ₹30,000 and cash pay of ₹1,00,000 would receive about ₹1.73 lakh on the current base. On a revised base of ₹50,000, the same ten years produce about ₹2.88 lakh — roughly ₹1.15 lakh more, applied retrospectively to all ten years.',
    keyPoints: [
      'The 15/26 formula is unchanged; only the wage base moved.',
      'Gratuity runs on last drawn wages, so past years benefit too.',
      'The ₹20 lakh statutory ceiling still caps the payout.',
    ],
    lastReviewedIso: '2026-08-25',
  },
  {
    slug: 'does-employer-pf-rise-under-new-wage-code',
    clusterId: 'labour-code-wages',
    title: 'Does my employer’s PF contribution rise too?',
    seoTitle: 'Does Employer PF Rise Under the New Wage Code?',
    metaDescription:
      'Employer PF is 12% of the same wage base as yours, so it rises in step — unless your employer contributes on the ₹15,000 statutory ceiling.',
    question: 'Does my employer also contribute more to provident fund?',
    answer:
      'It depends entirely on which base your employer uses. Provident fund is contributed at 12% by the employee and 12% by the employer on the same definition of wages, so if that base rises, both contributions rise together. That is what makes the change worth more to you than the reduction in take-home: two contributions increase while only one deduction comes out of your pay. But employers have a choice. Contributions can be made on actual wages, or restricted to the statutory wage ceiling of ₹15,000 a month. An employer applying the ceiling was already contributing ₹1,800 and will continue to contribute ₹1,800 however far the wage base rises, so the restructuring barely moves provident fund at all — only gratuity accrual still tracks the higher base. Check a recent payslip: if the provident fund line is exactly ₹1,800, your employer is using the ceiling.',
    example:
      'On a revised wage base of ₹46,000, an employer contributing on actual wages pays about ₹5,500 a month against ₹3,600 before. An employer applying the ₹15,000 ceiling pays ₹1,800 in both cases, and your take-home barely moves.',
    keyPoints: [
      'Employer and employee contributions use the same wage definition.',
      'A ₹1,800 provident fund line on your payslip means the ceiling is being applied.',
      'Under the ceiling, only gratuity accrual responds to the higher base.',
    ],
    lastReviewedIso: '2026-08-25',
  },
  {
    slug: 'how-8th-cpc-arrears-are-calculated',
    clusterId: 'eighth-cpc-arrears',
    title: 'How are 8th Pay Commission arrears calculated?',
    seoTitle: 'How 8th Pay Commission Arrears Are Calculated',
    metaDescription:
      'Arrears are the monthly pay difference multiplied by the months between the effective date and the payment date. Here is the method and its unknowns.',
    question: 'How will 8th Pay Commission arrears be worked out?',
    answer:
      'The method is simple; the inputs are not yet known. Arrears are the difference between your revised eligible monthly pay and your current eligible monthly pay, multiplied by the number of whole months between the date a revised structure takes effect and the date it is actually paid. Eligible pay means the components that are revised — basic and the allowances recalculated on it — rather than your full gross. Departments may then apply one-time deductions before release. Two of the three inputs are unsettled. No fitment factor has been notified, so revised pay is a scenario rather than a figure. No implementation date has been notified either, so the number of months is also an assumption. What is settled is the arithmetic and the reference point: the commission was constituted by gazette notification in November 2025, and commentary widely expects any revision to be effective from a date on which arrears would then accumulate until payment.',
    example:
      'If revised eligible pay were ₹1,15,000 against current eligible pay of ₹85,000, the monthly difference is ₹30,000. Across an assumed twelve-month gap between effective date and payment date, gross arrears would be ₹3.6 lakh before any deductions. Change either assumption and the figure changes with it.',
    keyPoints: [
      'Arrears = monthly pay difference × months between effective and payment dates.',
      'Neither the fitment factor nor the effective date has been notified.',
      'Use eligible revised pay, not full gross, for the difference.',
    ],
    lastReviewedIso: '2026-08-25',
  },
  {
    slug: 'does-da-merge-reduce-8th-cpc-benefit',
    clusterId: 'eighth-cpc-arrears',
    title: 'Does the DA merge reduce the 8th CPC benefit?',
    seoTitle: 'Does the DA Merge Cut Your 8th Pay Commission Raise?',
    metaDescription:
      'A 2.86× fitment factor is not a 186% raise. Accumulated DA is folded into revised basic, so compare revised gross against current gross.',
    question: 'Why is my raise smaller than the fitment factor suggests?',
    answer:
      'Because the fitment factor multiplies basic pay, but much of what it appears to add is dearness allowance you already receive. Dearness allowance climbs over the life of a pay commission as compensation for inflation. When a new structure takes effect, that accumulated allowance is folded into the revised basic and the percentage restarts near zero. So a factor applied to basic alone flatters the comparison: it is measured against a number that excludes a large part of your current pay. The correct comparison is revised gross against current gross. At an assumed 60% dearness allowance rate, an employee on ₹44,900 basic is already receiving about ₹71,840 in basic plus allowance. A 2.86× factor takes basic to ₹1,28,414 — which looks like a 186% rise against basic, but is a 79% rise against what is actually received. That is still substantial. It is simply not the number in the headlines.',
    example:
      'At Level 7, basic of ₹44,900 with 60% dearness allowance gives ₹71,840 today. Under a 1.92× scenario, revised basic is ₹86,208 — a 20% gain on current pay, not 92%. Under 2.57×, revised basic is ₹1,15,393, a 61% gain rather than 157%.',
    keyPoints: [
      'The fitment factor applies to basic, not to gross pay.',
      'Accumulated DA is merged into revised basic and then restarts near zero.',
      'Always compare revised gross against current gross.',
    ],
    lastReviewedIso: '2026-08-25',
  },
];
