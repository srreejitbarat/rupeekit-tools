# RupeeKit 30-day programme report — 7 September 2026

Issue: #91

## Executive verdict

The programme cannot be given a statistically honest final performance verdict from the evidence currently available in the repository. The authoritative 4 Jul–5 Aug page-level baseline is intact, but the required fresh trailing-28-day page-level Search Console dataset and the later Day 26 / Day 33 checkpoints are not available. The connected GSC Wizard endpoint also returned `payment_required` on 7 September 2026, so this report deliberately records unknown values as unavailable rather than reconstructing them from query-level rows or partial exports.

What can be said with evidence is narrower: the programme shipped substantial measurement, CTR, content-depth, internal-linking, analytics, trust, freshness and engagement infrastructure; however, the available evidence is insufficient to attribute a final traffic or conversion lift to any one phase.

## Authoritative baseline

The canonical baseline remains the page-level 4 Jul–5 Aug 2026 dataset preserved by the Day 10 reporting work:

| Metric | Baseline |
| --- | ---: |
| Impressions | 11,061 |
| Clicks | 56 |
| CTR | 0.51% |
| Impression-weighted avg. position | 17.7 |
| Position 3–10 impressions | 6,412 |
| Position 3–10 clicks | 48 |
| Position 3–10 CTR | 0.75% |
| Pages with impressions and zero visitors | 74 |
| GA4 key events | 0 |
| Revenue | ₹0 |

The Day 10 file explicitly marks itself `bootstrap-partial`; it preserves the authoritative historical baseline but says a fresh API pull was not completed.

## Checkpoint trajectory

### Aug 12 — Day 10

No new authoritative trailing-28-day pull was available. The repository preserved the 4 Jul–5 Aug baseline as the reference dataset.

### Aug 21 — Day 19 partial evidence

The only later usable GSC evidence committed to the repository covers 8–14 Aug 2026 and is explicitly marked `partial-evidence-not-full-retro`:

- 7,798 impressions
- 18 clicks
- 0.23% CTR
- sitewide impression-weighted position unavailable
- position-band table unavailable

This seven-day window is not comparable to the 33-day baseline as a programme endpoint and therefore must not be used to claim improvement or decline.

Selected pages in that partial window were:

| Page | Clicks | Impressions | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| 8th Pay Commission calculator | 4 | 884 | 0.45% | 5.62 |
| Gold loan calculator | 0 | 766 | 0% | 29.99 |
| Personal-loan eligibility | 0 | 643 | 0% | 54.62 |
| Salary in-hand | 0 | 528 | 0% | 13.46 |
| Sukanya Samriddhi calculator | 1 | 457 | 0.22% | 37.64 |

### Day 26 and Day 33

No completed page-level checkpoint report is committed on `main` for either stage. Issues #81 and #88 remain open, so this report does not fabricate those missing checkpoints.

## Central thesis: position 3–10 CTR

The programme thesis was that the 6,412 impressions already ranking at positions 3–10 should convert materially above the 0.75% baseline and could eventually create hundreds of extra monthly clicks.

**Final verdict: unmeasured, not disproven.**

The baseline contains 48 clicks from the 3–10 band. The repository does not contain a later authoritative page-level position-band table, and the connected GSC source could not be queried today. Therefore there is no defensible final absolute-click figure for this band.

Any claim that the 0.75% figure improved would be unsupported; any claim that it failed would also be unsupported.

## Targets from the programme

### Page-one opportunity set ≥2% CTR

Status: **not measurable from current evidence**.

The Aug 4 opportunity set included high-ranking pages such as ITR-2, 8th CPC, emergency fund, broker comparison, labour-code gratuity, capital gains and SIP. The repository lacks a current page-level export covering the final programme window.

### Capital-gains calculator: non-zero clicks

Baseline: 0 clicks, 332 impressions, average position 4.32.

Final status: **unknown**. No current page-level record is available.

### SIP calculator: non-zero clicks

Baseline: 0 clicks, 187 impressions, average position 3.33.

Final status: **unknown**. No current page-level record is available.

### Phase 3 rescue pages

The available Aug 8–14 partial evidence provides only an early directional snapshot for three of the five named rescue pages:

- personal-loan eligibility: position 54.62 vs historical 70.8 — directionally better, but not attributable and far too early for a final conclusion;
- salary in-hand: position 13.46 vs historical 30.2 — directionally better, but not attributable and based on a short window;
- Sukanya Samriddhi: position 37.64 vs historical 63.8 — directionally better, but not attributable and based on a short window.

Current final-window data for gold-loan and income-tax old-vs-new is unavailable here. Deep content work from Days 20–26 should in any case be treated as provisional at a two-to-four-week age.

### GA4 key events and revenue

Baseline: 0 key events and ₹0 revenue.

Final status: **unverified**. The analytics instrumentation was materially improved during the programme, but no connected GA4 final-window dataset is available in this runtime. Instrumentation completion is not equivalent to a measured conversion gain.

### Zero-visitor pages

Baseline: 74 pages with impressions and zero visitors.

Final status: **unknown** without the authoritative final page-level export.

## Phase attribution

### Phase 1 — measurement

Outcome: **durable infrastructure improvement; performance effect unattributable.**

The programme created a stable page-level reporting format, analytics event conventions and validation checks. This is a product-quality gain because future decisions can be measured consistently once credentials/data access are available. It cannot itself be credited with search-growth movement.

### Phase 2 — CTR rewriting and answer-first work

Outcome: **hypothesis still plausible; final effect unmeasured.**

Titles, descriptions, direct answers and SERP-intent alignment were improved on pages already earning impressions. Because the final page-level data is missing and edits overlapped with later work, no isolated CTR lift can be attributed to this phase.

### Phase 3 — buried-page depth and structural consolidation

Outcome: **early directional movement on some pages; provisional and unattributable.**

The Aug 8–14 evidence shows materially better average positions for personal-loan eligibility, salary-in-hand and Sukanya Samriddhi versus their historical baselines, but the sample predates or overlaps later changes and is too early to treat as proof.

### Phase 4 — engagement and conversion

Outcome: **instrumentation/product journey improved; business effect unmeasured.**

The programme added route-aware page views, engagement timing, calculator completion/result visibility, contextual next steps, shareable-result controls and privacy-safe analytics. These changes improve measurement and UX quality, but there is no settled GA4 readout here to prove higher engaged sessions, CTA conversion or revenue.

### Phase 5 — freshness, trust and accessibility

Outcome: **quality/governance improvement; ranking effect unmeasured.**

The programme added a freshness review register, stronger source verification, clearer trust/editorial signals and accessibility validation. These reduce YMYL quality risk but should not be described as a direct ranking gain without data.

## What did not work, or remains unproven

1. **The measurement loop never became reliably self-sufficient.** Diagnosis: execution/infrastructure dependency. The Day 10 reporter exists, but production credentials/connected data remained unavailable in several later runs.
2. **The programme cannot prove its headline CTR thesis yet.** Diagnosis: insufficient final measurement, not necessarily a wrong hypothesis.
3. **Phase-level causal attribution is weak.** Diagnosis: overlapping changes and no controlled experiments. Several pages were touched repeatedly, so movement is often unattributable.
4. **Engagement work may have been premature.** Diagnosis: insufficient traffic and missing settled GA4 data. Instrumentation improved, but there is not enough evidence here to say user behaviour materially changed.
5. **Deep rescue-page results are still maturing.** Diagnosis: insufficient time. Two to four weeks is an early reading for substantial content/structural work.

## Confounds and interpretation limits

- This programme was not a controlled experiment.
- Search-demand seasonality and Google ranking volatility were not isolated.
- Multiple phases touched the same URLs.
- Some baseline/checkpoint windows differ in length and cannot be compared as simple percentage changes.
- Query-level data is intentionally not used to backfill sitewide totals because anonymised-query filtering makes it incomplete.
- Missing values are reported as missing instead of being inferred from partial datasets.

## Decision for the next planning day

The next 30-day plan should **not** assume the CTR thesis succeeded or failed until a fresh authoritative page-level GSC export is available. The first action for Day 37 should be to restore the reporting loop, obtain the final settled 28-day page dataset, and then choose between:

- wider CTR harvesting if page-one CTR materially improved, or
- authority/depth/ranking work if CTR remains secondary to insufficient top-10 coverage.

No new calculator should be justified from this report alone.

## Exact data needed to complete the final verdict

1. GSC page-level Search Analytics export for the latest settled trailing 28 days ending no earlier than 4 September 2026.
2. Position-band recomputation from those page rows.
3. Current page rows for capital-gains, SIP and all five Phase 3 rescue pages.
4. Count of pages with impressions and zero clicks/visitors using the same definition as the baseline.
5. GA4 final-window key events, engaged sessions, calculator completion metrics and total revenue.

Once those inputs exist, this report can be updated without changing the methodology or historical baseline.
