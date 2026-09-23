import type { Metadata } from 'next';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Contact RupeeKit | Feedback and Calculator Suggestions';
const DESCRIPTION =
  'Contact RupeeKit for calculator suggestions, corrections, feedback or business queries.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/contact`,
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

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight">Contact</h1>
      <AnswerEngineSummary
        className="mt-6"
        summary="Use this page to share corrections, calculator feedback, and content suggestions so RupeeKit can improve educational quality. RupeeKit does not request sensitive personal financial documents through this contact channel."
      />
      <p className="mt-6 leading-8 text-slate-700">
        For corrections, feedback, calculator suggestions or business queries, contact us at:
      </p>
      <p className="mt-4 rounded-2xl bg-white p-5 font-semibold shadow-sm">rupeekitofficial@gmail.com</p>
    </div>
  );
}
