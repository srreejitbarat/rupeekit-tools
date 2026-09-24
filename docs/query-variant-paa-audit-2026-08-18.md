# Query-Variant and PAA Coverage Audit — 18 August 2026

## Scope

Issue #71 asks for query-variant and People-Also-Ask-style depth on the top 10 high-impression pages, using query data for vocabulary and shape rather than aggregate CTR calculations.

The Day 10 report at `automation/reports/gsc/2026-08-12.json` is explicitly `bootstrap-partial`: its `topPages` array is empty because a fresh service-account pull was not available. Therefore this change does **not** invent a replacement top-10 ranking. It uses the highest-impression pages already recorded in the authoritative page-level evidence in issue #57 and `docs/gsc-ctr-improvement-2026-08-04.md`.

The ten pages covered are:

| Page | Recorded evidence used | Variant clusters covered |
| --- | --- | --- |
| `/blog/itr-2-ay-2026-27-filing-guide` | 961 impressions in Aug-4 page-level audit | who files, capital gains, foreign assets, documents/deadlines |
| `/tools/personal-loan-emi-calculator-india` | 602 impressions | loan amount, interest-rate and 3y-vs-5y tenure variants |
| `/tools/8th-pay-commission-salary-calculator-india` | 521 impressions | fitment-factor scenarios, DA and HRA |
| `/tools/emergency-fund-calculator-india` | 507 impressions | 3/6/9/12 months, EMI, freelancer/single-income |
| `/tools/personal-loan-eligibility-calculator-india` | 476 impressions / 91 query variants in issue #57 | ₹12k/₹13k/₹14k/₹25k/₹40k/₹45k salary, FOIR, check-vs-calculator, lender criteria |
| `/tools/gold-loan-calculator-india` | 474 impressions in issue #57 | grams, purity, reference value, RBI LTV tiers |
| `/blog/zerodha-vs-upstox-vs-angel-one-demat-account` | 467 impressions | brokerage, AMC, delivery, beginner/trader/investor comparison |
| `/blog/new-labour-code-gratuity-rules-india-2026` | 458 impressions | one-year vs five-year, fixed-term vs contract worker, death/disablement |
| `/tools/income-tax-calculator-old-vs-new-regime-india` | 442 impressions in issue #57 | salary bands, deductions, switching, special-rate scope |
| `/tools/net-worth-calculator-india` | 344 impressions in issue #57 | asset/liability classification, liquid net worth, debt-to-asset ratio |

## Implementation

Two additive data files hold the new coverage:

- `data/query-variant-tool-overrides-2026-08-18.json`
- `data/query-variant-blog-overrides-2026-08-18.json`

`lib/tools.ts` appends tool sections, FAQs and source links to the existing tool records. `data/all-blog-posts.ts` appends blog sections and FAQs to the existing posts. This avoids duplicating calculators or creating thin supporting pages that could cannibalise the parent.

Every touched page receives at least two additional question-form FAQs. Because the normal tool and blog layouts already render their `faqs` collections visibly and build FAQ structured data from those same collections, the schema remains backed by visible copy.

## Personal-loan eligibility: lender criteria boundary

The salary-band section deliberately does not invent loan amounts for ₹12k/₹13k/₹14k/₹25k/₹40k/₹45k income. A loan amount requires rate, tenure, existing EMI and FOIR assumptions, and lender approval uses more than salary.

Bank-wise criteria are attributed to official lender pages and framed as changeable, lender-specific rules:

- SBI personal-loan page: published salaried eligibility, service-history, age, minimum net monthly salary and EMI/NMI criteria.
- HDFC Bank personal-loan eligibility page: published minimum income, age and employment-tenure criteria.
- ICICI Bank personal-loan eligibility flow: current eligibility check uses personal, work and banking-relationship information.

Verification date for this implementation: **18 August 2026**. Readers are told to re-check the lender's official page before applying.

## Safety and cannibalisation decisions

- No calculator formula, input or output was changed.
- No new calculator was created.
- No `calculatorGuides` page was created because none of the selected sub-intents was sufficiently distinct to justify a new URL without cannibalisation risk.
- No guaranteed approval, return, tax saving or official 8th CPC outcome is stated.
- Tax, gratuity, RBI gold-loan and lender criteria retain educational/scope language and source boundaries.
- Query-level data is used only to shape vocabulary and sections, never to recompute site-wide CTR.

## Validation

`lib/issue-71.test.ts` asserts:

1. exactly 10 evidence-backed pages are in this issue's override set;
2. each receives at least two substantive sections and two PAA-style FAQs;
3. the personal-loan eligibility page explicitly covers all six salary bands, FOIR, phrasing split and lender-specific criteria;
4. no new slug or `targetKeyword` is introduced by these override files.

Required repository checks remain `npm run validate`, `npm run lint`, `npm run test`, and `npm run build`.
