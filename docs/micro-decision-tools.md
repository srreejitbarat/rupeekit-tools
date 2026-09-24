# Three micro-niche decision calculators

Released for the September 2026 India calculator expansion. These tools add original decision support to narrower search intents; no keyword volume, ranking speed, AdSense approval or revenue claim is made.

| Route under `/tools/` | Decision supported |
| --- | --- |
| `no-cost-emi-calculator-india` | Cash versus purchase EMI; continue versus close after the same refund |
| `freelancer-remittance-fee-calculator-india` | Reconcile invoice to bank credit, compare two quotes, solve a target invoice and compare payment splitting |
| `company-car-lease-exit-calculator-india` | Compare staying, early buyout, returning and contract-approved continuation at a common date |

## Method and boundaries

All three engines are pure functions in `lib/micro-tools`. Editable defaults are examples. Quotes, fee tax, FX rates, payroll savings and contract eligibility are entered by the user; there is no live offer, provider ranking or automatic tax advice.

- EMI: full upfront subsidy solves principal so total base instalments equal the financed purchase price. Interest tax and upfront processing charges are separate. Refund occurs after the selected instalment, with cashback retained/reversed according to timing. Keeping EMI leaves the repayment schedule unchanged; closing pays remaining principal plus entered charges. The displayed effective annual cost is relative to paying cash, not the issuer's disclosed APR; nonconventional cash flows omit it.
- Remittance: foreign charges are deducted before conversion; INR charges and quoted tax follow. Reference-value loss reconciles to foreign fees at the reference rate, FX difference on converted funds, and INR charges. Target invoices round up to cents and hold the quote structure constant. Small splits whose charges exceed their value are unavailable, never silently clamped to zero. The bank audit refers to route 1 only.
- Lease: exit occurs after that month's normal payment, or now at month 0. Written buyout/return quotes include remaining contractual obligations, avoiding duplicate remaining rent. Loan fees are paid separately and do not reduce principal. Outstanding debt remains a liability at the common end date; retained car value is an asset, never spendable cash. Reserve checks include opening cash and each month end. Future career income and investment return are outside the model.

The engines enforce finite values, integer month counts, nonnegative charges and supported bounds before projecting. EMI is capped at 60 months; lease and buyout loans at 120 months. Every page includes the complete assumptions, primary references, a worked example and FAQ.

## UX, privacy and exports

Each calculator offers a four-step, skippable and reopenable native-dialog guide, examples, labelled inputs, comparison charts and accessible exact-value tables. Results use the last submitted snapshot. Edits disable downloads until recalculation; invalid submitted inputs replace results with errors. Only guide-seen preferences persist. Input sharing is disabled on these routes so personal quote amounts and provider labels stay out of links and analytics payloads.

PDF and CSV are generated in the browser from the same snapshot. Reports include inputs and assumptions; CSV contains the complete cash-flow or receipt reconciliation. Remittance currencies are labelled separately from INR. Spreadsheet formula-like labels are escaped by the shared CSV serializer. New PDF tests support `RUPEEKIT_MICRO_PDF_QA_DIR` for local rendered inspection.

## Search and advertising

The inventory drives calculator listings, the new freelance/business hub, sitemap and existing structured data. Contextual links connect established related tools. Dedicated 1600×900 compressed WebP cards have accurate question hooks and descriptive alt text; the source generator is `scripts/generate-micro-tool-images.mjs` (authoring runtime needs `sharp`). Metadata, visible copy and canonical URLs describe the actual tool, with no invented savings or urgency.

A manual responsive ad placement is at the end of the article, separated from forms, results and download controls, visibly labelled Advertisement. It renders only with both a valid `NEXT_PUBLIC_ADSENSE_CLIENT` and a numeric `NEXT_PUBLIC_ADSENSE_TOOL_SLOT`. This change supplies no invented slot ID. Existing site-wide automatic ad configuration is preserved. AdSense policies still apply to the site and publisher account; an implementation cannot promise approval.

## References checked 2026-09-23

- https://www.apple.com/in/shop/browse/financing/terms — upfront interest subsidy, issuer-controlled EMI/refund treatment and offer terms.
- https://wise.com/in/pricing/business/receive — route-specific conversion and business receipt charges.
- https://www.paypal.com/in/business/paypal-business-fees — distinct percentage, fixed and currency charges.
- https://www.orixindia.com/leasing/web/orix-lease-plus/corporate-lease — corporate lease product and agreement boundaries.
- https://www.ayvens.com/en-in/leasing-with-us/leasing-solutions/employee-car-lease/ — employee car lease and end-of-term options.
- https://support.google.com/adsense/answer/1346295?hl=en — ad placement and accidental-click guidance.

Actual issuer, payment provider, payroll and lessor documents control the user's transaction. Refresh source checks whenever offer mechanics or contract/tax assumptions change; no provider rate has been embedded as a current fact.
