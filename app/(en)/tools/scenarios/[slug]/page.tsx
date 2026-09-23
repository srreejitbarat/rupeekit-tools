import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import scenarios from '@/data/indexable-calculator-scenarios.json';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

type Scenario = {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  targetKeyword: string;
  calculatorSlug: string;
  quickAnswer: string;
  assumptions: string[];
  queryValues: Record<string, number>;
  evidence: string;
  lastModifiedIso: string;
};

const scenarioList = scenarios as unknown as Scenario[];

function getScenario(slug: string) {
  return scenarioList.find((scenario) => scenario.slug === slug);
}

function buildCalculatorHref(scenario: Scenario) {
  const params = new URLSearchParams();
  Object.entries(scenario.queryValues).forEach(([key, value]) => {
    params.set(`rk_${key}`, String(value));
  });
  return `/tools/${scenario.calculatorSlug}?${params.toString()}`;
}

export function generateStaticParams() {
  return scenarioList.map((scenario) => ({ slug: scenario.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const scenario = getScenario(params.slug);
  if (!scenario) return {};
  const canonical = `${SITE_URL}/tools/scenarios/${scenario.slug}`;
  return {
    title: { absolute: scenario.title },
    description: scenario.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: scenario.title,
      description: scenario.metaDescription,
      url: canonical,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary',
      title: scenario.title,
      description: scenario.metaDescription,
    },
  };
}

export default function CalculatorScenarioPage({ params }: { params: { slug: string } }) {
  const scenario = getScenario(params.slug);
  if (!scenario) notFound();
  const canonical = `${SITE_URL}/tools/scenarios/${scenario.slug}`;
  const calculatorHref = buildCalculatorHref(scenario);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${SITE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: scenario.h1, item: canonical },
    ],
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brandNavy">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-brandNavy">Calculators</Link>
        <span className="mx-2">/</span>
        <span>Scenario</span>
      </nav>

      <article>
        <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Evidence-backed calculator scenario</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-brandDeepNavy md:text-4xl">{scenario.h1}</h1>
        <p className="mt-4 text-base leading-7 text-slate-700">{scenario.metaDescription}</p>

        <section className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-5 md:p-6" aria-labelledby="scenario-answer">
          <h2 id="scenario-answer" className="text-xl font-bold text-slate-950">Quick answer</h2>
          <p className="mt-3 leading-7 text-slate-700">{scenario.quickAnswer}</p>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="scenario-assumptions">
          <h2 id="scenario-assumptions" className="text-xl font-bold text-brandDeepNavy">Assumptions used</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-6 text-slate-700">
            {scenario.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}
          </ul>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            These are fixed educational assumptions for this landing page. Change them in the calculator before making any decision.
          </p>
        </section>

        <div className="mt-8 rounded-3xl border border-brandNavy/10 bg-brandNavy/5 p-5 md:p-6">
          <h2 className="text-xl font-bold text-brandDeepNavy">Try the same scenario in the calculator</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            The link below opens the base calculator with these inputs restored. The parameter URL itself is noindex and canonicalizes to the base calculator, so arbitrary shared values cannot create index bloat.
          </p>
          <Link
            href={calculatorHref}
            className="mt-4 inline-flex rounded-xl bg-brandNavy px-5 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            Open pre-filled calculator
          </Link>
        </div>

        <section className="mt-8 border-t border-slate-200 pt-6" aria-labelledby="scenario-methodology">
          <h2 id="scenario-methodology" className="text-lg font-bold text-brandDeepNavy">Source and methodology</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{scenario.evidence}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            The result uses the same RupeeKit calculator formula as the linked base tool. No separate formula is introduced on this page.
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Educational estimate only. RupeeKit does not provide personalized financial, tax, legal, investment, or loan advice. Last reviewed {scenario.lastModifiedIso}.
          </p>
        </section>
      </article>
    </main>
  );
}
