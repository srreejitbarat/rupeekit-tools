# SEO growth plan — repo actions and open items (12 Aug 2026)

Source: the "RupeeKit SEO Growth Plan: Diagnosing the Click Deficit and Building an
AI-Era Finance Brand" analysis. This file records which recommendations were
implemented in the repository, which were deliberately changed, and which cannot
be done in code and remain owner actions.

## The diagnosis, in one line

Two unrelated problems. **A CTR problem** on ~60 pages that rank top-10 and earn
0.73% — largely because a big share of those impressions are machine-generated
(AI Mode query fan-out, AI Overview link appearances), and because among the
human fraction an unknown `.co.in` domain loses the click to ClearTax/Groww/HDFC.
**A ranking problem** on ~32 tool pages at position 30-80 that lose to domains
with 50-90x the authority. These need opposite fixes.

The practical consequence for this repo: **raw impressions are a vanity metric**.
Optimise for trust signals, citations and branded search, not for impression
count.

## Implemented in this repo

### Trust / E-E-A-T (the analysis's #1 fixable weakness)

| Change | Where |
|---|---|
| Editorial policy page — sourcing, review cadence, what we will not publish | `app/editorial-policy/page.tsx` |
| Corrections policy page — how to report, severity tiers, disclosure | `app/corrections-policy/page.tsx` |
| Shared editorial entity + byline date formatting | `lib/seo/editorial.ts` |
| Visible byline component with author, dates and correction link | `components/seo/EditorialByline.tsx` |
| Visible bylines on blog, FCRA layout, guides, tools, financial updates, government salary updates | those page/layout files |
| `author` + `reviewedBy` now resolve to `#editorial-team`; added `publishingPrinciples` and `correctionsPolicy` to article schema | blog / guides / financial-updates / government-salary-updates |
| `creator` + `maintainer` on calculator `WebApplication` schema | `app/tools/[slug]/page.tsx`, `app/tools/income-tax-calculator-old-vs-new-regime-india/page.tsx` |
| Organization node gained `contactPoint`, `publishingPrinciples`, `correctionsPolicy`, `knowsAbout`; new `#editorial-team` sub-entity | `app/layout.tsx` |
| Policy pages linked from the footer and included in the sitemap | `components/SiteFooter.tsx`, `app/sitemap.ts` |

**Deliberate deviation from the analysis.** The analysis recommends named,
credentialed individual authors (ideally a CA/CFP) with Person schema and
LinkedIn `sameAs`. That was **not** implemented with invented names. Fabricated
credentials on YMYL finance pages are a reader-deception and legal risk that
outweighs the ranking benefit, and Google's guidance targets *demonstrable*
expertise. What shipped is an honest organisational byline backed by a real,
public editorial process.

If and when a real named reviewer is engaged, the upgrade path is small: add a
`Person` node in `lib/seo/editorial.ts`, swap `editorialTeamRef` for it in
`reviewedBy`, and add `/authors/[slug]` bio pages. Do not do this before the
person actually exists and has agreed to be named.

### CTR / snippet fixes

- Removed the site-wide `keywords` metadata from `app/layout.tsx`. It was emitted
  identically on all 112+ pages; Google has ignored `<meta name="keywords">`
  since 2009 and identical boilerplate across a site reads as stuffing.
- Retitled to align `<title>` with `<h1>` (title rewrites drop sharply when they
  match) in `TOOL_SEO_OVERRIDES`:
  - `capital-gains-tax-calculator-india` → `Capital Gains Tax Calculator India 2026 (Equity STCG & LTCG)`
  - `ppf-calculator-india` → `PPF Calculator India 2026 - Maturity & Tax-Free Interest`
  - `nps-calculator-india` → `NPS Calculator India 2026 - Pension & Corpus Estimate`
  - `8th-pay-commission-salary-calculator-india` → `8th Pay Commission Salary Calculator 2026 (Fitment Factor)`
- Rewrote the ITR-2 meta description to lead with Schedule CG / Schedule FA /
  RSUs, the terms that page actually earns impressions for.
- Fixed a hardcoded `Last reviewed: 16 July 2026` on every guide page; it now
  renders from `guide.lastReviewedIso`. A freshness date that does not track the
  actual review is a trust liability, not a ranking trick.

### Topical hubs (analysis §E)

- `app/8th-pay-commission/page.tsx` — separates what is settled about the 8th CPC
  from what is speculation, explains why the fitment factor overstates the raise
  (DA merge and reset), links the six calculators in the cluster. Deliberately
  does **not** state a fitment factor as fact.
- `app/nri/page.tsx` — NRE vs NRO taxation, section 195 TDS, what DTAA relief
  actually requires (TRC + Form 10F), the USD 1 million NRO repatriation limit,
  and Schedule FA / RSU disclosure. Targets the segment where the site already
  ranks 2-4 in UAE, Singapore, Australia and Canada with zero clicks.
- Both carry `CollectionPage` + `BreadcrumbList` + `FAQPage` schema, a Quick
  Answer block, an Answer Engine Summary and a source-and-methodology section.
- Internal links wired in from: the ITR-2 guide, the AIS foreign-assets update,
  the capital-gains calculator, the salary cluster calculators, and the footer.

**Fact correction against the source analysis.** The analysis states NRO interest
is taxed at **30.9%**. That reflects the pre-2018 3% cess. The current figure is
**30% + 4% health and education cess = 31.2%** before surcharge. The hub uses
31.2% and describes the surcharge as applicable-where-relevant rather than
quoting a single composite rate.

### Build hygiene

- `scripts/validate-ai-seo-readiness.mjs` had a stale exact-string assertion for
  the blog FAQ schema that failed against the already-refactored
  `post.faqs?.length` form. This was failing on `main` before this branch. The
  assertion now accepts both forms while still enforcing the actual rule.

## Not implemented in code — deliberate

**FAQ markup was kept.** FAQ rich results were retired as a visible SERP feature
(May 2026), but the markup still feeds AI extraction. No FAQ blocks were removed.

**hreflang was not added.** The analysis suggests hreflang for the NRI push.
There is only one language/region version of every URL, so `alternates.languages`
would point every locale at the same page — noise, not a signal. Revisit only if
genuinely distinct regional URLs are created.

**`llms.txt` was not added.** `app/llms-full.txt` already exists. Adoption as a
ranking or citation signal is unconfirmed; not worth a second file.

**Head-term calculators were not touched.** Per the analysis, `sip calculator`
(~4.09M monthly searches in India, owned by Groww), `ppf calculator`, `emi
calculator`, net worth and personal-loan-eligibility are not winnable on this
domain in 12-18 months. They stay live and technically excellent. Do not spend
further content or link effort there.

## Owner actions — cannot be done from this repo

These are the highest-leverage remaining items. None of them are code.

1. **GA4 AI-referral tracking.** GA4's native "AI Assistant" channel (added 13 May
   2026) misses Perplexity and referrer-less sessions. In GA4 Admin → Data
   settings → Channel groups, add a custom channel **above** Referral matching
   source regex:
   ```
   chatgpt\.com|perplexity\.ai|gemini\.google\.com|claude\.ai|copilot\.microsoft\.com
   ```
2. **Branded contact email.** The Organization `contactPoint` reads from
   `NEXT_PUBLIC_CONTACT_EMAIL` and currently falls back to the Gmail address. Set
   it to a domain email (e.g. `hello@rupeekit.co.in`) in the deployment
   environment; the schema and corrections page pick it up automatically.
3. **News cadence.** 3-5 sourced updates per week on 8th Pay Commission, EPFO
   circulars, ITR utilities and deadlines, gratuity/labour codes, AIS/TIS —
   each linked to its calculator. `financial-updates` already gets the site's best
   CTR (1.71% at position 6.5); this is the highest expected-impact-per-effort
   area on the site. Google News needs no application — it is a technical and
   trust checklist, and the schema, bylines and corrections policy for it now
   exist.
4. **Links.** Embeddable calculator widgets with attribution (8th Pay Commission,
   gratuity, HRA); one original-data study; journalist sourcing to Mint / ET /
   Moneycontrol / Business Standard on pay commission and tax deadlines.
5. **Brand entity.** Wikidata entity, newsletter, a modest YouTube/Instagram
   calculator-explainer presence. Branded search is currently zero and is the
   north-star metric.

## Metrics to track instead of raw clicks

1. AI citation share (ChatGPT / Perplexity / AI Overviews)
2. **Branded search volume — currently zero, the north star**
3. Direct traffic
4. AI-referral sessions in GA4 (see owner action 1)
5. Discover / News impressions
6. Newsletter signups

Thresholds that change the plan: no Discover/News impressions by day 120 means
the E-E-A-T and News signals are still insufficient — audit schema and bylines
before writing more. Branded search still zero at 6 months means prioritise PR
and social over more content. A core update that drops YMYL rankings means freeze
new content and audit authorship first.

## Caveats carried over from the analysis

- The 40-60% non-human impression estimate is an inference from query-string
  patterns, not a measured figure. Google does not expose the split.
- AI Overview CTR impact ranges from −15.5% to −61% across studies. The direction
  is unambiguous; the magnitude is not.
- Forecasts (~250-600 clicks/day at 365 days) are conditional on consistent
  execution of authorship, news cadence and link acquisition, and on avoiding an
  adverse core update. They are not guarantees.
- GSC and AI surface behaviour is changing fast. Revisit quarterly.
