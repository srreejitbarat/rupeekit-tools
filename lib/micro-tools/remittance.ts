import { check } from './common';

export type RemittanceRoute = { name: string; percentageFee: number; fixedForeign: number; intermediaryForeign: number;
  conversionRate: number; bankFee: number; certificateFee: number; taxAmount: number };
export type RemittanceInput = { currency: string; quoteDate: string; invoice: number; referenceRate: number; targetInr: number;
  transfersPerYear: number; splitCount: number; auditActual: boolean; actualReceived: number; routes: [RemittanceRoute, RemittanceRoute] };
export const REMITTANCE_EXAMPLE: RemittanceInput = {
  currency: 'USD', quoteDate: '2026-09-23', invoice: 2000, referenceRate: 90, targetInr: 180_000,
  transfersPerYear: 12, splitCount: 4, auditActual: true, actualReceived: 174_900,
  routes: [
    { name: 'Current route', percentageFee: 1, fixedForeign: 2, intermediaryForeign: 5, conversionRate: 89, bankFee: 200, certificateFee: 0, taxAmount: 36 },
    { name: 'Alternative quote', percentageFee: 0.5, fixedForeign: 5, intermediaryForeign: 0, conversionRate: 89.7, bankFee: 0, certificateFee: 150, taxAmount: 60 },
  ],
};
export function routePayout(invoice: number, route: RemittanceRoute) {
  const foreignFees = invoice * route.percentageFee / 100 + route.fixedForeign + route.intermediaryForeign;
  const convertedForeign = invoice - foreignFees;
  const localCharges = route.bankFee + route.certificateFee + route.taxAmount;
  return { foreignFees, convertedForeign, localCharges, net: convertedForeign * route.conversionRate - localCharges };
}
export type RouteResult = ReturnType<typeof routePayout> & { name: string; referenceValue: number; foreignFeesInr: number;
  fxDifference: number; allInCost: number; costPercent: number; effectiveRate: number; targetInvoice: number;
  splitNet: number | null; splitExtraCost: number | null; };
export type RemittanceResult = { errors: string[]; routes: RouteResult[]; referenceValue: number; difference: number;
  annualDifference: number; unexplained: number | null; actualEffectiveRate: number | null; actualAllInCost: number | null };
export function calculateRemittance(input: RemittanceInput): RemittanceResult {
  const errors: string[] = [];
  const empty: RemittanceResult = { errors, routes: [], referenceValue: 0, difference: 0, annualDifference: 0,
    unexplained: null, actualEffectiveRate: null, actualAllInCost: null };
  if (!['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD'].includes(input.currency)) errors.push('Choose a supported invoice currency.');
  const date = new Date(`${input.quoteDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.quoteDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== input.quoteDate) errors.push('Enter a valid quote date.');
  check(errors, input.invoice, 'Invoice amount', 0.01, 100_000_000);
  check(errors, input.referenceRate, 'Reference INR exchange rate', 0.0001, 1_000_000);
  check(errors, input.targetInr, 'Target INR receipt', 1, 100_000_000);
  check(errors, input.transfersPerYear, 'Similar transfers per year', 1, 365, true);
  check(errors, input.splitCount, 'Split payments', 1, 52, true);
  if (input.auditActual) check(errors, input.actualReceived, 'Actual bank credit', 0, 100_000_000_000);
  if (!Array.isArray(input.routes) || input.routes.length !== 2) { errors.push('Enter two payment routes.'); return empty; }
  if (input.routes[0].name.trim().toLowerCase() === input.routes[1].name.trim().toLowerCase()) errors.push('Give the two payment routes different names.');
  input.routes.forEach((route, i) => {
    if (!route.name.trim() || route.name.length > 60) errors.push(`Route ${i + 1}: enter a name of 1-60 characters.`);
    check(errors, route.percentageFee, `Route ${i + 1} percentage fee`, 0, 50);
    check(errors, route.conversionRate, `Route ${i + 1} conversion rate`, 0.0001, 1_000_000);
    for (const key of ['fixedForeign', 'intermediaryForeign', 'bankFee', 'certificateFee', 'taxAmount'] as const) check(errors, route[key], `Route ${i + 1} ${key}`, 0, 10_000_000);
    const payout = routePayout(input.invoice, route);
    if (payout.convertedForeign < 0 || payout.net < 0) errors.push(`Route ${i + 1}: charges exceed the invoice. Check amounts and currency units.`);
  });
  if (errors.length) return empty;
  const referenceValue = input.invoice * input.referenceRate;
  const routes = input.routes.map(route => {
    const payout = routePayout(input.invoice, route);
    const foreignFeesInr = payout.foreignFees * input.referenceRate;
    const fxDifference = payout.convertedForeign * (input.referenceRate - route.conversionRate);
    const targetInvoice = Math.ceil((((input.targetInr + payout.localCharges) / route.conversionRate + route.fixedForeign + route.intermediaryForeign) / (1 - route.percentageFee / 100)) * 100) / 100;
    const split = routePayout(input.invoice / input.splitCount, route);
    const splitNet = split.convertedForeign < 0 || split.net < 0 ? null : split.net * input.splitCount;
    return { ...payout, name: route.name, referenceValue, foreignFeesInr, fxDifference,
      allInCost: referenceValue - payout.net, costPercent: (referenceValue - payout.net) / referenceValue * 100,
      effectiveRate: payout.net / input.invoice, targetInvoice, splitNet, splitExtraCost: splitNet === null ? null : payout.net - splitNet };
  });
  const difference = routes[1].net - routes[0].net;
  return { errors, routes, referenceValue, difference, annualDifference: difference * input.transfersPerYear,
    unexplained: input.auditActual ? routes[0].net - input.actualReceived : null,
    actualEffectiveRate: input.auditActual ? input.actualReceived / input.invoice : null,
    actualAllInCost: input.auditActual ? referenceValue - input.actualReceived : null };
}
