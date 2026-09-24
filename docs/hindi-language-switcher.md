# English, Hindi and Bengali language switcher

English / हिंदी / বাংলা is available in the shared header on desktop and mobile.
The homepages (`/hi`, `/bn`) and calculator directories (`/hi/tools`, `/bn/tools`)
are translated. Directory names and descriptions cover every live calculator;
search accepts the selected language or English. The calculators themselves,
articles, policies, reports and guide
popups still use English and are explicitly labelled as such.

The language switch links to the same translated page and preserves query and
hash on published translations. Selecting Hindi or Bengali on an English-only
page opens a native dialog in that language offering to remain on the current
page or visit its translated homepage.
Closing it retains form state and returns focus. No automatic redirection,
remote translation script, or finance-input storage is used. The language
preference is stored locally; English pages may suggest the preferred language
without redirecting. The mobile English label is shortened to EN to make room
for all three choices. Hindi and Bengali combine the two source investment
categories into one filter and accept both existing category anchors.

English pages moved under `app/(en)` without changing their public URLs. A shared
site layout is used by that root, `app/(hi)/hi` and `app/(bn)/bn`, so each language has a correct
server-rendered `<html lang>` while retaining static generation. Switching roots
performs a full page navigation. Source-path validators were updated for these
renames; API routes and sitemap endpoints retain their existing locations.

`PUBLISHED_TRANSLATIONS` in `lib/i18n/routing.ts` registers each language's
published pages independently. It controls
switch destinations, internal navigation, metadata and sitemap alternates. Add a
path only after the complete visible page is translated. Do not register
English-only calculator pages as translated. Each translated page has a
self-canonical and reciprocal `en-IN`, `hi-IN`, `bn-IN` and `x-default` alternate
links. All four translated URLs are in the regular sitemap; no new editorial
image page was added.

Checks cover unpublished routes, bidirectional URL mapping, query privacy,
preference storage failures, dialog dismissal and focus, unchanged typed values,
catalog search in all three languages, translation completeness and rendered
language SEO across six static pages.

Next: translate complete calculators, including fields, errors, results, tours
and downloads, then articles and policies. Retain the shared calculation engines.

## Pending full-site extension

The draft described in `docs/hindi-bengali-full-site-rollout.md` extends this architecture to every canonical page. Its translation catalogs are incomplete and its production build is intentionally blocked. The earlier limited release described above remains the deployed behavior until the full translation gate passes.
