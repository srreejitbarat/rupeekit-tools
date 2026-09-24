# RupeeKit next 30-day plan — 8 September 2026

Issue: #92

## Decision from Day 36

The Day-36 report does **not** prove that the first programme's position-3–10 CTR thesis succeeded or failed. The authoritative baseline remains 11,061 impressions, 56 clicks, 0.51% CTR, impression-weighted position 17.7, 6,412 impressions in positions 3–10 producing 48 clicks (0.75% CTR), 74 pages with impressions and zero visitors, GA4 key events 0 and revenue ₹0. The later repository evidence is partial and the final settled trailing-28-day page-level GSC and GA4 datasets were unavailable.

The strategic direction for Days 38–67 is therefore **measurement recovery first, then depth/authority on existing proven-demand pages, with CTR work only where fresh data proves a page is already in positions 3–10 and under-clicked**. This is intentionally narrower than another content-production sprint. It avoids treating an unmeasured hypothesis as a win and avoids expanding the YMYL maintenance burden before the existing portfolio demonstrates demand.

The first two days are hard gates. Day 38 restores the GSC + GA4 loop. Day 39 completes the missing Day-36 verdict and classifies the primary constraint. If fresh data shows strong top-10 coverage with weak CTR, the measured CTR days can be expanded. If top-10 coverage remains the larger constraint, the ranking/depth and internal-authority days remain dominant. Weekly retros can re-point the remaining work.

## Policy on new calculators

**Default: do not add a new calculator during Days 38–65.** The first programme began with a large zero-traffic inventory, added more tools, and still finished without a reliable final traffic/conversion readout. New indexable YMYL inventory increases sourcing, freshness, accessibility and maintenance obligations, so breadth must clear a higher evidence bar than an ordinary feature idea.

Day 66 formalizes the long-term evidence bar, but until then a proposed calculator is rejected unless all of the following are already demonstrated:

1. measurable search demand from fresh GSC/Trends/keyword evidence, not a brainstormed term;
2. a distinct user task that does not cannibalise an existing calculator or guide;
3. a source-verifiable calculation or decision framework with maintainable assumptions;
4. a credible internal-link/discovery path from existing traffic-bearing pages;
5. a named success metric and baseline that can be measured after launch;
6. maintenance cost compatible with the Day-34 freshness cadence.

No calculator in this programme is scheduled merely to increase page count.

## Carry-forward from Days 8–36

Unfinished work is not silently dropped:

- **Measurement and GA4 admin/readout (#63/#74/#81/#88/#91):** carried into #146 and #147. Historical retros remain historical gaps; the new programme restores the live data loop instead of reconstructing missing numbers.
- **CWV/mobile verification (#67/#86):** carried into #163, targeted using actual mobile traffic × abandonment rather than a blanket redesign. Existing CWV validation remains intact.
- **Buried-page rescue work (#75/#76 and related Phase-3 pages):** carried into the fresh opportunity ranking in #148 and subsequent ranking/depth days #149, #150, #153, #154, #160 and #167. No stale ordering is assumed.
- **Contextual next-step measurement (#83):** carried into #164, which requires actual result-view and CTA counts before changing the journey.
- **Share/permalink index-bloat risk (#84/#88):** carried into #165, including parameter noindex, sitemap and scenario-page checks.
- **Owned channel / monetisation readiness (#85/#87):** no expansion is scheduled until traffic and key-event data are trustworthy. Monetisation remains governed by the existing policy/threshold work; the next plan does not invent revenue expectations.
- **Freshness (#89):** carried into #157 and #169, using the standing review register and real traffic priority.
- **Trust/accessibility (#90):** carried forward as constraints on every YMYL change and focused source-visibility work in #162. Existing accessibility validation remains intact.
- **Indexing/canonical/sitemap hygiene (#81 and later share work):** carried into #158 and #165.
- **Final 30-day report (#91):** its provisional conclusions are the basis for this plan; #147 completes the missing verdict when fresh data becomes available.

Open implementation PRs from the first programme should be manually reviewed/merged independently; this plan does not duplicate or auto-merge them.

## Days 38–67

| Day | Date | Issue | Metric / decision target |
| --- | --- | --- | --- |
| 38 | Sep 9 | #146 Restore GSC + GA4 measurement loop | Fresh page-level GSC + GA4 readout available |
| 39 | Sep 10 | #147 Finalize missing Day-36 verdict | Site CTR, top-10 CTR/clicks, key events, revenue, zero-click count |
| 40 | Sep 11 | #148 Re-rank existing-page opportunity queue | Top-20 proven-demand queue with CTR vs ranking diagnosis |
| 41 | Sep 12 | #149 Ranking/depth opportunity #1 | Position/impressions on highest-value depth target |
| 42 | Sep 13 | #150 Ranking/depth opportunity #2 | Position/impressions on second depth target |
| 43 | Sep 14 | #151 CTR opportunity #1 | CTR/clicks for highest-value page already at positions 3–10 |
| 44 | Sep 15 | #152 Week-1 retro | Confirm measurement and primary constraint |
| 45 | Sep 16 | #153 Ranking/depth opportunity #3 | Position/impressions |
| 46 | Sep 17 | #154 Ranking/depth opportunity #4 | Position/impressions |
| 47 | Sep 18 | #155 CTR opportunity #2 | CTR/clicks |
| 48 | Sep 19 | #156 Internal authority cluster #1 | Contextual inbound links + target-page position |
| 49 | Sep 20 | #157 Highest-risk stale YMYL page | Freshness/source accuracy + page metrics |
| 50 | Sep 21 | #158 High-value indexability audit | Canonical/sitemap/noindex/redirect defects |
| 51 | Sep 22 | #159 Week-2 retro | Ranking, CTR and indexability readout |
| 52 | Sep 23 | #160 Ranking/depth opportunity #5 | Position/impressions |
| 53 | Sep 24 | #161 CTR opportunity #3 | CTR/clicks |
| 54 | Sep 25 | #162 Trust/source visibility | Source proximity and YMYL trust on top cluster |
| 55 | Sep 26 | #163 Mobile completion | Mobile completion/abandonment on highest-opportunity calculator |
| 56 | Sep 27 | #164 Contextual next-step conversion | Result views and contextual CTA clicks |
| 57 | Sep 28 | #165 Share/scenario index safety | Parameter URL index count / scenario indexability |
| 58 | Sep 29 | #166 Week-3 retro | Traffic, engagement and index-safety readout |
| 59 | Sep 30 | #167 Ranking/depth opportunity #6 | Position/impressions |
| 60 | Oct 1 | #168 CTR opportunity #4 | CTR/clicks |
| 61 | Oct 2 | #169 Second stale YMYL re-verification | Freshness/source accuracy + page metrics |
| 62 | Oct 3 | #170 Internal authority cluster #2 | Contextual inbound links + target-page position |
| 63 | Oct 4 | #171 Structured-data accuracy audit | Valid/visible-content-matched schema, zero fake ratings/reviews |
| 64 | Oct 5 | #172 Zero-click high-impression recheck | Zero-click page count vs baseline 74; top-cohort diagnosis |
| 65 | Oct 6 | #173 Week-4 retro | Final intervention readout: winners/nulls/regressions |
| 66 | Oct 7 | #174 New-calculator evidence bar | Explicit policy using fresh demand + maintenance evidence |
| 67 | Oct 8 | #175 Final measured report | Full GSC/GA4 comparison and next strategic decision |

## Weekly retro rules

Days 44, 51, 58 and 65 are decision days, not feature days. Each retro must re-run the same GSC/GA4 measurement loop, show absolute counts beside percentages, report regressions/nulls as prominently as wins, and re-point the remaining open issues when the data changes the priority. Short-window movement is directional evidence, not causal proof.

## Indexing rule for the programme

Manual Search Console **Request Indexing** is reserved for:

- a new important indexable page that passed the evidence bar;
- a major deployed update where recrawl is materially valuable;
- a canonical/sitemap/noindex/indexability repair; or
- a valuable page that remains discovered-not-indexed after several days.

Routine title edits, internal links, analytics changes, freshness checks and documentation do not qualify by themselves. Parameter share URLs must remain non-indexable.

## Success criteria for the second programme

The programme succeeds operationally if measurement is self-sufficient and every intervention can be tied to a before metric. Growth success is reported only from the final settled data. The report must include, at minimum: total impressions/clicks/CTR/weighted position, position-band absolute clicks/CTR, current zero-click page count versus 74, key events and revenue versus zero, calculator completion/abandonment, contextual CTA clicks, and results for every page modified in the cycle.

No ranking, traffic, revenue or rich-result guarantee is assumed.
