# Issue #82 — Calculator engagement baseline and journey instrumentation

## Decision

The historical `0.00s` engagement rows should not be treated as proof that users genuinely spent zero time on calculator pages. Issue #63 found and fixed a real App Router measurement gap by adding explicit route `page_view` events and `engagement_time_msec` tracking. That establishes a plausible measurement explanation, but historical GA4 exports cannot prove it was the only cause.

Issue #82 therefore adds journey instrumentation that can distinguish three outcomes after deployment:

1. the visitor leaves before any calculation;
2. the visitor calculates but never brings the result panel into view;
3. the visitor calculates, sees the result, and optionally recalculates.

## Events added

All events go through `lib/analytics.ts`; there are no raw `gtag()` calls in calculator components.

- `calculation_completed` — emitted after a short debounce so a burst of input changes counts as one calculation. The first event includes `time_to_first_calculation_ms`.
- `result_panel_viewed` — emitted once when the visible estimated-results panel reaches at least 25% intersection with the viewport.
- `calculator_session_summary` — emitted once when a calculator session ends after at least one calculation. Includes calculation count, recalculation count, result-view state, and engagement time.
- `calculator_abandoned` — emitted once when the calculator route is left before a completed calculation.

The existing `calculator_used` and `result_viewed` events remain for continuity with earlier GA4 reporting.

## Privacy boundary

Journey events contain only tool identity, event counters, booleans, and elapsed milliseconds. They do not contain salary, loan amount, EMI, tax, investment amount, returns, PAN, Aadhaar, bank details, email address, or any other value entered into a calculator.

## Event-volume boundary

The implementation deliberately avoids keystroke-level analytics. Input/change events are debounced before a `calculation_completed` event is sent. Result-panel visibility is sent once. The session summary or abandonment event is sent once when leaving the calculator.

## Baseline status

The historical baseline from the issue remains:

- 14 pages showed `0.00s` engagement while still firing events.
- `/tools/personal-loan-emi-calculator-india` was the named example: 4 users, 12 events, 0 seconds.

A fresh GA4 baseline could not be pulled during this implementation run. The connected GSC Wizard GA4 integration returned `payment_required`, so cluster-level engagement, the top-10 traffic list, and post-fix drop-off percentages are intentionally recorded as unavailable rather than estimated. See `automation/reports/engagement-baseline-2026-08-29.json`.

## Required production verification

After deployment, use GA4 DebugView on at least one calculator from each of the six calculator data files and verify:

1. one `page_view` on initial load and one on client-side route navigation;
2. `calculation_completed` appears after changing calculator inputs or using a calculation/preset action;
3. the first calculation includes a non-zero `time_to_first_calculation_ms`;
4. `result_panel_viewed` appears only when the results area is actually brought into view;
5. `calculator_session_summary` reports calculation/recalculation counts without financial inputs;
6. a calculator route left before calculation emits `calculator_abandoned`;
7. `engagement_time_msec` is non-zero for a session where the tester remains on the page for several seconds.

## Post-deploy readout

Use a settled seven-day window after deployment, then repeat at 14 and 28 days. Report by tool category and for the top 10 tools by traffic:

- engaged sessions;
- average engagement time;
- events per session;
- calculation-completion rate;
- result-panel-view rate;
- abandonment before calculation;
- calculate-without-result-view exits;
- sessions that view the result before exit.

This is the evidence Day 31 mobile work and later conversion work should use. Until that post-deploy window exists, do not convert the historical `0.00s` rows into a UX conclusion.
