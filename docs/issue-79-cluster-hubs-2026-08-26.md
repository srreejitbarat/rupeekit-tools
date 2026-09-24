# Issue 79 — calculator cluster hubs and internal-link architecture

Date: 26 August 2026

## Why this change exists

Issue #78 classified the portfolio first; this work is intentionally stacked on that branch so it does not resurrect any retired or consolidated URL. The aim is to make every surviving calculator reachable through a useful topical path rather than relying on the XML sitemap or a flat directory alone.

Review order matters: merge the issue #78 portfolio-triage PR first, then retarget this issue #79 PR to `main`. CI may temporarily target `main` while validating the combined stack, but the intended review dependency remains #78 before #79.

## Seven non-competing cluster hubs

| Hub | Target keyword | Scope |
| --- | --- | --- |
| Loans & EMI | `loan calculators India` | affordability, EMI, debt, housing and repayment trade-offs |
| Tax & Compliance | `tax calculators and compliance tools India` | tax, salary, HRA and deduction workflows |
| Investing & Markets | `investment calculators India` | SIP, lumpsum, return and fund-cost scenarios |
| Insurance & Protection | `insurance planning calculators India` | life and health protection gaps |
| Government & Pension | `government pension calculators India` | pension, EPF, NPS, gratuity and government-pay scenarios |
| Life-Stage Planning | `financial goal planning tools India` | education, wedding and milestone planning |
| Small Savings | `small savings calculators India` | savings products, deposits and emergency buffers |

Each target is intentionally broader than the specific calculator keywords inside the hub. Hubs orient the user; calculators remain the canonical page for a specific computation.

## Navigation and sitemap

- `/tool-hubs` is linked from the primary desktop and mobile navigation, so it is reachable from the homepage and every calculator page through the shared site header.
- `/tool-hubs/[slug]` renders the live calculators assigned to that cluster plus explanatory ordering copy.
- The hub index and all seven cluster detail pages are emitted by `app/sitemap.ts`.
- Each hub is self-canonical and indexable with `max-image-preview:large`.

## Direct discovery fixes

The four demand-backed discovery targets named in #79 now each receive at least two explicit source-tool links through the normal related-tool system:

- `personal-loan-true-apr-calculator-india` ← Personal Loan EMI, Personal Loan Eligibility, Credit Card vs Personal Loan
- `loan-foreclosure-net-savings-calculator-india` ← Personal Loan EMI, Personal Loan Eligibility
- `reduce-emi-vs-tenure-calculator-india` ← Home Loan EMI, EMI Calculator
- `home-affordability-calculator-india` ← Home Loan EMI, EMI Calculator, Rent vs Buy

These are additive link-graph changes only. No formula, rate, tax rule, eligibility logic, slug, canonical or calculator output changed.

## Validation guardrails

`scripts/validate-internal-links.mjs` now additionally checks:

1. every live calculator has at least one contextual inbound path beyond the flat `/tools` directory;
2. the four named discovery targets each have at least two explicit issue-79 source-tool links;
3. all seven required hubs exist;
4. the hub route actually groups live tools through the shared cluster mapping;
5. the primary navigation exposes `/tool-hubs`;
6. `app/sitemap.ts` emits the cluster hubs.

`lib/issue-79.test.ts` also fails if a live calculator has no primary cluster, a cluster target keyword duplicates a calculator target keyword, or a new related override points at a dead tool.

## Search Console handling

These seven hub pages are new public indexable URLs. After this stacked PR and issue #78 are merged and deployed, verify each hub is 200, self-canonical and present in the sitemap. Request indexing once for the hub index and the most important new hubs if they are not discovered promptly; do not request indexing again for existing calculators merely because they gained internal links.
