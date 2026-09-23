import type { Metadata } from 'next';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Financial Disclaimer | RupeeKit';
const DESCRIPTION =
  'RupeeKit calculators and guides are educational estimates only and are not financial, tax, legal or investment advice.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/disclaimer`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/disclaimer`,
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

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight">Disclaimer</h1>
      <AnswerEngineSummary
        className="mt-6"
        summary="RupeeKit content and calculator outputs are educational estimates intended to improve financial understanding. They are not personalized financial, tax, legal, investment, or loan recommendations."
      />
      <p className="mt-6 leading-8 text-slate-700">
        Calculators on this website provide approximate results based on user inputs and simplified formulas. Actual outcomes can vary due to tax law, employer policy, lender terms, fees, market returns, documentation and personal circumstances.
      </p>
      <p className="mt-4 leading-8 text-slate-700">
        Always verify final numbers before making salary, tax, loan, investment or legal decisions.
      </p>
    </div>
  );
}
