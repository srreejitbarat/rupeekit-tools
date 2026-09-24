'use client';

import { useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

export default function NewsletterConfirmedTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackAnalyticsEvent('newsletter_confirmed', { placement: 'provider_confirmation', context: 'financial_updates' });
  }, []);

  return null;
}
