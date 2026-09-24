// New labour code ("50% wage rule") salary restructuring model.
//
// The Code on Wages defines "wages" as basic pay + dearness allowance +
// retaining allowance, and adds a proviso: where the excluded components
// exceed one half of all remuneration, the excess is added back to wages.
// The practical effect is a floor — wages cannot settle below 50% of the
// remuneration actually paid to the employee.
//
// RupeeKit does not assert a commencement date for the codes here. States
// notify rules separately and employers restructure on their own payroll
// cycle, so the calculator models the structural change rather than claiming
// a date on which it applies to any given reader.

export const EMPLOYEE_PF_RATE = 0.12;
export const EMPLOYER_PF_RATE = 0.12;

/** Statutory PF wage ceiling. Employers may contribute on actual wages instead. */
export const PF_WAGE_CEILING = 15_000;

/** Gratuity accrues at 15 days of wages for each completed year of service. */
export const GRATUITY_DAYS_PER_YEAR = 15;
export const GRATUITY_DIVISOR = 26;

export type LabourCodeInputs = {
  /** Total annual cost to company, in rupees. */
  annualCtc: number;
  /** Current basic + DA as a percentage of monthly CTC. */
  currentBasicPercent: number;
  /** Monthly professional tax deducted by the state. */
  monthlyProfessionalTax: number;
  /** Whether the employer's PF contribution is counted inside CTC. */
  employerPfInCtc: boolean;
  /** Whether the employer's gratuity accrual is counted inside CTC. */
  gratuityAccrualInCtc: boolean;
  /** Whether PF is contributed on the 15,000 ceiling rather than actual wages. */
  applyPfCeiling: boolean;
};

export type LabourCodeScenario = {
  /** Basic + DA treated as "wages" for PF and gratuity. */
  monthlyWages: number;
  /** Wages as a share of the cash remuneration actually paid. */
  wagesShareOfRemuneration: number;
  /** Cash remuneration before employee deductions. */
  monthlyGrossCash: number;
  monthlyEmployeePf: number;
  monthlyEmployerPf: number;
  monthlyGratuityAccrual: number;
  /** Take-home before income tax. */
  monthlyTakeHome: number;
  /** Combined retirement saving added each month. */
  monthlyRetirementSaving: number;
  annualGratuityAccrual: number;
};

export type LabourCodeResult = {
  before: LabourCodeScenario;
  after: LabourCodeScenario;
  monthlyTakeHomeChange: number;
  annualTakeHomeChange: number;
  takeHomeChangePercent: number;
  monthlyRetirementSavingChange: number;
  annualRetirementSavingChange: number;
  /** True when the current structure already satisfies the 50% floor. */
  alreadyCompliant: boolean;
};

function pfBase(monthlyWages: number, applyPfCeiling: boolean) {
  return applyPfCeiling ? Math.min(monthlyWages, PF_WAGE_CEILING) : monthlyWages;
}

function safe(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/**
 * Employer-side costs sit inside CTC, and under the new definition they are
 * themselves a function of wages — which depend on the cash remuneration left
 * after those costs. Resolving that circularity by fixed-point iteration keeps
 * the model readable; it converges in a handful of passes.
 */
function resolveScenario(
  monthlyCtc: number,
  inputs: LabourCodeInputs,
  wagesFor: (monthlyGrossCash: number) => number
): LabourCodeScenario {
  const gratuityRate = inputs.gratuityAccrualInCtc
    ? GRATUITY_DAYS_PER_YEAR / GRATUITY_DIVISOR / 12
    : 0;

  let monthlyGrossCash = monthlyCtc;

  for (let pass = 0; pass < 60; pass += 1) {
    const wages = wagesFor(monthlyGrossCash);
    const employerPf = inputs.employerPfInCtc
      ? EMPLOYER_PF_RATE * pfBase(wages, inputs.applyPfCeiling)
      : 0;
    const gratuityAccrual = gratuityRate * wages;
    const next = monthlyCtc - employerPf - gratuityAccrual;
    if (Math.abs(next - monthlyGrossCash) < 0.01) {
      monthlyGrossCash = next;
      break;
    }
    monthlyGrossCash = next;
  }

  monthlyGrossCash = safe(monthlyGrossCash);

  const monthlyWages = safe(Math.min(wagesFor(monthlyGrossCash), monthlyGrossCash));
  const monthlyEmployeePf = EMPLOYEE_PF_RATE * pfBase(monthlyWages, inputs.applyPfCeiling);
  const monthlyEmployerPf = inputs.employerPfInCtc
    ? EMPLOYER_PF_RATE * pfBase(monthlyWages, inputs.applyPfCeiling)
    : 0;
  const monthlyGratuityAccrual = (GRATUITY_DAYS_PER_YEAR / GRATUITY_DIVISOR / 12) * monthlyWages;

  const monthlyTakeHome = safe(
    monthlyGrossCash - monthlyEmployeePf - safe(inputs.monthlyProfessionalTax)
  );

  return {
    monthlyWages,
    wagesShareOfRemuneration: monthlyGrossCash > 0 ? (monthlyWages / monthlyGrossCash) * 100 : 0,
    monthlyGrossCash,
    monthlyEmployeePf,
    monthlyEmployerPf,
    monthlyGratuityAccrual,
    monthlyTakeHome,
    monthlyRetirementSaving: monthlyEmployeePf + monthlyEmployerPf + monthlyGratuityAccrual,
    annualGratuityAccrual: monthlyGratuityAccrual * 12,
  };
}

export function calculateLabourCodeImpact(inputs: LabourCodeInputs): LabourCodeResult {
  const monthlyCtc = safe(inputs.annualCtc) / 12;
  const basicShare = Math.min(Math.max(safe(inputs.currentBasicPercent), 0), 100) / 100;

  // Before: wages are whatever the payslip calls basic + DA.
  const before = resolveScenario(monthlyCtc, inputs, () => basicShare * monthlyCtc);

  // After: the 50% floor applies to the cash remuneration actually paid.
  const after = resolveScenario(monthlyCtc, inputs, (grossCash) =>
    Math.max(basicShare * monthlyCtc, 0.5 * grossCash)
  );

  const monthlyTakeHomeChange = after.monthlyTakeHome - before.monthlyTakeHome;
  const monthlyRetirementSavingChange =
    after.monthlyRetirementSaving - before.monthlyRetirementSaving;

  return {
    before,
    after,
    monthlyTakeHomeChange,
    annualTakeHomeChange: monthlyTakeHomeChange * 12,
    takeHomeChangePercent:
      before.monthlyTakeHome > 0 ? (monthlyTakeHomeChange / before.monthlyTakeHome) * 100 : 0,
    monthlyRetirementSavingChange,
    annualRetirementSavingChange: monthlyRetirementSavingChange * 12,
    alreadyCompliant: after.monthlyWages - before.monthlyWages < 1,
  };
}

export type NewWageGratuityInputs = {
  /** Monthly basic + DA as currently shown on the payslip. */
  currentMonthlyBasic: number;
  /** Monthly cash remuneration (basic + DA + all allowances). */
  monthlyGrossCash: number;
  /** Completed years of service. */
  yearsOfService: number;
  /** Fixed-term employees accrue from one year; others from five. */
  isFixedTermEmployee: boolean;
};

export type NewWageGratuityResult = {
  currentWages: number;
  revisedWages: number;
  gratuityOnCurrentWages: number;
  gratuityOnRevisedWages: number;
  gratuityIncrease: number;
  eligibilityYears: number;
  isEligible: boolean;
  /** The Payment of Gratuity Act ceiling. */
  cappedGratuity: number;
};

export const GRATUITY_CEILING = 2_000_000;

export function calculateNewWageGratuity(inputs: NewWageGratuityInputs): NewWageGratuityResult {
  const grossCash = safe(inputs.monthlyGrossCash);
  const currentWages = Math.min(safe(inputs.currentMonthlyBasic), grossCash);
  const revisedWages = Math.max(currentWages, 0.5 * grossCash);
  const years = safe(inputs.yearsOfService);

  const perYear = (wages: number) => (wages / GRATUITY_DIVISOR) * GRATUITY_DAYS_PER_YEAR;
  const gratuityOnCurrentWages = perYear(currentWages) * years;
  const gratuityOnRevisedWages = perYear(revisedWages) * years;

  const eligibilityYears = inputs.isFixedTermEmployee ? 1 : 5;

  return {
    currentWages,
    revisedWages,
    gratuityOnCurrentWages,
    gratuityOnRevisedWages,
    gratuityIncrease: gratuityOnRevisedWages - gratuityOnCurrentWages,
    eligibilityYears,
    isEligible: years >= eligibilityYears,
    cappedGratuity: Math.min(gratuityOnRevisedWages, GRATUITY_CEILING),
  };
}
