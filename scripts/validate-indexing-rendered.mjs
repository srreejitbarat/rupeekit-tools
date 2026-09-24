// Check the shipped HTML for every submitted page, not only source templates.
// Technical eligibility does not establish Google's index or canonical choice.
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import nextConfig from '../next.config.mjs';

const appDir = path.resolve('.next/server/app');
const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').origin;
const errors = [];
const fail = (message) => errors.push(message);
const normalize = (url) => new URL(url).href;

function sitemapUrls(filename) {
  const dom = new JSDOM(fs.readFileSync(path.join(appDir, filename), 'utf8'), { contentType: 'text/xml' });
  try {
    const urls = [...dom.window.document.querySelectorAll('url > loc')].map((loc) => loc.textContent.trim());
    if (!urls.length) fail(`${filename}: no page URLs`);
    return urls;
  } finally {
    dom.window.close();
  }
}

const urls = sitemapUrls('sitemap.xml.body');
const submitted = new Set(urls.map(normalize));
const linksByPage = new Map();
if (submitted.size !== urls.length) fail('sitemap.xml: duplicate page URLs');

const redirects = await nextConfig.redirects();
const redirectSources = new Set(redirects.map((entry) => entry.source));
for (const entry of redirects) {
  if (redirectSources.has(entry.destination)) fail(`${entry.source}: redirect chain via ${entry.destination}`);
  if (entry.destination.startsWith('/') && !submitted.has(normalize(`${origin}${entry.destination}`))) {
    fail(`${entry.source}: redirect destination is absent from the page sitemap: ${entry.destination}`);
  }
}

// Use Next's compiled matching rules, including trailing-slash redirects.
const routes = JSON.parse(fs.readFileSync('.next/routes-manifest.json', 'utf8'));
const redirectRules = routes.redirects.filter((entry) => !entry.has?.length && !entry.missing?.length);
for (const value of urls) {
  const url = new URL(value);
  if (url.origin !== origin || url.search || url.hash) fail(`${value}: sitemap URL must use the canonical origin without parameters/fragments`);
  if (redirectRules.some((entry) => new RegExp(entry.regex).test(url.pathname))) fail(`${value}: sitemap includes a redirect`);

  const relative = url.pathname === '/' ? 'index' : decodeURIComponent(url.pathname.slice(1));
  const htmlPath = path.resolve(appDir, `${relative}.html`);
  if (!htmlPath.startsWith(`${appDir}${path.sep}`) || !fs.existsSync(htmlPath)) {
    fail(`${value}: missing rendered page`);
    continue;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const head = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)?.[0];
  if (!head) {
    fail(`${value}: missing HTML head`);
    continue;
  }
  const dom = new JSDOM(html);
  try {
    const document = dom.window.document;
    const canonicals = [...document.head.querySelectorAll('link[rel~="canonical"]')];
    if (canonicals.length !== 1) {
      fail(`${value}: expected exactly one canonical in the head, found ${canonicals.length}`);
    } else {
      const canonical = canonicals[0].getAttribute('href');
      if (!canonical || !/^https?:\/\//.test(canonical) || normalize(canonical) !== normalize(value)) {
        fail(`${value}: canonical does not match the sitemap URL: ${canonical}`);
      }
    }
    for (const meta of document.querySelectorAll('meta[name]')) {
      if (['robots', 'googlebot'].includes(meta.getAttribute('name').toLowerCase()) && /\b(noindex|none)\b/i.test(meta.getAttribute('content') || '')) {
        fail(`${value}: indexing is blocked by ${meta.outerHTML}`);
      }
    }
    const links = new Set();
    for (const anchor of document.querySelectorAll('a[href]')) {
      if (anchor.rel.split(/\s+/).includes('nofollow')) continue;
      try {
        const target = new URL(anchor.getAttribute('href'), value);
        target.hash = '';
        if (target.origin === origin && !target.search && submitted.has(target.href)) links.add(target.href);
      } catch {
        // An invalid href cannot provide a crawl path.
      }
    }
    linksByPage.set(normalize(value), links);
  } finally {
    dom.window.close();
  }
}

// A sitemap alone must not be the only route to a public page. Check actual
// rendered anchors, including dynamic lists, rather than source-code strings.
const reachable = new Set([normalize(origin)]);
const queue = [...reachable];
for (let index = 0; index < queue.length; index++) {
  for (const target of linksByPage.get(queue[index]) || []) {
    if (!reachable.has(target)) {
      reachable.add(target);
      queue.push(target);
    }
  }
}
for (const url of submitted) {
  if (!reachable.has(url)) fail(`${url}: no rendered internal-link path from the homepage`);
}

const imageUrls = sitemapUrls('image-sitemap.xml.body');
if (new Set(imageUrls.map(normalize)).size !== imageUrls.length) fail('image-sitemap.xml: duplicate page URLs');
for (const url of imageUrls) {
  if (!submitted.has(normalize(url))) fail(`${url}: image sitemap page is absent from the page sitemap`);
}
const robots = fs.readFileSync(path.join(appDir, 'robots.txt.body'), 'utf8');
for (const name of ['sitemap.xml', 'image-sitemap.xml']) {
  if (!robots.includes(`Sitemap: ${origin}/${name}`)) fail(`robots.txt: missing ${name}`);
}

if (errors.length) {
  console.error(`Rendered indexing validation failed (${errors.length} issues):\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Rendered indexing validation passed: ${urls.length} self-canonical, indexable pages reachable from the homepage; ${imageUrls.length} image-sitemap pages; ${redirects.length} direct legacy redirects.`);
}
