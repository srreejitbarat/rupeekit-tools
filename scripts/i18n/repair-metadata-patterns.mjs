import fs from 'node:fs';
const additions={
 hi:{
  'A consultation visit is a step in the review process. It does not confirm a salary increase. Use the calculator to compare possible outcomes, and wait for an official recommendation or order before treating any figure as final.':'परामर्श के लिए दौरा समीक्षा प्रक्रिया का एक चरण है। इससे वेतन बढ़ने की पुष्टि नहीं होती। संभावित स्थितियों की तुलना के लिए कैलकुलेटर इस्तेमाल करें, लेकिन किसी रकम को अंतिम मानने से पहले आधिकारिक सिफारिश या आदेश का इंतज़ार करें।',
  'ZXQ0QXZ | RupeeKit':'ZXQ0QXZ | RupeeKit',
  'ZXQ0QXZ | RupeeKit Updates':'ZXQ0QXZ | RupeeKit समाचार',
  'ZXQ0QXZ Calculators India | RupeeKit':'भारत में ZXQ0QXZ कैलकुलेटर | RupeeKit',
  'Freelance & Business':'फ्रीलांस काम और कारोबार',
  'Government & Pension':'सरकारी सेवा और पेंशन',
  'Insurance & Protection':'बीमा और सुरक्षा',
  'Investing & Markets':'निवेश और बाज़ार',
  'Life-Stage Planning':'जीवन के अलग-अलग चरणों की योजना',
  'Loans & EMI':'ऋण और EMI',
  'Small Savings':'छोटी बचत',
  'Tax & Compliance':'कर और नियमों का पालन',
  'Credit card minimum due and debt repayment':'क्रेडिट कार्ड का न्यूनतम भुगतान और कर्ज़ चुकाना',
  'EPF, payslip contributions and retirement planning':'EPF, वेतन से अंशदान और सेवानिवृत्ति की योजना',
  'Gratuity and labour rules: eligibility and calculation':'ग्रेच्युटी और श्रम नियम: पात्रता और गणना',
  'GST on an Indian invoice: inclusive and exclusive prices':'भारतीय बिल में GST: कर सहित और कर से पहले की कीमत',
  'Home loan EMI, affordability and prepayment':'होम लोन की EMI, चुकाने की क्षमता और समय से पहले भुगतान',
  'Personal loan EMI, true cost and KFS':'पर्सनल लोन की EMI, कुल लागत और KFS',
  'PPF and government small-savings decisions':'PPF और सरकारी छोटी बचत योजनाओं का चुनाव',
  'Rent, buying a home and property transaction costs':'किराया, घर खरीदना और संपत्ति लेनदेन की लागत',
  'Salary, take-home pay and income tax in India':'भारत में वेतन, हाथ में आने वाली रकम और आयकर',
  'SIP goals, return assumptions and investment costs':'SIP के लक्ष्य, रिटर्न के अनुमान और निवेश की लागत',
 },
 bn:{
  'The 8th Central Pay Commission has an official Chandigarh visit scheduled for 16-18 September 2026. This confirms the consultation calendar, not a final fitment factor, pay matrix, revised HRA, pension formula or implementation date.':'অষ্টম কেন্দ্রীয় বেতন কমিশনের চণ্ডীগড় সফর 16-18 সেপ্টেম্বর 2026-এর জন্য নির্ধারিত। এই সূচি পরামর্শের তারিখ নিশ্চিত করে; চূড়ান্ত ফিটমেন্ট ফ্যাক্টর, বেতন কাঠামো, সংশোধিত HRA, পেনশনের সূত্র বা কার্যকর হওয়ার তারিখ নিশ্চিত করে না।',
  'A consultation visit is a step in the review process. It does not confirm a salary increase. Use the calculator to compare possible outcomes, and wait for an official recommendation or order before treating any figure as final.':'পরামর্শের জন্য সফর পর্যালোচনার একটি ধাপ। এতে বেতন বৃদ্ধি নিশ্চিত হয় না। সম্ভাব্য ফল তুলনা করতে ক্যালকুলেটর ব্যবহার করুন; কোনও অঙ্ক চূড়ান্ত ধরে নেওয়ার আগে সরকারি সুপারিশ বা আদেশের জন্য অপেক্ষা করুন।',
  '8th Pay Commission 2026: Fitment Factor, Salary & Status':'অষ্টম বেতন কমিশন 2026: ফিটমেন্ট ফ্যাক্টর, বেতন ও বর্তমান অবস্থা',
  '50/30/20 Budget Rule India 2026: Split Your Salary Correctly':'50/30/20 বাজেট নিয়ম: 2026-এ বেতন ভাগ করার উপায়',
  'Withdraw EPF After Resignation 2026: Online in 5 Steps':'চাকরি ছাড়ার পরে EPF তোলা: অনলাইনে 5টি ধাপ',
  'Section 44ADA for Freelancers India FY 2026-27: Simple Guide':'ফ্রিল্যান্সারদের জন্য ধারা 44ADA: 2026-27 অর্থবর্ষের নির্দেশিকা',
  'TDS on FD Interest India FY 2026-27':'2026-27 অর্থবর্ষে FD-এর সুদে TDS',
  'Zerodha vs Upstox vs Angel One 2026: Which Is Best?':'Zerodha, Upstox ও Angel One: 2026-এ খরচ ও সুবিধার তুলনা',
  'Does the DA Merge Cut Your 8th Pay Commission Raise?':'DA একীভূত হলে অষ্টম বেতন কমিশনের বেতন বৃদ্ধি কি কমে?',
  'How 8th Pay Commission Arrears Are Calculated':'অষ্টম বেতন কমিশনের বকেয়ার হিসাব কীভাবে হয়',
  'Why Your Take-Home Fell Under the New Labour Codes':'নতুন শ্রমবিধিতে হাতে পাওয়া বেতন কেন কমতে পারে',
  '8th Pay Commission Pension Calculator 2026':'অষ্টম বেতন কমিশনের পেনশন ক্যালকুলেটর 2026',
  '8th Pay Commission Salary Calculator 2026 (Fitment Factor)':'অষ্টম বেতন কমিশনের বেতন ক্যালকুলেটর 2026 (ফিটমেন্ট ফ্যাক্টর)',
  'XIRR Portfolio Return Calculator | Annualised Estimate':'XIRR পোর্টফোলিও রিটার্ন ক্যালকুলেটর | বার্ষিক হারের অনুমান',
  'Estimate an unofficial 8th Pay Commission arrears scenario from current and projected monthly basic, DA, HRA, other pay, dates and entered deductions.':'বর্তমান ও সম্ভাব্য মাসিক মূল বেতন, DA, HRA, অন্যান্য বেতন, তারিখ ও কর্তন দিয়ে অষ্টম বেতন কমিশনের বকেয়ার সম্ভাব্য হিসাব দেখুন। এটি সরকারি হিসাব নয়।',
  'Compare current pension plus DR with an unofficial 8th Pay Commission multiplier scenario, projected DR and additional pension rate. No official method assumed.':'বর্তমান পেনশন ও DR-এর সঙ্গে সম্ভাব্য গুণক, DR ও অতিরিক্ত পেনশনের হার প্রয়োগ করে তুলনা করুন। অষ্টম বেতন কমিশনের এই উদাহরণে কোনও সরকারি পদ্ধতি ধরে নেওয়া হয়নি।',
  'Calculate revised basic pay, DA, HRA and gross salary across unofficial 8th Pay Commission fitment-factor scenarios. No final factor has been notified.':'অষ্টম বেতন কমিশনের সম্ভাব্য ফিটমেন্ট ফ্যাক্টর দিয়ে নতুন মূল বেতন, DA, HRA ও মোট বেতন হিসাব করুন। চূড়ান্ত ফ্যাক্টর এখনও সরকারি ভাবে ঘোষণা করা হয়নি।',
  'Who files ITR-2 for AY 2026-27: capital gains (Schedule CG), foreign assets and RSUs (Schedule FA), belated and revised returns. Reviewed against Income Tax Department guidance.':'2026-27 করবর্ষে কারা ITR-2 দাখিল করবেন: মূলধনি লাভ (Schedule CG), বিদেশি সম্পদ ও RSU (Schedule FA), দেরিতে জমা ও সংশোধিত রিটার্ন। আয়কর বিভাগের নির্দেশিকা অনুযায়ী পর্যালোচিত।',
  'ZXQ0QXZ | RupeeKit':'ZXQ0QXZ | RupeeKit',
  'ZXQ0QXZ | RupeeKit Updates':'ZXQ0QXZ | RupeeKit খবর',
  'ZXQ0QXZ Calculators India | RupeeKit':'ভারতে ZXQ0QXZ ক্যালকুলেটর | RupeeKit',
  'Estimate investment doubling time with the Rule of 72, compare it with exact annual compounding, and view preset estimates at 8%, 10%, 12% and 15%.':'72-এর নিয়মে বিনিয়োগ দ্বিগুণ হওয়ার আনুমানিক সময় দেখুন। বার্ষিক চক্রবৃদ্ধির সঠিক হিসাবের সঙ্গে তুলনা করুন এবং 8%, 10%, 12% ও 15% হারে উদাহরণ দেখুন।',
  'Your room cost more than the policy allows. See how much of the whole hospital bill the insurer cuts, not just the room rent difference itself.':'হাসপাতালের ঘরভাড়া পলিসির সীমার বেশি হলে শুধু ভাড়ার পার্থক্য নয়, পুরো বিল থেকে কত টাকা বাদ পড়তে পারে তা হিসাব করুন।',
  'Estimate education-loan EMI, total interest and repayment cost, then model the entered Section 80E interest deduction assumption for an educational comparison.':'শিক্ষাঋণের EMI, মোট সুদ ও শোধের খরচ হিসাব করুন। তারপর ধারা 80E-তে সুদের ছাড়ের জন্য আপনার দেওয়া অনুমান প্রয়োগ করে তুলনা করুন।',
  'Work out service duration from joining and exit records, then use only the legally eligible years in a gratuity estimate.':'যোগদান ও চাকরি ছাড়ার তারিখ থেকে চাকরির মেয়াদ বের করুন। গ্র্যাচুইটির হিসাবে কেবল আইন অনুযায়ী যোগ্য বছরগুলো ব্যবহার করুন।',
  'Your CTC did not change, but more of it now goes to provident fund and gratuity. Here is the arithmetic behind a 2% to 6% drop in monthly pay.':'CTC একই থাকলেও PF ও গ্র্যাচুইটিতে বেশি অর্থ গেলে হাতে পাওয়া বেতন কমতে পারে। মাসিক বেতন 2% থেকে 6% কমার উদাহরণের হিসাব দেখুন।',
 }
};
for(const locale of ['hi','bn']) {
 const file=`lib/i18n/catalogs/${locale}.json`;
 const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 Object.assign(catalog,additions[locale]);
 fs.writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
}
