# Monetisation readiness — 3 September 2026

Issue: #87

## Decision

RupeeKit will **not add new monetisation surfaces at the current traffic level**. The primary future model is contextual affiliate/referral monetisation on genuinely commercial-intent pages, with strict disclosure and source-verification rules. Existing disclosed broker links may remain, but no new affiliate category should be expanded until the traffic threshold below is met.

### Go-live threshold for expansion

Expand contextual affiliate placements only after RupeeKit sustains both of these for two consecutive calendar months:

- at least **5,000 organic sessions/month sitewide**; and
- at least **500 sessions/month on commercial-intent comparison/selection pages**.

These are internal operating thresholds, not industry laws. They are deliberately high enough to make measurement meaningful while keeping the site focused on traffic, trust, and product quality first.

## Option evaluation

| Model | RupeeKit fit now | Go-live / evaluation threshold | Decision |
|---|---|---|---|
| Contextual affiliate/referral links | Best fit for high-intent broker/insurance/lending comparisons, but only when the page would exist without the payout | 5,000 organic sessions/month + 500 monthly commercial-intent sessions for two months | **Primary future model. Do not expand yet.** |
| Display advertising | Weak fit at current scale; adds network requests, layout risk, and mobile distraction before revenue is meaningful | Re-evaluate at 50,000 sessions/month with CWV headroom | **Deferred. No ad units shipped.** |
| Sponsored placement | Creates the highest editorial-conflict risk on YMYL content | Re-evaluate at 25,000 sessions/month plus an established editorial review process | **Deferred.** Sponsorship can never buy ranking or recommendation order. |
| Paid RupeeKit product | Potentially attractive if repeated user needs emerge, but current traffic does not validate demand | Re-evaluate at 10,000 monthly engaged sessions or a measurable repeat-user cohort | **Research later; no paywall now.** |
| Lead-generation / selling user data | Poor fit with RupeeKit trust and privacy boundaries | None | **Rejected.** Calculator inputs and personal data are not a monetisation asset. |

## Existing commercial-content audit

The main existing commercial page is:

`/blog/zerodha-vs-upstox-vs-angel-one-demat-account`

The page already places an affiliate disclosure before the article body and uses sponsored-link attributes. Issue #87 refreshes its comparison card against official broker sources and makes the verification date visible as **3 September 2026**.

### Broker facts re-verified on 3 September 2026

**Zerodha — official sources**

- Resident-individual equity delivery brokerage: Rs 0.
- Intraday and equity futures: 0.03% or Rs 20 per executed order, whichever is lower.
- Options: Rs 20 per executed order.
- AMC: first year free for eligible resident-individual accounts opened on or after 1 June 2026; non-BSDA individual AMC is Rs 300 + GST/year after the waiver.
- NRI accounts are available with separate pricing and restrictions.

Sources:
- https://support.zerodha.com/category/account-opening/resident-individual/ri-charges/articles/what-is-the-brokerage-at-zerodha-for-equity
- https://support.zerodha.com/category/account-opening/resident-individual/ri-charges/articles/what-is-the-annual-maintenance-charge
- https://zerodha.com/open-account/nri

**Upstox — official sources**

- Equity delivery: Rs 20 per executed order.
- Equity intraday: Rs 20 or 0.1% per executed order, whichever is lower.
- Equity futures: Rs 20 or 0.05%, whichever is lower; options Rs 20 per executed order.
- First-year AMC is free for eligible users; non-BSDA AMC is Rs 300 + GST/year from the second year.

Sources:
- https://upstox.com/brokerage-charges/
- https://upstox.com/open-demat-account/

**Angel One — official sources**

- After the introductory offer, equity delivery and intraday brokerage are the lower of Rs 20 or 0.1% per executed order, with a Rs 5 minimum.
- F&O is Rs 20 per executed order after the introductory offer.
- AMC is Rs 0 for the first year; non-BSDA AMC is Rs 60 + GST per quarter from the second year.

Sources:
- https://www.angelone.in/support/charges-and-cashbacks/brokerage-charges
- https://www.angelone.in/support/charges-and-cashbacks/account-maintenance-charges

### Corrections made in Issue #87

The previous comparison had several stale or over-simplified claims:

- Upstox equity delivery was shown as "Rs 20 or 0.1%/order (lower)"; its official current pricing shows Rs 20 per executed order.
- Upstox equity intraday was shown as 0.05%; its official current pricing shows 0.1% or Rs 20, whichever is lower.
- Angel One intraday was shown as flat Rs 20; its current pricing is the lower of Rs 20 or 0.1%, with a Rs 5 minimum after the introductory offer.
- AMC descriptions did not accurately show the current first-year waivers and BSDA/non-BSDA distinctions.
- Zerodha was incorrectly marked as not offering NRI accounts; Zerodha currently provides NRI account onboarding with separate pricing and restrictions.

These corrections are exactly why commercial facts require dated primary-source review.

## Layout preparation without shipping ads

`components/monetization/ReservedCommercialSlot.tsx` is a disabled-by-default scaffold for any later commercial placement. It renders nothing unless explicitly enabled. If enabled in a future issue, it reserves a minimum 180px block before partner content renders, preventing a late-loaded placement from pushing content downward.

No ad network, sponsored unit, tracking pixel, or new commercial placement is enabled by Issue #87.

## Review cadence

- Active commercial pages with affiliate/referral links: verify changeable claims every **30 days**.
- Provider announces pricing/terms change: re-verify immediately.
- Before any paid campaign or featured commercial placement: re-verify all displayed pricing and eligibility facts again, regardless of last review date.
- If a primary source cannot confirm a claim: remove or soften the claim rather than preserve a stale value.

## Next review

Scheduled content review target: **3 October 2026**, or earlier if Zerodha, Upstox, or Angel One announces a pricing/terms change.
