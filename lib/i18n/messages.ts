import type { Locale } from './routing';

const en = {
  home: 'Home', tools: 'Calculators', hubs: 'Topics', blog: 'Blog', guides: 'Guides',
  resources: 'Resources', start: 'Start here', health: 'Money Health Check',
  light: 'Use light theme', dark: 'Use dark theme', openMenu: 'Open menu', closeMenu: 'Close menu',
  primary: 'Primary navigation', mobile: 'Mobile navigation', categories: 'Calculator categories',
  navigation: 'Explore', legal: 'Policies', contact: 'Contact',
  contactDescription: 'For questions, feedback, or tool ideas:',
  description: 'Free India-focused calculators for salary, EMI, SIP, GST, FD, and personal finance planning.',
  disclaimerTitle: 'About these estimates',
  disclaimer: 'RupeeKit provides educational calculators, reading lists, and money tools. Content is for general information only and is not financial, tax, legal, or investment advice.',
  rights: 'All rights reserved.', tagline: 'Money tools for India',
  pay: '8th Pay Commission', deadlines: 'Tax deadlines', nri: 'NRI guide', recommended: 'Recommended tools',
  editorial: 'Editorial policy', corrections: 'Corrections policy', privacy: 'Privacy policy',
  affiliate: 'Affiliate disclosure', terms: 'Terms of use', disclaimerLink: 'Disclaimer',
  englishOnly: 'Available in English',
};

const hi: typeof en = {
  home: 'होम', tools: 'कैलकुलेटर', hubs: 'विषय', blog: 'लेख', guides: 'गाइड',
  resources: 'काम की जानकारी', start: 'यहाँ से शुरू करें', health: 'अपनी पैसों की स्थिति जाँचें',
  light: 'हल्का रंग चुनें', dark: 'गहरा रंग चुनें', openMenu: 'मेन्यू खोलें', closeMenu: 'मेन्यू बंद करें',
  primary: 'मुख्य मेन्यू', mobile: 'मोबाइल मेन्यू', categories: 'कैलकुलेटर के विषय',
  navigation: 'और देखें', legal: 'हमारी नीतियाँ', contact: 'संपर्क करें',
  contactDescription: 'सवाल, सुझाव या नए कैलकुलेटर के विचार भेजें:',
  description: 'सैलरी, EMI, SIP, GST, FD और पैसों की योजना के लिए मुफ़्त भारतीय कैलकुलेटर।',
  disclaimerTitle: 'इन अनुमानों के बारे में',
  disclaimer: 'RupeeKit के कैलकुलेटर और लेख समझने और सीखने में मदद करते हैं। यह सामान्य जानकारी है, व्यक्तिगत वित्तीय, टैक्स, कानूनी या निवेश सलाह नहीं।',
  rights: 'सभी अधिकार सुरक्षित।', tagline: 'भारत के लिए पैसों का आसान हिसाब',
  pay: '8वाँ वेतन आयोग', deadlines: 'टैक्स की आखिरी तारीखें', nri: 'NRI के लिए गाइड', recommended: 'काम के दूसरे टूल',
  editorial: 'लेख कैसे तैयार होते हैं', corrections: 'गलती सुधारने की नीति', privacy: 'निजता की नीति',
  affiliate: 'एफिलिएट लिंक की जानकारी', terms: 'इस्तेमाल की शर्तें', disclaimerLink: 'ज़रूरी सूचना',
  englishOnly: 'अंग्रेज़ी में उपलब्ध',
};

const bn: typeof en = {
  home: 'হোম', tools: 'ক্যালকুলেটর', hubs: 'বিষয়', blog: 'লেখা', guides: 'গাইড',
  resources: 'কাজের তথ্য', start: 'এখান থেকে শুরু করুন', health: 'নিজের টাকার অবস্থা যাচাই করুন',
  light: 'হালকা রং বেছে নিন', dark: 'গাঢ় রং বেছে নিন', openMenu: 'মেনু খুলুন', closeMenu: 'মেনু বন্ধ করুন',
  primary: 'মূল মেনু', mobile: 'মোবাইল মেনু', categories: 'ক্যালকুলেটরের বিষয়',
  navigation: 'আরও দেখুন', legal: 'আমাদের নীতি', contact: 'যোগাযোগ করুন',
  contactDescription: 'প্রশ্ন, মতামত বা নতুন ক্যালকুলেটরের ভাবনা পাঠান:',
  description: 'বেতন, EMI, SIP, GST, FD ও টাকার পরিকল্পনার জন্য বিনামূল্যে ভারতীয় ক্যালকুলেটর।',
  disclaimerTitle: 'এই অনুমানগুলি সম্পর্কে',
  disclaimer: 'RupeeKit-এর ক্যালকুলেটর ও লেখা বুঝতে এবং শিখতে সাহায্য করে। এগুলি সাধারণ তথ্য, ব্যক্তিগত আর্থিক, ট্যাক্স, আইনি বা বিনিয়োগের পরামর্শ নয়।',
  rights: 'সমস্ত অধিকার সংরক্ষিত।', tagline: 'ভারতের জন্য টাকার সহজ হিসাব',
  pay: 'অষ্টম বেতন কমিশন', deadlines: 'ট্যাক্সের শেষ তারিখ', nri: 'NRI-দের জন্য গাইড', recommended: 'কাজের অন্যান্য টুল',
  editorial: 'লেখা কীভাবে তৈরি হয়', corrections: 'ভুল সংশোধনের নীতি', privacy: 'গোপনীয়তার নীতি',
  affiliate: 'অ্যাফিলিয়েট লিঙ্কের তথ্য', terms: 'ব্যবহারের শর্ত', disclaimerLink: 'জরুরি তথ্য',
  englishOnly: 'ইংরেজিতে পাওয়া যাবে',
};

export function siteMessages(locale: Locale) { return locale === 'bn' ? bn : locale === 'hi' ? hi : en; }

export const hindiCategories: Record<string, string> = {
  All: 'सभी', Salary: 'सैलरी', Tax: 'टैक्स', Loans: 'लोन', Savings: 'बचत',
  Investments: 'निवेश', Investing: 'निवेश', Retirement: 'रिटायरमेंट', Housing: 'घर और किराया',
  Debt: 'कर्ज़', Planning: 'पैसों की योजना', Insurance: 'बीमा',
  Business: 'काम और कारोबार',
};

export const bengaliCategories: Record<string, string> = {
  All: 'সব', Salary: 'বেতন', Tax: 'ট্যাক্স', Loans: 'লোন', Savings: 'সঞ্চয়',
  Investments: 'বিনিয়োগ', Investing: 'বিনিয়োগ', Retirement: 'অবসর', Housing: 'বাড়ি ও ভাড়া',
  Debt: 'ঋণ', Planning: 'টাকার পরিকল্পনা', Insurance: 'বিমা', Business: 'কাজ ও ব্যবসা',
};

export function categoryLabel(category: string, locale: Locale) {
  return locale === 'bn' ? (bengaliCategories[category] ?? category) : locale === 'hi' ? (hindiCategories[category] ?? category) : category;
}

export function explorerMessages(locale: Locale) {
  if (locale === 'bn') return {
    catalog: 'ক্যালকুলেটরের তালিকা', search: 'ক্যালকুলেটর খুঁজুন', placeholder: 'যেমন: বেতন, লোন, SIP বা ট্যাক্স',
    filter: 'বিষয় বেছে নিন', count: 'ক্যালকুলেটর', clear: 'সব ক্যালকুলেটর দেখান', open: 'ক্যালকুলেটর খুলুন',
    english: 'ইংরেজিতে পাওয়া যাবে', empty: 'কোনও ক্যালকুলেটর পাওয়া যায়নি', retry: 'ছোট নাম লিখে খুঁজুন বা সব বিষয় বেছে নিন।',
  };
  if (locale === 'hi') return {
    catalog: 'कैलकुलेटर की सूची', search: 'कैलकुलेटर खोजें', placeholder: 'जैसे: सैलरी, लोन, SIP या टैक्स',
    filter: 'विषय चुनें', count: 'कैलकुलेटर', clear: 'सभी कैलकुलेटर दिखाएँ', open: 'कैलकुलेटर खोलें',
    english: 'अंग्रेज़ी में उपलब्ध', empty: 'कोई कैलकुलेटर नहीं मिला', retry: 'छोटा नाम लिखकर खोजें या सभी विषय चुनें।',
  };
  return {
    catalog: 'Calculator catalog', search: 'Find the right calculator', placeholder: 'Search by goal or calculator name',
    filter: 'Filter by category', count: 'calculators', clear: 'Clear filters', open: 'Open calculator',
    english: 'Available in English', empty: 'No calculators found', retry: 'Try a broader search or clear the category filter.',
  };
}
