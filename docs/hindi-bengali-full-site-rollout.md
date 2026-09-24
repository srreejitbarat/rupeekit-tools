# Complete Hindi and Bengali rollout — draft, 24 September 2026

**Not deployed. Translation completion and review are still required.**

The user requested every calculator, result, blog, guide and other public page in Hindi and Bengali. The existing release translated only the homepages and calculator directories. This draft prepares all 222 canonical English pages for matching `/hi` and `/bn` pages (666 canonical pages in total).

## Implementation prepared

- `scripts/i18n/generate.mjs` generates localized presentation modules from 151 shared React sources. The original calculation libraries, formula expressions, field values, option identifiers and API contracts remain shared. Generated modules are ignored by Git and regenerated before tests, typechecking and builds.
- `lib/i18n/translator.tsx` translates displayed strings, interpolated results, accessible labels, rich text, internal links, metadata and structured data. Numeric interpolation values are retained. Rich-text interpolation elements receive stable keys.
- The canonical route registry, reciprocal `en-IN` / `hi-IN` / `bn-IN` / `x-default` metadata, regular sitemap and image sitemap cover the full page set.
- Parameterized Hindi and Bengali calculator URLs receive the same `noindex, follow` header as English shared scenarios. The clean calculator URLs remain canonical and indexable.
- Browser PDF documents use bundled Noto Sans Devanagari / Bengali fonts under the included SIL Open Font License. CSV cells and SVG chart text have presentation adapters. Machine-readable JSON plan keys remain stable.
- The server pre-EMI PDF endpoint accepts `?lang=hi` / `?lang=bn`; its validation, privacy headers and concurrency limits remain in place.
- `npm run validate:translations` and the production `prebuild` step reject incomplete catalogs and broken interpolation placeholders. The rendered language gate checks every canonical page, translated headings and remaining English prose.

## Current blocker and approval scope

Automatic approval review rejected the bulk translation operation because approximately 1.27 million characters had been extracted from the private repository and could include unpublished content. The operation would disclose that text to Google Translate (`translate.googleapis.com`).

A narrower attempt used only visible text from previously fetched HTTP-200 public production pages. It created partial catalogs before network approval was cancelled. Those catalogs are checkpoints, not reviewed finished translations. No translation service runs in the deployed application.

Finishing the bulk step requires explicit authorization to send the extracted English display strings, including unpublished page/UI copy, to Google Translate. The candidate list is generated locally at `lib/i18n/catalogs/sources.json`; no account data, entered calculator values or credentials are needed for this work. Remaining copy can alternatively be translated and reviewed locally.

## Verification and remaining release work

- 556 tests passed, including comparison of input definitions and default currency results across the 74 calculator entries in English, Hindi and Bengali.
- TypeScript passed. Lint passed with the existing hook-dependency and image warnings repeated in generated variants.
- Existing content/accessibility/SEO validation passed after teaching two source checks to recognize the canonical helper.
- A local compilation of the generated route set was performed to check the architecture. This does not satisfy the translation release gate.
- Full translation coverage, terminology and protected-number review, expanded interactive checks, final PDF layout checks, rendered language validation and production verification remain required.

Keep this PR as a draft. Do not merge or deploy while `npm run validate:translations` fails. The prior GSC fixes remain on production main.
