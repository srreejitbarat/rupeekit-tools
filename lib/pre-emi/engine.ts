/** Monthly planning model. Amounts are INR; month 1 is the first plan month. */
export const MODEL_VERSION = "pre-emi-1.0.0";
export const MODES = ["pre-emi", "disbursed-emi", "sanctioned-emi"] as const;
export type PaymentMode = (typeof MODES)[number];
export const MODE_LABELS: Record<PaymentMode, string> = {
  "pre-emi": "Pre-EMI first",
  "disbursed-emi": "EMI on disbursed loan",
  "sanctioned-emi": "EMI on full sanction",
};
export type Tranche = { month: number; percent: number; ownCash: number };
export type PlanInput = {
  startMonth: string;
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  emiStartMonth: number;
  possessionMonth: number;
  delayMonths: number;
  shiftConstruction: boolean;
  tranches: Tranche[];
  monthlyIncome: number;
  livingExpenses: number;
  otherEmi: number;
  rent: number;
  rentEscalation: number;
  startingCash: number;
  protectedReserve: number;
  moveInCost: number;
  monthlyPrepayment: number;
  annualPrepayment: number;
  prepaymentStartMonth: number;
  protectReserve: boolean;
  rateIncrease: number;
  rateChangeMonth: number;
  incomePauseMonth: number;
  incomePauseMonths: number;
};
export type MonthlyRow = {
  month: number;
  date: string;
  rate: number;
  disbursement: number;
  openingDebt: number;
  interest: number;
  payment: number;
  principal: number;
  prepayment: number;
  skippedPrepayment: number;
  closingDebt: number;
  income: number;
  rent: number;
  living: number;
  otherEmi: number;
  ownCash: number;
  moveInCost: number;
  outflow: number;
  netCashFlow: number;
  cash: number;
};
export type PlanResult = {
  mode: PaymentMode;
  delay: number;
  possessionMonth: number;
  emiStartMonth: number;
  horizonMonth: number;
  rows: MonthlyRow[];
  lowestCash: number;
  lowestCashMonth: number;
  extraCashNeeded: number;
  firstReserveBreach: number | null;
  firstFundingGap: number | null;
  peakOutflow: number;
  peakOutflowMonth: number;
  totalInterest: number;
  interestThroughHorizon: number;
  rentThroughHorizon: number;
  debtAtPossession: number;
  cashAtHorizon: number;
  debtAtHorizon: number;
  skippedPrepayment: number;
  totalPrepayment: number;
  payoffMonth: number;
  regularEmi: number;
};
export function createDefaultPlan(startMonth = "2026-10"): PlanInput {
  return {
    startMonth,
    loanAmount: 6000000,
    annualRate: 8.5,
    tenureMonths: 240,
    emiStartMonth: 25,
    possessionMonth: 25,
    delayMonths: 0,
    shiftConstruction: false,
    tranches: [
      { month: 1, percent: 20, ownCash: 250000 },
      { month: 6, percent: 20, ownCash: 100000 },
      { month: 12, percent: 20, ownCash: 100000 },
      { month: 18, percent: 20, ownCash: 100000 },
      { month: 24, percent: 20, ownCash: 100000 },
    ],
    monthlyIncome: 125000,
    livingExpenses: 45000,
    otherEmi: 8000,
    rent: 25000,
    rentEscalation: 5,
    startingCash: 1000000,
    protectedReserve: 300000,
    moveInCost: 200000,
    monthlyPrepayment: 0,
    annualPrepayment: 0,
    prepaymentStartMonth: 12,
    protectReserve: true,
    rateIncrease: 0,
    rateChangeMonth: 12,
    incomePauseMonth: 12,
    incomePauseMonths: 0,
  };
}
const numericLimits: Record<string, [number, number, boolean?]> = {
  loanAmount: [1000, 1000000000],
  annualRate: [0, 30],
  tenureMonths: [12, 420, true],
  emiStartMonth: [1, 120, true],
  possessionMonth: [1, 120, true],
  delayMonths: [0, 36, true],
  monthlyIncome: [0, 10000000],
  livingExpenses: [0, 10000000],
  otherEmi: [0, 10000000],
  rent: [0, 10000000],
  rentEscalation: [0, 30],
  startingCash: [0, 1000000000],
  protectedReserve: [0, 1000000000],
  moveInCost: [0, 100000000],
  monthlyPrepayment: [0, 10000000],
  annualPrepayment: [0, 100000000],
  prepaymentStartMonth: [1, 120, true],
  rateIncrease: [0, 5],
  rateChangeMonth: [1, 120, true],
  incomePauseMonth: [1, 120, true],
  incomePauseMonths: [0, 24, true],
};
export function validatePlan(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return ["The plan must be a JSON object."];
  const p = value as Record<string, unknown>;
  const errors: string[] = [];
  for (const [key, [min, max, integer]] of Object.entries(numericLimits)) {
    const n = p[key];
    if (
      typeof n !== "number" ||
      !Number.isFinite(n) ||
      n < min ||
      n > max ||
      (integer && !Number.isInteger(n))
    ) {
      errors.push(
        `${key}: enter ${integer ? "a whole number" : "a number"} from ${min.toLocaleString("en-IN")} to ${max.toLocaleString("en-IN")}.`,
      );
    }
  }
  if (
    typeof p.startMonth !== "string" ||
    !/^(20[2-9]\d|21\d\d)-(0[1-9]|1[0-2])$/.test(p.startMonth)
  )
    errors.push("Choose a start month between 2020 and 2199.");
  for (const key of ["shiftConstruction", "protectReserve"])
    if (typeof p[key] !== "boolean")
      errors.push(`${key} must be true or false.`);
  if (
    !Array.isArray(p.tranches) ||
    p.tranches.length < 1 ||
    p.tranches.length > 12
  ) {
    errors.push("Add between 1 and 12 loan tranches.");
  } else {
    let total = 0;
    const months = new Set<number>();
    p.tranches.forEach((raw, index) => {
      const t = raw as Partial<Tranche> | null;
      if (
        !t ||
        typeof t !== "object" ||
        !Number.isInteger(t.month) ||
        (t.month ?? 0) < 1 ||
        (t.month ?? 999) > 120 ||
        typeof t.percent !== "number" ||
        !Number.isFinite(t.percent) ||
        t.percent <= 0 ||
        t.percent > 100 ||
        typeof t.ownCash !== "number" ||
        !Number.isFinite(t.ownCash) ||
        t.ownCash < 0 ||
        t.ownCash > 100000000
      ) {
        errors.push(
          `Tranche ${index + 1}: use month 1–120, a percentage above 0 and at most 100, and valid own cash.`,
        );
        return;
      }
      const month = t.month as number;
      if (months.has(month))
        errors.push("Combine tranches in the same month into one row.");
      months.add(month);
      if (typeof p.emiStartMonth === "number" && month > p.emiStartMonth)
        errors.push(
          "Full EMI must start in or after the final disbursement month.",
        );
      total += t.percent;
    });
    if (Math.abs(total - 100) > 0.000001)
      errors.push(
        `Loan tranches must total 100% (currently ${Number(total.toFixed(4))}%).`,
      );
    const drawMonths = p.tranches
      .map((t) => t?.month)
      .filter((m): m is number => typeof m === "number" && Number.isInteger(m));
    const drawSpan = drawMonths.length
      ? Math.max(...drawMonths) - Math.min(...drawMonths)
      : 0;
    const longestShift =
      p.shiftConstruction && drawSpan > 0
        ? Math.max(12, typeof p.delayMonths === "number" ? p.delayMonths : 0)
        : 0;
    if (
      typeof p.tenureMonths === "number" &&
      drawSpan + longestShift >= p.tenureMonths
    )
      errors.push(
        "Repayment tenure must cover the disbursement period, including the 12-month delay check, for early-EMI comparisons.",
      );
  }
  return [...new Set(errors)];
}
/** Construct only known fields. Untrusted JSON cannot introduce extra report/analytics data. */
export function parsePlan(value: unknown): PlanInput {
  const errors = validatePlan(value);
  if (errors.length) throw new Error(errors.join(" "));
  const p = value as PlanInput;
  const clean = createDefaultPlan(p.startMonth);
  for (const key of Object.keys(numericLimits))
    (clean as unknown as Record<string, unknown>)[key] = (
      p as unknown as Record<string, unknown>
    )[key];
  clean.shiftConstruction = p.shiftConstruction;
  clean.protectReserve = p.protectReserve;
  clean.tranches = p.tranches
    .map((t) => ({ month: t.month, percent: t.percent, ownCash: t.ownCash }))
    .sort((a, b) => a.month - b.month);
  return clean;
}
const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
export function monthLabel(startMonth: string, month: number): string {
  const [year, m] = startMonth.split("-").map(Number);
  return monthFormatter.format(new Date(Date.UTC(year, m + month - 2, 1)));
}
export function emi(
  principal: number,
  annualRate: number,
  months: number,
): number {
  if (principal <= 0) return 0;
  if (months <= 0) return principal;
  const r = annualRate / 1200;
  return r === 0
    ? principal / months
    : (principal * r) / -Math.expm1(-months * Math.log1p(r));
}
export function simulatePlan(
  raw: PlanInput,
  mode: PaymentMode,
  delay = raw.delayMonths,
  commonHorizon?: number,
): PlanResult {
  const p = parsePlan(raw);
  if (
    !MODES.includes(mode) ||
    !Number.isInteger(delay) ||
    delay < 0 ||
    delay > 36
  )
    throw new Error("Invalid payment mode or delay.");
  const shift = p.shiftConstruction ? delay : 0;
  // The first tranche is already committed; only future milestones can shift.
  const firstBaseMonth = p.tranches[0].month;
  const tranches = p.tranches.map((t) => ({
    ...t,
    month: t.month + (t.month > firstBaseMonth ? shift : 0),
  }));
  const firstMonth = tranches[0].month;
  const lastDrawMonth = tranches[tranches.length - 1].month;
  const possessionMonth = p.possessionMonth + delay;
  const emiStartMonth = p.emiStartMonth + shift;
  const horizonMonth =
    commonHorizon ??
    Math.max(possessionMonth, emiStartMonth, lastDrawMonth) + 11;
  if (!Number.isInteger(horizonMonth) || horizonMonth < 1 || horizonMonth > 600)
    throw new Error("Invalid comparison horizon.");
  const amortizationStart = mode === "pre-emi" ? emiStartMonth : firstMonth;
  const maturityMonth = amortizationStart + p.tenureMonths - 1;
  const finalMonth = Math.max(maturityMonth, horizonMonth);
  let debt = 0,
    drawn = 0,
    cash = p.startingCash,
    instalment = 0,
    totalInterest = 0;
  let lowestCash = cash,
    lowestCashMonth = 0,
    peakOutflow = 0,
    peakOutflowMonth = 1;
  let firstReserveBreach: number | null = cash < p.protectedReserve ? 0 : null;
  let firstFundingGap: number | null = null;
  let totalPrepayment = 0,
    skippedPrepayment = 0,
    payoffMonth: number | null = null,
    regularEmi = 0;
  const rows: MonthlyRow[] = [];
  for (let month = 1; month <= finalMonth; month++) {
    const tranche = tranches.find((t) => t.month === month);
    // Last draw absorbs floating point rounding so total borrowed is exactly the sanction.
    const disbursement = tranche
      ? month === lastDrawMonth
        ? p.loanAmount - drawn
        : (p.loanAmount * tranche.percent) / 100
      : 0;
    const openingDebt = debt;
    drawn += disbursement;
    debt += disbursement;
    const rate =
      p.annualRate + (month >= p.rateChangeMonth ? p.rateIncrease : 0);
    const interest = (debt * rate) / 1200;
    const interestOnly = mode === "pre-emi" && month < emiStartMonth;
    const remainingMonths = Math.max(1, maturityMonth - month + 1);
    const rateReset = month === p.rateChangeMonth && p.rateIncrease !== 0;
    if (
      !interestOnly &&
      (debt > 0 || (mode === "sanctioned-emi" && drawn < p.loanAmount))
    ) {
      if (mode === "sanctioned-emi") {
        const requiredEmi = emi(debt + p.loanAmount - drawn, rate, remainingMonths);
        if (month === firstMonth || rateReset) instalment = requiredEmi;
        else if (disbursement > 0) {
          // A previous draw may have been fully repaid, so some earlier payments
          // were capped or absent. Recast upward if needed to keep the term,
          // rather than hiding the missing principal in a final balloon payment.
          instalment = Math.max(instalment, requiredEmi);
        }
      } else if (month === amortizationStart || disbursement > 0 || rateReset) {
        instalment = emi(debt, rate, remainingMonths);
      }
      if (month === amortizationStart) regularEmi = instalment;
    }
    const payment = interestOnly
      ? interest
      : Math.min(
          debt + interest,
          month === maturityMonth ? debt + interest : instalment,
        );
    const principal = Math.max(0, payment - interest);
    debt = Math.max(0, debt - principal);
    const income =
      month >= p.incomePauseMonth &&
      month < p.incomePauseMonth + p.incomePauseMonths
        ? 0
        : p.monthlyIncome;
    const rent =
      month < possessionMonth
        ? p.rent * (1 + p.rentEscalation / 100) ** Math.floor((month - 1) / 12)
        : 0;
    const ownCash = tranche?.ownCash ?? 0;
    const moveInCost = month === possessionMonth ? p.moveInCost : 0;
    const mandatoryOutflow =
      payment + rent + p.livingExpenses + p.otherEmi + ownCash + moveInCost;
    const beforePrepayment = cash + income - mandatoryOutflow;
    const requestedPrepayment =
      month >= p.prepaymentStartMonth
        ? p.monthlyPrepayment +
          ((month - p.prepaymentStartMonth) % 12 === 0 ? p.annualPrepayment : 0)
        : 0;
    const eligiblePrepayment = Math.min(debt, requestedPrepayment);
    const prepayment = Math.min(
      eligiblePrepayment,
      p.protectReserve
        ? Math.max(0, beforePrepayment - p.protectedReserve)
        : eligiblePrepayment,
    );
    const skipped = eligiblePrepayment - prepayment;
    debt = Math.max(0, debt - prepayment);
    if (debt < 1e-7) debt = 0;
    cash = beforePrepayment - prepayment;
    const outflow = mandatoryOutflow + prepayment;
    totalInterest += interest;
    totalPrepayment += prepayment;
    if (month <= horizonMonth) {
      skippedPrepayment += skipped;
      if (cash < lowestCash) {
        lowestCash = cash;
        lowestCashMonth = month;
      }
      if (cash < p.protectedReserve && firstReserveBreach === null)
        firstReserveBreach = month;
      if (cash < 0 && firstFundingGap === null) firstFundingGap = month;
      if (outflow > peakOutflow) {
        peakOutflow = outflow;
        peakOutflowMonth = month;
      }
    }
    if (debt === 0 && month >= lastDrawMonth && payoffMonth === null)
      payoffMonth = month;
    rows.push({
      month,
      date: monthLabel(p.startMonth, month),
      rate,
      disbursement,
      openingDebt,
      interest,
      payment,
      principal,
      prepayment,
      skippedPrepayment: skipped,
      closingDebt: debt,
      income,
      rent,
      living: p.livingExpenses,
      otherEmi: p.otherEmi,
      ownCash,
      moveInCost,
      outflow,
      netCashFlow: income - outflow,
      cash,
    });
  }
  const horizonRows = rows.slice(0, horizonMonth);
  return {
    mode,
    delay,
    possessionMonth,
    emiStartMonth,
    horizonMonth,
    rows,
    lowestCash,
    lowestCashMonth,
    extraCashNeeded: Math.max(0, p.protectedReserve - lowestCash),
    firstReserveBreach,
    firstFundingGap,
    peakOutflow,
    peakOutflowMonth,
    totalInterest,
    regularEmi,
    interestThroughHorizon: horizonRows.reduce((s, r) => s + r.interest, 0),
    rentThroughHorizon: horizonRows.reduce((s, r) => s + r.rent, 0),
    debtAtPossession: rows[possessionMonth - 1]?.closingDebt ?? 0,
    cashAtHorizon: rows[horizonMonth - 1].cash,
    debtAtHorizon: rows[horizonMonth - 1].closingDebt,
    skippedPrepayment,
    totalPrepayment,
    payoffMonth: payoffMonth ?? maturityMonth,
  };
}
export function comparisonHorizon(input: PlanInput): number {
  const longestDelay = Math.max(12, input.delayMonths);
  return (
    Math.max(
      input.possessionMonth + longestDelay,
      input.emiStartMonth + (input.shiftConstruction ? longestDelay : 0),
    ) + 11
  );
}
export function comparePlans(
  input: PlanInput,
  delay = input.delayMonths,
): PlanResult[] {
  return MODES.map((mode) =>
    simulatePlan(input, mode, delay, comparisonHorizon(input)),
  );
}
export function toCsv(result: PlanResult): string {
  const headings = [
    "Month",
    "Date",
    "Rate percent",
    "Loan drawn INR",
    "Opening debt INR",
    "Interest INR",
    "Loan payment INR",
    "Principal INR",
    "Extra principal INR",
    "Skipped extra principal INR",
    "Closing debt INR",
    "Income INR",
    "Rent INR",
    "Living expenses INR",
    "Other EMI INR",
    "Own builder contribution INR",
    "Move-in cost INR",
    "Total outflow INR",
    "Net cash flow INR",
    "Cash balance INR",
  ];
  const lines = result.rows.map((r) =>
    [
      r.month,
      r.date,
      r.rate,
      r.disbursement,
      r.openingDebt,
      r.interest,
      r.payment,
      r.principal,
      r.prepayment,
      r.skippedPrepayment,
      r.closingDebt,
      r.income,
      r.rent,
      r.living,
      r.otherEmi,
      r.ownCash,
      r.moveInCost,
      r.outflow,
      r.netCashFlow,
      r.cash,
    ]
      .map((v) => (typeof v === "number" ? v.toFixed(2) : v))
      .join(","),
  );
  return "\uFEFF" + [headings.join(","), ...lines].join("\r\n");
}
export const MODEL_ASSUMPTIONS = [
  "Monthly estimate: each tranche arrives at the start of its month; interest is outstanding principal × annual rate ÷ 12. Mid-month draw dates and lender day-count conventions are not modelled.",
  "Rent stops at the start of the possession month. EMI commencement is independent of possession. Cash is measured at month-end; intra-month timing can require extra cash.",
  "Pre-EMI pays interest until the chosen EMI start month, then amortises over the entered tenure. The two early-EMI options begin that tenure at the first draw.",
  "Disbursed EMI is recalculated on new draws and rate resets over the remaining term. Sanction-based EMI starts from the sanction and can rise on later draws to retain that term. Interest applies only to drawn debt. Check lender availability.",
  "Extra payments reduce principal; instalments stay fixed between applicable tranche and rate recasts. Rate resets change EMI, rather than extending the contractual end date. The final payment clears any rounding balance.",
  "Reserve protection limits optional prepayments using month-end cash; it does not guarantee future affordability. Negative cash is an unfunded gap, not an assumed overdraft.",
  "Income, living costs and other EMIs stay constant; rent alone escalates annually. No tax relief, investment returns, processing fees, penalties or builder compensation is assumed. Enter upfront costs as own cash and move-in costs.",
];
