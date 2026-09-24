import { inRange } from '@/lib/planning/common';

export const MICRO_SLUGS = {
  emi: 'no-cost-emi-calculator-india',
  remittance: 'freelancer-remittance-fee-calculator-india',
  lease: 'company-car-lease-exit-calculator-india',
} as const;
export const isMicroTool = (slug: string) => Object.values(MICRO_SLUGS).some(value => value === slug);
export const amount = (n: number) => Math.round(n * 100) / 100;
export const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
export function check(errors: string[], value: number, label: string, min = 0, max = 100_000_000, integer = false) {
  // A dependent limit can be unavailable while its parent input is blank.
  // The engines validate that parent separately; avoid ranges such as 0–NaN.
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) return;
  if (!inRange(value, min, max) || (integer && !Number.isInteger(value))) errors.push(`${label}: enter ${integer ? 'a whole number' : 'a number'} between ${min.toLocaleString('en-IN')} and ${max.toLocaleString('en-IN')}.`);
}
export function payment(principal: number, annualRate: number, months: number) {
  const r = annualRate / 1200;
  return r === 0 ? principal / months : principal * r / (1 - (1 + r) ** -months);
}
export function amortize(principal: number, annualRate: number, months: number) {
  const emi = payment(principal, annualRate, months);
  let balance = principal;
  return Array.from({ length: months }, (_, index) => {
    const opening = balance;
    const interest = opening * annualRate / 1200;
    const paid = index === months - 1 ? opening + interest : Math.min(emi, opening + interest);
    balance = Math.max(0, opening + interest - paid);
    return { month: index + 1, opening, interest, payment: paid, principal: paid - interest, balance };
  });
}

/** Only conventional cash flows: positive value now, non-negative later payments.
 * Cashback can create sign changes/multiple roots; suppress the rate in that case. */
export function annualCost(valueNow: number, outflows: number[]): number | null {
  if (!(valueNow > 0) || outflows.some(n => n < 0) || !outflows.some(n => n > 0)) return null;
  const pv = (r: number) => sum(outflows.map((n, i) => n / (1 + r) ** (i + 1)));
  let lo = -0.999, hi = 1;
  while (pv(hi) > valueNow && hi < 1024) hi *= 2;
  if (pv(hi) > valueNow) return null;
  for (let i = 0; i < 150; i++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > valueNow) lo = mid; else hi = mid;
  }
  const rate = ((1 + (lo + hi) / 2) ** 12 - 1) * 100;
  return Number.isFinite(rate) ? rate : null;
}
