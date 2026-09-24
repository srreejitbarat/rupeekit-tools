# Issue #67 — Core Web Vitals performance audit

Date: 11 September 2026

## Scope

This pass is performance-only. No calculator formula, tax/finance rule, URL, canonical, schema, rating/review, guarantee, or user-data collection changed.

The issue was selected because the planned Sep-11 issue (#148) depends on the still-open fresh-measurement chain (#146/#147). Producing a fresh top-20 SEO opportunity queue without that dataset would require stale or reconstructed evidence.

## What was verified in code

The shared `DiscoverHeroImage` already has the important LCP/CLS protections required by #67:

- explicit intrinsic `width` and `height` from the discover-image registry;
- a reserved `aspect-video` box before the image loads;
- responsive `sizes` so large Discover assets are not always requested at their source width;
- opt-in `priority` support for genuinely above-the-fold usage.

The shared calculator result summary retains `aria-live="polite"` and semantic `<output>` elements. Those are not CWV fixes by themselves, but they are protected in the same regression gate because result rendering is one of the issue's suspected dynamic surfaces.

`@vercel/speed-insights` is installed for production field monitoring.

## New regression protection

`scripts/validate-cwv-readiness.mjs` now checks the shared hero/result primitives and Speed Insights dependency. `npm run validate` invokes it through `validate:cwv`.

This is intentionally a guardrail, not a fake performance benchmark. Static source inspection cannot produce LCP, INP or CLS values.

## Baseline record

`automation/reports/cwv-baseline-2026-08-14.json` records the known high-impression pages available from the committed GSC baseline and the static checks completed in this run.

A complete top-20 mobile/desktop LCP/INP/CLS table is **not** claimed. The automation runtime could not clone/run the repository locally because outbound DNS for GitHub was unavailable, and no complete production CWV export was available through the connected data sources. Synthetic values were not invented.

## Remaining issue-closure work

Before #67 should be considered fully closed, use the current top-20 GSC impression URLs and capture production field CWV (prefer CrUX/Vercel Speed Insights) plus a repeatable mobile/desktop lab pass. For each route outside the current good thresholds, record the measured cause and fix/follow-up. The likely checks remain:

- LCP resource and render delay on large Discover heroes;
- CLS around calculator/result regions and other conditional blocks;
- INP on the heavier SIP, personal-loan and tax experiences;
- JavaScript cost on calculator routes, especially shared client components.

## Indexing rule

This PR is a performance-validation change only. It does not create a new important page, make a major search-content update, or repair canonical/sitemap/noindex behavior, so it does not justify a manual Search Console indexing request.
