# Content freshness maintenance — 5 September 2026

Issue: #89

## Decision

RupeeKit should not use blanket `dateModified` refreshes. A finance/YMYL page is refreshed only when a time-sensitive fact has actually been rechecked against a primary source. Evergreen calculators are intentionally outside the freshness register unless they depend on a changing statutory, regulatory, rate or pricing fact.

The machine-readable review register lives at `data/freshness-review-register.json`. `npm run validate:freshness` validates the register and emits a warning when a family is older than its declared review interval. A stale warning is deliberately non-fatal: being overdue should create a maintenance queue, not tempt CI to manufacture a new date without source review.

## Priority queue and available performance evidence

The Day-10 checkpoint in `automation/reports/gsc/2026-08-12.json` is still `bootstrap-partial` and does not contain a populated `topPages` set. Therefore this issue cannot truthfully compute a new decay ranking from that report. The priority queue below combines the established high-impression pages from the 4 Aug page-level audit with factual decay risk:

1. `/blog/itr-2-ay-2026-27-filing-guide` — high historical impressions and deadline/utility facts that can change during filing season.
2. `/blog/zerodha-vs-upstox-vs-angel-one-demat-account` — high historical impressions and broker pricing that can change without statutory lead time.
3. `/tools/8th-pay-commission-salary-calculator-india` and related 8th CPC pages — high historical impressions and a live commission process where a recommendation/order would invalidate scenario-status wording.
4. PPF / SSY / SCSS / Post Office MIS — quarterly rate reset risk.
5. RBI/EPFO/labour-code/government-salary update families — event-driven regulator or government changes.

Until the GSC reporting pipeline produces a fresh page-level 28-day dataset, “decay” here means factual-decay risk plus known search demand, not a fabricated claim that a page has lost impressions.

## Outstanding 4 Aug follow-ups

### 1. Zerodha / Upstox / Angel One pricing — closed on 5 Sep 2026

Reverified against current official pricing/support pages before updating the visible verification date.

- Zerodha: https://zerodha.com/charges/ and the resident-individual brokerage support page. Resident individual equity delivery remains zero brokerage; intraday/futures remain 0.03% or Rs 20 per executed order, whichever is lower; options remain Rs 20 per executed order. New resident individual accounts receive first-year AMC relief; non-BSDA AMC thereafter is Rs 300 + GST/year.
- Upstox: https://upstox.com/brokerage-charges/. Equity delivery is Rs 20 per executed order; intraday is Rs 20 or 0.1% whichever is lower; futures Rs 20 or 0.05% whichever is lower; options Rs 20 per executed order. First-year AMC is shown as zero for newly onboarded customers; non-BSDA AMC is Rs 300 + GST thereafter.
- Angel One: https://www.angelone.in/exchange-transaction-charges and the official AMC support page. The current introductory offer is followed by the published per-order schedule; the official site continues to advertise zero AMC for the first year, with non-BSDA AMC charged quarterly afterwards.

The comparison retains the instruction to verify pricing immediately before opening an account. Commercial relationships do not control ordering or factual conclusions.

### 2. ITR-2 AY 2026-27 deadline/status — explicitly re-flagged

Primary sources checked on 5 Sep 2026:

- https://www.incometax.gov.in/iec/foportal/latest-news
- https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns
- https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/file-itr-2-online

The portal confirms AY 2026-27 ITR-2 filing support and a Common Offline Utility update released on 2 Sep 2026. This review did **not** locate a primary-source CBDT circular/order establishing a different non-audit due date for AY 2026-27. Therefore the existing editorial rule remains correct: state the statutory baseline, say that CBDT can extend deadlines by order/circular, and tell readers to verify the portal. Do not invent an extension and do not refresh a public `dateModified` merely because the portal was checked.

This item remains on a 14-day filing-season review cycle or immediate review when CBDT publishes a section 119 order/circular.

### 3. 8th Central Pay Commission recommendation status — closed for current status, standing watch remains

Primary source checked on 5 Sep 2026:

- https://8cpc.gov.in/
- https://8cpc.gov.in/link-for-appointment-meeting/

The official site shows ongoing consultation/appointment activity, including Chandigarh appointments for 16–18 Sep 2026 and Bengaluru for 7–8 Oct 2026. The review found no official final fitment factor, final pay matrix or implementation order to replace RupeeKit’s scenario framing. Existing calculator factors must therefore remain labelled as illustrative scenarios rather than official recommendations.

This is “closed” only as a manual follow-up for the 5 Sep review. It remains a standing 14-day/event-triggered watch because a future Commission report or Government order would require immediate content review.

## Review cadence

| Content family | Normal cadence | Immediate trigger |
| --- | --- | --- |
| Small-savings rates | Monthly check; mandatory quarter-boundary check | DEA quarterly notification |
| 8th CPC | Every 14 days while process is active | Report, recommendation, fitment factor, pay matrix, Cabinet/Government order |
| ITR filing-season pages | Every 14 days during active filing season | CBDT circular/order, utility or due-date announcement |
| Broker comparisons | Every 30 days | Broker pricing/AMC/eligibility announcement |
| RBI rate/lending-rule pages | Every 45 days | MPC decision or RBI direction/circular |
| EPFO / labour code | Every 45 days | EPFO/Ministry circular, notified rules or commencement notification |
| Government DA/DR/pension | Every 45 days | Cabinet/DoE/DoPPW order |
| NPS | Every 60 days | PFRDA regulation/circular or tax-law change |
| Gold-rate provider pages | Every 7 days | Provider outage/methodology/timestamp failure |

## Operating procedure

1. Start with the freshness warning output and the latest page-level GSC report.
2. Prioritise pages that are both overdue **and** have meaningful impressions/clicks, then high-risk YMYL pages where an incorrect fact could materially mislead a user.
3. Open the primary source before editing the page. If the source cannot confirm a claim, keep the statutory baseline and add/retain a “verify current status” instruction.
4. Change the fact and `dateModified`/visible verification date together only after verification. A date-only commit is prohibited.
5. Preserve historical update URLs when the old event remains accurate; add a newer dated update for a genuinely new official event rather than rewriting history.
6. Re-run `npm run validate`, lint, tests and build. The freshness check may warn about other overdue families; warnings are maintenance work, not permission to mass-refresh dates.
7. After deployment, use Search Console URL Inspection only when the deployed change meets RupeeKit’s indexing rule. Routine verification-date updates do not justify repeated indexing requests.

## Risks and assumptions

- The review register groups related pages by route pattern rather than duplicating one row per calculator. The pattern is the coverage contract; new time-sensitive families must add a register entry.
- Primary-source sites can change structure or temporarily fail. A failed fetch is not evidence that a rule changed.
- Broker offers may be account-type specific; comparison language is scoped to the account type stated on the page.
- Search performance decay could not be freshly ranked because the committed Day-10 report remains partial. Once the page-level GSC pipeline is populated, factual-staleness risk should be cross-referenced with actual impression/position decline.
