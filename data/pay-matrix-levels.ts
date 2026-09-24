// 7th CPC pay matrix entry cells, used as the starting point for 8th CPC
// scenario pages. These are settled facts about the *current* matrix.
//
// Nothing here states an 8th CPC outcome. No fitment factor, revised matrix,
// HRA slab or implementation date has been notified, so every projected figure
// on these pages is a user-visible scenario rather than a claim.

export type PayMatrixLevel = {
  level: string;
  slug: string;
  /** Cell 1 basic pay in the 7th CPC matrix. */
  entryPay: number;
  /** Pre-7th-CPC grade pay this level replaced. */
  gradePay: number;
  /** How this level is commonly described. Deliberately general: exact posts vary by department. */
  commonlyAssociatedWith: string;
  /** Whether the level carries the standard 3% annual increment. */
  hasAnnualIncrement: boolean;
};

/**
 * Levels 15 to 18 are fixed-pay apex posts held by a very small number of
 * officers. They are omitted rather than published as near-identical pages
 * with no audience.
 */
export const PAY_MATRIX_LEVELS: PayMatrixLevel[] = [
  {
    level: '1',
    slug: 'level-1',
    entryPay: 18_000,
    gradePay: 1_800,
    commonlyAssociatedWith: 'Multi-tasking staff and equivalent entry-grade posts',
    hasAnnualIncrement: true,
  },
  {
    level: '2',
    slug: 'level-2',
    entryPay: 19_900,
    gradePay: 1_900,
    commonlyAssociatedWith: 'Entry-grade clerical and support posts',
    hasAnnualIncrement: true,
  },
  {
    level: '3',
    slug: 'level-3',
    entryPay: 21_700,
    gradePay: 2_000,
    commonlyAssociatedWith: 'Constabulary and equivalent operational grades',
    hasAnnualIncrement: true,
  },
  {
    level: '4',
    slug: 'level-4',
    entryPay: 25_500,
    gradePay: 2_400,
    commonlyAssociatedWith: 'Junior clerical, stenographic and technical grades',
    hasAnnualIncrement: true,
  },
  {
    level: '5',
    slug: 'level-5',
    entryPay: 29_200,
    gradePay: 2_800,
    commonlyAssociatedWith: 'Senior clerical and supervisory support grades',
    hasAnnualIncrement: true,
  },
  {
    level: '6',
    slug: 'level-6',
    entryPay: 35_400,
    gradePay: 4_200,
    commonlyAssociatedWith: 'Supervisory and junior executive grades',
    hasAnnualIncrement: true,
  },
  {
    level: '7',
    slug: 'level-7',
    entryPay: 44_900,
    gradePay: 4_600,
    commonlyAssociatedWith: 'Assistant section officer and equivalent executive grades',
    hasAnnualIncrement: true,
  },
  {
    level: '8',
    slug: 'level-8',
    entryPay: 47_600,
    gradePay: 4_800,
    commonlyAssociatedWith: 'Senior executive and inspectorate grades',
    hasAnnualIncrement: true,
  },
  {
    level: '9',
    slug: 'level-9',
    entryPay: 53_100,
    gradePay: 5_400,
    commonlyAssociatedWith: 'Section officer and equivalent grades',
    hasAnnualIncrement: true,
  },
  {
    level: '10',
    slug: 'level-10',
    entryPay: 56_100,
    gradePay: 5_400,
    commonlyAssociatedWith: 'Group A entry-grade officers',
    hasAnnualIncrement: true,
  },
  {
    level: '11',
    slug: 'level-11',
    entryPay: 67_700,
    gradePay: 6_600,
    commonlyAssociatedWith: 'Under secretary and equivalent officer grades',
    hasAnnualIncrement: true,
  },
  {
    level: '12',
    slug: 'level-12',
    entryPay: 78_800,
    gradePay: 7_600,
    commonlyAssociatedWith: 'Senior time scale and equivalent officer grades',
    hasAnnualIncrement: true,
  },
  {
    level: '13',
    slug: 'level-13',
    entryPay: 123_100,
    gradePay: 8_700,
    commonlyAssociatedWith: 'Director and equivalent senior officer grades',
    hasAnnualIncrement: true,
  },
  {
    level: '14',
    slug: 'level-14',
    entryPay: 144_200,
    gradePay: 10_000,
    commonlyAssociatedWith: 'Joint secretary and equivalent senior officer grades',
    hasAnnualIncrement: true,
  },
];

/**
 * The public range of fitment factors under discussion. The low end is the
 * figure reported as the commission's lower reference point; the 2.57 mid
 * point is what the 7th CPC actually used; the high end reflects staff-side
 * demands. None of these is a notified decision.
 */
export const FITMENT_SCENARIOS = [
  { factor: 1.92, label: 'Lower reference point' },
  { factor: 2.28, label: 'Analyst central estimate' },
  { factor: 2.57, label: 'The factor the 7th CPC used' },
  { factor: 2.86, label: 'Widely reported staff-side demand' },
];

/** DA assumption used across the 8th CPC scenario pages. */
export const ASSUMED_CURRENT_DA_PERCENT = 60;

export function getPayMatrixLevel(slug: string): PayMatrixLevel | undefined {
  return PAY_MATRIX_LEVELS.find((entry) => entry.slug === slug);
}
