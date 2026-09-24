'use client';

export default function FinanceDisclaimer() {
  return (
    <section
      id="source-and-methodology"
      className="rounded-2xl border border-brandBorder bg-white p-5 text-xs leading-relaxed text-brandMuted shadow-sm"
      aria-labelledby="source-methodology-heading"
    >
      <h2 id="source-methodology-heading" className="mb-2 text-sm font-bold text-brandDeepNavy">
        Source, Methodology & Educational Disclaimer
      </h2>
      <p>
        RupeeKit explains personal-finance topics using the assumptions, examples, calculator logic, and cited sources shown on the page. Where a topic depends on tax, regulatory, government, lender, or product rules, readers should verify the latest position with the relevant official source before acting.
      </p>
      <p className="mt-2">
        The content on this page is provided for general informational and educational purposes only. It does not constitute personalized financial, tax, legal, investment, or loan advice. RupeeKit does not guarantee returns, tax savings, rankings, or loan approval.
      </p>
    </section>
  );
}
