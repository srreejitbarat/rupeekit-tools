# RupeeKit Discover Image Quality Standard

Last reviewed: 2026-08-24

## Purpose

RupeeKit Discover images should make a finance story immediately understandable without using misleading clickbait. The preferred image must represent the actual page and remain useful when cropped on mobile.

## Baseline technical requirements

- 1600×900 preferred; never below 1200 px wide.
- 16:9 landscape composition.
- WebP for static preferred images.
- High-resolution source with a compressed production target under the existing 350 KB budget.
- `max-image-preview: large` enabled on the page.
- Preferred image connected through `og:image` / page metadata and relevant structured data where applicable.
- Important human subjects, numbers and objects stay inside the central crop-safe area.
- Image alt text describes the actual visual and its finance context.

## Creative requirements

1. Tell one finance story, not a generic finance mood.
2. Use an Indian household, salaried professional, taxpayer, saver, borrower or investor when a human subject improves relevance.
3. Show the decision inputs visually: for example income + EMI, salary + deductions, rent + HRA, or contribution + time horizon.
4. Use zero text where the visual works on its own. If a hook materially improves comprehension, prefer four words or fewer and never exceed five words.
5. A hook must be an accurate question or framing device, never a withheld-fact trick.
6. Avoid generic logo-only images, stock-market rockets, piles of cash, exaggerated shock faces and unrelated luxury imagery.
7. Do not visually imply guaranteed returns, guaranteed tax savings, loan approval, a lowest rate, a fixed future rate or a universal financial recommendation.
8. Do not imitate government forms, seals, bank interfaces, lender approvals or official portals.
9. Keep RupeeKit branding secondary. The page story should remain the main visual subject.
10. Images for comparison pages must visually treat both choices neutrally unless the page itself establishes a factual outcome for a stated example.

## Discover-specific safety rule

Google's 2026 Discover guidance emphasizes useful, people-first, original and timely content, while reducing sensational and clickbait previews. RupeeKit therefore uses curiosity-led editorial images rather than exaggerated clickbait.

Official references:
- https://developers.google.com/search/docs/appearance/google-discover
- https://developers.google.com/search/blog/2026/02/discover-core-update

## Priority creative refresh

The current priority brief pack is stored in:

`data/discover-creative-briefs-2026-08-24.json`

Every priority brief contains:
- canonical page path,
- priority level,
- safe hook,
- visual story,
- composition guidance,
- image-generation prompt,
- explicit elements to avoid.

These briefs should be used when regenerating or reviewing the current preferred images. Human visual review remains required before replacing a live image because image-generation models can introduce incorrect text, currency symbols, documents or visual claims.
