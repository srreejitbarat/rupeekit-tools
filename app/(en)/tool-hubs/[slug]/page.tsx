import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLiveTools } from '@/lib/tools';
import { getPrimaryClusterForTool, getToolCluster, toolClusters } from '@/data/tool-clusters';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return toolClusters.map((cluster) => ({ slug: cluster.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const cluster = getToolCluster(params.slug);
  if (!cluster) return {};
  const pageUrl = `${SITE_URL}/tool-hubs/${cluster.slug}`;
  return {
    title: { absolute: `${cluster.name} Calculators India | RupeeKit` },
    description: cluster.description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: { title: `${cluster.name} Calculators India`, description: cluster.description, url: pageUrl, type: 'website' },
  };
}

export default function ToolClusterHubPage({ params }: Props) {
  const cluster = getToolCluster(params.slug);
  if (!cluster) notFound();

  const tools = getLiveTools().filter((tool) => getPrimaryClusterForTool(tool)?.slug === cluster.slug);
  const pageUrl = `${SITE_URL}/tool-hubs/${cluster.slug}`;
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Calculator hubs', item: `${SITE_URL}/tool-hubs` },
      { '@type': 'ListItem', position: 3, name: cluster.name, item: pageUrl },
    ],
  };
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cluster.name} calculators`,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `${SITE_URL}/tools/${tool.slug}`,
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <nav className="text-sm text-brandMuted">
        <Link href="/" className="font-semibold text-brandNavy hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tool-hubs" className="font-semibold text-brandNavy hover:underline">Calculator hubs</Link>
        <span className="mx-2">/</span>
        <span>{cluster.name}</span>
      </nav>

      <header className="mt-6 rounded-[2rem] border border-brandBorder bg-white p-7 shadow-card dark:border-slate-800 dark:bg-slate-900 md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brandGrowthGreen dark:text-brandBrightGreen">Decision hub</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-brandDeepNavy dark:text-white">{cluster.name} calculators for India</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{cluster.intro}</p>
        <p className="mt-4 text-xs font-semibold text-brandMuted dark:text-slate-400">Covers: {cluster.targetKeyword}</p>
      </header>

      <section className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-6 dark:border-sky-900/50 dark:bg-sky-950/20">
        <h2 className="text-2xl font-black text-brandDeepNavy dark:text-white">A practical order to use these tools</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-sm leading-7 text-slate-700 dark:text-slate-300">
          {cluster.journey.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brandGrowthGreen dark:text-brandBrightGreen">Tools in this hub</p>
            <h2 className="mt-2 text-3xl font-black text-brandDeepNavy dark:text-white">Choose the calculation that matches your next question</h2>
          </div>
          <Link href="/tools" className="hidden text-sm font-bold text-brandNavy hover:underline md:inline dark:text-brandBrightGreen">All calculators</Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {tools.map((tool) => (
            <article key={tool.slug} className="rounded-3xl border border-brandBorder bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wide text-brandMuted dark:text-slate-400">{tool.category}</p>
              <h3 className="mt-2 text-xl font-black text-brandDeepNavy dark:text-white">{tool.name}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{tool.shortDescription}</p>
              <Link href={`/tools/${tool.slug}`} className="mt-5 inline-flex min-h-11 items-center font-bold text-brandNavy hover:underline dark:text-brandBrightGreen">
                Use this calculator <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
        <h2 className="text-lg font-black">Educational planning, not personalised advice</h2>
        <p className="mt-2">Calculator outputs depend on the values and assumptions you enter. Verify current tax, lending, scheme, pension, insurance or investment rules with the relevant official source before making a significant decision.</p>
      </section>
    </main>
  );
}
