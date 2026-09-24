import { describe, expect, it } from 'vitest';
import { HOME_LOAN_EXAMPLE, loanPayment, planHomeLoan, type HomeLoanPlanInput } from './home-loan';
import { planSipGoals, type SipGoalsInput } from './sip-goals';
import { SALARY_CASH_EXAMPLE, planSalaryCash, regularSalary, solveFixedSalary, type SalaryCashInput } from './salary-cash';
import { csvText, monthAt, monthIndex, sustainedLead } from './common';

const loan = (patch: Partial<HomeLoanPlanInput> = {}): HomeLoanPlanInput => ({
  ...HOME_LOAN_EXAMPLE, principal: 1200, annualRate: 0, remainingMonths: 12,
  startMonth: '2026-10', targetMonth: '2027-09', monthlyIncome: 200, monthlyExpenses: 50,
  paymentLimit: 100, openingCash: 500, reserve: 300, prepayment: 0,
  repriceEnabled: false, transferEnabled: false, ...patch,
});
const sip = (patch: Partial<SipGoalsInput> = {}): SipGoalsInput => ({
  startMonth: '2026-10', monthlyBudget: 100, annualReturn: 0, inflation: 0, targetBasis: 'future', allocation: 'balanced',
  goals: [{ id: 'a', name: 'A', target: 1200, deadline: '2027-09', savings: 0 }, { id: 'b', name: 'B', target: 1200, deadline: '2027-09', savings: 0 }], ...patch,
});
const salary = (): SalaryCashInput => ({
  ...SALARY_CASH_EXAMPLE, startMonth: '2026-04', openingCash: 0, livingCosts: 0,
  priorGross: 0, priorTaxPaid: 0, priorPf: 0, priorProfessionalTax: 0,
  offers: SALARY_CASH_EXAMPLE.offers.map(offer => ({ ...offer, fixedCtc: 1_200_000,
    pfRate: 0, employerPfIncluded: false, professionalTax: 0, otherDeductions: 0, variablePay: 0,
    joiningBonus: 0, firstPayDelay: 0, switchingCost: 0, workCost: 0 })),
});

describe('home loan plans under joint constraints', () => {
  it('agrees with a standard reducing-balance EMI and handles zero interest', () => {
    expect(loanPayment(3_000_000, 8.5, 240)).toBeCloseTo(26034.69699, 2);
    expect(loanPayment(1200, 0, 12)).toBe(100);
  });
  it('repays the principal exactly, with no imaginary interest or cash gain', () => {
    const result = planHomeLoan(loan());
    expect(result.errors).toEqual([]);
    for (const option of result.options) {
      expect(option.payoffMonth).toBe(12);
      expect(option.cashAtGoal).toBeCloseTo(1100);
      expect(option.rows.reduce((n, r) => n + r.payment, 0)).toBeCloseTo(1200);
      expect(option.debtAtGoal).toBe(0);
      expect(option.costAtGoal).toBe(0);
      expect(option.feasible).toBe(true);
    }
  });
  it('requires all three constraints, not just enough opening savings', () => {
    const result = planHomeLoan(loan({ targetMonth: '2027-03', openingCash: 10000 }));
    expect(result.bestId).toBeNull();
    expect(result.options[0].debtAtGoal).toBe(600);
    expect(result.options[1].monthlyGap).toBe(100);
    expect(result.options[1].budgetPayoffMonth).toBe(12);
  });
  it('checks the reserve before the first pay cheque arrives', () => {
    const result = planHomeLoan(loan({ repriceEnabled: true, repriceRate: 0, repriceFees: 250 }));
    const option = result.options.find(o => o.id === 'reprice')!;
    expect(option.reserveGap).toBe(50);
    expect(option.feasible).toBe(false);
  });
  it('preserves cash minus debt conservation across fees, rates, and prepayment', () => {
    const input = { ...HOME_LOAN_EXAMPLE };
    const result = planHomeLoan(input);
    for (const option of result.options) {
      const beforeFinancingCosts = input.openingCash - input.principal + (input.monthlyIncome - input.monthlyExpenses) * result.horizon;
      expect(option.cashAtGoal - option.debtAtGoal).toBeCloseTo(beforeFinancingCosts - option.costAtGoal, 4);
      expect(option.rows.every(row => row.debt >= 0)).toBe(true);
    }
  });
  it('counts full income loss, including living costs, in the reserve test', () => {
    const result = planHomeLoan(loan());
    expect(result.options[0].incomeGapMonths).toBe(1);
    expect(result.options[0].rateRiseDebtAtGoal).toBeGreaterThan(0);
  });
  it('handles payoff before month one and rejects malformed/oversized inputs', () => {
    const paid = planHomeLoan(loan({ prepayment: 1200, openingCash: 2000 }));
    expect(paid.options[1].payment).toBe(0);
    expect(paid.options[1].payoffMonth).toBe(0);
    expect(planHomeLoan(loan({ prepayment: 1201 })).errors.length).toBeGreaterThan(0);
    expect(planHomeLoan(loan({ annualRate: NaN })).options).toEqual([]);
    expect(planHomeLoan(loan({ targetMonth: '2026-13' })).options).toEqual([]);
  });
});

describe('one SIP budget across several goals', () => {
  it('splits a constrained budget without counting it twice and solves a rescue', () => {
    const result = planSipGoals(sip());
    expect(result.goals.map(g => g.projected)).toEqual([600, 600]);
    expect(result.requiredBudget).toBe(200);
    expect(result.extraBudget).toBe(100);
    expect(result.extensionMonths).toBe(12);
    expect(result.budgetRows.every(row => row.contributed <= 100.000001)).toBe(true);
  });
  it('releases budget after earlier goals and respects user priority', () => {
    const input = sip({ monthlyBudget: 200, allocation: 'priority' });
    input.goals[0] = { ...input.goals[0], deadline: '2027-03' };
    const result = planSipGoals(input);
    expect(result.fits).toBe(true);
    expect(result.requiredBudget).toBe(200);
    expect(result.goals[0].firstAllocation).toBe(200);
    expect(result.goals[1].firstAllocation).toBe(0);
    expect(result.goals[1].rows.slice(6).every(row => row.contribution >= 199.99)).toBe(true);
  });
  it('funds a one-month goal with a beginning-of-month contribution', () => {
    const result = planSipGoals(sip({ monthlyBudget: 100, annualReturn: 12, goals: [{ id: 'a', name: 'A', target: 101, deadline: '2026-10', savings: 0 }] }));
    expect(result.goals[0].projected).toBeCloseTo(101);
    expect(result.requiredBudget).toBe(100);
  });
  it('does not charge a rupee when savings already cover all goals', () => {
    const result = planSipGoals(sip({ goals: [{ id: 'a', name: 'A', target: 1200, deadline: '2027-09', savings: 1200 }] }));
    expect(result.requiredBudget).toBe(0);
    expect(result.goals[0].firstAllocation).toBe(0);
    expect(result.budgetRows[0].unused).toBe(100);
  });
  it('inflates the target only when it is a current-price goal', () => {
    const input = sip({ targetBasis: 'today', inflation: 10 });
    const result = planSipGoals(input);
    expect(result.goals[0].futureTarget).toBeCloseTo(1320);
    expect(result.goals[0].affordableToday).toBeCloseTo(600 / 1.1);
    expect(result.goals[0].lowerReturnValue).toBeLessThan(result.goals[0].projected);
  });
  it('supports losses and does not promise a deadline rescue where none was found', () => {
    const result = planSipGoals(sip({ monthlyBudget: 1, annualReturn: -20, inflation: 15, targetBasis: 'today' }));
    expect(result.extensionMonths).toBeNull();
    expect(result.goals.every(goal => Number.isFinite(goal.projected))).toBe(true);
  });
  it('rejects duplicate goals, non-finite values and past dates', () => {
    const input = sip();
    input.goals[1] = { ...input.goals[1], id: 'a' };
    expect(planSipGoals(input).errors.length).toBeGreaterThan(0);
    expect(planSipGoals(sip({ monthlyBudget: Infinity })).goals).toEqual([]);
    expect(planSipGoals(sip({ startMonth: '2030-01' })).goals).toEqual([]);
  });
});

describe('salary cash calendar and fixed-pay solver', () => {
  it('reconciles a tax-free salary over all twelve months', () => {
    const result = planSalaryCash(salary());
    expect(result.errors).toEqual([]);
    expect(result.offers[0].totalReceipts).toBe(1_200_000);
    expect(result.offers[0].rows.every(row => row.inHand === 100_000)).toBe(true);
    expect(result.cashDifference).toBe(0);
    expect(result.offers[1].firstPositiveMonth).toBeNull();
  });
  it('moves delayed salary to the first pay date without losing or inventing earnings', () => {
    const input = salary(); input.offers[1].firstPayDelay = 2;
    const next = planSalaryCash(input).offers[1];
    expect(next.rows.slice(0, 3).map(row => row.fixedCash)).toEqual([0, 0, 300_000]);
    expect(next.totalReceipts).toBe(1_200_000);
  });
  it('taxes a joining bonus marginally and does not deduct PF from it', () => {
    const input = salary(); input.offers[1].joiningBonus = 100_000; input.offers[1].joiningMonth = 2;
    const next = planSalaryCash(input).offers[1];
    // 13 lakh gross less 75,000 standard deduction; 25,000 marginal-relief tax plus 4% cess.
    expect(next.rows[1].bonusTax).toBe(26_000);
    expect(next.rows[1].inHand).toBe(174_000);
    expect(next.employeePfMonthly).toBe(0);
    expect(next.totalReceipts).toBe(1_274_000);
  });
  it('shows clawback exposure separately from actual cash and expires it on the entered term', () => {
    const input = salary(); Object.assign(input.offers[1], { joiningBonus: 100_000, joiningMonth: 1, clawbackMonths: 2 });
    const next = planSalaryCash(input).offers[1];
    expect(next.rows.map(row => row.clawback).slice(0, 3)).toEqual([100_000, 100_000, 0]);
    expect(next.rows[0].cash - next.rows[0].uncommittedCash).toBe(100_000);
    expect(next.totalReceipts).toBe(1_274_000);
  });
  it('applies variable payout assumptions in the chosen month', () => {
    const input = salary(); Object.assign(input.offers[1], { variablePay: 200_000, variablePayoutPercent: 20, variableMonth: 7 });
    const next = planSalaryCash(input).offers[1];
    expect(next.rows[6].bonuses).toBe(40_000);
    expect(next.totalReceipts).toBe(1_240_000);
    expect(next.fixedMonthlyInHand).toBe(100_000);
  });
  it('includes pre-plan earnings once and projects each financial year separately', () => {
    const input = salary(); input.startMonth = '2026-10'; input.priorGross = 600_000;
    const result = planSalaryCash(input);
    expect(result.offers[0].fiscalEstimates.map(row => row.gross)).toEqual([1_200_000, 1_200_000]);
    expect(result.offers[0].fiscalEstimates.map(row => row.year)).toEqual([2026, 2027]);
    input.startMonth = '2026-04';
    expect(planSalaryCash(input).errors[0]).toContain('April');
  });
  it('finds the earliest whole-rupee fixed pay, including the rebate peak', () => {
    const input = salary();
    for (const target of [50_000, 100_000, 106_200, 106_250, 106_251, 150_000]) {
      input.targetInHand = target;
      const solved = solveFixedSalary(input.offers[0], input);
      expect(solved.required).not.toBeNull();
      expect(regularSalary(input.offers[0], input, solved.required!).inHand).toBeGreaterThanOrEqual(target - 1e-6);
      expect(regularSalary(input.offers[0], input, solved.required! - 1).inHand).toBeLessThan(target);
    }
    input.targetInHand = 106_200;
    expect(solveFixedSalary(input.offers[0], input).required).toBe(1_274_400);
  });
  it('does not use an uncertain bonus to meet the regular take-home target', () => {
    const input = salary(); Object.assign(input.offers[1], { variablePay: 1_000_000, joiningBonus: 300_000 });
    expect(solveFixedSalary(input.offers[1], input).required).toBe(1_200_000);
  });
  it('declines unsupported high income and unreachable targets instead of omitting surcharge silently', () => {
    const input = salary(); Object.assign(input.offers[1], { fixedCtc: 5_000_000, joiningBonus: 1 });
    expect(planSalaryCash(input).offers).toEqual([]);
    input.targetInHand = 1_000_000;
    expect(solveFixedSalary(input.offers[0], input).required).toBeNull();
  });
  it('respects actual-basic PF, capped PF and employer-side CTC', () => {
    const input = salary(); Object.assign(input.offers[0], { pfRate: 12, basicPercent: 50, employerPfIncluded: true });
    const uncapped = regularSalary(input.offers[0], input);
    expect(uncapped.gross).toBe(1_128_000);
    expect(uncapped.pf).toBe(72_000);
    input.offers[0].capPf = true;
    expect(regularSalary(input.offers[0], input).pf).toBe(21_600);
    input.offers[0].pfRate = 10;
    expect(regularSalary(input.offers[0], input).pf).toBe(18_000);
    input.offers[0].monthlyPfWageCap = 25_000;
    expect(regularSalary(input.offers[0], input).pf).toBe(30_000);
  });
});

describe('shared date, comparison and export boundaries', () => {
  it('rolls December forward and rejects invalid months', () => {
    expect(monthAt('2026-12', 1)).toBe('2027-01');
    expect(Number.isNaN(monthIndex('2026-13'))).toBe(true);
  });
  it('does not report a short-lived bonus advantage as sustained break-even', () => {
    expect(sustainedLead([100, 50, -1])).toBeNull();
    expect(sustainedLead([-100, 0, 50])).toBe(2);
    expect(sustainedLead([0, 0])).toBeNull();
  });
  it('keeps CSV labels from executing as spreadsheet formulas', () => {
    expect(csvText([['=SUM(A1)', 'A,"B"', -10]])).toBe('"\'=SUM(A1)","A,""B""","-10"');
  });
});
