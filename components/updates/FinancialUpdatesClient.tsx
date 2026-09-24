'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { financialUpdates, FinancialUpdate } from '@/data/financial-updates';
import { day18FinancialUpdates } from '@/data/day18-financial-updates';
import UpdateVisual from '@/components/updates/UpdateVisual';

const allFinancialUpdates = [...day18FinancialUpdates, ...financialUpdates];

const CATEGORIES = [
  'All',
  'RBI',
  'Income Tax',
  'GST',
  'SEBI',
  'Banking',
  'Personal Finance',
  'Markets',
  'Government Salary',
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

const ALLOWED_CATEGORIES = CATEGORIES.filter((c) => c !== 'All') as readonly string[];

type VisualKey =
  | 'rbi'
  | 'income-tax'
  | 'gst'
  | 'sebi'
  | 'banking'
  | 'personal-finance'
  | 'government-salary'
  | 'financial-updates';

const categoryVisualMap: Record<string, VisualKey> = {
  RBI: 'rbi',
  'Income Tax': 'income-tax',
  GST: 'gst',
  SEBI: 'sebi',
  Banking: 'banking',
  'Personal Finance': 'personal-finance',
  Markets: 'sebi',
  'Government Salary': 'government-salary',
};

const categoryBadgeColors: Record<string, string> = {
  RBI: 'bg-blue-50 text-blue-800 border-blue-200',
  'Income Tax': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  GST: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  SEBI: 'bg-violet-50 text-violet-800 border-violet-200',
  Banking: 'bg-slate-100 text-slate-700 border-slate-200',
  'Personal Finance': 'bg-green-50 text-green-800 border-green-200',
  Markets: 'bg-amber-50 text-amber-800 border-amber-200',
  'Government Salary': 'bg-orange-50 text-orange-800 border-orange-200',
};

function getInitialCategory(raw: string | null): CategoryFilter {
  if (raw && ALLOWED_CATEGORIES.includes(raw)) {
    return raw as CategoryFilter;
  }
  return 'All';
}

function UpdateCard({ update }: { update: FinancialUpdate }) {
  const catColor = categoryBadgeColors[update.category] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  const visualType = (categoryVisualMap[update.category] ?? 'financial-updates') as VisualKey;

  return (
    <div className="rounded-3xl border border-brandBorder bg-white shadow-sm hover:shadow-md transition duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-br from-brandDeepNavy to-slate-900 px-5 pt-5 pb-4 flex items-center gap-3">
        <UpdateVisual type={visualType} size="sm" />
        <div className="flex flex-wrap gap-2">
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${catColor}`}>
            {update.category}
          </span>
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
            Educational Summary
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-brandMuted">
          <span className="font-medium truncate max-w-[200px]">{update.sourceName}</span>
          <span>·</span>
          <span>
            {new Date(update.publishedDate).toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <h3 className="text-sm font-bold tracking-tight text-brandDeepNavy leading-snug line-clamp-3">
          {update.title}
        </h3>

        <p className="text-xs leading-relaxed text-slate-600 line-clamp-3 flex-1">{update.summary}</p>

        <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2">
          <p className="text-[11px] font-semibold text-green-800 line-clamp-2">
            <span className="font-bold">Verify: </span>{update.whatToVerify.split('.')[0]}.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brandBorder">
          <Link
            href={`/financial-updates/${update.slug}`}
            className="rounded-full bg-brandNavy px-4 py-1.5 text-xs font-bold text-white hover:bg-brandDeepNavy transition"
          >
            Read update →
          </Link>
          <span className="text-[10px] text-brandMuted italic">Verify from official source</span>
        </div>
      </div>
    </div>
  );
}

export default function FinancialUpdatesClient() {
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(
    getInitialCategory(rawCategory)
  );

  const filtered =
    activeCategory === 'All'
      ? allFinancialUpdates
      : allFinancialUpdates.filter((u) => u.category === activeCategory);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as CategoryFilter)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition duration-150 ${
                isActive
                  ? 'bg-brandNavy border-brandNavy text-white shadow-sm'
                  : 'bg-white border-brandBorder text-brandText hover:bg-brandBgSoft hover:border-brandNavy/30'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
        <span className="text-blue-400 text-lg leading-none mt-0.5" aria-hidden="true">ℹ</span>
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Educational summaries only.</strong> These entries explain how financial topics, policies, and regulations work in India. Always verify specific rates, dates, and circulars from the official source linked in each update before making any financial or tax decisions.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-brandBorder bg-white p-10 text-center">
          <p className="text-brandMuted text-sm">No updates found for this category yet.</p>
          <button
            onClick={() => setActiveCategory('All')}
            className="mt-4 text-xs font-bold text-brandNavy hover:text-brandDeepNavy transition"
          >
            View all categories →
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      )}
    </div>
  );
}
