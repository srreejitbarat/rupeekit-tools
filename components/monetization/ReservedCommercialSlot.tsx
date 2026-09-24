import type { ReactNode } from 'react';

type ReservedCommercialSlotProps = {
  enabled?: boolean;
  children?: ReactNode;
  label?: string;
};

/**
 * Scaffold for a future commercial placement. It is deliberately disabled by
 * default so Issue #87 does not ship an ad or new monetisation surface.
 *
 * When enabled later, the fixed minimum block size reserves space before any
 * partner content renders, preventing a late-loaded placement from shifting
 * the article below it.
 */
export default function ReservedCommercialSlot({
  enabled = false,
  children,
  label = 'Partner information',
}: ReservedCommercialSlotProps) {
  if (!enabled) return null;

  return (
    <aside
      aria-label={label}
      className="my-6 min-h-[180px] rounded-2xl border border-slate-200 bg-slate-50 p-5"
      data-commercial-slot="reserved"
    >
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      {children}
    </aside>
  );
}
