import Link from 'next/link';
import { getToolBySlug } from '@/lib/tools';

interface RelatedCalculatorLinksProps {
  slugs: string[];
}

export default function RelatedCalculatorLinks({ slugs }: RelatedCalculatorLinksProps) {
  const tools = slugs.map((slug) => getToolBySlug(slug)).filter(Boolean);

  if (tools.length === 0) return null;

  return (
    <div className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-brandDeepNavy uppercase tracking-wider">
        Try Our Free Calculators
      </h3>
      <p className="mt-2 text-xs text-brandMuted">
        Perform your own calculations instantly using these interactive tools:
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {tools.map((tool) => {
          if (!tool) return null;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group block rounded-2xl border border-brandBorder p-4 transition hover:border-brandNavy/35 hover:bg-brandBgSoft"
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-brandNavy bg-brandNavy/10 px-2 py-0.5 rounded-full">
                {tool.category}
              </span>
              <h4 className="mt-2 text-sm font-bold text-brandDeepNavy group-hover:text-brandNavy transition">
                {tool.name}
              </h4>
              <p className="mt-1 text-xs text-brandMuted line-clamp-2">
                {tool.shortDescription}
              </p>
              <p className="mt-3 text-xs font-bold text-brandGrowthGreen group-hover:text-brandBrightGreen">
                Use Calculator →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
