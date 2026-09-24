import fs from 'node:fs';
import {catalogProblems} from './catalog-quality.mjs';
import {writeUtf8} from './write-file.mjs';
const dir='artifacts/google-translation/';
const drafts=JSON.parse(fs.readFileSync(dir+'bengali-google-drafts.json','utf8'));
const rows=JSON.parse(fs.readFileSync(dir+'bengali-source-map.json','utf8'));
const fixes=JSON.parse(fs.readFileSync('docs/bengali-google-review-fixes.json','utf8'));
const excluded=new Set(['100120','100784']); // CSS and analytics JavaScript, not prose.
const catalog=JSON.parse(fs.readFileSync('lib/i18n/catalogs/bn.json','utf8'));
const applied=[];
for(const {id,source} of rows){
 if(excluded.has(String(id)))continue;
 let target=fixes[id]||drafts[source];
 // Reviewed terminology changes apply to the imported drafts only.
 target=target.replaceAll('প্রবেশ করানো','দেওয়া').replaceAll('বস্তুগতভাবে','উল্লেখযোগ্যভাবে')
  .replaceAll('শিক্ষাগত তথ্য','শিক্ষামূলক তথ্য').replaceAll('স্ট্যান্ডার্ড ডিগ্রী','স্ট্যান্ডার্ড ডিডাকশন')
  .replaceAll('এবং বিদ্যমান জীবন বীমা থেকে তা বিয়োগ করা হয়','এবং সেই মোট থেকে বিদ্যমান জীবনবিমার পরিমাণ বাদ দেওয়া হয়');
 for(const match of source.matchAll(/₹\s*([\d,]+(?:\.\d+)?)/g)){
  target=target.replaceAll(`${match[1]} টাকা`, `₹${match[1]}`);
 }
 const problems=catalogProblems(source,target);
 if(problems.length)throw Error(`${id}: ${problems.join(',')}`);
 catalog[source]=target;applied.push({id,source,reviewedOverride:!!fixes[id]});
}
writeUtf8('lib/i18n/catalogs/bn.json',JSON.stringify(catalog,null,2)+'\n');
writeUtf8(dir+'bengali-applied.json',JSON.stringify(applied,null,2)+'\n');
console.log(`Applied ${applied.length} Bengali messages with placeholder validation and targeted editorial corrections.`);
