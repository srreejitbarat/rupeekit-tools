import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { moneyGuides } from '@/data/money-authority';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export const metadata: Metadata = {
  title: { absolute: 'Indian Money Decision Guides | RupeeKit' },
  description: 'Ten practical money guides connecting RupeeKit calculators, original worked examples, assumptions and official Indian sources.',
  alternates: withLanguageAlternates({ canonical: `${SITE_URL}/money-guides` }),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
};

export default function MoneyGuidesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <nav className="text-sm text-brandMuted">
        <Link href="/" className="font-semibold text-brandNavy hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span>Money guides</span>
      </nav>
      <header className="mt-6 rounded-[2rem] bg-brandDeepNavy p-8 text-white md:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-brandBrightGreen">India money decisions</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Start with the decision, then run the numbers</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200">
          Each guide shows a direct answer, reproducible example, important assumptions, calculators
          and primary sources. Rates in examples are explicitly hypothetical; check official pages
          for rules that change.
        </p>
      </header>
      {(['P0', 'P1'] as const).map((priority) => (
        <section className="mt-12" key={priority} aria-labelledby={`guide-group-${priority}`}>
          <h2 id={`guide-group-${priority}`} className="text-2xl font-black text-brandDeepNavy dark:text-white">
            {priority === 'P0' ? 'Start here: core decisions' : 'Explore more decisions'}
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {moneyGuides.filter((guide) => guide.priority === priority).map((guide) => (
              <article key={guide.slug} className="rounded-3xl border border-brandBorder bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xl font-bold text-brandDeepNavy dark:text-white">
                  <Link href={`/money-guides/${guide.slug}`} className="hover:underline">{guide.title}</Link>
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{guide.description}</p>
                <Link className="mt-5 inline-flex min-h-11 items-center font-bold text-brandNavy hover:underline dark:text-brandBrightGreen" href={`/money-guides/${guide.slug}`}>
                  Read the guide <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
