# Local SEO, AEO and editorial audit — 24 September 2026

Follow-up fixes and current validation status: [translation-fixes-and-revalidation-2026-09-24.md](translation-fixes-and-revalidation-2026-09-24.md). The counts and 13 failures below describe the earlier audit baseline.

**Final local follow-up:** Hindi and Bengali catalogs now pass at 14,445/14,445 messages each. The local production build and post-build gates pass; 666 localized pages have correct language metadata and no untranslated prose. The full suite passes 570/570 tests. No Vercel build, deployment, commit or push was made.

## Outcome

Audited all **222 canonical routes in English, Hindi and Bengali: 666 unique URLs**, before and after changes. All 666 final local responses returned HTTP 200. Rechecked the article family after removing automatic heading/answer rewrites, then rechecked five updated heading routes in all languages.

The translation completeness and rendered-language gates now pass. This audit is still an automated page inventory plus focused editorial review, not a native-language or financial fact-check of every sentence. The user supplied Google-translated workbooks; all imports and checks were local. No content was sent to Vercel, and no push, merge or deployment occurred.

## Does it look AI-written?

There is clear evidence of automated presentation and damaged translation output, and several passages sound generic or overstated. That does not establish whether an AI wrote every source article. No AI-authorship score is claimed.

Examples found and fixed:

| Before | Why it needed attention | Change |
|---|---|---|
| “Answer Engine Summary” | Exposes an optimization term rather than telling the reader what the section contains | “At a glance”, “एक नज़र में”, “এক নজরে” |
| “Personal finance is 80% behavior and only 20% knowledge” | Unsupported numeric claim used as a hook | Concrete advice to choose one repeatable routine |
| “single most effective way”, “giving your money a job” | Broad claim and familiar slogan where a useful opening would be clearer | Start with banked income, bills, spending and a realistic savings amount |
| “What should you know about …?” and “What is the key takeaway from …?” | Created automatically from headings; sometimes grammatically awkward and partly untranslated | Preserve authored headings and explicitly written answer boxes |
| Short descriptions padded with “Includes practical Indian context…” | Repeated generic wording, sometimes cut off mid-sentence | Preserve the complete page-specific description |
| Hindi title containing 1,987 characters and `[आरके_1]`-style markers | Several translated messages incorrectly stored as one title | Replaced all six corrupted entries with matching translations |
| Visible `&apos;` in localized prose | JSX entities were used as literal translation keys | Decode JSX entities once during extraction and generation |

Sixteen passage/description/answer revisions were applied across eight articles: monthly budgeting, the 50/30/20 rule, beginner finance books, tracking expenses, saving versus investing, family expenses, debt repayment, and money habits. Each revision has corresponding Hindi and Bengali text. The exact revisions are in [editorial-rewrites-2026-09-24.json](editorial-rewrites-2026-09-24.json).

## Page-level results

Counts below are **pages flagged**, not counts of bad sentences. English-prose detection is a review heuristic; acronyms, official names and quotations can be legitimate. Native-script presence in metadata does not prove a good translation.

| Check | Hindi before → after | Bengali before → after |
|---|---:|---:|
| Title lacks native-language text | 211 → 197 | 56 → 42 |
| Description lacks native-language text | 195 → 180 | 45 → 18 |
| H1 lacks native-language text | 127 → 122 | 8 → 0 |
| Pages with long English prose nodes | 213 → 213 | 194 → 187 |
| Visible entity/batch-marker artifacts | 27 → 0 | 21 → 0 |

The narrow editorial-style scan found 132 affected pages per language before the changes, predominantly from the shared summary label. It finds zero after the changes. This is **not** a claim that every remaining sentence is natural or that every page passed a human editorial review.

All final URLs have one H1, a title, a description, a matching self-canonical path, en/hi/bn alternates with the expected paths, the expected document language, and at least one parseable JSON-LD block. No duplicate titles or descriptions were found within a language. These checks establish basic structure, not schema completeness, rich-result eligibility, Google indexing or rankings.

Two English, two Hindi and three Bengali titles exceed the audit's 100-character review threshold. They remain in the page report for editorial review. Character limits are review aids, not Google eligibility rules.

Four Bengali pages still include substantial Hindi passages: the FCRA article, EMI calculator, income-tax calculator and SIP calculator. Some are inherited Hindi FAQ/explanation sections. They need deliberately written Bengali equivalents. The baseline script initially counted Bengali danda punctuation as Hindi; that heuristic was corrected for the final audit. Do not compare the baseline `other-language-prose-review` count with the final count.

## Changes to shared behavior

- Preserved complete descriptions instead of adding generic filler or cutting at 160 characters. Description-length validators now warn rather than force padding; empty descriptions still fail.
- Removed automatic article-heading questionization and automatic introductory-sentence answer/summary creation. Authored answer blocks remain. This also avoids accidentally splitting decimal values when extracting a sentence.
- Renamed the visible answer-summary heading without changing its existing anchor ID.
- Decoded JSX entities consistently in extraction and generation, including relevant JSX attributes.
- Added release checks for leftover batch/protection markers, in addition to interpolation-slot checks.
- Fixed desktop and mobile Money Health Check links to retain the selected language.
- Added clear native-language pay-commission metadata templates and five previously English-only Bengali headings, preserving the source's unofficial/scenario caveats.
- Retained the Windows path fixes from the preceding local-translation check.

## Remaining editorial follow-up

The earlier missing-message counts below are historical; the catalogs are now complete at 14,445/14,445 for both languages. Completeness checks measure coverage, not translation quality.

The current extractor also collects some technical literals, including formula strings. These are the gate's candidate counts, not counts of untranslated visible paragraphs. Do not translate formula identifiers simply to satisfy the inventory; separate those from display copy when completing the catalogs.

The blog source validator reports 87 advisory warnings across 42 source post objects, including article-specific sourcing/methodology gaps and absent authored answer boxes. Some source objects are not current canonical article routes. Warnings should be reviewed in context; adding a generic question or unrelated official-source link simply to satisfy a check would not help readers.

Priority order:

1. Have a fluent Hindi and Bengali reviewer check idiom and financial meaning, especially high-impact tax and legal copy. Automated checks cannot certify this.
2. Review current finance/tax claims against official sources; no tax thresholds, rates or legal eligibility rules were independently recertified in this editorial pass.
3. Address the 87 non-blocking blog-quality warnings when the article has a real search need for a Q&A heading, practical example or article-specific source. Avoid generic additions made only to satisfy lint.
4. Check the advisory legacy metadata items against Search Console performance before rewriting titles or descriptions.

## Evidence and reproduction

Validation completed:

- TypeScript (`npx tsc --noEmit`) passed after the final edits.
- Lint passed with warnings; the full output is in [the lint log](../artifacts/editorial-lint.log).
- All 34 focused tests for routing, language selection, translation adapters, entity decoding, catalog validation, descriptions and authored article preservation passed.
- Including all 74 calculator language-comparison cases: **95 passed, 13 failed out of 108**. The 13 failures are confined to the existing whole-page currency-text snapshot suite; input definitions matched in the reported diffs. Twelve were present before this work. The additional salary-page failure was traced to a now-translated disclaimer: English `₹50 Lakhs` becomes Bengali `50 লক্ষ টাকা`, which the rupee-symbol-only regex misses. This explains that added failure without claiming all 12 earlier failures are harmless. The suite was not weakened to obtain a pass. See [test results](../artifacts/editorial-tests.json).
- SEO/AEO readiness, structured-data source binding, blog quality, content metadata and internal-link checks passed their blocking checks. Blog quality retains 87 advisory warnings. Internal-link validation covers 74 live tools and 39 canonical blog pages and reports no tools without contextual inbound discovery.
- Final local translation validation reports 14,445/14,445 messages for each locale with no missing or invalid entries. The production build generated 681 pages; the 666-page rendered language check, tool SERP check, Discover checks, direct-answer checks, PDF font trace and indexing check passed.
- The full test suite passes 570/570 tests across 63 files, and TypeScript passes. Lint/build still display pre-existing `<img>` and React hook dependency warnings.
- Browser review confirmed the rewritten Bengali budget introduction, native summary label and restored natural section heading. The local preview is at http://127.0.0.1:3010/bn/blog/how-to-create-a-monthly-budget.

- [Per-page final CSV](../artifacts/editorial-audit-after/pages.csv): one row per URL, language, HTTP status, title and flags.
- [Detailed final JSON](../artifacts/editorial-audit-after/pages.json): descriptions, headings, canonical URLs, alternates and examples.
- [Baseline summary](../artifacts/editorial-audit-before/summary.json) and [final summary](../artifacts/editorial-audit-after/summary.json).
- [Catalog edits](editorial-catalog-fixes-2026-09-24.json) and [passage edits](editorial-rewrites-2026-09-24.json).
- [Blog warnings](../artifacts/editorial-blog-validation.log) and [metadata validation](../artifacts/editorial-content-validation.log).

With the local server running:

```powershell
npm run audit:editorial -- artifacts/editorial-audit
npm run validate:ai-seo
npm run validate:blog-seo
npm run validate:content-seo
npm run validate:translations
```

The crawler only accepts localhost URLs. A few development requests failed transiently during compilation; affected URLs were rechecked, and all final responses were successful. Local development responses do not establish production crawlability or live search performance.

## Standards used

Google recommends useful, reliable, people-first content regardless of how it was produced: [helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [AI-content guidance](https://developers.google.com/search/blog/2023/02/google-search-and-ai-content). Its [snippet documentation](https://developers.google.com/search/docs/appearance/snippet) recommends specific, descriptive summaries and explains that display length depends on the device. These support removing generic filler, not promising a ranking improvement.
