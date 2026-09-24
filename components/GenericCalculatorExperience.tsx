'use client';

import type { Tool } from '@/lib/tools';

type Result = { key: string; label: string; value: number; formatted: string; format?: string };

export default function GenericCalculatorExperience({ tool, values, results }: { tool: Tool; values: Record<string, number>; results: Result[] }) {
  const visible = results.filter((r: any) => !r.hidden && Number.isFinite(r.value));
  if (!visible.length) return null;
  const candidates = visible.filter((r) => r.value >= 0).slice(0, 4);
  const max = Math.max(...candidates.map((r) => r.value), 1);
  const share = async () => {
    const text = `${tool.name}\n${visible.slice(0, 4).map((r) => `${r.label}: ${r.formatted}`).join('\n')}\nEducational estimate — RupeeKit`;
    if (navigator.share) { try { await navigator.share({ title: tool.name, text }); return; } catch {} }
    try { await navigator.clipboard.writeText(text); alert('Result summary copied.'); } catch { window.print(); }
  };
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" aria-labelledby={`visual-${tool.slug}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 id={`visual-${tool.slug}`} className="text-lg font-bold text-brandDeepNavy">Result visual</h2><p className="mt-1 text-sm text-slate-600">Relative view of your key outputs. Exact values are listed with each bar.</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={share} className="rounded-xl border border-brandNavy px-4 py-2 text-sm font-semibold text-brandNavy focus:outline-none focus:ring-4 focus:ring-brandNavy/20">Share result</button>
          <button type="button" onClick={() => window.print()} className="rounded-xl bg-brandNavy px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-brandNavy/20">Save as PDF</button>
        </div>
      </div>
      <div className="mt-5 space-y-4" role="img" aria-label={`Bar chart of key results for ${tool.name}`}>
        {candidates.map((result) => <div key={result.key}><div className="mb-1 flex items-end justify-between gap-4 text-sm"><span className="font-medium text-slate-700">{result.label}</span><span className="font-bold text-brandDeepNavy">{result.formatted}</span></div><div className="h-3 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brandGrowthGreen" style={{ width: `${Math.max(3, Math.min(100, result.value / max * 100))}%` }} /></div></div>)}
      </div>
      <details className="mt-5 rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold text-slate-800">Inputs used in this result</summary><dl className="mt-3 grid gap-2 sm:grid-cols-2">{tool.inputs.map((input) => <div key={input.key} className="flex justify-between gap-3 text-xs"><dt className="text-slate-600">{input.label}</dt><dd className="font-semibold text-slate-900">{new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(values[input.key] ?? 0)}{input.unit ? ` ${input.unit}` : ''}</dd></div>)}</dl></details>
      <p className="mt-4 text-xs leading-5 text-slate-500">Share/print output contains user-entered values and educational estimates only. Verify important decisions with the relevant official source or professional.</p>
    </section>
  );
}
