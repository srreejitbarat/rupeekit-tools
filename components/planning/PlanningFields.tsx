'use client';

import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { money, monthLabel } from '@/lib/planning/common';

export const panel = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900';
export const secondary = 'rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800';
export const primary = 'rounded-xl bg-teal-800 px-5 py-3 text-sm font-bold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200';
export const muted = 'text-sm leading-6 text-slate-600 dark:text-slate-300';
const inputClass = 'mt-1.5 block min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base font-medium text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/25 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100';

export function Field({ label, value, onChange, hint, min = 0, max, step = 'any', type = 'number' }: {
  label: string; value: number | string; onChange: (value: string) => void; hint?: string;
  min?: number; max?: number; step?: number | 'any'; type?: 'number' | 'month' | 'text';
}) {
  const id = useId();
  return <div className="min-w-0"><label htmlFor={id} className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</label>
    <input id={id} type={type} value={typeof value === 'number' && !Number.isFinite(value) ? '' : value}
      onChange={e => onChange(e.target.value)} className={inputClass} required
      min={type === 'number' ? min : undefined} max={type === 'number' ? max : undefined}
      step={type === 'number' ? step : undefined} maxLength={type === 'text' ? 60 : undefined}
      aria-describedby={hint ? `${id}-hint` : undefined} />
    {hint && <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>;
}
export const numeric = (value: string) => value.trim() === '' ? NaN : Number(value);

export function Select({ label, value, onChange, options, hint }: {
  label: string; value: string; onChange: (value: string) => void; options: [string, string][]; hint?: string;
}) {
  const id = useId();
  return <div className="min-w-0"><label htmlFor={id} className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</label>
    <select id={id} value={value} onChange={e => onChange(e.target.value)} className={inputClass} aria-describedby={hint ? `${id}-hint` : undefined}>
      {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>{hint && <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>;
}
export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-100">
    <input className="h-5 w-5 shrink-0 accent-teal-700" type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />{label}
  </label>;
}
export function Step({ number, title, description, children }: { number: number; title: string; description?: string; children: ReactNode }) {
  return <fieldset className={panel}><legend className="sr-only">{number}. {title}</legend>
    <div className="mb-5 flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-900 dark:bg-teal-950 dark:text-teal-200">{number}</span>
      <div><h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>{description && <p className={muted}>{description}</p>}</div>
    </div>{children}
  </fieldset>;
}
export function Grid({ children }: { children: ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>; }
export function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">{label}</p>
    <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
    {detail && <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{detail}</p>}
  </div>;
}
export function Note({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return <div className={`rounded-xl border p-4 text-sm leading-6 ${warning ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100' : 'border-teal-200 bg-teal-50 text-teal-950 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-100'}`}>{children}</div>;
}
export function usePlanForm<T, R extends { errors: string[] }>(example: T, calculate: (input: T) => R) {
  const [draft, setDraft] = useState<T>(example);
  const [committed, setCommitted] = useState<T>(example);
  const result = useMemo(() => calculate(committed), [calculate, committed]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(committed);
  const resultsRef = useRef<HTMLDivElement>(null);
  function commit(next = draft) {
    setDraft(next); setCommitted(next);
    requestAnimationFrame(() => resultsRef.current?.focus({ preventScroll: true }));
  }
  function submit(event: FormEvent) { event.preventDefault(); commit(); }
  function set<K extends keyof T>(key: K, value: T[K]) { setDraft(current => ({ ...current, [key]: value })); }
  return { draft, setDraft, committed, result, dirty, resultsRef, commit, submit, set };
}
export function UpdatePlan({ dirty, label = 'Update plan' }: { dirty: boolean; label?: string }) {
  return <div className="flex flex-wrap items-center gap-3"><button className={primary} type="submit">{label}</button>
    <span role="status" className={muted}>{dirty ? 'Inputs changed. Update to refresh results and downloads.' : 'Results match the inputs above.'}</span>
  </div>;
}
export function Errors({ errors }: { errors: string[] }) {
  return errors.length ? <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
    <h3 className="font-bold">Check these inputs</h3><ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error, i) => <li key={i}>{error}</li>)}</ul>
  </div> : null;
}
export function DataTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: (string | number)[][] }) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700" tabIndex={0} role="region" aria-label={caption}>
    <table className="w-full min-w-[580px] border-collapse text-left text-sm"><caption className="sr-only">{caption}</caption>
      <thead className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><tr>{headers.map(header => <th scope="col" key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">{rows.map((row, i) => <tr key={i} className="align-top">{row.map((cell, j) => j === 0 ? <th key={j} scope="row" className="px-4 py-3 font-medium">{cell}</th> : <td key={j} className="px-4 py-3 tabular-nums">{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

const colors = ['#0f766e', '#6366f1', '#c2410c', '#be185d', '#475569'];
export function PlanChart({ title, dates, series, reference }: {
  title: string; dates: string[]; series: { label: string; values: number[] }[]; reference?: { label: string; value: number };
}) {
  const id = useId();
  const values = series.flatMap(s => s.values).concat(reference?.value ?? 0, 0);
  const min = Math.min(...values), max = Math.max(...values, 1), spread = max - min || 1;
  const x = (i: number) => 86 + i / Math.max(1, dates.length - 1) * 550;
  const y = (value: number) => 222 - (value - min) / spread * 185;
  const compact = (value: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  return <figure className={panel}><figcaption id={id} className="font-bold text-slate-900 dark:text-white">{title}</figcaption>
    <svg role="img" aria-labelledby={id} viewBox="0 0 670 270" className="mt-3 w-full text-slate-500 dark:text-slate-400">
      <desc>{series.map(s => `${s.label}: ${money(s.values[0])} to ${money(s.values[s.values.length - 1])}.`).join(' ')} Exact figures are in the tables and CSV.</desc>
      {[0, 0.5, 1].map(part => { const value = min + spread * part; return <g key={part}><line x1="86" x2="636" y1={y(value)} y2={y(value)} stroke="currentColor" opacity="0.2" /><text x="77" y={y(value) + 4} textAnchor="end" fill="currentColor" fontSize="12">₹{compact(value)}</text></g>; })}
      {reference && <g><line x1="86" x2="636" y1={y(reference.value)} y2={y(reference.value)} stroke="currentColor" strokeDasharray="3 4" /></g>}
      {series.map((s, i) => <g key={s.label}><polyline points={s.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')} fill="none" stroke={colors[i % colors.length]} strokeWidth="3" strokeDasharray={i ? `${10 - i} ${i + 2}` : undefined} vectorEffect="non-scaling-stroke" /><circle cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1])} r="3" fill={colors[i % colors.length]} /></g>)}
      {[0, Math.floor((dates.length - 1) / 2), dates.length - 1].filter((v, i, list) => list.indexOf(v) === i).map(i => <text key={i} x={x(i)} y="249" textAnchor={i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle'} fill="currentColor" fontSize="12">{monthLabel(dates[i])}</text>)}
    </svg>
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-700 dark:text-slate-200">{series.map((s, i) => <li key={s.label} className="flex items-center gap-2"><span aria-hidden className="h-1 w-5 rounded" style={{ backgroundColor: colors[i % colors.length] }} />{s.label}</li>)}{reference && <li>Dashed guide: {reference.label} {money(reference.value)}</li>}</ul>
  </figure>;
}
