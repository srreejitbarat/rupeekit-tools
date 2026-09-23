import type { Metadata } from "next";

import Script from "next/script";

import "@/app/globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GoogleAnalyticsRouteTracker from "@/components/GoogleAnalyticsRouteTracker";
import LanguagePreferenceNotice from "@/components/i18n/LanguagePreferenceNotice";
import type { Locale } from "@/lib/i18n/routing";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "RupeeKit";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.rupeekit.co.in";
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "rupeekitofficial@gmail.com";
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const siteDescription =
  "RupeeKit offers free India-focused salary, EMI, SIP, GST, and FD calculators with simple explanations and examples.";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/rupeekitofficial/",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61589666252483",
  },
  {
    name: "Pinterest",
    href: "https://www.pinterest.com/rupeekitofficial/",
  },
  {
    name: "X",
    href: "https://x.com/rupeekit",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Free India Salary & Finance Calculators`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  // No `keywords`: Next.js renders it as <meta name="keywords">, which Google has
  // ignored since 2009. Because it is set on the root layout it was emitted
  // identically on all 112+ pages, which reads as boilerplate stuffing.
  icons: {
    icon: "/brand/rupeekit_icon_from_social_logo_transparent_square.png",
    apple: "/brand/rupeekit_icon_from_social_logo_transparent_square.png",
  },
  robots: {
    "max-image-preview": "large",
  },
  openGraph: {
    title: `${siteName} - Free India Salary & Finance Calculators`,
    description:
      "Free India-focused salary, EMI, SIP, GST, and FD calculators with simple explanations.",
    url: siteUrl,
    siteName,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Free India Salary & Finance Calculators`,
    description:
      "Free India-focused salary, EMI, SIP, GST, and FD calculators.",
  },
};

export default function SiteLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const siteEntitySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        email: contactEmail,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/brand/rupeekit_icon_from_social_logo_transparent_square.png`,
          width: 797,
          height: 797,
        },
        sameAs: socialLinks.map((link) => link.href),
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "editorial",
            email: contactEmail,
            url: `${siteUrl}/contact`,
            availableLanguage: ["en", "hi"],
          },
        ],
        publishingPrinciples: `${siteUrl}/editorial-policy`,
        correctionsPolicy: `${siteUrl}/corrections-policy`,
        knowsAbout: [
          "Indian income tax",
          "Salary and pay commission structures",
          "Mutual fund SIP investing",
          "Loan EMI and interest calculation",
          "EPF, PPF and NPS retirement savings",
          "NRI taxation and foreign asset disclosure",
        ],
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#editorial-team`,
        name: `${siteName} Editorial Team`,
        description:
          "RupeeKit's in-house personal-finance research desk. Every calculator, guide and update is written and reviewed against primary Indian sources — Income Tax Department, RBI, EPFO, PFRDA, PIB and the relevant Finance Act — before publication.",
        url: `${siteUrl}/editorial-policy`,
        parentOrganization: { "@id": `${siteUrl}/#organization` },
        publishingPrinciples: `${siteUrl}/editorial-policy`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        inLanguage: ["en-IN", "hi-IN"],
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang={locale === 'hi' ? 'hi-IN' : 'en-IN'} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- Shared App Router root document. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rupeekit-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-brandBgSoft text-brandText dark:bg-slate-950 dark:text-slate-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteEntitySchema),
          }}
        />

        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `}
            </Script>
            <GoogleAnalyticsRouteTracker />
          </>
        ) : null}

        {adsenseClient ? (
          <Script
            id="adsense-auto-ads"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}

        <SiteHeader locale={locale} />
        {locale === 'en' ? <LanguagePreferenceNotice /> : null}

        <main className="flex-grow">{children}</main>

        <SiteFooter locale={locale} />

      </body>
    </html>
  );
}
