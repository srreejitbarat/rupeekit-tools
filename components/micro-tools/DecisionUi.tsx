'use client';

import { useId } from 'react';
import { money } from '@/lib/planning/common';
import { muted, panel } from '@/components/planning/PlanningFields';

const colors = ['#0f766e', '#6366f1', '#c2410c', '#be185d'];
export function DecisionIntro({ question, text }: { question: string; text: string }) {
  return <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-7 dark:border-teal-800 dark:bg-teal-950">
    <p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">See the whole money decision</p>
    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{question}</h2>
    <p className={`mt-3 ${muted}`}>{text}</p>
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-teal-900 dark:text-teal-100"><li>No signup</li><li>Editable examples</li><li>Private browser calculation</li><li>PDF + CSV</li></ul>
  </section>;
}
export function ComparisonBars({ title, items }: { title: string; items: { name: string; value: number }[] }) {
  const maximum = Math.max(1, ...items.map(item => Math.abs(item.value)));
  return <figure className={panel}><figcaption className="font-bold text-slate-900 dark:text-white">{title}</figcaption>
    <div className="mt-5 space-y-5">{items.map((item, i) => <div key={item.name}><div className="mb-2 flex justify-between gap-3 text-sm text-slate-800 dark:text-slate-100"><span>{item.name}</span><strong className="tabular-nums">{money(item.value)}</strong></div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden><div className="h-full rounded-full" style={{ width: `${Math.abs(item.value) / maximum * 100}%`, backgroundColor: colors[i % colors.length] }} /></div>
    </div>)}</div><p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Bars show magnitude; signed amounts above are exact to the nearest rupee.</p>
  </figure>;
}
export function CashTrace({ title, labels, series, reserve }: { title: string; labels: string[]; series: { name: string; values: number[] }[]; reserve?: number }) {
  const id = useId();
  const all = series.flatMap(s => s.values).concat(0, reserve ?? 0);
  const min = Math.min(...all), max = Math.max(...all, 1), spread = max - min || 1;
  const x = (i: number) => 92 + i / Math.max(1, labels.length - 1) * 540;
  const y = (v: number) => 227 - (v - min) / spread * 184;
  const compact = (v: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  return <figure className={panel}><figcaption id={id} className="font-bold text-slate-900 dark:text-white">{title}</figcaption>
    <svg viewBox="0 0 670 280" role="img" aria-labelledby={id} className="mt-3 w-full text-slate-500 dark:text-slate-400"><desc>{series.map(s => `${s.name}: starts ${money(s.values[0])}, ends ${money(s.values[s.values.length - 1])}.`).join(' ')} Exact amounts are in the table and CSV.</desc>
      {[0, 0.5, 1].map(f => <g key={f}><line x1="92" x2="632" y1={y(min + spread * f)} y2={y(min + spread * f)} stroke="currentColor" opacity="0.2" /><text x="83" y={y(min + spread * f) + 4} textAnchor="end" fill="currentColor" fontSize="12">₹{compact(min + spread * f)}</text></g>)}
      {reserve !== undefined && <line x1="92" x2="632" y1={y(reserve)} y2={y(reserve)} stroke="currentColor" strokeDasharray="3 4" />}
      {series.map((s, i) => <polyline key={s.name} points={s.values.map((v, j) => `${x(j)},${y(v)}`).join(' ')} stroke={colors[i % colors.length]} strokeDasharray={i ? `${10 - i} ${i + 2}` : undefined} strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />)}
      {[0, Math.floor((labels.length - 1) / 2), labels.length - 1].filter((n, i, ns) => ns.indexOf(n) === i).map(i => <text key={i} x={x(i)} y="260" textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'} fill="currentColor" fontSize="12">{labels[i]}</text>)}
    </svg>
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-700 dark:text-slate-200">{series.map((s, i) => <li key={s.name} className="flex items-center gap-2"><span aria-hidden className="h-1 w-5 rounded" style={{ backgroundColor: colors[i % colors.length] }} />{s.name}</li>)}{reserve !== undefined && <li>Dashed line: protected cash {money(reserve)}</li>}</ul>
  </figure>;
}
export function MethodDetails({ assumptions }: { assumptions: string[] }) {
  return <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">How the calculation works and what it leaves out</summary>
    <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{assumptions.map(text => <li key={text}>{text}</li>)}</ol></details>;
}
