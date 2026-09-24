# GSC indexing review — 24 September 2026

The supplied Search Console export reports **135 indexed and 95 not indexed URLs**. Its latest coverage date is **21 September 2026**, not the export date. The report covers **all known pages**, including retired URLs. Production currently submits 226 distinct canonical pages.

## What the exports establish

| GSC reason | URLs | Validation in export | Next action |
|---|---:|---|---|
| Duplicate without user-selected canonical | 9 | Failed | Inspect current and Google-selected canonicals, then restart validation after live checks |
| Excluded by noindex | 8 | Started | Export this reason's URL table; distinguish accidental exclusions from confirmation/share URLs |
| Not found (404) | 5 | Started | Export this reason's URL table; restore useful pages or use genuine replacements where available |
| Page with redirect | 3 | Not started | Inspect the final destinations; retired source URLs should remain excluded |
| Crawled, currently not indexed | 1 | Not started | Export the URL and inspect content and Google's canonical choice |
| Discovered, currently not indexed | 69 | Passed | Export the URLs; review crawl history, discovery and page value. Validation is not an indexing guarantee |

The drilldown XLSX contains the three redirects. The drilldown ZIP contains the nine duplicate URLs. The validation ZIP contains the same nine duplicates, with six failed and three pending. These are distinct reports despite their similar filenames. The other four reason groups have counts only, so this review cannot identify or resolve each of their 83 URLs from these files.

## Reported duplicate URLs checked in production

| Path | HTTP | Current canonical or destination |
|---|---|---|
| `/8th-pay-commission/level-4` | 200 | Self canonical; indexing allowed |
| `/8th-pay-commission/level-5` | 200 | Self canonical; indexing allowed |
| `/guides/gratuity-calculation-with-joining-and-exit-dates` | 200 | Self canonical; indexing allowed |
| `/financial-updates` | 200 | Self canonical; indexing allowed |
| `/blog/how-to-track-expenses` | 200 | Self canonical; indexing allowed |
| `/deadlines` | 200 | Self canonical; indexing allowed |
| `/updates` | 200 | Self canonical; indexing allowed |
| `/money-health-check` | 200 | Self canonical; indexing allowed |
| `/government-salary-updates/rajasthan-pension-tracker-layout` | 301 | `/government-salary-updates` |

These correct canonicals were already present when this review began. This change does not claim to have added them. The supplied reports do not include Google's selected canonical or fetched HTML, so they cannot establish exactly why Google classified each page as a duplicate. URL Inspection is needed to distinguish an old fetched version from a different canonical choice.

The three reported redirect sources also returned 301:

- `/blog/home-loan-eligibility-40000-salary-india` → `/blog/home-loan-eligibility-by-salary-india`.
- `/financial-updates/income-tax-regime-comparison` → `/financial-updates` before this change. The destination is corrected to `/tools/income-tax-calculator-old-vs-new-regime-india`, which answers the original comparison question.
- `/government-salary-updates/central-government-da-dr-revision-format` → `/government-salary-updates`.

## Causes and changes

Earlier releases exposed sample government-update pages and removed financial-explainer URLs. Permanent redirects for those paths already exist. Google can continue reporting old URLs after they are retired. A redirected URL is not intended to be indexed separately from its destination.

The tax-comparison redirect was too broad: it sent readers to a general news listing despite an existing relevant comparison calculator. This change gives it a direct, relevant destination. It does not change any calculator formula.

Existing validation checked source templates and selected rendered pages. This change adds `validate:indexing-rendered` to `postbuild`, checking every page in the generated sitemap for a rendered page, one matching canonical in the HTML head and no blocking robots meta tag. It also checks duplicate sitemap entries, redirects in the sitemap, redirect chains, missing redirect destinations, image-sitemap membership and sitemap declarations in robots.txt.

The production deployment also runs `validate:indexing-live`. It checks every submitted URL over HTTP with redirects disabled, including status, HTML content type, canonical and meta/HTTP noindex directives. It checks both sitemaps and robots.txt. A failure fails deployment verification; it does not automatically roll back an already completed deployment.

## Verification and limits

- Initial public crawl: 224 of 226 sitemap URLs returned HTTP 200, a matching canonical and no observed noindex restriction. This workspace's network proxy blocked the last two requests (Level 13 and Level 14); these were not origin HTTP errors and are not counted as passes.
- Both production sitemaps and robots.txt returned 200. The image sitemap contains 145 canonical page entries.
- `npm run validate`, `npm run lint` and `npm run build` passed locally. Lint retained existing warnings in the calculator analytics and FCRA article components.
- All 57 test suites passed across the full test run and the rerun of the four measurement tests after retrieving their existing report fixture: 473 tests total.
- Rendered-output checks passed for all 226 submitted pages, 145 image-sitemap pages and 26 legacy redirects.
- The new HTTP check passed for all 226 pages on the local production server. The corrected tax-comparison redirect returned 301 directly to the calculator.
- Negative checks verify that a missing canonical, wrong canonical and accidental noindex make the build check fail.

Technical eligibility does not establish Google indexing, Google's chosen canonical, or ranking. Keep confirmation pages and arbitrary saved-calculator query variants excluded. Do not delete useful pages, remove valid redirects, inflate lastmod dates or remove intentional exclusions to make the all-known-URLs report look empty.

## Exact Search Console steps

1. After the production deployment and its live checks pass, open **URL Inspection** for `/8th-pay-commission/level-4`, `/8th-pay-commission/level-5` and `/financial-updates`. Record the indexed report's last crawl, user-declared canonical and Google-selected canonical. Use **Test live URL → View tested page → HTML** to confirm the current self canonical. A live test establishes accessibility, not Google's final canonical selection.
2. Check the remaining five active duplicate URLs and the retired Rajasthan URL as well. Once their intended behavior is verified, open **Indexing → Pages → Duplicate without user-selected canonical → See details → Start new validation** (or **Validate fix**, depending on the current UI).
3. If the indexed report still says user-declared canonical is absent after a new crawl, compare the fetched HTML and headers with the live test. If Google chooses another canonical, inspect that exact URL and compare the content before changing canonical tags or consolidating pages.
4. Confirm **Sitemaps** shows `sitemap.xml` and `image-sitemap.xml` as successfully read. These are two sitemap files, not two properties. Do not resubmit daily.
5. Export the URL tables for **Excluded by noindex**, **Not found (404)**, **Crawled, currently not indexed**, and **Discovered, currently not indexed**. Counts alone are insufficient for individual repairs. Existing validation for noindex and 404 is already running in the supplied snapshot; check its current status before restarting it.
6. Request indexing once only for an important corrected or substantially updated canonical page, or a valuable page that remains discovered-not-indexed after several days. Do not request indexing for the retired redirect sources or arbitrary parameter URLs.
7. Use the **All submitted pages** filter to monitor the intended indexable pages. All-known-URL exclusions can remain even when the current website is technically healthy.

Official references: [Page indexing report](https://support.google.com/webmasters/answer/7440203), [canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects).
