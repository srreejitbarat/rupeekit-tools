import { describe, expect, it } from 'vitest';
import {
  calculateRoomRentClaim,
  roomRentCapFromPercent,
  type RoomRentClaimInputs,
} from './insurance-claim';

const base: RoomRentClaimInputs = {
  eligibleRoomRentPerDay: 5_000,
  actualRoomRentPerDay: 8_000,
  daysAdmitted: 5,
  proratedExpenses: 150_000,
  nonProratedExpenses: 0,
  sumInsured: 1_000_000,
};

describe('calculateRoomRentClaim', () => {
  it('prorates associated expenses by the room rent ratio', () => {
    const result = calculateRoomRentClaim(base);

    expect(result.admissibleRatio).toBeCloseTo(0.625, 6);
    expect(result.proratedPayable).toBeCloseTo(150_000 * 0.625, 6);
    expect(result.proportionateDeduction).toBeCloseTo(56_250, 6);
  });

  it('costs the patient far more than the room rent gap alone', () => {
    const result = calculateRoomRentClaim(base);

    // The room gap is only 3,000 x 5 = 15,000, but proration adds 56,250 more.
    expect(result.roomRentShortfall).toBeCloseTo(15_000, 6);
    expect(result.outOfPocket).toBeCloseTo(15_000 + 56_250, 6);
    expect(result.outOfPocket).toBeGreaterThan(result.roomRentShortfall * 4);
  });

  it('applies no deduction when the room is within the cap', () => {
    const result = calculateRoomRentClaim({ ...base, actualRoomRentPerDay: 4_000 });

    expect(result.withinLimit).toBe(true);
    expect(result.admissibleRatio).toBe(1);
    expect(result.proportionateDeduction).toBe(0);
    expect(result.outOfPocket).toBe(0);
  });

  it('treats an exactly-at-cap room as within limit', () => {
    const result = calculateRoomRentClaim({ ...base, actualRoomRentPerDay: 5_000 });

    expect(result.withinLimit).toBe(true);
    expect(result.proportionateDeduction).toBe(0);
  });

  it('leaves non-prorated heads untouched', () => {
    const result = calculateRoomRentClaim({ ...base, nonProratedExpenses: 80_000 });

    // Pharmacy, implants and diagnostics are paid in full despite the ratio.
    const withoutNonProrated = calculateRoomRentClaim(base);
    expect(result.totalPayable - withoutNonProrated.totalPayable).toBeCloseTo(80_000, 6);
    expect(result.proportionateDeduction).toBeCloseTo(
      withoutNonProrated.proportionateDeduction,
      6
    );
  });

  it('caps the payout at the sum insured and flags it', () => {
    const result = calculateRoomRentClaim({ ...base, sumInsured: 50_000 });

    expect(result.cappedBySumInsured).toBe(true);
    expect(result.totalPayable).toBe(50_000);
    expect(result.outOfPocket).toBeCloseTo(result.totalBill - 50_000, 6);
  });

  it('treats a zero cap as no room rent limit', () => {
    const result = calculateRoomRentClaim({ ...base, eligibleRoomRentPerDay: 0 });

    expect(result.withinLimit).toBe(true);
    expect(result.admissibleRatio).toBe(1);
  });

  it('reconciles payable and out-of-pocket against the total bill', () => {
    const result = calculateRoomRentClaim({ ...base, nonProratedExpenses: 40_000 });

    expect(result.totalPayable + result.outOfPocket).toBeCloseTo(result.totalBill, 6);
  });

  it('returns finite zeros for empty input', () => {
    const result = calculateRoomRentClaim({
      eligibleRoomRentPerDay: 0,
      actualRoomRentPerDay: 0,
      daysAdmitted: 0,
      proratedExpenses: 0,
      nonProratedExpenses: 0,
      sumInsured: 0,
    });

    expect(Number.isFinite(result.totalPayable)).toBe(true);
    expect(result.totalPayable).toBe(0);
    expect(Number.isFinite(result.admissibleRatio)).toBe(true);
  });
});

describe('roomRentCapFromPercent', () => {
  it('converts a percent-of-sum-insured cap into rupees per day', () => {
    expect(roomRentCapFromPercent(500_000, 1)).toBeCloseTo(5_000, 6);
    expect(roomRentCapFromPercent(1_000_000, 2)).toBeCloseTo(20_000, 6);
  });
});
