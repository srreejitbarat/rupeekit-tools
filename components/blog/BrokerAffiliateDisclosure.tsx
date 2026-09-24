'use client';

export default function BrokerAffiliateDisclosure() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-xs leading-relaxed text-blue-900 shadow-sm flex items-start gap-2.5">
      <svg
        className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p>
        <span className="font-bold">Affiliate Disclosure:</span> RupeeKit may earn a referral or affiliate fee if you open an account through some links on this page. Commercial relationships do not determine comparison order, factual conclusions, or recommendations. We verify commercial claims against primary broker sources and show the verification date near the comparison. There is no extra cost to you from using our link; always check the broker&apos;s current official pricing and eligibility before acting.
      </p>
    </div>
  );
}
