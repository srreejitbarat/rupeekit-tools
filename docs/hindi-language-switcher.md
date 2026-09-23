# Hindi language switcher — first release

English / हिंदी is available in the shared header on desktop and mobile. The
homepage (`/hi`) and calculator directory (`/hi/tools`) are translated. Directory
names and descriptions cover every live calculator; search accepts Hindi or
English. The calculators themselves, articles, policies, reports and guide
popups still use English and are explicitly labelled as such.

The language switch links to the same translated page and preserves query and
hash on published pairs. Selecting Hindi on an English-only page opens a native
dialog offering to remain on the current page or visit the Hindi homepage.
Closing it retains form state and returns focus. No automatic redirection,
remote translation script, or finance-input storage is used. The language
preference is stored locally; English pages may suggest Hindi without redirecting.

English pages moved under `app/(en)` without changing their public URLs. A shared
site layout is used by that root and `app/(hi)/hi`, so each language has a correct
server-rendered `<html lang>` while retaining static generation. Switching roots
performs a full page navigation. Source-path validators were updated for these
renames; API routes and sitemap endpoints retain their existing locations.

`lib/i18n/routing.ts` is the publication registry for language pairs. It controls
switch destinations, internal navigation, metadata and sitemap alternates. Add a
path only after the complete visible page is translated. Do not register
English-only calculator pages as Hindi. Each pair has self-canonicals and
reciprocal `en-IN`, `hi-IN` and `x-default` alternate links. Both new Hindi URLs
are in the regular sitemap; no new editorial image page was added.

Checks cover unpublished routes, bidirectional URL mapping, query privacy,
preference storage failures, dialog dismissal and focus, unchanged typed values,
bilingual catalog search, translation completeness and rendered language SEO.

Next: translate complete calculators, including fields, errors, results, tours
and downloads, then articles and policies. Retain the shared calculation engines.
