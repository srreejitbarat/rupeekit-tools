// Health insurance room rent capping and proportionate deduction.
//
// Where a policy caps room rent and the insured occupies a costlier room, the
// insurer reduces the associated expenses in the same proportion — so the
// shortfall is far larger than the room rent difference alone.
//
// IRDAI guidance keeps certain heads out of that proration. Pharmacy,
// consumables, implants, diagnostics and ICU charges are commonly excluded, but
// wordings differ between policies, so those heads are entered separately here
// rather than assumed.

export type RoomRentClaimInputs = {
  /** Per-day room rent the policy allows. */
  eligibleRoomRentPerDay: number;
  /** Per-day room rent actually charged. */
  actualRoomRentPerDay: number;
  /** Nights of stay. */
  daysAdmitted: number;
  /** Expenses that move with the room category: surgeon, anaesthetist, nursing, OT. */
  proratedExpenses: number;
  /** Heads the policy does not prorate: pharmacy, consumables, implants, diagnostics, ICU. */
  nonProratedExpenses: number;
  /** Sum insured available for this claim. */
  sumInsured: number;
};

export type RoomRentClaimResult = {
  /** Proportion of prorated expenses the insurer will meet, 0 to 1. */
  admissibleRatio: number;
  /** True when the room stayed within the cap and no proration applies. */
  withinLimit: boolean;
  actualRoomCharges: number;
  eligibleRoomCharges: number;
  /** Room rent disallowed purely because of the cap. */
  roomRentShortfall: number;
  /** Prorated heads reduced by the ratio. */
  proratedPayable: number;
  /** The extra loss caused by proration, over and above the room rent gap. */
  proportionateDeduction: number;
  totalBill: number;
  /** Payable before the sum insured is applied. */
  payableBeforeSumInsured: number;
  totalPayable: number;
  /** Everything the patient pays: proration, room gap, and any sum insured overflow. */
  outOfPocket: number;
  /** True when the sum insured, not the room cap, is the binding constraint. */
  cappedBySumInsured: boolean;
};

function safe(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculateRoomRentClaim(inputs: RoomRentClaimInputs): RoomRentClaimResult {
  const eligibleRate = safe(inputs.eligibleRoomRentPerDay);
  const actualRate = safe(inputs.actualRoomRentPerDay);
  const days = safe(inputs.daysAdmitted);
  const prorated = safe(inputs.proratedExpenses);
  const nonProrated = safe(inputs.nonProratedExpenses);
  const sumInsured = safe(inputs.sumInsured);

  // A zero or absent cap means no room rent limit applies.
  const withinLimit = eligibleRate <= 0 || actualRate <= eligibleRate;
  const admissibleRatio = withinLimit ? 1 : eligibleRate / actualRate;

  const actualRoomCharges = actualRate * days;
  const eligibleRoomCharges = withinLimit ? actualRoomCharges : eligibleRate * days;
  const roomRentShortfall = actualRoomCharges - eligibleRoomCharges;

  const proratedPayable = prorated * admissibleRatio;
  const proportionateDeduction = prorated - proratedPayable;

  const totalBill = actualRoomCharges + prorated + nonProrated;
  const payableBeforeSumInsured = eligibleRoomCharges + proratedPayable + nonProrated;
  const totalPayable = Math.min(payableBeforeSumInsured, sumInsured);

  return {
    admissibleRatio,
    withinLimit,
    actualRoomCharges,
    eligibleRoomCharges,
    roomRentShortfall,
    proratedPayable,
    proportionateDeduction,
    totalBill,
    payableBeforeSumInsured,
    totalPayable,
    outOfPocket: Math.max(0, totalBill - totalPayable),
    cappedBySumInsured: payableBeforeSumInsured > sumInsured,
  };
}

/** Convert a "1% of sum insured" style cap into a per-day rupee figure. */
export function roomRentCapFromPercent(sumInsured: number, percentPerDay: number) {
  return (safe(sumInsured) * safe(percentPerDay)) / 100;
}
