import type { Metadata } from 'next';
import GovernmentSalaryUpdatesClient from '@/components/updates/GovernmentSalaryUpdatesClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Government Salary Updates, DA, Pension and Pay News | RupeeKit';
const DESCRIPTION =
  'Track India government salary updates including DA, DR, pay revision, pension, arrears and official circular summaries with educational explanations.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/government-salary-updates`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/government-salary-updates`,
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

export default function GovernmentSalaryUpdatesPage() {
  return <GovernmentSalaryUpdatesClient />;
}
