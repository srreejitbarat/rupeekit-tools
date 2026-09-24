# Local translation check — 24 September 2026

Checked upstream/codex/full-hindi-bengali-localization at e211980 on local branch codex/local-full-translation-check. The original main branch was preserved. No cloud execution, translation-service requests, deployment, or push was performed.

## Local fix

The extractor and generator used platform-dependent path.join while matching forward-slash paths. On Windows this breaks directory exclusions, generated import routing, and page classification. Both walkers now use path.posix.join. Generation produced the expected 151 shared-source modules; extraction remained stable at 15,171 messages after generation.

## Results

- npm ci --no-audit --no-fund completed.
- npx tsc --noEmit passed. The old branch's .next cache initially referenced removed routes; it was preserved under node_modules/.cache/next-before-translation-check before rechecking.
- npm run validate:translations correctly failed: Hindi 376/15,171 present (14,795 missing); Bengali 13,264/15,171 present (1,907 missing). Presence is not a quality score.
- Six Hindi catalog entries contain leftover batch/protection markers. The first title maps to 1,987 characters containing many unrelated labels. The current placeholder gate does not detect this corruption.
- Full test run: 531 passed, 12 failed, plus one worker startup timeout for LanguageSwitcher.test.tsx. All 12 failures are Bengali currency-text snapshot comparisons in calculators-localized.test.tsx. The whole-body textContent/regex approach merges adjacent numbers and includes translated prose; these failures alone do not prove engine errors. They still need investigation, including genuine currency/number preservation.
- Focused rerun with one worker: all 25 tests passed across LanguageSwitcher.test.tsx, routing.test.ts and translator.test.tsx, resolving the worker timeout.
- Local Bengali SIP route returned HTTP 200. Browser inspection confirmed Bengali headings, labels and results. Changing monthly SIP from 10,000 to 5,000 changed total contributions from 12,00,000 to 6,00,000 and future value from 23,23,391 to 11,61,695 at the default 12%/10 years.
- The same page retains English explanations (including the result narrative and delay heading), English units, Hindi FAQ questions, and an English-destination money-health-check header link. Full translation is not ready.

## Reproduce

```powershell
npm ci --no-audit --no-fund
npm run validate:translations
npm run generate:languages
npx tsc --noEmit
npx vitest run components/i18n/LanguageSwitcher.test.tsx lib/i18n/routing.test.ts lib/i18n/translator.test.tsx --maxWorkers=1
npx vitest run lib/i18n/calculators-localized.test.tsx --maxWorkers=1
npm run dev -- --hostname 127.0.0.1 --port 3010
```

Preview: http://127.0.0.1:3010/bn/tools/sip-calculator-india and http://127.0.0.1:3010/hi/tools/sip-calculator-india. The Bengali route was browser-checked; the Hindi URL is provided for follow-up review.

Production build/render gates and PDF visual checks were not completed because catalogs remain incomplete. Keep the existing release gate. Remaining work is catalog completion and language review, batch-marker validation, currency-test diagnosis, then full rendered-page and download checks.
