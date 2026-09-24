# GSC indexing review — 24 September 2026

The supplied Search Console export reports **135 indexed and 95 not indexed URLs**. Its latest coverage date is **21 September 2026**, not the export date. The report covers **all known pages**, including retired URLs. Production currently submits 226 distinct canonical pages.

## What the exports establish

| GSC reason | URLs | Validation in export | Next action |
|---|---:|---|---|
| Duplicate without user-selected canonical | 9 | Failed | Inspect current and Google-selected canonicals, then restart validation after live checks |
| Excluded by noindex | 8 | Started | All eight are retired government samples now returning 301; let current validation finish |
| Not found (404) | 5 | Started | All five retired financial explainers now return 301; let current validation finish |
| Page with redirect | 3 | Not started | Inspect the final destinations; retired source URLs should remain excluded |
| Crawled, currently not indexed | 1 | Not started | Correct and link the salaried-finance checklist; inspect the updated URL after deployment |
| Discovered, currently not indexed | 69 | Passed | All are in the sitemap; fix two unlinked loan examples and monitor crawl/index status separately |

The drilldown XLSX contains the three redirects. The drilldown ZIP contains the nine duplicate URLs. The validation ZIP contains the same nine duplicates, with six failed and three pending. These are distinct reports despite their similar filenames. Five additional XLSX drilldowns now supply those missing 83 URLs plus the same three redirect URLs. Together, the exports identify all 95 URLs in the original snapshot. Their chart data still ends on 21 September; these are not live Google index-status checks.

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
5. The noindex and 404 URL tables have now been checked. All 13 old URLs return 301 and are absent from the current sitemap. Their validations were already running in the supplied snapshot; let those cycles finish. They may subsequently appear as **Page with redirect**, which is expected for these retired sources. Do not request indexing of them.
6. Request indexing once only for an important corrected or substantially updated canonical page, or a valuable page that remains discovered-not-indexed after several days. Do not request indexing for the retired redirect sources or arbitrary parameter URLs.
7. Use the **All submitted pages** filter to monitor the intended indexable pages. All-known-URL exclusions can remain even when the current website is technically healthy.

Official references: [Page indexing report](https://support.google.com/webmasters/answer/7440203), [canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects).


## Follow-up: all five additional exports checked

| Export reason | Latest affected count | Last crawl recorded | Live result on 24 September |
|---|---:|---|---|
| Excluded by noindex | 8 | 19 July–5 August 2026 | Eight direct 301 responses to the government-salary hub |
| Not found (404) | 5 | 25 July–3 August 2026 | Five direct 301 responses to the financial-updates hub |
| Page with redirect | 3 | 9–19 September 2026 | Three direct 301 responses; the tax-comparison destination reflects PR #214 |
| Crawled, currently not indexed | 1 | 21 June 2026 | Salaried-finance checklist returns 200, self canonical and index/follow |
| Discovered, currently not indexed | 69 | No actual crawl date supplied | All 69 are in the canonical sitemap and were included in the successful 226-page deployment check |

The discovered export encodes the missing crawl date as an Excel date corresponding to 1 January 1970. This is a placeholder, not evidence of a crawl in 1970. The chart decreases from 81 on 29 August to 75 on 5 September and 69 on 19 September. The export alone does not establish that the URLs which left this group became indexed.

The previous deployment's GitHub Actions run [35955781749](https://github.com/rupeekitofficial/rupeekit-tools/actions/runs/35955781749) logged **226/226 live sitemap pages passed** at 04:34:54 UTC on 24 September. This includes the Level 13 and Level 14 pages blocked by this workspace's outbound proxy, so the earlier two-request uncertainty is resolved by deployment evidence.

### Further defects found and changes made

- Both submitted loan examples had no incoming HTML links: `/tools/scenarios/personal-loan-eligibility-25000-salary` and `/tools/scenarios/personal-loan-emi-10-lakh-5-years`. Their parent calculators now render a **Worked examples** section sourced from the existing scenario catalog. Example pages link back to the full calculator methodology and use reader-facing explanations instead of issue numbers and indexing implementation details.
- A rendered-link graph found seven submitted pages without a path from the homepage. Beyond the two examples, these were `/about`, `/api-docs` and three July financial updates. The resources page now links to the first two. A dated, server-rendered update directory supplies links to the older updates before JavaScript filtering loads. No old news is presented as new.
- `/blog/personal-finance-checklist-for-salaried-people` had one incoming link, from the blog list, and outdated/incomplete guidance. Its previous FAQ used the obsolete Rs 7 lakh rebate threshold without a tax year; the HRA example counted basic salary alone; gratuity eligibility and insurance cover were stated too broadly. The revised article distinguishes tax years, uses official tax and Labour sources, gives a practical record-checking example, and adds relevant calculator links. A resources-hub link provides another entry point. Its modification date changes because the content was substantively revised; the original publication month remains May 2026.
- The rendered indexing guard now checks whether every sitemap URL can be reached from the homepage through ordinary HTML anchors. It ignores query variants, fragments as separate pages and nofollow links. Applied to the previous build, it failed on exactly the seven URLs above. This complements, rather than replaces, canonical, robots, status and sitemap checks.

These are observed site defects and improvements. The exports do not reveal Google's exact reasons for deferring a crawl or declining to index the checklist, nor Google's selected canonical for the duplicate group. Calculator formulas, canonical routes, intentional query exclusions and existing redirects are preserved.

### Follow-up verification

- `npm run validate`, `npm run lint` and `npm run build` passed. Lint contains only the pre-existing warnings noted above.
- The rendered indexing guard now passes for all **226 of 226** submitted pages, including an internal-link path from the homepage. Both sitemaps and all 26 configured legacy redirects continue to pass.
- A focused rendered-output check confirmed all eight added discovery links, the corrected article text and its matching structured data/modification date.
- The deployment workflow must repeat its full validation, test and build gates, followed by the existing 226-page live HTTP check. No Google indexing result is inferred from these checks.

### After this follow-up deployment

1. Inspect and live-test the updated salaried-finance checklist. After confirming the new content is live and indexing is allowed, request indexing once.
2. Inspect the two loan example URLs; confirm their parent-page links and request indexing once for these newly linked pages if still unindexed.
3. Keep monitoring the other 67 discovered URLs. A **Passed** validation is not proof of indexing. If they remain uncrawled, review Search Console Crawl Stats and host availability; these exports cannot establish a server-capacity or Googlebot-access problem.
4. Finish the duplicate-canonical inspection described above before restarting the failed duplicate validation. Do not restart any validation already in progress.
5. Track the intended pages using **All submitted pages**. Expected exclusions of retired URLs can remain in **All known pages**; zero exclusions is not a valid indexing guarantee.

### URL inventory from the new exports

#### Crawled - currently not indexed (1)

| Path | Reported last crawl | Current HTTP | Destination / action |
|---|---|---|---|
| `/blog/personal-finance-checklist-for-salaried-people` | 2026-06-21 | 200 | Updated article; inspect and request indexing after deployment |

#### Page with redirect (3)

| Path | Reported last crawl | Current HTTP | Destination / action |
|---|---|---|---|
| `/blog/home-loan-eligibility-40000-salary-india` | 2026-09-19 | 301 | /blog/home-loan-eligibility-by-salary-india |
| `/financial-updates/income-tax-regime-comparison` | 2026-09-18 | 301 | /tools/income-tax-calculator-old-vs-new-regime-india |
| `/government-salary-updates/central-government-da-dr-revision-format` | 2026-09-09 | 301 | /government-salary-updates |

#### Excluded by ‘noindex’ tag (8)

| Path | Reported last crawl | Current HTTP | Destination / action |
|---|---|---|---|
| `/government-salary-updates/uttar-pradesh-employee-pay-circular-format` | 2026-08-05 | 301 | /government-salary-updates |
| `/government-salary-updates/assam-state-employee-update-tracker-format` | 2026-07-25 | 301 | /government-salary-updates |
| `/government-salary-updates/odisha-state-da-tracker-format` | 2026-07-24 | 301 | /government-salary-updates |
| `/government-salary-updates/west-bengal-da-tracker-format` | 2026-07-23 | 301 | /government-salary-updates |
| `/government-salary-updates/telangana-employee-pay-update-tracker-layout` | 2026-07-22 | 301 | /government-salary-updates |
| `/government-salary-updates/karnataka-pay-revision-tracker-format` | 2026-07-21 | 301 | /government-salary-updates |
| `/government-salary-updates/maharashtra-salary-update-layout` | 2026-07-20 | 301 | /government-salary-updates |
| `/government-salary-updates/kerala-pension-dr-update-format` | 2026-07-19 | 301 | /government-salary-updates |

#### Not found (404) (5)

| Path | Reported last crawl | Current HTTP | Destination / action |
|---|---|---|---|
| `/financial-updates/government-salary-da-link` | 2026-08-03 | 301 | /financial-updates |
| `/financial-updates/tds-26as-explainer` | 2026-08-02 | 301 | /financial-updates |
| `/financial-updates/personal-finance-epf-explainer` | 2026-07-26 | 301 | /financial-updates |
| `/financial-updates/rbi-repo-rate-explainer` | 2026-07-26 | 301 | /financial-updates |
| `/financial-updates/sebi-mutual-fund-explainer` | 2026-07-25 | 301 | /financial-updates |

#### Discovered - currently not indexed (69)

- `/8th-pay-commission/level-11`
- `/8th-pay-commission/level-12`
- `/8th-pay-commission/level-13`
- `/8th-pay-commission/level-14`
- `/8th-pay-commission/level-8`
- `/8th-pay-commission/level-9`
- `/blog/build-better-money-habits`
- `/blog/capital-gains-tax-changes-2026-equity-investors-india`
- `/blog/cashback-vs-rewards-credit-cards-india`
- `/blog/epf-vs-nps-vs-ppf-retirement-india`
- `/blog/fcra-2-0-india-2026-explained`
- `/blog/fy-2026-27-money-moves-salaried-indians-mid-year-checklist`
- `/blog/gold-asset-class-sgb-etf-physical-gold-loan-india-2026`
- `/blog/gst-small-business-freelancers-registration-composition-india`
- `/blog/itr-late-filing-penalty-interest-india-fy-2026-27`
- `/blog/nri-taxation-basics-residency-taxable-income-india`
- `/blog/robo-advisors-vs-diy-index-investing-india`
- `/blog/salary-hike-negotiation-beyond-base-pay-india`
- `/blog/section-44ada-presumptive-taxation-freelancers-india`
- `/blog/tds-fixed-deposit-interest-form-15g-15h-india`
- `/corrections-policy`
- `/editorial-policy`
- `/financial-updates/epfo-vishwas-amnesty-2026-live`
- `/guides/basic-below-50-percent-ctc-what-changes`
- `/guides/does-da-merge-reduce-8th-cpc-benefit`
- `/guides/does-employer-pf-rise-under-new-wage-code`
- `/guides/how-8th-cpc-arrears-are-calculated`
- `/guides/is-gratuity-higher-under-new-wage-code`
- `/guides/why-my-take-home-fell-after-labour-codes`
- `/nri`
- `/privacy-policy`
- `/terms`
- `/tool-hubs`
- `/tool-hubs/government-pension`
- `/tool-hubs/investing-markets`
- `/tool-hubs/life-stage-planning`
- `/tool-hubs/loans-emi`
- `/tool-hubs/small-savings`
- `/tool-hubs/tax-compliance`
- `/tools/child-education-cost-planner-india`
- `/tools/credit-card-minimum-due-trap-calculator-india`
- `/tools/credit-card-vs-personal-loan-calculator-india`
- `/tools/elss-lock-in-vs-80c-options-calculator-india`
- `/tools/emi-calculator-india`
- `/tools/epf-corpus-calculator-india`
- `/tools/epf-taxable-interest-rule-9d-calculator-india`
- `/tools/gratuity-calculator-india`
- `/tools/health-insurance-coverage-adequacy-calculator-india`
- `/tools/index-fund-vs-active-fund-cost-calculator-india`
- `/tools/inherited-property-capital-gains-calculator-india`
- `/tools/mutual-fund-calculator-india`
- `/tools/notional-increment-pension-calculator-india`
- `/tools/nps-tier-2-vs-mutual-fund-calculator-india`
- `/tools/ops-vs-nps-pension-comparison-calculator-india`
- `/tools/pension-commutation-calculator-india`
- `/tools/post-office-monthly-income-scheme-calculator-india`
- `/tools/recurring-deposit-calculator-india`
- `/tools/rent-agreement-stamp-duty-registration-cost-calculator-india`
- `/tools/retirement-calculator-india`
- `/tools/room-rent-proportionate-deduction-calculator-india`
- `/tools/scenarios/personal-loan-eligibility-25000-salary`
- `/tools/scenarios/personal-loan-emi-10-lakh-5-years`
- `/tools/scss-calculator-india`
- `/tools/sovereign-gold-bond-vs-physical-gold-calculator-india`
- `/tools/stock-portfolio-calculator-india`
- `/tools/term-life-insurance-cover-calculator-india`
- `/tools/two-wheeler-loan-emi-calculator-india`
- `/tools/wedding-cost-planner-india`
- `/tools/xirr-portfolio-return-calculator-india`
