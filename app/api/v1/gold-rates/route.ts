import { NextResponse } from 'next/server';
import { API_RESPONSE_HEADERS } from '@/lib/api-request';
import { getGoldRatePayload } from '@/lib/gold-rates';

// Served from the committed snapshot, so this is static until the next
// scheduled refresh redeploys the site. It never fetches at request time.
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(getGoldRatePayload(), { headers: API_RESPONSE_HEADERS });
}
