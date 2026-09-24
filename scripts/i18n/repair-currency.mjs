import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {writeUtf8} from './write-file.mjs';

// Repair a UTF-8 rupee symbol previously decoded as Windows-1252. Keep
// dictionary keys in sync with shared source so this repair cannot break lookups.
const broken = '\u00e2\u201a\u00b9';
const files = execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n');
for (const file of files) {
  if (!/^(data|lib|components|app)\//.test(file) || !/\.(tsx?|json)$/.test(file)) continue;
  const before=fs.readFileSync(file,'utf8');
  const after=before.replaceAll(broken,'₹')
    .replaceAll('\u00c3\u2014','×')
    .replaceAll('\u00e2\u02c6\u2019','−')
    .replaceAll('\u00e2\u20ac\u201c','–')
    .replaceAll('\u00e2\u20ac\u201d','—')
    .replaceAll('\u00e2\u20ac\u2122','’');
  if (before!==after) {writeUtf8(file,after);console.log(file);}
}
const file='lib/i18n/catalogs/bn.json';
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
for(const [source,target] of Object.entries(catalog)) {
  if(source==='3% of ZXQ0QXZ, rounded up to the next ₹100') catalog[source]='ZXQ0QXZ-এর 3%, পরবর্তী ₹100-এর গুণিতকে ঊর্ধ্বমুখী পূর্ণ করা হয়েছে';
  if(source==='The current ceiling is ₹9 lakh for a single account and ₹15 lakh for a joint account.') catalog[source]='বর্তমানে একক অ্যাকাউন্টের সর্বোচ্চ সীমা ₹9 লক্ষ এবং যৌথ অ্যাকাউন্টের সীমা ₹15 লক্ষ।';
  if(source.includes('₹50')) catalog[source]=target.replace('50 লক্ষ টাকার','₹50 লক্ষের').replace('50 লক্ষ টাকা','₹50 লক্ষ').replace('₹50 লক্ষর','₹50 লক্ষের');
}
writeUtf8(file,JSON.stringify(catalog,null,2)+'\n');
