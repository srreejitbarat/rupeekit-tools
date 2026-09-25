import { buildRssFeed } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildRssFeed('en'), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
