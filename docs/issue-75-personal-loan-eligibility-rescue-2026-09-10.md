# Issue #75 — Personal-loan eligibility rescue

Date: 10 September 2026

## Selection and dependency check

Issue #147 matches 10 September, but its required fresh trailing-28-day GSC/GA4 input is still unavailable while #146 / PR #179 remains open. The older CWV issue #67 already has an open implementation PR (#107), so duplicating it would create competing work.

Issue #75 remains a high-priority actionable rescue. The Day-19 partial readout recorded 643 impressions, 0 clicks and average position 54.62 for the personal-loan eligibility calculator, directionally improving from the original 476 impressions / position 70.8 / 0-click baseline but still clearly a ranking/depth problem rather than a page-one CTR problem.

## Existing issue work verified on current main

The current parent calculator already contains the query-backed content required by #75:

- salary-band coverage for ₹12k, ₹13k, ₹14k, ₹25k, ₹40k and ₹45k;
- illustrative salary-band borrowing capacity with explicit assumptions (no existing EMI, 50% FOIR, 14% annual reducing rate and 48 months);
- a plain-language FOIR explanation and the effect of existing EMIs;
- a dedicated eligibility-check vs eligibility-calculator explanation;
- lender-specific criteria with official-source links and explicit no-approval framing;
- a demand-backed ₹25,000 salary scenario page that reuses the parent calculator assumptions rather than creating six thin salary pages.

This run does not alter any calculator formula, lender threshold, rate assumption or output.

## Source verification performed in this run

SBI's official Personal Loan page was rechecked on 10 September 2026. It currently states:

- eligible employment sectors include Government, Defence and Corporate;
- minimum service is 6 months for Government/Defence and 12 months for Corporate employees;
- ordinary age range is 21–60 years, with a stated case-by-case exception for some Government/Defence employees over 60;
- minimum net monthly salary is ₹20,000 for Government/Defence and ₹25,000 for Corporate employees;
- maximum loan amount is subject to an EMI/NMI ratio up to 65% and 30-times NMI, whichever is lower;
- credit score remains subject to the bank's internal policy.

Primary source: https://sbi.bank.in/web/personal-banking/loans/personal-loans/sbi-personal-loan

These are lender-specific rules, not RupeeKit approval thresholds. Users must verify the lender's current policy when applying.

## Change made in this PR

The remaining clear acceptance gap was discovery. The page needed contextual inbound links from the Personal Loan EMI, True APR and Foreclosure calculators.

`data/issue-79-related-overrides.json` now makes the relationship explicit in the live tool graph:

- Personal Loan EMI → Personal Loan Eligibility
- Personal Loan True APR → Personal Loan Eligibility
- Loan Foreclosure Net Savings → Personal Loan Eligibility

Existing related links are preserved. This creates three relevant inbound paths without keyword-stuffed sitewide links or new indexable inventory.

A regression test now pins the salary-band/FOIR/check-vs-calculator/source safeguards, the three inbound links, and the rule against salary-specific calculator child pages.

## SEO / AI-search rationale

The parent page already has demonstrated query breadth (91 variants) but historically ranked far below page one. Strong contextual links from adjacent loan decision tools make the eligibility page easier to discover and clarify the semantic sequence: affordability → true cost → repayment/foreclosure. This is intended to improve crawl context and topical authority; it is not a ranking guarantee.

## Search Console rule

This PR adds internal links to an existing important page; it does not create a new page or repair canonical/sitemap/noindex behavior. After deployment, inspect the eligibility URL and confirm its canonical/index state. Do not request indexing solely because the related-tool graph changed. Request once only if the valuable URL remains discovered-not-indexed after several days or a later deployment fixes an actual indexability defect.
