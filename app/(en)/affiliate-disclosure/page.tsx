import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Affiliate Disclosure | RupeeKit';
const DESCRIPTION =
  "Read RupeeKit's affiliate disclosure and how referral or affiliate links may be used on the website.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/affiliate-disclosure`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/affiliate-disclosure`,
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

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight text-brandNavy">Affiliate Disclosure</h1>
      <p className="mt-6 leading-8 text-brandText">
        Transparency is essential in personal finance. In compliance with the Federal Trade Commission (FTC) guidelines and partner policies, this page explains how RupeeKit maintains its website services at no cost to you.
      </p>
      
      <h2 className="mt-8 text-2xl font-bold text-brandDeepNavy">Amazon Associate Program</h2>
      <p className="mt-4 leading-8 text-brandText">
        RupeeKit is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in or Amazon.com.
      </p>
      <p className="mt-4 leading-8 text-brandText">
        As an Amazon Associate, RupeeKit may earn from qualifying purchases. This means if you click on a link to a recommended book or product on Amazon and complete a purchase, we may receive a small percentage of the sale as a commission. This commission comes at absolutely no additional cost to you.
      </p>

      <h2 className="mt-8 text-2xl font-bold text-brandDeepNavy">Editorial Independence</h2>
      <p className="mt-4 leading-8 text-brandText">
        Our book suggestions, reading lists, and financial tools are selected strictly based on educational value and quality. We do not accept sponsorships to promote low-quality products. The small commissions we earn help pay for hosting, domain costs, and website maintenance so we can keep our calculators free for everyone.
      </p>

      <h2 className="mt-8 text-2xl font-bold text-brandDeepNavy">Questions</h2>
      <p className="mt-4 leading-8 text-brandText">
        If you have any questions regarding our affiliate disclosures, feel free to contact us at: <span className="font-semibold text-brandNavy">rupeekitofficial@gmail.com</span>.
      </p>
    </div>
  );
}
