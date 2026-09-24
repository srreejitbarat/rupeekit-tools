'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { trackAnalyticsEvent } from '@/lib/analytics';

type AnalyticsLinkProps = ComponentProps<typeof Link> & {
  analyticsEvent: 'guide_click' | 'tool_cta_click';
  toolSlug: string;
  toolCategory: string;
  ctaType?: 'related_tool' | 'resource';
};

export default function AnalyticsLink({
  analyticsEvent,
  toolSlug,
  toolCategory,
  ctaType,
  href,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  const destination = typeof href === 'string' ? href : href.pathname ?? '';

  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        if (analyticsEvent === 'guide_click') {
          trackAnalyticsEvent('guide_click', {
            tool_slug: toolSlug,
            tool_category: toolCategory,
            destination,
          });
        } else {
          trackAnalyticsEvent('tool_cta_click', {
            tool_slug: toolSlug,
            tool_category: toolCategory,
            destination,
            cta_type: ctaType ?? 'resource',
          });
        }
        onClick?.(event);
      }}
    />
  );
}
