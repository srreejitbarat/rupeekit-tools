import type { Metadata } from 'next';
import Link from 'next/link';
import { languageAlternates } from '@/lib/i18n/routing';
import { getLiveTools } from '@/lib/tools';
import { hindiToolCatalog } from '@/data/hi/tool-catalog';

const title = 'RupeeKit हिंदी — सैलरी, EMI और बचत का आसान हिसाब';
const description = 'सैलरी, होम लोन, SIP, टैक्स और बचत के लिए सही कैलकुलेटर हिंदी में खोजें। आसान परिचय, मुफ़्त टूल और कोई साइनअप नहीं।';
const alternates = languageAlternates('/', 'hi');

export const metadata: Metadata = {
  title: { absolute: title }, description, alternates,
  openGraph: { title, description, url: alternates.canonical, siteName: 'RupeeKit', type: 'website', locale: 'hi_IN', alternateLocale: ['en_IN', 'bn_IN'] },
  twitter: { card: 'summary_large_image', title, description },
};

const featured = [
  'salary-in-hand-calculator-india', 'home-loan-emi-calculator-india', 'sip-calculator-india',
  'no-cost-emi-calculator-india', 'freelancer-remittance-fee-calculator-india', 'company-car-lease-exit-calculator-india',
];

export default function HindiHomePage() {
  const count = getLiveTools().length;
  return (
    <div className="pb-8 md:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebPage', name: title, description,
        url: alternates.canonical, inLanguage: 'hi-IN',
      }) }} />
      <section className="bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center md:px-6 md:py-20">
          <p className="font-bold leading-7 text-brandBrightGreen">RupeeKit अब हिंदी में</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-extrabold leading-relaxed sm:text-4xl sm:leading-relaxed md:text-5xl md:leading-relaxed">पैसों के फैसले से पहले,<br className="hidden sm:block" /> हिसाब समझ लें।</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg md:leading-9">हर महीने कितनी सैलरी मिलेगी? लोन की किस्त कितनी होगी? बचत कहाँ तक पहुँच सकती है? अपनी ज़रूरत का कैलकुलेटर चुनें और अनुमान देखें।</p>
          <Link href="/hi/tools" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-brandGrowthGreen px-7 py-3 text-base font-bold text-white shadow-soft transition hover:bg-brandBrightGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brandNavy">अपना कैलकुलेटर खोजें <span aria-hidden="true" className="ml-2">→</span></Link>
          <p className="mt-5 text-sm leading-7 text-slate-200">{count} मुफ़्त कैलकुलेटर · साइनअप की ज़रूरत नहीं</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="mt-7 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">होमपेज और कैलकुलेटर की सूची हिंदी में उपलब्ध हैं। अभी कैलकुलेटर के अंदर के सवाल, नतीजे और डाउनलोड अंग्रेज़ी में हैं। हर लिंक पर इसकी जानकारी दी गई है।</p>
        <section id="calculators" className="mt-10 scroll-mt-24">
          <h2 className="text-2xl font-bold leading-relaxed text-brandDeepNavy dark:text-white">आज आप क्या जानना चाहते हैं?</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((slug) => {
              const tool = hindiToolCatalog[slug];
              return <Link key={slug} href={`/tools/${slug}`} hrefLang="en-IN" className="group flex flex-col rounded-3xl border border-brandBorder bg-white p-6 shadow-card transition hover:border-brandNavy/40 hover:shadow-cardHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandNavy dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-bold leading-8 text-brandDeepNavy dark:text-white">{tool.name}</h3>
                <p className="mt-3 flex-grow text-sm leading-7 text-brandMuted dark:text-slate-300">{tool.shortDescription}</p>
                <span className="mt-5 border-t border-brandBorder pt-4 text-sm font-bold leading-7 text-brandNavy dark:border-slate-700 dark:text-brandBrightGreen">कैलकुलेटर खोलें <span aria-hidden="true">→</span><span className="mt-1 block text-xs font-medium text-brandMuted dark:text-slate-400">अंग्रेज़ी में उपलब्ध</span></span>
              </Link>;
            })}
          </div>
          <Link href="/hi/tools" className="mt-5 inline-flex min-h-11 items-center font-bold text-brandNavy underline underline-offset-4 dark:text-brandBrightGreen">सभी {count} कैलकुलेटर देखें</Link>
        </section>
        <section className="mt-10 rounded-3xl border border-brandBorder bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <h2 className="text-2xl font-bold leading-relaxed text-brandDeepNavy dark:text-white">शुरू करना आसान है</h2>
          <ol className="mt-5 grid list-inside list-decimal gap-6 text-base font-bold leading-8 md:grid-cols-3">
            <li>अपना सवाल चुनें<p className="mt-1 text-sm font-normal leading-7 text-brandMuted dark:text-slate-300">सैलरी, लोन, टैक्स या बचत की ज़रूरत से शुरुआत करें।</p></li>
            <li>अपने नंबर भरें<p className="mt-1 text-sm font-normal leading-7 text-brandMuted dark:text-slate-300">रकम और समय भरें। ब्याज या रिटर्न का अनुमान ध्यान से चुनें।</p></li>
            <li>नतीजा समझें<p className="mt-1 text-sm font-normal leading-7 text-brandMuted dark:text-slate-300">देखें कि नंबर बदलने पर अनुमान कैसे बदलता है। ज़रूरी मान्यताएँ भी पढ़ें।</p></li>
          </ol>
        </section>
        <section className="mt-10 max-w-3xl">
          <h2 className="text-xl font-bold leading-relaxed text-brandDeepNavy dark:text-white">क्या ये नतीजे पक्के हैं?</h2>
          <p className="mt-3 text-sm leading-8 text-brandMuted dark:text-slate-300">नतीजे आपके दिए हुए नंबरों और कैलकुलेटर की मान्यताओं पर आधारित अनुमान हैं। बैंक की शर्तें, टैक्स नियम और निवेश का रिटर्न बदल सकते हैं। बड़ा फैसला लेने से पहले लागू नियम और संबंधित संस्था की जानकारी जाँचें।</p>
        </section>
      </div>
    </div>
  );
}
