import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const base=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.rupeekit.co.in').replace(/\/$/,'');
const routes=JSON.parse(fs.readFileSync('lib/i18n/public-routes.json','utf8'));
const absolute=(route,locale)=>base+(locale==='en'?'':`/${locale}`)+(route==='/'?'':route);
const file=(route,locale)=>path.join('.next/server/app',locale==='en'?(route==='/'?'index.html':route.slice(1)+'.html'):locale+(route==='/'?'':route)+'.html');
const residual=[];
for(const route of routes){
 for(const locale of ['en','hi','bn']){
  const html=fs.readFileSync(file(route,locale),'utf8');
  const dom=new JSDOM(html), d=dom.window.document;
  assert.equal(d.documentElement.lang,`${locale}-IN`,`${locale}${route}: document language`);
  assert.equal(d.querySelector('link[rel=canonical]')?.getAttribute('href'),absolute(route,locale),`${locale}${route}: self canonical`);
  for(const language of ['en','hi','bn'])assert.equal(d.querySelector(`link[hreflang="${language}-IN"]`)?.getAttribute('href'),absolute(route,language),`${locale}${route}: ${language} alternate`);
  assert.equal(d.querySelector('link[hreflang="x-default"]')?.getAttribute('href'),absolute(route,'en'),`${locale}${route}: x-default`);
  assert.equal(d.querySelectorAll('h1').length,1,`${locale}${route}: one main heading`);
  if(locale!=='en'){
   const script=locale==='hi'?/[\u0900-\u097f]/:/[\u0980-\u09ff]/;
   assert(script.test(d.querySelector('h1')?.textContent||''),`${locale}${route}: translated heading`);
   d.querySelectorAll('script,style,code,pre,noscript').forEach(n=>n.remove());
   const walker=d.createTreeWalker(d.body,dom.window.NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){
     const text=walker.currentNode.textContent.replace(/\s+/g,' ').trim();
     // Acronyms, URLs, brand names and numeric formulas are valid in both languages.
     if(/^(?:[^\s@]+@[^\s@]+\.[^\s@]+|(?:[a-z0-9-]+\.)+[a-z]{2,}|[a-z0-9]+(?:-[a-z0-9]+)*\.\d+)$/i.test(text)||text==='Zerodha · Upstox · Angel One')continue;
     const codeIdentifiers=/^(?:[A-Za-z_][A-Za-z0-9_]*(?:,\s*|$))+$/;
    if((text.match(/\b[A-Z]?[a-z]{2,}\b/g)||[]).length>=3&&!script.test(text)&&!/^https?:\/\//.test(text)&&!codeIdentifiers.test(text))residual.push({locale,route,text});
   }
  }
  dom.window.close();
 }
}
fs.writeFileSync('.next/i18n-untranslated.json',JSON.stringify(residual,null,2));
assert.equal(residual.length,0,`${residual.length} untranslated prose nodes; review .next/i18n-untranslated.json`);
console.log(`Language rendering passed: ${routes.length*3} pages, native headings, reciprocal alternates, self-canonicals and no untranslated prose.`);
