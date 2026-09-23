import type { Metadata } from 'next';
import Link from 'next/link';
import PersonalFinanceRoadmap from '@/components/PersonalFinanceRoadmap';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Free Personal Finance Resources and Money Tools | RupeeKit';
const DESCRIPTION =
  'Explore our library of free personal finance resources. Discover our Money Health Check, the 30-Day Budget Challenge, recommended books, and educational guides.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/resources`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/resources`,
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

export default function ResourcesPage() {
  const showUpdates = false;

  const guideLinks = [
    {
      title: 'How to Create a Monthly Budget',
      category: 'Budgeting',
      categoryColor: 'bg-indigo-50 border-indigo-100 text-indigo-700',
      description: 'Learn the step-by-step process of creating a monthly budget, using the 50/30/20 rule, and automating investments.',
      href: '/blog/how-to-create-a-monthly-budget',
    },
    {
      title: 'How to Track Expenses',
      category: 'Budgeting',
      categoryColor: 'bg-indigo-50 border-indigo-100 text-indigo-700',
      description: 'Master expense tracking with our guide. Explore spreadsheets and envelope budgeting to plug spending leaks.',
      href: '/blog/how-to-track-expenses',
    },
    {
      title: 'How Much Emergency Fund Do You Need?',
      category: 'Savings',
      categoryColor: 'bg-emerald-50 border-emerald-100 text-emerald-700',
      description: 'Discover how to calculate and build an emergency cushion. Understand safety, liquidity, and asset parking rules.',
      href: '/blog/how-much-emergency-fund',
    },
    {
      title: 'Saving vs Investing for Beginners',
      category: 'Investing',
      categoryColor: 'bg-sky-50 border-sky-100 text-sky-700',
      description: 'Learn the critical differences between saving and investing. Understand when to save and when to compound wealth.',
      href: '/blog/saving-vs-investing-for-beginners',
    },
    {
      title: 'Debt Repayment Planning Guide',
      category: 'Debt',
      categoryColor: 'bg-rose-50 border-rose-100 text-rose-700',
      description: 'Struggling with debt? Compare the Debt Snowball and Debt Avalanche methods to pay off loans faster.',
      href: '/blog/debt-repayment-planning-for-beginners',
    },
    {
      title: 'Curated Personal Finance Reading List',
      category: 'Resources',
      categoryColor: 'bg-amber-50 border-amber-100 text-amber-700',
      description: 'Discover the top personal finance books for beginners, hand-selected to build your financial literacy.',
      href: '/blog/best-personal-finance-books-for-beginners',
    },
    {
      title: 'ITR-2 AY 2026-27 Filing Guide',
      category: 'Tax',
      categoryColor: 'bg-violet-50 border-violet-100 text-violet-700',
      description: 'Get a practical walkthrough on who should file ITR-2, due dates, document preparation, and regime selection.',
      href: '/blog/itr-2-ay-2026-27-filing-guide',
    },
  ];

  const calculatorLinks = [
    { name: 'Old vs New Tax Regime Calculator', href: '/tools/income-tax-calculator-old-vs-new-regime-india' },
    { name: 'Emergency Fund Calculator India', href: '/tools/emergency-fund-calculator-india' },
    { name: 'Personal Loan EMI Calculator India', href: '/tools/personal-loan-emi-calculator-india' },
    { name: 'HRA Exemption Calculator India', href: '/tools/hra-exemption-calculator-india' },
    { name: 'FD Calculator India', href: '/tools/fd-calculator-india' },
    { name: 'SIP Calculator India', href: '/tools/sip-calculator-india' },
    { name: 'Salary In-Hand Calculator India', href: '/tools/salary-in-hand-calculator-india' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-12 space-y-10">
      {/* Page Header */}
      <header className="text-center max-w-2xl mx-auto">
        <span className="rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brandNavy">
          RupeeKit Hub
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-brandNavy md:text-5xl">
          Financial Resources &amp; Library
        </h1>
        <p className="mt-4 text-brandMuted text-lg leading-relaxed">
          High-quality educational tools, interactive challenges, and structured guides to help you build a solid financial foundation.
        </p>
      </header>

      {/* Prominent Money Health Check CTA */}
      <section className="rounded-3xl border border-brandBorder bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 p-8 text-white shadow-md relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-brandGrowthGreen/20 blur-3xl pointer-events-none"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-white/20">
              Interactive Assessment
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              What is your Money Health Score?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Take our free 60-second self-reflection quiz. Answer 8 simple questions to assess your savings, debt, tracking habits, and get your personalized score.
            </p>
          </div>
          <Link
            href="/money-health-check"
            className="mt-4 md:mt-0 whitespace-nowrap rounded-full bg-brandGrowthGreen px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 hover:shadow-md transition text-center"
          >
            Start Health Check
          </Link>
        </div>
      </section>

      {/* Main Sections Grid — balanced 2 columns when showUpdates is false */}
      <div className={`grid gap-6 ${showUpdates ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {/* 30-Day Budget Challenge */}
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              Start Here
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-brandDeepNavy">
              30-Day Budget Challenge
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brandMuted">
              Ready to build strong savings habits? Join our free challenge. Log fixed and variable expenses, track daily tasks, and watch your progress score increase over 30 days.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-brandBorder">
            <Link
              href="/resources/30-day-budget-challenge"
              className="inline-flex items-center rounded-full bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white transition"
            >
              Join the Challenge →
            </Link>
          </div>
        </section>

        {/* Free Money Tools */}
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="inline-block rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Free Money Tools
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-brandDeepNavy">
              Calculators &amp; Estimators
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brandMuted">
              Estimate loan repayments, savings compound schedules, fixed deposits, and salary take-home amounts with transparent visual breakdowns.
            </p>
            {/* Pill links */}
            <div className="mt-4 flex flex-wrap gap-2">
              {calculatorLinks.map((calc) => (
                <Link
                  key={calc.name}
                  href={calc.href}
                  className="rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3 py-1 text-xs font-bold text-brandNavy hover:bg-brandNavy hover:text-white transition"
                >
                  {calc.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-brandBorder">
            <Link
              href="/#calculators"
              className="inline-flex items-center rounded-full bg-brandNavy hover:bg-brandDeepNavy px-5 py-2.5 text-sm font-bold text-white transition"
            >
              Explore All Tools →
            </Link>
          </div>
        </section>

        {/* Government Salary Updates — shown only when showUpdates = true */}
        {showUpdates && (
          <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Updates
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-brandDeepNavy">
                Government Salary Updates
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brandMuted">
                Track state-wise DA, DR, pay revisions, allowances, and official employee salary circulars in a transparent educational format.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brandBorder">
              <Link
                href="/government-salary-updates"
                className="inline-flex items-center text-sm font-bold text-brandNavy hover:text-brandDeepNavy transition"
              >
                Track Salary Updates <span className="ml-1">→</span>
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Updates Row */}
      {showUpdates && (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Finance &amp; Tax
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-brandDeepNavy">
                Financial &amp; Tax Updates
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brandMuted">
                Follow RBI policy changes, income tax updates, GST council decisions, SEBI rules, and banking news with plain-language RupeeKit educational summaries.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brandBorder">
              <Link href="/financial-updates" className="inline-flex items-center text-sm font-bold text-brandNavy hover:text-brandDeepNavy transition">
                View Financial Updates <span className="ml-1">→</span>
              </Link>
            </div>
          </section>
          <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                All Updates
              </span>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-brandDeepNavy">Updates Hub</h3>
              <p className="mt-3 text-sm leading-relaxed text-brandMuted">
                Your central dashboard for all RupeeKit educational updates — financial, government salary, state-wise employee, pension, DA/DR, and more.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brandBorder">
              <Link href="/updates" className="inline-flex items-center text-sm font-bold text-brandNavy hover:text-brandDeepNavy transition">
                Browse All Updates <span className="ml-1">→</span>
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* Personal Finance Roadmap */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 md:p-8 shadow-sm">
        <div className="max-w-xl mb-8">
          <span className="inline-block rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brandNavy">
            Path to Discipline
          </span>
          <h2 className="mt-4 text-2xl font-black text-brandDeepNavy">
            Personal Finance Roadmap
          </h2>
          <p className="mt-2 text-sm text-brandMuted">
            Review these six basic milestones to establish financial security. Adjust your focus stage systematically.
          </p>
        </div>
        <PersonalFinanceRoadmap />
      </section>

      {/* Personal Finance Guides */}
      <section className="space-y-6">
        <div className="max-w-xl">
          <h2 className="text-2xl font-black text-brandDeepNavy">Personal Finance Guides</h2>
          <p className="mt-2 text-sm text-brandMuted">
            Comprehensive, educational guides covering savings buffers, budget structures, mindset shifts, and debt strategies.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {guideLinks.map((guide) => (
            <div
              key={guide.title}
              className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${guide.categoryColor}`}>
                  {guide.category}
                </span>
                <h3 className="mt-4 text-base font-bold text-brandDeepNavy tracking-tight">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brandMuted">
                  {guide.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href={guide.href}
                  className="text-xs font-bold text-brandNavy hover:text-brandDeepNavy flex items-center gap-0.5"
                >
                  Read Guide <span className="text-brandMuted ml-0.5">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black text-brandDeepNavy">Recommended Money Planning Resources</h2>
          <p className="mt-2 text-sm leading-relaxed text-brandMuted">
            Explore upcoming educational resource collections designed for practical money planning workflows.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/resources/recommended-money-tools"
            className="rounded-2xl border border-brandBorder bg-brandBgSoft p-4 transition hover:border-brandNavy/30"
          >
            <p className="text-sm font-bold text-brandDeepNavy">Budget planners and expense trackers</p>
            <p className="mt-1 text-xs text-brandMuted">Internal picks and templates coming soon.</p>
          </Link>
          <Link
            href="/resources/recommended-money-tools"
            className="rounded-2xl border border-brandBorder bg-brandBgSoft p-4 transition hover:border-brandNavy/30"
          >
            <p className="text-sm font-bold text-brandDeepNavy">Tax document organizers</p>
            <p className="mt-1 text-xs text-brandMuted">Checklist-ready formats for filing prep.</p>
          </Link>
          <Link
            href="/resources/recommended-money-tools"
            className="rounded-2xl border border-brandBorder bg-brandBgSoft p-4 transition hover:border-brandNavy/30"
          >
            <p className="text-sm font-bold text-brandDeepNavy">Personal finance books</p>
            <p className="mt-1 text-xs text-brandMuted">Beginner-friendly reading tracks.</p>
          </Link>
          <Link
            href="/resources/recommended-money-tools"
            className="rounded-2xl border border-brandBorder bg-brandBgSoft p-4 transition hover:border-brandNavy/30"
          >
            <p className="text-sm font-bold text-brandDeepNavy">Emergency fund planning tools</p>
            <p className="mt-1 text-xs text-brandMuted">Step-by-step planning kits and worksheets.</p>
          </Link>
          <Link
            href="/resources/recommended-money-tools"
            className="rounded-2xl border border-brandBorder bg-brandBgSoft p-4 transition hover:border-brandNavy/30"
          >
            <p className="text-sm font-bold text-brandDeepNavy">Loan comparison worksheets</p>
            <p className="mt-1 text-xs text-brandMuted">EMI comparison templates by tenure and fee.</p>
          </Link>
          <Link
            href="/resources/recommended-money-tools"
            className="rounded-2xl border border-brandBorder bg-brandBgSoft p-4 transition hover:border-brandNavy/30"
          >
            <p className="text-sm font-bold text-brandDeepNavy">RupeeKit downloadable templates</p>
            <p className="mt-1 text-xs text-brandMuted">Calculator-friendly planning sheets.</p>
          </Link>
        </div>

        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          Some future resource links may be affiliate links. RupeeKit will disclose affiliate relationships clearly and
          will only link to relevant educational tools or resources.
        </p>
      </section>
    </div>
  );
}
