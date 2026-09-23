import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
for (const [en, hi, bn] of [['/', '/hi', '/bn'], ['/tools', '/hi/tools', '/bn/tools']]) {
  for (const [route, locale] of [[en, 'en-IN'], [hi, 'hi-IN'], [bn, 'bn-IN']]) {
    const html = fs.readFileSync(path.join(root, '.next/server/app', route === '/' ? 'index.html' : `${route.slice(1)}.html`), 'utf8');
    const absolute = (url) => url === '/' ? base : `${base}${url}`;
    assert(html.includes(`<html lang="${locale}"`), `${route}: server document language`);
    assert(html.includes(`<link rel="canonical" href="${absolute(route)}"`), `${route}: self canonical`);
    for (const [language, href] of [['en-IN', en], ['hi-IN', hi], ['bn-IN', bn], ['x-default', en]]) {
      assert(html.includes(`<link rel="alternate" hrefLang="${language}" href="${absolute(href)}"`), `${route}: ${language} alternate`);
    }
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: one main heading`);
    assert(html.includes('Language / भाषा / ভাষা'), `${route}: visible language choice`);
    if (locale === 'hi-IN') {
      assert(html.includes('अंग्रेज़ी में उपलब्ध') || html.includes('अभी अंग्रेज़ी में'), `${route}: accurate translation coverage`);
      assert(html.includes('कैलकुलेटर'), `${route}: server-rendered Hindi content`);
    }
    if (locale === 'bn-IN') {
      assert(html.includes('ইংরেজিতে পাওয়া যাবে') || html.includes('এখন ইংরেজিতে'), `${route}: accurate translation coverage`);
      assert(html.includes('ক্যালকুলেটর'), `${route}: server-rendered Bengali content`);
    }
  }
}
console.log('Language rendering passed: six English, Hindi and Bengali pages, server-rendered translations, self-canonicals and reciprocal alternates.');
