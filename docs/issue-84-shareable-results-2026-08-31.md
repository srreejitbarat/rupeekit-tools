# Issue #84 — Shareable calculator results and scenario URLs

Date: 2026-08-31

## What shipped

RupeeKit now has one shared permalink mechanism at `CalculatorAnalyticsBoundary`, so calculator input fields with stable names/IDs can be encoded with the `rk_` query prefix, restored on load, and shared from the calculator surface. Because every calculator variant is rendered inside the same boundary, the mechanism is not limited to one calculator implementation.

The share event is `result_shared`. Analytics receives only `tool_slug`, `tool_category`, and the share method. User-entered financial values are never included in event parameters. Page-view analytics also strips the query string so permalink values are not copied into GA4 `page_location`.

## Indexation rule

There are two URL classes:

1. **Arbitrary share URLs** such as `/tools/emi-calculator-india?rk_principal=1000000&...`
   - Canonical remains the base calculator URL.
   - `middleware.ts` adds `X-Robots-Tag: noindex, follow` to any `/tools/*` request containing query parameters.
   - Parameter URLs are never emitted in the sitemap.
   - Their only purpose is to restore a user-selected scenario.

2. **Evidence-backed static scenario pages** under `/tools/scenarios/<slug>`
   - Self-canonical and indexable.
   - Included in the sitemap.
   - Must have a distinct target keyword from the parent calculator.
   - Must cite the demand evidence that justified creating the page.
   - Must contain a self-contained answer and fixed assumptions, not a thin redirect page.

This prevents arbitrary calculator values from producing index bloat while still allowing a small number of genuinely demanded long-tail examples to exist as normal public pages.

## Demand evidence used in this issue

Issue #84 itself records two GSC query shapes used for the initial pages:

- Salary-band personal-loan eligibility, including the Rs 25,000 monthly-salary shape. Issue #75 and the current Personal Loan Eligibility page also document the same salary-band cluster. The static scenario uses the already-published assumptions: no existing EMI, 50% FOIR, 14% annual rate and 48 months, producing about Rs 4.57 lakh illustrative eligibility.
- `EMI for 10 lakh personal loan`. The existing Personal Loan EMI calculator already contains an explicit Rs 10 lakh / 5 year / 14% preset, so the static scenario reuses those assumptions instead of inventing a new product claim.

No additional indexable scenario was created without recorded demand evidence.

## Safety boundaries

- No calculator formula was changed.
- No lender approval, lowest-rate, guaranteed-return, guaranteed-tax-saving or personalized-advice claim was added.
- No PAN, Aadhaar, bank details or other sensitive data is requested.
- Shared values are created only when the user explicitly chooses to share the current scenario.
- Shared values are not sent as analytics event parameters.
- Scenario pages use the parent calculator's existing methodology rather than maintaining a second formula implementation.

## Measurement note

`result_shared` is a directional engagement event, not proof that a share produced another visit. At current RupeeKit traffic levels, evaluate absolute counts before drawing conclusions from percentage changes.

## Search Console handling

After deployment, the two new static scenario pages qualify as new important public pages and can be submitted once through URL Inspection after live checks pass. Do not request indexing for arbitrary `?rk_...` URLs; they are intentionally noindex and canonicalize to the base calculator.
