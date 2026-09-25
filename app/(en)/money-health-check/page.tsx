import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import MoneyHealthCheckQuiz from '@/components/MoneyHealthCheckQuiz';
import { moneyHealthBands, moneyHealthQuestions } from '@/data/money-health-check';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Money Health Check: Free Personal Finance Self-Assessment';
const DESCRIPTION =
  'Take a free 60-second money health check to get a personal score, find your next financial milestone and see resources to build a strong foundation.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: withLanguageAlternates({
    canonical: `${SITE_URL}/money-health-check`,
  }),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/money-health-check`,
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

export default function MoneyHealthCheckPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="text-center max-w-2xl mx-auto mb-10">
        <span className="rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brandNavy">
          Self-Reflection Tool
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-brandNavy md:text-5xl">
          Money Health Check
        </h1>
        <p className="mt-3 text-brandMuted text-base leading-relaxed">
          Evaluate your money habits in 60 seconds. Reflect on key baseline practices, calculate your score, and explore educational steps to progress.
        </p>
      </header>

      <MoneyHealthCheckQuiz />

      <section className="mx-auto mt-12 max-w-2xl" aria-labelledby="check-covers">
        <h2 id="check-covers" className="text-2xl font-black text-brandNavy dark:text-white">What the check covers</h2>
        <p className="mt-3 text-base leading-relaxed text-brandMuted">Eight yes-or-no questions about everyday money habits. Your answers are not saved.</p>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-700 dark:text-slate-300">
          {moneyHealthQuestions.map((question) => <li key={question.id}>{question.text}</li>)}
        </ol>
      </section>

      <section className="mx-auto mt-10 max-w-2xl" aria-labelledby="check-score">
        <h2 id="check-score" className="text-2xl font-black text-brandNavy dark:text-white">How the score works</h2>
        <p className="mt-3 text-base leading-relaxed text-brandMuted">Each yes adds 12.5 points, so the score runs from 0 to 100. It reflects habits, not income or net worth.</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
          {moneyHealthBands.map((band) => <li key={band.range}><strong>{band.range}</strong> · {band.category}</li>)}
        </ul>
        <p className="mt-4 text-xs leading-6 text-brandMuted">The check is an educational self-reflection tool, not financial advice.</p>
      </section>
    </div>
  );
}
