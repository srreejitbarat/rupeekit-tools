import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';
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
  openGraph: { images: [DEFAULT_OG_IMAGE], title, description, url: alternates.canonical, siteName: 'RupeeKit', type: 'website', locale: 'hi_IN', alternateLocale: ['en_IN', 'bn_IN'] },
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
      <header className="tool-page-heading">
        <h1>कैलकुलेटर</h1>
      </header>
      <ToolsExplorer tools={tools} locale="hi" />
    </div>
  );
}
