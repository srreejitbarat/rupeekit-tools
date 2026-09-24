# Translation fixes and local revalidation — 24 September 2026

## Status

The Bengali-first and Hindi translation work is complete in the local catalogs. The translation gate reports **14,445/14,445 messages for each locale**, with no missing entries or invalid placeholders. A clean local production build generated 681 pages and passed its rendered language, SERP, Discover, direct-answer and indexing gates. Those checks covered 666 localized URLs with no untranslated prose. The full test suite passes **570/570 tests across 63 files**.

Work is on local branch `codex/local-full-translation-check`. The user supplied Google-translated workbooks; imports and validation ran locally. No Vercel connection, cloud build, commit, push, merge or deployment was used.

## Bengali-first continuation

The user requested Bengali completion before Hindi. An additional 222 manually reviewed Bengali messages were applied from the two `docs/bengali-reviewed-*.json` files. Extraction now excludes several technical fields and recognizes whitespace-only JSX expressions as spaces instead of interpolation values. Exact, unambiguous typography variants reused 26 existing translations.

The next Bengali-only crawl checked all 222 paths: all returned HTTP 200. It flagged 147 pages for remaining English prose, four long titles and five long descriptions. This crawl preceded the latest 92 interface translations and nested-label-list fix, so it is an intermediate baseline, not final verification. Its complete English text samples are retained in `artifacts/bengali-completion-audit`.

The presentation adapter translates known calculator labels and nested template values while preserving unknown prose and numeric amounts. The language gate also checks headings, canonicals and alternates on all 666 URLs. It found and fixed several display strings embedded in calculator data, including GST categories, gratuity formulas, PPF/EPF formulas and the emergency-fund buffer label.

Google Translate preparation produced a 1,702-row workbook covering missing extracted messages and additional rendered fragments. These overlap and include technical candidates needing classification; 1,702 is not an untranslated-page count. The source map retains exact lookup keys. Chrome blocks automated file selection, so the user selected the file. Google rejected the initial artifact-exported XLSX. Standardizing its content types and shared-string packaging preserved every cell and made it compatible; the user uploaded that corrected workbook and Google completed the translation.

All 1,702 output IDs matched the source map. Initial checks flagged 146 entries: one missing placeholder, 142 numeric representation differences, and three entries without Bengali. Of these, 115 numeric flags were explainable by matching Bengali number words/ordinals. Other flags included equivalent million/lakh conversions, 24-hour/12-hour clock notation and repeated translated/Latin abbreviations. Two entries were CSS/analytics code and were excluded from extraction and import; the remaining script-free entry was the legitimate dynamic label `ZXQ0QXZ% SIP`.

Imported 1,700 translations with targeted editorial corrections, including the dropped PF percentage, AY versus Tax Year distinction, a debt balance mistranslated as a repayment instruction, NRO remittance direction, resident-only disclosure wording and Section 111A corrupted to I11A. Currency labels retain the original ₹ format for calculator comparisons. Nine lengthy metadata entries were shortened. Drafts, checks, ID mappings and corrections are retained under `artifacts/google-translation`; the explicit corrections are in `docs/bengali-google-review-fixes.json`.

The current Bengali catalog covers **14,445/14,445 messages**. The final local crawl checked all 222 Bengali routes, including all 39 articles; the production rendered-language gate checked Bengali and Hindi pages alongside English pages. The full suite passes **570/570 across 63 files**, and TypeScript passes. An earlier concurrent run had two tour-test timeouts; the final isolated full-suite rerun passed.

The Hindi workbook contained 14,027 rows, including 78 rows no longer present in the current source catalog. I imported the 13,949 current source matches, reviewed flagged rows and applied targeted fixes for truncated text, placeholders, dates, quantities, code paths and calculator labels. Supplemental visible-copy translations close the rendered strings absent from the extractor's source inventory. The final gate reports 14,445 translated messages for Hindi and Bengali.

This closes the measured Bengali translation coverage gap; it is automated coverage verification and targeted language review, not certification of every sentence by a native-language editor. Existing financial claims were not independently reverified site-wide; for example, source text still contains inconsistent 8th CPC dates and an old tax illustration. Those source-content issues are separate from translation fidelity and must not be presented as freshly verified advice.

Earlier baseline counts in the remainder of this file are retained as historical notes; the status and verification results above are final for this local run.

## Fixes

- Currency snapshots now read individual DOM text nodes, so adjacent list numbers and punctuation cannot become part of a displayed amount. A regression test confirms that a real amount change still fails. Input values, limits, options and amounts remain checked for all 74 calculators.
- Repaired misdecoded rupee, multiplication, subtraction and punctuation characters in shared data and matching translation keys. Standardized the affected Bengali calculator currency labels without changing financial values or calculation formulas.
- Hindi-only strings now reach the Bengali dictionary. Added 20 Bengali calculator FAQ messages and eight Bengali messages for the FCRA article. Dated statements in the FCRA translation remain tied to the article's review date; this work is not a fresh legal-status verification.
- Metadata can find an existing translation after deterministic SEO title shortening. Ambiguous matches are not guessed. Specific title templates take precedence over generic site-name suffixes.
- Financial-update descriptions retain their complete summaries. Added Bengali titles, descriptions and shared metadata patterns, plus Hindi hub and money-guide title translations.
- Replaced four passages about “searchers”, “search intent” and “search demand” with direct explanations for readers, with matching Hindi and Bengali versions.
- Generated files are no longer rewritten when unchanged. Bounded retries handle transient Windows file locks.

## What the audit means

The route inventory is 222 canonical paths in English, Hindi and Bengali: 666 URLs, including 39 canonical blog articles. The audit reads rendered HTML on localhost and checks response status, metadata, heading count, canonical and alternate URLs, document language, JSON-LD parsing, duplicate metadata, visible encoding/protection markers, narrow AI meta-copy phrases and several generic-writing patterns. Headers and footers are included.

This is an automated coverage audit with targeted editorial review. It cannot prove authorship or certify that every sentence sounds natural. Legitimate acronyms and English product names can trigger the untranslated-prose heuristic. Financial rules and current rates were not independently reverified across the entire site.

All **666 distinct URLs returned HTTP 200**, including **117 article URLs** (39 articles in three languages). All had the expected heading count, metadata, canonical paths, alternate-language paths and parseable structured data. No duplicate titles/descriptions, mixed Hindi passages on Bengali pages, broken translation markers, narrow AI meta-copy matches or configured generic-writing matches remained.

| Rendered-page check | Hindi | Bengali |
|---|---:|---:|
| Titles without the expected script | 170 | 0 |
| Descriptions without the expected script | 180 | 0 |
| H1 headings without the expected script | 122 | 0 |
| Pages flagged for English prose review | 213 | 187 |

TypeScript and the local production build passed. AI SEO readiness, structured-data binding, rendered SERP rules, language rendering and indexing checks passed. The blog quality audit has 87 non-blocking editorial warnings across 42 source objects, mainly missing authored Q&A headings, examples or article-specific sources; it does not recommend adding generic filler. Content metadata validation also retains advisory review items for legacy records. The full local editorial crawl reported no configured AI boilerplate, translation artifact or metadata flags.

## Remaining translation work

The final extractor reports 14,366 unique source messages; 79 additional website-visible strings are covered through reviewed supplemental entries. Both locale catalogs have zero missing messages and zero invalid placeholder or batch-marker entries. The rendered language check scans the built pages as well as the catalog.

A local Argos/CTranslate2 experiment produced Hindi drafts under `artifacts/local-translation`. None were imported into the website. Review found wrong terminology, modified links and awkward phrasing even among drafts that preserved numbers and placeholders. Those drafts are **unreviewed, unsuitable for publication and not evidence that the translation gap is closed**. The experiment also encountered a Windows file-lock error while saving. The downloaded models remain in the ignored `node_modules/.cache/local-translation` directory.

The final page-level inventory is in `artifacts/editorial-final/pages.csv`; its machine-readable counterpart is `pages.json`, with aggregate findings in `summary.json`. The earlier `editorial-revalidation` directory records the first completed 666-page pass before the last metadata corrections. Test and validation logs are in `artifacts`.

The production build and rendered gates pass locally. No cloud build or deployment was performed.
