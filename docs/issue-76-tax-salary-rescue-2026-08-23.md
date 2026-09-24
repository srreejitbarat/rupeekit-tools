# Issue #76 — Tax regime + salary in-hand rescue (23 August 2026)

## Decision from the Day 19 retro

The Day 19 retro is still a partial measurement checkpoint rather than a complete trailing-28-day rerank. The strongest available page-level evidence used there showed `salary-in-hand-calculator-india` at 528 impressions, 0 clicks and average position 13.46 for 8–14 August, an improvement from the older 154-impression / position-30.2 baseline. The old-vs-new tax calculator did not have a trustworthy fresh row in that partial export, so this issue does not manufacture a replacement position for its 442-impression / position-42.1 baseline.

That changes the shape of the work: salary-in-hand needs stronger CTC-structure clarity and a direct journey into tax calculation, while the tax calculator needs an answer-first regime comparison without changing the tax engine.

## What changed

- Added a representative old-vs-new regime comparison before the tax calculator inputs at ₹8 lakh, ₹12 lakh, ₹15 lakh and ₹20 lakh gross salary.
- The representative table is explicitly salary-only: standard deduction applies, while HRA, 80C, 80D, home-loan interest and NPS deductions are zero unless the user enters them later.
- The tax calculator now defaults from `availableTaxYears[0]` instead of hardcoding FY 2025-26, keeping the UI aligned with the newest supported year while retaining FY 2025-26 as a selectable and regression-tested year.
- Added a salary-tax journey block from the tax calculator to the Salary In-Hand Calculator and three supporting blogs.
- Added CTC-component depth to Salary In-Hand: basic salary, HRA, employee PF, employer PF, gratuity, professional tax and TDS are explained without changing the existing formula.
- Added reciprocal calculator links from the three related blogs:
  - `/blog/how-to-calculate-in-hand-salary-from-ctc-india`
  - `/blog/income-tax-on-12-lakh-salary-new-regime-india-2026`
  - `/blog/old-vs-new-tax-regime-which-saves-more`
- Added regression tests for the Finance Act 2025 parameter set, default-year selection, salary formula preservation and bidirectional links.

## Scope boundary retained

The tax page already states that the engine models a resident individual with normal slab-rate income and does not model equity STCG/LTCG or other special-rate income. That banner remains unchanged. The new representative table repeats this limitation because Section 87A treatment can differ when special-rate income exists.

The Salary In-Hand calculator formula is also unchanged. Its historical formula starts from `annualCtc / 12`; the new copy now tells users that some CTC structures include employer PF, gratuity, insurance, variable pay or benefits that are not monthly cash salary. That is a content correction around the existing model, not a silent formula rewrite.

## FY 2025-26 / AY 2026-27 tax verification

The existing rule configuration was re-verified on 23 August 2026 against official Government of India sources.

For FY 2025-26 / AY 2026-27, the configured new-regime slabs remain:

- Up to ₹4,00,000: nil
- ₹4,00,001–₹8,00,000: 5%
- ₹8,00,001–₹12,00,000: 10%
- ₹12,00,001–₹16,00,000: 15%
- ₹16,00,001–₹20,00,000: 20%
- ₹20,00,001–₹24,00,000: 25%
- Above ₹24,00,000: 30%

The configured Section 87A limit is ₹12,00,000 of taxable income with maximum rebate ₹60,000 and marginal-relief handling. Health and education cess remains 4%. The salaried new-regime standard deduction is ₹75,000.

Primary references:

- Income Tax Department — Salaried Individuals for AY 2026-27: https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1
- Income Tax Department — ITR-2 FAQs for AY 2026-27: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/itr-2/itr-2-faqs
- Union Budget 2025-26 Finance Bill, Section 87A amendment: https://www.indiabudget.gov.in/budget2025-26/doc/Finance_Bill.pdf
- Union Budget 2024 memorandum — ₹75,000 salaried standard deduction under the new regime applies from AY 2025-26 onward: https://www.indiabudget.gov.in/budget2024-25/doc/memo.pdf

No tax parameter was changed in this issue because the existing FY 2025-26 configuration already matches those official values.

## AI SEO / indexing rationale

This issue improves depth on two pages with demonstrated search demand rather than creating new salary-specific or tax-specific thin pages. The tax page presents the comparison intent before inputs, while the salary page answers the common CTC-component question and routes users into tax calculation. Reciprocal blog links give crawlers and readers multiple contextual paths through the same salary-to-tax journey without creating competing URLs.

## Search Console action after deployment

This is a major content update to two existing important calculators, so after deployment it is reasonable to use URL Inspection → Test Live URL on:

1. `/tools/income-tax-calculator-old-vs-new-regime-india`
2. `/tools/salary-in-hand-calculator-india`

If each URL is already indexed and Google can fetch the updated page, do not repeatedly request indexing. A one-time request is appropriate only if the important changed URL needs recrawling after this substantial content update or remains not indexed after several days. Do not request indexing for the three blog pages merely because their related-calculator links changed.
