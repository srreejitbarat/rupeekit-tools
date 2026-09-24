import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // The 8th CPC hub carries the same shareable scenario parameters as the
  // calculator pages, so parameterised variants of it are treated identically.
  const path = request.nextUrl.pathname.replace(/^\/(hi|bn)(?=\/|$)/, '') || '/';
  const isShareableCalculatorPath =
    path.startsWith('/tools/') ||
    path === '/8th-pay-commission';
  const hasParameters = request.nextUrl.searchParams.size > 0;

  if (isShareableCalculatorPath && hasParameters) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return response;
}

export const config = {
  matcher: ['/tools/:path*', '/8th-pay-commission', '/hi/:path*', '/bn/:path*'],
};
