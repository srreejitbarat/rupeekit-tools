import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const appDir = path.resolve('.next/server/app');
const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
const sitemap = new JSDOM(fs.readFileSync(path.join(appDir, 'sitemap.xml.body'), 'utf8'), { contentType: 'text/xml' });
const canonicalUrls = new Set([...sitemap.window.document.querySelectorAll('url > loc')].map((loc) => loc.textContent.trim()));
sitemap.window.close();

for (const [locale, route, script] of [
  ['en', 'feed.xml', /[A-Za-z]/],
  ['hi', 'hi/feed.xml', /[\u0900-\u097f]/],
  ['bn', 'bn/feed.xml', /[\u0980-\u09ff]/],
]) {
  const xml = fs.readFileSync(path.join(appDir, `${route}.body`), 'utf8');
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  const doc = dom.window.document;
  assert.equal(doc.querySelector('rss')?.getAttribute('version'), '2.0', `${route}: RSS 2.0`);
  assert.equal(doc.querySelector('channel > language')?.textContent, `${locale}-IN`, `${route}: language`);
  assert.equal(doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'link')[0]?.getAttribute('href'), `${origin}/${route}`, `${route}: self URL`);
  const items = [...doc.querySelectorAll('channel > item')];
  assert(items.length > 0 && items.length <= 50, `${route}: expected 1–50 published items`);
  const urls = new Set();
  for (const item of items) {
    const title = item.querySelector('title')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const url = item.querySelector('link')?.textContent || '';
    const date = item.querySelector('pubDate')?.textContent || '';
    assert(script.test(title) && script.test(description), `${route}: untranslated title or description: ${url}`);
    assert(canonicalUrls.has(url), `${route}: URL is not in sitemap: ${url}`);
    assert(url.startsWith(`${origin}${locale === 'en' ? '/' : `/${locale}/`}`), `${route}: wrong language URL: ${url}`);
    assert(!urls.has(url), `${route}: duplicate URL: ${url}`);
    assert.equal(item.querySelector('guid')?.textContent, url, `${route}: GUID differs from canonical`);
    assert(date && !Number.isNaN(Date.parse(date)) && Date.parse(date) <= Date.now(), `${route}: invalid or future date: ${date}`);
    urls.add(url);
  }
  dom.window.close();
  console.log(`${route}: ${items.length} localized, canonical, dated RSS items`);
}
