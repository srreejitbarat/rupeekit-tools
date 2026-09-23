import type { Metadata } from 'next';
import Link from 'next/link';
import ToolsExplorer from '@/components/tools/ToolsExplorer';
import { getLiveTools } from '@/lib/tools';
import { bengaliToolCatalog } from '@/data/bn/tool-catalog';
import { languageAlternates } from '@/lib/i18n/routing';

const title = 'ক্যালকুলেটরের তালিকা — বেতন, EMI, SIP ও ট্যাক্স | RupeeKit বাংলা';
const description = 'নিজের দরকারের বিনামূল্যের ক্যালকুলেটর বাংলায় খুঁজুন। বেতন, লোন, সঞ্চয়, ট্যাক্স ও বিনিয়োগের টুলের সহজ পরিচিতি। ক্যালকুলেটর এখন ইংরেজিতে আছে।';
const alternates = languageAlternates('/tools', 'bn');

export const metadata: Metadata = {
  title: { absolute: title }, description, alternates,
  openGraph: { title, description, url: alternates.canonical, siteName: 'RupeeKit', type: 'website', locale: 'bn_IN', alternateLocale: ['en_IN', 'hi_IN'] },
  twitter: { card: 'summary_large_image', title, description },
};

export default function BengaliToolsPage() {
  const tools = getLiveTools().map((tool) => {
    const copy = bengaliToolCatalog[tool.slug];
    if (!copy) throw new Error(`Missing Bengali catalog copy for ${tool.slug}`);
    return { slug: tool.slug, category: tool.category, ...copy, searchTerms: `${tool.name} ${tool.slug} ${tool.shortDescription}` };
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description,
        url: alternates.canonical, inLanguage: 'bn-IN', mainEntity: {
          '@type': 'ItemList', numberOfItems: tools.length,
          itemListElement: tools.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.name, url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in'}/tools/${tool.slug}` })),
        },
      }) }} />
      <nav aria-label="আপনি এখানে আছেন" className="text-sm leading-7 text-brandMuted dark:text-slate-400"><Link href="/bn" className="font-bold hover:underline">হোম</Link><span className="mx-2" aria-hidden="true">/</span><span aria-current="page">ক্যালকুলেটর</span></nav>
      <header className="mt-6 rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 p-6 text-white md:p-10">
        <p className="text-sm font-bold leading-7 text-brandBrightGreen">{tools.length}টি বিনামূল্যের টুল · সাইনআপের প্রয়োজন নেই</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-relaxed md:text-4xl md:leading-relaxed">আপনার প্রশ্নের সঠিক ক্যালকুলেটর</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200">বাংলা বা ইংরেজিতে নাম লিখুন, অথবা নীচে বিষয় বেছে নিন। যেমন: বেতন, হোম লোন, SIP বা ট্যাক্স।</p>
      </header>
      <p className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">এই তালিকাটি বাংলায় আছে। ক্যালকুলেটর খুললে তার প্রশ্ন, ফলাফল ও ডাউনলোড এখন ইংরেজিতে পাবেন।</p>
      <ToolsExplorer tools={tools} locale="bn" />
    </div>
  );
}
