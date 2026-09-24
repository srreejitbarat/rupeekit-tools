// Recurring statutory dates for the Indian tax year.
//
// Only dates fixed by statute or long-standing rule are listed. Filing due
// dates that the CBDT extends by circular from year to year are marked so, and
// no extension is ever presented here as though it had already been granted.

export type DeadlineConfidence = 'statutory' | 'commonly-extended';

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
    who: 'Anyone whose tax liability after TDS exceeds ₹10,000 in the year',
    detail:
      'Fifteen per cent of your estimated liability for the year is due. Shortfalls attract interest under sections 234B and 234C, which is why the instalment matters even when the amount is small.',
    confidence: 'statutory',
    relatedHref: '/tools/income-tax-calculator-old-vs-new-regime-india',
    relatedLabel: 'Estimate your liability first',
  },
  {
    id: 'form-16',
    date: '15 June',
    monthOrder: 3,
    title: 'Form 16 issued by employers',
    who: 'Salaried employees',
    detail:
      'Employers issue Form 16 for the previous financial year by this date. Check it against your own payslips and Form 26AS before filing, because corrections take time to flow through.',
    confidence: 'statutory',
  },
  {
    id: 'itr-non-audit',
    date: '31 July',
    monthOrder: 4,
    title: 'Income tax return due — non-audit cases',
    who: 'Salaried individuals and others not subject to audit',
    detail:
      'The statutory due date for most individual filers. The CBDT has extended this date in several recent years, but an extension is announced by circular and cannot be assumed in advance. File on the statutory date unless an extension has actually been notified.',
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
      'Quarterly TDS statements are due one month after the quarter ends. Late filing carries a daily fee under section 234E, and unfiled statements are the usual reason credit is missing from an employee’s Form 26AS.',
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
      'Applies where accounts must be audited under section 44AB. The audit report itself is generally due a month earlier, and both dates have been extended in some years.',
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
    title: 'Belated and revised returns',
    who: 'Anyone who missed the due date or needs to correct a filed return',
    detail:
      'The last ordinary opportunity to file late or revise a return for the assessment year. A belated return carries a fee under section 234F and forfeits the right to carry forward certain losses.',
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
      'The full estimated liability must be paid by this date. Taxpayers under the presumptive schemes in sections 44AD and 44ADA pay their entire advance tax in this single instalment rather than in four.',
    confidence: 'statutory',
    relatedHref: '/tools/income-tax-calculator-old-vs-new-regime-india',
    relatedLabel: 'Check your liability',
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
      'The final quarterly statement for the year just ended. Form 16 is generated from it, which is why employers cannot issue Form 16 before this statement is filed.',
    confidence: 'statutory',
  },
];

export const SMALL_SAVINGS_REVIEW_QUARTERS = [
  'April to June',
  'July to September',
  'October to December',
  'January to March',
];
