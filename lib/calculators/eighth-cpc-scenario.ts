// 8th CPC scenario arithmetic.
//
// Deterministic, pure, client-side. Every function takes a user-selected
// fitment factor and returns a projection; nothing here encodes an official
// 8th CPC decision, because none exists. The Commission was constituted on
// 3 November 2025 with an 18-month reporting window and has not notified a
// fitment factor, pay matrix, HRA structure, transport-allowance rate or
// pension formula.

import {
  ARREARS_REFERENCE_ISO,
  CGEGIS_BY_GROUP,
  CURRENT_HRA_FLOORS,
  CURRENT_HRA_RATES,
  ENTRY_BAND_TA_UPGRADE_BASIC,
  HRA_FLOOR_RATE_OF_MINIMUM,
  PROJECTED_HRA_RATES,
  SCHEME_CONTRIBUTIONS,
  SEVENTH_CPC_MINIMUM_BASIC,
  TRANSPORT_ALLOWANCE,
  getPayLevelBand,
  type CityClass,
  type EmployeeGroup,
  type PensionScheme,
  type TransportCityClass,
} from '../../data/eighth-cpc-pay-matrix';

export const EIGHTH_CPC_RULESET_VERSION = '2026-09-03.1';

const nonNegative = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

/** Revised basic pay is conventionally fixed at a round hundred. */
export function roundToHundred(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / 100) * 100;
}

export type HraFloors = Record<CityClass, number> & { projectedMinimumBasic: number };

/**
 * On a new commission DA resets to 0% and HRA reverts from 30/20/10 to
 * 24/16/8. Without a floor, an entry-level employee in an X-city would take a
 * pay cut on the HRA line alone. The 7th CPC handles this with minimum HRA
 * amounts (Rs 5,400 / 3,600 / 1,800) that are exactly 30/20/10 percent of the
 * Rs 18,000 minimum basic. Scaling that same relationship by the fitment
 * factor keeps the protection intact at any multiplier.
 */
export function deriveHraFloors(fitmentFactorInput: number): HraFloors {
  const fitmentFactor = nonNegative(fitmentFactorInput);
  const projectedMinimumBasic = roundToHundred(SEVENTH_CPC_MINIMUM_BASIC * fitmentFactor);

  return {
    projectedMinimumBasic,
    X: roundToHundred((projectedMinimumBasic * HRA_FLOOR_RATE_OF_MINIMUM.X) / 100),
    Y: roundToHundred((projectedMinimumBasic * HRA_FLOOR_RATE_OF_MINIMUM.Y) / 100),
    Z: roundToHundred((projectedMinimumBasic * HRA_FLOOR_RATE_OF_MINIMUM.Z) / 100),
  };
}

/**
 * 7th CPC transport allowance. Levels 1 and 2 move up to the middle band once
 * basic pay reaches Rs 24,200.
 */
export function resolveTransportAllowance(
  level: string,
  basicPay: number,
  transportCity: TransportCityClass
) {
  const band = getPayLevelBand(level);
  const bandKey = band?.transportBand ?? 'middle';
  const upgraded = bandKey === 'entry' && nonNegative(basicPay) >= ENTRY_BAND_TA_UPGRADE_BASIC;
  return TRANSPORT_ALLOWANCE[upgraded ? 'middle' : bandKey][transportCity];
}

/** Whole months accrued between two ISO dates, excluding the closing month. */
export function monthsAccrued(fromIso: string, throughIso: string) {
  const from = new Date(`${fromIso.slice(0, 7)}-01T00:00:00Z`);
  const through = new Date(`${throughIso.slice(0, 7)}-01T00:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(through.getTime())) return 0;

  const months =
    (through.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (through.getUTCMonth() - from.getUTCMonth());
  return Math.max(0, months);
}

export type EighthCpcEmployeeInputs = {
  currentBasic: number;
  payLevel: string;
  cityClass: CityClass;
  transportCity: TransportCityClass;
  pensionScheme: PensionScheme;
  employeeGroup: EmployeeGroup;
  fitmentFactor: number;
  currentDaPercent: number;
  /** Optional override for the carried-forward transport allowance. */
  transportAllowanceOverride?: number;
  arrearsThroughIso?: string;
};

export type EighthCpcEmployeeResult = ReturnType<typeof calculateEighthCpcEmployee>;

export function calculateEighthCpcEmployee(inputs: EighthCpcEmployeeInputs) {
  const currentBasic = nonNegative(inputs.currentBasic);
  const fitmentFactor = nonNegative(inputs.fitmentFactor);
  const currentDaPercent = nonNegative(inputs.currentDaPercent);
  const { cityClass, transportCity, pensionScheme, employeeGroup, payLevel } = inputs;

  const transportAllowance =
    inputs.transportAllowanceOverride !== undefined
      ? nonNegative(inputs.transportAllowanceOverride)
      : resolveTransportAllowance(payLevel, currentBasic, transportCity);

  const cgegis = CGEGIS_BY_GROUP[employeeGroup];
  const scheme = SCHEME_CONTRIBUTIONS[pensionScheme];

  // --- Current 7th CPC position -------------------------------------------
  const currentDa = (currentBasic * currentDaPercent) / 100;
  const currentHraUncapped = (currentBasic * CURRENT_HRA_RATES[cityClass]) / 100;
  // A minimum-HRA floor only protects an actual pay figure; with no basic pay
  // entered there is nothing to floor.
  const currentHra = currentBasic > 0
    ? Math.max(currentHraUncapped, CURRENT_HRA_FLOORS[cityClass])
    : 0;
  // DA is payable on transport allowance as well as on basic pay.
  const currentDaOnTransport = (transportAllowance * currentDaPercent) / 100;
  const currentGross =
    currentBasic + currentDa + currentHra + transportAllowance + currentDaOnTransport;
  const currentEmployeeContribution = ((currentBasic + currentDa) * scheme.employee) / 100;
  const currentGovernmentContribution = ((currentBasic + currentDa) * scheme.government) / 100;
  const currentNet = currentGross - currentEmployeeContribution - cgegis;

  // --- Projected 8th CPC scenario -----------------------------------------
  const revisedBasic = roundToHundred(currentBasic * fitmentFactor);
  // Accumulated DA is merged into the revised basic, so DA restarts at zero.
  const revisedDa = 0;
  const floors = deriveHraFloors(fitmentFactor);
  const revisedHraUncapped = (revisedBasic * PROJECTED_HRA_RATES[cityClass]) / 100;
  const revisedHraFloor = floors[cityClass];
  const hraFloorApplied = revisedBasic > 0 && revisedHraUncapped < revisedHraFloor;
  const revisedHra = revisedBasic > 0 ? Math.max(revisedHraUncapped, revisedHraFloor) : 0;
  // With DA reset to zero there is no DA component on transport allowance.
  const revisedGross = revisedBasic + revisedDa + revisedHra + transportAllowance;
  const revisedEmployeeContribution = ((revisedBasic + revisedDa) * scheme.employee) / 100;
  const revisedGovernmentContribution = ((revisedBasic + revisedDa) * scheme.government) / 100;
  const revisedNet = revisedGross - revisedEmployeeContribution - cgegis;

  // --- Deltas and arrears --------------------------------------------------
  const basicChange = revisedBasic - currentBasic;
  const grossChange = revisedGross - currentGross;
  const netChange = revisedNet - currentNet;
  const arrearsMonths = inputs.arrearsThroughIso
    ? monthsAccrued(ARREARS_REFERENCE_ISO, inputs.arrearsThroughIso)
    : 0;

  return {
    fitmentFactor,
    transportAllowance,
    cgegis,
    schemeEmployeeRate: scheme.employee,
    schemeGovernmentRate: scheme.government,

    currentBasic,
    currentDa,
    currentDaPercent,
    currentHra,
    currentHraRate: CURRENT_HRA_RATES[cityClass],
    currentDaOnTransport,
    currentGross,
    currentEmployeeContribution,
    currentGovernmentContribution,
    currentNet,

    revisedBasic,
    revisedDa,
    revisedHra,
    revisedHraRate: PROJECTED_HRA_RATES[cityClass],
    revisedHraFloor,
    hraFloorApplied,
    revisedGross,
    revisedEmployeeContribution,
    revisedGovernmentContribution,
    revisedNet,
    revisedCtc: revisedGross + revisedGovernmentContribution,

    basicChange,
    basicChangePercent: currentBasic > 0 ? (basicChange / currentBasic) * 100 : 0,
    grossChange,
    grossChangePercent: currentGross > 0 ? (grossChange / currentGross) * 100 : 0,
    netChange,
    netChangePercent: currentNet > 0 ? (netChange / currentNet) * 100 : 0,

    arrearsMonths,
    arrears: Math.max(0, grossChange) * arrearsMonths,
  };
}

export type EighthCpcPensionerInputs = {
  currentBasicPension: number;
  fitmentFactor: number;
  currentDrPercent: number;
  arrearsThroughIso?: string;
};

export type EighthCpcPensionerResult = ReturnType<typeof calculateEighthCpcPensioner>;

export function calculateEighthCpcPensioner(inputs: EighthCpcPensionerInputs) {
  const currentBasicPension = nonNegative(inputs.currentBasicPension);
  const fitmentFactor = nonNegative(inputs.fitmentFactor);
  const currentDrPercent = nonNegative(inputs.currentDrPercent);

  const currentDr = (currentBasicPension * currentDrPercent) / 100;
  const currentTotal = currentBasicPension + currentDr;

  const revisedBasicPension = roundToHundred(currentBasicPension * fitmentFactor);
  // Dearness relief resets alongside DA when a new structure takes effect.
  const revisedDr = 0;
  const revisedTotal = revisedBasicPension + revisedDr;

  const change = revisedTotal - currentTotal;
  const arrearsMonths = inputs.arrearsThroughIso
    ? monthsAccrued(ARREARS_REFERENCE_ISO, inputs.arrearsThroughIso)
    : 0;

  return {
    fitmentFactor,
    currentBasicPension,
    currentDr,
    currentDrPercent,
    currentTotal,
    revisedBasicPension,
    revisedDr,
    revisedTotal,
    basicChange: revisedBasicPension - currentBasicPension,
    basicChangePercent:
      currentBasicPension > 0
        ? ((revisedBasicPension - currentBasicPension) / currentBasicPension) * 100
        : 0,
    change,
    changePercent: currentTotal > 0 ? (change / currentTotal) * 100 : 0,
    arrearsMonths,
    arrears: Math.max(0, change) * arrearsMonths,
  };
}

export type ScenarioRow = {
  fitmentFactor: number;
  revisedBasic: number;
  revisedGross: number;
  revisedNet: number;
  grossChange: number;
  grossChangePercent: number;
  arrears: number;
  hraFloorApplied: boolean;
};

/**
 * The same employee across every fitment-factor scenario at once. This is the
 * comparison a single-answer snippet cannot reproduce, and the reason the page
 * never has to state one factor as if it were decided.
 */
export function buildEmployeeScenarioTable(
  inputs: EighthCpcEmployeeInputs,
  factors: number[]
): ScenarioRow[] {
  return factors.map((fitmentFactor) => {
    const result = calculateEighthCpcEmployee({ ...inputs, fitmentFactor });
    return {
      fitmentFactor,
      revisedBasic: result.revisedBasic,
      revisedGross: result.revisedGross,
      revisedNet: result.revisedNet,
      grossChange: result.grossChange,
      grossChangePercent: result.grossChangePercent,
      arrears: result.arrears,
      hraFloorApplied: result.hraFloorApplied,
    };
  });
}

export function buildPensionerScenarioTable(
  inputs: EighthCpcPensionerInputs,
  factors: number[]
): ScenarioRow[] {
  return factors.map((fitmentFactor) => {
    const result = calculateEighthCpcPensioner({ ...inputs, fitmentFactor });
    return {
      fitmentFactor,
      revisedBasic: result.revisedBasicPension,
      revisedGross: result.revisedTotal,
      revisedNet: result.revisedTotal,
      grossChange: result.change,
      grossChangePercent: result.changePercent,
      arrears: result.arrears,
      hraFloorApplied: false,
    };
  });
}
