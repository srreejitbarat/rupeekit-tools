import fs from 'node:fs';
import {writeUtf8} from './write-file.mjs';
const audit=JSON.parse(fs.readFileSync('artifacts/bengali-completion-audit/pages.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('lib/i18n/catalogs/bn.json','utf8'));
const revisions={
 '/bn/blog/nri-taxation-basics-residency-taxable-income-india':{title:'NRI কর 2026-27: নিবাস, ভারতীয় আয় ও DTAA'},
 '/bn/financial-updates/epfo-services-restored-july-2026':{description:'আপগ্রেডের পর EPFO-এর সদস্য ও নিয়োগকর্তা পরিষেবা চালু হয়েছে। সিস্টেম স্থিতিশীল করা ও অতিরিক্ত যাচাইয়ের কারণে কিছু দাবির নিষ্পত্তিতে দেরি হতে পারে।'},
 '/bn/financial-updates/epfo-vishwas-amnesty-2026-live':{description:'EPFO-এর বিশ্বাস ও অ্যামনেস্টি 2026 প্রকল্প পুরোনো PF বিরোধ ও ট্রাস্টের নিয়মপালনের জন্য। এগুলি নতুন টাকা তোলার সুবিধা বা সদস্যদের সুদের হার নয়।'},
 '/bn/financial-updates/foreign-assets-information-in-ais-july-2026':{description:'যোগ্য করদাতারা AIS-এ কিছু বিদেশি সম্পদ ও আয়ের তথ্য দেখতে পারবেন। তথ্য অসম্পূর্ণ হতে পারে, তাই রিটার্ন জমার আগে নিজের নথির সঙ্গে মিলিয়ে নিন।'},
 '/bn/financial-updates/income-tax-demand-facilitation-centre-july-2026':{title:'পুরোনো আয়কর দাবি: নতুন সহায়তা কেন্দ্র | RupeeKit খবর',description:'বকেয়া কর দাবির প্রশ্নে সহায়তা দিতে আয়কর বিভাগ নতুন কেন্দ্র চালু করেছে। এটি প্রক্রিয়া বোঝায়; নিজে থেকে দাবি বাতিল, কমানো বা সঠিক বলে ঘোষণা করে না।'},
 '/bn/financial-updates/income-tax-itr7-utility-available-august-2026':{title:'ITR-7 অনলাইন পরিষেবা: AY 2026-27 | RupeeKit খবর',description:'আয়কর পোর্টাল অনুযায়ী, AY 2026-27-এর ITR-7 অনলাইন পরিষেবা 11 আগস্ট 2026 চালু হয়েছে। ফর্ম জমার আগে পোর্টালে উপলব্ধ অনলাইন ও Excel সুবিধা দেখে নিন।'},
 '/bn/financial-updates/small-savings-rates-july-september-2026':{title:'PPF, SSY, SCSS ও MIS সুদ: জুলাই–সেপ্টেম্বর 2026 | RupeeKit খবর'},
};
const edits=[];
for(const [url,fields]of Object.entries(revisions))for(const [field,target]of Object.entries(fields)){
 const before=audit.find(p=>p.url===url)?.[field];
 if(!before)throw Error(`Missing audited ${field} for ${url}`);
 let matches=0;
 for(const [source,existing]of Object.entries(catalog))if(existing===before){catalog[source]=target;edits.push({url,field,source,before,target});matches++;}
 // News titles can receive the site suffix after translation.
 if(!matches&&field==='title')for(const [source,existing]of Object.entries(catalog))if(existing===before.replace(/ \| RupeeKit খবর$/,'')){
  catalog[source]=target.replace(/ \| RupeeKit খবর$/,'');edits.push({url,field,source,before,target});matches++;
 }
 if(!matches&&!Object.values(catalog).includes(target)&&!Object.values(catalog).includes(target.replace(/ \| RupeeKit খবর$/,'')))throw Error(`No exact catalog match: ${url} ${field}`);
}
writeUtf8('lib/i18n/catalogs/bn.json',JSON.stringify(catalog,null,2)+'\n');
writeUtf8('artifacts/google-translation/bengali-metadata-revisions.json',JSON.stringify(edits,null,2)+'\n');
console.log(`Shortened ${edits.length} Bengali metadata entries.`);
