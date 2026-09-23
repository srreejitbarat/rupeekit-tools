import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Start Here: Beginner Money Tools and Guides | RupeeKit';
const DESCRIPTION =
  'Start your money journey with RupeeKit. Explore free calculators, beginner guides, and educational resources to make confident financial decisions.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/start-here`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/start-here`,
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

export default function StartHerePage() {
  const steps = [
    {
      title: 'Check Your Money Health Score',
      description: 'Answer 8 simple yes/no questions to assess your savings habits, budgeting routine, debt awareness, and mindset. Get a personalized score and 3 practical next steps.',
      href: '/money-health-check',
      actionText: 'Money Health Check',
      badge: 'Quiz',
      badgeColor: 'bg-emerald-50 border-emerald-100 text-brandGrowthGreen',
      buttonColor: 'bg-brandGrowthGreen hover:bg-emerald-600 text-white',
    },
    {
      title: 'Explore Free Calculators',
      description: 'Estimate take-home salary, loan EMIs, GST splits, mutual fund SIP returns, and fixed deposit interest — with clear formulas and step-by-step math shown.',
      href: '/#calculators',
      actionText: 'Open Calculator',
      badge: 'Tools',
      badgeColor: 'bg-sky-50 border-sky-100 text-sky-700',
      buttonColor: 'bg-brandNavy hover:bg-brandDeepNavy text-white',
    },
    {
      title: 'Start the 30-Day Budget Challenge',
      description: 'Build daily money habits in one month. Log fixed and variable expenses, track tasks, and watch your progress score grow over 30 consecutive days.',
      href: '/resources/30-day-budget-challenge',
      actionText: 'Begin Challenge',
      badge: 'Challenge',
      badgeColor: 'bg-indigo-50 border-indigo-100 text-indigo-700',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    {
      title: 'Read Beginner Finance Guides',
      description: 'Explore jargon-free explanations of budgeting rules, emergency funds, debt strategies, saving vs investing differences, and money mindset fundamentals.',
      href: '/blog',
      actionText: 'Read Guide',
      badge: 'Guides',
      badgeColor: 'bg-amber-50 border-amber-100 text-amber-700',
      buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      {/* Hero Section */}
      <section className="rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 px-6 py-10 md:px-12 md:py-14 text-white shadow-xl relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-brandGrowthGreen/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-brandNavy/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brandBrightGreen">
            New to RupeeKit?
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight leading-tight md:text-5xl text-white">
            Start your money journey with one simple step
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200 md:text-base">
            Start here to choose the right tool, guide, or challenge for your financial situation.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            RupeeKit offers free financial calculators, beginner-friendly guides, and interactive educational resources — designed to help you understand how your money works.
          </p>

          {/* Hero CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/money-health-check"
              className="rounded-full bg-brandGrowthGreen px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 hover:shadow-md transition"
            >
              Start Money Health Check
            </Link>
            <Link
              href="/#calculators"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition"
            >
              Explore Free Calculators
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-brandDeepNavy md:text-3xl">Choose your path</h2>
          <p className="mt-2 text-sm text-brandMuted">Select any option below to begin learning and planning.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col justify-between rounded-3xl border border-brandBorder bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
            >
              <div>
                <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${step.badgeColor}`}>
                  {step.badge}
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-brandDeepNavy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brandMuted">
                  {step.description}
                </p>
              </div>
              <Link
                href={step.href}
                className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition ${step.buttonColor}`}
              >
                {step.actionText} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Educational Disclaimer */}
      <section className="border-t border-brandBorder pt-6">
        <p className="text-xs leading-relaxed text-brandMuted text-center">
          <span className="font-semibold text-brandDeepNavy">Educational disclaimer:</span>{' '}
          RupeeKit content is for general educational information only and is not financial, tax, legal, or investment advice.
        </p>
      </section>
    </div>
  );
}
