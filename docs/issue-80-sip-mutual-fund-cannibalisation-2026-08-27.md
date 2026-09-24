# Issue #80 — SIP / mutual-fund cannibalisation audit

Date: 27 August 2026  
Issue: #80

## Decision

**Do not merge the SIP / mutual-fund pages.** The cluster contains genuinely different intents: fixed monthly SIP projection, annual step-up contribution, one-time lumpsum projection, portfolio-return measurement, fund-cost comparison, NPS Tier 2 versus mutual fund, ELSS/80C comparison, beginner education, and robo-adviser versus DIY service-model comparison.

The implementation therefore differentiates each intent, gives each declared page a distinct target keyword, and adds descriptive cross-links that explain why a user would move to the other page.

## Data availability

Issue #80 asks for current impressions, positions and ranking queries from the Day-10 report. A fresh GSC Wizard request was attempted on 27 August 2026 with a page regex covering SIP, lumpsum, mutual-fund, index-fund, XIRR, ELSS and NPS Tier 2 URLs. The connector returned `payment_required`, so no fresh page/query rows were available in this run.

The Day-17 readout in `docs/ctr-readout-2026-08-19.md` also states that the required settled post-change row for `sip-calculator-india` was unavailable. It therefore classified SIP as **insufficient data**, not as a win or loss, and explicitly said not to re-touch the PR #51 title inside the measurement window.

Accordingly, this issue does **not** invent current GSC numbers or ranking queries. The table below separates established baseline evidence from unavailable current data.

## Cluster map

| Page | Primary intent / target keyword | Established page-level evidence | Current 28-day page row | Ranking-query evidence in this run | Decision |
|---|---|---|---|---|---|
| `/tools/sip-calculator-india` | `sip calculator india` | 187 impr, pos 3.33, 0 clicks in the #57 baseline | unavailable | unavailable from connected GSC | Keep; fixed monthly SIP only; PR #51 title untouched |
| `/tools/step-up-sip-calculator-india` | `step up sip calculator india` | 134 impr, pos 12.40, 0 clicks in #57/#72 baseline | unavailable | unavailable | Keep; annual contribution increase intent |
| `/tools/lumpsum-calculator-india` | `lumpsum investment calculator india` | part of the original SIP/mutual-fund cluster; no trustworthy per-page row available in the current repo evidence | unavailable | unavailable | Keep; one-time investment intent |
| `/blog/mutual-funds-for-beginners-india` | `mutual funds for beginners india` | 163 impr, pos 14.80, 0 clicks in #57/#72 baseline | unavailable | unavailable | Keep; educational beginner intent |
| `/tools/index-fund-vs-active-fund-cost-calculator-india` | `index fund vs active fund cost calculator india` | shipped 5 Aug; no settled current row available here | unavailable | unavailable | Keep; expense-ratio drag only |
| `/tools/nps-tier-2-vs-mutual-fund-calculator-india` | `nps tier 2 vs mutual fund calculator india` | shipped 5 Aug; no settled current row available here | unavailable | unavailable | Keep; product-route comparison |
| `/tools/xirr-portfolio-return-calculator-india` | `portfolio xirr calculator india` | shipped 5 Aug; no settled current row available here | unavailable | unavailable | Keep; annualised return measurement for irregular cash flows |
| `/tools/elss-lock-in-vs-80c-options-calculator-india` | `elss lock in vs 80c options calculator india` | shipped 5 Aug; no settled current row available here | unavailable | unavailable | Keep; ELSS/80C lock-in comparison |
| `/blog/robo-advisors-vs-diy-index-investing-india` | `robo advisor vs diy index investing india` | shipped 9 Aug; no settled current row available here | unavailable | unavailable | Keep; service cost/control/rebalancing trade-off |

The historic five-page cluster total recorded in #57 was **535 impressions and 0 clicks**. Because the original issue did not provide a trustworthy per-page split for every one of those five pages, this audit preserves only rows explicitly recorded elsewhere rather than reverse-engineering missing values from the total.

## Intent boundaries now enforced

### Regular SIP

The SIP page is for a **fixed monthly contribution**. It links to Step-Up SIP with the anchor “Increase the SIP every year instead” and to Lumpsum with “Compare a one-time lumpsum instead”. Its existing PR #51 SERP title/description are not changed.

### Step-Up SIP

The Step-Up SIP page is for a contribution that **increases over time**. Its answer block explicitly tells users to return to the regular SIP page when the monthly amount stays constant.

### Lumpsum

The Lumpsum page is for **one starting investment**. It points to XIRR when there are multiple timed cash flows and to SIP when the user contributes monthly.

### Index vs active fund cost

This page isolates **expense-ratio drag under the same gross-return assumption**. It explicitly avoids presenting a fee comparison as a prediction that one fund style will outperform.

### NPS Tier 2 vs mutual fund

This page is a **two-product route comparison** with user-entered return and tax assumptions. It does not compete with the generic SIP page for a plain monthly-corpus projection.

### XIRR / portfolio return

This page answers a **return-measurement** question rather than a future-corpus question. It also retains the existing warning that the RupeeKit expression-engine implementation is a transparent approximation rather than a date-accurate iterative Excel XIRR solve.

### ELSS / 80C

This page owns the **tax-saving option and lock-in comparison** intent. It does not claim ELSS is lower risk because of a shorter lock-in and does not promise market returns.

### Beginner mutual-fund guide

The beginner article explains concepts and then routes the reader to the correct calculator based on whether the next question is regular SIP, step-up SIP, lumpsum, fund-cost drag or irregular-cash-flow return.

### Robo-adviser vs DIY index investing

This article owns the **service model, cost, control and rebalancing** comparison. It does not act as another generic SIP-return article.

## Duplicate target-keyword guard

`scripts/validate-target-keywords.mjs` is wired into `npm run validate`. It normalises target keywords, applies the Issue #80 effective tool overrides and fails if two live tools or an explicitly targeted cluster blog use the same declared target keyword.

The validator also requires explicit target keywords for all seven calculator pages and both investing blogs touched by #80.

## Merge review

No pair in this cluster meets the Day-23 merge threshold. The pages differ in cash-flow shape, product route, cost question, tax/lock-in question, return-measurement method or educational intent. Therefore:

- no 301 redirect is added;
- no URL is removed from the sitemap;
- no existing calculator is retired;
- no new calculator or thin supporting page is created.

## Safety boundaries

- No calculator formula, input or output is changed.
- No market return is described as guaranteed.
- No personalised investment recommendation is added.
- NPS/ELSS tax language remains scenario-based and tells users to verify current rules.
- The SIP metadata changed by PR #51 is not re-written because the Day-17 readout did not establish a valid loss verdict.

## Next measurement checkpoint

Once page-level GSC access is available, export a settled 28-day **Pages** report and then inspect page-specific queries for vocabulary only. For each cluster page record impressions, clicks, CTR and position first; use query rows to understand intent shape, not to reconstruct sitewide totals.

A future merge should be considered only if fresh page/query evidence shows two URLs consistently ranking for the same head intent and their on-page purposes cannot be kept meaningfully distinct.
