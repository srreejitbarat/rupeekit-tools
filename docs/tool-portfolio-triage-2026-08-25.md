# RupeeKit tool portfolio triage — 25 August 2026

Issue: #78

## Decision

This pass classifies every live tool record without inventing fresh traffic data that the repository does not currently have.

Coverage note: the first pass of this triage covered 59 of the 64 tool records that were live on 25 August 2026. The five omitted records, plus the seven policy-lane calculators shipped on 26 August in #131, were classified when this document was merged to `main`. The registry and the tables below therefore cover all 71 tool records in the datasets: 70 live routes plus the one already-consolidated record.

The Day-10 report is explicitly `bootstrap-partial`: its fresh GSC API pull did not complete, `topPages` is empty, and it preserves only the authoritative page-level baseline from issue #57. The Day-9 indexing audit does provide current source-level evidence for sitemap, canonical, redirects and inbound-link counts. Therefore this triage uses four evidence layers, in this order:

1. authoritative page-level GSC evidence recorded in issue #57 for 4 July–5 August 2026;
2. Day-9 indexing/internal-link audit;
3. known ship dates;
4. issue #78's conservative rule for anything shipped after about 20 July.

The machine-readable registry is `automation/reports/tool-portfolio-triage-2026-08-25.json`.

## Portfolio summary

| Classification | Count | Decision |
|---|---:|---|
| Keep and invest | 27 | Existing demand or clear differentiated/core intent |
| Keep but too new to judge | 38 | Re-review after a fair post-indexing window |
| Fix discovery | 5 | Keep; prioritise stronger contextual internal links on Day 24 |
| Merge | 1 | `net-worth-tracker-calculator-india` → `net-worth-calculator-india`, already completed in #57 |
| Retire | 0 | No page meets the evidence bar for retirement in this run |
| **Total** | **71** | |

## Why there are no new retirements

Issue #78 explicitly says not to treat absence of data as evidence of absence of demand, especially for pages shipped after about 20 July. The fresh Day-10 page rows are unavailable, and 38 calculators are still inside that conservative window. Retiring one of them now would be a data-free decision.

For the older set, the pages with explicit GSC evidence either have impressions, serve a distinct core calculation, or already belong to an established topical journey. None currently satisfies all three retirement conditions at once: no demand, no meaningful differentiation, and no discovery value after a fair measurement window.

That is not a permanent keep decision. The new tools have explicit review dates below. At those checkpoints, a page can move to merge or retire if it has had time to be indexed, has no useful search demand, duplicates a stronger survivor, and carries no unique user value.

## Existing merge verified

`net-worth-tracker-calculator-india` remains the one clear merge case. Issue #57 already selected `net-worth-calculator-india` as the survivor, folded the tracker-specific value into that route, added a one-hop 301, and removed the tracker from the live sitemap source. `next.config.mjs` still contains the direct 301:

`/tools/net-worth-tracker-calculator-india` → `/tools/net-worth-calculator-india`

No additional redirect was added in this issue because the consolidation is already complete and correct.

## Day-24 discovery queue

The following pages should remain live and be prioritised for stronger contextual links rather than merged or retired:

- `gratuity-2026-old-vs-new-calculator-india` — Day-9 audit found no contextual inbound link beyond the directory.
- `personal-loan-true-apr-calculator-india` — issue #57 recorded roughly 60 impressions across APR, processing-fee and flat-rate queries.
- `loan-foreclosure-net-savings-calculator-india` — issue #57 recorded 41 foreclosure/preclosure impressions.
- `reduce-emi-vs-tenure-calculator-india` — issue #57 recorded 26 impressions.
- `home-affordability-calculator-india` — issue #57 recorded 17 impressions and specifically named it for discovery work.

`education-loan-emi-tax-benefit-calculator-india` also had zero contextual inbound links in the Day-9 audit, but it remains in **Keep but too new to judge** because it shipped after the cutoff. Day 24 should still improve its links before its 15 September review.

## Full decision table

### Core / established tools

| Slug | Classification | Reason |
|---|---|---|
| `salary-in-hand-calculator-india` | Keep and invest | 154 impressions in #57; ranking/click problem, not portfolio-fit problem |
| `emi-calculator-india` | Keep and invest | Core generic EMI intent, distinct from product-specific loan tools |
| `personal-loan-emi-calculator-india` | Keep and invest | Established personal-loan cluster parent |
| `emergency-fund-calculator-india` | Keep and invest | Priority calculator with demonstrated demand and editorial support |
| `sip-calculator-india` | Keep and invest | Established investing intent; #57 explicitly says SIP cluster members should not be merged blindly |
| `gst-calculator-india` | Keep and invest | Distinct compliance calculation and valid crawl/index plumbing |
| `fd-calculator-india` | Keep and invest | Established savings intent with supporting content |
| `income-tax-calculator-old-vs-new-regime-india` | Keep and invest | 442 impressions in #57; buried-page rescue target |
| `hra-exemption-calculator-india` | Keep and invest | Established salary/tax intent and protected CTR measurement page |
| `80c-deduction-calculator-india` | Keep and invest | Distinct tax-saving planning role |
| `gratuity-calculator-india` | Keep and invest | Distinct statutory benefit calculation |
| `recurring-deposit-calculator-india` | Keep and invest | Distinct savings-product calculation |
| `home-loan-emi-calculator-india` | Keep and invest | Core housing loan parent for adjacent decision tools |
| `personal-loan-eligibility-calculator-india` | Keep and invest | 476 impressions across 91 query variants in #57 |
| `gold-loan-calculator-india` | Keep and invest | 474 impressions and 2 clicks in #57 |
| `capital-gains-tax-calculator-india` | Keep and invest | Distinct scoped tax calculator with page-one opportunity |
| `ppf-calculator-india` | Keep and invest | 113 impressions around position 4.5 in #57 |
| `lumpsum-calculator-india` | Keep and invest | Distinct one-time-investment intent within the SIP cluster |
| `epf-corpus-calculator-india` | Keep and invest | Distinct retirement corpus intent and supporting EPF content |
| `8th-pay-commission-salary-calculator-india` | Keep and invest | High-impression priority government-pay page |
| `cagr-calculator-india` | Keep and invest | 165 impressions in #57 and distinct return-measurement intent |
| `nps-calculator-india` | Keep and invest | 205 impressions around position 3.3 in #57 |
| `step-up-sip-calculator-india` | Keep and invest | 134 impressions in #57 and distinct annual-step-up intent |
| `sukanya-samriddhi-yojana-calculator-india` | Keep and invest | 201 impressions and 1 click in #57; retain and strengthen small-savings links |
| `net-worth-calculator-india` | Keep and invest | Canonical survivor with 344 impressions in #57 |

### Growth tools

| Slug | Classification | Reason |
|---|---|---|
| `home-loan-swp-stress-test-india` | Keep and invest | Differentiated decision simulator with no duplicate core tool |
| `gratuity-2026-old-vs-new-calculator-india` | Fix discovery | Day-9 audit showed zero contextual inbound links |
| `personal-loan-true-apr-calculator-india` | Fix discovery | ~60 impressions in #57; clear APR/fee demand |
| `invest-vs-prepay-home-loan-calculator-india` | Keep and invest | Distinct invest-vs-prepay decision intent |
| `loan-foreclosure-net-savings-calculator-india` | Fix discovery | 41 foreclosure/preclosure impressions in #57 |
| `reduce-emi-vs-tenure-calculator-india` | Fix discovery | 26 impressions in #57 |

### Decision-tool batch

Review date for recent tools: **15 September 2026** unless a stronger demand/discovery signal already exists.

| Slug | Classification | Reason / review |
|---|---|---|
| `rent-vs-buy-calculator-india` | Keep but too new to judge | Review 15 Sep; differentiated housing decision intent |
| `home-affordability-calculator-india` | Fix discovery | #57 already recorded 17 impressions and named it for discovery work |
| `job-offer-comparison-calculator-india` | Keep but too new to judge | Review 15 Sep |
| `salary-increment-calculator-india` | Keep but too new to judge | Review 15 Sep |
| `bonus-tax-calculator-india` | Keep but too new to judge | Review 15 Sep |
| `fire-retirement-calculator-india` | Keep but too new to judge | Review 15 Sep |
| `net-worth-tracker-calculator-india` | Merge | Already merged to `net-worth-calculator-india` in #57 with one-hop 301 |
| `education-loan-emi-tax-benefit-calculator-india` | Keep but too new to judge | Review 15 Sep; fix contextual discovery first |
| `rental-yield-calculator-india` | Keep but too new to judge | Review 15 Sep |
| `debt-snowball-calculator-india` | Keep but too new to judge | Review 15 Sep |

### Insurance & protection batch

Review date: **21 September 2026**.

| Slug | Classification | Reason |
|---|---|---|
| `term-life-insurance-cover-calculator-india` | Keep but too new to judge | Distinct cover-gap intent; early-August ship |
| `health-insurance-coverage-adequacy-calculator-india` | Keep but too new to judge | Distinct adequacy-gap intent; early-August ship |
| `car-loan-emi-affordability-calculator-india` | Keep but too new to judge | Vehicle affordability intent distinct from generic EMI |
| `two-wheeler-loan-emi-calculator-india` | Keep but too new to judge | Distinct shorter-tenure vehicle-loan intent |
| `credit-card-minimum-due-trap-calculator-india` | Keep but too new to judge | Unique minimum-due payoff modelling |
| `credit-card-vs-personal-loan-calculator-india` | Keep but too new to judge | Distinct revolving-credit vs loan comparison |

### Investing & markets batch

Review date: **21 September 2026**.

| Slug | Classification | Reason |
|---|---|---|
| `sovereign-gold-bond-vs-physical-gold-calculator-india` | Keep but too new to judge | Distinct instrument-comparison intent |
| `index-fund-vs-active-fund-cost-calculator-india` | Keep but too new to judge | Distinct fee-drag comparison |
| `elss-lock-in-vs-80c-options-calculator-india` | Keep but too new to judge | Distinct lock-in/options comparison |
| `nps-tier-2-vs-mutual-fund-calculator-india` | Keep but too new to judge | Distinct Tier-2 product comparison |
| `xirr-portfolio-return-calculator-india` | Keep but too new to judge | Distinct portfolio-return approximation |
| `rule-of-72-calculator-india` | Keep but too new to judge | Distinct educational doubling-time utility |

### Government schemes & life-stage batch

Review date: **28 September 2026**.

| Slug | Classification | Reason |
|---|---|---|
| `ops-vs-nps-pension-comparison-calculator-india` | Keep but too new to judge | Distinct pension-system comparison; shipped 8 Aug |
| `scss-calculator-india` | Keep but too new to judge | Distinct small-savings product; shipped 8 Aug |
| `post-office-monthly-income-scheme-calculator-india` | Keep but too new to judge | Distinct monthly-income product; shipped 8 Aug |
| `child-education-cost-planner-india` | Keep but too new to judge | Distinct goal-planning intent; shipped 8 Aug |
| `wedding-cost-planner-india` | Keep but too new to judge | Distinct goal-planning intent; shipped 8 Aug |
| `rent-agreement-stamp-duty-registration-cost-calculator-india` | Keep but too new to judge | Distinct user-entered state-cost estimate; shipped 8 Aug |

### Records added during the merge to `main`

The first five were live on 25 August 2026 but were missing from the original table. The remaining seven shipped on 26 August 2026 in the policy lane (#131), after this snapshot was written, and are classified on ship date alone.

| Slug | Classification | Reason / review |
|---|---|---|
| `mutual-fund-calculator-india` | Keep but too new to judge | Shipped 11 Aug; distinct generic mutual-fund projection intent. Review 21 Sep |
| `retirement-calculator-india` | Keep but too new to judge | Shipped 11 Aug; generic retirement-corpus intent. Re-check overlap with the NPS/EPF calculators at review. Review 21 Sep |
| `stock-portfolio-calculator-india` | Keep but too new to judge | Shipped 11 Aug; distinct equity-portfolio valuation intent. Review 21 Sep |
| `8th-pay-commission-arrears-calculator-india` | Keep but too new to judge | Shipped 17 Aug; distinct arrears computation. Review 28 Sep |
| `8th-pay-commission-pension-calculator-india` | Keep but too new to judge | Shipped 17 Aug; distinct pension-revision intent. Review 28 Sep |
| `new-labour-code-take-home-calculator-india` | Keep but too new to judge | Shipped 26 Aug in #131. Review 7 Oct |
| `gratuity-under-new-wage-code-calculator-india` | Keep but too new to judge | Shipped 26 Aug in #131. Review 7 Oct |
| `room-rent-proportionate-deduction-calculator-india` | Keep but too new to judge | Shipped 26 Aug in #131. Review 7 Oct |
| `notional-increment-pension-calculator-india` | Keep but too new to judge | Shipped 26 Aug in #131. Review 7 Oct |
| `pension-commutation-calculator-india` | Keep but too new to judge | Shipped 26 Aug in #131. Review 7 Oct |
| `epf-taxable-interest-rule-9d-calculator-india` | Keep but too new to judge | Shipped 26 Aug in #131. Review 7 Oct |
| `inherited-property-capital-gains-calculator-india` | Keep but too new to judge | Shipped 26 Aug in #131. Review 7 Oct |

## Merge / redirect execution status

No new merge or retirement is justified by the available evidence, so this issue does not add new redirects or remove additional sitemap URLs.

The one classified merge is already complete:

- source: `/tools/net-worth-tracker-calculator-india`
- destination: `/tools/net-worth-calculator-india`
- redirect: permanent 301
- hops: one
- live sitemap: source excluded

This satisfies the merge rule without creating duplicate or chained redirects.

## Risks and assumptions

- Fresh Day-10 page rows are unavailable, so this document deliberately avoids pretending that every zero-traffic count is current as of 25 August.
- A recent calculator can only graduate from `keep-too-new` after its review date and after indexation/internal-link status is checked. Zero clicks before that date are not enough to retire it.
- `fix-discovery` does not imply the calculator is weak. It means demand/differentiation is strong enough to keep it while the link graph is the next obvious lever.
- No formula, tax rate, interest rate, eligibility rule or other financial assumption is changed by this triage.
- The twelve records added during the merge to `main` were classified from ship date and intent only. None of them has page-level GSC evidence, so none can be retired before its review date.

## Next action

Day 24 should consume the `day24DiscoveryQueue` from the JSON registry and build cluster-level/contextual links. The next portfolio retirement decision should wait until the explicit review dates and use a fresh page-level GSC report, not query-level aggregates.
