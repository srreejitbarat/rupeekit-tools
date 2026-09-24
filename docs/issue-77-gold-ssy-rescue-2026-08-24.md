# Issue #77 — Gold Loan + SSY rescue — 24 August 2026

## Scope

This change deepens two existing calculators with demonstrated GSC demand. It does not add new calculators or alter calculator formulas.

## Gold loan

The existing RupeeKit advanced calculator already implements the RBI consumption-loan LTV tiers effective for the current regulatory regime: 85% up to ₹2.5 lakh, 80% above ₹2.5 lakh through ₹5 lakh, and 75% above ₹5 lakh. Issue #77 adds a worked example above the calculator, explicit purity/per-gram explanation, repayment-structure coverage, default/auction explanation, FAQ depth, and reciprocal links into the personal-loan cluster.

Primary references reviewed on 24 August 2026:

- Reserve Bank of India — Lending Against Gold and Silver Collateral Directions, 2025 / current RBI gold-loan regulatory material.
- RBI Handbook on Regulations at a Glance — gold-loan LTV and valuation summary.
- SBI Personal Gold Loan page — example of bank product structures (EMI, bullet and overdraft) and lender-specific pricing.
- Manappuram Finance gold-loan pages — example of NBFC scheme-specific pricing and repayment structures.

Important boundary: RBI does not prescribe one universal retail gold-loan interest rate. RupeeKit therefore treats lender rates as product-specific and does not claim a guaranteed or universally lowest rate.

## Sukanya Samriddhi Yojana

The page now states that the 8.2% rate is for the July–September 2026 quarter and is not a lifetime fixed rate. It also distinguishes the 15-year deposit window from 21-year maturity, states the ₹250 minimum / ₹1.5 lakh annual maximum, explains opening-age and account-count rules, and covers permitted partial withdrawal / premature closure at a high level.

Primary references reviewed on 24 August 2026:

- India Post — Small Savings Schemes / Sukanya Samriddhi Account.
- National Savings Institute — Sukanya Samriddhi Account Scheme Rules.

The page remains educational. Tax treatment is described conditionally because Section 80C usefulness depends on the taxpayer's applicable tax regime and overall deduction position.

## Internal links

The small-savings cluster is now reciprocal across SSY, PPF, SCSS and Post Office MIS. Gold Loan is linked both ways with Personal Loan EMI, Personal Loan Eligibility and Personal Loan True APR.

## Search Console

After deployment, use URL Inspection on the two changed calculator URLs and Test Live URL. Because this is a substantial content update to important existing pages, request indexing once only if Google needs recrawling or either URL remains not indexed after several days. Do not submit the whole related-link cluster merely because internal links changed.
