# FCRA 2026 original media pack

Issue: #95

## Safety and originality rule

This media pack was created from a blank canvas using RupeeKit's brand colours and fact-checked source material. The only pre-existing artwork placed into these assets is RupeeKit's own wordmark, `public/brand/rupeekit_logo_horizontal_transparent.png`, the same logo the site header uses. No NDTV image, video, screenshot, infographic, caption, layout, chart design or footage was used as an input or reference. No Sansad TV footage, screenshot or broadcast artwork was used either. No claim of endorsement or affiliation with any broadcaster is made.

The production chain for these assets is:

**official facts -> RupeeKit editorial structure -> original graphics -> original video edit**

## Fact basis

Only the following source classes were used for the visual facts:

1. **Ministry of Home Affairs — FCRA Online**
   - https://fcraonline.gov.in/
   - Used for the FCRA certificate-status snapshot and the official 2026 Rules listing.
   - The portal is a live source. Certificate totals change as registrations are renewed, cancelled or expire, so the public visuals intentionally round the displayed values to approximately 14.4K active, 22.5K cancelled and 15.2K expired rather than presenting them as permanent counts.

2. **Press Information Bureau — FCRA 2.0 portal launch**
   - https://www.pib.gov.in/PressReleasePage.aspx?PRID=2279410&lang=1&reg=48
   - Confirms the FCRA 2.0 portal launch on 30 June 2026 and the move toward reduced physical paperwork and digital processing.

3. **Digital Sansad — Bills**
   - https://sansad.in/ls/legislation/bills
   - Confirms the Foreign Contribution (Regulation) Amendment Bill, 2026 was introduced in Lok Sabha on 25 March 2026 and is listed as pending during this review on 9 August 2026.

4. **Ministry of Home Affairs — 2026 Rules listing**
   - https://fcraonline.gov.in/latest-news
   - Lists the Foreign Contribution (Regulation) (Amendment) Rules, 2026 dated 22 June 2026.

## Assets

### Discover / article hero

`public/images/discover/fcra-2-0-india-2026-explained.webp`

- 1600 x 900
- 16:9
- WebP
- Original RupeeKit timeline + rounded certificate snapshot
- Designed for a large image preview
- Registered in the Discover image data and image sitemap

### Supporting story graphics

`public/media/fcra-2026/fcra-2026-timeline.webp`

- 1080 x 1350
- Timeline separating the Bill, Rules and portal milestones

`public/media/fcra-2026/fcra-registration-snapshot-2026.webp`

- 1080 x 1350
- Rounded live-portal certificate snapshot with a freshness warning

`public/media/fcra-2026/fcra-rules-vs-bill-2026.webp`

- 1080 x 1350
- Clear distinction between Rules already in force and the pending Bill

### Short video

`public/media/fcra-2026/fcra-2-0-india-2026-explainer.mp4`

- 360 x 640 lightweight vertical web preview
- 12 seconds
- Four original RupeeKit frames
- H.264 video + AAC audio
- No third-party footage
- No third-party audio recording
- Background music was procedurally synthesized for this media pack, so no external music licence is required
- Video does not autoplay on the article; the reader controls playback
- A 1080 x 1920 high-resolution review master was also generated for manual social review; the repository keeps the lightweight preview to avoid unnecessarily increasing page/media transfer size

## On-page wiring

The FCRA guide receives the new Discover image through `getDiscoverImage()` exactly like other RupeeKit priority pages. This makes the same original asset available to the visible hero, Open Graph metadata, Twitter metadata, Article schema and the image sitemap.

A dedicated `FcraOriginalMedia` section adds the short video and three supporting visuals below the main FCRA guide. The section explicitly tells readers the material is based on official sources and that time-sensitive figures should be rechecked.

## Discover validation expectations

The Discover image must remain:

- at least 1200 x 675
- approximately 16:9
- WebP
- below the existing 350 KB image budget
- equipped with descriptive 40-160 character alt text
- referenced in rendered page metadata/schema and the image sitemap

The existing Discover validation scripts were updated to include the dedicated FCRA manifest so the page becomes the 86th required Discover-image page.

## Manual review checklist

Before merge:

- confirm the FCRA Bill is still shown as pending by Digital Sansad
- spot-check the FCRA Online portal for material changes to the rounded certificate counts
- play the full video once with sound on and once muted
- confirm there is no third-party logo, broadcaster branding, screenshot or footage in any asset
- confirm all generated text is readable on mobile
- run `npm run validate`
- run `npm run lint`
- run `npm run test`
- run `npm run build`

Public social posting remains manual-review only.
