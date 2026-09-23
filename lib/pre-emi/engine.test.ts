import { describe, expect, it } from "vitest";
import {
  comparePlans,
  createDefaultPlan,
  emi,
  MODES,
  parsePlan,
  simulatePlan,
  toCsv,
  validatePlan,
} from "./engine";

const simple = () => ({
  ...createDefaultPlan(),
  loanAmount: 1200000,
  annualRate: 12,
  tenureMonths: 12,
  tranches: [
    { month: 1, percent: 50, ownCash: 0 },
    { month: 3, percent: 50, ownCash: 0 },
  ],
  emiStartMonth: 4,
  possessionMonth: 4,
  rent: 10000,
  rentEscalation: 0,
  moveInCost: 0,
  monthlyIncome: 200000,
  livingExpenses: 0,
  otherEmi: 0,
  startingCash: 1000000,
  protectedReserve: 0,
});

describe("Pre-EMI loan arithmetic", () => {
  it("charges only drawn debt, and switches to full EMI independently of possession", () => {
    const r = simulatePlan({ ...simple(), possessionMonth: 8 }, "pre-emi");
    expect(r.rows[0].interest).toBe(6000);
    expect(r.rows[1].interest).toBe(6000);
    expect(r.rows[2].interest).toBe(12000);
    expect(r.rows.slice(0, 3).every((x) => x.principal === 0)).toBe(true);
    expect(r.rows[3].payment).toBeCloseTo(106618.5464, 3);
    expect(r.rows[3].rent).toBe(10000);
    expect(r.rows[7].rent).toBe(0);
    expect(r.payoffMonth).toBe(15);
  });
  it("handles zero interest in all three modes without NaN or division by zero", () => {
    for (const mode of MODES) {
      const r = simulatePlan({ ...simple(), annualRate: 0 }, mode);
      expect(r.totalInterest).toBe(0);
      expect(
        r.rows.reduce((s, x) => s + x.principal + x.prepayment, 0),
      ).toBeCloseTo(1200000, 5);
      expect(
        r.rows.every((x) => Number.isFinite(x.cash) && x.closingDebt >= 0),
      ).toBe(true);
    }
    expect(emi(1200000, 0, 12)).toBe(100000);
    expect(emi(0, 0, 12)).toBe(0);
  });
  it("preserves principal and cash accounting across uneven tranches, rates and prepayments", () => {
    for (const mode of MODES) {
      const p = {
        ...createDefaultPlan(),
        tranches: [
          { month: 1, percent: 17.5, ownCash: 55000 },
          { month: 8, percent: 32.5, ownCash: 77000 },
          { month: 23, percent: 50, ownCash: 83000 },
        ],
        monthlyPrepayment: 4321,
        annualPrepayment: 31000,
        rateIncrease: 1.25,
        rateChangeMonth: 14,
      };
      const r = simulatePlan(p, mode);
      let lastCash = p.startingCash,
        lastDebt = 0;
      for (const row of r.rows) {
        expect(row.openingDebt).toBeCloseTo(lastDebt, 5);
        expect(row.closingDebt).toBeCloseTo(
          lastDebt + row.disbursement - row.principal - row.prepayment,
          5,
        );
        expect(row.cash).toBeCloseTo(lastCash + row.income - row.outflow, 5);
        expect(row.outflow).toBeCloseTo(
          row.payment +
            row.prepayment +
            row.rent +
            row.living +
            row.otherEmi +
            row.ownCash +
            row.moveInCost,
          5,
        );
        lastCash = row.cash;
        lastDebt = row.closingDebt;
      }
      expect(r.rows.reduce((s, x) => s + x.disbursement, 0)).toBe(p.loanAmount);
      expect(
        r.rows.reduce((s, x) => s + x.principal + x.prepayment, 0),
      ).toBeCloseTo(p.loanAmount, 4);
      expect(r.rows.at(-1)?.closingDebt).toBe(0);
    }
  });
  it("does not mark the loan paid off before a later tranche arrives", () => {
    const p = {
      ...simple(),
      annualRate: 0,
      loanAmount: 120000,
      tranches: [
        { month: 1, percent: 1, ownCash: 0 },
        { month: 6, percent: 99, ownCash: 0 },
      ],
      emiStartMonth: 7,
      possessionMonth: 7,
    };
    const r = simulatePlan(p, "sanctioned-emi");
    expect(r.rows[0].closingDebt).toBe(0);
    expect(r.rows[1].payment).toBe(0);
    expect(r.rows[5].closingDebt).toBeGreaterThan(0);
    expect(r.rows[5].payment).toBeCloseTo(118800 / 7, 6);
    expect(r.rows[11].payment).toBeCloseTo(r.rows[10].payment, 6);
    expect(r.payoffMonth).toBeGreaterThanOrEqual(6);
    expect(r.rows.at(-1)?.closingDebt).toBe(0);
  });
  it("records the correct payoff when the cash horizon is after contractual maturity", () => {
    const r = simulatePlan({ ...simple(), annualRate: 0 }, "pre-emi", 0, 40);
    expect(r.payoffMonth).toBe(15);
    expect(r.rows[39].payment).toBe(0);
  });
  it("recalculates sanction-based EMI when the rate rises between a cleared draw and a later draw", () => {
    const p = {
      ...simple(),
      loanAmount: 120000,
      annualRate: 1,
      tenureMonths: 24,
      tranches: [
        { month: 1, percent: 1, ownCash: 0 },
        { month: 8, percent: 99, ownCash: 0 },
      ],
      emiStartMonth: 9,
      rateIncrease: 5,
      rateChangeMonth: 5,
    };
    const r = simulatePlan(p, "sanctioned-emi");
    expect(r.rows[0].closingDebt).toBe(0);
    expect(r.rows[7].payment).toBeGreaterThan(r.rows[0].payment);
    expect(
      r.rows.reduce((s, x) => s + x.principal + x.prepayment, 0),
    ).toBeCloseTo(p.loanAmount, 5);
    expect(r.rows.at(-1)?.closingDebt).toBe(0);
  });
  it("recasts EMI for a rate increase, without charging that rate in earlier months", () => {
    const p = { ...simple(), rateChangeMonth: 6, rateIncrease: 2 };
    const a = simulatePlan(p, "pre-emi");
    const b = simulatePlan({ ...p, rateIncrease: 0 }, "pre-emi");
    expect(a.rows[4].payment).toBeCloseTo(b.rows[4].payment, 8);
    expect(a.rows[5].payment).toBeGreaterThan(b.rows[5].payment);
    expect(a.payoffMonth).toBe(b.payoffMonth);
  });
});

describe("Household cash flow and fair comparisons", () => {
  it("a possession-only delay increases rent, not loan interest or the draw schedule", () => {
    const p = simple();
    const onTime = simulatePlan(p, "pre-emi", 0, 24);
    const delayed = simulatePlan(p, "pre-emi", 6, 24);
    expect(delayed.totalInterest).toBe(onTime.totalInterest);
    expect(delayed.rentThroughHorizon - onTime.rentThroughHorizon).toBe(60000);
    expect(delayed.cashAtHorizon - onTime.cashAtHorizon).toBeCloseTo(-60000, 5);
    expect(delayed.emiStartMonth).toBe(4);
  });
  it("construction delays move future tranches, own contributions and the EMI switch together", () => {
    const r = simulatePlan(
      { ...simple(), tenureMonths: 24, shiftConstruction: true },
      "pre-emi",
      6,
    );
    expect(r.rows[0].disbursement).toBe(600000);
    expect(r.rows[2].disbursement).toBe(0);
    expect(r.rows[8].disbursement).toBe(600000);
    expect(r.emiStartMonth).toBe(10);
  });
  it("rent escalates only on anniversaries and ends at possession", () => {
    const r = simulatePlan(
      { ...simple(), possessionMonth: 14, rentEscalation: 10 },
      "pre-emi",
    );
    expect(r.rows[11].rent).toBe(10000);
    expect(r.rows[12].rent).toBe(11000);
    expect(r.rows[13].rent).toBe(0);
  });
  it("does not treat lender disbursement as household income or deduct it as own cash", () => {
    const p = {
      ...simple(),
      monthlyIncome: 0,
      rent: 0,
      tranches: [{ month: 1, percent: 100, ownCash: 25000 }],
      emiStartMonth: 4,
    };
    const r = simulatePlan(p, "pre-emi");
    expect(r.rows[0].cash).toBe(1000000 - 12000 - 25000);
  });
  it("caps optional prepayments at the reserve but exposes mandatory-cost shortfalls", () => {
    const p = {
      ...simple(),
      startingCash: 105000,
      protectedReserve: 100000,
      monthlyIncome: 0,
      rent: 0,
      annualRate: 0,
      monthlyPrepayment: 50000,
      prepaymentStartMonth: 1,
      emiStartMonth: 4,
    };
    const r = simulatePlan(p, "pre-emi");
    expect(r.rows[0].prepayment).toBe(5000);
    expect(r.rows[0].skippedPrepayment).toBe(45000);
    expect(r.rows[0].cash).toBe(100000);
    expect(r.rows[1].prepayment).toBe(0);
    expect(r.firstReserveBreach).toBe(4);
    expect(r.extraCashNeeded).toBeGreaterThan(0);
    const unguarded = simulatePlan({ ...p, protectReserve: false }, "pre-emi");
    expect(unguarded.rows[0].prepayment).toBe(50000);
  });
  it("income pauses affect cash only, and common dates are identical across modes", () => {
    const p = { ...simple(), incomePauseMonth: 2, incomePauseMonths: 3 };
    const r = comparePlans(p);
    expect(new Set(r.map((x) => x.horizonMonth)).size).toBe(1);
    expect(r[0].rows[1].income).toBe(0);
    expect(r[0].rows[4].income).toBe(p.monthlyIncome);
    expect(r[0].totalInterest).toBe(
      simulatePlan({ ...p, incomePauseMonths: 0 }, "pre-emi").totalInterest,
    );
  });
});

describe("Input boundary and export", () => {
  it("rejects bad totals, duplicate months, invalid dates, nonfinite numbers and huge arrays", () => {
    for (const p of [
      null,
      {},
      { ...simple(), startMonth: "2026-13" },
      { ...simple(), annualRate: NaN },
      { ...simple(), loanAmount: Infinity },
      { ...simple(), tranches: [{ month: 1, percent: 99, ownCash: 0 }] },
      {
        ...simple(),
        tranches: [
          { month: 1, percent: 50, ownCash: 0 },
          { month: 1, percent: 50, ownCash: 0 },
        ],
      },
      {
        ...simple(),
        tranches: Array(13).fill({ month: 1, percent: 100 / 13, ownCash: 0 }),
      },
      { ...simple(), emiStartMonth: 2 },
    ]) {
      expect(validatePlan(p).length).toBeGreaterThan(0);
      expect(() => parsePlan(p)).toThrow();
    }
  });
  it("strips unexpected fields and exports a complete, stable monthly ledger", () => {
    const p = parsePlan({ ...simple(), secret: "do not echo" });
    expect("secret" in p).toBe(false);
    const r = simulatePlan(p, "pre-emi");
    const csv = toCsv(r);
    expect(csv.split("\r\n")).toHaveLength(r.rows.length + 1);
    expect(csv).toContain("Own builder contribution INR");
    expect(csv).toContain("Oct 2026");
  });
  it("rejects a disbursement schedule longer than the early-EMI repayment term", () => {
    const p = {
      ...simple(),
      tranches: [
        { month: 1, percent: 50, ownCash: 0 },
        { month: 20, percent: 50, ownCash: 0 },
      ],
      emiStartMonth: 21,
    };
    expect(validatePlan(p).join(" ")).toContain("Repayment tenure");
    expect(
      validatePlan({ ...p, tenureMonths: 36, shiftConstruction: true }),
    ).toEqual([]);
  });
});
