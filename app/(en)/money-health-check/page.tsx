import type { Metadata } from 'next';
import MoneyHealthCheckQuiz from '@/components/MoneyHealthCheckQuiz';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Money Health Check: Free Personal Finance Self-Assessment | RupeeKit';
const DESCRIPTION =
  'Take our 60-second interactive money health check to get a personalized score, identify your next financial milestone, and discover global resources to build a strong foundation.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/money-health-check`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
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
    </div>
  );
}
