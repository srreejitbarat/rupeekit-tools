import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMoneyGuide, moneyGuides, officialSources } from '@/data/money-authority';
import { getToolBySlug } from '@/lib/tools';
import { EDITORIAL_TEAM_ID, ORGANIZATION_ID } from '@/lib/seo/editorial';
import { getSourceBackedComparison } from '@/data/source-backed-comparisons';
import { moneyGuideRevisions } from '@/data/money-guide-revisions';
import SourceBackedComparison from '@/components/seo/SourceBackedComparison';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
type Props = { params: { slug: string } };

export function generateStaticParams() {
  return moneyGuides.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const guide = getMoneyGuide(params.slug);
  if (!guide) return {};
  const url = `${SITE_URL}/money-guides/${guide.slug}`;
  return {
    title: { absolute: `${guide.title} | RupeeKit` },
    description: guide.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: { title: guide.title, description: guide.description, url, type: 'article' },
  };
}

export default function MoneyGuidePage({ params }: Props) {
  const guide = getMoneyGuide(params.slug);
  if (!guide) notFound();
  const url = `${SITE_URL}/money-guides/${guide.slug}`;
  const comparison = getSourceBackedComparison(guide.slug);
  const revisions = moneyGuideRevisions[guide.slug] ?? [];
  const tools = guide.toolSlugs.map((slug) => getToolBySlug(slug)).filter((tool) => tool?.status === 'live');
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Money guides', item: `${SITE_URL}/money-guides` },
      { '@type': 'ListItem', position: 3, name: guide.title, item: url },
    ],
  };
  // Structured data mirrors the visible content and the actual official links.
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    inLanguage: 'en-IN',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    dateModified: guide.lastReviewedIso,
    author: { '@id': EDITORIAL_TEAM_ID },
    publisher: { '@id': ORGANIZATION_ID },
    citation: [...new Set([
      ...guide.sourceIds.map((id) => officialSources[id].url),
      ...(comparison?.sources.map((source) => source.url) ?? []),
    ])],
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
  const json = (value: object) => JSON.stringify(value).replace(/</g, '\\u003c');

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(article) }} />
      <nav className="text-sm text-brandMuted" aria-label="Breadcrumb">
        <Link href="/" className="font-semibold text-brandNavy hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/money-guides" className="font-semibold text-brandNavy hover:underline">Money guides</Link>
        <span className="mx-2">/</span>
        <span>{guide.title}</span>
      </nav>

      <article className="mt-6">
        <header className="rounded-[2rem] border border-brandBorder bg-white p-7 shadow-card dark:border-slate-800 dark:bg-slate-900 md:p-10">
          <p className="text-xs font-black uppercase tracking-widest text-brandGrowthGreen dark:text-brandBrightGreen">RupeeKit decision guide</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-brandDeepNavy dark:text-white">{guide.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300">{guide.description}</p>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            By <Link href="/editorial-policy" className="underline">RupeeKit Editorial Team</Link> · Last reviewed{' '}
            <time dateTime={guide.lastReviewedIso}>{guide.lastReviewedIso}</time>
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/20" aria-labelledby="direct-answer">
          <h2 id="direct-answer" className="text-2xl font-black text-brandDeepNavy dark:text-white">Direct answer</h2>
          <p className="mt-3 leading-8 text-slate-800 dark:text-slate-200">{guide.directAnswer}</p>
          <p className="mt-4 font-semibold text-slate-800 dark:text-slate-200">{guide.decision}</p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2" aria-label="Calculation and verified fact">
          <div className="rounded-3xl border border-brandBorder bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-brandDeepNavy dark:text-white">Calculation method</h2>
            <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{guide.formula}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{guide.caveat}</p>
          </div>
          <div className="rounded-3xl border border-brandBorder bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black text-brandDeepNavy dark:text-white">Official context</h2>
            <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">{guide.fact.text}</p>
            <a href={officialSources[guide.fact.sourceId].url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center font-semibold text-brandNavy underline dark:text-brandBrightGreen">
              Read {officialSources[guide.fact.sourceId].publisher} source <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-brandBorder bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8" aria-labelledby="worked-example">
          <p className="text-xs font-black uppercase tracking-widest text-brandGrowthGreen dark:text-brandBrightGreen">RupeeKit calculation</p>
          <h2 id="worked-example" className="mt-2 text-2xl font-black text-brandDeepNavy dark:text-white">{guide.example.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Worked illustration with stated inputs. Example rates and charges are assumptions, not live offers or notified rates.
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-bold text-brandDeepNavy dark:text-white">Inputs and assumptions</h3>
              <dl className="mt-3 divide-y divide-slate-200 text-sm dark:divide-slate-700">
                {guide.example.inputs.map((row) => (
                  <div key={row.label} className="flex flex-wrap justify-between gap-2 py-3">
                    <dt className="text-slate-600 dark:text-slate-300">{row.label}</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="font-bold text-brandDeepNavy dark:text-white">Calculated results</h3>
              <dl className="mt-3 divide-y divide-slate-200 rounded-2xl bg-emerald-50 px-4 text-sm dark:divide-slate-700 dark:bg-emerald-950/20">
                {guide.example.results.map((row) => (
                  <div key={row.label} className="flex flex-wrap justify-between gap-2 py-3">
                    <dt className="text-slate-700 dark:text-slate-300">{row.label}</dt>
                    <dd className="font-bold text-brandDeepNavy dark:text-white">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-700 dark:text-slate-300">{guide.example.explanation}</p>
          {guide.example.chart ? (
            <figure className="mt-7 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <figcaption className="font-bold text-brandDeepNavy dark:text-white">{guide.example.chart.title}</figcaption>
              <div className="mt-4 space-y-4">
                {guide.example.chart.bars.map((bar) => {
                  const maximum = Math.max(...guide.example.chart!.bars.map((item) => item.value), 1);
                  return (
                    <div key={bar.label}>
                      <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span>{bar.label}</span><span className="font-bold">{bar.display}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
                        <div className="h-3 rounded-full bg-brandGrowthGreen" style={{ width: `${Math.max(3, bar.value / maximum * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">Bar lengths compare the displayed illustrative values; figures and assumptions are in the table above.</p>
            </figure>
          ) : null}
        </section>

        <SourceBackedComparison slug={guide.slug} />

        <section className="mt-10" aria-labelledby="decision-steps">
          <h2 id="decision-steps" className="text-2xl font-black text-brandDeepNavy dark:text-white">How to make this decision</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {guide.steps.map((step, index) => (
              <li key={step} className="rounded-3xl border border-brandBorder bg-white p-5 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <span className="mb-2 block text-lg font-black text-brandGrowthGreen dark:text-brandBrightGreen">0{index + 1}</span>{step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10" aria-labelledby="calculators">
          <h2 id="calculators" className="text-2xl font-black text-brandDeepNavy dark:text-white">Run your own numbers</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {tools.map((tool) => tool && (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="rounded-2xl border border-brandBorder bg-white p-5 hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900">
                <span className="font-bold text-brandNavy dark:text-brandBrightGreen">{tool.name} →</span>
                <span className="mt-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">{tool.shortDescription}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-brandBorder bg-white p-6 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="questions">
          <h2 id="questions" className="text-2xl font-black text-brandDeepNavy dark:text-white">Questions to check</h2>
          {guide.questions.map((entry) => (
            <div key={entry.question} className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
              <h3 className="font-bold text-brandDeepNavy dark:text-white">{entry.question}</h3>
              <p className="mt-2 leading-7 text-slate-700 dark:text-slate-300">{entry.answer}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-brandBorder bg-white p-6 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="sources">
          <h2 id="sources" className="text-2xl font-black text-brandDeepNavy dark:text-white">Official sources and review</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7">
            {guide.sourceIds.map((id) => (
              <li key={id}>
                <a href={officialSources[id].url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brandNavy underline dark:text-brandBrightGreen">
                  {officialSources[id].name}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Research, text and calculation methodology: RupeeKit Editorial Team. Source disclosures are linked above.
            No external credentialed reviewer is credited for these guides; individual tax and loan decisions require your own documents and professional advice when appropriate.
          </p>
          {revisions.length > 0 ? (
            <div className="mt-5">
              <h3 className="font-bold text-brandDeepNavy dark:text-white">Revision history</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {revisions.map((revision) => <li key={`${revision.date}-${revision.change}`}><time dateTime={revision.date}>{revision.date}</time>: {revision.change}</li>)}
              </ul>
            </div>
          ) : null}
          <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Reviewed <time dateTime={guide.lastReviewedIso}>{guide.lastReviewedIso}</time>. Example calculations use the
            displayed assumptions and formulas; official links provide rule context. Check sources for later changes.
            If you find an error, use our <Link href="/corrections-policy" className="underline">corrections policy</Link>.
          </p>
        </section>

        <section className="mt-10" aria-labelledby="next-guides">
          <h2 id="next-guides" className="text-2xl font-black text-brandDeepNavy dark:text-white">Related decisions</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {guide.relatedSlugs.map((slug) => {
              const related = getMoneyGuide(slug);
              return related ? <li key={slug}><Link href={`/money-guides/${slug}`} className="inline-flex min-h-11 items-center rounded-full border border-brandBorder bg-white px-4 font-semibold text-brandNavy hover:underline dark:border-slate-700 dark:bg-slate-900 dark:text-brandBrightGreen">{related.title}</Link></li> : null;
            })}
          </ul>
        </section>
      </article>
    </main>
  );
}
