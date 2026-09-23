import { money, moneyNumber } from '@/lib/planning/common';
import type { PlanReport } from '@/lib/planning/reports';
import { MICRO_SLUGS } from './common';
import type { NoCostInput, NoCostResult } from './no-cost-emi';
import type { RemittanceInput, RemittanceResult } from './remittance';
import type { CarLeaseInput, CarLeaseResult } from './car-lease';

export const EMI_ASSUMPTIONS = [
  'This is a credit-card purchase EMI model using your own issuer quote. Example interest and tax rates are editable assumptions. It is not a live bank offer, approval or a universal tax rule.',
  'Full upfront subsidy mode reduces financed principal so that total base instalments equal purchase price minus down payment. Quoted mode uses the actual financed principal. Do not subtract an upfront interest subsidy twice. Separate cashback is received in the selected month.',
  'Equal monthly instalments use a fixed annual rate divided by 12. Interest tax is charged separately on each month\'s interest. Processing fees plus their tax are paid at checkout. Actual statement dates, day-count interest and rounding can differ.',
  'Annualised cost versus cash is an effective annual rate from the cash price avoided, down payment, upfront fees and subsequent net monthly payments. It is not the lender\'s disclosed APR. It is omitted when cashback creates mixed-sign payments or the initial financed benefit is not positive.',
  'A return happens after the selected month\'s EMI (month 0 means before the first EMI). The merchant refund is an actual expected credit, before the separately entered cashback reversal. Both return scenarios receive the same entered merchant and processing-fee refunds. Do not enter a fee refund unless confirmed.',
  'Keeping EMI assumes the refund becomes a usable card/account credit and leaves the loan schedule unchanged. Closing EMI pays all remaining principal plus entered charges at that point. This does not model a partial principal reduction or automatic cancellation. Confirm treatment with the issuer.',
  'Closure percentage applies to remaining principal; fixed closure fees and fee tax are added only while debt remains. Interest already paid is not refunded. The closure quote can differ because of day-count interest, subsidy recovery or other contract terms.',
  'Cashback received by the return date is reversed down to the retained amount. If cashback arrives later, only the retained amount is received. Future totals offset refund credits in the event month, but you may need the gross settlement cash before the refund arrives.',
  'Compare purchase options separately from the return scenarios: after a partial return you still own some goods, and this model does not value them. Negative net outflow means credits exceed modelled payments; it is not a guaranteed profit.',
  'Reference: https://www.apple.com/in/shop/browse/financing/terms . The card issuer\'s actual EMI and refund terms control your transaction.',
];
const EMI_LABELS: Record<keyof NoCostInput, string> = {
  price: 'Purchase price before EMI interest subsidy (INR)', cashDiscount: 'Discount for paying upfront (INR)', downPayment: 'Down payment (INR)',
  principalMode: 'Principal calculation mode', quotedPrincipal: 'Quoted principal, used only in quoted mode (INR)', annualRate: 'Annual card interest rate (%)', months: 'EMI term (months)',
  processingFee: 'Processing fee before tax (INR)', interestTaxRate: 'Tax rate on interest (%)', feeTaxRate: 'Tax rate on fees (%)',
  cashback: 'Separate cashback if purchase is kept (INR)', cashbackMonth: 'Cashback month', refundMonth: 'Return / closure after month',
  merchantRefund: 'Merchant refund before cashback reversal (INR)', retainedCashback: 'Cashback retained after return (INR)', feeRefund: 'Confirmed processing fee refund including tax (INR)',
  closurePercent: 'Closure charge on outstanding principal (%)', closureFixedFee: 'Fixed closure charge before tax (INR)',
};
function snapshot(value: object, labels: Record<string, string>) {
  return Object.entries(value).filter(([key]) => !['routes'].includes(key)).map(([key, v]) => [labels[key] ?? key, typeof v === 'boolean' ? v ? 'Yes' : 'No' : typeof v === 'number' && !Number.isFinite(v) ? 'Not entered (unused)' : String(v)]);
}
export function noCostReport(input: NoCostInput, result: NoCostResult): PlanReport {
  return { title: 'No-cost EMI: purchase and return comparison', subtitle: `${input.months} monthly instalments | Return after month ${input.refundMonth}`,
    filename: 'rupeekit-no-cost-emi-plan', url: `https://www.rupeekit.co.in/tools/${MICRO_SLUGS.emi}`, inputs: snapshot(input, EMI_LABELS), assumptions: EMI_ASSUMPTIONS,
    sections: [
      { title: 'Buying and keeping the purchase', headers: ['Pay upfront', 'Total EMI-route outflow', 'EMI minus cash'], rows: [[money(result.cashPrice), money(result.purchaseTotal), money(result.extraVsCash)]],
        lines: [`Financed principal ${money(result.principal)}; upfront principal discount ${money(result.subsidy)}; base monthly EMI ${money(result.emi)}.`, `Total interest ${money(result.totalInterest)}, tax on interest ${money(result.totalInterestTax)}, processing fee including tax ${money(result.feesWithTax)}.`, `Effective annualised cost versus cash: ${result.annualisedCost === null ? 'not shown for these cash flows' : `${result.annualisedCost.toFixed(2)}%`}.`] },
      { title: 'After the same merchant return', headers: ['Keep EMI: net outflow', 'Close EMI: net outflow', 'Keep minus close'], rows: [[money(result.keepTotal), money(result.closeTotal), money(result.closeSaving)]],
        lines: [`Remaining principal at closure ${money(result.closureBalance)}; closure charges including tax ${money(result.closureCharges)}.`, `Gross closure settlement ${money(result.settlementCash)} may be needed before receiving the refund. Remaining goods are not valued.`] },
    ],
    schedule: [['Month (0 = checkout)', 'Base EMI', 'Interest inside EMI', 'Tax on interest', 'Scheduled loan balance', 'Purchase cash outflow', 'Keep EMI after return: cash outflow', 'Close EMI after return: cash outflow', 'Keep: cumulative net outflow', 'Close: cumulative net outflow'],
      ...result.rows.map(r => [r.month, ...[r.payment, r.interest, r.interestTax, r.balance, r.purchaseCash, r.keepCash, r.closeCash, r.keepTotal, r.closeTotal].map(moneyNumber)])] };
}

export const REMITTANCE_ASSUMPTIONS = [
  'All exchange rates and fees are manually entered quotes or statement values, not live prices or provider recommendations. Example quotes are illustrative. Compare the same currency, date, invoice and payment route.',
  'Percentage fee applies to the gross invoice. Fixed platform and intermediary fees are deducted in the invoice currency before conversion. The remaining foreign amount is converted at the entered rate, then bank fees, certificate fees and the entered tax amount are deducted in INR.',
  'Do not count the same fee twice. Enter a separate tax amount only if it is not already included in your other fee fields. This tool does not infer the taxable base of currency conversion or assume that every fee has the same GST treatment.',
  'The reference value is gross invoice times reference exchange rate. The difference is decomposed into foreign fees valued at the reference rate, FX rate difference on the amount converted, and local charges. A negative FX difference means the entered conversion rate is better than the reference.',
  'The bank-credit audit applies to route 1 only. Its unexplained difference can reflect timing, rounding, missing fees, credits or incorrect inputs; it is not proof of wrongdoing. The all-in effective rate equals net INR divided by gross invoice currency.',
  'The target-invoice solver holds exchange rates, fixed fees and entered INR tax constant while scaling the percentage fee. It rounds the invoice up to two decimal places. Obtain a fresh quote for the resulting amount, especially when tax or fee tiers change.',
  'Split-payment and annual comparisons reuse identical rates and per-payment fees. Each split repeats the fixed fees and entered INR tax. They exclude settlement delays, discounts, tier changes and market movements. Annual differences are scenarios, not promised savings.',
  'This is a receipt audit, not an income-tax or GST filing calculation. No gross revenue, taxable profit, export eligibility, FIRC/eFIRC entitlement or regulatory compliance conclusion is inferred from the net bank credit.',
  'References: https://wise.com/in/pricing/business/receive and https://www.paypal.com/in/business/paypal-business-fees . Consult the actual provider quote for your route and eligibility.',
];
export function foreign(value: number, currency: string) { return `${currency} ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
export function remittanceReport(input: RemittanceInput, result: RemittanceResult): PlanReport {
  const labels = { currency: 'Invoice currency', quoteDate: 'Quote / statement date', invoice: `Gross invoice (${input.currency})`, referenceRate: `Reference INR per 1 ${input.currency}`, targetInr: 'Target bank receipt (INR)', transfersPerYear: 'Similar transfers per year', splitCount: 'Equal split payments', auditActual: 'Audit actual route 1 bank receipt', actualReceived: 'Actual route 1 bank receipt (INR)' };
  const routeLabels = { name: 'Name', percentageFee: 'Gross invoice fee (%)', fixedForeign: `Fixed platform fee (${input.currency})`, intermediaryForeign: `Intermediary deductions (${input.currency})`, conversionRate: `Conversion INR per 1 ${input.currency}`, bankFee: 'Local bank fee (INR)', certificateFee: 'Certificate / service fee (INR)', taxAmount: 'Additional tax charged (INR)' };
  return { title: 'Freelancer payment fee audit', subtitle: `${foreign(input.invoice, input.currency)} invoice | Quote date ${input.quoteDate}`,
    filename: 'rupeekit-remittance-fee-audit', url: `https://www.rupeekit.co.in/tools/${MICRO_SLUGS.remittance}`,
    inputsHeading: 'INPUTS (each currency and unit is labelled)', scheduleHeading: 'RECEIPT RECONCILIATION (all values INR)',
    inputNote: `Invoice and foreign fees use ${input.currency}. Local charges and results use INR. Exchange rates mean INR per 1 ${input.currency}. CSV contains the full receipt reconciliation.`,
    inputs: [...snapshot(input, labels), ...input.routes.flatMap((r, i) => snapshot(r, routeLabels).map(([key, value]) => [`Route ${i + 1} / ${key}`, value]))], assumptions: REMITTANCE_ASSUMPTIONS,
    sections: [
      { title: 'Two quotes, one invoice', headers: ['Route', 'Net INR', 'All-in INR per unit', 'Difference from reference'], rows: result.routes.map(r => [r.name, money(r.net), r.effectiveRate.toFixed(4), money(r.allInCost)]) },
      { title: 'Invoice target and payment splitting', headers: ['Route', 'Invoice for target', 'INR after split payments', 'Extra split cost'], rows: result.routes.map(r => [r.name, foreign(r.targetInvoice, input.currency), r.splitNet === null ? 'Fees exceed split' : money(r.splitNet), r.splitExtraCost === null ? 'Unavailable' : money(r.splitExtraCost)]), lines: [`Target receipt ${money(input.targetInr)}. ${input.splitCount} equal payments are compared with one payment of the same total invoice.`, `Route 2 minus route 1: ${money(result.difference)} per invoice, or ${money(result.annualDifference)} across ${input.transfersPerYear} identical transfers.`] },
      ...(input.auditActual ? [{ title: 'Actual bank credit: route 1', lines: [`Modelled ${money(result.routes[0].net)}; actual ${money(input.actualReceived)}; model minus actual ${money(result.unexplained!)}.`, `Actual all-in rate ${result.actualEffectiveRate!.toFixed(4)} INR per ${input.currency}. Difference from reference ${money(result.actualAllInCost!)}. A discrepancy needs reconciliation, not an accusation.`] }] : []),
    ],
    schedule: [['Route', 'Gross reference value', 'Foreign fees at reference rate', 'FX rate difference', 'Local fees and tax', 'Expected bank receipt'], ...result.routes.map(r => [r.name, ...[r.referenceValue, r.foreignFeesInr, r.fxDifference, r.localCharges, r.net].map(moneyNumber)])] };
}

export const LEASE_ASSUMPTIONS = [
  'A forward-looking car-cost comparison from today through the entered remaining lease term. Past payments are sunk and excluded. This is not a recommendation to leave or keep a job; salary changes and other employment benefits are excluded.',
  'Payroll lease deduction minus the monthly tax saving confirmed by payroll, plus extra running costs, gives the current monthly cash cost. Tax saving is an input, not a computed statutory benefit or a flat assumed tax bracket. Enter zero if it is unconfirmed.',
  'All settlement quotes must include applicable taxes, fees, subsidy recovery and remaining obligations. The exit buyout and return settlement are alternative all-inclusive quotes: remaining lease rentals are not added again. Quotes depend on the exit date and contract; refresh them when changing timing.',
  'Exit takes place after the selected month\'s normal lease payment. Month 0 means exit now. Replacement costs or ownership costs and the first buyout-loan EMI start in the following month. Continuation is shown only when you confirm that the employer or lessor permits it.',
  'A buyout loan uses the fixed annual rate divided by 12. Upfront loan charges including their tax are paid separately at exit and do not reduce loan principal. Exclude charges already included in the buyout quote. Loan debt remaining at the end of the comparison is retained as a liability; it is not ignored because the loan runs longer than the lease.',
  'Net economic car cost = future cash paid + loan debt still owed - estimated car value at the common end date. Car value is not added to cash and no sale is assumed. End-of-lease ownership follows each selected buy/return option. No investment return or present-value discounting is modelled.',
  'Available cash begins at entered opening cash, receives the entered car-budget allocation each month, and subtracts that option\'s costs. The reserve check includes today and every month end, not daily timing. The same budget is used for all options and already excludes other household spending.',
  'Only car costs are included: confirm insurance, maintenance, fuel, transfer eligibility, final settlement, ownership and buyout-loan approval. Replacement transport may offer different convenience or value from keeping this car. Quotes do not imply lender approval.',
  'References: https://www.orixindia.com/leasing/web/orix-lease-plus/corporate-lease and https://www.ayvens.com/en-in/leasing-with-us/leasing-solutions/employee-car-lease/ . Your signed agreement and written exit quote control the actual treatment.',
];
const LEASE_LABELS: Record<keyof CarLeaseInput, string> = {
  remainingMonths: 'Remaining lease / comparison months', exitMonth: 'Exit after month (0 = now)', openingCash: 'Opening available cash (INR)', reserve: 'Protected cash reserve (INR)', monthlyCarBudget: 'Monthly allocation to car budget (INR)',
  payrollDeduction: 'Monthly payroll lease deduction (INR)', payrollTaxSaving: 'Payroll-confirmed monthly tax saving (INR)', leaseRunningCost: 'Extra monthly costs while leasing (INR)',
  endAction: 'Original lease end action', endBuyout: 'All-in original end buyout (INR)', endReturnFee: 'All-in original end return fee (INR)', terminalCarValue: 'Estimated car value at comparison end (INR)',
  exitBuyout: 'All-in early buyout quote (INR)', finance: 'Early buyout funding', downPayment: 'Down payment if using loan (INR)', loanFee: 'Upfront buyout loan charges including tax (INR)', loanRate: 'Annual buyout loan rate (%)', loanMonths: 'Buyout loan months',
  ownershipRunningCost: 'Monthly ownership running cost (INR)', exitReturnSettlement: 'All-in early return settlement (INR)', replacementMonthlyCost: 'Monthly replacement transport (INR)',
  continuationAllowed: 'Continuation / transfer is approved', continuationMonthlyCost: 'Total monthly cash cost after continuation (INR)', continuationTransferFee: 'All-in transfer fee (INR)',
  continuationEndAction: 'Continuation end action', continuationEndCost: 'All-in continuation final settlement (INR)',
};
export function carLeaseReport(input: CarLeaseInput, result: CarLeaseResult): PlanReport {
  return { title: 'Company car lease: exit and buyout plan', subtitle: `${input.remainingMonths} months from today | Exit after month ${input.exitMonth}`,
    filename: 'rupeekit-car-lease-exit-plan', url: `https://www.rupeekit.co.in/tools/${MICRO_SLUGS.lease}`, inputs: snapshot(input, LEASE_LABELS), assumptions: LEASE_ASSUMPTIONS,
    sections: [
      { title: 'Same-end-date car costs', headers: ['Option', 'Future cash paid', 'Debt at end', 'Car value at end'], rows: result.options.map(o => [o.name, money(o.totalPaid), money(o.terminalDebt), money(o.terminalAsset)]) },
      { title: 'Cost and cash are different', headers: ['Option', 'Net economic cost', 'Lowest cash', 'Reserve shortfall'], rows: result.options.map(o => [o.name, money(o.adjustedCost), money(o.lowestCash), money(o.reserveShortfall)]), lines: ['Net economic cost adds remaining debt and subtracts retained car value. Car value is not cash available for bills.'] },
      { title: 'Cash needed when leaving', headers: ['Option', 'Exit settlement / down payment'], rows: result.options.filter(o => o.id !== 'stay').map(o => [o.name, money(o.exitSettlement)]), lines: [`Current net lease cost ${money(result.netLeaseMonthly)} a month. Early-buyout loan EMI ${money(result.buyoutLoanEmi)}, before ownership running costs.`, result.bestFit ? `Lowest modelled car cost preserving the reserve: ${result.bestFit.name}. This excludes job income changes.` : 'None of these options preserves the entered reserve throughout the comparison.'] },
    ],
    schedule: [['Option', 'Month (0 = today)', 'Recurring car costs', 'Settlement', 'Buyout loan EMI', 'Total cash outflow', 'Available cash', 'Loan debt', 'Cumulative paid'],
      ...result.options.flatMap(o => o.rows.map(r => [o.name, r.month, ...[r.recurring, r.settlement, r.loanPayment, r.outflow, r.cash, r.debt, r.totalPaid].map(moneyNumber)]))] };
}
