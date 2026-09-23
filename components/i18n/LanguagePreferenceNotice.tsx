'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { hasTranslatedPage, LANGUAGE_PREFERENCE_KEY, localizedHref, LOCALE_TAGS } from '@/lib/i18n/routing';

// A remembered choice suggests a translation; explicit URLs always win.
export default function LanguagePreferenceNotice() {
  const pathname = usePathname() || '/';
  const [preferred, setPreferred] = useState<'hi' | 'bn' | null>(null);
  useEffect(() => {
    const update = () => {
      try {
        const value = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
        setPreferred((value === 'hi' || value === 'bn') && sessionStorage.getItem('rupeekit-language-notice-dismissed') !== 'yes' ? value : null);
      } catch { setPreferred(null); }
    };
    update();
    window.addEventListener('rupeekit-language-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('rupeekit-language-change', update);
      window.removeEventListener('storage', update);
    };
  }, [pathname]);
  if (!preferred) return null;
  const available = hasTranslatedPage(pathname, preferred);
  const bengali = preferred === 'bn';
  return (
    <aside lang={LOCALE_TAGS[preferred]} aria-label={bengali ? 'পছন্দের ভাষা' : 'भाषा की पसंद'} className="border-b border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p>
          {bengali
            ? available ? 'এই পেজটি বাংলাতেও পড়তে পারেন।' : 'এই পেজটি এখন ইংরেজিতে আছে। বাংলায় হোমপেজ ও ক্যালকুলেটরের তালিকা পাবেন।'
            : available ? 'यह पेज हिंदी में भी पढ़ सकते हैं।' : 'यह पेज अभी अंग्रेज़ी में है। हिंदी में होमपेज और कैलकुलेटर की सूची उपलब्ध है।'}{' '}
          <a href={localizedHref(available ? pathname : '/', preferred)} className="font-bold underline underline-offset-4">{bengali ? 'বাংলায় দেখুন' : 'हिंदी में देखें'}</a>
        </p>
        <button type="button" aria-label={bengali ? 'ভাষার বার্তা বন্ধ করুন' : 'भाषा की सूचना बंद करें'} className="min-h-11 min-w-11 rounded-lg font-bold focus-visible:ring-2 focus-visible:ring-brandNavy" onClick={() => {
          setPreferred(null);
          try { sessionStorage.setItem('rupeekit-language-notice-dismissed', 'yes'); } catch { /* Optional preference. */ }
        }}>×</button>
      </div>
    </aside>
  );
}
