'use client';

import AdUnit from '@/components/AdUnit';

/** A real configured placement only; never imitate a calculator or download. */
export default function ToolAdPlacement() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';
  const slot = process.env.NEXT_PUBLIC_ADSENSE_TOOL_SLOT ?? '';
  if (!/^ca-pub-\d+$/.test(client) || !/^\d+$/.test(slot)) return null;
  return <section aria-label="Advertisement" className="my-12 border-y border-slate-200 py-6 dark:border-slate-700">
    <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Advertisement</p>
    <AdUnit slotName={slot} minHeightClass="min-h-[250px]" />
  </section>;
}
