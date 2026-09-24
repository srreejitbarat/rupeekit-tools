# RupeeKit measurement loop — 9 September 2026

Issue #146 restores a repeatable measurement path without reconstructing missing data.

## Supported paths

### 1. Service-account API path

`npm run report:gsc -- --start YYYY-MM-DD --end YYYY-MM-DD --as-of YYYY-MM-DD`

Required environment variables: `GSC_SITE_URL`, `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY`. Optional `GA4_PROPERTY_ID` adds GA4 totals when the same service account has GA4 access. Secrets must stay outside the repository.

### 2. Browser-export fallback

Use this when API credentials are unavailable:

```bash
npm run report:measurement -- \
  --gsc-chart /path/to/Chart.csv \
  --gsc-pages /path/to/Pages.csv \
  --ga4-pages /path/to/Pages_and_screens_Page_path_and_screen_class.csv \
  --as-of 2026-09-08
```

The command copies raw inputs into `automation/reports/measurement/<as-of>/raw/` and writes `summary.json`. By default it exits non-zero unless the export is a complete 28-day window and the required GA4 metrics are available. `--allow-partial` is only for preserving diagnostic snapshots; a partial report is never authoritative.

## Data rules

- GSC headline totals come from the date-level `Chart.csv`, not by summing query rows or page rows.
- Page rows are retained for page-level analysis only.
- A query export must never be used to reconstruct site totals.
- GA4 page-level active users and average engagement time are non-additive and are never summed.
- The Day-38 GA4 readout requires sessions, engaged sessions, calculator completion, contextual/generic CTA clicks, key events and revenue. A Pages & Screens export alone does not contain all of those metrics.
- No raw input should contain user-entered salary, loan, tax, PAN/Aadhaar, bank or email values.

## Current diagnostic snapshot

The fresh exports available on 8 September 2026 cover **31 August–8 September 2026 (9 days)**, not the required trailing 28 days. The GSC chart records 19 clicks and 18,719 impressions for that 9-day window. The GA4 Pages & Screens export contains page views/event counts/key events/revenue but not sessions, engaged sessions, calculator-completion counts or CTA-click breakdowns.

Therefore the current snapshot is useful for validating ingestion but **cannot complete the Day-36/Day-38 measurement verdict**. It must remain marked partial.

## Manual prerequisites to finish #146

1. In Google Search Console, export **Performance → Search results → Pages** for the latest settled trailing 28 days, with the matching Chart.csv.
2. In GA4, export the same settled 28-day period for the Overview metrics and an Events breakdown that includes `calculation_completed` (or the deployed calculator completion event) and `tool_cta_click`.
3. Run the importer without `--allow-partial`; a successful exit is the signal that the input window is complete enough for the next-day verdict.
4. Keep credentials and API keys out of Git. The existing service-account path can be used instead when `GSC_*` and `GA4_PROPERTY_ID` are configured securely.

## Search Console indexing action

None. This issue changes measurement infrastructure only. Do not request indexing for any URL because of this change.
