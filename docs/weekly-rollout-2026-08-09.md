# RupeeKit weekly rollout — 3 to 9 August 2026

This document is the single reference for the calculator and content sprint covered by issues #42, #44, #45, #47 and #48.

## What shipped

### Issue #42 — Insurance, vehicles and credit-card debt tools

| Tool | Category |
| --- | --- |
| `term-life-insurance-cover-calculator-india` | Insurance |
| `health-insurance-coverage-adequacy-calculator-india` | Insurance |
| `car-loan-emi-affordability-calculator-india` | Loans |
| `two-wheeler-loan-emi-calculator-india` | Loans |
| `credit-card-minimum-due-trap-calculator-india` | Debt |
| `credit-card-vs-personal-loan-calculator-india` | Debt |

### Issue #44 — Investing and markets tools

| Tool | Category |
| --- | --- |
| `sovereign-gold-bond-vs-physical-gold-calculator-india` | Investing |
| `index-fund-vs-active-fund-cost-calculator-india` | Investing |
| `elss-lock-in-vs-80c-options-calculator-india` | Investing |
| `nps-tier-2-vs-mutual-fund-calculator-india` | Investing |
| `xirr-portfolio-return-calculator-india` | Investing |
| `rule-of-72-calculator-india` | Investing |

### Issue #47 — Government schemes and life-stage tools

| Tool | Category |
| --- | --- |
| `ops-vs-nps-pension-comparison-calculator-india` | Retirement |
| `scss-calculator-india` | Savings |
| `post-office-monthly-income-scheme-calculator-india` | Savings |
| `child-education-cost-planner-india` | Planning |
| `wedding-cost-planner-india` | Planning |
| `rent-agreement-stamp-duty-registration-cost-calculator-india` | Housing |

### Issue #45 — Tax and compliance deep-dives

- `section-44ada-presumptive-taxation-freelancers-india`
- `tds-fixed-deposit-interest-form-15g-15h-india`
- `itr-late-filing-penalty-interest-india-fy-2026-27`
- `gst-small-business-freelancers-registration-composition-india`
- `nri-taxation-basics-residency-taxable-income-india`
- `capital-gains-tax-changes-2026-equity-investors-india`

### Issue #48 — Comparison guides and weekly content hub

- `epf-vs-nps-vs-ppf-retirement-india`
- `cashback-vs-rewards-credit-cards-india`
- `salary-hike-negotiation-beyond-base-pay-india`
- `robo-advisors-vs-diy-index-investing-india`
- `gold-asset-class-sgb-etf-physical-gold-loan-india-2026`
- `fy-2026-27-money-moves-salaried-indians-mid-year-checklist`

## Internal-linking pass

Issue #48 closes the sprint by adding a navigational hub rather than adding more isolated pages.

- The FY 2026-27 money-moves hub references all 18 calculators added in issues #42, #44 and #47 through `relatedCalculators`.
- The hub's Quick Answer links to all five other Day 7 comparison guides and all six Day 4 tax/compliance guides, giving the week's new articles an inbound path from one indexable hub.
- The comparison guides add extra contextual calculator links for retirement, credit-card debt, salary, investing and gold decisions.
- Existing calculator `related` sets from issues #42, #44 and #47 were reviewed and left intact because they already resolve to live tools; issue #48 does not change any calculator formula or input/output logic.
- Blog routes are aggregated through `data/all-blog-posts.ts`; `app/sitemap.ts` imports that aggregate, so the six Day 7 posts are emitted into the sitemap automatically once the branch is deployed.

## Safety and maintenance notes

- All new material is educational and avoids personalised investment, tax, lending or legal advice.
- No guaranteed returns, approval claims, lender-rate claims, fake ratings, fake reviews or product schema were added.
- Time-sensitive government, retirement and gold references should continue to be checked against primary sources as part of the site's freshness process.
- The gold comparison deliberately distinguishes outstanding Sovereign Gold Bonds from the availability of any fresh issuance rather than assuming a new tranche exists.

## Search Console after deployment

Because the six Day 7 guides are new public pages, they are eligible for a one-time indexing request after deployment. First confirm each route is live, self-canonical, indexable and present in `/sitemap.xml`. Do not request indexing again daily, and do not re-request indexing for the 18 existing calculator pages solely because they received new internal links.
