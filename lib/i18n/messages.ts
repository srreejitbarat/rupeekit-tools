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

export function siteMessages(locale: Locale) { return locale === 'hi' ? hi : en; }

export const hindiCategories: Record<string, string> = {
  All: 'सभी', Salary: 'सैलरी', Tax: 'टैक्स', Loans: 'लोन', Savings: 'बचत',
  Investments: 'निवेश', Investing: 'निवेश', Retirement: 'रिटायरमेंट', Housing: 'घर और किराया',
  Debt: 'कर्ज़', Planning: 'पैसों की योजना', Insurance: 'बीमा',
  Business: 'काम और कारोबार',
};

export function categoryLabel(category: string, locale: Locale) {
  return locale === 'hi' ? (hindiCategories[category] ?? category) : category;
}
