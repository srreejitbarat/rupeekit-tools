import type { Metadata } from 'next';
import Link from 'next/link';
import { languageAlternates } from '@/lib/i18n/routing';
import { getLiveTools } from '@/lib/tools';
import { bengaliToolCatalog } from '@/data/bn/tool-catalog';

const title = 'RupeeKit বাংলা — বেতন, EMI ও সঞ্চয়ের সহজ হিসাব';
const description = 'বেতন, হোম লোন, SIP, ট্যাক্স ও সঞ্চয়ের জন্য সঠিক ক্যালকুলেটর বাংলায় খুঁজুন। সহজ পরিচিতি, বিনামূল্যের টুল এবং সাইনআপের প্রয়োজন নেই।';
const alternates = languageAlternates('/', 'bn');

export const metadata: Metadata = {
  title: { absolute: title }, description, alternates,
  openGraph: { title, description, url: alternates.canonical, siteName: 'RupeeKit', type: 'website', locale: 'bn_IN', alternateLocale: ['en_IN', 'hi_IN'] },
  twitter: { card: 'summary_large_image', title, description },
};

const featured = [
  'salary-in-hand-calculator-india', 'home-loan-emi-calculator-india', 'sip-calculator-india',
  'no-cost-emi-calculator-india', 'freelancer-remittance-fee-calculator-india', 'company-car-lease-exit-calculator-india',
];

export default function BengaliHomePage() {
  const count = getLiveTools().length;
  return (
    <div className="pb-8 md:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebPage', name: title, description,
        url: alternates.canonical, inLanguage: 'bn-IN',
      }) }} />
      <section className="bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center md:px-6 md:py-20">
          <p className="font-bold leading-7 text-brandBrightGreen">RupeeKit এখন বাংলায়</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-extrabold leading-relaxed sm:text-4xl sm:leading-relaxed md:text-5xl md:leading-relaxed">টাকার সিদ্ধান্ত নেওয়ার আগে,<br className="hidden sm:block" /> হিসাবটা বুঝে নিন।</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-lg md:leading-9">মাসে কত বেতন হাতে পাবেন? লোনের কিস্তি কত হবে? সঞ্চয় কতটা বাড়তে পারে? নিজের দরকারের ক্যালকুলেটর বেছে নিয়ে সম্ভাব্য হিসাব দেখুন।</p>
          <Link href="/bn/tools" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-brandGrowthGreen px-7 py-3 text-base font-bold text-white shadow-soft transition hover:bg-brandBrightGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brandNavy">নিজের ক্যালকুলেটর খুঁজুন <span aria-hidden="true" className="ml-2">→</span></Link>
          <p className="mt-5 text-sm leading-7 text-slate-200">{count}টি বিনামূল্যের ক্যালকুলেটর · সাইনআপের প্রয়োজন নেই</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="mt-7 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">ক্যালকুলেটর, ফলাফল, রিপোর্ট, ব্লগ ও নির্দেশিকা বাংলায় পড়ুন। উপরের বিকল্প দিয়ে যে কোনও পেজের ভাষা বদলাতে পারেন।</p>
        <section id="calculators" className="mt-10 scroll-mt-24">
          <h2 className="text-2xl font-bold leading-relaxed text-brandDeepNavy dark:text-white">আজ আপনি কী জানতে চান?</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((slug) => {
              const tool = bengaliToolCatalog[slug];
              return <Link key={slug} href={`/bn/tools/${slug}`} hrefLang="bn-IN" className="group flex flex-col rounded-3xl border border-brandBorder bg-white p-6 shadow-card transition hover:border-brandNavy/40 hover:shadow-cardHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandNavy dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-bold leading-8 text-brandDeepNavy dark:text-white">{tool.name}</h3>
                <p className="mt-3 flex-grow text-sm leading-7 text-brandMuted dark:text-slate-300">{tool.shortDescription}</p>
                <span className="mt-5 border-t border-brandBorder pt-4 text-sm font-bold leading-7 text-brandNavy dark:border-slate-700 dark:text-brandBrightGreen">ক্যালকুলেটর খুলুন <span aria-hidden="true">→</span><span className="mt-1 block text-xs font-medium text-brandMuted dark:text-slate-400">বাংলায় পাওয়া যাবে</span></span>
              </Link>;
            })}
          </div>
          <Link href="/bn/tools" className="mt-5 inline-flex min-h-11 items-center font-bold text-brandNavy underline underline-offset-4 dark:text-brandBrightGreen">সব {count}টি ক্যালকুলেটর দেখুন</Link>
        </section>
        <section className="mt-10 rounded-3xl border border-brandBorder bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <h2 className="text-2xl font-bold leading-relaxed text-brandDeepNavy dark:text-white">শুরু করা সহজ</h2>
          <ol className="mt-5 grid list-inside list-decimal gap-6 text-base font-bold leading-8 md:grid-cols-3">
            <li>নিজের প্রশ্ন বেছে নিন<p className="mt-1 text-sm font-normal leading-7 text-brandMuted dark:text-slate-300">বেতন, লোন, ট্যাক্স বা সঞ্চয়ের প্রয়োজন দিয়ে শুরু করুন।</p></li>
            <li>নিজের সংখ্যা লিখুন<p className="mt-1 text-sm font-normal leading-7 text-brandMuted dark:text-slate-300">টাকার পরিমাণ ও সময় লিখুন। সুদ বা রিটার্নের অনুমান বুঝে বেছে নিন।</p></li>
            <li>ফলাফল বুঝে নিন<p className="mt-1 text-sm font-normal leading-7 text-brandMuted dark:text-slate-300">সংখ্যা বদলালে হিসাব কেমন বদলায়, দেখুন। কোন অনুমান ধরে হিসাব হয়েছে, সেটিও পড়ুন।</p></li>
          </ol>
        </section>
        <section className="mt-10 max-w-3xl">
          <h2 className="text-xl font-bold leading-relaxed text-brandDeepNavy dark:text-white">এই ফলাফল কি নিশ্চিত?</h2>
          <p className="mt-3 text-sm leading-8 text-brandMuted dark:text-slate-300">ফলাফল আপনার দেওয়া সংখ্যা ও ক্যালকুলেটরের অনুমানের উপর নির্ভর করে। ব্যাংকের শর্ত, ট্যাক্সের নিয়ম ও বিনিয়োগের রিটার্ন বদলাতে পারে। বড় সিদ্ধান্তের আগে প্রযোজ্য নিয়ম ও সংশ্লিষ্ট প্রতিষ্ঠানের তথ্য যাচাই করুন।</p>
        </section>
      </div>
    </div>
  );
}
