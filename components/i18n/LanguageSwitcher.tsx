'use client';

import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { hasTranslatedPage, LANGUAGE_PREFERENCE_KEY, localizedHref, LOCALES, LOCALE_LABELS, LOCALE_TAGS, type Locale } from '@/lib/i18n/routing';

function remember(language: Locale) {
  try { localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language); } catch { /* Links work without storage. */ }
  window.dispatchEvent(new Event('rupeekit-language-change'));
}

const fallbackCopy = {
  hi: {
    options: 'हिंदी के विकल्प / Hindi options',
    title: 'यह पेज अभी अंग्रेज़ी में उपलब्ध है',
    description: 'हिंदी में होमपेज और कैलकुलेटर की सूची देख सकते हैं। इस पेज पर बने रहने से आपके भरे हुए नंबर सुरक्षित रहेंगे।',
    english: 'This page is currently in English. You can stay here or open the Hindi homepage.',
    stay: 'इसी पेज पर रहें', home: 'हिंदी होमपेज खोलें',
  },
  bn: {
    options: 'বাংলা ভাষার বিকল্প / Bengali options',
    title: 'এই পেজটি এখন ইংরেজিতে আছে',
    description: 'বাংলায় হোমপেজ ও ক্যালকুলেটরের তালিকা দেখতে পারেন। এই পেজে থাকলে আপনার দেওয়া সংখ্যাগুলি বদলাবে না।',
    english: 'This page is currently in English. You can stay here or open the Bengali homepage.',
    stay: 'এই পেজেই থাকুন', home: 'বাংলা হোমপেজ খুলুন',
  },
};

function plainClick(event: MouseEvent<HTMLAnchorElement>) {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const [suffix, setSuffix] = useState('');
  const [dialogLanguage, setDialogLanguage] = useState<'hi' | 'bn'>('hi');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLAnchorElement | null>(null);
  const headingId = useId();
  const copy = fallbackCopy[dialogLanguage];
  const needsFallback = LOCALES.some((language) => !hasTranslatedPage(pathname, language));

  useEffect(() => {
    if (locale !== 'en') remember(locale);
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

  return (
    <>
      <div className="flex shrink-0 rounded-full border border-brandBorder bg-white p-0.5 dark:border-slate-700 dark:bg-slate-950" role="group" aria-label="Language / भाषा / ভাষা">
        {LOCALES.map((language) => {
          const available = hasTranslatedPage(pathname, language);
          const label = LOCALE_LABELS[language];
          return <a
            key={language}
            href={available ? `${localizedHref(pathname, language)}${suffix}` : localizedHref('/', language)}
            hrefLang={LOCALE_TAGS[language]} lang={language}
            aria-label={!available && language !== 'en' ? fallbackCopy[language].options : label}
            title={!available && language !== 'en' ? fallbackCopy[language].title : label}
            aria-current={locale === language ? 'page' : undefined}
            aria-haspopup={available ? undefined : 'dialog'}
            className={`flex min-h-11 items-center justify-center rounded-full px-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandNavy focus-visible:ring-offset-2 sm:px-3 ${locale === language ? 'bg-brandNavy text-white dark:bg-slate-700' : 'text-brandNavy hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
            onClick={(event) => {
              if (locale === language) {
                if (plainClick(event)) event.preventDefault();
                select(language);
                return;
              }
              if (!available && language !== 'en' && plainClick(event)) {
                event.preventDefault();
                triggerRef.current = event.currentTarget;
                setDialogLanguage(language);
                dialogRef.current?.showModal();
                return;
              }
              select(language, !available);
              if (available) event.currentTarget.href = `${localizedHref(pathname, language)}${window.location.search}${window.location.hash}`;
            }}
          >
            {language === 'en' ? <><span className="sm:hidden">EN</span><span className="hidden sm:inline">English</span></> : label}
          </a>;
        })}
      </div>
      {needsFallback ? (
        <dialog
          ref={dialogRef} aria-labelledby={headingId} lang={LOCALE_TAGS[dialogLanguage]}
          onClose={() => triggerRef.current?.focus()}
          className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-3xl border border-brandBorder bg-white p-6 text-slate-900 shadow-elevated backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <h2 id={headingId} className="text-xl font-bold leading-relaxed">{copy.title}</h2>
          <p className="mt-3 text-sm leading-7">{copy.description}</p>
          <p lang="en" className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.english}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" autoFocus onClick={() => dialogRef.current?.close()} className="min-h-11 rounded-xl border border-brandBorder px-4 py-2 text-sm font-bold focus-visible:ring-2 focus-visible:ring-brandNavy">{copy.stay}</button>
            <a href={localizedHref('/', dialogLanguage)} hrefLang={LOCALE_TAGS[dialogLanguage]} onClick={() => select(dialogLanguage, true)} className="flex min-h-11 items-center rounded-xl bg-brandNavy px-4 py-2 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-offset-2">{copy.home}</a>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
