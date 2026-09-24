# Home-loan, SIP and salary planning upgrades

Reviewed: 23 September 2026.

The existing three calculator URLs now offer a second planning mode. Quick calculators, their input state, canonical URLs and financial engines are preserved. The new modes load on demand and retain their own inputs when users switch modes.

## Home-loan repayment

Compare keeping the current EMI, prepayment with a target payment, repricing, and transfer. A fitting plan must clear debt by the inclusive target month, remain within the entered monthly payment limit, and preserve the reserve after upfront fees/prepayment and at each month end. It does not model daily cash timing.

Interest uses the monthly reducing balance. The alternative payment is the greater of the assumed contractual EMI and the payment needed for the target date. Same-lender prepayment retains the original EMI floor; repricing/transfer use the quote and original remaining term. Costs compare interest plus fees over the same horizon. Cash minus debt establishes sustained advantage over keeping. Separate tests remove initial income for up to 12 months or add one percentage point to rates while preserving payments.

Quotes are user assumptions, not live rates. All alternatives with a prepayment include the separate prepayment charge; quote fees exclude that charge. Tax benefits and interest on savings are excluded. Confirm lender permission and charges. Reference: [RBI floating-rate EMI reset guidance](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12529&Mode=0).

## Multiple-goal SIP allocation

Allocate one budget across one to five goals, with dedicated opening savings. Balanced allocation divides the budget by each goal's recalculated remaining contribution need; priority allocation follows the displayed order. Contributions occur at the start of a month, followed by return at annual assumption / 12, matching the established SIP convention. Unneeded budget stays outside the projection. Each goal stops at its deadline.

Today-cost targets compound at annual inflation until their own dates. The planner solves the required shared budget for the selected policy, searches equal deadline extensions within ten extra years and the 30-year maximum horizon, and allows projected affordable targets to be tested. Extension uses a scan because inflation can make later deadlines harder. A four-percentage-point lower return repeats the exact base contributions. These are scenarios, not investment recommendations, guaranteed returns or probabilities.

## Salary cash comparison

Two salary structures produce a dated 12-month calendar with net fixed salary, independently dated variable/joining bonuses, first-pay arrears, monthly living/work costs and one-off switching costs. The first-pay delay assumes employment throughout. Gross joining-bonus clawback is a separate exposure, measured from starting the job in month 1; no repayment or tax refund is invented.

Uses the existing `estimateIncomeTax` engine without changing its rules. Supports salary-only Indian residents below 60 and rejects projected fiscal gross above INR 50 lakh because surcharge is outside this model. PF uses the entered basic and contribution rate, with an optional editable monthly wage cap. The example cap is not a claim about the current statutory limit; users must confirm their wage base and cap with HR. Basic is a percentage of fixed CTC; variable pay and joining bonus are outside fixed CTC.

Each April-March tax estimate includes earlier-year income/TDS once and projects continued employment through March. The selected tax-rule year is held constant, including future fiscal years. Regular tax is spread over remaining fiscal months, bonuses reserve incremental tax at receipt, and unused prior TDS credit is disclosed without a presumed refund. Earlier fiscal history is zeroed when the user chooses an April start. Entered old-regime deductions must be eligible annual amounts; additional 80C excludes PF.

The fixed-pay solver excludes bonuses and uses a normal full year. It searches intervals around taxable-income thresholds so rebate discontinuities do not hide an earlier salary solution. It returns the lowest whole-rupee CTC found that meets the target within INR 50 lakh.

References: [Income Tax Department individual tax guidance](https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1), [Budget 2026 memorandum](https://www.indiabudget.gov.in/doc/memo.pdf).

## Interaction, privacy and exports

- Every mode has a skippable, keyboard-dismissable guide with back/next and reopening. Only the guide-seen preference is stored locally.
- Calculations use a submitted input snapshot. Edits visibly mark results as stale and disable downloads until recalculated. Invalid results have no report downloads.
- Charts have accessible descriptions and exact tables; CSV contains the complete schedule. PDF contains the comparison, assumptions and labelled input snapshot, using the existing shipped rupee fonts.
- Financial values remain in the browser for calculation and export. Planner share buttons copy the canonical calculator URL without input parameters. CSV quotes fields and protects user labels from spreadsheet formula injection.
- New features and limitations are server-rendered below the calculators, with no duplicate calculator URLs or ranking/uniqueness promises.

## Verification

Run `npm run validate`, `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. The new engine, report and interaction cases cover conservation of cash/debt, reserve checks before income, no double-budget allocation, deadline changes, delayed-pay conservation, bonus tax, clawback timing, rebate boundaries, stale downloads, guide controls, input preservation and private sharing.

For visual PDF QA, set `RUPEEKIT_PDF_QA_DIR` while running `components/planning/PlanPdf.test.tsx`, then render the resulting PDFs with Poppler. Generated QA files are not committed. Live browser verification follows the normal PR/Hostinger deployment workflow; the implementation browser cannot access local preview URLs.
