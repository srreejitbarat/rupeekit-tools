# Live gold rate pipeline

Added to replace the hardcoded `pricePerGram24k: 7200` default on
`/tools/gold-loan-calculator-india`, which had gone badly stale and was
mispricing every gold pledge the calculator valued.

## Why derived rather than scraped

The published figure is **computed**, not copied:

```
per gram fine (999.9) = (XAU_USD / 31.1034768) x USD_INR x (1 + import duty)
per gram at carat     = per gram fine x hallmark fineness
```

GST is deliberately **not** in the valuation rate. It is a transaction tax
charged at billing, not part of the metal's value; the Indian "gold rate today"
convention quotes the pre-GST landed rate, and lenders value pledged gold on
that same basis. The GST-inclusive purchase price is published separately as
`purchase.perGram` so the two cannot be confused.

Three reasons this beats scraping a retail jeweller rate:

1. **It is the right number.** This yields a *bullion* value — gold content
   only, excluding making charges, wastage and stones. That is what a lender
   advances against. A scraped retail rate bundles making charges (8–25%) and
   would overstate loan eligibility.
2. **No licensing exposure.** IBJA and MCX real-time rates are licensed
   commercial products. We derive from free spot and FX feeds and own the
   output outright.
3. **It fails loudly.** A scraper breaks silently when HTML changes, and on a
   YMYL page a silent break means publishing a wrong gold price to people
   making loan decisions.

Carats are **derived, never sourced separately** — one fine-gold price times a
fixed hallmark ratio (999 / 916 / 750 / 585). `validate-gold-rates.mjs`
enforces that the published carat table matches `perGramFine x fineness`.

## Validation against the live market, 22 August 2026

The derivation was checked against the reported national rate on 22 Aug 2026
using XAU/USD 4610 and USD/INR 95.765:

| Levy model | Derived 24K/g | vs reported Rs 16,309 | Derived 22K/g | vs reported Rs 14,950 |
|---|---:|---:|---:|---:|
| 6% duty + 3% GST | 15,481 | -5.08% | 14,195 | -5.05% |
| 15% duty + 3% GST | 16,796 | +2.98% | 15,400 | +3.01% |
| **15% duty, no GST** | **16,307** | **-0.02%** | **14,952** | **+0.01%** |

The formula reproduces the market to within 0.02% once both levy assumptions
are right, and the error was near-identical across both carats, confirming the
hallmark ratios are correct. Two config errors were found and fixed this way:

1. **Import duty is 15%, not 6%.** It was raised from 6% on 13 May 2026
   (BCD 5% -> 10%, AIDC 1% -> 5%). The pipeline shipped with the July 2024
   position.
2. **GST must be excluded** from the valuation rate, as described above.

`lib/gold-rates.test.ts` locks this as a regression test. If it starts failing,
the levy model has drifted -- re-derive it, do not loosen the tolerance.

## First live run, 22 August 2026 (CI)

The provider adapters were written without network access and were wrong on
first contact. The PR smoke test caught it. What the runners actually see:

| Provider | Class | Result |
|---|---|---|
| gold-api.com | spot | ✅ 4604.40 |
| coinbase-paxg | spot | added after this run |
| yahoo GC=F | futures | ✅ 4680.60 |
| goldprice.org | spot | ❌ 403 |
| stooq (both URL forms) | spot | ❌ 404 |
| yahoo XAUUSD=X | spot | ❌ 404 |
| frankfurter | fx | ✅ 95.70 |

Derived 24K Rs 16,275.69 against a reported market rate of Rs 16,309 — **0.20%**.

Two things this exposed:

1. **Dead providers.** goldprice.org and stooq appear to block datacenter IPs.
   They are still exported for local use but dropped from the default list.
2. **A futures quote is not a peer of a spot quote.** Yahoo GC=F sat 1.64%
   above spot — that is the contango basis, not disagreement, and it passed the
   2% cross-check by luck. Quotes now carry an `instrument` tag: the 2% check
   runs only among spot-class quotes, futures get a wide 5% sanity band, and the
   published rate is always taken from a spot quote. A run with only futures
   quotes fails closed rather than publishing a futures price as a cash rate.

`npm run probe:gold-providers` reports every provider independently, which is
how to diagnose this without burning a CI round-trip per guess.

## Validating the published rate

Everything above checks INTERNAL consistency: do two spot feeds agree, is the
number in range, did it jump. **None of it can catch a wrong levy assumption**,
because the levies are applied identically to every feed. The 6% -> 15% duty
error passed every internal guardrail and was 5.08% wrong; only comparison
against a real Indian price surfaced it.

Two things close that gap.

### `GET /api/v1/gold-rates`

Public JSON: the derived rate per carat, the purchase rate, the loan-valuation
basis, the inputs it came from, the levies applied, and the reference it was
checked against. Enough to re-derive the number yourself. When nothing has been
published it returns `available: false` with no price rather than an estimate.

### The reference gate

`scripts/gold/reference.mjs` fetches an independent **Indian** price and
compares. It must be Indian: an international XAU quote converted to rupees
validates the FX leg and misses the duty leg entirely, which is the leg that
broke.

| Source | Class | Tolerance | Status |
|---|---|---|---|
| Published Indian retail | cash | 2% | responds; parse needs fixing |
| ~~MCX gold futures~~ | futures | 4% | **retired — route closed, see below** |

**A reference is a gate, never a source.** Its value is compared and discarded,
never republished — so this is a validation input rather than a redistribution
of someone else's rate table.

The failure mode is deliberately **asymmetric**, and reversing it breaks the
pipeline in one of two ways:

- **Reference unavailable → publish anyway.** Absence of evidence is not
  evidence of error. A rotted scraper must never block every future update.
- **Reference present and diverging → hold.** This is the only signal that a
  levy assumption drifted.

A 2% cash tolerance would have caught the duty bug on day one.

### Current status: the gate is built but INERT

As of 23 Aug 2026 neither reference source responds from GitHub runners:

| Source | Result |
|---|---|
| MCX | **closed** — see below |
| Published Indian retail | Page fetched, but the 24K figure could not be parsed |

### Why MCX is closed, not merely unimplemented

MCX looked like the strongest free option: its contracts are physically
deliverable in India, so the price embeds import duty the way a cash price does,
and MCX explicitly permits *delayed* data for public website display. Probed
properly from a runner on 23 Aug 2026 (`node scripts/probe-mcx.mjs`):

| Attempt | Result |
|---|---|
| market watch POST, honest UA | HTTP 403 |
| market watch POST, browser UA | HTTP 200 — **but the body is MCX's own 404 HTML page**, not JSON |
| market watch GET, honest UA | HTTP 403 |
| bhavcopy page / mcx home, any UA | HTTP 403 |

Two independent blockers:

1. **MCX 403s any client without a browser user-agent.** That is a deliberate
   filter. Getting past it means spoofing a UA to defeat an access control MCX
   chose to apply — not a foundation for a finance pipeline.
2. **The page method returns 404 regardless.** The 200 was an error page. The
   real bhavcopy sits behind an ASP.NET postback page that needs Selenium, and
   that page 403s at the domain level anyway.

An earlier note in this repo said "MCX 403s — anti-bot / session required" based
on a single failed call that was itself buggy (it issued a GET against a POST
page method). The conclusion happened to be right; the reasoning was not. The
probe above is the actual evidence.

`scripts/probe-mcx.mjs` is kept for re-testing if MCX ever changes, but is not
wired into any workflow.

The asymmetric design then does the right thing and publishes anyway, logging
`ref none available — published without an external cross-check`. **That is
correct behaviour and also means the gate currently protects nothing.** Do not
treat the presence of this code as evidence the rate is externally validated;
check `reference.checked` in the snapshot or the API payload.

Closing this properly needs one of:

1. **An IBJA licence** — the real answer, and the only one that is not fragile.
2. **A working MCX path** — the data is public and free, but the market-watch
   endpoint blocks datacenter IPs.
3. **A hardened retail scrape** — the page is reachable, so only parsing failed;
   fixable, but it will need maintenance forever, which is why it is the
   fallback and not the primary.

Until one lands, the practical safeguards against levy drift are the 180-day
`duty-config.json` review expiry and a manual spot-check of
`/api/v1/gold-rates` against any published rate.

## Fail-closed

`scripts/fetch-gold-rates.mjs` writes only when every guardrail passes:

| Guardrail | Holds the update when |
|---|---|
| Envelope | XAU/USD, USD/INR or derived per-gram falls outside a plausible range |
| Provider agreement | Two independent spot providers disagree by >2% |
| Day-over-day | The derived price moved >10% since the last stored day |

On failure it writes nothing and exits non-zero. The previously committed
snapshot stays live **with its real, older `asOf` date**, and the scheduled run
goes red. An openly stale price is safe; a confidently wrong one is not.

`--force` exists as an ops escape hatch and stamps `status: "forced"` plus the
overridden failures into the snapshot so it is visible afterwards.

## Files

| Path | Role |
|---|---|
| `scripts/fetch-gold-rates.mjs` | CLI entry, fail-closed write logic |
| `scripts/gold/providers.mjs` | All network access; add licensed sources here |
| `scripts/gold/derive.mjs` | Pure maths: derivation, carats, averaging, guardrails |
| `scripts/validate-gold-rates.mjs` | Wired into `npm run validate` |
| `data/gold-rates/purity.json` | Hallmark ratios — single source of truth for script and app |
| `data/gold-rates/duty-config.json` | Import duty + GST; **fails the build after 180 days unreviewed** |
| `data/gold-rates/current.json` | Latest guardrail-passed snapshot |
| `data/gold-rates/history.json` | Rolling 400-day history, feeds the trailing average |
| `scripts/gold/reference.mjs` | Independent Indian references; gate only |
| `scripts/probe-gold-providers.mjs` | Diagnostic: reports every provider and reference |
| `app/api/v1/gold-rates/route.ts` | Public snapshot endpoint |
| `lib/gold-rates.ts` | Typed accessors for pages, and the API payload |
| `lib/live-rate-defaults.ts` | Binds calculator defaults to the snapshot |

## The 30-day average

RBI-regulated lenders value pledged gold on a trailing average rather than
spot, so a live-spot figure overstates eligibility on a rising market. The
snapshot carries `loanValuation.sufficient`, which is `false` until 30 days of
history exist. **Pages must not describe the figure as a 30-day average while
`sufficient` is false** — the accessor returns the basis so the page can say
which one it is.

Confirm the current rule against the RBI directions in force before leaning on
this in user-facing copy; the gold-collateral lending framework was updated in
2025.

## Operating it

```bash
npm run fetch:gold-rates              # fetch, guard, write
node scripts/fetch-gold-rates.mjs --dry-run
npm run validate:gold-rates
```

`.github/workflows/gold-rates.yml` runs it at 03:00 and 12:00 UTC (08:30 /
17:30 IST) and commits only when the snapshot changed.

`GOLDAPI_KEY` is optional; set it as a repo secret to add a third spot provider
and strengthen the agreement check. Stooq and Yahoo need no key.

## Where tool metadata actually comes from

Discovered the hard way while rewriting the gold-loan snippet: a tool's title
and description pass through **five** layers, and the last one wins.

1. `data/tools.json` (base record)
2. `data/search-growth-overrides-2026-08-17.json` (spread over the base)
3. `data/ctr-tool-seo-overrides-2026-08-15.json` (title/description only)
4. `data/query-variant-tool-overrides-2026-08-18.json` (appends sections/FAQs)
5. **`app/tools/[slug]/page.tsx`** -- a hardcoded per-slug map, pinned by
   `scripts/validate-priority-search-growth.mjs`

Editing the base record has no effect on the rendered title for any slug
present in layer 5. **Always verify against built output**
(`.next/server/app/tools/<slug>.html`) rather than trusting the edit. Content
additions belong in layer 4, which appends rather than replaces.

## Known follow-ups

- The gold-loan formula scales by `goldPurityKarat / 24` (22/24 = 0.9167)
  rather than the 916 hallmark used here. Left unchanged deliberately — it is a
  calculation change to a live financial tool and belongs in its own reviewed
  PR.
- Import duty and GST in `duty-config.json` were set from the July 2024 budget
  position and **must be confirmed** against the current CBIC notification.
- Layer 5 above should be collapsed into the data files. Five metadata layers
  for one title is why attribution keeps coming back "insufficient data".
- The city/state rate table discussed for `gold rate today` is not built. Indian
  retail rates are set per city by local associations, not per state; the plan
  is one national benchmark plus a maintained city delta, starting with ~10
  cities that have real volume rather than a generated 28-state matrix.
