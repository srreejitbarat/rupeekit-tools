type AnswerEngineSummaryProps = {
  title?: string;
  summary: string;
  id?: string;
  className?: string;
};

export default function AnswerEngineSummary({
  title = 'At a glance',
  summary,
  id = 'answer-engine-summary',
  className = 'mt-6',
}: AnswerEngineSummaryProps) {
  return (
    <section
      id={id}
      className={`${className} scroll-mt-24 rounded-2xl border border-sky-100 bg-sky-50 p-5`}
    >
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">{summary}</p>
    </section>
  );
}
