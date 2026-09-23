import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
const TITLE = 'Privacy Policy | RupeeKit';
const DESCRIPTION =
  "Read RupeeKit's privacy policy for calculators, analytics, cookies and user data handling.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/privacy-policy`,
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

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
      <p className="mt-6 leading-8 text-slate-700">
        RupeeKit calculators are designed for educational estimation. Calculator values are processed in the browser
        and are not saved by default.
      </p>

      <h2 className="mt-8 text-2xl font-bold">Optional official-update emails</h2>
      <p className="mt-4 leading-8 text-slate-700">
        If you choose to subscribe to RupeeKit official-update alerts, we send the email address you submit to our
        newsletter delivery provider only for that subscription. We do not associate the email address with calculator
        inputs, PAN, Aadhaar, bank details or other financial values, and we do not send your email address to analytics.
      </p>
      <p className="mt-4 leading-8 text-slate-700">
        Subscription uses double opt-in: entering an address starts a confirmation email, and alerts begin only after
        the confirmation link is used. Every update email includes a way to manage or unsubscribe from the subscription.
        You may also ask us to delete your subscription data by contacting rupeekitofficial@gmail.com.
      </p>
      <p className="mt-4 leading-8 text-slate-700">
        The current delivery provider is Buttondown. RupeeKit does not keep a second local copy of subscriber email
        addresses in application storage. Provider records are kept only as needed to operate the subscribed email
        service, record consent/unsubscribe state and comply with applicable obligations.
      </p>

      <h2 className="mt-8 text-2xl font-bold">Cookies and analytics</h2>
      <p className="mt-4 leading-8 text-slate-700">
        Analytics and advertising tools may use cookies or similar technologies. Newsletter funnel analytics records
        only non-identifying events such as form viewed, form submitted and confirmation-page reached; the email address
        itself is not an analytics parameter. You can control cookies through your browser settings.
      </p>
      <h2 className="mt-8 text-2xl font-bold">Sensitive data handling</h2>
      <p className="mt-4 leading-8 text-slate-700">
        We avoid collecting sensitive financial or identity data such as PAN, Aadhaar, bank account details, or card
        data unless a future feature clearly requires it and requests explicit user consent.
      </p>
      <h2 className="mt-8 text-2xl font-bold">Contact</h2>
      <p className="mt-4 leading-8 text-slate-700">For privacy questions or deletion requests, contact: rupeekitofficial@gmail.com</p>
    </div>
  );
}
