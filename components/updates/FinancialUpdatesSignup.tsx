'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

type SignupPlacement = 'financial_update' | 'calculator_result';

type FinancialUpdatesSignupProps = {
  placement: SignupPlacement;
  context?: string;
};

export default function FinancialUpdatesSignup({ placement, context = 'general' }: FinancialUpdatesSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'check_email' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackAnalyticsEvent('newsletter_form_viewed', {
      placement,
      context,
    });
  }, [context, placement]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/updates/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, placement, context }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setStatus('error');
        setMessage(data?.message || 'We could not start the subscription. Please try again later.');
        return;
      }

      trackAnalyticsEvent('newsletter_form_submitted', {
        placement,
        context,
      });
      setStatus('check_email');
      setMessage('Check your inbox and confirm the subscription. You will not receive updates until you confirm.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('We could not start the subscription. Please try again later.');
    }
  }

  return (
    <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm md:p-6" aria-labelledby={`updates-signup-${placement}-${context}`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-800">RupeeKit official-update alerts</p>
      <h2 id={`updates-signup-${placement}-${context}`} className="mt-2 text-xl font-black text-brandDeepNavy">
        Get notified when an official finance rule or rate changes
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Optional email alerts for 8th Pay Commission progress, DA/DR revisions, EPFO changes, CBDT deadlines and small-savings rate resets. This is not a generic finance-tips newsletter, and we do not promise a fixed send schedule.
      </p>

      {status === 'check_email' ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-6 text-emerald-900" role="status">
          {message}
        </div>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm font-bold text-slate-800" htmlFor={`updates-email-${placement}-${context}`}>
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id={`updates-email-${placement}-${context}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-xl bg-brandNavy px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending confirmation…' : 'Send confirmation email'}
            </button>
          </div>
          <p className="text-xs leading-5 text-slate-600">
            By submitting, you ask RupeeKit to send a confirmation email. Your subscription starts only after you confirm. We use your email only for these update alerts; it is not linked to calculator inputs or sent to analytics. You can unsubscribe from every email. See our{' '}
            <Link href="/privacy-policy" className="font-semibold text-sky-800 underline underline-offset-2">Privacy Policy</Link>.
          </p>
          {status === 'error' && message ? <p className="text-sm text-red-700" role="alert">{message}</p> : null}
        </form>
      )}
    </section>
  );
}
