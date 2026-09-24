import fs from 'node:fs';
import {writeUtf8} from './write-file.mjs';
import {catalogProblems} from './catalog-quality.mjs';
const sources=JSON.parse(fs.readFileSync('lib/i18n/catalogs/sources.json','utf8'));
const file='lib/i18n/catalogs/bn.json';
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
// Match only typography/case variants, not similar sentences. Retain all
// words, numbers, operators and interpolation identifiers.
const canonical=s=>s.toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/\s+([.,;:!?])/g,'$1').trim();
const known=new Map();
for(const [source,target] of Object.entries(catalog)){
 const key=canonical(source);
 if(!known.has(key))known.set(key,{target,source});
 else if(known.get(key)?.target!==target)known.set(key,null);
}
const reused=[];
for(const source of Object.keys(sources))if(!catalog[source]){
 const hit=known.get(canonical(source));
 if(hit&&!catalogProblems(source,hit.target).length){catalog[source]=hit.target;reused.push({source,existing:hit.source});}
}
writeUtf8(file,JSON.stringify(catalog,null,2)+'\n');
writeUtf8('artifacts/bengali-reused-typography.json',JSON.stringify(reused,null,2)+'\n');
const missing=Object.keys(sources).filter(s=>!catalog[s]);
writeUtf8('artifacts/bengali-missing.json',JSON.stringify(missing,null,2)+'\n');
console.log(`Reused ${reused.length}; ${missing.length} remain.`);
