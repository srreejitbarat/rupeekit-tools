# Policy lane publishing calendar — 25 August 2026

Evidence: Search Console export for 24 May – 23 August 2026 (92 days), page and
query level, `sc-domain:rupeekit.co.in`.

## Why this exists

The 92-day export splits the site's demand cleanly in two, and the dividing line
is not topic difficulty. It is whether the query is about a rule that recently
changed.

| Cluster | Impressions | Weighted position |
|---|---:|---:|
| Gratuity / labour codes | 230 | **4.3** |
| 8th CPC / pay commission | 791 | **4.8** |
| HRA | 22 | **8.5** |
| ITR / AIS / filing | 222 | **11.7** |
| PPF / EPF / NPS | 32 | **14.4** |
| Gold rate / gold loan | 1,320 | 31.9 |
| Emergency fund | 296 | 40.2 |
| SSY / small savings | 750 | 58.9 |
| Old vs new tax regime | 788 | 59.3 |
| Home loan | 202 | 62.8 |
| Net worth | 554 | 70.0 |
| Personal loan | 1,184 | 77.0 |

Everything in the top group is a government policy or rule-change topic.
Everything in the bottom group is an evergreen calculator keyword contested
since roughly 2014 by domains with a decade of accumulated authority.

Section CTR says the same thing a second way:

| Section | Pages | Impressions | Clicks | CTR |
|---|---:|---:|---:|---:|
| /guides | 35 | 746 | 11 | **1.47%** |
| /financial-updates | 10 | 1,204 | 17 | **1.41%** |
| /blog | 29 | 7,973 | 30 | 0.38% |
| /tools | 37 | 19,674 | 52 | 0.26% |

Ten update pages produced 17 clicks. Thirty-seven calculators produced 52. Per
page, update posts are roughly four times more productive.

## The rule this calendar follows

Publish against events, not against a content quota. The competitive advantage
in this lane is speed: the incumbents maintain large evergreen pages and update
them days late, which is the entire window RupeeKit has.

**Target: within 24 hours of the notification, with the circular cited.**

## Predictable calendar

These dates are known in advance and should be drafted before they arrive.

| When | Event | Page to publish |
|---|---|---|
| Quarterly (Apr / Jul / Oct / Jan) | Small savings rate revision | Update + refresh PPF, SSY, SCSS, POMIS calculators |
| Bi-monthly | RBI monetary policy outcome | Update framing the EMI impact |
| 15 Jun, 15 Sep, 15 Dec, 15 Mar | Advance tax instalments | Refresh `/deadlines`, push the tax calculator |
| Jun | Form 16 issued | Filing-season explainer |
| Jul | ITR utility releases and schema changes | Update per utility |
| Jul–Dec | Filing season extensions, if notified | Update citing the circular only |
| Mar | Tax-saving investment cut-off | 80C-driven update |
| Through 2027 | 8th CPC milestones | Update + refresh the level pages |

## Event-driven triggers

Watch these and publish when they move:

- CBDT circulars and press releases
- EPFO circulars and service notices
- PFRDA notifications affecting NPS
- Ministry of Labour notifications on the four labour codes
- State notifications of labour-code rules — these are the next real wave, and
  almost nobody is covering them per state

## Two live multi-year cycles

**8th Pay Commission.** Constituted by gazette notification on 3 November 2025,
chaired by Justice Ranjana Prakash Desai, report expected around May 2027, with
arrears retroactive to 1 January 2026. Roughly 49 lakh serving employees and 65
lakh pensioners. No fitment factor, revised matrix, HRA slab or implementation
date has been notified. Every milestone between now and 2027 is a fresh spike.

**The four labour codes.** In force from 21 November 2025 (PIB). The wage
definition forces salary restructuring across the private sector: provident fund
and gratuity rise, take-home falls. State rules are still being notified.

## What was shipped against this on 25 August 2026

- `/tools/new-labour-code-take-home-calculator-india`
- `/tools/gratuity-under-new-wage-code-calculator-india`
- `/8th-pay-commission/level-1` … `level-14` (14 scenario pages)
- Six policy guides across two clusters
- `/deadlines` — the statutory tax calendar

## Standing rules

1. **Never publish a predicted extension or an unnotified fitment factor.** Show
   scenarios, labelled as scenarios. This is what makes the pages defensible
   when the incumbents are guessing.
2. **Cite the circular.** A policy page without its primary source is worth
   less than no page in a YMYL cluster.
3. **Update in place for the same event; publish new for a new event.** Do not
   accumulate near-duplicate pages on one policy.
4. **Titles: policy change × specific person × a number they cannot work out.**
   Google rewrites about 76% of YMYL titles and finance keyword retention is
   around 14.57%, so curiosity-gap headlines get stripped. Specificity survives.
5. **Do not add calculators to the buried lane.** 28 of the site's 64
   calculators recorded zero impressions in 92 days, including
   `emi-calculator-india` and `gst-calculator-india`.

## Measurement

Three numbers, monthly. Impressions are not among them — 35% of the site's
impressions sit at position 21+ and produced 13 clicks between them.

| Metric | At 23 Aug 2026 |
|---|---|
| Total clicks | 112 per 92 days |
| Branded searches for "rupeekit" | 0 |
| Queries at position ≤ 10 | ~30 |

## Caveats

- The Queries sheet is capped at 1,000 rows covering 31% of impressions and 21%
  of clicks; the rest is withheld by Google's anonymisation threshold.
- The export ends 23 August 2026 and the last two days may be under-reported by
  normal Search Console settling lag.
- Cluster positions are impression-weighted from the query rows available, so
  they are directional rather than exhaustive.
