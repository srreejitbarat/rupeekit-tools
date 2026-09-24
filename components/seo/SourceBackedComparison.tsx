import Link from 'next/link';
import { getSourceBackedComparison } from '@/data/source-backed-comparisons';

export default function SourceBackedComparison({ slug, linkToGuide = false }: { slug: string; linkToGuide?: boolean }) {
  const comparison = getSourceBackedComparison(slug);
  if (!comparison) return null;

  const guideSlug = slug.includes('personal-loan') ? 'personal-loan-apr'
    : slug.includes('salary') ? 'salary-income-tax' : 'home-loan-prepayment';

  return (
    <section className="mt-10 rounded-3xl border border-brandBorder bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:p-8" aria-labelledby={`comparison-${slug}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-brandGrowthGreen dark:text-brandBrightGreen">Source-backed comparison · checked {comparison.checkedIso}</p>
      <h2 id={`comparison-${slug}`} className="mt-2 text-2xl font-black text-brandDeepNavy dark:text-white">{comparison.title}</h2>
      <p className="mt-3 font-semibold text-slate-900 dark:text-white">{comparison.question}</p>
      <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300"><strong>Common model:</strong> {comparison.basis}</p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <caption className="sr-only">Compared assumptions and calculated results</caption>
          <thead><tr className="border-b border-slate-300 dark:border-slate-700">
            <th scope="col" className="p-3">Scenario</th><th scope="col" className="p-3">Input</th><th scope="col" className="p-3">Calculated result</th>
          </tr></thead>
          <tbody>{comparison.rows.map((row) => (
            <tr key={row.option} className="border-b border-slate-200 dark:border-slate-800">
              <th scope="row" className="p-3 align-top font-semibold">{row.option}</th>
              <td className="p-3 align-top">{row.inputs}</td><td className="p-3 align-top">{row.result}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="mt-5 leading-7 text-slate-900 dark:text-white">{comparison.takeaway}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300"><strong>Limits:</strong> {comparison.limitations}</p>
      <h3 className="mt-5 font-bold text-brandDeepNavy dark:text-white">Published inputs and dates</h3>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700 dark:text-slate-300">
        {comparison.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brandNavy underline dark:text-brandBrightGreen">{source.name}<span className="sr-only"> (opens in a new tab)</span></a>: {source.detail}
          </li>
        ))}
      </ul>
      {linkToGuide ? <p className="mt-5 text-sm"><Link href={`/money-guides/${guideSlug}`} className="font-semibold text-brandNavy underline dark:text-brandBrightGreen">Read the full decision guide and method →</Link></p> : null}
    </section>
  );
}
