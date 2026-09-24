import type { Metadata } from 'next';
import Link from 'next/link';
import ToolsExplorer from '@/components/tools/ToolsExplorer';
import { getLiveTools } from '@/lib/tools';
import { hindiToolCatalog } from '@/data/hi/tool-catalog';
import { languageAlternates } from '@/lib/i18n/routing';

const title = 'कैलकुलेटर की सूची — सैलरी, EMI, SIP और टैक्स | RupeeKit हिंदी';
const description = 'अपनी ज़रूरत का मुफ़्त कैलकुलेटर हिंदी में खोजें। सैलरी, लोन, बचत, टैक्स और निवेश के टूल आसान परिचय के साथ। कैलकुलेटर और उनके नतीजे हिंदी में पढ़ें।';
const alternates = languageAlternates('/tools', 'hi');

export const metadata: Metadata = {
  title: { absolute: title }, description, alternates,
  openGraph: { title, description, url: alternates.canonical, siteName: 'RupeeKit', type: 'website', locale: 'hi_IN', alternateLocale: ['en_IN', 'bn_IN'] },
  twitter: { card: 'summary_large_image', title, description },
};

export default function HindiToolsPage() {
  const tools = getLiveTools().map((tool) => {
    const copy = hindiToolCatalog[tool.slug];
    // Fail the build rather than publish a partly translated discovery page.
    if (!copy) throw new Error(`Missing Hindi catalog copy for ${tool.slug}`);
    return { slug: tool.slug, category: tool.category, ...copy, searchTerms: `${tool.name} ${tool.slug} ${tool.shortDescription}` };
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description,
        url: alternates.canonical, inLanguage: 'hi-IN', mainEntity: {
          '@type': 'ItemList', numberOfItems: tools.length,
          itemListElement: tools.map((tool, index) => ({ '@type': 'ListItem', position: index + 1, name: tool.name, url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in'}/tools/${tool.slug}` })),
        },
      }) }} />
      <nav aria-label="आप यहाँ हैं" className="text-sm leading-7 text-brandMuted dark:text-slate-400"><Link href="/hi" className="font-bold hover:underline">होम</Link><span className="mx-2" aria-hidden="true">/</span><span aria-current="page">कैलकुलेटर</span></nav>
      <header className="mt-6 rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 p-6 text-white md:p-10">
        <p className="text-sm font-bold leading-7 text-brandBrightGreen">{tools.length} मुफ़्त टूल · साइनअप की ज़रूरत नहीं</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-relaxed md:text-4xl md:leading-relaxed">आपके सवाल का सही कैलकुलेटर</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200">हिंदी या अंग्रेज़ी में नाम लिखें, या नीचे विषय चुनें। जैसे: सैलरी, होम लोन, SIP या टैक्स।</p>
      </header>
      <p className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">अपनी ज़रूरत का कैलकुलेटर चुनें। उसके सवाल, नतीजे और रिपोर्ट हिंदी में देख सकते हैं।</p>
      <ToolsExplorer tools={tools} locale="hi" />
    </div>
  );
}
