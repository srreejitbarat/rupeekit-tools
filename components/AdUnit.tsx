'use client';

import { useEffect, useRef } from "react";

type AdUnitProps = {
  /** Descriptive label shown when ad slot is reserved but not served */
  slotName?: string;
  /** Fixed min-height to reserve (CLS-safe). Defaults to 100px (mobile), 250px (desktop) */
  minHeightClass?: string;
  /** Full-width responsive ad slot */
  className?: string;
  /** AdSense channel id (optional) */
  adChannel?: string;
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * CLS-safe Google AdSense unit.
 *
 * - Ads are only rendered when NEXT_PUBLIC_ADSENSE_CLIENT is set (prod only).
 * - The wrapper reserves a min-height so the ad loading never shifts layout.
 * - The `<ins>` element is inserted only after hydration via useEffect.
 */
export default function AdUnit({
  slotName = "Ad",
  minHeightClass = "min-h-[100px] md:min-h-[250px]",
  className = "",
  adChannel,
}: AdUnitProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const insetRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!client || !insetRef.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      /* Ad blocked or not ready — never break the page */
    }
  }, [client]);

  if (!client) {
    // In dev/tests, reserve the slot so layout math is identical to prod.
    return (
      <div
        aria-hidden="true"
        className={`w-full ${minHeightClass} flex items-center justify-center rounded-xl border border-dashed border-brandBorder bg-brandBgSoft ${className}`}
      >
        <span className="text-xs font-medium uppercase tracking-wide text-brandMuted">
          Advertisement
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${minHeightClass} flex items-center justify-center ${className}`}
      aria-label="Advertisement"
    >
      <ins
        ref={insetRef}
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slotName}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(adChannel ? { "data-ad-channel": adChannel } : {})}
      />
    </div>
  );
}
