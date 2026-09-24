# Above-the-fold direct-answer audit — 17 August 2026

## Scope

Issue #70 targets pages in the Search Console position 3–10 opportunity band. The authoritative 4 Jul–5 Aug 2026 page-level baseline in issue #57 recorded 6,412 impressions and 48 clicks in positions 3–10 (0.75% CTR).

The Day 10 report (`automation/reports/gsc/2026-08-12.json`) is intentionally a partial bootstrap: a fresh page-level API pull was unavailable, its `topPages` list is empty, and unknown subdivisions are recorded as null. The GSC Wizard connection was also unavailable during this implementation. Therefore this audit does not invent a fresh ranking list. It uses only page-level opportunities already recorded in issue #57 and `docs/gsc-ctr-improvement-2026-08-04.md`.

## Pages covered

### Calculators

- `/tools/nps-calculator-india`
- `/tools/ppf-calculator-india`
- `/tools/sip-calculator-india`
- `/tools/capital-gains-tax-calculator-india`
- `/tools/emergency-fund-calculator-india`

Each gets concise direct-answer copy in the server-rendered hero paragraph immediately after the H1 and before calculator inputs. Existing dedicated scope blocks remain in place where present. No calculator formula, input or output changes in this issue.

`/tools/8th-pay-commission-salary-calculator-india` is excluded from this set: the merged search-growth audit (PR #110) already ships a tested, server-rendered hero description for that exact page, which takes precedence over the generic `shortDescription` fallback and already satisfies the above-the-fold requirement.

### Blogs

- `/blog/itr-2-ay-2026-27-filing-guide`
- `/blog/zerodha-vs-upstox-vs-angel-one-demat-account`
- `/blog/new-labour-code-gratuity-rules-india-2026`
- `/blog/monthly-expense-planning-for-family`
- `/blog/epf-partial-withdrawal-rules-india`

`BlogArticleLayout` is now a server component. A Quick Answer, or the existing Answer Engine Summary when no Quick Answer is configured, is rendered directly after the hero and before the article body. The old duplicate Quick Answer position below the intro was removed.

## Scope and safety

- Existing tax, capital-gains, PPF and government-pay rules were not changed.
- No new rates, regulatory thresholds or lender criteria were introduced.
- SIP and investment outputs retain market-linked/not-guaranteed language.
- 8th Pay Commission outputs remain explicitly scenario-based rather than official or guaranteed.
- Capital-gains direct-answer copy retains the existing limited scope: listed equity/equity-oriented mutual funds, not property, debt funds, gold, crypto or unlisted shares.
- All generic calculator answers remain educational estimates rather than personalised advice.

## Rendered-output guard

`scripts/validate-direct-answer-rendered-output.mjs` runs after `next build`. It checks that:

1. configured calculator direct-answer text exists in prerendered HTML;
2. it appears before the calculator form where a form is present;
3. known position-band blog pages contain the server-rendered direct-answer marker before the main article body; and
4. `BlogArticleLayout` has not been converted back into a client-only layout.

This protects snippet-oriented content from silently moving below the calculator or behind client hydration.

## Day 16 hand-off

Issue #70 deliberately does not pad these blocks with every query variant. Day 16 should use query-level data for vocabulary and sub-intent shape only, then add depth where the page genuinely lacks an answer. Likely areas to validate with fresh GSC query data include exact maturity/pension amount phrasing, SIP scenario variants, and eligibility or documentation phrasing. Query-level data must not be used to reconstruct site-wide CTR.
