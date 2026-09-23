import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  allGuides,
  getCalculatorGuide,
  getCalculatorGuideCluster,
} from '@/data/calculator-guides';
import { getDiscoverImage } from '@/data/discover-images';
import DiscoverHeroImage from '@/components/seo/DiscoverHeroImage';
import EditorialByline from '@/components/seo/EditorialByline';
import FinanceDisclaimer from '@/components/blog/FinanceDisclaimer';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  editorialTeamRef,
} from '@/lib/seo/editorial';

const SITE_URL = 'https://www.rupeekit.co.in';

export function generateStaticParams() {
  return allGuides.map((guide) => ({ slug: guide.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getCalculatorGuide(params.slug);
  if (!guide) return {};

  const canonicalPath = `/guides/${guide.slug}`;
  const canonical = `${SITE_URL}${canonicalPath}`;
  const discoverImage = getDiscoverImage(canonicalPath);
  const discoverImageUrl = discoverImage ? `${SITE_URL}${discoverImage.src}` : undefined;

  return {
    title: { absolute: guide.seoTitle },
    description: guide.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: guide.seoTitle,
      description: guide.metaDescription,
      url: canonical,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
      ...(discoverImageUrl && discoverImage
        ? {
            images: [{
              url: discoverImageUrl,
              width: discoverImage.width,
              height: discoverImage.height,
              alt: discoverImage.alt,
            }],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle,
      description: guide.metaDescription,
      ...(discoverImageUrl ? { images: [discoverImageUrl] } : {}),
    },
  };
}

export default function CalculatorGuidePage({ params }: { params: { slug: string } }) {
  const guide = getCalculatorGuide(params.slug);
  if (!guide) notFound();

  const cluster = getCalculatorGuideCluster(guide.clusterId);
  if (!cluster) notFound();

  const siblings = allGuides
    .filter((item) => item.clusterId === guide.clusterId && item.slug !== guide.slug)
    .slice(0, 5);
  const canonicalPath = `/guides/${guide.slug}`;
  const canonical = `${SITE_URL}${canonicalPath}`;
  const discoverImage = getDiscoverImage(canonicalPath);
  const discoverImageUrl = discoverImage ? `${SITE_URL}${discoverImage.src}` : undefined;
  const faqItems = [
    { question: guide.question, answer: guide.answer },
    {
      question: `Which calculator should I use for this question?`,
      answer: `Use RupeeKit's ${cluster.toolName} and replace the example with your own current figures.`,
    },
  ];

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.metaDescription,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      dateModified: guide.lastReviewedIso,
      datePublished: guide.lastReviewedIso,
      inLanguage: 'en-IN',
      author: editorialTeamRef,
      reviewedBy: editorialTeamRef,
      publisher: { '@id': `${SITE_URL}/#organization` },
      publishingPrinciples: EDITORIAL_POLICY_URL,
      correctionsPolicy: CORRECTIONS_POLICY_URL,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      ...(discoverImageUrl ? { image: discoverImageUrl } : {}),
      about: { '@type': 'Thing', name: cluster.title },
      mentions: {
        '@type': 'WebApplication',
        name: cluster.toolName,
        url: `${SITE_URL}/tools/${cluster.toolSlug}`,
      },
      ...(cluster.sources.length
        ? { citation: cluster.sources.map((source) => source.href) }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: canonical },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How ${cluster.toolName} approaches this calculation`,
      description: cluster.description,
      inLanguage: 'en-IN',
      mainEntityOfPage: canonical,
      step: cluster.methodSteps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link href="/" className="hover:text-brandNavy hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/guides" className="hover:text-brandNavy hover:underline">Guides</Link>
        <span className="mx-2">/</span>
        <span>{guide.title}</span>
      </nav>

      <article className="mt-7">
        <header className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brandNavy">{cluster.title}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-brandDeepNavy md:text-5xl">{guide.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">{guide.metaDescription}</p>
          <EditorialByline className="mt-3" updatedIso={guide.lastReviewedIso} />
        </header>

        {discoverImage ? (
          <DiscoverHeroImage image={discoverImage} className="mt-7" priority />
        ) : null}

        <section className="mt-8 rounded-3xl border border-brandNavy/15 bg-brandNavy/5 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brandNavy">Direct answer</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{guide.question}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-800">{guide.answer}</p>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">Worked example</h2>
            <p className="mt-4 leading-8 text-slate-700">{guide.example}</p>

            <h2 className="mt-8 text-2xl font-bold text-slate-950">What to check</h2>
            <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-slate-700">
              {guide.keyPoints.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </section>

          <aside className="rounded-3xl border border-sky-200 bg-sky-50 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Test your numbers</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{cluster.toolName}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{cluster.description}</p>
            <Link
              href={`/tools/${cluster.toolSlug}`}
              className="mt-5 inline-flex rounded-full bg-brandNavy px-5 py-3 text-sm font-bold text-white hover:bg-brandDeepNavy"
            >
              Open free calculator
            </Link>
            {cluster.relatedToolLinks?.length ? (
              <div className="mt-6 border-t border-sky-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">Related calculators</p>
                <ul className="mt-3 space-y-2">
                  {cluster.relatedToolLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm font-semibold text-sky-700 hover:underline">
                        {link.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-950">How the calculator approaches it</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {cluster.methodSteps.map((step, index) => (
              <li key={step} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <span className="mr-2 font-black text-brandNavy">{index + 1}.</span>{step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <h2 className="text-xl font-bold text-amber-950">Important limitation</h2>
          <p className="mt-3 leading-7 text-amber-950">{cluster.riskNote}</p>
        </section>

        {cluster.sources.length ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">Primary sources</h2>
            <ul className="mt-4 space-y-3">
              {cluster.sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 hover:underline">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-slate-950">Related questions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {siblings.map((item) => (
              <Link
                key={item.slug}
                href={`/guides/${item.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-900 hover:border-brandNavy/30 hover:text-brandNavy"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600">
          <h2 className="font-bold text-slate-900">FAQs</h2>
          {faqItems.map((item) => (
            <div key={item.question} className="mt-4">
              <h3 className="font-semibold text-slate-900">{item.question}</h3>
              <p className="mt-1">{item.answer}</p>
            </div>
          ))}
        </section>

        <div className="mt-8">
          <FinanceDisclaimer />
        </div>
      </article>
    </main>
  );
}
