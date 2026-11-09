# GA4 admin checklist — RupeeKit

Last reviewed: 2026-11-09

These checks cover the RupeeKit web stream and the calculation key event. Editing the property requires the appropriate Analytics permissions.

## Verify events in DebugView

Confirm these events on a standard tool, a tool with its own calculation form, and a planner:

- `valid_calculation`
- `calculator_used`
- `result_viewed`
- `guide_click`
- `tool_cta_click`

Each calculator event must carry `tool_slug` and `tool_category`. Click events must also carry their destination; `tool_cta_click` must carry `cta_type`.

Suggested smoke-test routes: personal-loan EMI, home-loan SWP stress test, rent-vs-buy, term-life cover, index-vs-active fund cost, and child-education planner.

## Count visits with a valid calculation

In the RupeeKit GA4 property, `valid_calculation` is a key event with the **Once per session** counting method and no default value. The site uses the existing Google tag session ID to send the first valid calculation. It stores the latest session marker in the browser and uses a browser lock where available. If the browser blocks storage, the open page can still suppress repeat sends. The event payload contains tool details, the page title, path-only URLs, and optional timing.

`calculation_completed` belongs to the previous measurement period. Start a fresh comparison after the `valid_calculation` rollout. For a smoke test, open a calculator, leave its defaults alone, enter an invalid input, then enter a valid one. Only the valid result should send the new event. Make a second valid calculation on a different tool in the same session and confirm that the site sends no additional `valid_calculation` event.

## Register custom dimensions

Create event-scoped custom dimensions for:

- `tool_slug`
- `tool_category`

## Confirm retention and Search Console link

Review GA4 data-retention settings against RupeeKit's privacy needs. Then confirm GA4 → Admin → Product links → Search Console Links connects the correct RupeeKit property and web stream.

## Engagement-time diagnosis

Before issue #63, the persistent root layout configured GA4 once and the codebase had no explicit App Router route-transition `page_view` path. Calculator custom events could therefore fire after client-side navigation without a RupeeKit-owned route-transition page view. That is a concrete measurement gap and a plausible contributor to historical `0.00s` engagement rows, but historical data cannot prove it caused every row.

The fix disables implicit initial page views, explicitly emits a `page_view` on the first route and subsequent pathname changes, and flushes `user_engagement` with `engagement_time_msec` on route changes, tab hiding, and page hide.

After deploy, verify in DebugView:

1. one initial `page_view`;
2. a second `page_view` after client-side navigation;
3. no duplicate initial page view;
4. non-zero `engagement_time_msec` after spending several seconds on a calculator;
5. calculator events carry slug/category parameters.

## Privacy boundary

Analytics must never include entered salary, loan amount, balances, tax values, PAN, Aadhaar, bank details, email addresses, or any other user-entered financial/personal value. RupeeKit analytics should use only route/tool identifiers and CTA destinations needed for aggregate product measurement.
