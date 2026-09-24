# RupeeKit GSC / GA4 reporting pipeline

Last reviewed: 12 August 2026

## Purpose

`scripts/gsc-report.mjs` creates the canonical page-level Search Console report used by the measurement programme. Site-wide clicks, impressions, CTR and average position must come from the **page** dimension. Query-level exports are useful for intent research, but they are not authoritative for site totals because anonymised-query filtering can omit a large share of traffic.

The report contains:

- clicks, impressions, CTR and impression-weighted average position;
- position bands: 1–3, 4–10, 11–30 and 31+;
- top 25 pages by impressions;
- zero-click pages with at least 50 impressions;
- an automatic comparison with the immediately preceding equal-length period;
- optional GA4 totals when the same service account has access to the GA4 property.

Reports are written to `automation/reports/gsc/YYYY-MM-DD.json`. The date in the filename is the report's `asOfDate`, which can be later than the GSC data end date because Search Console data normally settles with a delay.

## Service-account setup

Create or reuse a Google Cloud service account and enable the Google Search Console API. Add the service-account email as a user/owner with sufficient access to the RupeeKit Search Console property. Store credentials only in environment variables; never commit the JSON key file.

Required variables:

```text
GSC_SITE_URL=sc-domain:rupeekit.co.in
GSC_CLIENT_EMAIL=<service-account-email>
GSC_PRIVATE_KEY=<private-key-with-escaped-newlines>
```

Optional GA4 seam:

```text
GA4_PROPERTY_ID=<numeric-property-id>
```

To include GA4 totals, enable the Google Analytics Data API and grant the same service account Viewer access to the GA4 property. If `GA4_PROPERTY_ID` is absent, or the property is inaccessible, the GSC report remains valid and the GA4 section records `not-configured` or `unavailable` instead of inventing zeros.

## Run a report

Example for a 28-day settled window ending 9 August, produced on 12 August:

```bash
npm run report:gsc -- --start 2026-07-13 --end 2026-08-09 --as-of 2026-08-12
```

The script queries the preceding equal-length period automatically, so the resulting JSON includes a week-over-week / previous-period diff without a second command.

## Failure behaviour

The script intentionally exits non-zero before making an API request when any required `GSC_*` variable is missing. An empty report must never be interpreted as zero traffic.

Search Console API errors also fail the command. GA4 is optional: a GA4 permission/API problem is recorded as an unavailable optional section and does not invalidate the authoritative GSC report.

## 12 August baseline note

The repository contains `automation/reports/gsc/2026-08-12.json` as a bootstrap baseline record. The live Search Console service-account credentials were not available in the automation environment that implemented issue #65, and the connected GSC Wizard endpoint returned `payment_required`, so a fresh page-level API pull could not be truthfully generated during implementation.

The committed bootstrap file therefore preserves only the authoritative 4 July–5 August figures already recorded in issue #57 and explicitly marks unavailable KPI subdivisions as `null`. It must be replaced by running the command above (or the appropriate settled date range) once `GSC_*` credentials are configured. Do not fill missing bands or top-page rows by inference.

## Data rules

1. Site-wide CTR is always `sum(page clicks) / sum(page impressions)`.
2. Average position is impression-weighted across page rows.
3. Position bands classify each page by that page row's average position.
4. Query rows are never used to calculate the site-wide KPI table.
5. `0` means a measured zero. Unknown or unavailable bootstrap fields use `null`; they are never silently converted to zero.
