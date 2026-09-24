import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { toolClusters } from '@/data/tool-clusters';
import { moneyGuides } from '@/data/money-authority';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export const metadata: Metadata = {
  title: { absolute: 'Financial Calculator Hubs India | RupeeKit' },
  description: 'Browse RupeeKit calculator hubs for loans, tax, investing, insurance, pensions, life-stage planning and small savings in India.',
  alternates: withLanguageAlternates({ canonical: `${SITE_URL}/tool-hubs` }),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
};

export default function ToolHubsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <nav className="text-sm text-brandMuted">
        <Link href="/" className="font-semibold text-brandNavy hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span>Calculator hubs</span>
      </nav>

      <header className="mt-6 rounded-[2rem] bg-brandDeepNavy px-6 py-10 text-white md:px-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brandBrightGreen">Browse by decision</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Calculator hubs for the question you are solving</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
          Each hub explains which RupeeKit tool to use first, what to compare next, and where official rules or changing rates need a fresh check.
        </p>
      </header>

      <section className="mt-10 rounded-3xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/20">
        <h2 className="text-2xl font-black text-brandDeepNavy dark:text-white">Money decision guides</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">Explore {moneyGuides.length} focused guides with worked examples, calculators and official sources for salary, loans, investing, EPF, PPF, credit cards, GST, gratuity and housing.</p>
        <Link href="/money-guides" className="mt-3 inline-flex min-h-11 items-center font-bold text-brandNavy underline dark:text-brandBrightGreen">Browse the money guides →</Link>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {toolClusters.map((cluster) => (
          <article key={cluster.slug} className="rounded-3xl border border-brandBorder bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-brandDeepNavy dark:text-white">{cluster.name}</h2>
            <p className="mt-3 text-sm leading-7 text-brandMuted dark:text-slate-300">{cluster.description}</p>
            <Link href={`/tool-hubs/${cluster.slug}`} className="mt-5 inline-flex min-h-11 items-center font-bold text-brandNavy hover:underline dark:text-brandBrightGreen">
              Open {cluster.name} hub <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
