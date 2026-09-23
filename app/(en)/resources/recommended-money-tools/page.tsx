import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Recommended Money Planning Tools and Resources | RupeeKit';
const DESCRIPTION =
  'Explore educational money planning resources, budget planners, document organizers, books and RupeeKit templates for personal finance planning in India.';
const PAGE_URL = `${SITE_URL}/resources/recommended-money-tools`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const sections = [
  {
    title: 'Budget Planners and Expense Trackers',
    body: 'Coming soon: internal educational picks and simple planners for weekly and monthly expense tracking.',
  },
  {
    title: 'Tax Document Organizers',
    body: 'Coming soon: filing-season organization templates for salary proofs, investment proofs and supporting documents.',
  },
  {
    title: 'Personal Finance Books',
    body: 'Coming soon: practical beginner reading paths focused on Indian personal finance decision-making.',
  },
  {
    title: 'Emergency Fund Planning Tools',
    body: 'Coming soon: emergency corpus worksheets and crisis-readiness templates.',
  },
  {
    title: 'Loan Comparison Worksheets',
    body: 'Coming soon: worksheet-style comparisons for EMI, total interest, fee impact and tenure trade-offs.',
  },
  {
    title: 'RupeeKit Downloadable Templates',
    body: 'Coming soon: internal templates designed to pair with RupeeKit calculators for structured planning.',
  },
];

export default function RecommendedMoneyToolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-brandDeepNavy md:text-4xl">
          Recommended Money Planning Tools and Resources
        </h1>
        <p className="text-sm leading-relaxed text-brandMuted">
          This page is an educational resource hub. External links are not added yet; structured recommendations are
          being prepared.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-brandBorder bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-brandDeepNavy">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brandMuted">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs leading-relaxed text-slate-700">
          Some future resource links may be affiliate links. RupeeKit will disclose affiliate relationships clearly and
          will only link to relevant educational tools or resources.
        </p>
      </section>
    </div>
  );
}
