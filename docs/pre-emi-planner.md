# Pre-EMI planner

Route: `/tools/pre-emi-calculator-india`

The generic `app/tools/[slug]` route must exclude this slug from its static params. The `validate-pre-emi-rendered.mjs` postbuild gate checks the actual dedicated planner HTML and PDF font tracing, preventing a generic-route prerender collision.

The planner combines staged home-loan disbursements with household cash flow. It compares interest-only pre-EMI, EMI on the disbursed balance and EMI based on the full sanction. Lender-specific availability and repayment rules must be checked against the actual agreement.

## Calculation contract

- `lib/pre-emi/engine.ts` is shared by the browser and Node PDF endpoint. No AI is used for arithmetic.
- Months are one-based. Draws occur at the start of a month; interest is outstanding drawn principal times annual rate divided by 12. Exact day-count interest is outside this monthly model.
- Possession and regular-EMI commencement are independent. Rent ends at the start of the possession month. A possession-only delay does not move loan payments. Construction-delay mode moves all tranches after the first, their own-cash contributions and the regular-EMI switch.
- Pre-EMI amortization starts at the entered EMI month. Early-EMI amortization starts at the first draw. The entered tenure is measured from that start. Validation rejects draw schedules extending past the early-EMI term, including the displayed delay scenarios.
- Disbursed-balance EMI is recalculated on new draws and rate changes over the remaining original term. Sanction-based EMI initially uses the whole sanction, but interest is charged only on outstanding drawn debt. A rate reset recasts it using remaining debt plus undrawn sanction over the remaining term. A later draw can raise it when capped or absent payments after an earlier draw was cleared would otherwise create a large final balloon payment.
- Prepayments reduce principal. Instalments remain fixed between applicable recasts; the final scheduled payment clears residual rounding. A loan temporarily repaid before another draw is not considered finally repaid.
- Builder loan draws never enter household cash. Own contributions and move-in costs are separate cash outflows. Starting cash excludes contributions already paid.
- Reserve protection limits optional extra payments using that month's available cash. It does not reserve all future expenses. A reported reserve shortfall is the largest gap under the displayed payment schedule, not a guarantee that adding exactly that amount upfront will solve a recalculated plan.
- All strategy and delay snapshots use the same comparison horizon. Lifetime interest is separately labelled. Negative cash is an unfunded gap, not an assumed overdraft.

## Privacy and exports

Calculations, CSV, JSON import/export and opt-in browser storage run locally. Sharing the calculator sends its public URL, without inputs. Analytics contain calculator identifiers and interaction counts, never financial field values.

`POST /api/pre-emi/report` accepts a version-1 JSON envelope with `input` and `mode`. It uses the same validation and calculation engine, renders a PDF with embedded local fonts, and returns `private, no-store` and `noindex` headers. It has a streamed 32 KB body limit, a 12-tranche limit and a two-render concurrency ceiling per Node process. It stores neither inputs nor generated reports and does not log request values. The UI explicitly explains server processing beside the PDF action. No database or API secret is needed.

The public font subsets are derived from DejaVu Sans, with the upstream permission notice in `public/fonts/LICENSE-DejaVu.txt`. The existing Dockerfile copies `public` into the Node runtime, including these fonts. SVG source and the rendered WebP are included for the page's artwork.

## Verification and release

Run `npm ci`, `npm test`, `npm run typecheck`, `npm run validate`, `npm run lint` and `npm run build`. Existing lint warnings outside this feature remain unchanged. The new tests cover principal and cash reconciliation, zero rates, uneven draws, loan restart after early repayment, rate resets, possession-only delays, reserve-limited prepayments, untrusted API inputs and the main UI journeys.

The production route, API and embedded-font PDF should also be smoke-tested from the standalone server using the deployment's normal public-file copying step. Check HTTP 200, a PDF signature, no-store headers, invalid input rejection and monthly CSV figures. The rendered default PDF has been visually reviewed; test a 12-tranche plan when changing report layout.

Before production release, review the page in desktop and mobile browsers: input sections, delayed scenarios, chart controls, saved-plan restore, import/export and PDF download. The implementation environment's browser URL policy blocks local and data-URL previews, so a live browser visual review is still a release check, separate from the passing automated DOM interaction tests.

No production deployment is triggered by creating the feature branch or pull request. Merging to `main` triggers the existing Hostinger validation and deployment workflow.
