'use client';

import Link from 'next/link';
import Logo from './Logo';
import { localizedHref, hasTranslatedPage, type Locale } from '@/lib/i18n/routing';
import { siteMessages } from '@/lib/i18n/messages';

export default function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
  const copy = siteMessages(locale);
  const socialLinks = [
    {
      name: 'X',
      href: 'https://x.com/rupeekit',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61589666252483',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Pinterest',
      href: 'https://www.pinterest.com/rupeekitofficial/',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.853 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.877 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.847 0-4.518 2.135-4.518 4.341 0 .86.33 1.782.744 2.285a.3.3 0 01.069.288c-.076.32-.245.994-.278 1.133-.044.183-.145.222-.335.134-1.247-.581-2.027-2.404-2.027-3.87 0-3.15 2.29-6.045 6.6-6.045 3.466 0 6.16 2.47 6.16 5.77 0 3.444-2.171 6.216-5.185 6.216-1.013 0-1.964-.525-2.29-1.146l-.625 2.378c-.227.872-.84 1.968-1.25 2.634C10.062 21.896 11.013 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/rupeekitofficial/',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm.2 1.8a3.9 3.9 0 0 0-3.9 3.9v8.6a3.9 3.9 0 0 0 3.9 3.9h8.6a3.9 3.9 0 0 0 3.9-3.9V7.7a3.9 3.9 0 0 0-3.9-3.9H7.7zM12 7.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.3-3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  const quickLinks = [
    { name: copy.tools, href: '/tools' },
    { name: copy.blog, href: '/blog' },
    { name: copy.pay, href: '/8th-pay-commission' },
    { name: copy.deadlines, href: '/deadlines' },
    { name: copy.nri, href: '/nri' },
    { name: copy.about, href: '/about' },
    { name: copy.contact, href: '/contact' },
    { name: copy.api, href: '/api-docs' },
  ];

  const legalLinks = [
    { name: copy.editorial, href: '/editorial-policy' },
    { name: copy.corrections, href: '/corrections-policy' },
    { name: copy.privacy, href: '/privacy-policy' },
    { name: copy.affiliate, href: '/affiliate-disclosure' },
    { name: copy.terms, href: '/terms' },
    { name: copy.disclaimerLink, href: '/disclaimer' },
  ];

  const contactEmail = 'rupeekitofficial@gmail.com';

  return (
    <footer className="mt-16 border-t border-brandBorder bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Logo & About Section */}
          <div className="flex flex-col gap-4">
            <Link href={localizedHref('/', locale)} className="flex items-center gap-2">
              <Logo type="icon" width={40} height={40} className="h-10 w-10" />
              <span className="text-xl font-bold tracking-tight text-brandNavy dark:text-white">RupeeKit</span>
            </Link>
            <p className="text-sm leading-relaxed text-brandMuted dark:text-slate-400">
              {copy.description}
            </p>
            <div className="flex gap-4 mt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-brandBorder text-brandMuted transition  hover:border-brandNavy/30 hover:text-brandNavy dark:border-slate-800 dark:text-slate-400 dark:hover:text-white"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brandDeepNavy dark:text-white">{copy.navigation}</h3>
            <ul className="mt-4 flex flex-col gap-1 text-sm font-medium text-brandMuted dark:text-slate-400">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={localizedHref(link.href, locale)} title={locale !== 'en' && !hasTranslatedPage(link.href, locale) ? copy.englishOnly : undefined} className="flex min-h-11 items-center transition hover:text-brandNavy dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brandDeepNavy dark:text-white">{copy.legal}</h3>
            <ul className="mt-4 flex flex-col gap-1 text-sm font-medium text-brandMuted dark:text-slate-400">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={localizedHref(link.href, locale)} title={locale !== 'en' && !hasTranslatedPage(link.href, locale) ? copy.englishOnly : undefined} className="flex min-h-11 items-center transition hover:text-brandNavy dark:hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brandDeepNavy dark:text-white">{copy.contact}</h3>
            <p className="mt-4 text-sm text-brandMuted dark:text-slate-400">
              {copy.contactDescription}
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-brandText dark:text-slate-200">{contactEmail}</p>
          </div>
        </div>

        {locale !== 'en' ? <p className="mt-6 text-sm leading-7 text-brandMuted dark:text-slate-400">{locale === 'bn' ? 'ক্যালকুলেটর, নিবন্ধ, নির্দেশিকা ও নীতিগুলি বাংলায় পড়ুন। উপরের ভাষার বিকল্প দিয়ে একই পেজের ভাষা বদলাতে পারেন।' : 'कैलकुलेटर, लेख, गाइड और नीतियाँ हिंदी में पढ़ें। ऊपर दिए भाषा विकल्प से इसी पेज की भाषा बदल सकते हैं।'}</p> : null}

        {/* Brand Disclaimer & Copyright */}
        <div className="mt-6 border-t border-brandBorder pt-8 dark:border-slate-800">
          <div className="border-l-2 border-brandBorder pl-4 text-xs leading-relaxed text-brandMuted shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="mb-1 font-bold text-brandDeepNavy dark:text-white">{copy.disclaimerTitle}</p>
            <p>
              {copy.disclaimer}
            </p>
          </div>
          <div className="mt-6 flex flex-col justify-between gap-4 text-xs text-brandMuted dark:text-slate-400 md:flex-row md:items-center">
            <p>© {new Date().getFullYear()} RupeeKit. {copy.rights}</p>
            <p className="text-slate-400">{copy.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
