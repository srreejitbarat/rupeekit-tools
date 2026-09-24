import { discoverImages } from '@/data/discover-images';
import { blogPosts } from '@/data/all-blog-posts';
import { financialUpdates } from '@/data/financial-updates';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
  const discoverPaths = new Set(discoverImages.map((image) => image.path));
  const blogHeroImages = blogPosts.flatMap((post) => {
    const path = `/blog/${post.slug}`;
    if (!post.heroImage || discoverPaths.has(path)) return [];
    return [{ path, src: post.heroImage }];
  });
  const financialUpdateHeroImages = financialUpdates.flatMap((update) => {
    const path = `/financial-updates/${update.slug}`;
    if (!update.heroImage || discoverPaths.has(path) || update.status === 'sample') return [];
    return [{ path, src: update.heroImage.src }];
  });
  const sitemapImages = [
    ...discoverImages.map((image) => ({ path: image.path, src: image.src })),
    ...blogHeroImages,
    ...financialUpdateHeroImages,
  ];

  const entries = sitemapImages
    .map(
      (image) => `  <url>
    <loc>${escapeXml(`${siteUrl}${image.path}`)}</loc>
    <image:image>
      <image:loc>${escapeXml(`${siteUrl}${image.src}`)}</image:loc>
    </image:image>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
