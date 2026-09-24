# Issue #90 — Trust & accessibility audit (2026-09-06)

## Scope

This pass audits the trust surface and shared calculator accessibility primitives used by RupeeKit's highest-impression tools. It does not claim professional credentials that RupeeKit does not have, and it does not change calculator formulas.

## Trust findings

Already present on `main`: a visible organisational byline (`RupeeKit Editorial Team`), an editorial policy, corrections policy, contact route, site disclaimer, calculator source/methodology sections, and visible last-reviewed dates on core YMYL routes.

This issue strengthens `/about` so a first-time visitor can see who operates the site, what the editorial team actually is, which primary-source families are used, what RupeeKit is not, and how to report a correction or accessibility problem. The wording intentionally avoids invented individual experts, certifications, CA review, SEBI registration, lender status, or other credentials.

## Accessibility findings

The shared standard calculator already associates labels and help text with numeric inputs. `CalculatorResultSummary` already exposes changing estimates with `aria-live="polite"` and `<output>`. Preset buttons already expose `aria-pressed` and a visible `focus-visible` ring. Advanced priority calculators use a shared labelled numeric-input primitive.

A new validator protects these invariants in CI and fails if the common calculator surface loses labels, result announcements, preset state, keyboard focus visibility, guide disclaimers, or visible editorial attribution.

### Top-20 sample protected by the shared checks

8th CPC salary, personal-loan EMI, personal-loan eligibility, gold loan, salary in-hand, old-vs-new tax, SSY, SIP, PPF, capital-gains tax, emergency fund, home-loan EMI, generic EMI, HRA, gratuity, FD, lumpsum, EPF corpus, net worth, and step-up SIP.

## Browser-test limitation

The current `main` branch does not declare `@playwright/test` as a direct development dependency or expose a maintained Playwright test script. A historical report mentions ad-hoc Playwright smoke testing, but there is no browser suite in the repository to extend safely in this branch. This PR therefore adds deterministic CI validation of the shared accessibility primitives instead of silently introducing a new browser dependency and lockfile churn.

Follow-up when a maintained browser test runner is added: run these 20 routes at 390px and desktop with automated axe/Playwright checks for labels, heading hierarchy, keyboard reachability, focus visibility, live-result announcements and contrast. Treat that as a test-infrastructure issue rather than fabricating a passing Playwright result here.

## Product and SEO rationale

For YMYL pages, visible provenance and honest limits reduce ambiguity about who produced the content and how it was checked. Programmatic labels, semantic outputs and predictable keyboard focus improve access for assistive-technology and keyboard users while also preserving clearer document structure for crawlers.

No ranking or rich-result guarantee is claimed.

## Indexing rule

This PR does not create a new important public URL and does not change canonical, sitemap or noindex behavior. Do not request indexing solely for this deployment. Use URL Inspection only as a post-deploy regression check on `/about` and one representative calculator.
