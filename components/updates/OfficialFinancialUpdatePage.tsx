import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { FinancialUpdate } from '@/data/financial-updates';
import { day18FinancialUpdates } from '@/data/day18-financial-updates';
import { editorialTeamRef } from '@/lib/seo/editorial';
import FinancialUpdatesSignup from '@/components/updates/FinancialUpdatesSignup';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export function getDay18Update(slug: string): FinancialUpdate {
  const update = day18FinancialUpdates.find((item) => item.slug === slug);
  if (!update) throw new Error(`Unknown Day 18 update slug: ${slug}`);
  return update;
}

export function buildDay18UpdateMetadata(slug: string): Metadata {
  const update = getDay18Update(slug);
  const pageUrl = `${SITE_URL}/financial-updates/${update.slug}`;
  const pageTitle = update.seoTitle ?? update.title;
  const pageDescription = update.metaDescription ?? update.summary;
  return {
    title: { absolute: `${pageTitle} | RupeeKit Updates` },
    description: pageDescription,
    alternates: withLanguageAlternates({ canonical: pageUrl }),
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: `${pageTitle} | RupeeKit Updates`,
      description: pageDescription,
      url: pageUrl,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | RupeeKit Updates`,
      description: pageDescription,
    },
  };
}

export default function OfficialFinancialUpdatePage({ update }: { update: FinancialUpdate }) {
  const pageUrl = `${SITE_URL}/financial-updates/${update.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': update.schemaType ?? 'NewsArticle',
    headline: update.title,
    description: update.summary,
    datePublished: update.publishedDate,
    dateModified: update.modifiedDate ?? update.publishedDate,
    inLanguage: 'en-IN',
    author: editorialTeamRef,
    reviewedBy: editorialTeamRef,
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    citation: (update.officialSources ?? []).map((source) => source.href),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Financial Updates', item: `${SITE_URL}/financial-updates` },
      { '@type': 'ListItem', position: 3, name: update.title, item: pageUrl },
    ],
  };
  const faqSchema = update.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: update.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /> : null}

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-brandMuted">
        <Link href="/">Home</Link><span aria-hidden="true">›</span>
        <Link href="/financial-updates">Financial Updates</Link><span aria-hidden="true">›</span>
        <span className="max-w-[240px] truncate">{update.title}</span>
      </nav>

      <header className="rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 px-6 py-9 text-white shadow-xl md:px-10">
        <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide text-white/80">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">{update.category}</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Official-source explainer</span>
        </div>
        <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">{update.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">{update.summary}</p>
        <p className="mt-5 text-xs text-slate-300">
          Published {new Date(update.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          {update.lastReviewed ? ` · Reviewed ${update.lastReviewed}` : ''}
        </p>
      </header>

      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Quick answer</p>
        <p className="mt-3 text-base leading-8 text-emerald-950 md:text-lg">{update.quickAnswer ?? update.summary}</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-brandDeepNavy">What did the official source confirm?</h2>
          {update.whatHappened ? <p className="mt-3 leading-7 text-slate-700">{update.whatHappened}</p> : null}
          {update.officialFacts?.length ? (
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {update.officialFacts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
          ) : null}
        </article>
        <article className="rounded-3xl border border-brandBorder bg-brandBgSoft p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-brandDeepNavy">What does it mean in plain language?</h2>
          <p className="mt-3 leading-7 text-slate-700">{update.plainLanguageExplanation ?? update.whyItMatters}</p>
          <h3 className="mt-6 font-black text-brandDeepNavy">Why it matters</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{update.whyItMatters}</p>
        </article>
      </section>

      {update.effectiveDate ? (
        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-blue-950">Date / availability</h2>
          <p className="mt-3 leading-7 text-blue-950">{update.effectiveDate}</p>
        </section>
      ) : null}

      {(update.whoMayBeAffected || update.whoMayNotBeAffected) ? (
        <section className="grid gap-5 md:grid-cols-2">
          {update.whoMayBeAffected ? <article className="rounded-3xl border border-brandBorder bg-white p-6"><h2 className="text-lg font-black text-brandDeepNavy">Who may be affected?</h2><p className="mt-3 text-sm leading-6 text-slate-700">{update.whoMayBeAffected}</p></article> : null}
          {update.whoMayNotBeAffected ? <article className="rounded-3xl border border-brandBorder bg-white p-6"><h2 className="text-lg font-black text-brandDeepNavy">Who may not be affected?</h2><p className="mt-3 text-sm leading-6 text-slate-700">{update.whoMayNotBeAffected}</p></article> : null}
        </section>
      ) : null}

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-black text-amber-950">What should you verify?</h2>
        <p className="mt-3 leading-7 text-amber-950">{update.whatToVerify}</p>
        {update.announcementVsOrderNote ? <p className="mt-4 border-t border-amber-200 pt-4 text-sm leading-6 text-amber-900"><strong>Important:</strong> {update.announcementVsOrderNote}</p> : null}
      </section>

      <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-black text-brandDeepNavy">Related RupeeKit calculators and guides</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {update.relatedRupeeKitLinks.map((item) => (
            <li key={item.href}><Link href={item.href} className="block rounded-2xl border border-brandBorder p-4 text-sm font-bold text-brandNavy hover:bg-brandBgSoft">{item.label} →</Link></li>
          ))}
        </ul>
      </section>

      <FinancialUpdatesSignup placement="financial_update" context={update.slug} />

      {update.faqs?.length ? (
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-brandDeepNavy">FAQs</h2>
          <div className="mt-5 space-y-5">
            {update.faqs.map((faq) => <article key={faq.question}><h3 className="font-bold text-brandDeepNavy">{faq.question}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{faq.answer}</p></article>)}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-black text-brandDeepNavy">Sources and methodology</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">{update.methodology ?? 'RupeeKit reviewed the primary sources listed below and kept this page educational.'}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {(update.officialSources ?? []).map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brandNavy underline underline-offset-2">{source.label} ↗</a></li>)}
        </ul>
        <p className="mt-5 text-xs leading-6 text-brandMuted">Educational information only. RupeeKit does not provide personalised financial, investment, legal, loan or tax advice. Verify current rules and dates from the official sources before acting.</p>
      </section>
    </main>
  );
}
