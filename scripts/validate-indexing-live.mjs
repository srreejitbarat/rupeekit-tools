// Public HTTP checks only. Search Console remains the source of index status.
const origin = (process.env.INDEXING_CHECK_ORIGIN || 'https://www.rupeekit.co.in').replace(/\/$/, '');
const canonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
const errors = [];

async function request(route) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${origin}${route}`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20000),
        headers: { 'user-agent': 'RupeeKitIndexabilityCheck/1.0' },
      });
      const body = await response.text();
      if ((response.status >= 500 || response.status === 429) && attempt < 2) continue;
      return { response, body };
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] || '';
}

const { response: sitemapResponse, body: sitemap } = await request('/sitemap.xml');
if (sitemapResponse.status !== 200) throw new Error(`sitemap.xml: HTTP ${sitemapResponse.status}`);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!urls.length || new Set(urls).size !== urls.length) throw new Error('sitemap.xml: empty or duplicate URL list');

let cursor = 0;
let checked = 0;
async function worker() {
  while (cursor < urls.length) {
    const expected = urls[cursor++];
    try {
      const url = new URL(expected);
      if (url.origin !== new URL(canonicalOrigin).origin || url.search || url.hash) throw new Error('unexpected sitemap origin or URL parameters');
      const { response, body } = await request(url.pathname);
      if (response.status !== 200) throw new Error(`HTTP ${response.status}; location ${response.headers.get('location') || 'none'}`);
      if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('response is not HTML');
      const head = body.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)?.[0];
      if (!head) throw new Error('missing HTML head');
      const canonicals = (head.match(/<link\b[^>]*>/gi) || []).filter((tag) => attribute(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical'));
      if (canonicals.length !== 1 || new URL(attribute(canonicals[0], 'href')).href !== url.href) throw new Error('missing, conflicting, or incorrect canonical');
      const directives = (head.match(/<meta\b[^>]*>/gi) || [])
        .filter((tag) => ['robots', 'googlebot'].includes(attribute(tag, 'name').toLowerCase()))
        .map((tag) => attribute(tag, 'content'));
      directives.push(response.headers.get('x-robots-tag') || '');
      if (directives.some((directive) => /\b(noindex|none)\b/i.test(directive))) throw new Error(`indexing blocked: ${directives.join('; ')}`);
      checked++;
    } catch (error) {
      errors.push(`${expected}: ${error.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

const { response: robotsResponse, body: robots } = await request('/robots.txt');
if (robotsResponse.status !== 200) errors.push(`robots.txt: HTTP ${robotsResponse.status}`);
if (/^\s*Disallow:\s*\/(?:\s|$)/im.test(robots)) errors.push('robots.txt: site-wide crawl block');
for (const name of ['sitemap.xml', 'image-sitemap.xml']) {
  if (!robots.includes(`Sitemap: ${canonicalOrigin}/${name}`)) errors.push(`robots.txt: missing ${name}`);
}
const { response: imageResponse, body: imageSitemap } = await request('/image-sitemap.xml');
if (imageResponse.status !== 200) errors.push(`image-sitemap.xml: HTTP ${imageResponse.status}`);
const imagePages = [...imageSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!imagePages.length) errors.push('image-sitemap.xml: empty page list');
for (const page of imagePages) {
  if (!urls.includes(page)) errors.push(`${page}: image sitemap page is absent from the page sitemap`);
}

console.log(`Live indexing checks: ${checked}/${urls.length} sitemap pages passed.`);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
}
