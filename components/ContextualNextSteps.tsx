'use client';

import Link from 'next/link';
import { CONTEXTUAL_NEXT_STEPS } from '@/data/contextual-next-steps';
import { trackAnalyticsEvent } from '@/lib/analytics';

export default function ContextualNextSteps({
  toolSlug,
  toolCategory,
  visible,
}: {
  toolSlug: string;
  toolCategory: string;
  visible: boolean;
}) {
  const steps = CONTEXTUAL_NEXT_STEPS[toolSlug];
  if (!visible || !steps?.length) return null;

  return (
    <section
      className="mt-6 rounded-2xl border border-brandNavy/15 bg-white p-5 shadow-sm"
      aria-label="What to check next"
      data-contextual-next-steps={toolSlug}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brandNavy">After your result</p>
      <h2 className="mt-1 text-lg font-bold text-brandDeepNavy">What should you check next?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        These are optional follow-up questions based on this calculator. Use only the one that matches your situation.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {steps.map((step) => (
          <Link
            key={`${toolSlug}:${step.href}`}
            href={step.href}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brandNavy/30 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brandNavy/15"
            onClick={() =>
              trackAnalyticsEvent('tool_cta_click', {
                tool_slug: toolSlug,
                tool_category: toolCategory,
                destination: step.href,
                cta_type: 'contextual_next_step',
              })
            }
          >
            <span className="block text-sm font-semibold leading-5 text-brandDeepNavy">{step.question}</span>
            <span className="mt-2 block text-sm font-medium text-brandNavy">{step.label} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
