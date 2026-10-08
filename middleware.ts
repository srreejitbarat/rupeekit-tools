import { NextRequest, NextResponse } from 'next/server';
import { isIndexedLocale, type Locale } from '@/lib/i18n/routing';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // The 8th CPC hub carries the same shareable scenario parameters as the
  // calculator pages, so parameterised variants of it are treated identically.
  const path = request.nextUrl.pathname.replace(/^\/(hi|bn)(?=\/|$)/, '') || '/';
  const isShareableCalculatorPath =
    path.startsWith('/tools/') ||
    path === '/8th-pay-commission';
  const hasParameters = request.nextUrl.searchParams.size > 0;

  const locale = request.nextUrl.pathname.match(/^\/(hi|bn)(?=\/|$)/)?.[1] as Locale | undefined;

  if (locale && !isIndexedLocale(locale)) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  } else if (isShareableCalculatorPath && hasParameters) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}

export const config = {
  matcher: ['/tools/:path*', '/8th-pay-commission', '/hi/:path*', '/bn/:path*'],
};
