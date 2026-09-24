# Issue #83 — contextual calculator next steps

Date: 4 September 2026

## Decision

The Day 27 engagement instrumentation is now available, but its committed baseline states that live GA4 cluster/top-tool/drop-off data was unavailable at implementation time. That means there is no trustworthy evidence yet that one specific result-stage exit dominates. We therefore do not claim a measured drop-off that the data did not provide.

The implementation follows the issue's safer fallback: after a user completes a calculation, show one or two highly specific questions that naturally follow from that result. The links are not shown before calculation and do not interrupt the primary task.

## Priority set

The committed GSC opportunity evidence identifies these high-impression calculators directly: personal-loan EMI, 8th Pay Commission salary, emergency fund, personal-loan eligibility, gold loan, old-vs-new income tax, net worth, capital gains tax, NPS, SSY, SIP, CAGR, salary in hand and Step-Up SIP. The live Day 27 GA4 top-20 list was unavailable, so six core surviving calculators that complete the same journeys were added: home-loan EMI, FD, PPF, EPF corpus, gratuity and generic EMI.

This gives an explicit 20-tool set without pretending it is a fresh GA4 traffic ranking.

## Measurement

Existing generic related links continue to emit `tool_cta_click` with their existing CTA types. Result-adjacent links emit the same event with:

`cta_type = contextual_next_step`

That makes a later before/after readout possible without calling it a controlled A/B test. At RupeeKit's current traffic level, this is an observational comparison with overlapping SEO, content and product changes.

## UX constraints

- No next-step link appears before a calculation has completed.
- At most two links are shown for a mapped tool.
- Questions are phrased around a plausible follow-up, not a generic category list.
- No popup, interstitial, forced navigation or engineered click is used.
- Financial inputs are not sent in CTA analytics.

## Safety

No calculator formula, tax rule, rate, lender criterion, investment-return assumption, canonical URL, sitemap entry, review/rating schema or sensitive-data collection changed in this issue.

## Follow-up measurement

After deployment, compare absolute contextual-next-step clicks with generic related-strip clicks over settled 7-, 14- and 28-day windows. Also inspect destination pageviews to ensure clicks are not accidental. Treat low counts as directional only.
