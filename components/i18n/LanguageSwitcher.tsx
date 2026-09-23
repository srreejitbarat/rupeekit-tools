'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { hasHindiPage, LANGUAGE_PREFERENCE_KEY, localizedHref, type Locale } from '@/lib/i18n/routing';

function remember(language: Locale) {
  try { localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language); } catch { /* Links work without storage. */ }
  window.dispatchEvent(new Event('rupeekit-language-change'));
}

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const [suffix, setSuffix] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hindiLinkRef = useRef<HTMLAnchorElement>(null);
  const headingId = useId();
  const available = hasHindiPage(pathname);

  useEffect(() => {
    if (locale === 'hi') remember('hi');
  }, [locale]);

  useEffect(() => {
    const update = () => setSuffix(`${window.location.search}${window.location.hash}`);
    update();
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('popstate', update);
    };
  }, [pathname]);

  function select(language: Locale, fallback = false) {
    remember(language);
    trackAnalyticsEvent('language_selected', {
      language, previous_language: locale, page_path: pathname, fallback,
    });
  }

  const linkClass = (language: Locale) =>
    `flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandNavy focus-visible:ring-offset-2 ${locale === language ? 'bg-brandNavy text-white dark:bg-slate-700' : 'text-brandNavy hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`;

  return (
    <>
      <div className="flex shrink-0 rounded-full border border-brandBorder bg-white p-0.5 dark:border-slate-700 dark:bg-slate-950" role="group" aria-label="Language / भाषा">
        {/* Full navigation across language roots gives the document its correct
            server-rendered lang, metadata and shell even with JavaScript off. */}
        <a
          href={`${localizedHref(pathname, 'en')}${suffix}`}
          hrefLang="en-IN" lang="en" aria-label="English" title="English"
          aria-current={locale === 'en' ? 'page' : undefined}
          className={linkClass('en')}
          onClick={(event) => {
            select('en');
            if (locale === 'en' && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) event.preventDefault();
            else event.currentTarget.href = `${localizedHref(pathname, 'en')}${window.location.search}${window.location.hash}`;
          }}
        >
          <span className="sm:hidden">EN</span><span className="hidden sm:inline">English</span>
        </a>
        <a
          ref={hindiLinkRef}
          href={available ? `${localizedHref(pathname, 'hi')}${suffix}` : '/hi'}
          hrefLang="hi-IN" lang="hi" aria-label={available ? 'हिंदी' : 'हिंदी के विकल्प / Hindi options'}
          title={available ? 'हिंदी' : 'इस पेज का हिंदी अनुवाद अभी उपलब्ध नहीं है'}
          aria-current={locale === 'hi' ? 'page' : undefined}
          aria-haspopup={available ? undefined : 'dialog'}
          className={linkClass('hi')}
          onClick={(event) => {
            if (locale === 'hi') {
              if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) event.preventDefault();
              select('hi');
              return;
            }
            if (!available && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
              event.preventDefault();
              dialogRef.current?.showModal();
              return;
            }
            select('hi', !available);
            if (available) event.currentTarget.href = `${localizedHref(pathname, 'hi')}${window.location.search}${window.location.hash}`;
          }}
        >हिंदी</a>
      </div>
      {!available ? (
        <dialog
          ref={dialogRef} aria-labelledby={headingId} lang="hi-IN"
          onClose={() => hindiLinkRef.current?.focus()}
          className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-3xl border border-brandBorder bg-white p-6 text-slate-900 shadow-elevated backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <h2 id={headingId} className="text-xl font-bold leading-relaxed">यह पेज अभी अंग्रेज़ी में उपलब्ध है</h2>
          <p className="mt-3 text-sm leading-7">हिंदी में होमपेज और कैलकुलेटर की सूची देख सकते हैं। इस पेज पर बने रहने से आपके भरे हुए नंबर सुरक्षित रहेंगे।</p>
          <p lang="en" className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">This page is currently in English. You can stay here or open the Hindi homepage.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" autoFocus onClick={() => dialogRef.current?.close()} className="min-h-11 rounded-xl border border-brandBorder px-4 py-2 text-sm font-bold focus-visible:ring-2 focus-visible:ring-brandNavy">इसी पेज पर रहें</button>
            <a href="/hi" hrefLang="hi-IN" onClick={() => select('hi', true)} className="flex min-h-11 items-center rounded-xl bg-brandNavy px-4 py-2 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-offset-2">हिंदी होमपेज खोलें</a>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
