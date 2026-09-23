import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Terms of Use | RupeeKit';
const DESCRIPTION =
  'Read the terms of use for RupeeKit calculators, articles and educational finance tools.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/terms`,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight">Terms of Use</h1>
      <p className="mt-6 leading-8 text-slate-700">
        By using this website, you agree that all calculators, articles and examples are provided for informational and educational purposes only. They are not financial, tax, legal or employment advice.
      </p>
      <p className="mt-4 leading-8 text-slate-700">
        We try to keep information useful and accurate, but we do not guarantee that every calculation applies to your individual situation. Verify important decisions with official sources or qualified professionals.
      </p>
    </div>
  );
}
