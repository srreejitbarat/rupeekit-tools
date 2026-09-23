import { describe, expect, it } from 'vitest';
import { amortize, annualCost } from './common';
import { calculateNoCost, NO_COST_EXAMPLE } from './no-cost-emi';
import { calculateRemittance, REMITTANCE_EXAMPLE, routePayout } from './remittance';
import { calculateCarLease, CAR_LEASE_EXAMPLE } from './car-lease';
import { carLeaseReport, noCostReport, remittanceReport } from './reports';
import { reportCsv } from '@/lib/planning/reports';
import { csvText } from '@/lib/planning/common';

describe('no-cost EMI purchase and refund decisions', () => {
  it('applies the upfront subsidy once and reconciles every cash flow', () => {
    const r = calculateNoCost(NO_COST_EXAMPLE);
    expect(r.errors).toEqual([]);
    expect(r.emi).toBeCloseTo(10_000, 7);
    expect(r.principal + r.totalInterest).toBeCloseTo(60_000, 6);
    expect(r.subsidy).toBeCloseTo(r.totalInterest, 6);
    expect(r.feesWithTax).toBeCloseTo(234.82, 6);
    expect(r.purchaseTotal).toBeCloseTo(60_234.82 + r.totalInterest * 0.18, 6);
    expect(r.extraVsCash).toBeCloseTo(r.purchaseTotal - 57_000, 6);
    expect(r.keepTotal).toBeCloseTo(r.purchaseTotal - 20_000, 6);
    expect(r.rows.at(-1)?.balance).toBe(0);
  });
  it('uses a quoted principal and includes the down payment exactly once', () => {
    const r = calculateNoCost({ ...NO_COST_EXAMPLE, downPayment: 10_000, principalMode: 'quoted', quotedPrincipal: 48_000 });
    expect(r.principal).toBe(48_000);
    expect(r.subsidy).toBe(2000);
    expect(r.purchaseTotal).toBeCloseTo(10_000 + 48_000 + r.totalInterest * 1.18 + 234.82, 6);
  });
  it('handles zero interest and month-zero closure without paying an instalment', () => {
    const r = calculateNoCost({ ...NO_COST_EXAMPLE, annualRate: 0, processingFee: 0, interestTaxRate: 0, feeTaxRate: 0, refundMonth: 0, merchantRefund: 60_000, closurePercent: 0 });
    expect(r.purchaseTotal).toBe(60_000);
    expect(r.totalInterest).toBe(0);
    expect(r.closeTotal).toBe(0);
    expect(r.rows.every(x => x.closeCash === 0)).toBe(true);
  });
  it('charges closure only on remaining principal after the selected payment', () => {
    const r = calculateNoCost({ ...NO_COST_EXAMPLE, closureFixedFee: 100 });
    expect(r.closureBalance).toBe(r.rows[3].balance);
    expect(r.closureCharges).toBeCloseTo((r.closureBalance * 0.03 + 100) * 1.18, 6);
    expect(r.rows.slice(4).every(x => x.closeCash === 0)).toBe(true);
    expect(r.closeSaving).toBeCloseTo(r.rows.slice(4).reduce((s, x) => s + x.payment + x.interestTax, 0) - r.settlementCash, 6);
  });
  it('does not charge closure fees after the final EMI', () => {
    const r = calculateNoCost({ ...NO_COST_EXAMPLE, refundMonth: 6, closureFixedFee: 900 });
    expect(r.closureCharges).toBe(0); expect(r.closeSaving).toBeCloseTo(0, 6);
  });
  it.each([1, 3, 5])('retains only confirmed cashback when paid in month %i', cashbackMonth => {
    const baseline = calculateNoCost(NO_COST_EXAMPLE);
    const r = calculateNoCost({ ...NO_COST_EXAMPLE, cashback: 3000, cashbackMonth, retainedCashback: 500 });
    expect(r.purchaseTotal).toBeCloseTo(baseline.purchaseTotal - 3000, 6);
    expect(r.keepTotal).toBeCloseTo(baseline.keepTotal - 500, 6);
    expect(r.closeTotal).toBeCloseTo(baseline.closeTotal - 500, 6);
  });
  it('deducts a confirmed fee refund once in both return alternatives', () => {
    const a = calculateNoCost(NO_COST_EXAMPLE), b = calculateNoCost({ ...NO_COST_EXAMPLE, feeRefund: 234.82 });
    expect(b.keepTotal).toBeCloseTo(a.keepTotal - 234.82, 6);
    expect(b.closeSaving).toBeCloseTo(a.closeSaving, 6);
    expect(b.purchaseTotal).toBe(a.purchaseTotal);
  });
  it('omits the annualised rate for ambiguous mixed-sign payments', () => {
    expect(calculateNoCost({ ...NO_COST_EXAMPLE, cashback: 20_000 }).annualisedCost).toBeNull();
    expect(annualCost(100, [110])).toBeCloseTo((1.1 ** 12 - 1) * 100, 6);
    expect(annualCost(100, [100])).toBeCloseTo(0, 6);
    expect(annualCost(100, [90])).toBeLessThan(0);
  });
  it.each([{ price: NaN }, { months: 2.5 }, { refundMonth: 7 }, { retainedCashback: 1 }, { feeRefund: 235 }, { quotedPrincipal: 70_000, principalMode: 'quoted' as const }])('rejects invalid EMI inputs %j', changes => {
    const r = calculateNoCost({ ...NO_COST_EXAMPLE, ...changes });
    expect(r.errors.length).toBeGreaterThan(0); expect(r.rows).toEqual([]);
  });
});

describe('freelancer foreign payment reconciliation', () => {
  it('reconciles the worked example without double-counting the FX spread', () => {
    const r = calculateRemittance(REMITTANCE_EXAMPLE), a = r.routes[0];
    expect(r.errors).toEqual([]); expect(a.net).toBe(175_361);
    expect(a.foreignFeesInr).toBe(2430); expect(a.fxDifference).toBe(1973); expect(a.localCharges).toBe(236);
    expect(a.referenceValue - a.foreignFeesInr - a.fxDifference - a.localCharges).toBe(a.net);
    expect(r.routes[1].net).toBeCloseTo(177_844.5, 6);
    expect(r.difference).toBeCloseTo(2483.5, 6); expect(r.unexplained).toBe(461);
    expect(r.actualEffectiveRate).toBe(87.45); expect(r.annualDifference).toBeCloseTo(29_802, 6);
  });
  it('rounds each target invoice up to the smallest cent reaching the INR target', () => {
    const r = calculateRemittance(REMITTANCE_EXAMPLE);
    r.routes.forEach((route, i) => {
      expect(routePayout(route.targetInvoice, REMITTANCE_EXAMPLE.routes[i]).net).toBeGreaterThanOrEqual(180_000);
      expect(routePayout(route.targetInvoice - 0.01, REMITTANCE_EXAMPLE.routes[i]).net).toBeLessThan(180_000);
    });
  });
  it('repeats fixed charges per split while preserving the percentage-fee total', () => {
    const a = calculateRemittance(REMITTANCE_EXAMPLE).routes[0];
    expect(a.splitExtraCost).toBeCloseTo(2577, 6);
    expect(calculateRemittance({ ...REMITTANCE_EXAMPLE, splitCount: 1 }).routes[0].splitExtraCost).toBe(0);
  });
  it('does not display a fabricated zero payout when each split is too small', () => {
    const r = calculateRemittance({ ...REMITTANCE_EXAMPLE, invoice: 100, splitCount: 52 });
    expect(r.errors).toEqual([]); expect(r.routes[0].splitNet).toBeNull(); expect(r.routes[0].splitExtraCost).toBeNull();
  });
  it('preserves a better-than-reference quote as a negative FX difference', () => {
    const r = calculateRemittance({ ...REMITTANCE_EXAMPLE, referenceRate: 80 });
    for (const a of r.routes) {
      expect(a.fxDifference).toBeLessThan(0);
      expect(a.allInCost).toBeCloseTo(a.foreignFeesInr + a.fxDifference + a.localCharges, 6);
    }
  });
  it('ignores an unused actual credit and accepts a zero actual credit', () => {
    expect(calculateRemittance({ ...REMITTANCE_EXAMPLE, auditActual: false, actualReceived: NaN }).errors).toEqual([]);
    expect(calculateRemittance({ ...REMITTANCE_EXAMPLE, auditActual: false }).unexplained).toBeNull();
    expect(calculateRemittance({ ...REMITTANCE_EXAMPLE, actualReceived: 0 }).actualEffectiveRate).toBe(0);
  });
  it.each([{ quoteDate: '2026-02-30' }, { invoice: 0 }, { referenceRate: NaN }, { splitCount: 1.5 }, { currency: 'XYZ' }])('rejects invalid receipt input %j', changes => {
    const r = calculateRemittance({ ...REMITTANCE_EXAMPLE, ...changes });
    expect(r.errors.length).toBeGreaterThan(0); expect(r.routes).toEqual([]);
  });
  it('rejects charges exceeding the invoice and duplicate route names', () => {
    const input = structuredClone(REMITTANCE_EXAMPLE);
    input.routes[0].fixedForeign = 3000;
    expect(calculateRemittance(input).errors.join(' ')).toContain('charges exceed');
    input.routes[0].fixedForeign = 0; input.routes[1].name = ' CURRENT ROUTE ';
    expect(calculateRemittance(input).errors.join(' ')).toContain('different names');
  });
});

describe('company car lease exits at a common comparison date', () => {
  it('uses payroll-confirmed savings and excludes unapproved continuation', () => {
    const r = calculateCarLease(CAR_LEASE_EXAMPLE);
    expect(r.errors).toEqual([]); expect(r.netLeaseMonthly).toBe(24_000);
    expect(r.options.map(o => o.id)).toEqual(['stay', 'buy', 'return']);
    const stay = r.options[0]; expect(stay.totalPaid).toBe(1_264_000); expect(stay.adjustedCost).toBe(664_000);
    expect(stay.closingCash).toBe(416_000);
  });
  it('keeps loan debt beyond the lease horizon and never adds car value to cash', () => {
    const r = calculateCarLease(CAR_LEASE_EXAMPLE), buy = r.options[1];
    const schedule = amortize(650_000, 10.5, 48);
    expect(buy.rows[12].settlement).toBe(200_000); expect(buy.rows[12].loanPayment).toBe(0);
    expect(buy.rows[13].loanPayment).toBeCloseTo(schedule[0].payment, 6);
    expect(buy.terminalDebt).toBeCloseTo(schedule[23].balance, 6);
    expect(buy.adjustedCost).toBeCloseTo(buy.totalPaid + buy.terminalDebt - 600_000, 6);
    expect(buy.closingCash).toBeCloseTo(600_000 + 36 * 30_000 - buy.totalPaid, 6);
  });
  it('adds upfront loan fees to exit cash without reducing principal', () => {
    const a = calculateCarLease(CAR_LEASE_EXAMPLE), b = calculateCarLease({ ...CAR_LEASE_EXAMPLE, loanFee: 5000 });
    expect(b.buyoutCashNeeded).toBe(205_000);
    expect(b.options[1].totalPaid - a.options[1].totalPaid).toBeCloseTo(5000, 6);
    expect(b.options[1].terminalDebt).toBe(a.options[1].terminalDebt);
  });
  it('settles an immediate cash buyout today and identifies the reserve shortfall', () => {
    const r = calculateCarLease({ ...CAR_LEASE_EXAMPLE, finance: 'cash', exitMonth: 0 });
    const buy = r.options[1];
    expect(buy.rows[0].outflow).toBe(850_000); expect(buy.lowestCash).toBe(-250_000);
    expect(buy.reserveShortfall).toBe(400_000); expect(buy.fitsReserve).toBe(false);
    expect(buy.terminalDebt).toBe(0); expect(buy.totalPaid).toBe(994_000);
  });
  it('does not add remaining lease payments to an all-in return quote', () => {
    const ret = calculateCarLease(CAR_LEASE_EXAMPLE).options[2];
    expect(ret.totalPaid).toBe(12 * 24_000 + 250_000 + 24 * 12_000);
    expect(ret.terminalAsset).toBe(0); expect(ret.terminalDebt).toBe(0);
  });
  it('retains the entire new loan if buyout occurs at the comparison end', () => {
    const r = calculateCarLease({ ...CAR_LEASE_EXAMPLE, exitMonth: 36 });
    expect(r.options[1].terminalDebt).toBe(650_000);
    expect(r.options[1].rows.every(x => x.loanPayment === 0)).toBe(true);
  });
  it('stops a short zero-interest loan after payoff', () => {
    const buy = calculateCarLease({ ...CAR_LEASE_EXAMPLE, exitMonth: 0, loanRate: 0, loanMonths: 2 }).options[1];
    expect(buy.rows[1].loanPayment).toBe(325_000); expect(buy.rows[2].debt).toBe(0);
    expect(buy.rows[3].loanPayment).toBe(0); expect(buy.terminalDebt).toBe(0);
  });
  it('includes only approved continuation and uses its own end ownership', () => {
    const r = calculateCarLease({ ...CAR_LEASE_EXAMPLE, continuationAllowed: true, continuationEndAction: 'return', continuationEndCost: 20_000 });
    const c = r.options[3]; expect(c.id).toBe('continue'); expect(c.terminalAsset).toBe(0);
    expect(c.totalPaid).toBe(12 * 24_000 + 10_000 + 24 * 34_000 + 20_000);
  });
  it('includes the opening reserve and reports no feasible option when none fits', () => {
    const r = calculateCarLease({ ...CAR_LEASE_EXAMPLE, openingCash: 100, reserve: 1000 });
    expect(r.bestFit).toBeNull(); expect(r.options.every(x => x.reserveShortfall >= 900)).toBe(true);
  });
  it.each([{ exitMonth: 37 }, { remainingMonths: 0 }, { payrollTaxSaving: 30_000 }, { loanFee: -1 }, { downPayment: 900_000 }, { loanMonths: NaN }])('rejects invalid lease input %j', changes => {
    const r = calculateCarLease({ ...CAR_LEASE_EXAMPLE, ...changes });
    expect(r.errors.length).toBeGreaterThan(0); expect(r.options).toEqual([]);
  });
});

describe('decision reports', () => {
  it('exports every purchase month and every lease option with the input snapshot', () => {
    const e = noCostReport(NO_COST_EXAMPLE, calculateNoCost(NO_COST_EXAMPLE));
    expect(e.schedule).toHaveLength(8); expect(e.inputs).toContainEqual(['Purchase price before EMI interest subsidy (INR)', '60000']);
    const l = carLeaseReport(CAR_LEASE_EXAMPLE, calculateCarLease(CAR_LEASE_EXAMPLE));
    expect(l.schedule).toHaveLength(112); expect(l.assumptions.join(' ')).toContain('liability');
  });
  it('labels foreign inputs and INR reconciliation correctly and escapes spreadsheet formulas', () => {
    const input = structuredClone(REMITTANCE_EXAMPLE); input.routes[0].name = '=1+1';
    const report = remittanceReport(input, calculateRemittance(input));
    expect(report.inputNote).toContain('foreign fees use USD'); expect(report.inputs).toContainEqual(['Gross invoice (USD)', '2000']);
    expect(report.schedule).toHaveLength(3);
    expect(reportCsv(report).flat()).toContain('RECEIPT RECONCILIATION (all values INR)');
    expect(csvText(reportCsv(report))).toContain('"\'=1+1"');
  });
});
