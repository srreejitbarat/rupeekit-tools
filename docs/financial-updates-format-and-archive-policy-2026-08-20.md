# RupeeKit financial-update format and archive policy — 20 August 2026

## Why this format is being scaled

RupeeKit's programme baseline shows `/financial-updates/*` producing materially better CTR than evergreen calculator pages at comparable positions. The useful pattern is not "publish more news". It is **dated, specific, primary-source-backed information that answers what changed, who it affects, and what the reader should verify next**.

## Reusable update format

Every public financial update should include:

1. A dated, specific title that names the affected rule/rate/process rather than a generic category.
2. A direct Quick Answer near the top.
3. The primary official source, with source date and a visible RupeeKit review date.
4. A clear distinction between an announcement, recommendation, consultation, circular, notification and final implementation order.
5. A plain-language explanation of what changed and why it matters.
6. "Who may be affected" and, where useful, "who may not be affected".
7. A verification instruction so a time-sensitive claim is not treated as permanent.
8. Relevant RupeeKit calculator/guide links.
9. At least two visible FAQs when FAQ schema is emitted.
10. Article/NewsArticle, Breadcrumb and FAQ schema only where the matching content is visible.
11. A self-canonical and sitemap entry.
12. A safe educational disclaimer; no personalised tax, legal, investment, loan or financial advice.

## Standing beats

RupeeKit should maintain primary-source watch coverage for:

- 8th Central Pay Commission progress and official consultation/notification milestones.
- DA/DR revisions and central-government salary/pension orders.
- EPFO member rules, interest notifications, claims and employer-compliance changes.
- CBDT / Income Tax portal circulars, form availability and deadline changes.
- GST Council / CBIC notifications and circulars relevant to individuals and small businesses.
- Quarterly small-savings rate resets: PPF, SSY, SCSS, POMIS and related schemes.
- RBI policy-rate decisions and retail-loan transmission context.

A standing beat does **not** mean a page must be published every day. Publish only when there is a meaningful official development that changes what a reader needs to know or verify.

## URL policy

Use durable event-specific slugs, normally including the subject and time period, for example:

`/financial-updates/rbi-repo-rate-5-25-august-2026`

Rules:

- A new official event gets a new URL when it is meaningfully distinct from the old event.
- A factual correction or clarification to the same event updates the existing URL and `modifiedDate`.
- Do not replace a dated historical URL with an unrelated newer story.
- Do not create multiple near-duplicate URLs for the same announcement.
- Every new public update is self-canonical and included in the sitemap.
- Arbitrary campaign/query-parameter variants are not separate indexable pages.

## Archive / supersession policy

A dated update normally remains a useful historical explainer after a newer update appears. Therefore:

- Keep the historical page at its original URL and self-canonical when it still accurately describes what was official on that date.
- Add or link to a newer update when later information supersedes the practical advice.
- If a page becomes factually wrong because its premise was withdrawn or corrected, update the page with a visible correction and `modifiedDate` rather than silently deleting it.
- Use a 301 only when a URL was accidental, duplicated, removed without a durable reason, or has a true one-to-one successor. Never redirect old dated updates to `/financial-updates` merely because they are old.
- Avoid the failure mode fixed by PR #60: deleting public update URLs without a specific redirect/canonical plan.

## 20 August 2026 batch

The first scaled batch covers five live, verified beats:

| Beat | Update | Primary source |
|---|---|---|
| 8th CPC | Chandigarh visit scheduled for 16-18 Sep 2026; notice references 25 Aug as last date | 8cpc.gov.in |
| RBI | Policy repo rate displayed at 5.25% after the Aug 2026 policy meeting | rbi.org.in |
| Small savings | PPF 7.1%, SSY 8.2%, SCSS 8.2%, Post Office MIS 7.4% for Jul-Sep 2026 | DEA + India Post |
| Income Tax | ITR-7 online utility for AY 2026-27 enabled on 11 Aug 2026 | incometax.gov.in |
| EPFO | VISHWAS 2026 and AMNESTY 2026 employer/compliance schemes are live | PIB / EPFO |

The batch intentionally does not publish a GST update because the primary-source review did not identify an August development with enough broad RupeeKit-user relevance to justify another page. The standing beat remains in scope for the next meaningful official notification or circular.

## Internal-linking rule

Every update links to at least one relevant RupeeKit calculator or guide. Relevant calculator pages surface a small "Official update" link back to the current update beat. This creates a two-way path between evergreen tools and dated official developments without changing calculator formulas.

## Safety rule

Never convert a consultation, recommendation, press report or viral estimate into a settled financial fact. In particular, 8th CPC fitment factors remain calculator scenarios until an official recommendation/order exists, and an RBI repo-rate headline is not the same as a borrower's actual loan rate.
