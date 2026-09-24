# Google Discover image research and first-24 rollout

Research date: 17 July 2026

Market: India

Inputs: settled Google Search Console performance through 13 July 2026, Google Trends comparisons, and Google Search Central Discover guidance.

## Decision

RupeeKit will use original, human-led editorial hero imagery that shows a recognisable Indian money decision. Calculator screenshots, currency piles, text-heavy thumbnails, fabricated official documents, and exaggerated wealth or distress are excluded.

Generic logo-only creatives remain excluded. A small RupeeKit brand mark may appear as a secondary element where the page-specific creative policy requires it, but the image must still communicate the underlying financial decision without depending on the logo.

### Decision-calculator branding policy

The ten decision calculators introduced in the PR #39 batch deliberately use branded Discover artwork. Each live canonical page from that batch must include the **RupeeKit logo** from an approved repository asset, kept legible and unobscured while remaining visually secondary to the page-specific scene. The logo is a brand signature, not a watermark, and must not cover a person, chart, document, result, or other meaningful subject.

If a later SEO consolidation retires one of those ten URLs, the retired URL must not keep or regain a standalone Discover manifest entry merely to satisfy this historical batch count. Its surviving canonical page carries the current image requirement instead.

Approved logo assets for this batch are:

- `public/brand/rupeekit_logo_horizontal_transparent.png`
- `public/brand/rupeekit_icon_from_social_logo_transparent_square.png`
- `public/brand/rupeekit_logo_transparent_full.png`

The branded direction does not relax the quality rules below: each live calculator still needs a unique 1600 × 900 WebP, descriptive alt text, a distinct composition, and a page-relevant financial story. Recolouring one template ten times or using the RupeeKit logo as the main visual is not acceptable.

Every rollout image is:

- 1600 × 900 pixels (16:9), comfortably above Google's 1200-pixel large-image threshold.
- A compressed WebP served from the same RupeeKit origin.
- Visible on the page and connected to Open Graph, Twitter card and relevant structured-data image fields.
- Unique to one canonical URL, with descriptive alt text and a crop-safe central subject, except for explicitly documented reusable parent-topic imagery elsewhere in the manifest.
- Generated as an original editorial asset and reviewed for third-party logos, private data, misleading claims and obvious visual defects.
- For the PR #39 decision-calculator batch, additionally reviewed to ensure the RupeeKit logo is present, legible, unobscured and secondary to the main scene.

## What the trend research changed

Google Trends comparisons for India showed substantially stronger current interest around mutual funds, personal loans, home loans, gold loans, SIP planning and the 8th Pay Commission than around generic calculator language. Rising related searches also included FY 2026-27 tax calculations, how much emergency fund to keep, best home-loan rates, NPS changes, PPF interest rates and capital-gains updates.

That evidence led to five creative patterns:

1. **Affordability decisions:** a real person or couple comparing EMI, income, tenure and household budget.
2. **Tax-season preparation:** authentic rent, salary, investment and invoice documents with no official emblems or readable personal data.
3. **Family protection and goals:** emergency savings, retirement and a child's education shown through relatable household moments.
4. **Long-term investing:** physical monthly or yearly sequences that communicate consistency without promising a return.
5. **Timely explainers:** a small-business or salaried-person context that shows who is affected instead of using generic breaking-news graphics.

## GSC prioritisation

The first 24 URLs were selected from settled page-level GSC data using impressions, clicks, average position, CTR opportunity and Discover suitability. Pages that already had a suitable 1600 × 900 hero, hubs, legal pages and non-indexable sample content were excluded.

The rollout includes 18 calculators, five articles and one financial update. The highest-priority themes are personal-loan EMI, old-versus-new tax regime, emergency fund, HRA, fixed deposit, SIP, mutual-fund beginners and demat comparison.

## Measurement

Measure the rollout as an SEO/Discover experiment rather than assuming causation:

- Confirm Googlebot can fetch each image and the rendered page exposes the same canonical image URL.
- Track Image Search impressions and clicks weekly by page.
- Track Discover independently; eligibility does not guarantee distribution.
- Compare 28-day CTR and impressions against the pre-launch baseline, annotated with the deployment date.
- Refresh or replace only when a page's query intent changes or the image fails visual and performance checks.

Official reference: [Google Search Central — Discover and your website](https://developers.google.com/search/docs/appearance/google-discover)
