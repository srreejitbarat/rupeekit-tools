'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackUserEngagement } from '@/lib/analytics';

export default function GoogleAnalyticsRouteTracker() {
  const pathname = usePathname();
  const currentPathRef = useRef<string | null>(null);
  const activeSinceRef = useRef<number | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushEngagement = useCallback(() => {
    if (!currentPathRef.current || activeSinceRef.current === null) return;
    const elapsed = performance.now() - activeSinceRef.current;
    trackUserEngagement(currentPathRef.current, elapsed);
    activeSinceRef.current = null;
  }, []);

  useEffect(() => {
    const nextPath = pathname || '/';

    if (currentPathRef.current && currentPathRef.current !== nextPath) {
      flushEngagement();
    }

    currentPathRef.current = nextPath;
    activeSinceRef.current = performance.now();

    if (!trackPageView(nextPath)) {
      retryTimerRef.current = setTimeout(() => {
        trackPageView(nextPath);
      }, 750);
    }

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [flushEngagement, pathname]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushEngagement();
      } else if (activeSinceRef.current === null) {
        activeSinceRef.current = performance.now();
      }
    };

    const onPageHide = () => flushEngagement();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      flushEngagement();
    };
  }, [flushEngagement]);

  return null;
}
