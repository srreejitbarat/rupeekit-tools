import type { Metadata } from 'next';
import Link from 'next/link';
import NewsletterConfirmedTracker from '@/components/updates/NewsletterConfirmedTracker';

export const metadata: Metadata = {
  title: { absolute: 'Subscription Confirmed | RupeeKit' },
  description: 'Your RupeeKit official-update email subscription is confirmed.',
  robots: { index: false, follow: true },
};

export default function UpdatesConfirmedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <NewsletterConfirmedTracker />
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Subscription confirmed</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-brandDeepNavy">You are subscribed to RupeeKit official-update alerts</h1>
        <p className="mt-4 leading-7 text-slate-700">
          We will use this channel for material updates such as 8th Pay Commission progress, DA/DR revisions, EPFO changes, CBDT deadlines and small-savings rate resets. We do not promise a fixed send schedule.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Every email includes a way to manage or unsubscribe from your subscription.
        </p>
        <Link href="/financial-updates" className="mt-6 inline-flex rounded-xl bg-brandNavy px-5 py-3 text-sm font-bold text-white">
          Browse financial updates
        </Link>
      </section>
    </main>
  );
}
