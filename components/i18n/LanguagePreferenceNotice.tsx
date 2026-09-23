'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { hasHindiPage, LANGUAGE_PREFERENCE_KEY, localizedHref } from '@/lib/i18n/routing';

// Respect explicit URLs. A remembered choice suggests Hindi; it never redirects
// search visitors or sends an English-only calculator to a different page.
export default function LanguagePreferenceNotice() {
  const pathname = usePathname() || '/';
  const [show, setShow] = useState(false);
  useEffect(() => {
    const update = () => {
      try {
        setShow(localStorage.getItem(LANGUAGE_PREFERENCE_KEY) === 'hi' && sessionStorage.getItem('rupeekit-language-notice-dismissed') !== 'yes');
      } catch { setShow(false); }
    };
    update();
    window.addEventListener('rupeekit-language-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('rupeekit-language-change', update);
      window.removeEventListener('storage', update);
    };
  }, [pathname]);
  if (!show) return null;
  return (
    <aside lang="hi-IN" aria-label="भाषा की पसंद" className="border-b border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p>
          {hasHindiPage(pathname) ? 'यह पेज हिंदी में भी पढ़ सकते हैं।' : 'यह पेज अभी अंग्रेज़ी में है। हिंदी में होमपेज और कैलकुलेटर की सूची उपलब्ध है।'}{' '}
          <a href={hasHindiPage(pathname) ? localizedHref(pathname, 'hi') : '/hi'} className="font-bold underline underline-offset-4">हिंदी में देखें</a>
        </p>
        <button type="button" aria-label="भाषा की सूचना बंद करें" className="min-h-11 min-w-11 rounded-lg font-bold focus-visible:ring-2 focus-visible:ring-brandNavy" onClick={() => {
          setShow(false);
          try { sessionStorage.setItem('rupeekit-language-notice-dismissed', 'yes'); } catch { /* Optional preference. */ }
        }}>×</button>
      </div>
    </aside>
  );
}
