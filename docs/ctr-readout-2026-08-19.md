# CTR readout — 19 August 2026

Issue: #72  
Scope: first post-change readout for PR #51 (merged 3 Aug UTC / 4 Aug IST) and PR #58 (merged 5 Aug 2026).

## Executive verdict

**Do not ship a second-round title rewrite from this checkpoint.** The requested 14-day page-level Search Console comparison is not available in the connected tooling in this run, and the freshest trustworthy page-level evidence available to RupeeKit covers only **8–14 August 2026 (7 days)**. GSC Wizard was also attempted and returned `payment_required`, so it could not supply the missing page-level window.

The 7-day evidence is useful for direction but is not the 14-day decision gate specified in #72. Therefore every slug below is classified **insufficient data** for the formal win/flat/loss decision. No title is changed merely to satisfy the ticket mechanically.

This is especially important because the 16 Aug product/search audit placed **8th CPC, gold loan, salary-in-hand and SSY on a formula-hold / correctness-first path**. Increasing CTR on a calculator whose model is under correctness review would be the wrong optimisation order.

## Data sources and interpretation rules

1. **Baseline:** authoritative page-level Search Console export for 4 Jul–5 Aug 2026, recorded in issue #57 and `docs/gsc-ctr-improvement-2026-08-04.md`.
2. **Freshest post-change evidence available in this run:** RupeeKit Search Growth Audit, evidence cut 8–14 Aug 2026. It reports 18 clicks / 7,798 impressions sitewide for that seven-day period and provides page-level metrics for the five highest-impression calculator pages plus `/blog`.
3. Query-level rows are not used for aggregate CTR attribution. Issue #57 established that query exports omit a large share of impressions/clicks due to anonymisation.
4. Position and CTR are read together. A CTR move is not treated as a title effect when average position also moved materially.
5. The #72 rule remains: do not call a winner on fewer than 100 post-change impressions, and 14 days is direction rather than proof.

## Per-slug attribution table

`—` means the required post-change page row is not present in the available 8–14 Aug evidence set. The baseline is still recorded so the row is ready for the next page-level export.

| Page / slug | Change source | Baseline clicks | Baseline impr. | Baseline CTR | Baseline pos. | 8–14 Aug clicks | 8–14 Aug impr. | 8–14 Aug CTR | 8–14 Aug pos. | Formal verdict | Direction / note |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| `/blog/itr-2-ay-2026-27-filing-guide` | #51 | 5 | 961 | 0.52% | 4.54 | — | — | — | — | insufficient data | Needs the full page-level post window. |
| `/blog/new-labour-code-gratuity-rules-india-2026` | #51 | 3 | 458 | 0.66% | 4.83 | — | — | — | — | insufficient data | Needs the full page-level post window. |
| `/tools/capital-gains-tax-calculator-india` | #51 | 0 | 332 | 0.00% | 4.32 | — | — | — | — | insufficient data | Non-zero-click target cannot be judged from missing page row. |
| `/tools/sip-calculator-india` | #51 | 0 | 187 | 0.00% | 3.33 | — | — | — | — | insufficient data | Non-zero-click target cannot be judged from missing page row. |
| `/tools/emergency-fund-calculator-india` | #51 | 1 | 507 | 0.20% | 8.90 | — | — | — | — | insufficient data | Needs the full page-level post window. |
| `/blog/zerodha-vs-upstox-vs-angel-one-demat-account` | #51 | 2 | 467 | 0.43% | 5.04 | — | — | — | — | insufficient data | Needs the full page-level post window. |
| `/tools/8th-pay-commission-salary-calculator-india` | #51 | 3 | 521 | 0.58% | 7.15 | 4 | 884 | 0.45% | 5.62 | insufficient data | CTR lower while position improved; post window is only 7 days. Also correctness/formula hold takes priority. |
| `/tools/personal-loan-emi-calculator-india` | #51 | 3 | 602 | 0.50% | 12.90 | — | — | — | — | insufficient data | PR #51 retained metadata but changed UX/content; keep row in attribution set. |
| `/tools/income-tax-calculator-old-vs-new-regime-india` | #51/#58 | 0 | 398* | 0.00% | 42.12 | — | — | — | — | insufficient data | #57 later records 442 impressions at the same ~42.1 position. Functional tax support confounds title attribution. |
| `/tools/nps-calculator-india` | #58 | 3 | 205 | 1.46% | 3.30 | — | — | — | — | insufficient data | Page-one target; wait for page-level post data before second rewrite. |
| `/tools/ppf-calculator-india` | #58 | 0 | 113 | 0.00% | 4.50 | — | — | — | — | insufficient data | Page-one target; wait for page-level post data before second rewrite. |
| `/tools/step-up-sip-calculator-india` | #58 | 0 | 134 | 0.00% | 12.40 | — | — | — | — | insufficient data | Rank was outside page one; title-only attribution is weak. |
| `/tools/cagr-calculator-india` | #58 | 0 | 165 | 0.00% | 18.50 | — | — | — | — | insufficient data | Rank was outside page one; title-only attribution is weak. |
| `/blog/how-to-calculate-in-hand-salary-from-ctc-india` | #58 | 0 | 259 | 0.00% | 13.00 | — | — | — | — | insufficient data | Needs page-level post row. |
| `/blog/income-tax-on-12-lakh-salary-new-regime-india-2026` | #58 | 0 | 179 | 0.00% | 21.00 | — | — | — | — | insufficient data | Needs page-level post row. |
| `/blog/mutual-funds-for-beginners-india` | #58 | 0 | 163 | 0.00% | 14.80 | — | — | — | — | insufficient data | Needs page-level post row. |
| `/blog/monthly-expense-planning-for-family` | #58 | 0 | 130 | 0.00% | 9.80 | — | — | — | — | insufficient data | Page-one opportunity; no post row available. |
| `/blog/epf-partial-withdrawal-rules-india` | #58 | 0 | 110 | 0.00% | 8.70 | — | — | — | — | insufficient data | Page-one opportunity; no post row available. |
| `/tools/personal-loan-eligibility-calculator-india` | #58 | 0 | 476 | 0.00% | 70.80 | 0 | 643 | 0.00% | 54.62 | insufficient data | Position improved materially but remains buried; this is not a CTR/title problem yet. |
| `/tools/net-worth-calculator-india` | #58 | 0 | 344 | 0.00% | 45.90 | — | — | — | — | insufficient data | No page row in the available 7-day evidence. |
| `/tools/gold-loan-calculator-india` | #58 | 2 | 474 | 0.42% | 30.30 | 0 | 766 | 0.00% | 29.99 | insufficient data | Position essentially unchanged; correctness/RBI-model review takes priority over click optimisation. |
| `/tools/sukanya-samriddhi-yojana-calculator-india` | #58 | 1 | 201 | 0.50% | 63.80 | 1 | 457 | 0.22% | 37.64 | insufficient data | Position improved strongly but remains buried; formula/maturity-clock review takes priority. |
| `/tools/salary-in-hand-calculator-india` | #58 | 0 | 154 | 0.00% | 30.20 | 0 | 528 | 0.00% | 13.46 | insufficient data | Position moved close to page one, but no clicks yet; correctness/reconciliation review comes first. |

\* PR #51's 4 Aug report has 398 impressions for the tax calculator; issue #57's 4 Jul–5 Aug baseline later records 442. The later page-level export should be used when regenerating the formal comparison.

## Target check from issue #72

The formal target is **≥2% CTR** on ITR-2, gratuity, broker comparison, capital gains, SIP and 8th CPC, plus non-zero clicks on capital gains and SIP.

At this checkpoint only 8th CPC has a post-change page row in the available seven-day evidence. Its CTR is **0.45% at average position 5.62**, below the 2% target, but this is not enough to trigger a second title rewrite because:

- the evidence is 7 days rather than the required 14-day readout;
- average position improved from 7.15 to 5.62, so title impact is confounded by rank movement;
- the separate 16 Aug audit identified calculator-correctness work that must be completed before trying to attract more clicks.

Capital gains and SIP do not have post-change page rows in the evidence available in this run, so the non-zero-click target cannot be truthfully evaluated.

## Second-round rewrite decision

**No second-round metadata rewrite is shipped in this PR.** This is deliberate, not an omission disguised as a success.

Issue #72 says to change one variable per loser. A loser cannot be selected responsibly without the required page-level post window. Rewriting now would create an unmeasurable third state and contaminate the 28-day readout.

When the settled 14-day page export is available, use this decision rule:

- `win`: CTR improves with broadly stable position, post impressions ≥100.
- `flat`: CTR delta is immaterial and position is broadly stable, post impressions ≥100.
- `loss`: CTR declines with stable/improved position, post impressions ≥100.
- `insufficient data`: fewer than 100 impressions, missing page row, materially incomplete window, or a concurrent correctness issue prevents a safe traffic-optimisation decision.

For a genuine `loss`, change **title only** in round two and leave description/on-page copy unchanged until the 28-day checkpoint. Do not revert to the old title; test a different specific angle.

## What appears to generalise so far

These are provisional findings, not causal claims:

1. **Visibility is expanding much faster than clicks.** The 8–14 Aug export recorded 7,798 impressions and 18 clicks (0.23% sitewide CTR), so the acquisition problem remains real.
2. **Ranking improvement alone is not enough.** Salary-in-hand moved from about position 30 to 13.46 and still recorded zero clicks in the seven-day evidence. Personal-loan eligibility moved from 70.8 to 54.62 and still had zero clicks.
3. **Do not optimise CTR ahead of correctness.** The separate product/search audit flagged 8th CPC, gold loan, salary and SSY for formula/model review. Trust and calculation accuracy outrank snippet experimentation on a finance site.
4. **Use page-level exports for attribution.** Sitewide query rows are useful for vocabulary but cannot safely be assigned to a page; the 8–14 Aug audit itself warns that the query file exposed only 4 of 18 site clicks.
5. **Keep experiments interpretable.** A second rewrite before the agreed readout window would make the later 28-day result harder, not easier, to understand.

## Exact data needed to finish the formal #72 decision gate

Export Search Console **Pages** data (Web search) for a settled post-change window that covers at least 14 days after PR #58, then retain rows for the 23 URLs above. The cleanest next checkpoint is a window ending only after GSC has settled data through **19 Aug 2026 or later**.

For each page capture clicks, impressions, CTR and average position. Then update this document's post columns and apply the verdict rules above. Only pages classified `loss` should receive a one-variable second title test.

## Search Console indexing action

None. This readout changes no public URL, canonical, sitemap, robots directive or indexability setting. Do **not** request indexing for measurement-only documentation or for a title experiment that has not been shipped.
