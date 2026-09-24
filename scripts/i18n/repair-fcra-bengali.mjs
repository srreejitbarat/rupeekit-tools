import fs from 'node:fs';
import ts from 'typescript';
const source=ts.createSourceFile('extra.ts',fs.readFileSync('data/extra-blog-posts.ts','utf8'),ts.ScriptTarget.Latest,true);
const messages=[];
function visit(n){if(ts.isStringLiteral(n)&&/[अ-ह]/.test(n.text))messages.push(n.text);ts.forEachChild(n,visit);}
visit(source);
const translations=[
 'FCRA বিল কী? সংক্ষেপে জেনে নিন',
 'FCRA-এর পুরো নাম Foreign Contribution (Regulation) Act। এই আইন অনুযায়ী ভারতে কোন ব্যক্তি বা সংস্থা বিদেশ থেকে অনুদান বা সহায়তা নিতে পারে এবং সেই অর্থ কীভাবে ব্যবহার করতে পারে, তা নির্ধারিত হয়। স্বরাষ্ট্র মন্ত্রক আইনটি কার্যকর করে।',
 'FCRA বিল কি পাশ হয়েছে? 10 আগস্ট 2026 পর্যন্ত হয়নি। Foreign Contribution (Regulation) Amendment Bill, 2026 লোকসভায় পেশ হয় 25 মার্চ 2026-এ। ওই পর্যালোচনার তারিখ পর্যন্ত বিলটি সংসদে বিচারাধীন ছিল এবং কোনও কক্ষেই পাশ হয়নি।',
 'FCRA সংশোধনী বিধি, 2026 আলাদা বিষয়: এগুলো 22 জুন 2026 থেকে কার্যকর, আর নতুন FCRA 2.0 পোর্টাল চালু হয়েছে 30 জুন 2026-এ। তাই শুধুমাত্র বিলে থাকা প্রস্তাবকে কার্যকর আইন ধরে নেবেন না। সর্বশেষ অবস্থার জন্য স্বরাষ্ট্র মন্ত্রকের সরকারি FCRA পোর্টাল দেখুন।',
 'FCRA বিল কি পাশ হয়েছে?',
 '10 আগস্ট 2026 পর্যন্ত Foreign Contribution (Regulation) Amendment Bill, 2026 সংসদে বিচারাধীন ছিল। এটি 25 মার্চ 2026-এ লোকসভায় পেশ হয় এবং ওই তারিখ পর্যন্ত কোনও কক্ষেই পাশ হয়নি। তবে FCRA সংশোধনী বিধি, 2026 ইতিমধ্যে 22 জুন 2026 থেকে কার্যকর। সর্বশেষ অবস্থা সরকারি সূত্রে যাচাই করুন।',
 'FCRA বিল কী?',
 'FCRA বা Foreign Contribution (Regulation) Act ভারতে বিদেশি অনুদান নিয়ন্ত্রণ করে। 2026 সালের সংশোধনী বিলে এই আইন বদলানোর প্রস্তাব আছে। যেসব সংস্থার FCRA নিবন্ধন শেষ হয়ে যায়, তাদের বিদেশি অনুদানে তৈরি সম্পত্তি পরিচালনার জন্য একটি Designated Authority গঠনের প্রস্তাবও রয়েছে। নিবন্ধের পর্যালোচনার তারিখে এই বিল আইন হয়নি।',
];
if(messages.length!==translations.length)throw new Error(`FCRA source changed: ${messages.length}`);
const file='lib/i18n/catalogs/bn.json';
const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
messages.forEach((s,i)=>catalog[s]=translations[i]);
fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
console.log(`Added ${messages.length} Bengali FCRA messages.`);
