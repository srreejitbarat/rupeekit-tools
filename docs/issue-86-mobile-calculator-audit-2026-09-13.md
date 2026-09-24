# Issue #86 — Mobile calculator audit (2026-09-13)

## Scope

This pass focuses on mobile ergonomics and regression protection without changing any calculator formula, finance/tax rule, URL, canonical intent, schema, review/rating markup, guarantee language, or analytics payload containing user-entered financial values.

## What was verified

- Standard calculator numeric fields already use `type="number"`, `inputMode="decimal"`, configured `min` / `max` / `step`, and do not format the value while the user is typing.
- Advanced priority calculators use the shared `NumericField` primitive. This pass adds explicit suppression of autocorrect, autocapitalisation and spellcheck behaviour, preserves decimal keyboard intent, associates help text programmatically, and guarantees a minimum 44px control height.
- Preset buttons now have a minimum 44px tap height while preserving `aria-pressed`, wrapping, keyboard focus indication and the existing illustrative-scenario disclaimer.
- Shared standard result summaries continue to expose `aria-live="polite"` and `<output>` semantics.

## Device-data limitation

Issue #86 asks for traffic, engaged-session and calculator-completion shares by device. The fresh GA4 device/completion dataset is not available in this run, so no mobile-share percentage or abandonment rate is invented. The code changes are therefore based on direct component audit rather than a claimed analytics diagnosis.

## Browser-smoke limitation

The repository does not currently maintain Playwright as a direct dev dependency or a browser-smoke script. This PR adds Vitest regression coverage around the shared mobile primitives that serve the calculator fleet. A later measured browser pass should run the heaviest calculator routes at a 390px viewport on a throttled connection once maintained browser-test infrastructure is available.

## Risk

The changes are deliberately small and shared: larger tap targets can slightly increase vertical space in dense preset groups, but wrapping already exists and the change avoids a redesign. No calculation path is touched.

## Follow-up measurement

When GA4 device data is available, report absolute mobile/desktop users, engaged sessions, calculator completions and abandonment before deciding whether any route-specific mobile redesign is justified.
