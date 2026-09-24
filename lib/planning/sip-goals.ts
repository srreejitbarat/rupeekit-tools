import { inRange, monthAt, monthIndex } from './common';

export type SipGoal = { id: string; name: string; target: number; deadline: string; savings: number };
export type SipGoalsInput = {
  startMonth: string;
  monthlyBudget: number;
  annualReturn: number;
  inflation: number;
  targetBasis: 'today' | 'future';
  allocation: 'balanced' | 'priority';
  goals: SipGoal[];
};
export type GoalMonth = { month: number; contribution: number; invested: number; value: number };
export type GoalResult = SipGoal & {
  months: number;
  futureTarget: number;
  startingSipNeeded: number;
  firstAllocation: number;
  projected: number;
  gap: number;
  coverage: number;
  affordableToday: number;
  invested: number;
  lowerReturnValue: number;
  rows: GoalMonth[];
};
export type BudgetMonth = { month: number; contributed: number; unused: number; completedGoals: number };

export const SIP_GOALS_EXAMPLE: SipGoalsInput = {
  startMonth: '2026-10', monthlyBudget: 25_000, annualReturn: 10, inflation: 5,
  targetBasis: 'today', allocation: 'balanced',
  goals: [
    { id: 'home', name: 'Home deposit', target: 1_200_000, deadline: '2031-09', savings: 200_000 },
    { id: 'education', name: 'Education', target: 2_000_000, deadline: '2038-09', savings: 100_000 },
    { id: 'freedom', name: 'Long-term fund', target: 4_000_000, deadline: '2046-09', savings: 0 },
  ],
};

export function validateSipGoals(input: SipGoalsInput) {
  const errors: string[] = [];
  if (!Number.isFinite(monthIndex(input.startMonth))) errors.push('Choose a valid plan start month.');
  if (!inRange(input.monthlyBudget, 0, 10_000_000)) errors.push('Monthly budget must be between 0 and 1 crore rupees.');
  if (!inRange(input.annualReturn, -20, 30)) errors.push('Return assumption must be between -20% and 30%.');
  if (!inRange(input.inflation, 0, 15)) errors.push('Inflation must be between 0% and 15%.');
  if (!['today', 'future'].includes(input.targetBasis)) errors.push('Choose today’s cost or a future target.');
  if (!['balanced', 'priority'].includes(input.allocation)) errors.push('Choose an allocation method.');
  if (!input.goals.length || input.goals.length > 5) errors.push('Add between one and five goals.');
  if (new Set(input.goals.map(g => g.id)).size !== input.goals.length) errors.push('Each goal needs a unique identifier.');
  for (const [i, goal] of input.goals.entries()) {
    const label = `Goal ${i + 1}`;
    if (!goal.name.trim() || goal.name.length > 60) errors.push(`${label}: use a name of 1–60 characters.`);
    if (!inRange(goal.target, 1, 1_000_000_000)) errors.push(`${label}: enter a target from 1 to 100 crore rupees.`);
    if (!inRange(goal.savings, 0, 1_000_000_000)) errors.push(`${label}: savings must be from 0 to 100 crore rupees.`);
    if (!inRange(monthIndex(goal.deadline) - monthIndex(input.startMonth) + 1, 1, 360)) errors.push(`${label}: choose a deadline within 30 years of the start.`);
  }
  return errors;
}

/** Start-of-month contributions, matching the established RupeeKit SIP convention. */
export function sipNeeded(target: number, savings: number, annualReturn: number, months: number) {
  const rate = annualReturn / 1200;
  const growth = Math.pow(1 + rate, months);
  const annuity = rate === 0 ? months : (1 + rate) * Math.expm1(months * Math.log1p(rate)) / rate;
  return Math.max(0, (target - savings * growth) / annuity);
}

function simulate(input: SipGoalsInput, budget: number, extraMonths = 0, includeRows = true) {
  const rate = input.annualReturn / 1200;
  const goals = input.goals.map(goal => {
    const months = monthIndex(goal.deadline) - monthIndex(input.startMonth) + 1 + extraMonths;
    const futureTarget = goal.target * (input.targetBasis === 'today' ? Math.pow(1 + input.inflation / 100, months / 12) : 1);
    return { ...goal, months, futureTarget, value: goal.savings, invested: goal.savings,
      firstAllocation: 0, rows: [] as GoalMonth[] };
  });
  const horizon = Math.max(...goals.map(g => g.months));
  const budgetRows: BudgetMonth[] = [];
  for (let month = 1; month <= horizon; month++) {
    const needs = goals.map(goal => month > goal.months ? 0 : sipNeeded(goal.futureTarget, goal.value, input.annualReturn, goal.months - month + 1));
    const totalNeed = needs.reduce((sum, need) => sum + need, 0);
    let remaining = budget;
    let contributed = 0;
    goals.forEach((goal, i) => {
      if (month > goal.months) return;
      const contribution = input.allocation === 'priority'
        ? Math.min(needs[i], remaining)
        : totalNeed > 0 ? Math.min(needs[i], budget * needs[i] / totalNeed) : 0;
      remaining = Math.max(0, remaining - contribution);
      contributed += contribution;
      if (month === 1) goal.firstAllocation = contribution;
      goal.value = (goal.value + contribution) * (1 + rate);
      goal.invested += contribution;
      if (includeRows) goal.rows.push({ month, contribution, invested: goal.invested, value: goal.value });
    });
    if (includeRows) budgetRows.push({ month, contributed, unused: Math.max(0, budget - contributed), completedGoals: goals.filter(g => g.months <= month).length });
  }
  return { goals, budgetRows, fits: goals.every(goal => goal.value >= goal.futureTarget - 0.01) };
}

export function planSipGoals(input: SipGoalsInput) {
  const errors = validateSipGoals(input);
  if (errors.length) return { errors, goals: [] as GoalResult[], budgetRows: [] as BudgetMonth[], requiredBudget: 0, extraBudget: 0, extensionMonths: null as number | null, extensionSearchMonths: 0, fits: false, horizon: 0 };
  const base = simulate(input, input.monthlyBudget);
  const goals: GoalResult[] = base.goals.map(goal => {
    // Stress the exact same contributions, without silently raising the shared budget.
    let lowerReturnValue = goal.savings;
    const lowerRate = (input.annualReturn - 4) / 1200;
    for (const row of goal.rows) lowerReturnValue = (lowerReturnValue + row.contribution) * (1 + lowerRate);
    return {
      id: goal.id, name: goal.name, target: goal.target, deadline: goal.deadline, savings: goal.savings,
      months: goal.months, futureTarget: goal.futureTarget,
      startingSipNeeded: sipNeeded(goal.futureTarget, goal.savings, input.annualReturn, goal.months),
      firstAllocation: goal.firstAllocation, projected: goal.value, gap: Math.max(0, goal.futureTarget - goal.value),
      coverage: goal.value / goal.futureTarget * 100,
      affordableToday: goal.value / (input.targetBasis === 'today' ? Math.pow(1 + input.inflation / 100, goal.months / 12) : 1),
      invested: goal.invested, lowerReturnValue, rows: goal.rows,
    };
  });
  let low = 0;
  let high = simulate(input, 0, 0, false).fits ? 0 : goals.reduce((sum, goal) => sum + goal.startingSipNeeded, 0) + 1;
  // With enough money for each independent SIP, either allocation policy funds every goal.
  // The search is for this selected policy, not a claim of optimal investment allocation.
  for (let i = 0; i < 38; i++) {
    const mid = (low + high) / 2;
    if (simulate(input, mid, 0, false).fits) high = mid;
    else low = mid;
  }
  const requiredBudget = Math.ceil(high);
  let extensionMonths: number | null = base.fits ? 0 : null;
  const extensionSearchMonths = Math.min(120, 360 - Math.max(...goals.map(goal => goal.months)));
  if (!base.fits) {
    // Later dates can make an inflation-linked goal HARDER. Do not binary-search this.
    for (let months = 1; months <= extensionSearchMonths; months++) {
      if (simulate(input, input.monthlyBudget, months, false).fits) { extensionMonths = months; break; }
    }
  }
  return {
    errors, goals, budgetRows: base.budgetRows, fits: base.fits,
    requiredBudget, extraBudget: Math.max(0, requiredBudget - input.monthlyBudget), extensionMonths, extensionSearchMonths,
    horizon: Math.max(...goals.map(goal => goal.months)),
  };
}

export function extendGoalDates(input: SipGoalsInput, extraMonths: number): SipGoalsInput {
  return { ...input, goals: input.goals.map(goal => ({ ...goal, deadline: monthAt(goal.deadline, extraMonths) })) };
}
