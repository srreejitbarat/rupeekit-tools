import { describe, expect, it } from 'vitest';
import {
  CGEGIS_BY_GROUP,
  COMPARISON_FACTORS,
  CURRENT_HRA_FLOORS,
  PAY_LEVEL_BANDS,
  SEVENTH_CPC_MINIMUM_BASIC,
} from '../../data/eighth-cpc-pay-matrix';
import {
  buildEmployeeScenarioTable,
  buildPensionerScenarioTable,
  calculateEighthCpcEmployee,
  calculateEighthCpcPensioner,
  deriveHraFloors,
  monthsAccrued,
  resolveTransportAllowance,
  roundToHundred,
} from './eighth-cpc-scenario';

const employeeBase = {
  currentBasic: 44_900,
  payLevel: '7',
  cityClass: 'X' as const,
  transportCity: 'higher' as const,
  pensionScheme: 'NPS' as const,
  employeeGroup: 'B' as const,
  fitmentFactor: 2.28,
  currentDaPercent: 60,
};

describe('roundToHundred', () => {
  it('fixes revised pay at the nearest hundred', () => {
    expect(roundToHundred(102_372)).toBe(102_400);
    expect(roundToHundred(102_320)).toBe(102_300);
    expect(roundToHundred(0)).toBe(0);
  });

  it('returns zero for non-finite input', () => {
    expect(roundToHundred(Number.NaN)).toBe(0);
  });
});

describe('deriveHraFloors', () => {
  it('scales the 7th CPC floors by the fitment factor', () => {
    // 18,000 x 1.92 = 34,560, fixed at 34,600. Floors are 30/20/10 percent of
    // that, mirroring how the current Rs 5,400/3,600/1,800 floors relate to
    // the Rs 18,000 minimum basic.
    const floors = deriveHraFloors(1.92);

    expect(floors.projectedMinimumBasic).toBe(34_600);
    expect(floors.X).toBe(10_400);
    expect(floors.Y).toBe(6_900);
    expect(floors.Z).toBe(3_500);
  });

  it('reproduces the current floors exactly at a factor of one', () => {
    const floors = deriveHraFloors(1);

    expect(floors.projectedMinimumBasic).toBe(SEVENTH_CPC_MINIMUM_BASIC);
    expect(floors.X).toBe(CURRENT_HRA_FLOORS.X);
    expect(floors.Y).toBe(CURRENT_HRA_FLOORS.Y);
    expect(floors.Z).toBe(CURRENT_HRA_FLOORS.Z);
  });
});

describe('HRA floor protection', () => {
  it('applies the floor for a minimum-basic X-city employee', () => {
    // 34,600 x 24% = 8,304, which is below the 10,400 floor. Without the
    // floor this employee would lose HRA when the rate reverts to 24%.
    const result = calculateEighthCpcEmployee({
      ...employeeBase,
      currentBasic: SEVENTH_CPC_MINIMUM_BASIC,
      payLevel: '1',
      fitmentFactor: 1.92,
      employeeGroup: 'C',
    });

    expect(result.hraFloorApplied).toBe(true);
    expect(result.revisedHra).toBe(10_400);
  });

  it('does not apply the floor once the percentage clears it', () => {
    const result = calculateEighthCpcEmployee(employeeBase);

    expect(result.hraFloorApplied).toBe(false);
    // 44,900 x 2.28 = 102,372, fixed at 102,400; 24% of that is 24,576.
    expect(result.revisedBasic).toBe(102_400);
    expect(result.revisedHra).toBeCloseTo(24_576, 2);
  });
});

describe('calculateEighthCpcEmployee', () => {
  it('resets DA to zero on the revised structure', () => {
    const result = calculateEighthCpcEmployee(employeeBase);

    expect(result.revisedDa).toBe(0);
    expect(result.currentDa).toBeCloseTo(26_940, 2);
  });

  it('pays DA on transport allowance in the current baseline only', () => {
    const result = calculateEighthCpcEmployee(employeeBase);

    expect(result.transportAllowance).toBe(3_600);
    expect(result.currentDaOnTransport).toBeCloseTo(2_160, 2);
    // Revised gross carries the transport allowance with no DA on top.
    expect(result.revisedGross).toBeCloseTo(102_400 + 24_576 + 3_600, 2);
  });

  it('splits NPS into an employee deduction and a separate government cost', () => {
    const result = calculateEighthCpcEmployee(employeeBase);

    expect(result.revisedEmployeeContribution).toBeCloseTo(10_240, 2);
    expect(result.revisedGovernmentContribution).toBeCloseTo(14_336, 2);
    // The government share is a CTC line, not a deduction from net pay.
    expect(result.revisedNet).toBeCloseTo(
      result.revisedGross - 10_240 - CGEGIS_BY_GROUP.B,
      2
    );
    expect(result.revisedCtc).toBeCloseTo(result.revisedGross + 14_336, 2);
  });

  it('charges no pension deduction under OPS', () => {
    const result = calculateEighthCpcEmployee({ ...employeeBase, pensionScheme: 'OPS' });

    expect(result.revisedEmployeeContribution).toBe(0);
    expect(result.revisedGovernmentContribution).toBe(0);
    expect(result.revisedNet).toBeCloseTo(result.revisedGross - CGEGIS_BY_GROUP.B, 2);
  });

  it('applies the higher UPS government outgo', () => {
    const result = calculateEighthCpcEmployee({ ...employeeBase, pensionScheme: 'UPS' });

    expect(result.schemeGovernmentRate).toBe(18.5);
    expect(result.revisedGovernmentContribution).toBeCloseTo(102_400 * 0.185, 2);
  });

  it('reports a gross change far smaller than the headline factor', () => {
    const result = calculateEighthCpcEmployee(employeeBase);

    // Basic rises 128% but gross rises far less, because current DA is
    // already in the baseline and is merged rather than added.
    expect(result.basicChangePercent).toBeGreaterThan(120);
    expect(result.grossChangePercent).toBeLessThan(result.basicChangePercent / 2);
  });

  it('deducts CGEGIS by group', () => {
    expect(calculateEighthCpcEmployee({ ...employeeBase, employeeGroup: 'A' }).cgegis).toBe(120);
    expect(calculateEighthCpcEmployee({ ...employeeBase, employeeGroup: 'B' }).cgegis).toBe(60);
    expect(calculateEighthCpcEmployee({ ...employeeBase, employeeGroup: 'C' }).cgegis).toBe(30);
  });

  it('treats non-finite input as zero rather than producing NaN', () => {
    const result = calculateEighthCpcEmployee({
      ...employeeBase,
      currentBasic: Number.NaN,
      fitmentFactor: Number.NaN,
    });

    expect(result.revisedBasic).toBe(0);
    expect(result.basicChangePercent).toBe(0);
    // No HRA floor is invented for pay that was never entered.
    expect(result.currentHra).toBe(0);
    expect(result.revisedHra).toBe(0);
    expect(result.hraFloorApplied).toBe(false);
    Object.values(result).forEach((value) => {
      if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
    });
  });
});

describe('resolveTransportAllowance', () => {
  it('uses the entry band for levels 1 and 2 below the upgrade threshold', () => {
    expect(resolveTransportAllowance('1', 18_000, 'higher')).toBe(1_350);
    expect(resolveTransportAllowance('1', 18_000, 'other')).toBe(900);
  });

  it('upgrades levels 1 and 2 once basic pay reaches Rs 24,200', () => {
    expect(resolveTransportAllowance('2', 24_200, 'higher')).toBe(3_600);
    expect(resolveTransportAllowance('2', 24_200, 'other')).toBe(1_800);
  });

  it('uses the apex band from level 9 upward', () => {
    expect(resolveTransportAllowance('9', 53_100, 'higher')).toBe(7_200);
    expect(resolveTransportAllowance('14', 144_200, 'other')).toBe(3_600);
  });
});

describe('monthsAccrued', () => {
  it('counts whole months and excludes the closing month', () => {
    expect(monthsAccrued('2026-01-01', '2026-09-01')).toBe(8);
    expect(monthsAccrued('2026-01-01', '2027-01-01')).toBe(12);
  });

  it('never returns a negative period', () => {
    expect(monthsAccrued('2026-01-01', '2025-06-01')).toBe(0);
    expect(monthsAccrued('2026-01-01', '2026-01-01')).toBe(0);
  });

  it('returns zero for an unparseable date', () => {
    expect(monthsAccrued('2026-01-01', 'not-a-date')).toBe(0);
  });
});

describe('arrears', () => {
  it('multiplies the monthly gross delta by the accrued months', () => {
    const result = calculateEighthCpcEmployee({
      ...employeeBase,
      arrearsThroughIso: '2026-09-01',
    });

    expect(result.arrearsMonths).toBe(8);
    expect(result.arrears).toBeCloseTo(result.grossChange * 8, 2);
  });

  it('is zero when no accrual period is supplied', () => {
    const result = calculateEighthCpcEmployee(employeeBase);

    expect(result.arrearsMonths).toBe(0);
    expect(result.arrears).toBe(0);
  });

  it('never reports negative arrears when the scenario reduces gross pay', () => {
    const result = calculateEighthCpcEmployee({
      ...employeeBase,
      fitmentFactor: 1,
      arrearsThroughIso: '2026-09-01',
    });

    expect(result.grossChange).toBeLessThan(0);
    expect(result.arrears).toBe(0);
  });
});

describe('calculateEighthCpcPensioner', () => {
  const pensionerBase = {
    currentBasicPension: 31_550,
    fitmentFactor: 2.28,
    currentDrPercent: 60,
  };

  it('applies the factor to basic pension and resets dearness relief', () => {
    const result = calculateEighthCpcPensioner(pensionerBase);

    // 31,550 x 2.28 = 71,934, fixed at 71,900.
    expect(result.revisedBasicPension).toBe(71_900);
    expect(result.revisedDr).toBe(0);
    expect(result.currentTotal).toBeCloseTo(31_550 * 1.6, 2);
  });

  it('computes arrears on the total pension delta', () => {
    const result = calculateEighthCpcPensioner({
      ...pensionerBase,
      arrearsThroughIso: '2026-09-01',
    });

    expect(result.arrearsMonths).toBe(8);
    expect(result.arrears).toBeCloseTo(result.change * 8, 2);
  });
});

describe('scenario tables', () => {
  it('returns one row per published fitment scenario', () => {
    const rows = buildEmployeeScenarioTable(employeeBase, COMPARISON_FACTORS);

    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.fitmentFactor)).toEqual([1.92, 2.28, 2.57, 2.86, 3]);
  });

  it('increases revised basic monotonically with the factor', () => {
    const rows = buildEmployeeScenarioTable(employeeBase, COMPARISON_FACTORS);

    for (let index = 1; index < rows.length; index += 1) {
      expect(rows[index].revisedBasic).toBeGreaterThan(rows[index - 1].revisedBasic);
    }
  });

  it('builds a pensioner table with no HRA floor flag', () => {
    const rows = buildPensionerScenarioTable(
      { currentBasicPension: 31_550, fitmentFactor: 2.28, currentDrPercent: 60 },
      COMPARISON_FACTORS
    );

    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.hraFloorApplied === false)).toBe(true);
  });
});

describe('pay level bands', () => {
  it('covers levels 1 to 18 including 13A', () => {
    expect(PAY_LEVEL_BANDS).toHaveLength(19);
    expect(PAY_LEVEL_BANDS[0].level).toBe('1');
    expect(PAY_LEVEL_BANDS.at(-1)?.level).toBe('18');
    expect(PAY_LEVEL_BANDS.some((band) => band.level === '13A')).toBe(true);
  });

  it('keeps every band ordered and internally consistent', () => {
    PAY_LEVEL_BANDS.forEach((band) => {
      expect(band.maxBasic).toBeGreaterThanOrEqual(band.minBasic);
    });

    for (let index = 1; index < PAY_LEVEL_BANDS.length; index += 1) {
      expect(PAY_LEVEL_BANDS[index].minBasic).toBeGreaterThan(PAY_LEVEL_BANDS[index - 1].minBasic);
    }
  });
});
