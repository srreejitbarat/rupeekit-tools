import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center md:py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-brandGrowthGreen">404</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-brandDeepNavy dark:text-white md:text-4xl">Page not found</h1>
      <p className="mt-4 text-base leading-8 text-brandMuted dark:text-slate-300">This page has moved or no longer exists. Try the calculator list or go back to the homepage.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/tools" className="inline-flex min-h-11 items-center rounded-full bg-brandNavy px-6 font-bold text-white hover:bg-brandDeepNavy">View all calculators</Link>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-brandBorder px-6 font-bold text-brandNavy hover:bg-brandBgSoft dark:border-slate-700 dark:text-brandBrightGreen">Go to the homepage</Link>
      </div>
    </main>
  );
}
