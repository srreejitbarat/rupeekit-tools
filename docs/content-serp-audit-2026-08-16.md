# Content SERP metadata audit — 16 August 2026

Issue: #69 — CTR wave 3 for blogs, financial updates and government salary updates.

## Scope and decision

The audit covers blog metadata sources (`data/blog-posts.ts`, `data/extra-blog-posts.ts`, the Day 4 compliance modules and the Day 7 comparison batch) plus `data/financial-updates.ts` and `data/government-salary-updates.ts`.

Day 13 rules are treated as the SERP-copy target: title no longer than 60 characters, no title beginning with `Free`, and meta descriptions between 140 and 160 characters. Blog metadata now passes through a shared renderer-level normalizer so legacy copy cannot silently exceed those bounds. The validator scans every explicit blog `seoTitle`/`metaDescription` literal and audits every update record.

The update collections were deliberately not mass-rewritten. Their existing `/financial-updates/*` pages are the site's strongest CTR pattern (1.7–2.7% in the programme baseline), and issue #69 only calls for rewrites where a page has at least 50 impressions and below 1% CTR. The validator therefore reports out-of-band update metadata as an audit warning so a future low-CTR update can be rewritten from evidence rather than by blanket churn.

## Five zero-click pages from issue #57 / PR #58

These titles had already been rewritten in PR #58 and are still inside the measurement window. Issue #69 explicitly says not to re-touch them unless they violate the title-length rule. The validator now pins the exact titles so a later change cannot accidentally contaminate that experiment.

| Page | Baseline | Before #69 | After #69 | Decision |
|---|---:|---|---|---|
| `/blog/how-to-calculate-in-hand-salary-from-ctc-india` | 259 impressions, pos 13.0, 0 clicks | `CTC to In-Hand Salary India | PF, Tax & Take-Home` | unchanged | PR #58 title is compliant; preserve measurement window |
| `/blog/income-tax-on-12-lakh-salary-new-regime-india-2026` | 179 impressions, pos 21.0, 0 clicks | `Tax on Rs 12 Lakh Salary | Rebate & Marginal Relief` | unchanged | PR #58 title is compliant; preserve measurement window |
| `/blog/mutual-funds-for-beginners-india` | 163 impressions, pos 14.8, 0 clicks | `Mutual Funds for Beginners India | Start With Rs 500` | unchanged | PR #58 title is compliant; preserve measurement window |
| `/blog/monthly-expense-planning-for-family` | 130 impressions, pos 9.8, 0 clicks | `Monthly Expense Planning | Family Budget & Savings` | unchanged | PR #58 title is compliant; preserve measurement window |
| `/blog/epf-partial-withdrawal-rules-india` | 110 impressions, pos 8.7, 0 clicks | `EPF Partial Withdrawal Rules | Limits, Reasons & Forms` | unchanged | PR #58 title is compliant; preserve measurement window |

The page renderer now normalizes description length for the whole blog corpus while leaving compliant titles unchanged. This is a copy-boundary safeguard, not a new tax, investment, loan or return claim.

## Time-sensitive claim verification

The only protected title above that depends on a current tax-year fact is the ₹12 lakh new-regime article. The article's existing tax facts must remain governed by its cited official sources; this metadata pass does not change any rate, rebate amount, slab, threshold or filing rule.

No `dateModified` value is changed merely because this metadata audit ran. A page's modification date continues to reflect a real content change, not a synthetic freshness signal.

## Validation behavior

`scripts/validate-content-seo.mjs` now:

- audits every explicit blog SEO title and meta-description literal found in `data/*.ts`;
- guarantees the renderer-normalized blog title is <=60 characters and does not begin with `Free`;
- guarantees the renderer-normalized blog description is 140–160 characters;
- pins the five PR #58 zero-click titles exactly;
- audits financial-update and government-salary-update title/summary pairs and reports legacy out-of-band metadata without silently inventing new factual claims;
- is wired into `npm run validate`.

## 21 August integration note

The original #69 branch diverged from `main` while later calculator, blog, schema and FCRA work landed. This implementation was replayed on a fresh branch from current `main` rather than forcing the stale branch forward, preserving all newer production code while keeping #69's intended metadata boundary and validator.

## Search Console rule

This change is a metadata/validation pass, not a new-page or indexing-plumbing change. After deployment, measure affected blog CTR over 7/14/28 days. Do not request indexing solely because of this change.
