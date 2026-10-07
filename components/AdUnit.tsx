'use client';

import { useEffect, useRef } from "react";

type AdUnitProps = {
  /** Numeric AdSense slot ID. Legacy descriptive labels use the configured default slot. */
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
  const slot = /^\d+$/.test(slotName) ? slotName : process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const configured = /^ca-pub-\d+$/.test(client ?? '') && /^\d+$/.test(slot ?? '');
  const insetRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!configured || !insetRef.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      /* Ad blocked or not ready — never break the page */
    }
  }, [configured, client, slot]);

  if (!configured) return null;

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
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(adChannel ? { "data-ad-channel": adChannel } : {})}
      />
    </div>
  );
}
