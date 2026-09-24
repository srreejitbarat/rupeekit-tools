# Issue #85 — RupeeKit owned official-update channel

Date: 2026-09-01

## Offer

RupeeKit's owned email channel is intentionally narrow: official-change alerts for subjects the site already covers well — 8th Pay Commission progress, DA/DR revisions, EPFO changes, CBDT filing/deadline changes and small-savings rate resets. It is not positioned as a generic finance-tips newsletter and does not promise a fixed send cadence.

## Provider decision: Buttondown

Buttondown was selected for the low-volume launch because:

- its published pricing currently includes the first 100 subscribers at no charge;
- API-created subscribers are double-opt-in by default and can be explicitly created as `unactivated`;
- subscribers can manage/unsubscribe through Buttondown's subscriber portal, which can be included automatically in email footers;
- subscriber data is exportable, reducing lock-in risk;
- the API is simple enough that RupeeKit can keep the provider secret server-side and avoid storing a duplicate email list in the app.

Primary provider references reviewed on 2026-09-01:

- Pricing: https://buttondown.com/pricing
- Double opt-in: https://docs.buttondown.com/double-opt-in
- Subscriber API: https://docs.buttondown.com/api-subscribers-create
- Subscriber portal / unsubscribe: https://docs.buttondown.com/portal
- Data import/export context: https://docs.buttondown.com/importing-your-data

Alternatives considered:

- Brevo: capable free tier and broad India-oriented transactional/marketing tooling, but substantially more CRM surface than this low-volume use case needs.
- MailerLite: supports double opt-in, including API/integration opt-in, but RupeeKit does not need its broader campaign-builder footprint for the first 100 subscribers.

## Data flow

1. A user sees the signup only on a financial-update page or after interacting with a calculator whose rules/rates are likely to change.
2. The browser POSTs `email`, consent=true and non-identifying placement/context to `/api/updates/subscribe`.
3. The server validates the email and forwards only the email address to Buttondown using `BUTTONDOWN_API_KEY`.
4. The Buttondown subscriber is created as `unactivated`, forcing confirmation before subscription becomes active.
5. The provider sends the confirmation email.
6. After confirmation, Buttondown should redirect to `https://www.rupeekit.co.in/updates/confirmed` so RupeeKit can record a privacy-safe `newsletter_confirmed` event.
7. Buttondown manages the subscriber record and unsubscribe state. RupeeKit does not keep a second application database of subscriber email addresses.

Calculator input values never enter this flow.

## Analytics

Events contain no email address and no calculator input values:

- `newsletter_form_viewed` — placement + content context only
- `newsletter_form_submitted` — placement + content context only
- `newsletter_confirmed` — confirmation-page context only

Absolute counts should be reported alongside conversion percentages because traffic is currently low.

## Required production setup before calling the channel live

1. Create/choose the RupeeKit Buttondown newsletter.
2. Add `BUTTONDOWN_API_KEY` to the production environment; never expose it as `NEXT_PUBLIC_*`.
3. Keep double opt-in enabled. The API also explicitly requests `type: unactivated`.
4. Configure the provider's confirmation thank-you redirect to `https://www.rupeekit.co.in/updates/confirmed`.
5. Keep the Buttondown subscriber portal enabled so a manage/unsubscribe path is available in every send.
6. Verify the sender identity/domain and deliver a test confirmation to an India-based mailbox before public launch.
7. Verify a complete test cycle: form viewed → form submitted → confirmation mail received → confirmation clicked → `/updates/confirmed` reached → subscriber can unsubscribe.

If `BUTTONDOWN_API_KEY` is missing, the API returns 503 and no address is stored locally.

## Privacy / editorial boundaries

- Email is collected only after explicit form submission.
- Subscription is not active until double opt-in confirmation.
- Email is not sent to GA4 or linked to calculator values.
- No PAN, Aadhaar, bank, card or user-entered financial input is collected by the subscription channel.
- The privacy policy names the provider, purpose, unsubscribe path and deletion-request contact.
- No popup, interstitial or exit-intent capture is used.
- Update emails should link back to source-verified RupeeKit update pages; they should not convert a tentative announcement into an official rule.
