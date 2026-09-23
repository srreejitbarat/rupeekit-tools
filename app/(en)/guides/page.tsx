import type { Metadata } from 'next';
import Link from 'next/link';
import { allGuideClusters, allGuides } from '@/data/calculator-guides';

const SITE_URL = 'https://www.rupeekit.co.in';

export const metadata: Metadata = {
  title: { absolute: 'RupeeKit Calculator Guides | India Money Questions' },
  description: 'Practical India-focused answers for home loans, SWP, HRA, gratuity, personal-loan APR, emergency funds, prepayment and foreclosure.',
  alternates: { canonical: `${SITE_URL}/guides` },
  robots: { index: true, follow: true },
};

export default function CalculatorGuidesPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'RupeeKit calculator guides',
    itemListElement: allGuides.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.title,
      url: `${SITE_URL}/guides/${guide.slug}`,
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brandNavy">Decision guides</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-brandDeepNavy md:text-5xl">
          Calculator-backed answers to real money questions
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Each guide gives a direct answer, a worked example and a link to the calculator that lets you test your own
          numbers. Results are educational estimates, not personalised financial, tax or legal advice.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {allGuideClusters.map((cluster) => {
          const guides = allGuides.filter((guide) => guide.clusterId === cluster.id);
          return (
            <section key={cluster.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold text-slate-950">{cluster.title}</h2>
                  <p className="mt-2 leading-7 text-slate-600">{cluster.description}</p>
                </div>
                <Link
                  href={`/tools/${cluster.toolSlug}`}
                  className="shrink-0 rounded-full bg-brandNavy px-5 py-2.5 text-sm font-bold text-white hover:bg-brandDeepNavy"
                >
                  Open calculator
                </Link>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {guides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brandNavy/30 hover:bg-white hover:shadow-sm"
                  >
                    <span className="font-bold text-slate-900">{guide.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">{guide.answer}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
