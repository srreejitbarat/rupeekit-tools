// Recurring statutory dates for the Indian tax year.
//
// Only dates fixed by statute or long-standing rule are listed. Filing due
// dates that the CBDT extends by circular from year to year are marked so, and
// no extension is ever presented here as though it had already been granted.

export type DeadlineConfidence = 'statutory' | 'commonly-extended';

export const TAX_DEADLINES_LAST_REVIEWED = '2026-11-09';

export type TaxDeadline = {
  id: string;
  date: string;
  /** Sort key within the financial year, April = 1. */
  monthOrder: number;
  title: string;
  who: string;
  detail: string;
  confidence: DeadlineConfidence;
  relatedHref?: string;
  relatedLabel?: string;
};

export const DEADLINE_CONFIDENCE_LABEL: Record<DeadlineConfidence, string> = {
  statutory: 'Fixed by statute',
  'commonly-extended': 'Often extended by circular',
};

export const TAX_DEADLINES: TaxDeadline[] = [
  {
    id: 'advance-tax-q1',
    date: '15 June',
    monthOrder: 3,
    title: 'First advance tax instalment',
    who: 'People who still owe ₹10,000 or more after tax deducted at source',
    detail:
      'Pay 15% of your estimated tax for the year. Resident senior citizens with no business or professional income are exempt from advance tax.',
    confidence: 'statutory',
    relatedHref: '/tools/income-tax-calculator-old-vs-new-regime-india',
    relatedLabel: 'Estimate your liability first',
  },
  {
    id: 'form-16',
    date: '15 June',
    monthOrder: 3,
    title: 'Salary TDS certificate due from employers',
    who: 'Salaried employees',
    detail:
      'Check the certificate against your payslips and the tax credit shown on the income tax portal before you file.',
    confidence: 'statutory',
  },
  {
    id: 'itr-non-audit',
    date: '31 July',
    monthOrder: 4,
    title: 'Income tax return due — non-audit cases',
    who: 'Most salaried people and other filers without business income',
    detail:
      'Use 31 July if this is your filing category. Check the income tax portal for any extension that applies to you.',
    confidence: 'commonly-extended',
    relatedHref: '/blog/itr-2-ay-2026-27-filing-guide',
    relatedLabel: 'ITR-2 filing guide',
  },
  {
    id: 'tds-q1',
    date: '31 July',
    monthOrder: 4,
    title: 'TDS return for the April–June quarter',
    who: 'Deductors, including employers',
    detail:
      'Employers report tax deducted in April, May and June. If the tax credit is missing on the income tax portal, ask your employer to check the statement.',
    confidence: 'statutory',
  },
  {
    id: 'itr-business-non-audit',
    date: '31 August',
    monthOrder: 5,
    title: 'Income tax return due for eligible businesses without an audit',
    who: 'People with business or professional income in the non-audit category',
    detail: 'The law gives this category until 31 August. A separate deadline applies if you have a transfer pricing reporting requirement.',
    confidence: 'statutory',
  },
  {
    id: 'advance-tax-q2',
    date: '15 September',
    monthOrder: 6,
    title: 'Second advance tax instalment',
    who: 'Anyone paying advance tax',
    detail:
      'Cumulative payment must reach forty-five per cent of estimated liability. The instalments are cumulative, so a shortfall in June can be made up here — with interest on the gap.',
    confidence: 'statutory',
  },
  {
    id: 'itr-audit',
    date: '31 October',
    monthOrder: 7,
    title: 'Income tax return due — audit cases',
    who: 'Businesses and professionals subject to tax audit',
    detail:
      'This is the usual return deadline for cases requiring a tax audit. Check the current extension and whether a separate transfer pricing deadline applies.',
    confidence: 'commonly-extended',
  },
  {
    id: 'tds-q2',
    date: '31 October',
    monthOrder: 7,
    title: 'TDS return for the July–September quarter',
    who: 'Deductors, including employers',
    detail:
      'The second quarterly statement. Employees who find credit missing from Form 26AS after this date should raise it with their employer rather than waiting until filing season.',
    confidence: 'statutory',
  },
  {
    id: 'advance-tax-q3',
    date: '15 December',
    monthOrder: 9,
    title: 'Third advance tax instalment',
    who: 'Anyone paying advance tax',
    detail:
      'Cumulative payment must reach seventy-five per cent of estimated liability. For most salaried people with only employment income, TDS already covers this and no separate payment is needed.',
    confidence: 'statutory',
  },
  {
    id: 'belated-return',
    date: '31 December',
    monthOrder: 9,
    title: 'Last date for a late return',
    who: 'People who missed their original filing deadline',
    detail:
      'You can usually file a late return up to 31 December, or until the tax department completes your assessment if that happens sooner. Late filing can cost you a fee.',
    confidence: 'statutory',
  },
  {
    id: 'tds-q3',
    date: '31 January',
    monthOrder: 10,
    title: 'TDS return for the October–December quarter',
    who: 'Deductors, including employers',
    detail:
      'The third quarterly statement. This is the last one filed before the financial year closes, so it is the practical deadline for fixing credit errors that would otherwise surface at filing.',
    confidence: 'statutory',
  },
  {
    id: 'advance-tax-q4',
    date: '15 March',
    monthOrder: 12,
    title: 'Final advance tax instalment',
    who: 'Anyone paying advance tax, including presumptive taxpayers',
    detail:
      'Pay the rest of your estimated tax by this date. Eligible small businesses and professionals using presumptive tax can pay it all in this instalment.',
    confidence: 'statutory',
    relatedHref: '/tools/income-tax-calculator-old-vs-new-regime-india',
    relatedLabel: 'Check your liability',
  },
  {
    id: 'revised-return',
    date: '31 March',
    monthOrder: 12,
    title: 'Last date to correct a return you already filed',
    who: 'People revising a return from Assessment Year 2026–27 onward',
    detail: 'You can usually revise up to 31 March, or until the tax department completes your assessment if that happens sooner. A fee applies to revisions after 31 December.',
    confidence: 'statutory',
  },
  {
    id: 'investment-proofs',
    date: '31 March',
    monthOrder: 12,
    title: 'Last date for tax-saving investments',
    who: 'Anyone claiming deductions under the old regime',
    detail:
      'Investments and payments must be made within the financial year to count. This is also the minimum-deposit deadline for PPF and Sukanya Samriddhi accounts — missing it makes the account dormant until a penalty is paid.',
    confidence: 'statutory',
    relatedHref: '/tools/80c-deduction-calculator-india',
    relatedLabel: '80C deduction calculator',
  },
  {
    id: 'tds-q4',
    date: '31 May',
    monthOrder: 2,
    title: 'TDS return for the January–March quarter',
    who: 'Deductors, including employers',
    detail:
      'This is the final quarterly statement for the tax year that ended in March. Your annual salary TDS certificate includes this quarter.',
    confidence: 'statutory',
  },
];

export const SMALL_SAVINGS_REVIEW_QUARTERS = [
  'April to June',
  'July to September',
  'October to December',
  'January to March',
];
