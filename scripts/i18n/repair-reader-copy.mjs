import fs from 'node:fs';
import {writeUtf8} from './write-file.mjs';
const edits=[
 {
  file:'data/query-variant-blog-overrides-2026-08-18.json',slug:'new-labour-code-gratuity-rules-india-2026',paragraph:true,
  en:'The one-year gratuity rule does not apply to every employee or contract worker. Eligibility depends on the employment category and the conditions in the applicable law. Regular employees generally need five years of continuous service; eligible fixed-term employees can have a different threshold.',
  hi:'एक साल में ग्रेच्युटी पाने का नियम हर कर्मचारी या ठेका श्रमिक पर लागू नहीं होता। पात्रता नौकरी की श्रेणी और लागू कानून की शर्तों पर निर्भर करती है। नियमित कर्मचारियों को आमतौर पर पाँच साल की लगातार सेवा पूरी करनी होती है; पात्र निश्चित-अवधि के कर्मचारियों के लिए सीमा अलग हो सकती है।',
  bn:'এক বছরে গ্র্যাচুইটি পাওয়ার নিয়ম সব কর্মী বা চুক্তিভিত্তিক শ্রমিকের জন্য প্রযোজ্য নয়। যোগ্যতা নির্ভর করে চাকরির ধরন ও প্রযোজ্য আইনের শর্তের উপর। নিয়মিত কর্মীদের সাধারণত পাঁচ বছর একটানা কাজ করতে হয়; যোগ্য নির্দিষ্ট-মেয়াদী কর্মীদের জন্য সীমা আলাদা হতে পারে।',
 },
 {
  file:'data/query-variant-tool-overrides-2026-08-18.json',slug:'personal-loan-emi-calculator-india',
  en:'To compare loan amounts, enter ₹5 lakh, ₹10 lakh, ₹15 lakh or ₹20 lakh and keep the interest rate and tenure the same. Compare the monthly EMI and total repayment. These are estimates, not lender quotes.',
  hi:'ऋण की रकम की तुलना के लिए ₹5 लाख, ₹10 लाख, ₹15 लाख या ₹20 लाख दर्ज करें। ब्याज दर और अवधि एक जैसी रखें, फिर मासिक EMI और कुल भुगतान देखें। ये अनुमान हैं, बैंक के प्रस्ताव नहीं।',
  bn:'ঋণের অঙ্ক তুলনা করতে ₹5 লক্ষ, ₹10 লক্ষ, ₹15 লক্ষ বা ₹20 লক্ষ লিখুন। সুদের হার ও মেয়াদ একই রেখে মাসিক EMI ও মোট পরিশোধের অঙ্ক তুলনা করুন। এগুলো অনুমান, ঋণদাতার প্রস্তাব নয়।',
 },
 {
  file:'data/issue-80-tool-overrides-2026-08-27.json',slug:'sip-calculator-india',
  en:'Use this calculator when you plan to invest the same amount each month. If you want to increase that amount every year, use the Step-Up SIP Calculator. For a single investment, use the Lumpsum Calculator.',
  hi:'हर महीने एक जैसी रकम निवेश करने की योजना हो तो यह कैलकुलेटर इस्तेमाल करें। रकम हर साल बढ़ानी हो तो Step-Up SIP कैलकुलेटर चुनें। एक बार निवेश करने के लिए Lumpsum कैलकुलेटर इस्तेमाल करें।',
  bn:'প্রতি মাসে একই অঙ্ক বিনিয়োগ করলে এই ক্যালকুলেটর ব্যবহার করুন। প্রতি বছর অঙ্ক বাড়াতে চাইলে Step-Up SIP ক্যালকুলেটর বেছে নিন। একবার বিনিয়োগের জন্য Lumpsum ক্যালকুলেটর ব্যবহার করুন।',
 }
];
for(const edit of edits){
 const raw=fs.readFileSync(edit.file,'utf8');
 const data=JSON.parse(raw);
 const previous=edit.paragraph?data[edit.slug].sections[0].paragraphs[0]:data[edit.slug].contentSections[0].body;
 writeUtf8(edit.file,raw.replace(JSON.stringify(previous),JSON.stringify(edit.en)));
}
for(const locale of ['hi','bn']){
 const file=`lib/i18n/catalogs/${locale}.json`;
 const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const edit of edits)catalog[edit.en]=edit[locale];
 writeUtf8(file,JSON.stringify(catalog,null,2)+'\n');
}
