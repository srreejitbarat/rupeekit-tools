import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { financialUpdates } from '@/data/financial-updates';
import { getDiscoverImage } from '@/data/discover-images';
import UpdateVisual from '@/components/updates/UpdateVisual';
import DiscoverHeroImage from '@/components/seo/DiscoverHeroImage';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_TEAM_NAME,
  EDITORIAL_POLICY_URL,
  editorialTeamRef,
} from '@/lib/seo/editorial';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

type VisualKey =
  | 'rbi'
  | 'income-tax'
  | 'gst'
  | 'sebi'
  | 'banking'
  | 'personal-finance'
  | 'government-salary'
  | 'financial-updates';

const categoryVisualMap: Record<string, VisualKey> = {
  RBI: 'rbi',
  'Income Tax': 'income-tax',
  GST: 'gst',
  SEBI: 'sebi',
  Banking: 'banking',
  'Personal Finance': 'personal-finance',
  Markets: 'sebi',
  'Government Salary': 'government-salary',
};

const categoryBadgeColors: Record<string, string> = {
  RBI: 'bg-blue-50 text-blue-800 border-blue-200',
  'Income Tax': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  GST: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  SEBI: 'bg-violet-50 text-violet-800 border-violet-200',
  Banking: 'bg-slate-100 text-slate-700 border-slate-200',
  'Personal Finance': 'bg-green-50 text-green-800 border-green-200',
  Markets: 'bg-amber-50 text-amber-800 border-amber-200',
  'Government Salary': 'bg-orange-50 text-orange-800 border-orange-200',
};

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return financialUpdates.map((update) => ({ slug: update.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const update = financialUpdates.find((item) => item.slug === params.slug);
  if (!update) return { title: 'Update Not Found | RupeeKit' };

  const cleanSummary = update.summary.substring(0, 155);
  const pageUrl = `${SITE_URL}/financial-updates/${update.slug}`;
  const discoverImage = getDiscoverImage(`/financial-updates/${update.slug}`);
  const heroImage = discoverImage ?? update.heroImage;
  const heroImageUrl = heroImage ? `${SITE_URL}${heroImage.src}` : undefined;

  return {
    title: { absolute: `${update.title} | RupeeKit Updates` },
    description: cleanSummary,
    alternates: { canonical: pageUrl },
    robots: {
      index: update.status !== 'sample',
      follow: update.status !== 'sample',
      'max-image-preview': 'large',
    },
    openGraph: {
      title: `${update.title} | RupeeKit Updates`,
      description: cleanSummary,
      url: pageUrl,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
      ...(heroImageUrl && heroImage
        ? {
            images: [
              {
                url: heroImageUrl,
                width: heroImage.width,
                height: heroImage.height,
                alt: heroImage.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${update.title} | RupeeKit Updates`,
      description: cleanSummary,
      ...(heroImageUrl ? { images: [heroImageUrl] } : {}),
    },
  };
}

export default function FinancialUpdateDetailPage({ params }: PageProps) {
  const update = financialUpdates.find((item) => item.slug === params.slug);
  if (!update) notFound();

  const pageUrl = `${SITE_URL}/financial-updates/${update.slug}`;
  const discoverImage = getDiscoverImage(`/financial-updates/${update.slug}`);
  const heroImage = discoverImage ?? update.heroImage;
  const heroImageUrl = heroImage ? `${SITE_URL}${heroImage.src}` : undefined;
  const dateModified = update.modifiedDate || update.publishedDate;
  const visualType = (categoryVisualMap[update.category] ?? 'financial-updates') as VisualKey;
  const catColor = categoryBadgeColors[update.category] ?? 'bg-slate-100 text-slate-700 border-slate-200';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': update.schemaType ?? 'Article',
    headline: update.title,
    description: update.summary,
    datePublished: update.publishedDate,
    dateModified,
    inLanguage: 'en-IN',
    author: editorialTeamRef,
    reviewedBy: editorialTeamRef,
    publisher: { '@id': `${SITE_URL}/#organization` },
    publishingPrinciples: EDITORIAL_POLICY_URL,
    correctionsPolicy: CORRECTIONS_POLICY_URL,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    ...(heroImageUrl ? { image: [heroImageUrl] } : {}),
    ...(update.officialSources?.length
      ? { citation: update.officialSources.map((source) => source.href) }
      : update.sourceUrl
        ? { citation: [update.sourceUrl] }
        : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Financial Updates',
        item: `${SITE_URL}/financial-updates`,
      },
      { '@type': 'ListItem', position: 3, name: update.title, item: pageUrl },
    ],
  };

  const faqSchema = update.faqs && update.faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: update.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-brandMuted">
        <Link href="/" className="transition hover:text-brandNavy">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/updates" className="transition hover:text-brandNavy">Updates</Link>
        <span aria-hidden="true">›</span>
        <Link href="/financial-updates" className="transition hover:text-brandNavy">Financial Updates</Link>
        <span aria-hidden="true">›</span>
        <span className="max-w-[220px] truncate text-brandText">{update.title}</span>
      </nav>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 px-6 py-8 text-white shadow-xl md:px-10 md:py-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brandGrowthGreen/20 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <UpdateVisual type={visualType} size="sm" />
              <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide ${catColor}`}>
                {update.category}
              </span>
              <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/80">
                Official-source explainer
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
              {update.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span>
                By{' '}
                <Link
                  href="/editorial-policy"
                  className="font-semibold text-white underline underline-offset-2"
                >
                  {EDITORIAL_TEAM_NAME}
                </Link>
              </span>
              <span aria-hidden="true">·</span>
              <span>{update.sourceName}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={update.publishedDate}>
                Published {new Date(update.publishedDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              {update.lastReviewed ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Reviewed {update.lastReviewed}</span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <Link href="/corrections-policy" className="underline underline-offset-2">
                Report a correction
              </Link>
            </div>
          </div>
          {heroImage ? <DiscoverHeroImage image={heroImage} priority /> : null}
        </div>
      </header>

      <section id="quick-answer" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Quick answer</p>
        <p className="mt-3 text-base leading-relaxed text-emerald-950 md:text-lg">
          {update.quickAnswer ?? update.summary}
        </p>
      </section>

      {update.story ? (
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brandGrowthGreen">A relatable story</p>
          <h2 className="mt-2 text-2xl font-black text-brandDeepNavy">{update.storyTitle ?? 'What this can look like in real life'}</h2>
          <p className="mt-4 leading-relaxed text-slate-700">{update.story}</p>
        </section>
      ) : null}

      {update.carouselSlides && update.carouselSlides.length > 0 ? (
        <section aria-labelledby="story-carousel-title" className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brandGrowthGreen">Visual story</p>
            <h2 id="story-carousel-title" className="mt-2 text-2xl font-black text-brandDeepNavy">
              Swipe through this update story
            </h2>
            <p className="mt-2 text-sm text-brandMuted">Each slide explains one part of the official update in simple language.</p>
          </div>
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4" aria-label={`${update.title} story slides`}>
            {update.carouselSlides.map((slide, index) => (
              <figure
                key={slide.src}
                className="min-w-[84%] snap-center overflow-hidden rounded-3xl border border-brandBorder bg-white shadow-sm sm:min-w-[58%] lg:min-w-[38%]"
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={1080}
                  height={1350}
                  className="h-auto w-full"
                  priority={index === 0}
                />
                <figcaption className="border-t border-brandBorder px-4 py-3 text-xs leading-relaxed text-brandMuted">
                  <span className="font-bold text-brandDeepNavy">Slide {index + 1}:</span> {slide.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-brandDeepNavy">What did the official source confirm?</h2>
          {update.whatHappened ? <p className="mt-3 leading-relaxed text-slate-700">{update.whatHappened}</p> : null}
          {update.officialFacts && update.officialFacts.length > 0 ? (
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-700">
              {update.officialFacts.map((fact) => (
                <li key={fact} className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brandNavy/10 text-[10px] font-black text-brandNavy">✓</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
        <article className="rounded-3xl border border-brandBorder bg-brandBgSoft p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-brandDeepNavy">What does this mean in normal language?</h2>
          <p className="mt-3 leading-relaxed text-slate-700">
            {update.plainLanguageExplanation ?? update.whyItMatters}
          </p>
          <h3 className="mt-6 text-base font-black text-brandDeepNavy">Why it matters</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{update.whyItMatters}</p>
        </article>
      </section>

      {update.effectiveDate ? (
        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-blue-950">When is this available?</h2>
          <p className="mt-3 leading-relaxed text-blue-950">{update.effectiveDate}</p>
        </section>
      ) : null}

      <section className="grid gap-5 md:grid-cols-2">
        {update.whoMayBeAffected ? (
          <article className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-black text-brandDeepNavy">Who may be affected?</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{update.whoMayBeAffected}</p>
          </article>
        ) : null}
        {update.whoMayNotBeAffected ? (
          <article className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-black text-brandDeepNavy">Who may not be affected?</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{update.whoMayNotBeAffected}</p>
          </article>
        ) : null}
      </section>

      {update.realisticExample ? (
        <section className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Realistic example</p>
          <h2 className="mt-2 text-2xl font-black text-violet-950">{update.realisticExample.title}</h2>
          <p className="mt-3 leading-relaxed text-violet-950">{update.realisticExample.body}</p>
        </section>
      ) : null}

      {update.practicalSteps && update.practicalSteps.length > 0 ? (
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-brandDeepNavy">What should you do now?</h2>
          <ol className="mt-5 space-y-4">
            {update.practicalSteps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brandNavy text-sm font-black text-white">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-relaxed text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {update.commonMisunderstandings && update.commonMisunderstandings.length > 0 ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-amber-950">Common misunderstandings</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {update.commonMisunderstandings.map((item) => (
              <article key={item.claim} className="rounded-2xl border border-amber-200 bg-white p-5">
                <p className="text-sm font-black text-amber-950">Myth: {item.claim}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700"><strong>Reality:</strong> {item.reality}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {update.announcementVsOrderNote ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-amber-950">Announcement and official note</h2>
          <p className="mt-3 leading-relaxed text-amber-950">{update.announcementVsOrderNote}</p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black text-green-950">What should you verify?</h2>
        <p className="mt-3 leading-relaxed text-green-950">{update.whatToVerify}</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-brandDeepNavy">Official authority and sources</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">Authority: {update.sourceName}</p>
          <div className="mt-5 space-y-3">
            {(update.officialSources ?? (update.sourceUrl ? [{ label: 'Read the official source', href: update.sourceUrl }] : [])).map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-brandNavy/15 bg-brandNavy/5 px-4 py-3 text-sm font-bold text-brandNavy transition hover:bg-brandNavy/10"
              >
                {source.label} ↗
              </a>
            ))}
          </div>
        </article>
        <article id="source-and-methodology" className="rounded-3xl border border-brandBorder bg-brandBgSoft p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black text-brandDeepNavy">Source and methodology</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {update.methodology ?? 'RupeeKit reviewed the official source and converted it into a plain-language educational summary without changing the stated facts.'}
          </p>
          {update.lastReviewed ? <p className="mt-4 text-xs font-bold text-brandMuted">Last reviewed: {update.lastReviewed}</p> : null}
        </article>
      </section>

      {update.faqs && update.faqs.length > 0 ? (
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-brandDeepNavy">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-brandBorder">
            {update.faqs.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="cursor-pointer list-none pr-8 text-base font-bold text-brandDeepNavy">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {update.tags && update.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {update.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-brandBorder bg-brandBgSoft px-3 py-1 text-[11px] font-medium text-brandMuted">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {update.relatedRupeeKitLinks.length > 0 ? (
        <section className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-brandDeepNavy">Related RupeeKit calculators and guides</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {update.relatedRupeeKitLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-brandNavy/15 bg-brandNavy/5 px-4 py-2 text-sm font-semibold text-brandNavy transition hover:bg-brandNavy/10"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-brandBorder bg-brandBgSoft p-5 text-xs leading-relaxed text-brandMuted">
        <p className="font-bold text-brandDeepNavy">Educational disclaimer</p>
        <p className="mt-2">
          RupeeKit updates are for general educational information only and are not personalised financial, tax, legal, or investment advice. Verify rules, dates, return-form applicability and disclosure requirements from official sources or a qualified professional. RupeeKit is not affiliated with or endorsed by the government authority mentioned on this page.
        </p>
      </section>

      <div className="flex flex-col items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
        <Link href="/financial-updates" className="inline-flex items-center gap-2 text-sm font-bold text-brandNavy transition hover:text-brandDeepNavy">
          ← Back to Financial Updates
        </Link>
        <Link href="/updates" className="inline-flex items-center gap-2 text-sm font-semibold text-brandMuted transition hover:text-brandNavy">
          Browse all updates →
        </Link>
      </div>
    </main>
  );
}
