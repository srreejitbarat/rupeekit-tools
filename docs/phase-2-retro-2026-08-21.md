# Phase 2 retro — 21 August 2026

Issue: #74  
Decision date: 21 August 2026  
Implementation run: 22 August 2026

## Executive decision

**Do not start Phase 3 as if the measurement loop is complete.**

The current repository and connected data do not contain the settled trailing-28-day page-level Search Console report that issue #74 requires, and live GSC/GA4 access was unavailable in this run. The correct output of this retro is therefore a gate, not invented fresh KPIs.

The freshest trustworthy page-level evidence available to this run is the RupeeKit Search Growth audit based on the 8–14 August 2026 Search Console Web export. It is useful directionally, but it is only seven days. The audit itself says seven days is volatile and recommends 28-day pre/post decisions.

More importantly, issue #74 says that if GA4 key events are still zero, measurement is the top priority and outranks Phase 3. The analytics fix from issue #63 is still in open PR #97 and the manual GA4 admin steps have not been evidenced as completed. Live GA4 could not be queried here. Therefore key-event status is **unverified**, which must be treated as a blocking measurement gap rather than assumed healthy.

## What is settled from the baseline

The authoritative 4 July–5 August page-level baseline stored in `automation/reports/gsc/2026-08-12.json` is:

- 11,061 impressions
- 56 clicks
- 0.51% CTR
- impression-weighted average position 17.7
- positions 3–10: 6,412 impressions, 48 clicks, 0.75% CTR
- 74 pages with impressions and zero visitors
- GA4 key events: 0
- revenue: ₹0

The 12 August report is explicitly marked `bootstrap-partial`: its position-band subdivisions and top-page rows were not fabricated because service-account access was unavailable.

## Freshest usable evidence: 8–14 August

The supplied Search Growth audit records:

- 18 clicks
- 7,798 impressions
- 0.23% CTR

Daily average positions vary materially, so this document does not manufacture a sitewide weighted position from those daily values. Likewise, the available audit does not expose the page rows needed to reproduce the requested 3–10 position-band CTR. Sitewide query rows are privacy-filtered and cannot substitute for page-level rows.

### Five highest-impression calculator pages in that evidence set

| Page | Clicks | Impressions | CTR | Avg position | Directional read |
|---|---:|---:|---:|---:|---|
| 8th CPC salary | 4 | 884 | 0.45% | 5.62 | Strong visibility, still weak click-through; correctness/news-intent work remains important. |
| Gold loan | 0 | 766 | 0.00% | 29.99 | Demand exists, but the page is still mostly off page one. |
| Personal-loan eligibility | 0 | 643 | 0.00% | 54.62 | High rescue value; deep ranking deficit, not primarily a title problem. |
| Salary in-hand | 0 | 528 | 0.00% | 13.46 | Much closer to page one, but no clicks in this seven-day cut. |
| SSY | 1 | 457 | 0.22% | 37.64 | Ranking improved versus the older baseline but remains buried. |

The five tools represent 3,278 impressions and five clicks in the seven-day evidence. This confirms the basic programme diagnosis: visibility is expanding faster than clicks.

## Did the positions 3–10 CTR move off 0.75%?

**Not truthfully measurable from the evidence available in this run.**

The baseline 0.75% value is valid. The fresh seven-day audit supplies aggregate site totals and selected page metrics, but not the complete page-level rows needed to rebuild the 3–10 band. Query rows cannot be used for this calculation. Reporting a replacement number would violate the reporting rule established in #57 and #65.

This question remains open until a settled page-level export is available.

## Damage check after the large title changes

A complete damage check for issues #68 and #69 also requires the fresh page-level report. The evidence available here does not cover every changed URL, so this retro does not label unobserved pages as winners or losers.

Known directional findings remain consistent with the 19 August readout:

- ranking gains can occur without click gains;
- pages below page one are primarily ranking/authority problems rather than snippet-only problems;
- finance calculator correctness must outrank aggressive CTR promotion.

No title rollback is recommended from incomplete evidence.

## GA4 measurement status: blocking

Issue #63 was intended to close the GA4 event-coverage and engagement-time gap. Its PR #97 remains open and unmerged at this checkpoint. That PR also requires manual GA4 steps after deployment: verify events in DebugView, mark intended key events, register `tool_slug` / `tool_category`, and confirm the Search Console link.

The connected GA4/GSC tool returned `payment_required` in this implementation run, so live key-event counts could not be independently verified.

**Decision:** treat GA4 key-event status as **unverified / blocking**. Do not claim that the baseline of zero has been fixed merely because code exists in an unmerged PR.

This is the highest-priority unresolved item because #74 explicitly says measurement outranks Phase 3 when key events remain zero.

## Phase 3 target re-ranking

A full re-ranking of #75–#80 is **not completed** because the required fresh page-level dataset is unavailable. Updating six future issue bodies with guessed rankings would make the programme less evidence-driven, not more.

What can be said from the available evidence:

1. **Personal-loan eligibility remains a high-value rescue target.** It moved from the older 476 impressions / position 70.8 baseline to 643 impressions / position 54.62 in the seven-day audit, with zero clicks. The direction improved, but the page remains deeply buried.
2. **Salary in-hand deserves re-evaluation once fresh 28-day data exists.** Its seven-day average position of 13.46 is materially closer to page one than the older position-30 baseline, so the original Phase 3 ordering may now be stale.
3. **Gold loan and SSY still have substantial demand but remain below page one.** Their next work should continue to respect the correctness-first fixes already shipped/reviewed in the product audit sequence.
4. **Income-tax old-vs-new and net-worth cannot be fairly re-ranked from the current evidence set** because their page rows are not present in the supplied seven-day top-five audit.

Therefore issues #75–#80 are left unchanged in this PR. Their ranking order should be updated only after the replacement dataset is generated.

## Gate before issue #75 starts

Issue #75 should begin only after at least one of these conditions is met:

1. **Preferred:** merge/deploy #63 / PR #97, complete the documented GA4 admin steps, verify non-zero intended key events, and obtain a settled page-level GSC trailing-28-day report; or
2. **Explicit manual override:** accept that Phase 3 will proceed without a working conversion measurement loop, while recording that limitation in the issue/PR.

The available GSC evidence still supports the underlying personal-loan-eligibility rescue thesis, but #74's measurement dependency should not be silently skipped.

## Exact replacement data needed

Run the existing page-level reporting pipeline for a settled trailing-28-day window ending 19 August 2026 or later. The replacement must include:

- site totals: clicks, impressions, CTR and impression-weighted average position;
- position bands from page rows;
- top 25 pages by impressions;
- zero-click pages with at least 50 impressions;
- page-level comparison against the 4 Jul–5 Aug baseline and Aug-12 checkpoint;
- GA4 key-event total after #63 is deployed/configured.

Then:

- state whether the 3–10 band moved off 0.75%;
- flag any significant impression losses after #68/#69;
- re-rank #75–#80 from current demand and position;
- update those issue bodies only where the data actually changes the order.

A machine-readable record of this partial checkpoint is stored at `automation/reports/gsc/2026-08-21-partial.json`.

## Search Console indexing action

**None.**

This retro changes only internal documentation/reporting. It creates no public URL, changes no public content, and fixes no canonical, sitemap or noindex issue. Do not request indexing because this PR is deployed.

The next manual Search Console action is to export the settled page-level performance data needed above. URL Inspection / Request Indexing should be used only when a specific public page independently meets the RupeeKit indexing rule.
