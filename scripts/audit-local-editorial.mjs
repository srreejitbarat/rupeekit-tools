import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3010';
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname)) throw new Error('Use a local preview URL.');
const output = process.argv[2] || 'artifacts/editorial-audit';
fs.mkdirSync(output, { recursive: true });
const routes = JSON.parse(fs.readFileSync('lib/i18n/public-routes.json', 'utf8'));
const selectedLocale = process.argv.find(a=>a.startsWith('--locale='))?.slice(9);
if(selectedLocale && !['en','hi','bn'].includes(selectedLocale)) throw Error('Unsupported locale');
const allJobs = (selectedLocale ? [selectedLocale] : ['en', 'hi', 'bn']).flatMap(locale => routes.map(route => ({locale, route, url: (locale === 'en' ? '' : `/${locale}`) + (route === '/' ? '' : route) || '/'})));
const refreshBlogs = process.argv.includes('--refresh-blogs');
const refreshRoutes = process.argv.filter(a=>a.startsWith('--route=')).map(a=>a.slice(8));
const prior = process.argv.includes('--retry-errors') || refreshBlogs || refreshRoutes.length ? JSON.parse(fs.readFileSync(path.join(output,'pages.json'),'utf8')) : [];
const retryUrls = new Set(prior.filter(row => row.status !== 200 || row.error || refreshBlogs && row.route.startsWith('/blog') || refreshRoutes.includes(row.route)).map(row => row.url));
const jobs = prior.length ? allJobs.filter(row => retryUrls.has(row.url)) : allJobs;
const rows = prior.filter(row => !retryUrls.has(row.url));
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const row = {...jobs[next++], issues: [], samples: {}};
    const previous = prior.find(p => p.url === row.url);
    if (previous) row.previousAttempt = {status: previous.status, error: previous.error};
    try {
      const response = await fetch(base + row.url, { signal: AbortSignal.timeout(180000), redirect: 'manual' });
      row.status = response.status;
      if (response.status !== 200) row.issues.push(`http-${response.status}`);
      const dom = new JSDOM(await response.text());
      const d = dom.window.document;
      const text = selector => d.querySelector(selector)?.textContent?.replace(/\s+/g,' ').trim() || '';
      row.title = text('title');
      row.description = d.querySelector('meta[name=description]')?.content || '';
      row.h1 = [...d.querySelectorAll('h1')].map(n => n.textContent.trim());
      row.lang = d.documentElement.lang;
      row.canonical = d.querySelector('link[rel=canonical]')?.href || '';
      row.alternates = Object.fromEntries([...d.querySelectorAll('link[hreflang]')].map(n => [n.hreflang,n.href]));
      for (const field of ['title','description','canonical']) if (!row[field]) row.issues.push(`missing-${field}`);
      if (row.h1.length !== 1) row.issues.push('h1-count');
      if (row.lang !== `${row.locale}-IN`) row.issues.push('document-language');
      if (row.canonical && new URL(row.canonical).pathname.replace(/\/$/,'') !== row.url.replace(/\/$/,'')) row.issues.push('canonical-path');
      for (const language of ['en','hi','bn']) {
        const expected = (language === 'en' ? '' : `/${language}`) + (row.route === '/' ? '' : row.route);
        if (!row.alternates[`${language}-IN`] || new URL(row.alternates[`${language}-IN`]).pathname.replace(/\/$/,'') !== expected) row.issues.push(`alternate-${language}`);
      }
      row.schemas = [];
      for (const n of d.querySelectorAll('script[type="application/ld+json"]')) {
        try { const schema=JSON.parse(n.textContent); row.schemas.push(schema['@type'] || '@graph'); }
        catch { row.issues.push('invalid-jsonld'); }
      }
      if (!row.schemas.length) row.issues.push('missing-jsonld');
      if (row.title.length > 100) row.issues.push('verbose-title-review');
      if (row.description.length > 250) row.issues.push('verbose-description-review');
      d.querySelectorAll('script,style,noscript,svg,code,pre').forEach(n=>n.remove());
      const root = d.body;
      const walker = d.createTreeWalker(root, dom.window.NodeFilter.SHOW_TEXT);
      const prose=[];
      while(walker.nextNode()) { const s=walker.currentNode.textContent.replace(/\s+/g,' ').trim(); if(s)prose.push(s); }
      row.textCharacters = prose.join(' ').length;
      const suspicious = prose.filter(s=>/Answer Engine Summary|उत्तर इंजन सारांश|উত্তর ইঞ্জিন সারাংশ|\b(?:delve|game.changer|unlock your|seamlessly|ever.evolving|financial journey)\b/i.test(s));
      if(suspicious.length) {row.issues.push('editorial-style-review');row.samples.style=suspicious.slice(0,8);}
      const aiMeta=prose.filter(s=>/\b(?:as an? (?:AI|language model)|AI[- ]generated (?:text|content)|written by (?:AI|ChatGPT)|insert (?:text|content) here)\b/i.test(s));
      if(aiMeta.length){row.issues.push('ai-meta-copy');row.samples.aiMeta=aiMeta.slice(0,8);}
      const broken=prose.filter(s=>/ZX[QV]\d+[QV]XZ|\[(?:RK|आरके|আরকে)_\d+\]|&(?:apos|amp|quot|nbsp);|\u00e2(?:\u201a|\u02c6|\u20ac)|\u00c3\u2014/.test(s));
      if(broken.length){row.issues.push('visible-encoding-or-batch-markers');row.samples.broken=broken.slice(0,8);}
      if(row.locale!=='en') {
        const native=row.locale==='hi'?/[\u0900-\u097f]/:/[\u0980-\u09ff]/;
        if(!native.test(row.title))row.issues.push('untranslated-title');
        if(!native.test(row.description))row.issues.push('untranslated-description');
        if(!row.h1.every(h=>native.test(h)))row.issues.push('untranslated-h1');
        // API field names are machine identifiers, not prose; keep their
        // spelling intact so developers can copy requests into code.
        const codeIdentifiers=s=>/^(?:[A-Za-z_][A-Za-z0-9_]*(?:,\s*|$))+$/.test(s);
        const leaks=prose.filter(s=>(s.match(/\b[A-Za-z]{3,}\b/g)||[]).length>=5&&!native.test(s)&&!/^https?:/.test(s)&&!codeIdentifiers(s));
        row.englishProseNodes=leaks.length;
        if(leaks.length){row.issues.push('english-prose-review');row.samples.english=leaks;}
        // Bengali also uses the danda (U+0964); punctuation is not Hindi prose.
        const other=row.locale==='bn'?/[\u0904-\u0939\u0958-\u0961]/:/[\u0985-\u09b9\u09dc-\u09e1]/;
        const mixed=prose.filter(s=>other.test(s)&&s.length>45);
        if(mixed.length){row.issues.push('other-language-prose-review');row.samples.otherLanguage=mixed.slice(0,5);}
      }
      dom.window.close();
    } catch(error) {row.issues.push('fetch-or-parse-error');row.error=error.message;}
    rows.push(row);
    fs.appendFileSync(path.join(output,'pages.jsonl'),JSON.stringify(row)+'\n');
    if(rows.length%30===0)console.log(`${rows.length}/${allJobs.length} pages checked`);
  }
}
fs.writeFileSync(path.join(output,'pages.jsonl'),rows.map(row=>JSON.stringify(row)+'\n').join(''));
await Promise.all([worker(),worker()]);
for(const locale of ['en','hi','bn'])for(const field of ['title','description']) {
  const groups=new Map();
  for(const row of rows.filter(r=>r.locale===locale&&r[field])) {const list=groups.get(row[field])||[];list.push(row);groups.set(row[field],list);}
  for(const list of groups.values())if(list.length>1)for(const row of list)row.issues.push(`duplicate-${field}`);
}
rows.sort((a,b)=>a.url.localeCompare(b.url));
fs.writeFileSync(path.join(output,'pages.json'),JSON.stringify(rows,null,2)+'\n');
const counts={};for(const row of rows)for(const issue of new Set(row.issues))counts[`${row.locale}: ${issue}`]=(counts[`${row.locale}: ${issue}`]||0)+1;
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify({checked:rows.length,expected:allJobs.length,counts},null,2)+'\n');
fs.writeFileSync(path.join(output,'pages.csv'),'language,url,status,title,issues\n'+rows.map(r=>[r.locale,r.url,r.status,r.title,r.issues.join('; ')].map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n'));
console.log(JSON.stringify({checked:rows.length,counts},null,2));
