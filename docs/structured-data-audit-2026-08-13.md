# Structured data audit — 13 August 2026

Issue: #66

## Scope

Audited the JSON-LD emitted by the main public content templates used by RupeeKit:

| Route family | Schema emitted | Source |
| --- | --- | --- |
| `/tools/[slug]` | `WebApplication`, `BreadcrumbList`, conditional `FAQPage` | `app/tools/[slug]/page.tsx` |
| `/tools/income-tax-calculator-old-vs-new-regime-india` | `WebApplication`, `BreadcrumbList`, conditional `FAQPage` | dedicated route |
| `/blog/[slug]` | `Article`, `BreadcrumbList`, conditional `FAQPage` | `app/blog/[slug]/page.tsx` |
| `/guides/[slug]` | `Article`, `BreadcrumbList`, `FAQPage`, `HowTo` | `app/guides/[slug]/page.tsx` |
| `/financial-updates/[slug]` | `Article`/configured article subtype, `BreadcrumbList`, conditional `FAQPage` | `app/financial-updates/[slug]/page.tsx` |
| `/government-salary-updates/[slug]` | `Article`, `BreadcrumbList` | `app/government-salary-updates/[slug]/page.tsx` |

The root layout separately owns the linked `Organization` and `WebSite` graph; it is not duplicated by the route templates above.

## Findings

### Calculator application schema

The generic calculator route already emits `WebApplication` with `applicationCategory: FinanceApplication`, a zero-price INR `Offer`, canonical URL, language, publisher, browser requirements and a stored `dateModified` value where available. The dedicated income-tax calculator has the same application-schema role. No `Product`, `Review`, `AggregateRating` or fabricated rating markup is used.

Google's current Software App rich-result documentation requires `name`, `offers.price`, and a genuine rating or review for Software App rich-result eligibility. RupeeKit has no genuine user-review corpus and must not fabricate one. Therefore the calculator `WebApplication` markup is kept as accurate semantic schema, but this audit does **not** claim that calculators qualify for Google's Software App rich result. That is preferable to adding fake ratings or reviews.

### FAQPage visibility

- Tool FAQ schema is created from the same `tool.faqs` collection shown in the page FAQ section.
- Blog FAQ schema is conditional and the same `post.faqs` collection is rendered by `FAQSection`.
- Financial-update FAQ schema is conditional and the same `update.faqs` collection is rendered visibly in the update page.
- Calculator-guide FAQs are generated from `faqItems`, and that same collection is rendered visibly near the end of the guide.
- Government salary updates do not expose a FAQ collection, so they intentionally do not emit `FAQPage`.

This avoids schema-only FAQ content. Google currently limits regular FAQ rich-result display largely to authoritative government and health sites, so RupeeKit keeps the markup only as truthful page semantics and does not treat it as a guaranteed SERP feature.

### Breadcrumbs

The audited templates use route-family hubs that match their actual public paths (`/tools`, `/blog`, `/guides`, `/financial-updates`, `/government-salary-updates`) and use the canonical detail URL for the final breadcrumb item.

### Dates

The route templates derive structured-data dates from stored content fields instead of calling `new Date()` to create artificial freshness:

- blog: `modifiedDateISO`, falling back to `publishedDateISO`;
- guides: `lastReviewedIso`;
- financial updates: `modifiedDate`, falling back to `publishedDate`;
- government salary updates: stored `modifiedDate` when present, otherwise `publishedDate`;
- calculators: stored review metadata / explicit SEO override dates.

Legacy content without a trustworthy ISO modification date is not assigned a fabricated current date. A missing historical date should be fixed only when the underlying page is actually reviewed.

## Fix made in this issue

Calculator guides already render `cluster.methodSteps` as a visible ordered list under **How the calculator approaches it**. They are therefore genuinely how-to-shaped pages. A `HowTo` block is now emitted from the exact same `cluster.methodSteps` collection, with `HowToStep` entries matching the visible copy. No hidden steps or extra claims are added.

Google's current supported structured-data gallery no longer lists standalone HowTo as a supported Search rich-result feature. The markup is therefore used for semantic clarity and other consumers, not presented as a promise of a Google HowTo rich result.

## Validation added

`npm run validate:ai-seo` now runs the existing AI SEO readiness validator followed by `scripts/validate-structured-data.mjs`. The structured-data check fails when it detects:

- missing expected schema on a route family;
- duplicate top-level application/article/breadcrumb/how-to definitions in the audited templates;
- calculator application schema without `applicationCategory` or a zero-price INR `Offer`;
- FAQ schema that is not bound to the same visible FAQ data;
- breadcrumbs that do not match the route family;
- generated/fake blog modification dates;
- disallowed `Product`, `Review` or `AggregateRating` schema on these finance pages;
- guide `HowTo` schema that is not sourced from the visible method-step list.

## Rich-result caveat

Google's current documentation still supports Article, Breadcrumb and Software App search features, but eligibility depends on each feature's required properties and Google does not guarantee display. Structured data that is accurate but unsupported as a dedicated rich-result feature can still describe page meaning to machines. RupeeKit prioritises truthful visible-content parity over trying to manufacture a SERP treatment.

## Search Console follow-up

This change adds structured data to existing calculator-guide pages but does not create new URLs or alter canonicals/sitemap/noindex rules. After deployment, use URL Inspection on one representative `/guides/` URL and test the live page / rendered structured data. Do not request indexing solely because this audit was deployed unless an important page is separately discovered-not-indexed after several days or another qualifying indexing condition exists.
