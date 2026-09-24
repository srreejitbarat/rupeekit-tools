# Issue #129 Discover image audit

Date: 2026-08-26

## Finding

Issue #129 was written against a larger policy-lane page inventory than the current `main` branch actually contains.

On the current branch:

- `data/policy-tools-2026.json` is not present.
- `/deadlines` is not present in `app/sitemap.ts` or as an app route.
- `/8th-pay-commission/level-*` routes are not present; only the `/8th-pay-commission` hub is currently public.
- The six policy-guide slugs listed in issue #129 are not present in `data/calculator-guides.ts`.
- The 34 legacy calculator guides are present, indexable, emitted by `app/sitemap.ts`, and previously had no Discover-image binding.

Adding manifest rows for routes that do not exist would be unsafe: the rendered Discover validator requires prerendered HTML for every mapped page and would correctly fail the build.

## Implemented coverage

This change covers all 34 currently indexable calculator guides using reviewed, existing 1600x900 Discover assets from their parent calculator clusters.

The reuse is deliberate and follows the issue's own P2 recommendation to avoid commissioning near-identical images for low-volume guide variants. Each guide now receives the cluster image in:

- the visible page hero,
- Open Graph metadata,
- Twitter large-image metadata,
- Article structured data, and
- `/image-sitemap.xml`.

The cluster mapping is centralized in `data/discover-guide-clusters.json` so reuse is explicit and auditable.

## Validator hardening

A new source-driven validation lane now:

- discovers every guide from `data/calculator-guides.ts`,
- requires every guide cluster to have an approved Discover image mapping,
- requires reused sources to already exist in the reviewed base Discover manifest,
- verifies 40-160 character alt text,
- verifies the guide page wires the image into hero/metadata/schema,
- validates rendered HTML and image-sitemap output after build,
- checks `data/policy-tools-2026.json` automatically when that dataset is introduced.

The last point closes the validator loophole called out in issue #129 without inventing a file or routes that are not on `main`.

## Deferred issue rows

The issue's 7 policy calculators, `/deadlines`, 14 pay-level pages, and 6 policy guides should receive their bespoke P0/P1 images only after the corresponding public routes/data land on `main`. At that point the policy-tool validator automatically becomes active, and the new routes can be added to the preferred-image/creative-brief inventory with human-reviewed assets.

## Human-review safety

No new AI-generated image is introduced by this PR. It reuses already-reviewed RupeeKit Discover assets, avoiding broken text, fake bank/government branding, invented documents, or misleading financial figures.
