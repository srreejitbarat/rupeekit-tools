# GA4 admin checklist — RupeeKit

Last reviewed: 2026-08-30

This is the manual follow-up for issue #63. Repository code can emit analytics events, but GA4 property configuration still requires a human with the necessary Analytics/Search Console permissions.

## Verify events in DebugView

Confirm these events appear on at least one tool from each of the six tool data files:

- `calculator_used`
- `result_viewed`
- `guide_click`
- `tool_cta_click`

Each calculator event must carry `tool_slug` and `tool_category`. Click events must also carry their destination; `tool_cta_click` must carry `cta_type`.

Suggested smoke-test routes: personal-loan EMI, home-loan SWP stress test, rent-vs-buy, term-life cover, index-vs-active fund cost, and child-education planner.

## Mark intended events as key events

After GA4 receives the events, mark the four event names above as key events only if they represent the actions RupeeKit wants in top-level reporting. Do not assign fake monetary values.

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
