import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { indexableGovernmentSalaryUpdates } from '@/data/government-salary-updates';
import UpdateVisual from '@/components/updates/UpdateVisual';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  EDITORIAL_TEAM_NAME,
  editorialTeamRef,
} from '@/lib/seo/editorial';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

type VisualKey = 'da-dr' | 'pay-commission' | 'pension' | 'government-salary';

const categoryVisualMap: Record<string, VisualKey> = {
  'DA Update': 'da-dr',
  'Pay Revision': 'pay-commission',
  Pension: 'pension',
  Allowances: 'government-salary',
  Arrears: 'da-dr',
  Circular: 'pay-commission',
};

const categoryBadgeColors: Record<string, string> = {
  'DA Update': 'bg-green-50 text-green-800 border-green-200',
  'Pay Revision': 'bg-blue-50 text-blue-800 border-blue-200',
  Pension: 'bg-orange-50 text-orange-800 border-orange-200',
  Allowances: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  Arrears: 'bg-amber-50 text-amber-800 border-amber-200',
  Circular: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return indexableGovernmentSalaryUpdates.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const update = indexableGovernmentSalaryUpdates.find((u) => u.slug === params.slug);
  if (!update) return { title: 'Update Not Found | RupeeKit' };
  const pageUrl = `${SITE_URL}/government-salary-updates/${update.slug}`;
  const cleanSummary = update.summary.substring(0, 155);
  return {
    title: { absolute: `${update.title} | Government Salary Updates | RupeeKit` },
    description: cleanSummary,
    alternates: {
      canonical: pageUrl,
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: `${update.title} | Government Salary Updates | RupeeKit`,
      description: cleanSummary,
      url: pageUrl,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${update.title} | Government Salary Updates | RupeeKit`,
      description: cleanSummary,
    },
  };
}

export default function GovernmentSalaryUpdateDetailPage({ params }: PageProps) {
  const update = indexableGovernmentSalaryUpdates.find((u) => u.slug === params.slug);
  if (!update) notFound();
  const pageUrl = `${SITE_URL}/government-salary-updates/${update.slug}`;
  const dateModified = (update as { modifiedDate?: string }).modifiedDate || update.publishedDate;

  const visualType = categoryVisualMap[update.category] ?? 'government-salary';
  const catColor = categoryBadgeColors[update.category] ?? 'bg-slate-100 text-slate-700 border-slate-200';

  const formattedPublished = new Date(update.publishedDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: update.title,
    description: update.summary,
    datePublished: update.publishedDate,
    dateModified,
    author: editorialTeamRef,
    reviewedBy: editorialTeamRef,
    publisher: { '@id': `${SITE_URL}/#organization` },
    publishingPrinciples: EDITORIAL_POLICY_URL,
    correctionsPolicy: CORRECTIONS_POLICY_URL,
    mainEntityOfPage: pageUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Government Salary Updates',
        item: `${SITE_URL}/government-salary-updates`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: update.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-brandMuted font-medium flex-wrap">
        <Link href="/" className="hover:text-brandNavy transition">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/updates" className="hover:text-brandNavy transition">Updates</Link>
        <span aria-hidden="true">›</span>
        <Link href="/government-salary-updates" className="hover:text-brandNavy transition">Government Salary Updates</Link>
        <span aria-hidden="true">›</span>
        <span className="text-brandText line-clamp-1 max-w-[200px]">{update.title}</span>
      </nav>

      {/* Hero Header */}
      <section className="rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 px-6 py-8 md:px-10 md:py-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brandGrowthGreen/20 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <UpdateVisual type={visualType} size="sm" />
            <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide ${catColor}`}>
              {update.category}
            </span>
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
              {update.state}
            </span>
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
              Educational Summary
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black tracking-tight leading-snug md:text-3xl text-white">
            {update.title}
          </h1>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span>
              By{' '}
              <Link
                href="/editorial-policy"
                className="font-semibold text-white underline underline-offset-2"
              >
                {EDITORIAL_TEAM_NAME}
              </Link>
            </span>
            <span>·</span>
            <span>{update.sourceName}</span>
            <span>·</span>
            <span>Published: {formattedPublished}</span>
            {update.effectiveDate && (
              <>
                <span>·</span>
                <span>Effective: {update.effectiveDate}</span>
              </>
            )}
            <span>·</span>
            <Link href="/corrections-policy" className="underline underline-offset-2">
              Report a correction
            </Link>
          </div>
        </div>
      </section>

      {/* Employee Group + Update Type */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-brandMuted mb-1">Employee Group</p>
            <p className="text-sm font-semibold text-brandDeepNavy">{update.employeeGroup}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-brandMuted mb-1">Update Type</p>
            <p className="text-sm font-semibold text-brandDeepNavy">{update.updateType}</p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 md:p-8 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brandDeepNavy">Summary</h2>
        <p className="text-sm leading-relaxed text-slate-700">{update.summary}</p>
      </section>

      {/* Why It Matters */}
      <section className="rounded-3xl border border-brandBorder bg-brandBgSoft p-6 md:p-8 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brandDeepNavy flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brandNavy/10 text-brandNavy text-xs font-bold">1</span>
          Why It Matters
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">{update.whyItMatters}</p>
      </section>

      {/* Who May Be Affected */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 md:p-8 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-brandDeepNavy flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brandNavy/10 text-brandNavy text-xs font-bold">2</span>
          Who May Be Affected
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">{update.whoMayBeAffected}</p>
      </section>

      {/* What to Verify */}
      <section className="rounded-3xl border border-green-200 bg-green-50 p-6 md:p-8 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-200 text-green-800 text-xs font-bold">✓</span>
          What to Verify
        </h2>
        <p className="text-sm leading-relaxed text-green-900">{update.actionToVerify}</p>
      </section>

      {/* Announcement vs Order Educational Note */}
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-amber-900">Announcement vs Official Order: Understanding the Difference</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Announcement / Cabinet Decision</p>
            <p className="text-xs leading-relaxed text-amber-900">The public announcement or Cabinet approval is the political/administrative decision stage. It is not by itself a legally binding pay order.</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Official Order / Circular (OM / GO)</p>
            <p className="text-xs leading-relaxed text-amber-900">The signed Office Memorandum (OM) or Government Order (GO) published by the Finance Department is the legally binding document. Payroll changes are processed after this is issued.</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Effective Date</p>
            <p className="text-xs leading-relaxed text-amber-900">The date from which the revised rate is applicable for calculation purposes — often backdated (e.g., 1 January even if the order is issued in March).</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Payment / Credit Date</p>
            <p className="text-xs leading-relaxed text-amber-900">The actual date when revised salary or arrears are credited to your bank account — which may be weeks after the effective date due to payroll processing cycles.</p>
          </div>
        </div>
      </section>

      {/* Official Source Link */}
      {update.sourceUrl && (
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-brandDeepNavy mb-3">Official Source</h2>
          <p className="text-xs text-brandMuted mb-4">
            Verify this information directly from the official government or department source below.
          </p>
          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brandNavy px-6 py-2.5 text-sm font-bold text-white hover:bg-brandDeepNavy transition shadow-sm"
          >
            Visit Official Source ↗
          </a>
          <p className="mt-3 text-[11px] text-brandMuted">
            Opens {update.sourceName} · External official government website
          </p>
        </section>
      )}

      {/* Tags */}
      {update.tags && update.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {update.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brandBgSoft border border-brandBorder px-3 py-1 text-[11px] font-medium text-brandMuted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Related Links */}
      {update.relatedLinks && update.relatedLinks.length > 0 && (
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-brandDeepNavy mb-4">Related Official References</h2>
          <div className="flex flex-wrap gap-3">
            {update.relatedLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brandNavy/5 border border-brandNavy/15 px-4 py-2 text-sm font-semibold text-brandNavy hover:bg-brandNavy/10 transition"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </section>
      )}

      {/* RupeeKit Tools */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-brandDeepNavy mb-4">Related RupeeKit Tools</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tools/salary-in-hand-calculator-india"
            className="rounded-full bg-brandNavy/5 border border-brandNavy/15 px-4 py-2 text-sm font-semibold text-brandNavy hover:bg-brandNavy/10 transition"
          >
            Salary In-Hand Calculator →
          </Link>
          <Link
            href="/government-salary-updates"
            className="rounded-full bg-brandNavy/5 border border-brandNavy/15 px-4 py-2 text-sm font-semibold text-brandNavy hover:bg-brandNavy/10 transition"
          >
            All Government Salary Updates →
          </Link>
        </div>
      </section>

      {/* Educational Disclaimer */}
      <section className="rounded-2xl border border-brandBorder bg-brandBgSoft p-5 text-xs leading-relaxed text-brandMuted">
        <p className="font-bold text-brandDeepNavy mb-1">Educational Disclaimer</p>
        <p>
          RupeeKit updates are for general educational information only and are not financial, tax, legal, or employment advice. Always verify rules, rates, eligibility, effective dates, arrears, and circulars from official state or central government sources before acting. RupeeKit is not affiliated with or endorsed by any government body mentioned on this page.
        </p>
      </section>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <Link
          href="/government-salary-updates"
          className="inline-flex items-center gap-2 text-sm font-bold text-brandNavy hover:text-brandDeepNavy transition"
        >
          ← Back to Government Salary Updates
        </Link>
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brandMuted hover:text-brandNavy transition"
        >
          Browse all updates →
        </Link>
      </div>
    </div>
  );
}
